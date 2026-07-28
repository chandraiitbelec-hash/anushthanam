/**
 * Seeds a small vetted set of starter pujas into the Google Sheet.
 *
 * Writes to: pujas, material_items, procedure_steps, god_links
 *
 * Usage:
 *   node scripts/upload-starter-pujas.mjs          (dry run — default)
 *   node scripts/upload-starter-pujas.mjs --write  (apply)
 *
 * Safety: refuses to write if any target slug already exists in that tab.
 * Append-only; never overwrites existing rows.
 *
 * FLAGS (items needing user review before publishing):
 *   [FLAG-1] Satyanarayana prasad recipe varies by region — both noted in prasad fields.
 *   [FLAG-2] Satyanarayana Katha (5-chapter story) not yet in stories_index — step 7
 *             currently links to no story; add a story slug once authored.
 *   [FLAG-3] Full priest-led puja involves Vedic mantras (Punyahavachana etc.) beyond
 *             the scope of this home guide. Steps describe the simplified home version.
 *   [FLAG-4] Saraswati Puja deity_slug is 'saraswati'. Vijayadasami varies by region
 *             (some celebrate as Golu/Bommai Kolu in TN, book-puja in AP/TG). Regional
 *             notes field covers this.
 *   [FLAG-5] Tamil translations authored from standard liturgical Tamil — should be
 *             reviewed by a native speaker before marking translation_status='complete'.
 */

import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');

// ─── Puja rows ────────────────────────────────────────────────────────────────
// Columns (in sheet order): slug | title_en | title_te | title_ta | title_hi |
//   deity_slug | occasion_type | duration_minutes | brief_description_en |
//   brief_description_te | brief_description_ta | brief_description_hi |
//   materials_group_slug | prasad_en | prasad_te | prasad_ta | prasad_hi |
//   regional_variation_notes_en | status | translation_status

const PUJAS = [
  {
    slug: 'satyanarayana-puja',
    title_en: 'Satyanarayana Puja',
    title_te: 'సత్యనారాయణ పూజ',
    title_ta: 'சத்தியநாராயண பூஜை',
    title_hi: 'सत्यनारायण पूजा',
    deity_slug: 'satyanarayana',
    occasion_type: 'monthly',
    duration_minutes: 90,
    brief_description_en: 'A widely observed home puja dedicated to Lord Satyanarayana — a benevolent, accessible form of Vishnu — performed on Purnima (full moon), Ekadashi, or any auspicious occasion. Done to seek blessings, fulfil vows, and express gratitude for prosperity.',
    brief_description_te: 'సత్యనారాయణ స్వామి (విష్ణువు యొక్క అనుగ్రహ రూపం)కి అంకితమైన వ్యాపక గృహ పూజ. పూర్ణిమ, ఏకాదశి లేదా ఏదైనా శుభ సందర్భంలో చేస్తారు. మనోకాంక్షలు నెరవేర్చుకోవడానికి మరియు కృతజ్ఞత తెలుపడానికి ఆచరిస్తారు.',
    brief_description_ta: 'விஷ்ணுவின் அருள் வடிவமான சத்தியநாராயண சுவாமிக்கு அர்ப்பணிக்கப்பட்ட பரவலான வீட்டு பூஜை. பூர்ணிமி, ஏகாதசி அல்லது எந்த சுபமான தருணத்திலும் செய்யப்படுகிறது.',
    brief_description_hi: 'भगवान सत्यनारायण (विष्णु के कृपालु रूप) को समर्पित व्यापक गृह पूजा। पूर्णिमा, एकादशी या किसी भी शुभ अवसर पर की जाती है। मनोकामना पूर्ति और कृतज्ञता के लिए आचरित।',
    materials_group_slug: 'satyanarayana-puja',
    // [FLAG-1] prasad varies by region
    prasad_en: 'Panchamrit (milk, curd, honey, ghee, sugar mixture) and sweet prasad — semolina (suji) halwa in North India, or banana and coconut in South India.',
    prasad_te: 'పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార) మరియు ప్రసాదం — దక్షిణాది: అరటి పండు, కొబ్బరికాయ; ఉత్తరాది: రవ్వ హల్వా.',
    prasad_ta: 'பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை) மற்றும் பிரசாதம் — வாழைப்பழம், தேங்காய் (தென்னிந்தியா) அல்லது ரவை அல்வா (வட இந்தியா).',
    prasad_hi: 'पंचामृत (दूध, दही, शहद, घी, चीनी) और प्रसाद — उत्तर भारत: सूजी का हलवा; दक्षिण भारत: केला और नारियल।',
    regional_variation_notes_en: 'North India: prasad is suji (semolina) halwa. South India (AP/TG/KA): banana, coconut, and sweet pongal. Coastal Andhra: panchamrit and tender coconut. Priests in some families read all five chapters of the Satyanarayana Katha; simplified home versions cover the core story.',
    status: 'published',
    translation_status: 'complete',
  },
  {
    slug: 'vinayaka-puja',
    title_en: 'Vinayaka Puja',
    title_te: 'వినాయక పూజ',
    title_ta: 'விநாயக பூஜை',
    title_hi: 'विनायक पूजा',
    deity_slug: 'ganesha',
    occasion_type: 'weekly',
    duration_minutes: 45,
    brief_description_en: 'Home puja for Lord Ganesha (Vinayaka), the remover of obstacles. Observed every Wednesday and at the start of any auspicious undertaking. An essential first puja before any major ritual in Hindu tradition.',
    brief_description_te: 'విఘ్నాలను తొలగించే గణేశుడికి (వినాయకుడికి) గృహ పూజ. ప్రతి బుధవారం మరియు ఏదైనా శుభ కార్యానికి ముందు ఆచరిస్తారు. హిందూ సంప్రదాయంలో ప్రతి ముఖ్యమైన కార్యానికి మొదటి పూజ.',
    brief_description_ta: 'தடைகளை நீக்கும் விநாயகருக்கு வீட்டு பூஜை. ஒவ்வொரு புதன்கிழமையும் மற்றும் எந்த சுபமான செயலின் தொடக்கத்திலும் செய்யப்படுகிறது.',
    brief_description_hi: 'विघ्नों को हरने वाले भगवान गणेश (विनायक) के लिए गृह पूजा। प्रत्येक बुधवार और किसी भी शुभ कार्य के आरंभ में की जाती है।',
    materials_group_slug: 'vinayaka-puja',
    prasad_en: 'Modak (rice-flour steamed sweet), coconut pieces, and jaggery.',
    prasad_te: 'మోదకాలు (బియ్యప్పిండి తీపి), కొబ్బరికాయ ముక్కలు, బెల్లం.',
    prasad_ta: 'மோதகம் (அரிசி மாவு இனிப்பு), தேங்காய் துண்டுகள், வெல்லம்.',
    prasad_hi: 'मोदक (चावल के आटे की मिठाई), नारियल के टुकड़े, और गुड़।',
    regional_variation_notes_en: 'Tamil Nadu: kolukattai (steamed rice dumpling) is used instead of modak. In Ganesha Chaturthi, clay idols are used and later immersed. For weekly Wednesday puja, a permanent brass or stone idol is standard.',
    status: 'published',
    translation_status: 'complete',
  },
  {
    slug: 'lakshmi-puja',
    title_en: 'Lakshmi Puja',
    title_te: 'లక్ష్మీ పూజ',
    title_ta: 'லட்சுமி பூஜை',
    title_hi: 'लक्ष्मी पूजा',
    deity_slug: 'lakshmi',
    occasion_type: 'weekly',
    duration_minutes: 45,
    brief_description_en: 'Friday puja for Goddess Lakshmi, the deity of wealth, fortune, and prosperity. Observed to invite abundance, remove financial obstacles, and seek blessings for household welfare.',
    brief_description_te: 'సంపద, అదృష్టం, సౌభాగ్యానికి అధిదేవత లక్ష్మీమాతకు శుక్రవారపు పూజ. ఇంటిలో సమృద్ధి, ఆర్థిక అభ్యున్నతి కోసం ఆచరిస్తారు.',
    brief_description_ta: 'செல்வம், அதிர்ஷ்டம், செழிப்பின் தெய்வமான லட்சுமி தேவிக்கான வெள்ளிக்கிழமை பூஜை. குடும்ப நலன் மற்றும் வளத்திற்காக செய்யப்படுகிறது.',
    brief_description_hi: 'धन, वैभव और समृद्धि की देवी लक्ष्मीजी के लिए शुक्रवार की पूजा। घर में सुख-समृद्धि और आर्थिक उन्नति के लिए की जाती है।',
    materials_group_slug: 'lakshmi-puja',
    prasad_en: 'Sweet pongal (rice with jaggery), or kheer, or coconut and sugar.',
    prasad_te: 'తీపి పొంగలి (బియ్యం-బెల్లం), లేదా పాయసం, లేదా కొబ్బరి-పంచదార.',
    prasad_ta: 'சர்க்கரை பொங்கல் (அரிசி-வெல்லம்), அல்லது பாயசம், அல்லது தேங்காய்-சர்க்கரை.',
    prasad_hi: 'मीठा पोंगल (चावल-गुड़), या खीर, या नारियल और चीनी।',
    regional_variation_notes_en: 'In Tamil Nadu, Varalakshmi Vratham (the main Lakshmi festival) is celebrated on the second Friday of Shravana. The weekly Friday puja follows the same essentials. Lotus flowers are most auspicious; pink or white flowers acceptable.',
    status: 'published',
    translation_status: 'complete',
  },
  {
    slug: 'saraswati-puja',
    title_en: 'Saraswati Puja',
    title_te: 'సరస్వతీ పూజ',
    title_ta: 'சரஸ்வதி பூஜை',
    title_hi: 'सरस्वती पूजा',
    deity_slug: 'saraswati',
    occasion_type: 'festival-specific',
    duration_minutes: 60,
    brief_description_en: 'Puja for Goddess Saraswati, the deity of knowledge, learning, and arts. Performed especially on Saraswati Puja (Vijayadasami / Dussehra eve). Books, instruments, and tools are placed at the altar for blessing; children traditionally begin new lessons on this day (Vidyarambham).',
    brief_description_te: 'విద్య, జ్ఞానం, కళలకు అధిదేవత సరస్వతీమాతకు పూజ. విజయదశమి / దసరా రోజు విశేషంగా ఆచరిస్తారు. పుస్తకాలు, సంగీత వాయిద్యాలను పూజకు ఉంచుతారు. పిల్లలు ఈ రోజు విద్యారంభం చేస్తారు.',
    brief_description_ta: 'வித்தை, ஞானம், கலைகளின் தெய்வம் சரஸ்வதி தேவிக்கு பூஜை. விஜயதசமி / தசரா முதல் நாள் சிறப்பாக செய்யப்படுகிறது. புத்தகங்கள், இசைக்கருவிகளை பூஜைக்கு வைக்கின்றனர். குழந்தைகள் இந்நாளில் வித்யாரம்பம் செய்கின்றனர்.',
    brief_description_hi: 'ज्ञान, विद्या और कलाओं की देवी सरस्वती की पूजा। विजयादशमी / दशहरे के दिन विशेष रूप से की जाती है। पुस्तकें और वाद्य यंत्र पूजा में रखे जाते हैं। बच्चे इस दिन विद्यारंभ करते हैं।',
    materials_group_slug: 'saraswati-puja',
    prasad_en: 'Sweet rice or kheer, fruits, and white sugar candy.',
    prasad_te: 'తీపి అన్నం లేదా పాయసం, పళ్ళు, తెల్లని చక్కెర మిఠాయి.',
    prasad_ta: 'பால் பாயசம் அல்லது இனிப்பு அரிசி, பழங்கள், வெண்சர்க்கரை மிட்டாய்.',
    prasad_hi: 'मीठे चावल या खीर, फल, और सफेद मिठाई।',
    // [FLAG-4] regional notes
    regional_variation_notes_en: 'In Tamil Nadu the Golu (Bommai Kolu) display is set up for Navaratri; books are removed from display on Saraswati Puja day (9th day) and returned after Vidyarambham on the 10th. In AP/TG, Vidyarambham is the primary focus. In Bengal, Saraswati Puja is observed separately in Magha month (Jan-Feb).',
    status: 'published',
    translation_status: 'complete',
  },
];

