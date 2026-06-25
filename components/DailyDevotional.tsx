'use client';

import { useState } from 'react';
import { useLang } from '@/context/LanguageContext';
import devotionalData from '@/lib/data/daily-devotional.json';

type Entry = typeof devotionalData[0];

const LABELS = {
  heading:  { en: "Today's Devotional", te: 'నేటి భక్తి',    ta: 'இன்றைய பக்தி',  hi: 'आज की भक्ति' },
  shloka:   { en: 'Shloka of the Day',  te: 'నేటి శ్లోకం',   ta: 'இன்றைய ஸ்லோகம்', hi: 'आज का श्लोक' },
  story:    { en: 'Story of the Day',   te: 'నేటి కథ',       ta: 'இன்றைய கதை',    hi: 'आज की कहानी' },
  meaning:  { en: 'Meaning',            te: 'అర్థం',         ta: 'பொருள்',        hi: 'अर्थ' },
  reflect:  { en: 'Reflection',         te: 'చింతన',         ta: 'சிந்தனை',       hi: 'चिंतन' },
  source:   { en: 'Source',             te: 'మూలం',          ta: 'மூலம்',         hi: 'स्रोत' },
};

function todayEntry(): Entry {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return devotionalData[dayOfYear % devotionalData.length] as Entry;
}

function t(map: Record<string, string>, lang: string): string {
  return map[lang] ?? map.en;
}

function langField(obj: Record<string, string>, field: string, lang: string): string {
  return obj[`${field}_${lang}`] || obj[`${field}_en`] || '';
}

export default function DailyDevotional() {
  const { lang } = useLang();
  const [tab, setTab] = useState<'shloka' | 'story'>('shloka');
  const entry = todayEntry();

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  function tabStyle(active: boolean): React.CSSProperties {
    return {
      padding: '8px 20px',
      border: 'none',
      borderBottom: `2px solid ${active ? 'var(--color-gold)' : 'transparent'}`,
      background: 'transparent',
      color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      transition: 'color 0.15s',
      whiteSpace: 'nowrap',
    };
  }

  return (
    <section style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="wide-width" style={{ padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', margin: '0 0 2px' }}>
              {t(LABELS.heading, lang)}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {entry.deity}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={() => setTab('shloka')} style={tabStyle(tab === 'shloka')}>
              {t(LABELS.shloka, lang)}
            </button>
            <button onClick={() => setTab('story')} style={tabStyle(tab === 'story')}>
              {t(LABELS.story, lang)}
            </button>
          </div>
        </div>

        {/* Shloka tab */}
        {tab === 'shloka' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Sanskrit */}
            <div style={{
              borderLeft: '3px solid var(--color-gold)',
              paddingLeft: '16px',
            }}>
              <p className="script-devanagari" style={{
                fontSize: '18px',
                lineHeight: 1.9,
                color: 'var(--color-text-primary)',
                margin: 0,
                whiteSpace: 'pre-line',
              }}>
                {entry.shloka.sanskrit}
              </p>
              <p className="script-iast" style={{
                fontSize: '13px',
                lineHeight: 1.8,
                color: 'var(--color-text-secondary)',
                margin: '8px 0 0',
                whiteSpace: 'pre-line',
                opacity: 0.8,
              }}>
                {entry.shloka.iast}
              </p>
            </div>

            {/* Meaning */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
                {t(LABELS.meaning, lang)}
              </p>
              <p className={scriptClass} style={{
                fontSize: '14px',
                lineHeight: lang === 'ta' ? 1.9 : lang === 'te' ? 1.8 : 1.7,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}>
                {langField(entry.shloka as unknown as Record<string, string>, 'meaning', lang)}
              </p>
            </div>

            {/* Reflection */}
            <div style={{
              background: 'rgba(184,134,11,0.06)',
              border: '1px solid rgba(184,134,11,0.18)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)', margin: '0 0 6px' }}>
                {t(LABELS.reflect, lang)}
              </p>
              <p className={scriptClass} style={{
                fontSize: '13px',
                lineHeight: lang === 'ta' ? 1.9 : lang === 'te' ? 1.8 : 1.7,
                color: 'var(--color-text-secondary)',
                margin: 0,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              }}>
                {langField(entry.shloka as unknown as Record<string, string>, 'reflection', lang)}
              </p>
            </div>
          </div>
        )}

        {/* Story tab */}
        {tab === 'story' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title + source */}
            <div>
              <h3 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 6px',
                lineHeight: 1.25,
              }} className={lang !== 'en' ? scriptClass : ''}>
                {langField(entry.story as unknown as Record<string, string>, 'title', lang)}
              </h3>
              {entry.story.source && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-saffron)',
                  background: 'rgba(212,98,42,0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {entry.story.source}
                </span>
              )}
            </div>

            {/* Story body */}
            <div className={scriptClass} style={{
              fontSize: '14px',
              lineHeight: lang === 'ta' ? 1.95 : lang === 'te' ? 1.85 : 1.8,
              color: 'var(--color-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {langField(entry.story as unknown as Record<string, string>, 'body', lang)
                .split('\n\n')
                .map((para, i) => (
                  <p key={i} style={{ margin: 0 }}>{para}</p>
                ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
