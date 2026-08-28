#!/usr/bin/env node
/**
 * Read-only listing of the pandit demand-test enquiries (PRD §9.1).
 *
 * This is the entire read path. There is no admin UI and no page on the site
 * reads the table, by design: §9.1 buys a measurement, not a product, and the
 * cheapest honest way to read a measurement is a script the owner runs.
 *
 * PRIVACY — this prints personal data (phone numbers, email addresses, free
 * text about a family's ceremony) to a terminal. Do not paste its output into
 * a ticket, a chat, or a commit. Nothing here writes: there is no --write mode
 * and no UPDATE/DELETE statement anywhere in the file.
 *
 * Usage:
 *   node scripts/list-pandit-enquiries.mjs                # last 90 days, newest first
 *   node scripts/list-pandit-enquiries.mjs --days 30      # a different window
 *   node scripts/list-pandit-enquiries.mjs --all          # everything
 *   node scripts/list-pandit-enquiries.mjs --summary      # counts only, no personal data
 *   node scripts/list-pandit-enquiries.mjs --source standalone
 *                                                        # one entry point only
 *
 * Entry points (the `source` column, see db/migrations/0006_pandit_enquiry_source.sql):
 *   puja:<slug>            the card at the foot of that puja's detail page
 *   pujas-occasion:<slug>  the link in that occasion's panel on /pujas
 *   standalone             /find-a-pandit reached any other way
 *
 * --source matches a prefix, so `--source pujas-occasion:` is every enquiry
 * that came through the accordion. Which entry point earns the enquiries is
 * half of what §9.1 is measuring, so --summary leads with that tally.
 *
 * Env is loaded from .env.local relative to this file (not cwd), matching
 * scripts/migrate.mjs.
 */
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { SUPABASE_CA, isSupabaseHost } from '../lib/supabase-ca.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const argv = process.argv.slice(2);
const all = argv.includes('--all');
const summaryOnly = argv.includes('--summary');
const daysArg = argv.indexOf('--days');
const days = daysArg !== -1 ? Number(argv[daysArg + 1]) : 90;
const sourceArg = argv.indexOf('--source');
const sourceFilter = sourceArg !== -1 ? argv[sourceArg + 1] : null;

if (sourceArg !== -1 && !sourceFilter) {
  console.error('--source needs a value, e.g. --source standalone');
  process.exit(1);
}

if (!Number.isFinite(days) || days <= 0) {
  console.error('--days needs a positive number of days.');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set (looked in .env.local). Nothing to read.');
  process.exit(1);
}

// Mirrors sslFor() in lib/db.ts and scripts/migrate.mjs — verification stays
// on; Supabase's private root CA is supplied explicitly.
function sslFor(url) {
  if (/sslmode=disable/.test(url)) return undefined;
  let hostname;
  try { hostname = new URL(url).hostname; } catch { return { rejectUnauthorized: true }; }
  if (hostname === 'localhost' || hostname === '127.0.0.1') return undefined;
  if (isSupabaseHost(hostname)) return { rejectUnauthorized: true, ca: SUPABASE_CA };
  return { rejectUnauthorized: true };
}

const client = new pg.Client({ connectionString, ssl: sslFor(connectionString) });

// Supabase's pooler drops connections without warning, and pg re-emits that as
// an 'error' event on the client — which, unhandled, takes the process down
// *after* a successful read has already printed. Same lesson as the
// pool.on('error') handler in lib/db.ts, which CLAUDE.md flags as load-bearing.
let finished = false;
client.on('error', err => {
  if (finished) return;
  console.error('Postgres connection error:', err.message);
  process.exitCode = 1;
});

await client.connect();

