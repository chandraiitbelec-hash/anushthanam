/**
 * Read-only: dumps procedure_steps notes_en and material_items substitution_note_en
 * for the target festival slugs so we can see what needs translating.
 * Usage: node scripts/read-festival-notes.mjs
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SLUGS = new Set([
  'ganesh-chaturthi','maha-shivaratri','navaratri','diwali',
  'krishna-janmashtami','rama-navami','hanuman-jayanti','saraswati-puja',
  'ugadi','makar-sankranti','pongal','vijayadashami',
]);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

// ── procedure_steps ───────────────────────────────────────────────────────────
{
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' });
  const [headers, ...rows] = res.data.values ?? [[]];
  console.log('\n=== procedure_steps headers ===');
  console.log(headers.join(' | '));

  const c = n => headers.indexOf(n);
  const cSlug = c('parent_slug'), cType = c('parent_type'), cStep = c('step_number');
  const cNEn = c('notes_en'), cNTe = c('notes_te'), cNTa = c('notes_ta'), cNHi = c('notes_hi');

  console.log(`\nnotes_en col index: ${cNEn}, notes_te: ${cNTe}, notes_ta: ${cNTa}, notes_hi: ${cNHi}`);
  console.log('\n--- procedure_steps with non-empty notes_en for target festivals ---');
  rows.forEach((r, i) => {
    if ((r[cType] ?? '') !== 'festival') return;
    if (!SLUGS.has(r[cSlug] ?? '')) return;
    const notesEn = (r[cNEn] ?? '').trim();
    if (!notesEn) return;
    const notesTE = (r[cNTe] ?? '').trim();
    const notesTA = (r[cNTa] ?? '').trim();
    const notesHI = (r[cNHi] ?? '').trim();
    console.log(`Row ${i+2}: [${r[cSlug]}] step ${r[cStep]}`);
    console.log(`  notes_en: ${notesEn}`);
    console.log(`  notes_te: ${notesTE || '(EMPTY)'}`);
    console.log(`  notes_ta: ${notesTA || '(EMPTY)'}`);
    console.log(`  notes_hi: ${notesHI || '(EMPTY)'}`);
  });
}

// ── material_items ────────────────────────────────────────────────────────────
{
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'material_items!A:ZZ' });
  const [headers, ...rows] = res.data.values ?? [[]];
  console.log('\n\n=== material_items headers ===');
  console.log(headers.join(' | '));

  const c = n => headers.indexOf(n);
  const cGroup = c('group_slug'), cOrder = c('item_order'), cNameEn = c('item_name_en');
  const cSNEn = c('substitution_note_en'), cSNTe = c('substitution_note_te'), cSNTa = c('substitution_note_ta'), cSNHi = c('substitution_note_hi');

  console.log(`\nsubstitution_note_en col index: ${cSNEn}, _te: ${cSNTe}, _ta: ${cSNTa}, _hi: ${cSNHi}`);
  console.log('\n--- material_items with non-empty substitution_note_en for target festivals ---');
  rows.forEach((r, i) => {
    if (!SLUGS.has(r[cGroup] ?? '')) return;
    const snEn = (r[cSNEn] ?? '').trim();
    if (!snEn) return;
    const snTE = (r[cSNTe] ?? '').trim();
    const snTA = (r[cSNTa] ?? '').trim();
    const snHI = (r[cSNHi] ?? '').trim();
    console.log(`Row ${i+2}: [${r[cGroup]}] item_order=${r[cOrder]} ${r[cNameEn]}`);
    console.log(`  substitution_note_en: ${snEn}`);
    console.log(`  substitution_note_te: ${snTE || '(EMPTY)'}`);
    console.log(`  substitution_note_ta: ${snTA || '(EMPTY)'}`);
    console.log(`  substitution_note_hi: ${snHI || '(EMPTY)'}`);
  });
}
