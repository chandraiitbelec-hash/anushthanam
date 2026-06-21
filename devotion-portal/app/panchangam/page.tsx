import { getAllPanchangam, getTodayPanchangam } from '@/lib/panchangam';
import PanchangamWidget from '@/components/PanchangamWidget';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function PanchangamPage() {
  const [today, all] = await Promise.all([
    getTodayPanchangam(),
    getAllPanchangam(),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Panchangam' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        Panchangam
      </h1>

      {today && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            Today — {new Date(today.date).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </h2>
          <PanchangamWidget day={today} />
        </section>
      )}

      {all.length > 0 && (
        <section>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
          }}>
            Upcoming
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {all.slice(0, 30).map(day => (
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
                    {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
                    {day.paksha} {day.tithi_en} · {day.nakshatra_en}
                  </p>
                  {day.special_event_en && (
                    <p style={{ fontSize: '13px', color: 'var(--color-saffron)', fontWeight: 500, margin: 0 }}>
                      {day.special_event_en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
