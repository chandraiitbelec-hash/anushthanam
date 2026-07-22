/**
 * One-shot script: sets up the two-section Pujas experience in Google Sheets.
 *
 * What it does:
 *   1. Appends the `frequent` column header to the pujas tab (if missing).
 *   2. Backfills `frequent` for the 4 starter pujas.
 *   3. Creates the `occasions` tab with headers (if missing).
 *   4. Creates the `puja_occasions` join tab with headers (if missing).
 *
 * Usage:
 *   node scripts/setup-puja-occasions.mjs          (dry run — default)
 *   node scripts/setup-puja-occasions.mjs --write  (apply)
 *
 * Safe to re-run — checks existing state before writing.
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const OCCASIONS_HEADERS = [
  'slug','title_en','title_te','title_ta','title_hi',
  'description_en','description_te','description_ta','description_hi',
  'icon','display_order','status',
];
const PUJA_OCCASIONS_HEADERS = ['occasion_slug','puja_slug','display_order'];

// frequent backfill for the 4 starter pujas:
//   satyanarayana → FALSE (occasion-only: grihapravesham, monthly vow, etc.)
//   saraswati     → TRUE  (regular home puja for learning/arts)
//   vinayaka      → TRUE  (weekly + any auspicious start)
//   lakshmi       → TRUE  (weekly Friday puja)
const FREQUENT_MAP = {
  'satyanarayana-puja': 'FALSE',
  'saraswati-puja':     'TRUE',
  'vinayaka-puja':      'TRUE',
  'lakshmi-puja':       'TRUE',
};

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

console.log('\n══ setup-puja-occasions.mjs ══════════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

// ── helpers ───────────────────────────────────────────────────────────────────

async function getSpreadsheetMeta() {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  return res.data;
}

async function getSheetValues(tab, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!${range}`,
  });
  return res.data.values ?? [];
}

async function writeValues(tab, range, values) {
  if (!WRITE) {
    console.log(`  [DRY] ${tab}!${range} ←`, JSON.stringify(values[0]).slice(0, 80));
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tab}!${range}`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  console.log(`  ✓ wrote ${tab}!${range}`);
}

function colLetter(zeroIdx) {
  return zeroIdx < 26
    ? String.fromCharCode(65 + zeroIdx)
    : 'A' + String.fromCharCode(65 + (zeroIdx - 26));
}

async function ensureTab(title, existingTabs) {
  if (existingTabs.has(title)) {
    console.log(`  '${title}' tab exists — updating headers`);
    return;
  }
  if (!WRITE) {
    console.log(`  [DRY] would create tab: ${title}`);
    return;
  }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
  console.log(`  ✓ created tab: ${title}`);
}

// ── step 1: frequent column on pujas tab ──────────────────────────────────────

console.log('\n── Step 1: pujas — add `frequent` column header ──');

const pujaHeaderRow = await getSheetValues('pujas', '1:1');
const pujaHeaders = pujaHeaderRow[0] ?? [];
const freqColIdx = pujaHeaders.indexOf('frequent');

if (freqColIdx !== -1) {
  console.log(`  'frequent' column already exists at col ${freqColIdx + 1}`);
} else {
  const newCol = colLetter(pujaHeaders.length);
  console.log(`  appending 'frequent' at col ${newCol} (index ${pujaHeaders.length + 1})`);
  await writeValues('pujas', `${newCol}1`, [['frequent']]);
}

// ── step 2: backfill frequent for starter pujas ───────────────────────────────

console.log('\n── Step 2: backfill frequent for starter pujas ──');

const pujaAllRows = await getSheetValues('pujas', 'A:ZZ');
const freshHeaders = pujaAllRows[0] ?? [];
const slugCol = freshHeaders.indexOf('slug');
const freqCol = freshHeaders.indexOf('frequent');

if (slugCol === -1 || freqCol === -1) {
  console.log('  ⚠ slug or frequent column not found — re-run after step 1 writes.');
} else {
  for (let i = 1; i < pujaAllRows.length; i++) {
    const row = pujaAllRows[i];
    const slug = row[slugCol] ?? '';
    const current = row[freqCol] ?? '';
    const expected = FREQUENT_MAP[slug];
    if (!expected) continue;
    if (current.toUpperCase() === expected) {
      console.log(`  ${slug}: already ${current} — skip`);
    } else {
      const sheetRow = i + 1;
      console.log(`  ${slug}: '${current || '(empty)'}' → ${expected} (row ${sheetRow})`);
      await writeValues('pujas', `${colLetter(freqCol)}${sheetRow}`, [[expected]]);
    }
  }
}

// ── step 3 & 4: occasions + puja_occasions tabs ───────────────────────────────

const meta = await getSpreadsheetMeta();
const existingTabs = new Set(meta.sheets?.map(s => s.properties?.title) ?? []);

console.log('\n── Step 3: occasions tab ──');
await ensureTab('occasions', existingTabs);
await writeValues('occasions', 'A1', [OCCASIONS_HEADERS]);

console.log('\n── Step 4: puja_occasions tab ──');
await ensureTab('puja_occasions', existingTabs);
await writeValues('puja_occasions', 'A1', [PUJA_OCCASIONS_HEADERS]);

console.log('\n══ Done ══════════════════════════════════════════════════════');
if (!WRITE) console.log('Run with --write to apply changes.');
