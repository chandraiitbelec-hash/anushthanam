/**
 * Add the 11 vrathams missing from the vrathams tab.
 * Titles sourced from the DOCX translations.
 * Run: node scripts/populate-missing-vrathams.mjs
 */

import { google } from 'googleapis';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '..', '.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

// Headers (order must match vrathams sheet):
// slug, title_en, title_te, title_ta, title_hi,
// deity_slug, observance_day, tithi, paksha, duration, next_occurrence, next_occurrence_note_en,
// fasting_rules_en, fasting_rules_te, fasting_rules_ta, fasting_rules_hi,
// benefits_en, benefits_te, benefits_ta, benefits_hi,
// linked_puja_slug, linked_story_slug, status, translation_status

const VRATHAMS = [
  {
    slug: 'karwa-chauth',
    title_en: 'Karwa Chauth', title_te: 'కర్వా చౌత్', title_ta: 'கர்வா சௌத்', title_hi: 'करवा चौथ',
    deity_slug: 'shiva',
    observance_day: 'Krishna Paksha Chaturthi, Kartik',
    tithi: 'chaturthi', paksha: 'krishna',
    duration: '1 day (nirjala)',
    next_occurrence: '', next_occurrence_note_en: 'Oct/Nov — Krishna Paksha Chaturthi in Kartik month',
    fasting_rules_en: 'Strict nirjala (no water, no food) fast from pre-dawn Sargi meal until moonrise. The fast can only be broken after sighting the moon through a sieve.',
    fasting_rules_te: 'తెల్లవారుజామున సర్గి తిన్న తర్వాత చాంద్రోదయం వరకు నిర్జల ఉపవాసం. జల్లెడ ద్వారా చంద్రుడిని చూసిన తర్వాత మాత్రమే ఉపవాసం విరమించాలి.',
    fasting_rules_ta: 'அதிகாலை சர்கி சாப்பிட்ட பிறகு நிலவு உதிக்கும் வரை நிர்ஜல உபவாசம். சல்லடை வழியாக நிலவை பார்த்த பின்னரே விரதம் முடிக்கலாம்.',
    fasting_rules_hi: 'सर्गी के बाद से चंद्रोदय तक निर्जला व्रत। छलनी से चांद देखने के बाद ही व्रत तोड़ा जाता है।',
    benefits_en: 'Protects the husband\'s life, ensures marital longevity, and strengthens the bond between husband and wife. The fast invokes the blessings of Goddess Parvati for marital bliss.',
    benefits_te: 'భర్త జీవితాన్ని రక్షిస్తుంది, వైవాహిక దీర్ఘాయువును నిర్ధారిస్తుంది. పార్వతీదేవి అనుగ్రహంతో వైవాహిక జీవితంలో శాంతి, సుఖం కలుగుతాయి.',
    benefits_ta: 'கணவனின் நீண்ட ஆயுளை உறுதி செய்கிறது. தாம்பத்திய அன்பை வலுப்படுத்துகிறது. பார்வதி தேவியின் ஆசிர்வாதம் கிடைக்கிறது.',
    benefits_hi: 'पति की आयु की रक्षा करता है, वैवाहिक सुख प्रदान करता है। देवी पार्वती का आशीर्वाद मिलता है।',
    linked_story_slug: 'karwa-chauth-katha',
  },
  {
    slug: 'maha-shivaratri',
    title_en: 'Mahashivratri Vratam', title_te: 'మహాశివరాత్రి వ్రతం', title_ta: 'மஹா சிவராத்திரி விரதம்', title_hi: 'महाशिवरात्रि व्रतम्',
    deity_slug: 'shiva',
    observance_day: 'Krishna Paksha Chaturdashi, Phalguna/Magha',
    tithi: 'chaturdashi', paksha: 'krishna',
    duration: '1 day + all-night vigil',
    next_occurrence: '', next_occurrence_note_en: 'Feb/Mar — 14th night of waning moon in Phalguna month',
    fasting_rules_en: 'Fast from sunrise on Mahashivratri until the next morning. A nirjala fast is ideal; fruits and milk are permitted for those unable to fast completely. Four abhishekams are performed throughout the night — at 9 PM, midnight, 3 AM, and 6 AM. No sleep allowed.',
    fasting_rules_te: 'మహాశివరాత్రి సూర్యోదయం నుండి మరుసటి రోజు ఉదయం వరకు ఉపవాసం. నిర్జల ఉపవాసం ఆదర్శం. రాత్రి నాలుగు సార్లు అభిషేకాలు. నిద్ర వద్దు.',
    fasting_rules_ta: 'சிவராத்திரியில் சூர்யோதயம் முதல் மறுநாள் காலை வரை உபவாசம். நிர்ஜல உபவாசம் சிறந்தது. இரவு நான்கு முறை அபிஷேகம். தூக்கம் கூடாது.',
    fasting_rules_hi: 'महाशिवरात्रि पर सूर्योदय से अगले दिन सुबह तक उपवास। निर्जला व्रत आदर्श। रात को चार बार अभिषेक। नींद वर्जित।',
    benefits_en: 'Dissolves negative karma accumulated over many lifetimes, grants liberation from the cycle of death and rebirth, bestows Shiva\'s divine grace on the devotee and their family.',
    benefits_te: 'అనేక జన్మల పాపాలు నశిస్తాయి. మోక్షం ప్రాప్తిస్తుంది. శివుని దివ్యకృప కుటుంబంపై కలుగుతుంది.',
    benefits_ta: 'பல ஜன்மங்களின் பாபங்கள் நீங்கும். மோட்சம் கிடைக்கும். குடும்பத்தில் சிவனின் அருள் நிலைக்கும்.',
    benefits_hi: 'कई जन्मों के पाप नष्ट होते हैं। मोक्ष की प्राप्ति होती है। शिव की कृपा परिवार पर रहती है।',
    linked_story_slug: 'maha-shivaratri-katha',
  },
  {
    slug: 'santoshi-mata',
    title_en: 'Santoshi Mata Vrat', title_te: 'సంతోషీ మాత వ్రతం', title_ta: 'சந்தோஷி மாதா விரதம்', title_hi: 'संतोषी माता व्रत',
    deity_slug: 'ganesha',
    observance_day: 'Every Friday',
    tithi: '', paksha: '',
    duration: '16 consecutive Fridays',
    next_occurrence: '', next_occurrence_note_en: 'Every Friday — 16-week commitment',
    fasting_rules_en: 'Fast every Friday for 16 consecutive weeks. Avoid sour foods entirely (lemon, tamarind, curd) — this is the most critical rule. Take only fruits and milk until the evening puja. Break fast after offering gur-chana to the goddess.',
    fasting_rules_te: 'వరుసగా 16 శుక్రవారాలు ఉపవాసం. పులుపు పదార్థాలు (నిమ్మ, చింతపండు, పెరుగు) పూర్తిగా నిషేధం. సాయంత్రం పూజ తర్వాత బెల్లం-శనగలు తీసుకుని ఉపవాసం విరమించండి.',
    fasting_rules_ta: 'தொடர்ந்து 16 வெள்ளிக்கிழமைகள் உபவாசம். புளிப்பு பொருட்கள் (எலுமிச்சை, புளி, தயிர்) கண்டிப்பாக வேண்டாம். மாலை பூஜைக்கு பிறகு வெல்லம்-கடலையுடன் விரதம் முடியுங்கள்.',
    fasting_rules_hi: 'लगातार 16 शुक्रवार व्रत। खट्टी चीजें (नींबू, इमली, दही) सख्त मना। शाम की पूजा के बाद गुड़-चना से व्रत तोड़ें।',
    benefits_en: 'Removes poverty and financial distress, grants domestic happiness, fulfils the sincere wishes of the devotee, and bestows mental peace and contentment.',
    benefits_te: 'దారిద్ర్యం తొలగుతుంది, ఆర్థిక సమస్యలు పరిష్కారమవుతాయి, మనశ్శాంతి, ఇంటి సంతోషం కలుగుతాయి.',
    benefits_ta: 'வறுமை நீங்கும். ఆर்ட்திக சிக்கல்கள் தீரும். மனசாந்தி மற்றும் குடும்ப மகிழ்ச்சி கிடைக்கும்.',
    benefits_hi: 'गरीबी दूर होती है, आर्थिक समस्याएं हल होती हैं, घर में खुशहाली आती है, मनोकामनाएं पूरी होती हैं।',
    linked_story_slug: 'santoshi-mata-katha',
  },
  {
    slug: 'kedareswara-vratham',
    title_en: 'Kedareswara Vratam', title_te: 'కేదారేశ్వర వ్రతకల్పం', title_ta: 'கேதாரேஸ்வர விரதம்', title_hi: 'केदारेश्वर व्रतम्',
    deity_slug: 'shiva',
    observance_day: 'Tritiya of Bhadrapada — 21 consecutive days',
    tithi: 'tritiya', paksha: 'shukla',
    duration: '21 days',
    next_occurrence: '', next_occurrence_note_en: 'Aug/Sep — starting on Shukla Tritiya of Bhadrapada month',
    fasting_rules_en: 'Partial fast (fruits and milk only) for 21 consecutive days beginning on Tritiya of Bhadrapada month. Daily morning abhishekam and offering of 21 bilva leaves. Observed primarily by women for marital well-being.',
    fasting_rules_te: 'భాద్రపద తృతీయ నుండి 21 రోజులు పాక్షిక ఉపవాసం (పండ్లు, పాలు మాత్రమే). రోజువారీ 21 బిల్వ పత్రాలతో అభిషేకం. ప్రాథమికంగా వివాహిత మహిళలు ఆచరిస్తారు.',
    fasting_rules_ta: 'பாத்ரபட திரிதியை முதல் 21 நாட்கள் பகுதி உபவாசம் (பழங்கள், பால் மட்டும்). தினசரி 21 வில்வ இலைகளுடன் அபிஷேகம். திருமணமான பெண்கள் முக்கியமாக கடைப்பிடிக்கிறார்கள்.',
    fasting_rules_hi: 'भाद्रपद तृतीया से 21 दिन आंशिक उपवास (फल-दूध ही)। प्रतिदिन 21 बेल पत्रों से अभिषेक। मुख्यतः विवाहित महिलाएं करती हैं।',
    benefits_en: 'Ensures marital stability and longevity of spouse, grants sons and prosperity, removes planetary afflictions related to marriage.',
    benefits_te: 'వైవాహిక స్థిరత్వం, భర్త దీర్ఘాయువు, సంతానం, సమృద్ధి కలుగుతాయి. వివాహ సంబంధిత గ్రహ దోషాలు తొలగుతాయి.',
    benefits_ta: 'தாம்பத்திய நிலைத்தன்மை, கணவனின் நீண்ட ஆயுள், புத்திர பாக்கியம், செழிப்பு கிட்டும்.',
    benefits_hi: 'वैवाहिक स्थिरता, पति की दीर्घायु, संतान और समृद्धि मिलती है। विवाह सम्बन्धी ग्रह दोष दूर होते हैं।',
    linked_story_slug: 'kedareswara-katha',
  },
  {
    slug: 'mangala-gauri-vratham',
    title_en: 'Mangala Gauri Vratam', title_te: 'మంగళగౌరీ వ్రతం', title_ta: 'மங்கள கௌரி விரதம்', title_hi: 'मंगला गौरी व्रतम्',
    deity_slug: 'parvati',
    observance_day: 'Every Tuesday of Shravana month',
    tithi: '', paksha: '',
    duration: '5 Tuesdays in Shravana',
    next_occurrence: '', next_occurrence_note_en: 'Jul/Aug — every Tuesday of Shravana month',
    fasting_rules_en: 'Observed by newly married women on all Tuesdays of Shravana month (5 Tuesdays total). Fast from sunrise to moonrise, consuming only fruits and milk. Offer 16 wheat-flour lamps and perform 16-fold worship of Goddess Gauri.',
    fasting_rules_te: 'నవ వివాహిత మహిళలు శ్రావణ మాసంలో 5 మంగళవారాలు ఆచరిస్తారు. సూర్యోదయం నుండి చంద్రోదయం వరకు పండ్లు, పాలు మాత్రమే. 16 గోధుమ పిండి దీపాలు వెలిగించాలి.',
    fasting_rules_ta: 'புதுமணப் பெண்கள் ஸ்ராவண மாதத்தில் 5 செவ்வாய்கிழமைகள் கடைப்பிடிக்கிறார்கள். சூர்யோதயம் முதல் சந்திரோதயம் வரை பழங்கள், பால் மட்டும். 16 கோதுமை மாவு விளக்குகள் ஏற்றவும்.',
    fasting_rules_hi: 'नवविवाहित महिलाएं श्रावण के 5 मंगलवारों पर करें। सूर्योदय से चंद्रोदय तक फल-दूध ही। 16 गेहूं के आटे के दीपक जलाएं।',
    benefits_en: 'Bestows unbreachable protection to the husband, ensures he is shielded from untimely death and all planetary afflictions. Grants happiness and prosperity to the marital home.',
    benefits_te: 'భర్తకు అత్యున్నత రక్షణ కలుగుతుంది, అకాల మృత్యువు నుండి కాపాడుతుంది. వైవాహిక జీవితంలో సుఖం, సమృద్ధి కలుగుతాయి.',
    benefits_ta: 'கணவனுக்கு அதிర்ஷ்டமான பாதுகாப்பு கிடைக்கும். அகால மரணம் தடுக்கப்படும். வாழ்க்கையில் மகிழ்ச்சி, செழிப்பு நிலைக்கும்.',
    benefits_hi: 'पति को अभेद्य सुरक्षा मिलती है, अकाल मृत्यु से रक्षा होती है। वैवाहिक जीवन में सुख और समृद्धि आती है।',
    linked_story_slug: 'mangala-gauri-katha',
  },
  {
    slug: 'hartalika-teej',
    title_en: 'Hartalika Teej Vratam', title_te: 'హరతాళికా తీజ్ వ్రతం', title_ta: 'ஹர்தாலிகா தீஜ் விரதம்', title_hi: 'हरितालिका तीज व्रतम्',
    deity_slug: 'parvati',
    observance_day: 'Shukla Paksha Tritiya, Bhadrapada',
    tithi: 'tritiya', paksha: 'shukla',
    duration: '24-hour nirjala + all-night vigil',
    next_occurrence: '', next_occurrence_note_en: 'Aug/Sep — Shukla Tritiya of Bhadrapada month',
    fasting_rules_en: 'Absolute 24-hour nirjala (no water, no food) fast. All-night vigil is mandatory — sleeping breaks the vrat. Women mold sand idols of Shiva-Parvati by hand. Fast ends the next morning after idol immersion.',
    fasting_rules_te: 'పూర్తి 24 గంటల నిర్జల ఉపవాసం. రాత్రి మొత్తం జాగరం తప్పనిసరి — నిద్రపోతే వ్రతం భంగమవుతుంది. ఆడవారు చేతులతో మట్టి శివ-పార్వతి విగ్రహాలు తయారు చేస్తారు.',
    fasting_rules_ta: 'முழுமையான 24 மணி நேர நிர்ஜல உபவாசம். இரவு முழுவதும் விழிப்புடன் இருக்க வேண்டும் — தூக்கம் விரதத்தை கலைக்கும். பெண்கள் கையால் மண் சிவ-பார்வதி சிலைகள் செய்கிறார்கள்.',
    fasting_rules_hi: 'पूर्ण 24 घंटे का निर्जला व्रत। रात भर जागरण अनिवार्य — सोने से व्रत टूटता है। महिलाएं हाथ से मिट्टी के शिव-पार्वती बनाती हैं।',
    benefits_en: 'Shatters all obstacles in the path of marriage, grants the husband of one\'s choice, and ensures lifelong marital stability. Replicates the divine devotion of Goddess Parvati herself.',
    benefits_te: 'వివాహంలో అన్ని అడ్డంకులను తొలగిస్తుంది, ఇష్టమైన భర్తను పొందే వరం ఇస్తుంది, వైవాహిక జీవనంలో శాశ్వత స్థిరత్వం కలుగుతుంది.',
    benefits_ta: 'திருமணத்தில் உள்ள அனைத்து தடைகளும் நீங்கும். விரும்பிய கணவன் கிடைக்கும். வாழ்நாள் முழுவதும் தாம்பத்திய நிலைத்தன்மை நிலைக்கும்.',
    benefits_hi: 'विवाह में सभी बाधाएं दूर होती हैं, मनचाहा पति मिलता है, जीवन भर वैवाहिक स्थिरता रहती है।',
    linked_story_slug: 'hartalika-teej-katha',
  },
  {
    slug: 'vaibhav-lakshmi-vrat',
    title_en: 'Vaibhav Lakshmi Vrat', title_te: 'వైభవ లక్ష్మీ వ్రతం', title_ta: 'வைபவ லட்சுமி விரதம்', title_hi: 'वैभव लक्ष्मी व्रत',
    deity_slug: 'lakshmi',
    observance_day: 'Every Friday',
    tithi: '', paksha: '',
    duration: '11, 21 or 51 consecutive Fridays',
    next_occurrence: '', next_occurrence_note_en: 'Every Friday — 11/21/51-week commitment',
    fasting_rules_en: 'Partial fast every Friday for a committed cycle of 11, 21, or 51 weeks. Avoid heavy meals and negative speech throughout the day. The main puja is performed in the evening. No sour foods; prefer light vegetarian meals.',
    fasting_rules_te: 'నిర్ణీత చక్రంలో ప్రతి శుక్రవారం పాక్షిక ఉపవాసం (11, 21 లేదా 51 వారాలు). రోజంతా భారీ ఆహారం మరియు ప్రతికూల మాటలు మానుకోండి. సాయంత్రం ముఖ్య పూజ చేయాలి.',
    fasting_rules_ta: 'ஒவ்வொரு வெள்ளிக்கிழமையும் நிர்ணயிக்கப்பட்ட 11, 21 அல்லது 51 வாரங்கள் பகுதி உபவாசம். கனமான உணவை தவிர்க்கவும். மாலை முக்கிய பூஜை செய்யவும்.',
    fasting_rules_hi: 'हर शुक्रवार 11, 21 या 51 सप्ताह की प्रतिबद्धता के साथ आंशिक उपवास। भारी भोजन और नकारात्मक बातें त्यागें। शाम को मुख्य पूजा करें।',
    benefits_en: 'Restores lost wealth and dignity, brings luxury and grace into the home, cleanses and rejuvenates family finances through honest means, grants health and marital happiness.',
    benefits_te: 'కోల్పోయిన సంపద, ఇంటి గౌరవం పునరుద్ధరించబడుతుంది. ఇంట్లో సౌలభ్యం, సుఖం కలుగుతాయి. సత్యమార్గంలో ఆర్థిక పురోగతి సాధ్యమవుతుంది.',
    benefits_ta: 'இழந்த செல்வம் மற்றும் மரியாதை மீட்கப்படும். வீட்டில் ஐசுவர்யம் கிட்டும். நேர்மையான வழியில் ஆதாயம் உண்டாகும்.',
    benefits_hi: 'खोया हुआ धन और सम्मान वापस आता है। घर में समृद्धि और शांति आती है। ईमानदारी से आर्थिक उन्नति होती है।',
    linked_story_slug: 'vaibhav-lakshmi-katha',
  },
  {
    slug: 'skanda-sashti-vratham',
    title_en: 'Skanda Sashti Vratam', title_te: 'స్కంద షష్ఠి వ్రతం', title_ta: 'ஸ்கந்த சஷ்டி விரதம்', title_hi: 'स्कंद षष्ठी व्रतम्',
    deity_slug: 'murugan',
    observance_day: 'Sashti after Amavasya in Aippasi month (Oct/Nov)',
    tithi: 'sashti', paksha: 'shukla',
    duration: '6 consecutive days',
    next_occurrence: '', next_occurrence_note_en: 'Oct/Nov — 6 days starting from the day after Amavasya in Tamil month of Aippasi',
    fasting_rules_en: 'Six-day intensive fast. Daily liquid or single-meal-of-plain-rice diet. Chant the Skanda Sashti Kavacham 6 times daily. Complete nirjala fast on the 6th day until the Soorasamharam celebration.',
    fasting_rules_te: 'ఆరు రోజుల తీవ్రమైన ఉపవాసం. రోజువారీ ద్రవ ఆహారం లేదా ఒక పూట సాదా అన్నం. రోజుకు 6 సార్లు స్కంద షష్ఠి కవచం. 6వ రోజు సూరసంహారం వరకు నిర్జల ఉపవాసం.',
    fasting_rules_ta: 'ஆறு நாட்கள் தீவிர உபவாசம். தினசரி திரவ உணவு அல்லது ஒரு வேளை வெள்ளை சாதம். ஆறு முறை கந்த சஷ்டி கவசம். 6வது நாள் சூரசம்ஹாரம் வரை நிர்ஜல உபவாசம்.',
    fasting_rules_hi: 'छह दिनों का गहन उपवास। प्रतिदिन तरल या सादा चावल एकबार। रोज 6 बार स्कंद षष्ठी कवचम्। 6वें दिन सूरसंहारम् तक निर्जला।',
    benefits_en: 'Obliterates deep-seated external enemies, dissolves dark sorcery and generational curses, cures chronic blood-related diseases, and provides divine protection in legal battles.',
    benefits_te: 'శత్రువులను నాశనం చేస్తుంది, నల్ల మంత్రాలు, శాపాలు తొలగుతాయి, రక్త సంబంధిత దీర్ఘకాలిన వ్యాధులు నయమవుతాయి.',
    benefits_ta: 'எதிரிகள் நாசமாவார்கள். கரிய சக்திகள், சாபங்கள் நீங்கும். ரத்த சம்பந்தமான நோய்கள் குணமாகும்.',
    benefits_hi: 'शत्रु नष्ट होते हैं, काला जादू और अभिशाप हटता है, रक्त सम्बन्धी रोग ठीक होते हैं, न्यायिक विवादों में सुरक्षा मिलती है।',
    linked_story_slug: 'skanda-sashti-katha',
  },
  {
    slug: 'chhath-puja',
    title_en: 'Chhath Puja (Surya Shashti Vrat)', title_te: 'ఛత్ పూజ (సూర్య షష్ఠి వ్రతం)', title_ta: 'சத் பூஜை (சூர்ய சஷ்டி விரதம்)', title_hi: 'छठ पूजा (सूर्य षष्ठी व्रत)',
    deity_slug: 'surya',
    observance_day: 'Shukla Paksha Chaturthi–Sashti, Kartik',
    tithi: 'sashti', paksha: 'shukla',
    duration: '4 days (36-hour waterless fast)',
    next_occurrence: '', next_occurrence_note_en: 'Oct/Nov — 4 days in Kartik Shukla Paksha, peaking on Shashti',
    fasting_rules_en: '4-day ritual including 36-hour continuous waterless fast. Day 1: bathe in river, single pure meal. Day 2: fast all day, break at sunset with jaggery-kheer — then 36-hour nirjala begins. Days 3-4: arghya offerings to setting and rising sun while standing waist-deep in water.',
    fasting_rules_te: '4 రోజుల ఆచారం, 36 గంటల నిర్జల ఉపవాసం. 1వ రోజు: నదిలో స్నానం, ఒక సాత్విక భోజనం. 2వ రోజు: రోజంతా ఉపవాసం, సాయంత్రం బెల్లం ఖీర్ తిన్న తర్వాత 36 గంటల నిర్జల ఉపవాసం. 3-4 రోజులు: అస్తమించే, ఉదయించే సూర్యుడికి అర్ఘ్యం.',
    fasting_rules_ta: '4 நாட்கள் சடங்கு, 36 மணி நேர நிர்ஜல உபவாசம். நாள் 1: ஆற்றில் குளியல், ஒரு சுத்த உணவு. நாள் 2: நாள் முழுதும் உபவாசம், மாலையில் வெல்லம்-கீருடன் 36 மணி நேர நிர்ஜல தொடங்கும். நாள் 3-4: அஸ்தமிக்கும் மற்றும் உதிக்கும் சூர்யனுக்கு அர்க்யம்.',
    fasting_rules_hi: '4 दिन का अनुष्ठान, 36 घंटे का निर्जला उपवास। दिन 1: नदी स्नान, एक शुद्ध भोजन। दिन 2: सारे दिन उपवास, शाम को गुड़-खीर के बाद 36 घंटे का निर्जला शुरू। दिन 3-4: ढलते और उगते सूर्य को अर्घ्य।',
    benefits_en: 'Ensures structural health and longevity, eliminates chronic skin and eye disorders, bestows blessings for children, and aligns the devotee with the life-giving cosmic solar energy.',
    benefits_te: 'శారీరక ఆరోగ్యం, దీర్ఘాయువు, చర్మ వ్యాధుల నివారణ, సంతానం కలుగుతాయి. సూర్యుని జీవన శక్తి అనుగ్రహం పొందవచ్చు.',
    benefits_ta: 'உடல் ஆரோக்கியம், நீண்ட ஆயுள், தோல் நோய்கள் நீங்கும், குழந்தை பாக்கியம் கிட்டும்.',
    benefits_hi: 'शारीरिक स्वास्थ्य, दीर्घायु, त्वचा रोगों से मुक्ति, संतान प्राप्ति होती है। सूर्य की जीवनदायी ऊर्जा का आशीर्वाद मिलता है।',
    linked_story_slug: 'chhath-puja-katha',
  },
  {
    slug: 'sankashti-chaturthi-vratham',
    title_en: 'Sankashti Chaturthi Vratam', title_te: 'సంకష్టహర చతుర్థీ వ్రతం', title_ta: 'சங்கடஹர சதுர்த்தி விரதம்', title_hi: 'संकष्टी चतुर्थी व्रतम्',
    deity_slug: 'ganesha',
    observance_day: 'Krishna Paksha Chaturthi (every lunar month)',
    tithi: 'chaturthi', paksha: 'krishna',
    duration: '1 day (per month)',
    next_occurrence: '', next_occurrence_note_en: 'Monthly — Krishna Paksha Chaturthi every lunar month',
    fasting_rules_en: 'Monthly fast on Krishna Paksha Chaturthi. Take only fruits and milk until moonrise. The fast must be broken strictly after viewing the moon and offering arghya. Offer 21 durva bundles and 21 modaks — these are mandatory.',
    fasting_rules_te: 'ప్రతి నెలా కృష్ణ పక్ష చతుర్థి నాడు ఉపవాసం. చంద్రోదయం వరకు పండ్లు, పాలు మాత్రమే. చంద్ర దర్శనం, అర్ఘ్యం ఇచ్చిన తర్వాతే ఉపవాసం విరమించాలి. 21 దుర్వా, 21 మోదకాలు తప్పనిసరి.',
    fasting_rules_ta: 'ஒவ்வொரு மாதமும் கிருஷ்ண பக்ஷ சதுர்த்தியன்று உபவாசம். சந்திர உதயம் வரை பழங்கள், பால் மட்டும். நிலவை பார்த்து அர்க்யம் கொடுத்த பிறகே விரதம் முடிக்கலாம்.',
    fasting_rules_hi: 'हर माह कृष्ण पक्ष चतुर्थी को उपवास। चंद्रोदय तक फल-दूध। चंद्र दर्शन और अर्घ्य के बाद ही व्रत तोड़ें। 21 दूर्वा और 21 मोदक अनिवार्य।',
    benefits_en: 'Monthly obstacle removal — dissolves material blockages, financial difficulties, health crises, and family disputes. The Angarki Chaturthi (when it falls on Tuesday) is especially powerful for clearing debts.',
    benefits_te: 'నెలవారీ అడ్డంకులు తొలగుతాయి — ఆర్థిక సమస్యలు, ఆరోగ్య సంక్షోభాలు, కుటుంబ కలహాలు పరిష్కారమవుతాయి. అంగారకి చతుర్థి అప్పులు తీర్చడానికి ప్రత్యేకంగా శక్తివంతమైనది.',
    benefits_ta: 'மாதந்தோறும் தடைகள் நீங்கும். ஆர்திக சிக்கல்கள், உடல்நல நெருக்கடிகள், குடும்பக் கலவரங்கள் தீரும்.',
    benefits_hi: 'मासिक बाधाएं दूर होती हैं — आर्थिक मुश्किलें, स्वास्थ्य संकट, पारिवारिक विवाद हल होते हैं। अंगारकी चतुर्थी ऋण मुक्ति के लिए विशेष शक्तिशाली।',
    linked_story_slug: 'sankashti-chaturthi-katha',
  },
  {
    slug: 'savitri-vratham',
    title_en: 'Savitri Vratam (Vat Savitri Vrat)', title_te: 'సావిత్రీ వ్రతం (వట సావిత్రీ వ్రతం)', title_ta: 'சாவித்திரி விரதம் (வடி சாவித்திரி விரதம்)', title_hi: 'सावित्री व्रतम् (वट सावित्री व्रत)',
    deity_slug: 'vishnu',
    observance_day: 'Amavasya or Purnima in Jyeshtha month',
    tithi: 'amavasya', paksha: 'krishna',
    duration: '1 day',
    next_occurrence: '', next_occurrence_note_en: 'May/Jun — Amavasya or Purnima of Jyeshtha month (varies by region)',
    fasting_rules_en: 'One-day fast, ideally a three-day waterless fast (Triratra Vrat) in the lead-up. The ritual requires the physical presence of a Banyan tree. Women wrap raw white cotton thread around the trunk 7 or 108 times while circumambulating.',
    fasting_rules_te: 'ఒక రోజు ఉపవాసం, ఆదర్శంగా ముందు మూడు రోజులు నిర్జల ఉపవాసం. మర్రి చెట్టు ఉనికి తప్పనిసరి. 7 లేదా 108 సార్లు ముడిపడని తెల్లని దారం చుట్టాలి.',
    fasting_rules_ta: 'ஒரு நாள் உபவாசம், முன்பு மூன்று நாட்கள் நிர்ஜல உபவாசம் சிறந்தது. ஆலமரம் கட்டாயம். 7 அல்லது 108 முறை வெற்று பருத்தி நூல் சுற்றவும்.',
    fasting_rules_hi: 'एक दिन का उपवास, आदर्शतः पहले तीन दिन निर्जला। बरगद का पेड़ अनिवार्य। कच्चे सूत को 7 या 108 बार लपेटें।',
    benefits_en: 'Anchors the husband\'s lifespan to the immortal energy of the Banyan tree, protects against untimely death, and invokes the supreme devotion of Princess Savitri who outwitted the God of Death himself.',
    benefits_te: 'భర్త జీవితాన్ని మర్రి చెట్టు అమర శక్తికి అనుసంధానిస్తుంది, అకాల మృత్యువు నుండి కాపాడుతుంది, సావిత్రి యముని జయించిన దైవిక భక్తిని ఆహ్వానిస్తుంది.',
    benefits_ta: 'கணவனின் ஆயுளை ஆலமரத்தின் அமரத்துவ சக்தியுடன் இணைக்கிறது. அகால மரணம் தடுக்கப்படும். சாவித்திரியின் அபார பக்தியை உத்தேசித்து செய்யப்படுகிறது.',
    benefits_hi: 'पति की आयु को बरगद की अमर ऊर्जा से बांधता है, अकाल मृत्यु से रक्षा करता है, सावित्री की अपार भक्ति का आह्वान करता है।',
    linked_story_slug: 'savitri-katha',
  },
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Get existing slugs
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'vrathams!A:A' });
  const existingSlugs = new Set((res.data.values ?? []).slice(1).map(r => r[0]));

  const newVrathams = VRATHAMS.filter(v => !existingSlugs.has(v.slug));
  if (!newVrathams.length) {
    console.log('ℹ All vrathams already present in sheet');
    return;
  }

  const rows = newVrathams.map(v => [
    v.slug,
    v.title_en, v.title_te, v.title_ta, v.title_hi,
    v.deity_slug,
    v.observance_day,
    v.tithi,
    v.paksha,
    v.duration,
    v.next_occurrence,
    v.next_occurrence_note_en,
    v.fasting_rules_en, v.fasting_rules_te, v.fasting_rules_ta, v.fasting_rules_hi,
    v.benefits_en, v.benefits_te, v.benefits_ta, v.benefits_hi,
    '',                      // linked_puja_slug
    v.linked_story_slug,
    'published',
    'multilingual',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'vrathams',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  console.log(`✓ Added ${rows.length} vrathams: ${newVrathams.map(v => v.slug).join(', ')}`);
  console.log('\nDone.');
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
