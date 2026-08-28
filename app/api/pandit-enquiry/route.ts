import { auth } from '@/auth';
import { isDbConfigured } from '@/lib/db';
import {
  clientIp,
  countRecentEnquiries,
  createEnquiry,
  hashIp,
  parseEnquiryInput,
  ENQUIRY_RATE_LIMIT,
} from '@/lib/pandit-enquiry';
import { resolveEnquiryOrigin } from '@/lib/pandit-enquiry-placement';
import { HONEYPOT_FIELD } from '@/lib/pandit-enquiry-fields';

// Node runtime — `pg` is not Edge-compatible (same as the auth and schedule routes).
export const runtime = 'nodejs';

/**
 * POST /api/pandit-enquiry — record one enquiry for the demand test (PRD §9.1).
 *
 * Deliberately NOT auth-guarded. Every other write on this site requires a
 * signed-in session; this one must not, because a demand test that gates
 * itself behind Google sign-in measures willingness to sign in rather than
 * demand for a pandit, and the number it produces is the whole deliverable.
 * A session, when there is one, is used only to attribute the row.
 *
 * That openness is why the two abuse controls below exist. They are meant to
 * cost a script something, not to be a security boundary — there is nothing
 * here worth attacking beyond wasting the owner's reading time.
 *
 * Nothing in this handler logs the request body. See the PRIVACY note in
 * db/migrations/0004_create_pandit_enquiries.sql.
 */
export async function POST(req: Request) {
  if (!isDbConfigured) {
    return Response.json({ error: 'db_unavailable' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Honeypot: a field no human ever sees or tabs into, so any value in it came
  // from something filling every input on the page. Rejected explicitly rather
  // than silently accepted — a real submitter can never trip this, and an
  // honest error is easier to verify than a fake success.
  const honeypot = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD];
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return Response.json({ error: 'rejected' }, { status: 400 });
  }

  // The entry point is re-derived against the live catalogue, never taken as
  // stated: a per-source count is the deliverable, so a crafted POST must not
  // be able to invent a source or credit the wrong page.
  const origin = await resolveEnquiryOrigin((body as Record<string, unknown> | null)?.source);
  if (!origin) {
    return Response.json({ error: 'invalid_source' }, { status: 400 });
  }

  const parsed = parseEnquiryInput(body, origin);
  if ('error' in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));

  // Rate limit. Skipped entirely when there is no hash to count against (no
  // AUTH_SECRET, or a platform that reported no client address): an
  // unattributable submitter is better let through than counted against
  // everyone else's shared bucket.
  if (ipHash) {
    try {
      if ((await countRecentEnquiries(ipHash)) >= ENQUIRY_RATE_LIMIT) {
        return Response.json({ error: 'rate_limited' }, { status: 429 });
      }
    } catch (err) {
      // Counting failed, so we cannot know. Let the submission through —
      // losing a genuine enquiry is the more expensive error here.
      console.error('ENQUIRY ERROR: rate-limit count failed', err);
    }
  }

  // A signed-in visitor's row is attributed to them; a signed-out one is not.
  // auth() failing must not cost us the enquiry, so it degrades to anonymous.
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.user?.accountId ?? null;
  } catch (err) {
    console.error('ENQUIRY ERROR: session lookup failed', err);
  }

  try {
    await createEnquiry(parsed.input, userId, ipHash);
    // The id is deliberately not returned: the client has no use for it and an
    // enquiry is not addressable by anything on the site.
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('ENQUIRY ERROR: insert failed', err);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
