'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

type Props = { nextDate?: string | null };

export default function PanchangamEmptyState({ nextDate }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];

  return (
    <div style={{
      padding: '56px 32px',
      textAlign: 'center',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
    }}>
      {/* Decorative SVG — sun / almanac motif in warm palette */}
      <svg
        aria-hidden="true"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '0 auto 20px', display: 'block', opacity: 0.85 }}
      >
        {/* Sun disc */}
        <circle cx="36" cy="36" r="14" fill="var(--color-gold)" opacity="0.25" />
        <circle cx="36" cy="36" r="9" fill="var(--color-gold)" opacity="0.6" />
        {/* Rays */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 36 + 13 * Math.cos(rad);
          const y1 = 36 + 13 * Math.sin(rad);
          const x2 = 36 + 20 * Math.cos(rad);
          const y2 = 36 + 20 * Math.sin(rad);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--color-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}
        {/* Small calendar lines at bottom */}
        <rect x="22" y="52" width="28" height="12" rx="3" fill="var(--color-saffron)" opacity="0.18" />
        <line x1="22" y1="57" x2="50" y2="57" stroke="var(--color-saffron)" strokeWidth="1.5" opacity="0.4" />
        <line x1="28" y1="52" x2="28" y2="64" stroke="var(--color-saffron)" strokeWidth="1" opacity="0.3" />
        <line x1="36" y1="52" x2="36" y2="64" stroke="var(--color-saffron)" strokeWidth="1" opacity="0.3" />
        <line x1="44" y1="52" x2="44" y2="64" stroke="var(--color-saffron)" strokeWidth="1" opacity="0.3" />
      </svg>

      <p style={{
        fontSize: '17px',
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        color: 'var(--color-text-primary)',
        margin: '0 0 10px',
      }}>
        {ui.panchangamNoDataTitle}
      </p>

      <p style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        margin: '0 0 20px',
        maxWidth: '420px',
        marginInline: 'auto',
        lineHeight: 1.6,
      }}>
        {ui.panchangamNoDataBody}
      </p>

      {nextDate && (
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-gold-text)',
          margin: '0 0 24px',
        }}>
          {ui.panchangamNextAvailable(nextDate)}
        </p>
      )}

      <Link
        href="/upcoming"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          background: 'var(--color-gold)',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        {ui.viewUpcoming}
      </Link>
    </div>
  );
}
