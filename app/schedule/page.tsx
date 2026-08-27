import type { Metadata } from 'next';
import { listScheduledEvents, upcomingOccurrencesFromNow } from '@/lib/schedule';
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
  const occurrences = upcomingOccurrencesFromNow(events);

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
