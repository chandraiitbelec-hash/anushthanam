import { query, isDbConfigured } from './db';
import { expandOccurrences, isValidTimeZone } from './occurrences.mjs';
import { DEFAULT_EVENT_KIND, EVENT_KINDS, type EventKind } from './event-kinds';

/**
 * Data access for the Schedule layer — scheduled events plus the minimal
 * "Interested" join. Domain-agnostic on purpose: satsang sessions and pandit
 * appointments are planned as future `kind`s of event, not new tables.
 *
 * Reads follow the same graceful-degradation discipline as the Sheets
 * fetchers: no DATABASE_URL (or an unreachable one, via the callers' .catch)
 * renders an empty schedule, never a broken page. Writes go through the
 * auth-guarded route handlers under app/api/schedule/*.
 */

export type EventRecurrence = 'none' | 'daily' | 'weekly';
export type EventStatus = 'scheduled' | 'cancelled';

export type { EventKind };

export type ScheduleEvent = {
  id: string;
  ownerId: string;
  ownerName: string | null;
  kind: string;
  title: string;
  description: string | null;
  /** ISO string of the anchor (first) occurrence. */
  startsAt: string;
  durationMinutes: number;
  recurrence: EventRecurrence;
  /** 0=Sunday … 6=Saturday; only meaningful when recurrence === 'weekly'. */
  weekdays: number[];
  /** IANA zone anchoring the recurring wall-clock time. */
  tz: string;
  status: EventStatus;
};

export type ScheduleEventWithMeta = ScheduleEvent & {
  interestCount: number;
  viewerInterested: boolean;
};

/** One computed occurrence of an event, for the list/calendar views. */
export type EventOccurrence = {
  eventId: string;
  title: string;
  /** ISO string of this occurrence's start. */
  startsAt: string;
  durationMinutes: number;
  recurrence: EventRecurrence;
  tz: string;
  ownerName: string | null;
};

/** How far ahead upcoming occurrences are computed. */
export const SCHEDULE_HORIZON_DAYS = 60;

type EventRow = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  kind: string;
  title: string;
  description: string | null;
  starts_at: Date;
  duration_minutes: number;
  recurrence: EventRecurrence;
  weekdays: number[];
  tz: string;
  status: EventStatus;
};

const EVENT_COLUMNS = `
  e.id, e.owner_id, u.name AS owner_name, e.kind, e.title, e.description,
  e.starts_at, e.duration_minutes, e.recurrence, e.weekdays, e.tz, e.status`;

function rowToEvent(row: EventRow): ScheduleEvent {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    kind: row.kind,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at.toISOString(),
    durationMinutes: row.duration_minutes,
    recurrence: row.recurrence,
    weekdays: row.weekdays ?? [],
    tz: row.tz,
    status: row.status,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * All scheduled (not cancelled) events that can still produce an upcoming
 * occurrence: recurring events always can; one-offs only until they start.
 * The small grace interval keeps an event listed while it is in progress.
 */
export async function listScheduledEvents(): Promise<ScheduleEvent[]> {
  if (!isDbConfigured) return [];
  const rows = await query<EventRow>(
    `SELECT ${EVENT_COLUMNS}
       FROM events e JOIN users u ON u.id = e.owner_id
      WHERE e.status = 'scheduled'
        AND (e.recurrence <> 'none' OR e.starts_at >= now() - interval '1 day')
      ORDER BY e.starts_at`,
  );
  return rows.map(rowToEvent);
}

/** One event with its interest count and whether the viewer marked interest. */
export async function getEvent(
  id: string,
  viewerAccountId?: string,
): Promise<ScheduleEventWithMeta | null> {
  if (!isDbConfigured || !UUID_RE.test(id)) return null;
  const rows = await query<EventRow & { interest_count: number; viewer_interested: boolean }>(
    `SELECT ${EVENT_COLUMNS},
            (SELECT count(*)::int FROM event_interest i WHERE i.event_id = e.id) AS interest_count,
            EXISTS(SELECT 1 FROM event_interest i
                    WHERE i.event_id = e.id AND i.user_id = $2::uuid) AS viewer_interested
       FROM events e JOIN users u ON u.id = e.owner_id
      WHERE e.id = $1`,
    [id, viewerAccountId ?? null],
  );
  const row = rows[0];
  if (!row) return null;
  return { ...rowToEvent(row), interestCount: row.interest_count, viewerInterested: row.viewer_interested };
}

export type EventInput = {
  kind: EventKind;
  title: string;
  description: string | null;
  /** ISO string. */
  startsAt: string;
  durationMinutes: number;
  recurrence: EventRecurrence;
  weekdays: number[];
  tz: string;
};

/**
 * Validates an untrusted request body into an EventInput. Returns a machine
 * error code on failure — the client maps codes to localized messages.
 */
export function parseEventInput(body: unknown): { input: EventInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'invalid_body' };
  const b = body as Record<string, unknown>;

  // Absent kind means 'gathering': the field arrived with the satsang feature,
  // so an older client (or an ICS-era payload) must keep working.
  const kind = b.kind === undefined ? DEFAULT_EVENT_KIND : b.kind;
  if (!EVENT_KINDS.includes(kind as EventKind)) return { error: 'invalid_kind' };

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title || title.length > 200) return { error: 'invalid_title' };

  let description: string | null = null;
  if (typeof b.description === 'string' && b.description.trim()) {
    description = b.description.trim();
    if (description.length > 5000) return { error: 'invalid_description' };
  }

  const startsAtMs = typeof b.startsAt === 'string' ? Date.parse(b.startsAt) : NaN;
  if (!Number.isFinite(startsAtMs)) return { error: 'invalid_starts_at' };

  const durationMinutes = typeof b.durationMinutes === 'number' ? b.durationMinutes : NaN;
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
    return { error: 'invalid_duration' };
  }

  const recurrence = b.recurrence;
  if (recurrence !== 'none' && recurrence !== 'daily' && recurrence !== 'weekly') {
    return { error: 'invalid_recurrence' };
  }

  let weekdays: number[] = [];
  if (recurrence === 'weekly') {
    if (!Array.isArray(b.weekdays)) return { error: 'invalid_weekdays' };
    weekdays = [...new Set(b.weekdays)].filter(
      (d): d is number => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6,
    ).sort();
    if (weekdays.length === 0) return { error: 'invalid_weekdays' };
  }

  const tz = typeof b.tz === 'string' ? b.tz : '';
  if (!isValidTimeZone(tz)) return { error: 'invalid_tz' };

  return {
    input: {
      kind: kind as EventKind,
      title,
      description,
      startsAt: new Date(startsAtMs).toISOString(),
      durationMinutes,
      recurrence,
      weekdays,
      tz,
    },
  };
}

