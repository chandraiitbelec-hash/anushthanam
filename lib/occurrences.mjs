/**
 * Pure timezone + recurrence math for the Schedule layer. No DB, no React, no
 * dependencies — importable from server code (lib/schedule.ts), client
 * components (the event form and calendar need wall-clock ↔ UTC conversions in
 * an arbitrary IANA zone), and plain-node unit tests
 * (scripts/test-occurrences.mjs), which is why this is an .mjs module like
 * lib/supabase-ca.mjs rather than TypeScript.
 *
 * The recurrence model is deliberately v1-tiny: none | daily | weekly on
 * selected weekdays. A recurring event repeats at the same *wall-clock* time in
 * the zone it was created in (`tz`), so occurrences shift with that zone's DST
 * — "7pm every Tuesday in America/New_York" stays 7pm local across the March
 * and November transitions. All conversions go through Intl, so there is no
 * bundled tz database to keep current.
 */

const DAY_MS = 86_400_000;

// Hard cap on the scan loop, over any window. A 60-day horizon needs at most
// 60-odd iterations; this only exists so a bad input can't spin.
const MAX_SCAN_DAYS = 400;

/**
 * Floor on the in-progress window (see inProgressWindowMs). A 15-minute aarti
 * must not blink out of the schedule three minutes in, while devotees are still
 * arriving and looking for it; an hour is also the coarsest granularity anyone
 * reads a day's timetable at, so a generous floor never makes the list look
 * wrong. The ceiling takes care of itself: durations are capped at 1440 minutes
 * by parseEventInput, so a window is never longer than a day.
 */
const MIN_IN_PROGRESS_MS = 60 * 60_000;

/**
 * How long after its start an occurrence still counts as *happening* — the
 * window during which the schedule keeps showing it rather than treating it as
 * past.
 *
 * An absent (or nonsensical) duration yields 0, which is what preserves
 * expandOccurrences' original "future starts only" contract for the callers
 * that want it — nextOccurrenceIsos asks "what is next", not "what is on now".
 *
 * @param {number} [durationMinutes]
 * @returns {number} milliseconds
 */
export function inProgressWindowMs(durationMinutes) {
  if (typeof durationMinutes !== 'number' || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return 0;
  }
  return Math.max(durationMinutes * 60_000, MIN_IN_PROGRESS_MS);
}

/** @typedef {{ year: number, month: number, day: number, hour: number, minute: number, second: number }} WallTime */

const dtfCache = new Map();

/** @param {string} timeZone */
function getDtf(timeZone) {
  let dtf = dtfCache.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    dtfCache.set(timeZone, dtf);
  }
  return dtf;
}

/** @param {string} tz */
export function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    getDtf(tz);
    return true;
  } catch {
    dtfCache.delete(tz);
    return false;
  }
}

/**
 * Wall-clock components of a UTC instant in a zone (month is 1-based).
 *
 * @param {number} utcMs
 * @param {string} timeZone
 * @returns {WallTime}
 */
export function wallTime(utcMs, timeZone) {
  const parts = getDtf(timeZone).formatToParts(new Date(utcMs));
  /** @type {Record<string, number>} */
  const v = {};
  for (const p of parts) {
    if (p.type !== 'literal') v[p.type] = Number(p.value);
  }
  // en-US with hour12:false renders midnight as "24" — normalize to 0.
  return { year: v.year, month: v.month, day: v.day, hour: v.hour % 24, minute: v.minute, second: v.second };
}

/**
 * Weekday of a wall-clock date, 0=Sunday … 6=Saturday (matches JS getDay()
 * and the events.weekdays column).
 *
 * @param {{ year: number, month: number, day: number }} wt
 */
export function wallTimeWeekday(wt) {
  return new Date(Date.UTC(wt.year, wt.month - 1, wt.day)).getUTCDay();
}

