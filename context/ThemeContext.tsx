'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

function applyTheme(t: Theme) {
  if (t === 'light' || t === 'dark') {
    document.documentElement.setAttribute('data-theme', t);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function ThemeProvider({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  useEffect(() => {
    // One-time migration: sync localStorage → state when it disagrees with the
    // server-seeded cookie value (e.g. first visit after cookies were cleared).
    const saved = localStorage.getItem('anushthanam-theme') as Theme | null;
    if (saved && VALID_THEMES.includes(saved) && saved !== theme) {
      setThemeState(saved);
      applyTheme(saved);
      document.cookie = `anushthanam-theme=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      // Reconcile the DOM with the server-seeded value in case SSR set a
      // data-theme attribute that doesn't match the JS-side initial state.
      applyTheme(initialTheme);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem('anushthanam-theme', t);
    document.cookie = `anushthanam-theme=${t}; path=/; max-age=31536000; SameSite=Lax`;
    applyTheme(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
