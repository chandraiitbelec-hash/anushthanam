/**
 * Applies pending SQL migrations from db/migrations to the DATABASE_URL Postgres.
 *
 * Dry-run by default (lists what would run); pass --write to apply — same
 * convention as the Sheets scripts. Applied filenames are recorded in
 * schema_migrations, so re-running is a no-op.
 *
 *   node scripts/migrate.mjs            # list pending
 *   node scripts/migrate.mjs --write    # apply pending
 *
 * Env is loaded from .env.local relative to this file (not cwd), matching
 * loadEnv() in lib-sheets.mjs. dotenv is used directly rather than importing
 * that module, which would pull in googleapis for a script that never calls it.
 */
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MIGRATIONS_DIR = resolve(__dirname, '../db/migrations');
const write = process.argv.includes('--write');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set (looked in .env.local). Nothing to do.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: /sslmode=disable/.test(connectionString) || /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)
    ? undefined
    : { rejectUnauthorized: true },
});

await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    );
  `);

  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map(r => r.filename));

  const all = readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  const pending = all.filter(f => !applied.has(f));

  if (pending.length === 0) {
    console.log(`Up to date — ${all.length} migration(s) already applied.`);
    process.exit(0);
  }

  console.log(`Pending migration(s): ${pending.join(', ')}`);

  if (!write) {
    console.log('\nDry run — nothing applied. Re-run with --write to apply.');
    process.exit(0);
  }

  for (const filename of pending) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, filename), 'utf8');
    // Each migration is its own transaction: a failure half-way leaves the
    // earlier migrations applied and this one entirely rolled back.
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`  applied ${filename}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`  FAILED ${filename} — rolled back`);
      throw err;
    }
  }

  console.log(`\nApplied ${pending.length} migration(s).`);
} finally {
  await client.end();
}
