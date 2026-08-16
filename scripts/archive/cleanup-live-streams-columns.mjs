/**
 * Deletes the 9 dead columns from the live_streams tab, left over from the
 * migration to temple_slug (see lib/relations.ts rowToLiveStream, which
 * never reads them): temple_name_en/te/ta/hi, deity_slug, location_en/te/ta/hi.
 *
 * Already run against the live Sheet (2026-08-16) — kept for reference.
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag } from '../lib-sheets.mjs';

const WRITE = parseWriteFlag();
const TAB = 'live_streams';
const DEAD_COLUMNS = [
  'temple_name_en', 'temple_name_te', 'temple_name_ta', 'temple_name_hi',
  'deity_slug', 'location_en', 'location_te', 'location_ta', 'location_hi',
];

const sheets = await getSheetsClient();

console.log('\n══ cleanup-live-streams-columns.mjs ══════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
const sheetMeta = meta.data.sheets?.find(s => s.properties?.title === TAB);
if (!sheetMeta) throw new Error(`Tab '${TAB}' not found`);
const sheetId = sheetMeta.properties.sheetId;

const headerRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: `${TAB}!1:1`,
});
const headers = headerRes.data.values[0];

const deadIndexes = DEAD_COLUMNS.map(name => {
  const idx = headers.indexOf(name);
  if (idx === -1) throw new Error(`Expected column '${name}' not found in ${TAB} header row`);
  return idx;
}).sort((a, b) => a - b);

// Group contiguous indexes into ranges so deleteDimension requests target
// [startIndex, endIndex) spans, then process ranges highest-first so an
// earlier deletion in the batch never shifts a later request's indexes.
const ranges = [];
for (const idx of deadIndexes) {
  const last = ranges[ranges.length - 1];
  if (last && last.endIndex === idx) {
    last.endIndex = idx + 1;
  } else {
    ranges.push({ startIndex: idx, endIndex: idx + 1 });
  }
}
ranges.reverse();

console.log(`  Deleting ${deadIndexes.length} columns from '${TAB}' in ${ranges.length} range(s):`);
for (const r of ranges) {
  const names = headers.slice(r.startIndex, r.endIndex);
  console.log(`    [${r.startIndex}, ${r.endIndex}) → ${names.join(', ')}`);
}

if (!WRITE) {
  console.log('  [DRY] no changes made — pass --write to apply');
  process.exit(0);
}

await sheets.spreadsheets.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: {
    requests: ranges.map(r => ({
      deleteDimension: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: r.startIndex, endIndex: r.endIndex },
      },
    })),
  },
});
console.log(`  ✓ deleted ${deadIndexes.length} columns from '${TAB}'`);
