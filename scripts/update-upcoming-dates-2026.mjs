/**
 * Bulk-updates next_occurrence + next_occurrence_note_en for festivals and vrathams
 * using the audited Jul–Dec 2026 Hindu calendar.
 *
 * Usage:
 *   node scripts/update-upcoming-dates-2026.mjs          ← dry run (prints changes, writes nothing)
 *   node scripts/update-upcoming-dates-2026.mjs --apply  ← actually writes to Sheets
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const APPLY = process.argv.includes('--apply');

const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const auth = new google.auth.GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

// ─── Verified dates from the audited Jul–Dec 2026 Hindu calendar ─────────────

const FESTIVAL_UPDATES = {
  'rath-yatra':           { date: '2026-07-16', note: 'Ashadha Shukla Dwitiya' },
  'guru-purnima':         { date: '2026-07-29', note: 'Ashadha Purnima; Vyasa Purnima' },
  'onam':                 { date: '2026-08-26', note: 'Thiruvonam nakshatra; Chingam month' },
  'krishna-janmashtami':  { date: '2026-09-03', note: 'Bhadrapada Krishna Ashtami; Vaishnava/ISKCON tradition: Sep 4' },
  'ganesh-chaturthi':     { date: '2026-09-14', note: 'Bhadrapada Shukla Chaturthi; 10-day festival' },
  'navaratri':            { date: '2026-10-11', note: 'Ashwina Shukla Pratipada; Kalasa Sthapana' },
  'vijayadashami-dasara': { date: '2026-10-20', note: 'Ashwina Shukla Dashami; Vidyarambham in Kerala' },
  'vijayadashami':        { date: '2026-10-20', note: 'Ashwina Shukla Dashami; Vidyarambham in Kerala' },
  'bathukamma':           { date: '2026-10-11', note: 'Begins Ashwina 1st; Saddula Bathukamma finale Oct 18' },
  'saraswati-puja':       { date: '2026-10-17', note: 'Ashwina Shukla Saptami; Maha Saptami / Saraswati Avahan' },
  'diwali':               { date: '2026-11-08', note: 'Kartika Amavasya; Tamil Deepavali same day' },
  'deepavali':            { date: '2026-11-08', note: 'Kartika Amavasya; Tamil Deepavali same day' },
  'karthigai-deepam':     { date: '2026-11-24', note: 'Kartika Purnima; Dev Deepavali in Varanasi' },
  'karthika-pournami':    { date: '2026-11-24', note: 'Kartika Purnima; Kojagara Puja; Dev Deepavali' },
  'vaikuntha-ekadashi':   { date: '2026-12-20', note: 'Margashirsha Shukla Ekadashi; Geeta Jayanti; Mokshada Ekadashi' },
};

const VRATHAM_UPDATES = {
  // Directly from the audited calendar
  'varalakshmi-vratham':         { date: '2026-08-28', note: 'Shravana Purnima; Ashtalakshmi Vratam' },
  'karwa-chauth':                { date: '2026-10-29', note: 'Kartika Krishna Chaturthi' },
  'hartalika-teej':              { date: '2026-09-14', note: 'Bhadrapada Shukla Tritiya' },
  'skanda-sashti-vratham':       { date: '2026-11-10', note: 'Karthigai Sashti; 6-day fast; Soora Samharam Nov 15' },
  'chhath-puja':                 { date: '2026-11-15', note: 'Kartika Shashti; Sandhya Arghya to setting sun' },
  'ekadashi-vratham':            { date: '2026-07-10', note: 'Yogini Ekadashi; Ashadha Krishna Ekadashi' },
  // Commonly observed on Purnima — nearest is Ashadha Purnima (Guru Purnima)
  'satyanarayana-vratham':       { date: '2026-07-29', note: 'Ashadha Purnima; Guru Purnima' },
  // Lunar estimates derived from Guru Purnima (Jul 29 = Ashadha Shukla 15)
  'pradosha-vratham':            { date: '2026-07-27', note: 'Ashadha Shukla Trayodashi' },
  'mondays-shiva-vratham':       { date: '2026-08-03', note: 'First Shravana Somavar (Monday)' },
  'santoshi-mata':               { date: '2026-07-31', note: 'First Shravana Shukravar (Friday)' },
  'mangala-gauri-vratham':       { date: '2026-08-04', note: 'First Shravana Mangalavar (Tuesday)' },
  'vaibhav-lakshmi-vrat':        { date: '2026-07-31', note: 'First Shravana Shukravar (Friday)' },
  'sankashti-chaturthi-vratham': { date: '2026-08-02', note: 'Shravana Krishna Chaturthi' },
};

function colToLetter(index) {
  let letter = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

async function processTab(tab, updates) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!A:Z` });
  const [header, ...rows] = res.data.values || [];
  const ci = h => header.indexOf(h);

  const slugCol   = ci('slug');
  const occCol    = ci('next_occurrence');
  const noteCol   = ci('next_occurrence_note_en');
  const titleCol  = ci('title_en');
  const statusCol = ci('status');

  console.log(`\n=== ${tab} ===`);
  console.log(`  Columns: slug=${slugCol}, next_occurrence=${occCol}, note=${noteCol}`);

  const batchData = [];
  let matched = 0, skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const slug = row[slugCol] || '';
    const status = row[statusCol] || '';
    const title = row[titleCol] || '';

    if (status !== 'published') continue;

    const update = updates[slug];
    if (!update) {
      console.log(`  skip  ${slug} (${title}) — no update defined`);
      skipped++;
      continue;
    }

    const rowNum = i + 2; // 1-indexed + header row
    console.log(`  match ${slug} → ${update.date}  [${update.note}]`);

    batchData.push({
      range: `${tab}!${colToLetter(occCol)}${rowNum}`,
      values: [[update.date]],
    });
    batchData.push({
      range: `${tab}!${colToLetter(noteCol)}${rowNum}`,
      values: [[update.note]],
    });
    matched++;
  }

  console.log(`\n  ${matched} rows will be updated, ${skipped} published rows have no update defined`);

  if (APPLY && batchData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: batchData },
    });
    console.log(`  ✓ Written to Sheets`);
  } else if (!APPLY) {
    console.log(`  (dry run — pass --apply to write)`);
  }

  return matched;
}

const festivalCount = await processTab('festivals', FESTIVAL_UPDATES);
const vrathamCount  = await processTab('vrathams',  VRATHAM_UPDATES);

console.log(`\nSummary: ${festivalCount} festivals + ${vrathamCount} vrathams ${APPLY ? 'updated' : 'would be updated'}`);
