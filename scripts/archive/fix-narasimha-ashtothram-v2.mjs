/**
 * Replaces the narasimha-ashtothram stanzas with a complete, independent
 * 108-name Devanagari source (different wording from the previous Telugu
 * source in several places -- e.g. an additional name "विश्वम्भराय" not
 * present before, and "कविमाधवाय" combining what was previously two
 * separate names "कवये"/"माधवाय"). Checkpoint markers in this source run
 * cleanly every 9 names (9,18,27...108) with no drift, unlike the previous
 * source.
 *
 * UPDATES the existing sheet rows in place (same row positions) for the
 * first N, then APPENDS the rest -- same safe approach as before, no
 * row deletion/shifting.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-narasimha-ashtothram-v2.mjs          (dry run)
 *      node scripts/fix-narasimha-ashtothram-v2.mjs --write  (apply)
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
ओं नारसिंहाय नमः ।
ओं महासिंहाय नमः ।
ओं दिव्यसिंहाय नमः ।
ओं महाबलाय नमः ।
ओं उग्रसिंहाय नमः ।
ओं महादेवाय नमः ।
ओं स्तम्भजाय नमः ।
ओं उग्रलोचनाय नमः ।
ओं रौद्राय नमः ।
ओं सर्वाद्भुताय नमः ।
ओं श्रीमते नमः ।
ओं योगानन्दाय नमः ।
ओं त्रिविक्रमाय नमः ।
ओं हरये नमः ।
ओं कोलाहलाय नमः ।
ओं चक्रिणे नमः ।
ओं विजयाय नमः ।
ओं जयवर्धनाय नमः ।
ओं पञ्चाननाय नमः ।
ओं परस्मै ब्रह्मणे नमः ।
ओं अघोराय नमः ।
ओं घोरविक्रमाय नमः ।
ओं ज्वलन्मुखाय नमः ।
ओं ज्वालमालिने नमः ।
ओं महाज्वालाय नमः ।
ओं महाप्रभवे नमः ।
ओं निटिलाक्षाय नमः ।
ओं सहस्राक्षाय नमः ।
ओं दुर्निरीक्ष्याय नमः ।
ओं प्रतापनाय नमः ।
ओं महादंष्ट्रायुधाय नमः ।
ओं प्राज्ञाय नमः ।
ओं चण्डकोपिने नमः ।
ओं सदाशिवाय नमः ।
ओं हिरण्यकशिपुध्वंसिने नमः ।
ओं दैत्यदानवभञ्जनाय नमः ।
ओं गुणभद्राय नमः ।
ओं महाभद्राय नमः ।
ओं बलभद्राय नमः ।
ओं सुभद्रकाय नमः ।
ओं करालाय नमः ।
ओं विकरालाय नमः ।
ओं विकर्त्रे नमः ।
ओं सर्वकर्तृकाय नमः ।
ओं शिंशुमाराय नमः ।
ओं त्रिलोकात्मने नमः ।
ओं ईशाय नमः ।
ओं सर्वेश्वराय नमः ।
ओं विभवे नमः ।
ओं भैरवाडम्बराय नमः ।
ओं दिव्याय नमः ।
ओं अच्युताय नमः ।
ओं कविमाधवाय नमः ।
ओं अधोक्षजाय नमः ।
ओं अक्षराय नमः ।
ओं शर्वाय नमः ।
ओं वनमालिने नमः ।
ओं वरप्रदाय नमः ।
ओं विश्वम्भराय नमः ।
ओं अद्भुताय नमः ।
ओं भव्याय नमः ।
ओं श्रीविष्णवे नमः ।
ओं पुरुषोत्तमाय नमः ।
ओं अनघास्त्राय नमः ।
ओं नखास्त्राय नमः ।
ओं सूर्यज्योतिषे नमः ।
ओं सुरेश्वराय नमः ।
ओं सहस्रबाहवे नमः ।
ओं सर्वज्ञाय नमः ।
ओं सर्वसिद्धिप्रदायकाय नमः ।
ओं वज्रदंष्ट्राय नमः ।
ओं वज्रनखाय नमः ।
ओं महानन्दाय नमः ।
ओं परन्तपाय नमः ।
ओं सर्वमन्त्रैकरूपाय नमः ।
ओं सर्वयन्त्रविदारणाय नमः ।
ओं सर्वतन्त्रात्मकाय नमः ।
ओं अव्यक्ताय नमः ।
ओं सुव्यक्ताय नमः ।
ओं भक्तवत्सलाय नमः ।
ओं वैशाखशुक्लभूतोत्थाय नमः ।
ओं शरणागतवत्सलाय नमः ।
ओं उदारकीर्तये नमः ।
ओं पुण्यात्मने नमः ।
ओं महात्मने नमः ।
ओं चण्डविक्रमाय नमः ।
ओं वेदत्रयप्रपूज्याय नमः ।
ओं भगवते नमः ।
ओं परमेश्वराय नमः ।
ओं श्रीवत्साङ्काय नमः ।
ओं श्रीनिवासाय नमः ।
ओं जगद्व्यापिने नमः ।
ओं जगन्मयाय नमः ।
ओं जगत्पालाय नमः ।
ओं जगन्नाथाय नमः ।
ओं महाकायाय नमः ।
ओं द्विरूपभृते नमः ।
ओं परमात्मने नमः ।
ओं परस्मै ज्योतिषे नमः ।
ओं निर्गुणाय नमः ।
ओं नृकेसरिणे नमः ।
ओं परतत्त्वाय नमः ।
ओं परस्मै धाम्ने नमः ।
ओं सच्चिदानन्दविग्रहाय नमः ।
ओं लक्ष्मीनृसिंहाय नमः ।
ओं सर्वात्मने नमः ।
ओं धीराय नमः ।
ओं प्रह्लादपालकाय नमः ।
`;

const names = SOURCE
  .split('\n')
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => s.replace(/[।॥]+\s*[०-९0-9]*\s*$/, '').trim())
  .map(s => s.replace(/^(ओं|ॐ)\s*/, '').trim());

console.log(`Parsed ${names.length} names (expect 108).`);
if (names.length !== 108) {
  console.error('Count mismatch -- stopping for review.');
  process.exit(1);
}

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

const OM = { devanagari: 'ॐ', telugu: 'ఓం', tamil: 'ஓம்', iast: 'ōṃ' };

const rows = names.map((name, i) => {
  const iastRaw = Sanscript.t(name, 'devanagari', 'iast');
  return {
    stanza_number: i + 1,
    script_devanagari: `${OM.devanagari} ${name}`,
    script_telugu: `${OM.telugu} ${Sanscript.t(name, 'devanagari', 'telugu')}`,
    script_tamil: `${OM.tamil} ${devanagariToTamilSuperscript(name)}`,
    roman_iast: `${OM.iast} ${addMacrons(iastRaw)}`,
  };
});

console.log(`\nSample (1, 54, 108):\n`);
[0, 53, 107].forEach(i => console.log(rows[i], '\n'));

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:F' });
const [, existingRows] = [res.data.values[0], res.data.values.slice(1)];
const existingIdx = existingRows
  .map((r, i) => ({ r, sheetRow: i + 2 }))
  .filter(({ r }) => r[0] === SLUG);

console.log(`Existing rows for "${SLUG}": ${existingIdx.length} (sheet rows ${existingIdx[0]?.sheetRow}-${existingIdx[existingIdx.length - 1]?.sheetRow})`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
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
