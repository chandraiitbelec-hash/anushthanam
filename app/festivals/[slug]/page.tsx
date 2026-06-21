import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import type { Festival } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import FestivalProfile from '@/components/FestivalProfile';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('festivals');
  return (rows as unknown as Festival[]).map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('festivals');
  const festival = (rows as unknown as Festival[]).find(f => f.slug === slug);
  return { title: festival ? `${festival.title_en} | Anushthanam` : 'Anushthanam' };
}

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('festivals');
  const festival = (rows as unknown as Festival[]).find(f => f.slug === slug);
  if (!festival) notFound();

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals', href: '/festivals' }, { label: festival.title_en }]} />
      <FestivalProfile festival={festival} />
    </div>
  );
}
