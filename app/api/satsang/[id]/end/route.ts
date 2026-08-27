import { isFailure, requireSatsangEvent } from '../guard';
import { endLiveSession, getSatsangState } from '@/lib/satsang';
import { getLiveAudioAdmin } from '@/lib/audio/admin';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * POST /api/satsang/[id]/end — the teacher ends the session for everyone.
 *
 * This is the *only* way a session ends in v1. A teacher who merely closes
 * their tab leaves the session live — a deliberate deviation from the PRD's
 * FR-15 two-minute grace timer, which needs a scheduler this platform does not
 * have. The failure modes are asymmetric: a session left live degrades to an
 * empty room the teacher can end later, whereas a wrongly-expired one ejects a
 * room full of devotees mid-chant.
 *
 * Order matters: the database row is ended first, so a provider hiccup cannot
 * leave the app advertising a session as live. Tearing the provider room down
 * afterwards is what actually disconnects everyone still in it.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resolved = await requireSatsangEvent(id);
  if (isFailure(resolved)) return resolved.failure;
  const { viewer, teacher } = resolved;

  if (!teacher) return Response.json({ error: 'not_teacher' }, { status: 403 });

  try {
    const ended = await endLiveSession(id, viewer.accountId);
    if (!ended) return Response.json({ error: 'not_live' }, { status: 409 });

    const admin = await getLiveAudioAdmin();
    // No provider configured (or it fell over): the session is still ended as
    // far as the app is concerned. Clients discover that on their next poll.
    if (admin) await admin.closeRoom(ended.roomName);

    return Response.json(await getSatsangState(id));
  } catch (err) {
    console.error('SATSANG ERROR: end failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
