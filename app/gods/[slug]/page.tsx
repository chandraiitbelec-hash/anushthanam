import { notFound } from 'next/navigation';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { getLinksForGod, rowToGod } from '@/lib/relations';
import type { Temple } from '@/lib/types';
import type { GodLink } from '@/lib/types';
import Breadcrumb from '@/components/Breadcrumb';
import GodProfile from '@/components/GodProfile';
import { godImagePath } from '@/lib/god-images';
import { pageMeta, SITE_URL, SITE_NAME, jsonLdString } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'gods/[slug]', []));
  return rows.map(rowToGod).map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await getPublished(TABS.gods);
    const god = rows.map(rowToGod).find(g => g.slug === slug);
    if (!god) return { title: SITE_NAME };
    const altNames = god.alternate_names_en ? ` Also known as ${god.alternate_names_en}.` : '';
    return pageMeta(god.name_en, (god.description_en || '') + altNames, `/gods/${slug}`);
  } catch (err) {
    emptyOnError(TABS.gods, 'gods/[slug]#generateMetadata', undefined)(err);
    return { title: SITE_NAME };
  }
}

export default async function GodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [godRows, rawLinks, shlokaRows, festivalRows, pujaRows, templeRows] = await Promise.all([
    getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'gods/[slug]', [])),
    getLinksForGod(slug).catch(emptyOnError(TABS.god_links, 'gods/[slug]', [])),
    getPublished(TABS.shlokas).catch(emptyOnError(TABS.shlokas, 'gods/[slug]', [])),
    getPublished(TABS.festivals).catch(emptyOnError(TABS.festivals, 'gods/[slug]', [])),
    getPublished(TABS.pujas).catch(emptyOnError(TABS.pujas, 'gods/[slug]', [])),
    getPublished(TABS.temples).catch(emptyOnError(TABS.temples, 'gods/[slug]', [])),
  ]);

  const god = godRows.map(rowToGod).find(g => g.slug === slug);
  if (!god) notFound();

  // Build lookup maps for multilingual entity names
  type Row = Record<string, string>;
  const shlokaMap = Object.fromEntries((shlokaRows as Row[]).map(s => [s.slug, s]));
  const festivalMap = Object.fromEntries((festivalRows as Row[]).map(f => [f.slug, f]));
  const pujaMap = Object.fromEntries((pujaRows as Row[]).map(p => [p.slug, p]));
  const templeMap = Object.fromEntries((templeRows as Row[]).map((t: Row) => [t.slug, t]));

  function resolveLink(link: GodLink, type: 'shloka' | 'festival' | 'puja' | 'temple') {
    const map = type === 'shloka' ? shlokaMap : type === 'festival' ? festivalMap : type === 'puja' ? pujaMap : templeMap;
    const entity = map[link.entity_slug];
    // shlokas/festivals/pujas use title_*; temples use name_*
    const field = type === 'temple' ? 'name' : 'title';
    const fallback = link.entity_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      slug: link.entity_slug,
      href: `/${type === 'shloka' ? 'shlokas' : type + 's'}/${link.entity_slug}`,
      type,
      name_en: entity?.[`${field}_en`] ?? fallback,
      name_te: entity?.[`${field}_te`] ?? '',
      name_ta: entity?.[`${field}_ta`] ?? '',
      name_hi: entity?.[`${field}_hi`] ?? '',
    };
  }

  const shlokas  = rawLinks.filter((l: GodLink) => l.entity_type === 'shloka').map(l => resolveLink(l, 'shloka'));
  const pujas    = rawLinks.filter((l: GodLink) => l.entity_type === 'puja').map(l => resolveLink(l, 'puja'));
  const festivals = rawLinks.filter((l: GodLink) => l.entity_type === 'festival').map(l => resolveLink(l, 'festival'));
  const temples  = rawLinks.filter((l: GodLink) => l.entity_type === 'temple').map(l => resolveLink(l, 'temple'));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: god.name_en,
    alternateName: [god.name_sa, god.alternate_names_en].filter(Boolean),
    description: god.description_en,
    url: `${SITE_URL}/gods/${slug}`,
  };

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <Breadcrumb crumbs={[
        { label: 'Gods', labels: { te: 'దేవతలు', ta: 'தெய்வங்கள்', hi: 'देवता' }, href: '/gods' },
        { label: god.name_en, labels: { te: god.name_te, ta: god.name_ta, hi: god.name_hi } },
      ]} />
      <GodProfile god={god} shlokas={shlokas} pujas={pujas} festivals={festivals} temples={temples} imagePath={godImagePath(slug)} />
    </div>
  );
}