// ─── Material Items ───────────────────────────────────────────────────────────
// Columns: group_slug | item_order | item_name_en | item_name_te | item_name_ta |
//   item_name_hi | quantity_en | is_optional | substitution_note_en

const MATERIAL_ITEMS = [
  // ── satyanarayana-puja ────────────────────────────────────────────────────
  { group_slug: 'satyanarayana-puja', item_order: 1, item_name_en: 'Satyanarayana idol or image', item_name_te: 'సత్యనారాయణ విగ్రహం లేదా పటం', item_name_ta: 'சத்தியநாராயண சுவாமி சிலை அல்லது படம்', item_name_hi: 'सत्यनारायण मूर्ति या चित्र', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 2, item_name_en: 'Plantain (banana) leaves', item_name_te: 'అరటి ఆకులు', item_name_ta: 'வாழை இலைகள்', item_name_hi: 'केले के पत्ते', quantity_en: '4–5', is_optional: 'FALSE', substitution_note_en: 'Use a clean metal tray if banana leaves unavailable' },
  { group_slug: 'satyanarayana-puja', item_order: 3, item_name_en: 'Bananas', item_name_te: 'అరటి పళ్ళు', item_name_ta: 'வாழைப்பழங்கள்', item_name_hi: 'केले', quantity_en: '1 bunch', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 4, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '2', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 5, item_name_en: 'Milk, curd, honey, ghee, sugar (for panchamrit)', item_name_te: 'పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార (పంచామృతానికి)', item_name_ta: 'பால், தயிர், தேன், நெய், சர்க்கரை (பஞ்சாமிர்தத்திற்கு)', item_name_hi: 'दूध, दही, शहद, घी, चीनी (पंचामृत के लिए)', quantity_en: 'small quantities each', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 6, item_name_en: 'Tulasi (holy basil) leaves', item_name_te: 'తులసి ఆకులు', item_name_ta: 'துளசி இலைகள்', item_name_hi: 'तुलसी पत्ते', quantity_en: 'small bunch', is_optional: 'FALSE', substitution_note_en: 'Highly recommended for Vishnu-form deities' },
  { group_slug: 'satyanarayana-puja', item_order: 7, item_name_en: 'Flowers (lotus or fragrant flowers)', item_name_te: 'పూలు (కమలం లేదా సువాసన పూలు)', item_name_ta: 'மலர்கள் (தாமரை அல்லது வாசனை மலர்கள்)', item_name_hi: 'फूल (कमल या सुगंधित फूल)', quantity_en: '1 bunch', is_optional: 'FALSE', substitution_note_en: 'Marigold or jasmine acceptable' },
  { group_slug: 'satyanarayana-puja', item_order: 8, item_name_en: 'Turmeric and kumkum', item_name_te: 'పసుపు, కుంకుమ', item_name_ta: 'மஞ்சள், குங்குமம்', item_name_hi: 'हल्दी, कुमकुम', quantity_en: 'small quantities', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 9, item_name_en: 'Betel leaves and areca nuts', item_name_te: 'తమలపాకులు, వక్కలు', item_name_ta: 'வெற்றிலை, பாக்கு', item_name_hi: 'पान के पत्ते, सुपारी', quantity_en: '5 sets', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 10, item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கற்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 11, item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 12, item_name_en: 'Sacred thread (kalava / mauli)', item_name_te: 'పవిత్ర దారం (కలావా)', item_name_ta: 'புனித நூல் (கலாவா)', item_name_hi: 'मौली (कलावा)', quantity_en: '1 roll', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'satyanarayana-puja', item_order: 13, item_name_en: 'Semolina or wheat flour (for prasad)', item_name_te: 'రవ్వ లేదా గోధుమ పిండి (ప్రసాదానికి)', item_name_ta: 'ரவை அல்லது கோதுமை மாவு (பிரசாதத்திற்கு)', item_name_hi: 'सूजी या गेहूं का आटा (प्रसाद के लिए)', quantity_en: '1 cup', is_optional: 'TRUE', substitution_note_en: 'North Indian variant; South India uses banana and coconut instead' },

  // ── vinayaka-puja ─────────────────────────────────────────────────────────
  { group_slug: 'vinayaka-puja', item_order: 1, item_name_en: 'Ganesha idol (clay or brass)', item_name_te: 'గణేశ విగ్రహం (మట్టి లేదా ఇత్తడి)', item_name_ta: 'கணேஷ் சிலை (மண் அல்லது பித்தளை)', item_name_hi: 'गणेश मूर्ति (मिट्टी या पीतल)', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 2, item_name_en: 'Durva grass', item_name_te: 'దూర్వా గడ్డి', item_name_ta: 'அருகம்புல்', item_name_hi: 'दूर्वा घास', quantity_en: '21 blades (in sets of 3)', is_optional: 'FALSE', substitution_note_en: 'Essential for Ganesha; no substitute' },
  { group_slug: 'vinayaka-puja', item_order: 3, item_name_en: 'Red hibiscus flowers', item_name_te: 'ఎర్ర మందారాలు', item_name_ta: 'சிவப்பு செம்பருத்தி மலர்கள்', item_name_hi: 'लाल गुड़हल के फूल', quantity_en: '21', is_optional: 'FALSE', substitution_note_en: 'Marigold or other red/orange flowers acceptable' },
  { group_slug: 'vinayaka-puja', item_order: 4, item_name_en: 'Modak (steamed sweet dumpling)', item_name_te: 'మోదకాలు', item_name_ta: 'மோதகம்', item_name_hi: 'मोदक', quantity_en: '5 or 21', is_optional: 'FALSE', substitution_note_en: 'Kolukattai in Tamil Nadu; store-bought modak acceptable' },
  { group_slug: 'vinayaka-puja', item_order: 5, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 6, item_name_en: 'Yellow or red flowers', item_name_te: 'పసుపు లేదా ఎర్ర పూలు', item_name_ta: 'மஞ்சள் அல்லது சிவப்பு மலர்கள்', item_name_hi: 'पीले या लाल फूल', quantity_en: '1 bunch', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 7, item_name_en: 'Turmeric and kumkum', item_name_te: 'పసుపు, కుంకుమ', item_name_ta: 'மஞ்சள், குங்குமம்', item_name_hi: 'हल्दी, कुमकुम', quantity_en: 'small quantities', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 8, item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கற்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 9, item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'vinayaka-puja', item_order: 10, item_name_en: 'Betel leaves and areca nuts', item_name_te: 'తమలపాకులు, వక్కలు', item_name_ta: 'வெற்றிலை, பாக்கு', item_name_hi: 'पान के पत्ते, सुपारी', quantity_en: '5 sets', is_optional: 'TRUE', substitution_note_en: '' },

  // ── lakshmi-puja ──────────────────────────────────────────────────────────
  { group_slug: 'lakshmi-puja', item_order: 1, item_name_en: 'Lakshmi idol or image', item_name_te: 'లక్ష్మీ విగ్రహం లేదా పటం', item_name_ta: 'லட்சுமி சிலை அல்லது படம்', item_name_hi: 'लक्ष्मी मूर्ति या चित्र', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 2, item_name_en: 'Lotus flowers (or pink/white flowers)', item_name_te: 'కమల పూలు (లేదా గులాబీ/తెల్లని పూలు)', item_name_ta: 'தாமரை மலர்கள் (அல்லது இளஞ்சிவப்பு/வெள்ளை மலர்கள்)', item_name_hi: 'कमल के फूल (या गुलाबी/सफेद फूल)', quantity_en: '1 bunch', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 3, item_name_en: 'Kumkum (vermilion)', item_name_te: 'కుంకుమ', item_name_ta: 'குங்குமம்', item_name_hi: 'कुमकुम (सिंदूर)', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: 'Kumkum is essential for Lakshmi puja' },
  { group_slug: 'lakshmi-puja', item_order: 4, item_name_en: 'Turmeric', item_name_te: 'పసుపు', item_name_ta: 'மஞ்சள்', item_name_hi: 'हल्दी', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 5, item_name_en: 'Coins (copper or silver)', item_name_te: 'నాణాలు (రాగి లేదా వెండి)', item_name_ta: 'நாணயங்கள் (செம்பு அல்லது வெள்ளி)', item_name_hi: 'सिक्के (तांबे या चांदी के)', quantity_en: 'a few', is_optional: 'FALSE', substitution_note_en: 'Placed in front of the idol as an offering of prosperity' },
  { group_slug: 'lakshmi-puja', item_order: 6, item_name_en: 'White rice', item_name_te: 'తెల్ల బియ్యం', item_name_ta: 'வெண் அரிசி', item_name_hi: 'सफेद चावल', quantity_en: 'small bowl', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 7, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 8, item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கற்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 9, item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 10, item_name_en: 'Oil lamp (diya)', item_name_te: 'దీపం', item_name_ta: 'விளக்கு', item_name_hi: 'दीया (दीपक)', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'lakshmi-puja', item_order: 11, item_name_en: 'Betel leaves and areca nuts', item_name_te: 'తమలపాకులు, వక్కలు', item_name_ta: 'வெற்றிலை, பாக்கு', item_name_hi: 'पान के पत्ते, सुपारी', quantity_en: '5 sets', is_optional: 'TRUE', substitution_note_en: '' },

  // ── saraswati-puja ────────────────────────────────────────────────────────
  { group_slug: 'saraswati-puja', item_order: 1, item_name_en: 'Saraswati idol or image', item_name_te: 'సరస్వతీ విగ్రహం లేదా పటం', item_name_ta: 'சரஸ்வதி சிலை அல்லது படம்', item_name_hi: 'सरस्वती मूर्ति या चित्र', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 2, item_name_en: 'Books and sacred texts (to bless)', item_name_te: 'పుస్తకాలు, వేదాలు (ఆశీర్వాదానికి)', item_name_ta: 'புத்தகங்கள், வேதங்கள் (ஆசீர்வாதத்திற்கு)', item_name_hi: 'पुस्तकें और ग्रंथ (आशीर्वाद के लिए)', quantity_en: 'as many as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 3, item_name_en: 'White jasmine flowers', item_name_te: 'తెల్లని మల్లె పూలు', item_name_ta: 'வெள்ளை மல்லிகை மலர்கள்', item_name_hi: 'सफेद चमेली के फूल', quantity_en: '1 bunch', is_optional: 'FALSE', substitution_note_en: 'White or light-coloured flowers preferred; marigold acceptable' },
  { group_slug: 'saraswati-puja', item_order: 4, item_name_en: 'White cloth for altar', item_name_te: 'వేదికకు తెల్లని వస్త్రం', item_name_ta: 'பூஜை பீடத்திற்கு வெண் துணி', item_name_hi: 'वेदी के लिए सफेद वस्त्र', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 5, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 6, item_name_en: 'Fruits', item_name_te: 'పళ్ళు', item_name_ta: 'பழங்கள்', item_name_hi: 'फल', quantity_en: 'assorted', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 7, item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கற்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 8, item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'saraswati-puja', item_order: 9, item_name_en: 'Musical instruments (optional, to bless)', item_name_te: 'సంగీత వాయిద్యాలు (ఐచ్ఛికం, ఆశీర్వాదానికి)', item_name_ta: 'இசைக்கருவிகள் (விருப்பத்திற்கு, ஆசீர்வாதத்திற்கு)', item_name_hi: 'वाद्य यंत्र (वैकल्पिक, आशीर्वाद के लिए)', quantity_en: 'any owned', is_optional: 'TRUE', substitution_note_en: 'Place at the altar to receive Saraswati\'s blessing' },
];

// ─── Procedure Steps ──────────────────────────────────────────────────────────
// Columns: parent_slug | parent_type | step_number | step_title_en | step_title_te |
//   step_title_ta | step_title_hi | instruction_en | instruction_te | instruction_ta |
//   instruction_hi | recite_shloka_slug | recite_stanza_range | notes_en

const PROCEDURE_STEPS = [
  // ── satyanarayana-puja ────────────────────────────────────────────────────
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 1,
    step_title_en: 'Sankalp (Resolve & Intention)',
    step_title_te: 'సంకల్పం', step_title_ta: 'சங்கல்பம்', step_title_hi: 'संकल्प',
    instruction_en: 'Clean the puja area and lay out a fresh cloth. Take water in the right palm (Achamana) and state your intention aloud: your name, gotra (lineage if known), the occasion (e.g., Purnima), and purpose — gratitude, fulfilment of a vow, or seeking a specific blessing.',
    instruction_te: 'పూజ స్థలాన్ని శుభ్రపరిచి, తాజా వస్త్రం పరవండి. కుడి అరచేతిలో నీళ్ళు తీసుకొని మీ పేరు, గోత్రం, సందర్భం (పూర్ణిమ మొ.) మరియు ఉద్దేశ్యాన్ని స్పష్టంగా చెప్పండి.',
    instruction_ta: 'பூஜை இடத்தை சுத்தப்படுத்தி, புதிய துணி விரிக்கவும். வலது உள்ளங்கையில் நீர் எடுத்து உங்கள் பெயர், கோத்திரம், சந்தர்ப்பம் மற்றும் நோக்கத்தை தெளிவாக கூறவும்.',
    instruction_hi: 'पूजा स्थल को साफ करके नया वस्त्र बिछाएं। दाहिने हाथ में जल लेकर अपना नाम, गोत्र, अवसर और उद्देश्य (कृतज्ञता, मनोकामना, व्रत-पूर्ति) स्पष्ट रूप से बोलें।',
    recite_shloka_slug: '', recite_stanza_range: '',
    notes_en: 'If gotra is unknown, use "Kashyapa" as a common default.',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 2,
    step_title_en: 'Ganesha Invocation (Ganapati Puja)',
    step_title_te: 'గణపతి పూజ', step_title_ta: 'கணபதி பூஜை', step_title_hi: 'गणपति पूजा',
    instruction_en: 'Begin every puja by invoking Lord Ganesha to remove obstacles. Offer durva grass blades, red flowers, and a coconut. Chant "Om Gam Ganapataye Namaha" 21 times or recite the Ganesha Ashtothram.',
    instruction_te: '"ఓం గం గణపతయే నమః" 21 సార్లు జపిస్తూ దూర్వా గడ్డి, ఎర్ర పూలు, కొబ్బరికాయ అర్పించి విఘ్నేశ్వరుని ఆహ్వానించండి.',
    instruction_ta: '"ஓம் கம் கணபதயே நமஹ" 21 முறை சொல்லி அருகம்புல், சிவப்பு மலர்கள், தேங்காய் அர்ப்பணித்து கணபதியை ஆவாஹனம் செய்யுங்கள்.',
    instruction_hi: '"ओम गम गणपतये नमः" 21 बार जपते हुए दूर्वा, लाल फूल और नारियल अर्पित करके गणेश जी का आह्वान करें।',
    recite_shloka_slug: 'ganesha-ashtothram', recite_stanza_range: '',
    notes_en: '',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 3,
    step_title_en: 'Kalash Sthapana (Sacred Pot Setup)',
    step_title_te: 'కళశ స్థాపన', step_title_ta: 'கலசம் வைத்தல்', step_title_hi: 'कलश स्थापना',
    instruction_en: 'Fill a copper or brass pot (kalash) with water, place 5 mango leaves around its rim, and place a coconut on top. Tie a sacred thread (kalava) around the pot. Place banana leaves in front for offerings. This kalash represents the deity\'s presence and all five elements.',
    instruction_te: 'రాగి లేదా ఇత్తడి కళశంలో నీళ్ళు నింపి, 5 మామిడి ఆకులు పెట్టి, నినాపై కొబ్బరికాయ ఉంచండి. కళశానికి పవిత్ర దారం కట్టండి. ముందు అరటి ఆకులు పరవండి. ఈ కళశం అన్ని పంచభూతాలను ప్రతిష్టిస్తుంది.',
    instruction_ta: 'செம்பு அல்லது பித்தளை கலசத்தில் நீர் நிரப்பி, 5 மாவிலை வைத்து, மேல் தேங்காய் வையுங்கள். கலசத்தை புனித நூலால் கட்டவும். முன்னால் வாழை இலை விரிக்கவும்.',
    instruction_hi: 'तांबे या पीतल के कलश में जल भरें, 5 आम के पत्ते लगाएं, ऊपर नारियल रखें। कलश पर मौली बांधें। सामने केले के पत्ते बिछाएं।',
    recite_shloka_slug: '', recite_stanza_range: '',
    notes_en: 'If a kalash is unavailable, a clean steel cup with mango leaves is acceptable.',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 4,
    step_title_en: 'Pranapratishtha & Panchopachara',
    step_title_te: 'ప్రాణప్రతిష్ఠ & పంచోపచారం', step_title_ta: 'பிராணப்பிரதிஷ்டா & பஞ்சோபசாரம்', step_title_hi: 'प्राणप्रतिष्ठा और पंचोपचार',
    instruction_en: 'Invoke Lord Satyanarayana into the idol. Offer the five upachara (services): (1) Perfume/Gandha — apply sandalwood paste; (2) Flowers/Pushpa; (3) Incense/Dhupa; (4) Lamp/Deepa; (5) Food/Naivedhya — offer the panchamrit first, then fruits and other food.',
    instruction_te: 'విగ్రహంలో సత్యనారాయణ స్వామిని ఆవాహన చేయండి. పంచోపచారాలు అర్పించండి: (1) గంధం; (2) పుష్పాలు; (3) ధూపం; (4) దీపం; (5) నైవేద్యం — మొదట పంచామృతం, తరువాత పళ్ళు మరియు ఇతర ఆహారం.',
    instruction_ta: 'சத்தியநாராயண சுவாமியை சிலையில் ஆவாஹனம் செய்யுங்கள். பஞ்சோபசாரங்கள் அர்ப்பணிக்கவும்: (1) கந்தம்; (2) மலர்கள்; (3) தூபம்; (4) தீபம்; (5) நைவேத்தியம் — முதலில் பஞ்சாமிர்தம், பின்னர் பழங்கள்.',
    instruction_hi: 'सत्यनारायण जी को मूर्ति में आह्वान करें। पंचोपचार अर्पित करें: (1) गंध — चंदन; (2) पुष्प; (3) धूप; (4) दीप; (5) नैवेद्य — पहले पंचामृत, फिर फल और भोजन।',
    recite_shloka_slug: 'satyanarayana-ashtothram', recite_stanza_range: '',
    notes_en: '',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 5,
    step_title_en: 'Tulasi Archana',
    step_title_te: 'తులసి అర్చన', step_title_ta: 'துளசி அர்ச்சனை', step_title_hi: 'तुलसी अर्चन',
    instruction_en: 'Offer Tulasi (holy basil) leaves to the Lord, as Tulasi is especially dear to Vishnu. While offering each leaf, chant "Om Namo Narayanaya" or one name from the Ashtothram. Offer 108 leaves if time permits, or 21 at minimum.',
    instruction_te: '"ఓం నమో నారాయణాయ" లేదా అష్టోత్తర శత నామాలతో విష్ణువుకు అత్యంత ప్రియమైన తులసి ఆకులను అర్పించండి. సమయం ఉంటే 108, లేదా కనీసం 21 ఆకులు అర్పించండి.',
    instruction_ta: '"ஓம் நமோ நாராயணாய" அல்லது அஷ்டோத்திர நாமங்கள் சொல்லி, விஷ்ணுவுக்கு மிகவும் பிரியமான துளசி இலைகளை அர்ப்பணிக்கவும்.',
    instruction_hi: '"ओम नमो नारायणाय" या अष्टोत्तर के नाम जपते हुए तुलसी पत्ते अर्पित करें। 108 या कम से कम 21 पत्ते।',
    recite_shloka_slug: 'satyanarayana-ashtothram', recite_stanza_range: '',
    notes_en: '',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 6,
    step_title_en: 'Satyanarayana Katha (Story Reading)',
    step_title_te: 'సత్యనారాయణ వ్రత కథ', step_title_ta: 'சத்தியநாராயண விரத கதை', step_title_hi: 'सत्यनारायण व्रत कथा',
    // [FLAG-2] katha not yet in stories_index
    instruction_en: 'Read or listen to the Satyanarayana Vrata Katha aloud. The katha (from Skanda Purana, Revā Khaṇḍa) consists of five chapters describing the significance and stories of the puja. All family members present should listen attentively. This is the central part of the puja.',
    instruction_te: 'స్కంద పురాణం రేవా ఖండం నుండి సత్యనారాయణ వ్రత కథను పఠించండి లేదా వినండి. ఐదు అధ్యాయాలు. కుటుంబ సభ్యులందరూ శ్రద్ధగా వినాలి.',
    instruction_ta: 'ஸ்கந்த புராண ரேவா காண்டத்திலிருந்து சத்தியநாராயண விரத கதையை படியுங்கள் அல்லது கேளுங்கள். ஐந்து அத்தியாயங்கள். குடும்ப உறுப்பினர்கள் அனைவரும் கவனமாகக் கேட்க வேண்டும்.',
    instruction_hi: 'स्कन्द पुराण के रेवा खण्ड से सत्यनारायण व्रत कथा पढ़ें या सुनें। पाँच अध्याय। सभी परिवार के सदस्य ध्यानपूर्वक सुनें।',
    recite_shloka_slug: '', recite_stanza_range: '',
    notes_en: '[FLAG-2] Satyanarayana Katha not yet in stories_index. Add a story slug here once authored.',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 7,
    step_title_en: 'Aarti',
    step_title_te: 'ఆరతి', step_title_ta: 'ஆரத்தி', step_title_hi: 'आरती',
    instruction_en: 'Perform aarti with a camphor lamp or oil lamp, waving it in a clockwise circular motion before the Lord. Sing the Satyanarayana Aarti. After aarti, distribute tirtha (sacred water from the kalash) to all present.',
    instruction_te: 'కర్పూర దీపం లేదా నూనె దీపంతో ఆరతి ఇవ్వండి. సత్యనారాయణ స్వామి ఆరతి పాటను పాడండి. ఆరతి అనంతరం కళశ తీర్థాన్ని అందరికీ పంచండి.',
    instruction_ta: 'கற்பூர விளக்கு அல்லது எண்ணெய் விளக்கால் ஆரத்தி எடுங்கள். சத்தியநாராயண ஆரத்தி பாடுங்கள். ஆரத்திக்குப் பின் கலச தீர்த்தம் அனைவருக்கும் வழங்குங்கள்.',
    instruction_hi: 'कपूर दीप या तेल दीप से आरती करें। सत्यनारायण जी की आरती गाएं। आरती के बाद कलश तीर्थ सभी को दें।',
    recite_shloka_slug: '', recite_stanza_range: '',
    notes_en: '',
  },
  {
    parent_slug: 'satyanarayana-puja', parent_type: 'puja', step_number: 8,
    step_title_en: 'Prasad Distribution',
    step_title_te: 'ప్రసాద వితరణ', step_title_ta: 'பிரசாத விநியோகம்', step_title_hi: 'प्रसाद वितरण',
    instruction_en: 'Offer the prepared prasad (panchamrit, sweet, and fruits) to the Lord first, then distribute to all present. Prasad should not be refused; all who attended should receive it.',
    instruction_te: 'తయారు చేసిన ప్రసాదాన్ని (పంచామృతం, తీపి, పళ్ళు) మొదట భగవంతుడికి నివేదించండి, తరువాత అందరికీ పంచండి. ప్రసాదాన్ని నిరాకరించకూడదు.',
    instruction_ta: 'தயாரித்த பிரசாதத்தை (பஞ்சாமிர்தம், இனிப்பு, பழங்கள்) முதலில் பகவானுக்கு நைவேத்தியம் செய்து, பின் அனைவருக்கும் வழங்குங்கள்.',
    instruction_hi: 'तैयार प्रसाद (पंचामृत, मिठाई, फल) पहले भगवान को भोग लगाएं, फिर सभी को वितरित करें। प्रसाद का अस्वीकार न करें।',
    recite_shloka_slug: '', recite_stanza_range: '',
    notes_en: '',
  },

  // ── vinayaka-puja ─────────────────────────────────────────────────────────
  {
    parent_slug: 'vinayaka-puja', parent_type: 'puja', step_number: 1,
    step_title_en: 'Preparation and Cleaning',
    step_title_te: 'సన్నాహం మరియు శుద్ధి', step_title_ta: 'தயாரிப்பும் சுத்திகரிப்பும்', step_title_hi: 'तैयारी और शुद्धि',
    instruction_en: 'Clean the puja area. Place the Ganesha idol on a raised platform covered with a red cloth. Draw a kolam or rangoli. Arrange durva grass, red flowers, modak, and coconut. Light the oil lamp.',
    instruction_te: 'పూజ స్థలాన్ని శుభ్రపరచండి. ఎర్ర వస్త్రం పరచిన వేదికపై గణేశ విగ్రహాన్ని ఉంచండి. ముగ్గు వేయండి. దూర్వా గడ్డి, ఎర్ర పూలు, మోదకాలు, కొబ్బరికాయ సిద్ధం చేయండి. దీపం వెలిగించండి.',
    instruction_ta: 'பூஜை இடத்தை சுத்தம் செய்யுங்கள். சிவப்பு துணி விரித்த வேதிகையில் கணேஷ் சிலையை வையுங்கள். கோலம் போடுங்கள். அருகம்புல், சிவப்பு மலர்கள், மோதகம், தேங்காய் தயாரிக்கவும். விளக்கேற்றவும்.',
    instruction_hi: 'पूजा स्थल को साफ करें। लाल वस्त्र बिछाकर गणेश जी की मूर्ति रखें। रंगोली बनाएं। दूर्वा, लाल फूल, मोदक, नारियल तैयार करें। दीप जलाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'vinayaka-puja', parent_type: 'puja', step_number: 2,
    step_title_en: 'Invocation (Pranapratishtha)',
    step_title_te: 'ఆవాహనం (ప్రాణప్రతిష్ఠ)', step_title_ta: 'ஆவாஹனம் (பிராணப்பிரதிஷ்டா)', step_title_hi: 'आवाहन (प्राणप्रतिष्ठा)',
    instruction_en: 'Invoke the presence of Lord Ganesha in the idol. Chant "Om Gam Ganapataye Namaha" 108 times. Offer incense and light the camphor.',
    instruction_te: 'మంత్రాలతో విగ్రహంలో గణేశుని ఆహ్వానించండి. "ఓం గం గణపతయే నమః" 108 సార్లు జపించండి. ధూపం వేసి కర్పూరం వెలిగించండి.',
    instruction_ta: 'சிலையில் கணேஷை ஆவாஹனம் செய்யுங்கள். "ஓம் கம் கணபதயே நமஹ" 108 முறை ஜபிக்கவும். தூபம் காட்டி கற்பூரம் ஏற்றவும்.',
    instruction_hi: 'मंत्रों से प्राणप्रतिष्ठा करें। "ओम गम गणपतये नमः" 108 बार जपें। धूप जलाएं और कपूर जलाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'vinayaka-puja', parent_type: 'puja', step_number: 3,
    step_title_en: 'Durva Archana (Grass-blade Offering)',
    step_title_te: 'దూర్వా అర్చన', step_title_ta: 'துர்வா அர்ச்சனை', step_title_hi: 'दूर्वा अर्चन',
    instruction_en: 'Offer durva grass blades to Ganesha in sets of three (representing the three eyes or tri-shakti). Each set offered while chanting a name of Ganesha. Offer 21 sets minimum.',
    instruction_te: 'మూడేసి దూర్వా గడ్డి పోచలను (మూడు నేత్రాలు లేదా త్రిశక్తి ప్రతీకలు) గణేశుడికి అర్పించండి. ప్రతి సమర్పణకు ఒక నామం చెప్పండి. కనీసం 21 సమూహాలు.',
    instruction_ta: 'மூன்று மூன்றாக அருகம்புல் கட்டுகளை (மூன்று கண்கள் அல்லது திரிசக்தி குறியீடு) கணேஷுக்கு அர்ப்பணிக்கவும். ஒவ்வொரு சமர்ப்பணத்திலும் ஒரு நாமம் சொல்லவும்.',
    instruction_hi: 'दूर्वा घास की तीन-तीन की पुलिया में अर्पण करें। हर अर्पण पर एक नाम का जाप करें। न्यूनतम 21 पुलिया।',
    recite_shloka_slug: 'ganesha-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'vinayaka-puja', parent_type: 'puja', step_number: 4,
    step_title_en: 'Modak Offering and Aarti',
    step_title_te: 'మోదక సమర్పణ మరియు ఆరతి', step_title_ta: 'மோதகம் அர்ப்பணம் மற்றும் ஆரத்தி', step_title_hi: 'मोदक अर्पण और आरती',
    instruction_en: 'Place modak before the Lord as naivedyam. Offer coconut pieces and jaggery. Perform aarti with a camphor lamp, waving clockwise. Recite the Ganesha Chalisa or Aarti song.',
    instruction_te: 'నైవేద్యంగా మోదకాలు, కొబ్బరికాయ ముక్కలు, బెల్లం ఉంచండి. కర్పూర దీపంతో ఆరతి ఇవ్వండి. గణేశ చాలీసా లేదా ఆరతి పాడండి.',
    instruction_ta: 'நைவேத்தியமாக மோதகம், தேங்காய் துண்டுகள், வெல்லம் வையுங்கள். கற்பூர விளக்கால் ஆரத்தி எடுங்கள். கணேஷ் சாலீசா அல்லது ஆரத்தி பாடுங்கள்.',
    instruction_hi: 'नैवेद्य में मोदक, नारियल के टुकड़े और गुड़ रखें। कपूर दीप से आरती करें। गणेश चालीसा या आरती गाएं।',
    recite_shloka_slug: 'ganesh-chalisa', recite_stanza_range: '', notes_en: '',
  },

  // ── lakshmi-puja ──────────────────────────────────────────────────────────
  {
    parent_slug: 'lakshmi-puja', parent_type: 'puja', step_number: 1,
    step_title_en: 'Cleaning, Kolam, and Lamp Lighting',
    step_title_te: 'శుద్ధి, ముగ్గు మరియు దీప ప్రజ్వలన', step_title_ta: 'சுத்திகரிப்பு, கோலம் மற்றும் விளக்கேற்றல்', step_title_hi: 'सफाई, रंगोली और दीप प्रज्वलन',
    instruction_en: 'On Friday morning, clean the house thoroughly. Draw a kolam or rangoli at the entrance. Place the Lakshmi idol or image on a raised, clean cloth-covered platform. Light the oil lamp (ghee preferred for Lakshmi) and keep it burning throughout the puja.',
    instruction_te: 'శుక్రవారం ఉదయం ఇల్లు పరిశుభ్రంగా ఉంచండి. ముందు తలుపు దగ్గర ముగ్గు వేయండి. లక్ష్మీ విగ్రహాన్ని శుభ్రమైన వేదికపై ఉంచండి. నూనె (నెయ్యి ఉత్తమం) దీపం వెలిగించి పూజ అంతటా వెలిగేలా ఉంచండి.',
    instruction_ta: 'வெள்ளிக்கிழமை காலை வீட்டை நன்கு சுத்தப்படுத்துங்கள். வீட்டு வாசலில் கோலம் போடுங்கள். லட்சுமி சிலையை தூய்மையான பீடத்தில் வையுங்கள். நெய் விளக்கேற்றி பூஜை முழுவதும் எரிய விடுங்கள்.',
    instruction_hi: 'शुक्रवार की सुबह घर की अच्छी तरह सफाई करें। घर के प्रवेश द्वार पर रंगोली बनाएं। लक्ष्मी जी की मूर्ति या चित्र स्वच्छ वेदी पर रखें। घी का दीप जलाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'lakshmi-puja', parent_type: 'puja', step_number: 2,
    step_title_en: 'Ganesha Invocation',
    step_title_te: 'గణపతి ఆవాహనం', step_title_ta: 'கணபதி ஆவாஹனம்', step_title_hi: 'गणपति आवाहन',
    instruction_en: 'Begin with a brief Ganesha invocation: offer durva grass and chant "Om Gam Ganapataye Namaha" 21 times to ensure an obstacle-free puja.',
    instruction_te: 'దూర్వా గడ్డి అర్పించి "ఓం గం గణపతయే నమః" 21 సార్లు జపించి గణపతిని ఆహ్వానించండి.',
    instruction_ta: 'அருகம்புல் அர்ப்பணித்து "ஓம் கம் கணபதயே நமஹ" 21 முறை சொல்லி கணபதியை ஆவாஹனம் செய்யுங்கள்.',
    instruction_hi: '"ओम गम गणपतये नमः" 21 बार जपते हुए दूर्वा अर्पित करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'lakshmi-puja', parent_type: 'puja', step_number: 3,
    step_title_en: 'Kumkum Archana and Flower Offering',
    step_title_te: 'కుంకుమ అర్చన మరియు పుష్పార్పణ', step_title_ta: 'குங்குமம் அர்ச்சனை மற்றும் மலர் அர்ப்பணம்', step_title_hi: 'कुमकुम अर्चन और पुष्प अर्पण',
    instruction_en: 'Apply a small dot of kumkum to the idol. Offer lotus or pink flowers to the Goddess, one by one, chanting "Om Shri Mahalakshmyai Namaha" with each flower. Place coins in front of the idol as an offering of prosperity.',
    instruction_te: 'విగ్రహానికి కుంకుమ బొట్టు పెట్టండి. "ఓం శ్రీ మహాలక్ష్మ్యై నమః" అంటూ ఒక్కొక్క కమల పూలను అర్పించండి. నాణాలను విగ్రహం ముందు ఉంచండి.',
    instruction_ta: 'சிலைக்கு குங்குமம் இடுங்கள். "ஓம் ஸ்ரீ மஹாலட்சம்யை நமஹ" என்று சொல்லி ஒவ்வொரு தாமரை மலரையும் அர்ப்பணிக்கவும். நாணயங்களை சிலை முன் வையுங்கள்.',
    instruction_hi: 'मूर्ति पर कुमकुम लगाएं। "ओम श्री महालक्ष्म्यै नमः" कहते हुए एक-एक कमल का फूल अर्पित करें। मूर्ति के सामने सिक्के रखें।',
    recite_shloka_slug: 'lakshmi-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'lakshmi-puja', parent_type: 'puja', step_number: 4,
    step_title_en: 'Kanakadhara Stotram or Lakshmi Chalisa',
    step_title_te: 'కనకధారా స్తోత్రం లేదా లక్ష్మీ చాలీసా', step_title_ta: 'கனகதாரா ஸ்தோத்திரம் அல்லது லட்சுமி சாலீசா', step_title_hi: 'कनकधारा स्तोत्र या लक्ष्मी चालीसा',
    instruction_en: 'Recite the Kanakadhara Stotram (composed by Adi Shankaracharya) or the Lakshmi Chalisa. Alternatively, recite the Mahalakshmi Ashtakam.',
    instruction_te: 'కనకధారా స్తోత్రం (ఆది శంకరాచార్యుల రచన) లేదా లక్ష్మీ చాలీసా పఠించండి. ప్రత్యామ్నాయంగా మహాలక్ష్మీ అష్టకం పఠించవచ్చు.',
    instruction_ta: 'கனகதாரா ஸ்தோத்திரம் (ஆதி சங்கராச்சாரியார் இயற்றியது) அல்லது லட்சுமி சாலீசா ஓதுங்கள்.',
    instruction_hi: 'कनकधारा स्तोत्र (आदि शंकराचार्य रचित) या लक्ष्मी चालीसा का पाठ करें।',
    recite_shloka_slug: 'kanakadhara-stotram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'lakshmi-puja', parent_type: 'puja', step_number: 5,
    step_title_en: 'Aarti and Prasad',
    step_title_te: 'ఆరతి మరియు ప్రసాదం', step_title_ta: 'ஆரத்தியும் பிரசாதமும்', step_title_hi: 'आरती और प्रसाद',
    instruction_en: 'Perform the Lakshmi Aarti with a camphor or oil lamp, waving clockwise. Offer the sweet prasad to the Goddess. Distribute prasad and tirtha to all family members.',
    instruction_te: 'కర్పూర లేదా నూనె దీపంతో లక్ష్మీ ఆరతి ఇవ్వండి. తీపి ప్రసాదాన్ని నివేదించండి. అందరికీ ప్రసాదం, తీర్థం పంచండి.',
    instruction_ta: 'கற்பூர அல்லது நெய் விளக்கால் லட்சுமி ஆரத்தி எடுங்கள். இனிப்பு பிரசாதம் நைவேத்தியம் செய்யுங்கள். அனைவருக்கும் பிரசாதம் தீர்த்தம் வழங்குங்கள்.',
    instruction_hi: 'कपूर या तेल दीप से लक्ष्मी जी की आरती करें। मीठा प्रसाद भोग लगाएं। सभी को प्रसाद और तीर्थ दें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },

  // ── saraswati-puja ────────────────────────────────────────────────────────
  {
    parent_slug: 'saraswati-puja', parent_type: 'puja', step_number: 1,
    step_title_en: 'Book and Instrument Placement',
    step_title_te: 'పుస్తక-వాయిద్య సమర్పణ', step_title_ta: 'புத்தக-இசைக்கருவி வைத்தல்', step_title_hi: 'पुस्तक और वाद्य यंत्र रखना',
    instruction_en: 'Set up the Saraswati idol on a white cloth-covered platform. Place all books, musical instruments, pens, and tools at the altar to receive the Goddess\'s blessing. Do not use these items until after Vidyarambham the next day.',
    instruction_te: 'తెల్లని వస్త్రం పరచిన వేదికపై సరస్వతీ విగ్రహం ఉంచండి. పుస్తకాలు, సంగీత వాయిద్యాలు, కలాలు, పనిముట్లు అన్నింటినీ వేదికపై ఉంచండి. మరుసటి రోజు విద్యారంభం వరకు ఉపయోగించకండి.',
    instruction_ta: 'வெண் துணி விரித்த பீடத்தில் சரஸ்வதி சிலையை வையுங்கள். புத்தகங்கள், இசைக்கருவிகள், பேனாக்கள், கருவிகள் அனைத்தையும் பீடத்தில் வையுங்கள். மறுநாள் வித்யாரம்பம் வரை பயன்படுத்தாதீர்கள்.',
    instruction_hi: 'सफेद वस्त्र बिछाकर सरस्वती जी की मूर्ति रखें। पुस्तकें, वाद्य यंत्र, कलम और सभी कार्य-उपकरण वेदी पर रखें। अगले दिन विद्यारंभ तक इन्हें उपयोग न करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '[FLAG-4] Tamil Nadu: books placed on Golu display, not used for 9 days, then returned after Vidyarambham on Vijayadasami.',
  },
  {
    parent_slug: 'saraswati-puja', parent_type: 'puja', step_number: 2,
    step_title_en: 'Ganesha Invocation and Lamp Lighting',
    step_title_te: 'గణపతి ఆవాహనం మరియు దీప ప్రజ్వలన', step_title_ta: 'கணபதி ஆவாஹனம் மற்றும் விளக்கேற்றல்', step_title_hi: 'गणपति आवाहन और दीप प्रज्वलन',
    instruction_en: 'Light the oil lamp and offer brief prayers to Ganesha. Chant "Om Gam Ganapataye Namaha" 21 times, then invoke Goddess Saraswati: "Om Aim Saraswatyai Namaha."',
    instruction_te: 'దీపం వెలిగించి గణపతికి సంక్షిప్త ప్రార్థన చేయండి. "ఓం గం గణపతయే నమః" 21 సార్లు జపించి, తరువాత "ఓం ఐం సరస్వత్యై నమః" అంటూ సరస్వతీమాతను ఆహ్వానించండి.',
    instruction_ta: 'விளக்கேற்றி கணபதிக்கு சுருக்கமாக வணங்குங்கள். "ஓம் கம் கணபதயே நமஹ" 21 முறை சொல்லி, பின் "ஓம் ஐம் சரஸ்வத்யை நமஹ" என்று சரஸ்வதி தேவியை ஆவாஹனம் செய்யுங்கள்.',
    instruction_hi: 'दीप जलाकर गणेश जी की संक्षिप्त प्रार्थना करें। "ओम गम गणपतये नमः" 21 बार, फिर "ओम ऐम सरस्वत्यै नमः" से सरस्वती जी का आह्वान करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'saraswati-puja', parent_type: 'puja', step_number: 3,
    step_title_en: 'White Flower Offering and Ashtothram',
    step_title_te: 'తెల్లని పుష్పార్పణ మరియు అష్టోత్తరం', step_title_ta: 'வெள்ளை மலர் அர்ப்பணம் மற்றும் அஷ்டோத்திரம்', step_title_hi: 'सफेद पुष्प अर्पण और अष्टोत्तर',
    instruction_en: 'Offer white jasmine or other white/light-coloured flowers to the Goddess — white represents purity and knowledge. Recite the Saraswati Ashtothram (108 names), offering a flower or sprinkling akshata with each name.',
    instruction_te: 'సరస్వతీమాతకు తెల్లని మల్లె లేదా ఇతర తెల్లని/లేత రంగు పూలు అర్పించండి — తెలుపు పరిశుద్ధత, జ్ఞానానికి ప్రతీక. సరస్వతీ అష్టోత్తరశతనామావళి పఠించి, ప్రతి నామంతో ఒక పువ్వు లేదా అక్షతలు అర్పించండి.',
    instruction_ta: 'சரஸ்வதி தேவிக்கு வெள்ளை மல்லிகை அல்லது வெளிர் நிற மலர்கள் அர்ப்பணிக்கவும். சரஸ்வதி அஷ்டோத்திர சதநாமாவளி ஓதி, ஒவ்வொரு நாமத்திலும் ஒரு மலர் அல்லது அட்சதை தூவுங்கள்.',
    instruction_hi: 'देवी सरस्वती को सफेद चमेली या हल्के रंग के फूल अर्पित करें। सरस्वती अष्टोत्तर शतनामावली पढ़ें और हर नाम पर फूल या अक्षत चढ़ाएं।',
    recite_shloka_slug: 'saraswati-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'saraswati-puja', parent_type: 'puja', step_number: 4,
    step_title_en: 'Aarti and Prasad',
    step_title_te: 'ఆరతి మరియు ప్రసాదం', step_title_ta: 'ஆரத்தியும் பிரசாதமும்', step_title_hi: 'आरती और प्रसाद',
    instruction_en: 'Perform aarti with camphor. Offer sweet rice, fruits, and white sweets as prasad. Distribute to all family members.',
    instruction_te: 'కర్పూర ఆరతి ఇవ్వండి. తీపి అన్నం, పళ్ళు, తెల్లని మిఠాయి ప్రసాదంగా నివేదించి అందరికీ పంచండి.',
    instruction_ta: 'கற்பூர ஆரத்தி எடுங்கள். இனிப்பு அரிசி, பழங்கள், வெண் மிட்டாய் பிரசாதம் நைவேத்தியம் செய்து அனைவருக்கும் வழங்குங்கள்.',
    instruction_hi: 'कपूर से आरती करें। मीठे चावल, फल और सफेद मिठाई का भोग लगाएं और सभी को प्रसाद दें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'saraswati-puja', parent_type: 'puja', step_number: 5,
    step_title_en: 'Vidyarambham (New Beginning of Learning)',
    step_title_te: 'విద్యారంభం', step_title_ta: 'வித்யாரம்பம்', step_title_hi: 'विद्यारंभ',
    instruction_en: 'On Vijayadasami (the day after the puja), children and adults may perform Vidyarambham — the auspicious start of a new area of learning. Trace "Hari Shri Ganapathaye Namah" in a tray of rice or sand, or write in a new book. Recite the first verse of a chosen text or lesson.',
    instruction_te: 'విజయదశమి రోజు (పూజ మర్నాడు) పిల్లలు మరియు పెద్దలు విద్యారంభం చేయవచ్చు. బియ్యం పళ్ళెంలో లేదా ఇసుకలో "హరి శ్రీ గణపతయే నమః" రాయండి, లేదా కొత్త పుస్తకంలో రాయండి. ఎంచుకున్న గ్రంధం యొక్క మొదటి శ్లోకాన్ని పఠించండి.',
    instruction_ta: 'விஜயதசமி நாளில் (பூஜை மறுநாள்) குழந்தைகள் மற்றும் பெரியவர்கள் வித்யாரம்பம் செய்யலாம். அரிசி தட்டில் அல்லது மணலில் "ஹரி ஸ்ரீ கணபதயே நமஹ" எழுதுங்கள், அல்லது புதிய புத்தகத்தில் எழுதுங்கள்.',
    instruction_hi: 'विजयादशमी के दिन (पूजा के अगले दिन) बच्चे और बड़े विद्यारंभ कर सकते हैं। चावल की थाली या रेत में "हरि श्री गणपतये नमः" लिखें, या नई पुस्तक में लिखें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
];

// ─── God Links ────────────────────────────────────────────────────────────────
// Columns: god_slug | entity_type | entity_slug | display_order

const GOD_LINKS = [
  { god_slug: 'satyanarayana', entity_type: 'puja', entity_slug: 'satyanarayana-puja', display_order: 1 },
  { god_slug: 'ganesha',       entity_type: 'puja', entity_slug: 'vinayaka-puja',       display_order: 1 },
  { god_slug: 'lakshmi',       entity_type: 'puja', entity_slug: 'lakshmi-puja',        display_order: 1 },
  { god_slug: 'saraswati',     entity_type: 'puja', entity_slug: 'saraswati-puja',      display_order: 1 },
];

// ─── Sheet connection ─────────────────────────────────────────────────────────

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

async function getColumnValues(tab, col) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!${col}:${col}`,
  });
  return (res.data.values || []).flat();
}

// ─── Dry-run report ───────────────────────────────────────────────────────────

console.log('\n══ upload-starter-pujas.mjs ══════════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

// Check for existing rows
const existingPujas    = (await getColumnValues('pujas', 'A')).slice(1);
const existingMats     = (await getColumnValues('material_items', 'A')).slice(1);
const existingSteps    = (await getColumnValues('procedure_steps', 'A')).slice(1);
const existingLinks    = (await getColumnValues('god_links', 'C')).slice(1); // entity_slug col

const newPujas  = PUJAS.filter(p => !existingPujas.includes(p.slug));
const newMats   = MATERIAL_ITEMS.filter(m => !existingMats.includes(m.group_slug));
const newSteps  = PROCEDURE_STEPS.filter(s => !existingSteps.includes(s.parent_slug));
const newLinks  = GOD_LINKS.filter(l => !existingLinks.includes(l.entity_slug));

console.log('\n─── Pujas ────────────────────────────────────────────────────');
PUJAS.forEach(p => {
  const exists = existingPujas.includes(p.slug);
  console.log(`  ${exists ? '⏭  SKIP (exists)' : '➕ NEW           '} ${p.slug}`);
});

console.log('\n─── Material Items ───────────────────────────────────────────');
const matGroups = [...new Set(MATERIAL_ITEMS.map(m => m.group_slug))];
matGroups.forEach(g => {
  const exists = existingMats.includes(g);
  const count  = MATERIAL_ITEMS.filter(m => m.group_slug === g).length;
  console.log(`  ${exists ? '⏭  SKIP (exists)' : '➕ NEW           '} ${g}  (${count} items)`);
});

console.log('\n─── Procedure Steps ──────────────────────────────────────────');
const stepParents = [...new Set(PROCEDURE_STEPS.map(s => s.parent_slug))];
stepParents.forEach(p => {
  const exists = existingSteps.includes(p);
  const count  = PROCEDURE_STEPS.filter(s => s.parent_slug === p).length;
  console.log(`  ${exists ? '⏭  SKIP (exists)' : '➕ NEW           '} ${p}  (${count} steps)`);
});

console.log('\n─── God Links ────────────────────────────────────────────────');
GOD_LINKS.forEach(l => {
  const exists = existingLinks.includes(l.entity_slug);
  console.log(`  ${exists ? '⏭  SKIP (exists)' : '➕ NEW           '} ${l.god_slug} → puja/${l.entity_slug}`);
});

console.log('\n─── Summary ──────────────────────────────────────────────────');
console.log(`  Pujas:           ${newPujas.length} new / ${PUJAS.length - newPujas.length} skipped`);
console.log(`  Material groups: ${[...new Set(newMats.map(m=>m.group_slug))].length} new / ${matGroups.length - [...new Set(newMats.map(m=>m.group_slug))].length} skipped`);
console.log(`  Material items:  ${newMats.length} rows`);
console.log(`  Procedure steps: ${newSteps.length} rows`);
console.log(`  God links:       ${newLinks.length} new`);

// ─── FLAGS ────────────────────────────────────────────────────────────────────
console.log('\n─── FLAGS for user review ────────────────────────────────────');
console.log('  [FLAG-1] Satyanarayana prasad recipe differs by region (noted in prasad fields).');
console.log('  [FLAG-2] Satyanarayana Katha (5-chapter story) not yet in stories_index.');
console.log('           Step 6 notes: "add a story slug here once authored."');
console.log('  [FLAG-3] Procedure steps describe simplified home version — not full Vedic puja.');
console.log('  [FLAG-4] Saraswati Puja regional variation (Golu vs. book-puja) noted in step 1');
console.log('           and regional_variation_notes_en.');
console.log('  [FLAG-5] Tamil translations should be reviewed by a native Tamil speaker.');

if (!WRITE) {
  console.log('\nDry run complete. No changes written. Re-run with --write to apply.');
  process.exit(0);
}

// ─── Write ────────────────────────────────────────────────────────────────────

// Refuse if any slug already exists (safety guard — append-only)
if (newPujas.length < PUJAS.length) {
  const skipped = PUJAS.filter(p => existingPujas.includes(p.slug)).map(p => p.slug);
  console.error(`\nRefusing to write: pujas already exist: ${skipped.join(', ')}`);
  console.error('Remove those entries from the script or clear the sheet rows first.');
  process.exit(1);
}

// Write pujas
const pujaRows = newPujas.map(p => [
  p.slug, p.title_en, p.title_te, p.title_ta, p.title_hi,
  p.deity_slug, p.occasion_type, p.duration_minutes,
  p.brief_description_en, p.brief_description_te, p.brief_description_ta, p.brief_description_hi,
  p.materials_group_slug,
  p.prasad_en, p.prasad_te, p.prasad_ta, p.prasad_hi,
  p.regional_variation_notes_en, p.status, p.translation_status,
]);
await sheets.spreadsheets.values.append({
  spreadsheetId: SHEET_ID, range: 'pujas!A1',
  valueInputOption: 'RAW', requestBody: { values: pujaRows },
});
console.log(`\n✓ Appended ${pujaRows.length} puja rows.`);

// Write material_items
const matRows = newMats.map(m => [
  m.group_slug, m.item_order,
  m.item_name_en, m.item_name_te, m.item_name_ta, m.item_name_hi,
  m.quantity_en, m.is_optional, m.substitution_note_en,
]);
if (matRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID, range: 'material_items!A1',
    valueInputOption: 'RAW', requestBody: { values: matRows },
  });
  console.log(`✓ Appended ${matRows.length} material_item rows.`);
}

// Write procedure_steps
const stepRows = newSteps.map(s => [
  s.parent_slug, s.parent_type, s.step_number,
  s.step_title_en, s.step_title_te, s.step_title_ta, s.step_title_hi,
  s.instruction_en, s.instruction_te, s.instruction_ta, s.instruction_hi,
  s.recite_shloka_slug, s.recite_stanza_range, s.notes_en,
]);
if (stepRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID, range: 'procedure_steps!A1',
    valueInputOption: 'RAW', requestBody: { values: stepRows },
  });
  console.log(`✓ Appended ${stepRows.length} procedure_step rows.`);
}

// Write god_links
const linkRows = newLinks.map(l => [
  l.god_slug, l.entity_type, l.entity_slug, l.display_order,
]);
if (linkRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID, range: 'god_links!A1',
    valueInputOption: 'RAW', requestBody: { values: linkRows },
  });
  console.log(`✓ Appended ${linkRows.length} god_link rows.`);
}

console.log('\nDone. Trigger a new deploy (push to GitHub or use Apps Script) to publish.');
