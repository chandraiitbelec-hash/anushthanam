import { notFound } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { rowToShloka } from '@/lib/relations';
import { getShlokaStanzas } from '@/lib/stanzas';
import Breadcrumb from '@/components/Breadcrumb';
import ShlokaHeader from '@/components/ShlokaHeader';
import ShlokaViewer from '@/components/ShlokaViewer';
import { pageMeta, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished(TABS.shlokas).catch(emptyOnError(TABS.shlokas, 'shlokas/[slug]', []));
  return rows.map(rowToShloka).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished(TABS.shlokas);
    const shloka = rows.map(rowToShloka).find(s => s.slug === slug);
    if (!shloka) return { title: SITE_NAME };
    const typeLabel = shloka.type ? `${shloka.type.charAt(0).toUpperCase()}${shloka.type.slice(1)}. ` : '';
    return pageMeta(shloka.title_en, typeLabel + (shloka.brief_intro_en || ''), `/shlokas/${slug}`);
  } catch (err) {
    emptyOnError(TABS.shlokas, 'shlokas/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function ShlokaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished(TABS.shlokas).catch(emptyOnError(TABS.shlokas, 'shlokas/[slug]', []));
  const shloka = rows.map(rowToShloka).find(s => s.slug === slug);
  if (!shloka) notFound();

  const stanzas = await getShlokaStanzas(slug).catch(emptyOnError(TABS.shloka_stanzas, 'shlokas/[slug]', []));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: shloka.title_en,
    description: shloka.brief_intro_en,
    url: `${SITE_URL}/shlokas/${slug}`,
    inLanguage: shloka.language_of_composition || 'Sanskrit',
    genre: shloka.type,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Shlokas', labels: { te: 'శ్లోకాలు', ta: 'ஸ்லோகங்கள்', hi: 'श्लोक' }, href: '/shlokas' },
        { label: shloka.title_en, labels: { te: shloka.title_te, ta: shloka.title_ta, hi: shloka.title_hi } },
      ]} />
      <ShlokaHeader shloka={shloka} />
      {stanzas.length > 0 && <ShlokaViewer stanzas={stanzas} type={shloka.type} />}
    </div>
  );
}
