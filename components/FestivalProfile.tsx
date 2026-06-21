'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Festival, ProcedureStep, MaterialItem, Story } from '@/lib/types';
import ProcedureSteps from './ProcedureSteps';
import MaterialsList from './MaterialsList';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  significance: { en: 'Significance',       te: 'ప్రాముఖ్యత',              ta: 'முக்கியத்துவம்',    hi: 'महत्व' },
  materials:    { en: 'Materials Required',  te: 'అవసరమైన సామగ్రి',          ta: 'தேவையான பொருட்கள்', hi: 'आवश्यक सामग्री' },
  procedure:    { en: 'Celebration Procedure', te: 'పూజా విధానం',            ta: 'கொண்டாட்ட நடைமுறை', hi: 'पूजा विधि' },
  story:        { en: 'Related Story',       te: 'సంబంధిత కథ',              ta: 'தொடர்புடைய கதை',    hi: 'संबंधित कथा' },
  readStory:    { en: 'Read Story',          te: 'కథ చదవండి',               ta: 'கதை படிக்க',        hi: 'कथा पढ़ें' },
  next:         { en: 'Next',                te: 'తదుపరి',                   ta: 'அடுத்தது',          hi: 'अगला' },
};

const STORY_TYPE_LABELS: Record<string, string> = {
  'vrata-katha':    'Vrata Katha',
  'mahatmya':       'Mahatmya',
  'purana-story':   'Purana Story',
  'sthala-purana':  'Sthala Purana',
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
  story: Story | null;
};

export default function FestivalProfile({ festival, steps, materials, story }: Props) {
  const { lang } = useLang();

  const r = festival as unknown as Record<string, string>;
  const title        = r[`title_${lang}`]        || festival.title_en;
  const significance = r[`significance_${lang}`] || festival.significance_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  const storyTitle   = story ? ((story as unknown as Record<string, string>)[`title_${lang}`]         || story.title_en)         : '';
  const storySummary = story ? ((story as unknown as Record<string, string>)[`brief_summary_${lang}`] || story.brief_summary_en) : '';

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

      {/* Linked Story */}
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
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'var(--color-gold)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
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
