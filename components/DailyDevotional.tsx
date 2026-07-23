'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import type { DailyDevotionalEntry as Entry } from '@/lib/daily-devotional';

type Tab = 'shloka' | 'story';

function langField(obj: Record<string, string>, field: string, lang: string): string {
  return obj[`${field}_${lang}`] || obj[`${field}_en`] || '';
}

function Pill({ label, active, onClick, controls }: { label: string; active: boolean; onClick: () => void; controls: string }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={active}
      aria-controls={controls}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '7px 16px',
        borderRadius: '20px',
        border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
        background: active ? 'rgba(184,134,11,0.1)' : 'transparent',
        color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span style={{
        fontSize: '9px',
        opacity: 0.7,
        display: 'inline-block',
        transform: active ? 'rotate(180deg)' : 'none',
      }}>▾</span>
    </button>
  );
}

export default function DailyDevotional({ entry }: { entry: Entry }) {
  const { lang } = useLang();
  const ui = UI[lang];
  const [open, setOpen] = useState<Tab | null>(null);

  const nameClass = scriptClass(lang);

  function toggle(tab: Tab) {
    setOpen(prev => prev === tab ? null : tab);
  }

  return (
    <section style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="wide-width" style={{ padding: '18px 24px' }}>

        {/* Always-visible row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', margin: '0 0 1px' }}>
              {ui.devotionalHeading}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {entry.deity}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Pill label={ui.shlokaOfDay} active={open === 'shloka'} onClick={() => toggle('shloka')} controls="daily-shloka-panel" />
            <Pill label={ui.storyOfDay}  active={open === 'story'}  onClick={() => toggle('story')}  controls="daily-story-panel" />
          </div>
        </div>

        {/* Expandable: Shloka */}
        {open === 'shloka' && (
          <div id="daily-shloka-panel" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '16px' }}>
              {/* Show shloka in user's script; Sanskrit (Devanagari) shown below as reference for non-Hindi */}
              {lang === 'te' && (
                <p className="script-telugu" style={{ fontSize: '18px', lineHeight: 2.0, color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
                  {(entry.shloka as unknown as Record<string, string>).script_te}
                </p>
              )}
              {lang === 'ta' && (
                <p className="script-tamil" style={{ fontSize: '18px', lineHeight: 2.1, color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
                  {(entry.shloka as unknown as Record<string, string>).script_ta}
                </p>
              )}
              {(lang === 'en' || lang === 'hi') && (
                <p className="script-devanagari" style={{ fontSize: '18px', lineHeight: 1.9, color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'pre-line' }}>
                  {entry.shloka.sanskrit}
                </p>
              )}
              {/* Sanskrit reference for Telugu/Tamil; IAST for English */}
              {(lang === 'te' || lang === 'ta') && (
                <p className="script-devanagari" style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--color-text-secondary)', margin: '8px 0 0', whiteSpace: 'pre-line', opacity: 0.7 }}>
                  {entry.shloka.sanskrit}
                </p>
              )}
              {lang === 'en' && (
                <p className="script-iast" style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--color-text-secondary)', margin: '8px 0 0', whiteSpace: 'pre-line', opacity: 0.8 }}>
                  {entry.shloka.iast}
                </p>
              )}
            </div>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
                {ui.meaning}
              </p>
              <p className={nameClass} style={{ fontSize: '14px', lineHeight: lang === 'ta' ? 1.9 : lang === 'te' ? 1.8 : 1.7, color: 'var(--color-text-primary)', margin: 0 }}>
                {langField(entry.shloka as unknown as Record<string, string>, 'meaning', lang)}
              </p>
            </div>

            <div style={{ background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.18)', borderRadius: '8px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)', margin: '0 0 6px' }}>
                {ui.reflection}
              </p>
              <p className={nameClass} style={{ fontSize: '13px', lineHeight: lang === 'ta' ? 1.9 : lang === 'te' ? 1.8 : 1.7, color: 'var(--color-text-secondary)', margin: 0, fontStyle: lang === 'en' ? 'italic' : 'normal' }}>
                {langField(entry.shloka as unknown as Record<string, string>, 'reflection', lang)}
              </p>
            </div>
          </div>
        )}

        {/* Expandable: Story */}
        {open === 'story' && (
          <div id="daily-story-panel" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 className={nameClass} style={{ fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined, fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: lang === 'en' ? 700 : 500, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.25 }}>
                {langField(entry.story as unknown as Record<string, string>, 'title', lang)}
              </h3>
              {entry.story.source && (
                <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-saffron)', background: 'rgba(212,98,42,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                  {entry.story.source}
                </span>
              )}
            </div>

            <div className={nameClass} style={{ fontSize: '16px', lineHeight: lang === 'ta' ? 1.95 : lang === 'te' ? 1.85 : 1.8, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {langField(entry.story as unknown as Record<string, string>, 'body', lang)
                .split('\n\n')
                .map((para, i) => <p key={i} style={{ margin: 0 }}>{para}</p>)}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
