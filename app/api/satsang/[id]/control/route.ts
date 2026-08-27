import { isFailure, rejectIfCancelled, requireAudioAdmin, requireSatsangEvent } from '../guard';
import { getLiveSession } from '@/lib/satsang';

// Node runtime — holds the provider API secret.
export const runtime = 'nodejs';

/**
 * POST /api/satsang/[id]/control — the teacher's mute controls.
 *
 * Body: `{ action: 'mute', identity }` or `{ action: 'mute-all' }`. The shape is
 * vendor-neutral so a second audio implementation reuses this endpoint
 * unchanged (see lib/audio/audio-room.ts).
 *
 * Teacher-only, enforced against the event's owner_id — a participant POSTing
 * this directly gets a 403 no matter what their client believes about itself.
 * The mute itself is performed through the provider's server API, so it does not
 * depend on the target client cooperating.
 *
 * **Soft mute only** (PRD FR-13 default): the muted participant may unmute
 * themselves again. Phase 1 ships no lock, and unmute is not expressible as a
 * server command on any vendor — the teacher's "ask to unmute" travels over the
 * room's data channel and the target's client consents. See the Phase 0 memo §3.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resolved = await requireSatsangEvent(id);
  if (isFailure(resolved)) return resolved.failure;
  const { viewer, event, teacher } = resolved;

  if (!teacher) return Response.json({ error: 'not_teacher' }, { status: 403 });

  // Cancelled means no live-audio actions but End (see rejectIfCancelled).
  const cancelled = rejectIfCancelled(event);
  if (cancelled) return cancelled;

  const admin = await requireAudioAdmin();
  if (isFailure(admin)) return admin.failure;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }
  const { action, identity } = (body ?? {}) as { action?: unknown; identity?: unknown };

  try {
    const session = await getLiveSession(id);
    if (!session) return Response.json({ error: 'not_live' }, { status: 409 });

    if (action === 'mute') {
      if (typeof identity !== 'string' || !identity) {
        return Response.json({ error: 'invalid_identity' }, { status: 400 });
      }
      await admin.muteParticipant(session.roomName, identity);
      return Response.json({ ok: true });
    }

    if (action === 'mute-all') {
      // The teacher is skipped by identity: a mute-all that silenced the person
      // leading the chant would be a bug, and the provider's room-wide list does
      // include them.
      await admin.muteAll(session.roomName, viewer.accountId);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'invalid_action' }, { status: 400 });
  } catch (err) {
    console.error('SATSANG ERROR: control failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
