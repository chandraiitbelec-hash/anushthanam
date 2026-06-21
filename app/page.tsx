'use client';

import Link from 'next/link';
import { useLang, SITE_NAMES } from '@/context/LanguageContext';

const TAGLINES = {
  en: 'Your guide to Hindu devotional practice',
  te: 'హిందూ భక్తి ఆచారానికి మీ మార్గదర్శి',
  ta: 'இந்து பக்தி வழிபாட்டிற்கான உங்கள் வழிகாட்டி',
  hi: 'हिंदू भक्ति आचरण के लिए आपका मार्गदर्शक',
};

const LABELS = {
  viewUpcoming: { en: 'View upcoming festivals', te: 'రాబోయే పండుగలు చూడండి', ta: 'வரவிருக்கும் திருவிழாக்களைப் பாருங்கள்', hi: 'आगामी त्योहार देखें' },
  explore:      { en: 'Explore',                 te: 'అన్వేషించండి',            ta: 'ஆராயுங்கள்',                              hi: 'खोजें' },
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
      {/* Hero */}
      <section style={{
        padding: '96px 24px 80px',
        textAlign: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 16px',
          lineHeight: 1.15,
        }}>
          {SITE_NAMES[lang]}
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 40px',
          lineHeight: 1.6,
        }}>
          {TAGLINES[lang]}
        </p>
        <Link href="/upcoming" style={{
          display: 'inline-block',
          padding: '12px 28px',
          background: 'var(--color-gold)',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {LABELS.viewUpcoming[lang]}
        </Link>
      </section>

      {/* Explore */}
      <section className="wide-width" style={{ padding: '64px 24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 32px',
        }}>
          {LABELS.explore[lang]}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {EXPLORE.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block',
              padding: '24px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '22px',
              fontWeight: 600,
            }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              {label(item)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
