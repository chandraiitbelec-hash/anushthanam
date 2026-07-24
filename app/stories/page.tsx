import Link from 'next/link';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { rowToStory, rowToFestival, rowToVratham } from '@/lib/relations';
import type { Story } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import ClientLabel from '@/components/ClientLabel';

export const revalidate = 3600;

export const metadata = {
  title: 'Stories & Kathas',
  description: 'Vrata kathas, puranic stories, and sthala puranas — read sacred stories associated with Hindu festivals, vrathams, and deities.',
};

const STORY_TYPE_LABELS: Record<string, string> = {
  'vrata-katha': 'Vrata Katha', 'mahatmya': 'Mahatmya',
  'purana-story': 'Purana Story', 'sthala-purana': 'Sthala Purana',
};

export default async function StoriesPage() {
  const [storyRows, festivalRows, vrathamRows] = await Promise.all([
    getPublished(TABS.stories_index).catch(emptyOnError(TABS.stories_index, 'stories', [])),
    getPublished(TABS.festivals).catch(emptyOnError(TABS.festivals, 'stories', [])),
    getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'stories', [])),
  ]);

  const stories = storyRows.map(rowToStory);
  const festivals = festivalRows.map(rowToFestival);
  const vrathams = vrathamRows.map(rowToVratham);

  // Build parent title lookup — keyed by `${parent_type}-${parent_slug}` to avoid
  // collisions when a festival and a vratham share the same slug (e.g. "maha-shivaratri").
  type ParentInfo = { title_en: string; title_te: string; title_ta: string; title_hi: string; href: string };
  const parentMap: Record<string, ParentInfo> = {};
  festivals.forEach(f => { parentMap[`festival-${f.slug}`] = { title_en: f.title_en, title_te: f.title_te, title_ta: f.title_ta, title_hi: f.title_hi, href: `/festivals/${f.slug}` }; });
  vrathams.forEach(v => { parentMap[`vratham-${v.slug}`] = { title_en: v.title_en, title_te: v.title_te, title_ta: v.title_ta, title_hi: v.title_hi, href: `/vrathams/${v.slug}` }; });

  // Group by composite key so same-slug festival+vratham pairs stay separate
  const grouped: Record<string, Story[]> = {};
  const ungrouped: Story[] = [];
  stories.forEach(s => {
    const key = s.parent_type && s.parent_slug ? `${s.parent_type}-${s.parent_slug}` : null;
    if (key && parentMap[key]) {
      (grouped[key] ??= []).push(s);
    } else {
      ungrouped.push(s);
    }
  });

  // Order parents: festivals first, then vrathams
  const parentOrder = [
    ...festivals.map(f => `festival-${f.slug}`),
    ...vrathams.map(v => `vratham-${v.slug}`),
  ].filter(key => grouped[key]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Stories', labels: { te: 'కథలు', ta: 'கதைகள்', hi: 'कथाएं' } }]} />
      <ListPageHeader
        titles={{ en: 'Stories & Kathas', te: 'కథలు', ta: 'கதைகள்', hi: 'कथाएं' }}
        count={stories.length}
        countLabels={{ en: 'stories', te: 'కథలు', ta: 'கதைகள்', hi: 'कहानियां' }}
      />

      {parentOrder.map(parentKey => {
        const list = grouped[parentKey];
        const parent = parentMap[parentKey];
        return (
          <section key={parentKey} style={{ marginBottom: '48px' }}>
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
                <ClientLabel labels={{ en: parent.title_en, te: parent.title_te || parent.title_en, ta: parent.title_ta || parent.title_en, hi: parent.title_hi || parent.title_en }} />
              </Link>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {list.length} <ClientLabel labels={{ en: list.length === 1 ? 'story' : 'stories', te: 'కథలు', ta: 'கதைகள்', hi: 'कथाएं' }} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {list.map((s, idx) => (
                <Link key={s.slug} href={`/stories/${s.slug}`} className="story-row" style={{
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
                    fontSize: '12px', fontWeight: 700, color: 'var(--color-gold-text)',
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    <ClientLabel labels={{ en: s.title_en, te: s.title_te || s.title_en, ta: s.title_ta || s.title_en, hi: s.title_hi || s.title_en }} />
                  </span>
                  {s.story_type && (
                    <span style={{
                      flexShrink: 0,
                      fontSize: '11px', padding: '2px 8px',
                      background: 'rgba(212,98,42,0.08)',
                      border: '1px solid var(--color-saffron)',
                      borderRadius: '12px',
                      color: 'var(--color-saffron-text)', fontWeight: 600,
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
            <ClientLabel labels={{ en: 'Other Stories', te: 'ఇతర కథలు', ta: 'பிற கதைகள்', hi: 'अन्य कथाएं' }} />
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ungrouped.map(s => (
              <Link key={s.slug} href={`/stories/${s.slug}`} className="story-row" style={{
                padding: '14px 18px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px', fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}>
                <ClientLabel labels={{ en: s.title_en, te: s.title_te || s.title_en, ta: s.title_ta || s.title_en, hi: s.title_hi || s.title_en }} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
