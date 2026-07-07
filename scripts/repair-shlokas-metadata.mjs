/**
 * Repairs the column-shift bug introduced by the pre-fix populate-shlokas-metadata.mjs.
 * That script wrote 15 values per row into a 16-column sheet, omitting source_scripture_en
 * entirely — everything from source_scripture_en onward landed one column to the left of
 * where it belongs.
 *
 * This script re-derives correct values purely from what's CURRENTLY stored in each
 * affected row (no dependency on the original hardcoded data), and only touches rows
 * whose slug appears in populate-shlokas-metadata.mjs's `shlokas` array — i.e. exactly
 * the rows that script appended.
 *
 * Defaults to a dry run (prints old → new for every affected row). Pass --write to
 * actually update the sheet.
 *
 * Run: node scripts/repair-shlokas-metadata.mjs          (dry run)
 *      node scripts/repair-shlokas-metadata.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
const SHEET = 'shlokas';

const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Scope the repair to exactly the slugs the buggy script appended — extracted by
// static regex, not by importing/running that file.
const bugScriptSource = readFileSync(resolve(__dirname, 'populate-shlokas-metadata.mjs'), 'utf8');
const affectedSlugs = new Set([...bugScriptSource.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map(m => m[1]));

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: `${SHEET}!A1:P`,
});
const [header, ...rows] = res.data.values;
const col = name => header.indexOf(name);

const idx = {
  slug: col('slug'),
  source_scripture_en: col('source_scripture_en'),
  language_of_composition: col('language_of_composition'),
  brief_intro_en: col('brief_intro_en'),
  brief_intro_te: col('brief_intro_te'),
  brief_intro_ta: col('brief_intro_ta'),
  brief_intro_hi: col('brief_intro_hi'),
  audio_drive_id: col('audio_drive_id'),
};

const updates = [];
rows.forEach((row, i) => {
  const slug = row[idx.slug];
  if (!affectedSlugs.has(slug)) return;

  const current = {
    source_scripture_en: row[idx.source_scripture_en] || '',
    language_of_composition: row[idx.language_of_composition] || '',
    brief_intro_en: row[idx.brief_intro_en] || '',
    brief_intro_te: row[idx.brief_intro_te] || '',
    brief_intro_ta: row[idx.brief_intro_ta] || '',
    brief_intro_hi: row[idx.brief_intro_hi] || '',
    audio_drive_id: row[idx.audio_drive_id] || '',
  };

  // Undo the one-column-left shift (see header comment).
  const corrected = {
    source_scripture_en: current.audio_drive_id,
    language_of_composition: current.brief_intro_ta,
    brief_intro_en: current.source_scripture_en,
    brief_intro_te: current.language_of_composition,
    brief_intro_ta: current.brief_intro_en,
    brief_intro_hi: current.brief_intro_te,
    audio_drive_id: '',
  };

  // Skip rows that are already correct (e.g. re-running after a partial fix).
  const unchanged = Object.keys(corrected).every(k => corrected[k] === current[k]);
  if (unchanged) return;

  const sheetRow = i + 2; // +1 for header, +1 for 1-indexing
  updates.push({ slug, sheetRow, current, corrected });
});

console.log(`${updates.length} rows to repair (of ${affectedSlugs.size} slugs from the buggy script):\n`);

for (const u of updates) {
  console.log(`── ${u.slug} (row ${u.sheetRow}) ──`);
  console.log(`  brief_intro_en: ${u.current.brief_intro_en.slice(0, 60)} → ${u.corrected.brief_intro_en.slice(0, 60)}`);
  console.log(`  brief_intro_te: ${u.current.brief_intro_te.slice(0, 40)} → ${u.corrected.brief_intro_te.slice(0, 40)}`);
  console.log(`  brief_intro_ta: ${u.current.brief_intro_ta.slice(0, 40)} → ${u.corrected.brief_intro_ta.slice(0, 40)}`);
  console.log(`  brief_intro_hi: ${u.current.brief_intro_hi.slice(0, 40)} → ${u.corrected.brief_intro_hi.slice(0, 40)}`);
  console.log(`  language_of_composition: ${u.current.language_of_composition} → ${u.corrected.language_of_composition}`);
  console.log(`  source_scripture_en: ${u.current.source_scripture_en} → ${u.corrected.source_scripture_en}`);
  console.log(`  audio_drive_id: ${u.current.audio_drive_id} → (cleared)`);
  console.log();
}

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  const data = updates.map(u => ({
    range: `${SHEET}!A${u.sheetRow}:P${u.sheetRow}`,
    values: [(() => {
      const row = [...rows[u.sheetRow - 2]];
      row[idx.source_scripture_en] = u.corrected.source_scripture_en;
      row[idx.language_of_composition] = u.corrected.language_of_composition;
      row[idx.brief_intro_en] = u.corrected.brief_intro_en;
      row[idx.brief_intro_te] = u.corrected.brief_intro_te;
      row[idx.brief_intro_ta] = u.corrected.brief_intro_ta;
      row[idx.brief_intro_hi] = u.corrected.brief_intro_hi;
      row[idx.audio_drive_id] = u.corrected.audio_drive_id;
      return row;
    })()],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`Wrote corrections for ${updates.length} rows.`);
}
