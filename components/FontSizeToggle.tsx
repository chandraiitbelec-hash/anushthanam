'use client';

import { useLang } from '@/context/LanguageContext';
import { useFontScale } from '@/context/FontScaleContext';
import { UI } from '@/lib/ui-strings';

const SCALE_LABEL: Record<number, string> = { 1: 'A', 1.15: 'A+', 1.3: 'A++' };

export default function FontSizeToggle() {
  const { lang } = useLang();
  const { scale, cycleScale } = useFontScale();

  return (
    <button
      onClick={cycleScale}
      aria-label={UI[lang].adjustTextSize}
      title={UI[lang].adjustTextSize}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-button)',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 'var(--text-label)' }}>Aa</span>
      {SCALE_LABEL[scale] ?? 'A'}
    </button>
  );
}
