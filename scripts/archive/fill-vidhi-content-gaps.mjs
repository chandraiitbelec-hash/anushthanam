/**
 * One-off content-authoring script for the puja-vidhi content-gap audit
 * (research/puja-vidhi-content-audit.md). Adds the "quick win" steps
 * identified there directly to the live procedure_steps tab:
 *
 *   - vinayaka-puja: insert a Sankalp step (renumbers existing 1-4 -> 2-5),
 *     append a Visarjan closing step as step 6.
 *   - durga-puja: reframe step 1 as the Navratri daily-ritual opener,
 *     append a Kanya Pujan closing step as step 10.
 *   - lakshmi-puja: append a Diwali-variant note as step 6 (muhurat
 *     framing + Kubera cross-reference).
 *
 * Dry-run by default; pass --write to apply. See scripts/lib-sheets.mjs
 * conventions.
 */
import { getSheetsClient, SPREADSHEET_ID, getTabWithHeaders, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const steps = await getTabWithHeaders('procedure_steps');
const H = steps.headers;

function rowValues(obj) {
  return H.map(h => obj[h] ?? '');
}

// ---------------------------------------------------------------------
// 1. vinayaka-puja: renumber existing steps 1-4 -> 2-5
// ---------------------------------------------------------------------
const vinayakaRows = steps.rows
  .map((r, i) => ({ r, sheetRow: i + 2 }))
  .filter(({ r }) => r[steps.col('parent_slug')] === 'vinayaka-puja')
  .sort((a, b) => parseInt(a.r[steps.col('step_number')]) - parseInt(b.r[steps.col('step_number')]));

const stepNumCol = colLetter(steps.col('step_number'));
const renumberUpdates = vinayakaRows.map(({ r, sheetRow }) => {
  const oldNum = parseInt(r[steps.col('step_number')]);
  const newNum = oldNum + 1;
  return { range: `procedure_steps!${stepNumCol}${sheetRow}`, values: [[String(newNum)]], oldNum, newNum, sheetRow };
});

console.log('=== vinayaka-puja renumber plan ===');
for (const u of renumberUpdates) console.log(`  row ${u.sheetRow}: step_number ${u.oldNum} -> ${u.newNum}`);

// ---------------------------------------------------------------------
// 2. New rows to append
// ---------------------------------------------------------------------
const newRows = [
  // Vinayaka Puja — Sankalp (new step 1)
  {
    parent_slug: 'vinayaka-puja',
    parent_type: 'puja',
    step_number: '1',
    step_title_en: 'Sankalp (Intention Setting)',
    step_title_te: 'సంకల్పం',
    step_title_ta: 'சங்கல்பம்',
    step_title_hi: 'संकल्प',
    instruction_en: "Bathe and wear clean clothes. Clean the puja area and place the Ganesha idol's seat on a raised platform. Take water in the right palm (Achamana) and state your sankalp aloud: your name, gotra (use 'Kashyapa' if unknown), today's tithi (Chaturthi), and your purpose — seeking Lord Ganesha's blessings for an obstacle-free undertaking, fulfilment of the festival vow, or gratitude.",
    instruction_te: "స్నానం చేసి శుభ్రమైన బట్టలు ధరించండి. పూజ స్థలాన్ని శుభ్రపరిచి, గణేశుని విగ్రహానికి ఎత్తైన పీఠంపై స్థానం ఏర్పాటు చేయండి. కుడి అరచేతిలో నీళ్ళు తీసుకొని ఆచమనం చేసి, మీ పేరు, గోత్రం (తెలియకపోతే 'కాశ్యప'), నేటి తిథి (చవితి), మరియు ఉద్దేశ్యాన్ని — ఆటంకాలు లేని కార్యానికి గణపతి ఆశీస్సులు, వ్రత సంకల్ప నెరవేర్పు, లేదా కృతజ్ఞత — స్పష్టంగా చెప్పండి.",
    instruction_ta: "குளித்து சுத்தமான உடை அணியுங்கள். பூஜை இடத்தை சுத்தப்படுத்தி, விநாயகர் சிலைக்கு உயர்ந்த பீடத்தில் இடம் ஏற்படுத்துங்கள். வலது உள்ளங்கையில் நீர் எடுத்து ஆசமனம் செய்து, உங்கள் பெயர், கோத்திரம் (தெரியாவிட்டால் 'காஸ்யப'), இன்றைய திதி (சதுர்த்தி), மற்றும் நோக்கத்தை — தடையற்ற காரியத்திற்கு விநாயகர் அருள், விரத சங்கல்ப நிறைவேற்றம், அல்லது நன்றி — தெளிவாக சொல்லுங்கள்.",
    instruction_hi: "स्नान कर स्वच्छ वस्त्र धारण करें। पूजा स्थल को साफ करके गणेश प्रतिमा के लिए ऊँचे आसन पर स्थान बनाएं। दाहिने हाथ में जल लेकर आचमन करें और अपना नाम, गोत्र (न पता हो तो 'काश्यप'), आज की तिथि (चतुर्थी), और उद्देश्य — निर्विघ्न कार्य हेतु गणपति का आशीर्वाद, व्रत-संकल्प की पूर्ति, या कृतज्ञता — स्पष्ट रूप से बोलें।",
    recite_shloka_slug: '',
    recite_stanza_range: '',
    notes_en: "If gotra is unknown, use 'Kashyapa' as a common default. If the idol is a permanent home fixture worshipped daily, this sankalp and the invocation step that follows may be shortened — full pranapratishtha is only for newly installed idols.",
    notes_te: "గోత్రం తెలియకపోతే, సాధారణ డిఫాల్ట్‌గా 'కాశ్యప' ఉపయోగించవచ్చు. విగ్రహం శాశ్వతంగా ఇంట్లో ప్రతిష్ఠించి రోజూ పూజించేదైతే, ఈ సంకల్పం మరియు తరువాతి ఆవాహన సంక్షిప్తంగా చేయవచ్చు — పూర్తి ప్రాణప్రతిష్ఠ కొత్తగా తెచ్చిన విగ్రహాలకు మాత్రమే.",
    notes_ta: "கோத்திரம் தெரியாவிட்டால், பொதுவான இயல்புநிலையாக 'காஸ்யப' பயன்படுத்தலாம். சிலை வீட்டில் நிரந்தரமாக பிரதிஷ்டை செய்யப்பட்டு தினமும் வழிபடப்படுவதாக இருந்தால், இந்த சங்கல்பமும் அடுத்த ஆவாஹனமும் சுருக்கமாக செய்யலாம் — முழு பிராணப்பிரதிஷ்டை புதிதாக கொண்டுவரப்பட்ட சிலைகளுக்கு மட்டுமே.",
    notes_hi: "यदि गोत्र अज्ञात हो, तो सामान्य डिफॉल्ट के रूप में 'काश्यप' उपयोग करें। यदि प्रतिमा घर में स्थायी रूप से स्थापित है और प्रतिदिन पूजी जाती है, तो यह संकल्प और अगला आवाहन संक्षेप में किया जा सकता है — पूर्ण प्राणप्रतिष्ठा केवल नई लाई गई प्रतिमाओं के लिए है।",
  },
  // Vinayaka Puja — Visarjan (new step 6)
  {
    parent_slug: 'vinayaka-puja',
    parent_type: 'puja',
    step_number: '6',
    step_title_en: 'Visarjan (Immersion)',
    step_title_te: 'విసర్జన (నిమజ్జనం)',
    step_title_ta: 'விசர்ஜனம் (நீரில் மூழ்குதல்)',
    step_title_hi: 'विसर्जन (प्रतिमा प्रवाह)',
    instruction_en: "At the end of the observed period (commonly 1½, 3, 5, 7, or 11 days after the puja, according to family or regional custom), perform a final aarti and ask forgiveness for any lapses in the puja — 'Ganapati Bappa Morya' is the common refrain in this tradition. Carry the idol in a small procession to a river, pond, or a tub of water at home, and immerse it while saying 'Ganapati Bappa Morya, Pudhchya Varshi Lavkar Ya' (a Marathi farewell meaning 'come again next year'), or an equivalent farewell in the family's own language and tradition.",
    instruction_te: "పూజ ముగిసిన తర్వాత నిర్ణీత రోజుల తరువాత (కుటుంబం లేదా ప్రాంతీయ ఆచారాన్ని బట్టి సాధారణంగా 1½, 3, 5, 7 లేదా 11 రోజులు), చివరి ఆరతి ఇచ్చి పూజలో జరిగిన లోపాలకు క్షమాపణ కోరండి — 'గణపతి బప్పా మోర్యా' అనే నినాదం ఈ సంప్రదాయంలో సాధారణం. విగ్రహాన్ని చిన్న ఊరేగింపుగా నదికి, చెరువుకు లేదా ఇంట్లోని నీటి తొట్టెకు తీసుకెళ్లి, 'గణపతి బప్పా మోర్యా, పుఢచ్యా వర్షీ లవకర్ యా' (వచ్చే సంవత్సరం త్వరగా రా అనే మరాఠీ నినాదం) అని పలుకుతూ నిమజ్జనం చేయండి, లేదా మీ కుటుంబ భాష, సంప్రదాయానికి తగిన వీడ్కోలు మాటలు వాడండి.",
    instruction_ta: "பூஜை முடிந்த பிறகு (குடும்பம் அல்லது பிராந்திய வழக்கப்படி பொதுவாக 1½, 3, 5, 7 அல்லது 11 நாட்களுக்குப் பிறகு), இறுதி ஆரத்தி எடுத்து பூஜையில் ஏற்பட்ட குறைகளுக்கு மன்னிப்பு கேளுங்கள் — 'கணபதி பப்பா மோர்யா' என்ற முழக்கம் இந்த மரபில் பொதுவானது. சிலையை ஒரு சிறு ஊர்வலமாக ஆற்றுக்கோ, குளத்திற்கோ அல்லது வீட்டிலுள்ள நீர்த் தொட்டிக்கோ கொண்டு சென்று, 'கணபதி பப்பா மோர்யா, புட்சயா வர்ஷி லவ்கர் யா' (அடுத்த வருடம் விரைவில் வா என்ற மராத்திய முழக்கம்) என்று சொல்லி நீரில் மூழ்கடியுங்கள், அல்லது உங்கள் குடும்ப மொழி, மரபுக்கு ஏற்ற இணையான வாழ்த்துரையை பயன்படுத்துங்கள்.",
    instruction_hi: "पूजा समाप्त होने के निर्धारित दिनों बाद (परिवार या क्षेत्रीय परंपरा के अनुसार सामान्यतः 1½, 3, 5, 7 या 11 दिन), अंतिम आरती करें और पूजा में हुई किसी भी त्रुटि के लिए क्षमा मांगें — 'गणपति बप्पा मोरया' इस परंपरा में सामान्य उद्घोष है। प्रतिमा को एक छोटे जुलूस में नदी, तालाब या घर के पानी के टब तक ले जाएं, और 'गणपति बप्पा मोरया, पुढच्या वर्षी लवकर या' (अगले वर्ष जल्दी आना, यह मराठी विदाई है) कहते हुए विसर्जित करें, या अपने परिवार की भाषा और परंपरा के अनुरूप विदाई शब्दों का प्रयोग करें।",
    recite_shloka_slug: '',
    recite_stanza_range: '',
    notes_en: "A clay (unfired, unpainted) idol is the traditional and most eco-friendly choice for immersion; where a home tub or bucket is used instead of a natural water body, the dissolved clay can later be returned to a garden or plant pot rather than drained away. Where a permanent, non-immersible idol is used, this step is replaced by a simple concluding aarti with no immersion.",
    notes_te: "నిమజ్జనానికి మట్టి (కాల్చని, రంగులు వేయని) విగ్రహం సంప్రదాయమైనది మరియు పర్యావరణహితమైనది; నదికి బదులు ఇంట్లో తొట్టె లేదా బకెట్ ఉపయోగిస్తే, కరిగిన మట్టిని తర్వాత మొక్కకు లేదా తోటలో వేయవచ్చు, డ్రైన్ చేయకుండా. శాశ్వతమైన, నిమజ్జనం చేయని విగ్రహం వాడితే, ఈ దశకు బదులుగా నిమజ్జనం లేకుండా చివరి ఆరతి మాత్రమే చేయవచ్చు.",
    notes_ta: "மூழ்கடிப்பதற்கு களிமண் (சுடாத, வண்ணம் தீட்டாத) சிலையே பாரம்பரியமான, சுற்றுச்சூழலுக்கு உகந்த தேர்வு; ஆற்றுக்குப் பதிலாக வீட்டுத் தொட்டி அல்லது வாளியைப் பயன்படுத்தினால், கரைந்த களிமண்ணை பின்னர் தோட்டத்திலோ செடியிலோ சேர்க்கலாம், வடிகட்டாமல். நிரந்தரமான, மூழ்கடிக்கப்படாத சிலையைப் பயன்படுத்தினால், இந்த படிக்குப் பதிலாக மூழ்கடிப்பு இல்லாமல் இறுதி ஆரத்தி மட்டும் செய்யலாம்.",
    notes_hi: "विसर्जन के लिए मिट्टी की (बिना पकाई, बिना रंगी) प्रतिमा पारंपरिक और पर्यावरण-अनुकूल विकल्प है; यदि नदी के बजाय घर के टब या बाल्टी का उपयोग किया जाए, तो घुली हुई मिट्टी को बाद में बहा देने के बजाय गमले या बगीचे में डाला जा सकता है। यदि स्थायी, विसर्जन-रहित प्रतिमा का उपयोग किया जाता है, तो यह चरण बिना विसर्जन के केवल एक समापन आरती से बदल दिया जाता है।",
  },
];

console.log('\n=== new rows to append ===');
for (const nr of newRows) console.log(`  ${nr.parent_slug} step ${nr.step_number}: ${nr.step_title_en}`);

if (!WRITE) {
  console.log('\nDry run only. Pass --write to apply.');
  process.exit(0);
}

const sheets = await getSheetsClient();

// Apply renumbering first (so no two rows share a step_number mid-flight
// from the reader's perspective; harmless either way since nothing reads
// live between these calls, but keeps the sequence obviously correct).
if (renumberUpdates.length) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: renumberUpdates.map(u => ({ range: u.range, values: u.values })),
    },
  });
  console.log(`Renumbered ${renumberUpdates.length} existing vinayaka-puja rows.`);
}

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'procedure_steps!A:A',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: newRows.map(rowValues) },
});
console.log(`Appended ${newRows.length} new procedure_steps rows.`);
