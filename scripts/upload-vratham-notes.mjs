/**
 * Uploads localized notes (notes_te/ta/hi, substitution_note_te/ta/hi) for vrathams.
 *
 * Reads research/<slug>-entity-notes.json for each slug.
 * Matches rows by (parent_slug + notes_en) for procedure_steps,
 *             and (group_slug + item_name_en + substitution_note_en) for material_items.
 * FILL EMPTY TARGET CELLS ONLY — never clobbers non-empty values.
 * SEQUENTIAL: each Sheets update is awaited before the next — no concurrent writes.
 *
 * Usage:
 *   node scripts/upload-vratham-notes.mjs                     (dry run, all slugs)
 *   node scripts/upload-vratham-notes.mjs --slug=<slug>       (dry run, one slug)
 *   node scripts/upload-vratham-notes.mjs --write             (apply, all slugs)
 *   node scripts/upload-vratham-notes.mjs --slug=<slug> --write
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const slugArg = process.argv.find(a => a.startsWith('--slug='));

const ALL_SLUGS = [
  'satyanarayana-vratham',
  'varalakshmi-vratham',
  'ekadashi-vratham',
  'pradosha-vratham',
  'mondays-shiva-vratham',
  'karwa-chauth',
  'maha-shivaratri',
  'santoshi-mata',
  'kedareswara-vratham',
];

const SLUGS = slugArg ? [slugArg.replace('--slug=', '')] : ALL_SLUGS;

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

function colLetter(i) {
  let s = '';
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

async function fetchTab(tab) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A:ZZ`,
  });
  const [headers, ...rows] = res.data.values || [];
  return { headers, rows };
}

console.log(`\n══ upload-vratham-notes.mjs ${'═'.repeat(40)}`);
console.log(`Mode  : ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Slugs : ${SLUGS.join(', ')}`);

const [stepsTab, matsTab] = await Promise.all([
  fetchTab('procedure_steps'),
  fetchTab('material_items'),
]);

const { headers: stepsHeaders, rows: stepsRows } = stepsTab;
const { headers: matsHeaders, rows: matsRows } = matsTab;

const stepsCol = name => stepsHeaders.indexOf(name);
const matsCol  = name => matsHeaders.indexOf(name);

for (const col of ['notes_en', 'notes_te', 'notes_ta', 'notes_hi', 'parent_slug']) {
  if (stepsCol(col) === -1) {
    console.error(`ERROR: procedure_steps missing column '${col}'`);
    process.exit(1);
  }
}
for (const col of ['substitution_note_en', 'substitution_note_te', 'substitution_note_ta', 'substitution_note_hi', 'group_slug', 'item_name_en']) {
  if (matsCol(col) === -1) {
    console.error(`ERROR: material_items missing column '${col}'`);
    process.exit(1);
  }
}

let totalPatches = 0;
let totalSkipped = 0;

for (const slug of SLUGS) {
  const researchPath = resolve(__dirname, `../research/${slug}-entity-notes.json`);
  if (!existsSync(researchPath)) {
    console.log(`\n── ${slug}: no research file — skip`);
    continue;
  }

  const data = JSON.parse(readFileSync(researchPath, 'utf8'));
  const stepNotes = data.procedure_steps_notes || [];
  const matNotes = data.material_items_notes || [];

  console.log(`\n── ${slug} (${stepNotes.length} step notes, ${matNotes.length} material notes) ──`);

  // procedure_steps
  for (const note of stepNotes) {
    if (!note.notes_en) continue;

    const rowIdx = stepsRows.findIndex(r =>
      r[stepsCol('parent_slug')] === note.parent_slug &&
      r[stepsCol('notes_en')] === note.notes_en
    );
    if (rowIdx === -1) {
      console.log(`  ⚠ NOT FOUND: procedure_steps[${note.parent_slug}] step ${note.step_number} notes_en="${note.notes_en.substring(0, 60)}"`);
      continue;
    }

    const sheetRow = rowIdx + 2;
    const row = stepsRows[rowIdx];

    for (const lang of ['te', 'ta', 'hi']) {
      const colName = `notes_${lang}`;
      const colIdx = stepsCol(colName);
      const currentVal = (row[colIdx] ?? '').trim();
      const newVal = note[colName];

      if (!newVal) {
        console.log(`  SKIP  step ${note.step_number} ${colName}: no translation in JSON`);
        continue;
      }
      if (currentVal) {
        console.log(`  SKIP  step ${note.step_number} ${colName}: already filled ("${currentVal.substring(0, 40)}")`);
        totalSkipped++;
        continue;
      }

      const a1 = `procedure_steps!${colLetter(colIdx)}${sheetRow}`;
      console.log(`  PATCH step ${note.step_number} ${colName} → ${a1}: "${newVal.substring(0, 60)}"`);
      totalPatches++;

      if (WRITE) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: a1,
          valueInputOption: 'RAW',
          requestBody: { values: [[newVal]] },
        });
        console.log(`    ✓ written`);
      }
    }
  }

  // material_items
  for (const note of matNotes) {
    if (!note.substitution_note_en) continue;

    const rowIdx = matsRows.findIndex(r =>
      r[matsCol('group_slug')] === note.group_slug &&
      r[matsCol('item_name_en')] === note.item_name_en &&
      r[matsCol('substitution_note_en')] === note.substitution_note_en
    );
    if (rowIdx === -1) {
      console.log(`  ⚠ NOT FOUND: material_items[${note.group_slug}] "${note.item_name_en}" sub_en="${note.substitution_note_en.substring(0, 60)}"`);
      continue;
    }

    const sheetRow = rowIdx + 2;
    const row = matsRows[rowIdx];

    for (const lang of ['te', 'ta', 'hi']) {
      const colName = `substitution_note_${lang}`;
      const colIdx = matsCol(colName);
      const currentVal = (row[colIdx] ?? '').trim();
      const newVal = note[colName];

      if (!newVal) {
        console.log(`  SKIP  mat "${note.item_name_en}" ${colName}: no translation in JSON`);
        continue;
      }
      if (currentVal) {
        console.log(`  SKIP  mat "${note.item_name_en}" ${colName}: already filled ("${currentVal.substring(0, 40)}")`);
        totalSkipped++;
        continue;
      }

      const a1 = `material_items!${colLetter(colIdx)}${sheetRow}`;
      console.log(`  PATCH mat "${note.item_name_en}" ${colName} → ${a1}: "${newVal.substring(0, 60)}"`);
      totalPatches++;

      if (WRITE) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: a1,
          valueInputOption: 'RAW',
          requestBody: { values: [[newVal]] },
        });
        console.log(`    ✓ written`);
      }
    }
  }
}

console.log(`\n══ Summary ${'═'.repeat(50)}`);
console.log(`Patches: ${totalPatches} | Already filled (skipped): ${totalSkipped}`);
if (!WRITE) {
  console.log(`\nDry run — pass --write to apply ${totalPatches} patch(es).`);
} else {
  console.log(`\n✓ Done.`);
}
