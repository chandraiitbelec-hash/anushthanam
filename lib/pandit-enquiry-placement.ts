import { getAllOccasionPujas, getOccasions, getPujaOccasions, rowToPuja } from './relations';
import { getPublished } from './sheets';
import { TABS } from './tabs';
import {
  CEREMONY_OTHER,
  parseEnquirySource,
  type EnquirySource,
} from './pandit-enquiry-fields';
import type { EnquiryOrigin } from './pandit-enquiry';
import type { Puja } from './types';

/**
 * Where the pandit enquiry form appears, what its ceremony dropdown offers,
 * and how a submission's entry point is resolved. Server-only (it reads
 * Sheets) but touches no database — the write side is lib/pandit-enquiry.ts.
 *
 * **The placement rule is the experiment's design, not a detail.** §9.1 asks
 * for the block on "the three or four highest-intent occasion pages". The site
 * has no /occasions/[slug] route — occasions exist only as the accordion on
 * /pujas — so the corresponding puja detail pages carry it, and which ones is
 * derived rather than hardcoded:
 *
 *   a puja is a booking-intent page when it is mapped to at least one
 *   life-event occasion AND is not marked `frequent`.
 *
 * Both halves matter. The occasion mapping is what makes a puja a ceremony
 * somebody hires a pandit for; `frequent=FALSE` is what excludes the daily and
 * festival worship that most of those occasions also list (Vinayaka Puja is
 * mapped to seven occasions and is also what a family does at home on a
 * Tuesday). Putting the block on those pages would bury a small demand signal
 * under a large volume of unrelated traffic, which is exactly the measurement
 * error the test cannot afford.
 *
 * Against the live catalogue this currently selects five pages: satyanarayana-
 * puja, navagraha-puja, vastu-puja, gauri-puja and kubera-puja. Aksharabhyasam
 * has no eligible page, because both pujas mapped to it are frequent ones —
 * see the note in the handover; it is a known gap, not an oversight.
 *
 * **Those five pages are no longer the only way in.** They proved too hidden
 * to measure anything, so /find-a-pandit hosts the same form as a linkable
 * page and the /pujas occasion accordion points at it. Every entry point
 * records itself distinctly — see EnquirySource — because which one earns the
 * enquiries is a large part of what §9.1 is for.
 */

/** One choice in the ceremony dropdown. Shaped for localize(_, 'title', lang). */
export type CeremonyOption = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
};

export type EnquiryPlacement = {
  /** Prefilled selection. Always one of `options`. */
  defaultSlug: string;
  /** The ceremonies this entry point offers. '__other__' is added by the form. */
  options: CeremonyOption[];
};

function toOption(e: CeremonyOption): CeremonyOption {
  return {
    slug: e.slug,
    title_en: e.title_en,
    title_te: e.title_te,
    title_ta: e.title_ta,
    title_hi: e.title_hi,
  };
}

/**
 * The placement for a puja page, or null when this page should not carry the
 * block at all. Callers render nothing on null — no empty card, no heading.
 */
export async function getEnquiryPlacement(puja: Puja): Promise<EnquiryPlacement | null> {
  if (puja.frequent) return null;

  const [pujaOccasions, allOccasions] = await Promise.all([
    getPujaOccasions(puja.slug),
    getOccasions(),
  ]);
  if (pujaOccasions.length === 0) return null;

  // The puja itself leads (it is what the visitor is reading), then the
  // occasions it belongs to, then the rest of the catalogue — so the likely
  // answers are at the top without any of the others being hidden.
  const mapped = new Set(pujaOccasions.map(o => o.slug));
  const options: CeremonyOption[] = [
    toOption(puja),
    ...pujaOccasions.map(toOption),
    ...allOccasions.filter(o => !mapped.has(o.slug)).map(toOption),
  ];

  return { defaultSlug: puja.slug, options };
}

/**
 * Every puja that carries the block, by the rule above. One bulk read rather
 * than getPujaOccasions() per puja.
 */
