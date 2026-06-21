import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });

// ── Procedure steps ───────────────────────────────────────────────────────────
const STEPS = [
  // satyanarayana-vratham
  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Sankalpa (Taking the Vow)',
    step_title_te: 'సంకల్పం',
    step_title_ta: 'சங்கல்பம்',
    step_title_hi: 'संकल्प',
    instruction_en: 'Sit facing east, take a handful of water and flowers, and recite the sankalpa mantra stating your name, gotra, and the purpose of the puja. This formal vow sets the intention for the vratham.',
    instruction_te: 'తూర్పు దిక్కుగా కూర్చుని, చేతిలో నీళ్ళు పూలు తీసుకుని సంకల్పం చెప్పండి. మీ పేరు, గోత్రం, పూజ ఉద్దేశ్యం చెప్పి సంకల్పం చేయండి.',
    instruction_ta: 'கிழக்கு திசையில் அமர்ந்து, நீர் மற்றும் மலர்களை கைகளில் வைத்து சங்கல்பம் செய்யுங்கள். உங்கள் பெயர், கோத்திரம், பூஜையின் நோக்கம் சொல்லுங்கள்.',
    instruction_hi: 'पूर्व दिशा में बैठकर हाथ में जल और फूल लेकर संकल्प मंत्र बोलें। अपना नाम, गोत्र, और पूजा का उद्देश्य बताएं।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Puja Setup',
    step_title_te: 'పూజ ఏర్పాటు',
    step_title_ta: 'பூஜை அமைப்பு',
    step_title_hi: 'पूजा व्यवस्था',
    instruction_en: 'Set up the puja space with a banana plant decoration, mango leaf torans, and yellow cloth. Place Lord Vishnu or Satyanarayana idol on a raised platform. Fill the kalash with water, top with coconut, and place it to the right of the idol.',
    instruction_te: 'అరటి మొక్క అలంకారం, మామిడి ఆకు తోరణాలు, పసుపు వస్త్రంతో పూజా మందపం అలంకరించండి. సత్యనారాయణుని విగ్రహాన్ని వేదికపై ప్రతిష్ఠించండి. కళశంలో నీళ్ళు నింపి కొబ్బరికాయ పెట్టండి.',
    instruction_ta: 'வாழை மரம் அலங்காரம், மாவிலை தோரணங்கள், மஞ்சள் துணியுடன் பூஜை மண்டபம் அமையுங்கள். சத்யநாராயண சிலையை ஒரு உயர்ந்த பீடத்தில் வைக்கவும்.',
    instruction_hi: 'केले के पेड़ की सजावट, आम के पत्तों के तोरण, पीले कपड़े से पूजा मंडप सजाएं। सत्यनारायण भगवान की मूर्ति स्थापित करें। कलश में जल भरकर नारियल रखें।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Panchamrit Abhishekam',
    step_title_te: 'పంచామృత అభిషేకం',
    step_title_ta: 'பஞ்சாமிர்த அபிஷேகம்',
    step_title_hi: 'पंचामृत अभिषेक',
    instruction_en: 'Pour panchamrit (milk, curd, honey, ghee, sugar water) over the idol or into the kalash one at a time. Follow with plain water. Offer tulsi leaves — they are essential for Vishnu puja.',
    instruction_te: 'విగ్రహానికి పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, చక్కెర నీళ్ళు) ఒక్కొక్కటిగా అభిషేకించండి. తరువాత జలాభిషేకం చేయండి. తులసి ఆకులు తప్పనిసరిగా అర్పించండి.',
    instruction_ta: 'பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை நீர்) ஒவ்வொன்றாக அபிஷேகம் செய்யுங்கள். பின்னர் சுத்த நீர் ஊற்றுங்கள். துளசி இலைகள் கட்டாயம் அர்ப்பணிக்கவும்.',
    instruction_hi: 'मूर्ति पर पंचामृत (दूध, दही, शहद, घी, शक्कर जल) एक-एक करके अभिषेक करें। फिर शुद्ध जल अभिषेक करें। तुलसी पत्र अवश्य अर्पित करें।',
    recite_shloka_slug: 'vishnu-ashtothram', notes_en: '' },

  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 4,
    step_title_en: 'Shodashopachar Puja (16 offerings)',
    step_title_te: 'షోడశోపచార పూజ',
    step_title_ta: 'ஷோடஷோபசார பூஜை',
    step_title_hi: 'षोडशोपचार पूजा',
    instruction_en: 'Perform 16 offerings: Avahana (invocation), Asana (seating), Padya (water for feet), Arghya (water for hands), Achamana (sipping water), Snanam (bath), Vastra (cloth), Yagnopavita (sacred thread), Gandha (sandalwood), Pushpa (flowers), Dhupa (incense), Deepa (lamp), Naivedya (food), Tambula (betel), Phala (fruits), Dakshina (offering).',
    instruction_te: 'షోడశోపచారాలు: ఆవాహన, ఆసన, పాద్య, అర్ఘ్య, ఆచమన, స్నాన, వస్త్ర, యజ్ఞోపవీత, గంధ, పుష్ప, ధూప, దీప, నైవేద్య, తాంబూల, ఫల, దక్షిణ.',
    instruction_ta: 'ஷோடஷோபசாரம்: ஆவாஹனம், ஆசனம், பாத்யம், அர்க்யம், ஆசமனம், ஸ்நானம், வஸ்திரம், யஞ்ஞோபவீதம், கந்தம், புஷ்பம், தூபம், தீபம், நைவேத்யம், தாம்பூலம், பலம், தக்ஷிணை.',
    instruction_hi: 'षोडशोपचार: आवाहन, आसन, पाद्य, अर्घ्य, आचमन, स्नान, वस्त्र, यज्ञोपवीत, गंध, पुष्प, धूप, दीप, नैवेद्य, ताम्बूल, फल, दक्षिणा।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 5,
    step_title_en: 'Satyanarayana Katha (5 Chapters)',
    step_title_te: 'సత్యనారాయణ స్వామి వ్రత కథ',
    step_title_ta: 'சத்யநாராயண கதை',
    step_title_hi: 'सत्यनारायण कथा',
    instruction_en: 'Read or listen to all five chapters of the Satyanarayana Katha. This is the central part of the vratham. All family members and guests should be seated and attentive. Offer flowers after each chapter.',
    instruction_te: 'సత్యనారాయణ స్వామి వ్రత కథ అయిదు అధ్యాయాలు చదవండి లేదా వినండి. ఇది వ్రతం యొక్క ముఖ్య భాగం. ప్రతి అధ్యాయం తర్వాత పూలు అర్పించండి.',
    instruction_ta: 'சத்யநாராயண கதையின் ஐந்து அத்தியாயங்களையும் படியுங்கள் அல்லது கேளுங்கள். ஒவ்வொரு அத்தியாயத்திற்கும் பிறகு மலர்கள் அர்ப்பணிக்கவும்.',
    instruction_hi: 'सत्यनारायण कथा के पांचों अध्याय पढ़ें या सुनें। यह व्रत का मुख्य भाग है। प्रत्येक अध्याय के बाद फूल अर्पित करें।',
    recite_shloka_slug: '', notes_en: 'The five stories cover: the sage Narada asking Vishnu about the best vratham, a poor brahmin who performs the puja, a king who is cured of illness, a merchant saved from trouble, and the story of Tungsadhwaja.' },

  { parent_slug: 'satyanarayana-vratham', parent_type: 'vratham', step_number: 6,
    step_title_en: 'Prasad Distribution',
    step_title_te: 'ప్రసాద వితరణ',
    step_title_ta: 'பிரசாத வினியோகம்',
    step_title_hi: 'प्रसाद वितरण',
    instruction_en: 'Prepare sheera (semolina halwa made with ghee and sugar) as the sacred prasad. All family members and guests must receive the prasad. It is considered inauspicious to refuse or discard the prasad.',
    instruction_te: 'సూజి (రవ్వ) తో నెయ్యి చక్కెర వేసి శీర (హల్వా) తయారు చేసి ప్రసాదంగా పంచండి. అన్ని కుటుంబ సభ్యులు ప్రసాదం తీసుకోవాలి.',
    instruction_ta: 'சர்க்கரை மற்றும் நெய் சேர்த்த ரவா சீரா (ஹல்வா) பிரசாதமாக தயார் செய்து வினியோகிக்கவும். குடும்ப உறுப்பினர்கள் அனைவரும் பிரசாதம் பெற வேண்டும்.',
    instruction_hi: 'सूजी, घी और चीनी से शीरा (हलवा) बनाकर प्रसाद के रूप में बांटें। सभी परिवारजन और अतिथियों को प्रसाद ग्रहण करना चाहिए।',
    recite_shloka_slug: '', notes_en: '' },

  // varalakshmi-vratham
  { parent_slug: 'varalakshmi-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Kalash Preparation',
    step_title_te: 'కళశం సిద్ధం చేయడం',
    step_title_ta: 'கலசம் தயாரித்தல்',
    step_title_hi: 'कलश तैयारी',
    instruction_en: 'Fill a brass or copper kalash with water. Place it on a mound of rice. Insert mango leaves around the neck and place a coconut on top. Tie a sacred thread (raksha doram) around it seven times. Draw a lotus on the outside with turmeric.',
    instruction_te: 'రాగి లేదా ఇత్తడి కళశంలో నీళ్ళు నింపి వరి గుట్టపై ఉంచండి. కళశం మెడలో మామిడి ఆకులు పెట్టి కొబ్బరికాయ ఉంచండి. పసుపుతో కమలం వేయండి.',
    instruction_ta: 'ஒரு இத்தள் அல்லது செம்பு கலசத்தை நீரால் நிரப்பி, அரிசி மேல் வையுங்கள். மாவிலை சேர்த்து தேங்காய் வையுங்கள். வெளியில் மஞ்சளால் தாமரை வரையுங்கள்.',
    instruction_hi: 'पीतल या तांबे के कलश में जल भरकर चावल के ढेर पर रखें। मांगपत्र लगाएं और नारियल रखें। बाहर हल्दी से कमल बनाएं। सात बार पवित्र धागा बांधें।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'varalakshmi-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Invocation of Varalakshmi',
    step_title_te: 'వరలక్ష్మి ఆవాహన',
    step_title_ta: 'வரலட்சுமி ஆவாஹனம்',
    step_title_hi: 'वरलक्ष्मी आवाहन',
    instruction_en: 'Face the kalash east. Invoke Goddess Varalakshmi with the mantra "Om Shreem Mahalakshmyai Namaha". Offer fresh flowers — jasmine, marigold, and red or yellow roses are especially auspicious.',
    instruction_te: 'తూర్పుగా కళశం వైపు కూర్చుని "ఓం శ్రీం మహాలక్ష్మ్యై నమః" అని మంత్రం చెప్పి వరలక్ష్మిని ఆవాహించండి. మల్లె, చేమంతి, గులాబీ పూలు అర్పించండి.',
    instruction_ta: 'கலசம் நோக்கி கிழக்கு திசையில் அமர்ந்து "ஓம் ஸ்ரீம் மஹாலட்சுமயை நமஹ" என்று சொல்லி வரலட்சுமியை ஆவாஹனம் செய்யுங்கள்.',
    instruction_hi: 'कलश की ओर पूर्व दिशा में बैठकर "ओम श्रीं महालक्ष्म्यै नमः" मंत्र से देवी वरलक्ष्मी का आवाहन करें। चमेली, गेंदे के फूल अर्पित करें।',
    recite_shloka_slug: 'lakshmi-ashtothram', notes_en: '' },

  { parent_slug: 'varalakshmi-vratham', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Shodashopachar Puja',
    step_title_te: 'షోడశోపచార పూజ',
    step_title_ta: 'ஷோடஷோபசார பூஜை',
    step_title_hi: 'षोडशोपचार पूजा',
    instruction_en: 'Offer 16 items of worship. Key offerings for Varalakshmi: kumkum (vermillion), turmeric, bangles, betel leaves, and coconut. Women apply kumkum to the kalash. Offer blouse pieces, a mirror, and a comb — items associated with feminine adornment.',
    instruction_te: 'షోడశోపచారాలు చేయండి. వరలక్ష్మికి ముఖ్యమైనవి: కుంకుమ, పసుపు, గాజులు, తమలపాకులు, కొబ్బరికాయ. మహిళలు కళశానికి కుంకుమ పెట్టాలి.',
    instruction_ta: 'ஷோடஷோபசாரம் செய்யுங்கள். வரலட்சுமிக்கு முக்கியமான நைவேத்யங்கள்: குங்குமம், மஞ்சள், வளையல்கள், வெற்றிலை, தேங்காய்.',
    instruction_hi: 'षोडशोपचार पूजा करें। वरलक्ष्मी के लिए विशेष: कुमकुम, हल्दी, चूड़ियां, पान, नारियल। महिलाएं कलश पर कुमकुम लगाएं। चुनरी, दर्पण और कंघी भी अर्पित करें।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'varalakshmi-vratham', parent_type: 'vratham', step_number: 4,
    step_title_en: 'Thread Tying and Closing',
    step_title_te: 'రక్ష దారం కట్టడం',
    step_title_ta: 'கயிறு கட்டுதல் மற்றும் நிறைவு',
    step_title_hi: 'धागा बांधना और समापन',
    instruction_en: 'Tie the sacred yellow thread (raksha doram) on the right wrist of married women. Break the coconut, offer dakshina, and distribute prasad (sweet pongal, fruits, and flowers). Recite the Varalakshmi Vrata Katha.',
    instruction_te: 'పసుపు రక్ష దారాన్ని వివాహిత స్త్రీల కుడి చేతికి కట్టండి. కొబ్బరికాయ కొట్టి దక్షిణ సమర్పించి ప్రసాదం పంచండి.',
    instruction_ta: 'திருமணமான பெண்களின் வலது கைகளில் புனித மஞ்சள் நூலை கட்டுங்கள். தேங்காய் உடைத்து, தக்ஷிணை கொடுத்து பிரசாதம் வினியோகிக்கவும்.',
    instruction_hi: 'सुहागन महिलाओं के दाएं हाथ में पीला पवित्र धागा बांधें। नारियल फोड़ें, दक्षिणा दें, और प्रसाद बांटें।',
    recite_shloka_slug: '', notes_en: '' },

  // ekadashi-vratham
  { parent_slug: 'ekadashi-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Day-Long Fast (Upavasa)',
    step_title_te: 'ఏకాదశి ఉపవాసం',
    step_title_ta: 'ஏகாதசி உபவாசம்',
    step_title_hi: 'एकादशी उपवास',
    instruction_en: 'From the previous night (Dashami), begin fasting. On Ekadashi, avoid rice, grains, lentils, and non-vegetarian food entirely. Fruits, milk, nuts, and root vegetables are permitted. Those who can, observe a complete fast (nirjala).',
    instruction_te: 'దశమి నుండే ఆహారం తగ్గించండి. ఏకాదశి రోజు అన్నం, ధాన్యాలు, పప్పులు తినకూడదు. పండ్లు, పాలు, పళ్ళు, దుంపలు తినవచ్చు. శక్తి ఉంటే నిర్జల ఉపవాసం పాటించండి.',
    instruction_ta: 'தசமியிலிருந்தே உணவை குறையுங்கள். ஏகாதசியில் அரிசி, தானியங்கள், பருப்புகள் வேண்டாம். பழங்கள், பால், கிழங்குகள் சாப்பிடலாம்.',
    instruction_hi: 'दशमी की रात से आहार कम करें। एकादशी को चावल, अनाज, दाल, मांस वर्जित है। फल, दूध, मेवे और कंद-मूल खा सकते हैं। शक्ति हो तो निर्जला व्रत रखें।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'ekadashi-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Vishnu Puja',
    step_title_te: 'విష్ణు పూజ',
    step_title_ta: 'விஷ்ணு பூஜை',
    step_title_hi: 'विष्णु पूजा',
    instruction_en: 'Perform puja to Lord Vishnu. Offer tulsi leaves — they are essential and must not be omitted. Offer yellow flowers and fruits. Recite the Vishnu Ashtothram (108 names) or chant "Om Namo Narayanaya" 108 times.',
    instruction_te: 'విష్ణు పూజ చేయండి. తులసి ఆకులు తప్పనిసరిగా అర్పించాలి. పసుపు పూలు, పండ్లు అర్పించండి. విష్ణు అష్టోత్రం చదవండి లేదా "ఓం నమో నారాయణాయ" 108 సార్లు జపించండి.',
    instruction_ta: 'விஷ்ணு பூஜை செய்யுங்கள். துளசி இலைகள் கட்டாயம் அர்ப்பணிக்க வேண்டும். மஞ்சள் மலர்கள் மற்றும் பழங்கள் கொடுங்கள்.',
    instruction_hi: 'भगवान विष्णु की पूजा करें। तुलसी पत्र अनिवार्य रूप से चढ़ाएं। पीले फूल और फल अर्पित करें। विष्णु अष्टोत्तर या "ओम नमो नारायणाय" 108 बार जपें।',
    recite_shloka_slug: 'vishnu-ashtothram', notes_en: '' },

  { parent_slug: 'ekadashi-vratham', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Break Fast on Dwadashi',
    step_title_te: 'ద్వాదశి రోజు ఉపవాస పారణ',
    step_title_ta: 'துவாதசியில் விரதம் முடித்தல்',
    step_title_hi: 'द्वादशी को व्रत तोड़ना',
    instruction_en: 'On Dwadashi (the 12th tithi), after morning prayers, break the fast with grain-based food. It is considered important to break the fast within the Dwadashi window — do not delay to Trayodashi.',
    instruction_te: 'ద్వాదశి రోజు ఉదయం పూజ చేసి అన్నాహారంతో ఉపవాసం విడవండి. ద్వాదశి వేళ తప్పిపోకుండా పారణ చేయాలి.',
    instruction_ta: 'துவாதசியில் காலை பூஜை செய்து தானிய உணவால் விரதம் முடியுங்கள். துவாதசி வேளையில் பாரணை செய்வது அவசியம்.',
    instruction_hi: 'द्वादशी के दिन प्रातः पूजा के बाद अनाज से बने भोजन से व्रत तोड़ें। द्वादशी काल में ही पारण करना जरूरी है, त्रयोदशी तक न टालें।',
    recite_shloka_slug: '', notes_en: '' },

  // pradosha-vratham
  { parent_slug: 'pradosha-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Pradosha Kalam Abhishekam',
    step_title_te: 'ప్రదోష కాలంలో అభిషేకం',
    step_title_ta: 'பிரதோஷ காலத்தில் அபிஷேகம்',
    step_title_hi: 'प्रदोष काल में अभिषेक',
    instruction_en: 'Pradosha time is the 1.5-hour window before sunset on the Trayodashi tithi. During this window, perform abhishekam of the Shiva Lingam with milk, water, honey, curd, and ghee. This is considered the most auspicious time for Shiva worship.',
    instruction_te: 'త్రయోదశి తిథిన సూర్యాస్తమయానికి ముందు 1.5 గంటల ప్రదోష కాలంలో శివలింగానికి పాలు, నీళ్ళు, తేనె, పెరుగు, నెయ్యితో అభిషేకం చేయండి.',
    instruction_ta: 'திரயோதசி திதியில் சூரிய அஸ்தமனத்திற்கு 1.5 மணி நேரம் முன்பாக பிரதோஷ காலத்தில் சிவலிங்கத்திற்கு அபிஷேகம் செய்யுங்கள்.',
    instruction_hi: 'त्रयोदशी तिथि पर सूर्यास्त से 1.5 घंटे पहले के प्रदोष काल में शिवलिंग पर दूध, जल, शहद, दही और घी से अभिषेक करें।',
    recite_shloka_slug: 'shiva-ashtothram', notes_en: '' },

  { parent_slug: 'pradosha-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Bel Patra and Flower Offerings',
    step_title_te: 'బిల్వ పత్ర అర్పణ',
    step_title_ta: 'வில்வ இலை மற்றும் மலர் அர்ப்பணம்',
    step_title_hi: 'बेल पत्र और पुष्प अर्पण',
    instruction_en: 'Offer bel (bilva) leaves in sets of three — they represent the three eyes of Shiva. Apply vibhuti (sacred ash) to the lingam. Offer white flowers — dhatura, white roses, or jasmine are especially dear to Shiva. Chant "Om Namah Shivaya" with each offering.',
    instruction_te: 'మూడేసి బిల్వ పత్రాలు (శివుని మూడు నేత్రాల ప్రతీకలు) అర్పించండి. శివలింగానికి విభూతి పెట్టండి. తెల్లని పూలు — ఉమ్మెత్తా, తెల్ల గులాబీ అర్పించండి.',
    instruction_ta: 'மூன்று வில்வ இலைகளை (சிவனின் மூன்று கண்களை குறிக்கும்) அர்ப்பணிக்கவும். திருநீறு பூசி வெண்ணிற மலர்கள் தாருங்கள்.',
    instruction_hi: 'तीन-तीन बेल पत्र (शिव के तीन नेत्रों का प्रतीक) चढ़ाएं। विभूति लगाएं। सफेद फूल — धतूरा, सफेद गुलाब अर्पित करें। हर अर्पण के साथ "ओम नमः शिवाय" जपें।',
    recite_shloka_slug: 'shiva-ashtothram', notes_en: '' },

  { parent_slug: 'pradosha-vratham', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Nandi Pradakshina',
    step_title_te: 'నంది ప్రదక్షిణ',
    step_title_ta: 'நந்தி பிரதட்சிணை',
    step_title_hi: 'नंदी प्रदक्षिणा',
    instruction_en: 'In a Shiva temple, circumambulate the Shiva Lingam (pradakshina) during the pradosha kalam. Worship Nandi (the sacred bull) before entering the sanctum. Maintain silence or chanting during pradosha time — avoid casual conversation.',
    instruction_te: 'శివాలయంలో ప్రదోష కాలంలో శివలింగానికి ప్రదక్షిణలు చేయండి. లోపలికి వెళ్ళే ముందు నందిని పూజించండి. ప్రదోష కాలంలో మౌనంగా లేదా మంత్ర జపంలో ఉండండి.',
    instruction_ta: 'சிவன் கோவிலில் பிரதோஷ காலத்தில் சிவலிங்கத்தை சுற்றி பிரதட்சிணம் செய்யுங்கள். கர்ப்பகிருஹத்திற்கு முன் நந்தியை வணங்குங்கள்.',
    instruction_hi: 'शिव मंदिर में प्रदोष काल में शिवलिंग की परिक्रमा करें। गर्भगृह जाने से पहले नंदी की पूजा करें। प्रदोष काल में मौन या जप में रहें।',
    recite_shloka_slug: '', notes_en: '' },

  // mondays-shiva-vratham
  { parent_slug: 'mondays-shiva-vratham', parent_type: 'vratham', step_number: 1,
    step_title_en: 'Dawn Bath and Temple Visit',
    step_title_te: 'తెల్లవారు స్నానం మరియు శివాలయ దర్శనం',
    step_title_ta: 'அதிகாலை குளியல் மற்றும் கோவில் வருகை',
    step_title_hi: 'प्रातःकाल स्नान और शिव मंदिर दर्शन',
    instruction_en: 'Wake before sunrise, bathe, and wear clean white or pale-colored clothes. Visit the nearest Shiva temple early in the morning. Monday is Shiva\'s day — the blessings are especially potent.',
    instruction_te: 'సూర్యోదయానికి ముందు లేచి స్నానం చేసి, తెల్లని లేదా తేలికపాటి రంగు వస్త్రాలు ధరించండి. దగ్గరలోని శివాలయాన్ని ఉదయమే దర్శించండి.',
    instruction_ta: 'சூரிய உதயத்திற்கு முன் எழுந்து குளித்து, வெண்ணிறம் அல்லது இளம் நிற ஆடைகள் அணியுங்கள். அருகில் உள்ள சிவன் கோவிலுக்கு செல்லுங்கள்.',
    instruction_hi: 'सूर्योदय से पहले उठकर स्नान करें, सफेद या हल्के रंग के कपड़े पहनें। नजदीकी शिव मंदिर में सुबह दर्शन करें।',
    recite_shloka_slug: '', notes_en: '' },

  { parent_slug: 'mondays-shiva-vratham', parent_type: 'vratham', step_number: 2,
    step_title_en: 'Abhishekam and Offerings',
    step_title_te: 'అభిషేకం మరియు అర్చన',
    step_title_ta: 'அபிஷேகம் மற்றும் அர்ச்சனை',
    step_title_hi: 'अभिषेक और अर्चना',
    instruction_en: 'Offer bel leaves and pour milk on the Shiva Lingam. Offer white flowers. Chant the Shiva Ashtothram (108 names of Shiva) or "Om Namah Shivaya" 108 times. Apply vibhuti to your forehead after the puja.',
    instruction_te: 'శివలింగానికి బిల్వ పత్రాలు అర్పించి పాలు పోయండి. తెల్లని పూలు అర్పించండి. శివ అష్టోత్రం చదవండి లేదా "ఓం నమః శివాయ" 108 సార్లు జపించండి.',
    instruction_ta: 'சிவலிங்கத்திற்கு வில்வ இலைகள் அர்ப்பணித்து பால் ஊற்றுங்கள். வெண்ணிற மலர்கள் தாருங்கள். சிவ அஷ்டோத்திரம் சொல்லுங்கள்.',
    instruction_hi: 'शिवलिंग पर बेल पत्र चढ़ाएं और दूध चढ़ाएं। सफेद फूल अर्पित करें। शिव अष्टोत्तर या "ओम नमः शिवाय" 108 बार जपें। पूजा के बाद विभूति लगाएं।',
    recite_shloka_slug: 'shiva-ashtothram', notes_en: '' },

  { parent_slug: 'mondays-shiva-vratham', parent_type: 'vratham', step_number: 3,
    step_title_en: 'Fast and Evening Aarti',
    step_title_te: 'ఉపవాసం మరియు సాయంత్రం ఆరతి',
    step_title_ta: 'உபவாசம் மற்றும் மாலை ஆரத்தி',
    step_title_hi: 'उपवास और संध्या आरती',
    instruction_en: 'Observe a half-day or full-day fast. If full day, break fast after the evening aarti or sunset. If half-day, take a simple meal at midday. Attend or perform the evening aarti at home before eating.',
    instruction_te: 'సగం రోజు లేదా పూర్తి రోజు ఉపవాసం పాటించండి. పూర్తి రోజు ఉపవాసమైతే సాయంత్రం ఆరతి తర్వాత పారణ చేయండి.',
    instruction_ta: 'அரை நாள் அல்லது முழு நாள் உபவாசம் இருங்கள். மாலை ஆரத்திக்கு பிறகு விரதம் முடியுங்கள்.',
    instruction_hi: 'आधे दिन या पूरे दिन उपवास रखें। पूरे दिन व्रत हो तो संध्या आरती के बाद पारण करें। घर पर संध्या आरती करें।',
    recite_shloka_slug: '', notes_en: '' },
];

