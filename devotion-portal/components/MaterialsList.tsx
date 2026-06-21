'use client';

import { useLang } from '@/context/LanguageContext';
import type { MaterialItem } from '@/lib/types';

export default function MaterialsList({ items }: { items: MaterialItem[] }) {
  const { lang } = useLang();

  function name(item: MaterialItem) {
    return item[`item_name_${lang}` as keyof MaterialItem] as string || item.item_name_en;
  }

  const required = items.filter(i => !i.is_optional);
  const optional = items.filter(i => i.is_optional);

  const OPTIONAL_LABEL: Record<string, string> = {
    en: 'Optional', te: 'ఐచ్ఛికం', ta: 'விருப்பத்தேர்வு', hi: 'वैकल्पिक',
  };

  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {required.map((item, i) => (
          <li key={i} style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            padding: '10px 16px',
            background: 'var(--color-surface)',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            <span style={{ color: 'var(--color-gold)', fontWeight: 600, flexShrink: 0 }}>✦</span>
            <span style={{ color: 'var(--color-text-primary)', flex: 1 }}>{name(item)}</span>
            {item.quantity_en && (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px', flexShrink: 0 }}>{item.quantity_en}</span>
            )}
          </li>
        ))}
        {optional.map((item, i) => (
          <li key={`opt-${i}`} style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            padding: '10px 16px',
            background: 'var(--color-bg)',
            border: '1px dashed var(--color-border)',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            <span style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>○</span>
            <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>{name(item)}</span>
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
            }}>
              {OPTIONAL_LABEL[lang]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
