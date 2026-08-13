import type { Metadata } from 'next';
import { getLiveStreams, rowToGod } from '@/lib/relations';
import { getPublished, emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import Breadcrumb from '@/components/Breadcrumb';
import ListPageHeader from '@/components/ListPageHeader';
import EmptyState from '@/components/EmptyState';
import LiveStreamCard from '@/components/LiveStreamCard';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Live Darshan',
  description: 'Watch live-streamed pooja and arathi from well-known Hindu temples, with daily arathi schedules.',
};

export default async function LiveDarshanPage() {
  // Tab may not exist in the live Sheet yet — degrade to empty state instead
  // of blanking the page.
  const [streams, godRows] = await Promise.all([
    getLiveStreams().catch(emptyOnError(TABS.live_streams, 'live-darshan', [])),
    getPublished(TABS.gods).catch(emptyOnError(TABS.gods, 'live-darshan', [])),
  ]);
  const godsBySlug = new Map(godRows.map(rowToGod).map(g => [g.slug, g]));

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Live Darshan', labels: { te: 'ప్రత్యక్ష దర్శనం', ta: 'நேரடி தரிசனம்', hi: 'लाइव दर्शन' } }]} />
      <ListPageHeader
        titles={{ en: 'Live Darshan', te: 'ప్రత్యక్ష దర్శనం', ta: 'நேரடி தரிசனம்', hi: 'लाइव दर्शन' }}
        count={streams.length}
        countLabels={{ en: 'temples', te: 'ఆలయాలు', ta: 'கோயில்கள்', hi: 'मंदिर' }}
      />
      {streams.length === 0 ? (
        <EmptyState type="live-streams" />
      ) : (
        <div className="entity-grid entity-grid--3col">
          {streams.map(s => (
            <LiveStreamCard key={s.slug} stream={s} deity={godsBySlug.get(s.deity_slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
