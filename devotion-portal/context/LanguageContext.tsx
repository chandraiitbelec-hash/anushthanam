'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '@/lib/types';

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('anushthanam-lang') as Language | null;
    if (saved && ['en', 'te', 'ta', 'hi'].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem('anushthanam-lang', l);
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
  en: 'Anushthanam',
  te: 'అనుష్ఠానం',
  ta: 'அனுஷ்டானம்',
  hi: 'अनुष्ठान',
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'Anushthanam - EN',
  te: 'అనుష్ఠానం - TE',
  ta: 'அனுஷ்டானம் - TA',
  hi: 'अनुष्ठान - HI',
};

export const LANGUAGES: Language[] = ['en', 'te', 'ta', 'hi'];
