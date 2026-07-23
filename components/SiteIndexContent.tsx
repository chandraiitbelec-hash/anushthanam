'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { scriptClass } from '@/lib/utils';
import EntityCard from '@/components/EntityCard';

type IndexEntity = { slug: string; names: { en: string; te?: string; ta?: string; hi?: string; sa?: string } };
type SectionKey = 'gods' | 'shlokas' | 'festivals' | 'vrathams' | 'pujas';

export type IndexSection = { key: SectionKey; hrefBase: string; entities: IndexEntity[] };

type BrowseLink = { key: keyof typeof UI['en']; href: string };

const BROWSE_LINKS: BrowseLink[] = [
  { key: 'gods', href: '/gods' },
  { key: 'festivals', href: '/festivals' },
  { key: 'vrathams', href: '/vrathams' },
  { key: 'pujas', href: '/pujas' },
  { key: 'shlokas', href: '/shlokas' },
  { key: 'bhagavadGita', href: '/bhagavad-gita' },
  { key: 'panchangam', href: '/panchangam' },
  { key: 'upcoming', href: '/upcoming' },
  { key: 'storiesLabel', href: '/stories' },
];

export default function SiteIndexContent({ sections }: { sections: IndexSection[] }) {
  const { lang } = useLang();
  const ui = UI[lang];

  const titleClass = scriptClass(lang);

  return (
    <>
      <h1
        className={titleClass}
        style={{
          fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
        }}
      >
        {ui.footerSiteIndex}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 24px', fontSize: '15px' }}>
        {ui.siteIndexIntro}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
        {BROWSE_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: '13px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            {ui[link.key] as string}
          </Link>
        ))}
      </div>

      {sections.map(section => (
        <section key={section.key} style={{ marginBottom: '40px' }}>
          <h2
            className={titleClass}
            style={{
              fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0 0 4px',
            }}
          >
            {ui[section.key]}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 16px', fontSize: '13px' }}>
            {section.entities.length}
          </p>
          <div className="entity-grid">
            {section.entities.map(e => (
              <EntityCard key={e.slug} href={`${section.hrefBase}/${e.slug}`} names={e.names} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
