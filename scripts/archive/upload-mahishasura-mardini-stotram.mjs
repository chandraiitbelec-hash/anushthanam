/**
 * Uploads Mahishasura Mardini Stotram (21 verses, attributed to Adi
 * Shankaracharya) to shloka_stanzas. Sourced from the web, no user-supplied
 * text.
 *
 * The site's metadata declares stanza_count: '21'. Unlike shiva-tandava-
 * stotram or kanakadhara-stotram, this one did NOT turn up any competing
 * verse-count tradition: every source checked (greenmesg.org, drikpanchang.com,
 * vedicfeed.com, spiritualfeed.net, bhaktinidhi.com, stotram.co.in,
 * hindugallery.com, bhaktihome.com) presents exactly 21 verses in the same
 * order with the same content. The refrain "jaya jaya he mahishasura-mardini
 * ramyakapardini shailasute" is the 4th pada WITHIN each of the 21 verses,
 * not a separate standalone verse, and none of the sources checked prepend a
 * separate dhyana/invocatory verse before verse 1. So: no reconciliation
 * needed here, flagged explicitly per this pipeline's rule of saying so
 * rather than silently assuming -- this is a case where the declared count
 * simply matches the standard edition with no interpolation to sort out.
 *
 * Sourcing and cross-checks performed before use:
 *   - Full 21-verse text cross-checked word-by-word across three independent
 *     full transcriptions: greenmesg.org, hindugallery.com, and
 *     bhaktihome.com. (drikpanchang.com and shlokam.org confirmed the
 *     21-verse structure and verse order but declined to reproduce full
 *     verbatim text through available fetch tooling; vedicfeed.com
 *     independently confirmed the opening words of all 21 verses matched
 *     greenmesg.org exactly, which is a strong structural cross-check even
 *     without full-verse text.)
 *
 * Real discrepancies found and resolved (grammatically valid reading
 * preferred over an invalid variant, per this pipeline's rule):
 *   - Verse 3: "tunga-himalaya" (Himalaya, the mountain) -- greenmesg.org and
 *     hindugallery.com agree; bhaktihome.com alone has "himalaya" missing
 *     the second vowel ("himlaya"), not a real word.
 *   - Verse 4: "vitunditashunda" ("battered trunk," a real word for an
 *     elephant's trunk, fitting the elephant-themed verse) -- greenmesg.org
 *     alone has this; hindugallery.com and bhaktihome.com both have
 *     "vitunditashunda" with a dental "d" in place of the retroflex,
 *     producing a non-word. Despite being outvoted 2-to-1, the grammatically
 *     valid reading was kept.
 *   - Verse 5: "danava-duta" ("messenger of the demons," duta = messenger, a
 *     real word) -- greenmesg.org alone has the long "u"; hindugallery.com
 *     and bhaktihome.com both shorten it to a non-standard "duta". Same
 *     2-to-1-but-invalid situation as verse 4, resolved the same way.
 *   - Verses 1, 6, 18: greenmesg.org and hindugallery.com agree on keeping
 *     the grammatically required avagraha at three sandhi points
 *     ("shiro'dhinivasini", "shiro'dhikritamala", "yo'nudinam");
 *     bhaktihome.com drops the avagraha at all three (a common, purely
 *     cosmetic transcription habit -- same underlying sandhi either way,
 *     kept the avagraha per majority + grammatical clarity).
 *   - Verse 6: "vairi-vadhu-vara" vs "vairi-vadhu-vara" (long vs short "u" in
 *     vadhu/vadhu) -- both are attested forms of the same word; treated as
 *     cosmetic, kept greenmesg.org's classical long form for consistency
 *     with the other three resolutions above, all of which favored
 *     greenmesg.org.
 * Every other word across all 21 verses, including the famously
 * tongue-twisting alliterative verses 8-12 and 17, matched exactly across
 * all three full sources (spacing/word-break placement varies cosmetically
 * but concatenates identically).
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session. This stotra's meter favors dense alliteration and internal rhyme
 * over strict grammatical parsing in several verses (especially 8-12, 17),
 * so some renderings lean toward capturing imagery and sense rather than a
 * literal word-for-word gloss -- consistent with how published translations
 * of this particular stotra are usually handled.
 *
 * Devanagari is the source of truth (as verified above); Telugu and Tamil
 * are derived via Sanscript / the custom Tamil superscript converter, IAST
 * via Sanscript with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: all 21 verses share one meter (4 padas each), danda after
 * pada 2 only, nothing after padas 1/3, numbered double-danda after pada 4
 * -- same convention as kala-bhairava-ashtakam's 4-pada verses.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-mahishasura-mardini-stotram.mjs          (dry run)
 *      node scripts/upload-mahishasura-mardini-stotram.mjs --write  (apply)
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
const SLUG = 'mahishasura-mardini-stotram';

const REFRAIN = 'जय जय हे महिषासुरमर्दिनि रम्यकपर्दिनि शैलसुते';

const VERSES = [
  {
    padas: [
      'अयि गिरिनन्दिनि नन्दितमेदिनि विश्वविनोदिनि नन्दिनुते',
      "गिरिवरविन्ध्यशिरोऽधिनिवासिनि विष्णुविलासिनि जिष्णुनुते",
      'भगवति हे शितिकण्ठकुटुम्बिनि भूरिकुटुम्बिनि भूरिकृते',
      REFRAIN,
    ],
    meaning: 'O daughter of the mountain who delights the earth, who diverts the whole universe, praised by Nandi; who dwells upon the peak of great Vindhya, who delights in Vishnu, praised by the victorious Indra; O goddess, consort of the white-throated one of the vast family, doer of abundant deeds -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'सुरवरवर्षिणि दुर्धरधर्षिणि दुर्मुखमर्षिणि हर्षरते',
      'त्रिभुवनपोषिणि शङ्करतोषिणि किल्बिषमोषिणि घोषरते',
      'दनुजनिरोषिणि दितिसुतरोषिणि दुर्मदशोषिणि सिन्धुसुते',
      REFRAIN,
    ],
    meaning: 'O granter of boons to the best of gods, subduer of the unconquerable, tolerant of the foul-mouthed demons, delighting in joy; nourisher of the three worlds, pleasing to Shankara, remover of sin, delighting in battle cries; wrathful toward the demon hordes and the sons of Diti, withering their fierce pride, O daughter of the ocean -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि जगदम्ब मदम्ब कदम्ब वनप्रियवासिनि हासरते',
      'शिखरि शिरोमणि तुङ्गहिमालय शृङ्गनिजालय मध्यगते',
      'मधुमधुरे मधुकैटभगञ्जिनि कैटभभञ्जिनि रासरते',
      REFRAIN,
    ],
    meaning: 'O mother of the universe, sweeter than the kadamba blossom, dweller of the forest groves, delighting in laughter; seated amid the towering peaks of the Himalaya in your own mountain abode; sweeter than honey, vanquisher of Madhu, destroyer of Kaitabha, delighting in sport -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि शतखण्ड विखण्डितरुण्ड वितुण्डितशुण्ड गजाधिपते',
      'रिपुगजगण्ड विदारणचण्ड पराक्रमशुण्ड मृगाधिपते',
      'निजभुजदण्ड निपातितखण्ड विपातितमुण्ड भटाधिपते',
      REFRAIN,
    ],
    meaning: 'O queen of elephants, before whom a hundred trunks lie shattered and heads lie severed, whose own trunk has battered the enemy tuskers; queen of beasts, whose fierce might tears open the cheeks and trunks of rival elephants; queen of warriors, by whose own mighty arm heads and limbs are struck down and felled -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि रणदुर्मद शत्रुवधोदित दुर्धरनिर्जर शक्तिभृते',
      'चतुरविचार धुरीणमहाशिव दूतकृत प्रमथाधिपते',
      'दुरितदुरीह दुराशयदुर्मति दानवदूत कृतान्तमते',
      REFRAIN,
    ],
    meaning: 'O bearer of unconquerable, undying power raised for the slaying of foes maddened in battle; whose sound judgment made even the great Shiva your envoy, foremost among his hosts; whose mind resolved the doom of the wicked, ill-willed, foolish messenger of the demons -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि शरणागत वैरिवधूवर वीरवराभय दायकरे',
      "त्रिभुवनमस्तक शूलविरोधि शिरोऽधिकृतामल शूलकरे",
      'दुमिदुमितामर धुन्दुभिनादमहोमुखरीकृत दिङ्मकरे',
      REFRAIN,
    ],
    meaning: 'O giver of fearlessness and great boons to the wives of enemies who seek refuge in you; wielder of the pure trident raised over the head of him who opposed the trident at the crest of the three worlds; who makes the elephants guarding every direction trumpet at the deep, resounding beat of the immortals war drums -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि निजहुङ्कृति मात्रनिराकृत धूम्रविलोचन धूम्रशते',
      'समरविशोषित शोणितबीज समुद्भवशोणित बीजलते',
      'शिवशिवशुम्भ निशुम्भमहाहव तर्पितभूत पिशाचरते',
      REFRAIN,
    ],
    meaning: 'O you by whose mere roar the hundredfold smoke-eyed demon Dhumralochana was undone; from whose blood shed in battle sprang forth ever more blood-born demons, themselves destroyed; who delights among the hosts of spirits and ghosts sated in the great battle with Shumbha and Nishumbha, crying Shiva, Shiva -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'धनुरनुषङ्ग रणक्षणसङ्ग परिस्फुरदङ्ग नटत्कटके',
      'कनकपिशङ्ग पृषत्कनिषङ्ग रसद्भटशृङ्ग हताबटुके',
      'कृतचतुरङ्ग बलक्षितिरङ्ग घटद्बहुरङ्ग रटद्बटुके',
      REFRAIN,
    ],
    meaning: 'In whose limbs, adorned with anklets, quiver and dance at the very moment the bowstring is drawn in battle; who, with golden-tawny arrows drawn from her quiver, felled the roaring warriors amid the horns of war; who arrayed the four-fold army across the battlefield amid the many-colored din of shouting soldiers -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'सुरललना ततथेयि तथेयि कृताभिनयोदर नृत्यरते',
      'कृत कुकुथः कुकुथो गडदादिकताल कुतूहल गानरते',
      'धुधुकुट धुक्कुट धिंधिमित ध्वनि धीर मृदंग निनादरते',
      REFRAIN,
    ],
    meaning: 'O you who delight in the dance of celestial maidens moving to "tata-theyi tata-theyi" with graceful gestures; who delight in the eager rhythmic song of cymbals sounding "kukuthah kukutho gadadadi"; who delight in the deep resounding of the mridanga drum beating "dhudhukuta dhukkuta dhim-dhimita" -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'जय जय जप्य जयेजयशब्द परस्तुति तत्परविश्वनुते',
      'झणझणझिञ्झिमि झिङ्कृत नूपुरशिञ्जितमोहित भूतपते',
      'नटित नटार्ध नटी नट नायक नाटितनाट्य सुगानरते',
      REFRAIN,
    ],
    meaning: 'O you praised by all the universe with cries of "jaya jaya," resounding "jaye jaya"; whose anklets ring out "jhana-jhana-jhinjhimi," bewitching the lord of spirits; who delights in the fine song and dance where actor and actress together perform the choreographed drama -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि सुमनःसुमनःसुमनः सुमनःसुमनोहरकान्तियुते',
      'श्रितरजनी रजनीरजनी रजनीरजनी करवक्त्रवृते',
      'सुनयनविभ्रमर भ्रमरभ्रमर भ्रमरभ्रमराधिपते',
      REFRAIN,
    ],
    meaning: 'O you whose every charm surpasses charm upon charm, whose captivating beauty outshines all beauty; whose face, veiled again and again by night upon night, is itself served by the very night; whose enchanting glancing eyes are themselves the very lord of swarming bee upon swarming bee -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'सहितमहाहव मल्लमतल्लिक मल्लितरल्लक मल्लरते',
      'विरचितवल्लिक पल्लिकमल्लिक झिल्लिकभिल्लिक वर्गवृते',
      'शितकृतफुल्ल समुल्लसितारुण तल्लजपल्लव सल्ललिते',
      REFRAIN,
    ],
    meaning: 'O you who delight amid the great battle\'s foremost wrestlers locked in combat; surrounded by hosts of tangled vines, wild blossoms, jasmine creepers, crickets and forest tribes; adorned with the freshly blossomed, radiant reddish shoots of the finest creeper -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अविरलगण्ड गलन्मदमेदुर मत्तमतङ्गज राजपते',
      'त्रिभुवनभूषण भूतकलानिधि रूपपयोनिधि राजसुते',
      'अयि सुदतीजन लालसमानस मोहन मन्मथराजसुते',
      REFRAIN,
    ],
    meaning: 'O queen of the lord of the rutting elephant, its cheeks ever streaming with musth; O royal daughter, ornament of the three worlds, treasury of every art, form born of the ocean of beauty; O royal daughter, enchantress longed for in the hearts of lovely-toothed maidens, captivating even to the lord of love -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'कमलदलामल कोमलकान्ति कलाकलितामल भाललते',
      'सकलविलास कलानिलयक्रम केलिचलत्कल हंसकुले',
      'अलिकुलसङ्कुल कुवलयमण्डल मौलिमिलद्बकुलालिकुले',
      REFRAIN,
    ],
    meaning: 'O you whose spotless brow, delicate as a lotus petal, is adorned with every art; in whose graceful pleasure-groves swans move about at play; whose crown, thronged with swarms of bees amid clusters of blue lotuses, is entwined with garlands of bakula blossoms -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'करमुरलीरव वीजितकूजित लज्जितकोकिल मञ्जुमते',
      'मिलितपुलिन्द मनोहरगुञ्जित रञ्जितशैल निकुञ्जगते',
      'निजगणभूत महाशबरीगण सद्गुणसम्भृत केलितले',
      REFRAIN,
    ],
    meaning: 'O you whose flute\'s melody so enchants that even the cuckoo grows shy of its own song; who dwells delightfully in mountain groves resonant with the charming murmur of the gathered hill-folk; seated amid the true virtues of the great tribe of forest women who are your own attendants -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'कटितटपीत दुकूलविचित्र मयूखतिरस्कृत चन्द्ररुचे',
      'प्रणतसुरासुर मौलिमणिस्फुर दंशुलसन्नख चन्द्ररुचे',
      'जितकनकाचल मौलिमदोर्जित निर्भरकुञ्जर कुम्भकुचे',
      REFRAIN,
    ],
    meaning: 'O you whose bright, many-colored silken garment at the waist outshines the very rays of the moon; before whose gleaming, moon-bright nails the crest-jewels of gods and demons alike bow down; whose full, elephant-temple breasts have overcome even the golden mountain\'s proud, elephant-maddened peak -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'विजितसहस्रकरैक सहस्रकरैक सहस्रकरैकनुते',
      'कृतसुरतारक सङ्गरतारक सङ्गरतारक सूनुसुते',
      'सुरथसमाधि समानसमाधि समाधिसमाधि सुजातरते',
      REFRAIN,
    ],
    meaning: 'O you praised alone above a thousand rising suns; who granted deliverance in battle to the one united with liberation through battle; whose deep meditation equals the very meditation of King Suratha, born of true meditation, delighting -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'पदकमलं करुणानिलये वरिवस्यति योऽनुदिनं सुशिवे',
      'अयि कमले कमलानिलये कमलानिलयः स कथं न भवेत्',
      'तव पदमेव परम्पदमित्यनुशीलयतो मम किं न शिवे',
      REFRAIN,
    ],
    meaning: 'He who daily worships your lotus feet, O abode of compassion, O gracious one -- how could he not himself become an abode of fortune, O lotus one who dwells upon the lotus? Since your feet alone are the highest goal, and I dwell constantly upon this, what is there that does not become mine, O auspicious one? Victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'कनकलसत्कलसिन्धुजलैरनुषिञ्चति तेगुणरङ्गभुवम्',
      'भजति स किं न शचीकुचकुम्भतटीपरिरम्भसुखानुभवम्',
      'तव चरणं शरणं करवाणि नतामरवाणि निवासि शिवम्',
      REFRAIN,
    ],
    meaning: 'He who daily bathes this land, adorned with your virtues, in the shining waters of the golden ocean vessel -- does he not thereby taste the very joy of embracing the pitcher-like breasts of Shachi? I take your feet alone as my refuge, O you praised by the speech of the bowing immortals, dwelling within the auspicious one -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'तव विमलेन्दुकुलं वदनेन्दुमलं सकलं ननु कूलयते',
      'किमु पुरुहूतपुरीन्दु मुखी सुमुखीभिरसौ विमुखीक्रियते',
      'मम तु मतं शिवनामधने भवती कृपया किमुत क्रियते',
      REFRAIN,
    ],
    meaning: 'Does not your own spotless lunar lineage utterly outshine the moon-like face of every other? Why then should that moon-faced lady of Indras city turn her face away from the other lovely-faced women? My own firm conviction, in this treasury named for the auspicious one, is this: what is there that your grace does not accomplish? Victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
  },
  {
    padas: [
      'अयि मयि दीन दयालुतया कृपयैव त्वया भवितव्यमुमे',
      'अयि जगतो जननी कृपयासि यथासि तथानुमितासिरते',
      'यदुचितमत्र भवत्युररीकुरुतादुरुतापमपाकुरुते',
      REFRAIN,
    ],
    meaning: 'O you who, out of sheer compassion for one as lowly as I, must surely show me mercy; O mother of the universe, since your compassion is ever as it truly is, my humble praise too has been offered in keeping with that same truth. Whatever is fitting here, may you grant, and may you remove this great affliction -- victory, victory to you, O slayer of Mahishasura, of lovely braided locks, daughter of the mountain.',
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

console.log('Sample (verses 1, 9, 17, 21):\n');
[0, 8, 16, 20].forEach(i => console.log(rows[i], '\n'));

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
