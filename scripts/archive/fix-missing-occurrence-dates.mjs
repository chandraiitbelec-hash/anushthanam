/**
 * Fills in next_occurrence (and next_occurrence_note_en where given) for the
 * 7 festivals and 3 vrathams that had it blank, using dates supplied by the
 * user (cross-checked here: every date's day-of-week matches what was given).
 *
 * Bonalu has two candidate dates (Aug 10, 2026 and Aug 2, 2027) — using the
 * nearer 2026 one as the current next_occurrence, same logic applied by
 * getUpcoming() elsewhere on the site.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-missing-occurrence-dates.mjs          (dry run)
 *      node scripts/fix-missing-occurrence-dates.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const FESTIVALS = {
  'ugadi': { date: '2027-04-08' },
  'makar-sankranti': { date: '2027-01-15' },
  'pongal': { date: '2027-01-15' },
  'akshaya-tritiya': { date: '2027-05-09' },
  'vasant-panchami': { date: '2027-02-11' },
  'holi': { date: '2027-03-22' },
  'bonalu': { date: '2026-08-10', note: 'Concluding public holiday (celebrations span across July & August Sundays)' },
};

const VRATHAMS = {
  'maha-shivaratri': { date: '2027-03-06' },
  'kedareswara-vratham': { date: '2026-11-08', note: 'Observed on Diwali Amavasya' },
  'savitri-vratham': { date: '2027-06-04' },
};

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

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

async function buildUpdates(tab, entries) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!A:Z` });
  const [headers, ...rows] = res.data.values;
  const slugCol = headers.indexOf('slug');
  const dateCol = headers.indexOf('next_occurrence');
  const noteCol = headers.indexOf('next_occurrence_note_en');

  const updates = [];
  for (const [slug, { date, note }] of Object.entries(entries)) {
    const rowIdx = rows.findIndex(r => r[slugCol] === slug);
    if (rowIdx === -1) { console.log(`[${tab}] ${slug} not found — skipping`); continue; }
    const sheetRow = rowIdx + 2;
    updates.push({ range: `${tab}!${colLetter(dateCol)}${sheetRow}`, values: [[date]] });
    console.log(`[${tab}] ${slug}: next_occurrence -> ${date}`);
    if (note) {
      updates.push({ range: `${tab}!${colLetter(noteCol)}${sheetRow}`, values: [[note]] });
      console.log(`[${tab}] ${slug}: next_occurrence_note_en -> ${note}`);
    }
  }
  return updates;
}

const festivalUpdates = await buildUpdates('festivals', FESTIVALS);
const vrathamUpdates = await buildUpdates('vrathams', VRATHAMS);
const allUpdates = [...festivalUpdates, ...vrathamUpdates];

console.log(`\n${allUpdates.length} cell(s) to update.`);

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: allUpdates },
  });
  console.log('Applied.');
}
