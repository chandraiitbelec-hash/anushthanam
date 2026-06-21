'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

type Crumb = { label: string; href?: string };

const HOME_LABEL: Record<string, string> = {
  en: 'Home', te: 'హోమ్', ta: 'முகப்பு', hi: 'होम',
};

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const { lang } = useLang();
  const all = [{ label: HOME_LABEL[lang], href: '/' }, ...crumbs];

  return (
    <nav aria-label="Breadcrumb" style={{
      padding: '12px 0',
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
    }}>
      <div className="wide-width" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {all.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {i > 0 && <span style={{ color: 'var(--color-border)' }}>/</span>}
            {crumb.href && i < all.length - 1 ? (
              <Link href={crumb.href} style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: 'var(--color-text-primary)' }}>{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
