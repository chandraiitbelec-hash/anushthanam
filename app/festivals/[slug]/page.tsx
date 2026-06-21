import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems, getStoriesForParent } from '@/lib/relations';
import type { Festival, Story, God } from '@/lib/types';
import type { DeityRef } from '@/components/DeityChips';
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

  const [steps, materials, storyRows, godRows] = await Promise.all([
    getProcedureSteps(festival.slug),
    getMaterialItems(materialsSlug),
    getStoriesForParent(festival.slug),
    getPublished('gods'),
  ]);

  const stories = storyRows as unknown as Story[];

  const deitySlugList = festival.deity_slugs
    ? festival.deity_slugs.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const deities: DeityRef[] = deitySlugList
    .map((slug: string) => (godRows as unknown as God[]).find(g => g.slug === slug))
    .filter((g): g is God => Boolean(g))
    .map(g => ({ slug: g.slug, name_en: g.name_en, name_te: g.name_te, name_ta: g.name_ta, name_hi: g.name_hi }));

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Festivals', href: '/festivals' }, { label: festival.title_en }]} />
      <FestivalProfile festival={festival} steps={steps} materials={materials} stories={stories} deities={deities} />
    </div>
  );
}
