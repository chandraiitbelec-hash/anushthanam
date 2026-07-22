/**
 * Generic entity-notes uploader.
 *
 * Reads research/<slug>-entity-notes.json and:
 *   1. Fills procedure_steps.notes_te/ta/hi where notes_en matches and target is empty.
 *   2. Fills material_items.substitution_note_te/ta/hi where substitution_note_en matches
 *      and target is empty.
 *
 * Match key for procedure_steps : (parent_slug, notes_en)
 * Match key for material_items  : (group_slug, substitution_note_en)
 *
 * Safety:
 *   - FILL EMPTY TARGET CELLS ONLY — never overwrites non-empty te/ta/hi.
 *   - Sequential writes (one awaited update per row) — no concurrent sheet mutations.
 *   - Dry-run by default; pass --write to apply.
 *
 * Usage:
 *   node scripts/upload-entity-notes.mjs <slug>          (dry run)
 *   node scripts/upload-entity-notes.mjs <slug> --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SLUG = process.argv[2];
const WRITE = process.argv.includes('--write');

if (!SLUG) {
  console.error('Usage: node scripts/upload-entity-notes.mjs <slug> [--write]');
  process.exit(1);
}

const researchPath = resolve(__dirname, `../research/${SLUG}-entity-notes.json`);
let data;
try {
  data = JSON.parse(readFileSync(researchPath, 'utf8'));
} catch (e) {
  console.error(`Cannot read ${researchPath}: ${e.message}`);
  process.exit(1);
}

const { procedure_steps_notes = [], material_items_notes = [] } = data;

// ─── Sheet connection ─────────────────────────────────────────────────────────

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

function colLetter(i) {
  let s = '';
  i += 1;
  while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
  return s;
}

// ─── Fetch current sheet data ─────────────────────────────────────────────────

const [stepsRes, matsRes] = await Promise.all([
  sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' }),
  sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'material_items!A:ZZ' }),
]);

const [stepsHeaders, ...stepsRows] = stepsRes.data.values ?? [[]];
const [matsHeaders,  ...matsRows]  = matsRes.data.values  ?? [[]];

const sc = n => stepsHeaders.indexOf(n);
const mc = n => matsHeaders.indexOf(n);

const S = {
  slug:    sc('parent_slug'),
  type:    sc('parent_type'),
  notesEn: sc('notes_en'),
  notesTe: sc('notes_te'),
  notesTa: sc('notes_ta'),
  notesHi: sc('notes_hi'),
};
const M = {
  group:   mc('group_slug'),
  subEn:   mc('substitution_note_en'),
  subTe:   mc('substitution_note_te'),
  subTa:   mc('substitution_note_ta'),
  subHi:   mc('substitution_note_hi'),
};

// ─── Header presence check ────────────────────────────────────────────────────

console.log(`\n══ upload-entity-notes.mjs ══════════════════════════════════════`);
console.log(`Slug  : ${SLUG}`);
console.log(`Mode  : ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Source: ${researchPath}`);

const missingCols = [];
for (const [name, idx] of [
  ['procedure_steps.notes_te', S.notesTe],
  ['procedure_steps.notes_ta', S.notesTa],
  ['procedure_steps.notes_hi', S.notesHi],
  ['material_items.substitution_note_te', M.subTe],
  ['material_items.substitution_note_ta', M.subTa],
  ['material_items.substitution_note_hi', M.subHi],
]) {
  if (idx === -1) missingCols.push(name);
}
if (missingCols.length) {
  console.error(`\n⛔ Missing columns in sheet — run add-localized-quantity-notes-columns.mjs first:`);
  missingCols.forEach(c => console.error(`   ${c}`));
  process.exit(1);
}

// ─── procedure_steps ─────────────────────────────────────────────────────────

console.log(`\n── procedure_steps_notes (${procedure_steps_notes.length} entries in research file) ──`);

let stepsFilled = 0, stepsSkipped = 0, stepsMissed = 0;

for (const entry of procedure_steps_notes) {
  const { parent_slug, notes_en, notes_te, notes_ta, notes_hi } = entry;
  if (!notes_en) { stepsSkipped++; continue; }

  // Find the matching row (parent_slug + notes_en exact match)
  const rowIdx = stepsRows.findIndex(r =>
    (r[S.slug] ?? '') === parent_slug && (r[S.notesEn] ?? '').trim() === notes_en.trim()
  );

  if (rowIdx === -1) {
    console.log(`  MISS  [${parent_slug}] notes_en="${notes_en.slice(0, 60)}" — row not found in sheet`);
    stepsMissed++;
    continue;
  }

  const sheetRow = rowIdx + 2; // 1-indexed + header
  const r = stepsRows[rowIdx];

  for (const [lang, newVal, colIdx] of [
    ['te', notes_te, S.notesTe],
    ['ta', notes_ta, S.notesTa],
    ['hi', notes_hi, S.notesHi],
  ]) {
    const existing = (r[colIdx] ?? '').trim();
    if (existing) {
      console.log(`  SKIP  [${parent_slug}] step notes_${lang}: already filled`);
      stepsSkipped++;
      continue;
    }
    if (!newVal) {
      console.log(`  SKIP  [${parent_slug}] step notes_${lang}: no translation in research file`);
      stepsSkipped++;
      continue;
    }
    const a1 = `procedure_steps!${colLetter(colIdx)}${sheetRow}`;
    console.log(`  PATCH [${parent_slug}] notes_${lang} → ${a1}: "${newVal.slice(0, 70)}"`);
    if (WRITE) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: a1,
        valueInputOption: 'RAW',
        requestBody: { values: [[newVal]] },
      });
      console.log(`    ✓ written`);
    }
    stepsFilled++;
  }
}

// ─── material_items ──────────────────────────────────────────────────────────

console.log(`\n── material_items_notes (${material_items_notes.length} entries in research file) ──`);

let matsFilled = 0, matsSkipped = 0, matsMissed = 0;

for (const entry of material_items_notes) {
  const { group_slug, substitution_note_en, substitution_note_te, substitution_note_ta, substitution_note_hi } = entry;
  if (!substitution_note_en) { matsSkipped++; continue; }

  // Find the matching row (group_slug + substitution_note_en exact match)
  const rowIdx = matsRows.findIndex(r =>
    (r[M.group] ?? '') === group_slug &&
    (r[M.subEn] ?? '').trim() === substitution_note_en.trim()
  );

  if (rowIdx === -1) {
    console.log(`  MISS  [${group_slug}] sub_en="${substitution_note_en.slice(0, 60)}" — row not found in sheet`);
    matsMissed++;
    continue;
  }

  const sheetRow = rowIdx + 2;
  const r = matsRows[rowIdx];

  for (const [lang, newVal, colIdx] of [
    ['te', substitution_note_te, M.subTe],
    ['ta', substitution_note_ta, M.subTa],
    ['hi', substitution_note_hi, M.subHi],
  ]) {
    const existing = (r[colIdx] ?? '').trim();
    if (existing) {
      console.log(`  SKIP  [${group_slug}] sub_note_${lang}: already filled`);
      matsSkipped++;
      continue;
    }
    if (!newVal) {
      console.log(`  SKIP  [${group_slug}] sub_note_${lang}: no translation in research file`);
      matsSkipped++;
      continue;
    }
    const a1 = `material_items!${colLetter(colIdx)}${sheetRow}`;
    console.log(`  PATCH [${group_slug}] sub_note_${lang} → ${a1}: "${newVal.slice(0, 70)}"`);
    if (WRITE) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: a1,
        valueInputOption: 'RAW',
        requestBody: { values: [[newVal]] },
      });
      console.log(`    ✓ written`);
    }
    matsFilled++;
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n── Summary ─────────────────────────────────────────────────────────`);
console.log(`procedure_steps: ${stepsFilled} cells to fill | ${stepsSkipped} skipped | ${stepsMissed} missed`);
console.log(`material_items : ${matsFilled} cells to fill | ${matsSkipped} skipped | ${matsMissed} missed`);
console.log(`\n${WRITE ? '✓ Done.' : 'Dry run — pass --write to apply.'}`);
