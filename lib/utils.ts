import type { Language, ShlokaType } from './types';
import { UI } from './ui-strings';

// Localized display label for a shloka type (e.g. 'chalisa' -> 'Chalisa' / 'చాలీసా').
// Falls back to a capitalized version of the raw type if no matching UI key exists.
export function shlokaTypeLabel(type: ShlokaType | string, lang: Language): string {
  const ui = UI[lang];
  const key = ('shlokaType' + type.charAt(0).toUpperCase() + type.slice(1)) as keyof typeof ui;
  const label = ui[key];
  return typeof label === 'string' ? label : type.charAt(0).toUpperCase() + type.slice(1);
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

export const LOCALE_MAP: Record<string, string> = { en: 'en-IN', te: 'te-IN', ta: 'ta-IN', hi: 'hi-IN' };

export function formatDateLocalized(dateStr: string, lang: string): string {
  if (!dateStr) return '';
  const locale = LOCALE_MAP[lang] ?? 'en-IN';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const SCRIPT_CLASS_MAP: Record<string, string> = {
  te: 'script-telugu',
  ta: 'script-tamil',
  hi: 'script-devanagari',
};

// Native-script CSS class for the language the *displayed text* is in; '' for en
// (uses the default Latin font stack).
//
// Pass the language the string actually resolved to, not the active UI language —
// use localizeLang()/localizeMap() from lib/localize to get it. An entity with no
// Tamil translation renders its English name to a Tamil visitor, and
// scriptClass('ta') would then set Noto Sans Tamil (and Tamil's taller
// line-height) on Latin text.
export function scriptClass(lang: string): string {
  return SCRIPT_CLASS_MAP[lang] ?? '';
}
