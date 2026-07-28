/**
 * Fills in meaning_en, meaning_te, meaning_ta, meaning_hi for sahasranamam rows
 * that were uploaded with blank meanings (narasimha, ayyappa -- and any future slug).
 *
 * Reads research/<slug>-sourcing.json (for stanza order) and
 *       research/<slug>-meanings.json (for the four language meanings).
 *
 * Locates existing sheet rows by slug+stanza_number match and patches
 * columns H-K (meaning_en, meaning_te, meaning_ta, meaning_hi) in place.
 * Does NOT touch scripts or any other columns.
 *
 * Usage:
 *   node scripts/update-sahasranamam-meanings.mjs --slug narasimha-sahasranamam           (dry run)
 *   node scripts/update-sahasranamam-meanings.mjs --slug narasimha-sahasranamam --write   (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const slugArg = process.argv.indexOf('--slug');
if (slugArg === -1 || !process.argv[slugArg + 1]) {
  console.error('Usage: node scripts/update-sahasranamam-meanings.mjs --slug <slug> [--write]');
  process.exit(1);
}
const SLUG = process.argv[slugArg + 1];

const sourcingPath = resolve(__dirname, `../research/${SLUG}-sourcing.json`);
const meaningsPath = resolve(__dirname, `../research/${SLUG}-meanings.json`);

if (!existsSync(sourcingPath)) { console.error(`Missing: ${sourcingPath}`); process.exit(1); }
if (!existsSync(meaningsPath)) { console.error(`Missing: ${meaningsPath}`); process.exit(1); }

const sourcing = JSON.parse(readFileSync(sourcingPath, 'utf8'));
const mf = JSON.parse(readFileSync(meaningsPath, 'utf8'));
const mEntries = mf.verses ?? mf.meanings ?? [];
const mmap = new Map(mEntries.map(e => [e.n, e]));

console.log(`Slug: ${SLUG} | sourcing verses: ${sourcing.verses.length} | meanings entries: ${mEntries.length}`);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

// Fetch all rows to find sheet row indices for this slug
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
  range: 'shloka_stanzas!A:B',
});
const allRows = res.data.values || [];

// Build list of { sheetRow (1-indexed), stanza_number }
const targets = [];
allRows.forEach((r, i) => {
  if (r[0] === SLUG) {
    targets.push({ sheetRow: i + 1, stanza_number: parseInt(r[1], 10) });
  }
});
console.log(`Found ${targets.length} existing rows for "${SLUG}" in sheet`);

if (targets.length === 0) {
  console.error('No rows found — run the upload script first.');
  process.exit(1);
}

// Build batchUpdate data
const updateData = [];
let matched = 0, skipped = 0;
for (const { sheetRow, stanza_number } of targets) {
  const m = mmap.get(stanza_number);
  if (!m) { skipped++; continue; }
  matched++;
  updateData.push({
    // H=meaning_en, I=meaning_te, J=meaning_ta, K=meaning_hi
    range: `shloka_stanzas!H${sheetRow}:K${sheetRow}`,
    values: [[
      m.meaning_en || '',
      m.meaning_te || '',
      m.meaning_ta || '',
      m.meaning_hi || '',
    ]],
  });
}

console.log(`Rows to update: ${matched} | Skipped (no meanings entry): ${skipped}`);
if (updateData.length > 0) {
  console.log(`\nSample [stanza 1]: en="${mmap.get(1)?.meaning_en?.slice(0, 80)}…"`);
}

if (!WRITE) {
  console.log('\nDry run — no changes written. Re-run with --write to apply.');
} else {
  if (updateData.length === 0) {
    console.log('Nothing to update.');
  } else {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    });
    console.log(`Updated ${updateData.length} rows with meanings.`);
  }
}
