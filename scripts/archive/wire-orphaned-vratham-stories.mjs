/**
 * Wires up stories_index rows that are fully-written vrata-katha stories but
 * have blank parent_slug/parent_type, so app/vrathams/[slug]/page.tsx (which
 * renders stories via getStoriesForParent) actually surfaces them. Also fills
 * in the blank brief_summary_en/te/ta/hi for the same rows.
 *
 * In-place cell edit only (never appends, never rewrites the whole tab):
 * fetches stories_index fresh, finds each target row by `slug`, and writes
 * only to parent_slug/parent_type/brief_summary_* for that row.
 *
 * Rows are added to DATA incrementally, one at a time, after explicit
 * go-ahead per row (see conversation). Re-running --write against
 * already-applied rows is a harmless no-op (same values rewritten).
 *
 * Dry-run by default. Pass --write to apply.
 *   node scripts/wire-orphaned-vratham-stories.mjs          (dry run)
 *   node scripts/wire-orphaned-vratham-stories.mjs --write  (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

const DATA = [
  {
    slug: 'ekadashi-katha',
    parent_slug: 'ekadashi-vratham',
    parent_type: 'vratham',
    brief_summary_en: "When the demon Mura seized heaven, Vishnu withdrew into yogic sleep in a mountain cave, and a warrior goddess born from his own body slew the demon in his place. Vishnu named her Ekadashi and decreed that all who fast on her day are cleansed of sin and carried to Vaikuntha.",
    brief_summary_te: "రాక్షసుడు మురుడు స్వర్గాన్ని ఆక్రమించినప్పుడు, విష్ణువు ఒక పర్వత గుహలో యోగనిద్రలో ఉండగా, ఆయన శరీరం నుండి ఉద్భవించిన ఒక వీర దేవి ఆ రాక్షసుడిని వధించింది. విష్ణువు ఆమెకు ఏకాదశి అని నామకరణం చేసి, ఆమె రోజున ఉపవాసం ఉన్నవారు పాపవిముక్తులై వైకుంఠం చేరుకుంటారని వరమిచ్చాడు.",
    brief_summary_ta: "அரக்கன் முரன் சொர்க்கத்தை ஆக்கிரமித்தபோது, விஷ்ணு ஒரு மலைக் குகையில் யோக நித்திரையில் இருந்தார்; அவரது உடலிலிருந்து தோன்றிய ஒரு வீரதேவி அந்த அரக்கனை வதம் செய்தார். விஷ்ணு அவளுக்கு ஏகாதசி என்று பெயரிட்டு, அன்று விரதம் இருப்பவர்கள் பாவங்களிலிருந்து விடுபட்டு வைகுண்டம் அடைவார்கள் என வரம் அளித்தார்.",
    brief_summary_hi: "जब असुर मुर ने स्वर्ग पर अधिकार कर लिया, विष्णु एक पर्वत गुफा में योगनिद्रा में लीन हो गए, और उनके शरीर से उत्पन्न एक वीर देवी ने उस असुर का वध किया। विष्णु ने उसे एकादशी नाम दिया और वरदान दिया कि उस दिन व्रत रखने वाले पापों से मुक्त होकर वैकुंठ पहुँचेंगे।",
  },
  {
    slug: 'pradosha-katha',
    parent_slug: 'pradosha-vratham',
    parent_type: 'vratham',
    brief_summary_en: "During the churning of the cosmic ocean, the deadly Halahala poison threatened to destroy creation, so Lord Shiva swallowed it to save the universe, and Parvati's Shakti held it in his throat, turning it forever blue. Shiva declared that fasting and worshipping him and Nandi at twilight on this Trayodashi day dissolves all sin.",
    brief_summary_te: "క్షీరసాగర మధనంలో హాలాహల విషం సృష్టిని నాశనం చేయబోతున్నప్పుడు, శివుడు విశ్వాన్ని రక్షించడానికి దాన్ని మింగివేశాడు; పార్వతి తన శక్తితో దానిని ఆయన కంఠంలోనే ఆపివేయగా, ఆ కంఠం నీలవర్ణంగా మారింది. ఈ త్రయోదశి రోజు సాయంసంధ్యలో శివుడిని, నందిని పూజిస్తూ ఉపవాసం ఉన్నవారి పాపాలన్నీ తీరిపోతాయని శివుడు ప్రకటించాడు.",
    brief_summary_ta: "பாற்கடலைக் கடையும்போது ஆலகால விஷம் படைப்பை அழிக்கத் தொடங்கியபோது, சிவன் அதனை உலகைக் காக்க விழுங்கினார்; பார்வதி தன் சக்தியால் அதை அவரது கழுத்திலேயே நிறுத்தினார், அது நீல நிறமாக மாறியது. இந்த திரயோதசி நாளின் மாலைப் பொழுதில் சிவனையும் நந்தியையும் வழிபட்டு விரதம் இருப்பவரின் பாவங்கள் அழியும் என சிவன் அருளினார்.",
    brief_summary_hi: "समुद्र मंथन के समय हलाहल विष सृष्टि को नष्ट करने लगा, तो शिव ने संसार की रक्षा के लिए उसे निगल लिया; पार्वती ने अपनी शक्ति से उसे उनके गले में ही रोक दिया, जिससे वह कंठ नीला हो गया। शिव ने घोषित किया कि इस त्रयोदशी के दिन संध्या समय शिव और नंदी की पूजा और व्रत करने वाले के सारे पाप नष्ट हो जाते हैं।",
  },
  {
    slug: 'karwa-chauth-katha',
    parent_slug: 'karwa-chauth',
    parent_type: 'vratham',
    brief_summary_en: "Queen Veervati broke her Karwa Chauth fast early after her brothers tricked her with a false moon, and her husband fell into a deathlike curse of a thousand thorns; she nursed him for a year until a maid pulled the final thorn and was wrongly crowned queen, but the truth emerged and Veervati's unwavering devotion restored her rightful place.",
    brief_summary_te: "వీరవతి రాణి తన సోదరులు నకిలీ చంద్రుడిని చూపి మభ్యపెట్టడంతో కర్వా చౌత్ ఉపవాసాన్ని ముందుగానే విరమించింది, అందువల్ల ఆమె భర్త వేలకొద్దీ ముళ్ళతో నిండిన మరణతుల్య శాపానికి గురయ్యాడు; ఆమె ఒక సంవత్సరం పాటు అతన్ని సేవించగా, చివరి ముల్లును ఒక పనిమనిషి తీసివేసి తప్పుగా రాణిగా ప్రకటించబడింది, కానీ నిజం వెలుగులోకి వచ్చి వీరవతి యొక్క అచంచల భక్తి ఆమెకు తన సరైన స్థానాన్ని తిరిగి తెచ్చిపెట్టింది.",
    brief_summary_ta: "வீரவதி இராணி தன் சகோதரர்கள் போலி நிலவைக் காட்டி ஏமாற்றியதால் கார்வா சவுத் விரதத்தை முன்கூட்டியே முறித்தார், இதனால் அவரது கணவர் ஆயிரம் முட்களால் நிறைந்த மரணத்திற்கு ஒப்பான சாபத்திற்கு ஆளானார்; ஓராண்டு காலம் அவரை பணி செய்த பின், ஒரு பணிப்பெண் இறுதி முள்ளை எடுக்க, அவளே தவறாக ராணியாக அறிவிக்கப்பட்டாள்; ஆனால் உண்மை வெளிப்பட்டு வீரவதியின் அசைக்க முடியாத பக்தி அவளது உண்மையான இடத்தை மீட்டுத் தந்தது.",
    brief_summary_hi: "रानी वीरवती ने अपने भाइयों द्वारा नकली चाँद दिखाकर धोखा देने पर करवा चौथ का व्रत समय से पहले तोड़ दिया, जिससे उनके पति हजारों काँटों वाले मृत्युतुल्य शाप में पड़ गए; उन्होंने एक वर्ष तक उनकी सेवा की, अंत में एक दासी ने अंतिम काँटा निकाला और गलती से रानी घोषित हो गई, परंतु सच्चाई सामने आने पर वीरवती की अटूट भक्ति ने उन्हें उनका सही स्थान लौटा दिया।",
  },
  {
    slug: 'maha-shivaratri-katha',
    parent_slug: 'maha-shivaratri',
    parent_type: 'vratham',
    brief_summary_en: "The hunter Lubdhaka, trapped by debt, unknowingly performed every rite of Mahashivaratri — fasting, keeping night vigil, and dropping bilva leaves and water onto a hidden Shiva lingam — while sparing a family of deer who begged for time before their fated death. His compassion earned him Shiva's forgiveness and a place in Kailash.",
    brief_summary_te: "అప్పుల్లో చిక్కుకున్న లుబ్ధకుడు అనే వేటగాడు, తనకు తెలియకుండానే మహాశివరాత్రి వ్రతంలోని అన్ని నియమాలను — ఉపవాసం, రాత్రి జాగారం, మరియు దాగివున్న శివలింగంపై బిల్వ పత్రాలు, నీటిని జారవిడవడం — పూర్తిచేశాడు; అదే సమయంలో తమ మరణానికి ముందు కొంత సమయం కోరిన జింకల కుటుంబాన్ని కూడా వదిలేశాడు. అతని కరుణ శివుని క్షమాభిక్షను, కైలాసంలో స్థానాన్ని అతనికి తెచ్చిపెట్టింది.",
    brief_summary_ta: "கடனில் சிக்கிய லுப்தகன் என்ற வேட்டைக்காரன், தனக்குத் தெரியாமலேயே மகாசிவராத்திரியின் அனைத்து விதிகளையும் — விரதம், இரவு விழிப்பு, மறைந்திருந்த சிவலிங்கத்தின் மீது வில்வ இலைகளும் நீரும் விழச் செய்தல் — நிறைவேற்றினான்; தங்கள் மரணத்திற்கு முன் சிறிது நேரம் கேட்ட மான் குடும்பத்தையும் விட்டுவிட்டான். அவனது கருணை சிவனின் மன்னிப்பையும் கைலாயத்தில் ஒரு இடத்தையும் பெற்றுத் தந்தது.",
    brief_summary_hi: "कर्ज में फंसे शिकारी लुब्धक ने बिना जाने ही महाशिवरात्रि के सभी विधान — व्रत, रात्रि जागरण, और छिपे हुए शिवलिंग पर बेल पत्र व जल का गिरना — पूरे कर दिए; साथ ही उसने अपनी मृत्यु से पहले कुछ समय माँगने वाले मृगों के परिवार को भी छोड़ दिया। उसकी करुणा ने उसे शिव की क्षमा और कैलाश में स्थान दिलाया।",
  },
  {
    slug: 'santoshi-mata-katha',
    parent_slug: 'santoshi-mata',
    parent_type: 'vratham',
    brief_summary_en: "A neglected youngest son and his mistreated wife find their fortunes transformed by devotion to Santoshi Mata: he rises to great wealth abroad while she endures cruelty at home, and after jealous sisters-in-law sabotage her fast with sour tamarind and disaster strikes, the Goddess exposes their treachery and restores the family's happiness.",
    brief_summary_te: "నిర్లక్ష్యానికి గురైన చిన్న కొడుకు, అతని బాధపడే భార్య సంతోషిమాత భక్తి ద్వారా తమ జీవితాన్ని మార్చుకుంటారు: అతను విదేశాలలో గొప్ప సంపదను పొందుతాడు, ఆమె ఇంట్లో కష్టాలను భరిస్తుంది; అసూయపరులైన తోడికోడళ్ళు ఆమె వ్రతాన్ని పులుపు చింతపండుతో చెడగొట్టి ఆపద తెచ్చిన తర్వాత, దేవి వారి కుట్రను బహిర్గతం చేసి కుటుంబ సంతోషాన్ని పునరుద్ధరిస్తుంది.",
    brief_summary_ta: "புறக்கணிக்கப்பட்ட இளைய மகனும் அவனது துன்புற்ற மனைவியும் சந்தோஷி மாதா பக்தியால் தங்கள் வாழ்க்கையை மாற்றுகின்றனர்: அவன் வெளிநாட்டில் பெரும் செல்வம் பெறுகிறான், அவள் வீட்டில் கொடுமையை சகிக்கிறாள்; பொறாமை கொண்ட மைத்துனிகள் புளிய பழத்தால் அவளது விரதத்தை கெடுத்து பேரிடர் ஏற்பட்ட பின், தேவி அவர்களின் சூழ்ச்சியை வெளிப்படுத்தி குடும்பத்தின் மகிழ்ச்சியை மீட்டு தருகிறாள்.",
    brief_summary_hi: "उपेक्षित छोटे बेटे और उसकी सताई गई पत्नी का जीवन संतोषी माता की भक्ति से बदल जाता है: वह विदेश में बड़ी संपत्ति पाता है, वह घर पर कष्ट सहती है; ईर्ष्यालु देवरानियाँ खट्टे इमली से उसका व्रत बिगाड़कर विपत्ति लाती हैं, तो माता उनकी चाल को उजागर कर परिवार की खुशहाली लौटा देती हैं।",
  },
  {
    slug: 'kedareswara-katha',
    parent_slug: 'kedareswara-vratham',
    parent_type: 'vratham',
    brief_summary_en: "When the ascetic Bhringi insulted Parvati by circling Shiva alone and she cursed him to lose all the flesh he inherited from her, Parvati resolved that Shiva and Shakti should never again be seen as separate. Her Kedareswara Vratam penance moved Shiva to merge with her as Ardhanarishvara, the half-male, half-female form of God.",
    brief_summary_te: "బృంగి మహర్షి పార్వతిని విస్మరించి శివుని ఒక్కరినే ప్రదక్షిణం చేయడం వల్ల ఆమె అతనికి తన నుండి వచ్చిన మాంసం మొత్తం పోగొట్టుకోమని శపించింది; అప్పుడు శివశక్తులు ఎన్నటికీ వేరుగా కనిపించకుండా ఉండాలని పార్వతి నిర్ణయించుకుంది. ఆమె చేసిన కేదారేశ్వర వ్రతం శివుడిని అర్ధనారీశ్వరుడిగా, అర్ధ పురుష-అర్ధ స్త్రీ రూపంలో ఆమెతో ఐక్యం చేసేలా చేసింది.",
    brief_summary_ta: "பிருங்கி முனிவர் பார்வதியை புறக்கணித்து சிவனை மட்டும் வலம் வந்ததால், அவளிடமிருந்து பெற்ற உடலின் அனைத்து சதையையும் இழக்கும்படி அவரை பார்வதி சபித்தார்; அப்போது சிவனும் சக்தியும் என்றென்றும் பிரிக்கப்பட்டவர்களாக காணப்படக்கூடாது என பார்வதி உறுதி கொண்டார். அவரது கேதாரேஸ்வர விரதம் சிவனை அர்த்தநாரீஸ்வரராக, பாதி ஆண்-பாதி பெண் வடிவில் அவருடன் இணையச் செய்தது.",
    brief_summary_hi: "ऋषि भृंगी ने पार्वती को नज़रअंदाज़ कर शिव की एकांत परिक्रमा की, तो पार्वती ने उन्हें अपने से मिला सारा मांस खो देने का शाप दिया; इसके बाद पार्वती ने संकल्प लिया कि शिव और शक्ति कभी पृथक न दिखें। उनके केदारेश्वर व्रत की तपस्या से प्रसन्न होकर शिव अर्धनारीश्वर के रूप में, आधे पुरुष-आधी स्त्री स्वरूप में उनके साथ एक हो गए।",
  },
  {
    slug: 'mangala-gauri-katha',
    parent_slug: 'mangala-gauri-vratham',
    parent_type: 'vratham',
    brief_summary_en: "A merchant's son destined to die of snakebite on his sixteenth birthday is married to Savitri, whose mother's lifelong Mangala Gauri Vratam protects the household; when a serpent sent by Death slithers in to strike, Savitri repels it with water blessed by her own fast, saving her husband and turning the snake into a jeweled necklace.",
    brief_summary_te: "పదహారేళ్ల వయసులో పాముకాటుతో మరణించే శాపం పొందిన ఒక వ్యాపారి కుమారుడు, తన తల్లి జీవితకాలం చేసిన మంగళగౌరి వ్రత పుణ్యంతో రక్షణ పొందిన సావిత్రిని వివాహం చేసుకుంటాడు; మృత్యువు పంపిన సర్పం అతన్ని కాటేయడానికి రాగా, సావిత్రి తన వ్రతంతో పావనమైన నీటితో దాన్ని తిప్పికొట్టి భర్తను కాపాడుతుంది, ఆ పాము ఆభరణాల హారంగా మారుతుంది.",
    brief_summary_ta: "பதினாறாவது வயதில் பாம்பு கடித்து இறக்கும் சாபம் பெற்ற வர்த்தகனின் மகன், தன் தாயின் வாழ்நாள் மங்கள கௌரி விரதத்தால் பாதுகாக்கப்படும் சாவித்திரியை மணக்கிறான்; எமன் அனுப்பிய பாம்பு தீண்ட வர, சாவித்திரி தன் விரதத்தால் புனிதமான நீரால் அதைத் தடுத்து கணவனைக் காப்பாற்றுகிறாள், அந்த பாம்பு நகையாக மாறுகிறது.",
    brief_summary_hi: "सोलहवें जन्मदिन पर सर्पदंश से मरने का शाप पाए एक व्यापारी के पुत्र का विवाह सावित्री से होता है, जिसकी माँ के जीवनभर के मंगला गौरी व्रत से घर सुरक्षित है; यम द्वारा भेजा गया सर्प जब पति को डसने आता है, सावित्री अपने व्रत से पवित्र जल छिड़ककर उसे रोक देती है और पति को बचा लेती है, वह सर्प एक रत्नहार में बदल जाता है।",
  },
  {
    slug: 'hartalika-teej-katha',
    parent_slug: 'hartalika-teej',
    parent_type: 'vratham',
    brief_summary_en: "Young Parvati, secretly devoted to Shiva, is nearly betrothed to Vishnu by her father; her friend Malini smuggles her into a forest cave where she performs an unbroken penance, molding a sand lingam. Her tapas moves Shiva to descend and accept her as his wife, establishing the vow women observe to claim their own destiny.",
    brief_summary_te: "శివుని పట్ల రహస్యంగా భక్తి కలిగిన బాల్య పార్వతిని ఆమె తండ్రి విష్ణువుకు ఇచ్చి వివాహం చేయాలని నిర్ణయిస్తాడు; ఆమె స్నేహితురాలు మాలిని ఆమెను ఒక అరణ్య గుహలోకి తీసుకువెళ్తుంది, అక్కడ ఆమె మేటి తపస్సు చేసి, మరళైవాలుతో శివలింగాన్ని తయారు చేస్తుంది. ఆమె తపస్సు శివుడిని ప్రేరేపించి, ఆయన అవతరించి ఆమెను తన భార్యగా అంగీకరిస్తాడు, ఇది స్త్రీలు తమ విధిని పొందేందుకు ఆచరించే వ్రతంగా స్థాపించబడింది.",
    brief_summary_ta: "சிவனிடம் ரகசியமாக பக்தி கொண்ட இளம் பார்வதியை அவளது தந்தை விஷ்ணுவுக்கு மணமுடிக்க முடிவெடுக்கிறார்; அவளது தோழி மாலினி அவளை ஒரு வனக் குகைக்கு அழைத்துச் செல்கிறாள், அங்கு அவள் மணலால் சிவலிங்கத்தை உருவாக்கி இடைவிடாத தவம் செய்கிறாள். அவளது தவம் சிவனைத் தூண்டி, அவர் வந்து அவளை மனைவியாக ஏற்றுக்கொள்கிறார்; இதுவே பெண்கள் தங்கள் விதியை நிர்ணயிக்க கடைப்பிடிக்கும் விரதமாக நிலைநிறுத்தப்பட்டது.",
    brief_summary_hi: "शिव के प्रति गुप्त भक्ति रखने वाली युवा पार्वती का विवाह उनके पिता विष्णु से करने का निश्चय करते हैं; उनकी सखी मालिनी उन्हें एक वन गुफा में ले जाती है, जहाँ वे रेत से शिवलिंग बनाकर अखंड तपस्या करती हैं। उनकी तपस्या से प्रसन्न होकर शिव स्वयं आकर उन्हें पत्नी रूप में स्वीकार करते हैं, जिससे यह व्रत स्त्रियों द्वारा अपनी नियति चुनने के लिए स्थापित हुआ।",
  },
  {
    slug: 'vaibhav-lakshmi-katha',
    parent_slug: 'vaibhav-lakshmi-vrat',
    parent_type: 'vratham',
    brief_summary_en: "When her husband Arvind's gambling and addictions ruin their household, Sheela is visited by a disguised Goddess Lakshmi who teaches her the Vaibhav Lakshmi Vrat; her devotion transforms Arvind's heart and fortunes, lifting the family from poverty back to prosperity.",
    brief_summary_te: "భర్త అర్విందుడి పేకాట, దురలవాట్ల వల్ల ఇల్లు నాశనమైనప్పుడు, మారువేషంలో వచ్చిన లక్ష్మీదేవి షీలాకు వైభవలక్ష్మీ వ్రతం నేర్పిస్తుంది; ఆమె భక్తి అర్విందుడి హృదయాన్ని, వారి భవితను మార్చి, కుటుంబాన్ని పేదరికం నుండి సంపదకు తిరిగి తీసుకువస్తుంది.",
    brief_summary_ta: "கணவன் அர்விந்தின் சூதாட்டமும் தீய பழக்கங்களும் இல்லத்தை அழிக்கும்போது, மாறுவேடத்தில் வந்த லக்ஷ்மி தேவி சீலாவுக்கு வைபவ லக்ஷ்மி விரதத்தை கற்பிக்கிறாள்; அவளது பக்தி அர்விந்தின் மனதையும் அவர்களது வாழ்வையும் மாற்றி, குடும்பத்தை வறுமையிலிருந்து செழிப்புக்கு மீட்கிறது.",
    brief_summary_hi: "पति अरविंद के जुए और बुरी लतों से घर बर्बाद हो जाने पर, वेश बदलकर आई लक्ष्मी माता शीला को वैभव लक्ष्मी व्रत सिखाती हैं; उनकी भक्ति से अरविंद का हृदय और उनका भाग्य बदल जाता है, और परिवार गरीबी से समृद्धि की ओर लौट आता है।",
  },
  {
    slug: 'skanda-sashti-katha',
    parent_slug: 'skanda-sashti-vratham',
    parent_type: 'vratham',
    brief_summary_en: "The demon Soorapadman, protected by a boon that only a son of Shiva could kill him, enslaves the gods and transforms into a giant mango tree to block Murugan's chariot. Murugan's Vel splits the tree, and its halves become a peacock and a rooster that go on to serve as his vahana and emblem, ending the demon's tyranny.",
    brief_summary_te: "శివుని కుమారుడు మాత్రమే తనను చంపగలడనే వరం పొందిన శూరపద్ముడు దేవతలను బానిసలుగా చేసి, మురుగన్ రథాన్ని అడ్డుకోవడానికి భారీ మామిడి చెట్టుగా మారతాడు. మురుగన్ వేలు ఆ చెట్టును రెండుగా చీలుస్తుంది, ఆ రెండు భాగాలు నెమలిగా, కోడిపుంజుగా మారి అతని వాహనం, చిహ్నంగా మారి రాక్షసుని అరాచకాన్ని అంతం చేస్తాయి.",
    brief_summary_ta: "சிவனின் மகனால் மட்டுமே கொல்லப்பட முடியும் என்ற வரம் பெற்ற சூரபத்மன், தேவர்களை அடிமைப்படுத்தி, முருகனின் தேரைத் தடுக்க பெரிய மாமரமாக மாறுகிறான். முருகனின் வேல் அந்த மரத்தை இரண்டாக பிளக்கிறது, அந்த இரு பாகங்களும் மயிலாகவும் சேவலாகவும் மாறி அவரது வாகனமும் சின்னமும் ஆகி அரக்கனின் கொடுங்கோன்மையை முடிவுக்கு கொண்டு வருகின்றன.",
    brief_summary_hi: "शिव के पुत्र के अलावा किसी से न मरने का वरदान पाए असुर सूरपद्मन ने देवताओं को दास बनाकर, मुरुगन के रथ को रोकने हेतु एक विशाल आम के वृक्ष का रूप ले लिया। मुरुगन का वेल उस वृक्ष को दो भागों में काट देता है, और उसके दोनों भाग मोर और मुर्गे में बदल जाते हैं जो उनके वाहन और चिह्न बनते हैं, जिससे असुर का अत्याचार समाप्त हो जाता है।",
  },
  {
    slug: 'chhath-puja-katha',
    parent_slug: 'chhath-puja',
    parent_type: 'vratham',
    brief_summary_en: "During the Pandavas' exile, Draupadi undertakes a rigorous river fast and offers Arghya to the setting and rising sun; a pleased Surya grants her the inexhaustible Akshaya Patra vessel, ensuring the exiled family and the sages with them never go hungry.",
    brief_summary_te: "పాండవుల వనవాస సమయంలో, ద్రౌపది కఠినమైన నదీ ఉపవాసం చేసి అస్తమించే, ఉదయించే సూర్యునికి అర్ఘ్యం సమర్పిస్తుంది; సంతృప్తుడైన సూర్యుడు ఆమెకు తరగని అక్షయపాత్రను ఇస్తాడు, దీనివల్ల వనవాసంలో ఉన్న కుటుంబం, వారితో ఉన్న మునులు ఎన్నటికీ ఆకలితో ఉండరు.",
    brief_summary_ta: "பாண்டவர்களின் வனவாசத்தின்போது, திரௌபதி கடுமையான நதி விரதம் இருந்து மறையும், எழும் சூரியனுக்கு அர்க்கியம் அளிக்கிறாள்; மகிழ்ந்த சூரியன் அவளுக்கு தீரா அக்ஷய பாத்திரத்தை வழங்குகிறார், இதனால் வனவாசத்தில் இருக்கும் குடும்பமும் அவர்களுடன் இருக்கும் முனிவர்களும் என்றும் பசியால் வாடமாட்டார்கள்.",
    brief_summary_hi: "पांडवों के वनवास के दौरान, द्रौपदी कठोर नदी व्रत करती हैं और अस्त और उदय होते सूर्य को अर्घ्य देती हैं; प्रसन्न सूर्यदेव उन्हें अक्षय पात्र प्रदान करते हैं, जिससे वनवास में परिवार और उनके साथ के मुनि कभी भूखे नहीं रहते।",
  },
  {
    slug: 'sankashti-chaturthi-katha',
    parent_slug: 'sankashti-chaturthi-vratham',
    parent_type: 'vratham',
    brief_summary_en: "When Shiva sets a race around the universe to decide which son deserves to be worshipped first, Kartikeya flies off on his peacock while Ganesha simply circles his parents seven times, reasoning that the entire universe resides within them — winning the crown of Vighneshwara and the right of Agrapuja.",
    brief_summary_te: "మొదట పూజించదగినది ఎవరు అని నిర్ణయించడానికి శివుడు విశ్వం చుట్టూ ఒక పరుగు పెడతాడు; కార్తికేయుడు నెమలిపై ఎగిరిపోగా, గణేశుడు తన తల్లిదండ్రుల చుట్టూ ఏడుసార్లు ప్రదక్షిణ చేసి, మొత్తం విశ్వం వారిలోనే ఉందని వాదిస్తాడు — దీంతో విఘ్నేశ్వరుని కిరీటం, అగ్రపూజ హక్కు గణేశుడికి దక్కుతాయి.",
    brief_summary_ta: "முதலில் யாரை வழிபடவேண்டும் என்பதை தீர்மானிக்க சிவன் பிரபஞ்சம் முழுவதும் ஒரு பந்தயத்தை ஏற்பாடு செய்கிறார்; கார்த்திகேயன் தனது மயிலில் பறந்து செல்ல, கணேசன் தன் பெற்றோரை ஏழு முறை வலம் வந்து, முழு பிரபஞ்சமும் அவர்களுக்குள் இருக்கிறது என வாதிடுகிறார் — இதனால் விக்னேஸ்வரர் பட்டமும் அக்ரபூஜை உரிமையும் கணேசனுக்கு கிடைக்கின்றன.",
    brief_summary_hi: "किसे पहले पूजा जाए यह तय करने के लिए शिव ब्रह्मांड की परिक्रमा की दौड़ रखते हैं; कार्तिकेय अपने मोर पर उड़ जाते हैं, जबकि गणेश अपने माता-पिता की सात बार परिक्रमा करके तर्क देते हैं कि संपूर्ण ब्रह्मांड उन्हीं में समाहित है — इससे गणेश को विघ्नेश्वर का ताज और अग्रपूजा का अधिकार मिलता है।",
  },
  {
    slug: 'savitri-katha',
    parent_slug: 'savitri-vratham',
    parent_type: 'vratham',
    brief_summary_en: "Savitri marries Satyavan knowing he is fated to die within a year; when Yama comes to claim his soul, she follows him into the underworld, wins him over with wit and devotion, and cleverly extracts a boon that can only be fulfilled if her husband lives — restoring Satyavan to life.",
    brief_summary_te: "సావిత్రి తన భర్త సత్యవంతుడు ఒక సంవత్సరంలో మరణిస్తాడని తెలిసినా అతన్ని వివాహం చేసుకుంటుంది; యముడు అతని ఆత్మను తీసుకువెళ్లడానికి రాగా, ఆమె అతన్ని పాతాళం వరకు వెంబడించి, తన బుద్ధి, భక్తితో యముడిని మెప్పించి, భర్త జీవించి ఉంటేనే నెరవేరే వరం తెలివిగా పొందుతుంది — దీంతో సత్యవంతుడు తిరిగి జీవం పోసుకుంటాడు.",
    brief_summary_ta: "சாவித்திரி தன் கணவன் சத்தியவான் ஒரு வருடத்தில் இறப்பான் என்று அறிந்தே அவனை மணக்கிறாள்; யமன் அவனது ஆன்மாவை எடுக்க வர, அவள் அவனை பாதாளம் வரை பின்தொடர்ந்து, தன் புத்திசாலித்தனத்தாலும் பக்தியாலும் யமனை வசப்படுத்தி, கணவன் உயிருடன் இருந்தால் மட்டுமே நிறைவேறும் வரத்தை புத்திசாலித்தனமாக பெறுகிறாள் — இதனால் சத்தியவான் மீண்டும் உயிர் பெறுகிறான்.",
    brief_summary_hi: "सावित्री जानते हुए भी कि सत्यवान की मृत्यु एक वर्ष में होगी, उनसे विवाह करती हैं; यम जब उनकी आत्मा लेने आते हैं, तो वे उनके पीछे पाताल तक जाती हैं, अपनी बुद्धि और भक्ति से यम को प्रभावित करती हैं, और चतुराई से ऐसा वरदान माँगती हैं जो केवल पति के जीवित रहने पर ही पूर्ण हो सकता है — इस प्रकार सत्यवान पुनः जीवित हो जाते हैं।",
  },
  {
    slug: 'satyanarayana-katha',
    parent_slug: 'satyanarayana-vratham',
    parent_type: 'vratham',
    brief_summary_en: "Narada asks Vishnu for a path to relieve human suffering, and Vishnu reveals the Satyanarayana Vratam through the stories of the poor Brahmin Sadananda, a woodcutter, King Ulkamukha, and the merchant Sadhu, whose family loses everything through broken vows and pride before devotion and repentance restore their fortune.",
    brief_summary_te: "నారదుడు మానవుల బాధలను తీర్చే మార్గం కోసం విష్ణువును అడగగా, పేద బ్రాహ్మణుడు సదానందుడు, ఒక కట్టెలు కొట్టేవాడు, రాజు ఉల్కముఖుడు, వ్యాపారి సాధు కుటుంబం కథల ద్వారా విష్ణువు సత్యనారాయణ వ్రతాన్ని బోధిస్తాడు; మొండితనం, మరచిన వాగ్దానాల వల్ల సర్వం కోల్పోయిన సాధు కుటుంబం భక్తి, పశ్చాత్తాపంతో తిరిగి తమ సంపదను పొందుతుంది.",
    brief_summary_ta: "நாரதர் மனித துயரை நீக்கும் வழி கேட்க, விஷ்ணு ஏழை பிராமணன் சதானந்தன், ஒரு மரம் வெட்டுபவன், அரசன் உல்கமுகன், வர்த்தகன் சாது குடும்பத்தின் கதைகள் மூலம் சத்யநாராயண விரதத்தை வெளிப்படுத்துகிறார்; மறந்த சபதங்களாலும் ஆணவத்தாலும் அனைத்தையும் இழந்த சாது குடும்பம் பக்தியாலும் மனம் திருந்துவதாலும் தங்கள் செல்வத்தை மீட்கிறது.",
    brief_summary_hi: "नारद मानव कष्टों को दूर करने का मार्ग पूछते हैं, तो विष्णु निर्धन ब्राह्मण सदानंद, एक लकड़हारे, राजा उल्कामुख और व्यापारी साधु के परिवार की कथाओं के माध्यम से सत्यनारायण व्रत प्रकट करते हैं; भूली हुई प्रतिज्ञाओं और अभिमान से सब कुछ खो देने वाला साधु का परिवार भक्ति और पश्चाताप से अपना सौभाग्य पुनः प्राप्त करता है।",
  },
];

console.log(`\n══ wire-orphaned-vratham-stories.mjs ══════════════════════════════`);
console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (pass --write to apply)'}`);

const { rows, col } = await getTabWithHeaders('stories_index');
const C = {
  slug: col('slug'),
  parent_slug: col('parent_slug'),
  parent_type: col('parent_type'),
  brief_summary_en: col('brief_summary_en'),
  brief_summary_te: col('brief_summary_te'),
  brief_summary_ta: col('brief_summary_ta'),
  brief_summary_hi: col('brief_summary_hi'),
};

const updates = [];

for (const item of DATA) {
  const rowIdx = rows.findIndex(r => r[C.slug] === item.slug);
  if (rowIdx === -1) {
    console.log(`\n⛔ ${item.slug}: NOT FOUND in stories_index — skipping`);
    continue;
  }
  const sheetRow = rowIdx + 2;
  console.log(`\n── ${item.slug} (row ${sheetRow}) ──`);

  const fields = [
    ['parent_slug', item.parent_slug],
    ['parent_type', item.parent_type],
    ['brief_summary_en', item.brief_summary_en],
    ['brief_summary_te', item.brief_summary_te],
    ['brief_summary_ta', item.brief_summary_ta],
    ['brief_summary_hi', item.brief_summary_hi],
  ];

  for (const [field, value] of fields) {
    const colIdx = C[field];
    const current = rows[rowIdx][colIdx] ?? '';
    const a1 = `stories_index!${colLetter(colIdx)}${sheetRow}`;
    if (current === value) {
      console.log(`  SKIP  ${field} already "${value.slice(0, 60)}${value.length > 60 ? '…' : ''}"`);
      continue;
    }
    updates.push({ range: a1, values: [[value]] });
    console.log(`  SET   ${field}: "${current}" -> "${value.slice(0, 60)}${value.length > 60 ? '…' : ''}"`);
  }
}

console.log(`\n${updates.length} cell(s) to update.`);

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  const sheets = await getSheetsClient();
  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    });
  }
  console.log('Applied.');
}
