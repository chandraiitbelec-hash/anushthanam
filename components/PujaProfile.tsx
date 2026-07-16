'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useLang } from '@/context/LanguageContext';
import type { Puja, ProcedureStep, MaterialItem } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';

const LABELS: Record<string, Record<string, string>> = {
  materials: { en: 'Materials', te: 'సామగ్రి', ta: 'பொருட்கள்', hi: 'सामग्री' },
  procedure: { en: 'Procedure', te: 'విధానం',  ta: 'நடைமுறை',   hi: 'विधि' },
  min:       { en: 'min',       te: 'నిమి',      ta: 'நிமி',      hi: 'मिनट' },
};

function lbl(key: string, lang: string) {
  return LABELS[key]?.[lang] ?? LABELS[key]?.en ?? key;
}

type Tab = { id: string; label: string };

type Props = {
  puja: Puja;
  steps: ProcedureStep[];
  materials: MaterialItem[];
};

export default function PujaProfile({ puja, steps, materials }: Props) {
  const { lang } = useLang();

  const r = puja as unknown as Record<string, string>;
  const title = r[`title_${lang}`] || puja.title_en;
  const description = r[`brief_description_${lang}`] || puja.brief_description_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const tabs: Tab[] = [
    materials.length > 0 && { id: 'materials', label: lbl('materials', lang) },
    steps.length > 0     && { id: 'procedure', label: lbl('procedure', lang) },
  ].filter(Boolean) as Tab[];

  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? '');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      tabRefs.current[next]?.focus();
      setActiveTab(tabs[next].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      tabRefs.current[prev]?.focus();
      setActiveTab(tabs[prev].id);
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className={nameClass} style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}>
          {title}
        </h1>

        {lang !== 'en' && puja.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 10px' }}>
            {puja.title_en}
          </p>
        )}

        {puja.duration_minutes && (
          <p style={{ fontSize: '14px', color: 'var(--color-gold)', fontWeight: 500, margin: '0 0 16px' }}>
            {puja.duration_minutes} {lbl('min', lang)}
          </p>
        )}

        {description && (
          <p className={nameClass} style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>

      {/* Tab bar */}
      {tabs.length > 1 && (
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
            style={{
              display: 'flex',
              gap: '0',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {tabs.map((tab, idx) => {
              const isActive = tab.id === activeTab;
              const panelId = `puja-panel-${tab.id}`;
              const tabId = `puja-tab-${tab.id}`;
              return (
                <button
                  key={tab.id}
                  id={tabId}
                  ref={el => { tabRefs.current[idx] = el; }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={e => handleKeyDown(e, idx)}
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
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single-section pages get a heading since there's no tab bar to label the content */}
      {tabs.length === 1 && (
        <h2 style={{
          fontSize: '13px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
          margin: '32px 0 16px',
        }}>
          {tabs[0].label}
        </h2>
      )}

      {/* Tab panels — all rendered, inactive ones hidden (kept in the DOM for SEO) */}
      {materials.length > 0 && (
        <div role="tabpanel" id="puja-panel-materials" aria-labelledby="puja-tab-materials" hidden={tabs.length > 1 && activeTab !== 'materials'}>
          <MaterialsList items={materials} />
        </div>
      )}

      {steps.length > 0 && (
        <div role="tabpanel" id="puja-panel-procedure" aria-labelledby="puja-tab-procedure" hidden={tabs.length > 1 && activeTab !== 'procedure'}>
          <ProcedureSteps steps={steps} />
        </div>
      )}
    </>
  );
}
