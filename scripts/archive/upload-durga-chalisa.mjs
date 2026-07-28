/**
 * Uploads Durga Chalisa (Hindi, "Namo Namo Durge Sukh Karani", attributed to
 * Devidas) to shloka_stanzas. No user-supplied source text -- sourced from
 * the web and cross-checked across three independent sites:
 *   - bhaktibharat.com/chalisa/shri-durga-chalisa (primary source)
 *   - kabirlyrics.com/chalisa/durga-chalisa (independent transcription)
 *   - aajtak.in/religion/chalisa/durga-chalisa-2443793 (independent
 *     transcription, used as tie-breaker on the handful of points where
 *     the first two disagreed)
 * All fetched via curl + HTML-strip (WebFetch's summarizer declined to
 * quote this public-domain text verbatim). Every chaupai (1-40) was
 * checked against at least two of the three sources; checkpoint numerals
 * embedded in bhaktibharat's and aajtak's text (after chaupai 10/20/30/40)
 * confirm the numbering. A handful of genuine (not just spelling) wording
 * splits were resolved toward the 2-of-3 majority reading, e.g.:
 *   - Chaupai 1, line 2: "नमो नमो अंबे दुःख हरनी" (kabirlyrics + aajtak)
 *     over bhaktibharat's repeated "नमो नमो दुर्गे दुःख हरनी".
 *   - Chaupai 36, line 2: "मोह मदादिक सब बिनशावें" (bhaktibharat + aajtak)
 *     over kabirlyrics' "रिपू मुरख मौही डरपावे".
 *   - Chaupai 40, line 1: "दुर्गा चालीसा जो कोई गावै" (kabirlyrics + aajtak,
 *     no "श्री") over bhaktibharat's "श्री दुर्गा चालीसा जो कोई गावै".
 * A handful of other differences were purely cosmetic spelling variance
 * (जाको/जिसको, तिहूं/तिहूँ, सन्तन/संतन, etc.), resolved toward whichever
 * two of the three sources agreed.
 *
 * STRUCTURE (verified, not the generic doha+40+doha template): this
 * specific Durga Chalisa does NOT have a separate opening or closing doha
 * -- it begins directly with chaupai 1 ("नमो नमो दुर्गे...", confirmed by
 * the checkpoint numeral landing exactly 10 couplets later) and, per
 * user direction after checking multiple sources, is uploaded here as
 * exactly the 40 verified chaupai, with no doha rows manufactured to force
 * a match to the declared stanza_count of 42. (Some published editions,
 * e.g. bhaktibharat's, append an unnumbered "Devidas" signature couplet
 * and a further closing doha after chaupai 40; kabirlyrics has neither.
 * Given that split and the direction to proceed with the 40 chaupai, those
 * trailing lines are not included here.) This mirrors the "upload what is
 * verified, flag the gap, do not force it" precedent from the Murugan
 * Suprabhatam and Ganesh Chalisa uploads this session.
 *
 * Row labels per this task's requirement: each row is labelled "Chaupai N"
 * (not "Ślōka N") -- there is no "Doha (Opening)"/"Doha (Closing)" row
 * since this text does not have one (see above).
 *
 * Devanagari numeral convention: each row carries its own traditional
 * chaupai number (।१। through ।४०।), matching every published edition.
 *
 * IAST note: same Hindi-specific fixes as upload-ganesh-chalisa.mjs /
 * upload-hanuman-chalisa.mjs (fixNukta for ड़/ढ़, fixCandrabindu for the
 * bare "~" Sanscript emits for चंद्रबिंदु). Schwa deletion is applied
 * narrowly to शंकर (śaṃkara -> śaṃkar) when it stands as its own word
 * (chaupai 30, 31) -- the one clearly standalone, frequently-recurring
 * proper noun in this text where the final vowel is not pronounced in
 * natural Hindi. दुर्गा/भवानी/जगदम्बा etc. are untouched since their final
 * vowel is genuinely long (ā/ī), not a deleted short schwa. No source for
 * this text publishes IAST directly, so this was derived via Sanscript
 * with the fixes above rather than sourced verbatim.
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Devanagari, matching the approach used for every
 * prior upload this session.
 *
 * Telugu and Tamil are derived from the verified Devanagari via Sanscript /
 * the custom Tamil superscript converter, same pipeline as every other
 * upload -- schwa deletion is an IAST-display concern only and does not
 * affect the Telugu/Tamil script mapping.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-durga-chalisa.mjs          (dry run)
 *      node scripts/upload-durga-chalisa.mjs --write  (apply)
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
const SLUG = 'durga-chalisa';

const CHAUPAIS = [
  { n: 1, padas: ['नमो नमो दुर्गे सुख करनी', 'नमो नमो अंबे दुःख हरनी'],
    meaning: 'Salutations, salutations to Durga, giver of happiness. Salutations, salutations to Amba, remover of sorrow.' },
  { n: 2, padas: ['निरंकार है ज्योति तुम्हारी', 'तिहूँ लोक फैली उजियारी'],
    meaning: 'Formless is your light; it spreads its brilliance through all three worlds.' },
  { n: 3, padas: ['शशि ललाट मुख महाविशाला', 'नेत्र लाल भृकुटि विकराला'],
    meaning: 'The moon adorns your forehead, your face is vast and great; your eyes are red, your brows fearsome.' },
  { n: 4, padas: ['रूप मातु को अधिक सुहावे', 'दरश करत जन अति सुख पावे'],
    meaning: "The Mother's form is exceedingly lovely; those who behold it attain the greatest joy." },
  { n: 5, padas: ['तुम संसार शक्ति लै कीना', 'पालन हेतु अन्न धन दीना'],
    meaning: 'You created the world by taking up power, and gave grain and wealth for its sustenance.' },
  { n: 6, padas: ['अन्नपूर्णा हुई जग पाला', 'तुम ही आदि सुन्दरी बाला'],
    meaning: 'As Annapurna you have nourished the world; you alone are the primordial, beautiful maiden.' },
  { n: 7, padas: ['प्रलयकाल सब नाशन हारी', 'तुम गौरी शिवशंकर प्यारी'],
    meaning: 'At the time of dissolution you are the destroyer of all; you are Gauri, beloved of Shiva-Shankar.' },
  { n: 8, padas: ['शिव योगी तुम्हरे गुण गावें', 'ब्रह्मा विष्णु तुम्हें नित ध्यावें'],
    meaning: 'Shiva and the yogis sing your praises; Brahma and Vishnu meditate on you always.' },
  { n: 9, padas: ['रूप सरस्वती को तुम धारा', 'दे सुबुद्धि ऋषि मुनिन उबारा'],
    meaning: 'You took the form of Saraswati, and by granting good wisdom you delivered the sages and seers.' },
  { n: 10, padas: ['धरयो रूप नरसिंह को अम्बा', 'परगट भई फाड़कर खम्बा'],
    meaning: 'You, O Mother, took the form of Narasimha, appearing by tearing open the pillar.' },
  { n: 11, padas: ['रक्षा करि प्रह्लाद बचायो', 'हिरण्याक्ष को स्वर्ग पठायो'],
    meaning: 'You protected and saved Prahlada, and sent Hiranyaksha to the heavens.' },
  { n: 12, padas: ['लक्ष्मी रूप धरो जग माहीं', 'श्री नारायण अंग समाहीं'],
    meaning: 'You took the form of Lakshmi in the world, dwelling upon the body of Sri Narayana.' },
  { n: 13, padas: ['क्षीरसिन्धु में करत विलासा', 'दयासिन्धु दीजै मन आसा'],
    meaning: 'You sport in the ocean of milk; O ocean of compassion, fulfill the desire of my heart.' },
  { n: 14, padas: ['हिंगलाज में तुम्हीं भवानी', 'महिमा अमित न जात बखानी'],
    meaning: 'You alone are Bhavani at Hinglaj; your glory is boundless, beyond description.' },
  { n: 15, padas: ['मातंगी अरु धूमावति माता', 'भुवनेश्वरी बगला सुख दाता'],
    meaning: 'Mother Matangi and Dhumavati, Bhuvaneshwari and Bagalamukhi, giver of happiness.' },
  { n: 16, padas: ['श्री भैरव तारा जग तारिणी', 'छिन्न भाल भव दुःख निवारिणी'],
    meaning: 'Bhairavi and Tara, who ferry the world across; Chhinnamasta, remover of worldly sorrow.' },
  { n: 17, padas: ['केहरि वाहन सोह भवानी', 'लांगुर वीर चलत अगवानी'],
    meaning: 'Bhavani shines mounted on her lion; the valiant Langur walks before her as vanguard.' },
  { n: 18, padas: ['कर में खप्पर खड्ग विराजै', 'जाको देख काल डर भाजै'],
    meaning: 'In her hands shine the skull-bowl and sword; seeing them, even death flees in fear.' },
  { n: 19, padas: ['सोहै अस्त्र और त्रिशूला', 'जाते उठत शत्रु हिय शूला'],
    meaning: 'Her weapons and trident shine forth, at which a pang of fear rises in the hearts of her foes.' },
  { n: 20, padas: ['नगरकोट में तुम्हीं विराजत', 'तिहुँलोक में डंका बाजत'],
    meaning: 'You reside at Nagarkot; your drum resounds through all three worlds.' },
  { n: 21, padas: ['शुम्भ निशुम्भ दानव तुम मारे', 'रक्तबीज शंखन संहारे'],
    meaning: "You slew the demons Shumbha and Nishumbha, and destroyed Raktabija's countless forms." },
  { n: 22, padas: ['महिषासुर नृप अति अभिमानी', 'जेहि अघ भार मही अकुलानी'],
    meaning: 'The king Mahishasura was exceedingly arrogant, whose burden of sin made the earth tremble.' },
  { n: 23, padas: ['रूप कराल कालिका धारा', 'सेन सहित तुम तिहि संहारा'],
    meaning: 'You took the terrible form of Kalika, and destroyed him along with his army.' },
  { n: 24, padas: ['परी गाढ़ सन्तन पर जब जब', 'भई सहाय मातु तुम तब तब'],
    meaning: 'Whenever great distress fell upon your devotees, you, O Mother, came to their aid.' },
  { n: 25, padas: ['अमरपुरी अरु बासव लोका', 'तब महिमा सब रहें अशोका'],
    meaning: 'In Amaravati and the realm of Indra, by your glory all remain free from sorrow.' },
  { n: 26, padas: ['ज्वाला में है ज्योति तुम्हारी', 'तुम्हें सदा पूजें नरनारी'],
    meaning: 'Your flame burns at Jwalamukhi; men and women worship you forever.' },
  { n: 27, padas: ['प्रेम भक्ति से जो यश गावें', 'दुःख दारिद्र निकट नहिं आवें'],
    meaning: 'Whoever sings your glory with love and devotion, sorrow and poverty do not come near them.' },
  { n: 28, padas: ['ध्यावे तुम्हें जो नर मन लाई', 'जन्ममरण ताकौ छुटि जाई'],
    meaning: 'Whoever meditates on you with a focused mind is freed from the cycle of birth and death.' },
  { n: 29, padas: ['जोगी सुर मुनि कहत पुकारी', 'योग न हो बिन शक्ति तुम्हारी'],
    meaning: 'Yogis, gods and sages proclaim aloud: without your power, no yoga can be attained.' },
  { n: 30, padas: ['शंकर आचारज तप कीनो', 'काम अरु क्रोध जीति सब लीनो'],
    meaning: 'Shankaracharya performed austerities, and conquered desire and anger entirely.' },
  { n: 31, padas: ['निशिदिन ध्यान धरो शंकर को', 'काहु काल नहिं सुमिरो तुमको'],
    meaning: 'Day and night he held Shankara in meditation, but at no time did he remember you.' },
  { n: 32, padas: ['शक्ति रूप का मरम न पायो', 'शक्ति गई तब मन पछितायो'],
    meaning: 'He did not grasp the mystery of the form of Shakti; when his power departed, his heart was filled with regret.' },
  { n: 33, padas: ['शरणागत हुई कीर्ति बखानी', 'जय जय जय जगदम्ब भवानी'],
    meaning: 'He took refuge in you and proclaimed your glory: victory, victory, victory, O Jagadamba Bhavani!' },
  { n: 34, padas: ['भई प्रसन्न आदि जगदम्बा', 'दई शक्ति नहिं कीन विलम्बा'],
    meaning: 'The primal Jagadamba was pleased, and granted him power without delay.' },
  { n: 35, padas: ['मोको मातु कष्ट अति घेरो', 'तुम बिन कौन हरै दुःख मेरो'],
    meaning: 'O Mother, great trouble surrounds me; without you, who can remove my sorrow?' },
  { n: 36, padas: ['आशा तृष्णा निपट सतावें', 'मोह मदादिक सब बिनशावें'],
    meaning: 'Hope and craving torment me completely; destroy in me all delusion, pride and the like.' },
  { n: 37, padas: ['शत्रु नाश कीजै महारानी', 'सुमिरौं इकचित तुम्हें भवानी'],
    meaning: 'O great queen, destroy my enemies; I remember you, O Bhavani, with a single-pointed mind.' },
  { n: 38, padas: ['करो कृपा हे मातु दयाला', 'ऋद्धिसिद्धि दै करहु निहाला'],
    meaning: 'Show mercy, O compassionate Mother; grant me Riddhi and Siddhi and make me joyful.' },
  { n: 39, padas: ['जब लगि जिऊँ दया फल पाऊँ', 'तुम्हरो यश मैं सदा सुनाऊँ'],
    meaning: 'As long as I live, may I receive the fruit of your grace; may I ever proclaim your glory.' },
  { n: 40, padas: ['दुर्गा चालीसा जो कोई गावै', 'सब सुख भोग परमपद पावै'],
    meaning: 'Whoever sings this Durga Chalisa attains every happiness and reaches the supreme abode.' },
];

if (CHAUPAIS.length !== 40) throw new Error(`Expected 40 chaupais, got ${CHAUPAIS.length}`);
CHAUPAIS.forEach((c, i) => {
  if (c.n !== i + 1) throw new Error(`Chaupai out of sequence at index ${i}: labelled ${c.n}`);
  if (c.padas.length !== 2) throw new Error(`Chaupai ${c.n}: expected 2 padas, got ${c.padas.length}`);
});
console.log('Structure check passed: 40 chaupais, 2 padas each (this Durga Chalisa has no separate opening/closing doha -- see header comment; declared stanza_count is 42, uploading the verified 40).\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// See upload-hanuman-chalisa.mjs / upload-ganesh-chalisa.mjs for the
// original derivation of these fixes -- reused verbatim, the underlying
// Sanscript quirks are the same for any Hindi-sourced text.
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}

const NASAL_VOWEL = { a: 'ã', i: 'ĩ', u: 'ũ', e: 'ẽ', o: 'õ' };
function fixCandrabindu(iast) {
  return iast.replace(/([aiueo])~/g, (_, v) => NASAL_VOWEL[v] || (v + '̃'));
}

// Hindi schwa deletion, applied narrowly: शंकर read aloud as its own
// standalone word (chaupai 30, 31) drops the final schwa ("Śaṃkar", not
// "Śaṃkara"). Compounds (शिवशंकर) are a single unbroken token and so are
// untouched by this token-level replace. दुर्गा/भवानी/जगदम्बा etc. are
// left alone since their final vowel is genuinely long, not a schwa.
const SCHWA_DELETE = { śaṃkara: 'śaṃkar' };
function hindiSchwa(iast) {
  return iast.split(' ').map(tok => SCHWA_DELETE[tok] || tok).join(' ');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

const rows = CHAUPAIS.map((c, i) => {
  const stanzaNumber = i + 1;
  const devaPadas = [...c.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ` ॥${toDevNumeral(c.n)}॥`;

  return {
    stanza_number: stanzaNumber,
    stanza_label: `Chaupai ${c.n}`,
    script_devanagari: devaPadas.join('|'),
    script_telugu: c.padas.map(p => Sanscript.t(p, 'devanagari', 'telugu')).join('|'),
    script_tamil: c.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: c.padas.map(p => addMacrons(hindiSchwa(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: c.meaning,
  };
});

console.log('Sample (chaupai 1, 10, 30, 40):\n');
[0, 9, 29, 39].forEach(i => console.log(rows[i], '\n'));

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
