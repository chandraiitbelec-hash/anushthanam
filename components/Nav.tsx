'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang, SITE_NAMES, LANGUAGE_LABELS, LANGUAGES } from '@/context/LanguageContext';
import type { Language } from '@/lib/types';

const NAV_LINKS = [
  { href: '/gods', label_en: 'Gods', label_te: 'దేవతలు', label_ta: 'தேவர்கள்', label_hi: 'देवता' },
  { href: '/festivals', label_en: 'Festivals', label_te: 'పండుగలు', label_ta: 'திருவிழாக்கள்', label_hi: 'त्योहार' },
  { href: '/vrathams', label_en: 'Vrathams', label_te: 'వ్రతాలు', label_ta: 'விரதங்கள்', label_hi: 'व्रत' },
  { href: '/pujas', label_en: 'Pujas', label_te: 'పూజలు', label_ta: 'பூஜைகள்', label_hi: 'पूजा' },
  { href: '/shlokas', label_en: 'Shlokas', label_te: 'శ్లోకాలు', label_ta: 'ஸ்லோகங்கள்', label_hi: 'श्लोक' },
  { href: '/panchangam', label_en: 'Panchangam', label_te: 'పంచాంగం', label_ta: 'பஞ்சாங்கம்', label_hi: 'पंचांग' },
];

export default function Nav() {
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function linkLabel(link: typeof NAV_LINKS[0]) {
    return link[`label_${lang}` as keyof typeof link] || link.label_en;
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: '64px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="wide-width" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '32px' }}>

          {/* Site name */}
          <Link href="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            {SITE_NAMES[lang]}
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: '24px', flex: 1 }} className="desktop-nav">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                {linkLabel(link)}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>

            {/* Search */}
            <Link href="/search" aria-label="Search" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '18px',
              borderRadius: '6px',
              flexShrink: 0,
            }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              🔍
            </Link>

            {/* Language switcher */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(o => !o)}
                aria-label="Switch language"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="lang-label-full">{LANGUAGE_LABELS[lang]}</span>
                <span className="lang-label-short" style={{ display: 'none' }}>
                  {lang === 'te' ? 'తె' : lang === 'ta' ? 'த' : lang === 'hi' ? 'हि' : 'En'}
                </span>
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  minWidth: '180px',
                  zIndex: 100,
                }}>
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l as Language); setLangOpen(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: l === lang ? 'var(--color-gold)' : 'var(--color-text-primary)',
                        background: l === lang ? 'rgba(184,134,11,0.08)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: l === lang ? 500 : 400,
                      }}
                    >
                      {LANGUAGE_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="mobile-menu-btn"
              aria-label="Open menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-primary)', fontSize: '22px', padding: '4px',
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.3)',
        }} onClick={() => setMobileOpen(false)}>
          <nav
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: '64px', left: 0, right: 0,
              background: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              padding: '16px 24px 24px',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {linkLabel(link)}
              </Link>
            ))}
            <Link href="/search" onClick={() => setMobileOpen(false)}
              style={{ fontSize: '16px', color: 'var(--color-text-primary)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
              {lang === 'te' ? 'వెతకండి' : lang === 'ta' ? 'தேடு' : lang === 'hi' ? 'खोजें' : 'Search'}
            </Link>
            <Link href="/upcoming" onClick={() => setMobileOpen(false)}
              style={{ fontSize: '16px', color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '12px 0' }}>
              {lang === 'te' ? 'రాబోయేవి' : lang === 'ta' ? 'வரவிருப்பவை' : lang === 'hi' ? 'आगामी' : 'Upcoming'}
            </Link>
            <Link href="/index" onClick={() => setMobileOpen(false)}
              style={{ fontSize: '16px', color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '12px 0' }}>
              {lang === 'te' ? 'సూచిక' : lang === 'ta' ? 'அட்டவணை' : lang === 'hi' ? 'अनुक्रमणिका' : 'Site Index'}
            </Link>
          </nav>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        .lang-label-full { display: inline; }
        .lang-label-short { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: block; }
        }
        @media (max-width: 480px) {
          .lang-label-full { display: none; }
          .lang-label-short { display: inline !important; }
        }
      `}</style>
    </>
  );
}
