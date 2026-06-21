/**
 * Populate stories_index + stories_content with vrata kathas in 4 languages.
 * Also updates linked_story_slug in vrathams tab and adds procedure steps +
 * material items for the 10 vrathams not yet covered.
 *
 * Prerequisites: run `python3 scripts/extract-vratham-content.py` first.
 * Run: node scripts/populate-vratham-kathas.mjs
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSheetData(sheets, range) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return res.data.values ?? [];
}

function colLetter(idx) {
  // 0→A, 25→Z, 26→AA
  let col = '';
  let n = idx;
  do {
    col = String.fromCharCode(65 + (n % 26)) + col;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return col;
}

async function appendRows(sheets, tabName, rows) {
  if (!rows.length) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

async function updateCell(sheets, tabName, row, col, value) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!${colLetter(col)}${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[value]] },
  });
}

// ── Additional procedure steps + materials (vrathams 3–15 not in populate-vratham-details) ──

const EXTRA_STEPS = [
  // 3. karwa-chauth
  { parent_slug: 'karwa-chauth', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Sargi (Pre-dawn meal)',
    step_title_te: 'సర్గి (తెల్లవారు భోజనం)', step_title_ta: 'சர்கி (அதிகாலை உணவு)', step_title_hi: 'सर्गी (सूर्योदय से पहले भोजन)',
    instruction_en: 'Before sunrise, consume the Sargi meal prepared by your mother-in-law — typically fenia (vermicelli), mathri, fruit, and sweets. This is the only food until moonrise. After eating, take a formal vow (sankalpa) to fast the entire day.',
    instruction_te: 'సూర్యోదయానికి ముందే అత్తగారు సిద్ధం చేసిన సర్గీ (ఫేనియా, మఠ్రి, పండ్లు, మిఠాయి) తినండి. చాంద్రోదయం వరకు ఇదే ఆహారం. తర్వాత నిర్జల ఉపవాస సంకల్పం చేయండి.',
    instruction_ta: 'சூர்ய உதயத்திற்கு முன் மாமியார் தயாரித்த சர்கி உணவை சாப்பிடுங்கள். நிலவு உதிக்கும் வரை இதுவே உணவு. பின் உபவாச சங்கல்பம் செய்யுங்கள்.',
    instruction_hi: 'सूर्योदय से पहले सास द्वारा बनाया गया सर्गी (फेनिया, मठरी, फल, मिठाई) खाएं। चांद निकलने तक यही भोजन रहेगा। बाद में निर्जला व्रत का संकल्प लें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'karwa-chauth', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Evening Karwa Puja',
    step_title_te: 'సాయంత్రం కర్వా పూజ', step_title_ta: 'மாலை கர்வா பூஜை', step_title_hi: 'सायंकाल करवा पूजा',
    instruction_en: 'In the evening, women gather in a circle with a diya, a karwa (clay pot), and puja thali. One woman narrates the vrat katha. Pass the thali clockwise 7 times among the group, each time viewing the moon and the husband through a sieve.',
    instruction_te: 'సాయంత్రం మహిళలు దీపం, కర్వా (మట్టి కుండ), పూజా తళ్ళీతో వృత్తంలో కూర్చుంటారు. ఒక మహిళ వ్రత కథ చెప్పాలి. థాలీని 7 సార్లు సమూహంలో అందించాలి.',
    instruction_ta: 'மாலையில் பெண்கள் தீபம், கர்வா, பூஜை தட்டுடன் வட்டத்தில் அமர்வார்கள். ஒருவர் விரதக் கதை சொல்வார். தட்டை 7 முறை வட்டமிடவும்.',
    instruction_hi: 'शाम को महिलाएं दीपक, करवा, पूजा थाली के साथ गोल बैठती हैं। एक महिला व्रत कथा सुनाती है। थाली को 7 बार समूह में घुमाएं।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'karwa-chauth', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Moon Sighting and Breaking Fast',
    step_title_te: 'చంద్ర దర్శనం మరియు ఉపవాస విరమణ', step_title_ta: 'நிலவு பார்த்தல் மற்றும் விரதம் முடித்தல்', step_title_hi: 'चंद्र दर्शन और व्रत तोड़ना',
    instruction_en: 'After the moon rises, view it through a sieve, then view your husband\'s face through the same sieve. The husband offers water and the first bite of food to his wife. She receives it and breaks the fast.',
    instruction_te: 'చంద్రుడు ఉదయించిన తర్వాత జల్లెడ ద్వారా చంద్రుడిని, తర్వాత భర్త ముఖాన్ని చూడండి. భర్త నీళ్ళు మరియు మొదటి తినుబండారం ఇస్తాడు.',
    instruction_ta: 'நிலவு உதித்தவுடன் சல்லடை வழியாக நிலவை, பின் கணவனை பாருங்கள். கணவன் நீர் மற்றும் முதல் உணவை கொடுக்கிறார். இதை பெற்று விரதம் முடியுங்கள்.',
    instruction_hi: 'चांद निकलने पर छलनी से चांद, फिर पति का मुख देखें। पति पानी और पहला निवाला देते हैं। उसे स्वीकार कर व्रत तोड़ें।',
    recite_shloka_slug: '', notes_en: '' },

  // 4. maha-shivaratri
  { parent_slug: 'maha-shivaratri', parent_type: 'vratham', step_number: 1,
    step_title_en: 'The All-Night Fast',
    step_title_te: 'రాత్రంతా ఉపవాసం', step_title_ta: 'இரவு முழுவதும் உபவாசம்', step_title_hi: 'रात भर उपवास',
    instruction_en: 'The fast begins at sunrise on Mahashivratri and concludes the next morning. A nirjala (waterless) fast is ideal, though fruits and milk are permitted for those unable to fast completely. Spend the night awake in Shiva worship.',
    instruction_te: 'మహాశివరాత్రి సూర్యోదయం నుండి మరుసటి రోజు ఉదయం వరకు ఉపవాసం. నిర్జల ఉపవాసం ఆదర్శం. రాత్రి మొత్తం శివ పూజలో గడపండి.',
    instruction_ta: 'மஹாசிவராத்திரியன்று சூர்யோதயத்திலிருந்து மறுநாள் காலை வரை உபவாசம். நிர்ஜல உபவாசம் சிறந்தது. இரவு முழுவதும் சிவ வழிபாட்டில் கழிக்கவும்.',
    instruction_hi: 'महाशिवरात्रि पर सूर्योदय से अगले दिन सुबह तक उपवास। निर्जला उपवास आदर्श है। रात भर शिव की आराधना में बिताएं।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'maha-shivaratri', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Four Prahar (Watch) Pujas',
    step_title_te: 'నాలుగు ప్రహర పూజలు', step_title_ta: 'நான்கு ப்ரஹார பூஜைகள்', step_title_hi: 'चार प्रहर की पूजा',
    instruction_en: 'Perform four abhishekams throughout the night — at 9 PM, midnight, 3 AM, and 6 AM. Each involves bathing the lingam with milk, curd, honey, ghee, and water. Offer bilva leaves, dhatura, and white flowers with each abhishekam.',
    instruction_te: 'రాత్రి 9 గం., మధ్యరాత్రి, 3 గం., 6 గం.లో నాలుగు అభిషేకాలు చేయండి. ప్రతి అభిషేకంలో పాలు, పెరుగు, తేనె, నెయ్యి, నీళ్ళతో శివలింగాన్ని స్నానం చేయించండి.',
    instruction_ta: 'இரவு 9 மணி, நள்ளிரவு, 3 மணி, 6 மணி என நான்கு முறை அபிஷேகம் செய்யுங்கள். ஒவ்வொரு முறையும் பால், தயிர், தேன், நெய், நீர் கொண்டு லிங்கத்தை குளிப்பாட்டுங்கள்.',
    instruction_hi: 'रात में 9 बजे, मध्यरात्रि, 3 बजे और 6 बजे चार अभिषेक करें। हर बार दूध, दही, शहद, घी और जल से लिंग का अभिषेक करें।',
    recite_shloka_slug: 'shiva-ashtothram', notes_en: 'The four prahar represent the four watches of the night' },
  { parent_slug: 'maha-shivaratri', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Breaking Fast on Chaturdashi Morning',
    step_title_te: 'చతుర్దశి ఉదయం ఉపవాస విరమణ', step_title_ta: 'சதுர்தசி காலையில் விரதம் முடித்தல்', step_title_hi: 'चतुर्दशी सुबह व्रत तोड़ना',
    instruction_en: 'After the final morning puja and aarti, receive the prasad and break the fast. Consume sesame seeds (til), jaggery, or simple grain-based food. Distribute prasad to all present.',
    instruction_te: 'చివరి ఉదయ పూజ మరియు ఆరతి తర్వాత ప్రసాదం తీసుకుని ఉపవాసం విరమించండి. నువ్వులు, బెల్లం లేదా సాదా ఆహారం తినండి.',
    instruction_ta: 'இறுதி காலை பூஜை மற்றும் ஆரத்திக்கு பிறகு பிரசாதம் பெற்று விரதம் முடியுங்கள். எள், வெல்லம் அல்லது எளிய உணவு சாப்பிடுங்கள்.',
    instruction_hi: 'अंतिम सुबह की पूजा और आरती के बाद प्रसाद लेकर व्रत तोड़ें। तिल, गुड़ या सादा भोजन करें।',
    recite_shloka_slug: '', notes_en: '' },

  // 6. santoshi-mata
  { parent_slug: 'santoshi-mata', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Friday Worship Setup',
    step_title_te: 'శుక్రవారం పూజ ఏర్పాటు', step_title_ta: 'வெள்ளிக்கிழமை பூஜை அமைப்பு', step_title_hi: 'शुक्रवार पूजा व्यवस्था',
    instruction_en: 'Every Friday, set up a clean altar with a picture or idol of Santoshi Mata. The devotee keeps a 16-week commitment. Light incense and a ghee lamp. Wear clean clothes — yellow is auspicious.',
    instruction_te: 'ప్రతి శుక్రవారం సంతోషి మాత విగ్రహం లేదా పటంతో శుభ్రమైన వేదిక ఏర్పాటు చేయండి. 16 వారాల నిబద్ధత పాటించాలి. అగరబత్తి, నెయ్యి దీపం వెలిగించండి.',
    instruction_ta: 'ஒவ்வொரு வெள்ளிக்கிழமையும் சந்தோஷி மாதா படம் அல்லது சிலையுடன் சுத்தமான பீடம் அமையுங்கள். 16 வாரம் தொடர்ந்து வழிபட வேண்டும்.',
    instruction_hi: 'हर शुक्रवार संतोषी माता की मूर्ति या चित्र के साथ स्वच्छ वेदी लगाएं। 16 सप्ताह की प्रतिबद्धता रखें। अगरबत्ती और घी का दीपक जलाएं।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'santoshi-mata', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Offering and Katha',
    step_title_te: 'నైవేద్యం మరియు కథ', step_title_ta: 'நைவேத்யம் மற்றும் கதை', step_title_hi: 'नैवेद्य और कथा',
    instruction_en: 'Offer gur (jaggery) and chana (roasted chickpeas) — these are Santoshi Mata\'s specific prasad. Do NOT offer sour items (lemon, tamarind, curd) on this day — it breaks the vrat. Read the Santoshi Mata katha.',
    instruction_te: 'బెల్లం మరియు శనగలు (సంతోషి మాత ప్రత్యేక ప్రసాదం) సమర్పించండి. పులుపు పదార్థాలు (నిమ్మ, చింతపండు, పెరుగు) ఈ రోజు వద్దు. సంతోషి మాత కథ చదవండి.',
    instruction_ta: 'வெல்லம் மற்றும் கடலை (சந்தோஷி மாதாவின் சிறப்பு பிரசாதம்) அர்ப்பணிக்கவும். புளிப்பு பொருட்கள் (எலுமிச்சை, புளி, தயிர்) வேண்டாம். கதை படிக்கவும்.',
    instruction_hi: 'गुड़ और चना (संतोषी माता का विशेष प्रसाद) चढ़ाएं। खट्टी चीजें (नींबू, इमली, दही) इस दिन वर्जित हैं। संतोषी माता की कथा पढ़ें।',
    recite_shloka_slug: '', notes_en: 'Avoid sour foods strictly — this is the most important rule of this vrat' },
  { parent_slug: 'santoshi-mata', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Udyapan (Final Ceremony)',
    step_title_te: 'ఉద్యాపన (ముగింపు వేడుక)', step_title_ta: 'உத்யாபனம் (நிறைவு விழா)', step_title_hi: 'उद्यापन (समापन समारोह)',
    instruction_en: 'On the 16th Friday, perform the Udyapan. Invite 8 girls and boys (representing the divine children) and feed them a pure meal. Give them gur-chana as blessing. This formally concludes the 16-week commitment.',
    instruction_te: '16వ శుక్రవారం ఉద్యాపన చేయండి. 8 అమ్మాయిలు మరియు అబ్బాయిలను పిలిచి శుద్ధ భోజనం పెట్టండి. బెల్లం-శనగలు ఇవ్వండి. ఇది 16 వారాల నిబద్ధతను ముగిస్తుంది.',
    instruction_ta: '16வது வெள்ளியன்று உத்யாபனம் செய்யுங்கள். 8 பெண்கள் மற்றும் ஆண் குழந்தைகளை அழைத்து சுத்தமான உணவு படைக்கவும்.',
    instruction_hi: '16वें शुक्रवार उद्यापन करें। 8 लड़के-लड़कियों को बुलाकर शुद्ध भोजन कराएं। गुड़-चना का प्रसाद दें।',
    recite_shloka_slug: '', notes_en: '' },

  // 7. kedareswara-vratham
  { parent_slug: 'kedareswara-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Setting Up the Kedar Vrat',
    step_title_te: 'కేదార వ్రత ఏర్పాటు', step_title_ta: 'கேதார் விரத அமைப்பு', step_title_hi: 'केदार व्रत की व्यवस्था',
    instruction_en: 'Kedareswara Vrat is observed for 21 days beginning on the 3rd day (Tritiya) of Bhadrapada month. Establish a clay or metal Shiva Lingam on a clean altar facing north. Keep a 21-petal flower or 21 bel leaves handy for each day.',
    instruction_te: 'భాద్రపద మాసంలో తృతీయ రోజు నుండి 21 రోజులు కేదారేశ్వర వ్రతం ఆచరించాలి. తత్తత్ అంకే ఉత్తరముఖంగా మట్టి లేదా లోహ శివలింగం స్థాపించండి.',
    instruction_ta: 'பாத்ரபட மாதத்தில் திரிதியை முதல் 21 நாட்கள் கேதாரேஸ்வர விரதம் கடைப்பிடிக்கவும். வடக்கு நோக்கி மண் அல்லது உலோக சிவலிங்கம் நிறுவுங்கள்.',
    instruction_hi: 'भाद्रपद मास की तृतीया से 21 दिन केदारेश्वर व्रत करें। उत्तर दिशा में मिट्टी या धातु का शिवलिंग स्थापित करें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'kedareswara-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Daily Abhishekam',
    step_title_te: 'రోజువారీ అభిషేకం', step_title_ta: 'தினசரி அபிஷேகம்', step_title_hi: 'दैनिक अभिषेक',
    instruction_en: 'Each of the 21 mornings, perform abhishekam with milk, water, honey, and ghee. Apply vibhuti. Offer 21 bilva leaves individually with each name of Shiva. Maintain a partial fast (fruits and milk only).',
    instruction_te: '21 రోజులూ ఉదయం పాలు, నీళ్ళు, తేనె, నెయ్యితో అభిషేకం చేయండి. విభూతి పెట్టండి. 21 బిల్వ పత్రాలు శివ నామాలు చెప్తూ అర్పించండి.',
    instruction_ta: '21 நாட்களும் காலை பால், நீர், தேன், நெய்யால் அபிஷேகம் செய்யுங்கள். திருநீறு பூசுங்கள். 21 வில்வ இலைகளை சிவ நாமங்களுடன் அர்ப்பணிக்கவும்.',
    instruction_hi: '21 दिन प्रतिदिन सुबह दूध, जल, शहद, घी से अभिषेक करें। विभूति लगाएं। 21 बेल पत्र शिव के नाम के साथ अर्पित करें।',
    recite_shloka_slug: 'shiva-ashtothram', notes_en: '' },

  // 8. mangala-gauri-vratham
  { parent_slug: 'mangala-gauri-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Tuesday Fasting in Shravana',
    step_title_te: 'శ్రావణ మాసంలో మంగళవారం ఉపవాసం', step_title_ta: 'ஸ்ராவண மாதத்தில் செவ்வாய் உபவாசம்', step_title_hi: 'श्रावण में मंगलवार उपवास',
    instruction_en: 'Observed by newly married women on every Tuesday of Shravana month (5 Tuesdays total). Fast from sunrise to moonrise, taking only fruits and milk. This vrat is especially performed for the longevity of the husband.',
    instruction_te: 'నవ వివాహిత మహిళలు శ్రావణ మాసంలో ప్రతి మంగళవారం (మొత్తం 5 మంగళవారాలు) ఆచరిస్తారు. సూర్యోదయం నుండి చాంద్రోదయం వరకు ఉపవాసం.',
    instruction_ta: 'புதுமணப் பெண்கள் ஸ்ராவண மாதத்தில் ஒவ்வொரு செவ்வாய்க்கிழமையும் (5 செவ்வாய்கள்) கடைப்பிடிக்கவும். சூர்ய உதயம் முதல் நிலவு உதிக்கும் வரை உபவாசம்.',
    instruction_hi: 'नवविवाहित महिलाएं श्रावण माह में हर मंगलवार (कुल 5 मंगलवार) करें। सूर्योदय से चंद्रोदय तक उपवास।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'mangala-gauri-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Mangala Gauri Puja',
    step_title_te: 'మంగళ గౌరి పూజ', step_title_ta: 'மங்கள கௌரி பூஜை', step_title_hi: 'मंगल गौरी पूजा',
    instruction_en: 'Set up 16 small clay lamps (diyas) made from wheat flour arranged in a mandala. Establish a clay Gauri idol. Perform 16-fold worship (shodashopachara). Offer 16 specific items including bangles, bindi, turmeric, kumkum, betel.',
    instruction_te: '16 గోధుమ పిండి దీపాలు మండలంలో అమర్చండి. మట్టి గౌరి విగ్రహం స్థాపించండి. షోడశోపచార పూజ చేయండి. 16 వస్తువులు (గాజులు, బొట్టు, పసుపు, కుంకుమ, తమలపాకులు) అర్పించండి.',
    instruction_ta: '16 கோதுமை மாவு விளக்குகளை மண்டலத்தில் அமையுங்கள். மண் கௌரி சிலை நிறுவுங்கள். ஷோடஷோபசார பூஜை செய்யுங்கள்.',
    instruction_hi: '16 गेहूं के आटे से बने दीए मंडल में सजाएं। मिट्टी की गौरी प्रतिमा स्थापित करें। षोडशोपचार पूजा करें। 16 वस्तुएं (चूड़ियां, बिंदी, हल्दी, कुमकुम, पान) अर्पित करें।',
    recite_shloka_slug: '', notes_en: '' },

  // 10. hartalika-teej
  { parent_slug: 'hartalika-teej', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Nirjala Fast (24-hour waterless)',
    step_title_te: 'నిర్జల ఉపవాసం (24 గంటలు)', step_title_ta: 'நிர்ஜல உபவாசம் (24 மணி நேரம்)', step_title_hi: 'निर्जला उपवास (24 घंटे)',
    instruction_en: 'Hartalika Teej requires a strict 24-hour fast — no water, no food. Begin before sunrise on Tritiya of Shukla Paksha in Bhadrapada. The vrat ends the next morning after immersion of the sand idols.',
    instruction_te: 'హరతాళికా తీజ్ కఠిన 24 గంటల నిర్జల ఉపవాసం. భాద్రపద శుక్ల తృతీయ నాడు తెల్లవారు ముందే ప్రారంభించండి. మర్నాడు ఉదయం మట్టి విగ్రహాల విసర్జన తర్వాత ముగుస్తుంది.',
    instruction_ta: 'ஹர்தாலிகா தீஜ் கடுமையான 24 மணி நேர நிர்ஜல உபவாசம். பாத்ரபட சுக்ல திரிதியையன்று சூர்யோதயத்திற்கு முன் தொடங்கவும்.',
    instruction_hi: 'हरितालिका तीज पर कड़ा 24 घंटे का निर्जला व्रत। भाद्रपद शुक्ल तृतीया पर सूर्योदय से पहले शुरू करें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'hartalika-teej', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Molding Sand Idols and Night Vigil',
    step_title_te: 'ఇసుక విగ్రహాల తయారీ మరియు రాత్రి జాగారం', step_title_ta: 'மணல் சிலைகள் தயாரித்தல் மற்றும் இரவு ஜாகரண்', step_title_hi: 'रेत की मूर्ति बनाना और जागरण',
    instruction_en: 'Using wet river sand, mold idols of Shiva and Parvati by hand. Install on a wooden platform under a leaf canopy. Perform evening puja with full bridal offerings. Spend the entire night awake singing hymns — sleeping breaks the vrat.',
    instruction_te: 'తడిసిన నది ఇసుక ఉపయోగించి చేతులతో శివ-పార్వతి విగ్రహాలు తయారు చేయండి. ఆకుల మండపంలో చెక్క వేదికపై స్థాపించండి. రాత్రి మొత్తం మేల్కొని పాటలు పాడండి.',
    instruction_ta: 'ஈரமான ஆற்று மணல் கொண்டு சிவ-பார்வதி சிலைகளை கையால் தயாரியுங்கள். இலை மண்டபத்தில் நிறுவுங்கள். இரவு முழுவதும் விழித்திருந்து பாடல்கள் பாடுங்கள்.',
    instruction_hi: 'गीली नदी रेत से हाथों से शिव-पार्वती की मूर्तियां बनाएं। पत्तों के मंडप में लकड़ी के मंच पर स्थापित करें। पूरी रात जागकर भजन गाएं।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'hartalika-teej', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Morning Puja and Idol Immersion',
    step_title_te: 'ఉదయ పూజ మరియు విగ్రహ విసర్జన', step_title_ta: 'காலை பூஜை மற்றும் சிலை விசர்ஜனம்', step_title_hi: 'सुबह पूजा और मूर्ति विसर्जन',
    instruction_en: 'At dawn, perform a final puja for the sand idols. Carry them to the nearest river or pond and immerse them (visarjan). Return home, touch your husband\'s feet, and break the fast with a sip of water.',
    instruction_te: 'తెల్లవారగానే మట్టి విగ్రహాలకు చివరి పూజ చేయండి. సమీపంలోని నది లేదా చెరువుకు తీసుకెళ్ళి విసర్జన చేయండి. ఇంటికి వచ్చి భర్త పాదాలు తాకి నీళ్ళు తాగి ఉపవాసం విరమించండి.',
    instruction_ta: 'அதிகாலையில் சிலைகளுக்கு இறுதி பூஜை செய்யுங்கள். அருகில் உள்ள ஆறு அல்லது குளத்தில் விசர்ஜனம் செய்யுங்கள். வீட்டிற்கு வந்து கணவன் காலில் விழுந்து தண்ணீர் அருந்தி விரதம் முடியுங்கள்.',
    instruction_hi: 'भोर में रेत की मूर्तियों की अंतिम पूजा करें। पास की नदी या तालाब में विसर्जन करें। घर आकर पति के पैर छूकर पानी पीकर व्रत तोड़ें।',
    recite_shloka_slug: '', notes_en: '' },

  // 11. vaibhav-lakshmi-vrat
  { parent_slug: 'vaibhav-lakshmi-vrat', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Friday Evening Kalash Setup',
    step_title_te: 'శుక్రవారం సాయంత్రం కళశం ఏర్పాటు', step_title_ta: 'வெள்ளிக்கிழமை மாலை கலசம் அமைப்பு', step_title_hi: 'शुक्रवार शाम कलश स्थापना',
    instruction_en: 'After sunset on Friday, place a copper Kalash on a bed of raw rice on a red cloth. Insert mango leaves and top with a coconut. Place the family gold ornament or silver coin in a small bowl on the Kalash mouth. Set up the Vaibhav Lakshmi Yantra behind it.',
    instruction_te: 'శుక్రవారం సూర్యాస్తమయం తర్వాత ఎర్రని వస్త్రంపై అక్కి మీద రాగి కళశం ఉంచండి. మామిడి ఆకులు, కొబ్బరికాయ అమర్చండి. కళశం నోటిపై బంగారం లేదా వెండి నాణెం ఉంచండి.',
    instruction_ta: 'வெள்ளிக்கிழமை சூரிய அஸ்தமனத்திற்கு பிறகு சிவப்பு துணியில் அரிசி மேல் செப்பு கலசம் வையுங்கள். மாவிலை, தேங்காய் சேருங்கள். கலசத்தின் வாயில் குடும்பத்தின் தங்கம் அல்லது வெள்ளி நாணயம் வையுங்கள்.',
    instruction_hi: 'शुक्रवार सूर्यास्त के बाद लाल कपड़े पर चावल के ऊपर तांबे का कलश रखें। मांगपत्र और नारियल सजाएं। कलश के मुख पर परिवार का सोना या चांदी का सिक्का रखें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'vaibhav-lakshmi-vrat', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Ashta Lakshmi Worship and Kheer Offering',
    step_title_te: 'అష్టలక్ష్మి పూజ మరియు ఖీర్ నైవేద్యం', step_title_ta: 'அஷ்ட லட்சுமி பூஜை மற்றும் கீர் நைவேத்யம்', step_title_hi: 'अष्ट लक्ष्मी पूजन और खीर का भोग',
    instruction_en: 'Read the descriptions of the eight forms of Lakshmi (Dhana, Dhanya, Gaja, Santana, Veera, Vijaya, Vidya, Aishwarya). Offer red hibiscus flowers and sandalwood paste. Offer hot kheer (rice pudding cooked with saffron and cardamom).',
    instruction_te: 'అష్టలక్ష్మి (ధనలక్ష్మి, ధాన్యలక్ష్మి, గజలక్ష్మి, సంతానలక్ష్మి, వీరలక్ష్మి, విజయలక్ష్మి, విద్యాలక్ష్మి, ఐశ్వర్యలక్ష్మి) రూపాలు చదవండి. ఎర్రని మందారాలు, చందనం అర్పించండి. వేడి ఖీర్ (కుంకుమ, యాలకులు వేసి చేసిన పాయసం) సమర్పించండి.',
    instruction_ta: 'அஷ்ட லட்சுமியின் எட்டு வடிவங்கள் படியுங்கள். சிவப்பு செம்பருத்தி மலர்கள், சந்தனம் அர்ப்பணிக்கவும். சூடான கீர் (குங்குமம், ஏலம் சேர்த்த பாயசம்) படைக்கவும்.',
    instruction_hi: 'अष्ट लक्ष्मी के आठ रूपों का वर्णन पढ़ें। लाल गुड़हल और चंदन अर्पित करें। गरम खीर (केसर-इलायची सहित) का भोग लगाएं।',
    recite_shloka_slug: '', notes_en: '' },

  // 12. skanda-sashti-vratham
  { parent_slug: 'skanda-sashti-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Six-Day Fast and Morning Abhishekam',
    step_title_te: 'ఆరు రోజుల ఉపవాసం మరియు ఉదయ అభిషేకం', step_title_ta: 'ஆறு நாள் உபவாசம் மற்றும் காலை அபிஷேகம்', step_title_hi: 'छह दिन का उपवास और सुबह अभिषेक',
    instruction_en: 'For six consecutive days from the day after Amavasya in Aippasi month, wake at 4 AM and perform abhishekam of the Vel and Murugan idol with milk and panchamritam. Chant Skanda Sashti Kavacham 6 times daily.',
    instruction_te: 'ఐప్పసి మాసంలో అమావాస్య మరుసటి రోజు నుండి 6 రోజులు ఉదయం 4 గం.కు లేచి వేలు మరియు ముత్తుకుమారన్ విగ్రహానికి పాలు, పంచామృతంతో అభిషేకం. స్కంద షష్ఠి కవచం రోజుకు 6 సార్లు చదవండి.',
    instruction_ta: 'ஐப்பசி மாதத்தில் அமாவாசை மறுநாளிலிருந்து 6 நாட்களும் அதிகாலை 4 மணிக்கு எழுந்து வேல் மற்றும் முருகன் சிலைக்கு அபிஷேகம் செய்யுங்கள். தினம் 6 முறை கந்த சஷ்டி கவசம் சொல்லுங்கள்.',
    instruction_hi: 'ऐप्पसी मास में अमावस्या के अगले दिन से 6 दिन सुबह 4 बजे उठकर वेल और मुरुगन प्रतिमा का दूध और पंचामृत से अभिषेक करें। दिन में 6 बार स्कंद षष्ठी कवचम् पाठ करें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'skanda-sashti-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Day 6: Soorasamharam and 108 Lemons',
    step_title_te: '6వ రోజు: సూరసంహారం మరియు 108 నిమ్మకాయలు', step_title_ta: '6வது நாள்: சூரசம்ஹாரம் மற்றும் 108 எலுமிச்சைகள்', step_title_hi: '6वां दिन: सूरसंहारम् और 108 नींबू',
    instruction_en: 'On the 6th day, keep a complete waterless fast until evening. Visit a Murugan temple for the Soorasamharam reenactment. At home, offer 108 lemons at the base of the Vel. Break fast after the Tirukalyanam celebration on the 7th morning.',
    instruction_te: '6వ రోజు సాయంత్రం వరకు పూర్తి నిర్జల ఉపవాసం. ముత్తుకుమారన్ ఆలయంలో సూరసంహారం చూడండి. ఇంట్లో వేలు దగ్గర 108 నిమ్మకాయలు అర్పించండి. 7వ రోజు తిరుకళ్యాణం తర్వాత ఉపవాసం విడవండి.',
    instruction_ta: '6వது நாள் மாலை வரை முழு நிர்ஜல உபவாசம். முருகன் கோவிலில் சூரசம்ஹாரம் பார்க்கவும். வீட்டில் வேல் அடியில் 108 எலுமிச்சைகள் அர்ப்பணிக்கவும்.',
    instruction_hi: '6वें दिन शाम तक पूर्ण निर्जला व्रत। मुरुगन मंदिर में सूरसंहारम् देखें। घर पर वेल के पास 108 नींबू अर्पित करें।',
    recite_shloka_slug: '', notes_en: '' },

  // 13. chhath-puja
  { parent_slug: 'chhath-puja', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Day 1-2: Nahay Khay and Kharna',
    step_title_te: '1-2 రోజులు: నహాయ్ ఖాయ్ మరియు ఖర్ణ', step_title_ta: '1-2 நாட்கள்: நஹாய் கா மற்றும் கர்ணா', step_title_hi: 'दिन 1-2: नहाय खाय और खरना',
    instruction_en: 'Day 1 (Nahay Khay): Bathe in the river, clean the house. Cook a single pure meal of bottle gourd and rice in new clay pots. Day 2 (Kharna): Fast all day; break at sunset with jaggery-kheer. After this, the 36-hour waterless fast begins.',
    instruction_te: '1వ రోజు (నహాయ్ ఖాయ్): నదిలో స్నానం, ఇల్లు శుభ్రం. కొత్త మట్టి పాత్రల్లో సొరకాయ, అన్నం వండండి. 2వ రోజు (ఖర్ణ): రోజంతా ఉపవాసం; సూర్యాస్తమయం తర్వాత బెల్లం-ఖీర్ తినండి. ఆ తర్వాత 36 గంటల నిర్జల ఉపవాసం.',
    instruction_ta: '1வது நாள் (நஹாய் கா): ஆற்றில் குளிக்கவும், வீடு சுத்தம் செய்யவும். 2வது நாள் (கர்ணா): நாள் முழுதும் உபவாசம்; மாலையில் வெல்லம்-கீர் சாப்பிடவும். பின் 36 மணி நேர நிர்ஜல உபவாசம் தொடங்கும்.',
    instruction_hi: 'दिन 1 (नहाय खाय): नदी में स्नान, घर साफ करें। नई मिट्टी के बर्तन में लौकी-भात पकाएं। दिन 2 (खरना): सारे दिन उपवास; सूर्यास्त पर गुड़-खीर खाएं। इसके बाद 36 घंटे का निर्जला व्रत शुरू।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'chhath-puja', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Day 3-4: Arghya to Setting and Rising Sun',
    step_title_te: '3-4 రోజులు: అస్తమించే మరియు ఉదయిస్తున్న సూర్యుడికి అర్ఘ్యం', step_title_ta: '3-4 நாட்கள்: மறையும் மற்றும் உதிக்கும் சூர்யனுக்கு அர்க்யம்', step_title_hi: 'दिन 3-4: डूबते और उगते सूर्य को अर्घ्य',
    instruction_en: 'Day 3 (Evening): Process to riverbank at sunset. Stand waist-deep facing west. Offer Arghya (milk+water poured through bamboo tray) to the setting sun with solar mantras. Day 4 (Dawn): Return before sunrise, stand waist-deep facing east. Offer Arghya to rising sun. Step out, distribute Thekua, sip water to break fast.',
    instruction_te: '3వ రోజు సాయంత్రం: సూర్యాస్తమయం సమయంలో నది తీరానికి వెళ్ళి నడుమువరకు నీళ్ళలో పశ్చిమముఖంగా నిలబడి అర్ఘ్యం ఇవ్వండి. 4వ రోజు తెల్లవారుగముందు: తిరిగి నదికి వెళ్ళి తూర్పుముఖంగా నిలబడి ఉదయించే సూర్యుడికి అర్ఘ్యం ఇవ్వండి.',
    instruction_ta: '3வது நாள் மாலை: சூரிய அஸ்தமன நேரத்தில் ஆற்றங்கரைக்கு சென்று இடுப்பளவு நீரில் மேற்கு நோக்கி நிற்று அர்க்யம் கொடுக்கவும். 4வது நாள் அதிகாலை: கிழக்கு நோக்கி உதிக்கும் சூர்யனுக்கு அர்க்யம் கொடுக்கவும்.',
    instruction_hi: 'दिन 3 शाम: सूर्यास्त पर नदी तट पर जाएं, कमर तक पश्चिम मुख खड़े होकर अर्घ्य दें। दिन 4 सुबह: पूर्व मुख उगते सूर्य को अर्घ्य दें। ठेकुआ बांटें, पानी पीकर व्रत तोड़ें।',
    recite_shloka_slug: '', notes_en: '' },

  // 14. sankashti-chaturthi-vratham
  { parent_slug: 'sankashti-chaturthi-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Ganesha Puja with Durva and Modaks',
    step_title_te: 'దుర్వా మరియు మోదకాలతో గణేశ పూజ', step_title_ta: 'துர்வா மற்றும் மோதகங்களுடன் கணேஷ பூஜை', step_title_hi: 'दूर्वा और मोदकों से गणेश पूजा',
    instruction_en: 'On Krishna Paksha Chaturthi, perform Ganesha puja. Offer exactly 21 bundles of Durva grass (3-5 blades each) — this is mandatory. Offer 21 modaks (steamed coconut-jaggery rice dumplings). Recite Ganesha Atharvashirsha.',
    instruction_te: 'కృష్ణ పక్ష చతుర్థి నాడు గణేశ పూజ. 21 దుర్వా గరిక కట్టలు (3-5 పోచలు చొప్పున) తప్పనిసరి. 21 మోదకాలు (ఆవిరి చేసిన కొబ్బరి-బెల్లం అరిసెలు) అర్పించండి. గణేశ అథర్వశీర్షం పఠించండి.',
    instruction_ta: 'கிருஷ்ண பக்ஷ சதுர்த்தியன்று கணேஷ பூஜை. 21 துர்வா புல் கட்டுகள் (3-5 தண்டுகள் ஒவ்வொன்றும்) கட்டாயம். 21 மோதகங்கள் (தேங்காய்-வெல்லம் அரிசி கொழுக்கட்டை) படைக்கவும்.',
    instruction_hi: 'कृष्ण पक्ष चतुर्थी पर गणेश पूजा। ठीक 21 दूर्वा की पूलियां (3-5 तिनके प्रत्येक) — अनिवार्य। 21 मोदक (नारियल-गुड़ की उबली पीठी) अर्पित करें। गणेश अथर्वशीर्ष का पाठ करें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'sankashti-chaturthi-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Moonrise Arghya',
    step_title_te: 'చంద్రోదయ అర్ఘ్యం', step_title_ta: 'சந்திர உதய அர்க்யம்', step_title_hi: 'चंद्रोदय अर्घ्य',
    instruction_en: 'Wait for the exact moonrise time (check a Hindu calendar app). Go to a spot where the moon is visible. Pour water mixed with milk, raw rice, and sandalwood from a copper pot toward the moon while praying for removal of obstacles.',
    instruction_te: 'ఖచ్చితమైన చంద్రోదయ సమయం కోసం వేచి ఉండండి. చంద్రుడు కనిపించే చోటికి వెళ్ళండి. పాలు, అక్కి, చందనం కలిపిన నీళ్ళు రాగి పాత్ర నుండి చంద్రుని వైపు పోయండి.',
    instruction_ta: 'சந்திர உதயத்தின் சரியான நேரத்திற்காக காத்திருங்கள். நிலவு தெரியும் இடத்திற்கு செல்லுங்கள். பால், அரிசி, சந்தனம் கலந்த நீரை செம்பு பாத்திரத்தில் இருந்து நிலவை நோக்கி ஊற்றுங்கள்.',
    instruction_hi: 'सटीक चंद्रोदय समय तक प्रतीक्षा करें। चांद दिखने वाली जगह जाएं। तांबे के लोटे से दूध, चावल, चंदन मिले जल को चंद्रमा की ओर अर्पित करें।',
    recite_shloka_slug: '', notes_en: '' },

  // 15. savitri-vratham
  { parent_slug: 'savitri-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Banyan Tree Worship',
    step_title_te: 'వటవృక్ష పూజ', step_title_ta: 'ஆலமர வழிபாடு', step_title_hi: 'वट वृक्ष पूजा',
    instruction_en: 'Walk to an ancient Banyan tree. Wash its base and apply vermilion and turmeric to the bark. Offer soaked chickpeas and seasonal fruits at the roots. The Banyan represents the immortal cosmic triad.',
    instruction_te: 'పురాతన మర్రి చెట్టుకు వెళ్ళండి. దాని బుడ్డు చుట్టూ నీళ్ళు పోయండి, బెరడుకు కుంకుమ, పసుపు పెట్టండి. మూలాల వద్ద నానబెట్టిన శనగలు, పండ్లు అర్పించండి.',
    instruction_ta: 'ஒரு பழைய ஆலமரத்திற்கு செல்லுங்கள். மரத்தடியை கழுவி பட்டைக்கு குங்குமம், மஞ்சள் பூசுங்கள். வேர்களில் ஊறவைத்த கடலை, பழங்கள் அர்ப்பணிக்கவும்.',
    instruction_hi: 'पुराने बरगद के पेड़ पर जाएं। उसकी जड़ धोएं, छाल पर लाल सिंदूर और हल्दी लगाएं। जड़ों पर भिगोए चने और मौसमी फल अर्पित करें।',
    recite_shloka_slug: '', notes_en: '' },
  { parent_slug: 'savitri-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Thread Wrapping (108 Rounds)',
    step_title_te: 'దారం చుట్టడం (108 సుత్తులు)', step_title_ta: 'நூல் சுற்றுதல் (108 சுற்றுகள்)', step_title_hi: 'धागा लपेटना (108 चक्कर)',
    instruction_en: 'Tie one end of raw white cotton thread to the bark. Walk around the trunk clockwise — 7 or 108 times — carefully wrapping the thread with every round, symbolically binding the husband\'s life to the deathless tree.',
    instruction_te: 'ముడిపడని తెల్లని పత్తి దారం ఒక చివర మర్రి చెట్టు బెరడుకు కట్టండి. 7 లేదా 108 సార్లు దక్షిణావర్తంగా చెట్టు చుట్టూ తిరుగుతూ దారం చుట్టండి.',
    instruction_ta: 'பருத்தி நூலின் ஒரு முனையை மர பட்டைக்கு கட்டுங்கள். கடிகாரச் சுற்று திசையில் 7 அல்லது 108 முறை மரத்தை சுற்றி நூலை சுருட்டுங்கள்.',
    instruction_hi: 'कच्चे सफेद सूत का एक छोर छाल से बांधें। 7 या 108 बार घड़ी की सुई की दिशा में पेड़ के चारों ओर घूमते हुए धागा लपेटें।',
    recite_shloka_slug: '', notes_en: '' },
];

// ── Material items for extra vrathams ─────────────────────────────────────────

const EXTRA_MATERIALS = [
  // 3. karwa-chauth
  { group_slug: 'karwa-chauth', item_order: 1, item_name_en: 'Karwa (clay pot)', item_name_te: 'కర్వా (మట్టి కుండ)', item_name_ta: 'கர்வா (மண் குடம்)', item_name_hi: 'करवा (मिट्टी का बर्तन)', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'karwa-chauth', item_order: 2, item_name_en: 'Sieve (chhalni)', item_name_te: 'జల్లెడ', item_name_ta: 'சல்லடை', item_name_hi: 'छलनी', quantity_en: '1', is_optional: false, substitution_note_en: 'For viewing moon and husband' },
  { group_slug: 'karwa-chauth', item_order: 3, item_name_en: 'Puja thali with diya', item_name_te: 'దీపంతో పూజా థాలీ', item_name_ta: 'தீபத்துடன் பூஜை தட்டு', item_name_hi: 'दीये के साथ पूजा थाली', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'karwa-chauth', item_order: 4, item_name_en: 'Sargi (pre-dawn meal kit)', item_name_te: 'సర్గి (తెల్లవారు భోజన సామగ్రి)', item_name_ta: 'சர்கி (அதிகாலை உணவு)', item_name_hi: 'सर्गी', quantity_en: 'per tradition', is_optional: false, substitution_note_en: '' },
  { group_slug: 'karwa-chauth', item_order: 5, item_name_en: 'Henna and bangles', item_name_te: 'మెహందీ మరియు గాజులు', item_name_ta: 'மருதாணி மற்றும் வளையல்கள்', item_name_hi: 'मेहंदी और चूड़ियां', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'karwa-chauth', item_order: 6, item_name_en: 'Sweet mathri / fenia', item_name_te: 'మిఠాయి మఠ్రి / ఫేనియా', item_name_ta: 'இனிப்பு மட்ரி / ஃபேனியா', item_name_hi: 'मीठी मठरी / फेनिया', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },

  // 4. maha-shivaratri
  { group_slug: 'maha-shivaratri', item_order: 1, item_name_en: 'Shiva Lingam', item_name_te: 'శివలింగం', item_name_ta: 'சிவலிங்கம்', item_name_hi: 'शिवलिंग', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: 2, item_name_en: 'Bel (bilva) leaves', item_name_te: 'బిల్వ పత్రాలు', item_name_ta: 'வில்வ இலைகள்', item_name_hi: 'बेल पत्र', quantity_en: '108+', is_optional: false, substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: 3, item_name_en: 'Milk (for 4 abhishekams)', item_name_te: 'పాలు (4 అభిషేకాలకు)', item_name_ta: 'பால் (4 அபிஷேகங்களுக்கு)', item_name_hi: 'दूध (4 अभिषेकों के लिए)', quantity_en: '2 litres', is_optional: false, substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: 4, item_name_en: 'Honey, curd, ghee', item_name_te: 'తేనె, పెరుగు, నెయ్యి', item_name_ta: 'தேன், தயிர், நெய்', item_name_hi: 'शहद, दही, घी', quantity_en: '100 ml each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: 5, item_name_en: 'Vibhuti (sacred ash)', item_name_te: 'విభూతి', item_name_ta: 'திருநீறு', item_name_hi: 'विभूति', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: 6, item_name_en: 'Dhatura flowers', item_name_te: 'ఉమ్మెత్తా పువ్వులు', item_name_ta: 'ஊமத்தை மலர்கள்', item_name_hi: 'धतूरा', quantity_en: 'a few', is_optional: true, substitution_note_en: '' },

  // 6. santoshi-mata
  { group_slug: 'santoshi-mata', item_order: 1, item_name_en: 'Santoshi Mata image or idol', item_name_te: 'సంతోషి మాత పటం లేదా విగ్రహం', item_name_ta: 'சந்தோஷி மாதா படம் அல்லது சிலை', item_name_hi: 'संतोषी माता का चित्र या मूर्ति', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'santoshi-mata', item_order: 2, item_name_en: 'Jaggery (gur)', item_name_te: 'బెల్లం', item_name_ta: 'வெல்லம்', item_name_hi: 'गुड़', quantity_en: '100 g', is_optional: false, substitution_note_en: 'The primary prasad' },
  { group_slug: 'santoshi-mata', item_order: 3, item_name_en: 'Roasted chickpeas (chana)', item_name_te: 'వేయించిన శనగలు', item_name_ta: 'வறுத்த கடலை', item_name_hi: 'भुना चना', quantity_en: '100 g', is_optional: false, substitution_note_en: 'The primary prasad' },
  { group_slug: 'santoshi-mata', item_order: 4, item_name_en: 'Incense and ghee lamp', item_name_te: 'అగరబత్తులు మరియు నెయ్యి దీపం', item_name_ta: 'அகர்பத்தி மற்றும் நெய் விளக்கு', item_name_hi: 'अगरबत्ती और घी का दीपक', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },

  // 7. kedareswara-vratham
  { group_slug: 'kedareswara-vratham', item_order: 1, item_name_en: 'Shiva Lingam (clay or metal)', item_name_te: 'శివలింగం (మట్టి లేదా లోహం)', item_name_ta: 'சிவலிங்கம் (மண் அல்லது உலோகம்)', item_name_hi: 'शिवलिंग (मिट्टी या धातु)', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'kedareswara-vratham', item_order: 2, item_name_en: 'Bel leaves (21 per day)', item_name_te: 'బిల్వ పత్రాలు (రోజుకు 21)', item_name_ta: 'வில்வ இலைகள் (ஒரு நாளுக்கு 21)', item_name_hi: 'बेल पत्र (प्रति दिन 21)', quantity_en: '21 × 21 days', is_optional: false, substitution_note_en: '' },
  { group_slug: 'kedareswara-vratham', item_order: 3, item_name_en: 'Milk, honey, ghee', item_name_te: 'పాలు, తేనె, నెయ్యి', item_name_ta: 'பால், தேன், நெய்', item_name_hi: 'दूध, शहद, घी', quantity_en: 'daily', is_optional: false, substitution_note_en: '' },
  { group_slug: 'kedareswara-vratham', item_order: 4, item_name_en: 'Vibhuti', item_name_te: 'విభూతి', item_name_ta: 'திருநீறு', item_name_hi: 'विभूति', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },

  // 8. mangala-gauri-vratham
  { group_slug: 'mangala-gauri-vratham', item_order: 1, item_name_en: 'Gauri idol (clay)', item_name_te: 'గౌరి విగ్రహం (మట్టి)', item_name_ta: 'கௌரி சிலை (மண்)', item_name_hi: 'गौरी प्रतिमा (मिट्टी)', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mangala-gauri-vratham', item_order: 2, item_name_en: '16 wheat-flour lamps', item_name_te: '16 గోధుమ పిండి దీపాలు', item_name_ta: '16 கோதுமை மாவு விளக்குகள்', item_name_hi: '16 गेहूं के आटे के दीपक', quantity_en: '16', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mangala-gauri-vratham', item_order: 3, item_name_en: 'Kumkum, bangles, mirror, comb', item_name_te: 'కుంకుమ, గాజులు, అద్దం, దువ్వెన', item_name_ta: 'குங்குமம், வளையல்கள், கண்ணாடி, சீப்பு', item_name_hi: 'कुमकुम, चूड़ियां, दर्पण, कंघी', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mangala-gauri-vratham', item_order: 4, item_name_en: 'Flowers (red preferred)', item_name_te: 'పువ్వులు (ఎర్రని ఇష్టం)', item_name_ta: 'மலர்கள் (சிவப்பு விரும்பப்படும்)', item_name_hi: 'फूल (लाल पसंदीदा)', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },

  // 10. hartalika-teej
  { group_slug: 'hartalika-teej', item_order: 1, item_name_en: 'River sand or natural clay', item_name_te: 'నది ఇసుక లేదా మట్టి', item_name_ta: 'ஆற்று மணல் அல்லது மண்', item_name_hi: 'नदी की रेत या मिट्टी', quantity_en: 'enough to mold idols', is_optional: false, substitution_note_en: '' },
  { group_slug: 'hartalika-teej', item_order: 2, item_name_en: '4 banana / sugarcane stalks for canopy', item_name_te: '4 అరటి / చెరకు కర్రలు మండపానికి', item_name_ta: '4 வாழை / கரும்பு தண்டுகள் மண்டபத்திற்கு', item_name_hi: '4 केले / गन्ने के डंठल छत के लिए', quantity_en: '4', is_optional: false, substitution_note_en: '' },
  { group_slug: 'hartalika-teej', item_order: 3, item_name_en: 'Bridal kit (vermilion, bindi, bangles, henna)', item_name_te: 'పెళ్ళికూతురు సాధనాలు (కుంకుమ, బొట్టు, గాజులు, మెహందీ)', item_name_ta: 'பெண் அலங்கார பொருட்கள் (குங்குமம், பொட்டு, வளையல்கள், மருதாணி)', item_name_hi: 'दुल्हन का सामान (सिंदूर, बिंदी, चूड़ियां, मेहंदी)', quantity_en: '1 set', is_optional: false, substitution_note_en: '' },
  { group_slug: 'hartalika-teej', item_order: 4, item_name_en: 'Bilva leaves and dhatura', item_name_te: 'బిల్వ పత్రాలు మరియు ఉమ్మెత్తా', item_name_ta: 'வில்வ இலைகள் மற்றும் ஊமத்தை', item_name_hi: 'बेल पत्र और धतूरा', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },

  // 11. vaibhav-lakshmi-vrat
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 1, item_name_en: 'Vaibhav Lakshmi Yantra or Ashta Lakshmi picture', item_name_te: 'వైభవ లక్ష్మీ యంత్రం లేదా అష్టలక్ష్మి పటం', item_name_ta: 'வைபவ லட்சுமி யந்திரம் அல்லது அஷ்ட லட்சுமி படம்', item_name_hi: 'वैभव लक्ष्मी यंत्र या अष्ट लक्ष्मी चित्र', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 2, item_name_en: 'Copper Kalash', item_name_te: 'రాగి కళశం', item_name_ta: 'செம்பு கலசம்', item_name_hi: 'तांबे का कलश', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 3, item_name_en: 'Family gold or silver coin', item_name_te: 'కుటుంబ బంగారం లేదా వెండి నాణెం', item_name_ta: 'குடும்ப தங்கம் அல்லது வெள்ளி நாணயம்', item_name_hi: 'परिवार का सोना या चांदी का सिक्का', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 4, item_name_en: 'Raw rice (for kalash bed)', item_name_te: 'పచ్చి అక్కి (కళశానికి)', item_name_ta: 'பச்சை அரிசி (கலசம் வைக்க)', item_name_hi: 'कच्चा चावल (कलश के लिए)', quantity_en: 'handful', is_optional: false, substitution_note_en: '' },
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 5, item_name_en: 'Red hibiscus flowers', item_name_te: 'ఎర్రని మందారాలు', item_name_ta: 'சிவப்பு செம்பருத்தி மலர்கள்', item_name_hi: 'लाल गुड़हल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'vaibhav-lakshmi-vrat', item_order: 6, item_name_en: 'Kheer (rice pudding with saffron)', item_name_te: 'ఖీర్ (కుంకుమతో పాయసం)', item_name_ta: 'கீர் (குங்குமத்துடன் பாயசம்)', item_name_hi: 'खीर (केसर वाली)', quantity_en: '1 bowl', is_optional: false, substitution_note_en: '' },

  // 12. skanda-sashti-vratham
  { group_slug: 'skanda-sashti-vratham', item_order: 1, item_name_en: 'Murugan idol with Vel', item_name_te: 'వేలుతో ముత్తుకుమారన్ విగ్రహం', item_name_ta: 'வேலுடன் முருகன் சிலை', item_name_hi: 'वेल के साथ मुरुगन प्रतिमा', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'skanda-sashti-vratham', item_order: 2, item_name_en: 'Brass Vel (spear)', item_name_te: 'ఇత్తడి వేలు', item_name_ta: 'பித்தளை வேல்', item_name_hi: 'पीतल का वेल', quantity_en: '1', is_optional: true, substitution_note_en: '' },
  { group_slug: 'skanda-sashti-vratham', item_order: 3, item_name_en: 'Panchamritam (bananas, jaggery, dates, raisins, honey)', item_name_te: 'పంచామృతం', item_name_ta: 'பஞ்சாமிர்தம்', item_name_hi: 'पंचामृतम्', quantity_en: 'bowl', is_optional: false, substitution_note_en: '' },
  { group_slug: 'skanda-sashti-vratham', item_order: 4, item_name_en: '108 lemons (for Day 6)', item_name_te: '108 నిమ్మకాయలు (6వ రోజుకు)', item_name_ta: '108 எலுமிச்சைகள் (6வது நாளுக்கு)', item_name_hi: '108 नींबू (6वें दिन के लिए)', quantity_en: '108', is_optional: false, substitution_note_en: '' },
  { group_slug: 'skanda-sashti-vratham', item_order: 5, item_name_en: 'Red oleander (arali) flowers', item_name_te: 'ఎర్ర అరళి పువ్వులు', item_name_ta: 'சிவப்பு அரளி மலர்கள்', item_name_hi: 'लाल कनेर फूल', quantity_en: 'garlands', is_optional: false, substitution_note_en: '' },
  { group_slug: 'skanda-sashti-vratham', item_order: 6, item_name_en: 'Skanda Sashti Kavacham text', item_name_te: 'స్కంద షష్ఠి కవచం పాఠ్యం', item_name_ta: 'கந்த சஷ்டி கவசம் உரை', item_name_hi: 'स्कंद षष्ठी कवचम् पाठ', quantity_en: '1 copy', is_optional: false, substitution_note_en: '' },

  // 13. chhath-puja
  { group_slug: 'chhath-puja', item_order: 1, item_name_en: 'Bamboo soop (tray)', item_name_te: 'వెదురు సూప్ (బుట్ట)', item_name_ta: 'வேங்கை சூப் (கூடை)', item_name_hi: 'बांस का सूप', quantity_en: '1–2', is_optional: false, substitution_note_en: '' },
  { group_slug: 'chhath-puja', item_order: 2, item_name_en: 'Thekua (wheat-jaggery cookies)', item_name_te: 'ఠేకువా (గోధుమ-బెల్లం అప్పాలు)', item_name_ta: 'தேக்குவா (கோதுமை-வெல்லம் பிஸ்கட்)', item_name_hi: 'ठेकुआ', quantity_en: 'batch', is_optional: false, substitution_note_en: 'The primary ritual offering' },
  { group_slug: 'chhath-puja', item_order: 3, item_name_en: 'Sugarcane stalks (whole)', item_name_te: 'చెరకు కర్రలు (పూర్తి)', item_name_ta: 'கரும்பு தண்டுகள் (முழுவதும்)', item_name_hi: 'गन्ने के डंठल', quantity_en: '2–4', is_optional: false, substitution_note_en: '' },
  { group_slug: 'chhath-puja', item_order: 4, item_name_en: 'Whole coconut', item_name_te: 'పూర్తి కొబ్బరికాయ', item_name_ta: 'முழு தேங்காய்', item_name_hi: 'साबुत नारियल', quantity_en: '2', is_optional: false, substitution_note_en: '' },
  { group_slug: 'chhath-puja', item_order: 5, item_name_en: 'Brass lota (water vessel)', item_name_te: 'ఇత్తడి లోటా', item_name_ta: 'பித்தளை லோட்டா', item_name_hi: 'पीतल का लोटा', quantity_en: '2', is_optional: false, substitution_note_en: '' },

  // 14. sankashti-chaturthi-vratham
  { group_slug: 'sankashti-chaturthi-vratham', item_order: 1, item_name_en: 'Ganesha idol (left-trunk preferred)', item_name_te: 'గణేశ విగ్రహం (ఎడమ తొండం ఇష్టం)', item_name_ta: 'கணேஷ சிலை (இடது துதிக்கை விரும்பப்படும்)', item_name_hi: 'गणेश प्रतिमा (बाईं सूंड पसंदीदा)', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: 2, item_name_en: '21 Durva grass bundles (must)', item_name_te: '21 దుర్వా గరిక కట్టలు (తప్పనిసరి)', item_name_ta: '21 துர்வா புல் கட்டுகள் (கட்டாயம்)', item_name_hi: '21 दूर्वा की पूलियां (अनिवार्य)', quantity_en: '21 bundles of 3–5', is_optional: false, substitution_note_en: 'Do not skip — Ganesha accepts no worship without durva' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: 3, item_name_en: '21 Modaks', item_name_te: '21 మోదకాలు', item_name_ta: '21 மோதகங்கள்', item_name_hi: '21 मोदक', quantity_en: '21', is_optional: false, substitution_note_en: '' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: 4, item_name_en: 'Copper arghya pot (with milk + rice + sandalwood)', item_name_te: 'రాగి అర్ఘ్య పాత్ర (పాలు + అక్కి + చందనంతో)', item_name_ta: 'செம்பு அர்க்ய பாத்திரம் (பால் + அரிசி + சந்தனத்துடன்)', item_name_hi: 'तांबे का अर्घ्य पात्र (दूध + चावल + चंदन के साथ)', quantity_en: '1', is_optional: false, substitution_note_en: 'For moonrise arghya' },

  // 15. savitri-vratham
  { group_slug: 'savitri-vratham', item_order: 1, item_name_en: 'Raw white cotton thread (kachha soot)', item_name_te: 'ముడిపడని తెల్లని పత్తి దారం', item_name_ta: 'கச்சா பருத்தி நூல்', item_name_hi: 'कच्चा सफेद सूत', quantity_en: 'large spool', is_optional: false, substitution_note_en: '' },
  { group_slug: 'savitri-vratham', item_order: 2, item_name_en: 'Soaked chickpeas (chana)', item_name_te: 'నానబెట్టిన శనగలు', item_name_ta: 'ஊறவைத்த கடலை', item_name_hi: 'भिगोए चने', quantity_en: '100 g', is_optional: false, substitution_note_en: '' },
  { group_slug: 'savitri-vratham', item_order: 3, item_name_en: 'Seasonal fruits (mango, jackfruit, banana)', item_name_te: 'పండ్లు (మామిడి, పనస, అరటి)', item_name_ta: 'பருவகால பழங்கள் (மாம்பழம், பலா, வாழை)', item_name_hi: 'मौसमी फल (आम, कटहल, केला)', quantity_en: 'assorted', is_optional: false, substitution_note_en: '' },
  { group_slug: 'savitri-vratham', item_order: 4, item_name_en: 'Vermilion and turmeric', item_name_te: 'కుంకుమ మరియు పసుపు', item_name_ta: 'குங்குமம் மற்றும் மஞ்சள்', item_name_hi: 'सिंदूर और हल्दी', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'savitri-vratham', item_order: 5, item_name_en: 'Picture of Savitri before Yama', item_name_te: 'యముని ముందు సావిత్రి చిత్రం', item_name_ta: 'எமனின் முன் சாவித்திரி படம்', item_name_hi: 'यम के सामने सावित्री का चित्र', quantity_en: '1', is_optional: true, substitution_note_en: '' },
];


// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Load extracted content
  const contentPath = join(__dirname, 'vratham-content.json');
  const content = JSON.parse(readFileSync(contentPath, 'utf-8'));
  console.log(`Loaded ${content.length} vrathams from vratham-content.json`);

  // ── 1. Check existing stories_index ────────────────────────────────────────
  const indexData = await getSheetData(sheets, 'stories_index');
  const [indexHeaders, ...indexRows] = indexData.length ? indexData : [[], []];
  const existingStorySlugs = new Set(indexRows.map(r => r[0]));
  const slugCol = indexHeaders.indexOf('slug');

  console.log(`\nExisting story slugs: ${existingStorySlugs.size}`);

  // ── 2. Check existing stories_content ──────────────────────────────────────
  const contentData = await getSheetData(sheets, 'stories_content');
  const contentRows = contentData.slice(1);
  const existingContentSlugs = new Set(contentRows.map(r => r[0]));

  // ── 3. Check existing procedure_steps and material_items ───────────────────
  const stepsData = await getSheetData(sheets, 'procedure_steps');
  const existingStepSlugs = new Set((stepsData.slice(1)).map(r => r[0]));

  const matsData = await getSheetData(sheets, 'material_items');
  const existingMatSlugs = new Set((matsData.slice(1)).map(r => r[0]));

  // ── 4. Build stories_index rows ────────────────────────────────────────────
  const newIndexRows = [];
  for (const item of content) {
    if (existingStorySlugs.has(item.story_slug)) {
      console.log(`  ↩ skip stories_index: ${item.story_slug} (already exists)`);
      continue;
    }
    newIndexRows.push([
      item.story_slug,
      item.katha_title_en || item.title_en,
      item.katha_title_te || item.title_te,
      item.katha_title_ta || item.title_ta,
      item.katha_title_hi || item.title_hi,
      item.vratham_slug,        // parent_slug
      'vrata-katha',            // story_type
      '', '',                   // source_scripture_en, reading_instruction_en
      '', '', '', '',           // brief_summary en/te/ta/hi
      '', '', '', '',           // gdoc_id en/te/ta/hi — all empty (using stories_content)
      'published',
      'multilingual',
    ]);
  }

  if (newIndexRows.length) {
    await appendRows(sheets, 'stories_index', newIndexRows);
    console.log(`✓ Added ${newIndexRows.length} rows to stories_index`);
  } else {
    console.log('ℹ stories_index: all story slugs already present');
  }

  // ── 5. Build stories_content rows ──────────────────────────────────────────
  const newContentRows = [];
  for (const item of content) {
    const hasContent = existingContentSlugs.has(item.story_slug);
    if (hasContent) {
      // Check if it's only English by looking at how many lang variants exist
      const langCounts = {};
      contentRows.forEach(r => {
        if (r[0] === item.story_slug) {
          langCounts[r[1]] = (langCounts[r[1]] || 0) + 1;
        }
      });
      const missingLangs = ['en', 'te', 'ta', 'hi'].filter(l => !langCounts[l]);
      if (missingLangs.length === 0) {
        console.log(`  ↩ skip stories_content: ${item.story_slug} (all langs present)`);
        continue;
      }
      console.log(`  + adding missing langs for ${item.story_slug}: ${missingLangs.join(', ')}`);
      for (const lang of missingLangs) {
        const paras = item[`katha_paras_${lang}`] || [];
        paras.forEach((p, idx) => {
          if (p.trim()) newContentRows.push([item.story_slug, lang, idx + 1, p]);
        });
      }
    } else {
      for (const lang of ['en', 'te', 'ta', 'hi']) {
        const paras = item[`katha_paras_${lang}`] || [];
        paras.forEach((p, idx) => {
          if (p.trim()) newContentRows.push([item.story_slug, lang, idx + 1, p]);
        });
      }
    }
  }

  if (newContentRows.length) {
    const BATCH = 500;
    for (let i = 0; i < newContentRows.length; i += BATCH) {
      await appendRows(sheets, 'stories_content', newContentRows.slice(i, i + BATCH));
    }
    console.log(`✓ Added ${newContentRows.length} rows to stories_content`);
  } else {
    console.log('ℹ stories_content: all content already present');
  }

  // ── 6. Update linked_story_slug in vrathams tab ───────────────────────────
  const vrathamsData = await getSheetData(sheets, 'vrathams');
  const [vHeaders, ...vRows] = vrathamsData;
  const vSlugCol = vHeaders.indexOf('slug');
  const vStoryCol = vHeaders.indexOf('linked_story_slug');

  if (vStoryCol === -1) {
    console.log('⚠ linked_story_slug column not found in vrathams tab — skipping');
  } else {
    for (const item of content) {
      const rowIdx = vRows.findIndex(r => r[vSlugCol] === item.vratham_slug);
      if (rowIdx === -1) {
        console.log(`  ⚠ Vratham not found in sheet: ${item.vratham_slug}`);
        continue;
      }
      const currentLink = vRows[rowIdx][vStoryCol];
      if (currentLink && currentLink.trim()) {
        console.log(`  ↩ skip link: ${item.vratham_slug} already linked to ${currentLink}`);
        continue;
      }
      const sheetRow = rowIdx + 2;
      await updateCell(sheets, 'vrathams', sheetRow, vStoryCol, item.story_slug);
      console.log(`  ✓ linked ${item.vratham_slug} → ${item.story_slug}`);
    }
  }

  // ── 7. Add extra procedure steps ─────────────────────────────────────────
  const newSteps = EXTRA_STEPS.filter(s => !existingStepSlugs.has(s.parent_slug));
  if (newSteps.length) {
    const rows = newSteps.map(s => [
      s.parent_slug, s.parent_type, s.step_number,
      s.step_title_en, s.step_title_te, s.step_title_ta, s.step_title_hi,
      s.instruction_en, s.instruction_te, s.instruction_ta, s.instruction_hi,
      s.recite_shloka_slug, '', s.notes_en,
    ]);
    await appendRows(sheets, 'procedure_steps', rows);
    console.log(`✓ Added ${rows.length} extra procedure_steps rows`);
  } else {
    console.log('ℹ procedure_steps: all extra steps already present');
  }

  // ── 8. Add extra material items ───────────────────────────────────────────
  const newMats = EXTRA_MATERIALS.filter(m => !existingMatSlugs.has(m.group_slug));
  if (newMats.length) {
    const rows = newMats.map(m => [
      m.group_slug, m.item_order,
      m.item_name_en, m.item_name_te, m.item_name_ta, m.item_name_hi,
      m.quantity_en, m.is_optional ? 'true' : 'false', m.substitution_note_en,
    ]);
    await appendRows(sheets, 'material_items', rows);
    console.log(`✓ Added ${rows.length} extra material_items rows`);
  } else {
    console.log('ℹ material_items: all extra materials already present');
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
