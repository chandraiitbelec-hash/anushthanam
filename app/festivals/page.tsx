import { getPublished } from '@/lib/sheets';
import type { Festival } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function FestivalsPage() {
  const rows = await getPublished('festivals');
  const festivals = rows as unknown as Festival[];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Festivals
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {festivals.length} festivals
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {festivals.map(f => (
          <EntityCard
            key={f.slug}
            href={`/festivals/${f.slug}`}
            title={f.title_en}
            subtitle={f.title_te || f.title_ta}
            badge={f.calendar_month || undefined}
            badgeColor="saffron"
          />
        ))}
      </div>
    </div>
  );
}
