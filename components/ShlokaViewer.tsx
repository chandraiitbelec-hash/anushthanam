'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';
import { useFontScale } from '@/context/FontScaleContext';
import FontSizeToggle from '@/components/FontSizeToggle';
import { splitStanzaLines } from '@/lib/utils';
import { UI } from '@/lib/ui-strings';
import type { ShlokaStanza, ScriptLayer, ShlokaType, Language } from '@/lib/types';

// Meanings are only ever authored in meaning_en for most content so far — fall
// back to it the same way the rest of the site falls back to _en (see
// lib/utils.ts's t()/tVal()), instead of silently hiding the meaning when the
// active UI language has no translated meaning of its own.
function getMeaning(stanza: ShlokaStanza, lang: Language): string {
  const direct = stanza[`meaning_${lang}` as keyof ShlokaStanza] as string;
  return direct || stanza.meaning_en;
}

// Types recited as a long list of short names/lines rather than full verses —
// rendered as one compact list instead of one card per entry
const NAMAVALI_TYPES: ShlokaType[] = ['ashtothram', 'sahasranama'];

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

// BCP-47 lang for each script layer, so assistive tech announces each run correctly.
// Recited verse in Devanagari/roman here is Sanskrit ('sa'); native-script layers use their language.
const SCRIPT_LANG: Record<ScriptLayer, string> = {
  script_devanagari: 'sa',
  script_telugu: 'te',
  script_tamil: 'ta',
  roman_iast: 'sa',
};

const MEANING_LABEL: Record<string, string> = {
  en: 'Meaning', te: 'అర్థం', ta: 'பொருள்', hi: 'अर्थ',
};

const IAST_LABEL: Record<string, string> = {
  en: 'देवनागरी', te: 'IAST', ta: 'IAST', hi: 'IAST',
};

const COPY_LABEL: Record<string, string> = {
  en: 'Copy', te: 'కాపీ', ta: 'நகல்', hi: 'कॉपी',
};

const COPIED_LABEL: Record<string, string> = {
  en: 'Copied', te: 'కాపీ అయింది', ta: 'நகலெடுக்கப்பட்டது', hi: 'कॉपी हो गया',
};

