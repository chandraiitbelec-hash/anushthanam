'use client';

import Link from 'next/link';
import type { God, Festival, Vratham, Shloka } from '@/lib/types';

type Item = { slug: string; name: string; href: string; type: string };

type Props = {
  heading?: string;
  items: Item[];
};

export default function RelatedContent({ heading = 'Related', items }: Props) {
  if (!items.length) return null;

  return (
    <section style={{ marginTop: '32px' }}>
      <h2 style={{
        fontSize: '13px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-secondary)',
        margin: '0 0 12px',
      }}>
        {heading}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'inline-block',
            padding: '6px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            background: 'var(--color-surface)',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-gold)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)';
          }}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
