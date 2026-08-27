'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { sortRoster, type AudioRoom, type RoomConnectionState, type RoomParticipant } from '@/lib/audio/audio-room';

/**
 * The in-session view: who is here, who is speaking, and the controls. Purely
 * presentational over the AudioRoom interface — it holds no provider types and
 * no state of its own, so the whole live surface is swappable with the adapter.
 *
 * Mobile-first: one column at 375px, controls in a wrapping row, tap targets at
 * 40px+. The teacher is pinned to the top of the roster (see `sortRoster`).
 */
export default function SessionRoom({
  room,
  participants,
  connection,
  isTeacher,
  playbackBlocked,
  unmuteRequested,
  busy,
  onAction,
  onDismissUnmuteRequest,
  onLeave,
  onEnd,
}: {
  room: AudioRoom;
  participants: RoomParticipant[];
  connection: RoomConnectionState;
  isTeacher: boolean;
  playbackBlocked: boolean;
  unmuteRequested: boolean;
  busy: boolean;
  /** Runs an AudioRoom call and surfaces failures through the parent. */
  onAction: (run: () => Promise<void>) => void;
  onDismissUnmuteRequest: () => void;
  onLeave: () => void;
  onEnd: () => void;
}) {
  const { lang } = useLang();
  const t = UI[lang];

  const me = participants.find(p => p.isLocal);
  const roster = sortRoster(participants);

  const button = (variant: 'primary' | 'quiet' | 'danger'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    minHeight: '40px',
    padding: '9px 18px',
    fontSize: 'var(--text-button)',
    fontFamily: 'inherit',
    fontWeight: 600,
    borderRadius: '8px',
    cursor: busy ? 'wait' : 'pointer',
    background: variant === 'primary' ? 'var(--color-gold)' : 'none',
    color: variant === 'primary' ? '#fff'
      : variant === 'danger' ? 'var(--color-red-muted)'
      : 'var(--color-text-secondary)',
    border: `1px solid ${
      variant === 'primary' ? 'var(--color-gold)'
        : variant === 'danger' ? 'var(--color-red-muted)'
        : 'var(--color-border)'
    }`,
  });

  /**
   * The self mic toggle stays the loudest control in the room: gold filled
   * when the tap would unmute, gold outline when it would mute. Either way it
   * reads ahead of the grey Leave and the teacher's room controls.
   */
  const selfMicButton = (micOn: boolean): React.CSSProperties => ({
    ...button(micOn ? 'quiet' : 'primary'),
    ...(micOn
      ? { color: 'var(--color-gold-text)', border: '1px solid var(--color-gold)' }
      : null),
  });

  const smallButton: React.CSSProperties = {
    minHeight: '32px',
    padding: '5px 12px',
    fontSize: 'var(--text-badge)',
    fontFamily: 'inherit',
    color: 'var(--color-text-secondary)',
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px',
      margin: '0 0 24px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        margin: '0 0 4px',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: 'var(--text-badge)', fontWeight: 600,
          color: 'var(--color-red-muted)',
        }}>
          <span aria-hidden="true" style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--color-red-muted)',
          }} />
          {t.satsangLiveNow}
        </span>
        <span style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)' }}>
          {t.satsangInRoom(participants.length)}
          {connection === 'reconnecting' && <> · {t.satsangReconnecting}</>}
        </span>
      </div>

      {/*
        Screen-lock caveat from the Phase 0 field measurement: remote audio is
        registered with MediaSession, but Android battery managers vary, so the
        honest thing is to say so rather than promise background listening.
      */}
      <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
        {t.satsangKeepScreenOn}
      </p>

      {playbackBlocked && (
        <div style={{
          border: '1px solid var(--color-gold)', borderRadius: '8px',
          padding: '12px 14px', margin: '0 0 16px',
        }}>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
            {t.satsangEnableAudioHint}
          </p>
          <button onClick={() => onAction(() => room.startAudio())} style={button('primary')}>
            {t.satsangEnableAudio}
          </button>
        </div>
      )}

      {unmuteRequested && (
        <div
          role="alert"
          style={{
            border: '1px solid var(--color-gold)', borderRadius: '8px',
            padding: '12px 14px', margin: '0 0 16px',
          }}
        >
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
            {t.satsangUnmuteRequested}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onDismissUnmuteRequest();
                onAction(() => room.setMicEnabled(true));
              }}
              style={button('primary')}
            >
              {t.satsangUnmuteAccept}
            </button>
            <button onClick={onDismissUnmuteRequest} style={button('quiet')}>
              {t.satsangUnmuteDismiss}
            </button>
          </div>
        </div>
      )}

      <ul style={{ listStyle: 'none', margin: '0 0 18px', padding: 0 }}>
        {roster.map(p => (
          <li
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
              padding: '10px 0',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {/* Ring, not a colour swap: active-speaker indication has to read at
                a glance without becoming the loudest thing on the page. */}
            <span
              aria-hidden="true"
              style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                outline: p.speaking ? '2px solid var(--color-gold)' : 'none',
                outlineOffset: '2px',
                backgroundImage: p.avatarUrl ? `url(${p.avatarUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <span style={{
              fontSize: 'var(--text-body-sm)', fontWeight: p.role === 'teacher' ? 600 : 400,
              color: 'var(--color-text-primary)',
              overflowWrap: 'anywhere',
            }}>
              {p.name}
              {p.isLocal && <> ({t.satsangYouLabel})</>}
            </span>

            {/* Glyph first for a glanceable read down the column, with the
                same state spelled out beside it — the icon is decorative and
                the text is what a screen reader announces. */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: 'var(--text-badge)', color: 'var(--color-text-secondary)',
            }}>
              <MicGlyph on={p.micEnabled} speaking={p.speaking} />
              {p.role === 'teacher' && <>{t.satsangTeacherLabel} · </>}
              {p.speaking ? t.satsangSpeakingLabel : p.micEnabled ? t.satsangMicOnLabel : t.satsangMutedLabel}
            </span>

            {isTeacher && !p.isLocal && (
              <span style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                {p.micEnabled ? (
                  <button
                    onClick={() => onAction(() => room.muteParticipant(p.id))}
                    disabled={busy}
                    style={smallButton}
                  >
                    {t.satsangMuteParticipant}
                  </button>
                ) : (
                  <button
                    onClick={() => onAction(() => room.requestUnmute(p.id))}
                    disabled={busy}
                    style={smallButton}
                  >
                    {t.satsangAskToUnmute}
                  </button>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Your own microphone, and nothing that touches anyone else. Mis-tapping
          "Mute all" during a chant silences the whole gathering, so the room
          controls live in their own group below rather than beside this. */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => onAction(() => room.setMicEnabled(!me?.micEnabled))}
          disabled={busy}
          aria-pressed={Boolean(me?.micEnabled)}
          style={selfMicButton(Boolean(me?.micEnabled))}
        >
          <MicGlyph on={Boolean(me?.micEnabled)} speaking={false} />
          {me?.micEnabled ? t.satsangMuteSelf : t.satsangUnmuteSelf}
        </button>

        <button onClick={onLeave} disabled={busy} style={button('quiet')}>
          {t.satsangLeave}
        </button>
      </div>

      {isTeacher && (
        <div
          role="group"
          aria-label={t.satsangTeacherControlsLabel}
          style={{
            margin: '16px 0 0',
            padding: '14px 0 0',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <p style={{
            fontSize: 'var(--text-badge)', fontWeight: 600,
            color: 'var(--color-text-secondary)', margin: '0 0 10px',
          }}>
            {t.satsangTeacherControlsLabel}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => onAction(() => room.muteAll())} disabled={busy} style={button('quiet')}>
              {t.satsangMuteAll}
            </button>
            <button onClick={onEnd} disabled={busy} style={button('danger')}>
              {t.satsangEnd}
            </button>
          </div>
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '12px 0 0' }}>
            {t.satsangTeacherHint}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Mic on / mic off, drawn to match the stroke icons in the nav. Decorative:
 * every row and button that carries one also spells the state out in text.
 */
function MicGlyph({ on, speaking }: { on: boolean; speaking: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ flexShrink: 0, color: speaking ? 'var(--color-gold)' : undefined }}
    >
      <rect x="6" y="1.75" width="4" height="7.5" rx="2" />
      <path d="M3.5 7.25a4.5 4.5 0 0 0 9 0" />
      <line x1="8" y1="11.75" x2="8" y2="14.25" />
      {!on && <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />}
    </svg>
  );
}
