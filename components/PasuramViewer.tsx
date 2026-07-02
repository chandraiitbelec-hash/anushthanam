'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { splitStanzaLines } from '@/lib/utils';
import type { ShlokaStanza } from '@/lib/types';

function getTodayDayNumber(startDateStr: string): number | null {
  const start = new Date(startDateStr);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return diff >= 0 && diff < 30 ? diff + 1 : null;
}

function shortName(label: string): string {
  const colon = label.indexOf(': ');
  return colon >= 0 ? label.slice(colon + 2) : label;
}

const TRANSLIT_LABEL: Record<string, string> = {
  en: 'Transliteration', te: 'లిప్యంతరీకరణ', ta: 'எழுத்தாக்கம்', hi: 'लिप्यंतरण',
};

const MEANING_LABEL: Record<string, string> = {
  en: 'Meaning', te: 'అర్థం', ta: 'பொருள்', hi: 'अर्थ',
};

function pill(active: boolean, accent: 'gold' | 'saffron'): React.CSSProperties {
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
  };
}

function StanzaCard({
  stanza,
  showTranslit,
  showMeaning,
  lang,
}: {
  stanza: ShlokaStanza;
  showTranslit: boolean;
  showMeaning: boolean;
  lang: string;
}) {
  const meaningText = stanza[`meaning_${lang}` as keyof ShlokaStanza] as string;

  return (
    <div style={{
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

      {/* Original Tamil — always shown */}
      {stanza.script_tamil && (
        <div className="script-tamil" style={{ marginBottom: '8px' }}>
          {splitStanzaLines(stanza.script_tamil).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* IAST transliteration — toggle */}
      {showTranslit && stanza.roman_iast && (
        <div className="script-iast" style={{ opacity: 0.75, marginBottom: '8px' }}>
          {splitStanzaLines(stanza.roman_iast).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {/* Meaning in chosen language */}
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
}

export default function PasuramViewer({
  stanzas,
  startDate,
}: {
  stanzas: ShlokaStanza[];
  startDate?: string;
}) {
  const { lang } = useLang();
  const ui = UI[lang];
  const todayDay = startDate ? getTodayDayNumber(startDate) : null;
  const [selected, setSelected] = useState<number>(todayDay ?? 1);
  const [showTranslit, setShowTranslit] = useState(false);
  const [showMeaning, setShowMeaning] = useState(true);

  const selectedStanza = stanzas.find(s => s.stanza_number === selected);

  return (
    <div>
      {todayDay && (
        <p style={{
          fontSize: '13px',
          color: 'var(--color-saffron)',
          fontWeight: 500,
          margin: '0 0 16px',
        }}>
          {ui.todaysPasuram} — Day {todayDay}
        </p>
      )}

      {/* Day grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
        gap: '6px',
        marginBottom: '24px',
      }}>
        {stanzas.map(s => {
          const isToday = s.stanza_number === todayDay;
          const isSelected = s.stanza_number === selected;
          return (
            <button
              key={s.stanza_number}
              onClick={() => setSelected(s.stanza_number)}
              title={s.stanza_label}
              style={{
                position: 'relative',
                padding: '8px 6px',
                borderRadius: '8px',
                border: `1.5px solid ${
                  isSelected ? 'var(--color-gold)'
                  : isToday ? 'var(--color-saffron)'
                  : 'var(--color-border)'
                }`,
                background: isSelected
                  ? 'rgba(184,134,11,0.12)'
                  : isToday
                  ? 'rgba(212,98,42,0.07)'
                  : 'var(--color-surface)',
                color: isSelected
                  ? 'var(--color-gold)'
                  : isToday
                  ? 'var(--color-saffron)'
                  : 'var(--color-text-secondary)',
                fontWeight: isSelected || isToday ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {isToday && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: 'var(--color-saffron)', display: 'block',
                }} />
              )}
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                {s.stanza_number}
              </div>
              <div style={{
                fontSize: '9px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                opacity: 0.85,
              }}>
                {shortName(s.stanza_label ?? '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      {selectedStanza && (
        <>
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            marginBottom: '16px',
          }}>
            <button
              aria-pressed={showTranslit}
              onClick={() => setShowTranslit(v => !v)}
              style={pill(showTranslit, 'gold')}
            >
              {TRANSLIT_LABEL[lang]}
            </button>
            <button
              aria-pressed={showMeaning}
              onClick={() => setShowMeaning(v => !v)}
              style={pill(showMeaning, 'saffron')}
            >
              {MEANING_LABEL[lang]}
            </button>
          </div>

          <StanzaCard
            stanza={selectedStanza}
            showTranslit={showTranslit}
            showMeaning={showMeaning}
            lang={lang}
          />
        </>
      )}
    </div>
  );
}
