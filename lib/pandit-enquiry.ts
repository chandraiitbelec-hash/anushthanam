import { createHash } from 'node:crypto';
import { query, isDbConfigured } from './db';
import {
  CEREMONY_OTHER,
  ENQUIRY_DAKSHINA_BANDS,
  ENQUIRY_DURATION_BANDS,
  ENQUIRY_LANGUAGES,
  ENQUIRY_LIMITS,
  ENQUIRY_TIMING_WINDOWS,
  looksLikeContact,
  type EnquiryDakshinaBand,
  type EnquiryDurationBand,
  type EnquiryLanguage,
  type EnquiryTimingWindow,
} from './pandit-enquiry-fields';

/**
 * Server-side data access for the pandit demand test (PRD §9.1).
 *
 * There is no read path on the site: nothing renders from this table, and
 * nothing should. The owner reads enquiries with
 * scripts/list-pandit-enquiries.mjs. See the PRIVACY note in
 * db/migrations/0004_create_pandit_enquiries.sql before adding a consumer.
 *
 * Nothing here is ever logged with its payload — an insert failure logs the
 * error and the fact that it happened, never the contact details.
 */

export type EnquiryInput = {
  /** A puja or occasion slug from the catalogue; null when the visitor typed their own. */
  ceremonySlug: string | null;
  /** The visitor's own words; null when they picked from the catalogue. */
  ceremonyOther: string | null;
  /** The page the enquiry came from. */
  sourcePujaSlug: string;
  city: string;
  /** Neighbourhood within the city. Free text, optional. */
  area: string | null;
  lang: EnquiryLanguage;
  /** YYYY-MM-DD, or null. */
  preferredDate: string | null;
  /** HH:MM wall-clock in the city named above, or null. */
  preferredTime: string | null;
  durationBand: EnquiryDurationBand | null;
  timingWindow: EnquiryTimingWindow | null;
  /** What the family has in mind — never what we quote. See §7.2. */
  dakshinaBand: EnquiryDakshinaBand | null;
  /** Personal data — phone or email. */
  contact: string;
  note: string | null;
};

/** Submissions allowed per submitter per hour. Deliberately generous: a family
 *  comparing two ceremonies should never hit it, a script should. */
export const ENQUIRY_RATE_LIMIT = 3;

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Optional single-choice fields. Absent, empty and unrecognised all resolve to
 * null — every one of these is optional in the form, so a stray value must
 * become "not answered" rather than a stored answer or a rejected submission.
 */
function optionalChoice<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

function trimmedOrNull(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v || v.length > max) return null;
  return v;
}

/**
 * Validates an untrusted request body into an EnquiryInput. Returns a machine
 * error code on failure, which the client maps to a localized message — the
 * same contract parseEventInput() uses.
 *
 * `allowedSlugs` is the set of catalogue slugs the page actually offered, so a
 * hand-crafted POST cannot record an enquiry against a ceremony that does not
 * exist. An unknown slug is treated as an error rather than silently demoted
 * to free text: the demand-test counts are only meaningful if the ceremony
 * column means what it says.
 */
