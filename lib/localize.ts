import type { Language } from './types';

// Union of field "bases" on T for which `${base}_en` is a string property —
// i.e. the set of valid `field` arguments to localize() for a given entity type.
type FieldBase<T> = {
  [K in keyof T]: K extends `${infer Base}_en`
    ? T[K] extends string
      ? Base
      : never
    : never;
}[keyof T];

// True only when T is exactly Record<string, string> (not merely structurally
// compatible with it) — a named entity type whose fields all happen to be
// string-typed (e.g. God, Shloka) is otherwise indistinguishable from a raw row
// under plain `T extends Record<string, string>`, which would silently defeat
// the FieldBase check below by falling through to the untyped overload.
type IsRawRow<T> = [T] extends [Record<string, string>]
  ? [Record<string, string>] extends [T]
    ? true
    : false
  : false;

function pick(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim() ? value : undefined;
}

// Typed entities: field is constrained to bases where `${field}_en` exists and is a string.
export function localize<T extends object, F extends FieldBase<T> & string>(entity: T, field: F, lang: Language): string;
// Raw-row escape hatch: entity's static type is exactly Record<string, string> (e.g. a
// Sheets row not yet passed through a rowTo* mapper) — field unconstrained.
export function localize<T extends Record<string, string>>(entity: IsRawRow<T> extends true ? T : never, field: string, lang: Language): string;
export function localize(entity: object, field: string, lang: Language): string {
  const rec = entity as unknown as Record<string, string>;
  return pick(rec[`${field}_${lang}`]) ?? pick(rec[`${field}_en`]) ?? '';
}

// The language localize() *actually* resolved to for this field — the requested
// `lang` when that column has content, otherwise 'en' (the fallback), and 'en'
// when the field is empty in every language.
//
// Callers need this because a value's language and the active UI language are
// not the same thing: an entity with no Tamil translation shows English text to
// a Tamil visitor, and styling that text off the raw `lang` prop applies the
// wrong script's font/line-height to it. Drive scriptClass() and any
// per-script font/line-height off this, not off the UI language.
export function localizeLang<T extends object, F extends FieldBase<T> & string>(entity: T, field: F, lang: Language): Language;
export function localizeLang<T extends Record<string, string>>(entity: IsRawRow<T> extends true ? T : never, field: string, lang: Language): Language;
export function localizeLang(entity: object, field: string, lang: Language): Language {
  const rec = entity as unknown as Record<string, string>;
  return pick(rec[`${field}_${lang}`]) !== undefined ? lang : 'en';
}

// Same resolution rule as localize()/localizeLang(), for values that arrive as a
// plain per-language map (e.g. EntityCard's `names` prop) rather than as
// `field_{lang}` columns on an entity. Returns the text *and* the language it
// came from, so the caller can style it correctly in one step.
export function localizeMap(
  values: Partial<Record<Language, string>> & { en: string },
  lang: Language,
): { text: string; lang: Language } {
  const requested = pick(values[lang]);
  if (requested !== undefined) return { text: requested, lang };
  return { text: pick(values.en) ?? '', lang: 'en' };
}
