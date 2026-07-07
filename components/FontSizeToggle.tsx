'use client';

import { useFontScale } from '@/context/FontScaleContext';

const SCALE_LABEL: Record<number, string> = { 1: 'A', 1.15: 'A+', 1.3: 'A++' };

export default function FontSizeToggle() {
  const { scale, cycleScale } = useFontScale();

  return (
    <button
      onClick={cycleScale}
      aria-label="Adjust text size"
      title="Adjust text size"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '10px' }}>Aa</span>
      {SCALE_LABEL[scale] ?? 'A'}
    </button>
  );
}
