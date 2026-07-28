/**
 * Reads shloka_stanzas rows for Group A slugs from Google Sheets,
 * saves to research/<slug>-source.json for inspection and translation.
 *
 * Group A: vishnu-sahasranamam, ganesh-chalisa, subrahmanya-bhujangam, kanakadhara-stotram
 *
 * Run: node scripts/read-stanzas-groupA.mjs
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SLUGS = [
  'vishnu-sahasranamam',
  'ganesh-chalisa',
  'subrahmanya-bhujangam',
  'kanakadhara-stotram',
];

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

// Fetch all columns A-L
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
  range: 'shloka_stanzas!A:L',
});
const allRows = res.data.values || [];
console.log(`Total rows in shloka_stanzas: ${allRows.length}`);

const researchDir = resolve(__dirname, '../research');
if (!existsSync(researchDir)) mkdirSync(researchDir, { recursive: true });

for (const SLUG of SLUGS) {
  const rows = allRows.filter(r => r[0] === SLUG);
  console.log(`\n${SLUG}: ${rows.length} rows found`);

  const stanzas = rows.map(r => ({
    n: parseInt(r[1], 10),
    label: r[2] || '',
    script_devanagari: r[3] || '',
    script_telugu: r[4] || '',
    script_tamil: r[5] || '',
    roman_iast: r[6] || '',
    meaning_en: r[7] || '',
    meaning_te: r[8] || '',
    meaning_ta: r[9] || '',
    meaning_hi: r[10] || '',
    notes_en: r[11] || '',
  }));

  // Stats
  const withEn = stanzas.filter(s => s.meaning_en).length;
  const withTe = stanzas.filter(s => s.meaning_te).length;
  const withTa = stanzas.filter(s => s.meaning_ta).length;
  const withHi = stanzas.filter(s => s.meaning_hi).length;
  console.log(`  meaning_en: ${withEn}/${stanzas.length}`);
  console.log(`  meaning_te: ${withTe}/${stanzas.length}`);
  console.log(`  meaning_ta: ${withTa}/${stanzas.length}`);
  console.log(`  meaning_hi: ${withHi}/${stanzas.length}`);

  const outPath = resolve(researchDir, `${SLUG}-source.json`);
  writeFileSync(outPath, JSON.stringify({ slug: SLUG, stanzas }, null, 2), 'utf8');
  console.log(`  Saved to research/${SLUG}-source.json`);
}
