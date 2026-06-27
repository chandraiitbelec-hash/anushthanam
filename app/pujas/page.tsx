import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { Puja } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pujas | Anushthanam',
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
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 16px' }}>🪷</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>No pujas published yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Puja guides will appear here once published from the content management system.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
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
