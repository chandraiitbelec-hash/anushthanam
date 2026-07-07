import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateRows, toSheetRows } from './lib-ashtothram-generator.mjs';

export async function runUpload({ slug, names, expectedCount, scriptUrl }) {
  const __dirname = dirname(fileURLToPath(scriptUrl));
  dotenv.config({ path: resolve(__dirname, '../.env.local') });
  const WRITE = process.argv.includes('--write');

  if (expectedCount && names.length !== expectedCount) {
    console.log(`NOTE: expected ${expectedCount} names, parsed ${names.length}. Proceeding anyway (not trimming/padding) — verify this is intentional.`);
  } else {
    console.log(`Parsed ${names.length} names for "${slug}".`);
  }

  const rows = generateRows(names, slug);
  const sampleIdx = [0, Math.floor(rows.length / 2), rows.length - 1];
  console.log(`\nSample (${sampleIdx.map(i => i + 1).join(', ')}):\n`);
  sampleIdx.forEach(i => console.log(rows[i], '\n'));

  if (!WRITE) {
    console.log('Dry run only — no changes written. Re-run with --write to apply.');
    return rows;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: toSheetRows(rows, slug) },
  });
  console.log(`Appended ${rows.length} rows for "${slug}".`);
  return rows;
}
