import { getPublished } from '@/lib/sheets';
import { getTodayPanchangam } from '@/lib/panchangam';
import type { Festival, Vratham } from '@/lib/types';
import DailyDevotional from '@/components/DailyDevotional';
import HomeSearch, { type PopularGod } from '@/components/HomeSearch';
import ExploreGrid from '@/components/ExploreGrid';

export const revalidate = 3600;

// Curated "popular" deities surfaced as quick chips under the home search.
// Filtered against published rows, so any not-yet-published slug is skipped.
const POPULAR_GOD_SLUGS = ['ganesha', 'shiva', 'vishnu', 'lakshmi', 'durga', 'hanuman', 'venkateswara', 'saraswati'];

function nextByOccurrence<T extends { next_occurrence: string }>(rows: T[]): T | null {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = rows
    .filter(r => r.next_occurrence >= today)
    .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));
  return upcoming[0] ?? null;
}

export default async function HomePage() {
  const [festivalRows, vrathamRows, godRows, today] = await Promise.all([
    getPublished('festivals'),
    getPublished('vrathams'),
    getPublished('gods'),
    getTodayPanchangam(),
  ]);

  const nextFestival = nextByOccurrence(festivalRows as unknown as Festival[]);
  const nextVratham = nextByOccurrence(vrathamRows as unknown as Vratham[]);

  const godBySlug = new Map(godRows.map(g => [g.slug, g]));
  const popularGods: PopularGod[] = POPULAR_GOD_SLUGS
    .map(slug => godBySlug.get(slug))
    .filter((g): g is Record<string, string> => Boolean(g))
    .map(g => ({ slug: g.slug, names: { en: g.name_en, te: g.name_te, ta: g.name_ta, hi: g.name_hi } }));

  return (
    <div>
      <DailyDevotional />
      <HomeSearch popular={popularGods} />
      <ExploreGrid nextFestival={nextFestival} nextVratham={nextVratham} today={today} />
    </div>
  );
}
