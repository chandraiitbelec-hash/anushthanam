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

export function ThemeProvider({
  children,
  initialTheme = 'system',
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  // The server snapshot is the cookie-derived theme the layout used to render
  // the HTML (data-theme attribute), so SSR, hydration, and client state agree
  // from the first byte. The client snapshot reads the DOM attribute so the
  // cookie-less/localStorage case (set pre-paint by theme-init) reconciles
  // without a hydration-mismatch error.
  const domTheme = useSyncExternalStore(subscribe, getSnapshot, () => initialTheme);
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
