/**
 * Adds localized (_te/_ta/_hi) columns for fields that were English-only:
 *   material_items  → quantity_*, substitution_note_*
 *   procedure_steps → notes_*
 *   pujas           → regional_variation_notes_*
 *
 * Rule for the values (authored/backfilled separately): numerals stay as digits;
 * only the unit/descriptor words are localized (e.g. "2 cups" → "2 కప్పులు").
 *
 * Additive + idempotent: appends missing header cells at the end of each tab.
 * Existing column positions are unchanged, so row-appends by other scripts are unaffected.
 *
 * Usage:
 *   node scripts/add-localized-quantity-notes-columns.mjs           (dry run)
 *   node scripts/add-localized-quantity-notes-columns.mjs --write    (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

const ADDITIONS = {
  material_items:  ['quantity_te', 'quantity_ta', 'quantity_hi', 'substitution_note_te', 'substitution_note_ta', 'substitution_note_hi'],
  procedure_steps: ['notes_te', 'notes_ta', 'notes_hi'],
  pujas:           ['regional_variation_notes_te', 'regional_variation_notes_ta', 'regional_variation_notes_hi'],
};

const sheets = await getSheetsClient();
const SHEET_ID = SPREADSHEET_ID;

console.log(`\nMode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

for (const [tab, cols] of Object.entries(ADDITIONS)) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${tab}!1:1` });
  const headers = res.data.values?.[0] ?? [];
  const missing = cols.filter(c => !headers.includes(c));
  console.log(`\n── ${tab} (${headers.length} cols) ──`);
  if (missing.length === 0) { console.log('  all localized columns already present — skip'); continue; }
  const startCol = colLetter(headers.length);
  const endCol = colLetter(headers.length + missing.length - 1);
  console.log(`  appending ${missing.length} cols at ${startCol}1:${endCol}1 → ${missing.join(', ')}`);
  if (WRITE) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tab}!${startCol}1:${endCol}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [missing] },
    });
    console.log('  ✓ written');
  }
}
console.log(`\nDone.${WRITE ? '' : ' Run with --write to apply.'}`);
