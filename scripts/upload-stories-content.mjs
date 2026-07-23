/**
 * Migrates locally-extracted story text (from Google Docs exports that 403
 * during build) into the stories_content Sheet tab, so the pages render via
 * the existing Sheet fallback (getStoryBodyFromSheet) instead of the Docs API.
 *
 * Source: research/dhanurmasa-stories/txt/<story>-<lang>.txt — plain text
 * extracted from the exported .docx files, paragraphs separated by blank lines.
 *
 * For each (story_slug, lang):
 *   1. Refuses to append if stories_content already has rows for that pair
 *      (prints a warning — no silent duplicates, no deletes).
 *   2. Splits the source text into paragraphs on blank lines, trims, skips
 *      empties, and appends rows [story_slug, lang, paragraph_num, text]
 *      (1-based paragraph_num) to stories_content.
 *   3. Clears the corresponding gdoc_id_{lang} cell in stories_index — a
 *      populated gdoc_id takes precedence over Sheet content, so it must be
 *      cleared for the Sheet fallback to actually be used.
 *
 * Dry-run by default; pass --write to apply.
 *
 * Usage:
 *   node scripts/upload-stories-content.mjs          (dry run)
 *   node scripts/upload-stories-content.mjs --write  (apply)
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID as SHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = parseWriteFlag(process.argv);

const TXT_DIR = resolve(__dirname, '../research/dhanurmasa-stories/txt');

const STORIES = [
  'dhanurmasa-godadevi-incarnation',
  'dhanurmasa-secret-garland',
  'dhanurmasa-margazhi-vow',
  'dhanurmasa-divine-union',
];
const LANGS = ['en', 'te', 'ta', 'hi'];

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

console.log(`\n══ upload-stories-content.mjs ══════════════════════════════════════`);
console.log(`Mode  : ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);
console.log(`Source: ${TXT_DIR}`);

// ─── Load source files ─────────────────────────────────────────────────────

const jobs = [];
for (const slug of STORIES) {
  for (const lang of LANGS) {
    const file = resolve(TXT_DIR, `${slug}-${lang}.txt`);
    if (!existsSync(file)) {
      console.error(`⛔ Missing source file: ${file}`);
      process.exit(1);
    }
    const raw = readFileSync(file, 'utf8');
    const paragraphs = splitParagraphs(raw);
    if (paragraphs.length === 0) {
      console.error(`⛔ No paragraphs extracted from ${file}`);
      process.exit(1);
    }
    jobs.push({ slug, lang, file, paragraphs });
  }
}

// ─── Fetch current sheet state ─────────────────────────────────────────────

const { headers: contentHeaders, rows: contentRows, col: contentCol } = await getTabWithHeaders('stories_content');
const { headers: indexHeaders, rows: indexRows, col: indexCol } = await getTabWithHeaders('stories_index');

const C = {
  slug: contentCol('story_slug'),
  lang: contentCol('lang'),
};
const I = {
  slug: indexCol('slug'),
  gdoc: {
    en: indexCol('gdoc_id_en'),
    te: indexCol('gdoc_id_te'),
    ta: indexCol('gdoc_id_ta'),
    hi: indexCol('gdoc_id_hi'),
  },
};

const existingPairs = new Set(
  contentRows.map(r => `${r[C.slug]}::${r[C.lang]}`)
);

// ─── Plan: rows to append + cells to clear ─────────────────────────────────

const appendRows = []; // [story_slug, lang, paragraph_num, text]
const clearCells = []; // { slug, lang, sheetRow, colIdx, a1, currentValue }
let warnings = 0;

console.log(`\n── Plan ──────────────────────────────────────────────────────────`);

for (const { slug, lang, file, paragraphs } of jobs) {
  const pairKey = `${slug}::${lang}`;
  console.log(`\n[${slug}] lang=${lang} (${file.split('/').pop()})`);

  if (existingPairs.has(pairKey)) {
    console.log(`  ⚠️  WARNING: stories_content already has rows for (${slug}, ${lang}) — skipping append, no duplicates written.`);
    warnings++;
  } else {
    paragraphs.forEach((text, i) => {
      const paragraphNum = i + 1;
      appendRows.push([slug, lang, String(paragraphNum), text]);
      console.log(`  APPEND ¶${paragraphNum}: "${text.slice(0, 70)}${text.length > 70 ? '…' : ''}"`);
    });
  }

  const indexRowIdx = indexRows.findIndex(r => r[I.slug] === slug);
  if (indexRowIdx === -1) {
    console.error(`  ⛔ stories_index row not found for slug "${slug}"`);
    process.exit(1);
  }
  const sheetRow = indexRowIdx + 2;
  const colIdx = I.gdoc[lang];
  const currentValue = indexRows[indexRowIdx][colIdx] ?? '';
  if (currentValue) {
    const a1 = `stories_index!${colLetter(colIdx)}${sheetRow}`;
    clearCells.push({ slug, lang, sheetRow, colIdx, a1, currentValue });
    console.log(`  CLEAR  gdoc_id_${lang} at ${a1} (currently "${currentValue}")`);
  } else {
    console.log(`  SKIP   gdoc_id_${lang} already empty`);
  }
}

// ─── Apply ──────────────────────────────────────────────────────────────────

console.log(`\n── Summary ─────────────────────────────────────────────────────────`);
console.log(`Rows to append to stories_content : ${appendRows.length}`);
console.log(`Cells to clear in stories_index    : ${clearCells.length}`);
console.log(`Warnings (existing content, skipped): ${warnings}`);

if (!WRITE) {
  console.log(`\nDry run — pass --write to apply.`);
  process.exit(0);
}

const sheets = await getSheetsClient();

if (appendRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'stories_content!A:D',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: appendRows },
  });
  console.log(`\n✓ Appended ${appendRows.length} rows to stories_content`);
}

for (const { a1 } of clearCells) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: a1,
    valueInputOption: 'RAW',
    requestBody: { values: [['']] },
  });
}
if (clearCells.length > 0) {
  console.log(`✓ Cleared ${clearCells.length} gdoc_id cells in stories_index`);
}

console.log(`\n✓ Done.`);
