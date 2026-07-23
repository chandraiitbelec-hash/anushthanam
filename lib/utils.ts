import type { Language, TranslationResult } from './types';

export function t(
  record: Record<string, string>,
  field: string,
  lang: Language
): TranslationResult {
  const direct = record[`${field}_${lang}`];
  if (direct) return { value: direct, isFallback: false, lang };
  const fallback = record[`${field}_en`] || '';
  return { value: fallback, isFallback: true, lang: 'en' };
}

export function tVal(
  record: Record<string, string>,
  field: string,
  lang: Language
): string {
  return t(record, field, lang).value;
}

// Split a stanza cell on | to get individual lines
export function splitStanzaLines(text: string): string[] {
  return text.split('|').map(s => s.trim()).filter(Boolean);
}

// Audience is India-only; hardcoding IST avoids UTC dates being ~5:30h behind
// (e.g. midnight-5:30am IST would otherwise read as "yesterday").
export function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const LOCALE_MAP: Record<string, string> = { en: 'en-IN', te: 'te-IN', ta: 'ta-IN', hi: 'hi-IN' };

export function formatDateLocalized(dateStr: string, lang: string): string {
  if (!dateStr) return '';
  const locale = LOCALE_MAP[lang] ?? 'en-IN';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}
