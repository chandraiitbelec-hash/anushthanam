import { randomUUID } from 'node:crypto';
import { query, isDbConfigured } from './db';
import { expandOccurrences } from './occurrences.mjs';
import { SATSANG_KIND } from './event-kinds';
import type { ScheduleEvent } from './schedule';

/**
 * Live-audio satsang sessions — the runtime state layered over an event whose
 * `kind` is 'satsang'. The event is the schedule; a `live_sessions` row is one
 * *run* of it (see db/migrations/0003_create_live_sessions.sql for why runs are
 * rows rather than columns).
 *
 * Reads degrade to "not live" on a missing or unreachable database, matching
 * the discipline every Sheets fetch and the schedule layer already follow: a DB
 * blip must leave the event page readable, just without live controls.
 *
 * **Server-only.** This module reaches lib/db.ts and therefore `pg`, which
 * cannot be bundled for the browser. Client components may import its *types*
 * (erased at compile time) but never a value from it — SATSANG_KIND lives in
 * lib/event-kinds.ts for exactly that reason.
 */

export type LiveSession = {
  id: string;
  eventId: string;
  /** Opaque room name handed to the audio provider. */
  roomName: string;
  /** Which scheduled occurrence this run belongs to (ISO). */
  occurrenceStartsAt: string;
  startedBy: string;
  startedAt: string;
  /** null while the session is live. */
  endedAt: string | null;
};

/**
 * What the event page needs to render, and what its poll returns. Deliberately
 * small: a client only has to know whether it can join, and which room.
 */
export type SatsangState = {
  live: boolean;
  /** The live session's id, or null when nothing is live. */
  sessionId: string | null;
  startedAt: string | null;
  /** When the most recent session ended, so the UI can say "session ended". */
  lastEndedAt: string | null;
};

