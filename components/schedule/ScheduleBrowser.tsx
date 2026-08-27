'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { TabList, TabPanel, useTabs } from '@/components/Tabs';
import type { EventOccurrence } from '@/lib/schedule';
import { wallTime } from '@/lib/occurrences.mjs';
import {
  formatDateHeading, formatTime, localDateKey, monthLabel, useDisplayTimeZone, weekdayShortName,
} from './format';

/**
 * The /schedule browser: an upcoming list (default) and a month calendar,
 * toggled through the shared Tabs primitive. Occurrences arrive pre-expanded
 * from the server (60-day horizon) as UTC instants and are grouped/rendered
 * in the viewer's local timezone.
 */
export default function ScheduleBrowser({
  occurrences,
  authEnabled,
}: {
  occurrences: EventOccurrence[];
  authEnabled: boolean;
}) {
  const { lang } = useLang();
  const t = UI[lang];
  const tz = useDisplayTimeZone();

  const tabs = [
    { id: 'upcoming', label: t.upcoming },
    { id: 'calendar', label: t.scheduleCalendarTab },
  ];
  const { activeTab, setActiveTab, tabRefs, handleKeyDown } = useTabs(tabs);

  return (
    <div>
      <CreateControl authEnabled={authEnabled} />

      <TabList
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabRefs={tabRefs}
        handleKeyDown={handleKeyDown}
        ariaLabel={t.schedule}
        idPrefix="schedule"
      />

      <TabPanel id="upcoming" activeTab={activeTab} idPrefix="schedule">
        {occurrences.length === 0 ? <ScheduleEmpty /> : <UpcomingList occurrences={occurrences} tz={tz} />}
      </TabPanel>

      <TabPanel id="calendar" activeTab={activeTab} idPrefix="schedule">
        <MonthCalendar occurrences={occurrences} tz={tz} />
      </TabPanel>
    </div>
  );
}

