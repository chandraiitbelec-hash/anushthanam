'use client';

import { useLang } from '@/context/LanguageContext';

const H1_LABELS: Record<string, string> = {
  en: 'Srimad Bhagavad Gita',
  te: 'శ్రీమద్ భగవద్గీత',
  ta: 'ஸ்ரீமத் பகவத் கீதை',
  hi: 'श्रीमद् भगवद्गीता',
};

type Props = { chapterCount: number; verseCount: number };

export default function GitaIndexHero({ chapterCount, verseCount }: Props) {
  const { lang } = useLang();

  const subtitles: Record<string, string> = {
    en: `${chapterCount} chapters · ${verseCount} slokas · Sanskrit with Telugu, Tamil, Hindi & English`,
    te: `${chapterCount} అధ్యాయాలు · ${verseCount} శ్లోకాలు · తెలుగు, తమిళం, హిందీ & ఇంగ్లీష్ అర్థాలతో`,
    ta: `${chapterCount} அத்தியாயங்கள் · ${verseCount} ஸ்லோகங்கள் · தெலுங்கு, தமிழ், இந்தி & ஆங்கிலம்`,
    hi: `${chapterCount} अध्याय · ${verseCount} श्लोक · तेलुगु, तमिल, हिंदी और अंग्रेज़ी अर्थों के साथ`,
  };

  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1 className={nameClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-cormorant)' : undefined,
        fontSize: 'clamp(28px, 5vw, 42px)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
        lineHeight: 1.2,
      }}>
        {H1_LABELS[lang] ?? H1_LABELS.en}
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'var(--color-text-secondary)',
        margin: '0 0 6px',
        lineHeight: 1.6,
      }}>
        {subtitles[lang] ?? subtitles.en}
      </p>
    </div>
  );
}
