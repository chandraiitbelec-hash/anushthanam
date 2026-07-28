/**
 * Corrects 6 stray-Latin-character typos in the Govinda Namalu upload
 * (scripts/upload-govinda-namalu.mjs), confirmed against the parallel
 * English transliteration for each stanza:
 *
 *   stanza 3  script_telugu: navaneeతచోర       -> నవనీతచోర
 *   stanza 17 script_telugu: varadhiబంధన       -> వారధిబంధన
 *   stanza 14 script_tamil:  ஸங்கசக்rதரா       -> ஸங்கசக்ரதரா
 *   stanza 18 script_tamil:  ரகுகuலநந்தனா      -> ரகுகுலநந்தனா
 *   stanza 19 script_tamil:  வட்டிகாஸuலவாடா    -> வட்டிகாஸுலவாடா
 *   stanza 19 script_tamil:  வஸuதேவதநயா        -> வசுதேவதநயா
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-govinda-namalu-typos.mjs          (dry run)
 *      node scripts/fix-govinda-namalu-typos.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'govinda-namalu';

const FIXES = [
  { stanza: 3, field: 'script_telugu', from: 'navaneeతచోర', to: 'నవనీతచోర' },
  { stanza: 17, field: 'script_telugu', from: 'varadhiబంధన', to: 'వారధిబంధన' },
  { stanza: 14, field: 'script_tamil', from: 'ஸங்கசக்rதரா', to: 'ஸங்கசக்ரதரா' },
  { stanza: 18, field: 'script_tamil', from: 'ரகுகuலநந்தனா', to: 'ரகுகுலநந்தனா' },
  { stanza: 19, field: 'script_tamil', from: 'வட்டிகாஸuலவாடா', to: 'வட்டிகாஸுலவாடா' },
  { stanza: 19, field: 'script_tamil', from: 'வஸuதேவதநயா', to: 'வசுதேவதநயா' },
];

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'shloka_stanzas!A:ZZ' });
const [headers, ...rows] = res.data.values;
const slugCol = headers.indexOf('shloka_slug');
const stanzaCol = headers.indexOf('stanza_number');

function colLetter(i) {
  let s = '';
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - m) / 26);
  }
  return s;
}

// Group fixes by target cell (stanza + field) so multiple replacements in the
// same cell (stanza 19 script_tamil has two) apply together, not as separate
// overwrites of the same range.
const byCell = new Map();
for (const fix of FIXES) {
  const key = `${fix.stanza}:${fix.field}`;
  if (!byCell.has(key)) byCell.set(key, { stanza: fix.stanza, field: fix.field, replacements: [] });
  byCell.get(key).replacements.push([fix.from, fix.to]);
}

const updates = [];
for (const { stanza, field, replacements } of byCell.values()) {
  const fieldCol = headers.indexOf(field);
  const rowIdx = rows.findIndex(r => r[slugCol] === SLUG && r[stanzaCol] === String(stanza));
  if (rowIdx === -1) {
    console.log(`stanza ${stanza}: row not found — skipping`);
    continue;
  }
  const current = rows[rowIdx][fieldCol];
  let corrected = current;
  let anyMissing = false;
  for (const [from, to] of replacements) {
    if (!corrected.includes(from)) { console.log(`stanza ${stanza} ${field}: "${from}" not found — skipping that replacement`); anyMissing = true; continue; }
    corrected = corrected.replace(from, to);
  }
  if (corrected === current) { console.log(`stanza ${stanza} ${field}: no changes applied — skipping`); continue; }
  updates.push({ range: `shloka_stanzas!${colLetter(fieldCol)}${rowIdx + 2}`, values: [[corrected]] });
  console.log(`stanza ${stanza} ${field}:\n  ${current}\n  -> ${corrected}\n`);
}

console.log(`${updates.length} cell(s) to update.`);

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates },
  });
  console.log('Applied.');
}
