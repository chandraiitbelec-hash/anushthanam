'use client';

import { useLang } from '@/context/LanguageContext';
import { formatDateLocalized, scriptClass } from '@/lib/utils';
import { UI } from '@/lib/ui-strings';
import type { Vratham, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import PasuramViewer from './PasuramViewer';
import StoryLinkList from './StoryLinkList';
import { TabList, TabPanel, useTabs } from './Tabs';
import type { DeityRef } from './DeityChips';
import type { ShlokaStanza } from '@/lib/types';

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

  const nameClass = scriptClass(lang);

  const tabs: Tab[] = [
    fasting              && { id: 'fasting',   label: UI[lang].fasting },
    benefits             && { id: 'benefits',  label: UI[lang].benefits },
    materials.length > 0 && { id: 'materials', label: UI[lang].materials },
    steps.length > 0     && { id: 'procedure', label: UI[lang].procedure },
    stanzas.length > 0   && { id: 'pasurams',  label: UI[lang].pasurams },
    stories.length > 0   && { id: 'stories',   label: UI[lang].vrataKatha },
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
            {UI[lang].next}: {formatDateLocalized(vratham.next_occurrence, lang)}
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
          idPrefix="vratham"
        />
      )}

      {/* Tab content */}
      {fasting && (
        <TabPanel id="fasting" activeTab={activeTab} idPrefix="vratham">
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {fasting}
          </p>
        </TabPanel>
      )}

      {benefits && (
        <TabPanel id="benefits" activeTab={activeTab} idPrefix="vratham">
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {benefits}
          </p>
        </TabPanel>
      )}

      {materials.length > 0 && (
        <TabPanel id="materials" activeTab={activeTab} idPrefix="vratham">
          <MaterialsList items={materials} />
        </TabPanel>
      )}

      {steps.length > 0 && (
        <TabPanel id="procedure" activeTab={activeTab} idPrefix="vratham">
          <ProcedureSteps
            steps={steps}
            hasPasurams={stanzas.length > 0}
            onViewPasurams={stanzas.length > 0 ? () => setActiveTab('pasurams') : undefined}
          />
        </TabPanel>
      )}

      {stanzas.length > 0 && (
        <TabPanel id="pasurams" activeTab={activeTab} idPrefix="vratham">
          <PasuramViewer stanzas={stanzas} startDate={vratham.shloka_start_date || undefined} />
        </TabPanel>
      )}

      {stories.length > 0 && (
        <TabPanel id="stories" activeTab={activeTab} idPrefix="vratham">
          <StoryLinkList stories={stories} readLabel={UI[lang].readStory} />
        </TabPanel>
      )}
    </>
  );
}
