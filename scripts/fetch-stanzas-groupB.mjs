/**
 * Fetch shloka_stanzas rows for Group B slugs and write to research/<slug>-stanzas.json.
 * Reads columns A:L (slug, stanza_number, label, scripts, meanings, notes).
 *
 * Usage: node scripts/fetch-stanzas-groupB.mjs [--slug <slug>]
 *   --slug <slug>  Only fetch this slug (default: all Group B)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const GROUP_B_SLUGS = [
  'soundarya-lahari',
  'shiv-chalisa',
  'rama-raksha-stotram',
  'mahishasura-mardini-stotram',
];

const slugArg = process.argv.indexOf('--slug');
const SLUGS = slugArg !== -1 && process.argv[slugArg + 1]
  ? [process.argv[slugArg + 1]]
  : GROUP_B_SLUGS;

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
  range: 'shloka_stanzas!A:L',
});
const rows = res.data.values || [];
const [header, ...dataRows] = rows;
console.log('Header:', header?.join(' | '));

const researchDir = resolve(__dirname, '../research');
mkdirSync(researchDir, { recursive: true });

for (const slug of SLUGS) {
  const slugRows = dataRows.filter(r => r[0] === slug);
  const stanzas = slugRows.map(r => ({
    stanza_number: parseInt(r[1], 10),
    stanza_label: r[2] || '',
    script_devanagari: r[3] || '',
    script_telugu: r[4] || '',
    script_tamil: r[5] || '',
    roman_iast: r[6] || '',
    meaning_en: r[7] || '',
    meaning_te: r[8] || '',
    meaning_ta: r[9] || '',
    meaning_hi: r[10] || '',
  }));

  const outPath = resolve(researchDir, `${slug}-stanzas.json`);
  writeFileSync(outPath, JSON.stringify(stanzas, null, 2), 'utf8');
  console.log(`${slug}: ${stanzas.length} stanzas → ${outPath}`);

  const empty_te = stanzas.filter(s => !s.meaning_te).length;
  const empty_ta = stanzas.filter(s => !s.meaning_ta).length;
  const empty_hi = stanzas.filter(s => !s.meaning_hi).length;
  console.log(`  Empty meanings — te: ${empty_te}, ta: ${empty_ta}, hi: ${empty_hi}`);
}
