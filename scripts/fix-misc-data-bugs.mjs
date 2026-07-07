/**
 * One-off fixes for bugs found during the July 2026 content audit that do not
 * require sourcing new content — just correcting existing data:
 *
 * 1. thiruppavai stanza 20 script_telugu has a stray Tamil "ல" (U+0BB2) inside
 *    an otherwise Telugu-transliterated word — should be Telugu "ల" (U+0C32).
 * 2. lalitha-sahasranamam / soundarya-lahari have deity_slug
 *    "lalitha-tripurasundari", which does not match any row in the gods tab
 *    (the real slug is "lalitha") — breaks the deity link on those pages.
 * 3. god_links has a dangling row: narada -> shloka "narada-ashtothram",
 *    which does not exist in the shlokas tab. Resolves to a live 404 link on
 *    the Narada god page today. Cleared (not deleted-with-shift) since no
 *    other script in this repo touches row indices via dimension deletes.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-misc-data-bugs.mjs          (dry run)
 *      node scripts/fix-misc-data-bugs.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

async function getSheet(tab, range = 'A:ZZ') {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!${range}` });
  return res.data.values;
}

const updates = [];

// ── 1. Thiruppavai stanza 20 Tamil-char typo ──────────────────────────────
{
  const values = await getSheet('shloka_stanzas');
  const [headers, ...rows] = values;
  const slugCol = headers.indexOf('shloka_slug');
  const stanzaCol = headers.indexOf('stanza_number');
  const teCol = headers.indexOf('script_telugu');
  const rowIdx = rows.findIndex(r => r[slugCol] === 'thiruppavai' && r[stanzaCol] === '20');
  if (rowIdx === -1) {
    console.log('[1] thiruppavai stanza 20 not found — skipping');
  } else {
    const current = rows[rowIdx][teCol];
    const corrected = current.replace(/ல/g, 'ల'); // Tamil LA (U+0BB2) -> Telugu LA (U+0C32)
    if (current === corrected) {
      console.log('[1] thiruppavai stanza 20 script_telugu already clean');
    } else {
      updates.push({ range: `shloka_stanzas!${colLetter(teCol)}${rowIdx + 2}`, values: [[corrected]] });
      console.log(`[1] thiruppavai stanza 20 script_telugu:\n    ${current}\n    -> ${corrected}`);
    }
  }
}

// ── 2. deity_slug fix for lalitha-sahasranamam / soundarya-lahari ─────────
{
  const values = await getSheet('shlokas');
  const [headers, ...rows] = values;
  const slugCol = headers.indexOf('slug');
  const deityCol = headers.indexOf('deity_slug');
  for (const slug of ['lalitha-sahasranamam', 'soundarya-lahari']) {
    const rowIdx = rows.findIndex(r => r[slugCol] === slug);
    if (rowIdx === -1) { console.log(`[2] ${slug} not found — skipping`); continue; }
    const current = rows[rowIdx][deityCol];
    if (current === 'lalitha') { console.log(`[2] ${slug} deity_slug already "lalitha"`); continue; }
    updates.push({ range: `shlokas!${colLetter(deityCol)}${rowIdx + 2}`, values: [['lalitha']] });
    console.log(`[2] ${slug} deity_slug: "${current}" -> "lalitha"`);
  }
}

// ── 3. Clear dangling narada -> narada-ashtothram god_links row ───────────
{
  const values = await getSheet('god_links', 'A:D');
  const [, ...rows] = values; // headers: god_slug, entity_type, entity_slug, display_order
  const rowIdx = rows.findIndex(r => r[0] === 'narada' && r[2] === 'narada-ashtothram');
  if (rowIdx === -1) {
    console.log('[3] narada -> narada-ashtothram god_links row not found — skipping');
  } else {
    updates.push({ range: `god_links!A${rowIdx + 2}:D${rowIdx + 2}`, values: [['', '', '', '']] });
    console.log(`[3] Clearing god_links row ${rowIdx + 2}: narada -> narada-ashtothram (shloka does not exist)`);
  }
}

function colLetter(i) {
  let s = '';
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - m) / 26);
  }
  return s;
}

console.log(`\n${updates.length} cell range(s) to update.`);

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates },
  });
  console.log('Applied.');
}
