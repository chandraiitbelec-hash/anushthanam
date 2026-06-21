import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getStoryBody, getStoryBodyFromSheet } from '@/lib/docs';
import { getStoriesForParent } from '@/lib/relations';
import type { Story, Festival, Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import StoryReader from '@/components/StoryReader';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('stories_index');
  return (rows as unknown as Story[]).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index');
  const story = (rows as unknown as Story[]).find(s => s.slug === slug);
  return { title: story ? `${story.title_en} | Anuṣṭhāna` : 'Anuṣṭhāna' };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index');
  const story = (rows as unknown as Story[]).find(s => s.slug === slug);
  if (!story) notFound();

  // Fetch paragraphs + parent info + siblings in parallel
  const [paragraphs, siblings, festivalRows, vrathamRows] = await Promise.all([
    story.gdoc_id_en ? getStoryBody(story.gdoc_id_en) : getStoryBodyFromSheet(slug, 'en'),
    story.parent_slug ? getStoriesForParent(story.parent_slug) : Promise.resolve([]),
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

  // Resolve parent title + href
  type ParentInfo = { title_en: string; href: string };
  let parent: ParentInfo | null = null;
  if (story.parent_slug) {
    if (story.parent_type === 'festival') {
      const f = (festivalRows as unknown as Festival[]).find(f => f.slug === story.parent_slug);
      if (f) parent = { title_en: f.title_en, href: `/festivals/${f.slug}` };
    } else if (story.parent_type === 'vratham') {
      const v = (vrathamRows as unknown as Vratham[]).find(v => v.slug === story.parent_slug);
      if (v) parent = { title_en: v.title_en, href: `/vrathams/${v.slug}` };
    }
  }

  const siblingList = (siblings as unknown as Story[]).filter(s => s.slug !== slug);
  const currentIndex = (siblings as unknown as Story[]).findIndex(s => s.slug === slug);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Stories', href: '/stories' },
        ...(parent ? [{ label: parent.title_en, href: parent.href }] : []),
        { label: story.title_en },
      ]} />

      <div style={{ marginBottom: '24px' }}>
        {/* Parent back-link */}
        {parent && (
          <Link href={parent.href} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '13px', color: 'var(--color-gold)', fontWeight: 500,
            textDecoration: 'none', marginBottom: '12px',
          }}>
            ← {parent.title_en}
          </Link>
        )}

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {story.title_en}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {story.story_type && (
            <span style={{
              padding: '3px 10px',
              background: 'rgba(212,98,42,0.1)',
              border: '1px solid var(--color-saffron)',
              borderRadius: '20px',
              fontSize: '12px', color: 'var(--color-saffron)', fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {story.story_type.replace(/-/g, ' ')}
            </span>
          )}
          {currentIndex >= 0 && siblings.length > 1 && (
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Part {currentIndex + 1} of {siblings.length}
            </span>
          )}
        </div>
      </div>

      {story.reading_instruction_en && (
        <p style={{
          fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic',
          margin: '0 0 24px', padding: '12px 16px',
          background: 'var(--color-surface)', borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}>
          {story.reading_instruction_en}
        </p>
      )}

      <StoryReader summary={story.brief_summary_en || ''} paragraphs={paragraphs} />

      {/* Sibling stories (other parts of the same festival/vratham) */}
      {siblingList.length > 0 && (
        <section style={{ marginTop: '48px', borderTop: '1px solid var(--color-border)', paddingTop: '32px' }}>
          <h2 style={{
            fontSize: '13px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 16px',
          }}>
            More from {parent?.title_en ?? 'this collection'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(siblings as unknown as Story[]).map((s, idx) => (
              <Link key={s.slug} href={`/stories/${s.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                background: s.slug === slug ? 'rgba(184,134,11,0.06)' : 'var(--color-surface)',
                border: `1px solid ${s.slug === slug ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                textDecoration: 'none',
                opacity: s.slug === slug ? 1 : 0.85,
              }}>
                <span style={{
                  width: '24px', height: '24px', flexShrink: 0,
                  background: s.slug === slug ? 'var(--color-gold)' : 'rgba(184,134,11,0.1)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  color: s.slug === slug ? '#fff' : 'var(--color-gold)',
                }}>
                  {idx + 1}
                </span>
                <span style={{
                  fontSize: '14px', fontWeight: s.slug === slug ? 600 : 400,
                  color: 'var(--color-text-primary)',
                }}>
                  {s.title_en}
                  {s.slug === slug && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}> — reading now</span>}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
