'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import EntityCard from '@/components/EntityCard';
import { TabList, TabPanel, useTabs } from './Tabs';
import type { Shloka, Language } from '@/lib/types';

function typeLabel(type: string, lang: Language) {
  const ui = UI[lang];
  const key = ('shlokaType' + type.charAt(0).toUpperCase() + type.slice(1)) as keyof typeof ui;
  return (ui[key] as string) ?? type.charAt(0).toUpperCase() + type.slice(1);
}

type Group = { type: string; shlokas: Shloka[] };

export default function ShlokaTypeTabs({ groups }: { groups: Group[] }) {
  const { lang } = useLang();
  const ui = UI[lang];

  const tabs = groups.map(g => ({ id: g.type, label: typeLabel(g.type, lang) }));
  const { activeTab, setActiveTab, tabRefs, handleKeyDown } = useTabs(tabs);

  return (
    <div>
      <TabList
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabRefs={tabRefs}
        handleKeyDown={handleKeyDown}
        ariaLabel={ui.shlokas}
        idPrefix="shloka"
        wrap
        suffix={tab => {
          const count = groups.find(g => g.type === tab.id)?.shlokas.length ?? 0;
          return <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>{count}</span>;
        }}
      />

      {/* Panels — all rendered, inactive ones hidden (kept in the DOM for SEO) */}
      {groups.map(g => (
        <TabPanel key={g.type} id={g.type} activeTab={activeTab} idPrefix="shloka" className="entity-grid">
          {g.shlokas.map(s => (
            <EntityCard
              key={s.slug}
              href={`/shlokas/${s.slug}`}
              names={{ en: s.title_en, te: s.title_te, ta: s.title_ta, hi: s.title_hi }}
              badge={s.type ? typeLabel(s.type, lang) : undefined}
              badgeColor="gold"
            />
          ))}
        </TabPanel>
      ))}
    </div>
  );
}
