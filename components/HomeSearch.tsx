'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { scriptClass } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';

export type PopularGod = { slug: string; names: { en: string; te?: string; ta?: string; hi?: string } };

export default function HomeSearch({ popular }: { popular: PopularGod[] }) {
  const { lang } = useLang();

  const nameClass = scriptClass(lang);

  const godName = (g: PopularGod) => (g.names as Record<string, string>)[lang] || g.names.en;

  return (
    <section className="wide-width" style={{ padding: '44px 24px 4px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SearchBar maxWidth={600} />
        </div>

        {popular.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {popular.map(g => (
              <Link
                key={g.slug}
                href={`/gods/${g.slug}`}
                className={nameClass}
                style={{
                  fontSize: '13px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              >
                {godName(g)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
