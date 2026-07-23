'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Story } from '@/lib/types';

type Props = {
  stories: Story[];
  readLabel: string;
};

export default function StoryLinkList({ stories, readLabel }: Props) {
  const { lang } = useLang();

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {stories.map((s, idx) => {
        const sr = s as unknown as Record<string, string>;
        const t = sr[`title_${lang}`] || s.title_en;
        return (
          <Link key={s.slug} href={`/stories/${s.slug}`} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 18px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-gold)',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.04)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--color-surface)')}
          >
            {stories.length > 1 && (
              <span style={{
                width: '24px', height: '24px', flexShrink: 0,
                background: 'rgba(184,134,11,0.1)', border: '1px solid var(--color-gold)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'var(--color-gold)',
              }}>{idx + 1}</span>
            )}
            <span className={nameClass} style={{
              flex: 1, fontSize: '15px', fontWeight: 500,
              fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
              color: 'var(--color-text-primary)',
            }}>{t}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 600, flexShrink: 0 }}>
              {readLabel} →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
