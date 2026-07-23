'use client';

import { useLang } from '@/context/LanguageContext';
import { scriptClass } from '@/lib/utils';

type Props = {
  titles: { en: string; te: string; ta: string; hi: string };
  count: number;
  countLabels: { en: string; te: string; ta: string; hi: string };
};

export default function ListPageHeader({ titles, count, countLabels }: Props) {
  const { lang } = useLang();

  const title = titles[lang as keyof typeof titles] ?? titles.en;
  const countLabel = countLabels[lang as keyof typeof countLabels] ?? countLabels.en;

  const titleClass = scriptClass(lang);

  return (
    <>
      <h1 className={titleClass} style={{
        fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 32px', fontSize: '15px' }}>
        {count} {countLabel}
      </p>
    </>
  );
}