// ── Material items ────────────────────────────────────────────────────────────
const MATERIALS = [
  // satyanarayana-vratham
  { group_slug: 'satyanarayana-vratham', item_order: 1, item_name_en: 'Vishnu / Satyanarayana idol or image', item_name_te: 'సత్యనారాయణ విగ్రహం లేదా పటం', item_name_ta: 'சத்யநாராயண சிலை அல்லது படம்', item_name_hi: 'सत्यनारायण प्रतिमा या चित्र', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 2, item_name_en: 'Tulsi leaves', item_name_te: 'తులసి ఆకులు', item_name_ta: 'துளசி இலைகள்', item_name_hi: 'तुलसी पत्र', quantity_en: 'handful', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 3, item_name_en: 'Milk', item_name_te: 'పాలు', item_name_ta: 'பால்', item_name_hi: 'दूध', quantity_en: '500 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 4, item_name_en: 'Curd', item_name_te: 'పెరుగు', item_name_ta: 'தயிர்', item_name_hi: 'दही', quantity_en: '100 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 5, item_name_en: 'Honey', item_name_te: 'తేనె', item_name_ta: 'தேன்', item_name_hi: 'शहद', quantity_en: '50 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 6, item_name_en: 'Ghee', item_name_te: 'నెయ్యి', item_name_ta: 'நெய்', item_name_hi: 'घी', quantity_en: '100 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 7, item_name_en: 'Sugar', item_name_te: 'చక్కెర', item_name_ta: 'சர்க்கரை', item_name_hi: 'चीनी', quantity_en: '200 g', is_optional: false, substitution_note_en: 'For panchamrit and sheera prasad' },
  { group_slug: 'satyanarayana-vratham', item_order: 8, item_name_en: 'Semolina (sooji/rava)', item_name_te: 'రవ్వ', item_name_ta: 'ரவை', item_name_hi: 'सूजी', quantity_en: '250 g', is_optional: false, substitution_note_en: 'For sheera prasad' },
  { group_slug: 'satyanarayana-vratham', item_order: 9, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '2', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 10, item_name_en: 'Yellow flowers', item_name_te: 'పసుపు పూలు', item_name_ta: 'மஞ்சள் மலர்கள்', item_name_hi: 'पीले फूल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 11, item_name_en: 'Banana (pancha phala fruits)', item_name_te: 'అరటి పండ్లు (పంచ ఫలాలు)', item_name_ta: 'வாழைப்பழம் (பஞ்ச பலம்)', item_name_hi: 'केला (पंच फल)', quantity_en: 'assorted', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 12, item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 13, item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கர்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small piece', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 14, item_name_en: 'Betel leaves and areca nuts', item_name_te: 'తమలపాకులు మరియు వక్కలు', item_name_ta: 'வெற்றிலை மற்றும் பாக்கு', item_name_hi: 'पान और सुपारी', quantity_en: '10 each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 15, item_name_en: 'Yellow cloth', item_name_te: 'పసుపు వస్త్రం', item_name_ta: 'மஞ்சள் துணி', item_name_hi: 'पीला वस्त्र', quantity_en: '1 piece', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 16, item_name_en: 'Turmeric and kumkum', item_name_te: 'పసుపు మరియు కుంకుమ', item_name_ta: 'மஞ்சள் மற்றும் குங்குமம்', item_name_hi: 'हल्दी और कुमकुम', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'satyanarayana-vratham', item_order: 17, item_name_en: 'Banana leaves', item_name_te: 'అరటి ఆకులు', item_name_ta: 'வாழை இலை', item_name_hi: 'केले के पत्ते', quantity_en: '2–3', is_optional: true, substitution_note_en: 'For serving prasad' },

  // varalakshmi-vratham
  { group_slug: 'varalakshmi-vratham', item_order: 1, item_name_en: 'Lakshmi idol or image', item_name_te: 'లక్ష్మీదేవి విగ్రహం లేదా పటం', item_name_ta: 'லட்சுமி சிலை அல்லது படம்', item_name_hi: 'लक्ष्मी प्रतिमा या चित्र', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 2, item_name_en: 'Kalash (brass or copper pot)', item_name_te: 'కళశం (రాగి లేదా ఇత్తడి)', item_name_ta: 'கலசம் (இத்தள் அல்லது செம்பு)', item_name_hi: 'कलश (पीतल या तांबा)', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 3, item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 4, item_name_en: 'Mango leaves', item_name_te: 'మామిడి ఆకులు', item_name_ta: 'மாவிலை', item_name_hi: 'आम के पत्ते', quantity_en: 'handful', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 5, item_name_en: 'Kumkum (vermillion)', item_name_te: 'కుంకుమ', item_name_ta: 'குங்குமம்', item_name_hi: 'कुमकुम', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 6, item_name_en: 'Turmeric', item_name_te: 'పసుపు', item_name_ta: 'மஞ்சள்', item_name_hi: 'हल्दी', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 7, item_name_en: 'Glass bangles', item_name_te: 'గాజులు', item_name_ta: 'வளையல்கள்', item_name_hi: 'कांच की चूड़ियां', quantity_en: 'pair', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 8, item_name_en: 'Yellow / marigold flowers', item_name_te: 'పసుపు / చేమంతి పూలు', item_name_ta: 'மஞ்சள் / சாமந்தி மலர்கள்', item_name_hi: 'पीले / गेंदे के फूल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 9, item_name_en: 'Sacred yellow thread (raksha doram)', item_name_te: 'పసుపు రక్ష దారం', item_name_ta: 'மஞ்சள் ரட்சா தோரம்', item_name_hi: 'पीला पवित्र धागा', quantity_en: '1 per woman', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 10, item_name_en: 'Fruits (assorted)', item_name_te: 'పండ్లు (వివిధ రకాలు)', item_name_ta: 'பழங்கள் (பலவகை)', item_name_hi: 'फल (विविध)', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 11, item_name_en: 'Sweets (sweet pongal or payasam)', item_name_te: 'మిఠాయి (చక్కర పొంగలి లేదా పాయసం)', item_name_ta: 'இனிப்பு (சக்கர பொங்கல் அல்லது பாயசம்)', item_name_hi: 'मिठाई (चक्कर पोंगल या खीर)', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 12, item_name_en: 'Incense and camphor', item_name_te: 'అగరబత్తులు మరియు కర్పూరం', item_name_ta: 'அகர்பத்தி மற்றும் கர்பூரம்', item_name_hi: 'अगरबत्ती और कपूर', quantity_en: '1 pack each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'varalakshmi-vratham', item_order: 13, item_name_en: 'Blouse piece (for Goddess)', item_name_te: 'రవికె గుడ్డ (దేవికి)', item_name_ta: 'ரவிக்கை துணி (தேவிக்கு)', item_name_hi: 'ब्लाउज पीस (देवी के लिए)', quantity_en: '1', is_optional: true, substitution_note_en: '' },

  // ekadashi-vratham
  { group_slug: 'ekadashi-vratham', item_order: 1, item_name_en: 'Vishnu idol or image', item_name_te: 'విష్ణు విగ్రహం లేదా పటం', item_name_ta: 'விஷ்ணு சிலை அல்லது படம்', item_name_hi: 'विष्णु प्रतिमा या चित्र', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'ekadashi-vratham', item_order: 2, item_name_en: 'Tulsi leaves', item_name_te: 'తులసి ఆకులు', item_name_ta: 'துளசி இலைகள்', item_name_hi: 'तुलसी पत्र', quantity_en: 'large handful', is_optional: false, substitution_note_en: 'Essential — must not be omitted for Vishnu worship' },
  { group_slug: 'ekadashi-vratham', item_order: 3, item_name_en: 'Yellow flowers', item_name_te: 'పసుపు పూలు', item_name_ta: 'மஞ்சள் மலர்கள்', item_name_hi: 'पीले फूल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'ekadashi-vratham', item_order: 4, item_name_en: 'Fruits (non-grain prasad)', item_name_te: 'పండ్లు', item_name_ta: 'பழங்கள்', item_name_hi: 'फल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'ekadashi-vratham', item_order: 5, item_name_en: 'Milk', item_name_te: 'పాలు', item_name_ta: 'பால்', item_name_hi: 'दूध', quantity_en: '250 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'ekadashi-vratham', item_order: 6, item_name_en: 'Incense and camphor', item_name_te: 'అగరబత్తులు మరియు కర్పూరం', item_name_ta: 'அகர்பத்தி மற்றும் கர்பூரம்', item_name_hi: 'अगरबत्ती और कपूर', quantity_en: '1 pack each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'ekadashi-vratham', item_order: 7, item_name_en: 'Sabudana / amaranth (for fasting food)', item_name_te: 'సాబూదానా (ఉపవాస ఆహారానికి)', item_name_ta: 'சாபுதானா (உபவாச உணவுக்கு)', item_name_hi: 'साबूदाना (व्रत के भोजन के लिए)', quantity_en: 'as needed', is_optional: true, substitution_note_en: '' },

  // pradosha-vratham
  { group_slug: 'pradosha-vratham', item_order: 1, item_name_en: 'Bel (bilva) leaves', item_name_te: 'బిల్వ పత్రాలు', item_name_ta: 'வில்வ இலைகள்', item_name_hi: 'बेल पत्र', quantity_en: '108+', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 2, item_name_en: 'Milk', item_name_te: 'పాలు', item_name_ta: 'பால்', item_name_hi: 'दूध', quantity_en: '500 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 3, item_name_en: 'Honey', item_name_te: 'తేనె', item_name_ta: 'தேன்', item_name_hi: 'शहद', quantity_en: '50 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 4, item_name_en: 'Ghee', item_name_te: 'నెయ్యి', item_name_ta: 'நெய்', item_name_hi: 'घी', quantity_en: '50 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 5, item_name_en: 'Vibhuti (sacred ash)', item_name_te: 'విభూతి', item_name_ta: 'திருநீறு', item_name_hi: 'विभूति', quantity_en: 'small amount', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 6, item_name_en: 'White flowers', item_name_te: 'తెల్లని పూలు', item_name_ta: 'வெண்ணிற மலர்கள்', item_name_hi: 'सफेद फूल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 7, item_name_en: 'Incense and camphor', item_name_te: 'అగరబత్తులు మరియు కర్పూరం', item_name_ta: 'அகர்பத்தி மற்றும் கர்பூரம்', item_name_hi: 'अगरबत्ती और कपूर', quantity_en: '1 pack each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'pradosha-vratham', item_order: 8, item_name_en: 'Dhatura flower', item_name_te: 'ఉమ్మెత్తా పువ్వు', item_name_ta: 'ஊமத்தை பூ', item_name_hi: 'धतूरा', quantity_en: 'a few', is_optional: true, substitution_note_en: 'Especially dear to Shiva, if available' },

  // mondays-shiva-vratham
  { group_slug: 'mondays-shiva-vratham', item_order: 1, item_name_en: 'Shiva idol or image', item_name_te: 'శివుని విగ్రహం లేదా పటం', item_name_ta: 'சிவன் சிலை அல்லது படம்', item_name_hi: 'शिव प्रतिमा या चित्र', quantity_en: '1', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 2, item_name_en: 'Bel (bilva) leaves', item_name_te: 'బిల్వ పత్రాలు', item_name_ta: 'வில்வ இலைகள்', item_name_hi: 'बेल पत्र', quantity_en: '108+', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 3, item_name_en: 'Milk', item_name_te: 'పాలు', item_name_ta: 'பால்', item_name_hi: 'दूध', quantity_en: '250 ml', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 4, item_name_en: 'White flowers', item_name_te: 'తెల్లని పూలు', item_name_ta: 'வெண்ணிற மலர்கள்', item_name_hi: 'सफेद फूल', quantity_en: 'as needed', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 5, item_name_en: 'Vibhuti (sacred ash)', item_name_te: 'విభూతి', item_name_ta: 'திருநீறு', item_name_hi: 'विभूति', quantity_en: 'small amount', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 6, item_name_en: 'Incense and camphor', item_name_te: 'అగరబత్తులు మరియు కర్పూరం', item_name_ta: 'அகர்பத்தி மற்றும் கர்பூரம்', item_name_hi: 'अगरबत्ती और कपूर', quantity_en: '1 pack each', is_optional: false, substitution_note_en: '' },
  { group_slug: 'mondays-shiva-vratham', item_order: 7, item_name_en: 'Rudraksha mala', item_name_te: 'రుద్రాక్ష మాల', item_name_ta: 'ருத்ராட்ச மாலை', item_name_hi: 'रुद्राक्ष माला', quantity_en: '1', is_optional: true, substitution_note_en: '' },
];

// ── Linked story slugs ────────────────────────────────────────────────────────
const STORY_LINKS = {
  'satyanarayana-vratham': 'satyanarayana-story-1',
  'varalakshmi-vratham': 'varalakshmi-katha',
};

async function main() {
  // 1. Check for existing procedure_steps rows
  const stepsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'procedure_steps!A:A' });
  const existingSlugs = new Set((stepsRes.data.values || []).slice(1).map(r => r[0]));

  const vrathaSlugs = new Set(['satyanarayana-vratham','varalakshmi-vratham','ekadashi-vratham','pradosha-vratham','mondays-shiva-vratham']);
  const newSteps = STEPS.filter(s => vrathaSlugs.has(s.parent_slug) && !existingSlugs.has(s.parent_slug));

  if (newSteps.length > 0) {
    const rows = newSteps.map(s => [
      s.parent_slug, s.parent_type, s.step_number,
      s.step_title_en, s.step_title_te, s.step_title_ta, s.step_title_hi,
      s.instruction_en, s.instruction_te, s.instruction_ta, s.instruction_hi,
      s.recite_shloka_slug, '', s.notes_en,
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'procedure_steps',
      valueInputOption: 'RAW', requestBody: { values: rows },
    });
    console.log(`✓ Added ${rows.length} procedure_steps rows`);
  } else {
    // If some already exist, only add the missing ones
    const allVrathamSteps = STEPS.filter(s => vrathaSlugs.has(s.parent_slug));
    const missingSteps = allVrathamSteps.filter(s => !existingSlugs.has(s.parent_slug));
    if (missingSteps.length > 0) {
      const rows = missingSteps.map(s => [
        s.parent_slug, s.parent_type, s.step_number,
        s.step_title_en, s.step_title_te, s.step_title_ta, s.step_title_hi,
        s.instruction_en, s.instruction_te, s.instruction_ta, s.instruction_hi,
        s.recite_shloka_slug, '', s.notes_en,
      ]);
      await sheets.spreadsheets.values.append({
        spreadsheetId, range: 'procedure_steps',
        valueInputOption: 'RAW', requestBody: { values: rows },
      });
      console.log(`✓ Added ${rows.length} procedure_steps rows`);
    } else {
      console.log('ℹ procedure_steps: all vratham steps already present');
    }
  }

  // 2. Check for existing material_items rows
  const matsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'material_items!A:A' });
  const existingGroups = new Set((matsRes.data.values || []).slice(1).map(r => r[0]));

  const newMats = MATERIALS.filter(m => !existingGroups.has(m.group_slug));

  if (newMats.length > 0) {
    const rows = newMats.map(m => [
      m.group_slug, m.item_order,
      m.item_name_en, m.item_name_te, m.item_name_ta, m.item_name_hi,
      m.quantity_en, m.is_optional ? 'true' : 'false', m.substitution_note_en,
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'material_items',
      valueInputOption: 'RAW', requestBody: { values: rows },
    });
    console.log(`✓ Added ${rows.length} material_items rows`);
  } else {
    console.log('ℹ material_items: all vratham materials already present');
  }

  // 3. Update linked_story_slug in vrathams sheet
  const vrathamsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'vrathams' });
  const [headers, ...dataRows] = vrathamsRes.data.values || [];
  const slugCol = headers.indexOf('slug');
  const storyCol = headers.indexOf('linked_story_slug');

  if (storyCol === -1) {
    console.log('⚠ linked_story_slug column not found in vrathams sheet');
  } else {
    for (const [slug, storySlug] of Object.entries(STORY_LINKS)) {
      const rowIdx = dataRows.findIndex(r => r[slugCol] === slug);
      if (rowIdx === -1) { console.log(`⚠ Vratham not found: ${slug}`); continue; }
      const sheetRow = rowIdx + 2; // 1-indexed + header
      const colLetter = String.fromCharCode(65 + storyCol);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `vrathams!${colLetter}${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[storySlug]] },
      });
      console.log(`✓ Linked ${slug} → ${storySlug}`);
    }
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
