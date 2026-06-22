import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getStoryBody, getStoryBodyFromSheet } from '@/lib/docs';
import { getStoriesForParent } from '@/lib/relations';
import type { Story, Festival, Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import StoryContent from '@/components/StoryContent';
import { pageMeta, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const LANGS = ['en', 'te', 'ta', 'hi'] as const;

export async function generateStaticParams() {
  const rows = await getPublished('stories_index');
  return (rows as unknown as Story[]).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index');
  const story = (rows as unknown as Story[]).find(s => s.slug === slug);
  if (!story) return { title: 'Anuṣṭhāna' };
  return pageMeta(story.title_en, story.brief_summary_en || '', `/stories/${slug}`, 'article');
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index');
  const story = (rows as unknown as Story[]).find(s => s.slug === slug);
  if (!story) notFound();

  const r = story as unknown as Record<string, string>;

  // Fetch all available language bodies in parallel.
  // Each lang only makes a Docs API call if a gdoc_id is populated.
  // 'en' falls back to sheet storage if no gdoc_id.
  const [langBodies, siblings, festivalRows, vrathamRows] = await Promise.all([
    Promise.all(
      LANGS.map(async l => {
        const gdocId = r[`gdoc_id_${l}`];
        if (gdocId) return [l, await getStoryBody(gdocId)] as const;
        // Fall back to stories_content Sheet for every language, not just English
        return [l, await getStoryBodyFromSheet(slug, l)] as const;
      })
    ).then(entries => Object.fromEntries(entries) as Record<string, string[]>),
    story.parent_slug ? getStoriesForParent(story.parent_slug) : Promise.resolve([]),
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

  // Summaries per language (fall back gracefully to empty)
  const summaries: Record<string, string> = Object.fromEntries(
    LANGS.map(l => [l, r[`brief_summary_${l}`] || ''])
  );

  // Resolve parent
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title_en,
    description: story.brief_summary_en,
    url: `${SITE_URL}/stories/${slug}`,
    inLanguage: 'en',
    genre: story.story_type,
    isPartOf: { '@type': 'WebSite', name: 'Anuṣṭhāna', url: SITE_URL },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Stories', href: '/stories' },
        ...(parent ? [{ label: parent.title_en, href: parent.href }] : []),
        { label: story.title_en },
      ]} />

      <StoryContent
        story={story}
        bodies={langBodies}
        summaries={summaries}
        parent={parent}
        parts={parts}
      />
    </div>
  );
}
