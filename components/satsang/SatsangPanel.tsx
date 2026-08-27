'use client';

import { useCallback, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { AudioRoom, RoomConnectionState, RoomParticipant } from '@/lib/audio/audio-room';
import { createAudioRoom } from '@/lib/audio/create-room';
import type { SatsangState } from '@/lib/satsang';
import { formatTime, useDisplayTimeZone, useNow } from '@/components/schedule/format';
import SessionRoom from './SessionRoom';

/**
 * Lifecycle for a satsang event's live session, on the event detail page.
 *
 * Three responsibilities, and no more: track whether a session is live, get the
 * viewer into it on a tap, and hand the room to SessionRoom. Every provider
 * detail sits behind the AudioRoom interface, which is dynamically imported so
 * the audio SDK only reaches browsers that actually join.
 *
 * Session state is polled rather than pushed. v1 deliberately adds no websocket
 * infrastructure for page state: a 10-second poll of one small row is enough for
 * "the teacher has started", and once joined the room's own events are the
 * truth, so polling stops.
 */

const POLL_MS = 10_000;

export default function SatsangPanel({
  eventId,
  eventTitle,
  initialState,
  isOwner,
  authEnabled,
  cancelled,
  onLiveChange,
}: {
  eventId: string;
  eventTitle: string;
  /** Server-rendered state, so the first paint already shows the truth. */
  initialState: SatsangState;
  isOwner: boolean;
  authEnabled: boolean;
  cancelled: boolean;
  /**
   * Told whenever the session goes live or stops being live, so the page
   * around this panel can reorder itself for a room that is open. Poll and
   * join behaviour are unchanged — this only reports what the panel already
   * knows.
   */
  onLiveChange?: (live: boolean) => void;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const tz = useDisplayTimeZone();
  const now = useNow();
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user);

  const [state, setState] = useState<SatsangState>(initialState);
  /**
   * The joined room, or null. Held in state rather than a ref because it is
   * rendered — SessionRoom takes it as a prop.
   */
  const [room, setRoom] = useState<AudioRoom | null>(null);
  const [joining, setJoining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [connection, setConnection] = useState<RoomConnectionState>('idle');
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [unmuteRequested, setUnmuteRequested] = useState(false);

  useEffect(() => {
    onLiveChange?.(state.live);
  }, [state.live, onLiveChange]);

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch(`/api/satsang/${eventId}/state`, { cache: 'no-store' });
      if (res.ok) setState((await res.json()) as SatsangState);
    } catch {
      // Offline or a blip: keep showing the last known state rather than
      // flipping the page to an error. The next tick will correct it.
    }
  }, [eventId]);

  /**
   * Poll only while outside the room — in-session, the provider's own events
   * report joins, leaves and the teacher's End, so a poll would be noise.
   *
   * The interval skips hidden tabs, and refreshing on `visibilitychange` is the
   * other half of that: browsers throttle background timers to once a minute
   * and freeze them outright in fully-occluded tabs (measured), so a returning
   * visitor cannot be left waiting a tick to find out the satsang has begun.
   * Coming back to the tab is itself the signal to re-check.
   */
  useEffect(() => {
    if (room) return;
    const timer = setInterval(() => {
      if (!document.hidden) void refreshState();
    }, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void refreshState();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [room, refreshState]);

  /**
   * Disconnecting is driven by the room leaving state, which covers both
   * leaving deliberately and unmounting: a client that navigates away without
   * disconnecting lingers in the provider's roster and in everyone's list.
   * Disconnecting an already-disconnected room is a no-op, so the ended-by-
   * teacher path is safe here too.
   */
  useEffect(() => {
    if (!room) return;
    return () => {
      void room.leave().catch(() => {});
    };
  }, [room]);

  const resetRoomUi = useCallback(() => {
    setRoom(null);
    setJoining(false);
    setParticipants([]);
    setConnection('idle');
    setPlaybackBlocked(false);
    setUnmuteRequested(false);
  }, []);

  /** Wraps an AudioRoom call so a rejection becomes a message, never a crash. */
  const runAction = useCallback((run: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    run()
      .catch((err: Error) => {
        // A refused microphone is the common case and is not really an error:
        // the visitor can still listen.
        const denied = /permission|denied|NotAllowed/i.test(err.message);
        setError(denied ? t.satsangMicDenied : t.scheduleErrorGeneric);
        console.error('SATSANG: action failed', err);
      })
      .finally(() => setBusy(false));
  }, [t]);

  async function handleStart() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/satsang/${eventId}/start`, { method: 'POST' });
      if (res.ok) {
        setState((await res.json()) as SatsangState);
        setNotice(null);
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(
          data?.error === 'no_account' ? t.scheduleErrorNoAccount
            : data?.error === 'audio_unavailable' ? t.satsangUnavailable
            : t.scheduleErrorGeneric,
        );
      }
    } catch {
      setError(t.scheduleErrorGeneric);
    }
    setBusy(false);
  }

  /**
   * Must be called from a tap. Both mobile platforms require a user gesture
   * before audio plays; a programmatic join yields a connected room and
   * silence (Phase 0 memo §5). Nobody joins with their microphone on — the mic
   * is a second, explicit gesture, which also defers the permission prompt.
   */
  async function handleJoin() {
    setJoining(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/satsang/${eventId}/token`, { method: 'POST' });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (res.status === 401) {
          signIn('google');
          setJoining(false);
          return;
        }
        setError(
          data?.error === 'no_account' ? t.scheduleErrorNoAccount
            : data?.error === 'audio_unavailable' ? t.satsangUnavailable
            : data?.error === 'not_live' ? t.satsangNotStartedTitle
            : t.scheduleErrorGeneric,
        );
        setJoining(false);
        void refreshState();
        return;
      }

      const { token, url } = (await res.json()) as { token: string; url: string };

      const joined = await createAudioRoom();

      joined.on('participants', list => setParticipants(list));
      joined.on('connection', next => setConnection(next));
      joined.on('playbackBlocked', () => setPlaybackBlocked(true));
      joined.on('unmuteRequested', () => setUnmuteRequested(true));
      joined.on('log', line => console.info('SATSANG:', line));
      joined.on('closed', reason => {
        resetRoomUi();
        if (reason === 'ended-by-teacher') setNotice(t.satsangEndedByTeacher);
        else if (reason === 'lost') setNotice(t.satsangConnectionLost);
        void refreshState();
      });

      await joined.join({
        token,
        url,
        controlUrl: `/api/satsang/${eventId}/control`,
        mediaSessionTitle: eventTitle,
      });
      setRoom(joined);
      setJoining(false);
    } catch (err) {
      console.error('SATSANG: join failed', err);
      setError(t.scheduleErrorGeneric);
      resetRoomUi();
    }
  }

  function handleLeave() {
    // resetRoomUi drops the room from state, and the effect above disconnects it.
    resetRoomUi();
    void refreshState();
  }

  async function handleEnd() {
    if (!window.confirm(t.satsangConfirmEnd)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/satsang/${eventId}/end`, { method: 'POST' });
      if (res.ok) {
        setState((await res.json()) as SatsangState);
        resetRoomUi();
      } else {
        setError(t.scheduleErrorGeneric);
      }
    } catch {
      setError(t.scheduleErrorGeneric);
    }
    setBusy(false);
  }

  /**
   * "Started 10 min ago" while that is the useful answer, and the clock time
   * once it stops being one (a session running past half a day, or a page
   * rendered on the server, where `useNow` is deliberately 0 so SSR and
   * hydration agree).
   */
  function startedLabel(startedAt: string): string {
    if (!now) return t.satsangStartedAt(formatTime(startedAt, lang, tz));
    const minutes = Math.floor((now - Date.parse(startedAt)) / 60_000);
    if (minutes < 1) return t.satsangStartedJustNow;
    if (minutes < 60) return t.satsangStartedMinutesAgo(minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 12) return t.satsangStartedHoursAgo(hours);
    return t.satsangStartedAt(formatTime(startedAt, lang, tz));
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '20px',
    margin: '0 0 24px',
  };
  const buttonStyle = (primary: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    minHeight: '40px',
    padding: '9px 18px',
    fontSize: 'var(--text-button)',
    fontFamily: 'inherit',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: busy ? 'wait' : 'pointer',
    background: primary ? 'var(--color-gold)' : 'none',
    color: primary ? '#fff' : 'var(--color-text-secondary)',
    border: `1px solid ${primary ? 'var(--color-gold)' : 'var(--color-border)'}`,
  });

  const messages = (
    <>
      {notice && (
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: '10px 0 0' }}>
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-red-muted)', margin: '10px 0 0' }}>
          {error}
        </p>
      )}
    </>
  );

  if (room) {
    return (
      <>
        <SessionRoom
          room={room}
          participants={participants}
          connection={connection}
          isTeacher={isOwner}
          playbackBlocked={playbackBlocked}
          unmuteRequested={unmuteRequested}
          busy={busy}
          onAction={runAction}
          onDismissUnmuteRequest={() => setUnmuteRequested(false)}
          onLeave={handleLeave}
          onEnd={handleEnd}
        />
        {messages}
      </>
    );
  }

  return (
    <div style={cardStyle}>
      {state.live ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px 10px', flexWrap: 'wrap',
          margin: '0 0 16px',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: 'var(--text-badge)', fontWeight: 600,
            color: 'var(--color-red-muted)',
          }}>
            <span aria-hidden="true" style={{
              width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-red-muted)',
            }} />
            {t.satsangLiveNow}
          </span>
          {state.startedAt && (
            <span style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)' }}>
              {startedLabel(state.startedAt)}
            </span>
          )}
        </div>
      ) : (
        <>
          <p style={{
            fontSize: 'var(--text-card-title)', fontWeight: 600,
            color: 'var(--color-text-primary)', margin: '0 0 6px',
          }}>
            {state.lastEndedAt ? t.satsangEndedTitle : t.satsangNotStartedTitle}
          </p>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
            {state.lastEndedAt ? t.satsangEndedBody : t.satsangNotStartedBody}
          </p>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {state.live && signedIn && (
          <button onClick={handleJoin} disabled={joining} style={buttonStyle(true)}>
            {joining ? t.satsangJoining : t.satsangJoin}
          </button>
        )}

        {/* Signed-out visitors see that the session exists and are nudged, the
            same contract the rest of the schedule layer follows: reads public,
            presence signed in. */}
        {state.live && !signedIn && authEnabled && (
          <button onClick={() => signIn('google')} style={buttonStyle(true)}>
            {t.satsangSignInToJoin}
          </button>
        )}

        {isOwner && !state.live && !cancelled && (
          <button onClick={handleStart} disabled={busy} style={buttonStyle(true)}>
            {busy ? t.satsangStarting : t.satsangStart}
          </button>
        )}

        {isOwner && state.live && (
          <button
            onClick={handleEnd}
            disabled={busy}
            style={{
              ...buttonStyle(false),
              color: 'var(--color-red-muted)',
              border: '1px solid var(--color-red-muted)',
            }}
          >
            {t.satsangEnd}
          </button>
        )}
      </div>

      {messages}
    </div>
  );
}
