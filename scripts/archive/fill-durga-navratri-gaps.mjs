/**
 * Second content-authoring step from research/puja-vidhi-content-audit.md:
 * reframe durga-puja around its actual Navratri search intent.
 *
 *   - step 1 (Sankalp, row 88): append Navratri/Navadurga framing note.
 *   - step 3 (Kalash Sthapana, row 90): append "Day 1 only" note.
 *   - new step 10: Kanya Pujan closing ritual.
 *
 * Dry-run by default; pass --write to apply.
 */
import { getSheetsClient, SPREADSHEET_ID, getTabWithHeaders, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const steps = await getTabWithHeaders('procedure_steps');
const H = steps.headers;
function rowValues(obj) { return H.map(h => obj[h] ?? ''); }

const durgaRows = steps.rows
  .map((r, i) => ({ r, sheetRow: i + 2 }))
  .filter(({ r }) => r[steps.col('parent_slug')] === 'durga-puja');

function find(stepNum) {
  const found = durgaRows.find(({ r }) => parseInt(r[steps.col('step_number')]) === stepNum);
  if (!found) throw new Error(`durga-puja step ${stepNum} not found`);
  return found;
}

const step1 = find(1);
const step3 = find(3);

const NOTE_APPEND_STEP1 = {
  en: " This puja is most often performed daily across the nine days of Navratri, each day traditionally associated with one of the Navadurga forms — Shailaputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, and Siddhidatri (days 1-9). Steps 2-9 below form the daily core ritual, repeated on each of the nine days; Kalash Sthapana (step 3) is done only on Day 1, and Kanya Pujan (step 10) concludes the observance on Ashtami or Navami.",
  te: " ఈ పూజను నవరాత్రి తొమ్మిది రోజులూ ప్రతిరోజు చేయడం సంప్రదాయం; ఒక్కో రోజు నవదుర్గ రూపాల్లో ఒకటి (శైలపుత్రి, బ్రహ్మచారిణి, చంద్రఘంటా, కూష్మాండా, స్కందమాత, కాత్యాయని, కాళరాత్రి, మహాగౌరి, సిద్ధిదాత్రి — 1-9 రోజులు) పూజించబడుతుంది. దిగువ 2-9 దశలు ప్రతిరోజూ చేసే ప్రధాన పూజా క్రమం; కళశ స్థాపన (దశ 3) మొదటి రోజు మాత్రమే చేయాలి, కన్యా పూజ (దశ 10) అష్టమి లేదా నవమి నాడు వ్రతాన్ని ముగిస్తుంది.",
  ta: " இப்பூஜை பொதுவாக நவராத்திரியின் ஒன்பது நாட்களும் தினமும் செய்யப்படுகிறது; ஒவ்வொரு நாளும் நவதுர்கா வடிவங்களில் ஒன்று (சைலபுத்ரி, பிரம்மசாரிணி, சந்திரகண்டா, கூஷ்மாண்டா, ஸ்கந்தமாதா, காத்யாயனி, காளராத்ரி, மகாகௌரி, சித்திதாத்ரி — 1-9 நாட்கள்) வழிபடப்படுகிறது. கீழே உள்ள 2-9 படிகள் ஒவ்வொரு நாளும் செய்யப்படும் அன்றாட முக்கிய பூஜை வரிசை; கலச ஸ்தாபனம் (படி 3) முதல் நாள் மட்டுமே செய்யப்பட வேண்டும், கன்யா பூஜை (படி 10) அஷ்டமி அல்லது நவமி அன்று விரதத்தை நிறைவு செய்கிறது.",
  hi: " यह पूजा सामान्यतः नवरात्रि के सभी नौ दिनों तक प्रतिदिन की जाती है; प्रत्येक दिन नवदुर्गा के एक रूप (शैलपुत्री, ब्रह्मचारिणी, चंद्रघंटा, कूष्मांडा, स्कंदमाता, कात्यायनी, कालरात्रि, महागौरी, सिद्धिदात्री — दिन 1-9) की पूजा की जाती है। नीचे दिए गए चरण 2-9 प्रतिदिन दोहराए जाने वाले मुख्य अनुष्ठान हैं; कलश स्थापना (चरण 3) केवल पहले दिन की जाती है, और कन्या पूजन (चरण 10) अष्टमी या नवमी को व्रत का समापन करता है।",
};

const NOTE_APPEND_STEP3 = {
  en: " Kalash Sthapana is performed only once, on Day 1 of Navratri — do not repeat it on subsequent days.",
  te: " కళశ స్థాపన నవరాత్రి మొదటి రోజు మాత్రమే చేయాలి — తరువాతి రోజుల్లో పునరావృతం చేయకూడదు.",
  ta: " கலச ஸ்தாபனம் நவராத்திரியின் முதல் நாளில் மட்டுமே செய்யப்பட வேண்டும் — அடுத்த நாட்களில் மீண்டும் செய்யக்கூடாது.",
  hi: " कलश स्थापना केवल नवरात्रि के पहले दिन ही की जाती है — इसे अगले दिनों में दोहराया नहीं जाता।",
};

const noteFields = ['notes_en', 'notes_te', 'notes_ta', 'notes_hi'];
const langKeys = ['en', 'te', 'ta', 'hi'];

function buildNoteUpdates(rowEntry, appendMap) {
  return noteFields.map((field, idx) => {
    const lang = langKeys[idx];
    const current = rowEntry.r[steps.col(field)] || '';
    const updated = (current + appendMap[lang]).trim();
    return { range: `procedure_steps!${colLetter(steps.col(field))}${rowEntry.sheetRow}`, values: [[updated]], field, sheetRow: rowEntry.sheetRow, preview: updated };
  });
}

const step1Updates = buildNoteUpdates(step1, NOTE_APPEND_STEP1);
const step3Updates = buildNoteUpdates(step3, NOTE_APPEND_STEP3);

console.log('=== step 1 (Sankalp) note updates ===');
for (const u of step1Updates) console.log(`  row ${u.sheetRow} ${u.field}: ${u.preview.slice(0, 80)}...`);
console.log('\n=== step 3 (Kalash Sthapana) note updates ===');
for (const u of step3Updates) console.log(`  row ${u.sheetRow} ${u.field}: ${u.preview.slice(0, 80)}...`);

const kanyaPujan = {
  parent_slug: 'durga-puja',
  parent_type: 'puja',
  step_number: '10',
  step_title_en: 'Kanya Pujan (Nine Girls Worship)',
  step_title_te: 'కన్యా పూజ (తొమ్మిది మంది కన్యల పూజ)',
  step_title_ta: 'கன்யா பூஜை (ஒன்பது சிறுமியர் வழிபாடு)',
  step_title_hi: 'कन्या पूजन (नौ कन्याओं की पूजा)',
  instruction_en: "On Ashtami or Navami (the eighth or ninth day), invite nine young girls — typically aged under ten, representing the nine forms of the Devi (Navadurga) — along with, in many traditions, one young boy representing Bhairav. Wash their feet, seat them respectfully, apply kumkum and akshata to their foreheads, and offer them a meal (commonly poori, chana, and halwa). Give each a small gift — new clothes, bangles, or money — and seek their blessing with folded hands before they depart. This concludes the Navratri observance.",
  instruction_te: "అష్టమి లేదా నవమి రోజున (ఎనిమిదో లేదా తొమ్మిదో రోజు), నవదుర్గ రూపాలను ప్రతిబింబించే తొమ్మిది మంది చిన్నారి బాలికలను (సాధారణంగా పదేళ్ళలోపు వయసు) — అనేక సంప్రదాయాల్లో భైరవుడిని ప్రతిబింబించే ఒక చిన్న బాలుడితో పాటు — ఆహ్వానించండి. వారి పాదాలు కడిగి, గౌరవంగా కూర్చోబెట్టి, నొసళ్ళపై కుంకుమ, అక్షతలు పెట్టి, భోజనం (సాధారణంగా పూరీ, శనగలు, హల్వా) వడ్డించండి. ప్రతి ఒక్కరికి చిన్న బహుమతి — కొత్త బట్టలు, గాజులు లేదా డబ్బు — ఇచ్చి, వారు వెళ్ళే ముందు చేతులు జోడించి వారి ఆశీస్సులు కోరండి. దీనితో నవరాత్రి వ్రతం ముగుస్తుంది.",
  instruction_ta: "அஷ்டமி அல்லது நவமி அன்று (எட்டாம் அல்லது ஒன்பதாம் நாள்), நவதுர்கா வடிவங்களைக் குறிக்கும் ஒன்பது சிறு பெண்களை (பொதுவாக பத்து வயதுக்கு உட்பட்டவர்கள்) — பல மரபுகளில் பைரவரைக் குறிக்கும் ஒரு சிறுவனுடன் சேர்த்து — அழைக்கவும். அவர்களின் பாதங்களை கழுவி, மரியாதையுடன் அமர வைத்து, நெற்றியில் குங்குமமும் அட்சதையும் இட்டு, உணவு (பொதுவாக பூரி, கடலை, அல்வா) பரிமாறுங்கள். ஒவ்வொருவருக்கும் ஒரு சிறிய பரிசு — புதிய உடை, வளையல் அல்லது பணம் — வழங்கி, அவர்கள் புறப்படும் முன் கைகூப்பி அவர்களின் ஆசியைப் பெறுங்கள். இதனுடன் நவராத்திரி விரதம் நிறைவடைகிறது.",
  instruction_hi: "अष्टमी या नवमी (आठवें या नौवें दिन) को नवदुर्गा के नौ रूपों का प्रतिनिधित्व करने वाली नौ छोटी कन्याओं को — आमतौर पर दस वर्ष से कम आयु की — कई परंपराओं में भैरव का प्रतिनिधित्व करने वाले एक बालक सहित आमंत्रित करें। उनके पैर धोएं, आदरपूर्वक बिठाएं, माथे पर कुमकुम और अक्षत लगाएं, और भोजन (सामान्यतः पूरी, चना और हलवा) परोसें। प्रत्येक को एक छोटा उपहार — नए वस्त्र, चूड़ियाँ या धनराशि — दें, और विदा होने से पहले हाथ जोड़कर उनका आशीर्वाद लें। इसी के साथ नवरात्रि व्रत सम्पन्न होता है।",
  recite_shloka_slug: '',
  recite_stanza_range: '',
  notes_en: "In many South Indian traditions, Ayudha Puja (blessing tools and instruments) is observed on Navami and Vijayadashami marks the close of the festival with Saraswati's Vidyarambham (see the Saraswati Puja page); regional practice varies on which day Kanya Pujan itself falls (Ashtami vs. Navami).",
  notes_te: "అనేక దక్షిణ భారత సంప్రదాయాల్లో నవమి నాడు ఆయుధ పూజ (పనిముట్లు, పరికరాలను పూజించడం) చేస్తారు; విజయదశమి రోజు సరస్వతి విద్యారంభంతో పండుగ ముగుస్తుంది (సరస్వతి పూజ పేజీ చూడండి); కన్యా పూజ ఏ రోజు (అష్టమి లేదా నవమి) జరుపుకోవాలో ప్రాంతాన్ని బట్టి మారుతుంది.",
  notes_ta: "பல தென்னிந்திய மரபுகளில் நவமி அன்று ஆயுத பூஜை (கருவிகள், கருவிகளை வழிபடுதல்) கடைபிடிக்கப்படுகிறது; விஜயதசமி அன்று சரஸ்வதியின் வித்யாரம்பத்துடன் திருவிழா நிறைவடைகிறது (சரஸ்வதி பூஜை பக்கத்தைப் பார்க்கவும்); கன்யா பூஜை எந்த நாளில் (அஷ்டமி அல்லது நவமி) நடைபெறும் என்பது பிராந்திய வழக்கத்தைப் பொறுத்தது.",
  notes_hi: "कई दक्षिण भारतीय परंपराओं में नवमी को आयुध पूजा (औजारों और उपकरणों की पूजा) मनाई जाती है; विजयादशमी को सरस्वती के विद्यारंभ के साथ त्योहार का समापन होता है (सरस्वती पूजा पृष्ठ देखें); कन्या पूजन किस दिन (अष्टमी या नवमी) होगा यह क्षेत्रीय प्रथा पर निर्भर करता है।",
};

console.log('\n=== new row to append ===');
console.log(`  ${kanyaPujan.parent_slug} step ${kanyaPujan.step_number}: ${kanyaPujan.step_title_en}`);

if (!WRITE) {
  console.log('\nDry run only. Pass --write to apply.');
  process.exit(0);
}

const sheets = await getSheetsClient();

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: {
    valueInputOption: 'RAW',
    data: [...step1Updates, ...step3Updates].map(u => ({ range: u.range, values: u.values })),
  },
});
console.log('Updated step 1 and step 3 notes.');

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'procedure_steps!A:A',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: [rowValues(kanyaPujan)] },
});
console.log('Appended Kanya Pujan as step 10.');
