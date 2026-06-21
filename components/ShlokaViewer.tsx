'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';
import { splitStanzaLines } from '@/lib/utils';
import type { ShlokaStanza, ScriptLayer } from '@/lib/types';

const LAYER_LABELS: Record<ScriptLayer, string> = {
  script_devanagari: 'संस्कृत',
  script_telugu: 'తెలుగు',
  script_tamil: 'தமிழ்',
  roman_iast: 'IAST',
};

const LAYER_CLASS: Record<ScriptLayer, string> = {
  script_devanagari: 'script-devanagari',
  script_telugu: 'script-telugu',
  script_tamil: 'script-tamil',
  roman_iast: 'script-iast',
};

const ALL_LAYERS: ScriptLayer[] = ['script_devanagari', 'script_telugu', 'script_tamil', 'roman_iast'];
const STORAGE_KEY = 'anushthanam-shloka-layers';

export default function ShlokaViewer({ stanzas }: { stanzas: ShlokaStanza[] }) {
  const { lang } = useLang();
  const [activeLayers, setActiveLayers] = useState<Set<ScriptLayer>>(new Set(ALL_LAYERS));
  const [showMeaning, setShowMeaning] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { layers, meaning } = JSON.parse(saved);
        setActiveLayers(new Set(layers));
        setShowMeaning(meaning);
      }
    } catch {}
  }, []);

  function toggleLayer(layer: ScriptLayer) {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) {
        if (next.size > 1) next.delete(layer);
      } else {
        next.add(layer);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ layers: [...next], meaning: showMeaning }));
      return next;
    });
  }

  function toggleMeaning() {
    setShowMeaning(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ layers: [...activeLayers], meaning: next }));
      return next;
    });
  }

  const meaningField = `meaning_${lang}` as keyof ShlokaStanza;

  return (
    <div>
      {/* Layer toggles */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {ALL_LAYERS.map(layer => (
          <button key={layer} onClick={() => toggleLayer(layer)} style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: activeLayers.has(layer) ? 'var(--color-gold)' : 'var(--color-border)',
            background: activeLayers.has(layer) ? 'rgba(184,134,11,0.1)' : 'transparent',
            color: activeLayers.has(layer) ? 'var(--color-gold)' : 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}>
            {LAYER_LABELS[layer]}
          </button>
        ))}
        <button onClick={toggleMeaning} style={{
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: showMeaning ? 'var(--color-saffron)' : 'var(--color-border)',
          background: showMeaning ? 'rgba(212,98,42,0.1)' : 'transparent',
          color: showMeaning ? 'var(--color-saffron)' : 'var(--color-text-secondary)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          {lang === 'te' ? 'అర్థం' : lang === 'ta' ? 'பொருள்' : lang === 'hi' ? 'अर्थ' : 'Meaning'}
        </button>
      </div>

      {/* Stanzas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {stanzas.map((stanza) => (
          <div key={stanza.stanza_number} style={{
            background: 'var(--color-surface)',
            borderLeft: '4px solid var(--color-gold)',
            borderRadius: '0 8px 8px 0',
            padding: '16px 20px',
          }}>
            {stanza.stanza_label && (
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-gold)',
                margin: '0 0 12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {stanza.stanza_label}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ALL_LAYERS.filter(l => activeLayers.has(l)).map(layer => {
                const text = stanza[layer as keyof ShlokaStanza] as string;
                if (!text) return null;
                const lines = splitStanzaLines(text);
                return (
                  <div key={layer} className={LAYER_CLASS[layer]}>
                    {lines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                );
              })}

              {showMeaning && stanza[meaningField] && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.7,
                }}>
                  {String(stanza[meaningField])}
                </div>
              )}
            </div>

            {stanza.notes_en && (
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                margin: '8px 0 0',
                fontStyle: 'italic',
              }}>
                {stanza.notes_en}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
