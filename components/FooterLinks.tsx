'use client';

import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

export default function FooterLinks() {
  const { lang } = useLang();
  const ui = UI[lang];

  return (
    <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <Link href="/upcoming" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerUpcoming}
      </Link>
      <Link href="/panchangam" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerPanchangam}
      </Link>
      <Link href="/stories" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerStories}
      </Link>
      <Link href="/site-index" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerSiteIndex}
      </Link>
    </nav>
  );
}
