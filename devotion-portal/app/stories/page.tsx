import { getPublished } from '@/lib/sheets';
import type { Story } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 3600;

export default async function StoriesPage() {
  const rows = await getPublished('stories_index');
  const stories = rows as unknown as Story[];

  const byType = stories.reduce<Record<string, Story[]>>((acc, s) => {
    (acc[s.story_type] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Stories' }]} />
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        Stories &amp; Kathas
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {stories.length} stories
      </p>

      {Object.entries(byType).map(([type, list]) => (
        <section key={type} style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-secondary)',
            margin: '0 0 16px',
          }}>
            {type.replace(/-/g, ' ')}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {list.map(s => (
              <EntityCard
                key={s.slug}
                href={`/stories/${s.slug}`}
                title={s.title_en}
                subtitle={s.brief_summary_en?.slice(0, 80) || undefined}
                badgeColor="saffron"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
