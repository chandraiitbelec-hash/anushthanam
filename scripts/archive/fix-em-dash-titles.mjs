import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from '/Users/ChandraKanth/Documents/dev_experiments/devotion_platform/scripts/lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

const STORIES_FIXES = [
  { slug: 'dhanurmasa-secret-garland', field: 'title_te', old: 'ఆముక్తమాల్యద — రహస్య పూలమాల', new: 'ఆముక్తమాల్యద: రహస్య పూలమాల' },
  { slug: 'dhanurmasa-margazhi-vow', field: 'title_te', old: 'ధనుర్మాస వ్రతాచరణం — తిరుప్పావై', new: 'ధనుర్మాస వ్రతాచరణం: తిరుప్పావై' },
  { slug: 'dhanurmasa-margazhi-vow', field: 'title_hi', old: 'धनुर्मास का व्रत विधान — तिरुप्पावै', new: 'धनुर्मास का व्रत विधान: तिरुप्पावै' },
  { slug: 'dhanurmasa-divine-union', field: 'title_ta', old: 'திருக்கல்யாண வைபவம் — அரங்கனுடன் கலத்தல்', new: 'திருக்கல்யாண வைபவம்: அரங்கனுடன் கலத்தல்' },
];

const VRATHAM_FIXES = [
  { slug: 'dhanurmasa-vratam', field: 'tithi', old: 'Solar — Sun transits Sagittarius (Dhanu Rashi)', new: 'Solar: Sun transits Sagittarius (Dhanu Rashi)' },
];

async function run() {
  const sheets = await getSheetsClient();
  let applied = 0, skipped = 0;

  const s = await getTabWithHeaders('stories_index');
  for (const fix of STORIES_FIXES) {
    const slugIdx = s.headers.indexOf('slug');
    const rowIdx = s.rows.findIndex(r => r[slugIdx] === fix.slug);
    if (rowIdx === -1) { console.log('NOT FOUND', fix.slug); skipped++; continue; }
    const colIdx = s.headers.indexOf(fix.field);
    const current = s.rows[rowIdx][colIdx] || '';
    if (current !== fix.old) { console.log('MISMATCH', fix.slug, fix.field, '\n  live:', current, '\n  expected:', fix.old); skipped++; continue; }
    console.log(`${fix.slug} / ${fix.field}\n  OLD: ${fix.old}\n  NEW: ${fix.new}`);
    if (WRITE) {
      const a1 = `stories_index!${colLetter(colIdx)}${rowIdx + 2}`;
      await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: a1, valueInputOption: 'RAW', requestBody: { values: [[fix.new]] } });
      console.log('  -> WROTE to', a1);
    }
    applied++;
  }

  const v = await getTabWithHeaders('vrathams');
  for (const fix of VRATHAM_FIXES) {
    const slugIdx = v.headers.indexOf('slug');
    const rowIdx = v.rows.findIndex(r => r[slugIdx] === fix.slug);
    if (rowIdx === -1) { console.log('NOT FOUND', fix.slug); skipped++; continue; }
    const colIdx = v.headers.indexOf(fix.field);
    const current = v.rows[rowIdx][colIdx] || '';
    if (current !== fix.old) { console.log('MISMATCH', fix.slug, fix.field, '\n  live:', current, '\n  expected:', fix.old); skipped++; continue; }
    console.log(`${fix.slug} / ${fix.field}\n  OLD: ${fix.old}\n  NEW: ${fix.new}`);
    if (WRITE) {
      const a1 = `vrathams!${colLetter(colIdx)}${rowIdx + 2}`;
      await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: a1, valueInputOption: 'RAW', requestBody: { values: [[fix.new]] } });
      console.log('  -> WROTE to', a1);
    }
    applied++;
  }

  console.log(`\n${WRITE ? 'Applied' : 'Would apply'}: ${applied}. Skipped: ${skipped}.`);
  if (!WRITE) console.log('Dry run only — pass --write to apply.');
}

run().catch(err => { console.error(err); process.exit(1); });
