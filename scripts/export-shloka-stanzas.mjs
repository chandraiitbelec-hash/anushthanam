/**
 * Exports the `shloka_stanzas` Sheets tab to static JSON, one file per
 * shloka_slug, under lib/data/stanzas/<slug>.json. Read-only against the
 * Sheets API (spreadsheets.readonly scope) — never writes back to Sheets.
 *
 * Run this after any upload-<slug>.mjs script adds new rows to
 * shloka_stanzas, then commit the regenerated JSON files alongside it.
 *
 * Usage: node scripts/export-shloka-stanzas.mjs
 */
import { google } from 'googleapis';
import { mkdir, writeFile, readdir, unlink } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadEnv, SPREADSHEET_ID } from './lib-sheets.mjs';

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../lib/data/stanzas');

async function getReadOnlySheetsClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

async function main() {
  const sheets = await getReadOnlySheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'shloka_stanzas!A:ZZ',
  });
  const [headers = [], ...rawRows] = res.data.values || [];
  const rows = rawRows.map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
  );

  const missingSlug = rows.filter(r => !r.shloka_slug);
  if (missingSlug.length > 0) {
    console.error(`ERROR: ${missingSlug.length} row(s) missing shloka_slug — aborting export.`);
    process.exit(1);
  }

  const bySlug = new Map();
  for (const row of rows) {
    if (!bySlug.has(row.shloka_slug)) bySlug.set(row.shloka_slug, []);
    bySlug.get(row.shloka_slug).push(row);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const existingFiles = new Set((await readdir(OUT_DIR)).filter(f => f.endsWith('.json')));
  const writtenFiles = new Set();

  for (const [slug, slugRows] of bySlug) {
    slugRows.sort((a, b) => (parseInt(a.stanza_number, 10) || 0) - (parseInt(b.stanza_number, 10) || 0));
    const fileName = `${slug}.json`;
    await writeFile(resolve(OUT_DIR, fileName), JSON.stringify(slugRows, null, 2) + '\n', 'utf8');
    writtenFiles.add(fileName);
  }

  // Remove stale per-slug files for slugs no longer present in the tab
  // (e.g. a slug was renamed) so lib/stanzas.ts never serves orphaned data.
  const staleFiles = [...existingFiles].filter(f => !writtenFiles.has(f));
  for (const f of staleFiles) {
    await unlink(resolve(OUT_DIR, f));
  }

  console.log(`Exported ${rows.length} stanza rows across ${bySlug.size} shloka(s) to ${OUT_DIR}`);
  if (staleFiles.length > 0) {
    console.log(`Removed ${staleFiles.length} stale file(s): ${staleFiles.join(', ')}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
