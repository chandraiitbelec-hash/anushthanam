export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anushthanam.vercel.app';

export const SITE_NAME = 'Anuṣṭhāna';

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
    title: `${title} | ${SITE_NAME}`,
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
