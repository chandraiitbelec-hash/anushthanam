/**
 * Uploads localized notes for festival slugs from research/<slug>-entity-notes.json
 * into the Google Sheets procedure_steps and material_items tabs.
 *
 * Rules:
 *   - Fills EMPTY target cells only; never clobbers existing te/ta/hi values.
 *   - Matches rows by (parent_slug/group_slug + the notes_en / substitution_note_en text).
 *   - Sequential awaits — one row per Sheets update, no concurrency.
 *   - Dry-run by default; pass --write to apply.
 *
 * Usage:
 *   node scripts/upload-festival-entity-notes.mjs          (dry run)
 *   node scripts/upload-festival-entity-notes.mjs --write   (apply)
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID as SHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = parseWriteFlag(process.argv);

// Source JSON files (untracked research/ files)
const SOURCE_FILES = [
  'maha-shivaratri-entity-notes.json',
  'saraswati-puja-entity-notes.json',
];

const sheets = await getSheetsClient();

// ── Load all source data ──────────────────────────────────────────────────────
const allMaterialNotes = [];
const allStepNotes = [];

for (const fname of SOURCE_FILES) {
  const fpath = resolve(__dirname, '../research', fname);
  if (!existsSync(fpath)) {
    console.warn(`⚠️  Not found: ${fpath} — skipping`);
    continue;
  }
  const data = JSON.parse(readFileSync(fpath, 'utf8'));
  for (const row of (data.procedure_steps_notes ?? [])) allStepNotes.push(row);
  for (const row of (data.material_items_notes ?? [])) allMaterialNotes.push(row);
}

console.log(`\nMode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);
console.log(`Loaded: ${allStepNotes.length} step-note translations, ${allMaterialNotes.length} material substitution-note translations`);

// ── procedure_steps ───────────────────────────────────────────────────────────
if (allStepNotes.length > 0) {
  console.log('\n── procedure_steps ─────────────────────────────────────────────────');
  const psRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' });
  const [ph, ...prows] = psRes.data.values ?? [[]];
  const pc = n => ph.indexOf(n);
  const cSlug = pc('parent_slug'), cType = pc('parent_type'), cStep = pc('step_number');
  const cNEn = pc('notes_en'), cNTe = pc('notes_te'), cNTa = pc('notes_ta'), cNHi = pc('notes_hi');

  if ([cNTe, cNTa, cNHi].some(c => c < 0)) {
    console.error('ERROR: notes_te/ta/hi columns not found in procedure_steps. Run add-localized-quantity-notes-columns.mjs first.');
    process.exit(1);
  }

  for (const note of allStepNotes) {
    if (!note.notes_en) continue;
    // Find matching row
    const rowIdx = prows.findIndex(r =>
      (r[cSlug] ?? '') === note.parent_slug &&
      (r[cType] ?? '') === 'festival' &&
      (r[cNEn] ?? '').trim() === note.notes_en.trim()
    );
    if (rowIdx < 0) {
      console.warn(`  ⚠️  Row not found: [${note.parent_slug}] step ${note.step_number} notes_en="${note.notes_en.slice(0, 60)}"`);
      continue;
    }
    const sheetRow = rowIdx + 2;
    const r = prows[rowIdx];
    const hasTe = (r[cNTe] ?? '').trim(), hasTa = (r[cNTa] ?? '').trim(), hasHi = (r[cNHi] ?? '').trim();
    if (hasTe || hasTa || hasHi) {
      console.log(`  skip (already filled): [${note.parent_slug}] row ${sheetRow}`);
      continue;
    }
    const range = `procedure_steps!${colLetter(cNTe)}${sheetRow}:${colLetter(cNHi)}${sheetRow}`;
    console.log(`  ${WRITE ? 'write' : 'would write'}: [${note.parent_slug}] row ${sheetRow} → te/ta/hi`);
    if (WRITE) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [[note.notes_te, note.notes_ta, note.notes_hi]] },
      });
      console.log(`    ✓ written`);
    }
  }
}

// ── material_items ────────────────────────────────────────────────────────────
if (allMaterialNotes.length > 0) {
  console.log('\n── material_items ──────────────────────────────────────────────────');
  const miRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'material_items!A:ZZ' });
  const [mh, ...mrows] = miRes.data.values ?? [[]];
  const mc = n => mh.indexOf(n);
  const cGroup = mc('group_slug'), cOrder = mc('item_order');
  const cSNEn = mc('substitution_note_en'), cSNTe = mc('substitution_note_te'), cSNTa = mc('substitution_note_ta'), cSNHi = mc('substitution_note_hi');

  if ([cSNTe, cSNTa, cSNHi].some(c => c < 0)) {
    console.error('ERROR: substitution_note_te/ta/hi columns not found in material_items. Run add-localized-quantity-notes-columns.mjs first.');
    process.exit(1);
  }

  for (const note of allMaterialNotes) {
    if (!note.substitution_note_en) continue;
    // Find matching row
    const rowIdx = mrows.findIndex(r =>
      (r[cGroup] ?? '') === note.group_slug &&
      (r[cSNEn] ?? '').trim() === note.substitution_note_en.trim()
    );
    if (rowIdx < 0) {
      console.warn(`  ⚠️  Row not found: [${note.group_slug}] item_order=${note.item_order} substitution_note_en="${note.substitution_note_en.slice(0, 60)}"`);
      continue;
    }
    const sheetRow = rowIdx + 2;
    const r = mrows[rowIdx];
    const hasTe = (r[cSNTe] ?? '').trim(), hasTa = (r[cSNTa] ?? '').trim(), hasHi = (r[cSNHi] ?? '').trim();
    if (hasTe || hasTa || hasHi) {
      console.log(`  skip (already filled): [${note.group_slug}] item_order=${note.item_order} row ${sheetRow}`);
      continue;
    }
    const range = `material_items!${colLetter(cSNTe)}${sheetRow}:${colLetter(cSNHi)}${sheetRow}`;
    console.log(`  ${WRITE ? 'write' : 'would write'}: [${note.group_slug}] item_order=${note.item_order} row ${sheetRow} → te/ta/hi`);
    console.log(`    te: ${note.substitution_note_te}`);
    console.log(`    ta: ${note.substitution_note_ta}`);
    console.log(`    hi: ${note.substitution_note_hi}`);
    if (WRITE) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [[note.substitution_note_te, note.substitution_note_ta, note.substitution_note_hi]] },
      });
      console.log(`    ✓ written`);
    }
  }
}

console.log(`\n${WRITE ? '✓ Done.' : 'Dry run complete — pass --write to apply.'}`);
