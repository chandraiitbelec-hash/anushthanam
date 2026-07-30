'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import type { Language } from '@/lib/types';

type Crumb = { label: string; labels?: Partial<Record<Language, string>>; href?: string };

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const { lang } = useLang();
  const all = [{ label: UI[lang].home, href: '/' }, ...crumbs];

  return (
    <nav aria-label="Breadcrumb" style={{
      padding: '12px 0',
      fontSize: 'var(--text-nav)',
      color: 'var(--color-text-secondary)',
    }}>
      <div className="wide-width" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {all.map((crumb, i) => {
          const displayLabel = (crumb as Crumb).labels?.[lang] ?? crumb.label;
          return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {i > 0 && <span aria-hidden="true" style={{ color: 'var(--color-border)' }}>/</span>}
            {crumb.href && i < all.length - 1 ? (
              <Link href={crumb.href} style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                padding: '8px 4px',
              }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold-text)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {displayLabel}
              </Link>
            ) : (
              <span style={{ color: 'var(--color-text-primary)' }}>{displayLabel}</span>
            )}
          </span>
          );
        })}
      </div>
    </nav>
  );
}
