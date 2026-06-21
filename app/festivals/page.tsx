import { getPublished } from '@/lib/sheets';
import type { Festival } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export default async function FestivalsPage() {
  const rows = await getPublished('festivals');
  const festivals = rows as unknown as Festival[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals' }]} />
      <ListPageHeader
        titles={{ en: 'Festivals', te: 'పండుగలు', ta: 'திருவிழாக்கள்', hi: 'त्योहार' }}
        count={festivals.length}
        countLabels={{ en: 'festivals', te: 'పండుగలు', ta: 'திருவிழாக்கள்', hi: 'त्योहार' }}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {festivals.map(f => (
          <EntityCard
            key={f.slug}
            href={`/festivals/${f.slug}`}
            names={{ en: f.title_en, te: f.title_te, ta: f.title_ta, hi: f.title_hi }}
            badge={f.calendar_month || undefined}
            badgeColor="saffron"
          />
        ))}
      </div>
    </div>
  );
}
