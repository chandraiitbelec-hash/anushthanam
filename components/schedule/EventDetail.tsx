'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { ScheduleEventWithMeta } from '@/lib/schedule';
import { formatDateTime, useDisplayTimeZone, weekdayShortName } from './format';

/**
 * Event detail view: full info in the viewer's local time with an explicit
 * timezone label (the audience spans India + diaspora), the "Interested"
 * toggle + count, ICS download, and owner-only edit/cancel.
 */
export default function EventDetail({
  event,
  occurrences,
  isOwner,
  authEnabled,
}: {
  event: ScheduleEventWithMeta;
  /** Next occurrence start ISOs (first is the headline datetime). */
  occurrences: string[];
  isOwner: boolean;
  authEnabled: boolean;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const tz = useDisplayTimeZone();
  const router = useRouter();
  const { data: session } = useSession();

  const [interested, setInterested] = useState(event.viewerInterested);
  const [interestCount, setInterestCount] = useState(event.interestCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelled = event.status === 'cancelled';
  const headline = occurrences[0] ?? event.startsAt;

  async function handleInterest() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/schedule/${event.id}/interest`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { interested: boolean; count: number };
        setInterested(data.interested);
        setInterestCount(data.count);
      } else if (res.status === 401) {
        signIn('google');
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error === 'no_account' ? t.scheduleErrorNoAccount : t.scheduleErrorGeneric);
      }
    } catch {
      setError(t.scheduleErrorGeneric);
    }
    setBusy(false);
  }

  async function handleCancel() {
    if (busy || !window.confirm(t.confirmCancelEvent)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/schedule/${event.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        setError(t.scheduleErrorGeneric);
      }
    } catch {
      setError(t.scheduleErrorGeneric);
    }
    setBusy(false);
  }

  const actionStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '9px 18px',
    fontSize: 'var(--text-button)',
    fontFamily: 'inherit',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  return (
    <article>
      {cancelled && (
        <p style={{
          display: 'inline-block',
          fontSize: 'var(--text-badge)', fontWeight: 600,
          color: 'var(--color-red-muted)',
          border: '1px solid var(--color-red-muted)',
          borderRadius: '12px',
          padding: '2px 12px',
          margin: '0 0 12px',
        }}>
          {t.eventCancelledBadge}
        </p>
      )}

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-h1-page)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
        overflowWrap: 'anywhere',
        textDecoration: cancelled ? 'line-through' : undefined,
      }}>
        {event.title}
      </h1>

      {event.ownerName && (
        <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 24px' }}>
          {t.hostedBy(event.ownerName)}
        </p>
      )}

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        margin: '0 0 24px',
      }}>
        <p style={{
          fontSize: 'var(--text-card-title)', fontWeight: 600,
          color: 'var(--color-text-primary)', margin: '0 0 6px',
        }}>
          {formatDateTime(headline, lang, tz)}
        </p>
        <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
          {event.durationMinutes} {t.minutesShort}
          {event.recurrence === 'daily' && <> · {t.repeatsDaily}</>}
          {event.recurrence === 'weekly' && (
            <> · {t.repeatsWeeklyOn(event.weekdays.map(d => weekdayShortName(d, lang)).join(', '))}</>
          )}
        </p>
        <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: 0 }}>
          {t.timezoneLabel}: {event.tz} · {t.shownInLocalTime}
        </p>

        {event.recurrence !== 'none' && occurrences.length > 1 && (
          <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: '14px 0 0', borderTop: '1px solid var(--color-border)' }}>
            {occurrences.slice(1, 5).map(iso => (
              <li key={iso} style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', padding: '2px 0' }}>
                {formatDateTime(iso, lang, tz)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {event.description && (
        <div style={{ margin: '0 0 28px' }}>
          {event.description.split(/\n+/).map((para, i) => (
            <p key={i} style={{
              fontSize: 'var(--text-body)', lineHeight: 1.7,
              color: 'var(--color-text-primary)', margin: '0 0 12px',
              overflowWrap: 'anywhere',
            }}>
              {para}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', margin: '0 0 12px' }}>
        {authEnabled && (
          session?.user ? (
            <button
              onClick={handleInterest}
              disabled={busy}
              aria-pressed={interested}
              style={{
                ...actionStyle,
                background: interested ? 'var(--color-gold)' : 'none',
                color: interested ? '#fff' : 'var(--color-gold-text)',
                border: `1px solid var(--color-gold)`,
                fontWeight: 600,
              }}
            >
              {interested ? '★' : '☆'} {t.interestedAction}
            </button>
          ) : (
            <button
              onClick={() => signIn('google')}
              style={{
                ...actionStyle,
                background: 'none',
                color: 'var(--color-gold-text)',
                border: '1px solid var(--color-gold)',
                fontWeight: 600,
              }}
            >
              ☆ {t.signInToMarkInterest}
            </button>
          )
        )}

        <a
          href={`/api/schedule/${event.id}/ics`}
          download
          style={{
            ...actionStyle,
            background: 'none',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {t.addToCalendar}
        </a>

        {isOwner && !cancelled && (
          <>
            <Link
              href={`/schedule/${event.id}/edit`}
              style={{
                ...actionStyle,
                background: 'none',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {t.editEvent}
            </Link>
            <button
              onClick={handleCancel}
              disabled={busy}
              style={{
                ...actionStyle,
                background: 'none',
                color: 'var(--color-red-muted)',
                border: '1px solid var(--color-red-muted)',
              }}
            >
              {t.cancelEvent}
            </button>
          </>
        )}
      </div>

      {interestCount > 0 && (
        <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
          {t.interestedCount(interestCount)}
        </p>
      )}

      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-red-muted)', margin: '8px 0 0' }}>
          {error}
        </p>
      )}
    </article>
  );
}
