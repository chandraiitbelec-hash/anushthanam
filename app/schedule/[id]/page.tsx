import type { Metadata } from 'next';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { auth, isAuthConfigured } from '@/auth';
import { getEvent, nextOccurrenceIsos } from '@/lib/schedule';
import { UI } from '@/lib/ui-strings';
import Breadcrumb from '@/components/Breadcrumb';
import ClientLabel from '@/components/ClientLabel';
import EventDetail from '@/components/schedule/EventDetail';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  try {
    const event = await getEvent(id);
    if (event) return { title: event.title };
  } catch {
    // fall through to the generic title
  }
  return { title: 'Schedule' };
}

export default async function EventPage({ params }: Params) {
  const { id } = await params;

  let session: Session | null = null;
  if (isAuthConfigured) {
    try {
      session = await auth();
    } catch (err) {
      console.error('AUTH ERROR: could not resolve session for /schedule/[id]', err);
    }
  }

  const event = await getEvent(id, session?.user?.accountId).catch(err => {
    console.error('SCHEDULE ERROR: could not load event', err);
    return null;
  });

  const isOwner = Boolean(
    event && session?.user?.accountId && session.user.accountId === event.ownerId,
  );

  // Next few occurrence starts; the first is the headline datetime. A one-off
  // (or fully past) event falls back to its anchor inside EventDetail.
  const occurrences = event ? nextOccurrenceIsos(event) : [];

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Schedule', labels: { te: 'కార్యక్రమాలు', ta: 'நிகழ்ச்சிகள்', hi: 'कार्यक्रम' }, href: '/schedule' },
        { label: event?.title ?? '…' },
      ]} />

      {event ? (
        <EventDetail
          event={event}
          occurrences={occurrences}
          isOwner={isOwner}
          authEnabled={isAuthConfigured}
        />
      ) : (
        // Soft empty state rather than notFound(): a DB outage must degrade the
        // same way an unknown id does, per the site-wide discipline.
        <div style={{
          padding: '64px 32px', textAlign: 'center',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px',
        }}>
          <p style={{ fontSize: 'var(--text-card-title)', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>
            <ClientLabel labels={{
              en: UI.en.eventNotFound, te: UI.te.eventNotFound, ta: UI.ta.eventNotFound, hi: UI.hi.eventNotFound,
            }} />
          </p>
          <Link href="/schedule" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-gold-text)' }}>
            <ClientLabel labels={{
              en: UI.en.backToSchedule, te: UI.te.backToSchedule, ta: UI.ta.backToSchedule, hi: UI.hi.backToSchedule,
            }} />
          </Link>
        </div>
      )}
    </div>
  );
}