try {
  const clauses = [];
  const params = [];
  if (!all) {
    params.push(String(days));
    clauses.push(`e.created_at > now() - ($${params.length} || ' days')::interval`);
  }
  if (sourceFilter) {
    params.push(sourceFilter);
    clauses.push(`e.source LIKE $${params.length} || '%'`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const { rows } = await client.query(
    `SELECT e.id, e.created_at, e.ceremony_slug, e.ceremony_other,
            e.source, e.source_puja_slug,
            e.city, e.area, e.lang,
            e.preferred_date::text AS preferred_date,
            to_char(e.preferred_time, 'HH24:MI') AS preferred_time,
            e.duration_band, e.timing_window, e.dakshina_band,
            e.contact, e.note, e.status,
            u.name AS user_name, u.email AS user_email
       FROM pandit_enquiries e
       LEFT JOIN users u ON u.id = e.user_id
       ${where}
      ORDER BY e.created_at DESC`,
    params,
  );

  const window = all ? 'all time' : `last ${days} days`;
  const scope = sourceFilter ? `${window}, source ${sourceFilter}*` : window;
  console.log(`\n${rows.length} enquir${rows.length === 1 ? 'y' : 'ies'} (${scope})\n`);

  if (rows.length === 0) {
    console.log('Nothing yet.\n');
  } else if (summaryOnly) {
    // Counts only — safe to read over someone's shoulder.
    // Which entry point earned it — the discovery question, and the reason
    // the form has more than one home. See the header note.
    tally('By entry point', rows, r => r.source);
    // Which puja page's content earned it — the §9.1 content question. Only
    // the puja card has one; the other entry points sit on no content page.
    tally('By source page', rows, r => r.source_puja_slug ?? '(not a puja page)');
    tally('By ceremony', rows, r => r.ceremony_slug ?? `(other) ${r.ceremony_other}`);
    tally('By city', rows, r => r.city.trim().toLowerCase());
    tally('By language', rows, r => r.lang);
    // The one that matters most for the §9.1 gate: 'exploring' is interest,
    // everything else is a family with a ceremony to arrange.
    tally('By timing', rows, r => r.timing_window ?? '(not said)');
    tally('By duration', rows, r => r.duration_band ?? '(not said)');
    tally('By dakshina band', rows, r => r.dakshina_band ?? '(not said)');
    tally('By status', rows, r => r.status);
    tally('By month', rows, r => r.created_at.toISOString().slice(0, 7));
  } else {
    for (const r of rows) {
      const ceremony = r.ceremony_slug ?? `${r.ceremony_other} (own words)`;
      console.log(`— ${r.created_at.toISOString().replace('T', ' ').slice(0, 16)} UTC  [${r.status}]`);
      console.log(`  ceremony : ${ceremony}`);
      // `source` already names the puja for a puja-card enquiry, so
      // source_puja_slug is not repeated here.
      console.log(`  entry    : ${r.source}`);
      console.log(`  city     : ${r.city}${r.area ? `, ${r.area}` : ''}`);
      console.log(`  language : ${r.lang}`);
      if (r.timing_window) console.log(`  timing   : ${r.timing_window}`);
      if (r.preferred_date || r.preferred_time) {
        console.log(`  when     : ${[r.preferred_date, r.preferred_time].filter(Boolean).join(' ')}`);
      }
      if (r.duration_band) console.log(`  duration : ${r.duration_band}`);
      if (r.dakshina_band) console.log(`  dakshina : ${r.dakshina_band}`);
      console.log(`  contact  : ${r.contact}`);
      if (r.user_email) console.log(`  account  : ${r.user_name ?? '—'} <${r.user_email}>`);
      if (r.note) console.log(`  note     : ${r.note.replace(/\n/g, '\n             ')}`);
      console.log('');
    }
    console.log('Personal data above — do not paste this output anywhere.\n');
  }
} finally {
  finished = true;
  await client.end().catch(() => {});
}

function tally(heading, rows, keyOf) {
  const counts = new Map();
  for (const r of rows) {
    const k = keyOf(r) || '(blank)';
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  console.log(heading);
  for (const [k, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${k}`);
  }
  console.log('');
}
