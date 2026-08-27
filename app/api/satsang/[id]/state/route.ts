import { getSatsangState, NOT_LIVE } from '@/lib/satsang';

// Node runtime — `pg` is not Edge-compatible (same as the auth route).
export const runtime = 'nodejs';

/**
 * GET /api/satsang/[id]/state — is this event's live session running?
 *
 * Public, like every read in the schedule layer: a signed-out visitor sees that
 * a satsang is live and gets a sign-in nudge instead of a Join button. This is
 * what the event page polls; v1 has no websocket infrastructure for page state
 * on purpose, and the payload is deliberately one small row so polling stays
 * cheap.
 *
 * A database outage answers "not live" rather than erroring — the event page
 * must stay readable.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = await getSatsangState(id).catch(err => {
    console.error('SATSANG ERROR: state read failed', err);
    return NOT_LIVE;
  });
  return Response.json(state, { headers: { 'Cache-Control': 'no-store' } });
}
