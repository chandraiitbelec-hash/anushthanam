'use client';

import { useLang } from '@/context/LanguageContext';
import type { Language } from '@/lib/types';

type Props = { labels: Record<Language, string> };

export default function ClientLabel({ labels }: Props) {
  const { lang } = useLang();
  return <>{labels[lang] ?? labels.en}</>;
}