export async function createEvent(ownerId: string, input: EventInput): Promise<ScheduleEvent> {
  const rows = await query<{ id: string }>(
    `INSERT INTO events (owner_id, kind, title, description, starts_at, duration_minutes, recurrence, weekdays, tz)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::smallint[], $9)
     RETURNING id`,
    [ownerId, input.kind, input.title, input.description, input.startsAt,
     input.durationMinutes, input.recurrence, input.weekdays, input.tz],
  );
  const created = await getEvent(rows[0].id);
  if (!created) throw new Error('event vanished after insert');
  return created;
}

/** Whole-series update, owner-scoped. Returns null when not found / not owner. */
export async function updateEvent(
  id: string,
  ownerId: string,
  input: EventInput,
): Promise<ScheduleEvent | null> {
  if (!UUID_RE.test(id)) return null;
  const rows = await query<{ id: string }>(
    `UPDATE events
        SET kind = $3, title = $4, description = $5, starts_at = $6, duration_minutes = $7,
            recurrence = $8, weekdays = $9::smallint[], tz = $10, updated_at = now()
      WHERE id = $1 AND owner_id = $2
      RETURNING id`,
    [id, ownerId, input.kind, input.title, input.description, input.startsAt,
     input.durationMinutes, input.recurrence, input.weekdays, input.tz],
  );
  return rows[0] ? getEvent(rows[0].id) : null;
}

/** Cancels the whole series, owner-scoped. Returns false when not found / not owner. */
export async function cancelEvent(id: string, ownerId: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  const rows = await query<{ id: string }>(
    `UPDATE events SET status = 'cancelled', updated_at = now()
      WHERE id = $1 AND owner_id = $2
      RETURNING id`,
    [id, ownerId],
  );
  return rows.length > 0;
}

/** Flips the viewer's "Interested" mark and returns the new state + count. */
export async function toggleInterest(
  eventId: string,
  userId: string,
): Promise<{ interested: boolean; count: number } | null> {
  if (!UUID_RE.test(eventId)) return null;
  const exists = await query<{ id: string }>('SELECT id FROM events WHERE id = $1', [eventId]);
  if (exists.length === 0) return null;

  const inserted = await query<{ event_id: string }>(
    `INSERT INTO event_interest (event_id, user_id) VALUES ($1, $2)
     ON CONFLICT (event_id, user_id) DO NOTHING
     RETURNING event_id`,
    [eventId, userId],
  );
  if (inserted.length === 0) {
    await query('DELETE FROM event_interest WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
  }

  const counted = await query<{ count: number }>(
    'SELECT count(*)::int AS count FROM event_interest WHERE event_id = $1',
    [eventId],
  );
  return { interested: inserted.length > 0, count: counted[0]?.count ?? 0 };
}

/**
 * Expands events into upcoming occurrences over the horizon, sorted ascending.
 * Pure over its inputs (delegates the tz math to lib/occurrences.mjs).
 */
export function upcomingOccurrences(
  events: ScheduleEvent[],
  nowMs: number,
  horizonDays: number = SCHEDULE_HORIZON_DAYS,
): EventOccurrence[] {
  const toMs = nowMs + horizonDays * 86_400_000;
  const out: EventOccurrence[] = [];
  for (const event of events) {
    const starts = expandOccurrences(
      {
        startsAtMs: Date.parse(event.startsAt),
        recurrence: event.recurrence,
        weekdays: event.weekdays,
        tz: event.tz,
      },
      nowMs,
      toMs,
    );
    for (const ts of starts) {
      out.push({
        eventId: event.id,
        title: event.title,
        startsAt: new Date(ts).toISOString(),
        durationMinutes: event.durationMinutes,
        recurrence: event.recurrence,
        tz: event.tz,
        ownerName: event.ownerName,
      });
    }
  }
  return out.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

/**
 * upcomingOccurrences anchored at the current instant. Server components call
 * this instead of passing Date.now() themselves — the react-hooks/purity lint
 * (correctly) refuses impure calls in component render.
 */
export function upcomingOccurrencesFromNow(
  events: ScheduleEvent[],
  horizonDays: number = SCHEDULE_HORIZON_DAYS,
): EventOccurrence[] {
  return upcomingOccurrences(events, Date.now(), horizonDays);
}

/** The event's next few occurrence starts (ISO) from now, over the horizon. */
export function nextOccurrenceIsos(event: ScheduleEvent, count = 5): string[] {
  const now = Date.now();
  return expandOccurrences(
    {
      startsAtMs: Date.parse(event.startsAt),
      recurrence: event.recurrence,
      weekdays: event.weekdays,
      tz: event.tz,
    },
    now,
    now + SCHEDULE_HORIZON_DAYS * 86_400_000,
    count,
  ).map(ms => new Date(ms).toISOString());
}
