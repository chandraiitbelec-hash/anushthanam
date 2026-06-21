// node scripts/populate-festival-details.mjs
import { google } from 'googleapis';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

// ─── Procedure Steps Data ─────────────────────────────────────────────────────

const PROCEDURE_STEPS = [
  // ganesh-chaturthi
  {
    parent_slug: 'ganesh-chaturthi', parent_type: 'festival', step_number: '1',
    step_title_en: 'Preparation', step_title_te: 'సన్నాహం', step_title_ta: 'தயாரிப்பு', step_title_hi: 'तैयारी',
    instruction_en: 'Clean the puja area, set up a raised platform with a clean cloth. Place fresh flowers and rangoli. Bring home a Ganesha idol (preferably clay/eco-friendly).',
    instruction_te: 'పూజ స్థలాన్ని శుభ్రపరిచి, పరిశుద్ధమైన వస్త్రంతో వేదికను అలంకరించండి. విఘ్నేశ్వరుని మట్టి విగ్రహాన్ని తీసుకు వచ్చి ప్రతిష్టించండి.',
    instruction_ta: 'பூஜை இடத்தை சுத்தப்படுத்தி, தூய்மையான துணியை விரிக்கவும். மண் கணேஷ் சிலையை கொண்டு வந்து நிறுவுங்கள்.',
    instruction_hi: 'पूजा स्थल को साफ करें, पवित्र वस्त्र बिछाएं। मिट्टी की गणेश प्रतिमा लाकर स्थापित करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'ganesh-chaturthi', parent_type: 'festival', step_number: '2',
    step_title_en: 'Invocation (Pranapratishtha)', step_title_te: 'ఆవాహనం (ప్రాణప్రతిష్ఠ)', step_title_ta: 'ஆவாஹனம் (பிராணப்பிரதிஷ்டா)', step_title_hi: 'आवाहन (प्राणप्रतिष्ठा)',
    instruction_en: 'Invoke the presence of Lord Ganesha in the idol with mantras. Light the lamp, offer incense, and chant "Om Gam Ganapataye Namaha" 108 times.',
    instruction_te: 'మంత్రాలతో విగ్రహంలో గణేశుని ఆహ్వానించండి. దీపం వెలిగించి ధూపం వేసి "ఓం గం గణపతయే నమః" 108 సార్లు జపించండి.',
    instruction_ta: 'மந்திரங்களால் சிலையில் கணேஷை ஆவாஹனம் செய்யுங்கள். விளக்கேற்றி "ஓம் கம் கணபதயே நமஹ" 108 முறை சொல்லுங்கள்.',
    instruction_hi: 'मंत्रों से प्राणप्रतिष्ठा करें। दीपक जलाएं और "ओम गम गणपतये नमः" 108 बार जपें।',
    recite_shloka_slug: 'ganesha-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'ganesh-chaturthi', parent_type: 'festival', step_number: '3',
    step_title_en: 'Daily Puja', step_title_te: 'రోజువారీ పూజ', step_title_ta: 'தினசரி பூஜை', step_title_hi: 'दैनिक पूजा',
    instruction_en: 'Offer 21 durva grass blades, 21 red flowers (hibiscus preferred), modak sweets, coconut, and fruits. Perform aarti twice a day (morning and evening).',
    instruction_te: '21 దూర్వా గడ్డి, 21 ఎర్ర పూలు (మందారం), మోదకాలు, కొబ్బరికాయ అర్పించండి. రోజూ ఉదయ సాయంత్రం ఆరతి ఇవ్వండి.',
    instruction_ta: '21 அருகம்புல், 21 சிவப்பு மலர்கள், மோதகம், தேங்காய் அர்ப்பணிக்கவும்.',
    instruction_hi: '21 दूर्वा, 21 लाल फूल, मोदक, नारियल अर्पित करें। सुबह-शाम आरती करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'ganesh-chaturthi', parent_type: 'festival', step_number: '4',
    step_title_en: 'Festival Katha', step_title_te: 'వ్రత కథ', step_title_ta: 'விரத கதை', step_title_hi: 'व्रत कथा',
    instruction_en: 'Read or listen to the Ganesha Vrata Katha on the day of the festival. This narrates the significance and stories of Ganesha worship.',
    instruction_te: 'పండుగ రోజు గణేశ వ్రత కథను చదవండి లేదా వినండి.',
    instruction_ta: 'திருவிழா நாளில் கணேஷ விரத கதை படியுங்கள் அல்லது கேளுங்கள்.',
    instruction_hi: 'पर्व के दिन गणेश व्रत कथा सुनें या पढ़ें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'ganesh-chaturthi', parent_type: 'festival', step_number: '5',
    step_title_en: 'Visarjan (Immersion)', step_title_te: 'విసర్జన', step_title_ta: 'விசர்ஜனம்', step_title_hi: 'विसर्जन',
    instruction_en: 'On the final day (1st, 3rd, 5th, 7th, or 11th day), perform the farewell puja. Bid goodbye to Ganesha with "Ganpati Bappa Morya!" and immerse the idol in a water body or bucket of water.',
    instruction_te: 'చివరి రోజు (1, 3, 5, 7 లేదా 11వ రోజు) వీడ్కోలు పూజ చేయండి. "గణపతి బప్పా మోర్యా!" అంటూ విగ్రహాన్ని నీటిలో నిమజ్జనం చేయండి.',
    instruction_ta: 'இறுதி நாளில் விடைபெறும் பூஜை செய்யுங்கள். விக்ரஹத்தை நீரில் மூழ்க வையுங்கள்.',
    instruction_hi: 'अंतिम दिन विदाई पूजा करें। "गणपति बप्पा मोरया!" कहते हुए मूर्ति का विसर्जन करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },

  // maha-shivaratri
  {
    parent_slug: 'maha-shivaratri', parent_type: 'festival', step_number: '1',
    step_title_en: 'Day-long Fast', step_title_te: 'పగటి ఉపవాసం', step_title_ta: 'நாள் முழுவதும் உண்ணாவிரதம்', step_title_hi: 'दिनभर उपवास',
    instruction_en: 'Observe a complete fast without food or water (nirjala) or partial fast with fruits. Take a ritual bath at dawn, wear clean white or light-colored clothes, and visit the nearest Shiva temple.',
    instruction_te: 'నిర్జల ఉపవాసం పాటించండి లేదా పళ్ళతో పాక్షిక ఉపవాసం ఉండండి. తెల్లవారుజామున స్నానమాచరించి, దగ్గరలోని శివాలయాన్ని సందర్శించండి.',
    instruction_ta: 'நிர்ஜல உண்ணாவிரதம் அல்லது பழ உணவு மட்டும் சாப்பிடுங்கள். காலையில் குளித்து அருகில் உள்ள சிவன் கோவிலுக்கு செல்லுங்கள்.',
    instruction_hi: 'निर्जल या फलाहार उपवास रखें। प्रातःकाल स्नान करके नजदीकी शिव मंदिर जाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'maha-shivaratri', parent_type: 'festival', step_number: '2',
    step_title_en: 'Abhishekam (Sacred Bath)', step_title_te: 'అభిషేకం', step_title_ta: 'அபிஷேகம்', step_title_hi: 'अभिषेक',
    instruction_en: 'Perform panchamrit abhishekam on the Shiva Lingam with milk, curd, honey, ghee, and sugar water in sequence. Then offer water (jalabhishekam).',
    instruction_te: 'శివలింగానికి పాలు, పెరుగు, తేనె, నెయ్యి, చక్కెర నీళ్ళతో పంచామృత అభిషేకం చేయండి. తరువాత జలాభిషేకం చేయండి.',
    instruction_ta: 'சிவலிங்கத்திற்கு பால், தயிர், தேன், நெய், சர்க்கரை நீர் கொண்டு பஞ்சாமிர்த அபிஷேகம் செய்யுங்கள்.',
    instruction_hi: 'शिवलिंग पर पंचामृत अभिषेक करें — दूध, दही, शहद, घी और मीठे जल से।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'maha-shivaratri', parent_type: 'festival', step_number: '3',
    step_title_en: 'Bel Patra Offering', step_title_te: 'బిల్వ పత్ర అర్పణ', step_title_ta: 'வில்வ இலை அர்ப்பணம்', step_title_hi: 'बेल पत्र अर्पण',
    instruction_en: 'Offer bel (bilva) leaves in sets of three — representing the three eyes of Shiva. Chant "Om Namah Shivaya" with each offering. Also offer white flowers, especially dhatura.',
    instruction_te: 'మూడేసి బిల్వ పత్రాలను (శివుని మూడు నేత్రాలకు ప్రతీకలు) అర్పించండి. "ఓం నమః శివాయ" జపిస్తూ తెల్లని పూలు, ముఖ్యంగా ఉమ్మెత్తా అర్పించండి.',
    instruction_ta: 'மூன்று பில்வ இலைகளை (சிவனின் மூன்று கண்களை குறிக்கும்) அர்ப்பணிக்கவும். "ஓம் நம சிவாய" சொல்லி வெண்ணிற மலர்கள் தாருங்கள்.',
    instruction_hi: 'बेल पत्र तीन-तीन के समूह में चढ़ाएं। "ओम नमः शिवाय" का जाप करते हुए सफेद फूल अर्पित करें।',
    recite_shloka_slug: 'shiva-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'maha-shivaratri', parent_type: 'festival', step_number: '4',
    step_title_en: 'Jagaran (Night Vigil)', step_title_te: 'జాగరణ', step_title_ta: 'ஜாகரண்', step_title_hi: 'जागरण',
    instruction_en: 'Stay awake through the four prahars (watches) of the night chanting Shiva\'s names, listening to Shiva Purana, or meditating. The four prahars are: 6-9 PM, 9 PM-12 AM, 12-3 AM, and 3-6 AM.',
    instruction_te: 'రాత్రి నాలుగు ప్రహరాలలో శివ నామ జపం, శివ పురాణ శ్రవణం చేసి జాగరణ పాటించండి.',
    instruction_ta: 'இரவு நான்கு ஜாமங்களில் சிவ நாம ஜபம், சிவ புராண கேட்டல் மூலம் விழித்திருங்கள்.',
    instruction_hi: 'रात के चारों पहर शिव नाम जप, शिव पुराण श्रवण करते हुए जागरण करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },

  // navaratri
  {
    parent_slug: 'navaratri', parent_type: 'festival', step_number: '1',
    step_title_en: 'Kalash Sthapana', step_title_te: 'కళశ స్థాపన', step_title_ta: 'கலச ஸ்தாபனா', step_title_hi: 'कलश स्थापना',
    instruction_en: 'Set up the sacred pot (kalash) filled with water, topped with a coconut and mango leaves. Place an image or idol of Goddess Durga/Devi. Light the akhand jyoti (continuous lamp) for 9 days.',
    instruction_te: 'మంగళ కలశాన్ని నీళ్ళతో నింపి, మామిడి ఆకులు, కొబ్బరికాయ పెట్టి స్థాపించండి. దుర్గాదేవి విగ్రహాన్ని ఉంచి అఖండ జ్యోతిని వెలిగించండి.',
    instruction_ta: 'கலசத்தை நீரால் நிரப்பி, மாவிலை மற்றும் தேங்காய் வைத்து நிறுவுங்கள். துர்கை சிலை அல்லது படத்தை வையுங்கள்.',
    instruction_hi: 'कलश स्थापना करें — जल से भरे कलश पर आम के पत्ते और नारियल रखें। अखंड ज्योति जलाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'navaratri', parent_type: 'festival', step_number: '2',
    step_title_en: 'Daily Puja with Navadurga', step_title_te: 'నవదుర్గ పూజ', step_title_ta: 'நவதுர்கை பூஜை', step_title_hi: 'नवदुर्गा पूजा',
    instruction_en: 'Each of the 9 days is dedicated to a different form of Devi: Shailaputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, Siddhidatri. Offer the specific color associated with each form.',
    instruction_te: 'తొమ్మిది రోజులూ నవదుర్గ రూపాలకు వేరు వేరు పూజలు చేయండి. ప్రతి రోజు ఆ రూపానికి నిర్దేశించిన రంగు వస్త్రాలు ధరించండి.',
    instruction_ta: 'ஒன்பது நாட்களும் நவதுர்கை வடிவங்களை வழிபடுங்கள். ஒவ்வொரு நாளும் அந்த வடிவத்துக்குரிய நிற ஆடை அணியுங்கள்.',
    instruction_hi: 'नौ दिन नवदुर्गा के अलग-अलग रूपों की पूजा करें। हर दिन उस रूप से संबंधित रंग के वस्त्र पहनें।',
    recite_shloka_slug: 'durga-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'navaratri', parent_type: 'festival', step_number: '3',
    step_title_en: 'Kolu / Golu Display', step_title_te: 'బొమ్మల కొలువు', step_title_ta: 'கொலு அலங்காரம்', step_title_hi: 'कोलू सजावट',
    instruction_en: 'Arrange decorative dolls (Kolu/Bommala Koluvu) on odd-numbered steps representing different realms of creation. Invite women and children for sundal prasad.',
    instruction_te: 'విషమ సంఖ్యలో మెట్లపై బొమ్మల కొలువు అలంకరించండి. స్నేహితులను, పిల్లలను పంచదార, పప్పు బహుమతులతో ఆహ్వానించండి.',
    instruction_ta: 'ஒற்றை படிகளில் கொலு பொம்மைகளை அலங்கரியுங்கள். நண்பர்களையும் குழந்தைகளையும் சுண்டல் பிரசாதத்துடன் அழையுங்கள்.',
    instruction_hi: 'विषम सीढ़ियों पर कोलू/बोम्मला कोलुवू सजाएं। महिलाओं और बच्चों को सुंदल प्रसाद के साथ आमंत्रित करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'navaratri', parent_type: 'festival', step_number: '4',
    step_title_en: 'Vijayadasami', step_title_te: 'విజయదశమి', step_title_ta: 'விஜயதசமி', step_title_hi: 'विजयादशमी',
    instruction_en: 'On the 10th day (Dussehra), perform the final puja and Aparajita Puja. Children begin new learning (vidyarambham). Books, tools, and musical instruments are worshipped.',
    instruction_te: 'పదవ రోజు (విజయదశమి) అపరాజిత పూజ చేయండి. పిల్లలకు విద్యారంభం చేయించండి. పుస్తకాలు, వాయిద్యాలు పూజించండి.',
    instruction_ta: 'பத்தாம் நாளில் (விஜயதசமி) அபராஜிதா பூஜை செய்யுங்கள். குழந்தைகளுக்கு வித்யாரம்பம் செய்யுங்கள்.',
    instruction_hi: 'विजयादशमी पर अपराजिता पूजा करें। बच्चों का विद्यारंभ करें। पुस्तकों और वाद्ययंत्रों की पूजा करें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },

  // diwali
  {
    parent_slug: 'diwali', parent_type: 'festival', step_number: '1',
    step_title_en: 'Cleaning and Decoration', step_title_te: 'శుభ్రత మరియు అలంకరణ', step_title_ta: 'சுத்தம் மற்றும் அலங்காரம்', step_title_hi: 'सफाई और सजावट',
    instruction_en: 'Deep clean the home several days before Diwali. Decorate with rangoli, flowers, and mango leaf torans. Place diyas (oil lamps) at the entrance, windows, and throughout the house.',
    instruction_te: 'దీపావళికి ముందు ఇల్లు శుభ్రంగా తీర్చిదిద్దండి. ముగ్గులు, పూలు, మామిడి తోరణాలతో అలంకరించండి. దీపాలు వెలిగించండి.',
    instruction_ta: 'தீபாவளிக்கு முன்பு வீட்டை நன்கு சுத்தம் செய்யுங்கள். கோலங்கள், மலர்கள் மற்றும் மாவிலை தோரணங்களால் அலங்கரியுங்கள்.',
    instruction_hi: 'दीपावली से पहले घर की सफाई करें। रंगोली, फूल और मांगतोरण से सजाएं। दीये जलाएं।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'diwali', parent_type: 'festival', step_number: '2',
    step_title_en: 'Lakshmi Puja', step_title_te: 'లక్ష్మీ పూజ', step_title_ta: 'லட்சுமி பூஜை', step_title_hi: 'लक्ष्मी पूजा',
    instruction_en: 'On the evening of Diwali (Amavasya), perform the Lakshmi Puja after sunset. Set up the puja with idol/image of Goddess Lakshmi and Ganesha. Offer lotus flowers, sweets, and chant Lakshmi mantras.',
    instruction_te: 'దీపావళి రాత్రి (అమావాస్య) సూర్యాస్తమయం తర్వాత లక్ష్మీ పూజ చేయండి. పద్మ పుష్పాలు, మిఠాయిలు అర్పించి లక్ష్మీ మంత్రాలు జపించండి.',
    instruction_ta: 'தீபாவளி இரவு லட்சுமி பூஜை செய்யுங்கள். தாமரை மலர்கள், இனிப்புகள் அர்ப்பணிக்கவும்.',
    instruction_hi: 'दीपावली की रात लक्ष्मी पूजा करें। कमल के फूल, मिठाई अर्पित करें। लक्ष्मी मंत्रों का जाप करें।',
    recite_shloka_slug: 'lakshmi-ashtothram', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'diwali', parent_type: 'festival', step_number: '3',
    step_title_en: 'Light Diyas', step_title_te: 'దీపాలు వెలిగించడం', step_title_ta: 'விளக்குகள் ஏற்றுதல்', step_title_hi: 'दीये जलाना',
    instruction_en: 'Light 108 diyas (or as many as possible) around the home. Ensure the main entrance is well-lit to welcome Goddess Lakshmi. Light a continuous lamp (akhand deep) in the puja room.',
    instruction_te: 'ఇంటి చుట్టూ 108 దీపాలు (లేదా వీలైనన్ని) వెలిగించండి. పూజ గదిలో అఖండ దీపం వెలిగించండి.',
    instruction_ta: 'வீட்டைச் சுற்றி 108 விளக்குகள் ஏற்றுங்கள். பூஜை அறையில் அகண்ட தீபம் ஏற்றுங்கள்.',
    instruction_hi: 'घर में 108 दीये (या अधिक) जलाएं। पूजा कक्ष में अखंड दीप रखें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
  {
    parent_slug: 'diwali', parent_type: 'festival', step_number: '4',
    step_title_en: 'Prasad Distribution', step_title_te: 'ప్రసాద వితరణ', step_title_ta: 'பிரசாத விநியோகம்', step_title_hi: 'प्रसाद वितरण',
    instruction_en: 'Distribute sweets, dry fruits, and gifts to neighbors and family. Exchange wishes and celebrate the victory of light over darkness.',
    instruction_te: 'పొరుగువారికి, కుటుంబ సభ్యులకు మిఠాయిలు, ఎండు పళ్ళు పంచండి. ఒకరికొకరు శుభాకాంక్షలు అర్పించుకోండి.',
    instruction_ta: 'அண்டை வீட்டாருக்கும் குடும்பத்தினருக்கும் இனிப்புகள், பட்ட பழங்கள் வழங்குங்கள்.',
    instruction_hi: 'मिठाई, मेवे और उपहार बांटें। एक-दूसरे को शुभकामनाएं दें।',
    recite_shloka_slug: '', recite_stanza_range: '', notes_en: '',
  },
];

// ─── Material Items Data ──────────────────────────────────────────────────────

const MATERIAL_ITEMS = [
  // ganesh-chaturthi
  { group_slug: 'ganesh-chaturthi', item_order: '1', item_name_en: 'Ganesha idol (clay preferred)', item_name_te: 'విఘ్నేశ్వర విగ్రహం', item_name_ta: 'கணேஷ் சிலை', item_name_hi: 'गणेश प्रतिमा', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '2', item_name_en: 'Red hibiscus flowers', item_name_te: 'ఎర్ర మందారాలు', item_name_ta: 'சிவப்பு மலர்கள்', item_name_hi: 'लाल गुड़हल', quantity_en: '21', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '3', item_name_en: 'Durva grass', item_name_te: 'దూర్వా గడ్డి', item_name_ta: 'அருகம்புல்', item_name_hi: 'दूर्वा', quantity_en: '21 blades', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '4', item_name_en: 'Modak (sweet)', item_name_te: 'మోదక', item_name_ta: 'மோதகம்', item_name_hi: 'मोदक', quantity_en: '21', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '5', item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '6', item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '7', item_name_en: 'Camphor', item_name_te: 'కర్పూరం', item_name_ta: 'கர்பூரம்', item_name_hi: 'कपूर', quantity_en: 'small piece', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '8', item_name_en: 'Turmeric', item_name_te: 'పసుపు', item_name_ta: 'மஞ்சள்', item_name_hi: 'हल्दी', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '9', item_name_en: 'Kumkum', item_name_te: 'కుంకుమ', item_name_ta: 'குங்குமம்', item_name_hi: 'कुमकुम', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '10', item_name_en: 'Panchamrit (milk, curd, honey, ghee, sugar)', item_name_te: 'పంచామృతం', item_name_ta: 'பஞ்சாமிர்தம்', item_name_hi: 'पंचामृत', quantity_en: 'small quantities', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '11', item_name_en: 'Banana leaf', item_name_te: 'అరటి ఆకు', item_name_ta: 'வாழை இலை', item_name_hi: 'केले का पत्ता', quantity_en: '1', is_optional: 'TRUE', substitution_note_en: '' },
  { group_slug: 'ganesh-chaturthi', item_order: '12', item_name_en: 'Dhruva', item_name_te: 'దూర్వ', item_name_ta: 'தர்பை', item_name_hi: 'दर्भ', quantity_en: 'handful', is_optional: 'TRUE', substitution_note_en: '' },

  // maha-shivaratri
  { group_slug: 'maha-shivaratri', item_order: '1', item_name_en: 'Bel (bilva) leaves', item_name_te: 'బిల్వ పత్రాలు', item_name_ta: 'வில்வ இலைகள்', item_name_hi: 'बेल पत्र', quantity_en: '108+', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '2', item_name_en: 'Milk', item_name_te: 'పాలు', item_name_ta: 'பால்', item_name_hi: 'दूध', quantity_en: '500ml', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '3', item_name_en: 'Curd', item_name_te: 'పెరుగు', item_name_ta: 'தயிர்', item_name_hi: 'दही', quantity_en: '100ml', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '4', item_name_en: 'Honey', item_name_te: 'తేనె', item_name_ta: 'தேன்', item_name_hi: 'शहद', quantity_en: '50ml', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '5', item_name_en: 'Ghee', item_name_te: 'నెయ్యి', item_name_ta: 'நெய்', item_name_hi: 'घी', quantity_en: '50ml', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '6', item_name_en: 'Sugar', item_name_te: 'చక్కెర', item_name_ta: 'சர்க்கரை', item_name_hi: 'चीनी', quantity_en: '2 tbsp', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '7', item_name_en: 'White flowers', item_name_te: 'తెల్లని పూలు', item_name_ta: 'வெண்ணிற மலர்கள்', item_name_hi: 'सफेद फूल', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '8', item_name_en: 'Vibhuti (sacred ash)', item_name_te: 'విభూతి', item_name_ta: 'திருநீறு', item_name_hi: 'विभूति', quantity_en: 'small quantity', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '9', item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'maha-shivaratri', item_order: '10', item_name_en: 'Dhatura', item_name_te: 'ఉమ్మెత్తా పువ్వు', item_name_ta: 'ஊமத்தை பூ', item_name_hi: 'धतूरा', quantity_en: 'a few', is_optional: 'TRUE', substitution_note_en: 'if available' },
  { group_slug: 'maha-shivaratri', item_order: '11', item_name_en: 'Rudraksha mala', item_name_te: 'రుద్రాక్ష మాల', item_name_ta: 'ருத்ராட்ச மாலை', item_name_hi: 'रुद्राक्ष माला', quantity_en: '1', is_optional: 'TRUE', substitution_note_en: '' },

  // navaratri
  { group_slug: 'navaratri', item_order: '1', item_name_en: 'Devi idol or image', item_name_te: 'దేవి విగ్రహం లేదా పటం', item_name_ta: 'தேவி சிலை அல்லது படம்', item_name_hi: 'देवी प्रतिमा या चित्र', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '2', item_name_en: 'Kalash (copper/brass pot)', item_name_te: 'కళశం', item_name_ta: 'கலசம்', item_name_hi: 'कलश', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '3', item_name_en: 'Coconut', item_name_te: 'కొబ్బరికాయ', item_name_ta: 'தேங்காய்', item_name_hi: 'नारियल', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '4', item_name_en: 'Mango leaves', item_name_te: 'మామిడి ఆకులు', item_name_ta: 'மாவிலை', item_name_hi: 'आम के पत्ते', quantity_en: 'handful', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '5', item_name_en: 'Red flowers', item_name_te: 'ఎర్ర పూలు', item_name_ta: 'சிவப்பு மலர்கள்', item_name_hi: 'लाल फूल', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '6', item_name_en: 'Kumkum', item_name_te: 'కుంకుమ', item_name_ta: 'குங்குமம்', item_name_hi: 'कुमकुम', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '7', item_name_en: 'Turmeric', item_name_te: 'పసుపు', item_name_ta: 'மஞ்சள்', item_name_hi: 'हल्दी', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '8', item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '9', item_name_en: 'Akhand jyoti lamp', item_name_te: 'అఖండ జ్యోతి దీపం', item_name_ta: 'அகண்ட தீபம்', item_name_hi: 'अखंड दीप', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '10', item_name_en: 'Sundal ingredients', item_name_te: 'సుందల్ పదార్థాలు', item_name_ta: 'சுண்டல் பொருட்கள்', item_name_hi: 'सुंदल सामग्री', quantity_en: 'as needed', is_optional: 'TRUE', substitution_note_en: '' },
  { group_slug: 'navaratri', item_order: '11', item_name_en: 'Kolu dolls', item_name_te: 'బొమ్మలు', item_name_ta: 'கொலு பொம்மைகள்', item_name_hi: 'कोलू गुड़िया', quantity_en: 'as available', is_optional: 'TRUE', substitution_note_en: '' },

  // diwali
  { group_slug: 'diwali', item_order: '1', item_name_en: 'Oil lamps (diyas)', item_name_te: 'మట్టి దీపాలు', item_name_ta: 'மண் விளக்குகள்', item_name_hi: 'मिट्टी के दीये', quantity_en: '108 or more', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '2', item_name_en: 'Oil or ghee', item_name_te: 'నూనె లేదా నెయ్యి', item_name_ta: 'எண்ணெய் அல்லது நெய்', item_name_hi: 'तेल या घी', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '3', item_name_en: 'Lakshmi idol', item_name_te: 'లక్ష్మీదేవి విగ్రహం', item_name_ta: 'லட்சுமி சிலை', item_name_hi: 'लक्ष्मी प्रतिमा', quantity_en: '1', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '4', item_name_en: 'Lotus flowers', item_name_te: 'పద్మ పుష్పాలు', item_name_ta: 'தாமரை மலர்கள்', item_name_hi: 'कमल के फूल', quantity_en: 'as available', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '5', item_name_en: 'Rangoli colors', item_name_te: 'ముగ్గు రంగులు', item_name_ta: 'கோலம் வண்ணங்கள்', item_name_hi: 'रंगोली रंग', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '6', item_name_en: 'Sweets', item_name_te: 'మిఠాయిలు', item_name_ta: 'இனிப்புகள்', item_name_hi: 'मिठाई', quantity_en: 'as needed', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '7', item_name_en: 'Incense sticks', item_name_te: 'అగరబత్తులు', item_name_ta: 'அகர்பத்தி', item_name_hi: 'अगरबत्ती', quantity_en: '1 pack', is_optional: 'FALSE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '8', item_name_en: 'Dry fruits', item_name_te: 'ఎండు పళ్ళు', item_name_ta: 'உலர் பழங்கள்', item_name_hi: 'सूखे मेवे', quantity_en: 'as needed', is_optional: 'TRUE', substitution_note_en: '' },
  { group_slug: 'diwali', item_order: '9', item_name_en: 'Firecrackers', item_name_te: 'బాణాసంచా', item_name_ta: 'பட்டாசுகள்', item_name_hi: 'पटाखे', quantity_en: 'as desired', is_optional: 'TRUE', substitution_note_en: '' },
];

// ─── Festival linked_story_slug updates ──────────────────────────────────────

// Will be determined at runtime by checking stories_index
const STORY_SLUG_CANDIDATES = {
  'ganesh-chaturthi': 'ganesh-chaturthi-story-1',
  'maha-shivaratri': 'maha-shivaratri-story-1',
  'krishna-janmashtami': 'krishna-janmashtami-story-1',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getColIndex(headers, col) {
  const idx = headers.indexOf(col);
  if (idx === -1) throw new Error(`Column "${col}" not found in headers: ${headers.join(', ')}`);
  return idx;
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // ── 1. Read stories_index to know which story slugs actually exist ────────
  console.log('Reading stories_index...');
  const storiesRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'stories_index!A1:ZZ',
  });
  const storiesRows = storiesRes.data.values ?? [];
  const storiesHeaders = storiesRows[0] ?? [];
  const storySlugCol = storiesHeaders.indexOf('slug');
  const existingStorySlugs = new Set(
    storiesRows.slice(1).map(r => r[storySlugCol] ?? '').filter(Boolean)
  );
  console.log(`  Found ${existingStorySlugs.size} story slugs: ${[...existingStorySlugs].join(', ')}`);

  // Filter candidates to only verified slugs
  const verifiedStoryLinks = {};
  for (const [festival, storySlug] of Object.entries(STORY_SLUG_CANDIDATES)) {
    if (existingStorySlugs.has(storySlug)) {
      verifiedStoryLinks[festival] = storySlug;
      console.log(`  ✓ Verified story slug for ${festival}: ${storySlug}`);
    } else {
      console.log(`  ✗ Story slug NOT found for ${festival}: ${storySlug} — skipping`);
    }
  }

  // ── 2. Populate procedure_steps ───────────────────────────────────────────
  console.log('\nReading procedure_steps headers...');
  const psHeaderRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'procedure_steps!A1:ZZ1',
  });
  let psHeaders = psHeaderRes.data.values?.[0] ?? [];

  const EXPECTED_PS_HEADERS = [
    'parent_slug', 'parent_type', 'step_number',
    'step_title_en', 'step_title_te', 'step_title_ta', 'step_title_hi',
    'instruction_en', 'instruction_te', 'instruction_ta', 'instruction_hi',
    'recite_shloka_slug', 'recite_stanza_range', 'notes_en',
  ];

  if (!psHeaders.length) {
    console.log('  Writing procedure_steps headers...');
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: 'procedure_steps!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [EXPECTED_PS_HEADERS] },
    });
    psHeaders = EXPECTED_PS_HEADERS;
  }

  // Read existing rows to detect duplicates
  const psAllRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'procedure_steps!A1:ZZ',
  });
  const psAllRows = psAllRes.data.values ?? [];
  const psParentSlugCol = psHeaders.indexOf('parent_slug');
  const existingPsSlugs = new Set(
    psAllRows.slice(1).map(r => r[psParentSlugCol] ?? '').filter(Boolean)
  );
  console.log(`  Existing procedure_steps parent_slugs: ${[...existingPsSlugs].join(', ') || '(none)'}`);

  // Filter out steps for slugs already present
  const newSteps = PROCEDURE_STEPS.filter(s => !existingPsSlugs.has(s.parent_slug));
  const skippedSlugs = [...new Set(PROCEDURE_STEPS.filter(s => existingPsSlugs.has(s.parent_slug)).map(s => s.parent_slug))];
  if (skippedSlugs.length) {
    console.log(`  Skipping procedure_steps (already exist): ${skippedSlugs.join(', ')}`);
  }

  if (newSteps.length) {
    const psRows = newSteps.map(s => psHeaders.map(h => (s[h] ?? '') + ''));
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'procedure_steps!A1',
      valueInputOption: 'RAW',
      requestBody: { values: psRows },
    });
    console.log(`  ✓ Appended ${psRows.length} procedure_steps rows`);
  } else {
    console.log('  No new procedure_steps rows to add.');
  }

  // ── 3. Populate material_items ────────────────────────────────────────────
  console.log('\nReading material_items headers...');
  const miHeaderRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'material_items!A1:ZZ1',
  });
  let miHeaders = miHeaderRes.data.values?.[0] ?? [];

  const EXPECTED_MI_HEADERS = [
    'group_slug', 'item_order',
    'item_name_en', 'item_name_te', 'item_name_ta', 'item_name_hi',
    'quantity_en', 'is_optional', 'substitution_note_en',
  ];

  if (!miHeaders.length) {
    console.log('  Writing material_items headers...');
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: 'material_items!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [EXPECTED_MI_HEADERS] },
    });
    miHeaders = EXPECTED_MI_HEADERS;
  }

  // Read existing rows to detect duplicates
  const miAllRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'material_items!A1:ZZ',
  });
  const miAllRows = miAllRes.data.values ?? [];
  const miGroupSlugCol = miHeaders.indexOf('group_slug');
  const existingMiSlugs = new Set(
    miAllRows.slice(1).map(r => r[miGroupSlugCol] ?? '').filter(Boolean)
  );
  console.log(`  Existing material_items group_slugs: ${[...existingMiSlugs].join(', ') || '(none)'}`);

  const newMaterials = MATERIAL_ITEMS.filter(m => !existingMiSlugs.has(m.group_slug));
  const skippedMiSlugs = [...new Set(MATERIAL_ITEMS.filter(m => existingMiSlugs.has(m.group_slug)).map(m => m.group_slug))];
  if (skippedMiSlugs.length) {
    console.log(`  Skipping material_items (already exist): ${skippedMiSlugs.join(', ')}`);
  }

  if (newMaterials.length) {
    const miRows = newMaterials.map(m => miHeaders.map(h => (m[h] ?? '') + ''));
    await sheets.spreadsheets.values.append({
      spreadsheetId, range: 'material_items!A1',
      valueInputOption: 'RAW',
      requestBody: { values: miRows },
    });
    console.log(`  ✓ Appended ${miRows.length} material_items rows`);
  } else {
    console.log('  No new material_items rows to add.');
  }

  // ── 4. Update festivals linked_story_slug ─────────────────────────────────
  if (Object.keys(verifiedStoryLinks).length === 0) {
    console.log('\nNo verified story slugs to update in festivals sheet.');
    return;
  }

  console.log('\nReading festivals sheet...');
  const festRes = await sheets.spreadsheets.values.get({
    spreadsheetId, range: 'festivals!A1:ZZ',
  });
  const festRows = festRes.data.values ?? [];
  const festHeaders = festRows[0] ?? [];

  const festSlugCol = getColIndex(festHeaders, 'slug');
  let festLinkedStoryCol = festHeaders.indexOf('linked_story_slug');

  // If column doesn't exist yet, add it
  if (festLinkedStoryCol === -1) {
    console.log('  linked_story_slug column not found — adding it...');
    festLinkedStoryCol = festHeaders.length;
    const newHeaderRange = `festivals!${columnLetter(festLinkedStoryCol + 1)}1`;
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: newHeaderRange,
      valueInputOption: 'RAW',
      requestBody: { values: [['linked_story_slug']] },
    });
    console.log(`  ✓ Added linked_story_slug header at column ${columnLetter(festLinkedStoryCol + 1)}`);
  } else {
    console.log(`  linked_story_slug is at column ${columnLetter(festLinkedStoryCol + 1)}`);
  }

  // Update each matched festival row
  for (let rowIdx = 1; rowIdx < festRows.length; rowIdx++) {
    const row = festRows[rowIdx];
    const slug = row[festSlugCol] ?? '';
    if (!slug || !verifiedStoryLinks[slug]) continue;

    const storySlug = verifiedStoryLinks[slug];
    const cellAddress = `festivals!${columnLetter(festLinkedStoryCol + 1)}${rowIdx + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: cellAddress,
      valueInputOption: 'RAW',
      requestBody: { values: [[storySlug]] },
    });
    console.log(`  ✓ Updated ${slug} → linked_story_slug = "${storySlug}" (row ${rowIdx + 1})`);
  }

  console.log('\nDone!');
}

/** Convert 1-based column index to spreadsheet letter (A, B, ... Z, AA, AB, ...) */
function columnLetter(col) {
  let letter = '';
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

main().catch(e => { console.error(e); process.exit(1); });
