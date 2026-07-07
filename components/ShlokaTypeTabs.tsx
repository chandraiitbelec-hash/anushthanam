'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import EntityCard from '@/components/EntityCard';
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
  const [active, setActive] = useState(groups[0]?.type ?? '');

  const activeGroup = groups.find(g => g.type === active) ?? groups[0];

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        position: 'sticky',
        top: 'var(--nav-height)',
        zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        margin: '0 -24px 24px',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {groups.map(g => {
            const isActive = g.type === active;
            return (
              <button
                key={g.type}
                onClick={() => setActive(g.type)}
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
                {typeLabel(g.type, lang)}
                <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>{g.shlokas.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active panel */}
      {activeGroup && (
        <div className="entity-grid">
          {activeGroup.shlokas.map(s => (
            <EntityCard
              key={s.slug}
              href={`/shlokas/${s.slug}`}
              names={{ en: s.title_en, te: s.title_te, ta: s.title_ta, hi: s.title_hi }}
              badge={s.type || undefined}
              badgeColor="gold"
            />
          ))}
        </div>
      )}
    </div>
  );
}
