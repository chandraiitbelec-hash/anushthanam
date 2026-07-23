'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';

type Props = { chapterCount: number; verseCount: number };

export default function GitaIndexHero({ chapterCount, verseCount }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];
  const nameClass = scriptClass(lang);

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1 className={nameClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
        fontSize: 'clamp(28px, 5vw, 42px)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
        lineHeight: 1.2,
      }}>
        {ui.gitaTitle}
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'var(--color-text-secondary)',
        margin: '0 0 6px',
        lineHeight: 1.6,
      }}>
        {ui.gitaHeroSubtitle(chapterCount, verseCount)}
      </p>
    </div>
  );
}
