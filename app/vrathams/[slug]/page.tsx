import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems } from '@/lib/relations';
import type { Vratham } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import VrathamProfile from '@/components/VrathamProfile';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('vrathams');
  return (rows as unknown as Vratham[]).map(v => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  return { title: vratham ? `${vratham.title_en} | Anuṣṭhāna` : 'Anuṣṭhāna' };
}

export default async function VrathamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  if (!vratham) notFound();

  const [steps, materials] = await Promise.all([
    getProcedureSteps(slug),
    getMaterialItems(slug),
  ]);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Vrathams', href: '/vrathams' }, { label: vratham.title_en }]} />
      <VrathamProfile vratham={vratham} steps={steps} materials={materials} />
    </div>
  );
}
