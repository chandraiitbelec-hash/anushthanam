'use client';

import { useLang } from '@/context/LanguageContext';
import type { Language } from '@/lib/types';

type Props = {
  labels: Record<Language, string>;
  style?: React.CSSProperties;
};

export default function ScriptH1({ labels, style }: Props) {
  const { lang } = useLang();
  const nameClass =
    lang === 'te' ? 'script-telugu' :
    lang === 'ta' ? 'script-tamil' :
    lang === 'hi' ? 'script-devanagari' : '';
  return (
    <h1 className={nameClass} style={{
      fontFamily: lang === 'en' ? 'var(--font-display)' : undefined,
      ...style,
    }}>
      {labels[lang] ?? labels.en}
    </h1>
  );
}
