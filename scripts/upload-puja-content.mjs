/**
 * Generic puja content uploader.
 *
 * Reads research/<slug>-content.json and:
 *   1. Patches prasad + regional_variation_notes_en on the pujas row
 *      (only fills empty cells — never overwrites non-empty values).
 *   2. Appends procedure_steps rows (refuses if any rows already exist for slug).
 *   3. Appends material_items rows (refuses if any rows already exist for slug).
 *
 * Safety:
 *   - Append-only; never deletes existing rows.
 *   - Refuses to append procedure_steps or material_items if rows for that
 *     slug already exist in the Sheet (idempotent re-run safety).
 *   - Never overwrites non-empty cells in the pujas row.
 *
 * Usage:
 *   node scripts/upload-puja-content.mjs <slug>          (dry run — default)
 *   node scripts/upload-puja-content.mjs <slug> --write  (apply)
 *
 * pujas columns (A–U, 0-indexed 0–20):
 *   slug | title_en | title_te | title_ta | title_hi | deity_slug |
 *   occasion_type | duration_minutes | brief_description_en |
 *   brief_description_te | brief_description_ta | brief_description_hi |
 *   materials_group_slug | prasad_en | prasad_te | prasad_ta | prasad_hi |
 *   regional_variation_notes_en | status | translation_status | frequent
 *
 * procedure_steps columns (A–N, 0-indexed 0–13):
 *   parent_slug | parent_type | step_number | step_title_en | step_title_te |
 *   step_title_ta | step_title_hi | instruction_en | instruction_te |
 *   instruction_ta | instruction_hi | recite_shloka_slug |
 *   recite_stanza_range | notes_en
 *
 * material_items columns (A–I, 0-indexed 0–8):
 *   group_slug | item_order | item_name_en | item_name_te | item_name_ta |
 *   item_name_hi | quantity_en | is_optional | substitution_note_en
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter as sharedColLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SLUG = process.argv[2];
const WRITE = parseWriteFlag(process.argv);

if (!SLUG) {
  console.error('Usage: node scripts/upload-puja-content.mjs <slug> [--write]');
  process.exit(1);
}

const contentPath = resolve(__dirname, `../research/${SLUG}-content.json`);
let content;
try {
  content = JSON.parse(readFileSync(contentPath, 'utf8'));
} catch (e) {
  console.error(`Cannot read ${contentPath}: ${e.message}`);
  process.exit(1);
}

const { puja_updates, procedure_steps: STEPS, material_items: MATERIALS } = content;

// ─── Sheet connection ─────────────────────────────────────────────────────────

const sheets = await getSheetsClient();
const SHEET_ID = SPREADSHEET_ID;

// ─── Read current state ───────────────────────────────────────────────────────

const [{ rows: pujasData, col: pujaCol }, { rows: stepsData, col: stepCol }, { rows: matsData, col: matCol }] = await Promise.all([
  getTabWithHeaders('pujas'),
  getTabWithHeaders('procedure_steps'),
  getTabWithHeaders('material_items'),
]);

const cParentSlug = stepCol('parent_slug');
const cGroupSlug = matCol('group_slug');
const existingStepSlugs = stepsData.map(r => r[cParentSlug]);
const existingMatSlugs  = matsData.map(r => r[cGroupSlug]);

const cSlug = pujaCol('slug');

// Find target puja row
const pujaRowIdx = pujasData.findIndex(r => r[cSlug] === SLUG);
if (pujaRowIdx === -1) {
  console.error(`Slug '${SLUG}' not found in pujas tab. Aborting.`);
  process.exit(1);
}
const pujaRow = pujasData[pujaRowIdx];
const sheetRowNumber = pujaRowIdx + 2; // 1-indexed, +1 for header

// pujas column indices, resolved by header name
const COL = {
  prasad_en:                    pujaCol('prasad_en'),
  prasad_te:                    pujaCol('prasad_te'),
  prasad_ta:                    pujaCol('prasad_ta'),
  prasad_hi:                    pujaCol('prasad_hi'),
  regional_variation_notes_en:  pujaCol('regional_variation_notes_en'),
};

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ upload-puja-content.mjs ══════════════════════════════════════');
console.log(`Slug  : ${SLUG}`);
console.log(`Mode  : ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Source: ${contentPath}`);

// ── Puja row patches ──────────────────────────────────────────────────────────

console.log('\n── pujas row patches ──────────────────────────────────────────────');

const patches = []; // { a1: 'R14C1', value }

for (const [field, colIdx] of Object.entries(COL)) {
  const currentVal = pujaRow[colIdx] || '';
  const newVal = puja_updates[field] || '';
  if (currentVal) {
    console.log(`  SKIP  ${field}: already filled ("${currentVal.slice(0, 60)}...")`);
  } else if (!newVal) {
    console.log(`  SKIP  ${field}: no value in content JSON`);
  } else {
    const a1 = `pujas!${sharedColLetter(colIdx)}${sheetRowNumber}`;
    patches.push({ a1, value: newVal });
    console.log(`  PATCH ${field} → ${a1}: "${newVal.slice(0, 80)}"`);
  }
}

// ── Procedure steps ──────────────────────────────────────────────────────────

console.log('\n── procedure_steps ────────────────────────────────────────────────');
const stepsAlreadyExist = existingStepSlugs.includes(SLUG);
let stepsToWrite = [];
if (stepsAlreadyExist) {
  console.log(`  ⚠ SKIP: procedure_steps for '${SLUG}' already exist — refusing to append again.`);
} else {
  stepsToWrite = STEPS.map(s => [
    s.parent_slug,
    s.parent_type,
    s.step_number,
    s.step_title_en,
    s.step_title_te,
    s.step_title_ta,
    s.step_title_hi,
    s.instruction_en,
    s.instruction_te,
    s.instruction_ta,
    s.instruction_hi,
    s.recite_shloka_slug || '',
    s.recite_stanza_range || '',
    s.notes_en || '',
  ]);
  console.log(`  APPEND ${stepsToWrite.length} steps for '${SLUG}'`);
  stepsToWrite.forEach(r => console.log(`    step ${r[2]}: ${r[3]}`));
}

// ── Material items ────────────────────────────────────────────────────────────

console.log('\n── material_items ─────────────────────────────────────────────────');
const matsAlreadyExist = existingMatSlugs.includes(SLUG);
let matsToWrite = [];
if (matsAlreadyExist) {
  console.log(`  ⚠ SKIP: material_items for '${SLUG}' already exist — refusing to append again.`);
} else {
  matsToWrite = MATERIALS.map(m => [
    m.group_slug,
    m.item_order,
    m.item_name_en,
    m.item_name_te,
    m.item_name_ta,
    m.item_name_hi,
    m.quantity_en,
    m.is_optional,
    m.substitution_note_en || '',
  ]);
  console.log(`  APPEND ${matsToWrite.length} items for '${SLUG}'`);
  matsToWrite.forEach(r => console.log(`    item ${r[1]}: ${r[2]}`));
}

// ─── Write ────────────────────────────────────────────────────────────────────

if (!WRITE) {
  console.log('\n── No changes made (dry run). Pass --write to apply. ────────────');
  process.exit(0);
}

// Apply puja row patches (individual cell updates)
for (const { a1, value } of patches) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: a1,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  });
  console.log(`  ✓ Patched ${a1}`);
}

// Append procedure_steps
if (stepsToWrite.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'procedure_steps!A:N',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: stepsToWrite },
  });
  console.log(`\n  ✓ Appended ${stepsToWrite.length} procedure_steps rows`);
}

// Append material_items
if (matsToWrite.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'material_items!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: matsToWrite },
  });
  console.log(`  ✓ Appended ${matsToWrite.length} material_items rows`);
}

console.log('\n══ Done ══════════════════════════════════════════════════════════\n');
