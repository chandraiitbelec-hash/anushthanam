// Run with: node scripts/populate-gods.mjs
// Populates the gods tab with all 25 deities and links their ashtothrams in god_links

import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '../.env.local' });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

const GODS = [
  // slug, name_en, name_te, name_ta, name_hi, name_sa, alternate_names_en, tradition, description_en, description_te, description_ta, description_hi, iconography_en
  ['ganesha','Ganesha','గణేశుడు','விநாயகர்','गणेश','गणेशः','Ganapati, Vinayaka, Vighneshwara, Pillayar','ganapatya',
    'Lord Ganesha is the elephant-headed son of Shiva and Parvati, revered as the remover of obstacles and the deity of new beginnings, wisdom, and intellect. He is invoked at the start of every auspicious undertaking.',
    'గణేశుడు శివపార్వతుల పుత్రుడు. ఆయన విఘ్నాలను తొలగించే దేవుడు. జ్ఞానం, బుద్ధి, శుభారంభాలకు అధిపతి. ప్రతి శుభకార్యానికి మొదటగా పూజించబడతాడు.',
    'கணேஷர் சிவ-பார்வதியின் மகன். தடைகளை நீக்கும் தெய்வமாக, புதிய தொடக்கங்கள், ஞானம், அறிவிற்கு அதிபதியாக வழிபடப்படுகிறார்.',
    'गणेश जी शिव और पार्वती के पुत्र हैं। वे विघ्नों को हरने वाले, बुद्धि, ज्ञान और शुभ आरंभ के देवता हैं। हर शुभ कार्य में सर्वप्रथम उनकी पूजा होती है।',
    'Elephant head with curved trunk, four arms holding a modak, lotus, axe (or noose), and broken tusk. Large ears and round belly. Vehicle: mouse (Mushika). Complexion: golden or reddish.'],

  ['shiva','Shiva','శివుడు','சிவன்','शिव','शिवः','Mahadeva, Maheswara, Rudra, Shankar, Nataraja','shaiva',
    'Lord Shiva is the supreme deity of the Shaiva tradition, the destroyer and transformer in the Hindu trinity. He embodies renunciation, meditation, and cosmic consciousness, and is worshipped in both his benevolent and fierce forms.',
    'శివుడు హిందూ త్రిమూర్తులలో సంహారకుడు. జటాధారి, చంద్రశేఖరుడు, గంగాధరుడు. తపస్సు, వైరాగ్యం, విశ్వచైతన్యానికి ప్రతీక.',
    'சிவன் இந்து மும்மூர்த்திகளில் சங்காரகர். ஜடாமகுடம், கங்கை, சந்திரன் தரித்தவர். தியானம், வைராக்கியம், பிரபஞ்ச சேதனையின் வடிவம்.',
    'शिव जी हिंदू त्रिदेवों में संहारकर्ता हैं। जटाजूटधारी, गंगाधर, चंद्रशेखर। तप, वैराग्य और ब्रह्मांडीय चेतना के प्रतीक।',
    'Third eye on forehead, matted locks with crescent moon and Ganga. Blue throat (Neelakantha). Four arms: trident, damaru drum, deer, and abhaya mudra. Ash-smeared body, tiger skin. Vehicle: Nandi bull.'],

  ['vishnu','Vishnu','విష్ణువు','விஷ்ணு','विष्णु','विष्णुः','Narayana, Hari, Venkateswara, Perumal','vaishnava',
    'Lord Vishnu is the preserver in the Hindu trinity, embodying grace, mercy, and cosmic order. He descends to earth in various incarnations (avatars) to restore dharma whenever it is threatened.',
    'విష్ణువు హిందూ త్రిమూర్తులలో పాలకుడు. అనుగ్రహం, కరుణ, ధర్మ పరిరక్షణకు ప్రతీక. ధర్మం నశించినప్పుడు పలు అవతారాలలో భూలోకానికి దిగివస్తాడు.',
    'விஷ்ணு இந்து மும்மூர்த்திகளில் காப்பவர். அருள், கருணை, தர்ம பரிரக்ஷணத்தின் வடிவம். தர்மம் குலைகையில் பல அவதாரங்கள் எடுக்கிறார்.',
    'विष्णु जी हिंदू त्रिदेवों में पालनकर्ता हैं। कृपा, करुणा और धर्म-रक्षण के प्रतीक। धर्म की हानि होने पर विभिन्न अवतारों में पृथ्वी पर अवतरित होते हैं।',
    'Four arms holding conch (Shankha), discus (Sudarshana Chakra), mace (Kaumodaki), and lotus. Dark blue complexion. Wears yellow silk (Pitambara). Rests on Ananta Shesha in the Kshira Sagara. Vehicle: Garuda.'],

  ['lakshmi','Lakshmi','లక్ష్మీ దేవి','லட்சுமி','लक्ष्मी','लक्ष्मीः','Sri, Mahalakshmi, Thirumagal, Kamala','shakta',
    'Goddess Lakshmi is the deity of wealth, fortune, prosperity, and beauty. Consort of Vishnu, she is worshipped for abundance in material and spiritual life and is especially revered on Fridays and during Diwali.',
    'లక్ష్మీ దేవి సంపద, అదృష్టం, సౌభాగ్యానికి అధిదేవత. విష్ణు పత్ని. శుక్రవారాలు మరియు దీపావళిలో విశేషంగా పూజించబడుతుంది.',
    'லட்சுமி செல்வம், செழிப்பு, அழகின் தெய்வம். விஷ்ணுவின் தேவி. வெள்ளிக்கிழமை மற்றும் தீபாவளியில் சிறப்பாக வழிபடப்படுகிறார்.',
    'लक्ष्मी जी धन, वैभव, सौन्दर्य और समृद्धि की देवी हैं। विष्णु पत्नी। शुक्रवार और दीपावली में विशेष रूप से पूजित हैं।',
    'Four arms: two holding lotus flowers, one showering gold coins, one in abhaya mudra. Golden complexion. Seated or standing on a lotus. Flanked by two elephants. Red and gold saree.'],

  ['saraswati','Saraswati','సరస్వతీ దేవి','சரஸ்வதி','सरस्वती','सरस्वतीः','Vani, Sharada, Bharati, Vagdevi','shakta',
    'Goddess Saraswati is the deity of knowledge, learning, wisdom, music, and the arts. She is worshipped by students, scholars, and artists, particularly on Saraswati Puja and Vijayadasami.',
    'సరస్వతీ దేవి విద్య, జ్ఞానం, సంగీతం, కళలకు అధిదేవత. విద్యార్థులు, పండితులు, కళాకారులు ఆరాధిస్తారు.',
    'சரஸ்வதி வித்தை, ஞானம், இசை, கலைகளின் தெய்வம். மாணவர்கள், அறிஞர்கள், கலைஞர்களால் வழிபடப்படுகிறார்.',
    'सरस्वती जी ज्ञान, विद्या, संगीत और कलाओं की देवी हैं। विद्यार्थियों, विद्वानों और कलाकारों द्वारा पूजित।',
    'Four arms: veena (lute), book (Vedas), rosary, and water pot (or lotus). White complexion and white saree symbolising purity. Seated on white lotus or swan. Vehicle: swan or peacock.'],

  ['durga','Durga','దుర్గాదేవి','துர்கை','दुर्गा','दुर्गाः','Mahishasuramardini, Chandika, Amba, Shakti','shakta',
    'Goddess Durga is the fierce, warrior form of the Divine Mother, worshipped as the destroyer of evil and protector of the good. Her victory over the buffalo demon Mahishasura is celebrated at Navratri.',
    'దుర్గాదేవి దివ్య మాతృ శక్తి యొక్క యోధ రూపం. దుష్టులను నాశనం చేసి, మంచివారిని కాపాడుతుంది. నవరాత్రి ఉత్సవాలలో విశేషంగా పూజించబడుతుంది.',
    'துர்கை தெய்வீக மாதாவின் போர்வீர வடிவம். தீயோரை அழித்து நல்லோரைக் காக்கும் தெய்வம். நவராத்திரியில் சிறப்பாக வழிபடப்படுகிறார்.',
    'दुर्गा जी दिव्य मातृशक्ति का योद्धा रूप हैं। दुष्टों का विनाश कर सज्जनों की रक्षा करती हैं। नवरात्रि में विशेष पूजा।',
    'Ten arms each holding a weapon: trident, sword, conch, discus, bow, arrow, thunderbolt, lotus, snake, and flame. Rides a lion or tiger. Fierce yet compassionate expression. Red or golden attire.'],

  ['krishna','Krishna','శ్రీ కృష్ణుడు','கிருஷ்ணர்','कृष्ण','कृष्णः','Govinda, Madhava, Gopala, Murali, Vasudeva','vaishnava',
    'Lord Krishna is the eighth avatar of Vishnu and one of the most beloved deities in Hinduism. He is revered as the divine teacher of the Bhagavad Gita, the playful cowherd of Vrindavana, and the heroic charioteer of Arjuna.',
    'శ్రీ కృష్ణుడు విష్ణువు యొక్క ఎనిమిదవ అవతారం. భగవద్గీత బోధకుడు, వ్రందావన గోపాలుడు, అర్జునుడి సారధి.',
    'கிருஷ்ணர் விஷ்ணுவின் எட்டாவது அவதாரம். பகவத்கீதை உபதேசகர், வ்ருந்தாவன கோபாலன், அர்ஜுனனின் தேரோட்டி.',
    'कृष्ण जी विष्णु के आठवें अवतार हैं। भगवद्गीता के उपदेशक, वृन्दावन के गोपाल, अर्जुन के सारथी।',
    'Dark blue complexion. Peacock feather in crown. Plays the flute (Murali). Yellow silk garment. Two or four arms. Often depicted with Radha or the Gopis. Vehicle: Garuda.'],

  ['rama','Rama','శ్రీ రాముడు','ஸ்ரீராமர்','राम','रामः','Ramachandra, Sita Ram, Kodanda Rama, Maryada Purushottama','vaishnava',
    'Lord Rama is the seventh avatar of Vishnu and the ideal of dharmic kingship, virtue, and devotion. His life and exile are narrated in the Ramayana, and he is worshipped across India as the embodiment of righteousness.',
    'శ్రీ రాముడు విష్ణువు యొక్క సప్తమావతారం. ధర్మం, నైతికత, ఆదర్శ పాలనకు ప్రతీక. రామాయణంలో ఆయన జీవితం వర్ణించబడింది.',
    'ஸ்ரீராமர் விஷ்ணுவின் ஏழாவது அவதாரம். தர்மம், நீதி, ஆட்சியின் ஆதர்சமாக வழிபடப்படுகிறார். ராமாயணம் அவரது வாழ்க்கையை விவரிக்கிறது.',
    'राम जी विष्णु के सातवें अवतार हैं। धर्म, नैतिकता और आदर्श शासन के प्रतीक। रामायण में उनके जीवन का वर्णन है।',
    'Dark blue or green complexion. Bow and quiver of arrows as primary symbols. Often shown with Sita, Lakshmana, and Hanuman. Yellow or white garment. Crown (Mukuta). Calm, noble expression.'],

  ['hanuman','Hanuman','హనుమాన్','அனுமன்','हनुमान','हनुमान्','Anjaneya, Maruti, Bajrangbali, Pawanputra','vaishnava',
    'Lord Hanuman is the devoted servant of Lord Rama and the son of the wind god Vayu. He symbolises devotion, courage, strength, and selfless service. His name is chanted for protection and strength.',
    'హనుమాన్ రాముడికి అత్యంత నిష్ఠగల భక్తుడు. వాయుదేవుడి పుత్రుడు. భక్తి, వీరత్వం, బలం, నిస్స్వార్థ సేవకు ప్రతీక.',
    'அனுமன் ராமரின் அன்பான சேவகர். வாயு தேவனின் மகன். பக்தி, வீரம், பலம், தியாக சேவையின் வடிவம்.',
    'हनुमान जी राम भक्त हैं। वायुदेव के पुत्र। भक्ति, वीरता, बल और निःस्वार्थ सेवा के प्रतीक।',
    'Monkey face, powerful physique. Carries a mace (Gada) or Sanjivani mountain. Devotional gesture with one hand on chest. Vermillion-smeared body. Long tail. Often shown mid-leap or in prayer before Rama.'],

  ['venkateswara','Venkateswara','వేంకటేశ్వరుడు','வேங்கடேஸ்வரர்','वेंकटेश्वर','वेंकटेश्वरः','Balaji, Srinivasa, Tirupati Balaji, Perumal','vaishnava',
    'Lord Venkateswara is a form of Vishnu enshrined at the Tirumala hills in Andhra Pradesh. He is one of the most worshipped deities in India, believed to grant the wishes of devoted pilgrims who visit Tirupati.',
    'వేంకటేశ్వరుడు ఆంధ్రప్రదేశ్ లోని తిరుమల కొండపై వెలసిన విష్ణు స్వరూపం. తిరుపతి బాలాజీగా ప్రపంచ ప్రసిద్ధి. లక్షలాది భక్తులు దర్శనానికి వస్తారు.',
    'வேங்கடேஸ்வரர் ஆந்திரப் பிரதேசத்தில் திருமலை மலையில் கோலோச்சும் விஷ்ணு வடிவம். திருப்பதி பாலாஜியாக உலக புகழ். லட்சக்கணக்கான பக்தர்கள் வருகை தருகின்றனர்.',
    'वेंकटेश्वर जी आंध्र प्रदेश के तिरुमाला पहाड़ी पर विराजमान विष्णु का स्वरूप हैं। तिरुपति बालाजी के नाम से विश्व प्रसिद्ध।',
    'Standing posture. Four arms: conch, discus, lotus, and abhaya mudra. Dark complexion. Ornate crown (Kirita Mukuta). Flanked by Sridevi and Bhudevi. Forehead mark with Urdhva Pundra.'],

  ['subrahmanya','Subrahmanya','సుబ్రహ్మణ్య స్వామి','முருகன்','सुब्रह्मण्य','सुब्रह्मण्यः','Murugan, Kartikeya, Skanda, Shanmukha, Kumara','kaumara',
    'Lord Subrahmanya is the son of Shiva and Parvati, the commander of the divine armies, and the god of war and victory. Especially beloved in Tamil Nadu as Murugan, he is worshipped at hill temples across South India.',
    'సుబ్రహ్మణ్య స్వామి శివ-పార్వతుల పుత్రుడు. దివ్య సేనాపతి. యుద్ధ, విజయ దేవుడు. తమిళ నాడులో మురుగన్ గా విశేషంగా పూజించబడతాడు.',
    'முருகன் சிவ-பார்வதியின் மகன். தெய்வீக சேனாபதி. போர் மற்றும் வெற்றியின் கடவுள். தமிழ்நாட்டில் மலைக்கோவில்களில் சிறப்பாக வழிபடப்படுகிறார்.',
    'सुब्रह्मण्य जी शिव-पार्वती के पुत्र, दिव्य सेनापति और विजय के देवता हैं। तमिलनाडु में मुरुगन के नाम से विशेष पूजित।',
    'Six faces, twelve arms. Spear (Vel) as primary weapon. Peacock as vehicle. Holds a cockerel banner. Flanked by Devasena and Valli. Youthful, warrior appearance.'],

  ['parvati','Parvati','పార్వతీ దేవి','பார்வதி','पार्वती','पार्वतीः','Uma, Gauri, Ambika, Shakti, Bhavani','shakta',
    'Goddess Parvati is the divine consort of Lord Shiva and the mother of Ganesha and Kartikeya. She represents the gentle, nurturing aspect of feminine divine power and is revered as the ideal devoted wife and mother.',
    'పార్వతీ దేవి శివుని పత్ని, గణేశుడు-కార్తికేయుల తల్లి. స్త్రీ దివ్య శక్తి యొక్క కోమల, పోషక రూపం.',
    'பார்வதி சிவனின் தேவி, கணேஷ-கார்த்திகேயனின் தாய். பெண்மை தெய்வீக சக்தியின் கருணை, அன்பு வடிவம்.',
    'पार्वती जी शिव की पत्नी, गणेश और कार्तिकेय की माता। स्त्री दिव्यशक्ति के कोमल, पोषक रूप।',
    'Two or four arms. Holds lotus, mirror, or parrot. Golden complexion. Often shown seated with Shiva or holding the infant Ganesha. Red or green saree. Crescent moon in hair.'],

  ['narasimha','Narasimha','నరసింహ స్వామి','நரசிம்ஹர்','नरसिंह','नरसिंहः','Ugra Narasimha, Lakshmi Narasimha, Jwala Narasimha','vaishnava',
    'Lord Narasimha is the fourth avatar of Vishnu, the man-lion form who burst forth from a pillar to protect his devotee Prahlada and slay the demon Hiranyakashipu. He is worshipped for protection against fear and evil.',
    'నరసింహ స్వామి విష్ణువు నాల్గవ అవతారం. నరసింహుడు స్తంభం నుండి వెలువడి ప్రహ్లాదుని కాపాడాడు. రక్షణ కోసం పూజించబడతాడు.',
    'நரசிம்ஹர் விஷ்ணுவின் நான்காவது அவதாரம். தூணிலிருந்து வெளிப்பட்டு பிரகலாதனைக் காத்தார். பயம் மற்றும் தீமையிலிருந்து பாதுகாப்பிற்காக வழிபடப்படுகிறார்.',
    'नरसिंह जी विष्णु के चौथे अवतार, स्तम्भ से प्रकट होकर प्रह्लाद की रक्षा की। भय और बुराई से सुरक्षा हेतु पूजित।',
    'Lion face with human body. Fierce expression, fiery mane. Four or eight arms holding weapons and tearing apart the demon. Seated on a throne or in a doorway. Lakshmi often shown beside him in calmer depictions.'],

  ['satyanarayana','Satyanarayana','సత్యనారాయణ స్వామి','சத்யநாராயணர்','सत्यनारायण','सत्यनारायणः','Satya Deva, Satyanarayan','vaishnava',
    'Sri Satyanarayana is a form of Vishnu worshipped specifically through the Satyanarayana Vratam, one of the most widely observed vrathams in Telugu and Tamil households. He embodies the principle of Truth (Satya) as a path to divine grace.',
    'సత్యనారాయణ స్వామి సత్యానికి ప్రతీకమైన విష్ణు స్వరూపం. సత్యనారాయణ వ్రతం తెలుగు మరియు తమిళ కుటుంబాలలో విస్తారంగా ఆచరించబడుతుంది.',
    'சத்யநாராயணர் சத்தியத்தின் வடிவமான விஷ்ணு. சத்யநாராயண விரதம் தெலுங்கு மற்றும் தமிழ் குடும்பங்களில் பரவலாக கடைப்பிடிக்கப்படுகிறது.',
    'सत्यनारायण जी सत्य के प्रतीक विष्णु स्वरूप हैं। सत्यनारायण व्रत तेलुगु और तमिल परिवारों में व्यापक रूप से मनाया जाता है।',
    'Similar to Vishnu: four arms, conch, discus, lotus, and mace. Standing or seated on a lotus. Fair or golden complexion in this form. Often depicted with a serene, benevolent expression.'],

  ['lalitha','Lalitha','లలితా దేవి','லளிதா','ललिता','ललिताः','Tripura Sundari, Raja Rajeshwari, Kamakshi, Meenakshi','shakta',
    'Goddess Lalitha is the supreme form of Shakti worshipped in the Sri Vidya tradition. She is the beautiful, all-pervading goddess whose thousand names (Lalitha Sahasranama) are recited daily by devotees.',
    'లలితా దేవి శ్రీ విద్యా సంప్రదాయంలో పూజించే పరాశక్తి స్వరూపం. లలితా సహస్రనామం నిత్యం పఠించబడుతుంది.',
    'லளிதா ஸ்ரீ வித்யா மரபில் வழிபடப்படும் பரம சக்தி வடிவம். லளிதா சஹஸ்ரநாமம் தினமும் பாராயணம் செய்யப்படுகிறது.',
    'ललिता देवी श्री विद्या परम्परा में पूजित परा शक्ति स्वरूप हैं। ललिता सहस्रनाम का प्रतिदिन पाठ किया जाता है।',
    'Four arms: sugarcane bow, flower arrows, noose, and goad. Red complexion (Kameshwari form). Seated on Shiva as throne. Adorned with all ornaments. Associated with the Sri Chakra yantra.'],

  ['gayatri','Gayatri','గాయత్రీ దేవి','காயத்ரி','गायत्री','गायत्रीः','Savitri, Brahmi, Vedamata','shakta',
    'Goddess Gayatri is the personification of the Gayatri Mantra and is considered the mother of the Vedas. She is worshipped for divine wisdom, light, and enlightenment, especially at dawn.',
    'గాయత్రీ దేవి గాయత్రీ మంత్రానికి స్వరూపం. వేదమాత. జ్ఞానం, వెలుతురు, ఆత్మోద్ధరణ కోసం, ముఖ్యంగా తెల్లవారుజామున ఆరాధించబడుతుంది.',
    'காயத்ரி தேவி காயத்ரி மந்திரத்தின் உருவகம். வேதமாதா. ஞானம், ஒளி, ஞானோதயம் கோரி குறிப்பாக விடியலில் வழிபடப்படுகிறார்.',
    'गायत्री देवी गायत्री मंत्र की साक्षात स्वरूप, वेदमाता हैं। ज्ञान, प्रकाश और आत्मोद्धार हेतु विशेषतः प्रातःकाल पूजित।',
    'Five heads facing five directions. Ten arms each holding: conch, discus, lotus, Vedas, rosary, water pot, and other symbols. Seated on a lotus. Golden complexion. Sometimes depicted riding a swan.'],

  ['surya','Surya','సూర్య దేవుడు','சூரியன்','सूर्य','सूर्यः','Aditya, Bhaskar, Savita, Ravi, Bhanu','saura',
    'Lord Surya is the Sun God, the visible deity of light, life, and vitality. He is worshipped daily in the Surya Namaskar practice and is considered the direct source of prana (life force) for all living beings.',
    'సూర్య దేవుడు వెలుతురు, జీవం, శక్తికి ప్రత్యక్ష దైవం. సూర్య నమస్కారం ద్వారా నిత్యం ఆరాధించబడతాడు. సమస్త జీవులకు ప్రాణ శక్తి ప్రదాత.',
    'சூரியன் ஒளி, உயிர், ஆற்றலின் நேரடி தெய்வம். சூர்ய நமஸ்காரம் மூலம் தினமும் வழிபடப்படுகிறார். அனைத்து உயிர்களுக்கும் பிராண சக்தி அளிப்பவர்.',
    'सूर्य देव प्रकाश, जीवन और ऊर्जा के प्रत्यक्ष देवता हैं। सूर्य नमस्कार द्वारा प्रतिदिन आराधना। सभी जीवों के प्राणशक्ति के स्रोत।',
    'Two or four arms holding lotus flowers. Brilliant golden complexion. Riding a chariot drawn by seven horses (representing seven colours/days). Wearing a crown and armour. Often shown rising above a lotus.'],

  ['ayyappa','Ayyappa','అయ్యప్ప స్వామి','அய்யப்பன்','अयप्पा','अयप्पः','Sastha, Dharmasastha, Manikandan, Hariharaputra','smartha',
    'Lord Ayyappa is the son of Shiva and Vishnu (in his Mohini form) and is enshrined at Sabarimala in Kerala. He is worshipped for dharma and renunciation, and his pilgrimage is one of the largest annual pilgrimages in the world.',
    'అయ్యప్ప స్వామి శివుడు మరియు విష్ణువు (మోహిని రూపంలో) యొక్క పుత్రుడు. కేరళలోని శబరిమలలో కొలువై ఉన్నాడు.',
    'அய்யப்பன் சிவனும் விஷ்ணுவும் (மோகினி வடிவில்) இணைந்த மகன். கேரளாவில் சபரிமலையில் கோலோச்சுகிறார்.',
    'अयप्पा जी शिव और विष्णु (मोहिनी रूप) के पुत्र हैं। केरल के शबरिमला में विराजमान।',
    'Seated in yoga posture (Yogarishta). Bell around neck (Manikandan). Arrow and spear. Tiger as vehicle. Youthful, celibate appearance. Black garment worn by pilgrims in his honour.'],

  ['shani','Shani','శని దేవుడు','சனீஸ்வரன்','शनि','शनिः','Shani Dev, Saurapati, Mandha','smartha',
    'Lord Shani is the deity of the planet Saturn and is associated with karma, justice, discipline, and the consequences of one\'s actions. He is propitiated to reduce the ill effects of the Sade Sati period.',
    'శని దేవుడు శని గ్రహానికి అధిపతి. కర్మ, న్యాయం, క్రమశిక్షణకు సంబంధించినవాడు. సాడే సాతి కాలంలో ఆయన ప్రసన్నత కోసం పూజిస్తారు.',
    'சனீஸ்வரன் சனி கிரகத்தின் அதிபதி. கர்மா, நீதி, ஒழுக்கத்தோடு தொடர்புடையவர். சாடேசாதி காலத்தில் அனுகூலம் கோரி வழிபடப்படுகிறார்.',
    'शनि देव शनि ग्रह के स्वामी। कर्म, न्याय और अनुशासन से संबंधित। साढ़ेसाती काल में अनुकूलता हेतु पूजित।',
    'Dark blue or black complexion. Rides a crow or vulture. Four arms: sword, trident, arrow, and bow. Limping posture. Slow, deliberate demeanour. Dressed in black or dark blue.'],

  ['chandra','Chandra','చంద్ర దేవుడు','சந்திரன்','चन्द्र','चन्द्रः','Soma, Indu, Nishanath, Sashi','smartha',
    'Lord Chandra is the Moon God, presiding over the mind, emotions, and fertility. He rides a silver chariot drawn by white horses and is associated with cooling, healing, and the tides. He appears in Shiva\'s matted locks.',
    'చంద్ర దేవుడు మనస్సు, భావోద్వేగాలు, సారవంతత పై అధికారం గల చంద్ర దేవుడు. శివుని జటాజూటంలో కనిపిస్తాడు.',
    'சந்திரன் மனம், உணர்வுகள், கருவுறுதல் மீது ஆதிக்கம் செலுத்தும் நிலவு கடவுள். சிவனின் ஜடை மகுடத்தில் காணப்படுகிறார்.',
    'चंद्र देव मन, भावना और उर्वरता के अधिपति हैं। शिव की जटाजूट में विराजमान।',
    'White complexion. Crescent moon as crown. Two arms holding a mace and lotus. Rides a chariot pulled by white horses or an antelope. Serene, benevolent expression.'],

  ['dattatreya','Dattatreya','దత్తాత్రేయ స్వామి','தத்தாத்ரேயர்','दत्तात्रेय','दत्तात्रेयः','Datta, Avadhuta, Trimurti avatara','smartha',
    'Lord Dattatreya is the combined avatar of Brahma, Vishnu, and Shiva and is revered in the Dattatreya tradition as the universal guru. He is depicted with three heads representing the three aspects of the divine.',
    'దత్తాత్రేయ స్వామి బ్రహ్మ, విష్ణు, శివుల సమ్మిళిత అవతారం. విశ్వ గురువుగా పూజించబడతాడు. మూడు శిరసులు మూడు దేవతలను సూచిస్తాయి.',
    'தத்தாத்ரேயர் பிரம்மா, விஷ்ணு, சிவன் ஆகியோரின் ஒருங்கிணைந்த அவதாரம். உலக குருவாக வழிபடப்படுகிறார்.',
    'दत्तात्रेय जी ब्रह्मा, विष्णु और शिव के सम्मिलित अवतार हैं। विश्वगुरु के रूप में पूजित।',
    'Three heads (Brahma, Vishnu, Shiva). Six arms holding symbols of all three: lotus, rosary, water pot, conch, discus, trident. Accompanied by four dogs (representing four Vedas) and a cow (Kamadhenu).'],

  ['annapurna','Annapurna','అన్నపూర్ణా దేవి','அன்னபூர்ணா','अन्नपूर्णा','अन्नपूर्णाः','Annapoorna, Chandrika, Vishwambhari','shakta',
    'Goddess Annapurna is the goddess of food and nourishment, a form of Parvati. She is worshipped to ensure that no one in the household goes hungry. The city of Varanasi is especially associated with her grace.',
    'అన్నపూర్ణా దేవి ఆహారం, పోషణకు అధిదేవత, పార్వతీ స్వరూపం. ఏ గృహంలోనూ అన్నం తక్కువ కాకుండా ఆమె అనుగ్రహం కొరకు పూజిస్తారు.',
    'அன்னபூர்ணா உணவு மற்றும் போஷணையின் தெய்வம், பார்வதியின் வடிவம். எந்த வீட்டிலும் பஞ்சம் வராமல் இருக்க வழிபடப்படுகிறார்.',
    'अन्नपूर्णा जी अन्न और पोषण की देवी, पार्वती का स्वरूप हैं। किसी भी घर में भूख न रहे इस हेतु पूजित।',
    'Four arms: ladle (serving food), pot of food, and two hands in giving mudras. Golden complexion. Seated on a throne. Adorned with jewels. Serene, motherly expression.'],

  ['sudarshana','Sudarshana','సుదర్శన స్వామి','சுதர்சனர்','सुदर्शन','सुदर्शनः','Chakra Deva, Vajranabha','vaishnava',
    'Lord Sudarshana is the personification of Vishnu\'s divine discus (Chakra), worshipped as an independent deity especially in the Sri Vaishnava tradition. He is invoked for protection against evil and disease.',
    'సుదర్శన స్వామి విష్ణువు యొక్క దివ్య చక్రానికి స్వరూపం. శ్రీ వైష్ణవ సంప్రదాయంలో స్వతంత్ర దేవుడిగా పూజించబడుతాడు.',
    'சுதர்சனர் விஷ்ணுவின் தெய்வீக சக்கரத்தின் (சக்ராயுதம்) உருவகம். ஸ்ரீ வைஷ்ணவ மரபில் தனி தெய்வமாக வழிபடப்படுகிறார்.',
    'सुदर्शन जी विष्णु के दिव्य चक्र के स्वरूप हैं। श्री वैष्णव परम्परा में स्वतंत्र देवता के रूप में पूजित।',
    'Depicted as a brilliant, fiery discus with sharp edges. Sixteen or more arms radiating from a central form. Anthropomorphic form has a fierce expression. Sits within the spinning Sudarshana Chakra.'],

  ['sai-baba','Sai Baba','సాయి బాబా','சாய் பாபா','साई बाबा','साईनाथः','Shirdi Sai, Sai Nath','smartha',
    'Sri Sai Baba of Shirdi is a revered saint worshipped across traditions, transcending religious boundaries. He is believed to be an avatar of Dattatreya and is invoked for healing, fulfillment of desires, and guidance.',
    'శిర్డీ సాయి బాబా మతభేదాలు అతిక్రమించి పూజించబడే మహాత్ముడు. దత్తాత్రేయ అవతారంగా భావించబడతారు. వ్యాధి నివారణ, కోరికల నెరవేర్పు కోసం ఆరాధించబడతారు.',
    'ஷீர்டி சாய் பாபா மத வேற்றுமைகளை கடந்து வழிபடப்படும் மகான். தத்தாத்ரேயரின் அவதாரமாக கருதப்படுகிறார்.',
    'शिर्डी साईं बाबा धर्म की सीमाओं से परे पूजित संत हैं। दत्तात्रेय का अवतार माना जाता है।',
    'Seated figure in simple white robe. Unique head covering (turban). Holding a staff or cloth. Serene, compassionate expression. Often depicted in a fakir-like posture, one leg over the other.'],

  ['narada','Narada','నారద మహర్షి','நாரதர்','नारद','नारदः','Narada Muni, Devarshi Narada','smartha',
    'Narada Muni is the celestial sage who travels all three worlds carrying a veena (lute). He is the messenger of the gods, a devotee of Vishnu, and the catalyst for many divine stories narrated in the Puranas.',
    'నారద మహర్షి మూడు లోకాలలో సంచరించే దేవర్షి. వీణ పట్టుకుని విష్ణు నామం పాడే పరమ భక్తుడు. పురాణ కథలలో ముఖ్య పాత్ర.',
    'நாரத முனிவர் மூன்று உலகங்களிலும் சஞ்சரிக்கும் தேவ ரிஷி. வீணை ஏந்தி விஷ்ணு நாமம் பாடும் பரம பக்தர்.',
    'नारद मुनि तीनों लोकों में विचरण करने वाले देवर्षि हैं। वीणा धारण कर विष्णु नाम गान करने वाले परम भक्त।',
    'Plays a veena (lute). Ochre or white garments. Topknot (Shikha). Carries a kamandala (water pot). Often depicted mid-flight between the worlds, smiling beatifically.'],
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Write gods rows (starting at row 2)
  const rows = GODS.map(g => [
    g[0], // slug
    g[1], g[2], g[3], g[4], g[5], g[6], // names
    g[7], // tradition
    g[8], g[9], g[10], g[11], // descriptions
    g[12], // iconography_en
    '', '', '', // illustration_filename, illustration_credit, image_drive_id
    'draft', 'en-only', // status, translation_status
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'gods!A2',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  console.log(`Written ${rows.length} gods`);

  // Write god_links for ashtothrams (one link per god to their ashtothram shloka)
  const godLinks = GODS.map((g, i) => [
    g[0], // god_slug
    'shloka',
    `${g[0]}-ashtothram`,
    1,
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'god_links!A2',
    valueInputOption: 'RAW',
    requestBody: { values: godLinks },
  });

  console.log(`Written ${godLinks.length} god_links`);
  console.log('\nDone.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
