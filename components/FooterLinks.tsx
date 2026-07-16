'use client';

import { useLang } from '@/context/LanguageContext';
import { UI } from '@/lib/ui-strings';

export default function FooterLinks() {
  const { lang } = useLang();
  const ui = UI[lang];

  return (
    <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <a href="/upcoming" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerUpcoming}
      </a>
      <a href="/panchangam" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerPanchangam}
      </a>
      <a href="/stories" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerStories}
      </a>
      <a href="/site-index" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
        {ui.footerSiteIndex}
      </a>
    </nav>
  );
}
