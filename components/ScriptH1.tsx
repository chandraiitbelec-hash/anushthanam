'use client';

import { useLang } from '@/context/LanguageContext';
import { scriptClass } from '@/lib/utils';
import type { Language } from '@/lib/types';

type Props = {
  labels: Record<Language, string>;
  style?: React.CSSProperties;
};

export default function ScriptH1({ labels, style }: Props) {
  const { lang } = useLang();
  const nameClass = scriptClass(lang);
  return (
    <h1 className={nameClass} style={{
      fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
      ...style,
    }}>
      {labels[lang] ?? labels.en}
    </h1>
  );
}
