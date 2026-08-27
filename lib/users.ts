import { query, isDbConfigured } from './db';

/** A row of the `users` table (see db/migrations/0001_create_users.sql). */
export type UserRecord = {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
};

type GoogleProfile = {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

/**
 * Creates or refreshes the local row for a Google account and returns it.
 *
 * Called once per sign-in (not per request), so page rendering never depends on
 * Postgres. Conflicts resolve on google_id — the OAuth `sub`, which is stable
 * even if the account's email or display name changes — so a returning user
 * keeps the same `id` and any future rows hanging off it.
 *
 * Returns null when there's no DATABASE_URL: local dev without a database can
 * still exercise the whole sign-in flow, just without persistence.
 */
export async function upsertUserFromGoogle(profile: GoogleProfile): Promise<UserRecord | null> {
  if (!isDbConfigured) return null;

  const rows = await query<UserRecord>(
    `INSERT INTO users (google_id, email, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id) DO UPDATE
       SET email      = EXCLUDED.email,
           name       = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = now()
     RETURNING *`,
    [profile.googleId, profile.email, profile.name ?? null, profile.avatarUrl ?? null],
  );

  return rows[0] ?? null;
}
