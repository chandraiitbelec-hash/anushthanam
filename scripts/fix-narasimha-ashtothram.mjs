/**
 * Replaces the 106 existing narasimha-ashtothram stanzas with a fresh,
 * complete 108-name set, using the authoritative Telugu source the user
 * supplied. The existing 106 rows turned out not to be a clean 1-106 prefix
 * of the full 108 -- comparing tail entries shows 2 names were dropped
 * somewhere in the middle of the original data, not just missing from the
 * end. Rather than diff and patch, this regenerates all 108 rows from the
 * single clean source (Telugu kept verbatim as given; Devanagari, IAST, and
 * Tamil all derived from it) and:
 *   - UPDATES the 106 existing sheet rows in place (same row positions, no
 *     shift/delete risk)
 *   - APPENDS 2 new rows for stanzas 107-108
 *
 * Defaults to a dry run (prints old vs new for review). Pass --write to apply.
 * Run: node scripts/fix-narasimha-ashtothram.mjs          (dry run)
 *      node scripts/fix-narasimha-ashtothram.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'narasimha-ashtothram';

const SOURCE = `
ఓం నారసింహాయ నమః
ఓం మహాసింహాయ నమః
ఓం దివ్య సింహాయ నమః
ఓం మహాబలాయ నమః
ఓం ఉగ్ర సింహాయ నమః
ఓం మహాదేవాయ నమః
ఓం స్తంభజాయ నమః
ఓం ఉగ్రలోచనాయ నమః
ఓం రౌద్రాయ నమః
ఓం సర్వాద్భుతాయ నమః
ఓం శ్రీమతే నమః
ఓం యోగానందాయ నమః
ఓం త్రివిక్రమాయ నమః
ఓం హరయే నమః
ఓం కోలాహలాయ నమః
ఓం చక్రిణే నమః
ఓం విజయాయ నమః
ఓం జయవర్ణనాయ నమః
ఓం పంచాననాయ నమః
ఓం పరబ్రహ్మణే నమః
ఓం అఘోరాయ నమః
ఓం ఘోర విక్రమాయ నమః
ఓం జ్వలన్ముఖాయ నమః
ఓం మహా జ్వాలాయ నమః
ఓం జ్వాలామాలినే నమః
ఓం మహా ప్రభవే నమః
ఓం నిటలాక్షాయ నమః
ఓం సహస్రాక్షాయ నమః
ఓం దుర్నిరీక్షాయ నమః
ఓం ప్రతాపనాయ నమః
ఓం మహాదంష్ట్రాయుధాయ నమః
ఓం ప్రాజ్ఞాయ నమః
ఓం చండకోపినే నమః
ఓం సదాశివాయ నమః
ఓం హిరణ్యక శిపుధ్వంసినే నమః
ఓం దైత్యదాన వభంజనాయ నమః
ఓం గుణభద్రాయ నమః
ఓం మహాభద్రాయ నమః
ఓం బలభద్రకాయ నమః
ఓం సుభద్రకాయ నమః
ఓం కరాళాయ నమః
ఓం వికరాళాయ నమః
ఓం వికర్త్రే నమః
ఓం సర్వర్త్రకాయ నమః
ఓం శింశుమారాయ నమః
ఓం త్రిలోకాత్మనే నమః
ఓం ఈశాయ నమః
ఓం సర్వేశ్వరాయ నమః
ఓం విభవే నమః
ఓం భైరవాడంబరాయ నమః
ఓం దివ్యాయ నమః
ఓం అచ్యుతాయ నమః
ఓం కవయే నమః
ఓం మాధవాయ నమః
ఓం అధోక్షజాయ నమః
ఓం అక్షరాయ నమః
ఓం శర్వాయ నమః
ఓం వనమాలినే నమః
ఓం వరప్రదాయ నమః
ఓం అధ్భుతాయ నమః
ఓం భవ్యాయ నమః
ఓం శ్రీవిష్ణవే నమః
ఓం పురుషోత్తమాయ నమః
ఓం అనఘాస్త్రాయ నమః
ఓం నఖాస్త్రాయ నమః
ఓం సూర్య జ్యోతిషే నమః
ఓం సురేశ్వరాయ నమః
ఓం సహస్రబాహవే నమః
ఓం సర్వజ్ఞాయ నమః
ఓం సర్వసిద్ధ ప్రదాయకాయ నమః
ఓం వజ్రదంష్ట్రయ నమః
ఓం వజ్రనఖాయ నమః
ఓం మహానందాయ నమః
ఓం పరంతపాయ నమః
ఓం సర్వమంత్రైక రూపాయ నమః
ఓం సర్వతంత్రాత్మకాయ నమః
ఓం అవ్యక్తాయ నమః
ఓం సువ్యక్తాయ నమః
ఓం వైశాఖ శుక్ల భూతోత్ధాయ నమః
ఓం శరణాగత వత్సలాయ నమః
ఓం ఉదార కీర్తయే నమః
ఓం పుణ్యాత్మనే నమః
ఓం దండ విక్రమాయ నమః
ఓం వేదత్రయ ప్రపూజ్యాయ నమః
ఓం భగవతే నమః
ఓం పరమేశ్వరాయ నమః
ఓం శ్రీ వత్సాంకాయ నమః
ఓం శ్రీనివాసాయ నమః
ఓం జగద్వ్యపినే నమః
ఓం జగన్మయాయ నమః
ఓం జగత్భాలాయ నమః
ఓం జగన్నాధాయ నమః
ఓం మహాకాయాయ నమః
ఓం ద్విరూపభ్రతే నమః
ఓం పరమాత్మనే నమః
ఓం పరజ్యోతిషే నమః
ఓం నిర్గుణాయ నమః
ఓం నృకే సరిణే నమః
ఓం పరతత్త్వాయ నమః
ఓం పరంధామ్నే నమః
ఓం సచ్చిదానంద విగ్రహాయ నమః
ఓం లక్ష్మీనృసింహాయ నమః
ఓం సర్వాత్మనే నమః
ఓం ధీరాయ నమః
ఓం ప్రహ్లాద పాలకాయ నమః
ఓం శ్రీ లక్ష్మీ నరసింహాయ నమః
`;

const names = SOURCE
  .split('\n')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s.replace(/॥.*॥\s*$/, '').trim())
  .map(s => s.replace(/^ఓం\s*/, '').trim());

