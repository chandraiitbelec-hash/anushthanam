/**
 * Seeds/merges temple content from research/temple-content-wikipedia.json into
 * the Google Sheet's `temples` tab.
 *
 * Source file: research/temple-content-wikipedia.json (72 Wikipedia-sourced
 *   temple entries — etymology/history/significance/location/official site,
 *   per-field en/te/ta/hi, sourced and gap/conflict-annotated).
 *
 * Behavior:
 *   - 3 slugs (ttd-tirumala, siddhivinayak-mumbai, kashi-vishwanath) already
 *     exist as published rows with name and location fields filled in. For
 *     these, this script UPDATES only the currently-empty etymology, history,
 *     significance, and official_website_url cells — it never overwrites a
 *     non-empty cell, and never touches name, location, display_order,
 *     or status for these 3 rows.
 *   - The other ~69 slugs get brand-new rows appended at the end of the
 *     sheet, always with status='draft' (never 'published' — this script
 *     does not publish anything) and translation_status computed from
 *     which languages actually have non-empty content in the source JSON
 *     (this dataset is effectively all English-only content: only the 3
 *     merge-target temples have any te/ta text, and no entry has hi text,
 *     consistent with this project's policy of leaving hi fields for a
 *     human author rather than machine-translating).
 *   - display_order for new rows is left BLANK — assigning an ordering
 *     among 69 unreviewed temples isn't this script's call to make.
 *
 * SPENT — applied to the live Sheet already. All 72 slugs are present on the
 * `temples` tab and have since been reviewed and published by hand, so a re-run
 * would now throw on the duplicate-slug guard. Archived per the scripts/
 * convention; kept for the record of how the tab was populated.
 *
 * Usage (historical):
 *   node scripts/seed-temples.mjs            (dry run — prints report only)
 *   node scripts/seed-temples.mjs --write     (apply)
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = parseWriteFlag(process.argv);

const TAB = 'temples';
const MERGE_SLUGS = new Set(['ttd-tirumala', 'siddhivinayak-mumbai', 'kashi-vishwanath']);
const LANGS = ['en', 'te', 'ta', 'hi'];
const CONTENT_FIELDS = ['etymology', 'history', 'significance']; // official_website_url handled separately; location_* left untouched on merge rows (already filled)

const sourcePath = resolve(__dirname, '../research/temple-content-wikipedia.json');
const entries = JSON.parse(readFileSync(sourcePath, 'utf8'));

function nonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function computeTranslationStatus(entry) {
  const langsWithContent = LANGS.filter(lang => {
    if (lang === 'en') return true;
    return ['etymology', 'history', 'significance', 'location'].some(f => nonEmpty(entry[`${f}_${lang}`]));
  });
  if (langsWithContent.length <= 1) return 'en-only';
  if (langsWithContent.length < LANGS.length) return 'partial';
  return 'complete';
}

const { headers, rows, col } = await getTabWithHeaders(TAB);
const slugCol = col('slug');
const existingSlugToRowIndex = new Map(); // slug -> 0-based index into `rows`
rows.forEach((r, i) => existingSlugToRowIndex.set(r[slugCol], i));

// ─── Build the plan ───────────────────────────────────────────────────────────

const updates = []; // { slug, rowIndex, cellsToSet: [{ header, value }] }
const newRows = []; // { slug, values: [...] } aligned to `headers`

for (const entry of entries) {
  if (MERGE_SLUGS.has(entry.slug)) {
    const rowIndex = existingSlugToRowIndex.get(entry.slug);
    if (rowIndex === undefined) {
      throw new Error(`Merge target slug "${entry.slug}" not found in live sheet — did the sheet change since this script was written?`);
    }
    const existingRow = rows[rowIndex];
    const cellsToSet = [];
    for (const field of CONTENT_FIELDS) {
      for (const lang of LANGS) {
        const header = `${field}_${lang}`;
        const colIdx = col(header);
        const existingValue = existingRow[colIdx] ?? '';
        const newValue = entry[header] ?? '';
        if (!nonEmpty(existingValue) && nonEmpty(newValue)) {
          cellsToSet.push({ header, colIdx, value: newValue });
        }
      }
    }
    // official_website_url: only fill if currently empty and we have a confident value
    {
      const header = 'official_website_url';
      const colIdx = col(header);
      const existingValue = existingRow[colIdx] ?? '';
      const newValue = entry.official_website_url ?? '';
      if (!nonEmpty(existingValue) && nonEmpty(newValue)) {
        cellsToSet.push({ header, colIdx, value: newValue });
      }
    }
    // Per explicit user decision: flip these 3 already-published rows to
    // 'draft' as part of this write, since we're adding unreviewed content
    // to them — all 72 rows get reviewed and republished together later.
    {
      const header = 'status';
      const colIdx = col(header);
      const existingValue = existingRow[colIdx] ?? '';
      if (existingValue !== 'draft') {
        cellsToSet.push({ header, colIdx, value: 'draft' });
      }
    }
    updates.push({ slug: entry.slug, rowIndex, cellsToSet });
  } else {
    if (existingSlugToRowIndex.has(entry.slug)) {
      throw new Error(`New slug "${entry.slug}" already exists as a live row — refusing to silently duplicate or overwrite. Investigate before writing.`);
    }
    const translationStatus = computeTranslationStatus(entry);
    const rowValues = headers.map(header => {
      if (header === 'slug') return entry.slug;
      if (header === 'name_en') return entry.temple_name_en ?? '';
      if (header === 'status') return 'draft';
      if (header === 'translation_status') return translationStatus;
      if (header === 'display_order') return ''; // left blank intentionally — see file header comment
      if (header === 'official_website_url') return entry.official_website_url ?? '';
      // remaining headers: etymology/history/significance/location per language, name_te/ta/hi
      return entry[header] ?? '';
    });
    newRows.push({ slug: entry.slug, values: rowValues, translationStatus });
  }
}

// ─── Dry-run report ───────────────────────────────────────────────────────────

console.log('\n══ seed-temples.mjs ══════════════════════════════════════════');
console.log(`Mode:   ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'}`);
console.log(`Source: research/temple-content-wikipedia.json (${entries.length} entries)`);
console.log(`Sheet headers (${headers.length}): ${headers.join(', ')}`);
console.log(`Existing rows in sheet: ${rows.length}`);
console.log('');
console.log(`Plan: ${updates.length} row(s) to UPDATE (merge), ${newRows.length} row(s) to APPEND (new)`);
console.log('');

console.log('── Merge updates (existing published rows) ──');
for (const u of updates) {
  console.log(`  ${u.slug}: filling ${u.cellsToSet.length} empty cell(s) — ${u.cellsToSet.map(c => c.header).join(', ') || '(nothing to fill — all target cells already non-empty)'}`);
}

console.log('');
console.log('── New rows: translation_status breakdown ──');
const statusCounts = {};
for (const r of newRows) statusCounts[r.translationStatus] = (statusCounts[r.translationStatus] ?? 0) + 1;
console.log('  ' + Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', '));

console.log('');
console.log('── Sample rows ──');
console.log('\n[MERGE SAMPLE] ttd-tirumala:');
const sampleMerge = updates.find(u => u.slug === 'ttd-tirumala');
console.log(JSON.stringify(sampleMerge, null, 2));

console.log('\n[NEW ROW SAMPLE 1] ' + newRows[0].slug + ':');
console.log(JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, newRows[0].values[i]])), null, 2));

console.log('\n[NEW ROW SAMPLE 2] ' + newRows[Math.floor(newRows.length / 2)].slug + ':');
const midSample = newRows[Math.floor(newRows.length / 2)];
console.log(JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, midSample.values[i]])), null, 2));

if (!WRITE) {
  console.log('\n🔍 Dry run only — no changes written. Re-run with --write to apply.\n');
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

const sheets = await getSheetsClient();

for (const u of updates) {
  if (u.cellsToSet.length === 0) continue;
  const sheetRowNum = u.rowIndex + 2; // +1 for header, +1 for 1-indexing
  const data = u.cellsToSet.map(c => ({
    range: `${TAB}!${colLetter(c.colIdx)}${sheetRowNum}`,
    values: [[c.value]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`✓ Updated ${u.slug} (row ${sheetRowNum}): ${u.cellsToSet.length} cell(s)`);
}

if (newRows.length > 0) {
  const startRow = rows.length + 2; // +1 header, +1 1-indexing, then append after last existing row
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A${startRow}`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: newRows.map(r => r.values) },
  });
  console.log(`✓ Appended ${newRows.length} new row(s), all status='draft'.`);
}

console.log('\n✅ Done.\n');
