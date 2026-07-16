import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { Puja } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pujas',
  description: 'Hindu puja guides — step-by-step procedures, materials required, and shlokas for home worship rituals.',
};

export default async function PujasPage() {
  const rows = await getPublished('pujas');
  const pujas = rows as unknown as Puja[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Pujas' }]} />
      <ListPageHeader
        titles={{ en: 'Pujas', te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजा' }}
        count={pujas.length}
        countLabels={{ en: 'pujas', te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजा' }}
      />
      {pujas.length === 0 ? (
        <EmptyState type="pujas" />
      ) : (
        <div className="entity-grid">
          {pujas.map(p => (
            <EntityCard
              key={p.slug}
              href={`/pujas/${p.slug}`}
              names={{ en: p.title_en, te: p.title_te, ta: p.title_ta, hi: p.title_hi }}
              badge={p.duration_minutes ? `${p.duration_minutes} min` : undefined}
              badgeColor="gold"
            />
          ))}
        </div>
      )}
    </div>
  );
}
