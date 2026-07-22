/**
 * Seeds the puja_occasions join tab from research/puja-occasions-seed.json.
 * Deduplicates on (occasion_slug, puja_slug) pair — skips any pair that exists.
 *
 * Usage:
 *   node scripts/upload-puja-occasions-seed.mjs          (dry run)
 *   node scripts/upload-puja-occasions-seed.mjs --write  (apply)
 *
 * Columns (A–C): occasion_slug | puja_slug | display_order
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const { puja_occasions: MAPPINGS } = JSON.parse(
  readFileSync(resolve(__dirname, '../research/puja-occasions-seed.json'), 'utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

// ─── Read current state ───────────────────────────────────────────────────────

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: 'puja_occasions!A:C',
});
const rows = res.data.values || [];
const [, ...dataRows] = rows;
const existingPairs = new Set(dataRows.map(r => `${r[0]}::${r[1]}`));

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ upload-puja-occasions-seed.mjs ═══════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`\nExisting puja_occasions rows: ${dataRows.length}`);

// Group by occasion for readable summary
console.log('\n── APPEND plan ──────────────────────────────────────────────────');
const toAppend = [];
let lastOccasion = '';
for (const m of MAPPINGS) {
  const pair = `${m.occasion_slug}::${m.puja_slug}`;
  if (m.occasion_slug !== lastOccasion) {
    console.log(`\n  [${m.occasion_slug}]`);
    lastOccasion = m.occasion_slug;
  }
  if (existingPairs.has(pair)) {
    console.log(`    SKIP  ${m.puja_slug} — pair already exists`);
    continue;
  }
  console.log(`    ADD   ${m.puja_slug} (order=${m.display_order})`);
  toAppend.push([m.occasion_slug, m.puja_slug, String(m.display_order)]);
}

console.log(`\nSummary: ${toAppend.length} mapping(s) to append`);

if (!WRITE) {
  console.log('\n✋ Dry run complete — pass --write to apply.');
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

if (toAppend.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'puja_occasions!A:C',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: toAppend },
  });
  console.log(`  ✓ Appended ${toAppend.length} puja_occasion rows`);
}

console.log('\n✅ Done.');
