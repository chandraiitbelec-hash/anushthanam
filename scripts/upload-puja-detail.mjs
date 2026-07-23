/**
 * Uploads full procedure_steps, material_items, and puja prasad/notes for ONE puja.
 *
 * Reads from: research/<slug>-content.json
 * Writes to: procedure_steps, material_items, and pujas (prasad + regional_variation_notes only)
 *
 * Safety:
 *   - REFUSES if procedure_steps already exist for the slug (idempotent on re-run)
 *   - REFUSES if material_items already exist for the group_slug
 *   - Only updates puja row cells that are EMPTY (never clobbers non-empty)
 *   - Append-only for steps and materials
 *   - parent_type='puja' enforced
 *
 * Usage:
 *   node scripts/upload-puja-detail.mjs --slug=daily-home-puja          (dry run)
 *   node scripts/upload-puja-detail.mjs --slug=daily-home-puja --write  (apply)
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WRITE = parseWriteFlag(process.argv);
const slugArg = process.argv.find(a => a.startsWith('--slug='));
if (!slugArg) {
  console.error('ERROR: --slug=<puja-slug> is required');
  process.exit(1);
}
const SLUG = slugArg.replace('--slug=', '');

// ─── Load content file ────────────────────────────────────────────────────────

const contentPath = resolve(__dirname, `../research/${SLUG}-content.json`);
let content;
try {
  content = JSON.parse(readFileSync(contentPath, 'utf8'));
} catch (e) {
  console.error(`ERROR: Cannot read ${contentPath}: ${e.message}`);
  process.exit(1);
}

const { procedure_steps: STEPS, material_items: MATERIALS, puja_row_update: PUJA_UPDATE } = content;

if (!STEPS || !STEPS.length) { console.error('ERROR: procedure_steps missing or empty'); process.exit(1); }
if (!MATERIALS || !MATERIALS.length) { console.error('ERROR: material_items missing or empty'); process.exit(1); }

// Validate parent_type
const badType = STEPS.find(s => s.parent_type !== 'puja');
if (badType) { console.error(`ERROR: step ${badType.step_number} has parent_type='${badType.parent_type}', expected 'puja'`); process.exit(1); }

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ upload-puja-detail.mjs ═══════════════════════════════════════');
console.log(`Slug:  ${SLUG}`);
console.log(`Mode:  ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Steps: ${STEPS.length}  Materials: ${MATERIALS.length}`);

// ─── Guard: procedure_steps already present? ─────────────────────────────────

const stepsTab = await getTabWithHeaders('procedure_steps');
const parentSlugCol = stepsTab.col('parent_slug');
const hasSteps = stepsTab.rows.some(r => r[parentSlugCol] === SLUG);
if (hasSteps) {
  console.log(`\n✋ SKIP — procedure_steps already contain rows for '${SLUG}'. Re-run is idempotent.`);
  console.log('   To re-author, manually delete the existing rows first, then re-run.');
  process.exit(0);
}

// ─── Guard: material_items already present? ───────────────────────────────────

const groupSlug = MATERIALS[0].group_slug;
const materialsTab = await getTabWithHeaders('material_items');
const groupSlugCol = materialsTab.col('group_slug');
const hasMats = materialsTab.rows.some(r => r[groupSlugCol] === groupSlug);
if (hasMats) {
  console.log(`\n✋ SKIP — material_items already contain rows for group '${groupSlug}'. Re-run is idempotent.`);
  console.log('   To re-author, manually delete the existing rows first, then re-run.');
  process.exit(0);
}

// ─── Fetch puja row ───────────────────────────────────────────────────────────

const pujaTab = await getTabWithHeaders('pujas');
const pujaSlugCol = pujaTab.col('slug');
const prasadCols = {
  prasad_en: pujaTab.col('prasad_en'),
  prasad_te: pujaTab.col('prasad_te'),
  prasad_ta: pujaTab.col('prasad_ta'),
  prasad_hi: pujaTab.col('prasad_hi'),
  regional_variation_notes_en: pujaTab.col('regional_variation_notes_en'),
};

const pujaRowIdx = pujaTab.rows.findIndex(r => r[pujaSlugCol] === SLUG);
if (pujaRowIdx === -1) {
  console.error(`ERROR: '${SLUG}' not found in pujas tab. Upload the puja row first.`);
  process.exit(1);
}
const pujaRow = pujaTab.rows[pujaRowIdx];
const pujaSheetRow = pujaRowIdx + 2; // 1-based + header row

console.log(`\nPuja row found at Sheet row ${pujaSheetRow}`);
console.log(`  prasad_en:           "${pujaRow[prasadCols.prasad_en] || '(empty)'}"`);
console.log(`  regional_notes_en:   "${pujaRow[prasadCols.regional_variation_notes_en] || '(empty)'}"`);

// Determine which puja cells need updating (only if empty)
const pujaUpdates = [];
if (PUJA_UPDATE) {
  const fields = [
    { key: 'prasad_en', label: 'prasad_en' },
    { key: 'prasad_te', label: 'prasad_te' },
    { key: 'prasad_ta', label: 'prasad_ta' },
    { key: 'prasad_hi', label: 'prasad_hi' },
    { key: 'regional_variation_notes_en', label: 'regional_variation_notes_en' },
  ];
  for (const f of fields) {
    const idx = prasadCols[f.key];
    const current = pujaRow[idx] || '';
    const desired = (PUJA_UPDATE[f.key] || '').trim();
    if (!desired) continue;
    if (current.trim()) {
      console.log(`  SKIP ${f.label} — already has value`);
    } else {
      console.log(`  FILL ${f.label} — will set (${desired.substring(0, 60)}...)`);
      pujaUpdates.push({ range: `pujas!${colLetter(idx)}${pujaSheetRow}`, value: desired });
    }
  }
}

// ─── Plan steps ──────────────────────────────────────────────────────────────

console.log('\n── Procedure Steps to append ───────────────────────────────────');
STEPS.forEach(s => {
  console.log(`  step ${String(s.step_number).padStart(2)}: ${s.step_title_en} [shloka: ${s.recite_shloka_slug || '—'}]`);
});

console.log('\n── Material Items to append ─────────────────────────────────────');
MATERIALS.forEach(m => {
  console.log(`  item ${String(m.item_order).padStart(2)}: ${m.item_name_en} (${m.quantity_en})`);
});

// ─── Dry run exit ─────────────────────────────────────────────────────────────

if (!WRITE) {
  console.log(`\n✋ Dry run complete. Summary: ${STEPS.length} steps, ${MATERIALS.length} materials, ${pujaUpdates.length} puja cell update(s). Pass --write to apply.`);
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

const sheets = await getSheetsClient();

// Append procedure_steps
// Columns: parent_slug | parent_type | step_number | step_title_en | step_title_te | step_title_ta | step_title_hi |
//   instruction_en | instruction_te | instruction_ta | instruction_hi | recite_shloka_slug | recite_stanza_range | notes_en
const stepsRows = STEPS.map(s => [
  s.parent_slug,
  s.parent_type,
  String(s.step_number),
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

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'procedure_steps!A:N',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: stepsRows },
});
console.log(`\n  ✓ Appended ${stepsRows.length} procedure_steps rows`);

// Append material_items
// Columns: group_slug | item_order | item_name_en | item_name_te | item_name_ta | item_name_hi |
//   quantity_en | is_optional | substitution_note_en
const matsRows = MATERIALS.map(m => [
  m.group_slug,
  String(m.item_order),
  m.item_name_en,
  m.item_name_te,
  m.item_name_ta,
  m.item_name_hi,
  m.quantity_en,
  m.is_optional,
  m.substitution_note_en || '',
]);

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'material_items!A:I',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: matsRows },
});
console.log(`  ✓ Appended ${matsRows.length} material_items rows`);

// Update puja row cells (only empty ones)
for (const u of pujaUpdates) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: u.range,
    valueInputOption: 'RAW',
    requestBody: { values: [[u.value]] },
  });
  console.log(`  ✓ Updated ${u.range}: "${u.value.substring(0, 60)}..."`);
}

console.log('\n✅ Done.');
