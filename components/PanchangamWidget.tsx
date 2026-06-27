'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { PanchangamDay } from '@/lib/types';

type Props = { day: PanchangamDay | null; compact?: boolean };

export default function PanchangamWidget({ day, compact = false }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];
  if (!day) return null;

  const r = day as unknown as Record<string, string>;
  const specialEvent = r[`special_event_${lang}`] || day.special_event_en;

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        fontSize: '13px',
      }}>
        <span>
          <b style={{ color: 'var(--color-text-secondary)' }}>{ui.tithi}: </b>
          <span className={scriptClass}>{r[`tithi_${lang}`] || day.tithi_en}</span>
        </span>
        <span>
          <b style={{ color: 'var(--color-text-secondary)' }}>{ui.nakshatra}: </b>
          <span className={scriptClass}>{r[`nakshatra_${lang}`] || day.nakshatra_en}</span>
        </span>
        {specialEvent && (
          <span className={scriptClass} style={{ color: 'var(--color-gold)', fontWeight: 500 }}>
            {specialEvent}
          </span>
        )}
      </div>
    );
  }

  const fields = [
    { label: ui.tithi, value: `${day.paksha} ${r[`tithi_${lang}`] || day.tithi_en}` },
    { label: ui.nakshatra, value: r[`nakshatra_${lang}`] || day.nakshatra_en },
    { label: ui.yoga, value: r[`yoga_${lang}`] || day.yoga_en },
    { label: ui.karana, value: r[`karana_${lang}`] || day.karana_en },
    { label: ui.sunrise, value: day.sunrise },
    { label: ui.sunset, value: day.sunset },
    { label: ui.rahuKalam, value: day.rahu_kalam },
  ].filter(f => f.value);

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px 24px',
    }}>
      {specialEvent && (
        <p className={scriptClass} style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-saffron)',
          margin: '0 0 12px',
          letterSpacing: '0.05em',
        }}>
          {specialEvent}
        </p>
      )}
      <p style={{
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        margin: '0 0 16px',
      }}>
        <span className={scriptClass}>{r[`lunar_month_${lang}`] || day.lunar_month_en}</span>{' '}
        <span className={scriptClass}>{ui.masa}</span>
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
      }}>
        {fields.map(f => (
          <div key={f.label}>
            <p className={scriptClass} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 2px', textTransform: lang === 'en' ? 'uppercase' : undefined, letterSpacing: '0.05em' }}>
              {f.label}
            </p>
            <p className={scriptClass} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
