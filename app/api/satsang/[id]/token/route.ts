import { isFailure, rejectIfCancelled, requireAudioAdmin, requireSatsangEvent } from '../guard';
import { getLiveSession } from '@/lib/satsang';

// Node runtime — holds the provider API secret and signs tokens.
export const runtime = 'nodejs';

/**
 * POST /api/satsang/[id]/token — a join credential for the event's live room.
 *
 * Requires sign-in: presence in the room is a write, and the schedule layer's
 * rule is that reads are public and writes need an account. The token is minted
 * per request against the *current* live session, so a credential can never
 * outlive the run it was issued for — a new Start means a new room name and the
 * old token opens nothing.
 *
 * Circle form grants publish permission to everyone; the teacher's authority is
 * over mute, not over the right to speak. Hall form (Phase 2) is where
 * `canSpeak` starts varying per participant.
 *
 * A cancelled event is refused outright (409 `event_cancelled`) — the kind check
 * alone is not enough, because a live session can survive a cancel whose
 * best-effort teardown failed.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const resolved = await requireSatsangEvent(id);
  if (isFailure(resolved)) return resolved.failure;
  const { viewer, event, teacher } = resolved;

  // A cancelled event mints nothing, even if a session is somehow still live:
  // a credential handed out here would let a devotee walk into a gathering the
  // teacher has called off. See rejectIfCancelled for the posture.
  const cancelled = rejectIfCancelled(event);
  if (cancelled) return cancelled;

  const admin = await requireAudioAdmin();
  if (isFailure(admin)) return admin.failure;

  try {
    const session = await getLiveSession(id);
    if (!session) return Response.json({ error: 'not_live' }, { status: 409 });

    const minted = await admin.mintToken({
      room: session.roomName,
      // Our users.id, never session.user.id/googleId (those are Google's ids).
      // Being stable per user also means a second tab replaces the first join
      // instead of doubling the roster.
      identity: viewer.accountId,
      displayName: viewer.displayName,
      avatarUrl: viewer.avatarUrl,
      role: teacher ? 'teacher' : 'participant',
      canSpeak: true,
    });

    return Response.json(
      { ...minted, sessionId: session.id, role: teacher ? 'teacher' : 'participant', title: event.title },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('SATSANG ERROR: token mint failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
