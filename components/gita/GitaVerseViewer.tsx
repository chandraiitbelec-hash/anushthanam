'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { GitaVerse } from '@/lib/gita';

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
  script_hi: 'script-devanagari',
  sanskrit: 'script-devanagari',
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

function splitLines(text: string) {
  return text.split(/\s*\|\s*/).filter(l => l.trim().length > 0);
}

export default function GitaVerseViewer({ verses }: { verses: GitaVerse[] }) {
  const { lang } = useLang();
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [showIast, setShowIast] = useState(false);
  const [showMeaning, setShowMeaning] = useState(true);

  const primaryKey = PRIMARY_SCRIPT[lang] ?? 'iast';
  const labels = TOGGLE_LABELS[lang] ?? TOGGLE_LABELS.en;

  // For en, primary is already IAST so "extra" toggle is Sanskrit devanagari
  // For other langs, primary is native script so extras are Sanskrit + IAST
  const isEnglish = lang === 'en';

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
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
                    fontSize: '14px',
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
