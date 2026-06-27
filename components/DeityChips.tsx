'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';

export type DeityRef = {
  slug: string;
  name_en: string;
  name_te: string;
  name_ta: string;
  name_hi: string;
};

const LABEL: Record<string, string> = {
  en: 'Deity', te: 'దేవత', ta: 'தெய்வம்', hi: 'देवता',
};

export default function DeityChips({ deities }: { deities: DeityRef[] }) {
  const { lang } = useLang();
  if (!deities.length) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        {LABEL[lang]}:
      </span>
      {deities.map(d => {
        const name = (d as unknown as Record<string, string>)[`name_${lang}`] || d.name_en;
        return (
          <Link key={d.slug} href={`/gods/${d.slug}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '10px 16px',
            background: 'rgba(184,134,11,0.08)',
            border: '1px solid var(--color-gold)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-gold)',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.18)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.08)')}
          >
            <span aria-hidden="true">✦</span> {name}
          </Link>
        );
      })}
    </div>
  );
}
