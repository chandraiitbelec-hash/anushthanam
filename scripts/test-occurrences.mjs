/**
 * Unit tests for the pure recurrence/timezone math in lib/occurrences.mjs.
 * No DB, no build step:
 *
 *   node scripts/test-occurrences.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wallTime,
  wallTimeToUtc,
  wallTimeWeekday,
  expandOccurrences,
  inProgressWindowMs,
  isValidTimeZone,
} from '../lib/occurrences.mjs';

const IST = 'Asia/Kolkata';
const NY = 'America/New_York';

test('wallTime reads IST wall clock from a UTC instant', () => {
  // 2026-09-01T13:00Z = 18:30 IST (+05:30)
  const wt = wallTime(Date.UTC(2026, 8, 1, 13, 0), IST);
  assert.deepEqual(wt, { year: 2026, month: 9, day: 1, hour: 18, minute: 30, second: 0 });
});

test('wallTime normalizes midnight (the en-US "24" quirk)', () => {
  // 18:30Z = 00:00 IST next day
  const wt = wallTime(Date.UTC(2026, 8, 1, 18, 30), IST);
  assert.equal(wt.hour, 0);
  assert.equal(wt.day, 2);
});

test('wallTimeToUtc inverts wallTime', () => {
  const ts = Date.UTC(2026, 8, 1, 13, 0);
  for (const tz of [IST, NY, 'UTC', 'Pacific/Auckland']) {
    assert.equal(wallTimeToUtc(wallTime(ts, tz), tz), ts, tz);
  }
});

test('wallTimeWeekday matches JS getDay convention', () => {
  // 2026-09-01 is a Tuesday
  assert.equal(wallTimeWeekday({ year: 2026, month: 9, day: 1 }), 2);
  // 2026-09-06 is a Sunday
  assert.equal(wallTimeWeekday({ year: 2026, month: 9, day: 6 }), 0);
});

test('one-off event: included only when inside the window', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'none', weekdays: [], tz: IST };
  assert.deepEqual(expandOccurrences(ev, startsAtMs - DAY, startsAtMs + DAY), [startsAtMs]);
  assert.deepEqual(expandOccurrences(ev, startsAtMs + 1, startsAtMs + DAY), []);
  assert.deepEqual(expandOccurrences(ev, startsAtMs - DAY, startsAtMs - 1), []);
});

const DAY = 86_400_000;

test('daily event: one occurrence per day at the same IST wall time', () => {
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0); // 18:30 IST
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 6 * DAY);
  assert.equal(out.length, 7);
  for (const ts of out) {
    const wt = wallTime(ts, IST);
    assert.equal(wt.hour, 18);
    assert.equal(wt.minute, 30);
  }
  // IST has no DST, so the UTC spacing is exactly 24h.
  for (let i = 1; i < out.length; i++) assert.equal(out[i] - out[i - 1], DAY);
});

test('daily event: occurrences never precede the anchor', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST };
  const out = expandOccurrences(ev, startsAtMs - 5 * DAY, startsAtMs + 2 * DAY);
  assert.equal(out.length, 3);
  assert.equal(out[0], startsAtMs);
});

test('daily event: window far past the anchor still starts at the window', () => {
  const startsAtMs = Date.UTC(2025, 0, 1, 13, 0); // anchored over a year back
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST };
  const from = Date.UTC(2026, 8, 1, 0, 0);
  // 13:00Z daily; [Sep 1 00:00Z, Sep 10 00:00Z] contains Sep 1–9 = 9 occurrences.
  const out = expandOccurrences(ev, from, from + 9 * DAY);
  assert.equal(out.length, 9);
  assert.ok(out[0] >= from);
  assert.deepEqual(wallTime(out[0], IST), { year: 2026, month: 9, day: 1, hour: 18, minute: 30, second: 0 });
});

test('weekly event: only the selected weekdays, in the anchor tz', () => {
  // Anchor: Tue 2026-09-01 18:30 IST; rule: Tue + Sat
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'weekly', weekdays: [2, 6], tz: IST };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 13 * DAY);
  const days = out.map(ts => wallTime(ts, IST).day);
  assert.deepEqual(days, [1, 5, 8, 12]); // Tue 1, Sat 5, Tue 8, Sat 12
  for (const ts of out) assert.ok([2, 6].includes(wallTimeWeekday(wallTime(ts, IST))));
});

test('weekly event: anchor weekday not in the set is not emitted', () => {
  // Anchor Tue, rule says Sundays only — first occurrence is the next Sunday.
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'weekly', weekdays: [0], tz: IST };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 13 * DAY);
  assert.deepEqual(out.map(ts => wallTime(ts, IST).day), [6, 13]);
});

test('daily event across a US DST fall-back keeps its local wall time', () => {
  // 2026-11-01 02:00 America/New_York falls back to 01:00. A 19:00 NY event
  // must stay 19:00 local — meaning the UTC instant shifts by an hour.
  const startsAtMs = wallTimeToUtc({ year: 2026, month: 10, day: 30, hour: 19, minute: 0 }, NY);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: NY };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 4 * DAY + 3_600_000);
  assert.equal(out.length, 5); // Oct 30, 31, Nov 1, 2, 3
  for (const ts of out) assert.equal(wallTime(ts, NY).hour, 19);
  // Oct 31 → Nov 1 spacing is 25h (the clocks gained an hour).
  assert.equal(out[2] - out[1], 25 * 3_600_000);
  assert.equal(out[3] - out[2], 24 * 3_600_000);
});

test('daily event across a US DST spring-forward keeps its local wall time', () => {
  // 2026-03-08 02:00 America/New_York springs forward to 03:00.
  const startsAtMs = wallTimeToUtc({ year: 2026, month: 3, day: 7, hour: 19, minute: 0 }, NY);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: NY };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 2 * DAY);
  assert.equal(out.length, 3);
  for (const ts of out) assert.equal(wallTime(ts, NY).hour, 19);
  assert.equal(out[1] - out[0], 23 * 3_600_000); // clocks lost an hour
});

test('maxCount caps a runaway expansion', () => {
  const startsAtMs = Date.UTC(2026, 0, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST };
  const out = expandOccurrences(ev, startsAtMs, startsAtMs + 365 * DAY, 10);
  assert.equal(out.length, 10);
});

test('empty and inverted windows return nothing', () => {
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST };
  assert.deepEqual(expandOccurrences(ev, startsAtMs + DAY, startsAtMs), []);
});

test('isValidTimeZone accepts IANA names and rejects junk', () => {
  assert.ok(isValidTimeZone('Asia/Kolkata'));
  assert.ok(isValidTimeZone('UTC'));
  assert.ok(!isValidTimeZone('Not/AZone'));
  assert.ok(!isValidTimeZone(''));
  assert.ok(!isValidTimeZone('DROP TABLE events'));
});

// ---------------------------------------------------------------------------
// The in-progress window: an occurrence stays visible while it is happening.
// ---------------------------------------------------------------------------

const HOUR = 3_600_000;

test('inProgressWindowMs floors short events at an hour and honours long ones', () => {
  assert.equal(inProgressWindowMs(15), HOUR);
  assert.equal(inProgressWindowMs(60), HOUR);
  assert.equal(inProgressWindowMs(90), 90 * 60_000);
  assert.equal(inProgressWindowMs(1440), 24 * HOUR);
  // No duration means the caller wants future starts only (the old contract).
  assert.equal(inProgressWindowMs(undefined), 0);
  assert.equal(inProgressWindowMs(0), 0);
  assert.equal(inProgressWindowMs(-5), 0);
  assert.equal(inProgressWindowMs(NaN), 0);
});

test('one-off mid-event is still returned (the bug that hid live gatherings)', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'none', weekdays: [], tz: IST, durationMinutes: 90 };
  // "now" is 30 minutes into a 90-minute event.
  const now = startsAtMs + 30 * 60_000;
  assert.deepEqual(expandOccurrences(ev, now, now + 60 * DAY), [startsAtMs]);
});

test('one-off after its end is dropped', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'none', weekdays: [], tz: IST, durationMinutes: 90 };
  // A minute past start + 90 min.
  const now = startsAtMs + 91 * 60_000;
  assert.deepEqual(expandOccurrences(ev, now, now + 60 * DAY), []);
  // Exactly at the end it is still in — the boundary is inclusive.
  const atEnd = startsAtMs + 90 * 60_000;
  assert.deepEqual(expandOccurrences(ev, atEnd, atEnd + 60 * DAY), [startsAtMs]);
});

test('a short one-off gets the one-hour floor, not its 15 minutes', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'none', weekdays: [], tz: IST, durationMinutes: 15 };
  const at50min = startsAtMs + 50 * 60_000;
  assert.deepEqual(expandOccurrences(ev, at50min, at50min + DAY), [startsAtMs]);
  const at61min = startsAtMs + 61 * 60_000;
  assert.deepEqual(expandOccurrences(ev, at61min, at61min + DAY), []);
});

test('a duration-less one-off keeps the old future-starts-only behaviour', () => {
  const startsAtMs = Date.UTC(2026, 8, 10, 13, 0);
  const ev = { startsAtMs, recurrence: 'none', weekdays: [], tz: IST };
  assert.deepEqual(expandOccurrences(ev, startsAtMs + 1, startsAtMs + DAY), []);
});

test('recurring occurrence mid-event is returned, and only that one', () => {
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0); // 18:30 IST daily
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST, durationMinutes: 90 };
  // 30 minutes into the Sep 5 occurrence.
  const sep5 = startsAtMs + 4 * DAY;
  const now = sep5 + 30 * 60_000;
  const out = expandOccurrences(ev, now, now + 2 * DAY);
  // Today's in-progress one, plus Sep 6 and Sep 7. Yesterday's is long over.
  assert.deepEqual(out.map(ts => wallTime(ts, IST).day), [5, 6, 7]);
  assert.equal(out[0], sep5);
});

test('recurring occurrence past its end is dropped again', () => {
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: IST, durationMinutes: 90 };
  const sep5 = startsAtMs + 4 * DAY;
  const now = sep5 + 91 * 60_000;
  const out = expandOccurrences(ev, now, now + 2 * DAY);
  assert.deepEqual(out.map(ts => wallTime(ts, IST).day), [6, 7]);
});

test('a weekly occurrence in progress is returned on a non-selected-day query', () => {
  // Anchor Tue 2026-09-01 18:30 IST; rule Tue + Sat; 3h long.
  const startsAtMs = Date.UTC(2026, 8, 1, 13, 0);
  const ev = { startsAtMs, recurrence: 'weekly', weekdays: [2, 6], tz: IST, durationMinutes: 180 };
  const now = startsAtMs + 2 * HOUR; // still inside Tuesday's session
  const out = expandOccurrences(ev, now, now + 4 * DAY);
  assert.deepEqual(out.map(ts => wallTime(ts, IST).day), [1, 5]); // Tue 1 (on now), Sat 5
});

test('the in-progress window leaves the DST boundary math alone', () => {
  // Same series as the fall-back test above, now with a duration attached: the
  // occurrences and their local wall times must be identical.
  const startsAtMs = wallTimeToUtc({ year: 2026, month: 10, day: 30, hour: 19, minute: 0 }, NY);
  const bare = { startsAtMs, recurrence: 'daily', weekdays: [], tz: NY };
  const withDuration = { ...bare, durationMinutes: 60 };
  const from = startsAtMs;
  const to = startsAtMs + 4 * DAY + HOUR;
  assert.deepEqual(expandOccurrences(withDuration, from, to), expandOccurrences(bare, from, to));
  for (const ts of expandOccurrences(withDuration, from, to)) {
    assert.equal(wallTime(ts, NY).hour, 19);
  }
});

test('a DST spring-forward occurrence in progress is still found', () => {
  // 19:00 NY on 2026-03-07, 2h long; query from inside the 2026-03-08 session,
  // the day the clocks jump forward.
  const startsAtMs = wallTimeToUtc({ year: 2026, month: 3, day: 7, hour: 19, minute: 0 }, NY);
  const ev = { startsAtMs, recurrence: 'daily', weekdays: [], tz: NY, durationMinutes: 120 };
  const mar8 = wallTimeToUtc({ year: 2026, month: 3, day: 8, hour: 19, minute: 0 }, NY);
  const now = mar8 + HOUR;
  const out = expandOccurrences(ev, now, now + DAY);
  assert.equal(out[0], mar8);
  assert.equal(wallTime(out[0], NY).hour, 19);
});
