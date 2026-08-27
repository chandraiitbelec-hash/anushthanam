import { auth } from '@/auth';
import { isDbConfigured } from '@/lib/db';
import { createEvent, parseEventInput } from '@/lib/schedule';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * POST /api/schedule — create an event. Requires a signed-in session with an
 * `accountId` (our users.id): sign-in deliberately succeeds even when the
 * Postgres write fails, so a session can lack the row — that case gets a
 * distinct error code the client renders as "try signing out and in again".
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!session.user.accountId) {
    return Response.json({ error: 'no_account' }, { status: 409 });
  }
  if (!isDbConfigured) {
    return Response.json({ error: 'db_unavailable' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = parseEventInput(body);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const event = await createEvent(session.user.accountId, parsed.input);
    return Response.json({ event }, { status: 201 });
  } catch (err) {
    console.error('SCHEDULE ERROR: create failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
