/**
 * One-off: fill genuinely useful notes_{lang} for a curated subset of
 * procedure_steps rows that were previously empty (triaged manually).
 *
 * In-place cell edits only, matched by (parent_slug, step_number) against a
 * fresh fetch of the tab. Never touches any other column.
 *
 * Usage:
 *   node scripts/fill-procedure-step-notes.mjs            (dry run)
 *   node scripts/fill-procedure-step-notes.mjs --write     (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();
const TAB = 'procedure_steps';

// Curated fills: (parent_slug, step_number) -> notes text per language.
const FILLS = [
  {
    parent_slug: 'ganesh-chaturthi', step_number: 5,
    notes_en: "Many families now immerse the idol in a bucket at home and empty the water into soil afterward, to protect rivers and lakes from idols with plaster-of-Paris or chemical paint.",
    notes_te: "ప్లాస్టర్ ఆఫ్ పారిస్ లేదా రసాయన రంగులతో చేసిన విగ్రహాల వల్ల నదులు, చెరువులు కలుషితం కాకుండా ఉండేందుకు చాలా కుటుంబాలు ఇప్పుడు ఇంట్లో బకెట్‌లో నిమజ్జనం చేసి, ఆ నీటిని మట్టిలో పోస్తున్నారు.",
    notes_ta: "பிளாஸ்டர் ஆஃப் பாரிஸ் அல்லது இரசாயன வண்ணங்களால் ஆன சிலைகள் ஆறுகளையும் ஏரிகளையும் மாசுபடுத்தாமல் இருக்க, பல குடும்பங்கள் இப்போது வீட்டிலேயே ஒரு வாளியில் நிமஜ்ஜனம் செய்து, அந்த நீரை மண்ணில் ஊற்றுகின்றனர்.",
    notes_hi: "प्लास्टर ऑफ पेरिस या रासायनिक रंगों वाली मूर्तियों से नदियों और तालाबों को प्रदूषण से बचाने के लिए, कई परिवार अब घर पर बाल्टी में विसर्जन करके बाद में वह पानी मिट्टी में डाल देते हैं।",
  },
  {
    parent_slug: 'maha-shivaratri', step_number: 3,
    notes_en: "Use fresh, undamaged bilva leaves — torn, dry, or worm-eaten leaves are considered unfit to offer to Shiva.",
    notes_te: "తాజాగా, పాడవని బిల్వ పత్రాలను వాడండి — చిరిగినవి, ఎండినవి లేదా పురుగు తినేసినవి శివునికి సమర్పించడానికి తగినవి కావు.",
    notes_ta: "புதிய, சேதமடையாத வில்வ இலைகளையே பயன்படுத்தவும் — கிழிந்த, உலர்ந்த அல்லது பூச்சி அரித்த இலைகள் சிவனுக்கு படைப்பதற்கு தகுதியற்றவை.",
    notes_hi: "ताज़े, बिना कटे-फटे बिल्व पत्रों का ही उपयोग करें — फटे, सूखे या कीड़े लगे पत्ते शिव को अर्पित करने योग्य नहीं माने जाते।",
  },
  {
    parent_slug: 'navaratri', step_number: 2,
    notes_en: "The popular nine-colour scheme (grey, orange, white, red, royal blue, yellow, green, peacock green, purple) is a modern devotional convention, not an ancient rule, and lists vary by region.",
    notes_te: "ప్రాచుర్యం పొందిన తొమ్మిది రంగుల క్రమం (బూడిద, నారింజ, తెలుపు, ఎరుపు, రాయల్ నీలం, పసుపు, ఆకుపచ్చ, నెమలి ఆకుపచ్చ, ఊదా) ఒక ఆధునిక భక్తి సంప్రదాయమే తప్ప పురాతన నియమం కాదు, ప్రాంతాన్ని బట్టి జాబితాలు మారుతూ ఉంటాయి.",
    notes_ta: "பிரபலமான ஒன்பது நிற வரிசை (சாம்பல், ஆரஞ்சு, வெள்ளை, சிவப்பு, ராயல் நீலம், மஞ்சள், பச்சை, மயில் பச்சை, ஊதா) ஒரு நவீன பக்தி மரபே தவிர பழங்கால விதி அல்ல, பிராந்தியத்திற்கு ஏற்ப பட்டியல் மாறுபடும்.",
    notes_hi: "लोकप्रिय नौ-रंगों की सूची (धूसर, नारंगी, सफेद, लाल, रॉयल नीला, पीला, हरा, मोर हरा, बैंगनी) एक आधुनिक भक्ति परंपरा है, प्राचीन नियम नहीं, और क्षेत्र के अनुसार सूची बदलती रहती है।",
  },
  {
    parent_slug: 'satyanarayana-vratham', step_number: 1,
    notes_en: "If your gotra is unknown, 'Kashyapa' is a widely accepted default.",
    notes_te: "మీ గోత్రం తెలియకపోతే, 'కశ్యప' అనేది విస్తృతంగా ఆమోదించబడిన డిఫాల్ట్.",
    notes_ta: "உங்கள் கோத்திரம் தெரியாவிட்டால், 'கஷ்யப' என்பது பரவலாக ஏற்றுக்கொள்ளப்பட்ட இயல்பு விருப்பமாகும்.",
    notes_hi: "यदि आपका गोत्र ज्ञात न हो, तो 'कश्यप' को व्यापक रूप से स्वीकृत डिफ़ॉल्ट माना जाता है।",
  },
  {
    parent_slug: 'satyanarayana-vratham', step_number: 2,
    notes_en: "If a metal kalash is unavailable, a clean steel tumbler with mango leaves and a coconut on top is an accepted substitute.",
    notes_te: "లోహపు కలశం అందుబాటులో లేకపోతే, మామిడి ఆకులతో, పైన కొబ్బరికాయతో ఉన్న శుభ్రమైన స్టీలు గ్లాసు ప్రత్యామ్నాయంగా ఆమోదయోగ్యం.",
    notes_ta: "உலோக கலசம் இல்லையென்றால், மாவிலைகளுடனும் மேலே தேங்காயுடனும் கூடிய தூய்மையான ஸ்டீல் டம்ளர் ஏற்றுக்கொள்ளத்தக்க மாற்றாகும்.",
    notes_hi: "यदि धातु का कलश उपलब्ध न हो, तो आम के पत्तों और ऊपर नारियल रखा हुआ साफ स्टील का गिलास एक स्वीकृत विकल्प है।",
  },
  {
    parent_slug: 'varalakshmi-vratham', step_number: 1,
    notes_en: "If a brass or copper kalash is unavailable, a clean steel tumbler with mango leaves and a coconut is an accepted substitute.",
    notes_te: "ఇత్తడి లేదా రాగి కలశం అందుబాటులో లేకపోతే, మామిడి ఆకులతో, కొబ్బరికాయతో ఉన్న శుభ్రమైన స్టీలు గ్లాసు ప్రత్యామ్నాయంగా ఆమోదయోగ్యం.",
    notes_ta: "பித்தளை அல்லது செம்பு கலசம் இல்லையென்றால், மாவிலைகளுடனும் தேங்காயுடனும் கூடிய தூய்மையான ஸ்டீல் டம்ளர் ஏற்றுக்கொள்ளத்தக்க மாற்றாகும்.",
    notes_hi: "यदि पीतल या तांबे का कलश उपलब्ध न हो, तो आम के पत्तों और नारियल सहित साफ स्टील का गिलास एक स्वीकृत विकल्प है।",
  },
  {
    parent_slug: 'pradosha-vratham', step_number: 3,
    notes_en: "Shiva's pradakshina is a half-circle — turn back at the gomukhi (the water-outlet channel) rather than crossing over it, as in a full pradakshina.",
    notes_te: "శివుని ప్రదక్షిణ అర్ధవలయంగా చేస్తారు — పూర్తి ప్రదక్షిణలో లాగా దాటకుండా, గోముఖి (నీటి కాలువ) వద్ద వెనక్కి తిరగాలి.",
    notes_ta: "சிவனுக்கு அரை வட்ட பிரதட்சிணமே செய்யப்படுகிறது — முழு பிரதட்சிணத்தில் போல் கடக்காமல், கோமுகி (நீர்வழி) அருகில் திரும்பிச் செல்ல வேண்டும்.",
    notes_hi: "शिव की प्रदक्षिणा अर्ध-वृत्ताकार होती है — पूर्ण प्रदक्षिणा की तरह उसे पार किए बिना, गोमुखी (जल-निकासी मार्ग) पर वापस मुड़ना चाहिए।",
  },
  {
    parent_slug: 'karwa-chauth', step_number: 3,
    notes_en: "Moonrise time varies significantly by city — check a local Karwa Chauth moonrise calendar rather than assuming a fixed time.",
    notes_te: "చంద్రోదయ సమయం నగరాన్ని బట్టి గణనీయంగా మారుతుంది — స్థిర సమయం అనుకోకుండా స్థానిక కర్వా చౌత్ చంద్రోదయ క్యాలెండర్‌ను చూడండి.",
    notes_ta: "நகரத்திற்கு ஏற்ப நிலா உதிக்கும் நேரம் கணிசமாக மாறுபடும் — நிலையான நேரம் என்று கருதாமல் உள்ளூர் கர்வா சவுத் நிலா உதயக் காலண்டரைப் பார்க்கவும்.",
    notes_hi: "चंद्रोदय का समय शहर के अनुसार काफी बदलता है — निश्चित समय मान लेने के बजाय स्थानीय करवा चौथ चंद्रोदय कैलेंडर देखें।",
  },
  {
    parent_slug: 'sankashti-chaturthi-vratham', step_number: 2,
    notes_en: "Exact moonrise time varies by location — check a local panchangam, since the arghya is considered ineffective if offered before moonrise.",
    notes_te: "ఖచ్చితమైన చంద్రోదయ సమయం ప్రాంతాన్ని బట్టి మారుతుంది — చంద్రోదయానికి ముందు అర్ఘ్యం ఇస్తే ఫలితం ఉండదని భావిస్తారు కాబట్టి స్థానిక పంచాంగాన్ని చూడండి.",
    notes_ta: "நிலா உதிக்கும் சரியான நேரம் இடத்திற்கு ஏற்ப மாறுபடும் — நிலா உதிக்கும் முன் அர்க்கியம் செய்தால் பயனற்றது எனக் கருதப்படுவதால் உள்ளூர் பஞ்சாங்கத்தைப் பார்க்கவும்.",
    notes_hi: "सटीक चंद्रोदय समय स्थान के अनुसार बदलता है — चंद्रोदय से पहले अर्घ्य देना निष्फल माना जाता है, इसलिए स्थानीय पंचांग देखें।",
  },
  {
    parent_slug: 'satyanarayana-puja', step_number: 5,
    notes_en: "In many traditions, tulasi is not offered to Vishnu forms after Ekadashi noon; offering resumes from Dvadashi onward.",
    notes_te: "అనేక సంప్రదాయాలలో, ఏకాదశి మధ్యాహ్నం తర్వాత విష్ణు రూపాలకు తులసి సమర్పించరు; ద్వాదశి నుండి మళ్లీ సమర్పిస్తారు.",
    notes_ta: "பல மரபுகளில், ஏகாதசி நண்பகலுக்குப் பிறகு விஷ்ணு வடிவங்களுக்கு துளசி படைக்கப்படுவதில்லை; துவாதசியிலிருந்து மீண்டும் படைக்கப்படுகிறது.",
    notes_hi: "कई परंपराओं में, एकादशी दोपहर के बाद विष्णु स्वरूपों को तुलसी अर्पित नहीं की जाती; द्वादशी से पुनः अर्पण शुरू होता है।",
  },
  {
    parent_slug: 'satyanarayana-puja', step_number: 6,
    notes_en: "The five stories cover: the sage Narada asking Vishnu about the best vratham, a poor brahmin who performs the puja, a king cured of illness, a merchant saved from trouble, and the story of Tungadhwaja.",
    notes_te: "ఈ ఐదు కథలు: నారద మహర్షి విష్ణువును ఉత్తమ వ్రతం గురించి అడగడం, పూజ చేసిన పేద బ్రాహ్మణుడు, వ్యాధి నయమైన రాజు, కష్టాల నుండి రక్షించబడిన వర్తకుడు, మరియు తుంగధ్వజుని కథను వివరిస్తాయి.",
    notes_ta: "இந்த ஐந்து கதைகள்: நாரத முனிவர் விஷ்ணுவிடம் சிறந்த விரதத்தைப் பற்றி கேட்பது, பூஜை செய்யும் ஏழை பிராமணர், நோய் தீர்ந்த அரசன், துன்பத்திலிருந்து காப்பாற்றப்பட்ட வணிகர், மற்றும் துங்கத்வஜனின் கதையை விவரிக்கின்றன.",
    notes_hi: "ये पांच कथाएँ हैं: नारद मुनि का विष्णु से सर्वश्रेष्ठ व्रत के बारे में पूछना, पूजा करने वाला एक निर्धन ब्राह्मण, रोग से मुक्त हुआ राजा, संकट से बचाया गया व्यापारी, और तुंगध्वज की कथा।",
  },
  {
    parent_slug: 'gauri-puja', step_number: 3,
    notes_en: "If a copper or brass kalash is unavailable, a clean steel tumbler with mango leaves and a coconut is an accepted substitute.",
    notes_te: "రాగి లేదా ఇత్తడి కలశం అందుబాటులో లేకపోతే, మామిడి ఆకులతో, కొబ్బరికాయతో ఉన్న శుభ్రమైన స్టీలు గ్లాసు ప్రత్యామ్నాయంగా ఆమోదయోగ్యం.",
    notes_ta: "செம்பு அல்லது பித்தளை கலசம் இல்லையென்றால், மாவிலைகளுடனும் தேங்காயுடனும் கூடிய தூய்மையான ஸ்டீல் டம்ளர் ஏற்றுக்கொள்ளத்தக்க மாற்றாகும்.",
    notes_hi: "यदि तांबे या पीतल का कलश उपलब्ध न हो, तो आम के पत्तों और नारियल सहित साफ स्टील का गिलास एक स्वीकृत विकल्प है।",
  },
];

const { headers, rows, col } = await getTabWithHeaders(TAB);
const iParent = col('parent_slug');
const iStepNum = col('step_number');
const iNotesEn = col('notes_en');
const iNotesTe = col('notes_te');
const iNotesTa = col('notes_ta');
const iNotesHi = col('notes_hi');

const filledKeys = new Set(FILLS.map(f => `${f.parent_slug}::${f.step_number}`));

console.log(`--- DRY RUN: notes_{lang} fills for ${TAB} ---\n`);

let filledCount = 0;
let skippedCount = 0;
const updates = [];

rows.forEach((r, idx) => {
  const parent = r[iParent] || '';
  const stepNum = r[iStepNum] || '';
  const hasNotes = (r[iNotesEn] || '').trim().length > 0;
  const key = `${parent}::${stepNum}`;

  if (hasNotes) return; // not our concern here, already has notes

  const fill = FILLS.find(f => f.parent_slug === parent && String(f.step_number) === String(stepNum));
  if (fill) {
    filledCount++;
    const rowNumber = idx + 2; // +1 header, +1 to 1-index
    console.log(`FILL  [${parent} #${stepNum}] -> "${fill.notes_en}"`);
    updates.push({ rowNumber, fill });
  } else {
    skippedCount++;
    console.log(`SKIP  [${parent} #${stepNum}] — instruction is self-explanatory, no genuinely useful addition identified`);
  }
});

console.log(`\nTotal rows missing notes: ${filledCount + skippedCount}`);
console.log(`Would fill: ${filledCount}`);
console.log(`Would leave empty: ${skippedCount}`);

if (!WRITE) {
  console.log('\nDry run only. Re-run with --write to apply these changes.');
  process.exit(0);
}

console.log('\n--- WRITING ---');
const sheets = await getSheetsClient();
const colEn = colLetter(iNotesEn);
const colTe = colLetter(iNotesTe);
const colTa = colLetter(iNotesTa);
const colHi = colLetter(iNotesHi);

const data = [];
for (const { rowNumber, fill } of updates) {
  data.push({ range: `${TAB}!${colEn}${rowNumber}`, values: [[fill.notes_en]] });
  data.push({ range: `${TAB}!${colTe}${rowNumber}`, values: [[fill.notes_te]] });
  data.push({ range: `${TAB}!${colTa}${rowNumber}`, values: [[fill.notes_ta]] });
  data.push({ range: `${TAB}!${colHi}${rowNumber}`, values: [[fill.notes_hi]] });
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: { valueInputOption: 'RAW', data },
});

console.log(`Wrote notes for ${updates.length} rows.`);
