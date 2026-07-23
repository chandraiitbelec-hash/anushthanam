/**
 * Fills notes_te/ta/hi in procedure_steps, substitution_note_te/ta/hi in material_items,
 * and regional_variation_notes_te/ta/hi in pujas from research/<slug>-notes.json files.
 *
 * Safety:
 *   - Dry-run by default; pass --write to apply
 *   - Only fills EMPTY target cells (never clobbers existing values)
 *   - Matches rows by (parent_slug/group_slug/slug + normalized notes_en text)
 *   - Normalization: strips leading [FLAG…]/[NOTE] tags before comparing
 *
 * Usage:
 *   node scripts/upload-puja-notes-localization.mjs                       (dry run, all slugs)
 *   node scripts/upload-puja-notes-localization.mjs --slug=shiva-puja     (dry run, one slug)
 *   node scripts/upload-puja-notes-localization.mjs --write               (apply, all slugs)
 *   node scripts/upload-puja-notes-localization.mjs --slug=shiva-puja --write
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID as SHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WRITE = parseWriteFlag(process.argv);
const slugArg = process.argv.find(a => a.startsWith('--slug='));

// Batch 1 slugs owned by this script
const ALL_SLUGS = ['daily-home-puja', 'vinayaka-puja', 'shiva-puja', 'lakshmi-puja', 'vishnu-puja'];
const TARGET_SLUGS = slugArg ? [slugArg.replace('--slug=', '')] : ALL_SLUGS;

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Strip leading [FLAG…]/[NOTE] authoring tags and trim */
function normalize(str) {
  return (str || '').replace(/^\s*\[[^\]]+\]\s*/g, '').trim();
}

// ─── Load notes JSON files ────────────────────────────────────────────────────

const notesMap = {};
for (const slug of TARGET_SLUGS) {
  const p = resolve(__dirname, `../research/${slug}-notes.json`);
  if (!existsSync(p)) {
    console.warn(`⚠️  No notes file for ${slug} at ${p} — skipping`);
    continue;
  }
  notesMap[slug] = JSON.parse(readFileSync(p, 'utf8'));
}

if (!Object.keys(notesMap).length) {
  console.error('ERROR: No notes files found for any target slug');
  process.exit(1);
}

// ─── Sheet connection ─────────────────────────────────────────────────────────

const sheets = await getSheetsClient();

