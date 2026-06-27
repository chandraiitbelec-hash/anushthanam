import { getAllPanchangam, getTodayPanchangam } from '@/lib/panchangam';
import PanchangamWidget from '@/components/PanchangamWidget';
import PanchangamUpcomingList from '@/components/PanchangamUpcomingList';
import Breadcrumb from '@/components/Breadcrumb';
import ClientLabel from '@/components/ClientLabel';

export const revalidate = 3600;

export default async function PanchangamPage() {
  const [today, all] = await Promise.all([
    getTodayPanchangam(),
    getAllPanchangam(),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Panchangam', labels: { te: 'పంచాంగం', ta: 'பஞ்சாங்கம்', hi: 'पंचांग' } }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        <ClientLabel labels={{ en: 'Panchangam', te: 'పంచాంగం', ta: 'பஞ்சாங்கம்', hi: 'पंचांग' }} />
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
            <ClientLabel labels={{ en: 'Today', te: 'ఈ రోజు', ta: 'இன்று', hi: 'आज' }} />
            {' — '}{new Date(today.date).toLocaleDateString('en-IN', {
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
            <ClientLabel labels={{ en: 'Upcoming', te: 'రాబోయేవి', ta: 'வரவிருப்பவை', hi: 'आगामी' }} />
          </h2>
          <PanchangamUpcomingList days={all.slice(0, 30)} />
        </section>
      )}
    </div>
  );
}
