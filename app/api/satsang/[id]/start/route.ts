import { isFailure, requireSatsangEvent } from '../guard';
import { getSatsangState, nearestOccurrenceIso, startLiveSession } from '@/lib/satsang';
import { isLiveAudioConfigured } from '@/lib/audio/admin';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * POST /api/satsang/[id]/start — the teacher opens the room.
 *
 * Teacher-only, enforced in SQL against the event's owner_id. Idempotent: a
 * second Start while a session is already live returns that session rather than
 * opening a second room, so a double-tap or a stale tab cannot split the
 * gathering in two.
 *
 * No provider call happens here. The room is created lazily by the provider
 * when the first participant joins with a token for it, which means starting a
 * session costs nothing if nobody arrives.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resolved = await requireSatsangEvent(id);
  if (isFailure(resolved)) return resolved.failure;
  const { viewer, event, teacher } = resolved;

  if (!teacher) return Response.json({ error: 'not_teacher' }, { status: 403 });
  if (event.status === 'cancelled') {
    return Response.json({ error: 'event_cancelled' }, { status: 409 });
  }
  if (!isLiveAudioConfigured) {
    return Response.json({ error: 'audio_unavailable' }, { status: 503 });
  }

  try {
    const result = await startLiveSession(
      id,
      viewer.accountId,
      nearestOccurrenceIso(event, Date.now()),
    );
    if ('error' in result) return Response.json({ error: result.error }, { status: 409 });
    return Response.json(await getSatsangState(id));
  } catch (err) {
    console.error('SATSANG ERROR: start failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
