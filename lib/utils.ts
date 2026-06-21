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

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
