import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import { rowToGod } from '@/lib/relations';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gods & Goddesses',
  description: 'Browse Hindu deities — learn about Shiva, Vishnu, Devi, Ganesha and more. Shlokas, pujas, and stories for each deity.',
};

export default async function GodsPage() {
  const rows = await getPublished('gods').catch(() => []);
  const gods = rows.map(rowToGod);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Gods' }]} />
      <ListPageHeader
        titles={{ en: 'Gods & Goddesses', te: 'దేవతలు', ta: 'தேவர்கள்', hi: 'देवी-देवता' }}
        count={gods.length}
        countLabels={{ en: 'deities', te: 'దేవతలు', ta: 'தெய்வங்கள்', hi: 'देवता' }}
      />
      {gods.length === 0 ? (
        <EmptyState type="gods" />
      ) : (
        <div className="entity-grid">
          {gods.map(god => (
            <EntityCard
              key={god.slug}
              href={`/gods/${god.slug}`}
              names={{ en: god.name_en, te: god.name_te, ta: god.name_ta, hi: god.name_hi, sa: god.name_sa }}
              badge={god.tradition}
              badgeColor={
                god.tradition === 'shaiva' ? 'saffron' :
                god.tradition === 'vaishnava' ? 'green' : 'gold'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
