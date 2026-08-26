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

// Tokens that end in '.' without ending a sentence — the boundary detector below
// skips a break when the preceding word is one of these (or a lone initial like
// "M."), so "Sri. Ramanuja" or "approx. 200 steps" never becomes a paragraph break.
const NON_TERMINAL_ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'st', 'mt', 'rev', 'sri', 'shri', 'smt', 'fr',
  'jr', 'sr', 'vs', 'no', 'nos', 'approx', 'c', 'ca', 'cf', 'eg', 'ie', 'etc',
  'al', 'ft', 'rd', 'dist', 'govt', 'col', 'gen', 'capt', 'lt', 'hon', 'esp',
  'ad', 'bc', 'ce', 'bce', 'fig', 'vol', 'ch', 'pp', 'ibid', 'viz',
]);

// Only prose past this length is worth breaking up at all; shorter fields are
// returned untouched as a single paragraph (i.e. exactly today's rendering).
const PARAGRAPH_MIN_SOURCE_LENGTH = 900;
const PARAGRAPH_TARGET_LENGTH = 420;
const PARAGRAPH_MAX_LENGTH = 640;
// A trailing group shorter than this is folded back into the previous paragraph
// rather than left as a one-line orphan.
const PARAGRAPH_MIN_TAIL_LENGTH = 140;

function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let start = 0;
  // A sentence end is .!? (optionally closed by a quote/bracket) + whitespace +
  // a capital. Requiring the capital is what keeps decimals ("1.12 hectares"),
  // dates and mid-sentence initials from registering as boundaries — and it also
  // means Telugu/Tamil/Devanagari prose yields no boundaries at all, so it falls
  // through to the single-paragraph path instead of being split by Latin rules.
  const boundary = /([.!?])(["')\]]?)(\s+)(?=["'(]?[A-Z])/g;
  let match: RegExpExecArray | null;
  while ((match = boundary.exec(text)) !== null) {
    const end = match.index + match[1].length + match[2].length;
    const sentence = text.slice(start, end);
    const lastWord = (sentence.match(/(\S+)\.$/)?.[1] ?? '').replace(/[^A-Za-z.]/g, '').toLowerCase();
    if (NON_TERMINAL_ABBREVIATIONS.has(lastWord.replace(/\.$/, '')) || /^[a-z](\.[a-z])*$/.test(lastWord)) continue;
    parts.push(sentence.trim());
    start = end + match[3].length;
    boundary.lastIndex = start;
  }
  const tail = text.slice(start).trim();
  if (tail) parts.push(tail);
  return parts;
}

// Group a single long prose field into readable paragraphs at sentence
// boundaries. Presentation only: the returned strings joined by a space are
// always the input with whitespace collapsed — no word is added, dropped or
// reordered — so this changes typography, never content. Used for temple
// history/significance, which arrive from the sheet as one unbroken run of text
// with no authored paragraph breaks to split on.
export function splitIntoParagraphs(text: string): string[] {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length < PARAGRAPH_MIN_SOURCE_LENGTH) return [collapsed];

  const sentences = splitSentences(collapsed);
  if (sentences.length < 3) return [collapsed];

  const groups: string[] = [];
  let current: string[] = [];
  let length = 0;
  for (const sentence of sentences) {
    // Close the current paragraph before a sentence that would overshoot badly,
    // so one very long sentence doesn't drag a whole paragraph along with it.
    if (current.length && length + sentence.length > PARAGRAPH_MAX_LENGTH) {
      groups.push(current.join(' '));
      current = [];
      length = 0;
    }
    current.push(sentence);
    length += sentence.length + 1;
    if (length >= PARAGRAPH_TARGET_LENGTH) {
      groups.push(current.join(' '));
      current = [];
      length = 0;
    }
  }
  if (current.length) {
    const tail = current.join(' ');
    if (tail.length < PARAGRAPH_MIN_TAIL_LENGTH && groups.length) groups[groups.length - 1] += ` ${tail}`;
    else groups.push(tail);
  }
  return groups;
}
