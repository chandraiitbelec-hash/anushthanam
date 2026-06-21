import type { PanchangamDay } from '@/lib/types';

type Props = { day: PanchangamDay | null; compact?: boolean };

export default function PanchangamWidget({ day, compact = false }: Props) {
  if (!day) return null;

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
        <span><b style={{ color: 'var(--color-text-secondary)' }}>Tithi:</b> {day.tithi_en}</span>
        <span><b style={{ color: 'var(--color-text-secondary)' }}>Nakshatra:</b> {day.nakshatra_en}</span>
        {day.special_event_en && (
          <span style={{ color: 'var(--color-gold)', fontWeight: 500 }}>{day.special_event_en}</span>
        )}
      </div>
    );
  }

  const fields = [
    { label: 'Tithi', value: `${day.paksha} ${day.tithi_en}` },
    { label: 'Nakshatra', value: day.nakshatra_en },
    { label: 'Yoga', value: day.yoga_en },
    { label: 'Karana', value: day.karana_en },
    { label: 'Sunrise', value: day.sunrise },
    { label: 'Sunset', value: day.sunset },
    { label: 'Rahu Kalam', value: day.rahu_kalam },
  ].filter(f => f.value);

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px 24px',
    }}>
      {day.special_event_en && (
        <p style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-saffron)',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {day.special_event_en}
        </p>
      )}
      <p style={{
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        margin: '0 0 16px',
      }}>
        {day.lunar_month_en} Masa
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
      }}>
        {fields.map(f => (
          <div key={f.label}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
