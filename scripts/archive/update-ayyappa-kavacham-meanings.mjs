/**
 * Patches research/ayyappa-kavacham-sourcing.json with meanings in all 4 languages.
 * English: from P.R. Ramachander translation (shastras.com / celextel.org)
 * Hindi: composed from Sanskrit — no Hindi artha found in any indexed source
 * Telugu: composed from Sanskrit — no Telugu artha page found (only Telugu script)
 * Tamil: composed from Sanskrit — no Tamil artha for the Sanskrit kavacham exists online
 * Run: node scripts/update-ayyappa-kavacham-meanings.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../research/ayyappa-kavacham-sourcing.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

// meaning_sources template
const enSource = 'shastras.com/ayyappa-stotras/maha-sastha-anugraha-kavacham/ (P.R. Ramachander translation)';
const hiSource = 'Composed from Sanskrit — no Hindi verse-by-verse artha found in any indexed source';
const teSource = 'Composed from Sanskrit — no Telugu artha page found; Telugu-script-only sites (hariome.com, vishwamatha.com) carry no meanings';
const taSource = 'Composed from Sanskrit — no Tamil artha for the Sanskrit Mahāśāstā Kavacam found; Tamil Ayyappan Kavasam is a separate Tamil composition';

const MEANINGS = [
  // 1 — Intro (Devi 1)
  {
    en: 'O God, O God of gods, O all-knowing one, O destroyer of the three cities (Śiva)! With the coming of the terrible Kali Yuga, the earth has been enveloped by great evil forces.',
    hi: 'हे भगवान, हे देवों के देव, हे सर्वज्ञ, हे त्रिपुरांतक शिव! इस भयंकर कलियुग के आगमन से महाभूतों ने पृथ्वी को घेर लिया है।',
    te: 'ఓ భగవాన్, ఓ దేవ దేవేశా, ఓ సర్వజ్ఞా, ఓ త్రిపురాంతకా శివా! ఈ భయంకర కలియుగం రాగా, మహాభూతాలు భూమిని ఆవరించాయి.',
    ta: 'ஓ பகவானே, ஓ தேவர்களின் தேவனே, ஓ சர்வஜ்ஞனே, ஓ திரிபுரானதகனே! இந்த கொடிய கலியுகம் வந்தபோது, மகாபூதங்கள் பூமியை சூழ்ந்தன.',
  },
  // 2 — Intro (Devi 2)
  {
    en: 'Great diseases, fearsome beasts, and terrible kings have come and covered the earth. Bad dreams, grief, afflictions, and wicked men have filled every heart.',
    hi: 'महारोग, भयंकर दुष्ट राजाओं और महाप्राणियों से पृथ्वी आवृत हो गई है। बुरे स्वप्न, शोक, संताप और दुर्वृत्त जन सर्वत्र फैल गए हैं।',
    te: 'మహావ్యాధులు, క్రూర రాక్షసులు, భయంకర రాజులు భూమిని ఆవరించారు. దుఃస్వప్నాలు, శోకాలు, సంతాపాలు, దుర్మార్గులు అందరి హృదయాలను నింపారు.',
    ta: 'மகாவ்யாதிகள், கொடிய விலங்குகள், பயங்கரமான அரசர்கள் பூமியை மூடின. துர்சொப்பனங்கள், துக்கங்கள், வேதனைகள், துஷ்டர்கள் எல்லோர் மனதையும் நிரப்பினர்.',
  },
  // 3 — Intro (Devi 3)
  {
    en: 'People have turned away from the path of their own dharma, their minds forever confused. O Vṛṣadhvaja (Śiva, whose banner bears the bull)! Tell me how they may attain success and liberation.',
    hi: 'लोग अपने स्वधर्म के मार्ग से विमुख हो, सदा हृदय में भटकते रहते हैं। हे वृषध्वज (वृषभ-ध्वज शिव)! उन्हें सिद्धि और मुक्ति कैसे मिलेगी, मुझे बताइए।',
    te: 'ప్రజలు తమ స్వధర్మ మార్గం నుండి విముఖులై, హృదయంలో సదా తికమకపడుతున్నారు. హే వృషధ్వజా (వృషభ ధ్వజం కలిగిన శివా)! వారికి సిద్ధి మరియు మోక్షం ఎలా కలుగుతుంది, నాకు చెప్పండి.',
    ta: 'மக்கள் தம் சுவதர்ம பாதையிலிருந்து விலகி, மனம் என்றும் குழம்பி வாழ்கின்றனர். ஓ வ்ருஷத்வஜனே (இடபக்கொடி கொண்ட சிவனே)! அவர்களுக்கு சித்தியும் முக்தியும் எவ்வாறு கிட்டும் என்று சொல்லுங்கள்.',
  },
  // 4 — Intro (Ishvara 1)
  {
    en: 'Listen, O greatly fortunate Goddess, O cause of all auspiciousness! I shall now tell you the kavacam of Mahāśāstā — the great discipliner of the cosmos — that increases merit and virtue.',
    hi: 'हे महाभागे देवी, हे सर्वकल्याण की कारणरूपे! सुनो — पुण्य को बढ़ाने वाले महाशास्ता के कवच को मैं तुम्हें अभी बताता हूँ।',
    te: 'ఓ మహాభాగ్యవంతురాలైన దేవీ, ఓ సర్వ కళ్యాణ కారణమా! విను — పుణ్యమును వృద్ధి చేసే మహాశాస్తా కవచాన్ని నేను నీకు ఇప్పుడు చెప్పుతాను.',
    ta: 'ஓ மகாபாக்யசாலியான தேவீ, ஓ எல்லா மங்களத்திற்கும் காரணமே! கேள் — புண்யத்தை பெருக்கும் மகாஶாஸ்தா கவசத்தை நான் இப்போது உனக்கு சொல்கிறேன்.',
  },
  // 5 — Intro (Ishvara 2)
  {
    en: 'This armor has the power to freeze fire, water, and armies in their tracks. It pacifies the great elemental forces and removes terrible diseases.',
    hi: 'यह कवच अग्नि, जल और सेना को स्तंभित करने में समर्थ है। यह महाभूतों को शांत करता है और भयंकर रोगों को दूर करता है।',
    te: 'ఈ కవచం అగ్నిని, జలమును, సేనలను స్తంభింపజేసే సామర్థ్యం కలది. ఇది మహాభూతాలను శాంతింపజేసి, భయంకర వ్యాధులను నివారిస్తుంది.',
    ta: 'இந்த கவசம் நெருப்பை, நீரை, படைகளை ஸ்தம்பிக்கச் செய்யும் வல்லமை கொண்டது. இது மகாபூதங்களை அடக்கி, கொடிய நோய்களை நீக்குகிறது.',
  },
  // 6 — Intro (Ishvara 3)
  {
    en: 'It bestows great wisdom and is supremely auspicious; it specifically dispels the hardships of the Kali age. It provides the highest protection to all human beings and increases both lifespan and health.',
    hi: 'यह महाज्ञान प्रदान करने वाला, पुण्यदायक है और विशेषतः कलि के संतापों को हरता है। यह सभी मनुष्यों को सर्वश्रेष्ठ रक्षा प्रदान करता है और आयु व आरोग्य को बढ़ाता है।',
    te: 'ఇది మహాజ్ఞానమును ప్రసాదిస్తుంది, పుణ్యదాయకమైనది; ముఖ్యంగా కలియుగ సంతాపాలను తొలగిస్తుంది. సమస్త మానవులకు సర్వోత్తమ రక్షణ కలిగించి, ఆయుష్షు మరియు ఆరోగ్యాన్ని వర్థింపజేస్తుంది.',
    ta: 'இது மகாஜ்ஞானத்தை அளிக்கிறது, புண்யமானது; குறிப்பாக கலியுக துன்பங்களை போக்குகிறது. அனைவருக்கும் உயர்ந்த பாதுகாப்பை வழங்கி, ஆயுளையும் ஆரோக்யத்தையும் பெருக்குகிறது.',
  },
  // 7 — Intro (Ishvara 4)
  {
    en: 'What more needs to be said? Whatever the devoted person desires, they shall obtain all of that without doubt, through the grace of Mahāśāstā.',
    hi: 'और अधिक कहने से क्या लाभ? भक्त जो भी कामना करे, वह सब उसे निःसंदेह महाशास्ता की कृपा से प्राप्त होता है।',
    te: 'ఇంకా ఏమి చెప్పాలి? భక్తుడు ఏ కామనైనా కోరుకున్నా, అది అన్నీ మహాశాస్తా అనుగ్రహంతో నిస్సందేహముగా సిద్ధిస్తాయి.',
    ta: 'இன்னும் என்ன சொல்ல வேண்டும்? பக்தன் எதை விரும்பினாலும், அதையெல்லாம் மகாஶாஸ்தாவின் அருளால் சந்தேகமின்றி அடைவான்.',
  },
  // 8 — Viniyoga
  {
    en: 'For this armor-mantra of Śrī Mahāśāstā: the sage is Brahmā; the meter is Gāyatrī; the deity is Mahāśāstā (son of Viṣṇu and Śiva). The seed-syllable (bīja) is Hrāṃ; the power (śakti) is Hrīṃ; the pin (kīlaka) is Hrūṃ. It is employed for the fulfillment of all desires.',
    hi: 'श्री महाशास्ता के इस कवच मंत्र के ऋषि ब्रह्मा हैं, छंद गायत्री है, देवता महाशास्ता (विष्णु और शिव के पुत्र) हैं। बीज ह्राँ है, शक्ति ह्रीं है, कीलक ह्रूँ है। सर्व काम सिद्धि के लिए इसका विनियोग है।',
    te: 'శ్రీ మహాశాస్తా కవచ మంత్రమునకు: ఋషి బ్రహ్మ, ఛందస్సు గాయత్రి, దేవత మహాశాస్తా (విష్ణు మరియు శివుల పుత్రుడు). బీజం హ్రాం, శక్తి హ్రీం, కీలకం హ్రూం. సర్వ కామ సిద్ధ్యర్థం వినియోగము.',
    ta: 'ஶ்ரீ மகாஶாஸ்தாவின் இந்த கவச மந்திரத்திற்கு: ஋ஷி பிரம்மா, சந்தஸ் காயத்ரி, தேவதை மகாஶாஸ்தா (விஷ்ணு மற்றும் சிவனின் புத்திரன்). பீஜம் ஹ்ராம், ஶக்தி ஹ்ரீம், கீலகம் ஹ்ரூம். எல்லா காமனைகளின் சித்திக்காக வினியோகம்.',
  },
  // 9 — Dhyana
  {
    en: 'I take refuge always in Śāstā — who dwells at the center of a radiant luminous aura; who is three-eyed; adorned with divine garments; who bears in his lotus hands a flower-bow (puṣpaśara), a sugarcane shaft, a jeweled vessel (māṇikyapātra), and the abhaya (protection) gesture; who is mounted on the shoulders of a great rutting elephant; who is the enchanter of all three worlds.',
    hi: 'मैं सदा उन शास्ता की शरण लेता हूँ — जो तेजोमंडल के मध्य में विराजमान हैं, तीन नेत्रों वाले हैं, दिव्य वस्त्राभूषण धारण किए हैं, अपने कमल-हस्तों में पुष्पशर (फूलों का बाण), इक्षु (गन्ने का धनुष), माणिक्यपात्र और अभयमुद्रा लिए हैं, मदोन्मत्त हाथी के कंधे पर आरूढ़ हैं और त्रिलोक को मोहित करने वाले हैं।',
    te: 'నేను ఎల్లపుడూ శాస్తాను శరణు వేడుతాను — తేజోమండలం మధ్యలో వెలుగొందేవాడు, ముక్కంటివాడు, దివ్య వస్త్రాభరణాలు ధరించేవాడు, తమ కమలహస్తాలలో పుష్పశరమును (పూలబాణమును), చెరకు ధనుస్సును, మాణిక్యపాత్రమును, అభయమును ధరించేవాడు, మదగజ స్కంధముపై ఆరూఢుడై, త్రిలోక సమ్మోహనుడైన వాడు.',
    ta: 'நான் என்றும் ஶாஸ்தாவை சரணடைகிறேன் — தேஜோமண்டல மத்தியில் விளங்குபவரை, முக்கண்ணனை, திவ்ய வஸ்திர ஆபரணங்கள் அணிந்தவரை, தாமரை கரங்களில் புஷ்பஶரம் (பூ அம்பு), கரும்பு வில், மாணிக்யபாத்திரம், அபயமுத்திரை ஏந்தியவரை, மதகஜ ஸ்கந்தத்தில் எழுந்தருளியவரை, திரிலோக ஸம்மோஹனனை.',
  },
  // 10 — Verse 1 (head, forehead, eyes, ears)
  {
    en: 'May Mahāśāstā (the Great Ruler) protect my head. May Hariharātmaja (the Son of Viṣṇu and Śiva) protect my forehead. May Kāmarūpī (the One who takes any form at will) protect my eyes. May Sarvajña (the Omniscient One) ever protect my ears.',
    hi: 'महाशास्ता (महान अनुशासक) मेरे सिर की रक्षा करें। हरिहरात्मज (विष्णु और शिव के पुत्र) मेरे माथे की रक्षा करें। कामरूपी (इच्छानुसार रूप धारण करने वाले) मेरी आँखों की रक्षा करें। सर्वज्ञ (सर्वज्ञाता) मेरे कानों की सदा रक्षा करें।',
    te: 'మహాశాస్తా (గొప్ప నిర్వాహకుడు) నా శిరస్సును రక్షించుగాక. హరిహరాత్మజుడు (విష్ణు మరియు శివుల పుత్రుడు) నా నుదురును రక్షించుగాక. కామరూపి (ఇచ్ఛానుసారం రూపం ధరించేవాడు) నా నేత్రాలను రక్షించుగాక. సర్వజ్ఞుడు (సర్వం తెలిసిన వాడు) నా చెవులను సదా రక్షించుగాక.',
    ta: 'மகாஶாஸ்தா (மாபெரும் ஆட்சியன்) என் தலையை காப்பாற்றட்டும். ஹரிஹராத்மஜன் (விஷ்ணு மற்றும் சிவனின் மைந்தன்) என் நெற்றியை காப்பாற்றட்டும். காமரூபி (விரும்பும் உருவெடுப்பவன்) என் கண்களை காப்பாற்றட்டும். சர்வஜ்ஞன் (எல்லாம் அறிந்தவன்) என் காதுகளை என்றும் காப்பாற்றட்டும்.',
  },
  // 11 — Verse 2 (nose, mouth, tongue, chin)
  {
    en: 'May Kṛpādhyakṣa (the Presider over Compassion) protect my nose. May Gaurīpriya (the Beloved of Gaurī/Pārvatī) always protect my mouth. May Vedādhyāyī (the Reciter of the Vedas) protect my tongue. May Guru (the Divine Teacher) protect my chin.',
    hi: 'कृपाध्यक्ष (करुणा के अधिपति) मेरी नाक की रक्षा करें। गौरीप्रिय (गौरी/पार्वती के प्रिय) मेरे मुख की सदा रक्षा करें। वेदाध्यायी (वेद पाठ करने वाले) मेरी जिह्वा की रक्षा करें। गुरु (दिव्य गुरुरूप) मेरी ठोड़ी की रक्षा करें।',
    te: 'కృపాధ్యక్షుడు (కరుణకు అధిపతి) నా ఘ్రాణమును రక్షించుగాక. గౌరీప్రియుడు (గౌరీ/పార్వతికి ప్రియమైనవాడు) నా ముఖమును సదా రక్షించుగాక. వేదాధ్యాయి (వేదాలు పఠించేవాడు) నా జిహ్వను రక్షించుగాక. గురువు (దివ్య గురుస్వరూపుడు) నా చిబుకమును రక్షించుగాక.',
    ta: 'க்ருபாத்யக்ஷன் (கருணையின் அதிபதி) என் மூக்கை காப்பாற்றட்டும். கௌரீப்ரியன் (கௌரி/பார்வதிக்கு பிரியமானவன்) என் வாயை என்றும் காப்பாற்றட்டும். வேதாத்யாயி (வேதம் ஓதுபவன்) என் நாவை காப்பாற்றட்டும். குரு (தெய்வீக ஆசான்) என் கன்னத்தை காப்பாற்றட்டும்.',
  },
  // 12 — Verse 3 (throat, shoulders, arms, hands)
  {
    en: 'May Viśuddhātmā (the Pure-Souled One) protect my throat. May Surārcita (the One Worshipped by the Gods) protect my shoulders. May Virūpākṣa (the One of Wondrous Eyes, attribute of Śiva inherited by his son) protect my arms. May Kamalāpriya (the Beloved of Kamalā/Lakṣmī) protect my hands.',
    hi: 'विशुद्धात्मा (शुद्ध आत्मा वाले) मेरे कंठ की रक्षा करें। सुरार्चित (देवताओं द्वारा पूजित) मेरे कंधों की रक्षा करें। विरूपाक्ष (अद्भुत नेत्रों वाले — शिव का गुण शास्ता में प्रकट) मेरी भुजाओं की रक्षा करें। कमलाप्रिय (कमला/लक्ष्मी के प्रिय) मेरे हाथों की रक्षा करें।',
    te: 'విశుద్ధాత్మ (పరిశుద్ధ ఆత్మ కలవాడు) నా కంఠమును రక్షించుగాక. సురార్చితుడు (దేవతలచే పూజింపబడేవాడు) నా స్కంధాలను రక్షించుగాక. విరూపాక్షుడు (అద్భుత నేత్రాలవాడు — శివ గుణం శాస్తలో ప్రకటమైనది) నా బాహువులను రక్షించుగాక. కమలాప్రియుడు (కమల/లక్ష్మీకి ప్రియమైనవాడు) నా కరాలను రక్షించుగాక.',
    ta: 'விஶுத்தாத்மா (தூய ஆத்மன்) என் கழுத்தை காப்பாற்றட்டும். ஸுராரசிதன் (தேவர்களால் வணங்கப்பட்டவன்) என் தோள்களை காப்பாற்றட்டும். விரூபாக்ஷன் (அற்புத கண்களுடையவன் — சிவனின் குணம் ஶாஸ்தாவில் வெளிப்பட்டது) என் கரங்களை காப்பாற்றட்டும். கமலாப்ரியன் (கமலா/லக்ஷ்மிக்கு பிரியமானவன்) என் கைகளை காப்பாற்றட்டும்.',
  },
  // 13 — Verse 4 (heart, abdomen, navel, waist)
  {
    en: 'May Bhūtādhipa (the Lord of All Beings) protect my heart. May Mahābala (the Greatly Powerful One) protect my abdomen. May Mahāvīra (the Great Hero) protect my navel. May Kamalākṣa (the Lotus-Eyed One) protect my waist.',
    hi: 'भूताधिप (सभी प्राणियों के स्वामी) मेरे हृदय की रक्षा करें। महाबल (महाशक्तिशाली) मेरे उदर-मध्य की रक्षा करें। महावीर (महान वीर) मेरी नाभि की रक्षा करें। कमलाक्ष (कमल-नेत्र) मेरी कटि की रक्षा करें।',
    te: 'భూతాధిపుడు (సమస్త ప్రాణుల అధిపతి) నా హృదయమును రక్షించుగాక. మహాబలుడు (మహాశక్తిమంతుడు) నా మధ్య భాగమును రక్షించుగాక. మహావీరుడు (గొప్ప వీరుడు) నా నాభిని రక్షించుగాక. కమలాక్షుడు (కమల నేత్రుడు) నా కటిని రక్షించుగాక.',
    ta: 'பூதாதிபன் (எல்லா ஜீவர்களின் ஆளுநன்) என் இதயத்தை காப்பாற்றட்டும். மகாபலன் (மிகுந்த வல்லமையுடையவன்) என் வயிற்றை காப்பாற்றட்டும். மகாவீரன் (மகா வீரன்) என் நாபியை காப்பாற்றட்டும். கமலாக்ஷன் (தாமரை விழியன்) என் இடையை காப்பாற்றட்டும்.',
  },
  // 14 — Verse 5 (hips, genitals, thighs, knees)
  {
    en: 'May Viśveśa (the Lord of the Universe) protect my hips. May Guhyārthavit (the Knower of Secret Meanings) always protect my private parts. May Gajārūḍha (the One Mounted on an Elephant) protect my thighs. May Vajradhārī (the Bearer of the Thunderbolt) protect my knees.',
    hi: 'विश्वेश (ब्रह्मांड के स्वामी) मेरे नितंबों की रक्षा करें। गुह्यार्थवित् (गूढ़ अर्थों के ज्ञाता) सदा मेरे गुह्यांगों की रक्षा करें। गजारूढ़ (गजारूढ़ प्रभु) मेरी ऊरुओं (जाँघों) की रक्षा करें। वज्रधारी (वज्र धारण करने वाले) मेरे घुटनों की रक्षा करें।',
    te: 'విశ్వేశుడు (విశ్వాధిపతి) నా నితంబాలను రక్షించుగాక. గుహ్యార్థవిత్ (గూఢార్థాలు తెలిసినవాడు) సదా నా గుహ్యాంగాలను రక్షించుగాక. గజారూఢుడు (గజారూఢ ప్రభువు) నా ఊరువులను (తొడలను) రక్షించుగాక. వజ్రధారి (వజ్రాయుధం ధరించేవాడు) నా జానువులను రక్షించుగాక.',
    ta: 'விஶ்வேஶன் (உலகின் ஈஶ்வரன்) என் இடுப்பை காப்பாற்றட்டும். குஹ்யார்தவித் (ரகஸ்ய அர்தங்களை அறிந்தவன்) என்றும் என் ரகஸ்யாங்கங்களை காப்பாற்றட்டும். கஜாரூடன் (யானையில் எழுந்தருளியவன்) என் தொடைகளை காப்பாற்றட்டும். வஜ்ரதாரி (வஜ்ராயுதம் ஏந்தியவன்) என் முழங்கால்களை காப்பாற்றட்டும்.',
  },
  // 15 — Verse 6 (calves, feet, all limbs)
  {
    en: 'May Aṅkuśadhara (the Bearer of the Elephant Goad) protect my calves. May Mahāmati (the Supremely Wise One) protect my feet. May Mahāmāyāviśārada (the One Skilled in the Great Cosmic Illusion) protect all my limbs forever.',
    hi: 'अंकुशधर (अंकुश धारण करने वाले) मेरी पिंडलियों की रक्षा करें। महामति (महाबुद्धिमान) मेरे चरणों की रक्षा करें। महामायाविशारद (महामाया के कुशल विशेषज्ञ) सदा मेरे सभी अंगों की रक्षा करें।',
    te: 'అంకుశధరుడు (అంకుశము ధరించేవాడు) నా జంఘలను రక్షించుగాక. మహామతి (మహాజ్ఞాని) నా పాదాలను రక్షించుగాక. మహామాయావిశారదుడు (మహామాయలో నిష్ణాతుడు) నా సర్వాంగాలను నిత్యం రక్షించుగాక.',
    ta: 'அங்குஶதரன் (அங்குஶம் தாங்கியவன்) என் கன்றுகால்களை காப்பாற்றட்டும். மகாமதி (மகா புத்திமான்) என் பாதங்களை காப்பாற்றட்டும். மகாமாயாவிஶாரதன் (மகாமாயையில் வல்லுநன்) என் எல்லா உறுப்புக்களையும் என்றும் காப்பாற்றட்டும்.',
  },
  // 16 — Phala Shruti 1
  {
    en: 'This sacred armor destroys the entire accumulation of all sins. It pacifies severe diseases and annihilates the five great sins (mahāpātakas) enumerated in the dharmaśāstra.',
    hi: 'यह पवित्र कवच समस्त पापों के समूह को काट देता है। यह महारोगों को शांत करता है और धर्मशास्त्र-प्रोक्त महापातकों (पाँच महापापों) को नष्ट करता है।',
    te: 'ఈ పవిత్ర కవచం సకల పాపసమూహమును ఖండించివేస్తుంది. ఇది మహావ్యాధులను శాంతింపజేసి, ధర్మశాస్త్రం చెప్పిన మహాపాతకాలను (అయిదు మహాపాపాలను) నాశనం చేస్తుంది.',
    ta: 'இந்த புண்யமான கவசம் எல்லா பாபங்களின் திரளையும் வெட்டி நீக்குகிறது. இது மகாவ்யாதிகளை ஶாந்தமாக்கி, தர்மஶாஸ்திரத்தில் சொல்லப்பட்ட மகாபாதகங்களை (ஐந்து மகாபாவங்களை) அழிக்கிறது.',
  },
  // 17 — Phala Shruti 2
  {
    en: 'It bestows wisdom (jñāna) and detachment (vairāgya) on all people, and grants the fruits of both worldly enjoyment (bhukti) and final liberation (mukti). Whatever one desires, one shall obtain without any doubt.',
    hi: 'यह सभी को ज्ञान और वैराग्य प्रदान करता है, तथा भोग और मुक्ति — दोनों फल देता है। जो भी कामना हो, वह सब बिना किसी संदेह के मिलती है।',
    te: 'ఇది అందరికీ జ్ఞానమును మరియు వైరాగ్యమును ప్రసాదిస్తుంది; భోగ మరియు మోక్ష రెండింటి ఫలాన్ని ఇస్తుంది. ఏ కోరిక కోరినా అది నిస్సందేహంగా నెరవేరుతుంది.',
    ta: 'இது அனைவருக்கும் ஜ்ஞானத்தையும் வைராக்யத்தையும் அளிக்கிறது; போகம் மற்றும் முக்தி ஆகிய இரண்டின் பலனையும் தருகிறது. எந்த விருப்பமும் சந்தேகமின்றி நிறைவேறும்.',
  },
  // 18 — Phala Shruti 3
  {
    en: 'The wise person who recites this at the three sandhyā times (dawn, midday, and dusk) attains the highest state of liberation. Thus concludes the Śrī Mahāśāstā Anugraha Kavacam.',
    hi: 'जो विद्वान इसे तीनों संध्याओं (प्रातःकाल, मध्याह्न, सायंकाल) में पढ़ता है, वह परमगति प्राप्त करता है। इति श्री महाशास्ता अनुग्रह कवचम् सम्पूर्णम्।',
    te: 'ముమ్మారు సంధ్యా వేళలలో (ప్రాతఃకాలం, మధ్యాహ్నం, సాయంసంధ్య) ఇది పఠించే విద్వాంసుడు పరమగతిని పొందుతాడు. ఇతి శ్రీ మహాశాస్తా అనుగ్రహ కవచం సమాప్తమైనది.',
    ta: 'மூன்று ஸந்த்யாகாலங்களிலும் (காலை, நண்பகல், மாலை) இதை ஓதும் அறிஞன் உயர்ந்த முக்தியை அடைவான். இதி ஶ்ரீ மகாஶாஸ்தா அனுக்ரஹ கவசம் முற்றிற்று.',
  },
];

if (MEANINGS.length !== data.verses.length) {
  throw new Error(`Meaning count mismatch: ${MEANINGS.length} meanings vs ${data.verses.length} verses`);
}

MEANINGS.forEach((m, i) => {
  data.verses[i].meaning_en = m.en;
  data.verses[i].meaning_hi = m.hi;
  data.verses[i].meaning_te = m.te;
  data.verses[i].meaning_ta = m.ta;
  data.verses[i].meaning_sources = {
    en: enSource,
    hi: hiSource,
    te: teSource,
    ta: taSource,
  };
});

// Update unresolved_flags to remove the "meanings null" flag
data.unresolved_flags = data.unresolved_flags.filter(f => !f.includes('meaning fields null'));
data.unresolved_flags.push(
  'meaning_hi: No Hindi verse-by-verse translation found in any indexed source; meanings composed from Sanskrit.',
  'meaning_te: No Telugu-language artha page found; meanings composed from Sanskrit. Telugu sites carry only the Telugu script of the Sanskrit text.',
  'meaning_ta: No Tamil artha for this Sanskrit kavacham found; meanings composed from Sanskrit. The Tamil Ayyappan Kavasam is a separate Tamil-language composition with its own meanings.',
);

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated: ${jsonPath}`);
console.log(`Sample v10 en: ${data.verses[9].meaning_en}`);
console.log(`Sample v10 te: ${data.verses[9].meaning_te.slice(0, 80)}...`);
