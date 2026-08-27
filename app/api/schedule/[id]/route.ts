import { auth } from '@/auth';
import { isDbConfigured } from '@/lib/db';
import { cancelEvent, parseEventInput, updateEvent } from '@/lib/schedule';
import { endLiveSession } from '@/lib/satsang';
import { getLiveAudioAdmin } from '@/lib/audio/admin';
import { SATSANG_KIND } from '@/lib/event-kinds';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

/**
 * Owner-only writes. Ownership is enforced in SQL (`WHERE owner_id = $n`), so
 * a non-owner gets the same 404 as a missing id — no existence oracle.
 * v1 has no per-instance edits: PATCH updates the whole series, DELETE cancels
 * the whole series (soft — the row stays, status flips to 'cancelled').
 */
async function requireAccount() {
  const session = await auth();
  if (!session?.user) return { failure: Response.json({ error: 'unauthenticated' }, { status: 401 }) };
  if (!session.user.accountId) return { failure: Response.json({ error: 'no_account' }, { status: 409 }) };
  if (!isDbConfigured) return { failure: Response.json({ error: 'db_unavailable' }, { status: 503 }) };
  return { accountId: session.user.accountId };
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAccount();
  if ('failure' in guard) return guard.failure;
  const { id } = await params;

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
    const event = await updateEvent(id, guard.accountId, parsed.input);
    if (!event) return Response.json({ error: 'not_found' }, { status: 404 });
    return Response.json({ event });
  } catch (err) {
    console.error('SCHEDULE ERROR: update failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}

/**
 * Cancelling a satsang must also take its room down. Nothing else does: the
 * only other way a session ends is the teacher pressing End, and a teacher who
 * has just cancelled the event has no reason to go back and do that — so
 * without this the room stays live and joinable indefinitely.
 *
 * Composed here rather than inside lib/schedule.ts, which is domain-agnostic
 * and must not import lib/satsang.ts. Ordering and tolerance match the end
 * route exactly: the database row ends first so the app stops advertising a
 * live session, and the provider teardown that actually disconnects people is
 * best-effort — an unconfigured or unreachable provider must not turn a
 * successful cancel into an error.
 */
async function endLiveSessionAfterCancel(eventId: string, accountId: string) {
  try {
    const ended = await endLiveSession(eventId, accountId);
    if (!ended) return;
    const admin = await getLiveAudioAdmin();
    if (admin) await admin.closeRoom(ended.roomName);
  } catch (err) {
    console.error('SCHEDULE ERROR: live session teardown after cancel failed', err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAccount();
  if ('failure' in guard) return guard.failure;
  const { id } = await params;

  try {
    const cancelled = await cancelEvent(id, guard.accountId);
    if (!cancelled) return Response.json({ error: 'not_found' }, { status: 404 });

    if (cancelled.kind === SATSANG_KIND) {
      await endLiveSessionAfterCancel(id, guard.accountId);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('SCHEDULE ERROR: cancel failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
