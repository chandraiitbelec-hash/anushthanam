import { notFound } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getProcedureSteps, getMaterialItems, rowToPuja } from '@/lib/relations';
import Breadcrumb from '@/components/Breadcrumb';
import PujaProfile from '@/components/PujaProfile';
import { pageMeta, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

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
    return pageMeta(puja.title_en, puja.brief_description_en || '', `/pujas/${slug}`);
  } catch (err) {
    emptyOnError(TABS.pujas, 'pujas/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function PujaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished(TABS.pujas).catch(emptyOnError(TABS.pujas, 'pujas/[slug]', []));
  const puja = rows.map(rowToPuja).find(p => p.slug === slug);
  if (!puja) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug).catch(emptyOnError(TABS.procedure_steps, 'pujas/[slug]', [])),
    getMaterialItems(slug).catch(emptyOnError(TABS.material_items, 'pujas/[slug]', [])),
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
    </div>
  );
}
