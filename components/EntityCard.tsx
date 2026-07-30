'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { scriptClass } from '@/lib/utils';

type Names = { en: string; te?: string; ta?: string; hi?: string; sa?: string };

type EntityCardProps = {
  href: string;
  names: Names;
  badge?: string;
  badgeColor?: 'gold' | 'saffron' | 'green';
  meta?: string;
  imageSrc?: string | null;
};

export default function EntityCard({ href, names, badge, badgeColor = 'gold', meta, imageSrc }: EntityCardProps) {
  const { lang } = useLang();

  const title = (names as Record<string, string>)[lang] || names.en;
  // show English as muted subtitle when viewing another language
  const subtitle = lang !== 'en' && names.en !== title ? names.en : undefined;

  const titleClass = scriptClass(lang);

  const badgeColors = {
    gold:    { bg: 'rgba(184,134,11,0.1)', color: 'var(--color-gold-text)' },
    saffron: { bg: 'rgba(212,98,42,0.1)', color: 'var(--color-saffron-text)' },
    green:   { bg: 'rgba(61,107,79,0.1)', color: 'var(--color-green)' },
  };
  const bc = badgeColors[badgeColor];

  return (
    <Link href={href} className="entity-card-link" style={{
      display: 'flex',
      gap: imageSrc ? '12px' : 0,
      alignItems: 'flex-start',
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
      {imageSrc && (
        <div style={{
          width: '44px',
          height: '44px',
          flexShrink: 0,
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          background: 'var(--color-background)',
        }}>
          <Image
            src={imageSrc}
            alt={title}
            width={44}
            height={44}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: 'var(--text-badge)',
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
        fontSize: 'var(--text-card-title)',
        fontWeight: 600,
        margin: '0 0 2px',
        color: 'var(--color-text-primary)',
        overflowWrap: 'break-word',
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          fontSize: 'var(--text-meta)',
          color: 'var(--color-text-secondary)',
          margin: '0 0 2px',
          lineHeight: 1.4,
        }}>
          {subtitle}
        </p>
      )}
      {meta && (
        <p style={{
          fontSize: 'var(--text-badge)',
          color: 'var(--color-gold-text)',
          margin: 0,
          fontWeight: 500,
        }}>
          {meta}
        </p>
      )}
      </div>
    </Link>
  );
}
