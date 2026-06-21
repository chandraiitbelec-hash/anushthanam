import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getStoryBody, getStoryBodyFromSheet } from '@/lib/docs';
import { getStoriesForParent } from '@/lib/relations';
import type { Story, Festival, Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import StoryReader from '@/components/StoryReader';
import StoryPartPicker from '@/components/StoryPartPicker';

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

  const [paragraphs, siblings, festivalRows, vrathamRows] = await Promise.all([
    story.gdoc_id_en ? getStoryBody(story.gdoc_id_en) : getStoryBodyFromSheet(slug, 'en'),
    story.parent_slug ? getStoriesForParent(story.parent_slug) : Promise.resolve([]),
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

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

  const parts = (siblings as unknown as Story[]).map(s => ({ slug: s.slug, title_en: s.title_en }));

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Stories', href: '/stories' },
        ...(parent ? [{ label: parent.title_en, href: parent.href }] : []),
        { label: story.title_en },
      ]} />

      <div style={{ marginBottom: '24px' }}>
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
          margin: '0 0 12px',
        }}>
          {story.title_en}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
          <StoryPartPicker parts={parts} currentSlug={slug} />
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
    </div>
  );
}
