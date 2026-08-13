import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { FontScaleProvider } from '@/context/FontScaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import type { Theme } from '@/context/ThemeContext';
import Script from 'next/script';
import Nav from '@/components/Nav';
import FooterLinks from '@/components/FooterLinks';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { cookies } from 'next/headers';
import type { Language } from '@/lib/types';

const VALID_LANGS: Language[] = ['en', 'te', 'ta', 'hi'];
const VALID_THEMES: Theme[] = ['light', 'dark', 'system'];

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
  display: 'swap',
  adjustFontFallback: true,
});

const notoTamil = Noto_Sans_Tamil({
  weight: ['400', '500', '700'],
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'swap',
  adjustFontFallback: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
  adjustFontFallback: true,
});

// Traditional serif Devanagari for recited Sanskrit verse text (Bhagavad Gita) —
// distinct from the sans-serif used for Hindi UI text elsewhere on the site
const notoSerifDevanagari = Noto_Serif_Devanagari({
  weight: ['400', '500'],
  subsets: ['devanagari'],
  variable: '--font-noto-serif-devanagari',
  display: 'swap',
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Hindu Devotional Reference`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'A reference for Hindu devotional practice — gods, shlokas, pujas, festivals, vrathams, and panchangam. Available in Telugu, Tamil, Hindi and English.',
  keywords: [
    'Hindu devotion', 'puja', 'vratham', 'vrat', 'shloka', 'stotra',
    'festival', 'panchangam', 'telugu devotion', 'tamil devotion',
    'hindi bhakti', 'gods', 'devata', 'katha',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Hindu Devotional Reference`,
    description:
      'Gods, shlokas, festivals, vrathams, pujas and panchangam — in Telugu, Tamil, Hindi and English.',
    url: SITE_URL,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    title: `${SITE_NAME} — Hindu Devotional Reference`,
    description:
      'Gods, shlokas, festivals, vrathams, pujas and panchangam — in Telugu, Tamil, Hindi and English.',
  },
};

// themeColor lives in the viewport export (not metadata) since Next 14 — this
// is static and unrelated to the cookie-based dynamic-rendering trade below.
export const viewport: Viewport = {
  themeColor: '#1C1611',
};

// Reading cookies() opts the whole tree into per-request dynamic rendering — a
// deliberate trade, made twice and settled here: the static-shell variant paints
// English first and flips to the visitor's language after hydration, which moves
// every block on every page view for te/ta/hi users. Serving the HTML in the
// visitor's own language from the first byte is worth the loss of static/ISR
// page caching; data stays cached via unstable_cache (lib/sheets.ts) and every
// page guards its fetches with .catch, so a Sheets outage degrades to empty
// states rather than error pages.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('anushthanam-lang')?.value as Language | undefined;
  const initialLang: Language = cookieLang && VALID_LANGS.includes(cookieLang) ? cookieLang : 'en';
  const cookieTheme = cookieStore.get('anushthanam-theme')?.value as Theme | undefined;
  const initialTheme: Theme = cookieTheme && VALID_THEMES.includes(cookieTheme) ? cookieTheme : 'system';
  // Only set data-theme for explicit overrides; system = no attribute (OS media query governs)
  const dataTheme = initialTheme === 'system' ? undefined : initialTheme;

  return (
    <html
      lang={initialLang}
      {...(dataTheme ? { 'data-theme': dataTheme } : {})}
      suppressHydrationWarning
      className={`${cormorant.variable} ${notoSans.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoDevanagari.variable} ${notoSerifDevanagari.variable}`}
    >
      <body>
        {/* lang-init script: SSR already set <html lang> from the cookie; this
            covers the cookie-less case (localStorage-only preference from before
            cookies existed) so the attribute is still right before first paint.
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
        <ServiceWorkerRegister />
        <ThemeProvider initialTheme={initialTheme}>
        <LanguageProvider initialLang={initialLang}>
        <FontScaleProvider>
          <Nav />
          <main id="main-content">{children}</main>
          <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '80px', padding: '36px 24px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-footer)' }}>
            <div className="wide-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '16px', color: 'var(--color-text-primary)' }}>Anuṣṭhāna</span>
              <FooterLinks />
            </div>
          </footer>
        </FontScaleProvider>
        </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
