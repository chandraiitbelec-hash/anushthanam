import { getPublished } from '@/lib/sheets';
import { getTodayPanchangam } from '@/lib/panchangam';
import type { Festival, Vratham } from '@/lib/types';
import DailyDevotional from '@/components/DailyDevotional';
import ExploreGrid from '@/components/ExploreGrid';

export const revalidate = 3600;

function nextByOccurrence<T extends { next_occurrence: string }>(rows: T[]): T | null {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = rows
    .filter(r => r.next_occurrence >= today)
    .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));
  return upcoming[0] ?? null;
}

export default async function HomePage() {
  const [festivalRows, vrathamRows, today] = await Promise.all([
    getPublished('festivals'),
    getPublished('vrathams'),
    getTodayPanchangam(),
  ]);

  const nextFestival = nextByOccurrence(festivalRows as unknown as Festival[]);
  const nextVratham = nextByOccurrence(vrathamRows as unknown as Vratham[]);

  return (
    <div>
      <DailyDevotional />
      <ExploreGrid nextFestival={nextFestival} nextVratham={nextVratham} today={today} />
    </div>
  );
}