export const NOT_LIVE: SatsangState = {
  live: false,
  sessionId: null,
  startedAt: null,
  lastEndedAt: null,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SessionRow = {
  id: string;
  event_id: string;
  room_name: string;
  occurrence_starts_at: Date;
  started_by: string;
  started_at: Date;
  ended_at: Date | null;
};

const SESSION_COLUMNS =
  'id, event_id, room_name, occurrence_starts_at, started_by, started_at, ended_at';

function rowToSession(row: SessionRow): LiveSession {
  return {
    id: row.id,
    eventId: row.event_id,
    roomName: row.room_name,
    occurrenceStartsAt: row.occurrence_starts_at.toISOString(),
    startedBy: row.started_by,
    startedAt: row.started_at.toISOString(),
    endedAt: row.ended_at ? row.ended_at.toISOString() : null,
  };
}

/** The event's currently-live session, or null. */
export async function getLiveSession(eventId: string): Promise<LiveSession | null> {
  if (!isDbConfigured || !UUID_RE.test(eventId)) return null;
  const rows = await query<SessionRow>(
    `SELECT ${SESSION_COLUMNS} FROM live_sessions
      WHERE event_id = $1 AND ended_at IS NULL`,
    [eventId],
  );
  return rows[0] ? rowToSession(rows[0]) : null;
}

/**
 * Which of the given events have a session running right now, mapped to when
 * that run started (ISO).
 *
 * **One query for the whole page, not one per event.** The /schedule list can
 * hold dozens of satsang events and renders server-side on every request (the
 * layout is per-request dynamic), so N round trips would be N per page view.
 * Non-satsang ids can be passed harmlessly, but the caller filtering them out
 * first is what keeps the parameter list small.
 *
 * Degrades to an empty map — the schedule renders without live badges rather
 * than not at all.
 */
export async function getLiveSessionStarts(
  eventIds: readonly string[],
): Promise<Map<string, string>> {
  const ids = eventIds.filter(id => UUID_RE.test(id));
  if (!isDbConfigured || ids.length === 0) return new Map();
  const rows = await query<{ event_id: string; started_at: Date }>(
    `SELECT event_id, started_at FROM live_sessions
      WHERE ended_at IS NULL AND event_id = ANY($1::uuid[])`,
    [ids],
  );
  return new Map(rows.map(row => [row.event_id, row.started_at.toISOString()]));
}

/**
 * Live/ended state for an event in one round trip. The newest row is enough:
 * at most one can be live (enforced by a partial unique index), so a newest row
 * with no `ended_at` is the live session and anything else means not live.
 */
export async function getSatsangState(eventId: string): Promise<SatsangState> {
  if (!isDbConfigured || !UUID_RE.test(eventId)) return NOT_LIVE;
  const rows = await query<SessionRow>(
    `SELECT ${SESSION_COLUMNS} FROM live_sessions
      WHERE event_id = $1 ORDER BY started_at DESC LIMIT 1`,
    [eventId],
  );
  const row = rows[0];
  if (!row) return NOT_LIVE;
  const session = rowToSession(row);
  return session.endedAt
    ? { live: false, sessionId: null, startedAt: null, lastEndedAt: session.endedAt }
    : { live: true, sessionId: session.id, startedAt: session.startedAt, lastEndedAt: null };
}

/**
 * The scheduled occurrence a run started now belongs to: whichever computed
 * occurrence is closest to this instant, falling back to the event's anchor
 * when none is nearby (a teacher may start a session at any time, and v1
 * enforces no relationship between the run and the timetable).
 */
export function nearestOccurrenceIso(event: ScheduleEvent, nowMs: number): string {
  const occurrences = expandOccurrences(
    {
      startsAtMs: Date.parse(event.startsAt),
      recurrence: event.recurrence,
      weekdays: event.weekdays,
      tz: event.tz,
    },
    nowMs - 12 * 3_600_000,
    nowMs + 7 * 86_400_000,
  );
  if (occurrences.length === 0) return event.startsAt;
  const nearest = occurrences.reduce((best, ts) =>
    Math.abs(ts - nowMs) < Math.abs(best - nowMs) ? ts : best,
  );
  return new Date(nearest).toISOString();
}

export type StartResult =
  | { session: LiveSession }
  /** Already live — Start is idempotent, so the caller gets that session. */
  | { session: LiveSession; alreadyLive: true }
  /** Not the owner, not a satsang, cancelled, or no such event. */
  | { error: 'not_startable' };

/**
 * Starts a run. Ownership, kind and status are all checked in SQL rather than
 * in a read-then-write, so a client cannot start a session on someone else's
 * event, and two of the teacher's own tabs cannot create two rooms (the partial
 * unique index turns the second into a conflict, which resolves to the existing
 * session).
 */
export async function startLiveSession(
  eventId: string,
  ownerId: string,
  occurrenceStartsAt: string,
): Promise<StartResult> {
  if (!UUID_RE.test(eventId)) return { error: 'not_startable' };

  // The room name is derived from the session id, so every run gets a fresh,
  // unguessable room rather than re-entering a name that may still hold
  // lingering participants at the provider.
  const id = randomUUID();
  const rows = await query<SessionRow>(
    `INSERT INTO live_sessions (id, event_id, occurrence_starts_at, room_name, started_by)
     SELECT $1, e.id, $3, $4, $5
       FROM events e
      WHERE e.id = $2 AND e.owner_id = $5 AND e.kind = $6 AND e.status = 'scheduled'
     ON CONFLICT (event_id) WHERE ended_at IS NULL DO NOTHING
     RETURNING ${SESSION_COLUMNS}`,
    [id, eventId, occurrenceStartsAt, `satsang-${id}`, ownerId, SATSANG_KIND],
  );
  if (rows[0]) return { session: rowToSession(rows[0]) };

  // No row: either the event did not qualify, or a session is already live.
  const existing = await getLiveSession(eventId);
  if (existing && existing.startedBy === ownerId) return { session: existing, alreadyLive: true };
  return { error: 'not_startable' };
}

/**
 * Ends the event's live run, owner-scoped. Returns the ended session (so the
 * caller can tear the provider room down) or null when there was nothing live
 * or the caller is not the owner — the same no-oracle behaviour as the
 * schedule layer's owner-scoped writes.
 */
export async function endLiveSession(
  eventId: string,
  ownerId: string,
): Promise<LiveSession | null> {
  if (!UUID_RE.test(eventId)) return null;
  const rows = await query<SessionRow>(
    `UPDATE live_sessions s
        SET ended_at = now()
      WHERE s.event_id = $1
        AND s.ended_at IS NULL
        AND EXISTS (SELECT 1 FROM events e WHERE e.id = s.event_id AND e.owner_id = $2)
     RETURNING ${SESSION_COLUMNS}`,
    [eventId, ownerId],
  );
  return rows[0] ? rowToSession(rows[0]) : null;
}
