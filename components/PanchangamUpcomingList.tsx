'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { LOCALE_MAP } from '@/lib/utils';
import type { PanchangamDay } from '@/lib/types';

export default function PanchangamUpcomingList({ days }: { days: PanchangamDay[] }) {
  const { lang } = useLang();
  const ui = UI[lang];
  const locale = LOCALE_MAP[lang] ?? 'en-IN';
  const r = (day: PanchangamDay) => day as unknown as Record<string, string>;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {days.map(day => (
          <div key={day.date} style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            alignItems: 'center',
          }}>
            <div style={{ width: '80px', flexShrink: 0 }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                {new Date(day.date).toLocaleDateString(locale, { weekday: 'short' })}
              </p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {new Date(day.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
                {day.paksha} {r(day)[`tithi_${lang}`] || day.tithi_en} · {r(day)[`nakshatra_${lang}`] || day.nakshatra_en}
              </p>
              {(r(day)[`special_event_${lang}`] || day.special_event_en) && (
                <p style={{ fontSize: '13px', color: 'var(--color-saffron-text)', fontWeight: 500, margin: 0 }}>
                  {r(day)[`special_event_${lang}`] || day.special_event_en}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {days.length === 30 && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px', textAlign: 'center' }}>
          {ui.showingDays(30)}
        </p>
      )}
    </>
  );
}
