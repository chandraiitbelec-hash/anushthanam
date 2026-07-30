/**
 * Appends a single `popular_god_slugs` row to the `config` tab so
 * app/page.tsx can read the homepage's curated "popular gods" list from
 * Sheets instead of a hardcoded constant.
 *
 * Usage:
 *   node scripts/add-popular-god-slugs-config.mjs            (dry run)
 *   node scripts/add-popular-god-slugs-config.mjs --write    (apply)
 *
 * Safety: append-only — refuses to write if the key already exists.
 */

import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const KEY = 'popular_god_slugs';
const VALUE = 'ganesha,shiva,vishnu,lakshmi,durga,hanuman,venkateswara,saraswati';

const { headers, rows, col } = await getTabWithHeaders('config');
const keyCol = col('key');
const valueCol = col('value');

console.log('\n══ add-popular-god-slugs-config.mjs ══════════════════════════');
console.log(`Mode:    ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);
console.log(`Tab:     config`);
console.log(`Headers: ${headers.join(', ')}`);
console.log(`Existing rows: ${rows.length}`);

const existing = rows.find(r => r[keyCol] === KEY);
if (existing) {
  console.log(`\nKey "${KEY}" already exists with value: ${existing[valueCol]}`);
  console.log('Refusing to duplicate — nothing to do.');
  process.exit(0);
}

console.log(`\nRow to append:`);
console.log(`  key:   ${KEY}`);
console.log(`  value: ${VALUE}`);

if (!WRITE) {
  console.log('\nDry run — no changes written. Re-run with --write to apply.');
  process.exit(0);
}

const newRow = new Array(headers.length).fill('');
newRow[keyCol] = KEY;
newRow[valueCol] = VALUE;

const sheets = await getSheetsClient();
await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'config!A1',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: [newRow] },
});

console.log('\n✓ Appended config row.');
console.log('\nDone. Trigger a deploy (push to GitHub) to publish the new data.');
