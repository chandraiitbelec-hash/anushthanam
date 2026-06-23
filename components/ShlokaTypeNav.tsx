'use client';

import { useEffect, useRef, useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  ashtothram: 'Ashtothram',
  sahasranamam: 'Sahasranamam',
  chalisa: 'Chalisa',
  stotra: 'Stotra',
  kavacham: 'Kavacham',
  suprabhatam: 'Suprabhatam',
  namavali: 'Namavali',
  other: 'Other',
};

export default function ShlokaTypeNav({ types }: { types: string[] }) {
  const [active, setActive] = useState<string>(types[0] ?? '');
  const scrolling = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (scrolling.current) return;
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace('section-', ''));
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    types.forEach(t => {
      const el = document.getElementById(`section-${t}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [types]);

  function scrollTo(type: string) {
    const el = document.getElementById(`section-${type}`);
    if (!el) return;
    setActive(type);
    scrolling.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { scrolling.current = false; }, 800);
  }

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      margin: '0 0 32px',
    }}>
      {types.map(t => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => scrollTo(t)}
            style={{
              padding: '6px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              border: isActive
                ? '1px solid var(--color-gold)'
                : '1px solid var(--color-border)',
              background: isActive
                ? 'rgba(184,134,11,0.12)'
                : 'var(--color-surface)',
              color: isActive
                ? 'var(--color-gold)'
                : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
