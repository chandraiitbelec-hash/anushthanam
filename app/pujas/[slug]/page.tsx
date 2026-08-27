import { notFound, unstable_rethrow } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getProcedureSteps, getMaterialItems, rowToPuja } from '@/lib/relations';
import { localize } from '@/lib/localize';
import { UI } from '@/lib/ui-strings';
import Breadcrumb from '@/components/Breadcrumb';
import PujaProfile from '@/components/PujaProfile';
import PanditEnquiryBlock from '@/components/pandit/PanditEnquiryBlock';
import { getEnquiryPlacement } from '@/lib/pandit-enquiry-placement';
import { pageMeta, getRequestLang, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished(TABS.pujas).catch(emptyOnError(TABS.pujas, 'pujas/[slug]', []));
  return rows.map(rowToPuja).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished(TABS.pujas);
    const puja = rows.map(rowToPuja).find(p => p.slug === slug);
    if (!puja) return { title: SITE_NAME };
    const lang = await getRequestLang();
    const ui = UI[lang];
    const title = localize(puja, 'title', lang);
    const description = [localize(puja, 'brief_description', lang), ui.seoMultilingualNote].filter(Boolean).join(' — ');
    return pageMeta(title, description, `/pujas/${slug}`);
  } catch (err) {
    // See shlokas/[slug]/page.tsx generateMetadata for why this rethrow is here.
    unstable_rethrow(err);
    emptyOnError(TABS.pujas, 'pujas/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function PujaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished(TABS.pujas).catch(emptyOnError(TABS.pujas, 'pujas/[slug]', []));
  const puja = rows.map(rowToPuja).find(p => p.slug === slug);
  if (!puja) notFound();

  const [steps, materials, enquiryPlacement] = await Promise.all([
    getProcedureSteps(slug).catch(emptyOnError(TABS.procedure_steps, 'pujas/[slug]', [])),
    getMaterialItems(slug).catch(emptyOnError(TABS.material_items, 'pujas/[slug]', [])),
    // Null on every page that isn't a booking-intent one, and on any Sheets
    // failure — the demand test never costs the reference content a render.
    getEnquiryPlacement(puja).catch(emptyOnError(TABS.occasions, 'pujas/[slug]', null)),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: puja.title_en,
    description: puja.brief_description_en,
    url: `${SITE_URL}/pujas/${slug}`,
    ...(puja.duration_minutes ? { totalTime: `PT${puja.duration_minutes}M` } : {}),
    ...(materials.length > 0 ? {
      supply: materials.map(m => ({
        '@type': 'HowToSupply',
        name: m.item_name_en,
      })),
    } : {}),
    ...(steps.length > 0 ? {
      step: steps.map(s => ({
        '@type': 'HowToStep',
        position: s.step_number,
        name: s.step_title_en,
        text: s.instruction_en,
      })),
    } : {}),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Pujas', labels: { te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजाएं' }, href: '/pujas' },
        { label: puja.title_en, labels: { te: puja.title_te, ta: puja.title_ta, hi: puja.title_hi } },
      ]} />
      <PujaProfile puja={puja} steps={steps} materials={materials} />
      {/* Below the procedure, never above it: the vidhi stays complete and
          ungated, and this is an offer the reader can ignore. See §9.1. */}
      {enquiryPlacement && (
        <PanditEnquiryBlock placement={enquiryPlacement} sourcePujaSlug={slug} />
      )}
    </div>
  );
}
