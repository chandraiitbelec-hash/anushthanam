/**
 * Uploads the 108-name Brahma Ashtottara Shatanamavali to shloka_stanzas,
 * linked to the existing "brahma-ashtothram" shloka row (currently zero stanzas).
 *
 * Source: Devanagari text supplied by the user (Skanda Purana, Brahma Khanda —
 * cross-checked against drikpanchang.com and brahmadev.in, which independently
 * agree on the same 108 names and order).
 *
 * From that single Devanagari source, this script derives:
 *   - roman_iast and script_telugu via @indic-transliteration/sanscript
 *     (verified to exactly reproduce this site's existing ganesha-ashtothram
 *     data for these two scripts)
 *   - script_tamil via a custom converter (scripts/lib-tamil-superscript.mjs)
 *     written after finding the sanscript library's tamil_superscripted
 *     scheme misplaces voicing superscripts around liquid consonants (l/r).
 *     The custom converter was validated against all 108 known-correct
 *     ganesha-ashtothram Tamil entries: 103/108 exact match, with the 5
 *     residual differences traced to specific causes (two isolated
 *     inconsistencies already present in that reference data, and two
 *     well-known Sanskrit loanwords -- "mangala" and "kalyana" -- that Tamil
 *     already has established native spellings for; neither word appears in
 *     this Brahma list).
 *
 * Defaults to a dry run. Pass --write to append the rows.
 * Run: node scripts/upload-brahma-ashtothram.mjs          (dry run)
 *      node scripts/upload-brahma-ashtothram.mjs --write  (apply)
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
const SLUG = 'brahma-ashtothram';

const SOURCE = `
ओं ब्रह्मणे नमः ।
ओं गायत्रीपतये नमः ।
ओं सावित्रीपतये नमः ।
ओं सरस्वतीपतये नमः ।
ओं प्रजापतये नमः ।
ओं हिरण्यगर्भाय नमः ।
ओं कमण्डलुधराय नमः ।
ओं रक्तवर्णाय नमः ।
ओं ऊर्ध्वलोकपालाय नमः ।
ओं वरदाय नमः ।
ओं वनमालिने नमः ।
ओं सुरश्रेष्ठाय नमः ।
ओं पितमहाय नमः ।
ओं वेदगर्भाय नमः ।
ओं चतुर्मुखाय नमः ।
ओं सृष्टिकर्त्रे नमः ।
ओं बृहस्पतये नमः ।
ओं बालरूपिणे नमः ।
ओं सुरप्रियाय नमः ।
ओं चक्रदेवाय नमः ।
ओं भुवनाधिपाय नमः ।
ओं पुण्डरीकाक्षाय नमः ।
ओं पीताक्षाय नमः ।
ओं विजयाय नमः ।
ओं पुरुषोत्तमाय नमः ।
ओं पद्महस्ताय नमः ।
ओं तमोनुदे नमः ।
ओं जनानन्दाय नमः ।
ओं जनप्रियाय नमः ।
ओं ब्रह्मणे नमः ।
ओं मुनये नमः ।
ओं श्रीनिवासाय नमः ।
ओं शुभङ्कराय नमः ।
ओं देवकर्त्रे नमः ।
ओं स्रष्ट्रे नमः ।
ओं विष्णवे नमः ।
ओं भार्गवाय नमः ।
ओं गोनर्दाय नमः ।
ओं पितामहाय नमः ।
ओं महादेवाय नमः ।
ओं राघवाय नमः ।
ओं विरिञ्चये नमः ।
ओं वाराहाय नमः ।
ओं शङ्कराय नमः ।
ओं सृचाहस्ताय नमः ।
ओं पद्मनेत्रे नमः ।
ओं कुशहस्ताय नमः ।
ओं गोविन्दाय नमः ।
ओं सुरेन्द्राय नमः ।
ओं पद्मतनवे नमः ।
ओं मध्वक्षाय नमः ।
ओं कनकप्रभाय नमः ।
ओं अन्नदात्रे नमः ।
ओं शम्भवे नमः ।
ओं पौलस्त्याय नमः ।
ओं हंसवाहनाय नमः ।
ओं वसिष्ठाय नमः ।
ओं नारदाय नमः ।
ओं श्रुतिदात्रे नमः ।
ओं यजुषां पतये नमः ।
ओं मधुप्रियाय नमः ।
ओं नारायणाय नमः ।
ओं द्विजप्रियाय नमः ।
ओं ब्रह्मगर्भाय नमः ।
ओं सुतप्रियाय नमः ।
ओं महारूपाय नमः ।
ओं सुरूपाय नमः ।
ओं विश्वकर्मणे नमः ।
ओं जनाध्यक्षाय नमः ।
ओं देवाध्यक्षाय नमः ।
ओं गङ्गाधराय नमः ।
ओं जलदाय नमः ।
ओं त्रिपुरारये नमः ।
ओं त्रिलोचनाय नमः ।
ओं वधनाशनाय नमः ।
ओं शौरये नमः ।
ओं चक्रधारकाय नमः ।
ओं विरूपाक्षाय नमः ।
ओं गौतमाय नमः ।
ओं माल्यवते नमः ।
ओं द्विजेन्द्राय नमः ।
ओं दिवानाथाय नमः ।
ओं पुरन्दराय नमः ।
ओं हंसबाहवे नमः ।
ओं गरुडप्रियाय नमः ।
ओं महायक्षाय नमः ।
ओं सुयज्ञाय नमः ।
ओं शुक्लवर्णाय नमः ।
ओं पद्मबोधकाय नमः ।
ओं लिङ्गिने नमः ।
ओं उमापतये नमः ।
ओं विनायकाय नमः ।
ओं धनाधिपाय नमः ।
ओं वासुकये नमः ।
ओं युगाध्यक्षाय नमः ।
ओं त्रिराज्याय नमः ।
ओं सुभोगाय नमः ।
ओं तक्षकाय नमः ।
ओं पापहर्त्रे नमः ।
ओं सुदर्शनाय नमः ।
ओं महावीराय नमः ।
ओं दुर्गनाशनाय नमः ।
ओं पद्मगृहाय नमः ।
ओं मृगलाञ्छनाय नमः ।
ओं वेदरूपिणे नमः ।
ओं अक्षमालाधराय नमः ।
ओं ब्राह्मणप्रियाय नमः ।
ओं विधये नमः ।
`;

const OM = { devanagari: 'ॐ', telugu: 'ఓం', tamil: 'ஓம்', iast: 'ōṃ' };

const names = SOURCE.split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map(l => l.replace(/[।॥]+\s*$/, '').trim().replace(/^(ओं|ॐ)\s*/, ''));

if (names.length !== 108) {
  console.error(`EXPECTED 108 names, GOT ${names.length}`);
  process.exit(1);
}

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

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

console.log(`Generated ${rows.length} rows for "${SLUG}". Sample (1, 54, 108):\n`);
[0, 53, 107].forEach(i => console.log(rows[i], '\n'));

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const sheetRows = rows.map(r => [
    SLUG, r.stanza_number, '',
    r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
    '', '', '', '', '',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: sheetRows },
  });
  console.log(`Appended ${sheetRows.length} rows for "${SLUG}".`);
}
