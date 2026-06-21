import { getPublished } from '@/lib/sheets';
import type { God } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function GodsPage() {
  const rows = await getPublished('gods');
  const gods = rows as unknown as God[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Gods' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Gods &amp; Goddesses
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {gods.length} deities
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {gods.map(god => (
          <EntityCard
            key={god.slug}
            href={`/gods/${god.slug}`}
            title={god.name_en}
            subtitle={god.name_te || god.name_sa}
            badge={god.tradition}
            badgeColor={
              god.tradition === 'shaiva' ? 'saffron' :
              god.tradition === 'vaishnava' ? 'green' : 'gold'
            }
          />
        ))}
      </div>
    </div>
  );
}
