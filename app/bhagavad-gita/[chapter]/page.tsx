import { notFound } from 'next/navigation';
import { getGitaChapter, getGitaChapters, getGitaVersesByChapter } from '@/lib/gita';
import Breadcrumb from '@/components/Breadcrumb';
import ClientLabel from '@/components/ClientLabel';
import GitaVerseViewer from '@/components/gita/GitaVerseViewer';
import ChapterNav from '@/components/gita/ChapterNav';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getGitaChapters().map(ch => ({ chapter: String(ch.number) }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }) {
  try {
    const { chapter } = await params;
    const ch = getGitaChapter(parseInt(chapter));
    if (!ch) return { title: 'Bhagavad Gita' };
    return {
      title: `Chapter ${ch.number}: ${ch.name_en} — Bhagavad Gita`,
      description: `${ch.verse_count} slokas of Bhagavad Gita Chapter ${ch.number}: ${ch.name_en} (${ch.name_hi}) with Sanskrit, Telugu, Tamil, Hindi meanings.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`CONTENT ERROR [bhagavad-gita/[chapter]#generateMetadata]: ${message}`);
    return { title: 'Bhagavad Gita' };
  }
}

export default async function GitaChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const num = parseInt(chapter);
  const ch = getGitaChapter(num);
  if (!ch) notFound();

  const verses = getGitaVersesByChapter(num);
  const chapters = getGitaChapters();
  const prev = num > 1 ? getGitaChapter(num - 1) : null;
  const next = num < 18 ? getGitaChapter(num + 1) : null;

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Bhagavad Gita', labels: { te: 'భగవద్గీత', ta: 'பகவத் கீதை', hi: 'भगवद्गीता' }, href: '/bhagavad-gita' },
        { label: `Chapter ${ch.number}`, labels: { te: `అధ్యాయం ${ch.number}`, ta: `அத்தியாயம் ${ch.number}`, hi: `अध्याय ${ch.number}` } },
      ]} />

      {/* Chapter header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-gold-text)',
          margin: '0 0 6px',
        }}>
          <ClientLabel labels={{
            en: `Chapter ${ch.number} of 18`,
            te: `18లో ${ch.number}వ అధ్యాయం`,
            ta: `18இல் ${ch.number}வது அத்தியாயம்`,
            hi: `18 में से अध्याय ${ch.number}`,
          }} />
        </p>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(24px, 4vw, 38px)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
          lineHeight: 1.2,
        }}>
          {ch.name_en}
        </h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'baseline', marginTop: '6px' }}>
          <span className="script-devanagari" style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
            {ch.name_hi}
          </span>
          <span className="script-telugu" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {ch.name_te}
          </span>
          <span className="script-tamil" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {ch.name_ta}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '10px 0 0' }}>
          <ClientLabel labels={{
            en: `${ch.verse_count} verses`,
            te: `${ch.verse_count} శ్లోకాలు`,
            ta: `${ch.verse_count} ஸ்லோகங்கள்`,
            hi: `${ch.verse_count} श्लोक`,
          }} />
        </p>
      </div>

      <GitaVerseViewer verses={verses} chapters={chapters} currentChapter={num} />

      <ChapterNav prev={prev ?? null} next={next ?? null} />
    </div>
  );
}
