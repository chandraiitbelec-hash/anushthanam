'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { MaterialItem } from '@/lib/types';

const OPTIONAL_LABEL: Record<string, string> = {
  en: 'Optional', te: 'ఐచ్ఛికం', ta: 'விருப்பத்தேர்வு', hi: 'वैकल्पिक',
};
const RESET_LABEL: Record<string, string> = {
  en: 'Reset', te: 'రీసెట్', ta: 'மீட்டமை', hi: 'रीसेट',
};

export default function MaterialsList({ items }: { items: MaterialItem[] }) {
  const { lang } = useLang();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(idx: number) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function name(item: MaterialItem) {
    return (item as unknown as Record<string, string>)[`item_name_${lang}`] || item.item_name_en;
  }

  // Numerals stay as digits; only the unit/descriptor words are localized.
  function quantity(item: MaterialItem) {
    return (item as unknown as Record<string, string>)[`quantity_${lang}`] || item.quantity_en;
  }

  const required = items.map((item, i) => ({ item, i })).filter(({ item }) => !item.is_optional);
  const optional = items.map((item, i) => ({ item, i })).filter(({ item }) => item.is_optional);

  const allCount = items.length;
  const doneCount = checked.size;
  const allDone = doneCount === allCount && allCount > 0;

  return (
    <div>
      {/* Progress bar */}
      {allCount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {doneCount}/{allCount}
            </span>
            {doneCount > 0 && (
              <button onClick={() => setChecked(new Set())} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: 'var(--color-text-secondary)',
                padding: 0, textDecoration: 'underline',
              }}>
                {RESET_LABEL[lang]}
              </button>
            )}
          </div>
          <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${allCount ? (doneCount / allCount) * 100 : 0}%`,
              background: allDone ? 'var(--color-green, #3d6b4f)' : 'var(--color-gold)',
              borderRadius: '2px',
              transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {required.map(({ item, i }) => {
          const done = checked.has(i);
          return (
            <li key={i}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && toggle(i)}
              style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              minHeight: '44px',
              boxSizing: 'border-box',
              background: done ? 'var(--color-bg)' : 'var(--color-surface)',
              border: `1px solid ${done ? 'var(--color-border)' : 'transparent'}`,
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.15s, opacity 0.15s',
              opacity: done ? 0.55 : 1,
              userSelect: 'none',
            }}>
              {/* Checkbox */}
              <span style={{
                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                border: `2px solid ${done ? 'var(--color-gold)' : 'var(--color-border)'}`,
                background: done ? 'var(--color-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                color: '#fff', fontSize: '11px', fontWeight: 700,
              }}>
                {done ? '✓' : ''}
              </span>
              <span className={lang !== 'en' ? (lang === 'te' ? 'script-telugu' : lang === 'ta' ? 'script-tamil' : 'script-devanagari') : ''} style={{
                color: 'var(--color-text-primary)', flex: 1,
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {name(item)}
              </span>
              {quantity(item) && (
                <span className={lang !== 'en' ? (lang === 'te' ? 'script-telugu' : lang === 'ta' ? 'script-tamil' : 'script-devanagari') : ''} style={{ color: 'var(--color-text-secondary)', fontSize: '12px', flexShrink: 0 }}>
                  {quantity(item)}
                </span>
              )}
            </li>
          );
        })}

        {optional.map(({ item, i }) => {
          const done = checked.has(i);
          return (
            <li key={`opt-${i}`}
              role="checkbox"
              aria-checked={done}
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && toggle(i)}
              style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              background: done ? 'var(--color-bg)' : 'transparent',
              border: `1px dashed ${done ? 'var(--color-border)' : 'var(--color-border)'}`,
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              opacity: done ? 0.45 : 0.8,
              transition: 'opacity 0.15s',
              userSelect: 'none',
            }}>
              <span style={{
                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                border: `2px dashed ${done ? 'var(--color-gold)' : 'var(--color-border)'}`,
                background: done ? 'var(--color-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                color: '#fff', fontSize: '11px', fontWeight: 700,
              }}>
                {done ? '✓' : ''}
              </span>
              <span className={lang !== 'en' ? (lang === 'te' ? 'script-telugu' : lang === 'ta' ? 'script-tamil' : 'script-devanagari') : ''} style={{
                color: 'var(--color-text-secondary)', flex: 1,
                textDecoration: done ? 'line-through' : 'none',
              }}>
                {name(item)}
              </span>
              <span style={{
                fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                background: 'var(--color-border)', color: 'var(--color-text-secondary)', flexShrink: 0,
              }}>
                {OPTIONAL_LABEL[lang]}
              </span>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-green, #3d6b4f)', fontWeight: 500 }}>
          {lang === 'te' ? 'అన్నీ సిద్ధంగా ఉన్నాయి!' : lang === 'ta' ? 'அனைத்தும் தயார்!' : lang === 'hi' ? 'सब तैयार है!' : 'All items gathered!'}
        </p>
      )}
    </div>
  );
}
