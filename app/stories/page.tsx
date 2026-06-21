import Link from 'next/link';
import { getPublished } from '@/lib/sheets';
import type { Story, Festival, Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';

export const revalidate = 3600;

const STORY_TYPE_LABELS: Record<string, string> = {
  'vrata-katha': 'Vrata Katha', 'mahatmya': 'Mahatmya',
  'purana-story': 'Purana Story', 'sthala-purana': 'Sthala Purana',
};

export default async function StoriesPage() {
  const [storyRows, festivalRows, vrathamRows] = await Promise.all([
    getPublished('stories_index'),
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

  const stories = storyRows as unknown as Story[];
  const festivals = festivalRows as unknown as Festival[];
  const vrathams = vrathamRows as unknown as Vratham[];

  // Build parent title lookup
  type ParentInfo = { title_en: string; href: string };
  const parentMap: Record<string, ParentInfo> = {};
  festivals.forEach(f => { parentMap[f.slug] = { title_en: f.title_en, href: `/festivals/${f.slug}` }; });
  vrathams.forEach(v => { parentMap[v.slug] = { title_en: v.title_en, href: `/vrathams/${v.slug}` }; });

  // Group by parent
  const grouped: Record<string, Story[]> = {};
  const ungrouped: Story[] = [];
  stories.forEach(s => {
    if (s.parent_slug && parentMap[s.parent_slug]) {
      (grouped[s.parent_slug] ??= []).push(s);
    } else {
      ungrouped.push(s);
    }
  });

  // Order parents: festivals first, then vrathams
  const parentOrder = [
    ...festivals.map(f => f.slug),
    ...vrathams.map(v => v.slug),
  ].filter(slug => grouped[slug]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Stories' }]} />
      <ListPageHeader
        titles={{ en: 'Stories & Kathas', te: 'కథలు', ta: 'கதைகள்', hi: 'कथाएं' }}
        count={stories.length}
        countLabels={{ en: 'stories', te: 'కథలు', ta: 'கதைகள்', hi: 'कहानियां' }}
      />

      {parentOrder.map(parentSlug => {
        const list = grouped[parentSlug];
        const parent = parentMap[parentSlug];
        return (
          <section key={parentSlug} style={{ marginBottom: '48px' }}>
            {/* Parent heading links back to festival/vratham */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <Link href={parent.href} style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
              }}
              >
                {parent.title_en}
              </Link>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {list.length} {list.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {list.map((s, idx) => (
                <Link key={s.slug} href={`/stories/${s.slug}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
                >
                  <span style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    background: 'rgba(184,134,11,0.1)',
                    border: '1px solid var(--color-gold)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)',
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {s.title_en}
                  </span>
                  {s.story_type && (
                    <span style={{
                      flexShrink: 0,
                      fontSize: '11px', padding: '2px 8px',
                      background: 'rgba(212,98,42,0.08)',
                      border: '1px solid var(--color-saffron)',
                      borderRadius: '12px',
                      color: 'var(--color-saffron)', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {STORY_TYPE_LABELS[s.story_type] ?? s.story_type}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Fallback for stories without a parent */}
      {ungrouped.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
            Other Stories
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ungrouped.map(s => (
              <Link key={s.slug} href={`/stories/${s.slug}`} style={{
                padding: '14px 18px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px', fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}>
                {s.title_en}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
