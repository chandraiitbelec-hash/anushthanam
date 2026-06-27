'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Language } from '@/lib/types';

const TYPE_LABELS: Record<string, Record<Language, string>> = {
  ashtothram:  { en: 'Ashtothram',  te: 'అష్టోత్తరం',    ta: 'அஷ்டோத்திரம்',  hi: 'अष्टोत्तरम्' },
  sahasranamam:{ en: 'Sahasranamam',te: 'సహస్రనామం',     ta: 'சஹஸ்ரநாமம்',    hi: 'सहस्रनामम्' },
  chalisa:     { en: 'Chalisa',     te: 'చాలీసా',         ta: 'சாலீசா',         hi: 'चालीसा' },
  stotra:      { en: 'Stotra',      te: 'స్తోత్రం',       ta: 'ஸ்தோத்திரம்',   hi: 'स्तोत्र' },
  kavacham:    { en: 'Kavacham',    te: 'కవచం',           ta: 'கவசம்',          hi: 'कवचम्' },
  suprabhatam: { en: 'Suprabhatam', te: 'సుప్రభాతం',     ta: 'சுப்ரபாதம்',    hi: 'सुप्रभातम्' },
  namavali:    { en: 'Namavali',    te: 'నామావళి',        ta: 'நாமாவளி',       hi: 'नामावली' },
  other:       { en: 'Other',       te: 'ఇతరాలు',         ta: 'மற்றவை',         hi: 'अन्य' },
};

export default function ShlokaTypeNav({ types }: { types: string[] }) {
  const { lang } = useLang();
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
      position: 'sticky',
      top: 'var(--nav-height)',
      zIndex: 10,
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      padding: '10px 0',
      margin: '0 0 24px',
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
            {TYPE_LABELS[t]?.[lang] ?? TYPE_LABELS[t]?.en ?? t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
