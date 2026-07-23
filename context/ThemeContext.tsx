'use client';

import { createContext, useContext, useState, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark' | 'system';

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

function subscribe() {
  return () => {};
}

function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : 'system';
}

function getServerSnapshot(): Theme {
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore renders 'system' (matching the static SSR shell) during
  // hydration, then re-renders with the real value the beforeInteractive
  // theme-init script set as data-theme — without a hydration-mismatch error.
  const domTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<Theme | null>(null);
  const theme = override ?? domTheme;

  function setTheme(t: Theme) {
    setOverride(t);
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
