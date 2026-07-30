'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <p style={{ fontSize: 'var(--text-label)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-saffron-text)', margin: 0 }}>
        Error
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
        {ui.errorTitle}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-body)', maxWidth: '440px' }}>
        {ui.errorBody}
      </p>
      {error.digest && (
        <p style={{ fontSize: 'var(--text-label)', color: 'var(--color-text-secondary)', fontFamily: 'monospace', margin: 0 }}>
          {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'var(--color-gold)',
            color: '#fff',
            border: 'none',
            fontSize: 'var(--text-button)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {ui.tryAgain}
        </button>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            fontSize: 'var(--text-button)',
            fontWeight: 500,
          }}
        >
          {ui.backToHome}
        </Link>
      </div>
    </div>
  );
}
