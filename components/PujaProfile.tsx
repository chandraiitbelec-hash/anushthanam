'use client';

import { useLang } from '@/context/LanguageContext';
import type { Puja, ProcedureStep, MaterialItem } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import { TabList, TabPanel, useTabs } from './Tabs';

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

  const { activeTab, setActiveTab, tabRefs, handleKeyDown } = useTabs(tabs);

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
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onSelect={setActiveTab}
          tabRefs={tabRefs}
          handleKeyDown={handleKeyDown}
          ariaLabel={title}
          idPrefix="puja"
        />
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
        <TabPanel id="materials" activeTab={activeTab} idPrefix="puja">
          <MaterialsList items={materials} />
        </TabPanel>
      )}

      {steps.length > 0 && (
        <TabPanel id="procedure" activeTab={activeTab} idPrefix="puja">
          <ProcedureSteps steps={steps} />
        </TabPanel>
      )}
    </>
  );
}
