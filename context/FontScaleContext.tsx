'use client';

import { createContext, useContext, useState, useSyncExternalStore } from 'react';

export type FontScale = 1 | 1.15 | 1.3;

const SCALES: FontScale[] = [1, 1.15, 1.3];

type FontScaleContextType = {
  scale: FontScale;
  cycleScale: () => void;
};

const FontScaleContext = createContext<FontScaleContextType>({
  scale: 1,
  cycleScale: () => {},
});

function subscribe() {
  return () => {};
}

function getSnapshot(): FontScale {
  const saved = Number(localStorage.getItem('anushthanam-font-scale'));
  return SCALES.includes(saved as FontScale) ? (saved as FontScale) : 1;
}

function getServerSnapshot(): FontScale {
  return 1;
}

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore renders scale=1 during hydration (matching SSR), then
  // re-renders with the real localStorage value right after mount — avoiding
  // a hydration-mismatch error without setState-in-effect.
  const savedScale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [override, setOverride] = useState<FontScale | null>(null);
  const scale = override ?? savedScale;

  function cycleScale() {
    const next = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length];
    localStorage.setItem('anushthanam-font-scale', String(next));
    setOverride(next);
  }

  return (
    <FontScaleContext.Provider value={{ scale, cycleScale }}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  return useContext(FontScaleContext);
}
