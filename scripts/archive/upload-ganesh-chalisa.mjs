/**
 * Uploads Ganesh Chalisa (Hindi) to shloka_stanzas. No user-supplied source
 * text -- sourced from the web and cross-checked across independent sites:
 *   - bhaktibharat.com/chalisa/ganesh-chalisa (primary Devanagari source)
 *   - drikpanchang.com/lyrics/chalisa/lord-ganesha/shree-ganesha-chalisa.html
 *     (matched bhaktibharat character-for-character, including the embedded
 *     checkpoint numerals after chaupai 10/20/30/38 -- both fetched via curl
 *     + HTML-strip since WebFetch's summarizer declined to quote this
 *     public-domain text verbatim)
 *   - kabirlyrics.com/chalisa/ganesh-chalisa (independent transcription;
 *     matched on wording throughout, cosmetic spelling variance only, e.g.
 *     "गणराजू" vs "राजू", "शुची...सुहावना" vs "शुचि...सुहावन", "चंवर सुधारे"
 *     vs "चँवर डुलावे" -- resolved toward the bhaktibharat/drikpanchang
 *     reading since those two independent sources agree with each other
 *     exactly throughout)
 *   - utsavapp.in/gyan/g/shri-ganesh-chalisa-in-english (Devanagari +
 *     transliteration side by side; used to calibrate the IAST schwa
 *     question below, and to check one structural question -- see next)
 *
 * STANZA COUNT MISMATCH (flagged, not forced): all three primary Devanagari
 * sources agree, word for word, checkpoint numerals included, that this
 * chalisa has exactly 38 chaupai (not 40), framed by 1 opening doha and 2
 * distinct closing dohas (a phalashruti/benefit verse, then a separate
 * colophon verse giving the Samvat year of composition) -- 1 + 38 + 2 = 41
 * verified rows, not the declared 42. utsavapp.in additionally prepends a
 * doha ("jaya gaṇeśa girijā suvana, maṅgala mūla sujāna...") that would
 * supply the missing row -- but that doha was checked separately and is
 * actually the well-known OPENING doha of the Shri Shiv Chalisa (composed
 * by Ayodhyadas), not part of the Ganesh Chalisa; utsavapp.in appears to
 * have prefixed it as a generic devotional preamble, not as this
 * composition's own text. Including it here to force a 42nd row would be a
 * misattribution, not a legitimate reconciliation, so it is left out. This
 * mirrors the Murugan Suprabhatam precedent: upload the 41 verified rows,
 * flag the gap to the declared 42 clearly, do not fabricate or misattribute
 * content to close it.
 *
 * IAST note: this is Hindi, not Sanskrit, so schwa deletion is a live
 * concern for some words (e.g. गणेश read aloud as "Gaṇeś", not "Gaṇeśa").
 * Calibration check: utsavapp.in's own published transliteration keeps the
 * full "Ganesha"/"Shiva" form throughout (not schwa-deleted) -- i.e. the one
 * site that publishes IAST for this text uses a literal, Sanskrit-style
 * transliteration, same finding as the Hanuman Chalisa upload's calibration
 * against stotranidhi.com. Rather than blanket-delete schwa everywhere
 * (which the calibration source does not support), schwa deletion is
 * applied narrowly to the two proper nouns this matters most for when read
 * aloud as their own standalone word -- गणेश (gaṇeśa -> gaṇeś) and शिव
 * (śiva -> śiv) -- matching the same narrow, token-level approach used for
 * राम (rāma -> rām) in the Hanuman Chalisa script. Compounds (रामसुन्दर,
 * गजबदन, etc.) are untouched since they are a single unbroken Devanagari
 * token, not a bare occurrence of the standalone word.
 * Also reused from that script: fixNukta (Sanscript's iast scheme passes
 * nukta ड़/ढ़ through as a raw, untransliterated "़" character rather than
 * producing ṛ/ṛh) and fixCandrabindu (चंद्रबिंदु renders as a bare "~"
 * rather than the standard nasalized-vowel diacritic).
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Devanagari, matching the approach used for every prior
 * upload this session.
 *
 * Telugu and Tamil are derived from the verified Devanagari via Sanscript /
 * the custom Tamil superscript converter, same pipeline as every other
 * upload -- schwa deletion is an IAST-display concern only and does not
 * affect the Telugu/Tamil script mapping.
 *
 * Devanagari numeral convention: chaupai lines carry their TRADITIONAL
 * printed number (।१। through ।३८।, matching every published edition), not
 * the database's sequential stanza_number (1-41). Doha lines carry no
 * numeral, matching how dohas are conventionally printed unnumbered.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-ganesh-chalisa.mjs          (dry run)
 *      node scripts/upload-ganesh-chalisa.mjs --write  (apply)
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
const SLUG = 'ganesh-chalisa';

const OPEN_DOHA = {
  label: 'Doha (Opening)',
  padas: [
    'जय गणपति सदगुण सदन कविवर बदन कृपाल',
    'विघ्न हरण मंगल करण जय जय गिरिजालाल',
  ],
  meaning: 'Victory to Ganapati, abode of every virtue, gracious-faced and best among poets. Remover of obstacles, bestower of auspiciousness -- victory, victory to the beloved son of Girija.',
};

const CHAUPAIS = [
  { n: 1, padas: ['जय जय जय गणपति गणराजू', 'मंगल भरण करण शुभः काजू'],
    meaning: 'Victory, victory, victory to Ganapati, king of the Ganas, who fills all with auspiciousness and accomplishes every good work.' },
  { n: 2, padas: ['जै गजबदन सदन सुखदाता', 'विश्व विनायका बुद्धि विधाता'],
    meaning: 'Victory to the elephant-faced one, abode and giver of happiness; Vinayaka of the universe, dispenser of wisdom.' },
  { n: 3, padas: ['वक्र तुण्ड शुची शुण्ड सुहावना', 'तिलक त्रिपुण्ड भाल मन भावन'],
    meaning: 'Curved trunk, pure and lovely, with the triple-lined tilaka on his forehead, delightful to the mind.' },
  { n: 4, padas: ['राजत मणि मुक्तन उर माला', 'स्वर्ण मुकुट शिर नयन विशाला'],
    meaning: 'A garland of gems and pearls shines upon his chest; a golden crown upon his head, and large, wide eyes.' },
  { n: 5, padas: ['पुस्तक पाणि कुठार त्रिशूलं', 'मोदक भोग सुगन्धित फूलं'],
    meaning: 'In his hands he holds a book, an axe and a trident; he enjoys modaka sweets and fragrant flowers.' },
  { n: 6, padas: ['सुन्दर पीताम्बर तन साजित', 'चरण पादुका मुनि मन राजित'],
    meaning: 'His form is adorned with beautiful yellow garments; the sandals on his feet shine in the minds of sages.' },
  { n: 7, padas: ['धनि शिव सुवन षडानन भ्राता', 'गौरी लालन विश्व-विख्याता'],
    meaning: 'Blessed son of Shiva, brother of the six-faced Skanda; beloved child of Gauri, renowned throughout the world.' },
  { n: 8, padas: ['ऋद्धि-सिद्धि तव चंवर सुधारे', 'मुषक वाहन सोहत द्वारे'],
    meaning: 'Riddhi and Siddhi wave the fly-whisk over you; your mount, the mouse, sits beautifully at your door.' },
  { n: 9, padas: ['कहौ जन्म शुभ कथा तुम्हारी', 'अति शुची पावन मंगलकारी'],
    meaning: 'Let me tell the auspicious story of your birth, most pure, holy and the bringer of good fortune.' },
  { n: 10, padas: ['एक समय गिरिराज कुमारी', 'पुत्र हेतु तप कीन्हा भारी'],
    meaning: 'Once, the daughter of the mountain-king performed great austerity for the sake of a son.' },
  { n: 11, padas: ['भयो यज्ञ जब पूर्ण अनूपा', 'तब पहुंच्यो तुम धरी द्विज रूपा'],
    meaning: 'When the unparalleled sacrifice was completed, you arrived there taking the form of a Brahmin.' },
  { n: 12, padas: ['अतिथि जानी के गौरी सुखारी', 'बहुविधि सेवा करी तुम्हारी'],
    meaning: 'Recognizing you as a guest, Gauri was delighted, and served you in many ways.' },
  { n: 13, padas: ['अति प्रसन्न हवै तुम वर दीन्हा', 'मातु पुत्र हित जो तप कीन्हा'],
    meaning: 'Greatly pleased, you granted a boon for the austerity she had performed for the sake of a son.' },
  { n: 14, padas: ['मिलहि पुत्र तुहि, बुद्धि विशाला', 'बिना गर्भ धारण यहि काला'],
    meaning: 'You shall obtain a son of vast wisdom, this very time, without bearing him in the womb.' },
  { n: 15, padas: ['गणनायक गुण ज्ञान निधाना', 'पूजित प्रथम रूप भगवाना'],
    meaning: 'Lord of the Ganas, a treasury of virtue and knowledge, worshipped first among all divine forms.' },
  { n: 16, padas: ['अस कही अन्तर्धान रूप हवै', 'पालना पर बालक स्वरूप हवै'],
    meaning: 'Having said this, you vanished from sight, and appeared as an infant upon the cradle.' },
  { n: 17, padas: ['बनि शिशु रुदन जबहिं तुम ठाना', 'लखि मुख सुख नहिं गौरी समाना'],
    meaning: 'When as an infant you began to cry, seeing your face there was no joy equal to that of Gauri.' },
  { n: 18, padas: ['सकल मगन, सुखमंगल गावहिं', 'नाभ ते सुरन, सुमन वर्षावहिं'],
    meaning: 'Everyone rejoiced and sang songs of joyful auspiciousness; from the sky the gods showered flowers.' },
  { n: 19, padas: ['शम्भु, उमा, बहुदान लुटावहिं', 'सुर मुनिजन, सुत देखन आवहिं'],
    meaning: 'Shambhu and Uma gave away abundant gifts; gods and sages came to see the newborn son.' },
  { n: 20, padas: ['लखि अति आनन्द मंगल साजा', 'देखन भी आये शनि राजा'],
    meaning: 'Seeing such great joy and auspicious festivity, King Shani too came to see the child.' },
  { n: 21, padas: ['निज अवगुण गुनि शनि मन माहीं', 'बालक, देखन चाहत नाहीं'],
    meaning: 'Mindful of his own affliction, Shani did not wish to look upon the child.' },
  { n: 22, padas: ['गिरिजा कछु मन भेद बढायो', 'उत्सव मोर, न शनि तुही भायो'],
    meaning: 'Girija grew somewhat suspicious in her mind: is it that you do not care for my celebration, O Shani?' },
  { n: 23, padas: ['कहत लगे शनि, मन सकुचाई', 'का करिहौ, शिशु मोहि दिखाई'],
    meaning: 'Shani began to say, hesitant at heart: what would you gain by showing the infant to me?' },
  { n: 24, padas: ['नहिं विश्वास, उमा उर भयऊ', 'शनि सों बालक देखन कहयऊ'],
    meaning: 'Uma did not believe him, and insisted in her heart that Shani look upon the child.' },
  { n: 25, padas: ['पदतहिं शनि दृग कोण प्रकाशा', 'बालक सिर उड़ि गयो अकाशा'],
    meaning: "The moment Shani's sidelong glance fell upon him, the child's head flew off into the sky." },
  { n: 26, padas: ['गिरिजा गिरी विकल हवै धरणी', 'सो दुःख दशा गयो नहीं वरणी'],
    meaning: 'Girija collapsed to the ground in anguish; that state of sorrow cannot be described.' },
  { n: 27, padas: ['हाहाकार मच्यौ कैलाशा', 'शनि कीन्हों लखि सुत को नाशा'],
    meaning: 'An uproar of lament arose on Kailasha, seeing that Shani had caused the destruction of the son.' },
  { n: 28, padas: ['तुरत गरुड़ चढ़ि विष्णु सिधायो', 'काटी चक्र सो गज सिर लाये'],
    meaning: "At once Vishnu mounted Garuda and set out; with his discus he cut off an elephant's head and brought it." },
  { n: 29, padas: ['बालक के धड़ ऊपर धारयो', 'प्राण मन्त्र पढ़ि शंकर डारयो'],
    meaning: "He placed it upon the child's body; reciting the life-giving mantra, Shankara infused it with life." },
  { n: 30, padas: ['नाम गणेश शम्भु तब कीन्हे', 'प्रथम पूज्य बुद्धि निधि, वर दीन्हे'],
    meaning: 'Shambhu then gave him the name Ganesha, and granted him the boon of being worshipped first, the treasury of wisdom.' },
  { n: 31, padas: ['बुद्धि परीक्षा जब शिव कीन्हा', 'पृथ्वी कर प्रदक्षिणा लीन्हा'],
    meaning: 'When Shiva held a test of wisdom, he called for a circumambulation of the earth.' },
  { n: 32, padas: ['चले षडानन, भरमि भुलाई', 'रचे बैठ तुम बुद्धि उपाई'],
    meaning: 'The six-faced Skanda set off, misled by delusion; but you sat and devised a wise stratagem.' },
  { n: 33, padas: ['चरण मातु-पितु के धर लीन्हें', 'तिनके सात प्रदक्षिण कीन्हें'],
    meaning: 'You took hold of the feet of your mother and father, and circled around them seven times.' },
  { n: 34, padas: ['धनि गणेश कही शिव हिये हरषे', 'नभ ते सुरन सुमन बहु बरसे'],
    meaning: 'Shiva, delighted at heart, declared, blessed is Ganesha; from the sky the gods rained down many flowers.' },
  { n: 35, padas: ['तुम्हरी महिमा बुद्धि बड़ाई', 'शेष सहसमुख सके न गाई'],
    meaning: 'Your glory and the greatness of your wisdom -- even thousand-mouthed Shesha cannot fully sing.' },
  { n: 36, padas: ['मैं मतिहीन मलीन दुखारी', 'करहूं कौन विधि विनय तुम्हारी'],
    meaning: 'I am devoid of wisdom, impure and sorrowful; by what means may I offer you my supplication?' },
  { n: 37, padas: ['भजत रामसुन्दर प्रभुदासा', 'जग प्रयाग, ककरा, दुर्वासा'],
    meaning: "Ramsundar, the Lord's servant, worships you across the world, at Prayag, at Kakara, and by Durvasa." },
  { n: 38, padas: ['अब प्रभु दया दीना पर कीजै', 'अपनी शक्ति भक्ति कुछ दीजै'],
    meaning: 'Now, O Lord, show mercy upon this humble one; grant me some measure of your power and devotion.' },
];

const CLOSE_DOHA_1 = {
  label: 'Doha (Closing 1)',
  padas: [
    'श्री गणेश यह चालीसा पाठ करै कर ध्यान',
    'नित नव मंगल गृह बसै लहे जगत सन्मान',
  ],
  meaning: 'Whoever recites this Ganesh Chalisa with focused attention -- ever-new auspiciousness dwells in their home, and they attain honor in the world.',
};

const CLOSE_DOHA_2 = {
  label: 'Doha (Closing 2)',
  padas: [
    'सम्बन्ध अपने सहस्र दश ऋषि पंचमी दिनेश',
    'पूरण चालीसा भयो मंगल मूर्ती गणेश',
  ],
  meaning: 'In the Samvat year of its composition, on the day of Rishi Panchami, this Chalisa was completed in full, O auspicious form of Ganesha.',
};

const ITEMS = [OPEN_DOHA, ...CHAUPAIS, CLOSE_DOHA_1, CLOSE_DOHA_2];

if (ITEMS.length !== 41) throw new Error(`Expected 41 stanza rows, got ${ITEMS.length}`);
if (OPEN_DOHA.padas.length !== 2) throw new Error(`Opening doha: expected 2 padas, got ${OPEN_DOHA.padas.length}`);
if (CLOSE_DOHA_1.padas.length !== 2) throw new Error(`Closing doha 1: expected 2 padas, got ${CLOSE_DOHA_1.padas.length}`);
if (CLOSE_DOHA_2.padas.length !== 2) throw new Error(`Closing doha 2: expected 2 padas, got ${CLOSE_DOHA_2.padas.length}`);
if (CHAUPAIS.length !== 38) throw new Error(`Expected 38 chaupais, got ${CHAUPAIS.length}`);
CHAUPAIS.forEach((c, i) => {
  if (c.n !== i + 1) throw new Error(`Chaupai out of sequence at index ${i}: labelled ${c.n}`);
  if (c.padas.length !== 2) throw new Error(`Chaupai ${c.n}: expected 2 padas, got ${c.padas.length}`);
});
console.log('Structure check passed: 1 opening doha + 38 chaupais + 2 closing dohas = 41 rows (declared stanza_count is 42 -- flagged mismatch, see header comment).\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// See upload-hanuman-chalisa.mjs for the original derivation of these three
// fixes -- reused verbatim here since the underlying Sanscript quirks are
// the same for any Hindi-sourced text, not specific to that one chalisa.
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}

const NASAL_VOWEL = { a: 'ã', i: 'ĩ', u: 'ũ', e: 'ẽ', o: 'õ' };
function fixCandrabindu(iast) {
  return iast.replace(/([aiueo])~/g, (_, v) => NASAL_VOWEL[v] || (v + '̃'));
}

// Hindi schwa deletion, applied narrowly: गणेश and शिव read aloud as their
// own standalone word drop the final schwa ("Gaṇeś"/"Śiv", not "Gaṇeśa"/
// "Śiva") -- see header comment for the calibration check behind this
// choice. Compounds (गजबदन, रामसुन्दर, etc.) are a single unbroken token
// and so are untouched by this token-level replace.
const SCHWA_DELETE = { gaṇeśa: 'gaṇeś', śiva: 'śiv' };
function hindiSchwa(iast) {
  return iast.split(' ').map(tok => SCHWA_DELETE[tok] || tok).join(' ');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

function toRow(item, stanzaNumber, devaPadas) {
  return {
    stanza_number: stanzaNumber,
    stanza_label: item.label,
    script_devanagari: devaPadas.join('|'),
    script_telugu: item.padas.map(p => Sanscript.t(p, 'devanagari', 'telugu')).join('|'),
    script_tamil: item.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: item.padas.map(p => addMacrons(hindiSchwa(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: item.meaning,
  };
}

const rows = [];

// Row 1: opening doha (no numeral, matching conventional unnumbered printing)
{
  const devaPadas = [...OPEN_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  rows.push(toRow(OPEN_DOHA, 1, devaPadas));
}

// Rows 2-39: chaupai 1-38 (Devanagari numeral is the TRADITIONAL chaupai
// number, e.g. ॥१॥..॥३८॥, not the row's own stanza_number)
CHAUPAIS.forEach((c, i) => {
  const devaPadas = [...c.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ` ॥${toDevNumeral(c.n)}॥`;
  rows.push(toRow({ ...c, label: `Chaupai ${c.n}` }, i + 2, devaPadas));
});

// Rows 40-41: the two closing dohas (no numeral)
{
  const devaPadas = [...CLOSE_DOHA_1.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  rows.push(toRow(CLOSE_DOHA_1, 40, devaPadas));
}
{
  const devaPadas = [...CLOSE_DOHA_2.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  rows.push(toRow(CLOSE_DOHA_2, 41, devaPadas));
}

console.log('Sample (rows 1, 2, 31, 39, 40, 41):\n');
[0, 1, 30, 38, 39, 40].forEach(i => console.log(rows[i], '\n'));

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
