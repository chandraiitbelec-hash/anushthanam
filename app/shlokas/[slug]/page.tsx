import { notFound, unstable_rethrow } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { rowToShloka } from '@/lib/relations';
import { getShlokaStanzas } from '@/lib/stanzas';
import { localize } from '@/lib/localize';
import { shlokaTypeLabel } from '@/lib/utils';
import { UI } from '@/lib/ui-strings';
import Breadcrumb from '@/components/Breadcrumb';
import ShlokaHeader from '@/components/ShlokaHeader';
import ShlokaViewer from '@/components/ShlokaViewer';
import { pageMeta, getRequestLang, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

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
    const lang = await getRequestLang();
    const ui = UI[lang];
    const title = localize(shloka, 'title', lang);
    const intro = localize(shloka, 'brief_intro', lang);
    const typePrefix = shloka.type ? `${shlokaTypeLabel(shloka.type, lang)}. ` : '';
    const description = [typePrefix + intro, ui.seoMultilingualNote].filter(Boolean).join(' — ');
    return pageMeta(ui.seoShlokaTitle(title), description, `/shlokas/${slug}`);
  } catch (err) {
    // Next's build-time static-params prerender attempt hits our cookies() read
    // (getRequestLang) and signals a dynamic bailout via a throw — rethrow that
    // so Next handles it, instead of misreporting it as a Sheets fetch failure.
    unstable_rethrow(err);
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
