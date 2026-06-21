'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

type EntityCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'gold' | 'saffron' | 'green';
  meta?: string;
};

export default function EntityCard({ href, title, subtitle, badge, badgeColor = 'gold', meta }: EntityCardProps) {
  const badgeColors = {
    gold: { bg: 'rgba(184,134,11,0.1)', color: 'var(--color-gold)' },
    saffron: { bg: 'rgba(212,98,42,0.1)', color: 'var(--color-saffron)' },
    green: { bg: 'rgba(61,107,79,0.1)', color: 'var(--color-green)' },
  };
  const bc = badgeColors[badgeColor];

  return (
    <Link href={href} style={{
      display: 'block',
      padding: '20px 24px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      textDecoration: 'none',
      color: 'var(--color-text-primary)',
    }}
      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: '20px',
          background: bc.bg,
          color: bc.color,
          marginBottom: '8px',
          textTransform: 'capitalize',
        }}>
          {badge}
        </span>
      )}
      <p style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: '20px',
        fontWeight: 600,
        margin: '0 0 4px',
        color: 'var(--color-text-primary)',
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 4px',
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
      )}
      {meta && (
        <p style={{
          fontSize: '12px',
          color: 'var(--color-gold)',
          margin: 0,
          fontWeight: 500,
        }}>
          {meta}
        </p>
      )}
    </Link>
  );
}
