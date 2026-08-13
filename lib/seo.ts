import { cookies } from 'next/headers';
import type { Language } from './types';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anushthanam.vercel.app';

export const SITE_NAME = 'Anuṣṭhāna';

const VALID_LANGS: Language[] = ['en', 'te', 'ta', 'hi'];

// Mirrors the cookie read in app/layout.tsx, but scoped to generateMetadata —
// metadata has no access to the LanguageProvider's client context, and the
// root layout already opted the tree into per-request dynamic rendering, so
// reading the same cookie here is free (no extra dynamic-rendering cost).
export async function getRequestLang(): Promise<Language> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('anushthanam-lang')?.value as Language | undefined;
  return cookieLang && VALID_LANGS.includes(cookieLang) ? cookieLang : 'en';
}

export function jsonLdString(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export function trunc(s: string, max: number): string {
  if (!s) return '';
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

export function pageMeta(
  title: string,
  description: string,
  path: string,
  type: 'website' | 'article' = 'website'
) {
  const url = `${SITE_URL}${path}`;
  const desc = trunc(description, 155);
  return {
    // Bare title — the root layout's title template ("%s | Anuṣṭhāna") adds the
    // brand suffix. Appending it here too produced "X | Anuṣṭhāna | Anuṣṭhāna".
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
    },
    twitter: {
      card: 'summary' as const,
      title: `${title} | ${SITE_NAME}`,
      description: desc,
    },
  };
}
