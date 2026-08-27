import type { Metadata } from 'next';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { auth, isAuthConfigured } from '@/auth';
import { isLiveAudioConfigured } from '@/lib/audio/admin';
import { getEvent } from '@/lib/schedule';
import { UI } from '@/lib/ui-strings';
import Breadcrumb from '@/components/Breadcrumb';
import ClientLabel from '@/components/ClientLabel';
import ScriptH1 from '@/components/ScriptH1';
import EventForm from '@/components/schedule/EventForm';
import SignInNudge from '@/components/schedule/SignInNudge';

export const metadata: Metadata = { title: 'Edit event' };

const EDIT_EVENT_LABELS = {
  en: 'Edit event',
  te: 'కార్యక్రమం సవరించండి',
  ta: 'நிகழ்ச்சியைத் திருத்து',
  hi: 'कार्यक्रम संपादित करें',
};

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let session: Session | null = null;
  if (isAuthConfigured) {
    try {
      session = await auth();
    } catch (err) {
      console.error('AUTH ERROR: could not resolve session for /schedule/[id]/edit', err);
    }
  }

  const event = await getEvent(id).catch(err => {
    console.error('SCHEDULE ERROR: could not load event for edit', err);
    return null;
  });

  // Owners only — anyone else gets the same "not found" a bad id gets (the API
  // enforces ownership too; this just keeps the page honest).
  const isOwner = Boolean(
    event && session?.user?.accountId && session.user.accountId === event.ownerId,
  );

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Schedule', labels: { te: 'కార్యక్రమాలు', ta: 'நிகழ்ச்சிகள்', hi: 'कार्यक्रम' }, href: '/schedule' },
        { label: event?.title ?? '…', href: event ? `/schedule/${event.id}` : undefined },
        { label: 'Edit', labels: { te: 'సవరించండి', ta: 'திருத்து', hi: 'संपादित करें' } },
      ]} />

      <ScriptH1
        labels={EDIT_EVENT_LABELS}
        style={{
          fontSize: 'var(--text-h1-page)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 32px',
        }}
      />

      {!session?.user && isAuthConfigured ? (
        <SignInNudge />
      ) : event && isOwner ? (
        <EventForm event={event} liveAudioEnabled={isLiveAudioConfigured} />
      ) : (
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
