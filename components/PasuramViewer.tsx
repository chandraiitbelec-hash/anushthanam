'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import ShlokaViewer from './ShlokaViewer';
import type { ShlokaStanza } from '@/lib/types';

function getTodayDayNumber(startDateStr: string): number | null {
  const start = new Date(startDateStr);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return diff >= 0 && diff < 30 ? diff + 1 : null;
}

function shortName(label: string): string {
  const colon = label.indexOf(': ');
  return colon >= 0 ? label.slice(colon + 2) : label;
}

export default function PasuramViewer({
  stanzas,
  startDate,
}: {
  stanzas: ShlokaStanza[];
  startDate?: string;
}) {
  const { lang } = useLang();
  const ui = UI[lang];
  const todayDay = startDate ? getTodayDayNumber(startDate) : null;
  const [selected, setSelected] = useState<number>(todayDay ?? 1);

  const selectedStanza = stanzas.find(s => s.stanza_number === selected);

  return (
    <div>
      {todayDay && (
        <p style={{
          fontSize: '13px',
          color: 'var(--color-saffron)',
          fontWeight: 500,
          margin: '0 0 16px',
        }}>
          {ui.todaysPasuram} — Day {todayDay}
        </p>
      )}

      {/* Day grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
        gap: '6px',
        marginBottom: '24px',
      }}>
        {stanzas.map(s => {
          const isToday = s.stanza_number === todayDay;
          const isSelected = s.stanza_number === selected;
          return (
            <button
              key={s.stanza_number}
              onClick={() => setSelected(s.stanza_number)}
              title={s.stanza_label}
              style={{
                position: 'relative',
                padding: '8px 6px',
                borderRadius: '8px',
                border: `1.5px solid ${
                  isSelected ? 'var(--color-gold)'
                  : isToday ? 'var(--color-saffron)'
                  : 'var(--color-border)'
                }`,
                background: isSelected
                  ? 'rgba(184,134,11,0.12)'
                  : isToday
                  ? 'rgba(212,98,42,0.07)'
                  : 'var(--color-surface)',
                color: isSelected
                  ? 'var(--color-gold)'
                  : isToday
                  ? 'var(--color-saffron)'
                  : 'var(--color-text-secondary)',
                fontWeight: isSelected || isToday ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {isToday && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--color-saffron)',
                  display: 'block',
                }} />
              )}
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                {s.stanza_number}
              </div>
              <div style={{
                fontSize: '9px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: 0.85,
              }}>
                {shortName(s.stanza_label ?? '')}
              </div>
            </button>
          );
        })}
      </div>

      {selectedStanza && <ShlokaViewer stanzas={[selectedStanza]} />}
    </div>
  );
}
