/**
 * Uploads Narasimha Pancharatnam (Lakshmi Narasimha Pancharatnam, 5 verses,
 * Adi Shankaracharya) to shloka_stanzas. Sourced from the web, no
 * user-supplied text.
 *
 * Note on title: the text is almost universally titled "Lakshmi Narasimha
 * Pancharatnam" (Lakshmi Narasimha being the specific form addressed in the
 * refrain, "bhaja bhaja lakSmInarasimha..."); no separate "Narasimha
 * Pancharatnam" without that prefix was found attributed to Shankaracharya.
 * Treated as the same text as the site's declared title/deity (narasimha).
 *
 * The site's metadata declares stanza_count: '5'. Confirmed with no
 * reconciliation needed: kamakoti.org gives exactly 5 verses followed by a
 * plain completion colophon ("iti ... lakSmInRsimha pancaratnam sampurnam"),
 * not a 6th substantive verse, and bhaktinidhi.com / starsai.com both
 * independently confirm 5 verses with matching opening words for all five.
 *
 * Sourcing and cross-checks: full Devanagari text from kamakoti.org, cross-
 * checked against bhaktinidhi.com and starsai.com (both IAST) -- all three
 * agree word-for-word on all 5 verses and the shared refrain; no
 * discrepancies found.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session.
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: 2 long padas per verse (Shardula-vikridita-family meter),
 * danda after pada 1, numbered double-danda after pada 2 -- confirmed
 * directly from kamakoti.org's punctuation, same convention already used
 * for shiva-tandava-stotram's 2-pada verses.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-narasimha-pancharatnam.mjs          (dry run)
 *      node scripts/upload-narasimha-pancharatnam.mjs --write  (apply)
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
const SLUG = 'narasimha-pancharatnam';

const REFRAIN = 'चेतोभृङ्ग भ्रमसि वृथा भवमरुभूमौ विरसायां भज भज लक्ष्मीनरसिंहानघपदसरसिजमकरन्दम्';

const VERSES = [
  {
    padas: ['त्वत्प्रभुजीवप्रियमिच्छसि चेन्नरहरिपूजां कुरु सततं प्रतिबिम्बालंकृतिधृतिकुशलो बिम्बालंकृतिमातनुते', REFRAIN],
    meaning: 'If you wish for what is dear to the soul that is your true master, then always worship Narahari -- for one skilled at adorning a reflection thereby adorns the original image itself. O bee that is my mind, you wander in vain in this joyless desert of worldly existence -- worship, worship the honeyed nectar of the sinless lotus feet of Lakshmi Narasimha.',
  },
  {
    padas: ['शुक्त्तौ रजतप्रतिभा जाता कतकाद्यर्थसमर्था चेद्दुःखमयी ते संसृतिरेषा निर्वृतिदाने निपुणा स्यात्', REFRAIN],
    meaning: 'If the illusory glimmer of silver seen in an oyster-shell could actually be made into a real bangle, then this sorrow-filled cycle of worldly existence of yours might indeed be capable of granting true bliss. O bee that is my mind, you wander in vain in this joyless desert of worldly existence -- worship, worship the honeyed nectar of the sinless lotus feet of Lakshmi Narasimha.',
  },
  {
    padas: ['आकृतिसाम्याच्छाल्मलिकुसुमे स्थलनलिनत्वभ्रममकरोः गन्धरसाविह किमु विद्येते विफलं भ्राम्यसि भृशविरसेस्मिन्', REFRAIN],
    meaning: 'Merely because it resembles one, you mistook the silk-cotton flower for a lotus growing on land -- but does it truly hold any fragrance or nectar? You wander about in vain over this utterly joyless thing. O bee that is my mind, you wander in vain in this joyless desert of worldly existence -- worship, worship the honeyed nectar of the sinless lotus feet of Lakshmi Narasimha.',
  },
  {
    padas: ['स्रक्चन्दनवनितादीन्विषयान्सुखदान्मत्वा तत्र विहरसे गन्धफलीसदृशा ननु तेमी भोगानन्तरदुःखकृतः स्युः', REFRAIN],
    meaning: 'Taking garlands, sandal-paste, women and other sense-pleasures to be sources of happiness, you revel among them -- but surely these enjoyments, fragrant only on the outside like the gandhaphali fruit, must in the end produce nothing but inner suffering. O bee that is my mind, you wander in vain in this joyless desert of worldly existence -- worship, worship the honeyed nectar of the sinless lotus feet of Lakshmi Narasimha.',
  },
  {
    padas: ['तव हितमेकं वचनं वक्ष्ये शृणु सुखकामो यदि सततं स्वप्ने दृष्टं सकलं हि मृषा जाग्रति च स्मर तद्वदिति', REFRAIN],
    meaning: 'I will tell you one thing for your own good -- listen, if you truly desire lasting happiness: everything seen in a dream is surely false, and remember that this waking world is exactly the same. O bee that is my mind, you wander in vain in this joyless desert of worldly existence -- worship, worship the honeyed nectar of the sinless lotus feet of Lakshmi Narasimha.',
  },
];

if (VERSES.length !== 5) throw new Error(`Expected 5 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 2) throw new Error(`Verse ${i + 1}: expected 2 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 5 verses, 2 padas each.\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

const rows = VERSES.map((v, i) => {
  const stanzaNumber = i + 1;
  const devaPadas = [...v.padas];
  devaPadas[0] += ' ।'; // danda after pada 1
  devaPadas[1] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after pada 2

  return {
    stanza_number: stanzaNumber,
    stanza_label: `Ślōka ${stanzaNumber}`,
    script_devanagari: devaPadas.join('|'),
    script_telugu: v.padas.map(p => Sanscript.t(p, 'devanagari', 'telugu')).join('|'),
    script_tamil: v.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: v.padas.map(p => addMacrons(Sanscript.t(p, 'devanagari', 'iast'))).join('|'),
    meaning_en: v.meaning,
  };
});

console.log('Sample (all 5 verses):\n');
rows.forEach(r => console.log(r, '\n'));

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:A' });
const existingCount = (res.data.values || []).slice(1).filter(r => r[0] === SLUG).length;
console.log(`Existing shloka_stanzas rows for "${SLUG}": ${existingCount}`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  if (existingCount > 0) {
    console.error(`Refusing to append: ${existingCount} rows already exist for "${SLUG}". This script only handles the pure-append (0 existing rows) case.`);
    process.exit(1);
  }
  const appendRows = rows.map(r => [
    SLUG, r.stanza_number, r.stanza_label, r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
    r.meaning_en, '', '', '', '',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: appendRows },
  });
  console.log(`Appended ${appendRows.length} rows for "${SLUG}".`);
}