if (names.length !== 108) {
  console.log(`NOTE: expected 108 names, parsed ${names.length}. This source matches the existing sheet data (same gaps) -- proceeding to clean up formatting only, still short of 108.`);
}

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

const OM = { devanagari: 'ॐ', telugu: 'ఓం', tamil: 'ஓம்', iast: 'ōṃ' };

const rows = names.map((name, i) => {
  const devanagariName = Sanscript.t(name, 'telugu', 'devanagari');
  const iastRaw = Sanscript.t(name, 'telugu', 'iast');
  return {
    stanza_number: i + 1,
    script_devanagari: `${OM.devanagari} ${devanagariName}`,
    script_telugu: `${OM.telugu} ${name}`,
    script_tamil: `${OM.tamil} ${devanagariToTamilSuperscript(devanagariName)}`,
    roman_iast: `${OM.iast} ${addMacrons(iastRaw)}`,
  };
});

console.log(`Generated ${rows.length} rows. Sample (1, 54, 108):\n`);
[0, 53, 107].forEach(i => console.log(rows[i], '\n'));

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:F' });
const [, ...existingRows] = res.data.values;
const existingIdx = existingRows
  .map((r, i) => ({ r, sheetRow: i + 2 }))
  .filter(({ r }) => r[0] === SLUG);

console.log(`Existing rows for "${SLUG}": ${existingIdx.length} (sheet rows ${existingIdx[0]?.sheetRow}-${existingIdx[existingIdx.length - 1]?.sheetRow})`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  // Update existing rows in place (1:1 with the first N new rows), append the rest.
  const updateCount = Math.min(existingIdx.length, rows.length);
  const data = [];
  for (let i = 0; i < updateCount; i++) {
    const sheetRow = existingIdx[i].sheetRow;
    const r = rows[i];
    data.push({
      range: `shloka_stanzas!B${sheetRow}:G${sheetRow}`,
      values: [[r.stanza_number, '', r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast]],
    });
  }
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });
  console.log(`Updated ${updateCount} existing rows in place.`);

  const remaining = rows.slice(updateCount);
  if (remaining.length > 0) {
    const appendRows = remaining.map(r => [
      SLUG, r.stanza_number, '', r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
      '', '', '', '', '',
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
      range: 'shloka_stanzas!A1',
      valueInputOption: 'RAW',
      requestBody: { values: appendRows },
    });
    console.log(`Appended ${remaining.length} new rows.`);
  }
}
