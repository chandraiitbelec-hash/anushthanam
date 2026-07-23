/**
 * Add more gods and festivals to the Google Sheets database.
 * Run: node scripts/populate-more-content.mjs
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

// ─── GODS ────────────────────────────────────────────────────────────────────
// Columns: slug | name_en | name_te | name_ta | name_hi | name_sa | alternate_names_en |
//          tradition | description_en | description_te | description_ta | description_hi |
//          iconography_en | illustration_filename | illustration_credit | image_drive_id |
//          status | translation_status

const NEW_GODS = [
  {
    slug: 'brahma',
    name_en: 'Brahma', name_te: 'బ్రహ్మ', name_ta: 'பிரம்மா', name_hi: 'ब्रह्मा',
    name_sa: 'Brahmā',
    alternate_names_en: 'Svayambhu, Virinchi, Pitamaha, Prajapati, Chaturmukha',
    tradition: 'smartha',
    description_en: 'Brahma is the creator deity of the Hindu Trimurti, responsible for the creation of the universe and all living beings. Born from the lotus that arose from Vishnu\'s navel, Brahma holds the Vedas in his four hands and is considered the source of all knowledge. Though rarely worshipped independently today, he remains foundational to Hindu cosmology as the architect of existence.',
    description_te: 'బ్రహ్మ హిందూ త్రిమూర్తులలో సృష్టికర్త. విష్ణువు నాభి నుండి ఉద్భవించిన పద్మం మీద ఆసీనుడై నాలుగు వేదాలను ధరిస్తాడు. బ్రహ్మాండ సృష్టికి మూల కారణం.',
    description_ta: 'பிரம்மா இந்து திரிமூர்த்தியில் படைப்புக் கடவுள். விஷ்ணுவின் நாபியிலிருந்து தோன்றிய தாமரையில் வீற்றிருந்து நான்கு வேதங்களை தரிக்கிறார். பிரபஞ்சத்தின் படைப்பாளர்.',
    description_hi: 'ब्रह्मा हिंदू त्रिमूर्ति में सृष्टिकर्ता देव हैं। विष्णु की नाभि से उत्पन्न कमल पर आसीन होकर चारों वेद धारण करते हैं। समस्त ब्रह्मांड की रचना के मूल कारण हैं।',
    iconography_en: 'Four faces (Chaturmukha) looking in all directions, four arms holding Vedas, a kamandalu (water pot), a rosary, and a sacrificial ladle. Rides a swan (hamsa). Red or golden complexion. Accompanied by Saraswati.',
  },
  {
    slug: 'kali',
    name_en: 'Kali', name_te: 'కాళి', name_ta: 'காளி', name_hi: 'काली',
    name_sa: 'Kālī',
    alternate_names_en: 'Mahakali, Bhadrakali, Chamunda, Kalika, Shyama, Dakshina Kali',
    tradition: 'shakta',
    description_en: 'Kali is the fierce goddess of time, death, and transformation — the most powerful manifestation of Shakti. She destroys ego and liberates souls from the cycle of birth and death. Despite her terrifying appearance, Kali is the ultimate loving mother who annihilates evil without hesitation. She is especially venerated in Bengal, Assam, and throughout South India.',
    description_te: 'కాళి కాలం, మరణం మరియు రూపాంతరం యొక్క భయంకర దేవత — శక్తి యొక్క అత్యంత శక్తివంతమైన అభివ్యక్తి. ఆమె అహంకారాన్ని నాశనం చేసి ఆత్మలను మోక్షానికి చేర్చుతుంది. భయంకరమైన రూపం ఉన్నప్పటికీ, కాళి అంతిమ స్నేహపూర్వక తల్లి.',
    description_ta: 'காளி காலம், மரணம் மற்றும் உருமாற்றத்தின் கொடூரமான தேவி — சக்தியின் மிகவும் சக்திவாய்ந்த வெளிப்பாடு. அவள் அகந்தையை அழித்து ஆன்மாக்களை மோட்சத்திற்கு அழைத்துச் செல்கிறாள்.',
    description_hi: 'काली काल, मृत्यु और परिवर्तन की उग्र देवी हैं — शक्ति का सबसे शक्तिशाली रूप। वे अहंकार का नाश करके आत्माओं को मोक्ष दिलाती हैं। भयंकर रूप के बावजूद, काली परम स्नेहमयी माता हैं।',
    iconography_en: 'Dark or blue-black complexion, four arms: two holding a sword and severed head, two in abhaya and varada mudras. Protruding tongue, garland of skulls (mundamala), skirt of severed arms. Stands on a prone Shiva. Wild unbound hair.',
  },
  {
    slug: 'radha',
    name_en: 'Radha', name_te: 'రాధ', name_ta: 'ராதா', name_hi: 'राधा',
    name_sa: 'Rādhā',
    alternate_names_en: 'Radhika, Radharani, Vrindavaneshvari, Kishori, Hladini Shakti',
    tradition: 'vaishnava',
    description_en: 'Radha is the supreme goddess of the Vaishnava tradition and the eternal consort of Krishna. She represents the highest form of devotion (bhakti) and divine love. Her love for Krishna is considered the model of the soul\'s yearning for the Divine. In Vrindavan and among Gaudiya Vaishnavas, Radha is venerated even above Krishna as the embodiment of divine compassion.',
    description_te: 'రాధ వైష్ణవ సంప్రదాయంలో సర్వోన్నత దేవత మరియు కృష్ణుని శాశ్వత సహచరి. ఆమె అత్యున్నత భక్తి మరియు దైవిక ప్రేమను సూచిస్తుంది. ఆమె కృష్ణుని పట్ల ప్రేమ భగవంతుని పట్ల ఆత్మ యొక్క తపనకు నమూనా.',
    description_ta: 'ராதா வைஷ்ணவ மரபில் உச்ச தெய்வம் மற்றும் கிருஷ்ணரின் நித்திய துணைவி. அவள் உயர்ந்த பக்தி மற்றும் தெய்வீக அன்பை குறிக்கிறாள். கிருஷ்ணரின் மீதான அவளின் அன்பு ஆன்மாவின் இறைவனை நோக்கிய ஏக்கத்திற்கு முன்மாதிரி.',
    description_hi: 'राधा वैष्णव परंपरा में सर्वोच्च देवी और कृष्ण की शाश्वत संगिनी हैं। वे सर्वोच्च भक्ति और दिव्य प्रेम का प्रतीक हैं। कृष्ण के प्रति उनका प्रेम आत्मा की परमात्मा के प्रति तड़प का आदर्श है।',
    iconography_en: 'Golden complexion contrasting with Krishna\'s dark form. Dressed in red or yellow silk, adorned with jewels and peacock feathers. Always depicted with Krishna, playing the venu (flute) or in rasa-lila. Holds a lotus.',
  },
  {
    slug: 'sita',
    name_en: 'Sita', name_te: 'సీత', name_ta: 'சீதா', name_hi: 'सीता',
    name_sa: 'Sītā',
    alternate_names_en: 'Janaki, Maithili, Vaidehi, Bhoomija, Ramaa',
    tradition: 'vaishnava',
    description_en: 'Sita is the divine consort of Rama and the central heroine of the Ramayana. Born from the earth (hence Bhoomija), she is the embodiment of purity, patience, and wifely devotion. Her abduction by Ravana and rescue by Rama form the core of the epic. Sita is venerated across India as the ideal of feminine virtue and steadfast faith.',
    description_te: 'సీత రాముని దివ్య సహచరి మరియు రామాయణం యొక్క కేంద్ర నాయిక. భూమి నుండి జన్మించి (భూమిజ), స్వచ్ఛత, సహనం మరియు పాతివ్రత్యానికి ప్రతిరూపం. రావణుని చేత అపహరణ మరియు రాముని చేత విడుదల ఈ మహాకావ్యం యొక్క మూలం.',
    description_ta: 'சீதா இராமரின் தெய்வீக துணைவி மற்றும் இராமாயணத்தின் மைய நாயகி. பூமியிலிருந்து பிறந்தவள் (பூமிஜா), தூய்மை, பொறுமை மற்றும் கற்பின் உருவகம். இலங்கையில் இராவணனால் கடத்தல் மற்றும் இராமரால் மீட்பு இந்த காவியத்தின் மையம்.',
    description_hi: 'सीता राम की दिव्य संगिनी और रामायण की केंद्रीय नायिका हैं। पृथ्वी से जन्मीं (भूमिजा), वे पवित्रता, धैर्य और पातिव्रत्य की मूर्ति हैं। रावण द्वारा अपहरण और राम द्वारा उद्धार इस महाकाव्य का मूल है।',
    iconography_en: 'Golden complexion, dressed in a yellow or red sari. Always depicted alongside Rama — on his left, slightly shorter. Holds a lotus. Gentle, serene expression. Sometimes shown with Lakshmana during forest exile.',
  },
  {
    slug: 'kubera',
    name_en: 'Kubera', name_te: 'కుబేర', name_ta: 'குபேரன்', name_hi: 'कुबेर',
    name_sa: 'Kubera',
    alternate_names_en: 'Dhanapati, Yakshapati, Vaisravana, Nidheeshvara, Dhanadhipati',
    tradition: 'smartha',
    description_en: 'Kubera is the god of wealth, prosperity, and treasurer of the gods. He rules the Yakshas and guards the northern direction. Lord of Alaka, his celestial city, he distributes material wealth by divine dispensation. Kubera is invoked for financial well-being and is associated with Lakshmi. His blessings bring abundance but wisdom in wealth management.',
    description_te: 'కుబేర సంపద, సమృద్ధి మరియు దేవతల ఖజాంచి. యక్షులను పాలించి ఉత్తర దిక్కును రక్షిస్తాడు. అలకా నగరాన్ని పాలించి, భగవత్ సంకల్పం ద్వారా సంపదను పంపిణీ చేస్తాడు. ఆర్థిక సంపదకై కుబేరుని ఆరాధిస్తారు.',
    description_ta: 'குபேரன் செல்வம், செழிப்பு மற்றும் தேவர்களின் கஜாஞ்சி. யக்ஷர்களை ஆட்சி செய்து வடதிசையை காக்கிறார். அலகா நகரை ஆண்டு இறைவனின் ஆணைப்படி செல்வத்தை பகிர்கிறார்.',
    description_hi: 'कुबेर धन, समृद्धि और देवताओं के कोषाध्यक्ष हैं। यक्षों के स्वामी और उत्तर दिशा के रक्षक। अलका नगर के अधिपति, वे दिव्य विधान से धन वितरित करते हैं। आर्थिक समृद्धि के लिए कुबेर की पूजा होती है।',
    iconography_en: 'Stout, pot-bellied figure with light complexion. Holds a money pot (nidhi) or mongoose spitting jewels, a club, and a pomegranate. Rides a chariot or elephant. Wears royal ornaments. One eye is sometimes depicted smaller.',
  },
  {
    slug: 'bhairava',
    name_en: 'Bhairava', name_te: 'భైరవ', name_ta: 'பைரவர்', name_hi: 'भैरव',
    name_sa: 'Bhairava',
    alternate_names_en: 'Kala Bhairava, Ashta Bhairava, Bhairavi, Kshetrapala, Dandapani',
    tradition: 'shaiva',
    description_en: 'Bhairava is the fierce and terrifying manifestation of Shiva associated with annihilation and the ultimate reality beyond time. The eight Bhairavas (Ashta Bhairava) guard the eight directions. Kala Bhairava, the most prominent form, is the lord of time and the guardian deity of Varanasi. Dogs are sacred to him. He tests devotees and grants liberation to sincere seekers.',
    description_te: 'భైరవ శివుని భయంకర రూపం — కాలం మరియు కాలాతీతమైన వాస్తవికతతో సంబంధం కలిగి ఉంటాడు. అష్ట భైరవులు ఎనిమిది దిక్కులను రక్షిస్తారు. కాల భైరవ కాశీ నగర అధిష్ఠాన దేవత. శ్వానాలు ఆయనకు పవిత్రమైనవి.',
    description_ta: 'பைரவர் சிவனின் கொடூரமான வடிவம் — காலம் மற்றும் கால வெளியே உள்ள பரம உண்மையுடன் தொடர்புடையவர். அஷ்ட பைரவர்கள் எட்டு திசைகளை காக்கிறார்கள். காலபைரவர் வாரணாசியின் தலைமை தெய்வம். நாய்கள் அவருக்கு புனிதமானவை.',
    description_hi: 'भैरव शिव का उग्र रूप हैं — काल और काल से परे की सत्ता से संबद्ध। अष्ट भैरव आठ दिशाओं की रक्षा करते हैं। काल भैरव काशी के अधिष्ठाता देव हैं। श्वान उनके प्रिय वाहन हैं।',
    iconography_en: 'Dark complexion, fierce expression with three eyes and protruding fangs. Four arms holding trident, drum, noose, and skull-cup. Adorned with serpents and skulls. Dog (Shvana) as vehicle. Kala Bhairava holds a severed head.',
  },
  {
    slug: 'kartikeya',
    name_en: 'Kartikeya', name_te: 'కార్తికేయ', name_ta: 'கார்த்திகேயன்', name_hi: 'कार्तिकेय',
    name_sa: 'Kārttikeya',
    alternate_names_en: 'Murugan, Skanda, Shanmukha, Kumara, Subramanya, Guha, Velayudhan',
    tradition: 'kaumara',
    description_en: 'Kartikeya is the god of war, victory, and wisdom — son of Shiva and Parvati, and commander of the divine army. Known as Murugan in Tamil tradition, he is the supreme deity of the Tamils and one of the most widely worshipped gods in South India and among the Tamil diaspora worldwide. He defeated the asura Soorapadman and restored order to the cosmos.',
    description_te: 'కార్తికేయ యుద్ధం, విజయం మరియు జ్ఞానం యొక్క దేవత — శివ పార్వతుల పుత్రుడు, దేవసేన అధిపతి. తమిళ సంప్రదాయంలో మురుగన్ గా పరిచితుడు. సూరపద్మాసురుని సంహరించి విశ్వంలో శాంతిని నెలకొల్పాడు.',
    description_ta: 'கார்த்திகேயன் போர், வெற்றி மற்றும் ஞானத்தின் கடவுள் — சிவன் மற்றும் பார்வதியின் புதல்வன், தேவசேனாபதி. தமிழ் மரபில் முருகன் என அழைக்கப்படும் இவர் தமிழர்களின் தலைமை தெய்வம். சூரபத்மனை அழித்து பிரபஞ்சத்தில் அமைதியை நிலைநாட்டினார்.',
    description_hi: 'कार्तिकेय युद्ध, विजय और ज्ञान के देवता हैं — शिव-पार्वती के पुत्र और देवसेना के सेनापति। तमिल परंपरा में मुरुगन के नाम से प्रसिद्ध, वे दक्षिण भारत के सर्वाधिक पूजित देवताओं में हैं। सूरपद्म का संहार कर ब्रह्मांड में शांति स्थापित की।',
    iconography_en: 'Youthful, handsome form with six faces (Shanmukha) or one face. Rides a peacock (Mayura). Carries a vel (spear/lance) — his primary weapon. Two or twelve arms. Accompanied by his consorts Devasena and Valli.',
  },
  {
    slug: 'indra',
    name_en: 'Indra', name_te: 'ఇంద్ర', name_ta: 'இந்திரன்', name_hi: 'इंद्र',
    name_sa: 'Indra',
    alternate_names_en: 'Devendra, Shakra, Vajrapani, Mahendra, Svargapati, Purandara',
    tradition: 'smartha',
    description_en: 'Indra is the king of the gods (Devendra) and ruler of Svarga (heaven). The most prominent deity of the Rigveda, he is the god of thunder, lightning, storms, and rain. He wields the vajra (thunderbolt) and rides the white elephant Airavata. Though diminished in post-Vedic religion, Indra remains significant as the lord of weather and protector of the cosmos against demonic forces.',
    description_te: 'ఇంద్ర దేవతలకు రాజు (దేవేంద్రుడు) మరియు స్వర్గానికి అధిపతి. ఋగ్వేదంలో అత్యంత ప్రముఖ దేవత. ఉరుములు, మెరుపులు, తుఫాను మరియు వర్షానికి అధిదేవత. వజ్రాయుధాన్ని ధరించి ఐరావతంపై స్వారీ చేస్తాడు.',
    description_ta: 'இந்திரன் தேவர்களின் அரசன் (தேவேந்திரன்) மற்றும் சொர்க்கத்தின் ஆட்சியாளன். ரிக்வேதத்தில் மிகவும் முக்கியமான தெய்வம். இடி, மின்னல், புயல் மற்றும் மழையின் கடவுள். வஜ்ரம் ஏந்தி ஐராவதத்தில் சவாரி செய்கிறான்.',
    description_hi: 'इंद्र देवताओं के राजा (देवेंद्र) और स्वर्ग के शासक हैं। ऋग्वेद के सबसे प्रमुख देव, वज्र और आंधी-तूफान के देवता। वज्रायुध धारण कर ऐरावत पर सवार होते हैं। वर्षा और देवताओं की सुरक्षा के स्वामी।',
    iconography_en: 'Golden complexion, royal attire with crown. Four arms holding the vajra (thunderbolt), a lotus, and sometimes a bow. Rides the white elephant Airavata. Accompanied by the celestial nymphs (Apsaras) and his consort Shachi.',
  },
];

// ─── FESTIVALS ────────────────────────────────────────────────────────────────
// Columns: slug | title_en | title_te | title_ta | title_hi | alternate_names_en |
//          deity_slugs | illustration_filename | illustration_drive_id | calendar_month |
//          tithi | paksha | next_occurrence | next_occurrence_note_en |
//          significance_en | significance_te | significance_ta | significance_hi |
//          linked_puja_slug | linked_story_slug | materials_group_slug |
//          regional_notes_en | status | translation_status

const NEW_FESTIVALS = [
  {
    slug: 'ugadi',
    title_en: 'Ugadi', title_te: 'ఉగాది', title_ta: 'உகாதி', title_hi: 'उगादि',
    alternate_names_en: 'Yugadi, Gudi Padwa (Maharashtra), Telugu New Year, Kannada New Year',
    deity_slugs: 'brahma',
    calendar_month: 'Chaitra', tithi: 'pratipada', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Mar/Apr — Shukla Pratipada of Chaitra month (Telugu/Kannada New Year)',
    significance_en: 'Ugadi marks the Telugu and Kannada New Year — the first day of the Hindu lunar calendar. It commemorates the day Brahma began creation. Families listen to the Panchanga Sravanam (almanac reading), prepare Ugadi Pachadi — a chutney with six tastes (sweet, sour, salty, bitter, spicy, astringent) symbolising the experiences of the coming year — and make new beginnings.',
    significance_te: 'ఉగాది తెలుగు మరియు కన్నడ నూతన సంవత్సరం — హిందూ చంద్ర పంచాంగంలో మొదటి రోజు. బ్రహ్మ సృష్టిని ప్రారంభించిన రోజు. పంచాంగ శ్రవణం, ఆరు రుచులతో ఉగాది పచ్చడి తయారుచేస్తారు — రాబోయే సంవత్సర అనుభవాలను సూచిస్తాయి.',
    significance_ta: 'உகாதி தெலுங்கு மற்றும் கன்னட புத்தாண்டு — இந்து சந்திர நாட்காட்டியில் முதல் நாள். பிரம்மா படைப்பை தொடங்கிய நாள். பஞ்சாங்க ஸ்ரவணம், ஆறு சுவைகளுடன் உகாதி பச்சடி தயாரிக்கிறார்கள்.',
    significance_hi: 'उगादि तेलुगु और कन्नड़ नव वर्ष है — हिंदू चंद्र पंचांग का पहला दिन। ब्रह्मा ने इसी दिन सृष्टि आरंभ की। पंचांग श्रवण, छह स्वादों वाली उगादि पचड़ी — आने वाले वर्ष के अनुभवों का प्रतीक।',
    regional_notes_en: 'Maharashtrians celebrate this day as Gudi Padwa and raise a Gudi (decorated pole) outside the home. In Andhra and Telangana, the Panchanga Sravanam at the local temple is central. Mango leaves and neem flowers are integral to the celebration.',
  },
  {
    slug: 'makar-sankranti',
    title_en: 'Makar Sankranti', title_te: 'మకర సంక్రాంతి', title_ta: 'மகர சங்கராந்தி', title_hi: 'मकर संक्रांति',
    alternate_names_en: 'Pongal (Tamil Nadu), Lohri (Punjab), Uttarayan (Gujarat), Maghi',
    deity_slugs: 'surya',
    calendar_month: 'Pushya/Magha', tithi: '', paksha: '',
    next_occurrence: '', next_occurrence_note_en: 'January 14 — solar transit into Capricorn (Makara Rashi)',
    significance_en: 'Makar Sankranti marks the sun\'s northward transit (Uttarayana) into Capricorn — one of the most auspicious solar events in the Hindu calendar. It signals the end of winter and the beginning of the harvest season. Celebrated with sesame-jaggery sweets (til-gur), kite flying, and ritual bathing in sacred rivers. The day marks six months of auspicious time for sacred activities.',
    significance_te: 'మకర సంక్రాంతి సూర్యుని ఉత్తరాయణ ప్రవేశాన్ని — మకర రాశిలోకి — జరుపుకుంటుంది. శీతాకాలం ముగించి పంట సీజన్ ప్రారంభమవుతుంది. నువ్వులు-బెల్లం వంటకాలు, గాలిపటాలు, పవిత్ర నదుల్లో స్నానం విశేషం.',
    significance_ta: 'மகர சங்கராந்தி சூரியன் மகர ராசிக்கு நகரும் உத்தராயண தொடக்கத்தை குறிக்கிறது. குளிர்காலம் முடிந்து அறுவடை பருவம் தொடங்குகிறது. எள்-வெல்லம் இனிப்புகள், பட்டம் விடுதல், புனித ஆறுகளில் நீராடுதல் விசேஷம்.',
    significance_hi: 'मकर संक्रांति सूर्य के उत्तरायण प्रवेश — मकर राशि में — का उत्सव है। शीत ऋतु की समाप्ति और फसल सीजन का आरंभ। तिल-गुड़ के व्यंजन, पतंगबाजी, और पवित्र नदियों में स्नान विशेष हैं।',
    regional_notes_en: 'In Andhra and Telangana, celebrated for 3 days as Bhogi, Sankranti, and Kanuma. In Tamil Nadu, known as Pongal (4 days). In Gujarat, it is celebrated as Uttarayan with mass kite-flying. In Punjab, celebrated as Lohri the night before.',
  },
  {
    slug: 'pongal',
    title_en: 'Pongal', title_te: 'పొంగల్', title_ta: 'பொங்கல்', title_hi: 'पोंगल',
    alternate_names_en: 'Thai Pongal, Makara Vilakku, Harvest Festival of Tamil Nadu',
    deity_slugs: 'surya',
    calendar_month: 'Thai (Tamil)', tithi: '', paksha: '',
    next_occurrence: '', next_occurrence_note_en: 'January 14-17 — Tamil month of Thai; 4-day harvest festival',
    significance_en: 'Pongal is the most important harvest festival of Tamil Nadu, celebrated over four days. The name comes from the Tamil word meaning "to boil over" — sweet rice (pongal) is boiled in the sun\'s first rays until it overflows, symbolising abundance. The four days are Bhogi Pongal, Surya Pongal (main day), Mattu Pongal (honouring cattle), and Kaanum Pongal (family gathering).',
    significance_te: 'పొంగల్ తమిళనాడు అత్యంత ముఖ్యమైన పంట పండుగ, నాలుగు రోజుల పాటు జరుపుకుంటారు. మొదటి సూర్యకిరణాలలో తీపి బియ్యం (పొంగల్) పొంగించడం సమృద్ధిని సూచిస్తుంది. నాలుగు రోజులు: భోగి, సూర్య పొంగల్, మట్టు పొంగల్, కాను పొంగల్.',
    significance_ta: 'பொங்கல் தமிழ்நாட்டின் மிக முக்கியமான அறுவடை திருவிழா, நான்கு நாட்கள் கொண்டாடப்படுகிறது. "பொங்கல்" என்றால் "பொங்குதல்" — சூரியனின் முதல் கிரணங்களில் இனிப்பு சாதம் பொங்கி வழிவது செழிப்பின் அடையாளம். நான்கு நாட்கள்: போகி, சூரிய பொங்கல், மட்டு பொங்கல், கானும் பொங்கல்.',
    significance_hi: 'पोंगल तमिलनाडु का सबसे महत्वपूर्ण फसल उत्सव है, जो चार दिन मनाया जाता है। सूर्य की पहली किरणों में मीठा चावल (पोंगल) उबाल कर जब वह बाहर बहता है तो यह समृद्धि का प्रतीक है। चार दिन: भोगी, सूर्य पोंगल, मट्टू पोंगल, कानुम पोंगल।',
    regional_notes_en: 'Exclusively a Tamil festival. Kolam (rice-flour rangoli) drawn in front of homes. Sugarcane, turmeric plants, and newly harvested rice are displayed. Cattle are decorated with painted horns and garlands on Mattu Pongal.',
  },
  {
    slug: 'vijayadashami',
    title_en: 'Vijayadashami (Dasara)', title_te: 'విజయదశమి (దసరా)', title_ta: 'விஜயதசமி (தசரா)', title_hi: 'विजयदशमी (दशहरा)',
    alternate_names_en: 'Dussehra, Dasara, Dasain, Durga Puja (last day)',
    deity_slugs: 'durga,saraswati,rama',
    calendar_month: 'Ashwina', tithi: 'dashami', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Sep/Oct — Shukla Dashami of Ashwina month (10th day of Navratri)',
    significance_en: 'Vijayadashami is the festival of victory of good over evil — the tenth day after Navratri. It marks Durga\'s final victory over the buffalo demon Mahishasura, and Rama\'s victory over Ravana. Tools, weapons, vehicles, and books are worshipped (Ayudha Puja). In South India, Saraswati Puja on the ninth day (Mahanavami) and the Vidyarambham ritual begin a child\'s formal education.',
    significance_te: 'విజయదశమి మంచి చెడుపై సాధించిన విజయం యొక్క పండుగ — నవరాత్రి తర్వాత పదవ రోజు. దుర్గ మహిషాసురుడిపై మరియు రాముడు రావణుడిపై సాధించిన విజయం. ఆయుధ పూజ, శారదా పూజ, మరియు విద్యారంభం శుభకార్యాలు.',
    significance_ta: 'விஜயதசமி நன்மை தீமையை வென்ற திருவிழா — நவராத்திரியின் பத்தாம் நாள். துர்கா மகிஷாசுரனையும், இராமன் இராவணனையும் வென்றனர். ஆயுத பூஜை, சரஸ்வதி பூஜை மற்றும் வித்யாரம்பம் சுபகாரியங்கள்.',
    significance_hi: 'विजयादशमी बुराई पर अच्छाई की जीत का पर्व है — नवरात्रि के दस दिन बाद। दुर्गा ने महिषासुर और राम ने रावण पर विजय प्राप्त की। आयुध पूजा, सरस्वती पूजा और विद्यारंभ के शुभ कार्य होते हैं।',
    regional_notes_en: 'In Mysore (Karnataka), the Dasara procession (Jamboo Savari) is world-famous. In Andhra/Telangana, Ayudha Puja on Mahanavami is major. In North India, Ravan effigies are burnt (Dussehra). In West Bengal, this is the final day of Durga Puja.',
  },
  {
    slug: 'vaikuntha-ekadashi',
    title_en: 'Vaikuntha Ekadashi', title_te: 'వైకుంఠ ఏకాదశి', title_ta: 'வைகுண்ட ஏகாதசி', title_hi: 'वैकुंठ एकादशी',
    alternate_names_en: 'Mokshada Ekadashi, Mukkoti Ekadashi, Swarga Vathil Ekadashi',
    deity_slugs: 'vishnu',
    calendar_month: 'Margashira/Dhanurmasa', tithi: 'ekadashi', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Dec/Jan — Shukla Ekadashi of Margashira month (Dhanurmasa)',
    significance_en: 'Vaikuntha Ekadashi is the most sacred of all Ekadashis — the day the Vaikuntha Dwara (gates of Vishnu\'s heaven) are said to be open. Devotees who observe this fast and spend the night in prayer and devotion at Vishnu temples attain moksha. At Tirupati and Srirangam, the Vaikuntha Dwara (a special door) is opened only on this day for devotees to pass through.',
    significance_te: 'వైకుంఠ ఏకాదశి అన్ని ఏకాదశులలో పవిత్రమైనది — వైకుంఠ ద్వారాలు తెరవబడతాయని నమ్ముతారు. ఈ ఉపవాసం ఆచరించి రాత్రంతా విష్ణు మందిరాల్లో భక్తిలో గడిపిన వారికి మోక్షం లభిస్తుంది. తిరుపతి, శ్రీరంగంలో ప్రత్యేక ద్వారం తెరవబడుతుంది.',
    significance_ta: 'வைகுண்ட ஏகாதசி அனைத்து ஏகாதசிகளிலும் மிக புனிதமானது — வைகுண்ட வாசல் திறக்கப்படுகிறது என்று நம்பப்படுகிறது. இந்த விரதத்தை கடைப்பிடித்து இரவு முழுவதும் திருமால் கோவில்களில் பக்தியில் கழிப்பவர்களுக்கு மோட்சம் கிட்டும்.',
    significance_hi: 'वैकुंठ एकादशी सभी एकादशियों में सबसे पवित्र है — वैकुंठ द्वार खुलने का दिन। इस व्रत को रखकर रात भर विष्णु मंदिरों में भक्ति में लीन रहने से मोक्ष मिलता है। तिरुपति और श्रीरंगम में विशेष द्वार केवल इसी दिन खोला जाता है।',
    regional_notes_en: 'At Tirumala Tirupati, lakhs of devotees queue through the Vaikuntha Dwaram. In Tamil Nadu (Srirangam), Dhanurmasa celebrations culminate on this day. Considered especially auspicious for performing last rites (shraddha) for ancestors.',
  },
  {
    slug: 'karthika-pournami',
    title_en: 'Karthika Pournami', title_te: 'కార్తీక పౌర్ణమి', title_ta: 'கார்த்திகை பௌர்ணமி', title_hi: 'कार्तिक पूर्णिमा',
    alternate_names_en: 'Tripuri Purnima, Dev Diwali, Karthigai Deepam (Tamil), Pushkar Purnima',
    deity_slugs: 'shiva,vishnu,kartikeya',
    calendar_month: 'Karthika', tithi: 'purnima', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Oct/Nov — Purnima of Karthika month',
    significance_en: 'Karthika Pournami is one of the holiest nights in the Hindu calendar — the full moon of the sacred month of Karthika. Shiva destroyed the three cities (Tripura) of the asuras on this night. It is also the birthday of Kartikeya. Devotees light lamps (deepas) throughout the night, take pre-dawn river baths, and observe the Karthika Masa Deepotsavam. Pushkar (Rajasthan) holds its largest fair on this day.',
    significance_te: 'కార్తీక పౌర్ణమి హిందూ పంచాంగంలో అత్యంత పవిత్రమైన రాత్రులలో ఒకటి. ఈ రాత్రి శివుడు అసురుల మూడు నగరాలను (త్రిపుర) నాశనం చేశాడు. కార్తికేయ జన్మదినం కూడా ఇదే. భక్తులు రాత్రంతా దీపాలు వెలిగించి తెల్లవారుజామున నదీస్నానం చేస్తారు.',
    significance_ta: 'கார்த்திகை பௌர்ணமி இந்து நாட்காட்டியில் மிக புனிதமான இரவுகளில் ஒன்று. இந்த இரவில் சிவன் அசுரர்களின் மூன்று நகரங்களை (திரிபுரம்) அழித்தார். கார்த்திகேயனின் பிறந்தநாளும் இதுவே. அதிகாலை நீராடல், நாள் முழுவதும் விளக்கேற்றுதல் சிறப்பு.',
    significance_hi: 'कार्तिक पूर्णिमा हिंदू पंचांग की सबसे पवित्र रातों में से एक है। इसी रात शिव ने असुरों के तीन नगरों (त्रिपुर) का संहार किया। कार्तिकेय का जन्मदिन भी यही है। भक्त रात भर दीप जलाते हैं, ब्रह्म मुहूर्त में नदी स्नान करते हैं।',
    regional_notes_en: 'In Tamil Nadu, Karthigai Deepam is a major 10-day festival ending on this day with the lighting of the great beacon (Mahadeepam) on Tiruvannamalai hill. In Andhra/Telangana, Karthika Vanavabhojnam (forest picnics) are traditional. Pushkar Mela in Rajasthan is the world\'s largest camel fair.',
  },
  {
    slug: 'rath-yatra',
    title_en: 'Rath Yatra', title_te: 'రథ యాత్ర', title_ta: 'ரத யாத்திரை', title_hi: 'रथ यात्रा',
    alternate_names_en: 'Jagannath Rath Yatra, Chariot Festival, Gundicha Yatra',
    deity_slugs: 'krishna',
    calendar_month: 'Ashadha', tithi: 'dwitiya', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Jun/Jul — Shukla Dwitiya of Ashadha month',
    significance_en: 'Rath Yatra is the grand chariot procession of Lord Jagannath (Krishna), his brother Balarama, and sister Subhadra, from the Jagannath Temple to the Gundicha Temple in Puri, Odisha. The three massive chariots are pulled by thousands of devotees. This is one of the oldest and largest religious processions in the world. Pulling the chariot ropes is believed to grant liberation.',
    significance_te: 'రథ యాత్ర జగన్నాథ్ (కృష్ణ), బలరాముడు మరియు సుభద్ర దేవిని జగన్నాథ్ ఆలయం నుండి గుండిచా ఆలయానికి తీసుకెళ్ళే రథ ఊరేగింపు. మూడు పెద్ద రథాలు వేలాది భక్తులచే లాగబడతాయి. ప్రపంచంలోని పురాతన మరియు అతిపెద్ద ధార్మిక ఊరేగింపులలో ఒకటి.',
    significance_ta: 'ரத யாத்திரை ஜகன்னாத் (கிருஷ்ண), பலராமன் மற்றும் சுபத்திரையை ஜகன்னாத் கோவிலிலிருந்து குண்டிச கோவிலுக்கு அழைத்துச் செல்லும் தேர் ஊர்வலம். மூன்று பெரிய தேர்கள் ஆயிரக்கணக்கான பக்தர்களால் இழுக்கப்படுகின்றன.',
    significance_hi: 'रथ यात्रा भगवान जगन्नाथ (कृष्ण), बलराम और सुभद्रा की भव्य रथ शोभायात्रा है — जगन्नाथ मंदिर से गुंडिचा मंदिर तक, पुरी, ओडिशा। तीन विशाल रथ हजारों भक्तों द्वारा खींचे जाते हैं। विश्व के प्राचीनतम और विशालतम धार्मिक जुलूसों में से एक।',
    regional_notes_en: 'The festival originates from Puri, Odisha and is now celebrated globally. Lord Jagannath is a unique form — wooden icon without arms, representing the universal, formless aspect of Krishna. The "Juggernaut" in English is derived from Jagannath.',
  },
  {
    slug: 'akshaya-tritiya',
    title_en: 'Akshaya Tritiya', title_te: 'అక్షయ తృతీయ', title_ta: 'அக்ஷய திருதியை', title_hi: 'अक्षय तृतीया',
    alternate_names_en: 'Akha Teej, Parashurama Jayanti',
    deity_slugs: 'vishnu,lakshmi',
    calendar_month: 'Vaishakha', tithi: 'tritiya', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Apr/May — Shukla Tritiya of Vaishakha month',
    significance_en: 'Akshaya Tritiya (literally "imperishable third") is one of the four most auspicious days in the Hindu calendar, considered self-luminously auspicious (swayam siddha muhurta) — no further muhurta is needed. Any action begun on this day — marriages, new businesses, gold purchases, construction — is believed to grow and never diminish. It is the birthday of Parashurama (sixth avatar of Vishnu).',
    significance_te: 'అక్షయ తృతీయ (అవినాశమైన తృతీయ) హిందూ పంచాంగంలో అత్యంత శుభకరమైన నాలుగు రోజులలో ఒకటి. స్వయంసిద్ధ ముహూర్తం — అదనపు ముహూర్తం అవసరం లేదు. ఈ రోజు ప్రారంభించిన పని వృద్ధి చెందుతుంది. పరశురాముని జన్మదినం.',
    significance_ta: 'அக்ஷய திருதியை (அழிவற்ற மூன்றாம் நாள்) இந்து நாட்காட்டியில் மிகவும் சுபமான நான்கு நாட்களில் ஒன்று. சுயம் சித்த முகூர்த்தம் — கூடுதல் முகூர்த்தம் தேவையில்லை. இந்நாளில் தொடங்கும் எல்லாமே வளரும். பரசுராமரின் பிறந்தநாள்.',
    significance_hi: 'अक्षय तृतीया (अक्षय = कभी न घटने वाला) हिंदू पंचांग के चार स्वयंसिद्ध मुहूर्तों में से एक। इस दिन किया गया कोई भी कार्य — विवाह, नया व्यापार, सोना खरीद, निर्माण — बढ़ता है और कभी कम नहीं होता। परशुराम जयंती भी है।',
    regional_notes_en: 'Gold purchases on Akshaya Tritiya are a major tradition across India. Jains begin the Paryushana-like annual celebration of Varshi-tapa (year-long fasting) on this day. Temples open their Akshaya Patra on this day.',
  },
  {
    slug: 'guru-purnima',
    title_en: 'Guru Purnima', title_te: 'గురు పూర్ణిమ', title_ta: 'குரு பூர்ணிமா', title_hi: 'गुरु पूर्णिमा',
    alternate_names_en: 'Vyasa Purnima, Ashadha Purnima',
    deity_slugs: 'vishnu',
    calendar_month: 'Ashadha', tithi: 'purnima', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Jun/Jul — Purnima (full moon) of Ashadha month',
    significance_en: 'Guru Purnima is dedicated to honouring one\'s spiritual teacher (guru). It falls on the full moon of Ashadha — the birth anniversary of Veda Vyasa, the compiler of the Vedas, Mahabharata, and Puranas. The day celebrates the lineage of gurus who transmit knowledge. Disciples perform Guru Pada Puja, offer dakshina, and renew their spiritual commitment. The Buddha gave his first sermon at Sarnath on this day.',
    significance_te: 'గురు పూర్ణిమ ఆధ్యాత్మిక గురువులను గౌరవించే రోజు. వేదవ్యాసుని జన్మదినం — వేదాలు, మహాభారతం మరియు పురాణాలను సంకలనం చేసిన ఆచార్యుడు. శిష్యులు గురు పాద పూజ చేసి, దక్షిణ సమర్పించి, ఆధ్యాత్మిక నిబద్ధతను పునరుద్ఘాటిస్తారు.',
    significance_ta: 'குரு பூர்ணிமா ஆன்மீக குருவை மதிக்கும் நாள். வேத வியாசரின் பிறந்தநாள் — வேதங்கள், மகாபாரதம் மற்றும் புராணங்களை தொகுத்தவர். சீடர்கள் குரு பாத பூஜை செய்து, தட்சிணை அளித்து, ஆன்மீக உறுதிமொழியை புதுப்பிக்கிறார்கள்.',
    significance_hi: 'गुरु पूर्णिमा आध्यात्मिक गुरु को सम्मानित करने का दिन है। वेदव्यास का जन्मदिन — जिन्होंने वेदों, महाभारत और पुराणों का संकलन किया। शिष्य गुरु पाद पूजा करते हैं, दक्षिणा अर्पित करते हैं और आध्यात्मिक प्रतिबद्धता नवीनीकृत करते हैं।',
    regional_notes_en: 'This day is also celebrated by Buddhists and Jains. The Buddha gave his first discourse (Dhammacakkappavattana Sutta) to the five ascetics at Sarnath on this day. Practiced widely across India, Nepal, and the Tibetan Buddhist world.',
  },
  {
    slug: 'vasant-panchami',
    title_en: 'Vasant Panchami', title_te: 'వసంత పంచమి', title_ta: 'வசந்த பஞ்சமி', title_hi: 'वसंत पंचमी',
    alternate_names_en: 'Shri Panchami, Saraswati Puja, Basant Panchami',
    deity_slugs: 'saraswati',
    calendar_month: 'Magha', tithi: 'panchami', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Jan/Feb — Shukla Panchami of Magha month',
    significance_en: 'Vasant Panchami marks the arrival of spring and is the most important day for the worship of Saraswati, goddess of knowledge, arts, and learning. Children begin their formal education (Vidyarambha) on this day. Yellow is the colour of the day — mustard fields are in full bloom. Books, musical instruments, and artistic tools are placed before Saraswati and worshipped. This day is also considered ideal for marriages.',
    significance_te: 'వసంత పంచమి వసంత రుతువు రాకను మరియు విద్య, కళలు, జ్ఞానం యొక్క దేవత సరస్వతి అత్యంత ముఖ్యమైన పూజ దినాన్ని సూచిస్తుంది. పిల్లలు విద్యారంభం చేస్తారు. పచ్చ రంగు ఈ రోజు ప్రత్యేకత. పుస్తకాలు, వాద్యపరికరాలు పూజించబడతాయి.',
    significance_ta: 'வசந்த பஞ்சமி வசந்த காலத்தின் வருகையை குறிக்கிறது மற்றும் கல்வி, கலைகளின் தேவி சரஸ்வதியின் முக்கியமான பூஜை நாள். குழந்தைகள் வித்யாரம்பம் செய்கிறார்கள். மஞ்சள் நிறம் இந்நாளின் சிறப்பு. புத்தகங்கள், இசைக்கருவிகள் பூஜிக்கப்படுகின்றன.',
    significance_hi: 'वसंत पंचमी वसंत ऋतु के आगमन और विद्या, कला, ज्ञान की देवी सरस्वती की सबसे महत्वपूर्ण पूजा का दिन है। बच्चों का विद्यारंभ संस्कार होता है। पीला रंग इस दिन की पहचान। पुस्तकें, वाद्ययंत्र पूजे जाते हैं।',
    regional_notes_en: 'In Bengal and Odisha, Saraswati Puja is a major festival with elaborate idol worship in schools and colleges. In Punjab, Basant Panchami is celebrated with kite-flying and yellow attire. In North India, it marks the beginning of Holi preparations.',
  },
  {
    slug: 'holi',
    title_en: 'Holi', title_te: 'హోళి', title_ta: 'ஹோலி', title_hi: 'होली',
    alternate_names_en: 'Dhulandi, Rangwali Holi, Dol Yatra (Bengal), Shigmo (Goa)',
    deity_slugs: 'vishnu,krishna',
    calendar_month: 'Phalguna', tithi: 'purnima', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Feb/Mar — Purnima of Phalguna month; color play the next morning',
    significance_en: 'Holi is the festival of colours, marking the arrival of spring and the victory of devotion over evil. The night before (Holika Dahan) commemorates the burning of the demoness Holika and the survival of the devotee Prahlada by Vishnu\'s grace. The next morning, people play with colours and water. In Vrindavan and Mathura, Holi celebrations last for weeks and are associated with Krishna\'s divine play (Lila).',
    significance_te: 'హోళి రంగుల పండుగ, వసంత రుతువు రాక మరియు భక్తి చెడుపై సాధించిన విజయాన్ని జరుపుకుంటుంది. ముందు రోజు రాత్రి హోళికా దహనం — రాక్షసి హోళిక దహనం మరియు విష్ణు కృపతో ప్రహ్లాద రక్షణ. మరుసటి రోజు రంగులు, నీళ్ళతో ఆడతారు.',
    significance_ta: 'ஹோலி வர்ணங்களின் திருவிழா, வசந்த காலத்தின் வருகை மற்றும் பக்தியின் தீமையின் மீதான வெற்றியை கொண்டாடுகிறது. முந்தைய இரவு ஹோலிகா தகனம் — ஹோலிகா என்ற அரக்கி எரிந்து பக்தன் பிரகலாதன் விஷ்ணுவின் அருளால் காப்பாற்றப்படுகிறான். மறுநாள் காலை வண்ணங்கள் விளையாட்டு.',
    significance_hi: 'होली रंगों का त्योहार है — वसंत के आगमन और भक्ति की बुराई पर विजय का उत्सव। एक दिन पहले होलिका दहन — राक्षसी होलिका का दहन और विष्णु की कृपा से प्रह्लाद की रक्षा। अगले दिन रंग और पानी से खेला जाता है।',
    regional_notes_en: 'Vrindavan and Mathura celebrate Holi for 40 days starting from Vasant Panchami. Lathmar Holi in Barsana is famous. In South India, Holi is called Kamadahana and is less prominently celebrated. In Bengal, it is Dol Yatra with Radha-Krishna worship.',
  },
  {
    slug: 'bathukamma',
    title_en: 'Bathukamma', title_te: 'బతుకమ్మ', title_ta: 'பதுகம்மா', title_hi: 'बतुकम्मा',
    alternate_names_en: 'Saddula Bathukamma, Engili Pula Bathukamma, Sadula Bathukamma',
    deity_slugs: 'durga',
    calendar_month: 'Bhadrapada-Ashwina', tithi: 'amavasya', paksha: 'krishna',
    next_occurrence: '', next_occurrence_note_en: 'Sep/Oct — 9 days from Bhadrapada Amavasya to Dasara (Telangana)',
    significance_en: 'Bathukamma is the most beloved festival of Telangana — a floral festival honouring the goddess Gauri/Bathukamma as the life-giving mother. Women stack wildflowers (particularly tangedu, banthikampa, and gunugu) in concentric circular patterns on a large plate, creating a living floral tower. They dance around it in circles singing folk songs. On the final day (Saddula Bathukamma), the flower arrangements are immersed in a pond or tank.',
    significance_te: 'బతుకమ్మ తెలంగాణ అత్యంత ప్రీతిపాత్రమైన పండుగ — జీవనదాత్రి అయిన గౌరీ/బతుకమ్మ దేవతను గౌరవించే పుష్పాల పండుగ. మహిళలు అడవి పూలను (తంగేడు, బంతికంప, గునుగు) పెద్ద పళ్ళెంలో వలయాకారంలో పేర్చి పుష్ప స్తంభాన్ని తయారు చేస్తారు. చుట్టూ నృత్యం చేస్తూ జానపద గీతాలు పాడతారు.',
    significance_ta: 'பதுகம்மா தெலங்கானாவின் மிகவும் விரும்பப்படும் திருவிழா — உயிர் தரும் தாயான கௌரி/பதுகம்மா தேவதையை மதிக்கும் பூத் திருவிழா. பெண்கள் காட்டு பூக்களை (தங்கேடு, பந்திகம்பா, குனுகு) பெரிய தட்டில் வட்டமாக அடுக்கி பூ கோபுரம் செய்கிறார்கள்.',
    significance_hi: 'बतुकम्मा तेलंगाना का सबसे प्रिय त्योहार है — जीवनदायिनी देवी गौरी/बतुकम्मा का फूलों का पर्व। महिलाएं जंगली फूलों (तंगेडु, बंतिकंप, गुनुगु) को बड़े थाल में गोल-गोल सजाकर फूलों का स्तंभ बनाती हैं। उसके चारों ओर नृत्य करते हुए लोकगीत गाती हैं।',
    regional_notes_en: 'Exclusively a Telangana festival. Nine different types of Bathukamma are celebrated on nine days with different flowers and songs. It was declared the State Flower Festival of Telangana in 2014. The festival showcases the rich biodiversity of Telangana\'s flowers.',
  },
  {
    slug: 'bonalu',
    title_en: 'Bonalu', title_te: 'బోనాలు', title_ta: 'போனாலு', title_hi: 'बोनालु',
    alternate_names_en: 'Mahakali Bonalu, Yellamma Bonalu, Lade Bonalu',
    deity_slugs: 'durga',
    calendar_month: 'Ashadha-Shravana', tithi: '', paksha: '',
    next_occurrence: '', next_occurrence_note_en: 'Jul/Aug — Ashadha and Shravana months; begins at Golconda and moves to Secunderabad and Hyderabad',
    significance_en: 'Bonalu is the quintessential festival of Hyderabad and Telangana — a joyous thanksgiving to Goddess Mahakali for her protection against epidemic diseases. Women carry earthen pots (bonam) filled with cooked rice, jaggery, curd, and neem leaves on their heads, adorned with neem twigs and a lit lamp on top, and offer them to the goddess at local temples. The festival moves through different neighbourhoods over several weeks.',
    significance_te: 'బోనాలు హైదరాబాద్ మరియు తెలంగాణ యొక్క ప్రత్యేక పండుగ — మహమ్మారుల నుండి రక్షించిన మహాకాళి దేవతకు కృతజ్ఞతగా జరుపుకుంటారు. మహిళలు వండిన అన్నం, బెల్లం, పెరుగు, వేప ఆకులతో మట్టి కుండ (బోనం) తలపై పెట్టుకుని మందిరాలకు వెళ్ళి అర్పిస్తారు.',
    significance_ta: 'போனாலு ஹைதராபாத் மற்றும் தெலங்கானாவின் தனித்துவமான திருவிழா — தொற்றுநோயிலிருந்து பாதுகாத்த மகாகாளி தேவதைக்கு நன்றி கூறும் திருவிழா. பெண்கள் சமைத்த அரிசி, வெல்லம், தயிர், வேப்பிலை நிரப்பிய மண் குடத்தை தலையில் சுமந்து கோவில்களுக்கு சென்று அர்பிக்கிறார்கள்.',
    significance_hi: 'बोनालु हैदराबाद और तेलंगाना का अनूठा त्योहार है — महामारी से रक्षा करने वाली महाकाली को धन्यवाद का त्योहार। महिलाएं पकाया चावल, गुड़, दही, नीम के पत्तों से भरे मिट्टी के घड़े (बोनम) सिर पर रखकर मंदिरों में जाकर अर्पित करती हैं।',
    regional_notes_en: 'The festival begins at Golconda Fort with the state government\'s official celebrations, then moves to Ujjaini Mahankali Temple in Secunderabad, and finally to the Old City of Hyderabad. The Rangam (oracle) procession where the oracle predicts events for the coming year is a highlight.',
  },
  {
    slug: 'karthigai-deepam',
    title_en: 'Karthigai Deepam', title_te: 'కార్తీక దీపం', title_ta: 'கார்த்திகை தீபம்', title_hi: 'कार्तिगाई दीपम',
    alternate_names_en: 'Karthigai Vilakkidu, Tiruvannamalai Deepam',
    deity_slugs: 'shiva,kartikeya',
    calendar_month: 'Karthigai (Tamil)', tithi: 'purnima', paksha: 'shukla',
    next_occurrence: '', next_occurrence_note_en: 'Nov/Dec — Pournami of Karthigai Tamil month (when Krittika nakshatra coincides)',
    significance_en: 'Karthigai Deepam is a Tamil festival of lights celebrated in the month of Karthigai. Every home lights rows of oil lamps (agal vilakku) at dusk. The culmination is the Mahadeepam — the lighting of a massive beacon on the summit of Tiruvannamalai hill (Arunachala), visible for miles. This represents Shiva as the pillar of fire (Jyotirlinga) that has neither top nor bottom. The festival also honours the Krittika stars who nursed infant Kartikeya.',
    significance_te: 'కార్తీక దీపం తమిళ వెలుతురు పండుగ, కార్తీక మాసంలో జరుపుకుంటారు. ప్రతి ఇంట్లో సాయంత్రం ఆగల్ వెలక్కులు (మట్టి దీపాలు) వరుసగా వెలిగిస్తారు. పరాకాష్ఠ తిరువణ్ణమలై కొండపై మహాదీపం వెలిగించడం. శివుని జ్యోతిర్లింగ స్వరూపాన్ని సూచిస్తుంది.',
    significance_ta: 'கார்த்திகை தீபம் கார்த்திகை மாதத்தில் கொண்டாடப்படும் தமிழ் விளக்கு திருவிழா. ஒவ்வொரு வீட்டிலும் மாலையில் அகல் விளக்குகள் ஏற்றப்படுகின்றன. உச்சகட்டம் திருவண்ணாமலை மலை உச்சியில் மகாதீபம் ஏற்றுதல் — சிவனின் ஜோதிர்லிங்க வடிவத்தை குறிக்கிறது.',
    significance_hi: 'कार्तिगाई दीपम तमिल कार्तिगाई माह का प्रकाश उत्सव है। हर घर में शाम को मिट्टी के दीपक (अगल विलक्कु) की पंक्तियां जलाई जाती हैं। तिरुवण्णामलाई पहाड़ पर महादीपम का प्रज्वलन — शिव के ज्योतिर्लिंग स्वरूप का प्रतीक।',
    regional_notes_en: 'Primarily a Tamil festival. The Tiruvannamalai Deepam draws millions of pilgrims. The Arunachala hill itself is worshipped as Shiva — circumambulation (Girivalam) of the hill is performed by hundreds of thousands, especially on full moon nights.',
  },
  {
    slug: 'onam',
    title_en: 'Onam', title_te: 'ఓణం', title_ta: 'ஓணம்', title_hi: 'ओणम',
    alternate_names_en: 'Thiruvonam, Kerala Harvest Festival, Vamana Jayanti',
    deity_slugs: 'vishnu',
    calendar_month: 'Chingam (Malayalam)', tithi: '', paksha: '',
    next_occurrence: '', next_occurrence_note_en: 'Aug/Sep — Malayalam month of Chingam; Thiruvonam nakshatra (10-day festival)',
    significance_en: 'Onam is Kerala\'s grandest festival — a 10-day harvest celebration centred on the mythical return of the beloved King Mahabali (Maveli) to his kingdom. Vishnu had sent Mahabali to the netherworld as Vamana, but granted him the boon of visiting his subjects once a year. Homes are decorated with elaborate flower carpets (Pookalam), the grand Onam Sadhya feast is served on banana leaves, and the famous Vallam Kali (snake boat races) are held.',
    significance_te: 'ఓణం కేరళ అత్యంత వైభవోపేతమైన పండుగ — 10 రోజుల పంట పండుగ. ప్రియమైన రాజు మహాబలి (మావేలి) తన రాజ్యానికి పౌరాణిక తిరిగి రాకను జరుపుకుంటారు. విష్ణువు వామన రూపంలో మహాబలిని పాతాళానికి పంపినా, సంవత్సరానికి ఒకసారి వచ్చే వరం ఇచ్చాడు. పూకలం, ఓణం సద్య, వల్లంకళి ప్రత్యేకతలు.',
    significance_ta: 'ஓணம் கேரளாவின் மிகவும் சிறந்த திருவிழா — 10 நாள் அறுவடை கொண்டாட்டம். அன்பான அரசன் மகாபலி (மாவேலி) தன் ராஜ்யத்திற்கு திரும்புவதை கொண்டாடுகிறார்கள். விஷ்ணு வாமன ரூபத்தில் மகாபலியை பாதாளத்திற்கு அனுப்பினாலும், ஆண்டுக்கு ஒருமுறை வர வரம் கொடுத்தார். பூக்கோலம், ஓணம் சத்யா, வல்லம்களி சிறப்புகள்.',
    significance_hi: 'ओणम केरल का सबसे भव्य त्योहार है — 10 दिनों का फसल उत्सव। प्रिय राजा महाबलि (मावेली) के अपने राज्य में पौराणिक वापसी का उत्सव। विष्णु ने वामन रूप में महाबलि को पाताल भेजा लेकिन वर्ष में एक बार आने का वरदान दिया। पूकलम, ओणम साध्य, वल्लम कळी विशेषताएं।',
    regional_notes_en: 'Exclusively a Kerala festival, though celebrated by Malayali communities worldwide. The Onam Sadhya has 26+ dishes served on a banana leaf. The Nehru Trophy Boat Race (Vallam Kali) in Alappuzha is the most famous. Government of Kerala celebrates Onam as the state\'s official harvest festival.',
  },
];

// ─── main ─────────────────────────────────────────────────────────────────────

async function appendRows(sheets, tab, rows, label) {
  if (!rows.length) { console.log(`  ℹ  No new ${label}`); return; }
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: tab,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log(`  ✓  Added ${rows.length} ${label}`);
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // ── Gods ──────────────────────────────────────────────────────────────────
  const existingGodSlugs = new Set(
    ((await sheets.spreadsheets.values.get({ spreadsheetId, range: 'gods!A:A' }))
      .data.values ?? []).slice(1).map(r => r[0])
  );

  const godRows = NEW_GODS
    .filter(g => !existingGodSlugs.has(g.slug))
    .map(g => [
      g.slug,
      g.name_en, g.name_te, g.name_ta, g.name_hi, g.name_sa,
      g.alternate_names_en,
      g.tradition,
      g.description_en, g.description_te, g.description_ta, g.description_hi,
      g.iconography_en,
      '', '', '',   // illustration_filename, illustration_credit, image_drive_id
      'published', 'multilingual',
    ]);

  console.log('Gods:');
  await appendRows(sheets, 'gods', godRows, `gods: ${NEW_GODS.filter(g => !existingGodSlugs.has(g.slug)).map(g => g.slug).join(', ')}`);

  // ── Festivals ─────────────────────────────────────────────────────────────
  const existingFestivalSlugs = new Set(
    ((await sheets.spreadsheets.values.get({ spreadsheetId, range: 'festivals!A:A' }))
      .data.values ?? []).slice(1).map(r => r[0])
  );

  const festivalRows = NEW_FESTIVALS
    .filter(f => !existingFestivalSlugs.has(f.slug))
    .map(f => [
      f.slug,
      f.title_en, f.title_te, f.title_ta, f.title_hi,
      f.alternate_names_en,
      f.deity_slugs,
      '', '',  // illustration_filename, illustration_drive_id
      f.calendar_month, f.tithi, f.paksha,
      f.next_occurrence, f.next_occurrence_note_en,
      f.significance_en, f.significance_te, f.significance_ta, f.significance_hi,
      '', '', '',  // linked_puja_slug, linked_story_slug, materials_group_slug
      f.regional_notes_en,
      'published', 'multilingual',
    ]);

  console.log('Festivals:');
  await appendRows(sheets, 'festivals', festivalRows, `festivals: ${NEW_FESTIVALS.filter(f => !existingFestivalSlugs.has(f.slug)).map(f => f.slug).join(', ')}`);

  console.log('\nDone.');
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
