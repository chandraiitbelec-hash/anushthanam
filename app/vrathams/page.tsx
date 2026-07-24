import type { Metadata } from 'next';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { rowToVratham } from '@/lib/relations';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Vrathams & Vows',
  description: 'Hindu vrathams and religious vows — fasting days, observance days, and their significance with prayers and procedures.',
};

export default async function VrathamsPage() {
  const rows = await getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'vrathams', []));
  const vrathams = rows.map(rowToVratham);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Vrathams', labels: { te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' } }]} />
      <ListPageHeader
        titles={{ en: 'Vrathams & Vows', te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }}
        count={vrathams.length}
        countLabels={{ en: 'vrathams', te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }}
      />
      {vrathams.length === 0 ? (
        <EmptyState type="vrathams" />
      ) : (
        <div className="entity-grid entity-grid--3col">
          {vrathams.map(v => (
            <EntityCard
              key={v.slug}
              href={`/vrathams/${v.slug}`}
              names={{ en: v.title_en, te: v.title_te, ta: v.title_ta, hi: v.title_hi }}
              badge={v.duration || v.observance_day || undefined}
              badgeColor="green"
            />
          ))}
        </div>
      )}
    </div>
  );
}
