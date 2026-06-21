'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Vratham, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';
import DeityChips from './DeityChips';
import type { DeityRef } from './DeityChips';

const STORY_TYPE_LABELS: Record<string, string> = {
  'vrata-katha': 'Vrata Katha', 'mahatmya': 'Mahatmya',
  'purana-story': 'Purana Story', 'sthala-purana': 'Sthala Purana',
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  fasting:    { en: 'Fasting Rules',      te: 'ఉపవాస నిబంధనలు', ta: 'உபவாச விதிகள்',       hi: 'उपवास नियम' },
  benefits:   { en: 'Benefits',           te: 'ఫలితాలు',          ta: 'பலன்கள்',             hi: 'लाभ' },
  materials:  { en: 'Materials Required', te: 'అవసరమైన సామగ్రి',  ta: 'தேவையான பொருட்கள்',  hi: 'आवश्यक सामग्री' },
  procedure:  { en: 'Procedure',          te: 'విధానం',            ta: 'நடைமுறை',             hi: 'प्रक्रिया' },
  story:      { en: 'Vrata Katha',        te: 'వ్రత కథ',           ta: 'விரத கதை',            hi: 'व्रत कथा' },
  readStory:  { en: 'Read Katha',         te: 'కథ చదవండి',         ta: 'கதை படிக்க',          hi: 'कथा पढ़ें' },
  next:       { en: 'Next',               te: 'తదుపరి',            ta: 'அடுத்தது',            hi: 'अगला' },
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
  vratham: Vratham;
  steps: ProcedureStep[];
  materials: MaterialItem[];
  deities: DeityRef[];
  story: Story | null;
};

export default function VrathamProfile({ vratham, steps, materials, deities, story }: Props) {
  const { lang } = useLang();

  const r = vratham as unknown as Record<string, string>;
  const title    = r[`title_${lang}`]         || vratham.title_en;
  const fasting  = r[`fasting_rules_${lang}`] || vratham.fasting_rules_en;
  const benefits = r[`benefits_${lang}`]      || vratham.benefits_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const sr = story ? story as unknown as Record<string, string> : null;
  const storyTitle   = sr ? (sr[`title_${lang}`]         || story!.title_en)         : '';
  const storySummary = sr ? (sr[`brief_summary_${lang}`] || story!.brief_summary_en) : '';

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

        {lang !== 'en' && vratham.title_en && (
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
            {vratham.title_en}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {(vratham.duration || vratham.observance_day) && (
            <span style={{
              padding: '4px 12px',
              background: 'rgba(61,107,79,0.1)',
              border: '1px solid var(--color-green)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-green)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {vratham.duration || vratham.observance_day}
            </span>
          )}
        </div>

        {vratham.next_occurrence && (
          <p style={{ fontSize: '14px', color: 'var(--color-saffron)', fontWeight: 500, margin: 0 }}>
            {label('next', lang)}: {new Date(vratham.next_occurrence).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        )}
      </div>

      <DeityChips deities={deities} />

      {fasting && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('fasting', lang)}</SectionHeading>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {fasting}
          </p>
        </section>
      )}

      {benefits && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('benefits', lang)}</SectionHeading>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {benefits}
          </p>
        </section>
      )}

      {materials.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('materials', lang)}</SectionHeading>
          <MaterialsList items={materials} />
        </section>
      )}

      {steps.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('procedure', lang)}</SectionHeading>
          <ProcedureSteps steps={steps} />
        </section>
      )}

      {story && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('story', lang)}</SectionHeading>
          <div style={{
            padding: '20px 24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderLeft: '4px solid var(--color-gold)',
            borderRadius: '8px',
          }}>
            {story.story_type && (
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                background: 'rgba(184,134,11,0.12)',
                border: '1px solid var(--color-gold)',
                borderRadius: '12px',
                fontSize: '11px', fontWeight: 600,
                color: 'var(--color-gold)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: '10px',
              }}>
                {STORY_TYPE_LABELS[story.story_type] ?? story.story_type}
              </span>
            )}
            <h3 className={nameClass} style={{
              fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
              fontSize: '20px', fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px',
            }}>
              {storyTitle}
            </h3>
            {storySummary && (
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
                {storySummary}
              </p>
            )}
            <Link href={`/stories/${story.slug}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px',
              background: 'var(--color-gold)', color: '#fff',
              borderRadius: '6px', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none',
            }}>
              {label('readStory', lang)} →
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