// Copy with a legacy execCommand fallback for contexts where the async
// Clipboard API is blocked (sandboxed iframes, some in-app browsers).
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function ShlokaViewer({ stanzas, type }: { stanzas: ShlokaStanza[]; type?: ShlokaType }) {
  const { lang } = useLang();
  const { scale } = useFontScale();
  const [showExtra, setShowExtra] = useState(false);
  const [showMeaning, setShowMeaning] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [stanzaCopied, setStanzaCopied] = useState<number | null>(null);
  const isNamavali = type ? NAMAVALI_TYPES.includes(type) : false;

  // On mount, scroll to the #stanza-N hash if present
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#stanza-')) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const primaryScript = LANG_TO_SCRIPT[lang] ?? 'roman_iast';
  // For English the primary is already IAST, so the extra is Devanagari; for others it's IAST
  const extraScript: ScriptLayer = lang === 'en' ? 'script_devanagari' : 'roman_iast';

  const hasMeaning = stanzas.some(s => Boolean(getMeaning(s, lang)));

  async function copyAll() {
    const text = stanzas
      .map(s => (s[primaryScript as keyof ShlokaStanza] as string) || '')
      .filter(Boolean)
      .map(t => splitStanzaLines(t).join('\n'))
      .join('\n\n');
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function shareOrCopyUrl() {
    const url = window.location.href.split('#')[0];
    const title = document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or API unavailable — fall through */
      }
    }
    if (await copyText(url)) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  async function copyStanzaLink(stanzaNumber: number) {
    const base = window.location.href.split('#')[0];
    const url = `${base}#stanza-${stanzaNumber}`;
    if (await copyText(url)) {
      setStanzaCopied(stanzaNumber);
      setTimeout(() => setStanzaCopied(null), 2000);
    }
  }

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
    <div style={{ '--content-font-scale': scale } as React.CSSProperties}>
      {/* Controls — sticky so they remain visible while scrolling through long shlokas */}
      <div className="shloka-controls-bar" style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        position: 'sticky', top: 'var(--nav-height)', zIndex: 10,
        background: 'var(--color-bg)',
        padding: '10px 0',
        marginBottom: '16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <button aria-pressed={showExtra} onClick={() => setShowExtra(v => !v)} style={pill(showExtra, 'gold')}>
          {IAST_LABEL[lang] ?? 'IAST'}
        </button>
        {hasMeaning && (
          <button aria-pressed={showMeaning} onClick={() => setShowMeaning(v => !v)} style={pill(showMeaning, 'saffron')}>
            {MEANING_LABEL[lang] ?? 'Meaning'}
          </button>
        )}
        <FontSizeToggle />
        <button
          onClick={copyAll}
          aria-label={COPY_LABEL[lang] ?? 'Copy'}
          style={{ ...pill(false, 'gold'), marginLeft: 'auto' }}
        >
          {copied ? `✓ ${COPIED_LABEL[lang] ?? 'Copied'}` : `⧉ ${COPY_LABEL[lang] ?? 'Copy'}`}
        </button>
        <button
          onClick={shareOrCopyUrl}
          aria-label={UI[lang].share}
          style={pill(false, 'gold')}
        >
          {shared ? `✓ ${UI[lang].linkCopied}` : `↗ ${UI[lang].share}`}
        </button>
      </div>

      {/* Stanzas */}
      {isNamavali ? (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          {stanzas.map((stanza, i) => {
            const primaryText = stanza[primaryScript as keyof ShlokaStanza] as string;
            const extraText = stanza[extraScript as keyof ShlokaStanza] as string;
            const meaningText = getMeaning(stanza, lang);
            const isMilestone = stanza.stanza_number % 10 === 0;

            return (
              <div
                key={stanza.stanza_number}
                id={`stanza-${stanza.stanza_number}`}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  padding: '8px 14px',
                  borderBottom: i < stanzas.length - 1 ? '1px solid var(--color-border)' : 'none',
                  scrollMarginTop: 'var(--section-anchor-offset)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                  {primaryText && (
                    <div className={SCRIPT_CLASS[primaryScript]} lang={SCRIPT_LANG[primaryScript]}>
                      {splitStanzaLines(primaryText).map((line, li) => <div key={li}>{line}</div>)}
                    </div>
                  )}
                  {showExtra && extraText && (
                    <div className={SCRIPT_CLASS[extraScript]} lang={SCRIPT_LANG[extraScript]} style={{ opacity: 0.75, fontSize: '14px' }}>
                      {splitStanzaLines(extraText).map((line, li) => <div key={li}>{line}</div>)}
                    </div>
                  )}
                  {showMeaning && meaningText && (
                    <div style={{ fontSize: 'calc(13px * var(--content-font-scale, 1))', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {meaningText}
                    </div>
                  )}
                </div>

                {isMilestone && (
                  <span style={{
                    fontSize: '12px', fontWeight: 600, color: 'var(--color-gold)', flexShrink: 0,
                  }}>
                    ({stanza.stanza_number})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {stanzas.map((stanza) => {
            const primaryText = stanza[primaryScript as keyof ShlokaStanza] as string;
            const extraText = stanza[extraScript as keyof ShlokaStanza] as string;
            const meaningText = getMeaning(stanza, lang);
            const stanzaId = `stanza-${stanza.stanza_number}`;

            return (
              <div
                key={stanza.stanza_number}
                id={stanzaId}
                className="stanza-card"
                style={{
                  background: 'var(--color-surface)',
                  borderLeft: '4px solid var(--color-gold)',
                  borderRadius: '0 8px 8px 0',
                  padding: '16px 20px',
                  scrollMarginTop: 'var(--section-anchor-offset)',
                  position: 'relative',
                }}
              >
                {/* Per-stanza deep-link anchor */}
                <button
                  className="stanza-link-btn"
                  onClick={() => copyStanzaLink(stanza.stanza_number)}
                  aria-label={UI[lang].copyStanzaLink}
                  title={UI[lang].copyStanzaLink}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: stanzaCopied === stanza.stanza_number ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                    fontSize: '14px',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    opacity: stanzaCopied === stanza.stanza_number ? 1 : 0,
                    transition: 'opacity 0.15s, color 0.15s',
                  }}
                >
                  {stanzaCopied === stanza.stanza_number ? '✓' : '¶'}
                </button>

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
                    <div className={SCRIPT_CLASS[primaryScript]} lang={SCRIPT_LANG[primaryScript]}>
                      {splitStanzaLines(primaryText).map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                  )}

                  {showExtra && extraText && (
                    <div className={SCRIPT_CLASS[extraScript]} lang={SCRIPT_LANG[extraScript]} style={{ opacity: 0.75 }}>
                      {splitStanzaLines(extraText).map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                  )}

                  {showMeaning && meaningText && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--color-border)',
                      fontSize: 'calc(14px * var(--content-font-scale, 1))',
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
      )}
    </div>
  );
}
