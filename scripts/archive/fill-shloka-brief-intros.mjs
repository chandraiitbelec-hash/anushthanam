/**
 * One-off: fill missing brief_intro_{te,ta,hi} (and optionally brief_intro_en)
 * for a single shlokas-tab row, identified by slug. In-place cell edit only —
 * never touches any other column or row.
 *
 * Usage:
 *   node scripts/fill-shloka-brief-intros.mjs --slug=ganesha-ashtothram \
 *     --te="..." --ta="..." --hi="..." [--en="..."] [--write]
 *
 * Dry-run by default; pass --write to apply.
 */
import { getSheetsClient, SPREADSHEET_ID, getTabWithHeaders, parseWriteFlag, colLetter } from './lib-sheets.mjs';

function parseArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const slug = parseArg('slug');
if (!slug) {
  console.error('Usage: node scripts/fill-shloka-brief-intros.mjs --slug=<slug> --te="..." --ta="..." --hi="..." [--en="..."] [--write]');
  process.exit(1);
}

const values = {
  en: parseArg('en'),
  te: parseArg('te'),
  ta: parseArg('ta'),
  hi: parseArg('hi'),
};

const write = parseWriteFlag();

const { rows, col } = await getTabWithHeaders('shlokas');
const slugCol = col('slug');

const rowIdx = rows.findIndex((r) => r[slugCol] === slug);
if (rowIdx === -1) {
  console.error(`No row found with slug "${slug}"`);
  process.exit(1);
}
const sheetRow = rowIdx + 2; // header row is 1, data starts at row 2
const row = rows[rowIdx];

console.log(`Row ${sheetRow}: slug=${slug}`);

const updates = [];
for (const lang of ['en', 'te', 'ta', 'hi']) {
  const newVal = values[lang];
  if (newVal === undefined) continue;
  const fieldName = `brief_intro_${lang}`;
  const fieldCol = col(fieldName);
  const currentVal = row[fieldCol] || '';
  console.log(`  ${fieldName}:`);
  console.log(`    current: ${JSON.stringify(currentVal)}`);
  console.log(`    new:     ${JSON.stringify(newVal)}`);
  updates.push({ range: `shlokas!${colLetter(fieldCol)}${sheetRow}`, values: [[newVal]] });
}

if (updates.length === 0) {
  console.log('No language values passed — nothing to do.');
  process.exit(0);
}

if (!write) {
  console.log('\nDry run only. Pass --write to apply.');
  process.exit(0);
}

const sheets = await getSheetsClient();
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: {
    valueInputOption: 'RAW',
    data: updates,
  },
});
console.log(`\nApplied ${updates.length} cell update(s) for "${slug}".`);
