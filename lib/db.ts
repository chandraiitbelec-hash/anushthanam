import { Pool, type QueryResultRow } from 'pg';

/**
 * Postgres access layer. This is the first feature on the site that needs real
 * persistent storage — everything else is Sheets-backed and cached. Deliberately
 * thin: a pooled `pg` client and a `query()` helper, no ORM. The schema is one
 * table (`users`); reach for a query builder only when that stops being true.
 *
 * Nothing on the public site renders from Postgres — the DB is touched only on
 * sign-in — so a DB outage degrades sign-in, never page rendering.
 */

const connectionString = process.env.DATABASE_URL;

/** False in local dev without a DATABASE_URL, so the app still boots. */
export const isDbConfigured = Boolean(connectionString);

let pool: Pool | null = null;

function needsSsl(url: string): boolean {
  if (/sslmode=disable/.test(url)) return false;
  // Local Postgres generally has no TLS; hosted (Neon/Vercel Postgres) always does.
  return !/@(localhost|127\.0\.0\.1)[:/]/.test(url);
}

/**
 * Lazily created so importing this module never opens a socket — matters
 * because Next traces imports into routes that may never touch the DB.
 * The pool is module-scoped so warm serverless invocations reuse connections;
 * `max` is small because Vercel runs many concurrent instances against one DB.
 */
function getPool(): Pool {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — cannot open a Postgres connection.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: needsSsl(connectionString) ? { rejectUnauthorized: true } : undefined,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
    // Without this, an idle client erroring out (server restart, network blip)
    // becomes an unhandled 'error' event and takes the whole process down.
    pool.on('error', err => {
      console.error('AUTH ERROR: idle Postgres client error', err);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}
