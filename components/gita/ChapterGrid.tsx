'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { GitaChapter } from '@/lib/gita';

const VERSE_LABEL: Record<string, string> = {
  en: 'verses', te: 'శ్లోకాలు', ta: 'வசனங்கள்', hi: 'श्लोक',
};

const CHAPTER_LABEL: Record<string, string> = {
  en: 'Chapter', te: 'అధ్యాయం', ta: 'அத்தியாயம்', hi: 'अध्याय',
};

export default function ChapterGrid({ chapters }: { chapters: GitaChapter[] }) {
  const { lang } = useLang();

  function chapterName(ch: GitaChapter) {
    return (ch as unknown as Record<string, string>)[`name_${lang}`] || ch.name_en;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '12px',
    }}>
      {chapters.map(ch => (
        <Link
          key={ch.number}
          href={`/bhagavad-gita/${ch.number}`}
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            textDecoration: 'none',
            alignItems: 'flex-start',
            transition: 'border-color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            flexShrink: 0,
            borderRadius: '8px',
            background: 'rgba(184,134,11,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-gold)',
          }}>
            {ch.number}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 2px', letterSpacing: '0.04em' }}>
              {CHAPTER_LABEL[lang] ?? 'Chapter'} {ch.number}
            </p>
            <p style={{
              fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
              fontSize: lang === 'en' ? '17px' : '15px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0 0 2px',
              lineHeight: 1.3,
            }} className={
              lang === 'te' ? 'script-telugu' :
              lang === 'ta' ? 'script-tamil' :
              lang === 'hi' ? 'script-devanagari' : ''
            }>
              {chapterName(ch)}
            </p>
            {lang !== 'en' && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px', lineHeight: 1.3 }}>
                {ch.name_en}
              </p>
            )}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {ch.verse_count} {VERSE_LABEL[lang] ?? 'verses'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
