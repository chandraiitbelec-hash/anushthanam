'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Puja, Occasion } from '@/lib/types';
import { UI } from '@/lib/ui-strings';
import EntityCard from './EntityCard';
import EmptyState from './EmptyState';

type Props = {
  frequentPujas: Puja[];
  occasions: Occasion[];
  occasionPujas: Record<string, Puja[]>;
};

type SectionId = 'frequent' | 'occasions';

export default function PujasBrowser({ frequentPujas, occasions, occasionPujas }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];

  const [activeSection, setActiveSection] = useState<SectionId>('frequent');
  const [expandedOccasion, setExpandedOccasion] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const sections: { id: SectionId; label: string }[] = [
    { id: 'frequent',  label: ui.pujasDaily },
    { id: 'occasions', label: ui.pujasOccasions },
  ];

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % sections.length;
      tabRefs.current[next]?.focus();
      setActiveSection(sections[next].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + sections.length) % sections.length;
      tabRefs.current[prev]?.focus();
      setActiveSection(sections[prev].id);
    }
  }

  function toggleOccasion(slug: string) {
    setExpandedOccasion(prev => (prev === slug ? null : slug));
  }

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <>
      {/* Section tab bar — sticky, matches PujaProfile/FestivalProfile pattern */}
      <div style={{
        position: 'sticky',
        top: 'var(--nav-height)',
        zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        margin: '0 -24px 32px',
        padding: '0 24px',
      }}>
        <div
          role="tablist"
          aria-label={ui.pujas}
          style={{
            display: 'flex',
            gap: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sections.map((section, idx) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                id={`pujas-tab-${section.id}`}
                ref={el => { tabRefs.current[idx] = el; }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`pujas-panel-${section.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveSection(section.id)}
                onKeyDown={e => handleTabKeyDown(e, idx)}
                style={{
                  flexShrink: 0,
                  padding: '12px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--color-gold)' : 'transparent'}`,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s',
                  minHeight: '44px',
                }}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel 1 — Daily & Frequent (kept in DOM for SEO) */}
      <div
        role="tabpanel"
        id="pujas-panel-frequent"
        aria-labelledby="pujas-tab-frequent"
        hidden={activeSection !== 'frequent'}
      >
        {frequentPujas.length === 0 ? (
          <EmptyState type="pujas" />
        ) : (
          <div className="entity-grid">
            {frequentPujas.map(p => (
              <EntityCard
                key={p.slug}
                href={`/pujas/${p.slug}`}
                names={{ en: p.title_en, te: p.title_te, ta: p.title_ta, hi: p.title_hi }}
                badge={p.duration_minutes ? `${p.duration_minutes} ${ui.minutesShort}` : undefined}
                badgeColor="gold"
              />
            ))}
          </div>
        )}
      </div>

      {/* Panel 2 — For Occasions (kept in DOM for SEO) */}
      <div
        role="tabpanel"
        id="pujas-panel-occasions"
        aria-labelledby="pujas-tab-occasions"
        hidden={activeSection !== 'occasions'}
      >
        {occasions.length === 0 ? (
          <EmptyState type="occasions" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {occasions.map(occ => {
              const ov = occ as unknown as Record<string, string>;
              const title = ov[`title_${lang}`] || occ.title_en;
              const description = ov[`description_${lang}`] || occ.description_en;
              const isExpanded = expandedOccasion === occ.slug;
              const pujas = occasionPujas[occ.slug] ?? [];

              return (
                <div
                  key={occ.slug}
                  style={{
                    border: `1px solid ${isExpanded ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    borderRadius: '10px',
                    background: 'var(--color-surface)',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Accordion trigger */}
                  <button
                    id={`occ-trigger-${occ.slug}`}
                    aria-expanded={isExpanded}
                    aria-controls={`occ-panel-${occ.slug}`}
                    onClick={() => toggleOccasion(occ.slug)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {occ.icon && (
                      <span style={{ fontSize: '24px', flexShrink: 0 }} aria-hidden="true">
                        {occ.icon}
                      </span>
                    )}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        className={nameClass}
                        style={{
                          display: 'block',
                          fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
                          fontSize: lang === 'en' ? '17px' : '16px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {title}
                      </span>
                      {lang !== 'en' && occ.title_en && (
                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {occ.title_en}
                        </span>
                      )}
                      {description && (
                        <span
                          className={nameClass}
                          style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}
                        >
                          {description}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        fontSize: '18px',
                        color: 'var(--color-text-secondary)',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                        lineHeight: 1,
                      }}
                    >
                      ▾
                    </span>
                  </button>

                  {/* Accordion panel — kept in DOM for SEO */}
                  <div
                    id={`occ-panel-${occ.slug}`}
                    role="region"
                    aria-labelledby={`occ-trigger-${occ.slug}`}
                    hidden={!isExpanded}
                    style={{ borderTop: '1px solid var(--color-border)', padding: '16px' }}
                  >
                    {pujas.length === 0 ? (
                      <EmptyState type="occasion-pujas" />
                    ) : (
                      <div className="entity-grid">
                        {pujas.map(p => (
                          <EntityCard
                            key={p.slug}
                            href={`/pujas/${p.slug}`}
                            names={{ en: p.title_en, te: p.title_te, ta: p.title_ta, hi: p.title_hi }}
                            badge={p.duration_minutes ? `${p.duration_minutes} ${ui.minutesShort}` : undefined}
                            badgeColor="gold"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
