/**
 * Uploads Kala Bhairava Ashtakam (8 verses, Adi Shankaracharya) to
 * shloka_stanzas. Unlike the last few uploads, no user-supplied source text
 * existed for this one -- it was sourced from the web and cross-checked
 * across four independent sites before use:
 *   - shaivam.org/scripture/Sanskrit/1668/ssk-kalabhairava-ashtakam
 *   - greenmesg.org/stotras/shiva/kalabhairava_ashtakam.php
 *   - sanatanweb.com/kalabhairava-ashtakam
 *   - en.wikipedia.org/wiki/Kalabhairavashtakam (verse 1 only)
 *
 * Two real discrepancies were found and resolved by majority (3-of-4 / 2-of-3
 * agreement), not by picking one source blindly:
 *   - Verse 6: "karāla-daṃṣṭra-mokṣaṇaṃ" (ल) -- shaivam.org alone had
 *     "karāḷa-" (ळ); greenmesg + sanatanweb agree on ल.
 *   - Verse 7: "kapāla-mālikā-dharaṃ" ("wearer of a skull-garland") --
 *     shaivam.org alone had a garbled "mālikandharaṃ" that doesn't parse as
 *     valid Sanskrit; greenmesg + sanatanweb + an independent web search for
 *     the exact phrase all confirm "mālikādharaṃ".
 * A handful of other cosmetic spelling differences (anusvara ं vs explicit
 * class-nasal ङ्/ञ् for the same sound, e.g. "sanghanāyakaṃ" vs
 * "saṅghanāyakaṃ") were resolved toward whichever spelling the majority of
 * sources used; these don't change pronunciation or meaning.
 *
 * meaning_en is this script author's own translation composed directly from
 * the verified Sanskrit (verbatim English translations pulled from the web
 * came back paraphrased/truncated by the fetch tooling, not usable as
 * faithful quotes) -- not copied from any single site.
 *
 * Devanagari is the source of truth (as verified above); Telugu and Tamil
 * are derived via Sanscript / the custom Tamil superscript converter, IAST
 * via Sanscript with this site's existing e->ē / o->ō macron convention,
 * matching the pipeline used for every ashtottaram uploaded this session.
 *
 * Each verse is 4 padas (Panchachamara meter, commonly line-broken every
 * pada in print) with a single danda after pada 2 and the numbered
 * double-danda after pada 4 -- padas 1 and 3 carry no punctuation of their
 * own, same shape as Aditya Hridayam's closing verse.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-kala-bhairava-ashtakam.mjs          (dry run)
 *      node scripts/upload-kala-bhairava-ashtakam.mjs --write  (apply)
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
const SLUG = 'kala-bhairava-ashtakam';

const VERSES = [
  {
    padas: [
      'देवराजसेव्यमानपावनाङ्घ्रिपङ्कजं',
      'व्यालयज्ञसूत्रमिन्दुशेखरं कृपाकरम्',
      'नारदादियोगिवृन्दवन्दितं दिगंबरं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: "I worship Kāla Bhairava, the lord of the city of Kāśī, whose holy lotus feet are served by the king of the gods (Indra), who wears a serpent as his sacred thread and the moon as his crest-jewel, who is the embodiment of compassion, who goes unclothed with the directions themselves as his garment, and who is adored by Nārada and hosts of yogis.",
  },
  {
    padas: [
      'भानुकोटिभास्वरं भवाब्धितारकं परं',
      'नीलकण्ठमीप्सितार्थदायकं त्रिलोचनम्',
      'कालकालमंबुजाक्षमक्षशूलमक्षरं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, radiant as a million suns, the one who ferries souls across the ocean of worldly existence, supreme, blue-throated, three-eyed, the death of death itself, lotus-eyed, wielder of the trident, and imperishable.',
  },
  {
    padas: [
      'शूलटङ्कपाशदण्डपाणिमादिकारणं',
      'श्यामकायमादिदेवमक्षरं निरामयम्',
      'भीमविक्रमं प्रभुं विचित्रताण्डवप्रियं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, who holds the trident, axe, noose and rod, the primal cause of all, dark-bodied, the first among gods, imperishable, free from all affliction, of terrible valour, the lord who delights in the wondrous tāṇḍava dance.',
  },
  {
    padas: [
      'भुक्तिमुक्तिदायकं प्रशस्तचारुविग्रहं',
      'भक्तवत्सलं स्थितं समस्तलोकविग्रहम्',
      'विनिक्वणन्मनोज्ञहेमकिङ्किणीलसत्कटिं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, the bestower of both worldly enjoyment and liberation, of an excellent and beautiful form, ever tender to his devotees, present as the very substance of all the worlds, his waist gleaming with the tinkling of lovely golden bells.',
  },
  {
    padas: [
      'धर्मसेतुपालकं त्वधर्ममार्गनाशकं',
      'कर्मपाशमोचकं सुशर्मदायकं विभुम्',
      'स्वर्णवर्णशेषपाशशोभिताङ्गमण्डलं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, guardian of the bridge of dharma and destroyer of the path of adharma, releaser from the bonds of karma, the all-pervading giver of true bliss, his form adorned with a garland of golden-hued serpents.',
  },
  {
    padas: [
      'रत्नपादुकाप्रभाभिरामपादयुग्मकं',
      'नित्यमद्वितीयमिष्टदैवतं निरञ्जनम्',
      'मृत्युदर्पनाशनं करालदंष्ट्रमोक्षणं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, whose pair of feet is resplendent with the glow of gem-studded sandals, eternal, without a second, the beloved deity, spotless, the destroyer of the pride of death, whose fearsome fangs grant liberation.',
  },
  {
    padas: [
      'अट्टहासभिन्नपद्मजाण्डकोशसन्ततिं',
      'दृष्टिपातनष्टपापजालमुग्रशासनम्',
      'अष्टसिद्धिदायकं कपालमालिकाधरं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: "I worship Kāla Bhairava, the lord of Kāśī, whose thunderous laughter shatters the very lineage of Brahmā's cosmic egg, whose mere glance destroys the web of sin, the stern ordainer, the bestower of the eight siddhis, who wears a garland of skulls.",
  },
  {
    padas: [
      'भूतसङ्घनायकं विशालकीर्तिदायकं',
      'काशिवासलोकपुण्यपापशोधकं विभुम्',
      'नीतिमार्गकोविदं पुरातनं जगत्पतिं',
      'काशिकापुराधिनाथकालभैरवं भजे',
    ],
    meaning: 'I worship Kāla Bhairava, the lord of Kāśī, chief of the hosts of spirits, bestower of vast fame, the all-pervading one who purifies the merit and sin of those who dwell in Kāśī, versed in the path of righteousness, the ancient and eternal lord of the universe.',
  },
];

if (VERSES.length !== 8) throw new Error(`Expected 8 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 4) throw new Error(`Verse ${i + 1}: expected 4 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 8 verses, 4 padas each.\n');

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
  devaPadas[1] += ' ।'; // half-verse danda after pada 2
  devaPadas[3] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after pada 4

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

console.log('Sample (verses 1, 6, 7, 8):\n');
[0, 5, 6, 7].forEach(i => console.log(rows[i], '\n'));

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
