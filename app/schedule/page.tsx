import type { Metadata } from 'next';
import { listScheduledEvents, upcomingOccurrencesFromNow } from '@/lib/schedule';
import { getLiveSessionStarts } from '@/lib/satsang';
import { SATSANG_KIND } from '@/lib/event-kinds';
import { isAuthConfigured } from '@/auth';
import Breadcrumb from '@/components/Breadcrumb';
import ScriptH1 from '@/components/ScriptH1';
import ScheduleBrowser from '@/components/schedule/ScheduleBrowser';

export const metadata: Metadata = {
  title: 'Schedule',
  description: 'Upcoming community events and gatherings — see what is scheduled and mark your interest.',
};

const SCHEDULE_LABELS = {
  en: 'Schedule',
  te: 'కార్యక్రమాలు',
  ta: 'நிகழ்ச்சிகள்',
  hi: 'कार्यक्रम',
};

export default async function SchedulePage() {
  // Same graceful-degradation discipline as the Sheets pages: an unreachable
  // Postgres renders an empty schedule, never a broken page.
  const events = await listScheduledEvents().catch(err => {
    console.error('SCHEDULE ERROR: could not list events', err);
    return [];
  });

  // A satsang the teacher has taken live must be on this page whatever the
  // timetable says, so live state is read here and overlaid on the expansion.
  // One query for the whole page (see getLiveSessionStarts), and only for the
  // events that could possibly have a session.
  const satsangIds = events.filter(e => e.kind === SATSANG_KIND).map(e => e.id);
  const liveStarts = await getLiveSessionStarts(satsangIds).catch(err => {
    console.error('SCHEDULE ERROR: could not read live sessions', err);
    return new Map<string, string>();
  });

  // Server-rendered, not polled: v1 accepts that a session started after this
  // paint shows up on the next page load. The event page is where a devotee
  // waits for the room to open, and that one does poll.
  const occurrences = upcomingOccurrencesFromNow(events, liveStarts);

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: 'Schedule', labels: SCHEDULE_LABELS }]} />

      <ScriptH1
        labels={SCHEDULE_LABELS}
        style={{
          fontSize: 'var(--text-h1-page)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 24px',
        }}
      />

      <ScheduleBrowser occurrences={occurrences} authEnabled={isAuthConfigured} />
    </div>
  );
}
