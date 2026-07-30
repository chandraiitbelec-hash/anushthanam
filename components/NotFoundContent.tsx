'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';

export default function NotFoundContent() {
  const { lang } = useLang();
  const ui = UI[lang];

  const titleClass = scriptClass(lang);

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
      <p style={{ fontSize: 'var(--text-label)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-gold-text)', margin: 0 }}>
        404
      </p>
      <h1
        className={titleClass}
        style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'var(--text-h1-page)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {ui.notFoundTitle}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-body)', maxWidth: '440px' }}>
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
          fontSize: 'var(--text-button)',
          fontWeight: 500,
        }}
      >
        {ui.backToHome}
      </Link>
    </div>
  );
}
