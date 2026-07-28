/**
 * Uploads Shiva Tandava Stotram (17 verses, attributed to Ravana) to
 * shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * The site's metadata declares stanza_count: '17'. The stotra is overwhelmingly
 * published in a "core" 15-verse form (verses 1-13 in Panchachamara meter, plus
 * a closing pair: "imam hi nityam..." and the Vasantatilaka phala-shruti verse
 * "pujavasana-samaye...", both explicitly attributed to Ravana and ending
 * "iti shri-ravana-viracitam shiva-tandava-stotram sampurnam"). A separate,
 * also widely-circulated 17-verse tradition inserts 2 extra verses --
 * "nilimpanatha-nagari kadamba-maula-mallika..." and "prachanda-vadavanala-
 * prabha-shubha-pracharani..." -- between core verse 13 and the closing pair,
 * pushing the closing pair from positions 14-15 to 16-17. 15 core + 2 inserted
 * = 17, matching the site's declared count exactly (same shape as the
 * kanakadhara-stotram case: an 18-verse core plus a 3-verse insertion).
 *
 * Sourcing and cross-checks performed before use:
 *   - Verses 1-13 and 16-17 (= core verses 1-13 and 14-15): cross-checked
 *     word-by-word across greenmesg.org, drikpanchang.com, and shlokam.org
 *     (three independent full-text renderings), all of which present exactly
 *     these 15 verses with the "sampurnam" colophon and no more.
 *   - Verses 14-15 (the 2 inserted verses): their text and -- critically --
 *     their position (immediately after core verse 13, immediately before the
 *     closing pair) were independently confirmed across FOUR sources:
 *     karmkandvidhi.in, hi.wikipedia.org, hindi.webdunia.com, and deoghar.co.
 *     deoghar.co additionally states explicitly that 2 of the stotra's 17
 *     verses were added after Ravana's original 15 (though its own prose
 *     mislabels them as "the last 2" -- contradicted by its own verse-by-verse
 *     text, which places them at positions 14-15 like every other source
 *     checked, sandwiched before the original closing pair).
 *
 * Real discrepancies found and resolved (majority agreement, or grammatically
 * valid reading over an isolated garbled variant, per this pipeline's rule):
 *   - Verse 2: "dhagad-dhagad-dhagajjvalal-lalata..." -- greenmesg alone drops
 *     the "v" (jjalal- instead of jjvalal-); drikpanchang + shlokam.org agree
 *     on jjvalal-.
 *   - Verse 8: "jagad-dhurandharah" (explicit dental n) vs "jagad-dhuram-
 *     dharah" (anusvara) -- cosmetic, same pronunciation; greenmesg + shlokam
 *     use the anusvara form, kept for majority.
 *   - Verse 12: "garishtha-ratna-loshthayoh" ("a weighty jewel and a clod") --
 *     drikpanchang alone has "varishtha-" ("best jewel"); greenmesg + shlokam
 *     + deoghar.co all agree on garishtha-, confirmed 3-of-4.
 *   - Verse 13: "vimukta-lola-locano" -- drikpanchang alone has a doubled
 *     "vilola-lola-locano" that reads as a duplication artifact; greenmesg +
 *     shlokam.org agree on vimukta-lola-locano.
 *   - Verse 14 (inserted): "nirbhaksharan-madhushnika-" is the reading given by
 *     karmkandvidhi.in, hi.wikipedia.org, hindi.webdunia.com and deoghar.co
 *     (4 of 5 sources); ramcharit.in alone has a transposed "nirbharakshan-"
 *     that doesn't parse as cleanly. Likewise "kadamba-maula-mallika" (4
 *     sources) over ramcharit.in's isolated "kadamba-mauli-mallika". For
 *     "vinodini-mahar-nisham" vs "vinodinim-mahanisham": webdunia and
 *     deoghar.co drop the "r" (giving the non-word "mahanisham"), while
 *     karmkandvidhi.in keeps "mahar-nisham" -- the grammatically real compound
 *     ahar-nisham ("day and night"). Kept the grammatically valid reading per
 *     this pipeline's precedent of preferring valid Sanskrit over a majority
 *     reading that doesn't parse. Same reasoning for "parishrayam" (object of
 *     "tanotu") over webdunia/deoghar's anusvara-dropped "parishraya".
 *   - Verse 15 (inserted): "mantra-bhushano" ("adorned with the mantra") is
 *     the grammatically valid reading (hi.wikipedia.org); webdunia.com and
 *     deoghar.co instead give "mantra-bhushago", which is not a standard
 *     Sanskrit word and was treated as a transcription slip.
 *
 * meaning_en for verses 1-13 and 16-17 is this script author's own translation
 * composed from the verified Sanskrit (matching the approach used for every
 * prior upload this session, since verbatim web translations could not be
 * extracted cleanly through available tooling). For verses 14-15 (the 2
 * inserted verses), meaning_en is left BLANK: these verses are rare, sparsely
 * documented outside a handful of Hindi lyrics sites, several of the real
 * textual discrepancies above sit inside these two verses specifically, and
 * the compounds are genuinely ambiguous (e.g. "tad-anga-ja-tvisham cayah" in
 * verse 14 admits more than one plausible parse). Rather than present a
 * shaky guess as a confident translation, this follows the same precedent as
 * upload-lalitha-sahasranamam.mjs and upload-aditya-hridayam.mjs: leave it
 * blank when not confident, don't fabricate.
 *
 * Devanagari is the source of truth (as verified above); Telugu and Tamil are
 * derived via Sanscript / the custom Tamil superscript converter, IAST via
 * Sanscript with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: verses 1-13 and 14-16 are Panchachamara meter, printed
 * (and treated here) as 2 long padas per verse, danda after pada 1 and the
 * numbered double-danda after pada 2. Verse 17 (the phala-shruti, a
 * different and shorter meter -- Vasantatilaka) is 4 padas, danda after pada
 * 2 only, nothing after padas 1/3, matching the convention already used for
 * Aditya Hridayam's closing verse of a different meter than its main body.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-shiva-tandava-stotram.mjs          (dry run)
 *      node scripts/upload-shiva-tandava-stotram.mjs --write  (apply)
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
const SLUG = 'shiva-tandava-stotram';

const VERSES = [
  {
    padas: [
      'जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्',
      'डमड्डमड्डमड्डमन्निनादवड्डमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम्',
    ],
    meaning: 'May Shiva, who -- his throat purified by the stream of water falling from the forest of his matted locks, wearing there a long garland of tall serpents -- performed the fierce tandava dance to the resounding damad-damad-damad beat of his damaru drum, bestow auspiciousness upon us.',
  },
  {
    padas: [
      'जटाकटाहसम्भ्रमभ्रमन्निलिम्पनिर्झरी विलोलवीचिवल्लरीविराजमानमूर्धनि',
      'धगद्धगद्धगज्ज्वलल्ललाटपट्टपावके किशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम',
    ],
    meaning: 'My delight is fixed every moment on him whose head is resplendent with the heavenly river whirling in confusion within the cavern of his matted hair, its restless creeper-like waves shimmering, and on whose forehead blazes fire crackling dhagad-dhagad, he who wears the crescent moon as his crest.',
  },
  {
    padas: [
      'धराधरेन्द्रनन्दिनीविलासबन्धुबन्धुर स्फुरद्दिगन्तसन्ततिप्रमोदमानमानसे',
      'कृपाकटाक्षधोरणीनिरुद्धदुर्धरापदि क्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि',
    ],
    meaning: 'May my mind find its delight in that sky-clad being, gracefully bound to the sportive daughter of the mountain-king, his heart ever rejoicing in the endless expanse of the horizons, whose stream of compassionate glances holds back even the most stubborn calamities.',
  },
  {
    padas: [
      'जटाभुजङ्गपिङ्गलस्फुरत्फणामणिप्रभा कदम्बकुङ्कुमद्रवप्रलिप्तदिग्वधूमुखे',
      'मदान्धसिन्धुरस्फुरत्त्वगुत्तरीयमेदुरे मनो विनोदमद्भुतं बिभर्तु भूतभर्तरि',
    ],
    meaning: 'May my mind bear wondrous delight in the lord and sustainer of all beings, in whom the tawny gleam of the jewels on his serpents\' hoods anoints the faces of the directions like flowing kumkum-red kadamba pollen, and who is richly clothed in the flayed hide of a rut-maddened elephant.',
  },
  {
    padas: [
      'सहस्रलोचनप्रभृत्यशेषलेखशेखर प्रसूनधूलिधोरणी विधूसराङ्घ्रिपीठभूः',
      'भुजङ्गराजमालया निबद्धजाटजूटकः श्रियै चिराय जायतां चकोरबन्धुशेखरः',
    ],
    meaning: 'May he whose crest bears the moon, kin of the cakora bird, whose foot-stool is grayed by the constant dust of flowers offered by Indra of the thousand eyes and all the other crowned gods, and whose matted hair-knot is bound with a garland of serpent-kings, become the source of enduring prosperity for us.',
  },
  {
    padas: [
      'ललाटचत्वरज्वलद्धनञ्जयस्फुलिङ्गभा निपीतपञ्चसायकं नमन्निलिम्पनायकम्',
      'सुधामयूखलेखया विराजमानशेखरं महाकपालिसम्पदेशिरोजटालमस्तु नः',
    ],
    meaning: 'May his matted crown, radiant with the sparks of fire blazing across the courtyard of his forehead and glowing with the crescent moon\'s nectar-rays, before whom the lord of the gods bows -- he who once swallowed up the five arrows of desire -- grant us the wealth of the great skull-bearer.',
  },
  {
    padas: [
      'करालभालपट्टिकाधगद्धगद्धगज्ज्वलद्धनञ्जयाहुतीकृतप्रचण्डपञ्चसायके',
      'धराधरेन्द्रनन्दिनीकुचाग्रचित्रपत्रकप्रकल्पनैकशिल्पिनि त्रिलोचने रतिर्मम',
    ],
    meaning: 'My delight is in the three-eyed one, on whose fearsome forehead-plate the fire crackling dhagad-dhagad once made a fierce oblation of the five arrows of desire, and who alone is the artist skilled in painting decorative designs upon the breasts of the mountain-king\'s daughter.',
  },
  {
    padas: [
      'नवीनमेघमण्डली निरुद्धदुर्धरस्फुरत्कुहूनिशीथिनीतमः प्रबन्धबद्धकन्धरः',
      'निलिम्पनिर्झरीधरस्तनोतु कृत्तिसिन्धुरः कलानिधानबन्धुरः श्रियं जगद्धुरंधरः',
    ],
    meaning: 'May he whose throat is bound by the unchecked darkness of the new-moon night, dense as a bank of fresh monsoon clouds, who bears the celestial river in his hair, who is clothed in an elephant hide, gracious treasure-house of the crescent moon and bearer of the world\'s burden, extend prosperity to us.',
  },
  {
    padas: [
      'प्रफुल्लनीलपङ्कजप्रपञ्चकालिमप्रभावलम्बिकण्ठकन्दलीरुचिप्रबद्धकन्धरम्',
      'स्मरच्छिदं पुरच्छिदं भवच्छिदं मखच्छिदं गजच्छिदान्धकच्छिदं तमन्तकच्छिदं भजे',
    ],
    meaning: 'I worship him whose throat is dark and lovely as a fully-blossomed blue lotus, the slayer of Kama, the destroyer of the triple city, the ender of worldly existence, the ravager of the sacrifice, the slayer of the elephant-demon and of Andhaka, and the very destroyer of Death himself.',
  },
  {
    padas: [
      'अखर्वसर्वमङ्गलाकलाकदम्बमञ्जरीरसप्रवाहमाधुरीविजृम्भणामधुव्रतम्',
      'स्मरान्तकं पुरान्तकं भवान्तकं मखान्तकं गजान्तकान्धकान्तकं तमन्तकान्तकं भजे',
    ],
    meaning: 'I worship him who is like the bee that revels in the sweet flow of nectar streaming from the abundant, all-auspicious kadamba blossoms, the ender of Kama, the ender of the triple city, the ender of worldly bondage, the ender of the sacrifice, the ender of the elephant-demon and of Andhaka, and the very ender of Death.',
  },
  {
    padas: [
      'जयत्वदभ्रविभ्रमभ्रमद्भुजङ्गमश्वसद्विनिर्गमत्क्रमस्फुरत्करालभालहव्यवाट्',
      'धिमिद्धिमिद्धिमिध्वनन्मृदङ्गतुङ्गमङ्गलध्वनिक्रमप्रवर्तितप्रचण्डताण्डवः शिवः',
    ],
    meaning: 'Victory to Shiva, on whose fearsome forehead the sacrificial fire flickers, fanned by the breath of serpents whirling about in boundless splendor, and who unleashes his fierce tandava dance, set in motion by the auspicious rhythm of the mridanga drums resounding dhimid-dhimid-dhimid.',
  },
  {
    padas: [
      'दृषद्विचित्रतल्पयोर्भुजङ्गमौक्तिकस्रजोर्गरिष्ठरत्नलोष्ठयोः सुहृद्विपक्षपक्षयोः',
      'तृणारविन्दचक्षुषोः प्रजामहीमहेन्द्रयोः समप्रवृत्तिकः कदा सदाशिवं भजाम्यहम्',
    ],
    meaning: 'When shall I, with mind and conduct made equal toward a stone slab and a jewelled bed, toward a serpent and a pearl garland, toward a weighty gem and a lump of clay, toward friend and foe, toward a blade of grass and a lotus-like eye, toward a common subject and a mighty king, worship Sadashiva forever?',
  },
  {
    padas: [
      'कदा निलिम्पनिर्झरीनिकुञ्जकोटरे वसन् विमुक्तदुर्मतिः सदा शिरःस्थमञ्जलिं वहन्',
      'विमुक्तलोललोचनो ललामभाललग्नकः शिवेति मन्त्रमुच्चरन्कदा सुखी भवाम्यहम्',
    ],
    meaning: 'When shall I, dwelling in a hollow bower by the celestial river, ever free from evil thought, always holding my joined palms above my head, my restless eyes at last stilled, my forehead marked with the sacred sign, become happy, forever uttering the mantra Shiva?',
  },
  {
    padas: [
      'निलिम्पनाथनागरी कदम्बमौलमल्लिकानिगुम्फनिर्भक्षरन्मधूष्णिकामनोहरः',
      'तनोतु नो मनोमुदं विनोदिनीमहर्निशं परिश्रयं परं पदं तदङ्गजत्विषां चयः',
    ],
    meaning: '',
  },
  {
    padas: [
      'प्रचण्डवाडवानलप्रभाशुभप्रचारणी महाष्टसिद्धिकामिनीजनावहूतजल्पना',
      'विमुक्तवामलोचनो विवाहकालिकध्वनिः शिवेति मन्त्रभूषणो जगज्जयाय जायताम्',
    ],
    meaning: '',
  },
  {
    padas: [
      'इमं हि नित्यमेवमुक्तमुत्तमोत्तमं स्तवं पठन्स्मरन्ब्रुवन्नरो विशुद्धिमेतिसंततम्',
      'हरे गुरौ सुभक्तिमाशु याति नान्यथा गतिं विमोहनं हि देहिनां सुशङ्करस्य चिन्तनम्',
    ],
    meaning: 'The man who constantly recites, remembers or speaks this most excellent eternal hymn attains lasting purity, and swiftly gains true devotion to Hari and Guru -- there is no other path -- for the very contemplation of the auspicious Shankara bewilders all worldly delusion for the embodied soul.',
  },
  {
    padas: [
      'पूजावसानसमये दशवक्त्रगीतं',
      'यः शम्भुपूजनपरं पठति प्रदोषे',
      'तस्य स्थिरां रथगजेन्द्रतुरङ्गयुक्तां',
      'लक्ष्मीं सदैव सुमुखीं प्रददाति शम्भुः',
    ],
    meaning: 'Whoever, devoted to the worship of Shambhu, recites at dusk this hymn sung by the ten-faced one (Ravana) at the close of worship, to him Shambhu ever grants a lasting fortune, gracious and smiling, complete with chariots, elephants, and horses.',
  },
];

if (VERSES.length !== 17) throw new Error(`Expected 17 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  const expectedPadas = i === 16 ? 4 : 2;
  if (v.padas.length !== expectedPadas) {
    throw new Error(`Verse ${i + 1}: expected ${expectedPadas} padas, got ${v.padas.length}`);
  }
});
console.log('Structure check passed: 17 verses (2 padas each for verses 1-16, 4 padas for verse 17).\n');

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
  const lastIdx = devaPadas.length - 1;
  if (devaPadas.length === 2) {
    devaPadas[0] += ' ।'; // danda after pada 1
  } else {
    devaPadas[1] += ' ।'; // danda after pada 2 (4-pada verse); nothing after padas 1/3
  }
  devaPadas[lastIdx] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after final pada

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

console.log('Sample (verses 1, 13, 14, 15, 17):\n');
[0, 12, 13, 14, 16].forEach(i => console.log(rows[i], '\n'));

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
