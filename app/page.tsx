import { getPublished } from '@/lib/sheets';
import { getTodayPanchangam } from '@/lib/panchangam';
import { todayIST } from '@/lib/utils';
import { rowToFestival, rowToVratham } from '@/lib/relations';
import { getTodayDevotional } from '@/lib/daily-devotional';
import DailyDevotional from '@/components/DailyDevotional';
import HomeSearch, { type PopularGod } from '@/components/HomeSearch';
import ExploreGrid from '@/components/ExploreGrid';

export const revalidate = 3600;

// Curated "popular" deities surfaced as quick chips under the home search.
// Filtered against published rows, so any not-yet-published slug is skipped.
const POPULAR_GOD_SLUGS = ['ganesha', 'shiva', 'vishnu', 'lakshmi', 'durga', 'hanuman', 'venkateswara', 'saraswati'];

function nextByOccurrence<T extends { next_occurrence: string }>(rows: T[]): T | null {
  const today = todayIST();
  const upcoming = rows
    .filter(r => r.next_occurrence >= today)
    .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));
  return upcoming[0] ?? null;
}

export default async function HomePage() {
  const [festivalRows, vrathamRows, godRows, today] = await Promise.all([
    getPublished('festivals').catch(() => []),
    getPublished('vrathams').catch(() => []),
    getPublished('gods').catch(() => []),
    getTodayPanchangam().catch(() => null),
  ]);

  const nextFestival = nextByOccurrence(festivalRows.map(rowToFestival));
  const nextVratham = nextByOccurrence(vrathamRows.map(rowToVratham));

  const godBySlug = new Map(godRows.map(g => [g.slug, g]));
  const popularGods: PopularGod[] = POPULAR_GOD_SLUGS
    .map(slug => godBySlug.get(slug))
    .filter((g): g is Record<string, string> => Boolean(g))
    .map(g => ({ slug: g.slug, names: { en: g.name_en, te: g.name_te, ta: g.name_ta, hi: g.name_hi } }));

  const devotionalEntry = getTodayDevotional();

  return (
    <div>
      <DailyDevotional entry={devotionalEntry} />
      <HomeSearch popular={popularGods} />
      <ExploreGrid nextFestival={nextFestival} nextVratham={nextVratham} today={today} />
    </div>
  );
}
