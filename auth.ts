import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { upsertUserFromGoogle } from '@/lib/users';

/**
 * Auth.js (next-auth v5) — Google is the only sign-in method.
 *
 * Sessions are JWT-backed, not database-backed: the signed cookie carries the
 * identity, so a page render never queries Postgres to know who's asking. The
 * `users` table exists to give each account a stable local id that future
 * community/membership rows can point at, and is written only on sign-in.
 */

/**
 * Auth is off unless every credential is present. Local dev and any deploy
 * missing them renders exactly as the site did before accounts existed — no
 * sign-in control, no auth routes doing anything — rather than erroring.
 */
export const isAuthConfigured = Boolean(
  process.env.AUTH_SECRET &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Vercel serves the app behind a proxy; without this Auth.js refuses to infer
  // the callback origin from the forwarded host.
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: isAuthConfigured
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  callbacks: {
    /**
     * Runs on every request that reads the session, but `account` is only set
     * on the sign-in request itself — which is where the Postgres write is
     * confined. A failed write is logged and does not block sign-in: login
     * currently gates nothing, so refusing entry over a transient DB blip
     * would be the worse failure. The session still carries `googleId`, so a
     * later feature can re-resolve (or create) the row when it actually needs
     * one.
     */
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const googleId = profile.sub ?? token.sub;
        if (googleId) {
          token.googleId = googleId;
          try {
            const user = await upsertUserFromGoogle({
              googleId,
              email: profile.email,
              name: profile.name,
              avatarUrl: typeof profile.picture === 'string' ? profile.picture : null,
            });
            if (user) token.accountId = user.id;
          } catch (err) {
            console.error('AUTH ERROR: could not persist user on sign-in', err);
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.accountId = token.accountId;
        session.user.googleId = token.googleId;
      }
      return session;
    },
  },
});
