'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

type Names = { en: string; te?: string; ta?: string; hi?: string; sa?: string };

type EntityCardProps = {
  href: string;
  names: Names;
  badge?: string;
  badgeColor?: 'gold' | 'saffron' | 'green';
  meta?: string;
};

export default function EntityCard({ href, names, badge, badgeColor = 'gold', meta }: EntityCardProps) {
  const { lang } = useLang();

  const title = (names as Record<string, string>)[lang] || names.en;
  // show English as muted subtitle when viewing another language
  const subtitle = lang !== 'en' && names.en !== title ? names.en : undefined;

  const titleClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const badgeColors = {
    gold:    { bg: 'rgba(184,134,11,0.1)', color: 'var(--color-gold)' },
    saffron: { bg: 'rgba(212,98,42,0.1)', color: 'var(--color-saffron)' },
    green:   { bg: 'rgba(61,107,79,0.1)', color: 'var(--color-green)' },
  };
  const bc = badgeColors[badgeColor];

  return (
    <Link href={href} className="entity-card-link" style={{
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
      <p className={titleClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
        fontSize: lang === 'en' ? '20px' : '18px',
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
