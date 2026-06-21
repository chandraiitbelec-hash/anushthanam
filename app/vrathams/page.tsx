import { getPublished } from '@/lib/sheets';
import type { Vratham } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export default async function VrathamsPage() {
  const rows = await getPublished('vrathams');
  const vrathams = rows as unknown as Vratham[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Vrathams' }]} />
      <ListPageHeader
        titles={{ en: 'Vrathams & Vows', te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }}
        count={vrathams.length}
        countLabels={{ en: 'vrathams', te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }}
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
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
    </div>
  );
}
