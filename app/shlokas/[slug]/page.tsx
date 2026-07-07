import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getShlokaStanzas } from '@/lib/relations';
import type { Shloka } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import ShlokaHeader from '@/components/ShlokaHeader';
import ShlokaViewer from '@/components/ShlokaViewer';
import { pageMeta, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('shlokas');
  return (rows as unknown as Shloka[]).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('shlokas');
  const shloka = (rows as unknown as Shloka[]).find(s => s.slug === slug);
  if (!shloka) return { title: 'Anuṣṭhāna' };
  const typeLabel = shloka.type ? `${shloka.type.charAt(0).toUpperCase()}${shloka.type.slice(1)}. ` : '';
  return pageMeta(shloka.title_en, typeLabel + (shloka.brief_intro_en || ''), `/shlokas/${slug}`);
}

export default async function ShlokaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('shlokas');
  const shloka = (rows as unknown as Shloka[]).find(s => s.slug === slug);
  if (!shloka) notFound();

  const stanzas = await getShlokaStanzas(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: shloka.title_en,
    description: shloka.brief_intro_en,
    url: `${SITE_URL}/shlokas/${slug}`,
    inLanguage: shloka.language_of_composition || 'Sanskrit',
    genre: shloka.type,
    isPartOf: { '@type': 'WebSite', name: 'Anuṣṭhāna', url: SITE_URL },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Shlokas', labels: { te: 'శ్లోకాలు', ta: 'ஸ்லோகங்கள்', hi: 'श्लोक' }, href: '/shlokas' },
        { label: shloka.title_en, labels: { te: shloka.title_te, ta: shloka.title_ta, hi: shloka.title_hi } },
      ]} />
      <ShlokaHeader shloka={shloka} />
      {stanzas.length > 0 && <ShlokaViewer stanzas={stanzas} type={shloka.type} />}
    </div>
  );
}
