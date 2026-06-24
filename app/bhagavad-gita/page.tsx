import { getGitaChapters } from '@/lib/gita';
import Breadcrumb from '@/components/Breadcrumb';
import ChapterGrid from '@/components/gita/ChapterGrid';

export const metadata = {
  title: 'Bhagavad Gita — All 18 Chapters',
  description:
    'Complete Srimad Bhagavad Gita — all 701 slokas across 18 chapters with Sanskrit, Telugu, Tamil, Hindi meanings.',
};

export default function BhagavadGitaPage() {
  const chapters = getGitaChapters();

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Bhagavad Gita' }]} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
          lineHeight: 1.2,
        }}>
          Srimad Bhagavad Gita
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 6px',
          lineHeight: 1.6,
        }}>
          18 chapters · 701 slokas · Sanskrit with Telugu, Tamil, Hindi &amp; English
        </p>
      </div>

      <ChapterGrid chapters={chapters} />
    </div>
  );
}
