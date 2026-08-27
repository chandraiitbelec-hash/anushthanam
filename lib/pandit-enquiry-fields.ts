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
