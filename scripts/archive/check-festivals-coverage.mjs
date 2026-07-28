/**
 * Check festival tab and procedure_steps coverage for all target slugs.
 * Usage: node scripts/check-festivals-coverage.mjs
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

// Check festivals tab
const festRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'festivals!A:ZZ' });
const [festHeaders, ...festRows] = festRes.data.values ?? [[]];
const fc = n => festHeaders.indexOf(n);
const fSlug = fc('slug'), fMatGroup = fc('materials_group_slug');
console.log('\nFestivals tab (cols present): materials_group_slug col index =', fMatGroup);
for (const r of festRows) {
  const slug = r[fSlug] ?? '';
  if (SLUGS.has(slug)) {
    const matGroup = fMatGroup >= 0 ? (r[fMatGroup] ?? '') : '(col missing)';
    console.log(`  ${slug} → materials_group_slug="${matGroup}"`);
  }
}

// procedure_steps
const psRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' });
const [ph, ...prows] = psRes.data.values ?? [[]];
const pc = n => ph.indexOf(n);
const pSlug = pc('parent_slug'), pType = pc('parent_type'), pStep = pc('step_number'), pNEn = pc('notes_en');
const pNTe = pc('notes_te'), pNTa = pc('notes_ta'), pNHi = pc('notes_hi');

const found = {};
prows.forEach((r, i) => {
  if ((r[pType] ?? '') !== 'festival') return;
  const slug = r[pSlug] ?? '';
  if (!SLUGS.has(slug)) return;
  found[slug] = (found[slug] ?? 0) + 1;
  const nEn = (r[pNEn] ?? '').trim();
  if (nEn) console.log(`  [NOTES_EN] Row ${i+2}: [${slug}] step ${r[pStep]} → "${nEn.slice(0,80)}"`);
});
console.log('\nProcedure step counts per festival slug:');
for (const slug of SLUGS) {
  console.log(`  ${slug}: ${found[slug] ?? 0} steps`);
}

// material_items
const miRes = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'material_items!A:ZZ' });
const [mh, ...mrows] = miRes.data.values ?? [[]];
const mc = n => mh.indexOf(n);
const mGroup = mc('group_slug'), mOrder = mc('item_order'), mNameEn = mc('item_name_en');
const mSNEn = mc('substitution_note_en'), mSNTe = mc('substitution_note_te'), mSNTa = mc('substitution_note_ta'), mSNHi = mc('substitution_note_hi');

const mfound = {};
mrows.forEach((r, i) => {
  const slug = r[mGroup] ?? '';
  if (!SLUGS.has(slug)) return;
  mfound[slug] = (mfound[slug] ?? 0) + 1;
});
console.log('\nMaterial item counts per festival slug:');
for (const slug of SLUGS) {
  console.log(`  ${slug}: ${mfound[slug] ?? 0} items`);
}
