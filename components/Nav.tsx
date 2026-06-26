'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLang, SITE_NAMES, LANGUAGE_LABELS, LANGUAGES } from '@/context/LanguageContext';

const TAGLINES: Record<string, string> = {
  en: 'Your guide to Hindu devotional practice',
  te: 'హిందూ భక్తి ఆచారానికి మీ మార్గదర్శి',
  ta: 'இந்து பக்தி வழிபாட்டிற்கான உங்கள் வழிகாட்டி',
  hi: 'हिंदू भक्ति आचरण के लिए आपका मार्गदर्शक',
};
import type { Language } from '@/lib/types';

const NAV_LINKS = [
  { href: '/gods',           label_en: 'Gods',          label_te: 'దేవతలు',       label_ta: 'தேவர்கள்',      label_hi: 'देवता' },
  { href: '/festivals',      label_en: 'Festivals',     label_te: 'పండుగలు',      label_ta: 'திருவிழாக்கள்', label_hi: 'त्योहार' },
  { href: '/vrathams',       label_en: 'Vrathams',      label_te: 'వ్రతాలు',      label_ta: 'விரதங்கள்',     label_hi: 'व्रत' },
  { href: '/pujas',          label_en: 'Pujas',         label_te: 'పూజలు',        label_ta: 'பூஜைகள்',       label_hi: 'पूजा' },
  { href: '/shlokas',        label_en: 'Shlokas',       label_te: 'శ్లోకాలు',     label_ta: 'ஸ்லோகங்கள்',    label_hi: 'श्लोक' },
  { href: '/bhagavad-gita',  label_en: 'Bhagavad Gita', label_te: 'భగవద్గీత',     label_ta: 'பகவத் கீதை',    label_hi: 'भगवद्गीता' },
  { href: '/panchangam',     label_en: 'Panchangam',    label_te: 'పంచాంగం',      label_ta: 'பஞ்சாங்கம்',    label_hi: 'पंचांग' },
  { href: '/upcoming',       label_en: 'Upcoming',      label_te: 'రాబోయేవి',     label_ta: 'வரவிருக்கும்',  label_hi: 'आगामी' },
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

          {/* Site name + tagline — always visible */}
          <Link href="/" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            textDecoration: 'none',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
            }}>
              {SITE_NAMES[lang]}
            </span>
            <span style={{
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.01em',
              lineHeight: 1,
              opacity: 0.7,
            }}>
              {TAGLINES[lang]}
            </span>
          </Link>

          {/* Desktop nav links — CSS hides this on mobile */}
          <nav className="nav-desktop" style={{ gap: '24px', flex: 1 }}>
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

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>

            {/* Search — always visible */}
            <Link href="/search" aria-label="Search" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '18px',
              flexShrink: 0,
            }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--color-gold)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
            >
              🔍
            </Link>

            {/* Language switcher — CSS hides this on mobile */}
            <div className="nav-desktop" style={{ position: 'relative' }}>
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
                {LANGUAGE_LABELS[lang]}
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

            {/* Hamburger — CSS hides this on desktop */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="nav-hamburger"
              aria-label="Open menu"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-primary)', fontSize: '22px',
                padding: '4px', lineHeight: 1,
                width: '36px', height: '36px',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: '64px', left: 0, right: 0,
              background: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              padding: '8px 24px 24px',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  padding: '13px 0',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {linkLabel(link)}
              </Link>
            ))}

            {/* Language picker in drawer */}
            <div style={{ paddingTop: '20px' }}>
              <p style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
                margin: '0 0 10px',
              }}>
                Language
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l as Language); setMobileOpen(false); }}
                    style={{
                      padding: '7px 18px',
                      fontSize: '14px',
                      fontWeight: l === lang ? 600 : 400,
                      color: l === lang ? '#fff' : 'var(--color-text-secondary)',
                      background: l === lang ? 'var(--color-gold)' : 'transparent',
                      border: `1px solid ${l === lang ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    {LANGUAGE_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
