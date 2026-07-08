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
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'shiva-tandava-stotram';

const MEANINGS = {
  14: "May that mingled radiance streaming from a part of Shiva's form -- his captivating locks, from which warm, fragrant nectar drips through the kadamba and jasmine blossoms woven into his crown, and where the graceful consort of the lord of the gods (the celestial Ganga) dwells -- ever grant us, day and night, joyous delight of mind and the supreme abode of refuge.",
  15: 'May that form of Shiva arise for the victory of the world -- resplendent with the auspicious glow of the fierce submarine fire, invoked by the cries of the maidens who are the eight great siddhis, his eye thrown wide open, resounding like auspicious wedding music, adorned with the mantra "Shiva" as his ornament.',
};

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:H' });
const rows = res.data.values;

const targets = [];
rows.forEach((r, i) => {
  if (r[0] === SLUG && (r[1] === '14' || r[1] === '15')) {
    const sheetRow = i + 1;
    if (r[7]) {
      console.log(`Stanza ${r[1]} (row ${sheetRow}) already has a meaning -- skipping: "${r[7].slice(0, 60)}..."`);
      return;
    }
    targets.push({ sheetRow, stanza: parseInt(r[1], 10) });
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
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: targets.map(t => ({
          range: `shloka_stanzas!H${t.sheetRow}`,
          values: [[MEANINGS[t.stanza]]],
        })),
      },
    });
    console.log(`Updated ${targets.length} cell(s).`);
  }
}
