import { getPublished, getConfig, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
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
// Sourced from the `config` tab (key: popular_god_slugs); this is the
// fallback for a Sheets outage or a not-yet-added config row.
const FALLBACK_POPULAR_GOD_SLUGS = ['ganesha', 'shiva', 'vishnu', 'lakshmi', 'durga', 'hanuman', 'venkateswara', 'saraswati'];

function nextByOccurrence<T extends { next_occurrence: string }>(rows: T[]): T | null {
  const today = todayIST();
  const upcoming = rows
    .filter(r => r.next_occurrence >= today)
    .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));
  return upcoming[0] ?? null;
}

export default async function HomePage() {
  const [festivalRows, vrathamRows, godRows, today, config] = await Promise.all([
    getPublished(TABS.festivals).catch(emptyOnError(TABS.festivals, 'home', [])),
    getPublished(TABS.vrathams).catch(emptyOnError(TABS.vrathams, 'home', [])),
    getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'home', [])),
    getTodayPanchangam().catch(emptyOnError(TABS.panchangam, 'home', null)),
    getConfig().catch(emptyOnError(TABS.config, 'home', {} as Record<string, string>)),
  ]);

  const configuredSlugs = (config.popular_god_slugs ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const popularGodSlugs = configuredSlugs.length > 0 ? configuredSlugs : FALLBACK_POPULAR_GOD_SLUGS;

  const nextFestival = nextByOccurrence(festivalRows.map(rowToFestival));
  const nextVratham = nextByOccurrence(vrathamRows.map(rowToVratham));

  const godBySlug = new Map(godRows.map(g => [g.slug, g]));
  const popularGods: PopularGod[] = popularGodSlugs
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
