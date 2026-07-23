import { getUpcoming } from '@/lib/relations';
import { getTodayPanchangam } from '@/lib/panchangam';
import PanchangamWidget from '@/components/PanchangamWidget';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import UpcomingList from '@/components/UpcomingList';
import ClientLabel from '@/components/ClientLabel';

export const revalidate = 3600;

export const metadata = {
  title: 'Upcoming',
  description: 'Upcoming Hindu festivals and vrathams — dates, tithi, and panchangam details for festivals and observances.',
};

export default async function UpcomingPage() {
  const [items, today] = await Promise.all([
    getUpcoming().catch(() => []),
    getTodayPanchangam().catch(() => null),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Upcoming' }]} />

      <ListPageHeader
        titles={{ en: 'Upcoming', te: 'రాబోయేవి', ta: 'வரவிருக்கும்', hi: 'आगामी' }}
        count={items.length}
        countLabels={{ en: 'events', te: 'కార్యక్రమాలు', ta: 'நிகழ்வுகள்', hi: 'कार्यक्रम' }}
      />

      {today && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            <ClientLabel labels={{ en: "Today's Panchangam", te: 'ఈరోజు పంచాంగం', ta: 'இன்றைய பஞ்சாங்கம்', hi: 'आज का पंचांग' }} />
          </h2>
          <PanchangamWidget day={today} compact />
        </section>
      )}

      <UpcomingList items={items} />
    </div>
  );
}
