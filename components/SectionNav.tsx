'use client';

import { useState, useEffect, useRef } from 'react';

export type NavSection = { id: string; label: string };

export default function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  // Prevent observer from overriding active while the page is mid-smooth-scroll
  const ignoreObserver = useRef(false);
  const ignoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        if (ignoreObserver.current) return;
        // Pick the topmost intersecting section
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
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

    // Lock the observer so the smooth-scroll doesn't reassign active
    ignoreObserver.current = true;
    setActive(id);
    if (ignoreTimer.current) clearTimeout(ignoreTimer.current);
    ignoreTimer.current = setTimeout(() => {
      ignoreObserver.current = false;
    }, 900);

    // Offset by the sticky nav + chip bar (single source of truth: --section-anchor-offset)
    const offsetStr = getComputedStyle(document.documentElement).getPropertyValue('--section-anchor-offset');
    const offset = parseInt(offsetStr, 10) || 137;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  if (sections.length < 2) return null;

  return (
    <>
      <div
        className="section-nav-bar"
        style={{
          position: 'sticky',
          top: 'var(--nav-height)',
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
                  // Generous tap target on mobile
                  minHeight: '36px',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
