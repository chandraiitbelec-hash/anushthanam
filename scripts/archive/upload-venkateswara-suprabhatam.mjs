/**
 * Uploads Venkateswara Suprabhatam (29 verses, composed by Prativadi
 * Bhayankara Annangaracharya, 15th century) to shloka_stanzas. Sourced
 * from the web, no user-supplied text.
 *
 * Structural note: "Sri Venkatesa Suprabhatam" is traditionally recited as
 * a four-part collection -- Suprabhatam (29 verses), Sri Venkatesa Stotram
 * (11 verses), Sri Venkatesa Prapatti (14 or 16 verses depending on the
 * edition), and Sri Venkatesa Mangalasasanam (11 or 14 verses) -- often
 * bundled together on devotional sites as one ~65-verse document with no
 * clear section markers. This script uploads ONLY the 29-verse Suprabhatam
 * section, matching the site's declared stanza_count exactly. Two sources
 * used here -- shlokam.org and sanskritdocuments.org (the latter checked
 * only for wording verification, per that site's no-reproduction request,
 * not used as a copy source) -- carry an explicit `अथ वेङ्कटेशस्तोत्रम्`
 * heading right after verse 29, unambiguously marking where Suprabhatam
 * ends and Stotram begins. Two more sources -- greenmesg.org and
 * vignanam.org -- host the Suprabhatam as a standalone page separate from
 * their own Venkatesa Stotram page. All four independently agree the
 * Suprabhatam itself is exactly 29 verses.
 *
 * Cross-checked across those four sources (greenmesg.org, shlokam.org,
 * vignanam.org, sanskritdocuments.org for verification only). Several
 * genuine wording discrepancies were found and resolved, mostly toward
 * whichever reading is grammatically/lexically valid Sanskrit when sources
 * split:
 *   - V1: "कर्तव्यं" (single त) over "कर्त्तव्यं" -- standard spelling.
 *   - V4: "वृषशैलनाथदयिते" -- "वृष" (bull) is lexically correct and matches
 *     वृषभाद्रि/वृषाद्रि used elsewhere in this same hymn (v15) and
 *     वृषशैलपते in the companion Stotram; "वृश" (the more common web
 *     spelling here, 3 of 4 sources) is not an attested Sanskrit word.
 *   - V14: "हरविरिञ्चि" over "हरविरिञ्च" -- both विरिञ्च and विरिञ्चि are
 *     attested names of Brahma; adopted the source split 2-2, either is
 *     correct.
 *   - V16: "धनाधिनाथाः" ("supreme lord of wealth", i.e. Kubera) over
 *     "धनादिनाथाः" ("lord of wealth etc.") -- fits the pattern of naming
 *     specific guardian deities (Rakshas-guardian, Varuna, Vayu, then
 *     Kubera) better; sources split 2-2, both readings are grammatical.
 *   - V23: "कुट्मल" (bud) over "कुटमल"/"कुड्मल" -- the only one of the
 *     three variants that is an attested dictionary word; the other two
 *     drop or misplace the conjunct.
 *   - V24: "परश्वध" (paraśvadha, "battle-axe", a genuine Vedic-attested
 *     word referring to Paraśurāma's axe) over "परश्वथ" -- adopted against
 *     a 3-of-4 majority because परश्वथ is not an attested Sanskrit word
 *     (थ/ध are commonly confused in OCR/web transcription).
 *   - V25: confirmed via direct verbatim re-fetch that the avagraha in
 *     "धृत्वाऽद्य" (धृत्वा + अद्य sandhi) is single, not double as an
 *     initial pass misread it.
 *   - V27: "मुखास्त्वथ" (sandhi of मुख-आस् + तु + अथ, "and then/moreover")
 *     over "मुखास्तवथ" -- the latter is not a real Sanskrit form.
 * A handful of other differences (spacing/compounding of the same words,
 * e.g. "एला लवङ्ग" vs "एलालवङ्ग"; avagraha marks shown inconsistently
 * across sources) are purely typographic and were resolved toward the
 * compact-compound style used throughout the rest of this hymn's verses.
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Sanskrit, matching the approach used for every prior
 * upload this session (verbatim web translations were not reliably
 * extractable through available fetch tooling).
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: verses 1-2 are 2-pada anushtubh couplets (as this hymn
 * is traditionally printed); verses 3-29 are 4-pada verses (predominantly
 * Vasantatilaka meter). Punctuation follows source printing (verified
 * against greenmesg.org): 2-pada verses get a danda after pada 1; 4-pada
 * verses get a danda after pada 2 only (the half-verse marker) -- padas 1
 * and 3 carry no punctuation of their own -- and every verse gets the
 * numbered double-danda after its final pada. Same rule as
 * upload-kala-bhairava-ashtakam.mjs / upload-kanakadhara-stotram.mjs.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-venkateswara-suprabhatam.mjs          (dry run)
 *      node scripts/upload-venkateswara-suprabhatam.mjs --write  (apply)
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
const SLUG = 'venkateswara-suprabhatam';

const VERSES = [
  {
    padas: ['कौसल्या सुप्रजा राम पूर्वासन्ध्या प्रवर्तते', 'उत्तिष्ठ नरशार्दूल कर्तव्यं दैवमाह्निकम्'],
    meaning: 'O Rama, worthy son of Kausalya, the eastern twilight of dawn is advancing. Arise, O tiger among men -- the daily rites enjoined by the gods are to be performed.',
  },
  {
    padas: ['उत्तिष्ठोत्तिष्ठ गोविन्द उत्तिष्ठ गरुडध्वज', 'उत्तिष्ठ कमलाकान्त त्रैलोक्यं मङ्गलं कुरु'],
    meaning: 'Arise, arise, O Govinda; arise, O bearer of the Garuda banner; arise, O beloved of Kamala -- bestow auspiciousness upon the three worlds.',
  },
  {
    padas: ['मातस्समस्तजगतां मधुकैटभारेः', 'वक्षोविहारिणि मनोहरदिव्यमूर्ते', 'श्रीस्वामिनि श्रितजनप्रियदानशीले', 'श्रीवेङ्कटेशदयिते तव सुप्रभातम्'],
    meaning: 'O mother of all the worlds, who dwells upon the chest of the foe of Madhu and Kaitabha, of a captivating and divine form; O mistress of Sri, whose very nature is to lovingly grant boons to those who take refuge in you, beloved of Sri Venkatesha -- may this be an auspicious dawn for you.',
  },
  {
    padas: ['तव सुप्रभातमरविन्दलोचने', 'भवतु प्रसन्नमुखचन्द्रमण्डले', 'विधिशङ्करेन्द्रवनिताभिरर्चिते', 'वृषशैलनाथदयिते दयानिधे'],
    meaning: 'O lotus-eyed one, whose moon-like face is ever pleasant, may this be an auspicious dawn for you; worshipped by the consorts of Brahma, Shiva and Indra, beloved of the lord of the Bull Hill, O ocean of compassion.',
  },
  {
    padas: ['अत्र्यादिसप्तऋषयस्समुपास्य सन्ध्यां', 'आकाशसिन्धुकमलानि मनोहराणि', 'आदाय पादयुगमर्चयितुं प्रपन्नाः', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'Having performed their morning devotions, the seven sages beginning with Atri approach to worship your two feet, lovely lotuses gathered from the celestial river in hand; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['पञ्चाननाब्जभवषण्मुखवासवाद्याः', 'त्रैविक्रमादिचरितं विबुधाः स्तुवन्ति', 'भाषापतिः पठति वासरशुद्धिमारात्', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'The five-faced Shiva, lotus-born Brahma, six-faced Skanda, Indra and other wise gods extol your deeds beginning with the Trivikrama; the lord of speech recites, from afar, the purity of the day; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['ईषत्प्रफुल्लसरसीरुहनारिकेल', 'पूगद्रुमादिसुमनोहरपालिकानाम्', 'आवाति मन्दमनिलस्सह दिव्यगन्धैः', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'A gentle breeze blows, carrying divine fragrances, from the rows of slightly-blossomed lotus ponds, lovely coconut palms and areca groves; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['उन्मील्य नेत्रयुगमुत्तमपञ्जरस्थाः', 'पात्रावशिष्टकदलीफलपायसानि', 'भुक्त्वा सलीलमथ केलिशुकाः पठन्ति', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'Opening their eyes, the pet parrots seated in their fine cages, having playfully eaten the banana and sweet rice-pudding left over in their bowls, now recite; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['तन्त्रीप्रकर्षमधुरस्वनया विपञ्च्या', 'गायत्यनन्तचरितं तव नारदोऽपि', 'भाषासमग्रमसकृत्करचाररम्यं', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'Even Narada sings of your infinite deeds, his voice sweetened by the fine tone of his lute, in complete and pleasing language, with a lovely play of the hand; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['भृङ्गावली च मकरन्दरसानुविद्ध', 'झङ्कारगीतनिनदैस्सह सेवनाय', 'निर्यात्युपान्तसरसीकमलोदरेभ्यः', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'The swarms of bees, drenched in the nectar of honey, emerge with the humming drone of their song from the hearts of lotuses in the nearby ponds to render you service; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['योषागणेन वरदध्नि विमथ्यमाने', 'घोषालयेषु दधिमन्थनतीव्रघोषाः', 'रोषात्कलिं विदधते ककुभश्च कुम्भाः', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'As the fine curds are churned by the cowherd women, the sharp sounds of churning rise in the cowherd settlements, and, as if in anger, the directions and the great water-jars resound in echoing strife; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['पद्मेशमित्रशतपत्रगतालिवर्गाः', 'हर्तुं श्रियं कुवलयस्य निजाङ्गलक्ष्म्या', 'भेरीनिनादमिव बिभ्रति तीव्रनादं', 'शेषाद्रिशेखरविभो तव सुप्रभातम्'],
    meaning: 'The swarms of bees settled on the hundred-petalled lotus, friend of the sun, raise a sharp sound like the beat of war-drums, as if to steal away, by the beauty of their own bodies, the glory of the blue lotus; O lord crowning the Seshadri hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['श्रीमन्नभीष्टवरदाखिललोकबन्धो', 'श्रीश्रीनिवास जगदेकदयैकसिन्धो', 'श्रीदेवतागृहभुजान्तरदिव्यमूर्ते', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O glorious granter of desired boons, kinsman of all the worlds; O Sri Srinivasa, sole ocean of compassion for the universe; whose divine form houses the goddess Sri upon your breast; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['श्रीस्वामिपुष्करिणिकाप्लवनिर्मलाङ्गाः', 'श्रेयोऽर्थिनो हरविरिञ्चिसनन्दनाद्याः', 'द्वारे वसन्ति वरवेत्रहतोत्तमाङ्गाः', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'Hara, Virinchi, Sanandana and other seekers of blessedness, their bodies purified by bathing in the Swami Pushkarini tank, wait at your gate, their heads gently touched by the guards’ fine canes; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['श्रीशेषशैलगरुडाचलवेङ्कटाद्रि', 'नारायणाद्रिवृषभाद्रिवृषाद्रिमुख्याम्', 'आख्यां त्वदीयवसतेरनिशं वदन्ति', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'They ceaselessly proclaim the names of your abode -- Sri Sesha hill, Garuda hill, Venkata hill, Narayana hill, Vrishabha hill, Vrisha hill, and the like; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['सेवापराः शिवसुरेशकृशानुधर्म', 'रक्षोऽम्बुनाथपवमानधनाधिनाथाः', 'बद्धाञ्जलिप्रविलसन्निजशीर्षदेशाः', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'Shiva, the king of the gods, Agni, Yama, the guardian of the Rakshasas, Varuna, Vayu and Kubera the lord of wealth stand devoted to your service, their heads bowed and their hands folded in reverent salutation; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['धाटीषु ते विहगराजमृगाधिराज', 'नागाधिराजगजराजहयाधिराजाः', 'स्वस्वाधिकारमहिमाधिकमर्थयन्ते', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'In your courtyards, the king of birds, the king of beasts, the king of serpents, the king of elephants and the king of horses each petition for the increase of the glory proper to their own office; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['सूर्येन्दुभौमबुधवाक्पतिकाव्यसौरि', 'स्वर्भानुकेतुदिविषत्परिषत्प्रधानाः', 'त्वद्दासदासचरमावधिदासदासाः', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'The Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu -- the chief members of the assembly of gods -- are themselves servants of the servants, to the very last, of your servants; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['त्वत्पादधूलिभरितस्फुरितोत्तमाङ्गाः', 'स्वर्गापवर्गनिरपेक्षनिजान्तरङ्गाः', 'कल्पागमाकलनयाकुलतां लभन्ते', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'Those whose heads gleam, covered with the dust of your feet, whose inmost hearts are indifferent even to heaven and to liberation, grow restless merely reckoning the arrival of a new cosmic cycle, so intense is their longing for you; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['त्वद्गोपुराग्रशिखराणि निरीक्षमाणाः', 'स्वर्गापवर्गपदवीं परमां श्रयन्तः', 'मर्त्या मनुष्यभुवने मतिमाश्रयन्ते', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'Mortal beings in the world of men, merely by gazing upon the peaks of your gate-towers, fix their minds upon you and thereby attain the supreme state of heaven and liberation; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['श्रीभूमिनायक दयादिगुणामृताब्धे', 'देवाधिदेव जगदेकशरण्यमूर्ते', 'श्रीमन्ननन्तगरुडादिभिरर्चिताङ्घ्रे', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O lord of Sri and Bhumi, ocean of nectar-like virtues beginning with compassion; O god of gods, whose very form is the sole refuge of the universe; whose feet are worshipped by the glorious Ananta, Garuda and others; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['श्रीपद्मनाभ पुरुषोत्तम वासुदेव', 'वैकुण्ठ माधव जनार्दन चक्रपाणे', 'श्रीवत्सचिह्न शरणागतपारिजात', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O Sri Padmanabha, Purushottama, Vasudeva, Vaikuntha, Madhava, Janardana, wielder of the discus; O bearer of the Srivatsa mark, wish-fulfilling tree for those who seek refuge in you; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['कन्दर्पदर्पहर सुन्दर दिव्यमूर्ते', 'कान्ताकुचाम्बुरुह कुट्मल लोलदृष्टे', 'कल्याणनिर्मलगुणाकर दिव्यकीर्ते', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O destroyer of the pride of the god of love, of beautiful and divine form; whose glance plays lovingly on the lotus-bud breasts of your beloved; O mine of pure and auspicious virtues, of divine fame; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['मीनाकृते कमठकोलनृसिंहवर्णिन्', 'स्वामिन् परश्वधतपोधन रामचन्द्र', 'शेषांशराम यदुनन्दन कल्किरूप', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O fish-formed one, tortoise, boar, man-lion, brahmachari dwarf, master ascetic bearing the battle-axe, Ramachandra, Rama born of a portion of Shesha, joy of the Yadus, form of Kalki; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['एलालवङ्गघनसारसुगन्धितीर्थं', 'दिव्यं वियत्सरिति हेमघटेषु पूर्णम्', 'धृत्वाऽद्य वैदिकशिखामणयः प्रहृष्टाः', 'तिष्ठन्ति वेङ्कटपते तव सुप्रभातम्'],
    meaning: 'Having filled golden pitchers today with divine water from the celestial river, fragrant with cardamom, clove and camphor, the crest-jewels among Vedic scholars stand joyfully waiting; O lord of Venkata, may this be an auspicious dawn for you.',
  },
  {
    padas: ['भास्वानुदेति विकचानि सरोरुहाणि', 'सम्पूरयन्ति निनदैः ककुभो विहङ्गाः', 'श्रीवैष्णवास्सततमर्थितमङ्गलास्ते', 'धामाश्रयन्ति तव वेङ्कट सुप्रभातम्'],
    meaning: 'The sun rises, the lotuses open, the birds fill the directions with their calls; O Venkata, your Sri Vaishnavas, ever wishing you well, approach your abode; may this be an auspicious dawn for you.',
  },
  {
    padas: ['ब्रह्मादयस्सुरवरास्समहर्षयस्ते', 'सन्तस्सनन्दनमुखास्त्वथ योगिवर्याः', 'धामान्तिके तव हि मङ्गलवस्तुहस्ताः', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'Brahma and the other chief gods, the great sages, the saints headed by Sanandana, and the foremost of yogis stand near your abode, their hands filled with auspicious offerings; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['लक्ष्मीनिवास निरवद्यगुणैकसिन्धो', 'संसारसागरसमुत्तरणैकसेतो', 'वेदान्तवेद्यनिजवैभवभक्तभोग्य', 'श्रीवेङ्कटाचलपते तव सुप्रभातम्'],
    meaning: 'O abode of Lakshmi, sole ocean of flawless virtues; O sole bridge for crossing over the ocean of worldly existence; whose own glory is known only through the Vedanta and is enjoyed by your devotees; O lord of the Venkata hill, may this be an auspicious dawn for you.',
  },
  {
    padas: ['इत्थं वृषाचलपतेरिह सुप्रभातं', 'ये मानवाः प्रतिदिनं पठितुं प्रवृत्ताः', 'तेषां प्रभातसमये स्मृतिरङ्गभाजां', 'प्रज्ञां परार्थसुलभां परमां प्रसूते'],
    meaning: 'Thus, for those human beings who take up the practice of reciting this Suprabhatam of the lord of the Bull Hill every day, the very remembrance of it at the hour of dawn bestows on their embodied selves the supreme wisdom by which the highest goal of life is easily attained.',
  },
];

if (VERSES.length !== 29) throw new Error(`Expected 29 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  const n = i + 1;
  const expected = n <= 2 ? 2 : 4;
  if (v.padas.length !== expected) throw new Error(`Verse ${n}: expected ${expected} padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 29 verses (verses 1-2 with 2 padas, verses 3-29 with 4 padas).\n');

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
  // 2-pada anushtubh couplets (v1-2): danda after pada 1 only.
  // 4-pada verses (v3-29): danda after pada 2 only (half-verse marker) --
  // padas 1 and 3 carry no punctuation of their own, matching source
  // printing (verified against greenmesg.org) and the convention used in
  // upload-kala-bhairava-ashtakam.mjs / upload-kanakadhara-stotram.mjs.
  const dandaIdx = lastIdx === 1 ? 0 : 1;
  devaPadas[dandaIdx] += ' ।';
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

console.log('Sample (verses 1, 4, 7, 16, 29):\n');
[0, 3, 6, 15, 28].forEach(i => console.log(rows[i], '\n'));

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
