/**
 * The shape of a pandit enquiry, as both the browser form and the route
 * handler need to agree on it: option vocabularies, length limits, and the
 * one non-trivial validity rule (what counts as a usable contact).
 *
 * **This module must stay free of imports**, for the same reason
 * lib/event-kinds.ts does: it is imported as a runtime value by a client
 * component, and lib/pandit-enquiry.ts — the natural home for this — reaches
 * lib/db.ts and therefore `pg`, which cannot be bundled for the browser.
 * A value import from there into the form is a Turbopack build failure that
 * neither `tsc` nor `next dev` will catch.
 */

/**
 * Language the visitor would like the ceremony conducted in. 'other' is a real
 * answer, not a fallback — a Kannada or Marathi family is exactly the kind of
 * demand this test should be able to see rather than round off.
 */
export const ENQUIRY_LANGUAGES = ['te', 'ta', 'hi', 'en', 'other'] as const;

export type EnquiryLanguage = (typeof ENQUIRY_LANGUAGES)[number];

/**
 * The ceremony-select value meaning "none of these". Chosen so it cannot
 * collide with a real puja or occasion slug, which are plain kebab-case.
 */
export const CEREMONY_OTHER = '__other__';


/**
 * Expected length of the ceremony. Bands, not minutes: almost no family knows
 * the number, and a band is what a pandit needs in order to judge whether he
 * can take the booking.
 */
export const ENQUIRY_DURATION_BANDS = [
  'upto-1h', '1-2h', '2-4h', 'half-day', 'full-day', 'multi-day',
] as const;

export type EnquiryDurationBand = (typeof ENQUIRY_DURATION_BANDS)[number];

/**
 * How settled the date is. 'muhurtham-pending' is the common case a plain date
 * field cannot express — the ceremony is happening, the auspicious time is not
 * fixed yet — and 'exploring' is what separates real booking intent from
 * browsing, which is the distinction the §9.1 threshold turns on.
 */
export const ENQUIRY_TIMING_WINDOWS = [
  'date-fixed', 'muhurtham-pending', 'within-month', 'within-3-months', 'exploring',
] as const;

export type EnquiryTimingWindow = (typeof ENQUIRY_TIMING_WINDOWS)[number];

/**
 * Dakshina the family has in mind, as a band they pick for themselves.
 *
 * Bound by the PRD's §7.2 guardrails, which is why the shape is what it is:
 * the figures are shagun-shaped (2,100 / 5,100 / 11,000 / 21,000) rather than
 * round retail numbers; the word in the UI is dakshina, never price, fee or
 * charges; there is no 'starting from'; and nothing on this site ranks,
 * sorts or compares on this value. 'discuss' is a real answer, not a
 * fallback — a family that would rather talk about it has said something.
 *
 * The bands are rupee amounts, which is an assumption about the audience
 * rather than a fact about the platform. Revisit before the first enquiry
 * arrives from outside India.
 */
export const ENQUIRY_DAKSHINA_BANDS = [
  'upto-2100', '2100-5100', '5100-11000', '11000-21000', 'above-21000', 'discuss',
] as const;

export type EnquiryDakshinaBand = (typeof ENQUIRY_DAKSHINA_BANDS)[number];

/** The select value meaning "left blank". Distinct from a real answer. */
export const ENQUIRY_UNSET = '';

/** Mirrors the CHECK constraints in db/migrations/0004_create_pandit_enquiries.sql. */
export const ENQUIRY_LIMITS = {
  ceremonyOther: 200,
  city: 120,
  contact: 200,
  area: 120,
  note: 2000,
  slug: 100,
} as const;

/**
 * Is this plausibly a phone number or an email address?
 *
 * Deliberately permissive. One contact field is offered rather than two so the
 * visitor answers in whatever form they actually use, and the cost of a false
 * reject here (a real enquiry lost, which is the entire quantity being
 * measured) is far higher than the cost of a false accept (the owner reads a
 * junk row and moves on). So: anything with an @ and a dot after it, or
 * anything with at least seven digits.
 */
export function looksLikeContact(value: string): boolean {
  const v = value.trim();
  if (v.length < 3 || v.length > ENQUIRY_LIMITS.contact) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  return (v.match(/\d/g) ?? []).length >= 7;
}

/** The honeypot field's name. Never shown to a human; see the form component. */
export const HONEYPOT_FIELD = 'website';

/**
 * Where an enquiry came from — the entry point the visitor actually used.
 *
 * The demand test's whole deliverable is a number *per source*: §9.1 asks not
 * only whether enquiries arrive but which content earns them, so an entry
 * point that cannot be told apart from another has measured nothing. Each one
 * therefore serialises to its own string, stored in `pandit_enquiries.source`
 * (migration 0006).
 *
 * This lives here, with the rest of the shared vocabulary, because the browser
 * form sends the value and the route validates it, and neither may import the
 * other's module — see the no-imports note at the top of this file.
 *
 * Note the deliberate distinction from `source_puja_slug`: that column answers
 * "which puja page's content did this come off", this one answers "which
 * control did they use". They coincide for the puja card and nowhere else.
 */
export type EnquirySource =
  /** The card at the foot of a booking-intent puja detail page. */
  | { kind: 'puja'; slug: string }
  /** The link inside an occasion's panel in the /pujas accordion. */
  | { kind: 'pujas-occasion'; slug: string }
  /** /find-a-pandit reached any other way — nav, a shared link, search. */
  | { kind: 'standalone' };

export const ENQUIRY_SOURCE_STANDALONE = 'standalone';
const PUJA_PREFIX = 'puja:';
const OCCASION_PREFIX = 'pujas-occasion:';

/** Serialise a source for the wire and for the `source` column. */
export function formatEnquirySource(source: EnquirySource): string {
  switch (source.kind) {
    case 'puja': return `${PUJA_PREFIX}${source.slug}`;
    case 'pujas-occasion': return `${OCCASION_PREFIX}${source.slug}`;
    case 'standalone': return ENQUIRY_SOURCE_STANDALONE;
  }
}

const SOURCE_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;

/**
 * Parse an untrusted `source` back into a shape, or null if it is not one of
 * the three. Shape only — that the slug names a real puja or occasion is
 * checked server-side against the catalogue (see lib/pandit-enquiry-placement).
 */
export function parseEnquirySource(raw: unknown): EnquirySource | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (v === ENQUIRY_SOURCE_STANDALONE) return { kind: 'standalone' };
  if (v.startsWith(PUJA_PREFIX)) {
    const slug = v.slice(PUJA_PREFIX.length);
    return SOURCE_SLUG_RE.test(slug) ? { kind: 'puja', slug } : null;
  }
  if (v.startsWith(OCCASION_PREFIX)) {
    const slug = v.slice(OCCASION_PREFIX.length);
    return SOURCE_SLUG_RE.test(slug) ? { kind: 'pujas-occasion', slug } : null;
  }
  return null;
}
