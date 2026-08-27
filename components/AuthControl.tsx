'use client';

import Image from 'next/image';
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLang } from '@/context/LanguageContext';
import { useDismissable } from '@/hooks/useDismissable';
import { UI } from '@/lib/ui-strings';

/**
 * Sign in / sign out control for the nav.
 *
 * `variant="desktop"` is the compact header control (a button, or the avatar
 * with a dropdown); `variant="drawer"` is the labelled block inside the mobile
 * menu, matching the language and theme pickers there.
 *
 * Google is the only provider, so signing in goes straight to Google rather
 * than through Auth.js's provider-picker page.
 */
export default function AuthControl({
  variant,
  onNavigate,
}: {
  variant: 'desktop' | 'drawer';
  onNavigate?: () => void;
}) {
  const { lang } = useLang();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useDismissable<HTMLDivElement>(menuOpen, () => setMenuOpen(false));

  const user = session?.user;

  function handleSignIn() {
    onNavigate?.();
    signIn('google');
  }

  function handleSignOut() {
    setMenuOpen(false);
    onNavigate?.();
    signOut();
  }

  if (variant === 'drawer') {
    return (
      <div style={{ paddingTop: '20px' }}>
        <p style={{
          fontSize: 'var(--text-label)', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
          margin: '0 0 10px',
        }}>
          {UI[lang].accountLabel}
        </p>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Avatar user={user} size={32} />
            <span style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-primary)',
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}>
              {user.name || user.email}
            </span>
            <button onClick={handleSignOut} style={pillStyle(false)}>
              {UI[lang].signOut}
            </button>
          </div>
        ) : (
          <button onClick={handleSignIn} style={pillStyle(true)}>
            {UI[lang].signInWithGoogle}
          </button>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="nav-desktop"
        style={{
          fontSize: 'var(--text-meta)',
          color: 'var(--color-text-secondary)',
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
        }}
      >
        {UI[lang].signIn}
      </button>
    );
  }

  return (
    <div ref={menuRef} className="nav-desktop" style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        aria-label={UI[lang].accountLabel}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        style={{
          display: 'flex', alignItems: 'center',
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', borderRadius: '50%', flexShrink: 0,
        }}
      >
        <Avatar user={user} size={30} />
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
          minWidth: '220px',
          maxWidth: '280px',
          zIndex: 100,
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {user.name && (
              <p style={{
                margin: 0,
                fontSize: 'var(--text-nav)',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                overflowWrap: 'anywhere',
              }}>
                {user.name}
              </p>
            )}
            {user.email && (
              <p style={{
                margin: user.name ? '2px 0 0' : 0,
                fontSize: 'var(--text-meta)',
                color: 'var(--color-text-secondary)',
                overflowWrap: 'anywhere',
              }}>
                {user.email}
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '10px 16px',
              fontSize: 'var(--text-nav)',
              color: 'var(--color-text-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.08)')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}
          >
            {UI[lang].signOut}
          </button>
        </div>
      )}
    </div>
  );
}

function pillStyle(filled: boolean): React.CSSProperties {
  return {
    padding: '7px 18px',
    fontSize: 'var(--text-button)',
    fontWeight: filled ? 600 : 400,
    color: filled ? '#fff' : 'var(--color-text-secondary)',
    background: filled ? 'var(--color-gold)' : 'transparent',
    border: `1px solid ${filled ? 'var(--color-gold)' : 'var(--color-border)'}`,
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

/**
 * Google's avatar URL, or the initial on a gold disc when the account has no
 * picture (or the image fails to load — Google's CDN 404s for some accounts).
 */
function Avatar({
  user,
  size,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  if (user.image && !failed) {
    return (
      <Image
        src={user.image}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: `${size}px`, height: `${size}px`,
        borderRadius: '50%',
        background: 'var(--color-gold)',
        color: '#fff',
        fontSize: `${Math.round(size * 0.45)}px`,
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
