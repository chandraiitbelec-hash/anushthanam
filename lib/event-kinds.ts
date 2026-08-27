/**
 * What sort of event a schedule entry is. 'gathering' is a plain entry in the
 * timetable; 'satsang' additionally carries a live audio session (see
 * lib/satsang.ts). The `events.kind` column has existed since migration 0002
 * precisely so this stays a value rather than a schema change — the
 * pandit-booking feature is expected to add a third.
 *
 * **This module must stay free of imports.** The kind is needed by client
 * components (the event form's type toggle, the detail page's badge) as a
 * runtime value, and every other module that could own it — lib/schedule.ts,
 * lib/satsang.ts — reaches lib/db.ts and therefore `pg`, which cannot be
 * bundled for the browser. Keeping the vocabulary here is what lets both sides
 * share it.
 */

export const EVENT_KINDS = ['gathering', 'satsang'] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

/** The `events.kind` value that makes an event a live audio session. */
export const SATSANG_KIND = 'satsang';

export const DEFAULT_EVENT_KIND = 'gathering';
