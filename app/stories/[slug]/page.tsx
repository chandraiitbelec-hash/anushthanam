import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getStoryBody, getStoryBodyFromSheet } from '@/lib/docs';
import type { Story } from '@/lib/types';
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
  return { title: story ? `${story.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('stories_index');
  const story = (rows as unknown as Story[]).find(s => s.slug === slug);
  if (!story) notFound();

  // Read paragraphs: prefer gdoc_id, fall back to Sheet storage
  const paragraphs = story.gdoc_id_en
    ? await getStoryBody(story.gdoc_id_en)
    : await getStoryBodyFromSheet(slug, 'en');

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Stories', href: '/stories' }, { label: story.title_en }]} />

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {story.title_en}
        </h1>
        {story.story_type && (
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            background: 'rgba(212,98,42,0.1)',
            border: '1px solid var(--color-saffron)',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--color-saffron)',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {story.story_type.replace(/-/g, ' ')}
          </span>
        )}
      </div>

      {story.reading_instruction_en && (
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          margin: '0 0 24px',
          padding: '12px 16px',
          background: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}>
          {story.reading_instruction_en}
        </p>
      )}

      <StoryReader
        summary={story.brief_summary_en || ''}
        paragraphs={paragraphs}
      />
    </div>
  );
}
