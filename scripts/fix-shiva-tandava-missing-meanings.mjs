/**
 * Fills in the two meaning_en cells left blank in shiva-tandava-stotram
 * (stanzas 14 and 15 -- sheet rows 3882-3883 at time of writing). These two
 * verses are unusually dense even by this stotra's standards (verse 15 in
 * particular has a genuinely disputed compound, "vivāhakālikadhvaniḥ", with
 * no single settled scholarly reading), which is presumably why whichever
 * upload left them blank rather than guess. Translations below are composed
 * to be faithful to the verse's overall imagery and register (matching the
 * holistic-sentence style used for kala-bhairava-ashtakam and
 * kanakadhara-stotram) without asserting false precision on the one
 * genuinely obscure sub-phrase in verse 15.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-shiva-tandava-missing-meanings.mjs          (dry run)
 *      node scripts/fix-shiva-tandava-missing-meanings.mjs --write  (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);
const SLUG = 'shiva-tandava-stotram';

const MEANINGS = {
  14: "May that mingled radiance streaming from a part of Shiva's form -- his captivating locks, from which warm, fragrant nectar drips through the kadamba and jasmine blossoms woven into his crown, and where the graceful consort of the lord of the gods (the celestial Ganga) dwells -- ever grant us, day and night, joyous delight of mind and the supreme abode of refuge.",
  15: 'May that form of Shiva arise for the victory of the world -- resplendent with the auspicious glow of the fierce submarine fire, invoked by the cries of the maidens who are the eight great siddhis, his eye thrown wide open, resounding like auspicious wedding music, adorned with the mantra "Shiva" as his ornament.',
};

const { rows, col } = await getTabWithHeaders('shloka_stanzas');
const cSlug = col('shloka_slug');
const cStanza = col('stanza_number');
const cMeaningEn = col('meaning_en');

const targets = [];
rows.forEach((r, i) => {
  if (r[cSlug] === SLUG && (r[cStanza] === '14' || r[cStanza] === '15')) {
    const sheetRow = i + 2; // +1 header, +1 1-based
    if (r[cMeaningEn]) {
      console.log(`Stanza ${r[cStanza]} (row ${sheetRow}) already has a meaning -- skipping: "${r[cMeaningEn].slice(0, 60)}..."`);
      return;
    }
    targets.push({ sheetRow, stanza: parseInt(r[cStanza], 10) });
  }
});

console.log(`\nFound ${targets.length} blank-meaning row(s) to fill:`);
targets.forEach(t => console.log(`  Stanza ${t.stanza} (row ${t.sheetRow}): "${MEANINGS[t.stanza].slice(0, 80)}..."`));

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  if (targets.length === 0) {
    console.log('Nothing to write.');
  } else {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: targets.map(t => ({
          range: `shloka_stanzas!${colLetter(cMeaningEn)}${t.sheetRow}`,
          values: [[MEANINGS[t.stanza]]],
        })),
      },
    });
    console.log(`Updated ${targets.length} cell(s).`);
  }
}
