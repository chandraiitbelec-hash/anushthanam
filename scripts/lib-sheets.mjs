/**
 * Shared Google Sheets helpers for scripts/*.mjs.
 *
 * Usage:
 *   import { loadEnv, getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';
 *
 * loadEnv() is called automatically when this module is imported, so
 * process.env.SHEETS_SPREADSHEET_ID / GOOGLE_SERVICE_ACCOUNT_KEY are ready
 * as soon as SPREADSHEET_ID is read, regardless of the importing script's cwd.
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadEnv() {
  dotenv.config({ path: resolve(__dirname, '../.env.local') });
}

loadEnv();

export const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

let _sheetsClient = null;

export async function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  _sheetsClient = google.sheets({ version: 'v4', auth: client });
  return _sheetsClient;
}

/** Defaults to dry-run; pass --write on the CLI to apply changes. */
export function parseWriteFlag(argv = process.argv) {
  return argv.includes('--write');
}

/** 0-indexed column number -> spreadsheet column letter(s) (0 -> 'A', 26 -> 'AA'). */
export function colLetter(n) {
  let letter = '';
  let i = n + 1;
  while (i > 0) {
    const rem = (i - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    i = Math.floor((i - rem) / 26);
  }
  return letter;
}

/**
 * Fetches a tab's full contents and returns { headers, rows, col }, where
 * col(name) looks up a header's column index and throws loudly if it's
 * missing (instead of silently returning -1 and corrupting a write range).
 */
export async function getTabWithHeaders(tab) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:ZZ`,
  });
  const [headers = [], ...rows] = res.data.values || [];

  function col(name) {
    const idx = headers.indexOf(name);
    if (idx === -1) {
      throw new Error(`getTabWithHeaders("${tab}"): header "${name}" not found. Headers: ${headers.join(', ')}`);
    }
    return idx;
  }

  return { headers, rows, col };
}