async function getBookingIntentPujas(): Promise<Puja[]> {
  const [occasionPujas, pujaRows] = await Promise.all([
    getAllOccasionPujas(),
    getPublished(TABS.pujas),
  ]);
  const mapped = new Set(Object.values(occasionPujas).flat().map(p => p.slug));
  return pujaRows
    .map(rowToPuja)
    .filter(p => mapped.has(p.slug) && !p.frequent);
}

/**
 * The full ceremony catalogue, for the entry points that are not anchored to
 * one puja page: occasions first, then the booking-intent pujas.
 *
 * Occasions lead because the standalone page is reached by someone who has a
 * life event to arrange, not a puja page to read — "housewarming" is the shape
 * of what they came to say. The pujas follow rather than being dropped, so a
 * visitor who does think in terms of a named puja is not forced into "another
 * ceremony".
 */
async function getCatalogueOptions(): Promise<CeremonyOption[]> {
  const [occasions, pujas] = await Promise.all([
    getOccasions(),
    getBookingIntentPujas(),
  ]);
  const seen = new Set(occasions.map(o => o.slug));
  return [
    ...occasions.map(toOption),
    ...pujas.filter(p => !seen.has(p.slug)).map(toOption),
  ];
}

/**
 * The placement for /find-a-pandit. `preselect` is the ?occasion= slug the
 * /pujas accordion link carries; an unrecognised one is ignored rather than
 * rejected — a stale shared link should still show a usable form.
 *
 * Returns null only when the catalogue is empty (a Sheets outage), which the
 * page renders as a plain message rather than a form with nothing to pick.
 */
export async function getStandalonePlacement(
  preselect?: string | null,
): Promise<EnquiryPlacement | null> {
  const options = await getCatalogueOptions();
  if (options.length === 0) return null;

  const defaultSlug =
    preselect && options.some(o => o.slug === preselect) ? preselect : options[0].slug;

  return { defaultSlug, options };
}

/** Slugs of the published occasions, for validating a ?occasion= or a source. */
export async function getOccasionSlugs(): Promise<Set<string>> {
  return new Set((await getOccasions()).map(o => o.slug));
}

/**
 * Resolve an untrusted `source` from a submission into the origin the route
 * records, or null when it names an entry point that does not exist.
 *
 * The whole point of the demand test is a count per entry point, so the source
 * is re-derived against the live catalogue rather than trusted: a crafted POST
 * must not be able to invent an entry point, attribute an enquiry to a puja
 * page that never carried the block, or offer itself a ceremony the page never
 * listed. Each kind carries its own allowed ceremony set, matching exactly
 * what that entry point renders.
 */
export async function resolveEnquiryOrigin(
  rawSource: unknown,
): Promise<EnquiryOrigin | null> {
  const source: EnquirySource | null = parseEnquirySource(rawSource);
  if (!source) return null;

  if (source.kind === 'puja') {
    const rows = await getPublished(TABS.pujas);
    const puja = rows.map(rowToPuja).find(p => p.slug === source.slug);
    if (!puja) return null;
    const placement = await getEnquiryPlacement(puja);
    // Not a page that carries the block — so this enquiry cannot have come
    // from it, and recording it would corrupt the per-page counts.
    if (!placement) return null;
    return {
      source,
      sourcePujaSlug: puja.slug,
      allowedSlugs: allowed(placement),
    };
  }

  if (source.kind === 'pujas-occasion' && !(await getOccasionSlugs()).has(source.slug)) {
    return null;
  }

  const placement = await getStandalonePlacement(null);
  if (!placement) return null;
  // Neither of these entry points came off a puja page, so there is no content
  // page to credit — see the note on EnquiryInput.sourcePujaSlug.
  return { source, sourcePujaSlug: null, allowedSlugs: allowed(placement) };
}

function allowed(placement: EnquiryPlacement): Set<string> {
  return new Set(placement.options.map(o => o.slug).filter(s => s !== CEREMONY_OTHER));
}
