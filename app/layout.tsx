import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Nav from '@/components/Nav';
import FooterLinks from '@/components/FooterLinks';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${notoSans.variable} ${notoTelugu.variable} ${notoTamil.variable} ${notoDevanagari.variable}`}
    >
      <body>
        <LanguageProvider>
          <Nav />
          <main>{children}</main>
          <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '80px', padding: '36px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <div className="wide-width" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '16px', color: 'var(--color-text-primary)' }}>Anuṣṭhāna</span>
              <FooterLinks />
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
