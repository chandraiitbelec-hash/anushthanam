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
 * Two triggers, one menu. `variant="desktop"` sits in the header row above the
 * nav breakpoint; `variant="mobile"` is the icon-only trigger that replaces it
 * below (both are shown/hidden by CSS alone — see the .nav-* classes in
 * globals.css). Signing in is the one case they differ: desktop has room for a
 * labelled "Sign in" button that goes straight to Google, while mobile shows a
 * person icon and opens the menu first, so a tap on a small target can't
 * navigate off-site by accident.
 *
 * Google is the only provider, so signing in skips Auth.js's provider-picker
 * page entirely.
 */
export default function AuthControl({ variant }: { variant: 'desktop' | 'mobile' }) {
  const { lang } = useLang();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useDismissable<HTMLDivElement>(menuOpen, () => setMenuOpen(false));

  const user = session?.user;

  function handleSignIn() {
    setMenuOpen(false);
    signIn('google');
  }

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
  }

  // Desktop, signed out: a labelled button matching the language switcher.
  if (variant === 'desktop' && !user) {
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

  const isMobile = variant === 'mobile';

  return (
    <div ref={menuRef} className={isMobile ? 'nav-mobile' : 'nav-desktop'} style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(o => !o)}
        aria-label={user ? UI[lang].accountLabel : UI[lang].signIn}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: isMobile ? '36px' : 'auto',
          height: isMobile ? '36px' : 'auto',
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', borderRadius: '50%', flexShrink: 0,
          color: menuOpen ? 'var(--color-gold)' : 'var(--color-text-secondary)',
        }}
      >
        {user ? <Avatar user={user} size={isMobile ? 28 : 30} /> : <PersonIcon />}
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          overflow: 'hidden',
          width: isMobile ? 'min(260px, calc(100vw - 32px))' : undefined,
          minWidth: isMobile ? undefined : '220px',
          maxWidth: isMobile ? undefined : '280px',
          zIndex: 100,
        }}>
          {user ? (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
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
              <MenuItem onClick={handleSignOut}>{UI[lang].signOut}</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleSignIn}>{UI[lang].signInWithGoogle}</MenuItem>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '12px 16px',
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
      {children}
    </button>
  );
}

/** Signed-out trigger. Stroke-based to match the search icon in the same row. */
function PersonIcon() {
  return (
    <svg
      width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <circle cx="10" cy="6.5" r="3.25" />
      <path d="M3.75 16.75a6.25 6.25 0 0 1 12.5 0" />
    </svg>
  );
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
