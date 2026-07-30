'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import { localize } from '@/lib/localize';
import type { PanchangamDay } from '@/lib/types';

type Props = { day: PanchangamDay | null; compact?: boolean };

export default function PanchangamWidget({ day, compact = false }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];
  if (!day) return null;

  const specialEvent = localize(day, 'special_event', lang);

  const nameClass = scriptClass(lang);

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
        fontSize: 'var(--text-meta)',
      }}>
        <span>
          <b style={{ color: 'var(--color-text-secondary)' }}>{ui.tithi}: </b>
          <span className={nameClass}>{localize(day, 'tithi', lang)}</span>
        </span>
        <span>
          <b style={{ color: 'var(--color-text-secondary)' }}>{ui.nakshatra}: </b>
          <span className={nameClass}>{localize(day, 'nakshatra', lang)}</span>
        </span>
        {specialEvent && (
          <span className={nameClass} style={{ color: 'var(--color-gold-text)', fontWeight: 500 }}>
            {specialEvent}
          </span>
        )}
      </div>
    );
  }

  const fields = [
    { label: ui.tithi, value: `${day.paksha} ${localize(day, 'tithi', lang)}` },
    { label: ui.nakshatra, value: localize(day, 'nakshatra', lang) },
    { label: ui.yoga, value: localize(day, 'yoga', lang) },
    { label: ui.karana, value: localize(day, 'karana', lang) },
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
        <p className={nameClass} style={{
          fontSize: 'var(--text-meta)',
          fontWeight: 600,
          color: 'var(--color-saffron-text)',
          margin: '0 0 12px',
          letterSpacing: '0.05em',
        }}>
          {specialEvent}
        </p>
      )}
      <p style={{
        fontSize: 'var(--text-meta)',
        color: 'var(--color-text-secondary)',
        margin: '0 0 16px',
      }}>
        <span className={nameClass}>{localize(day, 'lunar_month', lang)}</span>{' '}
        <span className={nameClass}>{ui.masa}</span>
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
      }}>
        {fields.map(f => (
          <div key={f.label}>
            <p className={nameClass} style={{ fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', margin: '0 0 2px', textTransform: lang === 'en' ? 'uppercase' : undefined, letterSpacing: '0.05em' }}>
              {f.label}
            </p>
            <p className={nameClass} style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
