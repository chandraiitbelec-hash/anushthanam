'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

/**
 * Seeds next-auth's client session store with the session the server already
 * resolved in the root layout. Passing it down (rather than letting the client
 * fetch /api/auth/session on mount) is the same no-flash rule the language and
 * theme providers follow: the first paint shows the real signed-in state, so
 * the nav never renders "Sign in" and then swap to an avatar.
 */
export default function AuthProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
