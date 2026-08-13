import { notFound, unstable_rethrow } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getProcedureSteps, getMaterialItems, getStoriesForParent, rowToVratham, rowToGod } from '@/lib/relations';
import { getShlokaStanzas } from '@/lib/stanzas';
import { localize } from '@/lib/localize';
import { UI } from '@/lib/ui-strings';
import type { ShlokaStanza } from '@/lib/types';
import type { DeityRef } from '@/components/DeityChips';
import Breadcrumb from '@/components/Breadcrumb';
import VrathamProfile from '@/components/VrathamProfile';
import { pageMeta, getRequestLang, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'vrathams/[slug]', []));
  return rows.map(rowToVratham).map(v => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished(TABS.vrathams);
    const vratham = rows.map(rowToVratham).find(v => v.slug === slug);
    if (!vratham) return { title: SITE_NAME };
    const lang = await getRequestLang();
    const ui = UI[lang];
    const title = localize(vratham, 'title', lang);
    const desc = [localize(vratham, 'benefits', lang), localize(vratham, 'fasting_rules', lang)].filter(Boolean).join(' ');
    const description = [desc, ui.seoMultilingualNote].filter(Boolean).join(' — ');
    return pageMeta(title, description, `/vrathams/${slug}`);
  } catch (err) {
    // See shlokas/[slug]/page.tsx generateMetadata for why this rethrow is here.
    unstable_rethrow(err);
    emptyOnError(TABS.vrathams, 'vrathams/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function VrathamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'vrathams/[slug]', []));
  const vratham = rows.map(rowToVratham).find(v => v.slug === slug);
  if (!vratham) notFound();

  const [steps, materials, godRows, stories, stanzas] = await Promise.all([
    getProcedureSteps(slug).catch(emptyOnError(TABS.procedure_steps, 'vrathams/[slug]', [])),
    getMaterialItems(slug).catch(emptyOnError(TABS.material_items, 'vrathams/[slug]', [])),
    getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'vrathams/[slug]', [])),
    getStoriesForParent(slug).catch(emptyOnError(TABS.stories_index, 'vrathams/[slug]', [])),
    (vratham.shloka_slug ? getShlokaStanzas(vratham.shloka_slug) : Promise.resolve([])).catch(emptyOnError(TABS.shloka_stanzas, 'vrathams/[slug]', [])),
  ]);

  const deities: DeityRef[] = vratham.deity_slug
    ? godRows.map(rowToGod)
        .filter(g => g.slug === vratham.deity_slug)
        .map(g => ({ slug: g.slug, name_en: g.name_en, name_te: g.name_te, name_ta: g.name_ta, name_hi: g.name_hi }))
    : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: vratham.title_en,
    description: vratham.benefits_en,
    url: `${SITE_URL}/vrathams/${slug}`,
    about: {
      '@type': 'Thing',
      name: vratham.title_en,
    },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Vrathams', labels: { te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }, href: '/vrathams' },
        { label: vratham.title_en, labels: { te: vratham.title_te, ta: vratham.title_ta, hi: vratham.title_hi } },
      ]} />
      <VrathamProfile vratham={vratham} steps={steps} materials={materials} deities={deities} stories={stories} stanzas={stanzas as ShlokaStanza[]} />
    </div>
  );
}
