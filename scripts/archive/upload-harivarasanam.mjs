/**
 * Uploads Harivarasanam (Hariharatmaja Ashtakam, 8 verses, composed by
 * Kambangudi Kulathur Srinivasa Bhagavathar) to shloka_stanzas. Sourced
 * from the web, no user-supplied text.
 *
 * This hymn is traditionally sung nightly in Malayalam script at
 * Sabarimala, but its vocabulary is Sanskrit throughout, so it is
 * transliterated here the same way as any other Sanskrit-vocabulary
 * stotra -- Devanagari as the source of truth, Telugu/Tamil/IAST derived
 * via Sanscript / the custom Tamil superscript converter.
 *
 * The site's metadata declares stanza_count: '8'. This matched directly
 * with no reconciliation needed: every source checked presents exactly 8
 * verses (hence its alternate name "Hariharatmaja Ashtakam"), each 4 padas
 * with the identical refrain "hariharātmajaṁ dēvamāśrayē" ("I take refuge
 * in you, the god who is the child of Hari and Hara") as the 4th pada.
 *
 * Sourcing and cross-checks: full text from bhaktibharat.com, with every
 * single verse (1 through 8) independently re-confirmed word-for-word via
 * targeted search against further sources (hinduismfaq.com and others) --
 * no discrepancies of any kind turned up across any of the 8 verses. This
 * is consistent with the hymn's status as an extremely famous, tightly
 * standardized text (composed in the 20th century, not an ancient work
 * with centuries of manuscript drift), though the cross-check was still
 * performed in full per the pipeline's standing rule.
 *
 * meaning_en is this script author's own translation, composed in a
 * gentle, devotional lullaby register (as this hymn is sung to lull
 * Ayyappa to sleep each night), distinct from the more philosophical
 * register used for other stotras in this pipeline.
 *
 * Pada structure: all 8 verses are 4 padas each, danda after pada 2 only,
 * nothing after padas 1/3, numbered double-danda after pada 4 -- confirmed
 * directly from source punctuation.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-harivarasanam.mjs          (dry run)
 *      node scripts/upload-harivarasanam.mjs --write  (apply)
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
const SLUG = 'harivarasanam';

const REFRAIN = 'हरिहरात्मजं देवमाश्रये';

const VERSES = [
  {
    padas: ['हरिवरासनं विश्वमोहनम्', 'हरिदधीश्वरमाराध्यपादुकम्', 'अरिविमर्दनं नित्यनर्तनम्', REFRAIN],
    meaning: 'Seated upon the finest of thrones, enchanter of the whole world, whose sacred sandals are worshipped even by the supreme lord Hari; crusher of enemies, the eternal dancer -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['चरणकीर्तनं भक्तमानसम्', 'भरणलोलुपं नर्तनालसम्', 'अरुणभासुरं भूतनायकम्', REFRAIN],
    meaning: 'Whose feet are sung in praise, who dwells in the hearts of his devotees, ever eager to nurture and sustain them, gently weary from his sacred dance; radiant as the dawn, lord of all beings -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['प्रणयसत्यकं प्राणनायकम्', 'प्रणतकल्पकं सुप्रभाञ्चितम्', 'प्रणवमन्दिरं कीर्तनप्रियम्', REFRAIN],
    meaning: 'Steadfast and true in love, lord of all life, a wish-granting tree to those who bow before him, adorned with beautiful radiance; the very abode of the sacred syllable Om, delighting in devotional song -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['तुरगवाहनं सुन्दराननम्', 'वरगदायुधं वेदवर्णितम्', 'गुरुकृपाकरं कीर्तनप्रियम्', REFRAIN],
    meaning: 'Whose mount is a horse, of beautiful face, bearing the fine mace as his weapon, praised in the Vedas; bestower of a gurus grace, delighting in devotional song -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['त्रिभुवनार्चितं देवतात्मकम्', 'त्रिनयनप्रभुं दिव्यदेशिकम्', 'त्रिदशपूजितं चिन्तितप्रदम्', REFRAIN],
    meaning: 'Worshipped by the three worlds, the very essence of all gods, lord related to the three-eyed one, a divine guide; worshipped by all the celestials, granter of every hearts wish -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['भवभयापहं भावुकावकम्', 'भुवनमोहनं भूतिभूषणम्', 'धवलवाहनं दिव्यवारणम्', REFRAIN],
    meaning: 'Remover of the fear of worldly existence, protector of the devout, enchanter of all the worlds, adorned with sacred ash; whose mount is white, a divine elephant of grace -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['कलमृदुस्मितं सुन्दराननम्', 'कलभकोमलं गात्रमोहनम्', 'कलभकेसरीमाजिवाहनम्', REFRAIN],
    meaning: 'Of sweet and gentle smile, beautiful-faced, tender as a young elephant calf, enchanting in every limb; whose steed is the young lion -- in you, child of Hari and Hara, I take refuge.',
  },
  {
    padas: ['श्रितजनप्रियं चिन्तितप्रदम्', 'श्रुतिविभूषणं साधुजीवनम्', 'श्रुतिमनोहरं गीतलालसम्', REFRAIN],
    meaning: 'Beloved of those who take refuge in him, granter of every wish, the very ornament of the Vedas, the life of the virtuous; delightful to hear, ever longing for song -- in you, child of Hari and Hara, I take refuge.',
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
  devaPadas[1] += ' ।'; // danda after pada 2
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

console.log('Sample (all 8 verses):\n');
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
