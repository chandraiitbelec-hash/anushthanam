/**
 * One-off correction of stale next_occurrence dates found stale as of 2026-07-29.
 * Sequential: writes one cell, re-reads to verify, then moves to the next entity.
 * Dates sourced from Drik Panchang / consensus of major panchang sites (see notes).
 *
 * Usage:
 *   node scripts/fix-stale-occurrence-dates-2026-07.mjs          ← dry run
 *   node scripts/fix-stale-occurrence-dates-2026-07.mjs --write  ← apply
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const APPLY = parseWriteFlag(process.argv);
const sheets = await getSheetsClient();

const FESTIVAL_FIXES = [
  { slug: 'maha-shivaratri', date: '2027-03-06', note: 'Phalguna Krishna Chaturdashi (2027 occurrence)' },
  { slug: 'rama-navami',     date: '2027-04-15', note: 'Chaitra Shukla Navami (2027 occurrence)' },
  { slug: 'hanuman-jayanti', date: '2027-04-20', note: 'Chaitra Purnima (2027 occurrence, North Indian tradition)' },
  { slug: 'rath-yatra',      date: '2027-07-05', note: 'Ashadha Shukla Dwitiya (2027 occurrence)' },
];

const VRATHAM_FIXES = [
  { slug: 'ekadashi-vratham',  date: '2026-08-09', note: 'Kamika Ekadashi; Ashadha Krishna Ekadashi' },
  { slug: 'pradosha-vratham',  date: '2026-08-10', note: 'Shravana Krishna Trayodashi (Pradosh evening)' },
];

async function fixTab(tab, fixes) {
  console.log(`\n=== ${tab} ===`);
  for (const fix of fixes) {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!A:Z` });
    const [header, ...rows] = res.data.values || [];
    const ci = h => header.indexOf(h);
    const slugCol = ci('slug');
    const occCol = ci('next_occurrence');
    const noteCol = ci('next_occurrence_note_en');

    const rowIdx = rows.findIndex(r => r[slugCol] === fix.slug);
    if (rowIdx === -1) {
      console.log(`  ✗ ${fix.slug}: not found in ${tab}, skipping`);
      continue;
    }
    const rowNum = rowIdx + 2;
    const before = rows[rowIdx][occCol];
    console.log(`  ${fix.slug}: ${before} -> ${fix.date}`);

    if (!APPLY) {
      console.log(`    (dry run — pass --write to apply)`);
      continue;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!${colLetter(occCol)}${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[fix.date]] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!${colLetter(noteCol)}${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[fix.note]] },
    });

    const verify = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!${colLetter(occCol)}${rowNum}:${colLetter(noteCol)}${rowNum}`,
    });
    const [writtenOcc] = verify.data.values?.[0] || [];
    if (writtenOcc === fix.date) {
      console.log(`    ✓ verified`);
    } else {
      console.log(`    ✗ verification MISMATCH: expected ${fix.date}, got ${writtenOcc}`);
    }
  }
}

await fixTab('festivals', FESTIVAL_FIXES);
await fixTab('vrathams', VRATHAM_FIXES);

console.log(`\n${APPLY ? 'Done writing.' : 'Dry run complete — pass --write to apply.'}`);
