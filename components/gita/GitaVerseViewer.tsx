'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LanguageContext';
import { useFontScale } from '@/context/FontScaleContext';
import FontSizeToggle from '@/components/FontSizeToggle';
import type { GitaVerse, GitaChapter } from '@/lib/gita';

// Primary recitation script per UI language
const PRIMARY_SCRIPT: Record<string, keyof GitaVerse> = {
  en: 'iast',
  te: 'script_te',
  ta: 'script_ta',
  hi: 'script_hi',
};

const SCRIPT_CLASS: Record<string, string> = {
  iast: 'script-iast',
  script_te: 'script-telugu',
  script_ta: 'script-tamil',
  script_hi: 'script-devanagari-serif',
  sanskrit: 'script-devanagari-serif',
};

const TOGGLE_LABELS: Record<string, { devanagari: string; iast: string; meaning: string }> = {
  en: { devanagari: 'Sanskrit', iast: 'IAST', meaning: 'Meaning' },
  te: { devanagari: 'Sanskrit', iast: 'IAST', meaning: 'అర్థం' },
  ta: { devanagari: 'Sanskrit', iast: 'IAST', meaning: 'பொருள்' },
  hi: { devanagari: 'Sanskrit', iast: 'IAST', meaning: 'अर्थ' },
};

function pill(active: boolean): React.CSSProperties {
  return {
    padding: '5px 14px',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
    background: active ? 'rgba(184,134,11,0.1)' : 'transparent',
    color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  };
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  flexShrink: 0,
};

function splitLines(text: string) {
  return text.split(/\s*\|\s*/).filter(l => l.trim().length > 0);
}

type Props = {
  verses: GitaVerse[];
  chapters?: GitaChapter[];
  currentChapter?: number;
};

export default function GitaVerseViewer({ verses, chapters, currentChapter }: Props) {
  const { lang } = useLang();
  const { scale } = useFontScale();
  const router = useRouter();
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [showIast, setShowIast] = useState(false);
  const [showMeaning, setShowMeaning] = useState(true);

  const primaryKey = PRIMARY_SCRIPT[lang] ?? 'iast';
  const labels = TOGGLE_LABELS[lang] ?? TOGGLE_LABELS.en;

  // For en, primary is already IAST so "extra" toggle is Sanskrit devanagari
  // For other langs, primary is native script so extras are Sanskrit + IAST
  const isEnglish = lang === 'en';

  function jumpToVerse(verseNumber: string) {
    if (!verseNumber) return;
    document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div style={{ '--content-font-scale': scale } as React.CSSProperties}>
      {/* Controls — sticky so chapter/verse jump and display toggles stay reachable while scrolling */}
      <div className="shloka-controls-bar" style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        position: 'sticky', top: 'var(--nav-height)', zIndex: 10,
        background: 'var(--color-bg)',
        padding: '10px 0',
        marginBottom: '24px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {chapters && currentChapter && (
          <select
            aria-label="Jump to chapter"
            value={currentChapter}
            onChange={e => router.push(`/bhagavad-gita/${e.target.value}`)}
            style={selectStyle}
          >
            {chapters.map(ch => (
              <option key={ch.number} value={ch.number}>Ch {ch.number}: {ch.name_en}</option>
            ))}
          </select>
        )}
        {verses.length > 0 && (
          <select
            aria-label="Jump to verse"
            defaultValue=""
            onChange={e => jumpToVerse(e.target.value)}
            style={selectStyle}
          >
            <option value="" disabled>Verse…</option>
            {verses.map(v => (
              <option key={v.verse} value={v.verse}>Verse {v.verse}</option>
            ))}
          </select>
        )}
        {!isEnglish && (
          <button aria-pressed={showSanskrit} onClick={() => setShowSanskrit(v => !v)} style={pill(showSanskrit)}>
            {labels.devanagari}
          </button>
        )}
        {!isEnglish && (
          <button aria-pressed={showIast} onClick={() => setShowIast(v => !v)} style={pill(showIast)}>
            {labels.iast}
          </button>
        )}
        {isEnglish && (
          <button aria-pressed={showSanskrit} onClick={() => setShowSanskrit(v => !v)} style={pill(showSanskrit)}>
            {labels.devanagari}
          </button>
        )}
        <button aria-pressed={showMeaning} onClick={() => setShowMeaning(v => !v)} style={pill(showMeaning)}>
          {labels.meaning}
        </button>
        <FontSizeToggle />
      </div>

      {/* Verses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {verses.map(v => {
          const primaryText = v[primaryKey] as string;
          const meaning = (v as unknown as Record<string, string>)[`meaning_${lang}`] || v.meaning_en;

          return (
            <div
              key={`${v.chapter}.${v.verse}`}
              id={`verse-${v.verse}`}
              style={{
                background: 'var(--color-surface)',
                borderLeft: '4px solid var(--color-gold)',
                borderRadius: '0 8px 8px 0',
                padding: '16px 20px',
                scrollMarginTop: 'calc(var(--nav-height) + 70px)',
              }}
            >
              {/* Verse number */}
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-gold)',
                margin: '0 0 12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {v.chapter}.{v.verse}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Primary script */}
                {primaryText && (
                  <div className={SCRIPT_CLASS[primaryKey as string]} style={{ lineHeight: lang === 'ta' ? 1.9 : lang === 'te' ? 1.8 : 1.7 }}>
                    {splitLines(primaryText).map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}

                {/* Sanskrit Devanagari toggle */}
                {showSanskrit && v.sanskrit && (
                  <div className={SCRIPT_CLASS.sanskrit} style={{ opacity: 0.8, lineHeight: 1.8 }}>
                    {splitLines(v.sanskrit).map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}

                {/* IAST toggle (for non-English) */}
                {showIast && !isEnglish && v.iast && (
                  <div className={SCRIPT_CLASS.iast} style={{ opacity: 0.75, lineHeight: 1.7 }}>
                    {splitLines(v.iast).map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}

                {/* Meaning */}
                {showMeaning && meaning && (
                  <div style={{
                    marginTop: '4px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: 'calc(14px * var(--content-font-scale, 1))',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.75,
                  }} className={
                    lang === 'te' ? 'script-telugu' :
                    lang === 'ta' ? 'script-tamil' :
                    lang === 'hi' ? 'script-devanagari' : ''
                  }>
                    {meaning}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
