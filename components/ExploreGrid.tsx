'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';
import { LOCALE_MAP, scriptClass } from '@/lib/utils';
import { localize } from '@/lib/localize';
import type { Festival, Vratham, PanchangamDay } from '@/lib/types';

type CardKey = 'gods' | 'festivals' | 'vrathams' | 'pujas' | 'shlokas' | 'panchangam';

type Props = {
  nextFestival: Festival | null;
  nextVratham: Vratham | null;
  today: PanchangamDay | null;
};

export default function ExploreGrid({ nextFestival, nextVratham, today }: Props) {
  const { lang } = useLang();
  const ui = UI[lang];
  const nameClass = scriptClass(lang);

  function cardLabel(key: CardKey) {
    return ui[key];
  }

  function formatDate(dateStr: string) {
    const locale = LOCALE_MAP[lang] ?? 'en-IN';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  const panchangamPreview = today
    ? [localize(today, 'tithi', lang), localize(today, 'nakshatra', lang)]
        .filter(Boolean).join(' · ')
    : null;

  const festivalPreview = nextFestival
    ? `${localize(nextFestival, 'title', lang)} · ${formatDate(nextFestival.next_occurrence)}`
    : null;

  const vrathamPreview = nextVratham
    ? `${localize(nextVratham, 'title', lang)} · ${formatDate(nextVratham.next_occurrence)}`
    : null;

  const cards: { href: string; key: CardKey; preview: string | null }[] = [
    { href: '/gods',       key: 'gods',       preview: null },
    { href: '/festivals',  key: 'festivals',  preview: festivalPreview },
    { href: '/vrathams',   key: 'vrathams',   preview: vrathamPreview },
    { href: '/pujas',      key: 'pujas',      preview: null },
    { href: '/shlokas',    key: 'shlokas',    preview: null },
    { href: '/panchangam', key: 'panchangam', preview: panchangamPreview },
  ];

  return (
    <section className="wide-width explore-section">
      <h2 style={{
        fontFamily: 'var(--font-cormorant)',
        fontSize: 'var(--text-h2)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        {ui.exploreLabel}
      </h2>
      <div className="explore-grid">
        {cards.map(card => (
          <Link key={card.href} href={card.href} className="explore-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <span className={nameClass} style={{
              fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
              fontWeight: 600,
            }}>
              {cardLabel(card.key)}
            </span>
            {card.preview && (
              <span className={nameClass} style={{
                display: 'block',
                marginTop: '6px',
                fontSize: 'var(--text-meta)',
                fontWeight: 400,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.4,
              }}>
                {card.preview}
              </span>
            )}
          </Link>
        ))}
      </div>

      <style>{`
        .explore-section { padding: 48px 24px; }
        .explore-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .explore-card { padding: 24px; font-size: var(--text-h2); justify-content: center; }
        @media (max-width: 640px) {
          .explore-section { padding: 32px 16px; }
          .explore-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .explore-card { padding: 18px 16px; }
        }
      `}</style>
    </section>
  );
}
