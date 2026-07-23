import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getStoryBody, getStoryBodyFromSheet } from '@/lib/docs';
import { getStoriesForParent, rowToStory, rowToFestival, rowToVratham } from '@/lib/relations';
import Breadcrumb from '@/components/Breadcrumb';
import StoryContent from '@/components/StoryContent';
import { pageMeta, SITE_URL, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

const LANGS = ['en', 'te', 'ta', 'hi'] as const;

export async function generateStaticParams() {
  const rows = await getPublished('stories_index').catch(() => []);
  return rows.map(rowToStory).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished('stories_index');
    const story = rows.map(rowToStory).find(s => s.slug === slug);
    if (!story) return { title: 'Anuṣṭhāna' };
    return pageMeta(story.title_en, story.brief_summary_en || '', `/stories/${slug}`, 'article');
  } catch {
    return { title: 'Anuṣṭhāna' };
  }
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index').catch(() => []);
  const story = rows.map(rowToStory).find(s => s.slug === slug);
  if (!story) notFound();

  const r = story as unknown as Record<string, string>;

  // Fetch all available language bodies in parallel.
  // Each lang only makes a Docs API call if a gdoc_id is populated.
  // 'en' falls back to sheet storage if no gdoc_id.
  const [langBodies, siblings, festivalRows, vrathamRows] = await Promise.all([
    Promise.all(
      LANGS.map(async l => {
        const gdocId = r[`gdoc_id_${l}`];
        if (gdocId) return [l, await getStoryBody(gdocId).catch(() => [])] as const;
        // Fall back to stories_content Sheet for every language, not just English
        return [l, await getStoryBodyFromSheet(slug, l).catch(() => [])] as const;
      })
    ).then(entries => Object.fromEntries(entries) as Record<string, string[]>),
    (story.parent_slug ? getStoriesForParent(story.parent_slug) : Promise.resolve([])).catch(() => []),
    getPublished('festivals').catch(() => []),
    getPublished('vrathams').catch(() => []),
  ]);

  // Resolve parent — include all language variants for client-side rendering
  type ParentInfo = { title_en: string; title_te: string; title_ta: string; title_hi: string; href: string };
  let parent: ParentInfo | null = null;
  if (story.parent_slug) {
    if (story.parent_type === 'festival') {
      const f = festivalRows.map(rowToFestival).find(f => f.slug === story.parent_slug);
      if (f) parent = { title_en: f.title_en, title_te: f.title_te, title_ta: f.title_ta, title_hi: f.title_hi, href: `/festivals/${f.slug}` };
    } else if (story.parent_type === 'vratham') {
      const v = vrathamRows.map(rowToVratham).find(v => v.slug === story.parent_slug);
      if (v) parent = { title_en: v.title_en, title_te: v.title_te, title_ta: v.title_ta, title_hi: v.title_hi, href: `/vrathams/${v.slug}` };
    }
  }

  const parts = siblings.map(s => ({ slug: s.slug, title_en: s.title_en, title_te: s.title_te, title_ta: s.title_ta, title_hi: s.title_hi }));

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Stories', labels: { te: 'కథలు', ta: 'கதைகள்', hi: 'कथाएं' }, href: '/stories' },
        ...(parent ? [{ label: parent.title_en, labels: { te: parent.title_te, ta: parent.title_ta, hi: parent.title_hi }, href: parent.href }] : []),
        { label: story.title_en, labels: { te: story.title_te, ta: story.title_ta, hi: story.title_hi } },
      ]} />

      <StoryContent
        story={story}
        bodies={langBodies}
        parent={parent}
        parts={parts}
      />
    </div>
  );
}
