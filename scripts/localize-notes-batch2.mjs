/**
 * Writes te/ta/hi notes translations to Google Sheets for batch-2 pujas:
 *   navagraha-puja, vastu-puja, gauri-puja, kubera-puja
 *
 * Reads from research/<slug>-notes.json. Only fills empty target cells.
 * Usage: node scripts/localize-notes-batch2.mjs [--write]
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });
const WRITE = process.argv.includes('--write');

const SLUGS = ['navagraha-puja', 'vastu-puja', 'gauri-puja', 'kubera-puja'];

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

// Convert 0-based column index to A1 letter(s)
const colLetter = i => {
  let s = ''; i += 1;
  while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
  return s;
};

// Fetch a full sheet tab with dynamic headers
async function fetchTab(tabName) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${tabName}!A:ZZ` });
  const [headers, ...rows] = res.data.values ?? [[]];
  const c = name => headers.indexOf(name);
  return { headers, rows, c, tabName };
}

// Collect batchUpdate entries: only write if current cell is blank/undefined
function planUpdate(tab, rowIndex, colIdx, value, updates) {
  if (!value || value.trim() === '') return;
  const sheetRow = rowIndex + 2; // +1 for header row, +1 for 1-based
  const a1 = `${tab.tabName}!${colLetter(colIdx)}${sheetRow}`;
  updates.push({ range: a1, value, rowInfo: `row ${sheetRow} col ${colLetter(colIdx)}` });
}

// ---------- procedure_steps ----------
const steps = await fetchTab('procedure_steps');
const { c: sc } = steps;
const sSlug = sc('parent_slug'), sType = sc('parent_type'), sStep = sc('step_number');
const sNoteEn = sc('notes_en'), sNoteTe = sc('notes_te'), sNoteTa = sc('notes_ta'), sNoteHi = sc('notes_hi');

if ([sNoteEn, sNoteTe, sNoteTa, sNoteHi].some(i => i === -1)) {
  throw new Error('procedure_steps missing notes_en/te/ta/hi columns — did add-localized-quantity-notes-columns.mjs run?');
}

const stepUpdates = [];
const stepCount = { total: 0 };

for (const slug of SLUGS) {
  const json = JSON.parse(readFileSync(resolve(__dirname, `../research/${slug}-notes.json`), 'utf8'));
  const byStep = Object.fromEntries((json.procedure_steps_notes ?? []).map(n => [String(n.step_number), n]));

  steps.rows.forEach((r, idx) => {
    if ((r[sType] ?? '') !== 'puja') return;
    if ((r[sSlug] ?? '') !== slug) return;
    const stepNum = String(r[sStep] ?? '');
    const note = byStep[stepNum];
    if (!note) return;
    const currentEn = r[sNoteEn] ?? '';
    if (!currentEn.trim()) return; // nothing to translate (blank or removed)

    let wrote = 0;
    if (!(r[sNoteTe] ?? '').trim()) { planUpdate(steps, idx, sNoteTe, note.notes_te, stepUpdates); wrote++; }
    if (!(r[sNoteTa] ?? '').trim()) { planUpdate(steps, idx, sNoteTa, note.notes_ta, stepUpdates); wrote++; }
    if (!(r[sNoteHi] ?? '').trim()) { planUpdate(steps, idx, sNoteHi, note.notes_hi, stepUpdates); wrote++; }
    if (wrote > 0) stepCount.total += 1;
  });
}

// ---------- material_items ----------
const mats = await fetchTab('material_items');
const { c: mc } = mats;
const mGroup = mc('group_slug'), mOrder = mc('item_order');
const mSubEn = mc('substitution_note_en'), mSubTe = mc('substitution_note_te');
const mSubTa = mc('substitution_note_ta'), mSubHi = mc('substitution_note_hi');

if ([mSubEn, mSubTe, mSubTa, mSubHi].some(i => i === -1)) {
  throw new Error('material_items missing substitution_note_en/te/ta/hi columns — did add-localized-quantity-notes-columns.mjs run?');
}

const matUpdates = [];
const matCount = { total: 0 };

// We need to know each puja's materials_group_slug — fetch from pujas tab
const pujaTab = await fetchTab('pujas');
const { c: pc } = pujaTab;
const pSlug = pc('slug'), pMatGroup = pc('materials_group_slug');

const groupByPuja = {};
pujaTab.rows.forEach(r => {
  if (SLUGS.includes(r[pSlug] ?? '')) {
    groupByPuja[r[pSlug]] = r[pMatGroup] ?? r[pSlug]; // fallback to slug itself
  }
});

for (const slug of SLUGS) {
  const matGroup = groupByPuja[slug];
  if (!matGroup) { console.warn(`⚠️  No materials_group_slug for ${slug} — skipping materials`); continue; }

  const json = JSON.parse(readFileSync(resolve(__dirname, `../research/${slug}-notes.json`), 'utf8'));
  const byOrder = Object.fromEntries((json.material_substitution_notes ?? []).map(n => [String(n.item_order), n]));

  mats.rows.forEach((r, idx) => {
    if ((r[mGroup] ?? '') !== matGroup) return;
    const order = String(r[mOrder] ?? '');
    const note = byOrder[order];
    if (!note) return;
    const currentEn = r[mSubEn] ?? '';
    if (!currentEn.trim()) return;

    let wrote = 0;
    if (!(r[mSubTe] ?? '').trim()) { planUpdate(mats, idx, mSubTe, note.substitution_note_te, matUpdates); wrote++; }
    if (!(r[mSubTa] ?? '').trim()) { planUpdate(mats, idx, mSubTa, note.substitution_note_ta, matUpdates); wrote++; }
    if (!(r[mSubHi] ?? '').trim()) { planUpdate(mats, idx, mSubHi, note.substitution_note_hi, matUpdates); wrote++; }
    if (wrote > 0) matCount.total += 1;
  });
}

// ---------- pujas regional_variation_notes ----------
const pRvnEn = pc('regional_variation_notes_en');
const pRvnTe = pc('regional_variation_notes_te');
const pRvnTa = pc('regional_variation_notes_ta');
const pRvnHi = pc('regional_variation_notes_hi');

if ([pRvnEn, pRvnTe, pRvnTa, pRvnHi].some(i => i === -1)) {
  throw new Error('pujas missing regional_variation_notes_en/te/ta/hi columns — did add-localized-quantity-notes-columns.mjs run?');
}

const rvnUpdates = [];
const rvnCount = { total: 0 };

pujaTab.rows.forEach((r, idx) => {
  const slug = r[pSlug] ?? '';
  if (!SLUGS.includes(slug)) return;
  const currentEn = r[pRvnEn] ?? '';
  if (!currentEn.trim()) return;

  let json;
  try {
    json = JSON.parse(readFileSync(resolve(__dirname, `../research/${slug}-notes.json`), 'utf8'));
  } catch { return; }

  const rvn = json.regional_variation_notes ?? {};
  let wrote = 0;
  if (!(r[pRvnTe] ?? '').trim()) { planUpdate(pujaTab, idx, pRvnTe, rvn.regional_variation_notes_te, rvnUpdates); wrote++; }
  if (!(r[pRvnTa] ?? '').trim()) { planUpdate(pujaTab, idx, pRvnTa, rvn.regional_variation_notes_ta, rvnUpdates); wrote++; }
  if (!(r[pRvnHi] ?? '').trim()) { planUpdate(pujaTab, idx, pRvnHi, rvn.regional_variation_notes_hi, rvnUpdates); wrote++; }
  if (wrote > 0) rvnCount.total += 1;
});

// ---------- Summary & apply ----------
console.log(`\nMode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);
console.log(`\nprocedure_steps notes:`);
console.log(`  ${stepCount.total} steps with translations → ${stepUpdates.length} cell writes`);
for (const u of stepUpdates) console.log(`    ${u.range}`);

console.log(`\nmaterial_items substitution_notes:`);
console.log(`  ${matCount.total} items with translations → ${matUpdates.length} cell writes`);
for (const u of matUpdates) console.log(`    ${u.range}`);

console.log(`\npujas regional_variation_notes:`);
console.log(`  ${rvnCount.total} pujas with translations → ${rvnUpdates.length} cell writes`);
for (const u of rvnUpdates) console.log(`    ${u.range}`);

const allUpdates = [...stepUpdates, ...matUpdates, ...rvnUpdates];
console.log(`\nTotal cell writes: ${allUpdates.length}`);

if (WRITE && allUpdates.length) {
  const batchData = allUpdates.map(u => ({ range: u.range, values: [[u.value]] }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: batchData },
  });
  console.log('\n✓ Applied to sheet');
} else if (!WRITE) {
  console.log('\nDry run — pass --write to apply.');
}
