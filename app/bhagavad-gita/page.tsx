import { getGitaChapters } from '@/lib/gita';
import Breadcrumb from '@/components/Breadcrumb';
import ChapterGrid from '@/components/gita/ChapterGrid';
import GitaIndexHero from '@/components/gita/GitaIndexHero';

export const metadata = {
  title: 'Bhagavad Gita — All 18 Chapters',
  description:
    'Complete Srimad Bhagavad Gita — all 701 slokas across 18 chapters with Sanskrit, Telugu, Tamil, Hindi meanings.',
};

export default function BhagavadGitaPage() {
  const chapters = getGitaChapters();
  const verseCount = chapters.reduce((sum, ch) => sum + ch.verse_count, 0);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{
        label: 'Bhagavad Gita',
        labels: { te: 'భగవద్గీత', ta: 'பகவத் கீதை', hi: 'भगवद्गीता' },
      }]} />

      <GitaIndexHero chapterCount={chapters.length} verseCount={verseCount} />

      <ChapterGrid chapters={chapters} />
    </div>
  );
}
