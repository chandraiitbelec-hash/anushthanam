'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { formatDateLocalized } from '@/lib/utils';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import type { DeityRef } from './DeityChips';

const LABELS: Record<string, Record<string, string>> = {
  significance: { en: 'Significance', te: 'ప్రాముఖ్యత',  ta: 'முக்கியத்துவம்', hi: 'महत्व' },
  materials:    { en: 'Materials',    te: 'సామగ్రి',       ta: 'பொருட்கள்',      hi: 'सामग्री' },
  procedure:    { en: 'Procedure',    te: 'విధానం',        ta: 'நடைமுறை',        hi: 'विधि' },
  story:        { en: 'Stories',      te: 'కథలు',          ta: 'கதைகள்',         hi: 'कथाएं' },
  readStory:    { en: 'Read',         te: 'చదవండి',        ta: 'படிக்க',          hi: 'पढ़ें' },
  next:         { en: 'Next',         te: 'తదుపరి',        ta: 'அடுத்தது',       hi: 'अगला' },
};

function lbl(key: string, lang: string) {
  return LABELS[key]?.[lang] ?? LABELS[key]?.en ?? key;
}

type Tab = { id: string; label: string };

type Props = {
  festival: Festival;
  steps: ProcedureStep[];
  materials: MaterialItem[];
  stories: Story[];
  deities: DeityRef[];
};

export default function FestivalProfile({ festival, steps, materials, stories, deities }: Props) {
  const { lang } = useLang();

  const r = festival as unknown as Record<string, string>;
  const title        = r[`title_${lang}`]        || festival.title_en;
  const significance = r[`significance_${lang}`] || festival.significance_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const tabs: Tab[] = [
    significance       && { id: 'significance', label: lbl('significance', lang) },
    materials.length > 0 && { id: 'materials',  label: lbl('materials', lang) },
    steps.length > 0     && { id: 'procedure',  label: lbl('procedure', lang) },
    stories.length > 0   && { id: 'stories',    label: lbl('story', lang) },
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

        {lang !== 'en' && festival.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 10px' }}>
            {festival.title_en}
          </p>
        )}

        {festival.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: '0 0 16px' }}>
            {lbl('next', lang)}: {formatDateLocalized(festival.next_occurrence, lang)}
          </p>
        )}

        <DeityChips deities={deities} />
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
              const panelId = `festival-panel-${tab.id}`;
              const tabId = `festival-tab-${tab.id}`;
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

      {/* Tab panels */}
      {activeTab === 'significance' && significance && (
        <div role="tabpanel" id="festival-panel-significance" aria-labelledby="festival-tab-significance">
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </div>
      )}

      {activeTab === 'materials' && materials.length > 0 && (
        <div role="tabpanel" id="festival-panel-materials" aria-labelledby="festival-tab-materials">
          <MaterialsList items={materials} />
        </div>
      )}

      {activeTab === 'procedure' && steps.length > 0 && (
        <div role="tabpanel" id="festival-panel-procedure" aria-labelledby="festival-tab-procedure">
          <ProcedureSteps steps={steps} />
        </div>
      )}

      {activeTab === 'stories' && stories.length > 0 && (
        <div role="tabpanel" id="festival-panel-stories" aria-labelledby="festival-tab-stories">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stories.map((s, idx) => {
              const sr = s as unknown as Record<string, string>;
              const t = sr[`title_${lang}`] || s.title_en;
              return (
                <Link key={s.slug} href={`/stories/${s.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 18px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '3px solid var(--color-gold)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.04)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                >
                  {stories.length > 1 && (
                    <span style={{
                      width: '24px', height: '24px', flexShrink: 0,
                      background: 'rgba(184,134,11,0.1)', border: '1px solid var(--color-gold)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: 'var(--color-gold)',
                    }}>{idx + 1}</span>
                  )}
                  <span className={nameClass} style={{
                    flex: 1, fontSize: '15px', fontWeight: 500,
                    fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
                    color: 'var(--color-text-primary)',
                  }}>{t}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 600, flexShrink: 0 }}>
                    {lbl('readStory', lang)} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
