'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Vratham, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import SectionNav from './SectionNav';
import PasuramViewer from './PasuramViewer';
import type { DeityRef } from './DeityChips';
import type { NavSection } from './SectionNav';
import type { ShlokaStanza } from '@/lib/types';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  fasting:   { en: 'Fasting Rules', te: 'ఉపవాసం',    ta: 'உபவாசம்',         hi: 'उपवास' },
  benefits:  { en: 'Benefits',      te: 'ఫలితాలు',    ta: 'பலன்கள்',          hi: 'लाभ' },
  materials: { en: 'Materials',     te: 'సామగ్రి',     ta: 'பொருட்கள்',        hi: 'सामग्री' },
  procedure: { en: 'Procedure',     te: 'విధానం',      ta: 'நடைமுறை',          hi: 'विधि' },
  pasurams:  { en: 'Pasurams',      te: 'పాశురాలు',   ta: 'பாசுரங்கள்',        hi: 'पासुर' },
  story:     { en: 'Vrata Katha',   te: 'వ్రత కథ',    ta: 'விரத கதை',         hi: 'व्रत कथा' },
  readStory: { en: 'Read',          te: 'చదవండి',      ta: 'படிக்க',            hi: 'पढ़ें' },
  next:      { en: 'Next',          te: 'తదుపరి',      ta: 'அடுத்தது',         hi: 'अगला' },
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
      scrollMarginTop: '137px',
    }}>
      {children}
    </h2>
  );
}

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

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const navSections: NavSection[] = [
    fasting                  && { id: 'fasting',   label: label('fasting', lang) },
    benefits                 && { id: 'benefits',  label: label('benefits', lang) },
    materials.length > 0     && { id: 'materials', label: label('materials', lang) },
    steps.length > 0         && { id: 'procedure', label: label('procedure', lang) },
    stanzas.length > 0       && { id: 'pasurams',  label: label('pasurams', lang) },
    stories.length > 0       && { id: 'stories',   label: label('story', lang) },
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
            {label('next', lang)}: {new Date(vratham.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}

        <DeityChips deities={deities} />
      </div>

      {/* Sticky section nav */}
      <SectionNav sections={navSections} />

      {fasting && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="fasting">{label('fasting', lang)}</SectionHeading>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {fasting}
          </p>
        </section>
      )}

      {benefits && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="benefits">{label('benefits', lang)}</SectionHeading>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {benefits}
          </p>
        </section>
      )}

      {materials.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="materials">{label('materials', lang)}</SectionHeading>
          <MaterialsList items={materials} />
        </section>
      )}

      {steps.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="procedure">{label('procedure', lang)}</SectionHeading>
          <ProcedureSteps steps={steps} hasPasurams={stanzas.length > 0} />
        </section>
      )}

      {stanzas.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <SectionHeading id="pasurams">{label('pasurams', lang)}</SectionHeading>
          <PasuramViewer stanzas={stanzas} startDate={vratham.shloka_start_date || undefined} />
        </section>
      )}

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
