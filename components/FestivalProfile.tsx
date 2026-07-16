'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import SectionNav from './SectionNav';
import type { DeityRef } from './DeityChips';
import type { NavSection } from './SectionNav';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  significance: { en: 'Significance',         te: 'ప్రాముఖ్యత',     ta: 'முக்கியத்துவம்',    hi: 'महत्व' },
  materials:    { en: 'Materials',             te: 'సామగ్రి',         ta: 'பொருட்கள்',          hi: 'सामग्री' },
  procedure:    { en: 'Procedure',             te: 'విధానం',          ta: 'நடைமுறை',            hi: 'विधि' },
  story:        { en: 'Stories',               te: 'కథలు',            ta: 'கதைகள்',             hi: 'कथाएं' },
  readStory:    { en: 'Read',                  te: 'చదవండి',          ta: 'படிக்க',              hi: 'पढ़ें' },
  next:         { en: 'Next',                  te: 'తదుపరి',          ta: 'அடுத்தது',           hi: 'अगला' },
};

function label(key: string, lang: string) {
  return SECTION_LABELS[key]?.[lang] ?? SECTION_LABELS[key]?.en ?? key;
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: '13px', fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--color-text-secondary)',
      margin: '0 0 12px',
      scrollMarginTop: 'var(--section-anchor-offset)',
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

  // Build section nav dynamically — only include sections that have content
  const navSections: NavSection[] = [
    significance                  && { id: 'significance', label: label('significance', lang) },
    materials.length > 0          && { id: 'materials',    label: label('materials', lang) },
    steps.length > 0              && { id: 'procedure',    label: label('procedure', lang) },
    stories.length > 0            && { id: 'stories',      label: label('story', lang) },
  ].filter(Boolean) as NavSection[];

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
            {label('next', lang)}: {new Date(festival.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}

        <DeityChips deities={deities} />
      </div>

      {/* Sticky section nav */}
      <SectionNav sections={navSections} />

      {/* Significance */}
      {significance && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="significance">{label('significance', lang)}</SectionHeading>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </section>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="materials">{label('materials', lang)}</SectionHeading>
          <MaterialsList items={materials} />
        </section>
      )}

      {/* Procedure */}
      {steps.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="procedure">{label('procedure', lang)}</SectionHeading>
          <ProcedureSteps steps={steps} />
        </section>
      )}

      {/* Stories */}
      {stories.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="stories">{label('story', lang)}</SectionHeading>
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
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(184,134,11,0.04)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--color-surface)')}
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