/**
 * The UTC instant at which a zone's clock shows the given wall time — the
 * inverse of wallTime(). Iterative offset correction (the standard
 * date-fns-tz technique): guess the instant as if the wall time were UTC,
 * measure how far the zone's actual wall clock is from the target, and adjust.
 * Two rounds converge for every real zone. A wall time skipped by a
 * spring-forward DST jump resolves to the instant after the jump.
 *
 * @param {{ year: number, month: number, day: number, hour: number, minute: number, second?: number }} wt
 * @param {string} timeZone
 * @returns {number} UTC milliseconds
 */
export function wallTimeToUtc(wt, timeZone) {
  const desired = Date.UTC(wt.year, wt.month - 1, wt.day, wt.hour, wt.minute, wt.second ?? 0);
  let ts = desired;
  for (let i = 0; i < 2; i++) {
    const w = wallTime(ts, timeZone);
    const actual = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
    ts += desired - actual;
  }
  return ts;
}

/**
 * Upcoming occurrence start instants for one event within [fromMs, toMs],
 * ascending. This is the whole recurrence engine:
 *
 * - none:   the anchor instant, if it falls inside the window.
 * - daily:  every day at the anchor's wall-clock time in `tz`.
 * - weekly: days whose weekday (in `tz`) is in `weekdays`, at the anchor's
 *           wall-clock time. The anchor's own weekday is not implicitly
 *           included — the stored set is the complete rule.
 *
 * Occurrences never precede the anchor (the series starts at starts_at).
 *
 * An occurrence that has already *started* is still returned while it is in
 * progress — until `start + inProgressWindowMs(durationMinutes)`. Without a
 * duration the window is zero and only starts at or after `fromMs` come back,
 * which is the original contract. Putting this here rather than in the callers
 * is what makes the list and the calendar agree: both read one expansion.
 *
 * @param {{ startsAtMs: number, recurrence: 'none' | 'daily' | 'weekly', weekdays: readonly number[], tz: string, durationMinutes?: number }} event
 * @param {number} fromMs window start (UTC ms, inclusive)
 * @param {number} toMs   window end (UTC ms, inclusive)
 * @param {number} [maxCount] safety cap on returned occurrences
 * @returns {number[]} occurrence start instants, UTC ms
 */
export function expandOccurrences(event, fromMs, toMs, maxCount = 366) {
  if (!(toMs >= fromMs)) return [];

  const graceMs = inProgressWindowMs(event.durationMinutes);

  if (event.recurrence === 'none') {
    return event.startsAtMs + graceMs >= fromMs && event.startsAtMs <= toMs
      ? [event.startsAtMs]
      : [];
  }

  const anchor = wallTime(event.startsAtMs, event.tz);
  const anchorDateUtc = Date.UTC(anchor.year, anchor.month - 1, anchor.day);

  // Skip straight to just before the window instead of scanning from the
  // anchor — a series created a year ago must not cost 365 iterations. The
  // 2-day back-off absorbs any tz-offset skew in the estimate, and subtracting
  // the grace first keeps an occurrence that began before `fromMs` (and is
  // still in progress) inside the scanned range.
  const firstDay = Math.max(0, Math.floor((fromMs - graceMs - event.startsAtMs) / DAY_MS) - 2);

  /** @type {number[]} */
  const out = [];
  for (let i = 0; i <= MAX_SCAN_DAYS && out.length < maxCount; i++) {
    const dayUtc = new Date(anchorDateUtc + (firstDay + i) * DAY_MS);
    const candidate = {
      year: dayUtc.getUTCFullYear(),
      month: dayUtc.getUTCMonth() + 1,
      day: dayUtc.getUTCDate(),
      hour: anchor.hour,
      minute: anchor.minute,
      second: anchor.second,
    };
    const ts = wallTimeToUtc(candidate, event.tz);
    if (ts > toMs) break;
    if (ts < event.startsAtMs || ts + graceMs < fromMs) continue;
    if (event.recurrence === 'weekly' && !event.weekdays.includes(wallTimeWeekday(candidate))) continue;
    out.push(ts);
  }
  return out;
}
