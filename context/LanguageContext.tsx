'use client';

import { createContext, useContext, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Language } from '@/lib/types';

const VALID_LANGS: Language[] = ['en', 'te', 'ta', 'hi'];

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

function subscribe() {
  return () => {};
}

function getSnapshot(): Language {
  const domLang = document.documentElement.lang as Language;
  return domLang && VALID_LANGS.includes(domLang) ? domLang : 'en';
}

// Nearest element to the "reading position" (just below the sticky nav/chip
// bar) at the moment a language switch is requested, plus its viewport offset
// so we can put it back there once the reflow from the switch has settled.
type ScrollAnchor = { el: Element; offset: number } | { scrollY: number };

function anchorY(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--section-anchor-offset');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 140;
}

function captureScrollAnchor(): ScrollAnchor {
  const el = document.elementFromPoint(window.innerWidth / 2, anchorY());
  if (el) return { el, offset: el.getBoundingClientRect().top };
  return { scrollY: window.scrollY };
}

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  // The server snapshot is the cookie-derived language the layout used to render
  // the HTML, so SSR markup, hydration, and client state all agree from the first
  // byte — no post-hydration language flip. The client snapshot reads <html lang>
  // so the rare cookie-less/localStorage-migration case (set pre-paint by the
  // lang-init script) still reconciles without a hydration-mismatch error.
  const domLang = useSyncExternalStore(subscribe, getSnapshot, () => initialLang);
  const [override, setOverride] = useState<Language | null>(null);
  const lang = override ?? domLang;
  const pendingAnchor = useRef<ScrollAnchor | null>(null);

  // Runs after every language-driven re-render commits. Per-language content
  // (subtitles, line-heights, fonts) reflows every block on the page, which
  // would otherwise yank the reading position around; put the anchor element
  // back at the offset it held right before the switch. If the anchor element
  // itself unmounted, there's nothing to re-align to, so scrollY just stays
  // where the browser already left it (the documented fallback).
  useLayoutEffect(() => {
    const anchor = pendingAnchor.current;
    if (!anchor) return;
    pendingAnchor.current = null;

    // Two frames: one for this commit's own paint, one for late-settling
    // reflow (webfont swaps, etc.) triggered by the language change.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if ('el' in anchor) {
          if (!anchor.el.isConnected) return;
          const delta = anchor.el.getBoundingClientRect().top - anchor.offset;
          if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
        }
      });
    });
  }, [lang]);

  function setLang(l: Language) {
    pendingAnchor.current = captureScrollAnchor();
    setOverride(l);
    localStorage.setItem('anushthanam-lang', l);
    document.cookie = `anushthanam-lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = l;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export const SITE_NAMES: Record<Language, string> = {
  en: 'Anuṣṭhāna',
  te: 'అనుష్ఠానం',
  ta: 'அனுஷ்டானம்',
  hi: 'अनुष्ठान',
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'Anuṣṭhāna - EN',
  te: 'అనుష్ఠానం - TE',
  ta: 'அனுஷ்டானம் - TA',
  hi: 'अनुष्ठान - HI',
};

export const LANGUAGES: Language[] = ['en', 'te', 'ta', 'hi'];
