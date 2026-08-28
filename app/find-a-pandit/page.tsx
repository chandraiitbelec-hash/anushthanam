import { unstable_rethrow } from 'next/navigation';
import { emptyOnError } from '@/lib/sheets';
import { TABS } from '@/lib/tabs';
import { UI } from '@/lib/ui-strings';
import { getStandalonePlacement, getOccasionSlugs } from '@/lib/pandit-enquiry-placement';
import { formatEnquirySource } from '@/lib/pandit-enquiry-fields';
import { pageMeta, getRequestLang, SITE_NAME } from '@/lib/seo';
import Breadcrumb from '@/components/Breadcrumb';
import ScriptH1 from '@/components/ScriptH1';
import PanditEnquiryPage from '@/components/pandit/PanditEnquiryPage';

export const revalidate = 3600;

/**
 * /find-a-pandit — the §9.1 demand test with a front door of its own.
 *
 * The first pass put the enquiry form only at the foot of five puja detail
 * pages, which turned out to be too hidden to measure anything: a demand test
 * nobody can find measures discoverability, not demand. This page hosts the
 * same form full-width, with an honest intro, so it can be linked, shared and
 * navigated to.
 *
 * **The route stays English** (`/find-a-pandit`) like every other route on the
 * site; the heading, breadcrumb and copy come from lib/ui-strings.ts in the
 * visitor's language.
 *
 * `?occasion=<slug>` is what the /pujas occasion accordion carries: it
 * preselects that ceremony **and** records the enquiry as having come from the
 * accordion rather than from a bare visit, which is the whole reason the two
 * are distinguishable at all. An unrecognised slug degrades to a plain visit
 * rather than an error — a stale shared link should still show a usable form.
 *
 * Tone is bound by §7.1 exactly as the puja card is: no urgency, no scarcity,
 * no claim that pandits are waiting, and the intro says plainly that there is
 * no list yet.
 */

const LABELS = {
  en: UI.en.findAPandit,
  te: UI.te.findAPandit,
  ta: UI.ta.findAPandit,
  hi: UI.hi.findAPandit,
};

export async function generateMetadata() {
  try {
    const lang = await getRequestLang();
    return pageMeta(UI[lang].findAPandit, UI.en.panditPageIntro, '/find-a-pandit');
  } catch (err) {
    unstable_rethrow(err);
    return { title: SITE_NAME };
  }
}

export default async function FindAPanditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.occasion;
  const requested = typeof raw === 'string' ? raw : null;

  // The occasion has to be a real published one before it may name a source —
  // otherwise a crafted link could invent an entry point in the counts. (The
  // route re-checks this on submit; this is so the page never renders a source
  // the route would then reject.)
  const occasionSlugs = requested
    ? await getOccasionSlugs().catch(emptyOnError(TABS.occasions, 'find-a-pandit', new Set<string>()))
    : new Set<string>();
  const occasion = requested && occasionSlugs.has(requested) ? requested : null;

  // A Sheets outage costs the page its form, not its render — same discipline
  // as every other page here.
  const placement = await getStandalonePlacement(occasion).catch(
    emptyOnError(TABS.occasions, 'find-a-pandit', null),
  );

  const source = formatEnquirySource(
    occasion ? { kind: 'pujas-occasion', slug: occasion } : { kind: 'standalone' },
  );

  return (
    <div className="content-width" style={{ padding: '32px 24px' }}>
      <Breadcrumb crumbs={[{ label: LABELS.en, labels: { te: LABELS.te, ta: LABELS.ta, hi: LABELS.hi } }]} />

      <ScriptH1
        labels={LABELS}
        style={{
          fontSize: 'var(--text-h1-page)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 20px',
        }}
      />

      <PanditEnquiryPage placement={placement} source={source} />
    </div>
  );
}
