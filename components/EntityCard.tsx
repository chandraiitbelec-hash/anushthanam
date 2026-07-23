'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { scriptClass } from '@/lib/utils';

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

  const titleClass = scriptClass(lang);

  const badgeColors = {
    gold:    { bg: 'rgba(184,134,11,0.1)', color: 'var(--color-gold)' },
    saffron: { bg: 'rgba(212,98,42,0.1)', color: 'var(--color-saffron)' },
    green:   { bg: 'rgba(61,107,79,0.1)', color: 'var(--color-green)' },
  };
  const bc = badgeColors[badgeColor];

  return (
    <Link href={href} className="entity-card-link" style={{
      display: 'block',
      padding: '14px 16px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      textDecoration: 'none',
      color: 'var(--color-text-primary)',
      minWidth: 0,
    }}
      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: 500,
          padding: '2px 7px',
          borderRadius: '20px',
          background: bc.bg,
          color: bc.color,
          marginBottom: '6px',
          textTransform: 'capitalize',
        }}>
          {badge}
        </span>
      )}
      <p className={titleClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
        fontSize: lang === 'en' ? '17px' : '16px',
        fontWeight: 600,
        margin: '0 0 2px',
        color: 'var(--color-text-primary)',
        overflowWrap: 'break-word',
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 2px',
          lineHeight: 1.4,
        }}>
          {subtitle}
        </p>
      )}
      {meta && (
        <p style={{
          fontSize: '11px',
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
