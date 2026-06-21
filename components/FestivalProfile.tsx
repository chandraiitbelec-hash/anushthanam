'use client';

import { useLang } from '@/context/LanguageContext';
import type { Festival } from '@/lib/types';

const SECTION_LABELS: Record<string, Record<string, string>> = {
  significance: { en: 'Significance', te: 'ప్రాముఖ్యత', ta: 'முக்கியத்துவம்', hi: 'महत्व' },
  next:         { en: 'Next', te: 'తదుపరి', ta: 'அடுத்தது', hi: 'अगला' },
};

function label(key: string, lang: string) {
  return SECTION_LABELS[key]?.[lang] ?? SECTION_LABELS[key]?.en ?? key;
}

export default function FestivalProfile({ festival }: { festival: Festival }) {
  const { lang } = useLang();

  const title = (festival as unknown as Record<string, string>)[`title_${lang}`] || festival.title_en;
  const significance = (festival as unknown as Record<string, string>)[`significance_${lang}`] || festival.significance_en;

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <>
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

      {significance && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '13px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--color-text-secondary)', margin: '0 0 12px',
          }}>
            {label('significance', lang)}
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </section>
      )}
    </>
  );
}
