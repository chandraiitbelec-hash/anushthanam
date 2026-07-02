import { notFound } from 'next/navigation';
import { getPublished } from '@/lib/sheets';
import { getProcedureSteps, getMaterialItems, getStoriesForParent, getShlokaStanzas } from '@/lib/relations';
import type { Vratham, God, Story, ShlokaStanza } from '@/lib/types';
import type { DeityRef } from '@/components/DeityChips';
import Breadcrumb from '@/components/Breadcrumb';
import VrathamProfile from '@/components/VrathamProfile';
import { pageMeta, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished('vrathams');
  return (rows as unknown as Vratham[]).map(v => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  if (!vratham) return { title: 'Anuṣṭhāna' };
  const desc = [vratham.benefits_en, vratham.fasting_rules_en].filter(Boolean).join(' ');
  return pageMeta(vratham.title_en, desc, `/vrathams/${slug}`);
}

export default async function VrathamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rows = await getPublished('vrathams');
  const vratham = (rows as unknown as Vratham[]).find(v => v.slug === slug);
  if (!vratham) notFound();

  const [steps, materials, godRows, storyRows, stanzas] = await Promise.all([
    getProcedureSteps(slug),
    getMaterialItems(slug),
    getPublished('gods'),
    getStoriesForParent(slug),
    vratham.shloka_slug ? getShlokaStanzas(vratham.shloka_slug) : Promise.resolve([]),
  ]);

  const deities: DeityRef[] = vratham.deity_slug
    ? (godRows as unknown as God[])
        .filter(g => g.slug === vratham.deity_slug)
        .map(g => ({ slug: g.slug, name_en: g.name_en, name_te: g.name_te, name_ta: g.name_ta, name_hi: g.name_hi }))
    : [];

  const stories = storyRows as unknown as Story[];

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Vrathams', labels: { te: 'వ్రతాలు', ta: 'விரதங்கள்', hi: 'व्रत' }, href: '/vrathams' },
        { label: vratham.title_en, labels: { te: vratham.title_te, ta: vratham.title_ta, hi: vratham.title_hi } },
      ]} />
      <VrathamProfile vratham={vratham} steps={steps} materials={materials} deities={deities} stories={stories} stanzas={stanzas as ShlokaStanza[]} />
    </div>
  );
}
