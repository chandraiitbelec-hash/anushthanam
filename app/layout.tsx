import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Nav from '@/components/Nav';

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
  weight: ['400', '500'],
  subsets: ['telugu'],
  variable: '--font-noto-telugu',
  display: 'optional',
});

const notoTamil = Noto_Sans_Tamil({
  weight: ['400', '500'],
  subsets: ['tamil'],
  variable: '--font-noto-tamil',
  display: 'optional',
});

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500'],
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'optional',
});

export const metadata: Metadata = {
  title: 'Anuṣṭhāna',
  description: 'A reference for Hindu devotional practice — gods, shlokas, pujas, festivals, vrathams, and panchangam.',
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
          <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '96px', padding: '40px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <div className="wide-width" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <span>Anuṣṭhāna</span>
              <nav style={{ display: 'flex', gap: '24px' }}>
                <a href="/upcoming" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Upcoming</a>
                <a href="/panchangam" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Panchangam</a>
                <a href="/index" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Site Index</a>
              </nav>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
