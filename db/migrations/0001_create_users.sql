-- Minimal accounts table. Google is the only sign-in method, so a row here is
-- one Google account: `google_id` is the OAuth `sub` claim (stable for the life
-- of the account, unlike email) and is the natural key we upsert on.
--
-- `id` is a surrogate UUID rather than the Google id so later tables
-- (community, membership, teacher_role) can foreign-key to a value that has
-- nothing to do with the identity provider — swapping or adding a provider
-- later must not force a rewrite of every child row.

CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id   text        NOT NULL UNIQUE,
  email       text        NOT NULL UNIQUE,
  name        text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Sign-in looks up by google_id (covered by the UNIQUE constraint above).
-- This index is for the other direction: finding an account by email, which is
-- what any "who is this person" support lookup starts from.
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Supabase exposes every table in `public` over PostgREST to the `anon` role,
-- and the anon key is public by design. Tables created via raw SQL do not get
-- RLS enabled automatically, so without this a request to /rest/v1/users would
-- return every row — including email addresses.
--
-- No policies are defined, so RLS denies everything by default. The app is
-- unaffected: it connects as the table owner, which bypasses RLS. On a plain
-- Postgres (Neon, local) this is a harmless no-op for the same reason.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
