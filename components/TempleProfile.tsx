'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { localize } from '@/lib/localize';
import { scriptClass } from '@/lib/utils';
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

export default function TempleProfile({ temple, deities, liveStream }: Props) {
  const { lang } = useLang();

  const name = localize(temple, 'name', lang);
  const etymology = localize(temple, 'etymology', lang);
  const history = localize(temple, 'history', lang);
  const significance = localize(temple, 'significance', lang);
  const location = localize(temple, 'location', lang);

  const nameClass = scriptClass(lang);

  const navSections: NavSection[] = [
    ...(liveStream ? [{ id: 'section-live', label: UI[lang].liveDarshan }] : []),
    ...(etymology ? [{ id: 'section-etymology', label: UI[lang].templeEtymology }] : []),
    ...(history ? [{ id: 'section-history', label: UI[lang].templeHistory }] : []),
    ...(significance ? [{ id: 'section-significance', label: UI[lang].significance }] : []),
  ];

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 className={nameClass} style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'var(--text-h1)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 4px',
          lineHeight: lang === 'te' ? 1.5 : lang === 'ta' ? 1.45 : lang === 'hi' ? 1.3 : 1.15,
          minHeight: 'calc(var(--text-h1) * 1.5)',
        }}>
          {name}
        </h1>

        {temple.name_en && (
          <p style={{ fontSize: 'var(--text-meta)', color: 'var(--color-text-secondary)', margin: '0 0 12px', visibility: lang === 'en' ? 'hidden' : 'visible' }}>
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
          <LiveStreamCard stream={liveStream} deity={deities[0]} hideIdentity />
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
          <p style={{ fontSize: 'var(--text-body)', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {history}
          </p>
        </section>
      )}

      {significance && (
        <section id="section-significance" style={{ marginBottom: '32px', scrollMarginTop: 'var(--section-anchor-offset)' }}>
          <SectionHeading>{UI[lang].significance}</SectionHeading>
          <p style={{ fontSize: 'var(--text-body)', lineHeight: 1.8, color: 'var(--color-text-primary)', margin: 0 }}>
            {significance}
          </p>
        </section>
      )}
    </>
  );
}
