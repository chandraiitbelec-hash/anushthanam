import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { FontScaleProvider } from '@/context/FontScaleContext';
import Script from 'next/script';
import Nav from '@/components/Nav';
import FooterLinks from '@/components/FooterLinks';
import { cookies } from 'next/headers';
import type { Language } from '@/lib/types';

const VALID_LANGS: Language[] = ['en', 'te', 'ta', 'hi'];

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anushthanam.vercel.app';

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

// Reading `cookies()` opts this layout into dynamic rendering (per-request).
// Trade-off accepted: the HTML shell is rendered at the edge per request so the
// correct language is painted on first load with no client-side flash. The heavy
// data fetches (Sheets, Docs) still happen at build time / ISR in each page
// segment, so content is not re-fetched per user. Vercel edge rendering is fast
// enough that this is imperceptible.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('anushthanam-lang')?.value as Language | undefined;
  const initialLang: Language = cookieLang && VALID_LANGS.includes(cookieLang) ? cookieLang : 'en';

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={`${cormorant.variable} ${notoSans.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoDevanagari.variable} ${notoSerifDevanagari.variable}`}
    >
      <body>
        {/* lang-init script: fast-path for setting <html lang> when the cookie is absent
            but localStorage still has a preference (e.g. first visit after clearing cookies).
            Placed as first child of <body> — beforeInteractive still executes before hydration,
            and this avoids the React 19 "<html> cannot contain a nested <script>" warning. */}
        <Script id="lang-init" strategy="beforeInteractive">
          {`try{var l=localStorage.getItem('anushthanam-lang');if(l&&['en','te','ta','hi'].indexOf(l)>-1)document.documentElement.lang=l;}catch(e){}`}
        </Script>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <LanguageProvider initialLang={initialLang}>
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
      </body>
    </html>
  );
}
