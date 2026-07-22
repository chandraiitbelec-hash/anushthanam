/**
 * Uploads localized notes_te/ta/hi (procedure_steps) and
 * substitution_note_te/ta/hi (material_items) for a set of vrathams.
 *
 * Reads from: research/<slug>-entity-notes.json
 * Writes to:  procedure_steps (notes_te/ta/hi), material_items (substitution_note_te/ta/hi)
 *
 * Safety:
 *   - FILL EMPTY CELLS ONLY — never clobbers non-empty te/ta/hi values
 *   - Matches procedure_steps rows by (parent_slug + step_number)
 *   - Matches material_items rows by (group_slug + item_order)
 *   - Sequential updates: each Sheets API call is awaited before the next
 *   - Dry-run by default; pass --write to apply
 *
 * Usage:
 *   node scripts/upload-vratham-entity-notes.mjs --slug=dhanurmasa-vratam          (dry run)
 *   node scripts/upload-vratham-entity-notes.mjs --slug=dhanurmasa-vratam --write  (apply)
 *   node scripts/upload-vratham-entity-notes.mjs --all                              (dry run all)
 *   node scripts/upload-vratham-entity-notes.mjs --all --write                      (apply all)
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const ALL = process.argv.includes('--all');
const slugArg = process.argv.find(a => a.startsWith('--slug='));

const MY_SLUGS = [
  'mangala-gauri-vratham',
  'hartalika-teej',
  'vaibhav-lakshmi-vrat',
  'skanda-sashti-vratham',
  'chhath-puja',
  'sankashti-chaturthi-vratham',
  'savitri-vratham',
  'dhanurmasa-vratam',
];

let SLUGS;
if (ALL) {
  SLUGS = MY_SLUGS;
} else if (slugArg) {
  const s = slugArg.replace('--slug=', '');
  if (!MY_SLUGS.includes(s)) {
    console.error(`ERROR: '${s}' is not in the managed slug list.`);
    console.error(`Valid slugs: ${MY_SLUGS.join(', ')}`);
    process.exit(1);
  }
  SLUGS = [s];
} else {
  console.error('ERROR: pass --slug=<slug> or --all');
  process.exit(1);
}

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

// ─── Read both tabs once ──────────────────────────────────────────────────────

console.log('\n══ upload-vratham-entity-notes.mjs ══════════════════════════════');
console.log(`Mode:  ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Slugs: ${SLUGS.join(', ')}`);

const psRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' });
const [psHeaders, ...psRows] = psRes.data.values || [[]];
const psc = n => psHeaders.indexOf(n);

const miRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'material_items!A:ZZ' });
const [miHeaders, ...miRows] = miRes.data.values || [[]];
const mic = n => miHeaders.indexOf(n);

// Verify required columns exist
for (const col of ['notes_te', 'notes_ta', 'notes_hi']) {
  if (psc(col) === -1) { console.error(`ERROR: procedure_steps missing column '${col}'`); process.exit(1); }
}
for (const col of ['substitution_note_te', 'substitution_note_ta', 'substitution_note_hi']) {
  if (mic(col) === -1) { console.error(`ERROR: material_items missing column '${col}'`); process.exit(1); }
}

// ─── Process each slug ────────────────────────────────────────────────────────

let totalStepsFilled = 0;
let totalMatsFilled = 0;
const report = {};

for (const slug of SLUGS) {
  const notesPath = resolve(__dirname, `../research/${slug}-entity-notes.json`);
  if (!existsSync(notesPath)) {
    console.log(`\n── ${slug}: no research file found — skip`);
    report[slug] = { steps_filled: 0, mats_filled: 0, skipped: 'no research file' };
    continue;
  }

  const content = JSON.parse(readFileSync(notesPath, 'utf8'));
  const stepNotes = content.procedure_steps_notes || [];
  const matNotes = content.material_items_notes || [];

  console.log(`\n── ${slug} ──────────────────────────────────────`);
  console.log(`  Research file: ${stepNotes.length} step notes, ${matNotes.length} material notes`);

  let stepsFilled = 0;
  let matsFilled = 0;

  // ── Procedure steps ─────────────────────────────────────────────────────────
  for (const entry of stepNotes) {
    if (!entry.notes_en) continue;

    // Find matching row by parent_slug + step_number
    const rowIdx = psRows.findIndex(r =>
      (r[psc('parent_slug')] ?? '') === entry.parent_slug &&
      String(r[psc('step_number')] ?? '') === String(entry.step_number)
    );

    if (rowIdx === -1) {
      console.log(`  ⚠ procedure_steps: no row for ${entry.parent_slug} step ${entry.step_number}`);
      continue;
    }

    const sheetRow = rowIdx + 2;
    const r = psRows[rowIdx];

    // Verify notes_en matches (sanity check)
    const sheetNotesEn = (r[psc('notes_en')] ?? '').trim();
    const fileNotesEn = entry.notes_en.trim();
    if (sheetNotesEn !== fileNotesEn) {
      console.log(`  ⚠ MISMATCH step ${entry.step_number} — notes_en differs:`);
      console.log(`     sheet: ${sheetNotesEn.slice(0, 80)}`);
      console.log(`     file:  ${fileNotesEn.slice(0, 80)}`);
      continue;
    }

    const teCol = psc('notes_te');
    const taCol = psc('notes_ta');
    const hiCol = psc('notes_hi');

    const fills = [
      { col: teCol, key: 'notes_te', lang: 'te' },
      { col: taCol, key: 'notes_ta', lang: 'ta' },
      { col: hiCol, key: 'notes_hi', lang: 'hi' },
    ];

    for (const f of fills) {
      const current = (r[f.col] ?? '').trim();
      const desired = (entry[f.key] ?? '').trim();
      if (!desired) { console.log(`  SKIP step ${entry.step_number} ${f.lang} — no translation in file`); continue; }
      if (current) { console.log(`  SKIP step ${entry.step_number} ${f.lang} — already filled: "${current.slice(0, 40)}"`); continue; }

      console.log(`  FILL step ${entry.step_number} ${f.lang} → "${desired.slice(0, 60)}"`);
      stepsFilled++;

      if (WRITE) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `procedure_steps!${colLetter(f.col)}${sheetRow}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[desired]] },
        });
        console.log(`    ✓ written`);
      }
    }
  }

  // ── Material items ──────────────────────────────────────────────────────────
  for (const entry of matNotes) {
    if (!entry.substitution_note_en) continue;

    // Find matching row by group_slug + item_order
    const rowIdx = miRows.findIndex(r =>
      (r[mic('group_slug')] ?? '') === entry.group_slug &&
      String(r[mic('item_order')] ?? '') === String(entry.item_order)
    );

    if (rowIdx === -1) {
      console.log(`  ⚠ material_items: no row for group ${entry.group_slug} item_order ${entry.item_order}`);
      continue;
    }

    const sheetRow = rowIdx + 2;
    const r = miRows[rowIdx];

    // Verify substitution_note_en matches
    const sheetSubEn = (r[mic('substitution_note_en')] ?? '').trim();
    const fileSubEn = entry.substitution_note_en.trim();
    if (sheetSubEn !== fileSubEn) {
      console.log(`  ⚠ MISMATCH item_order ${entry.item_order} group ${entry.group_slug} — substitution_note_en differs:`);
      console.log(`     sheet: ${sheetSubEn.slice(0, 80)}`);
      console.log(`     file:  ${fileSubEn.slice(0, 80)}`);
      continue;
    }

    const teCol = mic('substitution_note_te');
    const taCol = mic('substitution_note_ta');
    const hiCol = mic('substitution_note_hi');

    const fills = [
      { col: teCol, key: 'substitution_note_te', lang: 'te' },
      { col: taCol, key: 'substitution_note_ta', lang: 'ta' },
      { col: hiCol, key: 'substitution_note_hi', lang: 'hi' },
    ];

    for (const f of fills) {
      const current = (r[f.col] ?? '').trim();
      const desired = (entry[f.key] ?? '').trim();
      if (!desired) { console.log(`  SKIP item ${entry.item_order} ${f.lang} — no translation in file`); continue; }
      if (current) { console.log(`  SKIP item ${entry.item_order} ${f.lang} — already filled: "${current.slice(0, 40)}"`); continue; }

      console.log(`  FILL item ${entry.item_order} ${f.lang} (${entry.item_name_en}) → "${desired.slice(0, 60)}"`);
      matsFilled++;

      if (WRITE) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `material_items!${colLetter(f.col)}${sheetRow}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[desired]] },
        });
        console.log(`    ✓ written`);
      }
    }
  }

  totalStepsFilled += stepsFilled;
  totalMatsFilled += matsFilled;
  report[slug] = { steps_filled: stepsFilled, mats_filled: matsFilled };
  console.log(`  → ${stepsFilled} step notes, ${matsFilled} material notes to fill`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n══ Summary ══════════════════════════════════════════════════════');
for (const slug of SLUGS) {
  const r = report[slug];
  if (!r) continue;
  if (r.skipped) {
    console.log(`  ${slug}: skipped (${r.skipped})`);
  } else {
    console.log(`  ${slug}: ${r.steps_filled} step note(s), ${r.mats_filled} material note(s) ${WRITE ? 'written' : 'to write'}`);
  }
}
console.log(`\n  Total: ${totalStepsFilled} step notes + ${totalMatsFilled} material notes`);
if (!WRITE) console.log('\n  Dry run complete. Pass --write to apply.');
else console.log('\n✅ Done.');
