'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import type { DeityRef } from './DeityChips';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  significance: { en: 'Significance',            te: 'ప్రాముఖ్యత',    ta: 'முக்கியத்துவம்',    hi: 'महत्व' },
  materials:    { en: 'Materials Required',       te: 'అవసరమైన సామగ్రి', ta: 'தேவையான பொருட்கள்', hi: 'आवश्यक सामग्री' },
  procedure:    { en: 'Celebration Procedure',    te: 'పూజా విధానం',    ta: 'கொண்டாட்ட நடைமுறை', hi: 'पूजा विधि' },
  story:        { en: 'Stories & Kathas',         te: 'కథలు',           ta: 'கதைகள்',             hi: 'कथाएं' },
  readStory:    { en: 'Read',                     te: 'చదవండి',         ta: 'படிக்க',              hi: 'पढ़ें' },
  next:         { en: 'Next',                     te: 'తదుపరి',         ta: 'அடுத்தது',           hi: 'अगला' },
};

function label(key: string, lang: string) {
  return SECTION_LABELS[key]?.[lang] ?? SECTION_LABELS[key]?.en ?? key;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '13px', fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 12px',
    }}>
      {children}
    </h2>
  );
}

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

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
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
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
            {festival.title_en}
          </p>
        )}

        {festival.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: 0 }}>
            {label('next', lang)}: {new Date(festival.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      <DeityChips deities={deities} />

      {/* Significance */}
      {significance && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('significance', lang)}</SectionHeading>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </section>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('materials', lang)}</SectionHeading>
          <MaterialsList items={materials} />
        </section>
      )}

      {/* Procedure */}
      {steps.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('procedure', lang)}</SectionHeading>
          <ProcedureSteps steps={steps} />
        </section>
      )}

      {/* Stories */}
      {stories.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('story', lang)}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stories.map((s, idx) => {
              const sr = s as unknown as Record<string, string>;
              const t = sr[`title_${lang}`] || s.title_en;
              return (
                <Link key={s.slug} href={`/stories/${s.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 18px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '3px solid var(--color-gold)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                  onMouseOut={e => (e.currentTarget.style.borderLeftColor = 'var(--color-gold)', e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {stories.length > 1 && (
                    <span style={{
                      width: '24px', height: '24px', flexShrink: 0,
                      background: 'rgba(184,134,11,0.1)', border: '1px solid var(--color-gold)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: 'var(--color-gold)',
                    }}>{idx + 1}</span>
                  )}
                  <span className={nameClass} style={{
                    flex: 1, fontSize: '15px', fontWeight: 500,
                    fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
                    color: 'var(--color-text-primary)',
                  }}>{t}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-gold)', fontWeight: 600, flexShrink: 0 }}>
                    {label('readStory', lang)} →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
