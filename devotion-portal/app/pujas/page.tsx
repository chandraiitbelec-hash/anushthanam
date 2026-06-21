import { getPublished } from '@/lib/sheets';
import type { Puja } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function PujasPage() {
  const rows = await getPublished('pujas');
  const pujas = rows as unknown as Puja[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Pujas' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Pujas
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {pujas.length} pujas
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {pujas.map(p => (
          <EntityCard
            key={p.slug}
            href={`/pujas/${p.slug}`}
            title={p.title_en}
            subtitle={p.title_te || p.title_ta}
            badge={p.duration_minutes ? `${p.duration_minutes} min` : undefined}
            badgeColor="gold"
          />
        ))}
      </div>
    </div>
  );
}
