import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { Festival } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Festivals | Anushthanam',
  description: 'Hindu festivals calendar — Diwali, Navratri, Ugadi, Pongal and more. Dates, significance, and related prayers.',
};

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
      {festivals.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 16px' }}>🪔</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>No festivals published yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Festival listings will appear here once published from the content management system.</p>
        </div>
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
