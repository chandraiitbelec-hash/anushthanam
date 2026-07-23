'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import SectionNav, { type NavSection } from '@/components/SectionNav';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import type { God, Language } from '@/lib/types';

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

// "Shlokas & Stotras" is a distinct, longer heading from the plain UI.shlokas label
const SHLOKAS_HEADING: Record<Language, string> = {
  en: 'Shlokas & Stotras', te: 'శ్లోకాలు & స్తోత్రాలు', ta: 'ஸ்லோகங்கள் & ஸ்தோத்திரங்கள்', hi: 'श्लोक & स्तोत्र',
};

function label(key: string, lang: Language) {
  if (key === 'iconography') return UI[lang].godIconography;
  if (key === 'shlokas') return SHLOKAS_HEADING[lang];
  if (key === 'pujas') return UI[lang].pujas;
  if (key === 'festivals') return UI[lang].festivals;
  return key;
}

function nameInLang(e: LinkedEntity, lang: string) {
  return (e as Record<string, string>)[`name_${lang}`] || e.name_en;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '14px',
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
          padding: '11px 16px',
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

  const nameClass = scriptClass(lang);

  const navSections: NavSection[] = [
    ...(iconography ? [{ id: 'section-iconography', label: label('iconography', lang) }] : []),
    ...(shlokas.length > 0 ? [{ id: 'section-shlokas', label: label('shlokas', lang) }] : []),
    ...(pujas.length > 0 ? [{ id: 'section-pujas', label: label('pujas', lang) }] : []),
    ...(festivals.length > 0 ? [{ id: 'section-festivals', label: label('festivals', lang) }] : []),
  ];

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
          lineHeight: lang === 'te' ? 1.5 : lang === 'ta' ? 1.45 : lang === 'hi' ? 1.3 : 1.15,
          // Tallest script variant (Telugu, 1.5 line-height) sets a floor so
          // switching scripts doesn't shift the page start.
          minHeight: 'calc(clamp(32px, 5vw, 52px) * 1.5)',
        }}>
          {name}
        </h1>

        {/* Sanskrit name — always shown as subtitle */}
        {god.name_sa && lang !== 'hi' && (
          <p className="script-devanagari" style={{
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 8px',
          }}>
            {god.name_sa}
          </p>
        )}

        {/* English subtitle — permanent slot so its height never appears/disappears
            on language switch; hidden (not removed) when already viewing English. */}
        {god.name_en && (
          <p style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 12px',
            visibility: lang === 'en' ? 'hidden' : 'visible',
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

      <SectionNav sections={navSections} />

      {/* Iconography */}
      {iconography && (
        <section id="section-iconography" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
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
        <section id="section-shlokas" style={{ marginTop: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{label('shlokas', lang)}</SectionHeading>
          <LinkedChips items={shlokas} lang={lang} />
        </section>
      )}

      {/* Related pujas */}
      {pujas.length > 0 && (
        <section id="section-pujas" style={{ marginTop: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{label('pujas', lang)}</SectionHeading>
          <LinkedChips items={pujas} lang={lang} />
        </section>
      )}

      {/* Related festivals */}
      {festivals.length > 0 && (
        <section id="section-festivals" style={{ marginTop: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{label('festivals', lang)}</SectionHeading>
          <LinkedChips items={festivals} lang={lang} />
        </section>
      )}
    </>
  );
}
