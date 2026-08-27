import type { Metadata } from 'next';
import { getTemples } from '@/lib/relations';
import { emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import EntityCard from '@/components/EntityCard';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';

export const revalidate = 3600;

// `location_en` is authored as full prose (place, then a sentence or two of
// geographic context). That is right for the detail page but far too long for
// a card's one-line meta slot — especially now that the card also carries a
// hero thumbnail. Keep just the leading place name for the list.
function shortLocation(location: string): string {
  return location.split('\u2014')[0].split(',').slice(0, 2).join(',').replace(/[.;]\s*$/, '').trim();
}

export const metadata: Metadata = {
  title: 'Temples',
  description: 'Hindu temples — etymology, history, and significance, with links to their presiding deities.',
};

export default async function TemplesPage() {
  const temples = await getTemples().catch(emptyOnError(TABS.temples, 'temples', []));

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Temples', labels: { te: 'ఆలయాలు', ta: 'கோயில்கள்', hi: 'मंदिर' } }]} />
      <ListPageHeader
        titles={{ en: 'Temples', te: 'ఆలయాలు', ta: 'கோயில்கள்', hi: 'मंदिर' }}
        count={temples.length}
        countLabels={{ en: 'temples', te: 'ఆలయాలు', ta: 'கோயில்கள்', hi: 'मंदिर' }}
      />
      {temples.length === 0 ? (
        <EmptyState type="temples" />
      ) : (
        <div className="entity-grid">
          {temples.map(t => (
            <EntityCard
              key={t.slug}
              href={`/temples/${t.slug}`}
              names={{ en: t.name_en, te: t.name_te, ta: t.name_ta, hi: t.name_hi }}
              meta={shortLocation(t.location_en) || undefined}
              imageSrc={t.hero_image_url || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
