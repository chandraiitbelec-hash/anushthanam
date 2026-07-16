'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    // Sync localStorage → state only when it disagrees with the server-seeded value.
    // This handles the one-time migration for users who had localStorage but no cookie.
    const saved = localStorage.getItem('anushthanam-lang') as Language | null;
    if (saved && VALID_LANGS.includes(saved) && saved !== lang) {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.cookie = `anushthanam-lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setLang(l: Language) {
    setLangState(l);
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
