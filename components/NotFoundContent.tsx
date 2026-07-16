'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

export default function NotFoundContent() {
  const { lang } = useLang();
  const ui = UI[lang];

  const titleClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <div
      className="content-width"
      style={{
        padding: '80px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <p style={{ fontSize: '40px', margin: 0 }} aria-hidden="true">🪔</p>
      <p style={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold)', margin: 0 }}>
        404
      </p>
      <h1
        className={titleClass}
        style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {ui.notFoundTitle}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '16px', maxWidth: '440px' }}>
        {ui.notFoundBody}
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          background: 'var(--color-gold)',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {ui.backToHome}
      </Link>
    </div>
  );
}
