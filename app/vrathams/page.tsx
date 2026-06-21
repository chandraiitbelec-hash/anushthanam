import { getPublished } from '@/lib/sheets';
import type { Vratham } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function VrathamsPage() {
  const rows = await getPublished('vrathams');
  const vrathams = rows as unknown as Vratham[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Vrathams' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Vrathams &amp; Vows
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {vrathams.length} vrathams
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {vrathams.map(v => (
          <EntityCard
            key={v.slug}
            href={`/vrathams/${v.slug}`}
            title={v.title_en}
            subtitle={v.title_te || v.title_ta}
            badge={v.duration || v.observance_day || undefined}
            badgeColor="green"
          />
        ))}
      </div>
    </div>
  );
}
