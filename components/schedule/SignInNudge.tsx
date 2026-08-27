'use client';

import { signIn } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

/** Shown in place of the create/edit form when the visitor is signed out. */
export default function SignInNudge() {
  const { lang } = useLang();
  const t = UI[lang];
  return (
    <div style={{
      padding: '48px 32px', textAlign: 'center',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px',
      maxWidth: '560px',
    }}>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-primary)', margin: '0 0 20px' }}>
        {t.scheduleSignInToCreate}
      </p>
      <button
        onClick={() => signIn('google')}
        style={{
          padding: '10px 24px',
          background: 'var(--color-gold)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: 'var(--text-button)',
          fontFamily: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {t.signInWithGoogle}
      </button>
    </div>
  );
}
