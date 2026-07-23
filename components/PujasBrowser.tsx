'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Puja, Occasion } from '@/lib/types';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import EntityCard from './EntityCard';
import EmptyState from './EmptyState';
import { TabList, TabPanel, useTabs } from './Tabs';

type Props = {
  frequentPujas: Puja[];
  occasions: Occasion[];
  occasionPujas: Record<string, Puja[]>;
};

export default function PujasBrowser({ frequentPujas, occasions, occasionPujas }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];

  const [expandedOccasion, setExpandedOccasion] = useState<string | null>(null);

  const sections = [
    { id: 'frequent',  label: ui.pujasDaily },
    { id: 'occasions', label: ui.pujasOccasions },
  ];
  const { activeTab: activeSection, setActiveTab: setActiveSection, tabRefs, handleKeyDown } = useTabs(sections);

  function toggleOccasion(slug: string) {
    setExpandedOccasion(prev => (prev === slug ? null : slug));
  }

  const nameClass = scriptClass(lang);

  return (
    <>
      {/* Section tab bar — sticky, matches PujaProfile/FestivalProfile pattern */}
      <TabList
        tabs={sections}
        activeTab={activeSection}
        onSelect={setActiveSection}
        tabRefs={tabRefs}
        handleKeyDown={handleKeyDown}
        ariaLabel={ui.pujas}
        idPrefix="pujas"
      />

      {/* Panel 1 — Daily & Frequent (kept in DOM for SEO) */}
      <TabPanel id="frequent" activeTab={activeSection} idPrefix="pujas">
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
      </TabPanel>

      {/* Panel 2 — For Occasions (kept in DOM for SEO) */}
      <TabPanel id="occasions" activeTab={activeSection} idPrefix="pujas">
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
      </TabPanel>
    </>
  );
}
