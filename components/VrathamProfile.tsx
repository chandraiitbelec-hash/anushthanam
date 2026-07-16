'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { formatDateLocalized } from '@/lib/utils';
import type { Vratham, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import PasuramViewer from './PasuramViewer';
import type { DeityRef } from './DeityChips';
import type { ShlokaStanza } from '@/lib/types';

const LABELS: Record<string, Record<string, string>> = {
  fasting:   { en: 'Fasting',      te: 'ఉపవాసం',    ta: 'உபவாசம்',    hi: 'उपवास' },
  benefits:  { en: 'Benefits',     te: 'ఫలితాలు',    ta: 'பலன்கள்',     hi: 'लाभ' },
  materials: { en: 'Materials',    te: 'సామగ్రి',     ta: 'பொருட்கள்',   hi: 'सामग्री' },
  procedure: { en: 'Procedure',    te: 'విధానం',      ta: 'நடைமுறை',     hi: 'विधि' },
  pasurams:  { en: 'Pasurams',     te: 'పాశురాలు',   ta: 'பாசுரங்கள்',   hi: 'पासुर' },
  story:     { en: 'Vrata Katha',  te: 'వ్రత కథ',    ta: 'விரத கதை',    hi: 'व्रत कथा' },
  readStory: { en: 'Read',         te: 'చదవండి',      ta: 'படிக்க',       hi: 'पढ़ें' },
  next:      { en: 'Next',         te: 'తదుపరి',      ta: 'அடுத்தது',    hi: 'अगला' },
};

function lbl(key: string, lang: string) {
  return LABELS[key]?.[lang] ?? LABELS[key]?.en ?? key;
}

type Tab = { id: string; label: string };

type Props = {
  vratham: Vratham;
  steps: ProcedureStep[];
  materials: MaterialItem[];
  deities: DeityRef[];
  stories: Story[];
  stanzas: ShlokaStanza[];
};

export default function VrathamProfile({ vratham, steps, materials, deities, stories, stanzas }: Props) {
  const { lang } = useLang();

  const r = vratham as unknown as Record<string, string>;
  const title    = r[`title_${lang}`]         || vratham.title_en;
  const fasting  = r[`fasting_rules_${lang}`] || vratham.fasting_rules_en;
  const benefits = r[`benefits_${lang}`]      || vratham.benefits_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const tabs: Tab[] = [
    fasting              && { id: 'fasting',   label: lbl('fasting', lang) },
    benefits             && { id: 'benefits',  label: lbl('benefits', lang) },
    materials.length > 0 && { id: 'materials', label: lbl('materials', lang) },
    steps.length > 0     && { id: 'procedure', label: lbl('procedure', lang) },
    stanzas.length > 0   && { id: 'pasurams',  label: lbl('pasurams', lang) },
    stories.length > 0   && { id: 'stories',   label: lbl('story', lang) },
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

        {lang !== 'en' && vratham.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
            {vratham.title_en}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {(vratham.duration || vratham.observance_day) && (
            <span style={{
              padding: '4px 12px',
              background: 'rgba(61,107,79,0.1)',
              border: '1px solid var(--color-green)',
              borderRadius: '20px',
              fontSize: '12px', color: 'var(--color-green)', fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {vratham.duration || vratham.observance_day}
            </span>
          )}
        </div>

        {vratham.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: '0 0 16px' }}>
            {lbl('next', lang)}: {formatDateLocalized(vratham.next_occurrence, lang)}
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
              const panelId = `vratham-panel-${tab.id}`;
              const tabId = `vratham-tab-${tab.id}`;
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

      {/* Tab content */}
      {fasting && (
        <div role="tabpanel" id="vratham-panel-fasting" aria-labelledby="vratham-tab-fasting" hidden={activeTab !== 'fasting'}>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {fasting}
          </p>
        </div>
      )}

      {benefits && (
        <div role="tabpanel" id="vratham-panel-benefits" aria-labelledby="vratham-tab-benefits" hidden={activeTab !== 'benefits'}>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {benefits}
          </p>
        </div>
      )}

      {materials.length > 0 && (
        <div role="tabpanel" id="vratham-panel-materials" aria-labelledby="vratham-tab-materials" hidden={activeTab !== 'materials'}>
          <MaterialsList items={materials} />
        </div>
      )}

      {steps.length > 0 && (
        <div role="tabpanel" id="vratham-panel-procedure" aria-labelledby="vratham-tab-procedure" hidden={activeTab !== 'procedure'}>
          <ProcedureSteps
            steps={steps}
            hasPasurams={stanzas.length > 0}
            onViewPasurams={stanzas.length > 0 ? () => setActiveTab('pasurams') : undefined}
          />
        </div>
      )}

      {stanzas.length > 0 && (
        <div role="tabpanel" id="vratham-panel-pasurams" aria-labelledby="vratham-tab-pasurams" hidden={activeTab !== 'pasurams'}>
          <PasuramViewer stanzas={stanzas} startDate={vratham.shloka_start_date || undefined} />
        </div>
      )}

      {stories.length > 0 && (
        <div role="tabpanel" id="vratham-panel-stories" aria-labelledby="vratham-tab-stories" hidden={activeTab !== 'stories'}>
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
