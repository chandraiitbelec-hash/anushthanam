/**
 * Fill meaning_te/ta/hi for shloka_stanzas rows whose meaning_en is already
 * filled but some translations are missing (translation-pending gap only —
 * see CLAUDE.md / STOTRA_UPLOAD_PIPELINE.md for the never-authored gap,
 * which this script must NOT touch).
 *
 * In-place cell edits only, matched by (shloka_slug, stanza_number). Never
 * touches meaning_en, script_* columns, or any other column.
 *
 * Usage:
 *   node scripts/fill-stanza-meaning-translations.mjs <slug>           # dry run
 *   node scripts/fill-stanza-meaning-translations.mjs <slug> --write  # apply
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';
import { TRANSLATIONS } from './data/stanza-meaning-translations.mjs';

const slug = process.argv[2];
const write = parseWriteFlag();

if (!slug || !TRANSLATIONS[slug]) {
  console.error('Usage: node scripts/fill-stanza-meaning-translations.mjs <slug> [--write]');
  console.error('Known slugs:', Object.keys(TRANSLATIONS).join(', '));
  process.exit(1);
}

const { rows, col } = await getTabWithHeaders('shloka_stanzas');

const slugCol = col('shloka_slug');
const numCol = col('stanza_number');
const enCol = col('meaning_en');
const teCol = col('meaning_te');
const taCol = col('meaning_ta');
const hiCol = col('meaning_hi');

const byStanza = TRANSLATIONS[slug];
const updates = [];

rows.forEach((r, i) => {
  if (r[slugCol] !== slug) return;
  const stanzaNum = Number(r[numCol]);
  const t = byStanza[stanzaNum];
  if (!t) return;

  const sheetRow = i + 2;
  const missing = { te: !r[teCol]?.trim(), ta: !r[taCol]?.trim(), hi: !r[hiCol]?.trim() };
  if (!missing.te && !missing.ta && !missing.hi) return;

  updates.push({
    sheetRow,
    stanzaNum,
    en: r[enCol],
    before: { te: r[teCol] || '', ta: r[taCol] || '', hi: r[hiCol] || '' },
    after: { te: t.te, ta: t.ta, hi: t.hi },
  });
});

console.log(`Slug: ${slug}`);
console.log(`Rows to update: ${updates.length}`);
console.log(write ? '*** WRITE MODE ***' : '(dry run — pass --write to apply)');
console.log('');

for (const u of updates) {
  console.log(`--- sheet row ${u.sheetRow} (stanza ${u.stanzaNum})`);
  console.log('EN:', u.en);
  console.log('TE:', u.after.te);
  console.log('TA:', u.after.ta);
  console.log('HI:', u.after.hi);
  console.log('');
}

if (!write) {
  console.log('Dry run only — no changes written.');
  process.exit(0);
}

const sheets = await getSheetsClient();
const teLetter = colLetter(teCol);
const taLetter = colLetter(taCol);
const hiLetter = colLetter(hiCol);

const data = [];
for (const u of updates) {
  data.push({ range: `shloka_stanzas!${teLetter}${u.sheetRow}`, values: [[u.after.te]] });
  data.push({ range: `shloka_stanzas!${taLetter}${u.sheetRow}`, values: [[u.after.ta]] });
  data.push({ range: `shloka_stanzas!${hiLetter}${u.sheetRow}`, values: [[u.after.hi]] });
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: { valueInputOption: 'RAW', data },
});

console.log(`Wrote ${updates.length} rows (${data.length} cells) for ${slug}.`);
