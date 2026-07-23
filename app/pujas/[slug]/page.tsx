import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems } from '@/lib/relations';
import type { Puja } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import PujaProfile from '@/components/PujaProfile';
import { pageMeta } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('pujas');
  return (rows as unknown as Puja[]).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('pujas');
  const puja = (rows as unknown as Puja[]).find(p => p.slug === slug);
  if (!puja) return { title: 'Anuṣṭhāna' };
  return pageMeta(puja.title_en, puja.brief_description_en || '', `/pujas/${slug}`);
}

export default async function PujaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('pujas');
  const puja = (rows as unknown as Puja[]).find(p => p.slug === slug);
  if (!puja) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug),
    getMaterialItems(slug),
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
