-- Pandit enquiries — the demand test described in
-- research/pandit-marketplace-prd-2026-08.md §9.1, and nothing more.
--
-- The question this table exists to answer is "do enough people actually want
-- to book a pandit through this site to justify recruiting one?". It is a
-- measuring instrument, not the first table of a marketplace: there are no
-- pandits, no profiles, no matching, and no reply path in the product. If the
-- answer comes back "no", this table and its route are deleted and nothing
-- else has been spent.
--
-- PRIVACY — read before adding any consumer of this table.
--
--   `contact` is personal data: a phone number or an email address a devotee
--   typed in, for a religious ceremony in their own home. It lives HERE and
--   nowhere else. It is never rendered on any public page (no page reads this
--   table at all), never written to a log line, never included in an error
--   message or an analytics event, and never leaves Postgres except through
--   scripts/list-pandit-enquiries.mjs, which the owner runs locally. The same
--   applies to `note` and `city`, which are free text a person may put
--   anything into. RLS below is what stops Supabase's public `anon` key from
--   reading the lot over PostgREST.
--
--   `ip_hash` is deliberately a salted hash and not an IP address. It exists
--   solely so the route can count recent submissions per submitter for the
--   rate limit; a hash cannot be turned back into an address, so the abuse
--   control does not cost us a stored identifier. The salt is AUTH_SECRET, so
--   rotating that secret retires every existing hash — which is fine, since
--   the values are only ever compared within a one-hour window.

CREATE TABLE IF NOT EXISTS pandit_enquiries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What ceremony, as the visitor described it. Either a slug picked from the
  -- catalogue (a puja slug or an occasion slug — the form offers both, since
  -- the page they came from is a puja but the thing they are hiring for is
  -- usually the life event) or, when they chose "another ceremony", their own
  -- words in `ceremony_other`. Exactly one side is populated.
  ceremony_slug     text CHECK (ceremony_slug IS NULL OR char_length(ceremony_slug) <= 100),
  ceremony_other    text CHECK (ceremony_other IS NULL OR char_length(ceremony_other) BETWEEN 1 AND 200),
  CHECK (num_nonnulls(ceremony_slug, ceremony_other) = 1),

  -- Which page the enquiry came from. Not the same as `ceremony_slug` (the
  -- visitor may change the ceremony), and the more useful of the two for the
  -- §9.1 finding: it says which content earns booking intent.
  source_puja_slug  text NOT NULL CHECK (char_length(source_puja_slug) BETWEEN 1 AND 100),

  -- Free text on purpose. The platform is not location-scoped and must not
  -- prime one: no city list, no default, no autocomplete biased to a metro.
  -- Where the enquiries actually come from is part of what is being measured.
  city              text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 120),

  -- The language they would like the ceremony conducted in. 'other' is a
  -- valid answer and is recorded as such rather than being forced into one of
  -- the four the UI happens to support.
  lang              text NOT NULL CHECK (lang IN ('te', 'ta', 'hi', 'en', 'other')),

  -- Date only, no time, and optional: many enquiries will precede a muhurtham.
  preferred_date    date,

  -- Personal data. See the PRIVACY note above.
  contact           text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 200),
  note              text CHECK (note IS NULL OR char_length(note) <= 2000),

  -- The signed-in user, when there was one. Nullable because signing in is NOT
  -- required to enquire: a demand test that gates itself behind Google
  -- sign-in measures willingness to sign in, not demand for a pandit.
  user_id           uuid REFERENCES users(id) ON DELETE SET NULL,

  -- Owner's triage state. Free text with a default rather than an enum: the
  -- workflow this describes does not exist yet and inventing its states now
  -- would be guessing.
  status            text NOT NULL DEFAULT 'new',

  -- Salted hash of the submitter's IP, for the rate limit only. See PRIVACY.
  ip_hash           text,

  created_at        timestamptz NOT NULL DEFAULT now()
);

-- The read path (scripts/list-pandit-enquiries.mjs) is newest-first.
CREATE INDEX IF NOT EXISTS pandit_enquiries_created_at_idx
  ON pandit_enquiries (created_at DESC);

-- Backs the per-submitter rate limit, which counts rows in the last hour.
CREATE INDEX IF NOT EXISTS pandit_enquiries_ip_hash_created_at_idx
  ON pandit_enquiries (ip_hash, created_at DESC);

-- Same reasoning as 0001/0002/0003, and it matters most here: Supabase exposes
-- every `public` table over PostgREST to the `anon` role, whose key is public
-- by design. A table of names, phone numbers and home-ceremony plans must not
-- be reachable that way. RLS with zero policies denies all of it; the app
-- connects as the table owner, which bypasses RLS.
ALTER TABLE pandit_enquiries ENABLE ROW LEVEL SECURITY;
