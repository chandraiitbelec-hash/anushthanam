/**
 * Uploads localized notes (te/ta/hi) for the 5 batch-2 pujas:
 *   durga-puja, hanuman-puja, subrahmanya-puja, saraswati-puja, satyanarayana-puja
 *
 * Reads from research/<slug>-notes.json files.
 * Writes to: procedure_steps (notes_te/ta/hi), material_items (substitution_note_te/ta/hi),
 *            pujas (regional_variation_notes_te/ta/hi)
 *
 * Matching strategy (never clobbers non-empty cells):
 *   procedure_steps  → match by (parent_slug + notes_en)
 *   material_items   → match by (group_slug + substitution_note_en)
 *   pujas            → match by (slug + regional_variation_notes_en)
 *
 * Usage:
 *   node scripts/upload-puja-notes.mjs                  (dry run — all 5 pujas)
 *   node scripts/upload-puja-notes.mjs --puja durga-puja (dry run — one puja)
 *   node scripts/upload-puja-notes.mjs --write           (apply all 5)
 *   node scripts/upload-puja-notes.mjs --puja hanuman-puja --write
 */
import fs from 'fs';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const PUJA_ARG_IDX = process.argv.indexOf('--puja');
const TARGET_PUJA = PUJA_ARG_IDX !== -1 ? process.argv[PUJA_ARG_IDX + 1] : null;

const ALL_PUJAS = ['durga-puja', 'hanuman-puja', 'subrahmanya-puja', 'saraswati-puja', 'satyanarayana-puja'];
const PUJAS_TO_PROCESS = TARGET_PUJA ? [TARGET_PUJA] : ALL_PUJAS;

console.log(`\n══ upload-puja-notes.mjs ═══════════════════════════════════════`);
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Pujas: ${PUJAS_TO_PROCESS.join(', ')}`);

// Load notes JSON files
const notesData = {};
for (const slug of PUJAS_TO_PROCESS) {
  const filePath = resolve(__dirname, `../research/${slug}-notes.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Missing notes file: research/${slug}-notes.json`);
    continue;
  }
  notesData[slug] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

if (Object.keys(notesData).length === 0) {
  console.error('❌ No notes files found — nothing to do');
  process.exit(1);
}

// Google Sheets auth
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

async function fetchTab(tab) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${tab}!A:ZZ` });
  const all = res.data.values || [[]];
  return { headers: all[0] || [], rows: all.slice(1) };
}

const updates = [];
let matched = 0, skipped = 0, noMatch = 0;

// ── procedure_steps ──────────────────────────────────────────────────────────
console.log('\n── procedure_steps ──');
const { headers: psH, rows: psRows } = await fetchTab('procedure_steps');
const psC = n => psH.indexOf(n);

const cParentSlug = psC('parent_slug');
const cNotesEn   = psC('notes_en');
const cNotesTe   = psC('notes_te');
const cNotesTa   = psC('notes_ta');
const cNotesHi   = psC('notes_hi');

if ([cNotesTe, cNotesTa, cNotesHi].includes(-1)) {
  console.error('❌ Missing notes_te/ta/hi columns — run add-localized-quantity-notes-columns.mjs first');
  process.exit(1);
}

for (const [slug, data] of Object.entries(notesData)) {
  for (const note of (data.procedure_steps_notes || [])) {
    const rowIdx = psRows.findIndex(r =>
      (r[cParentSlug] ?? '') === note.parent_slug &&
      (r[cNotesEn]   ?? '').trim() === note.notes_en.trim()
    );
    if (rowIdx === -1) {
      console.warn(`  ⚠️  No match: ${note.parent_slug} notes_en="${note.notes_en.slice(0, 55)}..."`);
      noMatch++;
      continue;
    }
    const sheetRow = rowIdx + 2;
    const r = psRows[rowIdx];
    const pairs = [
      [cNotesTe, note.notes_te],
      [cNotesTa, note.notes_ta],
      [cNotesHi, note.notes_hi],
    ];
    let wrote = false;
    for (const [col, val] of pairs) {
      if (!(r[col] ?? '').trim()) {
        updates.push({ range: `procedure_steps!${colLetter(col)}${sheetRow}`, values: [[val]] });
        wrote = true;
      }
    }
    if (wrote) {
      console.log(`  ✓ ${note.parent_slug} step notes_en="${note.notes_en.slice(0, 50)}..." → row ${sheetRow}`);
      matched++;
    } else {
      console.log(`  – ${note.parent_slug} step notes_en="${note.notes_en.slice(0, 50)}..." already filled`);
      skipped++;
    }
  }
}

// ── material_items ───────────────────────────────────────────────────────────
console.log('\n── material_items ──');
const { headers: miH, rows: miRows } = await fetchTab('material_items');
const miC = n => miH.indexOf(n);

