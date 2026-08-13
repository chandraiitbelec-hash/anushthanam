import { notFound } from 'next/navigation';
import { emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getTemples, getGodsForEntity } from '@/lib/relations';
import type { DeityRef } from '@/components/DeityChips';
import Breadcrumb from '@/components/Breadcrumb';
import TempleProfile from '@/components/TempleProfile';
import { pageMeta, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const temples = await getTemples().catch(emptyOnError(TABS.temples, 'temples/[slug]', []));
  return temples.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const temples = await getTemples();
    const temple = temples.find(t => t.slug === slug);
    if (!temple) return { title: SITE_NAME };
    return pageMeta(temple.name_en, temple.significance_en || temple.history_en || '', `/temples/${slug}`);
  } catch (err) {
    emptyOnError(TABS.temples, 'temples/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function TemplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const temples = await getTemples().catch(emptyOnError(TABS.temples, 'temples/[slug]', []));
  const temple = temples.find(t => t.slug === slug);
  if (!temple) notFound();

  const godRows = await getGodsForEntity('temple', slug).catch(emptyOnError(TABS.god_links, 'temples/[slug]', []));
  const deities: DeityRef[] = godRows.map(g => ({ slug: g.slug, name_en: g.name_en, name_te: g.name_te, name_ta: g.name_ta, name_hi: g.name_hi }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: temple.name_en,
    description: temple.significance_en || temple.history_en || temple.etymology_en || undefined,
    url: `${SITE_URL}/temples/${slug}`,
    ...(temple.location_en ? { address: temple.location_en } : {}),
    ...(temple.official_website_url ? { sameAs: temple.official_website_url } : {}),
    ...(deities.length > 0 ? { about: deities.map(d => ({ '@type': 'Thing', name: d.name_en })) } : {}),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Temples', labels: { te: 'ఆలయాలు', ta: 'கோயில்கள்', hi: 'मंदिर' }, href: '/temples' },
        { label: temple.name_en, labels: { te: temple.name_te, ta: temple.name_ta, hi: temple.name_hi } },
      ]} />
      <TempleProfile temple={temple} deities={deities} />
    </div>
  );
}
