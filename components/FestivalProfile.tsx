'use client';

import { useLang } from '@/context/LanguageContext';
import { formatDateLocalized } from '@/lib/utils';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import StoryLinkList from './StoryLinkList';
import { TabList, TabPanel, useTabs } from './Tabs';
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
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onSelect={setActiveTab}
          tabRefs={tabRefs}
          handleKeyDown={handleKeyDown}
          ariaLabel={title}
          idPrefix="festival"
        />
      )}

      {/* Tab panels */}
      {significance && (
        <TabPanel id="significance" activeTab={activeTab} idPrefix="festival">
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </TabPanel>
      )}

      {materials.length > 0 && (
        <TabPanel id="materials" activeTab={activeTab} idPrefix="festival">
          <MaterialsList items={materials} />
        </TabPanel>
      )}

      {steps.length > 0 && (
        <TabPanel id="procedure" activeTab={activeTab} idPrefix="festival">
          <ProcedureSteps steps={steps} />
        </TabPanel>
      )}

      {stories.length > 0 && (
        <TabPanel id="stories" activeTab={activeTab} idPrefix="festival">
          <StoryLinkList stories={stories} readLabel={lbl('readStory', lang)} />
        </TabPanel>
      )}
    </>
  );
}
