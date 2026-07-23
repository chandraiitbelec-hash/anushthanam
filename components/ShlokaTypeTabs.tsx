'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import EntityCard from '@/components/EntityCard';
import { TabList, TabPanel, useTabs } from './Tabs';
import type { Shloka, Language } from '@/lib/types';

const TYPE_LABELS: Record<string, Record<Language, string>> = {
  ashtothram:   { en: 'Ashtothram',   te: 'అష్టోత్తరం',   ta: 'அஷ்டோத்திரம்',  hi: 'अष्टोत्तरम्' },
  sahasranamam: { en: 'Sahasranamam', te: 'సహస్రనామం',    ta: 'சஹஸ்ரநாமம்',    hi: 'सहस्रनामम्' },
  chalisa:      { en: 'Chalisa',      te: 'చాలీసా',        ta: 'சாலீசா',         hi: 'चालीसा' },
  stotra:       { en: 'Stotra',       te: 'స్తోత్రం',      ta: 'ஸ்தோத்திரம்',   hi: 'स्तोत्र' },
  kavacham:     { en: 'Kavacham',     te: 'కవచం',          ta: 'கவசம்',          hi: 'कवचम्' },
  suprabhatam:  { en: 'Suprabhatam',  te: 'సుప్రభాతం',    ta: 'சுப்ரபாதம்',    hi: 'सुप्रभातम्' },
  namavali:     { en: 'Namavali',     te: 'నామావళి',       ta: 'நாமாவளி',       hi: 'नामावली' },
  other:        { en: 'Other',        te: 'ఇతరాలు',        ta: 'மற்றவை',         hi: 'अन्य' },
};

function typeLabel(type: string, lang: Language) {
  return TYPE_LABELS[type]?.[lang] ?? TYPE_LABELS[type]?.en ?? type.charAt(0).toUpperCase() + type.slice(1);
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
