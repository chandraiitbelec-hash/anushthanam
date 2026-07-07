import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { Vratham } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Vrathams & Vows | Anushthanam',
  description: 'Hindu vrathams and religious vows — fasting days, observance days, and their significance with prayers and procedures.',
};

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
      {vrathams.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 16px' }}>🙏</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>No vrathams published yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Vow and fasting guides will appear here once published from the content management system.</p>
        </div>
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
