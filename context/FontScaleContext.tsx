'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScaleState] = useState<FontScale>(1);

  useEffect(() => {
    const saved = Number(localStorage.getItem('anushthanam-font-scale'));
    if (SCALES.includes(saved as FontScale)) setScaleState(saved as FontScale);
  }, []);

  function cycleScale() {
    setScaleState(prev => {
      const next = SCALES[(SCALES.indexOf(prev) + 1) % SCALES.length];
      localStorage.setItem('anushthanam-font-scale', String(next));
      return next;
    });
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
