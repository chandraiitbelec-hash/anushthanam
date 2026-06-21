'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { God } from '@/lib/types';

type LinkedEntity = {
  slug: string;
  href: string;
  type: string;
  name_en: string;
  name_te: string;
  name_ta: string;
  name_hi: string;
};

type Props = {
  god: God;
  shlokas: LinkedEntity[];
  pujas: LinkedEntity[];
  festivals: LinkedEntity[];
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  iconography: { en: 'Iconography', te: 'ఆకృతి', ta: 'உருவ அமைப்பு', hi: 'प्रतिमा विज्ञान' },
  shlokas:     { en: 'Shlokas & Stotras', te: 'శ్లోకాలు & స్తోత్రాలు', ta: 'ஸ்லோகங்கள் & ஸ்தோத்திரங்கள்', hi: 'श्लोक & स्तोत्र' },
  pujas:       { en: 'Pujas', te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजा' },
  festivals:   { en: 'Festivals', te: 'పండుగలు', ta: 'திருவிழாக்கள்', hi: 'त्योहार' },
};

function label(key: string, lang: string) {
  return SECTION_LABELS[key]?.[lang] ?? SECTION_LABELS[key]?.en ?? key;
}

function nameInLang(e: LinkedEntity, lang: string) {
  return (e as Record<string, string>)[`name_${lang}`] || e.name_en;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '13px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--color-text-secondary)',
      margin: '0 0 12px',
    }}>
      {children}
    </h2>
  );
}

function LinkedChips({ items, lang }: { items: LinkedEntity[]; lang: string }) {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map(item => (
        <Link key={item.href} href={item.href} style={{
          display: 'inline-block',
          padding: '6px 14px',
          border: '1px solid var(--color-border)',
          borderRadius: '20px',
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
          background: 'var(--color-surface)',
        }}>
          {nameInLang(item, lang)}
        </Link>
      ))}
    </div>
  );
}

export default function GodProfile({ god, shlokas, pujas, festivals }: Props) {
  const { lang } = useLang();

  const name = (god as unknown as Record<string, string>)[`name_${lang}`] || god.name_en;
  const description = (god as unknown as Record<string, string>)[`description_${lang}`] || god.description_en;
  const iconography = (god as unknown as Record<string, string>)[`iconography_${lang}`] || god.iconography_en;

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
          margin: '0 0 4px',
        }}>
          {name}
        </h1>

        {/* Sanskrit name — always shown as subtitle */}
        {god.name_sa && lang !== 'hi' && (
          <p className="script-devanagari" style={{
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 4px',
          }}>
            {god.name_sa}
          </p>
        )}

        {/* English subtitle when viewing another language */}
        {lang !== 'en' && god.name_en && (
          <p style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
          }}>
            {god.name_en}
          </p>
        )}

        {god.tradition && (
          <div style={{ marginTop: '12px' }}>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(184,134,11,0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--color-gold)',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {god.tradition}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <section style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            {description}
          </p>
        </section>
      )}

      {/* Iconography */}
      {iconography && (
        <section style={{ marginBottom: '32px' }}>
          <SectionHeading>{label('iconography', lang)}</SectionHeading>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}>
            {iconography}
          </p>
        </section>
      )}

      {/* Related shlokas */}
      {shlokas.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <SectionHeading>{label('shlokas', lang)}</SectionHeading>
          <LinkedChips items={shlokas} lang={lang} />
        </section>
      )}

      {/* Related pujas */}
      {pujas.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <SectionHeading>{label('pujas', lang)}</SectionHeading>
          <LinkedChips items={pujas} lang={lang} />
        </section>
      )}

      {/* Related festivals */}
      {festivals.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <SectionHeading>{label('festivals', lang)}</SectionHeading>
          <LinkedChips items={festivals} lang={lang} />
        </section>
      )}
    </>
  );
}
