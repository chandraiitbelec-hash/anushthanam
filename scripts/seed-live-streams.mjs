#!/usr/bin/env node
/**
 * Seeds the `live_streams` tab with temple live-darshan entries.
 *
 * Dry-run by default — prints what would be appended. Pass --write to
 * actually append rows to the live Sheet.
 *
 * Usage:
 *   node scripts/seed-live-streams.mjs           # dry run
 *   node scripts/seed-live-streams.mjs --write   # append to Sheets
 *
 * ROWS below is intentionally empty. Fill it in with confirmed
 * temple_name / youtube_video_id / arathi_schedule content before running
 * --write — do not fabricate temple data or video IDs.
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const HEADERS = [
  'slug', 'temple_name_en', 'temple_name_te', 'temple_name_ta', 'temple_name_hi',
  'deity_slug', 'youtube_video_id', 'channel_url',
  'location_en', 'location_te', 'location_ta', 'location_hi',
  'arathi_schedule_en', 'arathi_schedule_te', 'arathi_schedule_ta', 'arathi_schedule_hi',
  'display_order', 'status', 'translation_status',
];

// Fill in confirmed entries here — see script header.
const ROWS = [];

async function main() {
  if (ROWS.length === 0) {
    console.log('No rows configured in ROWS — nothing to seed. See script header.');
    return;
  }

  const { headers, col } = await getTabWithHeaders('live_streams');
  const missing = HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`live_streams tab is missing header(s): ${missing.join(', ')}. Add the header row to Sheets first.`);
  }

  const values = ROWS.map(row => headers.map(h => (col(h) !== undefined ? (row[h] ?? '') : '')));

  console.log(`${WRITE ? 'Writing' : 'Dry run — would write'} ${values.length} row(s) to live_streams:`);
  for (const row of ROWS) {
    console.log(`  ${row.slug}: ${row.temple_name_en}`);
  }

  if (!WRITE) {
    console.log('\nRe-run with --write to append these rows.');
    return;
  }

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'live_streams!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
