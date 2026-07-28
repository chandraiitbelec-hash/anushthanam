/**
 * Uploads Subrahmanya Bhujangam (33 verses, Adi Shankaracharya) to
 * shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * The site's metadata declares stanza_count: '33'. Unlike kala-bhairava-
 * ashtakam (where a commonly-appended phala-shruti verse was found NOT to be
 * part of the declared count), here the closing phala-shruti verse ("bhujanga-
 * akhya-vrttena kliptam stavam yah pathed...") IS the 33rd verse and IS
 * counted within the declared 33 -- confirmed explicitly by both
 * kamakoti.org (Kanchi Mutt's own site) and devshoppe.com, which both
 * independently state the phala-shruti is "numbered as part of the main
 * count, not separate." So: no reconciliation/exclusion needed here, the
 * opposite situation from kala-bhairava-ashtakam -- flagged explicitly per
 * this pipeline's rule of saying so rather than assuming either way.
 *
 * Sourcing and cross-checks performed before use:
 *   - Full 33-verse text cross-checked between greenmesg.org and
 *     kamakoti.org (Kanchi Mutt), two independent full transcriptions that
 *     matched word-for-word across all 33 verses with zero discrepancies.
 *   - A third source, sisnambalava.org.uk, gave partial excerpts (verses 1,
 *     3, 15, 21, 25, 26, 31, 32 -- a good spread across the text) that also
 *     matched exactly, and a targeted web search independently confirmed
 *     verse 12's unusual "क्ऌप्तदण्डान्" (vocalic-l consonant cluster, an
 *     easy OCR target) reading against several more sites (celextel.org,
 *     stotrarathna.blogspot.com, templesinindiainfo.com, bhaktinidhi.com,
 *     shlokam.org, stotram.co.in). No real wording discrepancies turned up
 *     anywhere in the 33 verses across any of these checks.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session.
 *
 * Devanagari is the source of truth (as verified above); Telugu and Tamil
 * are derived via Sanscript / the custom Tamil superscript converter, IAST
 * via Sanscript with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: all 33 verses are Bhujanga Prayata meter, printed as 4
 * padas each, danda after pada 2 only, nothing after padas 1/3, numbered
 * double-danda after pada 4 -- the standard shloka convention, confirmed
 * directly from greenmesg.org's punctuation. One verse (19) has the word
 * "सेनापते" split across the pada-1/pada-2 line-wrap in that site's print
 * layout (a column-width artifact, not a real pada boundary) -- rejoined
 * into a single pada here rather than reproducing the mid-word break.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-subrahmanya-bhujangam.mjs          (dry run)
 *      node scripts/upload-subrahmanya-bhujangam.mjs --write  (apply)
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
const SLUG = 'subrahmanya-bhujangam';

const VERSES = [
  {
    padas: ['सदा बालरूपाऽपि विघ्नाद्रिहन्त्री', 'महादन्तिवक्त्राऽपि पञ्चास्यमान्या', 'विधीन्द्रादिमृग्या गणेशाभिधा मे', 'विधत्तां श्रियं काऽपि कल्याणमूर्तिः'],
    meaning: 'May that certain auspicious form named Ganesha -- who, though ever child-like in form, destroys the mountain of obstacles, and though elephant-faced, is honored even by the five-faced Shiva, sought after by Brahma, Indra and the other gods -- bestow prosperity on me.',
  },
  {
    padas: ['न जानामि शब्दं न जानामि चार्थं', 'न जानामि पद्यं न जानामि गद्यम्', 'चिदेका षडास्या हृदि द्योतते मे', 'मुखान्निःसरन्ते गिरश्चापि चित्रम्'],
    meaning: 'I know no grammar, I know no meaning, I know no verse, I know no prose -- yet the one consciousness with six faces shines within my heart, and wondrously, words flow forth from my mouth on their own.',
  },
  {
    padas: ['मयूराधिरूढं महावाक्यगूढं', 'मनोहारिदेहं महच्चित्तगेहम्', 'महीदेवदेवं महावेदभावं', 'महादेवबालं भजे लोकपालम्'],
    meaning: 'I worship the protector of the world, mounted on a peacock, hidden within the great Vedic utterances, of a captivating form, the abode of the great mind, the god of the gods of the earth, the essence of the great Vedas, the child of the great god Shiva.',
  },
  {
    padas: ['यदा संनिधानं गता मानवा मे', 'भवाम्भोधिपारं गतास्ते तदैव', 'इति व्यञ्जयन्सिन्धुतीरे य आस्ते', 'तमीडे पवित्रं पराशक्तिपुत्रम्'],
    meaning: 'I praise that pure son of the Supreme Shakti, who dwells on the ocean shore as if declaring: the moment mortals come into my presence, that very moment they cross to the far shore of the ocean of worldly existence.',
  },
  {
    padas: ['यथाब्धेस्तरङ्गा लयं यान्ति तुङ्गाः', 'तथैवापदः सन्निधौ सेवतां मे', 'इतीवोर्मिपंक्तीर्नृणां दर्शयन्तं', 'सदा भावये हृत्सरोजे गुहं तम्'],
    meaning: 'Just as the towering waves of the ocean subside into it, so too may misfortunes dissolve away in the presence of those who serve me -- showing this truth through his very rows of waves, I ever meditate on that Guha within the lotus of my heart.',
  },
  {
    padas: ['गिरौ मन्निवासे नरा येऽधिरूढाः', 'तदा पर्वते राजते तेऽधिरूढाः', 'इतीव ब्रुवन्गन्धशैलाधिरूढः', 'स देवो मुदे मे सदा षण्मुखोऽस्तु'],
    meaning: 'Those men who climb the mountain where I dwell, they alone truly shine, mounted upon that mountain -- saying this, as it were, by resting upon the fragrant mountain, may that six-faced god ever be a joy to me.',
  },
  {
    padas: ['महाम्भोधितीरे महापापचोरे', 'मुनीन्द्रानुकूले सुगन्धाख्यशैले', 'गुहायां वसन्तं स्वभासा लसन्तं', 'जनार्तिं हरन्तं श्रयामो गुहं तम्'],
    meaning: 'We take refuge in that Guha, who dwells in a cave on the fragrant mountain by the shore of the great ocean, a thief who steals away great sins, gracious to the greatest of sages, shining in his own radiance, who removes the suffering of his people.',
  },
  {
    padas: ['लसत्स्वर्णगेहे नृणां कामदोहे', 'सुमस्तोमसंछन्नमाणिक्यमञ्चे', 'समुद्यत्सहस्रार्कतुल्यप्रकाशं', 'सदा भावये कार्तिकेयं सुरेशम्'],
    meaning: 'I ever meditate on Kartikeya, lord of the gods, radiant like a thousand rising suns, seated on a ruby couch covered with heaps of flowers, in a shining golden house that fulfills the desires of men.',
  },
  {
    padas: ['रणद्धंसके मञ्जुलेऽत्यन्तशोणे', 'मनोहारिलावण्यपीयूषपूर्णे', 'मनःषट्पदो मे भवक्लेशतप्तः', 'सदा मोदतां स्कन्द ते पादपद्मे'],
    meaning: 'O Skanda, may the bee that is my mind, scorched by the afflictions of worldly existence, ever delight in your two lotus feet -- lovely, deep red, adorned with tinkling anklets, and brimming with the nectar of captivating beauty.',
  },
  {
    padas: ['सुवर्णाभदिव्याम्बरैर्भासमानां', 'क्वणत्किङ्किणीमेखलाशोभमानाम्', 'लसद्धेमपट्टेन विद्योतमानां', 'कटिं भावये स्कन्द ते दीप्यमानाम्'],
    meaning: 'O Skanda, I meditate on your radiant waist, shining with divine garments the color of gold, adorned with a tinkling jeweled girdle of little bells, gleaming with a splendid golden sash.',
  },
  {
    padas: ['पुलिन्देशकन्याघनाभोगतुङ्ग', 'स्तनालिङ्गनासक्तकाश्मीररागम्', 'नमस्यामहं तारकारे तवोरः', 'स्वभक्तावने सर्वदा सानुरागम्'],
    meaning: 'O foe of Taraka, I bow to your chest, reddened with the saffron paste transferred from its embrace of the full, high breasts of the hunter-maiden Valli, that same chest ever loving in protecting your devotees.',
  },
  {
    padas: ['विधौ क्ऌप्तदण्डान् स्वलीलाधृताण्डान्', 'निरस्तेभशुण्डान् द्विषत्कालदण्डान्', 'हतेन्द्रारिषण्डाञ्जगत्त्राणशौण्डान्', 'सदा ते प्रचण्डान् श्रये बाहुदण्डान्'],
    meaning: 'I take refuge in your fierce, mighty arms, which once disciplined Brahma, which hold up the cosmic egg as mere play, which cast aside the elephant-demon\'s trunk, which are death itself to your foes, which slew the hosts of Indra\'s enemies, and which are ever skilled at protecting the universe.',
  },
  {
    padas: ['सदा शारदाः षण्मृगाङ्का यदि स्युः', 'समुद्यन्त एव स्थिताश्चेत्समन्तात्', 'सदा पूर्णबिम्बाः कलङ्कैश्च हीनाः', 'तदा त्वन्मुखानां ब्रुवे स्कन्द साम्यम्'],
    meaning: 'O Skanda, only if there were six autumnal moons, all perpetually rising at once on every side, ever full-orbed and utterly free of any spot -- only then would I dare speak of anything equal to your six faces.',
  },
  {
    padas: ['स्फुरन्मन्दहासैः सहंसानि चञ्चत्', 'कटाक्षावलीभृङ्गसंघोज्ज्वलानि', 'सुधास्यन्दिबिम्बाधराणीशसूनो', 'तवालोकये षण्मुखाम्भोरुहाणि'],
    meaning: 'O son of Shiva, I gaze upon your six lotus-faces, radiant with rows of restless, bee-like sidelong glances, graced with swan-like gentle smiles, their bimba-red lips dripping with nectar.',
  },
  {
    padas: ['विशालेषु कर्णान्तदीर्घेषवजस्रं', 'दयास्यन्दिषु द्वादशस्वीक्षणेषु', 'मयीषत्कटाक्षः सकृत्पातितश्चेद्', 'भवेत्ते दयाशील का नाम हानिः'],
    meaning: 'Among your twelve wide eyes, stretching endlessly to the edge of your ears and ever flowing with compassion, if even a single slight side-glance should fall on me just once -- O compassionate one, what loss would that be to you?',
  },
  {
    padas: ['सुताङ्गोद्भवो मेऽसि जीवेति षड्धा', 'जपन्मन्त्रमीशो मुदा जिघ्रते यान्', 'जगद्भारभृद्भ्यो जगन्नाथ तेभ्यः', 'किरीटोज्ज्वलेभ्यो नमो मस्तकेभ्यः'],
    meaning: 'O lord of the world, I bow to those six heads, each blazing with a crown, each of which bears the burden of the universe, and which Shiva joyfully sniffs in a father\'s affectionate kiss, murmuring the mantra "you are born of my own body, live long."',
  },
  {
    padas: ['स्फुरद्रत्नकेयूरहाराभिरामः', 'चलत्कुण्डलश्रीलसद्गण्डभागः', 'कटौ पीतवासाः करे चारुशक्ति', 'पुरस्तान्ममास्तां पुरारेस्तनूज'],
    meaning: 'O son of the foe of Pura, may you stand before me -- lovely with your flashing jeweled armlets and necklaces, your cheeks shining with the glow of swaying earrings, wearing a yellow garment at your waist, a beautiful spear in your hand.',
  },
  {
    padas: ['इहायाहि वत्सेति हस्तान्प्रसार्या', 'ह्वयत्यादशच्छङ्करे मातुरङ्कात्', 'समुत्पत्य तातं श्रयन्तं कुमारं', 'हराश्लिष्टगात्रं भजे बालमूर्तिम्'],
    meaning: 'I worship that child-form of Kumara, who, the moment Shiva stretches out his hands and calls "come here, my child," leaps up at once from his mother\'s lap to run to his father, his whole body then embraced by Hara.',
  },
  {
    padas: ['कुमारेशसूनो गुह स्कन्द सेनापते', 'शक्तिपाणे मयूराधिरूढ', 'पुलिन्दात्मजाकान्त भक्तार्तिहारिन्', 'प्रभो तारकारे सदा रक्ष मां त्वम्'],
    meaning: 'O Kumara, son of Isha, O Guha, O Skanda, commander of the divine armies, spear-bearer, mounted on your peacock, beloved of the hunter-maiden Valli, remover of your devotees\' suffering, O lord, foe of Taraka -- protect me always.',
  },
  {
    padas: ['प्रशान्तेन्द्रिये नष्टसंज्ञे विचेष्टे', 'कफोद्गारिवक्त्रे भयोत्कम्पिगात्रे', 'प्रयाणोन्मुखे मय्यनाथे तदानीं', 'द्रुतं मे दयालो भवाग्रे गुह त्वम्'],
    meaning: 'O merciful Guha, when my senses grow still, my consciousness fades, my body writhes helplessly, my mouth froths with phlegm, my limbs tremble with fear, and I, helpless, stand at the very threshold of departing this life -- at that hour, come swiftly and stand before me.',
  },
  {
    padas: ['कृतान्तस्य दूतेषु चण्डेषु कोपाद्', 'दहच्छिन्द्धि भिन्द्धीति मां तर्जयत्सु', 'मयूरं समारुह्य मा भैरिति त्वं', 'पुरः शक्तिपाणिर्ममायाहि शीघ्रम्'],
    meaning: 'When Yama\'s fierce messengers threaten me in wrath, crying "burn him, cut him, tear him apart" -- at that very moment, mount your peacock and, spear in hand, come swiftly before me, saying "fear not."',
  },
  {
    padas: ['प्रणम्यासकृत्पादयोस्ते पतित्वा', 'प्रसाद्य प्रभो प्रार्थयेऽनेकवारम्', 'न वक्तुं क्षमोऽहं तदानीं कृपाब्धे', 'न कार्यान्तकाले मनागप्युपेक्षा'],
    meaning: 'O lord, O ocean of compassion, I fall again and again at your feet, bowing, seeking your grace, praying to you over and over now, since I will not be able to speak at that final hour -- so let there be not even the slightest neglect of me when my time comes.',
  },
  {
    padas: ['सहस्राण्डभोक्ता त्वया शूरनामा', 'हतस्तारकः सिंहवक्त्रश्च दैत्यः', 'ममान्तर्हृदिस्थं मनःक्लेशमेकं', 'न हंसि प्रभो किं करोमि क्व यामि'],
    meaning: 'By you were slain Surapadma, ruler of a thousand worlds, Taraka, and the lion-faced demon Simhamukha -- yet you do not destroy this one affliction of the mind lodged within my own heart. O lord, what shall I do, where shall I go?',
  },
  {
    padas: ['अहं सर्वदा दुःखभारावसन्नो', 'भवान्दीनबन्धुस्त्वदन्यं न याचे', 'भवद्भक्तिरोधं सदा क्ऌप्तबाधं', 'ममाधिं द्रुतं नाशयोमासुत त्वम्'],
    meaning: 'I am forever sinking beneath the weight of my sorrows; you are the friend of the helpless, and I ask nothing of anyone but you. O son of Uma, swiftly destroy this constant anguish of mine, which always obstructs my devotion to you.',
  },
  {
    padas: ['अपस्मारकुष्टक्षयार्शः प्रमेह', 'ज्वरोन्मादगुल्मादिरोगा महान्तः', 'पिशाचाश्च सर्वे भवत्पत्रभूतिं', 'विलोक्य क्षणात्तारकारे द्रवन्ते'],
    meaning: 'O foe of Taraka, epilepsy, leprosy, consumption, piles, diabetes, fever, insanity, and other such great diseases, along with every kind of evil spirit, all melt away in an instant at the mere sight of your sacred ash offered on a leaf.',
  },
  {
    padas: ['दृशि स्कन्दमूर्तिः श्रुतौ स्कन्दकीर्तिः', 'मुखे मे पवित्रं सदा तच्चरित्रम्', 'करे तस्य कृत्यं वपुस्तस्य भृत्यं', 'गुहे सन्तु लीना ममाशेषभावाः'],
    meaning: 'May the form of Skanda ever fill my eyes, the fame of Skanda my ears, his sacred story always my mouth, his service my hands, his servitude my whole body -- may every part of my being remain wholly absorbed in Guha.',
  },
  {
    padas: ['मुनीनामुताहो नृणां भक्तिभाजां', 'अभीष्टप्रदाः सन्ति सर्वत्र देवाः', 'नृणामन्त्यजानामपि स्वार्थदाने', 'गुहाद्देवमन्यं न जाने न जाने'],
    meaning: 'There are indeed many gods everywhere who grant the wishes of sages and devoted men -- but for granting even the outcast\'s own true good, I know of no other god than Guha, I know none.',
  },
  {
    padas: ['कलत्रं सुता बन्धुवर्गः पशुर्वा', 'नरो वाथ नारि गृहे ये मदीयाः', 'यजन्तो नमन्तः स्तुवन्तो भवन्तं', 'स्मरन्तश्च ते सन्तु सर्वे कुमार'],
    meaning: 'O Kumara, whoever is mine -- wife, children, kinsfolk, cattle, or any man or woman of my household -- may all of them be forever worshipping, bowing to, praising, and remembering you.',
  },
  {
    padas: ['मृगाः पक्षिणो दंशका ये च दुष्टाः', 'तथा व्याधयो बाधका ये मदङ्गे', 'भवच्छक्तितीक्ष्णाग्रभिन्नाः सुदूरे', 'विनश्यन्तु ते चूर्णितक्रौञ्चशैल'],
    meaning: 'O crusher of Mount Krauncha, may all wild beasts, birds, venomous biting creatures, and troubling diseases in my body be pierced by the sharp point of your spear and perish, driven far away.',
  },
  {
    padas: ['जनित्री पिता च स्वपुत्रापराधं', 'सहेते न किं देवसेनाधिनाथ', 'अहं चातिबालो भवान् लोकतातः', 'क्षमस्वापराधं समस्तं महेश'],
    meaning: 'O lord of Devasena\'s army, do not a mother and father forgive their own child\'s faults? I am but a mere child, and you are the father of the whole world -- O great lord, forgive me all my faults.',
  },
  {
    padas: ['नमः केकिने शक्तये चापि तुभ्यं', 'नमश्छाग तुभ्यं नमः कुक्कुटाय', 'नमः सिन्धवे सिन्धुदेशाय तुभ्यं', 'पुनः स्कन्दमूर्ते नमस्ते नमोऽस्तु'],
    meaning: 'Salutations to your peacock, and to you, O spear; salutations to your goat, salutations to your rooster; salutations to the ocean, and to you, lord of the ocean-land -- again and again, O form of Skanda, salutations, salutations to you.',
  },
  {
    padas: ['जयानन्दभूमञ्जयापारधामन्', 'जयामोघकीर्ते जयानन्दमूर्ते', 'जयानन्दसिन्धो जयाशेषबन्धो', 'जय त्वं सदा मुक्तिदानेशसूनो'],
    meaning: 'Victory to you, ground of bliss; victory, O boundless abode; victory, O unfailing in fame; victory, O embodiment of bliss; victory, O ocean of bliss; victory, O kinsman of all; victory to you forever, O son of Isha, bestower of liberation.',
  },
  {
    padas: ['भुजङ्गाख्यवृत्तेन क्ऌप्तं स्तवं यः', 'पठेद्भक्तियुक्तो गुहं संप्रणम्य', 'स पुत्रान्कलत्रं धनं दीर्घमायुः', 'लभेत्स्कन्दसायुज्यमन्ते नरः सः'],
    meaning: 'Whoever, having bowed reverently to Guha, recites with devotion this hymn composed in the meter called Bhujanga, shall obtain sons, a wife, wealth, and long life, and that person, at the very end, shall attain union with Skanda.',
  },
];

if (VERSES.length !== 33) throw new Error(`Expected 33 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 4) throw new Error(`Verse ${i + 1}: expected 4 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 33 verses, 4 padas each.\n');

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

console.log('Sample (verses 1, 12, 19, 33):\n');
[0, 11, 18, 32].forEach(i => console.log(rows[i], '\n'));

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
