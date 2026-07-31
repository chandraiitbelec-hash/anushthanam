/**
 * Removes em-dash ("—") usage from shloka_stanzas.stanza_label, which uses
 * a "Song title — Section" pattern (e.g. "Brahmam Okkate — Pallavi"),
 * converting it to "Song title: Section" to match the site's existing
 * title/subtitle convention (see fix-em-dash-titles.mjs).
 *
 * Found as a residual 26-cell gap after the main em-dash cleanup passes
 * across shloka_stanzas.meaning_* — stanza_label was never in scope for
 * those (it's a structural identifier, not prose), all 26 belong to
 * annamacharya-keertana-collection.
 *
 * Already applied with --write; kept here for the record per convention.
 * Defaults to dry run. Pass --write to re-apply (idempotent: no-ops if
 * the live cell no longer contains "—").
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

async function run() {
  const s = await getTabWithHeaders('shloka_stanzas');
  const idx = { slug: s.col('shloka_slug'), stanza: s.col('stanza_number'), label: s.col('stanza_label') };
  const sheets = await getSheetsClient();
  let applied = 0;
  for (let i = 0; i < s.rows.length; i++) {
    const row = s.rows[i];
    const old = row[idx.label] || '';
    if (!old.includes('—')) continue;
    const updated = old.replace(/\s*—\s*/g, ': ');
    console.log(`${row[idx.slug]} | stanza ${row[idx.stanza]}\n  OLD: ${old}\n  NEW: ${updated}`);
    if (WRITE) {
      const a1 = `shloka_stanzas!${colLetter(idx.label)}${i + 2}`;
      await sheets.spreadsheets.values.update({ spreadsheetId: SPREADSHEET_ID, range: a1, valueInputOption: 'RAW', requestBody: { values: [[updated]] } });
    }
    applied++;
  }
  console.log(`\n${WRITE ? 'Applied' : 'Would apply'}: ${applied} cell(s).`);
  if (!WRITE) console.log('Dry run only — pass --write to apply.');
}

run().catch(err => { console.error(err); process.exit(1); });
