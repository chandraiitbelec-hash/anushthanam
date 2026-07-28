/**
 * Uploads Hanuman Chalisa (Tulsidas, 16th century, Awadhi) to shloka_stanzas.
 * No user-supplied source text -- sourced from the web and cross-checked
 * across multiple independent sites before use:
 *   - greenmesg.org/stotras/hanuman/hanuman_chalisa.php (primary Devanagari
 *     source, fetched in verse-range batches)
 *   - hanuman-chalisa.com (Devanagari + informal transliteration,
 *     cross-check on nearly every verse range)
 *   - stotranidhi.com (IAST transliteration, used to calibrate the Awadhi
 *     schwa-deletion question -- see IAST note below)
 *   - sanskritdocuments.org/doc_hanumaana/ (used only to confirm the
 *     existence/structure of the canonical Hindi text -- that site asks for
 *     no reproduction of its specific formatted edition, so it was used for
 *     verification, not as a literal copy source)
 *   - a plain web search cross-check on chaupai 34 ("raghubara pur" vs
 *     "raghupati pur"), which was genuinely split 1-1 between two fetched
 *     sources; a third independent hit (search snippet + a third site)
 *     confirmed "raghubara pur jaai", which is what's used here.
 * Every chaupai (1-40), both opening dohas, and the closing doha were
 * checked against at least one of the above and matched with only cosmetic
 * spelling variance (e.g. "बरन/बरण", "जुग/युग", "बिकट/विकट",
 * "जगबंदन/जग-वंदन") -- resolved toward the more traditional Awadhi spelling
 * consistent with the majority of sources, same approach as every prior
 * upload this session. No wording-level (as opposed to spelling-level)
 * discrepancies were found anywhere in the 40 chaupais.
 *
 * Structural note (verse-count reconciliation): every source agrees the
 * traditional printed structure is 2 opening dohas + 40 chaupais + 1 closing
 * doha = 43 verses total (confirmed independently via bhaktibharat.org,
 * hanuman-chalisa.com, and Wikipedia's own count). The site's declared
 * stanza_count is 42. Rather than drop verified content to force a match,
 * the two opening dohas -- which are conventionally recited/printed as a
 * single introductory unit immediately before "chaupai 1" begins, with no
 * chaupai in between -- are combined into ONE stanza row (4 padas: both
 * lines of doha 1, then both lines of doha 2), labelled "Doha (Opening)".
 * That, plus all 40 chaupais, plus one "Doha (Closing)" row, totals exactly
 * 42 rows with zero content trimmed or omitted -- every line of the
 * traditional 43-verse text is present, just grouped into 42 database rows.
 *
 * IAST note: this is Awadhi, not Sanskrit, so schwa deletion is a real
 * concern (e.g. "Rām" not "Rāma") that Sanscript's devanagari->iast mode
 * (built for Sanskrit) does not handle. Before assuming aggressive
 * deletion was needed throughout, the well-known phrase "Buddhihīna Tanu
 * Jānike" was checked against stotranidhi.com's published IAST, which
 * renders it exactly that way -- i.e. with the schwa retained, identical
 * to Sanscript's literal, undeleted output. That calibration check showed
 * the widely-published IAST convention for this text does NOT do blanket
 * schwa deletion; it mostly transliterates literally, same as this site's
 * existing Sanskrit stotras. The one explicit, unambiguous case is राम
 * (rāma) used as its own standalone word (not part of an unbroken
 * Devanagari compound like रामदूत/रामचंद्र, which stay as rāmadūta/
 * rāmacandra) -- rendered "Rām" per actual Awadhi/Hindi pronunciation.
 * Everything else uses Sanscript's direct transliteration plus this site's
 * standing e->e-macron / o->o-macron convention, matching every other
 * stotra uploaded this session. One additional fix on top of Sanscript's
 * raw output: it renders candrabindu (nasalization with no following
 * consonant, e.g. तिहुँ/महँ, several of which occur in this text) as a bare
 * "~" appended after the vowel -- replaced here with the standard nasalized
 * vowel diacritic (tihu~ -> tihũ, maha~ -> mahã) instead. Separately,
 * Sanscript has no support at all for nukta consonants (ड़/ढ़, the
 * Hindi/Awadhi retroflex-flap letters in बड़ाई/पढ़े/छुड़ावै) -- it
 * transliterates the base letter and passes the nukta mark through raw and
 * un-transliterated (e.g. "baḍa़āī" instead of "baṛāī"); fixed here by
 * collapsing the resulting garbled pattern into the correct ṛ/ṛh. The
 * shared lib-tamil-superscript.mjs had the identical gap (nukta and
 * whatever matra followed it leaked through as raw, un-converted
 * Devanagari) -- fixed there directly, the same way avagraha is already
 * handled: nukta has no distinct Tamil letter, so the converter now looks
 * past it for the real virama/matra instead of passing it through.
 *
 * Devanagari numeral convention: chaupai lines carry their TRADITIONAL
 * printed number (।१। through ।४०।, matching every published edition and
 * how this text is universally known/recited), not the database's
 * sequential stanza_number (1-42, which also counts both doha rows). Doha
 * lines carry no numeral at all, matching how dohas are conventionally
 * printed unnumbered in this text (verified against sources above).
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Devanagari (verbatim web translations came back
 * paraphrased/truncated by fetch tooling, not usable as faithful quotes),
 * matching the approach used for every prior upload this session.
 *
 * Telugu and Tamil are derived from the verified Devanagari via Sanscript /
 * the custom Tamil superscript converter, same pipeline as every other
 * upload -- schwa deletion is an IAST-display concern only and does not
 * affect the Telugu/Tamil script mapping.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-hanuman-chalisa.mjs          (dry run)
 *      node scripts/upload-hanuman-chalisa.mjs --write  (apply)
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
const SLUG = 'hanuman-chalisa';

const OPEN_DOHA = {
  type: 'doha',
  label: 'Doha (Opening)',
  padas: [
    'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि',
    'बरनउँ रघुबर बिमल जसु जो दायकु फल चारि',
    'बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार',
    'बल बुधि विद्या देहु मोहिं हरहु कलेश विकार',
  ],
  meaning: "Having purified the mirror of my mind with the dust of my Guru's lotus feet, I describe the pure glory of Sri Rama, best of the Raghu line, which bestows the four fruits of life (dharma, artha, kama and moksha). Knowing my own body devoid of wisdom, I remember the son of the Wind, Hanuman: grant me strength, wisdom and knowledge, and remove my afflictions and faults.",
};

const CHAUPAIS = [
  { n: 1, padas: ['जय हनुमान ज्ञान गुन सागर', 'जय कपीस तिहुँ लोक उजागर'],
    meaning: 'Victory to Hanuman, ocean of wisdom and virtue. Victory to the lord of monkeys, illuminator of the three worlds.' },
  { n: 2, padas: ['राम दूत अतुलित बल धामा', 'अंजनि पुत्र पवनसुत नामा'],
    meaning: "Messenger of Rama, abode of matchless strength, known by the names Anjani-putra and Pavanasuta, son of Anjani and son of the Wind." },
  { n: 3, padas: ['महाबीर बिक्रम बजरंगी', 'कुमति निवार सुमति के संगी'],
    meaning: 'Great hero, mighty and thunderbolt-bodied; dispeller of evil intellect, companion of good sense.' },
  { n: 4, padas: ['कंचन बरन बिराज सुबेसा', 'कानन कुंडल कुंचित केसा'],
    meaning: 'Golden-hued, resplendent in fine attire, with earrings in his ears and curly locks of hair.' },
  { n: 5, padas: ['हाथ बज्र औ ध्वजा बिराजै', 'काँधे मूँज जनेऊ साजै'],
    meaning: 'In his hand shine the mace and the banner; upon his shoulder rests the sacred thread of munja grass.' },
  { n: 6, padas: ['शंकर सुवन केसरीनंदन', 'तेज प्रताप महा जग बंदन'],
    meaning: 'Manifestation of Shankara, son of Kesari, whose splendour and glory the whole world reveres.' },
  { n: 7, padas: ['विद्यावान गुनी अति चातुर', 'राम काज करिबे को आतुर'],
    meaning: "Learned, virtuous and exceedingly clever, ever eager to accomplish Rama's tasks." },
  { n: 8, padas: ['प्रभु चरित्र सुनिबे को रसिया', 'राम लखन सीता मन बसिया'],
    meaning: "Delighting in hearing the Lord's deeds, with Rama, Lakshmana and Sita ever dwelling in his heart." },
  { n: 9, padas: ['सूक्ष्म रूप धरि सियहिं दिखावा', 'बिकट रूप धरि लंक जरावा'],
    meaning: 'Taking a tiny form he showed himself to Sita; taking a fearsome form he burned Lanka.' },
  { n: 10, padas: ['भीम रूप धरि असुर सँहारे', 'रामचंद्र के काज सँवारे'],
    meaning: "Taking a terrible form he destroyed the demons, accomplishing Ramachandra's tasks." },
  { n: 11, padas: ['लाय संजीवन लखन जियाये', 'श्रीरघुबीर हरषि उर लाये'],
    meaning: 'Bringing the Sanjeevani herb he revived Lakshmana; the joyful Raghubir embraced him to his heart.' },
  { n: 12, padas: ['रघुपति कीन्ही बहुत बड़ाई', 'तुम मम प्रिय भरतहि सम भाई'],
    meaning: 'The lord of the Raghus praised him greatly: you are as dear to me as my own brother Bharata.' },
  { n: 13, padas: ['सहस बदन तुम्हरो जस गावैं', 'अस कहि श्रीपति कंठ लगावैं'],
    meaning: 'May the thousand-headed serpent sing your glory -- so saying, the Lord of Lakshmi embraced him.' },
  { n: 14, padas: ['सनकादिक ब्रह्मादि मुनीसा', 'नारद सारद सहित अहीसा'],
    meaning: 'Sanaka and the other sages, Brahma and the great seers, Narada, Sarada and the lord of serpents all praise him.' },
  { n: 15, padas: ['जम कुबेर दिक्पाल जहाँ ते', 'कबि कोबिद कहि सके कहाँ ते'],
    meaning: 'Yama, Kubera and the guardians of the directions -- even poets and scholars cannot fully describe your glory.' },
  { n: 16, padas: ['तुम उपकार सुग्रीवहिं कीन्हा', 'राम मिलाय राजपद दीन्हा'],
    meaning: 'You did a great favour for Sugriva, uniting him with Rama and bestowing on him the kingdom.' },
  { n: 17, padas: ['तुम्हरो मंत्र बिभीषन माना', 'लंकेस्वर भए सब जग जाना'],
    meaning: 'Vibhishana heeded your counsel and became the lord of Lanka, as the whole world knows.' },
  { n: 18, padas: ['जुग सहस्र जोजन पर भानू', 'लील्यो ताहि मधुर फल जानू'],
    meaning: 'The sun, thousands of yojanas away, you swallowed thinking it a sweet fruit.' },
  { n: 19, padas: ['प्रभु मुद्रिका मेलि मुख माहीं', 'जलधि लाँघि गये अचरज नाहीं'],
    meaning: "Placing the Lord's ring in your mouth, you leapt across the ocean -- no wonder at all." },
  { n: 20, padas: ['दुर्गम काज जगत के जेते', 'सुगम अनुग्रह तुम्हरे तेते'],
    meaning: 'However difficult the tasks of the world may be, they become easy by your grace.' },
  { n: 21, padas: ['राम दुआरे तुम रखवारे', 'होत न आज्ञा बिनु पैसारे'],
    meaning: "You are the guardian at Rama's door; none may enter without your leave." },
  { n: 22, padas: ['सब सुख लहै तुम्हारी सरना', 'तुम रच्छक काहू को डर ना'],
    meaning: 'All happiness is found in your refuge; with you as protector, there is nothing to fear.' },
  { n: 23, padas: ['आपन तेज सम्हारो आपै', 'तीनों लोक हाँक तें काँपै'],
    meaning: 'You alone can contain your own splendour; at your roar, the three worlds tremble.' },
  { n: 24, padas: ['भूत पिसाच निकट नहिं आवै', 'महाबीर जब नाम सुनावै'],
    meaning: 'Ghosts and evil spirits do not come near when your name, O great hero, is uttered.' },
  { n: 25, padas: ['नासै रोग हरै सब पीरा', 'जपत निरंतर हनुमत बीरा'],
    meaning: 'Disease is destroyed and all pain removed by ceaselessly chanting the name of the valiant Hanuman.' },
  { n: 26, padas: ['संकट तें हनुमान छुड़ावै', 'मन क्रम बचन ध्यान जो लावै'],
    meaning: 'Hanuman delivers from trouble one who fixes attention on him in thought, word and deed.' },
  { n: 27, padas: ['सब पर राम तपस्वी राजा', 'तिन के काज सकल तुम साजा'],
    meaning: 'Above all reigns Rama, the ascetic king; you accomplish all of his tasks.' },
  { n: 28, padas: ['और मनोरथ जो कोई लावै', 'सोइ अमित जीवन फल पावै'],
    meaning: 'Whatever desire anyone brings to you, that person obtains the boundless fruit of life.' },
  { n: 29, padas: ['चारों जुग परताप तुम्हारा', 'है परसिद्ध जगत उजियारा'],
    meaning: 'Your glory pervades all four ages; it is renowned and illumines the whole world.' },
  { n: 30, padas: ['साधु संत के तुम रखवारे', 'असुर निकंदन राम दुलारे'],
    meaning: 'You are the protector of saints and sages, destroyer of demons, and the beloved of Rama.' },
  { n: 31, padas: ['अष्ट सिद्धि नौ निधि के दाता', 'अस बर दीन जानकी माता'],
    meaning: 'Giver of the eight siddhis and nine treasures -- this boon was granted to you by Mother Janaki.' },
  { n: 32, padas: ['राम रसायन तुम्हरे पासा', 'सदा रहो रघुपति के दासा'],
    meaning: 'The elixir of devotion to Rama is ever with you; may you remain forever the servant of Raghupati.' },
  { n: 33, padas: ['तुम्हरे भजन राम को पावै', 'जनम जनम के दुख बिसरावै'],
    meaning: 'By worshipping you, one attains Rama and forgets the sorrows of birth after birth.' },
  { n: 34, padas: ['अंत काल रघुबर पुर जाई', 'जहाँ जन्म हरिभक्त कहाई'],
    meaning: "At the end of life one goes to the abode of Rama, and being born there is called a devotee of Hari." },
  { n: 35, padas: ['और देवता चित्त न धरई', 'हनुमत सेइ सर्ब सुख करई'],
    meaning: 'One need not hold any other deity in mind; serving Hanuman alone brings every happiness.' },
  { n: 36, padas: ['संकट कटै मिटै सब पीरा', 'जो सुमिरै हनुमत बलबीरा'],
    meaning: 'All troubles are cut away and every pain vanishes for one who remembers the mighty hero Hanuman.' },
  { n: 37, padas: ['जय जय जय हनुमान गोसाईं', 'कृपा करहु गुरुदेव की नाईं'],
    meaning: 'Victory, victory, victory to Lord Hanuman! Show your grace as a true guru would.' },
  { n: 38, padas: ['जो सत बार पाठ कर कोई', 'छूटहि बंदि महा सुख होई'],
    meaning: 'Whoever recites this a hundred times is released from bondage and attains great happiness.' },
  { n: 39, padas: ['जो यह पढ़े हनुमान चालीसा', 'होय सिद्धि साखी गौरीसा'],
    meaning: 'Whoever reads this Hanuman Chalisa attains success -- Lord Shiva himself is witness to it.' },
  { n: 40, padas: ['तुलसीदास सदा हरि चेरा', 'कीजै नाथ हृदय महँ डेरा'],
    meaning: 'Tulsidas is forever the servant of Hari; O Lord, make your dwelling in my heart.' },
];

const CLOSE_DOHA = {
  type: 'doha',
  label: 'Doha (Closing)',
  padas: [
    'पवनतनय संकट हरन मंगल मूरति रूप',
    'राम लखन सीता सहित हृदय बसहु सुर भूप',
  ],
  meaning: 'O son of the Wind, remover of troubles, embodiment of auspiciousness -- dwell in my heart together with Rama, Lakshmana and Sita, O king of the gods.',
};

const ITEMS = [OPEN_DOHA, ...CHAUPAIS, CLOSE_DOHA];

if (ITEMS.length !== 42) throw new Error(`Expected 42 stanza rows, got ${ITEMS.length}`);
if (OPEN_DOHA.padas.length !== 4) throw new Error(`Opening doha: expected 4 padas, got ${OPEN_DOHA.padas.length}`);
if (CLOSE_DOHA.padas.length !== 2) throw new Error(`Closing doha: expected 2 padas, got ${CLOSE_DOHA.padas.length}`);
if (CHAUPAIS.length !== 40) throw new Error(`Expected 40 chaupais, got ${CHAUPAIS.length}`);
CHAUPAIS.forEach((c, i) => {
  if (c.n !== i + 1) throw new Error(`Chaupai out of sequence at index ${i}: labelled ${c.n}`);
  if (c.padas.length !== 2) throw new Error(`Chaupai ${c.n}: expected 2 padas, got ${c.padas.length}`);
});
console.log('Structure check passed: 1 opening doha (4 padas) + 40 chaupais (2 padas each) + 1 closing doha (2 padas) = 42 rows.\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// Sanscript's iast scheme has no notion of nukta consonants (ड़/ढ़, the
// Hindi/Awadhi retroflex-flap letters used in बड़ाई, पढ़े, छुड़ावै here) --
// it transliterates the base letter (ड/ढ) and then passes the nukta mark
// (़) through untouched as a raw, un-transliterated character, e.g.
// "baḍa़āī" instead of "baṛāī". Collapse those two garbled patterns into
// the correct retroflex-flap IAST (ṛ / ṛh) instead.
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}

// Sanscript's iast scheme renders चंद्रबिंदु (candrabindu, vowel nasalization
// with no following consonant, e.g. तिहुँ/महँ/काँधे/जहाँ) as a bare "~"
// appended after the vowel -- including after the long vowels ā/ī/ū that
// Sanscript itself already produces with a macron (काँधे -> "kā~dhē"). Runs
// before addMacrons, so short e/o are still bare at this point. Replace
// with a combining tilde on the vowel throughout (works uniformly for both
// short and macron-marked long vowels, which have no single precomposed
// nasalized+macron codepoint).
function fixCandrabindu(iast) {
  return iast.replace(/([aāiīuūeēoō])~/g, (_, v) => v + '̃');
}

// Awadhi/Hindi schwa deletion: राम (rāma) as its own standalone word is
// actually pronounced/read "Rām", unlike Sanskrit where the final vowel is
// retained. Devanagari compounds like रामदूत/रामचंद्र are a single unbroken
// token with no space, so they are untouched by this token-level replace.
function hindiSchwa(iast) {
  return iast.split(' ').map(tok => (tok === 'rāma' ? 'rām' : tok)).join(' ');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

// Sanscript's devanagari->telugu scheme has the same nukta gap as iast (see
// fixNukta above) but Telugu has no distinct letter for the retroflex-flap
// sound at all, so there is nothing to fix it *to* -- unlike Tamil (fixed
// directly in lib-tamil-superscript.mjs) Telugu script commonly has no
// separate grapheme for this Hindi-only sound. Stripping the nukta mark
// before conversion falls back to the plain consonant (ड़->డ, ढ़->ఢ), the
// nearest available letter -- same approximation already used for
// avagraha elsewhere in this pipeline.
function stripNukta(deva) {
  return deva.replace(/़/g, '');
}

function toRow(item, stanzaNumber, devaPadas) {
  return {
    stanza_number: stanzaNumber,
    stanza_label: item.label,
    script_devanagari: devaPadas.join('|'),
    script_telugu: item.padas.map(p => Sanscript.t(stripNukta(p), 'devanagari', 'telugu')).join('|'),
    script_tamil: item.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: item.padas.map(p => hindiSchwa(addMacrons(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: item.meaning,
  };
}

const rows = [];

// Row 1: opening doha (both traditional dohas combined into one row; no numeral)
{
  const devaPadas = [...OPEN_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  devaPadas[2] += ' ।';
  devaPadas[3] += ' ॥';
  rows.push(toRow(OPEN_DOHA, 1, devaPadas));
}

// Rows 2-41: chaupai 1-40 (Devanagari numeral is the TRADITIONAL chaupai
// number, e.g. ॥१॥..॥४०॥, not the row's own stanza_number)
CHAUPAIS.forEach((c, i) => {
  const devaPadas = [...c.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ` ॥${toDevNumeral(c.n)}॥`;
  rows.push(toRow({ ...c, label: `Chaupai ${c.n}` }, i + 2, devaPadas));
});

// Row 42: closing doha (no numeral)
{
  const devaPadas = [...CLOSE_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  rows.push(toRow(CLOSE_DOHA, 42, devaPadas));
}

console.log('Sample (rows 1, 2, 22, 41, 42):\n');
[0, 1, 21, 40, 41].forEach(i => console.log(rows[i], '\n'));

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
