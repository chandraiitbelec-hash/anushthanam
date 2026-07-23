import type { Metadata } from 'next';
import { getPublished } from '@/lib/sheets';
import Breadcrumb from '@/components/Breadcrumb';
import SiteIndexContent, { type IndexSection } from '@/components/SiteIndexContent';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Site Index',
  description: 'A complete index of gods, shlokas, festivals, vrathams and pujas on Anuṣṭhāna.',
};

function byEnglish(a: { names: { en: string } }, b: { names: { en: string } }) {
  return a.names.en.localeCompare(b.names.en);
}

export default async function SiteIndexPage() {
  const [gods, shlokas, festivals, vrathams, pujas] = await Promise.all([
    getPublished('gods').catch(() => []),
    getPublished('shlokas').catch(() => []),
    getPublished('festivals').catch(() => []),
    getPublished('vrathams').catch(() => []),
    getPublished('pujas').catch(() => []),
  ]);

  const mapNamed = (rows: Record<string, string>[]) =>
    rows
      .map(r => ({
        slug: r.slug,
        names: { en: r.name_en, te: r.name_te, ta: r.name_ta, hi: r.name_hi, sa: r.name_sa },
      }))
      .sort(byEnglish);

  const mapTitled = (rows: Record<string, string>[]) =>
    rows
      .map(r => ({
        slug: r.slug,
        names: { en: r.title_en, te: r.title_te, ta: r.title_ta, hi: r.title_hi },
      }))
      .sort(byEnglish);

  const allSections: IndexSection[] = [
    { key: 'gods', hrefBase: '/gods', entities: mapNamed(gods) },
    { key: 'shlokas', hrefBase: '/shlokas', entities: mapTitled(shlokas) },
    { key: 'festivals', hrefBase: '/festivals', entities: mapTitled(festivals) },
    { key: 'vrathams', hrefBase: '/vrathams', entities: mapTitled(vrathams) },
    { key: 'pujas', hrefBase: '/pujas', entities: mapTitled(pujas) },
  ];
  const sections = allSections.filter(s => s.entities.length > 0);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Site Index', labels: { en: 'Site Index', te: 'సైట్ విషయసూచిక', ta: 'தள அட்டவணை', hi: 'साइट अनुक्रमणिका' } }]} />
      <SiteIndexContent sections={sections} />
    </div>
  );
}
