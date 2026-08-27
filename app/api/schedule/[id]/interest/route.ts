import { auth } from '@/auth';
import { isDbConfigured } from '@/lib/db';
import { toggleInterest } from '@/lib/schedule';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * POST /api/schedule/[id]/interest — flip the signed-in user's "Interested"
 * mark on an event. Idempotent per state: on → off → on. Returns the new
 * state and total count so the client never has to guess.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const { id } = await params;

  try {
    const result = await toggleInterest(id, session.user.accountId);
    if (!result) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json(result);
  } catch (err) {
    console.error('SCHEDULE ERROR: interest toggle failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
