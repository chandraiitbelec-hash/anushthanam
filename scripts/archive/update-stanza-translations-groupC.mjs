/**
 * Backfills meaning_te, meaning_ta, meaning_hi for Group C shloka stanzas.
 *
 * Reads research/<slug>-meanings.json  (format: [{n, meaning_te, meaning_ta, meaning_hi}])
 * Locates sheet rows by slug+stanza_number, then patches columns I:K only.
 * NEVER touches meaning_en (column H) or any script columns.
 * NEVER overwrites a row where I, J, or K are already non-empty.
 *
 * Usage:
 *   node scripts/update-stanza-translations-groupC.mjs --slug sai-chalisa           (dry run)
 *   node scripts/update-stanza-translations-groupC.mjs --slug sai-chalisa --write   (apply)
 *
 * Group C slugs: sai-chalisa, hanuman-chalisa, durga-chalisa, venkateswara-suprabhatam
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
  console.error('Usage: node scripts/update-stanza-translations-groupC.mjs --slug <slug> [--write]');
  process.exit(1);
}
const SLUG = process.argv[slugArg + 1];

const meaningsPath = resolve(__dirname, `../research/${SLUG}-meanings.json`);
if (!existsSync(meaningsPath)) {
  console.error(`Missing: ${meaningsPath}`);
  process.exit(1);
}

const meanings = JSON.parse(readFileSync(meaningsPath, 'utf8'));
const mmap = new Map(meanings.map(e => [e.n, e]));
console.log(`Slug: ${SLUG} | meanings entries: ${meanings.length}`);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

// Fetch A:K to get slug, stanza_number, and existing te/ta/hi values
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
  range: 'shloka_stanzas!A:K',
});
const allRows = res.data.values || [];

// Build targets for this slug, skip rows where I/J/K already filled
const updateData = [];
let matched = 0, skippedNoEntry = 0, skippedAlreadyFilled = 0;

allRows.forEach((r, i) => {
  if (r[0] !== SLUG) return;
  const stanzaNum = parseInt(r[1], 10);
  const existingTe = (r[8] || '').trim();
  const existingTa = (r[9] || '').trim();
  const existingHi = (r[10] || '').trim();

  if (existingTe || existingTa || existingHi) {
    skippedAlreadyFilled++;
    return;
  }

  const m = mmap.get(stanzaNum);
  if (!m) {
    skippedNoEntry++;
    return;
  }

  matched++;
  const sheetRow = i + 1;
  updateData.push({
    // I=meaning_te, J=meaning_ta, K=meaning_hi (do NOT touch H=meaning_en)
    range: `shloka_stanzas!I${sheetRow}:K${sheetRow}`,
    values: [[
      m.meaning_te || '',
      m.meaning_ta || '',
      m.meaning_hi || '',
    ]],
  });
});

console.log(`Found rows for "${SLUG}": ${matched} to update | ${skippedAlreadyFilled} already filled | ${skippedNoEntry} no meanings entry`);

if (updateData.length > 0) {
  const sample = mmap.get(1);
  if (sample) {
    console.log(`\nSample [stanza 1]:`);
    console.log(`  te: ${sample.meaning_te?.slice(0, 80)}…`);
    console.log(`  ta: ${sample.meaning_ta?.slice(0, 80)}…`);
    console.log(`  hi: ${sample.meaning_hi?.slice(0, 80)}…`);
  }
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
    console.log(`\nUpdated ${updateData.length} rows (columns I:K) for "${SLUG}".`);
  }
}
