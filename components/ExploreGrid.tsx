'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import type { Festival, Vratham, PanchangamDay, Language } from '@/lib/types';

const LOCALE_MAP: Record<string, string> = { en: 'en-IN', te: 'te-IN', ta: 'ta-IN', hi: 'hi-IN' };

const EXPLORE_LABEL = { en: 'Explore', te: 'అన్వేషించండి', ta: 'ஆராயுங்கள்', hi: 'खोजें' };

type LabelSet = { en: string; te: string; ta: string; hi: string };

const CARD_LABELS: Record<string, LabelSet> = {
  gods:       { en: 'Gods',       te: 'దేవతలు',   ta: 'தேவர்கள்',      hi: 'देवता' },
  festivals:  { en: 'Festivals',  te: 'పండుగలు',  ta: 'திருவிழாக்கள்', hi: 'त्योहार' },
  vrathams:   { en: 'Vrathams',   te: 'వ్రతాలు',  ta: 'விரதங்கள்',     hi: 'व्रत' },
  pujas:      { en: 'Pujas',      te: 'పూజలు',    ta: 'பூஜைகள்',       hi: 'पूजा' },
  shlokas:    { en: 'Shlokas',    te: 'శ్లోకాలు', ta: 'ஸ்லோகங்கள்',    hi: 'श्लोक' },
  panchangam: { en: 'Panchangam', te: 'పంచాంగం',  ta: 'பஞ்சாங்கம்',    hi: 'पंचांग' },
};

type Props = {
  nextFestival: Festival | null;
  nextVratham: Vratham | null;
  today: PanchangamDay | null;
};

export default function ExploreGrid({ nextFestival, nextVratham, today }: Props) {
  const { lang } = useLang();

  const scriptClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  function cardLabel(key: string) {
    return CARD_LABELS[key][lang as keyof LabelSet] || CARD_LABELS[key].en;
  }

  function entityTitle(entity: Record<string, string>) {
    return entity[`title_${lang}`] || entity.title_en;
  }

  function formatDate(dateStr: string) {
    const locale = LOCALE_MAP[lang] ?? 'en-IN';
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  const panchangamPreview = today
    ? [(today as unknown as Record<string, string>)[`tithi_${lang}`] || today.tithi_en,
       (today as unknown as Record<string, string>)[`nakshatra_${lang}`] || today.nakshatra_en]
        .filter(Boolean).join(' · ')
    : null;

  const festivalPreview = nextFestival
    ? `${entityTitle(nextFestival as unknown as Record<string, string>)} · ${formatDate(nextFestival.next_occurrence)}`
    : null;

  const vrathamPreview = nextVratham
    ? `${entityTitle(nextVratham as unknown as Record<string, string>)} · ${formatDate(nextVratham.next_occurrence)}`
    : null;

  const cards: { href: string; key: string; preview: string | null }[] = [
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
        fontSize: 'clamp(22px, 3vw, 28px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 24px',
      }}>
        {EXPLORE_LABEL[lang as Language] || EXPLORE_LABEL.en}
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
            <span className={scriptClass} style={{
              fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
              fontWeight: 600,
            }}>
              {cardLabel(card.key)}
            </span>
            {card.preview && (
              <span className={scriptClass} style={{
                display: 'block',
                marginTop: '6px',
                fontSize: '13px',
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
        .explore-card { padding: 24px; font-size: 22px; justify-content: center; }
        @media (max-width: 640px) {
          .explore-section { padding: 32px 16px; }
          .explore-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .explore-card { padding: 18px 16px; font-size: 18px; }
        }
      `}</style>
    </section>
  );
}
