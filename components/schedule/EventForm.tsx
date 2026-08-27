'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { wallTime, wallTimeToUtc } from '@/lib/occurrences.mjs';
import { weekdayShortName } from './format';
import type { EventRecurrence, ScheduleEvent } from '@/lib/schedule';
import { DEFAULT_EVENT_KIND, SATSANG_KIND, type EventKind } from '@/lib/event-kinds';

/**
 * Create/edit form for a scheduled event. The date/time inputs are wall-clock
 * values in the event's anchor timezone: the browser's zone for a new event,
 * and the event's original zone when editing — so an editor travelling abroad
 * doesn't silently re-anchor "7pm IST every Tuesday" to their hotel's zone.
 * v1 edits always apply to the whole series.
 */
export default function EventForm({
  event,
  liveAudioEnabled,
}: {
  event?: ScheduleEvent;
  /**
   * Whether the audio provider is configured. When it isn't, the event-type
   * choice is hidden entirely rather than offering a session that could never
   * start — an event already marked satsang keeps its kind on save.
   */
  liveAudioEnabled: boolean;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const router = useRouter();

  const tz = useMemo(() => {
    if (event) return event.tz;
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }, [event]);

  const initial = useMemo(() => {
    if (!event) return null;
    const w = wallTime(Date.parse(event.startsAt), event.tz);
    return {
      date: `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`,
      time: `${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')}`,
    };
  }, [event]);

  const [kind, setKind] = useState<EventKind>(
    event?.kind === SATSANG_KIND ? SATSANG_KIND : DEFAULT_EVENT_KIND,
  );
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [duration, setDuration] = useState(String(event?.durationMinutes ?? 60));
  const [recurrence, setRecurrence] = useState<EventRecurrence>(event?.recurrence ?? 'none');
  const [weekdays, setWeekdays] = useState<number[]>(event?.weekdays ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleWeekday(d: number) {
    setWeekdays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()));
  }

  const durationNum = Number(duration);
  const canSubmit =
    title.trim().length > 0 &&
    Boolean(date) &&
    Boolean(time) &&
    Number.isInteger(durationNum) && durationNum >= 1 && durationNum <= 1440 &&
    (recurrence !== 'weekly' || weekdays.length > 0) &&
    !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    const startsAtMs = wallTimeToUtc({ year, month, day, hour, minute }, tz);

    const payload = {
      kind,
      title: title.trim(),
      description: description.trim() || null,
      startsAt: new Date(startsAtMs).toISOString(),
      durationMinutes: durationNum,
      recurrence,
      weekdays: recurrence === 'weekly' ? weekdays : [],
      tz,
    };

    try {
      const res = await fetch(event ? `/api/schedule/${event.id}` : '/api/schedule', {
        method: event ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as { event: { id: string } };
        router.push(`/schedule/${data.event.id}`);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error === 'no_account' ? t.scheduleErrorNoAccount : t.scheduleErrorGeneric);
    } catch {
      setError(t.scheduleErrorGeneric);
    }
    setSaving(false);
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
    margin: '0 0 6px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 'var(--text-body)',
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    boxSizing: 'border-box',
  };
  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px',
    fontSize: 'var(--text-button)',
    fontFamily: 'inherit',
    fontWeight: active ? 600 : 400,
    color: active ? '#fff' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-gold)' : 'transparent',
    border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
    borderRadius: '20px',
    cursor: 'pointer',
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>
      {liveAudioEnabled && (
        <div>
          <span style={labelStyle}>{t.eventKindLabel}</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([
              [DEFAULT_EVENT_KIND, t.eventKindGathering],
              [SATSANG_KIND, t.eventKindSatsang],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                aria-pressed={kind === value}
                style={pillStyle(kind === value)}
              >
                {label}
              </button>
            ))}
          </div>
          {kind === SATSANG_KIND && (
            <p style={{
              fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)',
              margin: '8px 0 0', lineHeight: 1.6,
            }}>
              {t.eventKindSatsangHint}
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="event-title" style={labelStyle}>{t.eventTitleLabel}</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
          required
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="event-description" style={labelStyle}>
          {t.eventDescriptionLabel} · {t.optional}
        </label>
        <textarea
          id="event-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={5000}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 150px' }}>
          <label htmlFor="event-date" style={labelStyle}>{t.eventDateLabel}</label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label htmlFor="event-time" style={labelStyle}>{t.eventTimeLabel}</label>
          <input
            id="event-time"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label htmlFor="event-duration" style={labelStyle}>{t.eventDurationLabel}</label>
          <input
            id="event-duration"
            type="number"
            min={1}
            max={1440}
            step={1}
            value={duration}
            onChange={e => setDuration(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <span style={labelStyle}>{t.eventRecurrenceLabel}</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([
            ['none', t.recurrenceNone],
            ['daily', t.recurrenceDaily],
            ['weekly', t.recurrenceWeekly],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRecurrence(value)}
              aria-pressed={recurrence === value}
              style={pillStyle(recurrence === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {recurrence === 'weekly' && (
        <div>
          <span style={labelStyle}>{t.eventWeekdaysLabel}</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4, 5, 6].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleWeekday(d)}
                aria-pressed={weekdays.includes(d)}
                style={pillStyle(weekdays.includes(d))}
              >
                {weekdayShortName(d, lang)}
              </button>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: 0 }}>
        {t.timezoneLabel}: {tz}
      </p>

      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-red-muted)', margin: 0 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: '12px 28px',
            background: 'var(--color-gold)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: 'var(--text-button)',
            fontFamily: 'inherit',
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.6,
          }}
        >
          {saving ? t.savingEvent : t.saveEvent}
        </button>
        <Link
          href={event ? `/schedule/${event.id}` : '/schedule'}
          style={{ fontSize: 'var(--text-button)', color: 'var(--color-text-secondary)' }}
        >
          {t.backToSchedule}
        </Link>
      </div>
    </form>
  );
}
