/**
 * Adds mythology stories for 5 published festivals that currently have no
 * linked story in stories_index (parent_slug + parent_type='festival'):
 * saraswati-puja, vijayadashami, vasant-panchami, bathukamma, bonalu.
 *
 * For each festival:
 *   1. Refuses to append a stories_index row if the slug already exists.
 *   2. Refuses to append stories_content rows if (slug, lang) already exists.
 *   3. Appends one stories_index row + up to 4 (en/te/ta/hi) x N paragraph
 *      stories_content rows.
 *
 * Dry-run by default; pass --write to apply.
 *
 * Usage:
 *   node scripts/upload-shakti-festival-stories.mjs          (dry run)
 *   node scripts/upload-shakti-festival-stories.mjs --write  (apply)
 */
import { getSheetsClient, SPREADSHEET_ID as SHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from '../lib-sheets.mjs';
import { STORIES } from './shakti-festival-stories-data.mjs';

const WRITE = parseWriteFlag(process.argv);
const LANGS = ['en', 'te', 'ta', 'hi'];

console.log(`\n══ upload-shakti-festival-stories.mjs ══════════════════════════════`);
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

const { headers: indexHeaders, rows: indexRows, col: indexCol } = await getTabWithHeaders('stories_index');
const { headers: contentHeaders, rows: contentRows, col: contentCol } = await getTabWithHeaders('stories_content');

const existingIndexSlugs = new Set(indexRows.map(r => r[indexCol('slug')]));
const existingContentPairs = new Set(
  contentRows.map(r => `${r[contentCol('story_slug')]}::${r[contentCol('lang')]}`)
);

const indexAppendRows = [];
const contentAppendRows = [];
let warnings = 0;

console.log(`\n── Plan ──────────────────────────────────────────────────────────`);

for (const story of STORIES) {
  console.log(`\n[${story.slug}] parent=${story.parent_slug} deity=${story.deity_slug}`);

  if (existingIndexSlugs.has(story.slug)) {
    console.log(`  ⚠️  WARNING: stories_index already has slug "${story.slug}" — skipping index row, no duplicate.`);
    warnings++;
  } else {
    const row = indexHeaders.map(h => {
      if (h in story.index) return story.index[h];
      throw new Error(`Story "${story.slug}" is missing index field "${h}"`);
    });
    indexAppendRows.push(row);
    console.log(`  APPEND stories_index row: title_en="${story.index.title_en}"`);
  }

  for (const lang of LANGS) {
    const pairKey = `${story.slug}::${lang}`;
    const paragraphs = story.content[lang];
    if (!paragraphs || paragraphs.length === 0) {
      console.error(`  ⛔ Missing ${lang} paragraphs for "${story.slug}"`);
      process.exit(1);
    }
    if (existingContentPairs.has(pairKey)) {
      console.log(`  ⚠️  WARNING: stories_content already has rows for (${story.slug}, ${lang}) — skipping, no duplicates.`);
      warnings++;
      continue;
    }
    paragraphs.forEach((text, i) => {
      const paragraphNum = i + 1;
      contentAppendRows.push([story.slug, lang, String(paragraphNum), text]);
      console.log(`  APPEND [${lang}] ¶${paragraphNum}: "${text.slice(0, 70)}${text.length > 70 ? '…' : ''}"`);
    });
  }
}

console.log(`\n── Summary ─────────────────────────────────────────────────────────`);
console.log(`Rows to append to stories_index   : ${indexAppendRows.length}`);
console.log(`Rows to append to stories_content : ${contentAppendRows.length}`);
console.log(`Warnings (existing content, skipped): ${warnings}`);

if (!WRITE) {
  console.log(`\nDry run — pass --write to apply.`);
  process.exit(0);
}

const sheets = await getSheetsClient();

if (indexAppendRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `stories_index!A:${colLetter(indexHeaders.length - 1)}`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: indexAppendRows },
  });
  console.log(`\n✓ Appended ${indexAppendRows.length} rows to stories_index`);
}

if (contentAppendRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'stories_content!A:D',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: contentAppendRows },
  });
  console.log(`✓ Appended ${contentAppendRows.length} rows to stories_content`);
}

console.log(`\n✓ Done.`);
