/**
 * Uploads Shiv Chalisa (attributed to Ayodhyadas, Vikram Samvat 1964 / 1907
 * CE per its own closing colophon verse) to shloka_stanzas. No user-supplied
 * source text -- sourced from the web and cross-checked across multiple
 * independent sites before use:
 *   - mahashivratri.org/shiva-chalisa.html (primary source, fetched in
 *     small verse-range batches)
 *   - devshoppe.com (Sri Shiv Chalisa article), used for the closing-doha
 *     count cross-check and several mid-text verses
 *   - sanskritdocuments.org/doc_z_otherlang_hindi/siva40.html, used only to
 *     confirm structure (opening/closing doha wording, overall shape) --
 *     that site carries a no-reproduction notice for its specific edition,
 *     so it was used for verification, not as a literal copy source
 *   - plain web search cross-checks (multiple independent hits per line)
 *     for the harder-to-fetch middle section, since this page's fetch
 *     tooling refused most direct multi-verse quotes; single-line searches
 *     mostly succeeded and were cross-checked against 2+ independent sites
 *     each before being accepted
 * Every chaupai and all three traditional doha couplets were confirmed via
 * at least one direct fetch or a multi-site search cross-check; only
 * cosmetic spelling variance was found anywhere (e.g. "उठि/कर" प्रातःही,
 * "मनोकामना/मनकामना", "माहि/महि"), resolved toward whichever spelling most
 * sources agreed on, same approach as every prior upload this session.
 *
 * IMPORTANT structural finding: a first sequential pass through the
 * chaupais (chained "what comes next" lookups) produced only 36 lines
 * before reaching the closing doha, four short of the 40 a "chalisa" is
 * supposed to have. Comparing against mahashivratri.org's own English
 * translation (paraphrased, not quoted, to sidestep its fetch refusals)
 * surfaced the gap: four whole lines / two chaupai between "किया तपहिं
 * भागीरथ भारी" and "सहस कमल में हो रहे धारी" were missing from the initial
 * pass (the generosity/Vedas couplet and the ocean-churning/Nilakantha
 * couplet). Both were independently confirmed via multi-site search before
 * being inserted, restoring the full 40.
 *
 * Verse-count reconciliation: the traditional structure is 1 opening doha
 * + 40 chaupais + 2 closing dohas (the second closing doha is a colophon
 * verse giving the date of composition) = 43 verses total -- confirmed via
 * mahashivratri.org and devshoppe.com, both independently showing 2
 * distinct closing couplets. The site's declared stanza_count is 42.
 * Rather than drop verified content, the two closing dohas -- which are
 * conventionally printed and recited together as a single closing doha
 * section, immediately after the last chaupai with nothing between them --
 * are combined into one stanza row, mirroring exactly how
 * upload-hanuman-chalisa.mjs combined that text's two OPENING dohas for the
 * same declared-count reason. All 43 traditional verse-lines are present,
 * spread across exactly 42 database rows.
 *
 * IAST note: this is vernacular Hindi (not Sanskrit), so Sanscript's
 * devanagari->iast mode (built for Sanskrit) needs the same care applied in
 * upload-hanuman-chalisa.mjs. Rather than attempt exhaustive schwa
 * deletion (which that script's own calibration check showed is NOT the
 * actual widely-published convention -- most published IAST for these
 * texts is close to Sanscript's literal, undeleted output), only the
 * handful of extremely common standalone words that are universally
 * schwa-deleted in actual Hindi/Awadhi speech get the explicit fix: राम
 * does not occur standalone in this text, but नाम and धाम both do
 * ("नीलकण्ठ तब नाम कहाई", "अन्त धाम शिवपुर में पावे") and are rendered
 * "nām"/"dhām", not "nāma"/"dhāma". Everything else uses Sanscript's direct
 * transliteration plus this site's standing e->e-macron / o->o-macron
 * convention. The candrabindu and nukta fixes from upload-hanuman-
 * chalisa.mjs are carried over defensively (this text turned out not to
 * use candrabindu or nukta letters, but Sanscript's gaps there are real and
 * apply to any future Hindi/Awadhi upload).
 *
 * Devanagari numeral convention: chaupai lines carry their traditional
 * printed number (।१। through ।४०।); doha lines carry no numeral, matching
 * every source consulted above.
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Devanagari, matching the approach used for every prior
 * upload this session.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-shiv-chalisa.mjs          (dry run)
 *      node scripts/upload-shiv-chalisa.mjs --write  (apply)
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
const SLUG = 'shiv-chalisa';

const OPEN_DOHA = {
  type: 'doha',
  label: 'Doha (Opening)',
  padas: [
    'जय गणेश गिरिजासुवन मंगल मूल सुजान',
    'कहत अयोध्यादास तुम देउ अभय वरदान',
  ],
  meaning: 'Victory to Ganesha, son of Girija (Parvati), source of all auspiciousness, all-wise -- so says Ayodhyadas: grant me the boon of fearlessness.',
};

const CHAUPAIS = [
  { n: 1, padas: ['जय गिरिजा पति दीन दयाला', 'सदा करत सन्तन प्रतिपाला'],
    meaning: 'Victory to the merciful lord of Girija (Parvati), ever compassionate to the humble, who always protects and nurtures the saints.' },
  { n: 2, padas: ['भाल चन्द्रमा सोहत नीके', 'कानन कुण्डल नागफनी के'],
    meaning: 'The crescent moon shines beautifully on his forehead; his ears are adorned with earrings of serpent-hoods.' },
  { n: 3, padas: ['अंग गौर शिर गंग बहाये', 'मुण्डमाल तन क्षार लगाये'],
    meaning: 'His body is fair, the Ganga flows from his head; he wears a garland of skulls and smears ash upon his body.' },
  { n: 4, padas: ['वस्त्र खाल बाघम्बर सोहे', 'छवि को देखि नाग मुनि मोहे'],
    meaning: 'He is clothed in a tiger-skin garment; seeing his beauty even the serpents and sages are enchanted.' },
  { n: 5, padas: ['मैना मातु की हवे दुलारी', 'बाम अंग सोहत छवि न्यारी'],
    meaning: "The beloved daughter of Mother Maina (Parvati) adorns his left side, her beauty unique and radiant." },
  { n: 6, padas: ['कर त्रिशूल सोहत छवि भारी', 'करत सदा शत्रुन क्षयकारी'],
    meaning: 'The trident shines magnificently in his hand, ever destroying his enemies.' },
  { n: 7, padas: ['नंदि गणेश सोहैं तहँ कैसे', 'सागर मध्य कमल हैं जैसे'],
    meaning: 'Nandi and Ganesha appear beside him like a lotus in the midst of the ocean.' },
  { n: 8, padas: ['कार्तिक श्याम और गणराऊ', 'या छवि को कहि जात न काऊ'],
    meaning: 'Kartikeya, dark-hued, and the lord of the ganas are also present; this glory cannot be described by anyone.' },
  { n: 9, padas: ['देवन जबहीं जाय पुकारा', 'तबहिं दुख प्रभु आप निवारा'],
    meaning: 'Whenever the gods went and cried out to him, the Lord himself removed their suffering.' },
  { n: 10, padas: ['किया उपद्रव तारक भारी', 'देवन सब मिलि तुमहिं जुहारी'],
    meaning: 'When the demon Taraka caused great havoc, all the gods together came and bowed to you.' },
  { n: 11, padas: ['तुरत षडानन आप पठायउ', 'लव निमेष महं मारि गिरायउ'],
    meaning: 'You at once sent forth the six-faced one (Kartikeya), who slew him in the blink of an eye.' },
  { n: 12, padas: ['आप जलंधर असुर संहारा', 'सुयश तुम्हार विदित संसारा'],
    meaning: 'You yourself destroyed the demon Jalandhara; your great fame is known throughout the world.' },
  { n: 13, padas: ['त्रिपुरासुर सन युद्ध मचाई', 'सबहिं कृपा कर लीन बचाई'],
    meaning: 'You waged war against the demon Tripurasura and, showing grace to all, delivered them.' },
  { n: 14, padas: ['किया तपहिं भागीरथ भारी', 'पुरब प्रतिज्ञा तासु पुरारी'],
    meaning: 'Bhagiratha performed great austerities, and Purari (Shiva) fulfilled his ancient vow.' },
  { n: 15, padas: ['दानिन महँ तुम सम कोउ नाहीं', 'सेवक स्तुति करत सदाहीं'],
    meaning: 'Among givers there is none equal to you; your servants sing your praise forever.' },
  { n: 16, padas: ['वेद माहि महिमा तुम गाई', 'अकथ अनादि भेद नहिं पाई'],
    meaning: 'The Vedas themselves sing your glory, yet your indescribable, beginningless mystery remains unfathomed.' },
  { n: 17, padas: ['प्रकटी उदधि मंथन में ज्वाला', 'जरत सुरासुर भए विहाला'],
    meaning: 'When the churning of the ocean brought forth a fire of poison, the gods and demons alike were consumed with terror.' },
  { n: 18, padas: ['कीन्ही दया तहं करी सहाई', 'नीलकण्ठ तब नाम कहाई'],
    meaning: 'You showed compassion and came to their aid there; from that day you were called Nilakantha, the blue-throated one.' },
  { n: 19, padas: ['सहस कमल में हो रहे धारी', 'कीन्ह परीक्षा तबहिं पुरारी'],
    meaning: 'When he was offering a thousand lotus flowers in worship, Purari (Shiva) then decided to test him.' },
  { n: 20, padas: ['एक कमल प्रभु राखेउ जोई', 'कमल नयन पूजन चहं सोई'],
    meaning: 'The Lord kept back the one lotus that the lotus-eyed devotee needed for his worship.' },
  { n: 21, padas: ['कठिन भक्ति देखी प्रभु शंकर', 'भए प्रसन्न दिए इच्छित वर'],
    meaning: 'Seeing such unwavering devotion, Lord Shankara was pleased and granted the desired boon.' },
  { n: 22, padas: ['जय जय जय अनन्त अविनाशी', 'करत कृपा सब के घटवासी'],
    meaning: 'Victory, victory, victory to the infinite, imperishable one, who dwells with compassion in every heart.' },
  { n: 23, padas: ['दुष्ट सकल नित मोहि सतावै', 'भ्रमत रहौं मोहि चैन न आवै'],
    meaning: 'Wicked forces constantly torment me; I wander about and find no peace.' },
  { n: 24, padas: ['त्राहि त्राहि मैं नाथ पुकारो', 'येहि अवसर मोहि आन उबारो'],
    meaning: 'I cry out, save me, save me, O Lord! At this moment, come and rescue me.' },
  { n: 25, padas: ['लै त्रिशूल शत्रुन को मारो', 'संकट ते मोहि आन उबारो'],
    meaning: 'Take up your trident and strike down my enemies; deliver me from this distress.' },
  { n: 26, padas: ['मात-पिता भ्राता सब होई', 'संकट में पूछत नहिं कोई'],
    meaning: 'Though I have mother, father and brothers, none of them asks after me in times of trouble.' },
  { n: 27, padas: ['स्वामी एक है आस तुम्हारी', 'आय हरहु मम संकट भारी'],
    meaning: 'You alone, O Lord, are my hope; come and remove my heavy burden of troubles.' },
  { n: 28, padas: ['धन निर्धन को देत सदा हीं', 'जो कोई जांचे सो फल पाहीं'],
    meaning: 'You always give wealth to the poor; whoever asks of you receives the fruit.' },
  { n: 29, padas: ['अस्तुति केहि विधि करैं तुम्हारी', 'क्षमहु नाथ अब चूक हमारी'],
    meaning: 'In what way can I praise you fittingly? Forgive, O Lord, whatever fault is now mine.' },
  { n: 30, padas: ['शंकर हो संकट के नाशन', 'मंगल कारण विघ्न विनाशन'],
    meaning: 'O Shankara, you are the destroyer of troubles, the cause of auspiciousness, and the remover of obstacles.' },
  { n: 31, padas: ['योगी यति मुनि ध्यान लगावैं', 'शारद नारद शीश नवावैं'],
    meaning: 'Yogis, ascetics and sages fix their meditation upon you; Sharada and Narada bow their heads to you.' },
  { n: 32, padas: ['नमो नमो जय नमः शिवाय', 'सुर ब्रह्मादिक पार न पाय'],
    meaning: 'Salutations, salutations, victory, salutations to Shiva! Even the gods and Brahma cannot find your limit.' },
  { n: 33, padas: ['जो यह पाठ करे मन लाई', 'ता पर होत है शम्भु सहाई'],
    meaning: 'Whoever recites this with a devoted mind receives the help of Shambhu (Shiva).' },
  { n: 34, padas: ['ऋनियां जो कोई हो अधिकारी', 'पाठ करे सो पावन हारी'],
    meaning: 'Whoever is burdened with debts, if they recite this, is freed and purified.' },
  { n: 35, padas: ['पुत्रहीन इच्छा कर कोई', 'निश्चय शिव प्रसाद तेहि होई'],
    meaning: "If one who is childless desires a child, it surely comes to pass by Shiva's grace." },
  { n: 36, padas: ['पण्डित त्रयोदशी को लावे', 'ध्यान पूर्वक होम करावे'],
    meaning: 'Let a learned priest be brought on the thirteenth day (Trayodashi), and have the fire-offering performed with careful attention.' },
  { n: 37, padas: ['त्रयोदशी व्रत करै हमेशा', 'ताके तन नहीं रहै कलेशा'],
    meaning: 'One who always observes the Trayodashi fast suffers no affliction in body.' },
  { n: 38, padas: ['धूप दीप नैवेद्य चढ़ावे', 'शंकर सम्मुख पाठ सुनावे'],
    meaning: 'Let incense, lamps and food offerings be made, and this recitation be sung before Shankara.' },
  { n: 39, padas: ['जन्म जन्म के पाप नसावे', 'अन्त धाम शिवपुर में पावे'],
    meaning: 'The sins of birth after birth are destroyed, and at the end one attains the abode of Shivapur.' },
  { n: 40, padas: ['कहैं अयोध्यादास आस तुम्हारी', 'जानि सकल दुःख हरहु हमारी'],
    meaning: 'So says Ayodhyadas: you alone are my hope; knowing all, remove every one of my sorrows.' },
];

const CLOSE_DOHA = {
  type: 'doha',
  label: 'Doha (Closing)',
  padas: [
    'नित नेम उठि प्रातःही पाठ करौं चालीसा',
    'तुम मेरी मनोकामना पूर्ण करो जगदीश',
    'मगसर छठि हेमंत ऋतु संवत चौसठ जान',
    'अस्तुति चालीसा शिवहि पूर्ण कीन कल्याण',
  ],
  meaning: 'Rising each morning I shall regularly recite this Chalisa; fulfil my heart’s desire, O Lord of the universe. Composed on the sixth day of Margashirsha in the Hemant season, Samvat sixty-four (Vikram Samvat 1964 / 1907 CE), this Chalisa in praise of Shiva was completed for the welfare of all.',
};

const ITEMS = [OPEN_DOHA, ...CHAUPAIS, CLOSE_DOHA];

if (ITEMS.length !== 42) throw new Error(`Expected 42 stanza rows, got ${ITEMS.length}`);
if (OPEN_DOHA.padas.length !== 2) throw new Error(`Opening doha: expected 2 padas, got ${OPEN_DOHA.padas.length}`);
if (CLOSE_DOHA.padas.length !== 4) throw new Error(`Closing doha: expected 4 padas, got ${CLOSE_DOHA.padas.length}`);
if (CHAUPAIS.length !== 40) throw new Error(`Expected 40 chaupais, got ${CHAUPAIS.length}`);
CHAUPAIS.forEach((c, i) => {
  if (c.n !== i + 1) throw new Error(`Chaupai out of sequence at index ${i}: labelled ${c.n}`);
  if (c.padas.length !== 2) throw new Error(`Chaupai ${c.n}: expected 2 padas, got ${c.padas.length}`);
});
console.log('Structure check passed: 1 opening doha (2 padas) + 40 chaupais (2 padas each) + 1 closing doha (4 padas) = 42 rows.\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// Sanscript's iast scheme has no notion of nukta consonants (ड़/ढ़) -- it
// transliterates the base letter and passes the nukta mark through raw and
// un-transliterated (e.g. "baḍa़āī" instead of "baṛāī"). This text turned
// out not to use any nukta letters, but the fix is carried over from
// upload-hanuman-chalisa.mjs defensively for any future Hindi/Awadhi text.
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}

// Sanscript's iast scheme renders candrabindu (vowel nasalization with no
// following consonant) as a bare "~" appended after the vowel. This text
// turned out not to use candrabindu, but carried over defensively for the
// same reason as fixNukta above.
function fixCandrabindu(iast) {
  return iast.replace(/([aāiīuūeēoō])~/g, (_, v) => v + '̃');
}

// Sanscript's devanagari->telugu scheme has the same nukta gap as iast, but
// Telugu has no distinct letter for the retroflex-flap sound at all, so
// there is nothing to fix it *to*. Stripping the nukta mark before
// conversion falls back to the plain consonant, the nearest available
// letter. Carried over defensively; unused by this text.
function stripNukta(deva) {
  return deva.replace(/़/g, '');
}

// Hindi/Awadhi schwa deletion: a handful of extremely common standalone
// words are universally pronounced without their final vowel in actual
// speech, unlike Sanskrit where it is retained. राम does not occur as its
// own word in this text, but नाम and धाम both do ("नीलकण्ठ तब नाम कहाई",
// "अन्त धाम शिवपुर में पावे") and are rendered nām/dhām, not nāma/dhāma.
// Devanagari compounds (a single unbroken token with no space) are
// untouched since this is a token-level replace.
const SCHWA_DELETED = { rāma: 'rām', nāma: 'nām', dhāma: 'dhām' };
function hindiSchwa(iast) {
  return iast.split(' ').map(tok => SCHWA_DELETED[tok] || tok).join(' ');
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
    script_telugu: item.padas.map(p => Sanscript.t(stripNukta(p), 'devanagari', 'telugu')).join('|'),
    script_tamil: item.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: item.padas.map(p => hindiSchwa(addMacrons(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: item.meaning,
  };
}

const rows = [];

// Row 1: opening doha (single traditional doha; no numeral)
{
  const devaPadas = [...OPEN_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
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

// Row 42: closing doha (both traditional closing dohas combined; no numeral)
{
  const devaPadas = [...CLOSE_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  devaPadas[2] += ' ।';
  devaPadas[3] += ' ॥';
  rows.push(toRow(CLOSE_DOHA, 42, devaPadas));
}

console.log('Sample (rows 1, 2, 16, 41, 42):\n');
[0, 1, 15, 40, 41].forEach(i => console.log(rows[i], '\n'));

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
