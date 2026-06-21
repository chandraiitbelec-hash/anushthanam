'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { splitStanzaLines } from '@/lib/utils';
import type { ShlokaStanza, ScriptLayer } from '@/lib/types';

// Map UI language → primary recitation script
const LANG_TO_SCRIPT: Record<string, ScriptLayer> = {
  en: 'roman_iast',
  te: 'script_telugu',
  ta: 'script_tamil',
  hi: 'script_devanagari',
};

const SCRIPT_CLASS: Record<ScriptLayer, string> = {
  script_devanagari: 'script-devanagari',
  script_telugu: 'script-telugu',
  script_tamil: 'script-tamil',
  roman_iast: 'script-iast',
};

const MEANING_LABEL: Record<string, string> = {
  en: 'Meaning', te: 'అర్థం', ta: 'பொருள்', hi: 'अर्थ',
};

const IAST_LABEL: Record<string, string> = {
  en: 'देवनागरी', te: 'IAST', ta: 'IAST', hi: 'IAST',
};

export default function ShlokaViewer({ stanzas }: { stanzas: ShlokaStanza[] }) {
  const { lang } = useLang();
  const [showExtra, setShowExtra] = useState(false);
  const [showMeaning, setShowMeaning] = useState(true);

  const primaryScript = LANG_TO_SCRIPT[lang] ?? 'roman_iast';
  // For English the primary is already IAST, so the extra is Devanagari; for others it's IAST
  const extraScript: ScriptLayer = lang === 'en' ? 'script_devanagari' : 'roman_iast';

  const meaningField = `meaning_${lang}` as keyof ShlokaStanza;
  const hasMeaning = stanzas.some(s => Boolean(s[meaningField]));

  function pill(active: boolean, accent: 'gold' | 'saffron') {
    const color = accent === 'gold' ? 'var(--color-gold)' : 'var(--color-saffron)';
    const bg = accent === 'gold' ? 'rgba(184,134,11,0.1)' : 'rgba(212,98,42,0.1)';
    return {
      padding: '6px 14px',
      borderRadius: '20px',
      border: `1px solid ${active ? color : 'var(--color-border)'}`,
      background: active ? bg : 'transparent',
      color: active ? color : 'var(--color-text-secondary)',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
    } as React.CSSProperties;
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button onClick={() => setShowExtra(v => !v)} style={pill(showExtra, 'gold')}>
          {IAST_LABEL[lang] ?? 'IAST'}
        </button>
        {hasMeaning && (
          <button onClick={() => setShowMeaning(v => !v)} style={pill(showMeaning, 'saffron')}>
            {MEANING_LABEL[lang] ?? 'Meaning'}
          </button>
        )}
      </div>

      {/* Stanzas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {stanzas.map((stanza) => {
          const primaryText = stanza[primaryScript as keyof ShlokaStanza] as string;
          const extraText = stanza[extraScript as keyof ShlokaStanza] as string;
          const meaningText = stanza[meaningField] as string;

          return (
            <div key={stanza.stanza_number} style={{
              background: 'var(--color-surface)',
              borderLeft: '4px solid var(--color-gold)',
              borderRadius: '0 8px 8px 0',
              padding: '16px 20px',
            }}>
              {stanza.stanza_label && (
                <p style={{
                  fontSize: '12px', fontWeight: 500, color: 'var(--color-gold)',
                  margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {stanza.stanza_label}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {primaryText && (
                  <div className={SCRIPT_CLASS[primaryScript]}>
                    {splitStanzaLines(primaryText).map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}

                {showExtra && extraText && (
                  <div className={SCRIPT_CLASS[extraScript]} style={{ opacity: 0.75 }}>
                    {splitStanzaLines(extraText).map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                )}

                {showMeaning && meaningText && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                  }}>
                    {meaningText}
                  </div>
                )}
              </div>

              {stanza.notes_en && (
                <p style={{
                  fontSize: '12px', color: 'var(--color-text-secondary)',
                  margin: '8px 0 0', fontStyle: 'italic',
                }}>
                  {stanza.notes_en}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
