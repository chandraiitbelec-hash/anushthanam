import { auth } from '@/auth';
import { isDbConfigured } from '@/lib/db';
import { getLiveAudioAdmin, type LiveAudioAdmin } from '@/lib/audio/admin';
import { getEvent, type ScheduleEventWithMeta } from '@/lib/schedule';
import { SATSANG_KIND } from '@/lib/event-kinds';

/**
 * Shared guards for the satsang routes. Not a route file — Next only treats
 * `route.ts` as an endpoint.
 *
 * Two rules everything here exists to enforce:
 *
 *  - Teacher-only actions are checked **server-side against the event's
 *    `owner_id`**. The client's claim about its own role is never consulted.
 *  - The signed-in caller must have an `accountId` (our `users.id`). Sign-in
 *    deliberately succeeds even when that row could not be written, so its
 *    absence is a real state and gets its own code, which the UI renders as
 *    "try signing out and in again".
 */

type Failure = { failure: Response };

export type Viewer = {
  accountId: string;
  displayName: string;
  avatarUrl: string | null;
};

const unauthenticated = () => Response.json({ error: 'unauthenticated' }, { status: 401 });

/** A signed-in caller with a usable account row, or the response to return. */
export async function requireViewer(): Promise<Viewer | Failure> {
  const session = await auth();
  if (!session?.user) return { failure: unauthenticated() };
  if (!session.user.accountId) {
    return { failure: Response.json({ error: 'no_account' }, { status: 409 }) };
  }
  if (!isDbConfigured) {
    return { failure: Response.json({ error: 'db_unavailable' }, { status: 503 }) };
  }
  return {
    accountId: session.user.accountId,
    displayName: session.user.name?.trim() || 'Devotee',
    avatarUrl: session.user.image ?? null,
  };
}

/**
 * A signed-in caller plus the satsang event they are acting on. `teacher` says
 * whether they own it; callers gate teacher-only actions on it.
 */
export async function requireSatsangEvent(
  eventId: string,
): Promise<{ viewer: Viewer; event: ScheduleEventWithMeta; teacher: boolean } | Failure> {
  const viewer = await requireViewer();
  if ('failure' in viewer) return viewer;

  const event = await getEvent(eventId).catch(err => {
    console.error('SATSANG ERROR: could not load event', err);
    return null;
  });
  // A non-satsang event is reported as absent rather than as a wrong kind: the
  // route surface should not confirm which ids exist.
  if (!event || event.kind !== SATSANG_KIND) {
    return { failure: Response.json({ error: 'not_found' }, { status: 404 }) };
  }
  return { viewer, event, teacher: viewer.accountId === event.ownerId };
}

/**
 * The 409 to return when the event has been cancelled, or null when it is still
 * scheduled.
 *
 * The posture, applied consistently across the routes: **a cancelled event
 * supports no live-audio action except ending.** Start, token and control all
 * reject; `end` deliberately does not, because it is the escape hatch for a
 * session that somehow outlived its cancel (the DELETE handler's teardown is
 * best-effort, so that is a real if unlikely state). `state` is a public read
 * and reports whatever `live_sessions` says — with the teardown in place a
 * cancelled event has no live row to report.
 *
 * Rejecting on `control` rather than allowing mute is the deliberate half:
 * there should be no session to mute on a cancelled event, and if there is, the
 * teacher's remedy is End, not silence-one-by-one. One rule beats three.
 */
export function rejectIfCancelled(event: ScheduleEventWithMeta): Response | null {
  return event.status === 'cancelled'
    ? Response.json({ error: 'event_cancelled' }, { status: 409 })
    : null;
}

/** The audio provider, or the 503 to return when live audio is unconfigured. */
export async function requireAudioAdmin(): Promise<LiveAudioAdmin | Failure> {
  const admin = await getLiveAudioAdmin();
  if (!admin) return { failure: Response.json({ error: 'audio_unavailable' }, { status: 503 }) };
  return admin;
}

export function isFailure<T extends object>(value: T | Failure): value is Failure {
  return 'failure' in value;
}
