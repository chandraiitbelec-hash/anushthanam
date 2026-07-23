'use client';

import { useLang } from '@/context/LanguageContext';
import { formatDateLocalized, scriptClass } from '@/lib/utils';
import { UI } from '@/lib/ui-strings';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import StoryLinkList from './StoryLinkList';
import { TabList, TabPanel, useTabs } from './Tabs';
import type { DeityRef } from './DeityChips';

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

  const nameClass = scriptClass(lang);

  const tabs: Tab[] = [
    significance       && { id: 'significance', label: UI[lang].significance },
    materials.length > 0 && { id: 'materials',  label: UI[lang].materials },
    steps.length > 0     && { id: 'procedure',  label: UI[lang].procedure },
    stories.length > 0   && { id: 'stories',    label: UI[lang].festivalStories },
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
          // Tallest script variant sets a floor so switching scripts doesn't shift the page start.
          minHeight: 'calc(clamp(32px, 5vw, 52px) * 1.5)',
        }}>
          {title}
        </h1>

        {festival.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 10px', visibility: lang === 'en' ? 'hidden' : 'visible' }}>
            {festival.title_en}
          </p>
        )}

        {festival.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: '0 0 16px' }}>
            {UI[lang].next}: {formatDateLocalized(festival.next_occurrence, lang)}
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
          <StoryLinkList stories={stories} readLabel={UI[lang].readStory} />
        </TabPanel>
      )}
    </>
  );
}
