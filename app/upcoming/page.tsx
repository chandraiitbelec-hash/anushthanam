import Link from 'next/link';
import { getUpcoming } from '@/lib/relations';
import { getTodayPanchangam } from '@/lib/panchangam';
import PanchangamWidget from '@/components/PanchangamWidget';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function UpcomingPage() {
  const [items, today] = await Promise.all([
    getUpcoming(20),
    getTodayPanchangam(),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Upcoming' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        Upcoming
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
            Today's Panchangam
          </h2>
          <PanchangamWidget day={today} compact />
        </section>
      )}

      <section>
        <h2 style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-secondary)',
          margin: '0 0 16px',
        }}>
          Festivals &amp; Vrathams
        </h2>

        {items.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            No upcoming events. Check back soon.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(item => (
              <Link
                key={`${item.type}-${item.slug}`}
                href={`/${item.type === 'festival' ? 'festivals' : 'vrathams'}/${item.slug}`}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '72px', flexShrink: 0, textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase' }}>
                    {new Date(item.next_occurrence).toLocaleDateString('en-IN', { month: 'short' })}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: 1,
                  }}>
                    {new Date(item.next_occurrence).getDate()}
                  </p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                    {item.title_en}
                  </p>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: item.type === 'festival' ? 'rgba(212,98,42,0.1)' : 'rgba(61,107,79,0.1)',
                    color: item.type === 'festival' ? 'var(--color-saffron)' : 'var(--color-green)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {item.type}
                  </span>
                </div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
