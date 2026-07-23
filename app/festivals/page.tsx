import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import { rowToFestival } from '@/lib/relations';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Festivals',
  description: 'Hindu festivals calendar — Diwali, Navratri, Ugadi, Pongal and more. Dates, significance, and related prayers.',
};

export default async function FestivalsPage() {
  const rows = await getPublished('festivals').catch(() => []);
  const festivals = rows.map(rowToFestival);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals' }]} />
      <ListPageHeader
        titles={{ en: 'Festivals', te: 'పండుగలు', ta: 'திருவிழாக்கள்', hi: 'त्योहार' }}
        count={festivals.length}
        countLabels={{ en: 'festivals', te: 'పండుగలు', ta: 'திருவிழாக்கள்', hi: 'त्योहार' }}
      />
      {festivals.length === 0 ? (
        <EmptyState type="festivals" />
      ) : (
        <div className="entity-grid">
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
      )}
    </div>
  );
}
