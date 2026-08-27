import { getOccasions, getPujaOccasions, rowToPuja } from './relations';
import { getPublished } from './sheets';
import { TABS } from './tabs';
import { CEREMONY_OTHER } from './pandit-enquiry-fields';
import type { Puja } from './types';

/**
 * Where the pandit enquiry block appears, and what its ceremony dropdown
 * offers. Server-only (it reads Sheets) but touches no database — the write
 * side is lib/pandit-enquiry.ts.
 *
 * **The placement rule is the experiment's design, not a detail.** §9.1 asks
 * for the block on "the three or four highest-intent occasion pages". The site
 * has no /occasions/[slug] route — occasions exist only as the accordion on
 * /pujas — so the corresponding puja detail pages carry it instead, and which
 * ones is derived rather than hardcoded:
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
  /** Prefilled selection: the puja whose page this is. */
  defaultSlug: string;
  /** The puja first, then every published occasion. '__other__' is added by the form. */
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
 * The catalogue slugs a submission from `sourcePujaSlug` is allowed to name.
 * The route re-derives this rather than trusting the client, so a crafted POST
 * cannot file an enquiry against a ceremony that was never offered. Returns an
 * empty set when the source page is not one that carries the block, which
 * makes every ceremony slug invalid and rejects the submission.
 */
export async function getAllowedCeremonySlugs(sourcePujaSlug: string): Promise<Set<string>> {
  const rows = await getPublished(TABS.pujas);
  const puja = rows.map(rowToPuja).find(p => p.slug === sourcePujaSlug);
  if (!puja) return new Set();

  const placement = await getEnquiryPlacement(puja);
  if (!placement) return new Set();

  return new Set(placement.options.map(o => o.slug).filter(s => s !== CEREMONY_OTHER));
}
