/**
 * Uploads detailed content for vastu-puja:
 *   - Updates puja row: prasad + regional_variation_notes_en
 *   - Appends procedure_steps (10 steps)
 *   - Appends material_items (15 items)
 *
 * Safety rules:
 *   - Refuses to write procedure_steps or material_items if rows for this
 *     slug already exist (idempotent against double-runs).
 *   - puja row update only writes cells that are currently empty (non-empty
 *     cells are skipped to avoid clobbering parallel batch work).
 *   - Never writes to pujas columns other than prasad_en/te/ta/hi and
 *     regional_variation_notes_en.
 *   - Append-only; never deletes rows.
 *
 * Usage:
 *   node scripts/upload-puja-detail-vastu.mjs           (dry run)
 *   node scripts/upload-puja-detail-vastu.mjs --write   (apply)
 *
 * FLAGS (uncertainties to review before publishing):
 *   [FLAG-VASTUPUJA-1] Griha Pravesh customs vary significantly by region.
 *       Step 9 describes the broadly observed practice. Regional variants
 *       (paal kachchi in TN, clay-pot at door in North India) noted in notes_en.
 *   [FLAG-VASTUPUJA-2] Tamil translations authored from standard liturgical Tamil
 *       — should be reviewed by a native speaker before marking translation_status='complete'.
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

// ── Load authored content ──────────────────────────────────────────────────
const content = JSON.parse(
  readFileSync(resolve(__dirname, '../research/vastu-puja-content.json'), 'utf8')
);
const { puja_slug, puja_updates, procedure_steps, material_items } = content;

// ── Auth ───────────────────────────────────────────────────────────────────
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

console.log('\n══ upload-puja-detail-vastu.mjs ═════════════════════════════');
console.log(`Slug  : ${puja_slug}`);
console.log(`Mode  : ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

// ── 1. Read pujas tab ──────────────────────────────────────────────────────
// Columns A–U (0-indexed 0–20):
// slug(0) title_en(1) title_te(2) title_ta(3) title_hi(4) deity_slug(5)
// occasion_type(6) duration_minutes(7) brief_description_en(8) ..._te(9) ..._ta(10) ..._hi(11)
// materials_group_slug(12) prasad_en(13) prasad_te(14) prasad_ta(15) prasad_hi(16)
// regional_variation_notes_en(17) status(18) translation_status(19) frequent(20)
const PRASAD_EN_COL  = 14; // N (1-based) → col index 13
const PRASAD_TE_COL  = 15;
const PRASAD_TA_COL  = 16;
const PRASAD_HI_COL  = 17;
const REG_NOTES_COL  = 18; // R (1-based) → col index 17

// Sheets API uses A1 notation columns:
const COL_LETTER = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U'];

const pujaRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: 'pujas!A:U',
});
const pujaRows = pujaRes.data.values || [];
const [pujaHeader, ...pujaData] = pujaRows;

const pujaRowIdx = pujaData.findIndex(r => r[0] === puja_slug);
if (pujaRowIdx === -1) {
  console.error(`\n❌ Puja row not found for slug '${puja_slug}' — cannot proceed.`);
  process.exit(1);
}
const pujaSheetRow = pujaRowIdx + 2; // 1-based + 1 for header
const pujaRow = pujaData[pujaRowIdx];
console.log(`\nPuja row found at Sheet row ${pujaSheetRow}: ${pujaRow[0]}`);

// ── 2. Plan puja row updates ───────────────────────────────────────────────
// Column indices are 0-based; sheet columns are 1-based (A=1).
// Our columns: prasad_en=N(14), prasad_te=O(15), prasad_ta=P(16), prasad_hi=Q(17), regional=R(18)
// Wait — let me re-check against the header to be safe.
const hdr = pujaHeader;
const prasadEnIdx  = hdr.indexOf('prasad_en');
const prasadTeIdx  = hdr.indexOf('prasad_te');
const prasadTaIdx  = hdr.indexOf('prasad_ta');
const prasadHiIdx  = hdr.indexOf('prasad_hi');
const regNotesIdx  = hdr.indexOf('regional_variation_notes_en');

console.log(`\nColumn indices (0-based): prasad_en=${prasadEnIdx} prasad_te=${prasadTeIdx} prasad_ta=${prasadTaIdx} prasad_hi=${prasadHiIdx} regional=${regNotesIdx}`);

const pujaUpdatePlan = [];
const fields = [
  { idx: prasadEnIdx,  key: 'prasad_en',  val: puja_updates.prasad_en },
  { idx: prasadTeIdx,  key: 'prasad_te',  val: puja_updates.prasad_te },
  { idx: prasadTaIdx,  key: 'prasad_ta',  val: puja_updates.prasad_ta },
  { idx: prasadHiIdx,  key: 'prasad_hi',  val: puja_updates.prasad_hi },
  { idx: regNotesIdx,  key: 'regional_variation_notes_en', val: puja_updates.regional_variation_notes_en },
];
for (const { idx, key, val } of fields) {
  const current = pujaRow[idx] ?? '';
  if (current.trim() !== '') {
    console.log(`  SKIP  ${key} — already has content`);
  } else {
    const colLetter = COL_LETTER[idx];
    console.log(`  UPDATE ${key} → col ${colLetter}${pujaSheetRow}`);
    pujaUpdatePlan.push({ range: `pujas!${colLetter}${pujaSheetRow}`, value: val });
  }
}

// ── 3. Read procedure_steps tab ────────────────────────────────────────────
const psRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: 'procedure_steps!A:N',
});
const psRows = psRes.data.values || [];
const psHeader = psRows[0];
const psData   = psRows.slice(1);
const psForSlug = psData.filter(r => r[0] === puja_slug);

console.log(`\n── procedure_steps ──────────────────────────────────────────────`);
if (psForSlug.length > 0) {
  console.log(`  ⛔ ${psForSlug.length} rows already exist for '${puja_slug}' — REFUSING to append steps (idempotent guard).`);
} else {
  console.log(`  OK — 0 existing rows for '${puja_slug}'. Will append ${procedure_steps.length} steps.`);
  procedure_steps.forEach(s => console.log(`    step ${s.step_number}: ${s.step_title_en}`));
}

// ── 4. Read material_items tab ─────────────────────────────────────────────
const miRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: 'material_items!A:I',
});
const miRows = miRes.data.values || [];
const miData = miRows.slice(1);
const miForSlug = miData.filter(r => r[0] === puja_slug);

console.log(`\n── material_items ────────────────────────────────────────────────`);
if (miForSlug.length > 0) {
  console.log(`  ⛔ ${miForSlug.length} rows already exist for '${puja_slug}' — REFUSING to append items (idempotent guard).`);
} else {
  console.log(`  OK — 0 existing rows for '${puja_slug}'. Will append ${material_items.length} items.`);
  material_items.forEach(m => console.log(`    item ${m.item_order}: ${m.item_name_en}`));
}

console.log(`\nSummary:`);
console.log(`  Puja row updates  : ${pujaUpdatePlan.length} cell(s)`);
console.log(`  Procedure steps   : ${psForSlug.length > 0 ? 'SKIPPED (existing)' : procedure_steps.length + ' to append'}`);
console.log(`  Material items    : ${miForSlug.length > 0 ? 'SKIPPED (existing)' : material_items.length + ' to append'}`);

if (!WRITE) {
  console.log('\n✋ Dry run complete — pass --write to apply.');
  process.exit(0);
}

// ── 5. Apply puja row updates ──────────────────────────────────────────────
for (const { range, value } of pujaUpdatePlan) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  });
  console.log(`  ✓ Updated ${range}`);
}

// ── 6. Append procedure_steps ──────────────────────────────────────────────
if (psForSlug.length === 0) {
  const psRows2Append = procedure_steps.map(s => [
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
    s.recite_shloka_slug,
    s.recite_stanza_range,
    s.notes_en,
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'procedure_steps!A:N',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: psRows2Append },
  });
  console.log(`  ✓ Appended ${psRows2Append.length} procedure steps`);
}

// ── 7. Append material_items ───────────────────────────────────────────────
if (miForSlug.length === 0) {
  const miRows2Append = material_items.map(m => [
    m.group_slug,
    String(m.item_order),
    m.item_name_en,
    m.item_name_te,
    m.item_name_ta,
    m.item_name_hi,
    m.quantity_en,
    m.is_optional,
    m.substitution_note_en,
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'material_items!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: miRows2Append },
  });
  console.log(`  ✓ Appended ${miRows2Append.length} material items`);
}

console.log('\n✅ vastu-puja upload complete.');