export function parseEnquiryInput(
  body: unknown,
  allowedSlugs: ReadonlySet<string>,
): { input: EnquiryInput } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'invalid_body' };
  const b = body as Record<string, unknown>;

  const sourcePujaSlug = trimmedOrNull(b.sourcePujaSlug, ENQUIRY_LIMITS.slug);
  if (!sourcePujaSlug || !SLUG_RE.test(sourcePujaSlug)) return { error: 'invalid_source' };

  let ceremonySlug: string | null = null;
  let ceremonyOther: string | null = null;
  if (b.ceremonySlug === CEREMONY_OTHER) {
    ceremonyOther = trimmedOrNull(b.ceremonyOther, ENQUIRY_LIMITS.ceremonyOther);
    if (!ceremonyOther) return { error: 'invalid_ceremony' };
  } else {
    ceremonySlug = trimmedOrNull(b.ceremonySlug, ENQUIRY_LIMITS.slug);
    if (!ceremonySlug || !allowedSlugs.has(ceremonySlug)) return { error: 'invalid_ceremony' };
  }

  const city = trimmedOrNull(b.city, ENQUIRY_LIMITS.city);
  if (!city) return { error: 'invalid_city' };

  const area = trimmedOrNull(b.area, ENQUIRY_LIMITS.area);

  const lang = b.lang;
  if (!ENQUIRY_LANGUAGES.includes(lang as EnquiryLanguage)) return { error: 'invalid_lang' };

  let preferredDate: string | null = null;
  if (typeof b.preferredDate === 'string' && b.preferredDate.trim()) {
    const d = b.preferredDate.trim();
    // Postgres would accept plenty of other spellings; pin it to the one the
    // <input type="date"> emits so a stray value can't become a real date.
    if (!DATE_RE.test(d) || Number.isNaN(Date.parse(`${d}T00:00:00Z`))) {
      return { error: 'invalid_date' };
    }
    preferredDate = d;
  }

  let preferredTime: string | null = null;
  if (typeof b.preferredTime === 'string' && b.preferredTime.trim()) {
    // <input type="time"> emits HH:MM (and HH:MM:SS when stepped); pin it to
    // the minute form so nothing else can reach the time column.
    const t = b.preferredTime.trim().slice(0, 5);
    if (!TIME_RE.test(t)) return { error: 'invalid_time' };
    preferredTime = t;
  }

  const contact = trimmedOrNull(b.contact, ENQUIRY_LIMITS.contact);
  if (!contact || !looksLikeContact(contact)) return { error: 'invalid_contact' };

  const note = trimmedOrNull(b.note, ENQUIRY_LIMITS.note);

  return {
    input: {
      ceremonySlug,
      ceremonyOther,
      sourcePujaSlug,
      city,
      area,
      lang: lang as EnquiryLanguage,
      preferredDate,
      preferredTime,
      durationBand: optionalChoice(b.durationBand, ENQUIRY_DURATION_BANDS),
      timingWindow: optionalChoice(b.timingWindow, ENQUIRY_TIMING_WINDOWS),
      dakshinaBand: optionalChoice(b.dakshinaBand, ENQUIRY_DAKSHINA_BANDS),
      contact,
      note,
    },
  };
}

/**
 * Salted hash of a submitter's IP, for the rate limit. Never store or log the
 * address itself — see the PRIVACY note in migration 0004.
 *
 * AUTH_SECRET is the salt because it is already required in every environment
 * where writes can happen and is never shipped to a client. Without it (a
 * deployment with no auth configured) rate limiting degrades off rather than
 * falling back to an unsalted hash, which would be a reversible IP store.
 */
export function hashIp(ip: string | null): string | null {
  const salt = process.env.AUTH_SECRET;
  if (!ip || !salt) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * The submitter's IP as the platform reports it. On Vercel the left-most entry
 * of x-forwarded-for is the client; the header is attacker-controlled in
 * general, which is precisely why exceeding the limit only blocks a submission
 * and never has any other consequence.
 */
export function clientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || null;
}

/** How many enquiries this submitter has sent in the last hour. */
export async function countRecentEnquiries(ipHash: string): Promise<number> {
  const rows = await query<{ n: number }>(
    `SELECT count(*)::int AS n
       FROM pandit_enquiries
      WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`,
    [ipHash],
  );
  return rows[0]?.n ?? 0;
}

/**
 * Records one enquiry. Returns the new row's id — the only field a caller is
 * ever given back, so a response can confirm the write without echoing any of
 * the personal data that went into it.
 */
export async function createEnquiry(
  input: EnquiryInput,
  userId: string | null,
  ipHash: string | null,
): Promise<string> {
  if (!isDbConfigured) throw new Error('DATABASE_URL is not set');
  const rows = await query<{ id: string }>(
    `INSERT INTO pandit_enquiries
       (ceremony_slug, ceremony_other, source_puja_slug, city, area, lang,
        preferred_date, preferred_time, duration_band, timing_window,
        dakshina_band, contact, note, user_id, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8::time, $9, $10,
             $11, $12, $13, $14::uuid, $15)
     RETURNING id`,
    [
      input.ceremonySlug, input.ceremonyOther, input.sourcePujaSlug, input.city,
      input.area, input.lang, input.preferredDate, input.preferredTime,
      input.durationBand, input.timingWindow, input.dakshinaBand,
      input.contact, input.note, userId, ipHash,
    ],
  );
  return rows[0].id;
}