async function fetchSheet(tab) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${tab}!A:ZZ` });
  const [headers, ...rows] = res.data.values || [];
  return { headers: headers || [], rows };
}

// ─── Build lookup maps from notes files ──────────────────────────────────────

// procedure_steps: key = `${parent_slug}||${normalize(notes_en)}`
const stepNotes = {};   // key → {notes_te, notes_ta, notes_hi}
// material_items: key = `${group_slug}||${normalize(substitution_note_en)}`
const matNotes = {};    // key → {substitution_note_te, substitution_note_ta, substitution_note_hi}
// pujas: key = slug → {regional_variation_notes_en, regional_variation_notes_te, _ta, _hi}
const pujaRegional = {};

for (const [slug, data] of Object.entries(notesMap)) {
  for (const s of (data.procedure_steps || [])) {
    const en = normalize(s.notes_en);
    if (!en) continue;
    const key = `${slug}||${en}`;
    stepNotes[key] = { notes_te: s.notes_te || '', notes_ta: s.notes_ta || '', notes_hi: s.notes_hi || '' };
  }
  for (const m of (data.material_items || [])) {
    const en = normalize(m.substitution_note_en);
    if (!en) continue;
    const key = `${slug}||${en}`;
    matNotes[key] = {
      substitution_note_te: m.substitution_note_te || '',
      substitution_note_ta: m.substitution_note_ta || '',
      substitution_note_hi: m.substitution_note_hi || '',
    };
  }
  const pr = data.puja_row || {};
  if (pr.regional_variation_notes_te || pr.regional_variation_notes_ta || pr.regional_variation_notes_hi) {
    pujaRegional[slug] = {
      regional_variation_notes_en: pr.regional_variation_notes_en || '',
      regional_variation_notes_te: pr.regional_variation_notes_te || '',
      regional_variation_notes_ta: pr.regional_variation_notes_ta || '',
      regional_variation_notes_hi: pr.regional_variation_notes_hi || '',
    };
  }
}

console.log('\n══ upload-puja-notes-localization.mjs ══════════════════════════════');
console.log(`Mode:    ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Slugs:   ${TARGET_SLUGS.join(', ')}`);
console.log(`Step translation entries:     ${Object.keys(stepNotes).length}`);
console.log(`Material translation entries: ${Object.keys(matNotes).length}`);
console.log(`Puja regional entries:        ${Object.keys(pujaRegional).length}`);

const allUpdates = [];

// ─── procedure_steps ─────────────────────────────────────────────────────────

{
  const { headers, rows } = await fetchSheet('procedure_steps');
  const c = name => headers.indexOf(name);
  const cSlug = c('parent_slug'), cType = c('parent_type'), cNotesEn = c('notes_en');
  const cNotesTe = c('notes_te'), cNotesTa = c('notes_ta'), cNotesHi = c('notes_hi');

  if (cNotesEn === -1) { console.error('ERROR: notes_en column not found in procedure_steps'); process.exit(1); }
  if (cNotesTe === -1 || cNotesTa === -1 || cNotesHi === -1) {
    console.error('ERROR: notes_te/ta/hi columns not found in procedure_steps. Run add-localized-quantity-notes-columns.mjs --write first.');
    process.exit(1);
  }

  let matched = 0, skipped = 0, unfound = 0;
  console.log('\n── procedure_steps ──────────────────────────────────────────────');

  rows.forEach((row, idx) => {
    const slug = row[cSlug] || '';
    if (!TARGET_SLUGS.includes(slug)) return;
    if ((row[cType] || '') !== 'puja') return;
    const notesEn = normalize(row[cNotesEn]);
    if (!notesEn) return;

    const key = `${slug}||${notesEn}`;
    const trans = stepNotes[key];
    if (!trans) { unfound++; console.log(`  ⚠️  No translation found for ${slug} step notes: "${notesEn.substring(0, 60)}..."`); return; }

    const sheetRow = idx + 2;
    const updates = [];
    if (!(row[cNotesTe] || '').trim() && trans.notes_te) updates.push({ col: cNotesTe, val: trans.notes_te, field: 'notes_te' });
    if (!(row[cNotesTa] || '').trim() && trans.notes_ta) updates.push({ col: cNotesTa, val: trans.notes_ta, field: 'notes_ta' });
    if (!(row[cNotesHi] || '').trim() && trans.notes_hi) updates.push({ col: cNotesHi, val: trans.notes_hi, field: 'notes_hi' });

    if (updates.length === 0) { skipped++; return; }
    matched++;
    for (const u of updates) {
      const range = `procedure_steps!${colLetter(u.col)}${sheetRow}`;
      console.log(`  FILL ${slug} (row ${sheetRow}) ${u.field}: "${u.val.substring(0, 55)}..."`);
      allUpdates.push({ range, values: [[u.val]] });
    }
  });

  console.log(`  → ${matched} rows to fill, ${skipped} already localized, ${unfound} unmatched`);
}

// ─── material_items ───────────────────────────────────────────────────────────

{
  const { headers, rows } = await fetchSheet('material_items');
  const c = name => headers.indexOf(name);
  const cGroup = c('group_slug'), cSubEn = c('substitution_note_en');
  const cSubTe = c('substitution_note_te'), cSubTa = c('substitution_note_ta'), cSubHi = c('substitution_note_hi');

  if (cSubEn === -1) { console.error('ERROR: substitution_note_en column not found in material_items'); process.exit(1); }
  if (cSubTe === -1 || cSubTa === -1 || cSubHi === -1) {
    console.error('ERROR: substitution_note_te/ta/hi columns not found in material_items. Run add-localized-quantity-notes-columns.mjs --write first.');
    process.exit(1);
  }

  let matched = 0, skipped = 0, unfound = 0;
  console.log('\n── material_items ───────────────────────────────────────────────');

  rows.forEach((row, idx) => {
    const group = row[cGroup] || '';
    if (!TARGET_SLUGS.includes(group)) return;
    const subEn = normalize(row[cSubEn]);
    if (!subEn) return;

    const key = `${group}||${subEn}`;
    const trans = matNotes[key];
    if (!trans) { unfound++; console.log(`  ⚠️  No translation for ${group} substitution_note: "${subEn.substring(0, 60)}..."`); return; }

    const sheetRow = idx + 2;
    const updates = [];
    if (!(row[cSubTe] || '').trim() && trans.substitution_note_te) updates.push({ col: cSubTe, val: trans.substitution_note_te, field: 'sub_te' });
    if (!(row[cSubTa] || '').trim() && trans.substitution_note_ta) updates.push({ col: cSubTa, val: trans.substitution_note_ta, field: 'sub_ta' });
    if (!(row[cSubHi] || '').trim() && trans.substitution_note_hi) updates.push({ col: cSubHi, val: trans.substitution_note_hi, field: 'sub_hi' });

    if (updates.length === 0) { skipped++; return; }
    matched++;
    for (const u of updates) {
      const range = `material_items!${colLetter(u.col)}${sheetRow}`;
      console.log(`  FILL ${group} (row ${sheetRow}) ${u.field}: "${u.val.substring(0, 55)}..."`);
      allUpdates.push({ range, values: [[u.val]] });
    }
  });

  console.log(`  → ${matched} rows to fill, ${skipped} already localized, ${unfound} unmatched`);
}

// ─── pujas (regional_variation_notes) ────────────────────────────────────────

{
  const { headers, rows } = await fetchSheet('pujas');
  const c = name => headers.indexOf(name);
  const cSlug = c('slug'), cRegEn = c('regional_variation_notes_en');
  const cRegTe = c('regional_variation_notes_te'), cRegTa = c('regional_variation_notes_ta'), cRegHi = c('regional_variation_notes_hi');

  if (cRegEn === -1) { console.warn('⚠️  regional_variation_notes_en not found in pujas — skipping puja regional notes'); }
  else {
    let matched = 0, skipped = 0;
    console.log('\n── pujas (regional_variation_notes) ─────────────────────────────');

    rows.forEach((row, idx) => {
      const slug = row[cSlug] || '';
      if (!TARGET_SLUGS.includes(slug)) return;
      const trans = pujaRegional[slug];
      if (!trans) return;

      const regEn = normalize(row[cRegEn]);
      if (!regEn) return;

      const sheetRow = idx + 2;
      const updates = [];
      if (cRegTe !== -1 && !(row[cRegTe] || '').trim() && trans.regional_variation_notes_te)
        updates.push({ col: cRegTe, val: trans.regional_variation_notes_te, field: 'reg_te' });
      if (cRegTa !== -1 && !(row[cRegTa] || '').trim() && trans.regional_variation_notes_ta)
        updates.push({ col: cRegTa, val: trans.regional_variation_notes_ta, field: 'reg_ta' });
      if (cRegHi !== -1 && !(row[cRegHi] || '').trim() && trans.regional_variation_notes_hi)
        updates.push({ col: cRegHi, val: trans.regional_variation_notes_hi, field: 'reg_hi' });

      if (updates.length === 0) { skipped++; return; }
      matched++;
      for (const u of updates) {
        const range = `pujas!${colLetter(u.col)}${sheetRow}`;
        console.log(`  FILL ${slug} (row ${sheetRow}) ${u.field}: "${u.val.substring(0, 55)}..."`);
        allUpdates.push({ range, values: [[u.val]] });
      }
    });

    console.log(`  → ${matched} rows to fill, ${skipped} already localized`);
  }
}

// ─── Summary and apply ────────────────────────────────────────────────────────

console.log(`\nTotal cell updates planned: ${allUpdates.length}`);
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);

if (!WRITE) {
  console.log('\nDry run complete — pass --write to apply.');
  process.exit(0);
}

if (allUpdates.length === 0) {
  console.log('\nNothing to update — all cells already filled or no translations available.');
  process.exit(0);
}

// batchUpdate in chunks of 500
const CHUNK = 500;
let applied = 0;
for (let i = 0; i < allUpdates.length; i += CHUNK) {
  const batch = allUpdates.slice(i, i + CHUNK);
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: batch },
  });
  applied += batch.length;
  console.log(`  ✓ Applied ${applied}/${allUpdates.length} updates`);
}

console.log('\n✅ Done.');
