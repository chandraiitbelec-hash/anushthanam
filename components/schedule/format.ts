'use client';

import { useSyncExternalStore } from 'react';
import { LOCALE_MAP } from '@/lib/utils';
import { wallTime } from '@/lib/occurrences.mjs';

/**
 * Client-side date/time formatting for the Schedule UI. Occurrences are stored
 * and passed around as UTC instants (ISO strings) and rendered in each
 * viewer's local timezone.
 *
 * The SSR wrinkle: the server doesn't know the viewer's zone, so rendering
 * "local time" during SSR would hydrate against different text. The
 * useSyncExternalStore server snapshot below pins SSR (and the hydration
 * render) to Asia/Kolkata — deterministic on both sides, and the right answer
 * for most of the audience — then the first client render swaps in the real
 * browser zone. Same no-mismatch pattern as LanguageProvider.
 */

const subscribeNever = () => () => {};
const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};
const getServerTimeZone = () => 'Asia/Kolkata';

/** The IANA zone to render times in: viewer-local, Asia/Kolkata during SSR. */
export function useDisplayTimeZone(): string {
  return useSyncExternalStore(subscribeNever, getBrowserTimeZone, getServerTimeZone);
}

export function localeFor(lang: string): string {
  return LOCALE_MAP[lang] ?? 'en-IN';
}

/** "6:30 pm" in the given zone. */
export function formatTime(iso: string, lang: string, tz: string): string {
  return new Date(iso).toLocaleTimeString(localeFor(lang), {
    hour: 'numeric', minute: '2-digit', timeZone: tz,
  });
}

/** "Tue, 1 September 2026" in the given zone. */
export function formatDateHeading(iso: string, lang: string, tz: string): string {
  return new Date(iso).toLocaleDateString(localeFor(lang), {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz,
  });
}

/** Full date + time on one line. */
export function formatDateTime(iso: string, lang: string, tz: string): string {
  return `${formatDateHeading(iso, lang, tz)} · ${formatTime(iso, lang, tz)}`;
}

/** "2026-09-01" — grouping/bucketing key for an instant in the given zone. */
export function localDateKey(iso: string, tz: string): string {
  const w = wallTime(Date.parse(iso), tz);
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;
}

/** Localized short weekday name for our 0=Sunday … 6=Saturday convention. */
export function weekdayShortName(weekday: number, lang: string): string {
  // 2023-01-01 was a Sunday; formatting in UTC keeps the offset from moving the day.
  return new Date(Date.UTC(2023, 0, 1 + weekday)).toLocaleDateString(localeFor(lang), {
    weekday: 'short', timeZone: 'UTC',
  });
}

/** "September 2026" for the calendar header (month is 1-based). */
export function monthLabel(year: number, month: number, lang: string): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(localeFor(lang), {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
