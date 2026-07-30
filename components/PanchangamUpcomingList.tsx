'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { LOCALE_MAP } from '@/lib/utils';
import { localize } from '@/lib/localize';
import type { PanchangamDay } from '@/lib/types';

export default function PanchangamUpcomingList({ days }: { days: PanchangamDay[] }) {
  const { lang } = useLang();
  const ui = UI[lang];
  const locale = LOCALE_MAP[lang] ?? 'en-IN';

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
              <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: 0 }}>
                {new Date(day.date).toLocaleDateString(locale, { weekday: 'short' })}
              </p>
              <p style={{ fontSize: 'var(--text-card-title)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {new Date(day.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
                {day.paksha} {localize(day, 'tithi', lang)} · {localize(day, 'nakshatra', lang)}
              </p>
              {localize(day, 'special_event', lang) && (
                <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-saffron-text)', fontWeight: 500, margin: 0 }}>
                  {localize(day, 'special_event', lang)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {days.length === 30 && (
        <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', marginTop: '12px', textAlign: 'center' }}>
          {ui.showingDays(30)}
        </p>
      )}
    </>
  );
}