const cGroupSlug = miC('group_slug');
const cSubEn     = miC('substitution_note_en');
const cSubTe     = miC('substitution_note_te');
const cSubTa     = miC('substitution_note_ta');
const cSubHi     = miC('substitution_note_hi');

if ([cSubTe, cSubTa, cSubHi].includes(-1)) {
  console.error('❌ Missing substitution_note_te/ta/hi columns — run add-localized-quantity-notes-columns.mjs first');
  process.exit(1);
}

for (const [slug, data] of Object.entries(notesData)) {
  for (const note of (data.material_items_notes || [])) {
    const rowIdx = miRows.findIndex(r =>
      (r[cGroupSlug] ?? '') === note.group_slug &&
      (r[cSubEn]     ?? '').trim() === note.substitution_note_en.trim()
    );
    if (rowIdx === -1) {
      console.warn(`  ⚠️  No match: ${note.group_slug} substitution_note_en="${note.substitution_note_en.slice(0, 55)}"`);
      noMatch++;
      continue;
    }
    const sheetRow = rowIdx + 2;
    const r = miRows[rowIdx];
    const pairs = [
      [cSubTe, note.substitution_note_te],
      [cSubTa, note.substitution_note_ta],
      [cSubHi, note.substitution_note_hi],
    ];
    let wrote = false;
    for (const [col, val] of pairs) {
      if (!(r[col] ?? '').trim()) {
        updates.push({ range: `material_items!${colLetter(col)}${sheetRow}`, values: [[val]] });
        wrote = true;
      }
    }
    if (wrote) {
      console.log(`  ✓ ${note.group_slug} item "${note.substitution_note_en.slice(0, 45)}" → row ${sheetRow}`);
      matched++;
    } else {
      console.log(`  – ${note.group_slug} item "${note.substitution_note_en.slice(0, 45)}" already filled`);
      skipped++;
    }
  }
}

// ── pujas (regional_variation_notes) ────────────────────────────────────────
console.log('\n── pujas (regional_variation_notes) ──');
const { headers: pujaH, rows: pujaRows } = await fetchTab('pujas');
const pujaC = n => pujaH.indexOf(n);

const cPujaSlug = pujaC('slug');
const cRegEn    = pujaC('regional_variation_notes_en');
const cRegTe    = pujaC('regional_variation_notes_te');
const cRegTa    = pujaC('regional_variation_notes_ta');
const cRegHi    = pujaC('regional_variation_notes_hi');

if ([cRegTe, cRegTa, cRegHi].includes(-1)) {
  console.error('❌ Missing regional_variation_notes_te/ta/hi columns — run add-localized-quantity-notes-columns.mjs first');
  process.exit(1);
}

for (const [slug, data] of Object.entries(notesData)) {
  const reg = data.puja_regional_notes;
  if (!reg || !reg.regional_variation_notes_en) continue;

  const rowIdx = pujaRows.findIndex(r =>
    (r[cPujaSlug] ?? '') === reg.slug &&
    (r[cRegEn]    ?? '').trim() === reg.regional_variation_notes_en.trim()
  );
  if (rowIdx === -1) {
    console.warn(`  ⚠️  No match: slug=${reg.slug} regional_variation_notes_en="${reg.regional_variation_notes_en.slice(0, 55)}..."`);
    noMatch++;
    continue;
  }
  const sheetRow = rowIdx + 2;
  const r = pujaRows[rowIdx];
  const pairs = [
    [cRegTe, reg.regional_variation_notes_te],
    [cRegTa, reg.regional_variation_notes_ta],
    [cRegHi, reg.regional_variation_notes_hi],
  ];
  let wrote = false;
  for (const [col, val] of pairs) {
    if (!(r[col] ?? '').trim()) {
      updates.push({ range: `pujas!${colLetter(col)}${sheetRow}`, values: [[val]] });
      wrote = true;
    }
  }
  if (wrote) {
    console.log(`  ✓ ${reg.slug} regional_variation_notes → row ${sheetRow}`);
    matched++;
  } else {
    console.log(`  – ${reg.slug} regional_variation_notes already filled`);
    skipped++;
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n── Summary ──`);
console.log(`  matched: ${matched} rows | already filled: ${skipped} | no match: ${noMatch}`);
console.log(`  cells to write: ${updates.length}`);
console.log(`  mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);

if (updates.length && !WRITE) {
  console.log('\nSample updates (first 10):');
  updates.slice(0, 10).forEach(u =>
    console.log(`  ${u.range}: "${String(u.values[0][0]).slice(0, 70)}"`)
  );
  if (updates.length > 10) console.log(`  ... and ${updates.length - 10} more`);
  console.log('\nPass --write to apply.');
}

if (WRITE && updates.length) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates },
  });
  console.log('✓ applied');
} else if (WRITE && updates.length === 0) {
  console.log('Nothing to write — all cells already filled.');
}
