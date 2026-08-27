import { handlers } from '@/auth';

// Auth.js owns every /api/auth/* route (sign-in redirect, Google callback,
// session, sign-out, CSRF). Node runtime — the sign-in path writes to Postgres
// via the jwt callback, and `pg` is not Edge-compatible.
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
