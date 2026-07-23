import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { FontScaleProvider } from '@/context/FontScaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Script from 'next/script';
import Nav from '@/components/Nav';
import FooterLinks from '@/components/FooterLinks';
import { SITE_URL } from '@/lib/seo';

const cormorant = Cormorant_Garamond({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const notoSans = Noto_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const notoTelugu = Noto_Sans_Telugu({
  weight: ['400', '500', '700'],
  subsets: ['telugu'],
  variable: '--font-noto-telugu',
  display: 'optional',
});

const notoTamil = Noto_Sans_Tamil({
  weight: ['400', '500', '700'],
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'optional',
});

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'optional',
});

// Traditional serif Devanagari for recited Sanskrit verse text (Bhagavad Gita) —
// distinct from the sans-serif used for Hindi UI text elsewhere on the site
const notoSerifDevanagari = Noto_Serif_Devanagari({
  weight: ['400', '500'],
  subsets: ['devanagari'],
  variable: '--font-noto-serif-devanagari',
  display: 'optional',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Anuṣṭhāna — Hindu Devotional Reference',
    template: '%s | Anuṣṭhāna',
  },
  description:
    'A reference for Hindu devotional practice — gods, shlokas, pujas, festivals, vrathams, and panchangam. Available in Telugu, Tamil, Hindi and English.',
  keywords: [
    'Hindu devotion', 'puja', 'vratham', 'vrat', 'shloka', 'stotra',
    'festival', 'panchangam', 'telugu devotion', 'tamil devotion',
    'hindi bhakti', 'gods', 'devata', 'katha',
  ],
  authors: [{ name: 'Anuṣṭhāna' }],
  creator: 'Anuṣṭhāna',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Anuṣṭhāna',
    title: 'Anuṣṭhāna — Hindu Devotional Reference',
    description:
      'Gods, shlokas, festivals, vrathams, pujas and panchangam — in Telugu, Tamil, Hindi and English.',
    url: SITE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    title: 'Anuṣṭhāna — Hindu Devotional Reference',
    description:
      'Gods, shlokas, festivals, vrathams, pujas and panchangam — in Telugu, Tamil, Hindi and English.',
  },
};

// Fully static: no cookies() read here, so this layout (and every page under it)
// can be prerendered/ISR'd instead of forced into per-request dynamic rendering.
// lang/theme are seeded entirely client-side, pre-paint, by the inline scripts
// below (cookie first, then localStorage) — LanguageProvider/ThemeProvider read
// the resulting DOM state back via lazy useState initializers on mount.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${notoSans.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoDevanagari.variable} ${notoSerifDevanagari.variable}`}
    >
      <body>
        {/* lang-init script: reads the anushthanam-lang cookie (source of truth),
            falling back to localStorage, and sets <html lang> before paint.
            Placed as first child of <body> — beforeInteractive still executes before hydration,
            and this avoids the React 19 "<html> cannot contain a nested <script>" warning. */}
        <Script id="lang-init" strategy="beforeInteractive">
          {`try{var m=document.cookie.match(/(?:^|; )anushthanam-lang=([^;]*)/);var l=m?decodeURIComponent(m[1]):localStorage.getItem('anushthanam-lang');if(l&&['en','te','ta','hi'].indexOf(l)>-1)document.documentElement.lang=l;}catch(e){}`}
        </Script>
        {/* theme-init: reads the anushthanam-theme cookie, falling back to localStorage,
            and applies data-theme before paint to avoid a flash. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var m=document.cookie.match(/(?:^|; )anushthanam-theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):localStorage.getItem('anushthanam-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else if(t==='system')document.documentElement.removeAttribute('data-theme');}catch(e){}`}
        </Script>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ThemeProvider>
        <LanguageProvider>
        <FontScaleProvider>
          <Nav />
          <main id="main-content">{children}</main>
          <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '80px', padding: '36px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <div className="wide-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '16px', color: 'var(--color-text-primary)' }}>Anuṣṭhāna</span>
              <FooterLinks />
            </div>
          </footer>
        </FontScaleProvider>
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
