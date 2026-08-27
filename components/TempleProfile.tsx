'use client';

import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize, localizeLang } from '@/lib/localize';
import { scriptClass, splitIntoParagraphs } from '@/lib/utils';
import type { LiveStream, Temple } from '@/lib/types';
import DeityChips, { type DeityRef } from './DeityChips';
import SectionNav, { type NavSection } from './SectionNav';
import LiveStreamCard from './LiveStreamCard';

type Props = {
  temple: Temple;
  deities: DeityRef[];
  liveStream?: LiveStream;
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 'var(--text-label)',
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

// history/significance arrive as one unbroken run of prose (no authored
// paragraph breaks in the source), which reads as a wall of text at 3,000+
// characters. Break it at sentence boundaries for rendering only; short
// fields come back as a single paragraph, i.e. unchanged.
function ProseSection({ text }: { text: string }) {
  const paragraphs = splitIntoParagraphs(text);
  return (
    <div>
      {paragraphs.map((para, i) => (
        <p key={i} style={{
          fontSize: 'var(--text-body)',
          lineHeight: 1.8,
          color: 'var(--color-text-primary)',
          margin: i === paragraphs.length - 1 ? 0 : '0 0 16px',
        }}>
          {para}
        </p>
      ))}
    </div>
  );
}

export default function TempleProfile({ temple, deities, liveStream }: Props) {
  const { lang } = useLang();

  const name = localize(temple, 'name', lang);
  const etymology = localize(temple, 'etymology', lang);
  const history = localize(temple, 'history', lang);
  const significance = localize(temple, 'significance', lang);
  const location = localize(temple, 'location', lang);

  // The language the name actually resolved to — most temples have no te/ta/hi
  // name and fall back to English, which must not be styled with the UI
  // language's script font or line-height.
  const nameLang = localizeLang(temple, 'name', lang);
  const nameClass = scriptClass(nameLang);

  const navSections: NavSection[] = [
    ...(liveStream ? [{ id: 'section-live', label: UI[lang].liveDarshan }] : []),
    ...(etymology ? [{ id: 'section-etymology', label: UI[lang].templeEtymology }] : []),
    ...(history ? [{ id: 'section-history', label: UI[lang].templeHistory }] : []),
    ...(significance ? [{ id: 'section-significance', label: UI[lang].significance }] : []),
  ];

  return (
    <>
      {temple.hero_image_url && (
        // Photo credit is rendered, not optional: every hero here is a
        // Wikimedia Commons file and most are CC BY-SA, which requires the
        // credit to appear wherever the photo does. The attribution string
        // already names the photographer and the licence, so it needs no
        // translated label of its own.
        <figure style={{ margin: '0 0 24px' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}>
            <Image
              src={temple.hero_image_url}
              alt={temple.name_en}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 800px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          {temple.hero_image_attribution && (
            <figcaption style={{
              fontSize: 'var(--text-badge)',
              color: 'var(--color-text-secondary)',
              margin: '6px 2px 0',
              lineHeight: 1.5,
            }}>
              {temple.hero_image_source_url ? (
                <a
                  href={temple.hero_image_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--color-border)' }}
                >
                  {temple.hero_image_attribution}
                </a>
              ) : temple.hero_image_attribution}
            </figcaption>
          )}
        </figure>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 className={nameClass} lang={nameLang} style={{
          fontFamily: nameLang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'var(--text-h1)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
          lineHeight: nameLang === 'te' ? 1.5 : nameLang === 'ta' ? 1.45 : nameLang === 'hi' ? 1.3 : 1.15,
          minHeight: 'calc(var(--text-h1) * 1.5)',
        }}>
          {name}
        </h1>

        {temple.name_en && (
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 12px', visibility: nameLang === 'en' ? 'hidden' : 'visible' }}>
            {temple.name_en}
          </p>
        )}

        {location && (
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
            {location}
          </p>
        )}

        <DeityChips deities={deities} />

        {temple.official_website_url && (
          <a
            href={temple.official_website_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-meta)', color: 'var(--color-gold-text)', textDecoration: 'none' }}
          >
            {UI[lang].templeOfficialWebsite} ↗
          </a>
        )}
      </div>

      <SectionNav sections={navSections} />

      {liveStream && (
        <section id="section-live" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{UI[lang].liveDarshan}</SectionHeading>
          <LiveStreamCard stream={liveStream} temple={temple} deity={deities[0]} hideIdentity />
        </section>
      )}

      {etymology && (
        <section id="section-etymology" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{UI[lang].templeEtymology}</SectionHeading>
          <p style={{ fontSize: 'var(--text-body-sm)', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
            {etymology}
          </p>
        </section>
      )}

      {history && (
        <section id="section-history" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{UI[lang].templeHistory}</SectionHeading>
          <ProseSection text={history} />
        </section>
      )}

      {significance && (
        <section id="section-significance" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{UI[lang].significance}</SectionHeading>
          <ProseSection text={significance} />
        </section>
      )}
    </>
  );
}
