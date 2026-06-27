import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import type { God } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gods & Goddesses | Anushthanam',
  description: 'Browse Hindu deities — learn about Shiva, Vishnu, Devi, Ganesha and more. Shlokas, pujas, and stories for each deity.',
};

export default async function GodsPage() {
  const rows = await getPublished('gods');
  const gods = rows as unknown as God[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Gods' }]} />
      <ListPageHeader
        titles={{ en: 'Gods & Goddesses', te: 'దేవతలు', ta: 'தேவர்கள்', hi: 'देवी-देवता' }}
        count={gods.length}
        countLabels={{ en: 'deities', te: 'దేవతలు', ta: 'தெய்வங்கள்', hi: 'देवता' }}
      />
      {gods.length === 0 ? (
        <div style={{ padding: '64px 32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '36px', margin: '0 0 16px' }}>🕉</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>No deities published yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Gods and goddesses will appear here once published from the content management system.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
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
