'use client';

import { useState, useEffect, useRef } from 'react';

export type NavSection = { id: string; label: string };

export default function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        // Pick the topmost intersecting section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 },
    );

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for sticky nav + chip bar
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  }

  if (sections.length < 2) return null;

  return (
    <div
      ref={barRef}
      style={{
        position: 'sticky',
        top: '57px', // sits just under the main nav
        zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        margin: '0 -24px 32px',
        padding: '10px 24px',
      }}
    >
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {sections.map(s => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                flexShrink: 0,
                padding: '5px 16px',
                background: isActive ? 'var(--color-gold)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
