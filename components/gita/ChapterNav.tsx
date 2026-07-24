'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import { localize } from '@/lib/localize';
import type { GitaChapter } from '@/lib/gita';
import type { Language } from '@/lib/types';

function chapterName(ch: GitaChapter, lang: Language) {
  return localize(ch, 'name', lang);
}

export default function ChapterNav({ prev, next }: { prev: GitaChapter | null; next: GitaChapter | null }) {
  const { lang } = useLang();
  const ui = UI[lang];
  const nameClass = scriptClass(lang);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      marginTop: '48px',
      paddingTop: '24px',
      borderTop: '1px solid var(--color-border)',
    }}>
      {prev ? (
        <Link href={`/bhagavad-gita/${prev.number}`} style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold-text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>← {ui.chapterLabel(prev.number)}</span>
          <span className={nameClass} style={{ fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined, fontSize: '17px', fontWeight: 600 }}>{chapterName(prev, lang)}</span>
        </Link>
      ) : <div />}

      {next ? (
        <Link href={`/bhagavad-gita/${next.number}`} style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          textAlign: 'right',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold-text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ui.chapterLabel(next.number)} →</span>
          <span className={nameClass} style={{ fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined, fontSize: '17px', fontWeight: 600 }}>{chapterName(next, lang)}</span>
        </Link>
      ) : <div />}
    </div>
  );
}
