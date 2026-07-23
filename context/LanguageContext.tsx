'use client';

import { createContext, useContext, useState, useSyncExternalStore } from 'react';
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

function getServerSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore renders 'en' (matching the static SSR shell) during
  // hydration, then re-renders with the real value the beforeInteractive
  // lang-init script set on <html lang> — without a hydration-mismatch error.
  const domLang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<Language | null>(null);
  const lang = override ?? domLang;

  function setLang(l: Language) {
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
