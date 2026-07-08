/**
 * Uploads Shiva Panchakshara Stotram (5 verses, Adi Shankaracharya) to
 * shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * The site's metadata declares stanza_count: '5'. Same pattern as
 * kala-bhairava-ashtakam and govinda-ashtakam this session: greenmesg.org
 * and bhaktinidhi.com both show a 6th verse ("panchaksharam idam punyam
 * yah pathecchiva-sannidhau...") describing the benefit of reciting this
 * panchakshara -- a phala-shruti, not part of the 5-syllable structure --
 * so it is excluded here to match the declared count of 5 exactly.
 *
 * Built-in structural verification (per the task's own instruction): each
 * verse begins with one syllable of the Panchakshara mantra "Na-Ma-Śi-Vā-Ya"
 * in order and ends "tasmai [na/ma/śi/vā/ya]-kārāya namaḥ śivāya". Confirmed
 * directly from the sourced text: verse 1 ends "tasmai nakārāya", verse 2
 * "tasmai makārāya", verse 3 "tasmai śikārāya", verse 4 "tasmai vakārāya",
 * verse 5 "tasmai yakārāya" -- the letters run Na-Ma-Śi-Vā-Ya in order,
 * confirming this is the correct text in the correct order.
 *
 * Sourcing and cross-checks: full text from greenmesg.org, cross-checked
 * against bhaktinidhi.com (IAST) and further independent search-surfaced
 * quotations for verses 2, 3, and 5 specifically. Two real discrepancies
 * found and resolved by majority agreement:
 *   - Verse 2's third pada: "mandāra-puṣpa-bahu-puṣpa-supūjitāya" (mandara
 *     blossoms and many other flowers) is confirmed by greenmesg.org and by
 *     an independent search-surfaced quote; bhaktinidhi.com alone has
 *     "mandāra-mukhya-bahu-puṣpa-..." -- kept the 2-of-3 majority reading.
 *   - Verse 5's opening word has a genuinely attested textual variant
 *     (not a transcription error): "yajña-svarūpāya" (whose form is
 *     sacrifice) is the primary reading on greenmesg.org and on another
 *     independent site, both of which also list "yakṣa-svarūpāya" (whose
 *     form is a yaksha) as a bracketed alternate; bhaktinidhi.com gives
 *     yakṣa-svarūpāya as its sole reading. Kept the majority-primary
 *     yajña-svarūpāya, noting yakṣa-svarūpāya as the attested alternate.
 * Verses 3 and 4 contain long compounds that some sites print with a
 * mid-word line-wrap (no missing text, just a column-width artifact, same
 * situation encountered with kanakadhara-stotram and soundarya-lahari this
 * session) -- rejoined into single words here rather than reproducing the
 * mid-word break.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session.
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: all 5 verses are 2 long padas each (Vasantatilaka-family
 * meter), danda after pada 1, numbered double-danda after pada 2 --
 * confirmed directly from greenmesg.org's punctuation.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-shiva-panchakshara-stotram.mjs          (dry run)
 *      node scripts/upload-shiva-panchakshara-stotram.mjs --write  (apply)
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
const SLUG = 'shiva-panchakshara-stotram';

const VERSES = [
  {
    padas: ['नागेन्द्रहाराय त्रिलोचनाय भस्माङ्गरागाय महेश्वराय', 'नित्याय शुद्धाय दिगम्बराय तस्मै नकाराय नमः शिवाय'],
    meaning: 'To him with the garland of serpents, three-eyed, smeared with sacred ash, the great lord; to the eternal, pure, sky-clad one -- to that form of the syllable Na, salutations to Shiva.',
  },
  {
    padas: ['मन्दाकिनीसलिलचन्दनचर्चिताय नन्दीश्वरप्रमथनाथमहेश्वराय', 'मन्दारपुष्पबहुपुष्पसुपूजिताय तस्मै मकाराय नमः शिवाय'],
    meaning: 'To him anointed with the waters of the Mandakini and with sandal paste, lord of Nandi and lord of the Pramatha hosts, the great lord; to him well worshipped with mandara blossoms and many other flowers -- to that form of the syllable Ma, salutations to Shiva.',
  },
  {
    padas: ['शिवाय गौरीवदनाब्जवृन्दसूर्याय दक्षाध्वरनाशकाय', 'श्रीनीलकण्ठाय वृषध्वजाय तस्मै शिकाराय नमः शिवाय'],
    meaning: "To Shiva, the sun to the cluster of Gauri's lotus face, the destroyer of Daksha's sacrifice; to the glorious blue-throated one, whose banner bears the bull -- to that form of the syllable Śi, salutations to Shiva.",
  },
  {
    padas: ['वसिष्ठकुम्भोद्भवगौतमार्यमुनीन्द्रदेवार्चितशेखराय', 'चन्द्रार्कवैश्वानरलोचनाय तस्मै वकाराय नमः शिवाय'],
    meaning: 'To him whose crest is worshipped by Vasishtha, by the pitcher-born Agastya, by Gautama and other noble sage-lords and gods; whose three eyes are the moon, the sun, and fire -- to that form of the syllable Vā, salutations to Shiva.',
  },
  {
    padas: ['यज्ञस्वरूपाय जटाधराय पिनाकहस्ताय सनातनाय', 'दिव्याय देवाय दिगम्बराय तस्मै यकाराय नमः शिवाय'],
    meaning: 'To him whose very form is sacrifice, who wears matted locks, who holds the Pinaka bow in hand, the eternal one; to the divine, radiant, sky-clad one -- to that form of the syllable Ya, salutations to Shiva.',
  },
];

if (VERSES.length !== 5) throw new Error(`Expected 5 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 2) throw new Error(`Verse ${i + 1}: expected 2 padas, got ${v.padas.length}`);
});
const EXPECTED_LETTERS = ['नकाराय', 'मकाराय', 'शिकाराय', 'वकाराय', 'यकाराय'];
VERSES.forEach((v, i) => {
  if (!v.padas[1].includes(EXPECTED_LETTERS[i])) {
    throw new Error(`Verse ${i + 1}: expected refrain to contain "${EXPECTED_LETTERS[i]}" (panchakshara letter check failed) -- verses may be out of order or wrong text.`);
  }
});
console.log('Structure check passed: 5 verses, 2 padas each, Na-Ma-Śi-Vā-Ya letter sequence confirmed.\n');

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
