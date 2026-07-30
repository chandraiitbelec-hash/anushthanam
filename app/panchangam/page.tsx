import { getAllPanchangam, getTodayPanchangam, getNextPanchangam } from '@/lib/panchangam';
import { emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import PanchangamWidget from '@/components/PanchangamWidget';
import PanchangamEmptyState from '@/components/PanchangamEmptyState';
import PanchangamUpcomingList from '@/components/PanchangamUpcomingList';
import Breadcrumb from '@/components/Breadcrumb';
import ClientLabel from '@/components/ClientLabel';
import { pageMeta } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = pageMeta(
  'Panchangam',
  'Daily Hindu panchangam — tithi, nakshatra, yoga, karana, sunrise and sunset times.',
  '/panchangam'
);

export default async function PanchangamPage() {
  const [today, all, next] = await Promise.all([
    getTodayPanchangam().catch(emptyOnError(TABS.panchangam, 'panchangam', null)),
    getAllPanchangam().catch(emptyOnError(TABS.panchangam, 'panchangam', [])),
    getNextPanchangam().catch(emptyOnError(TABS.panchangam, 'panchangam', null)),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Panchangam', labels: { te: 'పంచాంగం', ta: 'பஞ்சாங்கம்', hi: 'पंचांग' } }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-h1-page)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        <ClientLabel labels={{ en: 'Panchangam', te: 'పంచాంగం', ta: 'பஞ்சாங்கம்', hi: 'पंचांग' }} />
      </h1>

      <section style={{ marginBottom: '40px' }}>
        {today ? (
          <>
            <h2 style={{
              fontSize: 'var(--text-label)',
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
          </>
        ) : (
          <PanchangamEmptyState nextDate={next?.date ?? null} />
        )}
      </section>

      {all.length > 0 && (
        <section>
          <h2 style={{
            fontSize: 'var(--text-label)',
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
