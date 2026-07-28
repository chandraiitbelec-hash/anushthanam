/**
 * Seeds the occasions tab from research/occasions-seed.json.
 * Append-only — refuses any slug that already exists.
 *
 * Usage:
 *   node scripts/upload-occasions-seed.mjs          (dry run)
 *   node scripts/upload-occasions-seed.mjs --write  (apply)
 *
 * Columns (A–K):
 *   slug | title_en | title_te | title_ta | title_hi |
 *   description_en | description_te | description_ta | description_hi |
 *   icon | display_order | status
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const { occasions: OCCASIONS } = JSON.parse(
  readFileSync(resolve(__dirname, '../research/occasions-seed.json'), 'utf8')
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
  range: 'occasions!A:L',
});
const rows = res.data.values || [];
const [, ...dataRows] = rows;
const existingSlugs = new Set(dataRows.map(r => r[0]));

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ upload-occasions-seed.mjs ════════════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`\nExisting occasions in Sheet: ${dataRows.length}`);
dataRows.forEach(r => console.log(`  ${r[0]}`));

console.log('\n── APPEND plan ──────────────────────────────────────────────────');
const toAppend = [];
for (const o of OCCASIONS) {
  if (existingSlugs.has(o.slug)) {
    console.log(`  SKIP  ${o.slug} — already exists`);
    continue;
  }
  console.log(`  ADD   ${o.slug} (${o.icon} display_order=${o.display_order})`);
  toAppend.push([
    o.slug,
    o.title_en,
    o.title_te,
    o.title_ta,
    o.title_hi,
    o.description_en,
    o.description_te,
    o.description_ta,
    o.description_hi,
    o.icon,
    String(o.display_order),
    o.status,
  ]);
}

console.log(`\nSummary: ${toAppend.length} occasion(s) to append`);

if (!WRITE) {
  console.log('\n✋ Dry run complete — pass --write to apply.');
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

if (toAppend.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'occasions!A:L',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: toAppend },
  });
  console.log(`  ✓ Appended ${toAppend.length} occasions`);
}

console.log('\n✅ Done.');
