import { getPublished } from '@/lib/sheets';
import type { Story } from '@/lib/types';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

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
      <ListPageHeader
        titles={{ en: 'Stories & Kathas', te: 'కథలు & కథానాయకులు', ta: 'கதைகள் & கதாநாயகர்கள்', hi: 'कथाएं & कहानियां' }}
        count={stories.length}
        countLabels={{ en: 'stories', te: 'కథలు', ta: 'கதைகள்', hi: 'कहानियां' }}
      />

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
                names={{ en: s.title_en, te: s.title_te, ta: s.title_ta, hi: s.title_hi }}
                badgeColor="saffron"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
