/**
 * Uploads Kanakadhara Stotram (21 verses, Adi Shankaracharya) to
 * shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * The site's metadata declares stanza_count: '21'. The stotra is widely
 * published in two forms: a "core" 18-verse version (found essentially
 * verbatim across dozens of sites) and a 21-verse version that inserts
 * 3 extra "namo'stu ..." verses (explicitly labelled "adhika slokah" --
 * additional verses -- on some sites) between the core version's verses
 * 12 and 13. 21 = 18 + 3, matching the site's declared count exactly.
 *
 * Sourcing and cross-checks performed before use:
 *   - Verses 1-12 and 16-21 (= core verses 1-12 and 13-18): cross-checked
 *     against greenmesg.org, sanskritdocuments.org (verses 1-2 only, per
 *     that site's no-reproduction request -- used for verification, not
 *     copied from), and amritanilayam.org (verses 3, 4, 7, 8 -- that page's
 *     own verse *numbering* differs from greenmesg's, but the *wording* of
 *     every verse checked matched exactly regardless of the number attached
 *     to it, so greenmesg's more standard 1-18 ordering was kept).
 *   - One correction applied: verse 1's "mAggalyadAstu" is corrected to
 *     "mAggalyadA'stu" (an explicit avagraha marking the a+a sandhi elision)
 *     per sanskritdocuments.org and per greenmesg's own consistent usage of
 *     the avagraha at every other such elision in this same text (e.g.
 *     "muravidviSo'pi", "bhagavato'pi", "matayo'pi") -- greenmesg appears to
 *     have simply dropped it once, in verse 1 only.
 *   - Verses 13-15 (the 3 inserted "namo'stu" verses): cross-checked word by
 *     word against sanatanadhara.com and hariome.com -- both independently
 *     confirm identical text at the same position.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit (matching the approach used for kala-bhairava-ashtakam),
 * since verbatim web translations couldn't be extracted cleanly through
 * available tooling.
 *
 * Telugu and Tamil are derived from the verified Devanagari via Sanscript /
 * the custom Tamil superscript converter; IAST via Sanscript with this
 * site's e->e overline / o->o overline macron convention -- same pipeline
 * used for every prior upload this session.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-kanakadhara-stotram.mjs          (dry run)
 *      node scripts/upload-kanakadhara-stotram.mjs --write  (apply)
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
const SLUG = 'kanakadhara-stotram';

const VERSES = [
  {
    padas: [
      'अङ्गं हरेः पुलकभूषणमाश्रयन्ती',
      'भृङ्गाङ्गनेव मुकुलाभरणं तमालम्',
      'अङ्गीकृताखिलविभूतिरपाङ्गलीला',
      "माङ्गल्यदाऽस्तु मम मङ्गलदेवतायाः",
    ],
    meaning: 'May she who resorts to the body of Hari as her ornament of thrilled delight, like a female bee upon a tamāla tree in bud, she whose sidelong glance bestows every fortune, that goddess of auspiciousness, grant me auspiciousness.',
  },
  {
    padas: [
      'मुग्धा मुहुर्विदधती वदने मुरारेः',
      'प्रेमत्रपाप्रणिहितानि गतागतानि',
      'माला दृशोर्मधुकरीव महोत्पले या',
      'सा मे श्रियं दिशतु सागरसम्भवायाः',
    ],
    meaning: "May that garland of glances of the ocean-born goddess -- innocent, moving again and again to and from the face of Murāri (Viṣṇu) with love and shyness, like a line of bees upon a great lotus -- bestow prosperity on me.",
  },
  {
    padas: [
      'विश्वामरेन्द्रपदविभ्रमदानदक्षम्',
      'आनन्दहेतुरधिकं मुरविद्विषोऽपि',
      'ईषन्निषीदतु मयि क्षणमीक्षणार्धम्',
      'इन्दीवरोदरसहोदरमिन्दिरायाः',
    ],
    meaning: 'May the half-glance of Indirā (Lakshmi), capable of granting even the glory of the lord of all the immortals, the very cause of joy even to Viṣṇu, dark and tender as the heart of a blue lotus, rest upon me if only for an instant.',
  },
  {
    padas: [
      'आमीलिताक्षमधिगम्य मुदा मुकुन्दम्',
      'आनन्दकन्दमनिमेषमनङ्गतन्त्रम्',
      'आकेकरस्थितकनीनिकपक्ष्मनेत्रं',
      'भूत्यै भवेन्मम भुजङ्गशयाङ्गनायाः',
    ],
    meaning: 'May the unwinking, love-laden eye of the goddess who reclines on the serpent-couch -- half-closed in joy as she gazes on Mukunda, its lashes gently curved, the very root of bliss -- become the source of my prosperity.',
  },
  {
    padas: [
      'बाह्वन्तरे मधुजितः श्रितकौस्तुभे या',
      'हारावलीव हरिनीलमयी विभाति',
      'कामप्रदा भगवतोऽपि कटाक्षमाला',
      'कल्याणमावहतु मे कमलालयायाः',
    ],
    meaning: 'May the garland of glances of the lotus-dwelling goddess, which shines like a chain of sapphires upon the chest of the slayer of Madhu (Viṣṇu) beside the Kaustubha gem, and which grants desires even to the Lord himself, bring me good fortune.',
  },
  {
    padas: [
      'कालाम्बुदालिललितोरसि कैटभारेर्',
      'धाराधरे स्फुरति या तडिदङ्गनेव',
      'मातुः समस्तजगतां महनीयमूर्तिर्',
      'भद्राणि मे दिशतु भार्गवनन्दनायाः',
    ],
    meaning: 'May the venerable form of the mother of all the worlds, daughter of Bhṛgu, who flashes like a streak of lightning upon the dark rain-cloud that is the graceful chest of the enemy of Kaiṭabha (Viṣṇu), grant me all blessings.',
  },
  {
    padas: [
      'प्राप्तं पदं प्रथमतः किल यत्प्रभावान्',
      'माङ्गल्यभाजि मधुमाथिनि मन्मथेन',
      'मय्यापतेत्तदिह मन्थरमीक्षणार्धं',
      'मन्दालसं च मकरालयकन्यकायाः',
    ],
    meaning: 'May that same slow, languid half-glance of the daughter of the ocean, by whose power Manmatha (the god of love) first attained a place upon the auspicious form of Madhusūdana, fall also upon me.',
  },
  {
    padas: [
      'दद्याद् दयानुपवनो द्रविणाम्बुधाराम्',
      'अस्मिन्नकिञ्चनविहङ्गशिशौ विषण्णे',
      'दुष्कर्मघर्ममपनीय चिराय दूरं',
      'नारायणप्रणयिनीनयनाम्बुवाहः',
    ],
    meaning: 'May the rain-cloud that is the eye of the beloved of Nārāyaṇa, moved by the gentle breeze of compassion, shower a stream of wealth upon this poor, grieving fledgling bird (myself), driving far away the heat of my past misdeeds forever.',
  },
  {
    padas: [
      'इष्टा विशिष्टमतयोऽपि यया दयार्द्र',
      'दृष्ट्या त्रिविष्टपपदं सुलभं लभन्ते',
      'दृष्टिः प्रहृष्टकमलोदरदीप्तिरिष्टां',
      'पुष्टिं कृषीष्ट मम पुष्करविष्टरायाः',
    ],
    meaning: 'May the compassion-laden glance of the goddess seated on the lotus throne -- dear even to sages of the highest wisdom, by which the state of heaven itself is easily attained, radiant as the joyous heart of a lotus -- draw forth the desired nourishment for me.',
  },
  {
    padas: [
      'गीर्देवतेति गरुडध्वजसुन्दरीति',
      'शाकम्भरीति शशिशेखरवल्लभेति',
      'सृष्टिस्थितिप्रलयकेलिषु संस्थितायै',
      'तस्यै नमस्त्रिभुवनैकगुरोस्तरुण्यै',
    ],
    meaning: 'Salutations to her who is known as the goddess of speech, as the beautiful consort of Garuḍa-bannered Viṣṇu, as Śākambharī, and as the beloved of the moon-crested Śiva -- who abides through the sport of creation, preservation and dissolution, the eternal consort of the one teacher of the three worlds.',
  },
  {
    padas: [
      "श्रुत्यै नमोऽस्तु शुभकर्मफलप्रसूत्यै",
      "रत्यै नमोऽस्तु रमणीयगुणार्णवायै",
      "शक्त्यै नमोऽस्तु शतपत्रनिकेतनायै",
      "पुष्ट्यै नमोऽस्तु पुरुषोत्तमवल्लभायै",
    ],
    meaning: 'Salutations to her as the Śruti (sacred scripture) who bestows the fruit of righteous deeds; salutations to her as Rati, the ocean of lovely virtues; salutations to her as Śakti, dweller of the hundred-petalled lotus; salutations to her as Puṣṭi, the beloved of the Supreme Person.',
  },
  {
    padas: [
      'नमोऽस्तु नालीकनिभाननायै',
      'नमोऽस्तु दुग्धोदधिजन्मभूत्यै',
      'नमोऽस्तु सोमामृतसोदरायै',
      'नमोऽस्तु नारायणवल्लभायै',
    ],
    meaning: 'Salutations to her whose face resembles a lotus; salutations to her who was born of the ocean of milk; salutations to her who is sister to the nectar-moon; salutations to her, the beloved of Nārāyaṇa.',
  },
  {
    padas: [
      'नमोऽस्तु हेमाम्बुजपीठिकायै',
      'नमोऽस्तु भूमण्डलनायिकायै',
      'नमोऽस्तु देवादिदयापरायै',
      'नमोऽस्तु शार्ङ्गायुधवल्लभायै',
    ],
    meaning: 'Salutations to her who is enthroned upon a golden lotus; salutations to her, the mistress of the whole earth; salutations to her who is supremely compassionate to the gods and all beings; salutations to her, the beloved of the wielder of the Śārṅga bow (Viṣṇu).',
  },
  {
    padas: [
      'नमोऽस्तु देव्यै भृगुनन्दनायै',
      'नमोऽस्तु विष्णोरुरसि स्थितायै',
      'नमोऽस्तु लक्ष्म्यै कमलालयायै',
      'नमोऽस्तु दामोदरवल्लभायै',
    ],
    meaning: 'Salutations to the goddess, daughter of Bhṛgu; salutations to her who abides on the chest of Viṣṇu; salutations to Lakshmi, dweller of the lotus; salutations to her, the beloved of Dāmodara.',
  },
  {
    padas: [
      'नमोऽस्तु कान्त्यै कमलेक्षणायै',
      'नमोऽस्तु भूत्यै भुवनप्रसूत्यै',
      'नमोऽस्तु देवादिभिरर्चितायै',
      'नमोऽस्तु नन्दात्मजवल्लभायै',
    ],
    meaning: 'Salutations to her, lotus-eyed loveliness; salutations to her, prosperity, mother of the worlds; salutations to her who is worshipped by the gods and all beings; salutations to her, the beloved of the son of Nanda (Krishna).',
  },
  {
    padas: [
      'सम्पत्कराणि सकलेन्द्रियनन्दनानि',
      'साम्राज्यदानविभवानि सरोरुहाक्षि',
      'त्वद्वन्दनानि दुरिताहरणोद्यतानि',
      'मामेव मातरनिशं कलयन्तु मान्ये',
    ],
    meaning: 'O lotus-eyed, venerable mother, may my constant salutations to you -- which bring prosperity, delight all the senses, grant the wealth of sovereignty, and are ever ready to remove misfortune -- ever be mine.',
  },
  {
    padas: [
      'यत्कटाक्षसमुपासनाविधिः',
      'सेवकस्य सकलार्थसम्पदः',
      'संतनोति वचनाङ्गमानसैस्',
      'त्वां मुरारिहृदयेश्वरीं भजे',
    ],
    meaning: 'I worship you, the mistress of the heart of Murāri (Viṣṇu), whose very manner of worshipping your sidelong glance, offered with word, body and mind, extends to the devotee every kind of wealth.',
  },
  {
    padas: [
      'सरसिजनिलये सरोजहस्ते',
      'धवलतमांशुकगन्धमाल्यशोभे',
      'भगवति हरिवल्लभे मनोज्ञे',
      'त्रिभुवनभूतिकरि प्रसीद मह्यम्',
    ],
    meaning: 'O goddess dwelling upon the lotus, lotus in hand, resplendent in purest-white garments, fragrance and garlands, beloved of Hari, of beautiful form, bestower of prosperity on the three worlds -- be gracious unto me.',
  },
  {
    padas: [
      'दिग्घस्तिभिः कनककुम्भमुखावसृष्ट',
      'स्वर्वाहिनीविमलचारुजलप्लुताङ्गीम्',
      'प्रातर्नमामि जगतां जननीमशेष',
      'लोकाधिनाथगृहिणीममृताब्धिपुत्रीम्',
    ],
    meaning: 'At dawn I bow to the mother of all the worlds, daughter of the ocean of nectar, consort of the lord of every realm, her form bathed in the pure, lovely waters of the celestial river poured from golden pitchers by the elephants of the directions.',
  },
  {
    padas: [
      'कमले कमलाक्षवल्लभे त्वं',
      'करुणापूरतरङ्गितैरपाङ्गैः',
      'अवलोकय मामकिञ्चनानां',
      'प्रथमं पात्रमकृत्रिमं दयायाः',
    ],
    meaning: 'O Kamalā, beloved of the lotus-eyed one, look upon me with your sidelong glances rippling with waves of compassion -- me, the very first and truest object of your mercy among the destitute.',
  },
  {
    padas: [
      'स्तुवन्ति ये स्तुतिभिरमूभिरन्वहं',
      'त्रयीमयीं त्रिभुवनमातरं रमाम्',
      'गुणाधिका गुरुतरभाग्यभागिनो',
      'भवन्ति ते भुवि बुधभाविताशयाः',
    ],
    meaning: 'Those who daily praise Ramā, embodiment of the three Vedas and mother of the three worlds, with these hymns, become exalted in virtue and blessed with the greatest fortune, their minds cherished by the wise upon this earth.',
  },
];

if (VERSES.length !== 21) throw new Error(`Expected 21 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 4) throw new Error(`Verse ${i + 1}: expected 4 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 21 verses, 4 padas each.\n');

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

console.log('Sample (verses 1, 12, 13, 15, 21):\n');
[0, 11, 12, 14, 20].forEach(i => console.log(rows[i], '\n'));

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
