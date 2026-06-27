'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import DailyDevotional from '@/components/DailyDevotional';

const LABELS = {
  explore: { en: 'Explore', te: 'అన్వేషించండి', ta: 'ஆராயுங்கள்', hi: 'खोजें' },
};

const EXPLORE = [
  { href: '/gods',       label_en: 'Gods',       label_te: 'దేవతలు',    label_ta: 'தேவர்கள்',       label_hi: 'देवता' },
  { href: '/festivals',  label_en: 'Festivals',  label_te: 'పండుగలు',   label_ta: 'திருவிழாக்கள்',  label_hi: 'त्योहार' },
  { href: '/vrathams',   label_en: 'Vrathams',   label_te: 'వ్రతాలు',   label_ta: 'விரதங்கள்',      label_hi: 'व्रत' },
  { href: '/pujas',      label_en: 'Pujas',      label_te: 'పూజలు',     label_ta: 'பூஜைகள்',        label_hi: 'पूजा' },
  { href: '/shlokas',    label_en: 'Shlokas',    label_te: 'శ్లోకాలు',  label_ta: 'ஸ்லோகங்கள்',     label_hi: 'श्लोक' },
  { href: '/panchangam', label_en: 'Panchangam', label_te: 'పంచాంగం',   label_ta: 'பஞ்சாங்கம்',     label_hi: 'पंचांग' },
];

export default function HomePage() {
  const { lang } = useLang();

  function label(item: typeof EXPLORE[0]) {
    return item[`label_${lang}` as keyof typeof item] || item.label_en;
  }

  return (
    <div>
      <DailyDevotional />

      {/* Explore */}
      <section className="wide-width explore-section">
        <h2 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(22px, 3vw, 28px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 24px',
        }}>
          {LABELS.explore[lang]}
        </h2>
        <div className="explore-grid">
          {EXPLORE.map(item => (
            <Link key={item.href} href={item.href} className="explore-card" style={{
              display: 'block',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
              fontWeight: 600,
            }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <span className={
                lang === 'te' ? 'script-telugu' :
                lang === 'ta' ? 'script-tamil' :
                lang === 'hi' ? 'script-devanagari' : ''
              }>
                {label(item)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .explore-section { padding: 48px 24px; }
        .explore-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .explore-card { padding: 24px; font-size: 22px; }
        @media (max-width: 640px) {
          .explore-section { padding: 32px 16px; }
          .explore-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .explore-card { padding: 18px 16px; font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
