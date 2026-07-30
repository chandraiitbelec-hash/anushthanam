/**
 * Backfills quantity_te/ta/hi in material_items from research/quantity-glossary.json.
 * Rule: numerals stay as digits; only unit/descriptor words are localized.
 * Applies to ALL material_items rows (pujas + festivals + vrathams) since the glossary
 * is shared vocabulary. Only fills empty target cells; never clobbers existing values.
 *
 * Usage:
 *   node scripts/backfill-quantity-localization.mjs          (dry run)
 *   node scripts/backfill-quantity-localization.mjs --write   (apply)
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = parseWriteFlag(process.argv);

const glossary = JSON.parse(readFileSync(resolve(__dirname, '../research/quantity-glossary.json'), 'utf8'));

const sheets = await getSheetsClient();
const SHEET_ID = SPREADSHEET_ID;

const { rows, col } = await getTabWithHeaders('material_items');
const cQtyEn = col('quantity_en'), cTe = col('quantity_te'), cTa = col('quantity_ta'), cHi = col('quantity_hi');

const updates = [];
const missing = new Set();
let filled = 0, skipped = 0;
rows.forEach((r, idx) => {
  const qen = (r[cQtyEn] ?? '').trim();
  if (!qen) return;
  const g = glossary[qen];
  if (!g) { missing.add(qen); return; }
  const sheetRow = idx + 2; // +1 header, +1 to 1-index
  const already = (r[cTe] ?? '') || (r[cTa] ?? '') || (r[cHi] ?? '');
  if (already) { skipped++; return; }
  filled++;
  updates.push({ range: `material_items!${colLetter(cTe)}${sheetRow}:${colLetter(cHi)}${sheetRow}`, values: [[g.te, g.ta, g.hi]] });
});

console.log(`\nMode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);
console.log(`Rows to fill: ${filled} | already-localized (skipped): ${skipped}`);
if (missing.size) {
  console.log(`\n⚠️  ${missing.size} quantity_en values NOT in glossary (add them, re-run):`);
  [...missing].forEach(m => console.log(`   "${m}"`));
}
console.log('\nSample:', JSON.stringify(updates.slice(0, 3), null, 0));

if (WRITE && updates.length) {
  // batchUpdate in chunks to stay well under limits
  for (let i = 0; i < updates.length; i += 200) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates.slice(i, i + 200) },
    });
  }
  console.log(`\n✓ wrote ${updates.length} rows.`);
} else if (!WRITE) {
  console.log('\nDry run — pass --write to apply.');
}
