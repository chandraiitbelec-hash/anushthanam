/**
 * Seeds the canonical puja list into the pujas tab.
 *
 * Two operations:
 *   1. RECONCILE — sets `frequent` on the 4 existing rows (satyanarayana,
 *      vinayaka, lakshmi, saraswati). Only updates the frequent cell; never
 *      touches other columns.
 *   2. APPEND — adds the 10 new puja rows from research/pujas-seed.json.
 *      Refuses to write any slug that already exists in the tab.
 *
 * Usage:
 *   node scripts/upload-pujas-seed.mjs          (dry run — default)
 *   node scripts/upload-pujas-seed.mjs --write  (apply)
 *
 * Columns (A–U):
 *   slug | title_en | title_te | title_ta | title_hi | deity_slug |
 *   occasion_type | duration_minutes | brief_description_en |
 *   brief_description_te | brief_description_ta | brief_description_hi |
 *   materials_group_slug | prasad_en | prasad_te | prasad_ta | prasad_hi |
 *   regional_variation_notes_en | status | translation_status | frequent
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const { pujas: NEW_PUJAS } = JSON.parse(
  readFileSync(resolve(__dirname, '../research/pujas-seed.json'), 'utf8')
);

// frequent values for the 4 pre-existing rows
const RECONCILE = {
  'satyanarayana-puja': 'FALSE',
  'vinayaka-puja':      'TRUE',
  'lakshmi-puja':       'TRUE',
  'saraswati-puja':     'TRUE',
};

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

// ─── Read current state ───────────────────────────────────────────────────────

const allRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: 'pujas!A:U',
});
const allRows = allRes.data.values || [];
const [header, ...dataRows] = allRows;

const SLUG_COL = 0;   // A
const FREQ_COL = 20;  // U (0-based)

const existingSlugs = new Set(dataRows.map(r => r[SLUG_COL]));

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ upload-pujas-seed.mjs ════════════════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`\nExisting pujas in Sheet (${dataRows.length}):`);
dataRows.forEach((r, i) => {
  console.log(`  row ${i + 2}: ${r[SLUG_COL]} | frequent=${r[FREQ_COL] ?? '(unset)'}`);
});

// ── Reconcile plan ─────────────────────────────────────────────────────────
console.log('\n── RECONCILE (update frequent on existing rows) ─────────────────');
const reconcileOps = [];
for (const [slug, freq] of Object.entries(RECONCILE)) {
  const rowIdx = dataRows.findIndex(r => r[SLUG_COL] === slug);
  if (rowIdx === -1) {
    console.log(`  SKIP  ${slug} — not found in Sheet (will be appended as new)`);
    continue;
  }
  const currentFreq = dataRows[rowIdx][FREQ_COL] ?? '';
  const sheetRow = rowIdx + 2; // 1-based + 1 for header
  if (currentFreq === freq) {
    console.log(`  OK    ${slug} — frequent already = ${freq}`);
  } else {
    console.log(`  UPDATE row ${sheetRow}: ${slug} frequent: "${currentFreq}" → "${freq}"`);
    reconcileOps.push({ sheetRow, slug, freq });
  }
}

// ── Append plan ────────────────────────────────────────────────────────────
console.log('\n── APPEND (new puja rows) ───────────────────────────────────────');
const toAppend = [];
for (const p of NEW_PUJAS) {
  if (existingSlugs.has(p.slug)) {
    console.log(`  SKIP  ${p.slug} — already exists`);
    continue;
  }
  console.log(`  ADD   ${p.slug} (frequent=${p.frequent})`);
  toAppend.push([
    p.slug,
    p.title_en,
    p.title_te,
    p.title_ta,
    p.title_hi,
    p.deity_slug,
    p.occasion_type,
    String(p.duration_minutes),
    p.brief_description_en,
    p.brief_description_te,
    p.brief_description_ta,
    p.brief_description_hi,
    p.materials_group_slug,
    p.prasad_en,
    p.prasad_te,
    p.prasad_ta,
    p.prasad_hi,
    p.regional_variation_notes_en,
    p.status,
    p.translation_status,
    p.frequent,
  ]);
}

console.log(`\nSummary: ${reconcileOps.length} reconcile update(s), ${toAppend.length} new append(s)`);

if (!WRITE) {
  console.log('\n✋ Dry run complete — pass --write to apply.');
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

// Reconcile: update individual frequent cells
for (const { sheetRow, slug, freq } of reconcileOps) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `pujas!U${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[freq]] },
  });
  console.log(`  ✓ Updated ${slug} frequent = ${freq} (row ${sheetRow})`);
}

// Append new rows
if (toAppend.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'pujas!A:U',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: toAppend },
  });
  console.log(`  ✓ Appended ${toAppend.length} new puja rows`);
}

console.log('\n✅ Done.');
