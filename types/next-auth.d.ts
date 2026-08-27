import type { DefaultSession } from 'next-auth';
// Forces TS to pull next-auth/jwt into the program so the augmentation below
// actually attaches — without an explicit import of the module being
// augmented, `declare module 'next-auth/jwt'` is silently ignored.
import type { JWT } from 'next-auth/jwt';

export type { JWT };

/**
 * Identifiers this app adds to the session.
 *
 * `accountId` is our `users.id` UUID — the value future community/membership
 * tables will foreign-key to. It is optional on purpose: sign-in succeeds even
 * when the Postgres write fails or no DATABASE_URL is set (see the jwt callback
 * in auth.ts), so callers must handle its absence rather than assume a row.
 *
 * `googleId` is the OAuth `sub` and is always present on a signed-in session.
 *
 * Note that Auth.js's own `user.id` is the provider account id (i.e. the same
 * value as `googleId`), not our row id — never use it as a foreign key.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      accountId?: string;
      googleId?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accountId?: string;
    googleId?: string;
  }
}
