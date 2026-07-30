/**
 * Appends the vrata-katha story for mondays-shiva-vratham, the one published
 * vratham confirmed to have zero linked story content. Writes:
 *   1. One new row to stories_index (slug: mondays-shiva-vratham-katha)
 *   2. Four language rows (en/te/ta/hi) x N paragraphs to stories_content
 *
 * Refuses to run if the slug already has rows in either tab (no duplicates,
 * no overwrites). Dry-run by default; pass --write to apply.
 *
 * Usage:
 *   node scripts/upload-mondays-shiva-vratham-story.mjs          (dry run)
 *   node scripts/upload-mondays-shiva-vratham-story.mjs --write  (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

const SLUG = 'mondays-shiva-vratham-katha';
const PARENT_SLUG = 'mondays-shiva-vratham';

const INDEX_ROW = {
  slug: SLUG,
  title_en: 'Monday Shiva Vratham Katha',
  title_te: 'సోమవార శివ వ్రత కథ',
  title_ta: 'திங்கட்கிழமை சிவ விரத கதை',
  title_hi: 'सोमवार शिव व्रत कथा',
  deity_slug: 'shiva',
  story_type: 'vrata-katha',
  source_scripture_en: 'Shiva Purana / Skanda Purana tradition (Somvar Vrat / Som Pradosh Vrat Katha)',
  reading_instruction_en: 'Traditionally read or recited on a Monday, especially during Shravana, before or after the Somvar Vrat puja.',
  brief_summary_en: "A childless merchant's wife's unbroken Monday devotion to Shiva and Parvati wins her a son fated to a short life — until her faithful vow itself becomes the grace that saves him.",
  brief_summary_te: 'ఒక సంతానం లేని వర్తకుని భార్య శివపార్వతులను సోమవారాల్లో నిష్ఠగా పూజించి, పన్నెండేళ్లు మాత్రమే జీవించే కుమారుడిని పొందుతుంది—చివరికి ఆమె అచంచల వ్రతమే అతని ప్రాణాలను కాపాడుతుంది.',
  brief_summary_ta: 'மகவற்ற வணிகனின் மனைவி திங்கள்தோறும் சிவபார்வதியை பக்தியுடன் வழிபட்டு, பன்னிரண்டு ஆண்டுகள் மட்டுமே வாழும் மகனைப் பெறுகிறாள்—இறுதியில் அவளது உறுதியான விரதமே அவனது உயிரைக் காக்கிறது.',
  brief_summary_hi: 'एक निःसंतान व्यापारी की पत्नी हर सोमवार शिव-पार्वती की अटूट भक्ति से पूजा करती है और उसे केवल बारह वर्ष जीने वाला पुत्र प्राप्त होता है—अंततः उसका अडिग व्रत ही उसके पुत्र के प्राणों की रक्षा करता है।',
  gdoc_id_en: '',
  gdoc_id_te: '',
  gdoc_id_ta: '',
  gdoc_id_hi: '',
  status: 'published',
  translation_status: 'complete',
  parent_slug: PARENT_SLUG,
  parent_type: 'vratham',
};

const CONTENT = {
  en: [
    "Thus it is told in the tradition surrounding the *Skanda Purana*. In the holy city of Kashi, on the banks of the river Ganga, there lived a prosperous merchant and his wife, blessed with wealth beyond counting but denied the one gift they longed for above all others — a child. Every Monday, the wife rose before dawn, bathed in the cold river, and walked to the ancient Shiva temple at the edge of the city. There she fasted the whole day, lit a lamp of clarified butter before the Lingam, and offered bilva leaves and unbroken rice with folded hands. Years passed in this quiet, unbroken devotion. She asked for nothing when she prayed, only that her worship be accepted, and slowly her patient faith began to draw the attention of the very heavens she bowed to.",
    "One evening, Goddess Parvati, watching the merchant's wife from her seat beside Lord Shiva atop Kailash, was moved to tears by such steadfast devotion. 'Lord,' she said, 'this woman has kept her Monday vow without a single lapse for years, yet her house remains empty of laughter. Grant her a son.' Shiva smiled gently and warned that any child born to her would carry a fate already written — a life of only twelve short years. Parvati pressed her case further, and Shiva relented, adding a condition of his own: should the boy's mother never fail her vow, the shortened span might yet be lengthened by grace. That very night, the merchant's wife dreamed of a radiant infant cradled in Nandi's horns, and within the year, a son was born to the merchant's house, filling its silent halls with sudden, overflowing joy.",
    "The boy grew tall and clever, his father's pride, and reached his twelfth year exactly as the day approached for his sacred thread ceremony. His maternal uncle, secretly aware of the boy's fate through a passing sage, offered to take him on a journey to a distant city, ostensibly to complete his education and arrange a marriage, but truly to spare his sister the anguish of watching her son die before her eyes. Along the road, they stopped in a kingdom where a princess was being married, and by strange custom, the boy stood in briefly for the ailing bridegroom during the ceremony, becoming, without anyone's plan, her husband in the eyes of the assembly. That very night, as the appointed hour of his death crept close, the boy sat alone in the palace garden, unaware of the shadow gathering behind him.",
    "Back in Kashi, his mother had not once missed her Monday fast through all these months, and on that very evening she had, as always, fed Brahmins in Shiva's name and distributed sweet payasam to the poor before touching food herself. Far away, the messengers of Yama arrived to claim the boy, but found themselves stopped at the garden gate — Lord Shiva himself stood before them, blazing with the trident, refusing passage. 'This boy's mother has never broken her vow to me,' he declared, 'and her merit stands taller than his fate.' The messengers withdrew empty-handed, and the boy lived to a full old age, returning to Kashi with his bride to touch his mother's feet. Since that day, the Monday Shiva Vratam has been kept by every household that seeks long life, a good marriage, and the unbroken grace of Shiva and Parvati together.",
  ],
  te: [
    "ఈ కథ *స్కంద పురాణం* సంప్రదాయంలో చెప్పబడింది. గంగా నది ఒడ్డున ఉన్న పవిత్ర కాశీ నగరంలో ఒక ధనవంతుడైన వర్తకుడు, అతని భార్య నివసించేవారు. వారికి లెక్కలేనంత సంపద ఉన్నా, తాము అత్యంత కోరుకున్న ఒక్క వరం—సంతానం—మాత్రం లభించలేదు. ప్రతి సోమవారం ఆ భార్య తెల్లవారుజామునే లేచి, చల్లని నదిలో స్నానం చేసి, నగర అంచున ఉన్న ప్రాచీన శివాలయానికి నడిచి వెళ్ళేది. అక్కడ రోజంతా ఉపవాసం ఉండి, లింగం ముందు నెయ్యి దీపం వెలిగించి, బిల్వ పత్రాలు, అక్షతలు చేతులు జోడించి సమర్పించేది. ఇలా నిశ్శబ్దమైన, తెగని భక్తితో సంవత్సరాలు గడిచాయి. ఆమె ప్రార్థించేటప్పుడు ఏమీ కోరుకోలేదు, తన పూజ స్వీకరించబడాలని మాత్రమే కోరుకుంది, మెల్లగా ఆమె సహనశీలమైన విశ్వాసం తాను నమస్కరించే ఆ దేవతల దృష్టిని ఆకర్షించడం మొదలుపెట్టింది.",
    "ఒక సాయంత్రం, కైలాసంలో శివుని పక్కన కూర్చున్న పార్వతీదేవి, ఆ వర్తక భార్య యొక్క నిలకడైన భక్తిని చూసి కంటతడి పెట్టుకుంది. 'ప్రభూ,' అని ఆమె అన్నది, 'ఈ స్త్రీ సంవత్సరాల తరబడి ఒక్క సోమవారం కూడా తప్పకుండా తన వ్రతాన్ని పాటిస్తోంది, అయినా ఆమె ఇల్లు నవ్వుల కోసం వెతుకుతూనే ఉంది. ఆమెకు ఒక కుమారుడిని అనుగ్రహించండి.' శివుడు మృదువుగా నవ్వి, ఆమెకు పుట్టే బిడ్డ కేవలం పన్నెండు సంవత్సరాలు మాత్రమే జీవించే విధిని కలిగి ఉంటాడని హెచ్చరించాడు. పార్వతి మరింత బలంగా వేడుకోగా, శివుడు అంగీకరించి, తన సొంత షరతును జోడించాడు—బిడ్డ తల్లి తన వ్రతంలో ఎప్పుడూ విఫలం కాకపోతే, ఆ తగ్గించిన ఆయుష్షును అనుగ్రహం ద్వారా పొడిగించవచ్చని. ఆ రాత్రే వర్తక భార్య నందీశ్వరుని కొమ్ముల మధ్య ప్రకాశించే శిశువును కలలో చూసింది, మరియు ఏడాది తిరిగే సరికి వర్తకుని ఇంట ఒక కుమారుడు జన్మించి, నిశ్శబ్దమైన ఆ గృహాన్ని ఆకస్మిక ఆనందంతో నింపాడు.",
    "ఆ బాలుడు పొడవుగా, తెలివైనవాడుగా ఎదిగి, తండ్రికి గర్వకారణమయ్యాడు, పన్నెండవ ఏట అడుగుపెట్టగానే అతని ఉపనయనం జరగవలసిన రోజు దగ్గరపడింది. అతని మేనమామకు, ఒక సంచార ఋషి ద్వారా బాలుని విధి గురించి రహస్యంగా తెలిసింది. అతను బాలుని విద్యాభ్యాసం పూర్తి చేయించడానికి, వివాహం ఏర్పాటు చేయడానికి అనే నెపంతో దూర నగరానికి తీసుకువెళ్తానని ప్రతిపాదించాడు—కానీ నిజంగా అతని సోదరిని తన కుమారుడు కళ్ల ముందే మరణించడం చూసే బాధ నుండి తప్పించాలనే ఉద్దేశ్యంతో. దారిలో, ఒక రాజ్యంలో ఆగినప్పుడు అక్కడ ఒక యువరాణి వివాహం జరుగుతుండగా, వింత ఆచారం ప్రకారం, అస్వస్థుడైన వరుని స్థానంలో ఆ బాలుడు క్షణకాలం నిలబడవలసి వచ్చి, ఎవరూ ఊహించని విధంగా, సభ దృష్టిలో ఆమెకు భర్త అయ్యాడు. అదే రాత్రి, అతని మరణ ఘడియ సమీపిస్తుండగా, ఆ బాలుడు రాజభవన తోటలో ఒంటరిగా కూర్చున్నాడు, తన వెనుక ముసురుకుంటున్న నీడ గురించి తెలియకుండా.",
    "కాశీలో, ఆ నెలలన్నీ అతని తల్లి ఒక్క సోమవారం వ్రతం కూడా తప్పలేదు, ఆ సాయంత్రం కూడా ఎప్పటిలాగే శివుని పేరిట బ్రాహ్మణులకు భోజనం పెట్టి, తాను తినడానికి ముందు పేదలకు తీపి పాయసం పంచిపెట్టింది. దూరంగా, యమదూతలు బాలుడిని తీసుకువెళ్లడానికి వచ్చారు, కానీ తోట గుమ్మం వద్దే ఆగిపోయారు—స్వయంగా శివుడు త్రిశూలంతో ప్రజ్వలిస్తూ వారికి అడ్డుగా నిలిచాడు. 'ఈ బాలుని తల్లి నాకు చేసిన వ్రతాన్ని ఎప్పుడూ మీరలేదు,' అని ఆయన ప్రకటించాడు, 'ఆమె పుణ్యం అతని విధి కంటే ఎత్తుగా నిలుస్తుంది.' యమదూతలు ఖాళీ చేతులతో వెనుదిరిగారు, బాలుడు పూర్తి వృద్ధాప్యం వరకు జీవించి, తన భార్యతో కాశీకి తిరిగి వచ్చి తల్లి పాదాలను తాకాడు. ఆనాటి నుండి, దీర్ఘాయువు, మంచి వివాహం, శివపార్వతుల నిరంతర అనుగ్రహం కోరుకునే ప్రతి కుటుంబం సోమవార శివ వ్రతాన్ని పాటిస్తూ వస్తోంది.",
  ],
  ta: [
    "இக்கதை *ஸ்கந்த புராண* மரபில் கூறப்படுகிறது. கங்கை நதிக்கரையில் அமைந்த புனித காசி நகரில், எண்ணற்ற செல்வம் படைத்த ஒரு வணிகனும் அவனது மனைவியும் வாழ்ந்தனர். அவர்களுக்கு அனைத்தும் இருந்தும், அவர்கள் மிகவும் விரும்பிய ஒரே வரம்—ஒரு குழந்தை—மட்டும் கிடைக்கவில்லை. ஒவ்வொரு திங்கட்கிழமையும் அந்த மனைவி விடியற்காலையில் எழுந்து, குளிர்ந்த நதியில் நீராடி, நகர எல்லையில் இருந்த பழமையான சிவன் கோவிலுக்குச் சென்றாள். அங்கு நாள் முழுவதும் விரதம் இருந்து, லிங்கத்தின் முன் நெய் விளக்கேற்றி, கூப்பிய கைகளுடன் வில்வ இலைகளையும் அரிசியையும் சமர்ப்பித்தாள். இந்த அமைதியான, தடையற்ற பக்தியில் பல ஆண்டுகள் கடந்தன. அவள் பிரார்த்திக்கும்போது எதையும் கேட்கவில்லை, தன் வழிபாடு ஏற்றுக்கொள்ளப்பட வேண்டும் என்பதைத் தவிர, மெதுவாக அவளது பொறுமையான நம்பிக்கை அவள் வணங்கிய தேவர்களின் கவனத்தை ஈர்க்கத் தொடங்கியது.",
    "ஒரு மாலைப் பொழுதில், கைலாசத்தில் சிவனுக்கு அருகில் அமர்ந்திருந்த பார்வதி தேவி, அந்த வணிகன் மனைவியின் உறுதியான பக்தியைக் கண்டு கண்ணீர் விட்டாள். 'ஆண்டவரே,' என்று அவள் கூறினாள், 'இந்தப் பெண் பல ஆண்டுகளாக ஒரு திங்கட்கிழமை கூட தவறாமல் தன் விரதத்தைக் கடைப்பிடித்து வருகிறாள், இருந்தும் அவள் வீடு சிரிப்பொலிக்காக ஏங்குகிறது. அவளுக்கு ஒரு மகனை அருள்வீராக.' சிவன் மென்மையாகச் சிரித்து, பிறக்கவிருக்கும் குழந்தை பன்னிரண்டு ஆண்டுகள் மட்டுமே வாழும் விதியைப் பெற்றிருக்கும் என எச்சரித்தார். பார்வதி மேலும் வலியுறுத்தவே, சிவன் ஒப்புக்கொண்டு, தன் சொந்த நிபந்தனையையும் சேர்த்தார்—குழந்தையின் தாய் தன் விரதத்தில் ஒருபோதும் தவறாதவரை, அந்த குறுகிய ஆயுளை அருளால் நீட்டிக்கலாம் என்று. அன்றிரவே வணிகன் மனைவி நந்தியின் கொம்புகளுக்கிடையே பிரகாசிக்கும் குழந்தையைக் கனவில் கண்டாள், ஆண்டு முடிவதற்குள் வணிகன் வீட்டில் ஒரு மகன் பிறந்து, அமைதியான அந்த இல்லத்தை திடீர் மகிழ்ச்சியால் நிரப்பினான்.",
    "அந்த சிறுவன் உயரமாகவும் புத்திசாலியாகவும் வளர்ந்து, தந்தையின் பெருமையானான், பன்னிரண்டாம் ஆண்டு நெருங்கியபோது அவனது பூணூல் விழா நடைபெற வேண்டிய நாள் வந்தது. ஒரு பயணி முனிவர் மூலம் சிறுவனின் விதியை ரகசியமாக அறிந்த அவனது தாய்மாமன், அவனை தூர நகருக்கு அழைத்துச் செல்ல முன்வந்தான்—மேலோட்டமாக படிப்பை முடிக்கவும் திருமணம் ஏற்பாடு செய்யவும் என்றாலும், உண்மையில் தன் சகோதரி மகன் கண்முன்னே இறப்பதைக் காணும் வேதனையிலிருந்து அவளைக் காக்கவே. வழியில், ஒரு இராச்சியத்தில் தங்கியபோது, அங்கு ஒரு இளவரசியின் திருமணம் நடைபெற்றுக் கொண்டிருந்தது, விசித்திரமான வழக்கப்படி, உடல்நலமற்ற மணமகனுக்குப் பதிலாக அந்த சிறுவன் சிறிது நேரம் நின்று, யாரும் திட்டமிடாமலேயே, சபையின் பார்வையில் அவளுக்குக் கணவனானான். அன்றிரவே, அவனது மரண நேரம் நெருங்கியபோது, அந்த சிறுவன் அரண்மனை தோட்டத்தில் தனியே அமர்ந்திருந்தான், தன் பின்னால் திரண்டு வந்த நிழலை அறியாமல்.",
    "காசியில், அந்த மாதங்கள் முழுவதும் அவனது தாய் ஒரு திங்கட்கிழமை விரதம் கூட தவறவில்லை, அன்று மாலையும் வழக்கம்போல் சிவன் பெயரால் பிராமணர்களுக்கு உணவளித்து, தான் உண்பதற்கு முன் ஏழைகளுக்கு இனிப்பு பாயசம் பகிர்ந்தளித்தாள். தூரத்தில், யமதூதர்கள் சிறுவனை அழைத்துச் செல்ல வந்தனர், ஆனால் தோட்ட வாசலிலேயே தடுக்கப்பட்டனர்—சிவனே திரிசூலத்துடன் ஒளிர்ந்து அவர்கள் முன் நின்றார். 'இந்தச் சிறுவனின் தாய் எனக்கு அளித்த வாக்குறுதியை ஒருபோதும் மீறவில்லை,' என்று அவர் அறிவித்தார், 'அவளது புண்ணியம் அவனது விதியை விட உயர்ந்தது.' யமதூதர்கள் வெறுங்கையுடன் திரும்பினர், சிறுவன் முழு முதுமை வரை வாழ்ந்து, தன் மனைவியுடன் காசிக்குத் திரும்பி தாயின் காலைத் தொட்டான். அன்று முதல், நீண்ட ஆயுள், நல்ல திருமணம், சிவபார்வதியின் தொடர்ச்சியான அருள் விரும்பும் ஒவ்வொரு குடும்பமும் திங்கட்கிழமை சிவ விரதத்தைக் கடைப்பிடித்து வருகிறது.",
  ],
  hi: [
    "यह कथा *स्कंद पुराण* की परंपरा में वर्णित है। गंगा नदी के तट पर बसी पवित्र नगरी काशी में एक धनी व्यापारी और उसकी पत्नी रहते थे। उनके पास अपार धन-संपत्ति थी, किंतु जिस एक वरदान की उन्हें सबसे अधिक चाह थी—संतान—वह उन्हें प्राप्त नहीं था। हर सोमवार को वह पत्नी भोर होने से पहले उठती, ठंडी नदी में स्नान करती, और नगर के छोर पर स्थित प्राचीन शिव मंदिर तक पैदल जाती। वहाँ वह पूरे दिन उपवास रखती, लिंग के समक्ष घी का दीपक जलाती, और जुड़े हाथों से बिल्वपत्र और अक्षत अर्पित करती। इस शांत, अटूट भक्ति में वर्षों बीत गए। प्रार्थना करते समय वह कुछ नहीं मांगती थी, बस यही चाहती थी कि उसकी पूजा स्वीकार हो जाए, और धीरे-धीरे उसकी धैर्यवान श्रद्धा उन्हीं देवताओं का ध्यान खींचने लगी जिनके सामने वह झुकती थी।",
    "एक संध्या, कैलाश पर शिव के पास बैठी पार्वती देवी उस व्यापारी की पत्नी की अटूट भक्ति देखकर द्रवित हो उठीं। 'स्वामी,' उन्होंने कहा, 'यह स्त्री वर्षों से बिना एक भी चूक के अपना सोमवार व्रत निभा रही है, फिर भी उसका घर हँसी की प्रतीक्षा में सूना है। इसे एक पुत्र प्रदान करें।' शिव मुस्कुराए और चेतावनी दी कि उसे जो संतान मिलेगी, उसका जीवन मात्र बारह वर्ष का होगा। पार्वती ने और आग्रह किया, और शिव मान गए, साथ ही अपनी एक शर्त जोड़ी—यदि बालक की माता कभी अपना व्रत न तोड़े, तो कृपा से वह छोटी आयु बढ़ाई जा सकती है। उसी रात व्यापारी की पत्नी ने सपने में नंदी के सींगों के बीच झिलमिलाता एक शिशु देखा, और वर्ष पूरा होते-होते व्यापारी के घर एक पुत्र जन्मा, जिसने उस शांत घर को अचानक आनंद से भर दिया।",
    "वह बालक लंबा और तीक्ष्णबुद्धि होकर बड़ा हुआ, पिता का गर्व बना, और जैसे ही उसका बारहवाँ वर्ष आया, उसके यज्ञोपवीत संस्कार का दिन निकट आ गया। एक भ्रमणशील ऋषि से गुप्त रूप से बालक के भाग्य के बारे में जान चुके उसके मामा ने उसे दूर के नगर ले जाने का प्रस्ताव रखा—ऊपरी तौर पर शिक्षा पूरी करने और विवाह तय करने के लिए, पर वास्तव में अपनी बहन को अपने ही पुत्र को मरते देखने की पीड़ा से बचाने के लिए। रास्ते में, वे एक राज्य में रुके जहाँ एक राजकुमारी का विवाह हो रहा था, और विचित्र प्रथा के अनुसार, अस्वस्थ वर के स्थान पर वह बालक कुछ क्षण के लिए खड़ा हुआ और बिना किसी योजना के, सभा की दृष्टि में उसका पति बन गया। उसी रात, जैसे-जैसे उसकी मृत्यु की घड़ी निकट आती गई, वह बालक राजमहल के उद्यान में अकेला बैठा रहा, अपने पीछे मंडराती छाया से अनजान।",
    "काशी में, इन सभी महीनों में उसकी माता ने एक भी सोमवार व्रत नहीं छोड़ा था, और उस शाम भी हमेशा की तरह उसने शिव के नाम पर ब्राह्मणों को भोजन कराया और स्वयं खाने से पहले निर्धनों में मीठी खीर बाँटी। दूर, यमदूत बालक को ले जाने आए, पर उद्यान के द्वार पर ही रुक गए—स्वयं शिव त्रिशूल के साथ तेजोमय होकर उनके सामने खड़े हो गए। 'इस बालक की माता ने मुझसे किया अपना व्रत कभी नहीं तोड़ा,' उन्होंने घोषणा की, 'उसका पुण्य इसके भाग्य से बड़ा है।' यमदूत खाली हाथ लौट गए, और बालक पूर्ण वृद्धावस्था तक जीवित रहा, अपनी पत्नी के साथ काशी लौटकर माता के चरण स्पर्श किए। उस दिन से, दीर्घायु, अच्छा विवाह, और शिव-पार्वती की निरंतर कृपा चाहने वाला हर परिवार सोमवार शिव व्रत का पालन करता आ रहा है।",
  ],
};

console.log(`\n══ upload-mondays-shiva-vratham-story.mjs ══════════════════════════`);
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

const { headers: indexHeaders, rows: indexRows, col: indexCol } = await getTabWithHeaders('stories_index');
const { headers: contentHeaders, rows: contentRows, col: contentCol } = await getTabWithHeaders('stories_content');

const slugColIdx = indexCol('slug');
if (indexRows.some(r => r[slugColIdx] === SLUG)) {
  console.error(`\n⛔ stories_index already has a row for "${SLUG}" — refusing to duplicate. Aborting.`);
  process.exit(1);
}

const parentSlugColIdx = indexCol('parent_slug');
console.log(`\nSanity: rows already using parent_slug="${PARENT_SLUG}": ${indexRows.filter(r => r[parentSlugColIdx] === PARENT_SLUG).length}`);

const contentSlugCol = contentCol('story_slug');
const contentLangCol = contentCol('lang');
const existingContentPairs = new Set(
  contentRows.filter(r => r[contentSlugCol] === SLUG).map(r => r[contentLangCol])
);
if (existingContentPairs.size > 0) {
  console.error(`\n⛔ stories_content already has rows for "${SLUG}" langs [${[...existingContentPairs].join(', ')}] — refusing to duplicate. Aborting.`);
  process.exit(1);
}

// ─── Build stories_index row (column order = header order) ────────────────

const indexRowValues = indexHeaders.map(h => {
  if (!(h in INDEX_ROW)) {
    throw new Error(`INDEX_ROW is missing a value for header "${h}" — stories_index schema may have changed.`);
  }
  return INDEX_ROW[h];
});

console.log(`\n── stories_index row to append ─────────────────────────────────────`);
indexHeaders.forEach((h, i) => {
  const v = indexRowValues[i];
  console.log(`  ${h.padEnd(24)}: ${String(v).slice(0, 90)}${String(v).length > 90 ? '…' : ''}`);
});

// ─── Build stories_content rows ────────────────────────────────────────────

const contentRowsToAppend = [];
console.log(`\n── stories_content rows to append ──────────────────────────────────`);
for (const lang of ['en', 'te', 'ta', 'hi']) {
  const paragraphs = CONTENT[lang];
  console.log(`\n[${lang}] ${paragraphs.length} paragraphs`);
  paragraphs.forEach((text, i) => {
    const paragraphNum = i + 1;
    contentRowsToAppend.push([SLUG, lang, String(paragraphNum), text]);
    console.log(`  ¶${paragraphNum} (${text.length} chars): "${text.slice(0, 70)}…"`);
  });
}

console.log(`\n── Summary ─────────────────────────────────────────────────────────`);
console.log(`stories_index rows to append   : 1`);
console.log(`stories_content rows to append : ${contentRowsToAppend.length}`);

if (!WRITE) {
  console.log(`\nDry run — pass --write to apply.`);
  process.exit(0);
}

const sheets = await getSheetsClient();

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'stories_index!A:U',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: [indexRowValues] },
});
console.log(`\n✓ Appended 1 row to stories_index`);

await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'stories_content!A:D',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: contentRowsToAppend },
});
console.log(`✓ Appended ${contentRowsToAppend.length} rows to stories_content`);

console.log(`\n✓ Done.`);
