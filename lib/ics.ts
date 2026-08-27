import { wallTime } from './occurrences.mjs';
import type { ScheduleEvent } from './schedule';

/**
 * iCalendar (RFC 5545) export for one event — the whole v1 reminder story.
 * A single VEVENT; recurring events carry an RRULE instead of pre-expanded
 * instances.
 *
 * One-off events use the UTC form (DTSTART:...Z) — fully standard with no
 * timezone baggage. Recurring events must keep their wall-clock anchor to
 * survive DST, so they use DTSTART;TZID=<IANA zone> local time. We reference
 * the IANA TZID without embedding a VTIMEZONE component: generating correct
 * DST rules per zone needs a tz database, and Google/Apple/Outlook all resolve
 * well-known IANA ids themselves. Revisit only if a real client rejects it.
 */

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 20260901T130000Z — UTC basic format. */
function icsUtc(ms: number): string {
  const d = new Date(ms);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** 20260901T183000 — floating local form, for use with a TZID parameter. */
function icsLocal(ms: number, tz: string): string {
  const w = wallTime(ms, tz);
  return `${w.year}${pad(w.month)}${pad(w.day)}T${pad(w.hour)}${pad(w.minute)}${pad(w.second)}`;
}

/** TEXT value escaping per RFC 5545 §3.3.11. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

const encoder = new TextEncoder();

/**
 * Folds a content line to <=75 octets per line (RFC 5545 §3.1). Octets, not
 * characters — Telugu/Tamil/Devanagari titles are 3 bytes per code point in
 * UTF-8. Splits only at code-point boundaries (continuation lines start with
 * a single space, which costs one of their 75 octets).
 */
function foldLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let currentOctets = 0;
  let limit = 75;
  for (const ch of line) {
    const chOctets = encoder.encode(ch).length;
    if (currentOctets + chOctets > limit) {
      out.push(current);
      current = ' ';
      currentOctets = 1;
      limit = 75;
    }
    current += ch;
    currentOctets += chOctets;
  }
  out.push(current);
  return out;
}

/** BYDAY codes indexed by our weekday convention (0=Sunday … 6=Saturday). */
const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export function buildEventIcs(event: ScheduleEvent, nowMs: number): string {
  const startsAtMs = Date.parse(event.startsAt);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anushthanam//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@anushthanam`,
    `DTSTAMP:${icsUtc(nowMs)}`,
  ];

  if (event.recurrence === 'none') {
    lines.push(`DTSTART:${icsUtc(startsAtMs)}`);
  } else {
    lines.push(`DTSTART;TZID=${event.tz}:${icsLocal(startsAtMs, event.tz)}`);
    if (event.recurrence === 'daily') {
      lines.push('RRULE:FREQ=DAILY');
    } else {
      const byday = [...event.weekdays].sort().map(d => BYDAY[d]).join(',');
      lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byday}`);
    }
  }

  lines.push(`DURATION:PT${event.durationMinutes}M`);
  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  lines.push(`STATUS:${event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.flatMap(foldLine).join('\r\n') + '\r\n';
}
