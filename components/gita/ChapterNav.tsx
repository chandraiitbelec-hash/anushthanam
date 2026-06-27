'use client';

import Link from 'next/link';
import type { GitaChapter } from '@/lib/gita';

export default function ChapterNav({ prev, next }: { prev: GitaChapter | null; next: GitaChapter | null }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      marginTop: '48px',
      paddingTop: '24px',
      borderTop: '1px solid var(--color-border)',
    }}>
      {prev ? (
        <Link href={`/bhagavad-gita/${prev.number}`} style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>← Chapter {prev.number}</span>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '17px', fontWeight: 600 }}>{prev.name_en}</span>
        </Link>
      ) : <div />}

      {next ? (
        <Link href={`/bhagavad-gita/${next.number}`} style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          textAlign: 'right',
        }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chapter {next.number} →</span>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '17px', fontWeight: 600 }}>{next.name_en}</span>
        </Link>
      ) : <div />}
    </div>
  );
}
