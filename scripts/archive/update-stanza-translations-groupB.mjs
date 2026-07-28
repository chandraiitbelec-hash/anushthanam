/**
 * Write meaning_te / meaning_ta / meaning_hi (columns I:K only) for Group B shlokas.
 * Reads from research/<slug>-meanings.json + research/<slug>-stanzas.json.
 *
 * Usage:
 *   node scripts/update-stanza-translations-groupB.mjs           # dry-run
 *   node scripts/update-stanza-translations-groupB.mjs --write   # apply
 *   node scripts/update-stanza-translations-groupB.mjs --slug soundarya-lahari --write
 */

import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
const KEY_JSON = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

const GROUP_B_SLUGS = [
  'soundarya-lahari',
  'shiv-chalisa',
  'rama-raksha-stotram',
  'mahishasura-mardini-stotram',
];

const TAB = 'shloka_stanzas';
// Columns: A=shloka_slug, B=stanza_number, C=stanza_label, D=script_devanagari,
//          E=script_telugu, F=script_tamil, G=roman_iast, H=meaning_en,
//          I=meaning_te, J=meaning_ta, K=meaning_hi, L=notes_en
const COL_SLUG   = 0; // A
const COL_NUM    = 1; // B
const COL_TE     = 8; // I
const COL_TA     = 9; // J
const COL_HI     = 10; // K

const WRITE_MODE = process.argv.includes('--write');
const SLUG_ARG   = (() => {
  const i = process.argv.indexOf('--slug');
  return i !== -1 ? process.argv[i + 1] : null;
})();

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: KEY_JSON,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function fetchAllRows(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A:L`,
  });
  return res.data.values || [];
}

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

async function processSlug(sheets, slug, allRows) {
  const researchDir = join(__dirname, '..', 'research');
  const meaningsPath = join(researchDir, `${slug}-meanings.json`);

  const meanings = loadJson(meaningsPath);
  if (!meanings) {
    console.error(`  ERROR: ${meaningsPath} not found`);
    return { skipped: 0, written: 0, errors: 0 };
  }

  // Build lookup: stanza_number -> translations
  const byNum = {};
  for (const m of meanings) {
    byNum[m.n] = m;
  }

  // Find Sheet rows for this slug (1-indexed; row 1 is header)
  const updates = [];
  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    if (!row || row[COL_SLUG] !== slug) continue;

    const stanzaNum = parseInt(row[COL_NUM], 10);
    if (isNaN(stanzaNum)) continue;

    const m = byNum[stanzaNum];
    if (!m) {
      console.warn(`  WARN: no meaning entry for ${slug} stanza ${stanzaNum}`);
      continue;
    }

    const existingTe = (row[COL_TE] || '').trim();
    const existingTa = (row[COL_TA] || '').trim();
    const existingHi = (row[COL_HI] || '').trim();

    // Never overwrite non-empty cells
    if (existingTe || existingTa || existingHi) {
      continue;
    }

    const newTe = (m.meaning_te || '').trim();
    const newTa = (m.meaning_ta || '').trim();
    const newHi = (m.meaning_hi || '').trim();

    if (!newTe && !newTa && !newHi) continue;

    // Sheet row is 1-indexed; row 0 = header, so Sheet row = i + 1
    const sheetRow = i + 1;
    updates.push({ sheetRow, stanzaNum, newTe, newTa, newHi });
  }

  console.log(`  ${slug}: ${updates.length} rows to write`);

  if (!WRITE_MODE) {
    for (const u of updates.slice(0, 5)) {
      console.log(`    row ${u.sheetRow} stanza ${u.stanzaNum}: te="${u.newTe.slice(0, 40)}…"`);
    }
    if (updates.length > 5) console.log(`    … and ${updates.length - 5} more`);
    return { skipped: 0, written: 0, dryRun: updates.length };
  }

  if (updates.length === 0) return { written: 0 };

  // Build batchUpdate data — write ONLY columns I:K (never H)
  const data = updates.map(u => ({
    range: `${TAB}!I${u.sheetRow}:K${u.sheetRow}`,
    values: [[u.newTe, u.newTa, u.newHi]],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  });

  console.log(`  ✓ wrote ${updates.length} rows`);
  return { written: updates.length };
}

async function main() {
  const slugs = SLUG_ARG ? [SLUG_ARG] : GROUP_B_SLUGS;

  console.log(`Mode: ${WRITE_MODE ? 'WRITE' : 'DRY-RUN'}`);
  console.log(`Slugs: ${slugs.join(', ')}\n`);

  const sheets = await getSheets();
  console.log('Fetching all shloka_stanzas rows…');
  const allRows = await fetchAllRows(sheets);
  console.log(`  ${allRows.length} rows fetched\n`);

  let totalDry = 0, totalWritten = 0;

  for (const slug of slugs) {
    console.log(`Processing: ${slug}`);
    const result = await processSlug(sheets, slug, allRows);
    totalDry    += result.dryRun  || 0;
    totalWritten += result.written || 0;
  }

  if (!WRITE_MODE) {
    console.log(`\nDry-run complete. ${totalDry} rows would be written.`);
    console.log('Re-run with --write to apply.');
  } else {
    console.log(`\nDone. ${totalWritten} rows written.`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
