import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems } from '@/lib/relations';
import type { Festival, Story } from '@/lib/types';
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
  return { title: festival ? `${festival.title_en} | Anuṣṭhāna` : 'Anuṣṭhāna' };
}

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('festivals');
  const festival = (rows as unknown as Festival[]).find(f => f.slug === slug);
  if (!festival) notFound();

  const materialsSlug = festival.materials_group_slug || festival.slug;

  const [steps, materials, storyRows] = await Promise.all([
    getProcedureSteps(festival.slug),
    getMaterialItems(materialsSlug),
    getPublished('stories_index'),
  ]);

  const story = festival.linked_story_slug
    ? ((storyRows as unknown as Story[]).find(s => s.slug === festival.linked_story_slug) ?? null)
    : null;

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals', href: '/festivals' }, { label: festival.title_en }]} />
      <FestivalProfile festival={festival} steps={steps} materials={materials} story={story} />
    </div>
  );
}
