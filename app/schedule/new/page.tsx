import type { Metadata } from 'next';
import type { Session } from 'next-auth';
import { auth, isAuthConfigured } from '@/auth';
import Breadcrumb from '@/components/Breadcrumb';
import ScriptH1 from '@/components/ScriptH1';
import EventForm from '@/components/schedule/EventForm';
import SignInNudge from '@/components/schedule/SignInNudge';

export const metadata: Metadata = { title: 'New event' };

const NEW_EVENT_LABELS = {
  en: 'New event',
  te: 'కొత్త కార్యక్రమం',
  ta: 'புதிய நிகழ்ச்சி',
  hi: 'नया कार्यक्रम',
};

export default async function NewEventPage() {
  let session: Session | null = null;
  if (isAuthConfigured) {
    try {
      session = await auth();
    } catch (err) {
      console.error('AUTH ERROR: could not resolve session for /schedule/new', err);
    }
  }

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[
        { label: 'Schedule', labels: { te: 'కార్యక్రమాలు', ta: 'நிகழ்ச்சிகள்', hi: 'कार्यक्रम' }, href: '/schedule' },
        { label: 'New event', labels: NEW_EVENT_LABELS },
      ]} />

      <ScriptH1
        labels={NEW_EVENT_LABELS}
        style={{
          fontSize: 'var(--text-h1-page)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 32px',
        }}
      />

      {session?.user ? <EventForm /> : <SignInNudge />}
    </div>
  );
}