/** Create button for signed-in users; a sign-in nudge in its place otherwise. */
function CreateControl({ authEnabled }: { authEnabled: boolean }) {
  const { lang } = useLang();
  const t = UI[lang];
  const { data: session } = useSession();

  if (!authEnabled) return null;

  return (
    <div style={{ margin: '0 0 24px' }}>
      {session?.user ? (
        <Link
          href="/schedule/new"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--color-gold)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: 'var(--text-button)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + {t.scheduleCreate}
        </Link>
      ) : (
        <button
          onClick={() => signIn('google')}
          style={{
            padding: '10px 20px',
            background: 'none',
            color: 'var(--color-gold-text)',
            border: '1px solid var(--color-gold)',
            borderRadius: '8px',
            fontSize: 'var(--text-button)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t.scheduleSignInToCreate}
        </button>
      )}
    </div>
  );
}

function ScheduleEmpty() {
  const { lang } = useLang();
  const t = UI[lang];
  return (
    <div style={{
      padding: '64px 32px', textAlign: 'center',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px',
    }}>
      <p style={{ fontSize: 'var(--icon-empty-state)', margin: '0 0 16px' }} aria-hidden="true">🪔</p>
      <p style={{ fontSize: 'var(--text-card-title)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
        {t.scheduleEmptyTitle}
      </p>
      <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
        {t.scheduleEmptyBody}
      </p>
    </div>
  );
}

function RecurrenceBadge({ recurrence }: { recurrence: EventOccurrence['recurrence'] }) {
  const { lang } = useLang();
  const t = UI[lang];
  if (recurrence === 'none') return null;
  return (
    <span style={{
      fontSize: 'var(--text-badge)',
      color: 'var(--color-gold-text)',
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      padding: '1px 8px',
      whiteSpace: 'nowrap',
    }}>
      {recurrence === 'daily' ? t.recurrenceDaily : t.recurrenceWeekly}
    </span>
  );
}

function UpcomingList({ occurrences, tz }: { occurrences: EventOccurrence[]; tz: string }) {
  const { lang } = useLang();
  const t = UI[lang];

  // Group by viewer-local calendar day, preserving the ascending order.
  const groups = useMemo(() => {
    const byDay = new Map<string, EventOccurrence[]>();
    for (const occ of occurrences) {
      const key = localDateKey(occ.startsAt, tz);
      const list = byDay.get(key);
      if (list) list.push(occ);
      else byDay.set(key, [occ]);
    }
    return [...byDay.values()];
  }, [occurrences, tz]);

  return (
    <div>
      <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 20px' }}>
        {t.shownInLocalTime}
      </p>
      {groups.map(group => (
        <section key={localDateKey(group[0].startsAt, tz)} style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontSize: 'var(--text-h3)', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--color-text-secondary)', margin: '0 0 10px',
          }}>
            {formatDateHeading(group[0].startsAt, lang, tz)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {group.map(occ => (
              <Link
                key={`${occ.eventId}-${occ.startsAt}`}
                href={`/schedule/${occ.eventId}`}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap',
                  padding: '14px 16px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  fontSize: 'var(--text-body-sm)', fontWeight: 600,
                  color: 'var(--color-gold-text)', whiteSpace: 'nowrap',
                  minWidth: '72px',
                }}>
                  {formatTime(occ.startsAt, lang, tz)}
                </span>
                <span style={{
                  fontSize: 'var(--text-card-title)', fontWeight: 500,
                  color: 'var(--color-text-primary)', flex: '1 1 auto', minWidth: '140px',
                }}>
                  {occ.title}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RecurrenceBadge recurrence={occ.recurrence} />
                  <span style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {occ.durationMinutes} {t.minutesShort}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const MAX_CHIPS_PER_DAY = 3;

function MonthCalendar({ occurrences, tz }: { occurrences: EventOccurrence[]; tz: string }) {
  const { lang } = useLang();
  const t = UI[lang];
  // The month currently shown, as an offset from the viewer's current month.
  // The horizon is 60 days, so two months forward covers everything expanded.
  const [monthOffset, setMonthOffset] = useState(0);
  const [nowIso] = useState(() => new Date().toISOString());

  const today = wallTime(Date.parse(nowIso), tz);
  const shownMonth0 = today.month - 1 + monthOffset; // 0-based, may overflow into next year
  const shownYear = today.year + Math.floor(shownMonth0 / 12);
  const shownMonth = ((shownMonth0 % 12) + 12) % 12 + 1; // back to 1-based

  const byDay = useMemo(() => {
    const map = new Map<string, EventOccurrence[]>();
    for (const occ of occurrences) {
      const key = localDateKey(occ.startsAt, tz);
      const list = map.get(key);
      if (list) list.push(occ);
      else map.set(key, [occ]);
    }
    return map;
  }, [occurrences, tz]);

  const daysInMonth = new Date(Date.UTC(shownYear, shownMonth, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(shownYear, shownMonth - 1, 1)).getUTCDay();
  const todayKey = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;

  const navButtonStyle: React.CSSProperties = {
    width: '36px', height: '36px',
    background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px',
    color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '16px', lineHeight: 1,
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          disabled={monthOffset <= 0}
          aria-label={t.calPrevMonth}
          style={{ ...navButtonStyle, opacity: monthOffset <= 0 ? 0.4 : 1 }}
        >
          ‹
        </button>
        <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {monthLabel(shownYear, shownMonth, lang)}
        </h2>
        <button
          onClick={() => setMonthOffset(o => o + 1)}
          disabled={monthOffset >= 2}
          aria-label={t.calNextMonth}
          style={{ ...navButtonStyle, opacity: monthOffset >= 2 ? 0.4 : 1 }}
        >
          ›
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {[0, 1, 2, 3, 4, 5, 6].map(d => (
          <div key={`h${d}`} style={{
            textAlign: 'center', fontSize: 'var(--text-label)', fontWeight: 600,
            color: 'var(--color-text-secondary)', padding: '4px 0',
          }}>
            {weekdayShortName(d, lang)}
          </div>
        ))}

        {Array.from({ length: firstWeekday }, (_, i) => <div key={`pad${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${shownYear}-${String(shownMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOccurrences = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          return (
            <div key={key} style={{
              minHeight: '64px',
              padding: '4px',
              background: 'var(--color-surface)',
              border: `1px solid ${isToday ? 'var(--color-gold)' : 'var(--color-border)'}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                fontSize: 'var(--text-label)',
                fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--color-gold-text)' : 'var(--color-text-secondary)',
                marginBottom: '2px',
              }}>
                {day}
              </div>
              {dayOccurrences.slice(0, MAX_CHIPS_PER_DAY).map(occ => (
                <Link
                  key={`${occ.eventId}-${occ.startsAt}`}
                  href={`/schedule/${occ.eventId}`}
                  title={`${formatTime(occ.startsAt, lang, tz)} · ${occ.title}`}
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    lineHeight: 1.4,
                    color: 'var(--color-gold-text)',
                    background: 'rgba(184,134,11,0.10)',
                    borderRadius: '4px',
                    padding: '1px 4px',
                    marginBottom: '2px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {occ.title}
                </Link>
              ))}
              {dayOccurrences.length > MAX_CHIPS_PER_DAY && (
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                  +{dayOccurrences.length - MAX_CHIPS_PER_DAY}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
