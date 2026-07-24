import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getProcedureSteps, getMaterialItems, rowToPuja } from '@/lib/relations';
import Breadcrumb from '@/components/Breadcrumb';
import PujaProfile from '@/components/PujaProfile';
import { pageMeta } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished(TABS.pujas).catch(() => []);
  return rows.map(rowToPuja).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished(TABS.pujas);
    const puja = rows.map(rowToPuja).find(p => p.slug === slug);
    if (!puja) return { title: 'Anuṣṭhāna' };
    return pageMeta(puja.title_en, puja.brief_description_en || '', `/pujas/${slug}`);
  } catch {
    return { title: 'Anuṣṭhāna' };
  }
}

export default async function PujaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished(TABS.pujas).catch(() => []);
  const puja = rows.map(rowToPuja).find(p => p.slug === slug);
  if (!puja) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug).catch(() => []),
    getMaterialItems(slug).catch(() => []),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Pujas', labels: { te: 'పూజలు', ta: 'பூஜைகள்', hi: 'पूजाएं' }, href: '/pujas' },
        { label: puja.title_en, labels: { te: puja.title_te, ta: puja.title_ta, hi: puja.title_hi } },
      ]} />
      <PujaProfile puja={puja} steps={steps} materials={materials} />
    </div>
  );
}
