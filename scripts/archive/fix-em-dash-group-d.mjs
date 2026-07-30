/**
 * One-off: remove em-dash ("—") usage from shloka_stanzas meaning_en/te/ta/hi
 * for 6 owned stotras (Group D), rewriting to natural grammatical prose in
 * each language independently. Also a light conservative pass for AI-cliche
 * words in meaning_en.
 *
 * Scope (own only these 6 shloka_slug values):
 *   subrahmanya-bhujangam, rama-raksha-stotram, rama-kavacham,
 *   thiruppavai, devi-kavacham, venkateswara-suprabhatam
 *
 * Dry-run by default. Pass --write to actually update the Sheet.
 * Matches rows by shloka_slug + stanza_number; writes ONLY to meaning_{lang}
 * columns; never touches verse/script columns.
 */
import { getTabWithHeaders, getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

// Each entry: { slug, stanza, lang, text }
// `text` is the full replacement value for that meaning_{lang} cell.
const UPDATES = [
  // ===================== subrahmanya-bhujangam (52) =====================
  { slug: 'subrahmanya-bhujangam', stanza: '2', lang: 'te', text: 'నాకు శబ్దం తెలియదు, అర్థం తెలియదు, పద్యం తెలియదు, గద్యం తెలియదు. అయినను అయిదు ముఖాలు కల ఒకానొక చైతన్యరూపం నా హృదయంలో ప్రకాశిస్తోంది, మరియు వింతగా నా నోటి నుండి పదాలు వెలువడుతున్నాయి.' },
  { slug: 'subrahmanya-bhujangam', stanza: '2', lang: 'ta', text: 'எனக்கு இலக்கணம் தெரியாது, பொருள் தெரியாது, கவிதை தெரியாது, உரைநடை தெரியாது. ஆயினும் ஆறு முகங்களுடைய ஒரு அறிவு மட்டுமே என் இதயத்தில் ஒளிர்கிறது, வியப்பாக என் வாயிலிருந்து வார்த்தைகள் வெளிவருகின்றன.' },
  { slug: 'subrahmanya-bhujangam', stanza: '2', lang: 'hi', text: 'मुझे शब्द नहीं आता, अर्थ नहीं आता, पद्य नहीं आता, गद्य नहीं आता। तब भी षण्मुख एकमात्र चेतना मेरे हृदय में चमकती है, और आश्चर्य की बात है कि मेरे मुख से शब्द निकलते रहते हैं।' },

  { slug: 'subrahmanya-bhujangam', stanza: '4', lang: 'te', text: 'మానవులు నా సన్నిధికి వచ్చిన వెంటనే సంసార సముద్రమును దాటుతారు అని, సింధు తీరమున నివసించి ఇది చెప్తున్నాను అని చాటుతున్న ఆ పవిత్రమైన పరాశక్తి పుత్రుని నేను స్తుతిస్తున్నాను.' },
  { slug: 'subrahmanya-bhujangam', stanza: '4', lang: 'ta', text: 'மானிடர் என் சந்நிதிக்கு வந்த உடனே சம்சார கடலை கடந்து விடுவார்கள் என்று, நான் சிந்து கரையில் வாழ்ந்து இதைச் சாற்றுகிறேன் என்று தெரிவிக்கும் அந்த தூய்மையான பராசக்தி புத்திரனை நான் துதிக்கிறேன்.' },
  { slug: 'subrahmanya-bhujangam', stanza: '4', lang: 'hi', text: 'जो समुद्र के किनारे निवास करते हुए मानो यह कह रहे हैं कि जब भी मनुष्य मेरे सन्निध में आते हैं, वे उसी क्षण संसार-सागर के पार हो जाते हैं, उन पवित्र परा-शक्ति-पुत्र की मैं स्तुति करता हूँ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '5', lang: 'te', text: 'సముద్రపు ఎత్తైన అలలు దానిలోనే లయమవుతున్నాయి కదా, అదే విధంగా నా సేవకులకు వారి ఆపదలు నా సన్నిధిలో లయమవుతాయి అనే అర్థమిస్తున్న, తన అలల వరుసలను చూపిస్తున్న ఆ గుహుని నా హృదయ కమలంలో నిరంతరం ధ్యానిస్తున్నాను.' },
  { slug: 'subrahmanya-bhujangam', stanza: '5', lang: 'ta', text: 'கடலின் உயரமான அலைகள் அதிலேயே மறைவது போல், என் பக்தர்களுக்கு அவர்களின் துன்பங்கள் என் சந்நிதியில் மறையும் என்று அலை வரிசைகள் மூலம் காட்டும் அந்த குகனை என் இதய தாமரையில் எப்போதும் தியானிக்கிறேன்.' },
  { slug: 'subrahmanya-bhujangam', stanza: '5', lang: 'hi', text: 'जैसे समुद्र की ऊँची-ऊँची तरंगें उसी में विलीन हो जाती हैं, वैसे ही मेरे भक्तों की आपदाएँ मेरे सन्निध में लय हो जाती हैं, यही सन्देश तरंगों की पंक्तियों द्वारा देते उस गुह को मैं हृदय-कमल में सदा ध्याता हूँ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '6', lang: 'te', text: 'నా నివాసమైన పర్వతమెక్కిన మానవులు, వారు ఆ పర్వతముపై ఉన్న రాజులు అవుతారు అని, నేను సుగంధ శైలముపై ఉన్నాను అని వ్యక్తం చేస్తున్నట్లుగా ఆ షణ్ముఖ దేవుడు నాకు సదా ముదమును కలిగించుగాక.' },
  { slug: 'subrahmanya-bhujangam', stanza: '6', lang: 'ta', text: 'என் வாசஸ்தலமான மலையில் ஏறிய மனிதர்கள் அந்த மலையில் ராஜாக்களாக ஒளிருகிறார்கள் என்பதை, நான் சுகந்த மலையில் உள்ளேன் என்று தெரிவிப்பது போல, அந்த ஷண்முக தேவர் எனக்கு என்றும் மகிழ்ச்சியளிப்பாராக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '6', lang: 'hi', text: 'जो मनुष्य मेरे निवास-पर्वत पर चढ़ते हैं, वे ही उस पर्वत पर राजा की भाँति सुशोभित होते हैं, मानो यही कहते हुए सुगंध-पर्वत पर स्थित वह षण्मुख देव सदा मुझे आनन्द दे।' },

  { slug: 'subrahmanya-bhujangam', stanza: '13', lang: 'te', text: 'ఓ స్కంద, ఎల్లప్పుడూ శరత్కాలపు ఆరు నిలువెల్లా పౌర్ణమి చంద్రులు, అన్ని దిక్కులా ఒకేసారి ఉదయిస్తూ, ఎల్లప్పుడూ పూర్ణమండలమై, మచ్చలేకుండా ఉంటేనే, నీ ఆరు ముఖాలకు సమానమని చెప్పగలనని పలుకుతున్నాను.' },
  { slug: 'subrahmanya-bhujangam', stanza: '13', lang: 'ta', text: 'ஓ ஸ்கந்தா, என்றும் இருக்கும் ஆறு இலையுதிர் கால சந்திரர்கள், எல்லா திசைகளிலும் ஒரே நேரத்தில் உதிப்பவராக, என்றும் பூர்ண மண்டலமாக, களங்கமின்றி இருந்தால்தான், உன் ஆறு முகங்களுக்கு ஒப்பு என்று சொல்லுவேன்.' },
  { slug: 'subrahmanya-bhujangam', stanza: '13', lang: 'hi', text: 'हे स्कन्द, यदि सदा शरद्काल के छः पूर्ण चन्द्रमा सभी दिशाओं से एक साथ उदित होते, सदा पूर्ण-बिम्ब और कलङ्क-रहित रहते, तो ही मैं उन्हें तुम्हारे षट्-मुखों के समान बता सकता हूँ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '15', lang: 'hi', text: 'हे दयाशील, करुणा बरसाती तुम्हारी बारह विशाल, कान तक फैली आँखों में से, यदि एक बार भी एक थोड़ी-सी कटाक्ष दृष्टि मुझ पर पड़ जाए, तो हे दयावान्, इसमें तुम्हारी क्या हानि है?' },

  { slug: 'subrahmanya-bhujangam', stanza: '16', lang: 'hi', text: 'हे जगन्नाथ, मेरे ही अङ्ग से उत्पन्न हुआ है, जियो, यह मन्त्र छः बार हर्ष से जपते हुए शिव जिन्हें प्रेम से सूँघते हैं, उन जगद्-भार धारण करनेवाले, किरीट से उज्ज्वल षट्-मस्तकों को नमस्कार।' },

  { slug: 'subrahmanya-bhujangam', stanza: '19', lang: 'te', text: 'ఓ కుమారా, ఈశ్వర పుత్రా, గుహా, స్కంద, సేనాపతీ, శక్తి పాణీ, మయూరాధిరూఢ, పులింద పుత్రి వల్లభ, భక్తార్తి హారీ, ప్రభో, తారకారీ, నీవు నన్ను నిత్యం రక్షించు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '19', lang: 'ta', text: 'ஓ குமாரா, ஈசன் குமாரா, குகா, ஸ்கந்தா, சேனாபதியே, சக்தி தரிப்பவனே, மயூராரோகண, வேடர் புத்திரி மனைவனே, பக்தர் துயர் போக்குபவனே, பிரபோ, தாரகாரியே, நீ என்னை என்றும் காப்பாற்றுவாயாக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '19', lang: 'hi', text: 'हे कुमार, ईश-पुत्र, हे गुह, हे स्कन्द, सेनापते, शक्ति-पाणे, मयूरारूढ, पुलिन्द-पुत्री-कान्त, भक्त-पीड़ा-हारी, प्रभो, तारकारे, तुम सदा मेरी रक्षा करो।' },

  { slug: 'subrahmanya-bhujangam', stanza: '20', lang: 'te', text: 'ఓ దయాలు గుహా, నా ఇంద్రియాలు శాంతించినప్పుడు, జ్ఞానం లోపించినప్పుడు, శరీరం వణికినప్పుడు, నోట నురుగు వచ్చినప్పుడు, భయంతో శరీరం కంపించినప్పుడు, అనాథగా ప్రాణాంత సమయం వచ్చినప్పుడు, ఆ క్షణంలో వేగంగా వచ్చి నా ముందు నిలువు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '20', lang: 'ta', text: 'ஓ கருணாள்ளன் குகனே, என் புலன்கள் அமைதியடையும் போது, சுயநினைவு மறையும் போது, உடல் புரண்டாடும் போது, வாயில் நுரை வரும் போது, பயத்தால் உடல் நடுங்கும் போது, அனாதையாக உயிர் பிரியும் நேரம் வரும் போது, அந்த நேரத்தில் விரைந்து என் முன்பு நிற்பாயாக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '20', lang: 'hi', text: 'हे दयालु गुह, जब मेरी इन्द्रियाँ शान्त हों, चेतना लुप्त हो, शरीर छटपटाए, मुँह से कफ बहे, भय से अंग कँपें, और मैं अनाथ-सा प्राण-त्याग की ओर बढ़ रहा हूँ, उस समय शीघ्र आकर मेरे आगे खड़े हो जाओ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '21', lang: 'te', text: 'యముని భయంకర దూతలు కోపంగా నన్ను బాధిస్తూ: కాల్చు, తెంచు, నరుకు అని తర్జన భర్జన చేస్తున్న ఆ సమయంలో, నీవు మయూరమెక్కి, శక్తి పాణివై, నన్ను ముందే వచ్చి భయపడవద్దు అని చెప్పు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '21', lang: 'ta', text: 'யமனின் கோபமான தூதர்கள் என்னை வதைத்து: எரி, வெட்டு, கிழி என்று மிரட்டும் அந்த நேரத்தில், நீ மயூரம் ஏறி, சக்தி கையில் ஏந்தி, என்னை முன்னே வந்து பயப்படாதே என்று சொல்வாயாக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '21', lang: 'hi', text: "जब यम के प्रचण्ड दूत क्रोध में मुझे धमकाते हुए 'जलाओ, काटो, फाड़ो' पुकार रहे हों, उस समय तुम मयूर पर आरूढ़ होकर, शक्ति लिए शीघ्र मेरे आगे आकर 'डरो मत' कहो।" },

  { slug: 'subrahmanya-bhujangam', stanza: '22', lang: 'te', text: 'ఓ ప్రభో, ఓ కృపాసముద్రా, నేను ఇప్పుడు పలుమార్లు నీ పాదాలపై పడి, ప్రసన్నుని చేసుకుంటూ ప్రార్థిస్తున్నాను. ఆ సమయంలో నేను చెప్పలేను కాబట్టి, చివరి సమయంలో నన్ను కొద్దిగా కూడా ఉపేక్షించకు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '22', lang: 'ta', text: 'ஓ பிரபோ, ஓ கருணை கடலே, நான் இப்போது பலமுறை உன் பாதங்களில் விழுந்து, மனசை உருக்கி பிரார்த்திக்கிறேன். அந்த நேரத்தில் என்னால் பேச இயலாது என்பதால், இறுதி நேரத்தில் என்னை சிறிதும் கவலையின்றி விட்டு விடாதே.' },
  { slug: 'subrahmanya-bhujangam', stanza: '22', lang: 'hi', text: 'हे प्रभो, हे कृपा-सागर, मैं अभी बार-बार तुम्हारे चरणों में गिरकर, प्रसन्न करते हुए प्रार्थना करता हूँ। उस समय मैं बोल न सकूँगा, इसलिए अन्तकाल में मुझे थोड़ी भी उपेक्षा मत करना।' },

  { slug: 'subrahmanya-bhujangam', stanza: '23', lang: 'te', text: 'వేయి లోకాలను భోగించిన శూరపద్ముని, తారకుని, సింహముఖ దైత్యుని నువ్వు సంహరించావు. కానీ నా హృదయంలో ఉన్న ఈ ఒక్క మానసిక క్లేశాన్ని నాశనం చేయడం లేదు. ఓ ప్రభో, నేనేం చేయాలి, ఎక్కడ వెళ్ళాలి?' },
  { slug: 'subrahmanya-bhujangam', stanza: '23', lang: 'ta', text: 'ஆயிரம் உலகங்களை அனுபவித்த சூரபத்மனை, தாரகனை, சிம்ஹமுக அசுரனை நீ அழித்தாய். ஆனால் என் உள் இதயத்தில் உள்ள இந்த ஒரே மன வேதனையை அழிக்கவில்லை. ஓ பிரபோ, என்ன செய்வேன், எங்கே போவேன்?' },
  { slug: 'subrahmanya-bhujangam', stanza: '23', lang: 'hi', text: 'सहस्रों लोकों के भोक्ता शूरपद्म, तारक और सिंहमुख दैत्य को तुमने मार डाला। किन्तु मेरे हृदय के भीतर बैठी इस एक मानस-पीड़ा को नहीं मारते। हे प्रभो, मैं क्या करूँ, कहाँ जाऊँ?' },

  { slug: 'subrahmanya-bhujangam', stanza: '25', lang: 'te', text: 'ఓ తారకారీ, అపస్మారం, కుష్టు, క్షయ, అర్శ, ప్రమేహ, జ్వరం, ఉన్మాదం, గుల్మం మొదలైన మహాభయంకర వ్యాధులు, అలాగే అన్ని పిశాచాలు, నీ పత్రభస్మ దర్శించిన మాత్రమే ఒక్క క్షణంలో పారిపోతాయి.' },
  { slug: 'subrahmanya-bhujangam', stanza: '25', lang: 'ta', text: 'ஓ தாரகாரியே, அபஸ்மாரம், கஷ்டரோகம், கஷயம், மூலவியாதி, நீரிழிவு, காய்ச்சல், பித்தம், குளிர்வாதம் முதலிய மிகப் பெரும் நோய்கள், அத்தகைய எல்லா பேய்களும், உன் இலை திருநீறை பார்த்த கணமே ஓடி விடும்.' },
  { slug: 'subrahmanya-bhujangam', stanza: '25', lang: 'hi', text: 'हे तारकारे, मिर्गी, कुष्ठ, क्षय, बवासीर, मधुमेह, ज्वर, उन्माद, गुल्म आदि महाभयंकर रोग, तथा सभी प्रकार के भूत-प्रेत, तुम्हारे पत्र-भस्म को देखते ही एक क्षण में भाग जाते हैं।' },

  { slug: 'subrahmanya-bhujangam', stanza: '26', lang: 'te', text: 'నా దృష్టిలో స్కంద మూర్తి, నా చెవులలో స్కంద కీర్తి, నా నోటిలో పవిత్రమైన ఆ చరిత్ర, నా చేతులలో ఆయన కార్యం, నా శరీరంలో ఆయన సేవ, నా సమస్త భావాలు గుహుని లయమవుగాక.' },
  { slug: 'subrahmanya-bhujangam', stanza: '26', lang: 'ta', text: 'என் கண்களில் ஸ்கந்த மூர்த்தி, என் செவிகளில் ஸ்கந்த கீர்த்தி, என் வாயில் என்றும் புனிதமான அந்த சரிதம், என் கைகளில் அவரது கார்யம், என் உடலில் அவரது சேவை, என் எல்லா உணர்வுகளும் குகனில் லயமாகட்டும்.' },
  { slug: 'subrahmanya-bhujangam', stanza: '26', lang: 'hi', text: 'मेरी दृष्टि में स्कन्द-मूर्ति, श्रवण में स्कन्द-कीर्ति, मुख में सदा उनकी पवित्र कथा, हाथों में उनका कार्य, शरीर से उनकी सेवा, मेरे सभी भाव गुह में लीन हो जाएँ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '27', lang: 'te', text: 'ఋషులకు, భక్తులైన మానవులకు వారి కోరికలు ఇచ్చే దేవతలు అన్ని చోట్ల ఉన్నారు. కానీ నీచ జాతులవారికైనా వారి స్వార్థ సాధనలో గుహుని తప్ప వేరే దేవుని నాకు తెలియదు, నాకు తెలియదు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '27', lang: 'ta', text: 'முனிவர்களுக்கும், பக்தர்களான மனிதர்களுக்கும் விரும்பியதை அளிக்கும் தெய்வங்கள் எங்கும் உள்ளனர். ஆனால் தாழ்ந்த குலத்தினருக்கும் அவர்களின் சொந்த நலனை அளிப்பதில் குகனை தவிர வேறு தெய்வம் எனக்குத் தெரியாது, தெரியாது.' },
  { slug: 'subrahmanya-bhujangam', stanza: '27', lang: 'hi', text: 'ऋषियों और भक्त मनुष्यों की इच्छाएँ पूरी करनेवाले देव तो सब जगह हैं। किन्तु अन्त्यजों को भी उनका स्वार्थ देने में गुह से भिन्न किसी देव को मैं नहीं जानता, नहीं जानता।' },

  { slug: 'subrahmanya-bhujangam', stanza: '28', lang: 'te', text: 'ఓ కుమారా, నా భార్య, పుత్రులు, బంధువులు, పశువులు, ఇంట్లోని ఏ పురుషుడైనా, స్త్రీ అయినా, వారందరూ నీకు యాగం, నమస్కారం, స్తోత్రం, స్మరణ చేసేవారుగా ఉందురుగాక.' },
  { slug: 'subrahmanya-bhujangam', stanza: '28', lang: 'ta', text: 'ஓ குமாரா, என் மனைவி, குழந்தைகள், உறவினர்கள், கால்நடைகள், என் வீட்டில் உள்ள எந்த ஆணும், பெண்ணும், அவர்கள் அனைவரும் உன்னை வழிபட்டு, வணங்கி, துதித்து, நினைத்திருப்பவர்களாக இருப்பாராக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '28', lang: 'hi', text: 'हे कुमार, मेरी पत्नी, पुत्र, कुटुम्ब, पशु, तथा घर के जितने भी पुरुष या स्त्री हैं, वे सभी तुम्हें पूजते, नमस्कार करते, स्तुति करते और स्मरण करते रहें।' },

  { slug: 'subrahmanya-bhujangam', stanza: '29', lang: 'te', text: 'ఓ క్రౌంచ శైల చూర్ణకా, దుష్టమైన జంతువులు, పక్షులు, కొరికే పురుగులు, అలాగే నా శరీరంలో ఉన్న వ్యాధులు, నీ శక్తి యొక్క సూక్ష్మాగ్రంచే బాధింపబడి, సుదూరముగా వినాశనమవుగాక.' },
  { slug: 'subrahmanya-bhujangam', stanza: '29', lang: 'ta', text: 'ஓ க்ரௌஞ்ச மலை நொறுக்கியே, தீய விலங்குகள், பறவைகள், கடிக்கும் பூச்சிகள், மற்றும் என் உடலை வதைக்கும் நோய்கள், உன் வேலின் கூர்மையான நுனியால் துளைக்கப்பட்டு, வெகு தொலைவில் அழிவதாக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '29', lang: 'hi', text: 'हे क्रौञ्च-पर्वत-चूर्णक, दुष्ट जंगली पशु, पक्षी, डंकमारनेवाले जीव, और मेरे शरीर को सताने वाले रोग, तुम्हारी शक्ति की तीखी नोक से बिंधकर सुदूर में नष्ट हो जाएँ।' },

  { slug: 'subrahmanya-bhujangam', stanza: '30', lang: 'te', text: 'ఓ దేవసేనాధినాథ, తల్లి, తండ్రి తమ పుత్రుని అపరాధాలను సహిస్తారు కదా? నేను చాలా చిన్నవాడిని, నీవు జగత్తుకు తండ్రివి, ఓ మహేశ, నా సమస్త అపరాధాలను క్షమించు.' },
  { slug: 'subrahmanya-bhujangam', stanza: '30', lang: 'ta', text: 'ஓ தேவசேனாதிபதியே, தாயும் தந்தையும் தங்கள் மகனின் தப்பிதங்களை பொறுப்பார்கள் அல்லவா? நான் மிகவும் சிறியவன், நீ உலகுக்கு தந்தை, ஓ மகேசா, என் எல்லா தப்பிதங்களையும் மன்னிப்பாயாக.' },
  { slug: 'subrahmanya-bhujangam', stanza: '30', lang: 'hi', text: 'हे देवसेनाधिनाथ, क्या माँ और पिता अपने पुत्र के अपराध क्षमा नहीं करते? मैं अति बाल हूँ, तुम जगत् के पिता हो, हे महेश, मेरे समस्त अपराध क्षमा करो।' },

  // ===================== rama-raksha-stotram (42) =====================
  { slug: 'rama-raksha-stotram', stanza: '2', lang: 'te', text: 'నేను రాముని ధ్యానిస్తున్నాను: నీల కమలమువలె శ్యాముడు, కమలముల వంటి నేత్రాలు కలిగినవాడు, జానకి మరియు లక్ష్మణులతో కూడినవాడు, జటాముకుటమును ధరించినవాడు.' },
  { slug: 'rama-raksha-stotram', stanza: '2', lang: 'ta', text: 'நான் ராமனை தியானிக்கிறேன்: நீல தாமரை போல் கருநிற உடையவன், தாமரை கண்ணன், ஜானகி மற்றும் லக்ஷ்மணனோடு இருப்பவன், சடாமுடியை தரித்தவன்.' },
  { slug: 'rama-raksha-stotram', stanza: '2', lang: 'hi', text: 'मैं राम का ध्यान करता हूँ: नील कमल के समान श्यामवर्ण, कमल-नेत्र, जानकी और लक्ष्मण से युक्त, जटामुकुट धारण करने वाले राम का।' },

  { slug: 'rama-raksha-stotram', stanza: '3', lang: 'te', text: 'ధనుస్సు, బాణాలు, అమ్ముల పొది చేతిలో ధరించినవాడు, రాత్రి సంచరించే రాక్షసులను నాశనము చేసేవాడు, ఆ అజన్ముడు, సర్వగతుడు అయిన ఈశ్వరుడు, యాగమును రక్షించుటకై కేవలం లీలగా అవతరించినట్లు కన్పించువాడు.' },
  { slug: 'rama-raksha-stotram', stanza: '3', lang: 'ta', text: 'வில், அம்புகள், அம்புத்தூணி கைகளில் தரித்தவன், இரவில் திரியும் ராக்ஷஸர்களை அழிப்பவன், அந்த பிறவாத, எங்கும் நிறைந்த ஈஸ்வரன், யாகத்தைக் காக்க வெறும் லீலையாக அவதரித்தவன் போல் தோன்றுபவன்.' },
  { slug: 'rama-raksha-stotram', stanza: '3', lang: 'hi', text: 'धनुष, बाण और तरकश हाथ में धारण किए, रात में विचरने वाले राक्षसों का विनाश करने वाले, वे अजन्मा, सर्वव्यापी ईश्वर, यज्ञ की रक्षा के लिए मानो केवल लीलावश ही प्रकट हुए हैं।' },

  { slug: 'rama-raksha-stotram', stanza: '16', lang: 'te', text: 'కల్పవృక్షమునకు ఆనందకరుడు, ప్రతి ఆపదను నివారించేవాడు, మూడు లోకాల సౌందర్యము, ఆ మహిమాన్వితుడైన రాముడే మన ప్రభువు.' },
  { slug: 'rama-raksha-stotram', stanza: '16', lang: 'ta', text: 'கல்பவிருக்ஷத்திற்கு மகிழ்வானவன், ஒவ்வொரு ஆபத்தையும் நீக்குபவன், மூன்று உலகங்களின் அழகு, அந்த மகிமையுடைய ராமனே நம் ஸ்வாமி.' },
  { slug: 'rama-raksha-stotram', stanza: '16', lang: 'hi', text: 'कल्पवृक्ष के आनंददाता, हर विपत्ति के निवारक, तीनों लोकों के सौंदर्य, वे महिमाशाली राम ही हमारे प्रभु हैं।' },

  { slug: 'rama-raksha-stotram', stanza: '18', lang: 'te', text: 'ఫలాలు మరియు మూలాలు తింటూ, స్వయంనిగ్రహము కలిగి, బ్రహ్మచర్య వ్రతమందు ఉన్న ఆ ఇద్దరూ దశరథుని పుత్రులు: రాముడు మరియు లక్ష్మణుడు అనే సోదరులు.' },
  { slug: 'rama-raksha-stotram', stanza: '18', lang: 'ta', text: 'பழங்களும் கிழங்குகளும் உண்டு, தன்னை அடக்கிக்கொண்டு, பிரம்மசர்ய விரதத்தில் உள்ள அந்த இருவரும் தசரதனின் புத்திரர்கள்: ராமனும் லக்ஷ்மணனும் என்ற சகோதரர்கள்.' },
  { slug: 'rama-raksha-stotram', stanza: '18', lang: 'hi', text: 'फल-मूल खाते, इंद्रियों को जीते, ब्रह्मचर्य व्रत में रत वे दोनों दशरथपुत्र: राम और लक्ष्मण नामक भाई हैं।' },

  { slug: 'rama-raksha-stotram', stanza: '19', lang: 'te', text: 'సర్వ ప్రాణులకు ఆశ్రయమైనవారు, సర్వ ధనుర్విదులలో అగ్రగాములు, రాక్షస వంశమును సంహరించినవారు, ఆ రఘుకుల శ్రేష్ఠులిద్దరూ మనలను రక్షించుగాక.' },
  { slug: 'rama-raksha-stotram', stanza: '19', lang: 'ta', text: 'எல்லா உயிர்களுக்கும் புகலிடமானவர்கள், எல்லா வில்லாளிகளிலும் முன்னணியானவர்கள், அரக்க குலத்தை அழித்தவர்கள், அந்த ரகுகுல சிறேஷ்டர்கள் இருவரும் நம்மை காக்கட்டும்.' },
  { slug: 'rama-raksha-stotram', stanza: '19', lang: 'hi', text: 'समस्त प्राणियों के आश्रय, समस्त धनुर्धारियों में अग्रणी, राक्षस-कुल-संहारक, वे दोनों रघुकुलश्रेष्ठ हमारी रक्षा करें।' },

  { slug: 'rama-raksha-stotram', stanza: '20', lang: 'te', text: 'ధనుస్సులను ఎక్కుపెట్టి సిద్ధముగా ఉంచి, చేతులతో బాణాలను తాకుచూ, అక్షయమైన అమ్ముల పొదులతో, రాముడు మరియు లక్ష్మణుడు సదా నా ముందు నడుచుగాక.' },
  { slug: 'rama-raksha-stotram', stanza: '20', lang: 'ta', text: 'வில்லுகளை நாண் ஏற்றி தயாரா வைத்து, கைகளால் அம்புகளை தொட்டுக்கொண்டு, அழியாத అம్ముల పొదులతో, ராமனும் லக்ஷ்மணனும் என்றும் என் முன்னால் நடக்கட்டும்.' },
  { slug: 'rama-raksha-stotram', stanza: '20', lang: 'hi', text: 'धनुष चढ़ाए सज्ज, हाथों से बाण को छूते हुए, अक्षय तरकश साथ लिए, राम और लक्ष्मण सदा मेरे आगे चलें।' },

  { slug: 'rama-raksha-stotram', stanza: '21', lang: 'te', text: 'కవచము ధరించి, ఖడ్గమును చేతిలో పట్టుకొని, ధనుస్సు బాణాన్ని వహించి, యవ్వనముతో నిండి, మనకు సర్వ కోరికలను తీర్చుచు, రాముడు, లక్ష్మణుడితో కలిసి మనలను రక్షించుగాక.' },
  { slug: 'rama-raksha-stotram', stanza: '21', lang: 'ta', text: 'கவசம் அணிந்து, கத்தியை கையில் பிடித்து, வில்லும் அம்பும் தாங்கி, இளமையால் நிறைந்து, நமக்கு எல்லா விருப்பங்களையும் பூர்த்தி செய்யும், ராமன், லக்ஷ்மணனோடு சேர்ந்து நம்மை காக்கட்டும்.' },
  { slug: 'rama-raksha-stotram', stanza: '21', lang: 'hi', text: 'कवच पहने, हाथ में खड्ग लिए, धनुष-बाण धारण किए, यौवन से भरे, हमारी सब मनोकामनाएँ पूर्ण करते, राम, लक्ष्मण सहित हमारी रक्षा करें।' },

  { slug: 'rama-raksha-stotram', stanza: '27', lang: 'te', text: 'రాజాధిరాజుకు నమస్కరిస్తున్నాను: సత్యవాక్కు కలవాడు, దశరథ పుత్రుడు, నీలవర్ణుడు, శాంత స్వభావుడు, జగదానందకుడు, రఘువంశ ఆభరణము, రఘవా.' },
  { slug: 'rama-raksha-stotram', stanza: '27', lang: 'ta', text: 'ராஜாதிராஜனுக்கு நமஸ்காரம்: சத்ய வாக்குடையவன், தசரத புத்திரன், நீல நிறத்தவன், சாந்த சொரூபன், ஜகதானந்தன், ரகுவம்ச ஆபரணம், ரகவா.' },
  { slug: 'rama-raksha-stotram', stanza: '27', lang: 'hi', text: 'राजाधिराज को नमस्कार: सत्यवादी, दशरथपुत्र, नीलवर्ण, शांत स्वरूप, जगदानंद, रघुवंश के आभूषण, रघव।' },

  { slug: 'rama-raksha-stotram', stanza: '30', lang: 'te', text: 'రాముడు నా తల్లి; రామచంద్రుడు నా తండ్రి; రాముడు నా స్వామి; రామచంద్రుడు నా మిత్రుడు; దయాళువైన రామచంద్రుడే నాకు సర్వము. ఇతరుని నేను ఎరుగను, తలుచుకోను.' },
  { slug: 'rama-raksha-stotram', stanza: '30', lang: 'ta', text: 'ராமன் என் தாய்; ராமசந்திரன் என் தந்தை; ராமன் என் ஸ்வாமி; ராமசந்திரன் என் நண்பன்; கருணையுள்ள ராமசந்திரனே எனக்கு எல்லாம். வேறொருவரை நான் அறியேன், நினைக்கவும் மாட்டேன்.' },
  { slug: 'rama-raksha-stotram', stanza: '30', lang: 'hi', text: 'राम मेरी माता हैं; रामचंद्र मेरे पिता हैं; राम मेरे स्वामी हैं; रामचंद्र मेरे मित्र हैं; दयालु रामचंद्र ही मेरे सब कुछ हैं। किसी अन्य को मैं नहीं जानता, नहीं मानता।' },

  { slug: 'rama-raksha-stotram', stanza: '33', lang: 'te', text: 'మనస్సువలె వేగమైనవాడు, వాయువువలె త్వరగా వెళ్ళేవాడు, ఇంద్రియముల యజమాని, జ్ఞానులందు అగ్రగాముడు, వాయు పుత్రుడు, వానరుల నాయకుడు, ఆ హనుమంతుని నేను శరణు పొందుచున్నాను.' },
  { slug: 'rama-raksha-stotram', stanza: '33', lang: 'ta', text: 'மனதைப் போல் வேகமானவன், காற்றைப் போல் விரைந்து செல்பவன், இந்திரியங்களின் அதிபதி, ஞானியரில் முன்னணியானவன், வாயு புத்திரன், வானரர்களின் தலைவன், அந்த அனுமனை நான் சரண் புகுகிறேன்.' },
  { slug: 'rama-raksha-stotram', stanza: '33', lang: 'hi', text: 'मन के समान वेगशाली, वायु के समान द्रुतगामी, इंद्रियों के स्वामी, ज्ञानियों में अग्रणी, वायुपुत्र, वानरों के सेनापति, उन हनुमान् की मैं शरण लेता हूँ।' },

  { slug: 'rama-raksha-stotram', stanza: '34', lang: 'te', text: 'కవిత్వమనే కొమ్మపై వాలిన కోకిలవంటి వాల్మీకికి నమస్కరిస్తున్నాను. ఆ కోకిల రామ, రామ అనే మధుర అక్షరాలను మధురముగా పాడుతోంది.' },
  { slug: 'rama-raksha-stotram', stanza: '34', lang: 'ta', text: 'கவிதை என்ற கிளையில் அமர்ந்த குயில் போன்ற வால்மீகிக்கு நமஸ்காரிக்கிறேன். அந்த குயில் ராம, ராம என்ற இனிமையான எழுத்துகளை இனிமையாக பாடுகிறது.' },
  { slug: 'rama-raksha-stotram', stanza: '34', lang: 'hi', text: 'काव्य की शाखा पर बैठे कोकिल-स्वरूप वाल्मीकि को प्रणाम। वह कोकिल राम, राम नामक मधुर अक्षरों को मधुरतापूर्वक गाती है।' },

  { slug: 'rama-raksha-stotram', stanza: '35', lang: 'te', text: 'ఆపదలను తొలగించేవాడు, సమస్త సంపదలను ప్రసాదించేవాడు, జగత్తుకు ఆనందమిచ్చేవాడు, ఆ శ్రీ రాముడికి మళ్ళీ మళ్ళీ నమస్కరిస్తున్నాను.' },
  { slug: 'rama-raksha-stotram', stanza: '35', lang: 'ta', text: 'ஆபத்துகளை நீக்குபவன், எல்லா செல்வங்களையும் வழங்குபவன், உலகுக்கு ஆனந்தமளிப்பவன், அந்த ஸ்ரீ ராமனுக்கு மீண்டும் மீண்டும் நமஸ்காரிக்கிறேன்.' },
  { slug: 'rama-raksha-stotram', stanza: '35', lang: 'hi', text: 'आपत्ति-निवारक, समस्त संपत्ति-प्रदाता, जगत्-आनंददाता, उन श्रीराम को बार-बार प्रणाम करता हूँ।' },

  { slug: 'rama-raksha-stotram', stanza: '37', lang: 'te', text: 'రాజుల శిరోమణి అయిన రాముడు సదా జయించేవాడు. లక్ష్మీ నాధుడైన రాముని ఆరాధిస్తున్నాను; రాముడు రాక్షస సేనలను నాశనము చేశాడు; ఆ రాముడు నాకు సకల మంగళమును కురిపించుగాక.' },
  { slug: 'rama-raksha-stotram', stanza: '37', lang: 'ta', text: 'ராஜர்களின் சிரோமணியான ராமன் என்றும் வெல்பவன். லக்ஷ்மி நாதனான ராமனை ஆராதிக்கிறேன்; ராமன் அரக்க சேனைகளை அழித்தான்; அந்த ராமன் எனக்கு எல்லா மங்களத்தையும் அளிக்கட்டும்.' },
  { slug: 'rama-raksha-stotram', stanza: '37', lang: 'hi', text: 'राजाओं के शिरोमणि राम सदा विजयी हैं। लक्ष्मी-नाथ राम की आराधना करता हूँ; राम ने राक्षस-सेनाओं का संहार किया; वे राम मुझे सब मंगल प्रदान करें।' },

  { slug: 'rama-raksha-stotram', stanza: '38', lang: 'te', text: 'రామా, రామా, రామా: ఈ మనోహరమైన రామ నామమందు నేను ఆనందిస్తున్నాను; హే సుముఖీ! రాముని ఒక్క నామము వేయి నామాలకు సమానము.' },
  { slug: 'rama-raksha-stotram', stanza: '38', lang: 'ta', text: 'ராமா, ராமா, ராமா: இந்த மனோகரமான ராம நாமத்தில் நான் ஆனந்திக்கிறேன்; ஹே சுமுகியே! ராமனின் ஒரு நாமம் ஆயிரம் நாமங்களுக்கு சமம்.' },
  { slug: 'rama-raksha-stotram', stanza: '38', lang: 'hi', text: 'राम, राम, राम: इस मनोहर राम नाम में मैं आनंद लेता हूँ; हे सुमुखी! राम का एक नाम सहस्र नामों के समान है।' },

  // ===================== rama-kavacham (41) =====================
  { slug: 'rama-kavacham', stanza: '0', lang: 'en', text: "I always remember Rāma, whose long arms reach down to his knees, whose eyes are elongated like lotus petals, who is utterly pure from birth with a face graced by a charming smile, who is dark-complexioned, who holds the beautiful bow and arrows, and who is supremely enchanting, together with Sītā (sarāmam)." },
  { slug: 'rama-kavacham', stanza: '0', lang: 'te', text: 'నేను ఎల్లప్పుడూ ఆజానుబాహువులు కలవాడు, కమలదళ నయనుడు, జన్మనుండి నిర్మలుడు, హాస్య ముఖంతో ప్రకాశించేవాడు, శ్యామ వర్ణుడు, ధనుర్బాణ ధారి, మహానందస్వరూపుడు అయిన ఆ రాముని స్మరిస్తాను; సీతాసహితుడైన అభిరాముని నిరంతరం స్మరిస్తాను.' },
  { slug: 'rama-kavacham', stanza: '0', lang: 'ta', text: 'ஆஜானுவரை நீண்ட கரங்களும், தாமரை இதழ் போன்ற நீண்ட கண்களும், பிறவியிலேயே மலரும் சுத்தமான புன்னகை நிறைந்த முகமும், கரிய நிறமும், வில்லும் அம்பும் ஏந்திய திருக்கரங்களும் கொண்ட, மிகவும் அழகிய, சீதையுடன் விளங்கும் அந்த ராமனை நான் என்றென்றும் நினைக்கின்றேன்.' },
  { slug: 'rama-kavacham', stanza: '0', lang: 'hi', text: 'मैं सदा उस राम का स्मरण करता हूँ जिनकी लंबी भुजाएँ घुटनों तक पहुँचती हैं, जिनके नेत्र कमल-दल के समान विशाल हैं, जो जन्म से ही निर्मल और हँसते हुए मुखवाले हैं, जो श्याम वर्ण और धनुष-बाण धारण किए हुए हैं और जो अत्यंत सुंदर हैं, सीता सहित उन रामचन्द्र का मैं स्मरण करता हूँ।' },

  { slug: 'rama-kavacham', stanza: '2', lang: 'en', text: 'Accompanied by Sītā and Saumitri (Lakshmana), wearing a crown of matted locks, holding the quiver, bow, and arrows in hand, he is the crusher of demons.' },
  { slug: 'rama-kavacham', stanza: '2', lang: 'te', text: 'సీతా-సౌమిత్రులతో కూడినవాడు, జటలతో నిర్మించిన మకుటం ధరించినవాడు; తూణీరం, ధనుస్సు, బాణాలు చేతపట్టుకున్నవాడు, దానవులను మర్దించేవాడు.' },
  { slug: 'rama-kavacham', stanza: '2', lang: 'ta', text: 'சீதையும் சௌமித்ரியும் (லக்ஷ்மணனும்) உடன் இருக்க, சடை முடி அணிந்தவர்; அம்புறாத்தூணியும் வில்லும் அம்பும் கரத்தில் ஏந்தியவர், அசுரர்களை அழிப்பவர்.' },
  { slug: 'rama-kavacham', stanza: '2', lang: 'hi', text: 'सीता और लक्ष्मण के साथ विराजमान, जटाओं का मुकुट धारण किए हुए; तरकश, धनुष और बाण हाथ में लिए हुए, दानवों को मर्दन करने वाले।' },

  { slug: 'rama-kavacham', stanza: '3', lang: 'en', text: 'When there is fear of thieves, fear of kings, or fear of enemies, then meditate on the wrathful Raghupati, who blazes like the fire of the cosmic dissolution.' },
  { slug: 'rama-kavacham', stanza: '3', lang: 'te', text: 'దొంగల భయం, రాజభయం, శత్రుభయం ఉన్నప్పుడు, కాలానలం వలె ప్రకాశించే క్రుద్ధుడైన రఘుపతిని ధ్యానించాలి.' },
  { slug: 'rama-kavacham', stanza: '3', lang: 'ta', text: 'திருடர்களின் பயம், அரசர்களின் பயம், அல்லது எதிரிகளின் பயம் எப்போது வந்தாலும், காலத்தின் நெருப்பைப் போல் ஒளிர்கின்ற சினமுற்ற ரகுபதியை தியானிக்க வேண்டும்.' },
  { slug: 'rama-kavacham', stanza: '3', lang: 'hi', text: 'जब चोर का, राजा का, या शत्रु का भय हो, तब क्रोधित रघुपति का ध्यान करें जो कालाग्नि के समान प्रचंड तेज से दीप्तिमान हैं।' },

  { slug: 'rama-kavacham', stanza: '5', lang: 'en', text: 'In battle, the mighty warrior, fierce and terrible, standing upon Indra’s chariot, destroys enemies like Rāvaṇa and others with showers of sharp arrows.' },
  { slug: 'rama-kavacham', stanza: '5', lang: 'te', text: 'ఇంద్ర రథంపై నిలుచున్న ఉగ్రుడు, మహావీరుడు యుద్ధంలో రావణాది శత్రువులను తీక్ష్ణమైన బాణాల వర్షంతో సంహరించేవాడు.' },
  { slug: 'rama-kavacham', stanza: '5', lang: 'ta', text: 'இந்திரனின் தேரில் நின்ற மிகவும் வலிமைமிக்க, கடும் போர்வீரர், போர்க்களத்தில் ராவணனையும் மற்ற எதிரிகளையும் கூர்மையான அம்புகளின் மழையால் அழிப்பவர்.' },
  { slug: 'rama-kavacham', stanza: '5', lang: 'hi', text: 'इन्द्र के रथ पर खड़े महाप्रतापी, उग्र और महावीर, रण में रावणादि शत्रुओं को तीखे बाणों की वर्षा से संहार करते हैं।' },

  { slug: 'rama-kavacham', stanza: '9', lang: 'en', text: 'Thus meditating (on this warrior form of Rāma), one should chant this armor of Rāma which grants all perfections. O Sutīkṣṇa (best of sages), listen: I shall now declare the unsurpassable diamond-shield kavacam.' },
  { slug: 'rama-kavacham', stanza: '9', lang: 'te', text: 'ఈ విధంగా ధ్యానించి, సిద్ధిని ప్రసాదించే రామ కవచాన్ని జపించాలి. ఓ మునిసత్తమ సుతీక్ష్ణా! వినుము, ఇప్పుడు నేను అనుత్తమ వజ్రకవచాన్ని వివరిస్తాను.' },
  { slug: 'rama-kavacham', stanza: '9', lang: 'ta', text: 'இவ்வாறு தியானித்து, சித்திகளை வழங்கும் ராம கவசத்தை ஜபிக்க வேண்டும். ஓ முனி சிரேஷ்டா சுதீக்ஷ்ணா! கேட்பீராக, இப்போது நான் சிறப்புமிக்க வஜ்ர கவசத்தை அறிவிக்கின்றேன்.' },
  { slug: 'rama-kavacham', stanza: '9', lang: 'hi', text: 'इस प्रकार ध्यान करके, सिद्धि प्रदान करने वाले रामकवच का जप करना चाहिए। हे मुनिश्रेष्ठ सुतीक्ष्ण! सुनो, मैं अब उत्तम वज्रकवच सुनाता हूँ।' },

  { slug: 'rama-kavacham', stanza: '22', lang: 'te', text: 'సౌమిత్రిపూర్వజుడు (లక్ష్మణుని అగ్రజుడైన రాముడు) నా వాగాది ఇంద్రియాలు రక్షించుగాక; సుగ్రీవరాజ్యదుడు నా రోమాంకురాలన్నీ రక్షించుగాక.' },
  { slug: 'rama-kavacham', stanza: '22', lang: 'hi', text: 'सौमित्रिपूर्वज (लक्ष्मण के अग्रज राम) वाणी एवं अन्य इन्द्रियों की रक्षा करें; सुग्रीवराज्यद (सुग्रीव को राज्य देने वाले) सभी रोमकूपों की रक्षा करें।' },

  { slug: 'rama-kavacham', stanza: '23', lang: 'en', text: 'All sins committed through speech, mind, intellect, and ego, whether knowingly or unknowingly, and all the various sins performed in past births...' },

  { slug: 'rama-kavacham', stanza: '24', lang: 'en', text: "...may Rāma, the Breaker of Hara's (Śiva's) Kodanda bow, quickly burn away all those sins; may Rāma, the Bearer of the Śārṅga bow and arrows, always protect me from all directions." },

  { slug: 'rama-kavacham', stanza: '25', lang: 'en', text: 'Thus this armor of Śrī Rāmacandra is hard as diamond (vajrasammita), the most secret of all secrets, and divine. O Sutīkṣṇa, best of sages!' },
  { slug: 'rama-kavacham', stanza: '25', lang: 'te', text: 'ఈ విధంగా శ్రీరామచంద్రుని కవచం వజ్రసమానమైనది, ఇది గుహ్యాతి గుహ్యం మరియు దివ్యమైనది. ఓ మునిసత్తమ సుతీక్ష్ణా!' },
  { slug: 'rama-kavacham', stanza: '25', lang: 'ta', text: 'இவ்வாறு ஸ்ரீராமசந்திரனின் கவசம் வஜ்ர சமம் (வைரம் போல் உறுதியானது), இது இரகசியங்களிலெல்லாம் மிக உயர்ந்த இரகசியம், திவ்யமானது. ஓ, முனி சிரேஷ்டா சுதீக்ஷ்ணா!' },
  { slug: 'rama-kavacham', stanza: '25', lang: 'hi', text: 'इस प्रकार श्रीरामचन्द्र का यह कवच वज्र के समान दृढ़ है, यह सभी रहस्यों में परमरहस्य और दिव्य है। हे मुनिश्रेष्ठ सुतीक्ष्ण!' },

  { slug: 'rama-kavacham', stanza: '26', lang: 'en', text: 'Whoever reads, hears, or causes others to hear this (kavacam) with a concentrated mind, that person, by the grace of Rāmacandra, attains the supreme abode.' },
  { slug: 'rama-kavacham', stanza: '26', lang: 'te', text: 'ఏకాగ్ర మనస్సుతో ఎవరైతే దీన్ని పఠిస్తారో, వింటారో, వినిపిస్తారో, వారు రామచంద్ర ప్రసాదంతో పరమ స్థానాన్ని పొందుతారు.' },
  { slug: 'rama-kavacham', stanza: '26', lang: 'ta', text: 'ஏகாக்கிரமான மனதுடன் இதை யார் படிக்கிறார்களோ, கேட்கிறார்களோ, கேட்கச் செய்கிறார்களோ, அவர்கள் ராமசந்திரனின் அருளால் பரம தலத்தை அடைவார்கள்.' },
  { slug: 'rama-kavacham', stanza: '26', lang: 'hi', text: 'जो एकाग्र मन से इसे पढ़े, सुने या सुनाए, वह रामचन्द्र की कृपा से परमधाम को प्राप्त होता है।' },

  { slug: 'rama-kavacham', stanza: '27', lang: 'en', text: 'Even one burdened with the five great sins, a cow-slayer, or one guilty of causing harm to the unborn (bhrūṇa-hatya); through the recitation of Śrī Rāmacandra’s armor, such a person attains purification.' },
  { slug: 'rama-kavacham', stanza: '27', lang: 'te', text: 'మహాపాతకులు, గో హంతకులు, భ్రూణ హంతకులు అయినా సరే, శ్రీరామచంద్ర కవచ పఠనం ద్వారా శుద్ధిని పొందుతారు.' },
  { slug: 'rama-kavacham', stanza: '27', lang: 'ta', text: 'மாபெரும் பாவங்கள் செய்தவராலும், பசுவை கொன்றவராலும், கரு அழிப்புக்கு காரணமானவராலும், ஸ்ரீராமசந்திர கவசத்தை படிப்பதால் அவர்கள் தூய்மை அடைவார்கள்.' },
  { slug: 'rama-kavacham', stanza: '27', lang: 'hi', text: 'महापातकों से युक्त हो, गोहत्यारा हो या भ्रूणहत्या का दोषी हो, ऐसा व्यक्ति भी श्रीरामचन्द्र कवच के पाठ से शुद्धि प्राप्त करता है।' },

  // ===================== thiruppavai (33) =====================
  { slug: 'thiruppavai', stanza: '1', lang: 'en', text: 'On this auspicious day of the full moon in the month of Margazhi, O you beautifully adorned young girls! Let us go to take our sacred bath. He, the son of Nandagopan, the young lion-cub of Yashoda, with a dark cloud-like body and face radiant as sun and moon, He, Lord Narayana Himself, will grant us the parai (the fruits of our vow).' },
  { slug: 'thiruppavai', stanza: '1', lang: 'hi', text: 'मार्गशीर्ष महीने की पूर्णिमा के शुभ दिन, हे सुंदर कन्याओं! आओ स्नान करने चलें। नंदगोप के पुत्र, यशोदा के शेर जैसे बालक, साक्षात नारायण हमें व्रत का फल प्रदान करेंगे।' },

  { slug: 'thiruppavai', stanza: '3', lang: 'en', text: 'If we sing the name of the Supreme Lord who grew tall to measure the three worlds in His Vamana avatar and bathe for our vow, our land will be free from evil and blessed with rain three times a month. The red paddy crops will grow tall, fish will leap in the fields, bees will sleep inside lotus flowers, generous cows will fill vessels with milk, and endless wealth will fill the country.' },

  { slug: 'thiruppavai', stanza: '4', lang: 'hi', text: 'इस पाशुरम में अंडाल वर्षा के देवता वरुण देव से प्रार्थना करती हैं कि वे संसार के कल्याण के लिए भरपूर वर्षा करें। वे वर्षा को भगवान विष्णु के आयुधों, अर्थात् सुदर्शन चक्र, पाञ्चजन्य शंख और सारंग धनुष से जोड़ती हैं। हम मार्गशीर्ष स्नान कर सकें इसलिए मेघ खूब बरसें।' },

  { slug: 'thiruppavai', stanza: '6', lang: 'en', text: 'Look, the birds are chirping! Do you not hear the loud sounding of the white conch from the temple of the Lord who rides Garuda? Rise, O child! Sages and yogis are waking up slowly, holding in their hearts the Primordial Seed: Lord Vishnu, who sucked the poison from Putana’s breasts, kicked and destroyed the demon Sakatasura, and rests on Adisesha in the Milky Ocean. Their chanting of "Hari! Hari!" fills our hearts with cool bliss.' },

  { slug: 'thiruppavai', stanza: '9', lang: 'hi', text: 'हे सहेली! तुम मणियों से जड़े सुंदर महल में, सुगंधित वातावरण के बीच सो रही हो। उठो और दरवाजा खोलो। हे माते! अपनी बेटी को जगाइए; क्या वह गूंगी है, बहरी है या किसी मंत्र के प्रभाव में इतनी गहरी नींद में है? मामयन, माधवन और वैकुंठन के नाम लेकर भी वह नहीं जागती!' },

  { slug: 'thiruppavai', stanza: '10', lang: 'hi', text: 'आंडाल कहती हैं, हे पुण्यशालिनी! क्या तुमने व्रत के फल का आनंद ले लिया है कि दरवाजा भी नहीं खोल रही? भगवान नारायण जो तुलसी की माला पहनते हैं, सबका कल्याण करते हैं। वे कुंभकर्ण का उदाहरण देते हुए मजाक में पूछती हैं कि क्या कुंभकर्ण ने अपनी नींद तुम्हें उपहार में दे दी है? आलस्य छोड़ो और उठो।' },

  { slug: 'thiruppavai', stanza: '12', lang: 'te', text: 'లేగ దూడలను తలచుకొని గేదెలు పాలను నిరాటంకంగా స్రవిస్తూ ఇంటి ప్రాంగణమంతా తడిసిపోయింది. శ్రీరాముడు రావణుని సంహరించిన కీర్తిని పాడుతూ, బయట మంచు కురుస్తున్నా, గేదెల పాల ధారలను లెక్కచేయకుండా ఆ గోపిక వాకిట వేచి ఉన్నారు. ఇంత గొప్ప సంపద కలిగిన గోపికా, నీ నిద్రకు ఆశ్చర్యంగా ఉంది; నిద్రలేవమని కోరుతున్నారు.' },
  { slug: 'thiruppavai', stanza: '12', lang: 'hi', text: 'आण्डाल कहती हैं, हे धनी कन्या! देखो, तुम्हारी भैंसें अपने बछड़ों के लिए व्याकुल होकर दूध बहा रही हैं जिससे घर में कीचड़ हो गया है। बाहर भोर हो चुकी है और हम सब ठिठुरती ठंड में यहाँ खड़ी हैं। उठो और हमारे साथ मिलकर उन भगवान का गुणगान करो जिन्होंने लंका के राजा रावण का वध किया था।' },

  { slug: 'thiruppavai', stanza: '15', lang: 'hi', text: 'सखियों के बीच संवाद: "हे तोते जैसी कोमल वाणी वाली सखी! तुम अभी भी सो रही हो?" इसका उत्तर मिलता है: "मैं आ रही हूँ, इतना शोर मत मचाओ।" तब कहा जाता है: "तुम बहुत चतुर हो, तुम्हारी बातें हम पहले से जानती हैं। अगर आ गई हो तो जल्दी बाहर निकलो और देखो कि क्या सब सखियाँ आ गई हैं। हमें उन भगवान की स्तुति करनी है जिन्होंने कुवलयापीड़ हाथी को मारा।"' },

  { slug: 'thiruppavai', stanza: '16', lang: 'en', text: 'O guard of the palace of our leader Nandagopa! O guard of the main entrance decorated with flags and festoons! Please release the latch and open the bejeweled door. Lord Krishna, the mysterious one with the complexion of a blue sapphire, has promised us, the maidens of the cowherd clan, that He would grant us the drum (parai). We have come with pure hearts to sing His praise and awaken Him. Like a mother, please do not refuse us; kindly open the heavy doors and let us in.' },
  { slug: 'thiruppavai', stanza: '16', lang: 'hi', text: 'यह पाशुरम उस समय का है जब गोपियाँ नन्दगोप के महल के द्वार पर पहुँचती हैं। वे द्वारपाल से प्रार्थना करती हैं कि वह महल के रत्नजड़ित दरवाजों को खोल दे। भगवान कृष्ण ने स्वयं उन्हें पराई देने का वचन दिया है। वे शुद्ध हृदय से कृष्ण को जगाने आई हैं; द्वारपाल बिना बहाने के उन्हें भीतर जाने दे।' },

  { slug: 'thiruppavai', stanza: '17', lang: 'en', text: 'O Lord Nandagopa, our master, who is celebrated for your charity of giving clothes, cool water, and food, please wake up! O Yashoda, the tender shoot among women, the radiant lamp of your clan, please wake up! O Lord Krishna who pierced through the sky and measured the worlds as Trivikrama, the Lord of the Devas, please wake up! O Balarama, you who possess golden anklets and great wealth, please wake up along with your younger brother.' },

  { slug: 'thiruppavai', stanza: '19', lang: 'te', text: 'ప్రకాశవంతమైన దీపాలు వెలుగుతుండగా, ఏనుగు దంతపు కాళ్లు కలిగిన మంచంపై, మెత్తని పరుపులో, పూల జడ కలిగిన నప్పిన్నై దేవి వక్షస్థలంపై తల ఉంచి పవళించి ఉన్న ఓ కృష్ణా! నీవు మాతో ఒక్క మాట మాట్లాడవా? కాటుక దిద్దిన కన్నులు కలిగిన నప్పిన్నై దేవీ! నీవు నీ భర్తను ఒక్క క్షణం కూడా నిద్ర లేవనివ్వడం లేదు; ఆయన నుండి విడిపోలేక నీవు చేస్తున్న ఈ పని నీకు తగునా?' },
  { slug: 'thiruppavai', stanza: '19', lang: 'hi', text: 'प्रज्वलित दीपों के प्रकाश में, हाथीदांत के पाये वाले पलंग पर, कोमल शय्या पर, फूलों से सुसज्जित बालों वाली नप्पिन्नै के वक्षस्थल पर सिर रखे लेटे हुए हे श्री कृष्ण! आप अपना मुख खोलें और हमसे बात करें। हे काजल लगे नयनों वाली नप्पिन्नै! तुम अपने पति को एक क्षण के लिए भी जागने नहीं देती; क्या यह उचित है और क्या यह तुम्हारे स्वभाव के अनुरूप है?' },

  { slug: 'thiruppavai', stanza: '20', lang: 'en', text: 'O Krishna, who went before the thirty-three gods and removed their fears and burdens, awake from Your sleep! O flawless one, strong and mighty, who destroys the heat of the enemies, arise! O Nappinnai, fair and graceful, with shining lips and soft bosom like a golden lotus, give us Your strength and Your favor, wake up Your beloved Lord Krishna, and let Him bless us with His divine grace; O Paavai, awaken!' },
  { slug: 'thiruppavai', stanza: '20', lang: 'hi', text: 'हे कृष्ण, जो तैंतीस देवताओं के सम्मुख जाकर उनके भय और कष्टों को दूर करते हैं, अपनी निद्रा से जागिए! हे निर्दोष, शक्तिशाली, शत्रुओं को ताप देने वाले पवित्र प्रभु! जागिए। हे नप्पिन्नई, सुंदर होंठों और कोमल वक्ष वाली, लक्ष्मी स्वरूपा! जागिए। हमें अपना आशीर्वाद और सामर्थ्य प्रदान करें, अपने प्रियतम भगवान कृष्ण को जगाएं और हमें उनकी दिव्य कृपा का आशीर्वाद दें।' },

  { slug: 'thiruppavai', stanza: '21', lang: 'en', text: 'Oh son of Nanda Gopa, who owns great generous cows that yield milk in such abundance that it fills the vessels and overflows instantly! Please wake up. Oh Lord, you are full of determination, you are the Greatest, and you are the radiant light that manifested in this world, please rise from your slumber. Just as your enemies, having lost their strength, come to your doorstep with no other refuge and bow at your feet, we have come here to praise you. Please wake up and accept our prayers.' },

  { slug: 'thiruppavai', stanza: '23', lang: 'en', text: 'Just as a majestic lion sleeping motionless in a mountain cave during the rainy season wakes up, spreads its fiery gaze in all directions, shakes its thick fragrant mane, stretches its body, roars and steps out of the den with pride, similarly, O Lord with the hue of the Athasi (blue) flower! Please emerge from your temple-like chamber, grace us with your presence, and sit upon your grand decorated throne. We request you to kindly listen to the purpose of our arrival and grant us our wishes.' },

  { slug: 'thiruppavai', stanza: '24', lang: 'en', text: 'Praise be to Your feet, O Lord, who once measured this whole world! Praise be to Your valor that destroyed the southern Lanka! Praise to You who shattered the evil cart demon Sakatasura, who lifted the Govardhana mountain as an umbrella to protect Your people, and who wields the victorious spear in Your hand to destroy enemies. O glorious Lord, we have come today to sing Your praises and receive the divine drum as Your blessing; O Lord, have mercy on us!' },

  { slug: 'thiruppavai', stanza: '26', lang: 'en', text: 'Oh Lord who possesses infinite love for your devotees (Maale)! Oh Lord with the complexion of a blue gem (MaNivaNNA)! If you were to ask us what is required to perform the Margazhi bath, we shall tell you: We need conches that resemble your own Panchajanyam: white as milk and capable of sounding so loudly that the whole world trembles. We also require large drums (parai), those who can sing the Pallandu hymns of long life for the Lord, beautiful lamps, flags, and canopies. Oh Lord who rested on a banyan leaf during the deluge, please grant us these things and bestow your grace upon us!' },

  { slug: 'thiruppavai', stanza: '27', lang: 'en', text: 'Oh Govinda! You are the one who conquers even those who oppose You by Your divine grace. By singing Your praises and obtaining the Parai (the divine fruit of our penance), we receive the rewards that the whole world admires. We will adorn ourselves with beautiful ornaments like bangles, shoulder ornaments, earrings, and anklets. We will wear new clothes and thereafter eat rice prepared with milk and generous amounts of ghee, so much that it drips down to our elbows, while sitting together with You, and find absolute bliss.' },

  { slug: 'thiruppavai', stanza: '29', lang: 'en', text: 'Oh Govinda! We have come to You at this early dawn, bowing down to You and praising Your golden lotus-like feet. Please listen to the purpose of our coming. Since You were born in our clan of cowherds who earn their living by tending cattle, You cannot refuse to accept our humble services. We have not come here today just to receive the drum (parai) from You. We want to be eternally related to You throughout all our seven-fold births. We shall serve only You. Please remove all our other worldly desires, Oh Paavai!' },

  // ===================== devi-kavacham (33) =====================
  { slug: 'devi-kavacham', stanza: '1', lang: 'en', text: 'OM. Of this Śrī Caṇḍī Kavacam, Brahmā is the seer (ṛṣi), Anuṣṭup is the metre, Cāmuṇḍā is the deity, the Mothers mentioned in the aṅga-nyāsa are the bīja, the deities binding the directions are the tattva; it is recited as an ancillary of the Saptaśatī pāṭha for the pleasure of Śrī Jagadambā.' },
  { slug: 'devi-kavacham', stanza: '1', lang: 'te', text: 'ఓం. ఈ శ్రీ చండీకవచానికి బ్రహ్మ ఋషి, అనుష్టుప్ ఛందస్సు, చాముండ దేవత; అంగన్యాసంలో చెప్పిన మాతలే బీజం, దిగ్బంధ దేవతలు తత్త్వం; శ్రీ జగదంబ ప్రీతి కొరకు సప్తశతీ పారాయణాంగంగా జపంలో దీనిని వినియోగించాలి.' },
  { slug: 'devi-kavacham', stanza: '1', lang: 'ta', text: 'ஓம். இந்த ஸ்ரீ சண்டீ கவசத்தின் ரிஷி பிரம்மா, சந்தம் அனுஷ்டுப், தேவதை சாமுண்டா; அங்கந்யாசத்தில் சொல்லப்பட்ட மாதாக்கள் பீஜம், திக்பந்தன தேவதைகள் தத்துவம்; ஸ்ரீ ஜகதம்பாவின் மகிழ்ச்சிக்காக சப்தசதீ பாராயணத்தின் அங்கமாக இது ஜபத்தில் பயன்படுத்தப்படுகிறது.' },
  { slug: 'devi-kavacham', stanza: '1', lang: 'hi', text: 'ॐ। इस श्रीचण्डीकवच के ऋषि ब्रह्मा, छन्द अनुष्टुप्, देवता चामुण्डा, अङ्गन्यास में वर्णित माताएँ बीज, दिग्बन्ध की देवताएँ तत्त्व हैं; श्री जगदम्बा की प्रसन्नता के लिए इसका विनियोग सप्तशती पाठ के अङ्ग के रूप में जप में किया जाता है।' },

  { slug: 'devi-kavacham', stanza: '2', lang: 'hi', text: 'महर्षि मार्कण्डेय ने पूछा: "हे पितामह (ब्रह्मा जी)! इस संसार में जो परम गोपनीय हो, जो मनुष्यों को सब प्रकार से सुरक्षा प्रदान करने वाला हो और जो अब तक आपने किसी और को न बताया हो, वह परम पवित्र साधन कृपया मुझे बताइए।"' },

  { slug: 'devi-kavacham', stanza: '3', lang: 'en', text: 'Lord Brahma said: "O best of Brahmins, O great Sage Markandeya! There exists a most profound secret that benefits all living beings: it is the sacred Devi Kavacham (Armour of the Goddess). Listen to it attentively."' },

  { slug: 'devi-kavacham', stanza: '7', lang: 'en', text: 'When one is surrounded by raging fire, or trapped in the midst of enemies in battle, or gripped by fear in an extraordinary crisis, those terror-stricken ones who take refuge in the Divine Mother...' },

  { slug: 'devi-kavacham', stanza: '9', lang: 'en', text: 'O Goddess, for those who remember You with devotion, growth and prosperity certainly arise. You protect those who remember You, O Deveshi; there is absolutely no doubt.' },
  { slug: 'devi-kavacham', stanza: '9', lang: 'te', text: 'ఓ దేవేశ్వరీ! ఎవరైతే నిన్ను భక్తితో స్మరిస్తారో, వారి జీవితంలో నిశ్చయముగా సర్వతోముఖాభివృద్ధి కలుగుతుంది. నిన్ను మనస్ఫూర్తిగా స్మరించే భక్తులను నువ్వు ఎల్లప్పుడూ రక్షిస్తావు; ఇందులో ఎలాంటి సంశయం లేదు.' },
  { slug: 'devi-kavacham', stanza: '9', lang: 'ta', text: 'தேவர்களின் தலைவியே, தேவேசி! உன்னை யாரெல்லாம் தூய பக்தியோடு தியானிக்கிறார்களோ, அவர்களின் வாழ்க்கையில் நிச்சயம் அனைத்து வளங்களும் பெருகும். உன்னை மனதார நினைக்கும் பக்தர்களை நீ எப்போதும் காத்து ரட்சிப்பாய்; இதில் எந்தவிதமான சந்தேகமும் இல்லை.' },
  { slug: 'devi-kavacham', stanza: '9', lang: 'hi', text: 'हे देवेश्वरी! जो भी भक्तिभाव से आपका स्मरण करते हैं उनके जीवन में निश्चित रूप से सुख-समृद्धि और उन्नति की वृद्धि होती है। जो आपकी याद बनाए रखते हैं उन्हें आप हमेशा रक्षा करती हैं; इसमें तनिक भी संदेह नहीं।' },

  { slug: 'devi-kavacham', stanza: '14', lang: 'en', text: 'They are seen mounted on chariots, the Goddesses filled with wrath, bearing the conch, discus, mace, spear, plough, and the pestle-weapon...' },
  { slug: 'devi-kavacham', stanza: '14', lang: 'hi', text: 'ये देवियाँ रथों पर आरूढ़ होकर क्रोध से भरी, शंख, चक्र, गदा, शक्ति, हल और मूसल आयुध धारण किए हुए दिखती हैं...' },

  { slug: 'devi-kavacham', stanza: '17', lang: 'en', text: 'Salutations unto You, O Most Fierce One, who possesses terrifying valour, infinite strength, and boundless enthusiasm, and who completely annihilates the greatest fears of Your devotees!' },

  { slug: 'devi-kavacham', stanza: '18', lang: 'en', text: 'O Mother whose majesty enemies cannot gaze upon, who is unconquerable, and who multiplies the terror in the wicked: may Aindri protect me in the East, and the Fire-embodied Goddess in the Southeast.' },

  { slug: 'devi-kavacham', stanza: '38', lang: 'en', text: 'May Vajrahasta protect the five vital winds: Prana, Apana, Vyana, Udana, and Samana; may Kalyanashobhana protect my vital breath.' },
  { slug: 'devi-kavacham', stanza: '38', lang: 'hi', text: 'प्राण, अपान, व्यान, उदान और समान, ये पंचप्राण वज्रहस्ता देवी की रक्षा में हों। मुख्य जीव-प्राण की कल्याणशोभना देवी रक्षा करें।' },

  { slug: 'devi-kavacham', stanza: '39', lang: 'en', text: 'May Yogini protect the five sensory perceptions: taste, form, smell, sound, and touch; may Narayani always protect the three gunas: sattva, rajas, and tamas.' },

  { slug: 'devi-kavacham', stanza: '43', lang: 'en', text: 'Whatever place is left unprotected, not covered by this armor, may all of that be protected by You, O Devi Jayanti, destroyer of sins!' },
  { slug: 'devi-kavacham', stanza: '43', lang: 'hi', text: 'जो भी अंग या स्थान इस कवच से छूट गया हो, उस सब की रक्षा करो हे देवी, हे जयंती, हे पापनाशिनी!' },

  { slug: 'devi-kavacham', stanza: '44', lang: 'en', text: 'One who desires auspiciousness should not take even a single step without this armor. Whoever is always covered by the armor, wherever they go...' },
  { slug: 'devi-kavacham', stanza: '44', lang: 'hi', text: 'अपना कल्याण चाहने वाले को इस कवच के बिना एक कदम भी बाहर नहीं जाना चाहिए। जो हमेशा इस कवच से आवृत होकर जहाँ-जहाँ भी जाता है,' },

  { slug: 'devi-kavacham', stanza: '47', lang: 'en', text: 'This Kavacham of the Devi is difficult to obtain even for the gods. One who recites it with pure self-control and faith during the three sandhyas (dawn, noon, dusk) daily,' },
  { slug: 'devi-kavacham', stanza: '47', lang: 'hi', text: 'देवी का यह कवच देवताओं को भी दुर्लभ है। जो पुरुष शुद्ध मन और पूर्ण श्रद्धा के साथ प्रतिदिन तीनों संध्याओं (प्रातः, मध्याह्न, सायं) में इसका पाठ करता है,' },

  { slug: 'devi-kavacham', stanza: '48', lang: 'en', text: 'will be blessed with divine attributes; unconquerable in all three worlds; will live more than a hundred years, free from untimely death.' },
  { slug: 'devi-kavacham', stanza: '48', lang: 'hi', text: 'उसके भीतर दैवी कलाएँ प्रकट होती हैं; वह तीनों लोकों में अजेय हो जाता है। अपमृत्यु (अकाल मृत्यु) से बचकर सौ वर्ष से भी अधिक उत्तम स्वास्थ्य के साथ जीता है।' },

  { slug: 'devi-kavacham', stanza: '49', lang: 'en', text: 'All diseases perish: spider-bite, eruptions (small-pox), and the like, along with all poison, whether stationary (plant-based), moving (animal-based), or artificially made.' },
  { slug: 'devi-kavacham', stanza: '49', lang: 'hi', text: 'सभी रोग नष्ट होते हैं: चेचक, त्वचा रोग, हैजा आदि। स्थावर (वनस्पति विष), जंगम (सर्प आदि का विष) और कृत्रिम (बना हुआ), सभी प्रकार के विष निष्क्रिय हो जाते हैं।' },

  { slug: 'devi-kavacham', stanza: '55', lang: 'en', text: 'As long as this earth sustains itself with its mountains, forests, and groves, so long will the lineage of sons and grandsons of this practitioner flourish on earth.' },

  // ===================== venkateswara-suprabhatam (27) =====================
  { slug: 'venkateswara-suprabhatam', stanza: '1', lang: 'te', text: 'కౌసల్యాసుప్రజా రామా! తూర్పు వైపు వేకువ వస్తున్నది. ఓ నరశ్రేష్ఠా, లేచుము; దేవతలు విధించిన ప్రాతఃకాల నిత్యకర్మలను నిర్వర్తింపవలెను.' },
  { slug: 'venkateswara-suprabhatam', stanza: '1', lang: 'ta', text: 'கௌசல்யையின் புண்ணிய மகன் ராமனே! கிழக்கில் விடியற்காலம் வருகிறது. மனிதர்களுள் புலியே, எழுந்திரும்; தேவர்கள் விதித்த நாளாந்த நியமங்களைச் செய்ய வேண்டும்.' },
  { slug: 'venkateswara-suprabhatam', stanza: '1', lang: 'hi', text: 'कौसल्या के सुपुत्र राम! पूर्व दिशा में प्रातःसंध्या उदित हो रही है। हे नरश्रेष्ठ, उठो; देवताओं द्वारा विहित दैनिक कर्तव्यों का पालन करना है।' },

  { slug: 'venkateswara-suprabhatam', stanza: '2', lang: 'te', text: 'లేచుము, లేచుము ఓ గోవిందా; లేచుము ఓ గరుడ ధ్వజా; లేచుము ఓ కమలా కాంతా, త్రైలోక్యమునకు మంగళమొసగుము.' },
  { slug: 'venkateswara-suprabhatam', stanza: '2', lang: 'ta', text: 'எழுந்திரு, எழுந்திரு கோவிந்தனே; எழுந்திரு கருட கொடியோனே; எழுந்திரு கமலையின் நாதனே, முப்புவனங்களுக்கும் மங்களம் நல்குக.' },
  { slug: 'venkateswara-suprabhatam', stanza: '2', lang: 'hi', text: 'उठो, उठो हे गोविन्द; उठो हे गरुडध्वज; उठो हे कमलाकान्त, तीनों लोकों को मंगल प्रदान करो।' },

  { slug: 'venkateswara-suprabhatam', stanza: '3', lang: 'te', text: 'ఓ సమస్త లోకముల జననీ, మధుకైటభ శత్రువు వక్షమున నివసించు మనోహర దివ్యమూర్తీ! శ్రీ దేవి మహారాజ్ఞీ, శరణాగతులకు ప్రేమతో వరమొసగు స్వభావము కలదానా, శ్రీ వేంకటేశ ప్రియురాలా, నీకు శుభ ప్రభాతమగుగాత!' },
  { slug: 'venkateswara-suprabhatam', stanza: '3', lang: 'ta', text: 'சமஸ்த உலகங்களின் தாயே, மது கைடபரின் பகைவனின் மார்பில் வசிப்பவளே, மனமயக்கும் தெய்வீக உருவினளே! ஸ்ரீ தேவியின் தலைவியே, சரணடைந்தோர்க்கு அன்புடன் வரமளிக்கும் இயல்புடையவளே, ஸ்ரீ வேங்கடேசனின் அன்பிற்கினியவளே, உனக்கு நல்ல விடியல் ஆகட்டும்!' },
  { slug: 'venkateswara-suprabhatam', stanza: '3', lang: 'hi', text: 'हे समस्त लोकों की जननी, मधु-कैटभ के शत्रु के वक्षस्थल पर विहार करने वाली मनोहर दिव्यमूर्ते! श्री की स्वामिनी, शरणागतों को प्रेमपूर्वक वर देना जिसका स्वभाव है, हे श्रीवेंकटेश की प्रिया, तुम्हें शुभ प्रभात हो!' },

  { slug: 'venkateswara-suprabhatam', stanza: '15', lang: 'te', text: 'వారు నీ నివాసాల పేర్లైన శ్రీ శేషశైలము, గరుడాచలము, వేంకటాచలము, నారాయణాచలము, వృషభాచలము, వృషాచలము మొదలైనవాటిని నిరంతరమూ కీర్తిస్తున్నారు; ఓ శ్రీ వేంకటాచలపతీ, నీకు శుభ ప్రభాతమగుగాత!' },
  { slug: 'venkateswara-suprabhatam', stanza: '15', lang: 'ta', text: 'அவர்கள் உமது வாசஸ்தானங்களின் பெயர்களான ஸ்ரீ சேஷ மலை, கருட மலை, வேங்கட மலை, நாராயண மலை, வியூஷப மலை, வியூஷ மலை என்பவற்றை இடைவிடாது கூறிக்கொண்டிருக்கின்றனர்; ஓ ஸ்ரீ வேங்கடாசலபதியே, உமக்கு நல்ல விடியல் ஆகட்டும்!' },
  { slug: 'venkateswara-suprabhatam', stanza: '15', lang: 'hi', text: 'वे आपके निवास के नाम, श्री शेषशैल, गरुडाचल, वेंकटाचल, नारायणाचल, वृषभाचल, वृषाचल आदि, निरंतर उच्चारण कर रहे हैं; हे श्री वेंकटाचलपते, आपको शुभ प्रभात हो!' },

  { slug: 'venkateswara-suprabhatam', stanza: '16', lang: 'te', text: 'శివుడు, దేవేంద్రుడు, అగ్ని, యమ, రక్షో-నాయకుడు, వరుణ, వాయువు, ధనాధిపతి కుబేరుడు, వీరందరూ చేతులు జోడించి, మస్తకములు వంచి, మీ సేవలో నిష్ఠతో నిల్చియున్నారు; ఓ శ్రీ వేంకటాచలపతీ, నీకు శుభ ప్రభాతమగుగాత!' },
  { slug: 'venkateswara-suprabhatam', stanza: '16', lang: 'ta', text: 'சிவன், தேவர்களின் ராஜா, அக்னி, யமன், ராட்சசர்களின் காவலன், வருணன், வாயு மற்றும் செல்வத்தின் அதிபதி குபேரன், இவர்கள் அனைவரும் கைகளை கூப்பி, தலை வணங்கி, உமது சேவையில் ஈடுபட்டு நிற்கின்றனர்; ஓ ஸ்ரீ வேங்கடாசலபதியே, உமக்கு நல்ல விடியல் ஆகட்டும்!' },
  { slug: 'venkateswara-suprabhatam', stanza: '16', lang: 'hi', text: 'शिव, देवराज इंद्र, अग्नि, यम, रक्षसों के नायक, वरुण, वायु और धनाधिपति कुबेर, ये सभी हाथ जोड़कर, मस्तक झुकाए आपकी सेवा में तत्पर खड़े हैं; हे श्री वेंकटाचलपते, आपको शुभ प्रभात हो!' },

  { slug: 'venkateswara-suprabhatam', stanza: '18', lang: 'te', text: 'దేవ సభలో ప్రముఖులైన సూర్య, చంద్ర, అంగారక, బుధ, బృహస్పతి, శుక్ర, శని, రాహు, కేతువులు మీ సేవకుల సేవకుల అంతిమ సేవకులే; ఓ శ్రీ వేంకటాచలపతీ, నీకు శుభ ప్రభాతమగుగాత!' },
  { slug: 'venkateswara-suprabhatam', stanza: '18', lang: 'ta', text: 'தேவர்களின் சபையின் தலைவர்களான சூரியன், சந்திரன், செவ்வாய், புதன், குரு, சுக்கிரன், சனி, ராகு, கேது ஆகியோர் உமது தொண்டர்களின் தொண்டர்களுக்கு கடைசி வரை சேவகர்களே ஆவர்; ஓ ஸ்ரீ வேங்கடாசலபதியே, உமக்கு நல்ல விடியல் ஆகட்டும்!' },
  { slug: 'venkateswara-suprabhatam', stanza: '18', lang: 'hi', text: 'देव-सभा के प्रमुख सूर्य, चंद्र, भौम, बुध, बृहस्पति, शुक्र, शनि, राहु और केतु आपके दासों के दास के अंतिम दास मात्र हैं; हे श्री वेंकटाचलपते, आपको शुभ प्रभात हो!' },

  { slug: 'venkateswara-suprabhatam', stanza: '19', lang: 'te', text: 'నీ పాద ధూళిచే కప్పబడి ప్రకాశించే మస్తకాలు కలిగి, స్వర్గాపవర్గాలపై కూడా అనాసక్తమైన అంతరంగాలు కల వారు, కల్పాగమ గణనలోనే వ్యాకులపడుచున్నారు, నీపై ఆ ప్రేమ ఎంతటి తీవ్రమైనదో అన్నట్లుగా; ఓ శ్రీ వేంకటాచలపతీ, నీకు శుభ ప్రభాతమగుగాత!' },
  { slug: 'venkateswara-suprabhatam', stanza: '19', lang: 'ta', text: 'உமது திருவடித் துகளால் நிரம்பி ஒளிர்வோரும், சொர்க்கம் மோட்சங்களிலும் நாட்டமற்ற அகத்தினரும், வெறும் கல்பாரம்ப கணக்கிலேயே ஆர்வத்தால் தவிக்கின்றனர், உம்மீதான அவ்வன்பு எவ்வளவு ஆழமானது என்பதைக் காட்டுவது போல; ஓ ஸ்ரீ வேங்கடாசலபதியே, உமக்கு நல்ல விடியல் ஆகட்டும்!' },
  { slug: 'venkateswara-suprabhatam', stanza: '19', lang: 'hi', text: 'आपके चरण-धूलि से भरे दीप्तिमान मस्तक वाले, स्वर्ग और मोक्ष में भी अनासक्त अंतःकरण वाले जन, केवल कल्पागम की गणना से ही व्याकुल हो उठते हैं, यह दिखाता है कि आपके प्रति उनकी अभिलाषा कितनी तीव्र है; हे श्री वेंकटाचलपते, आपको शुभ प्रभात हो!' },
];

console.log(`Group D em-dash fix: ${UPDATES.length} cell updates queued across ${new Set(UPDATES.map(u => u.slug)).size} stotras.`);
console.log(WRITE ? '*** WRITE MODE ***' : '--- DRY RUN (pass --write to apply) ---');

const { headers, rows, col } = await getTabWithHeaders('shloka_stanzas');
const slugCol = col('shloka_slug');
const stanzaCol = col('stanza_number');
const langColMap = {
  en: col('meaning_en'),
  te: col('meaning_te'),
  ta: col('meaning_ta'),
  hi: col('meaning_hi'),
};

let sheets = null;
if (WRITE) sheets = await getSheetsClient();

const summary = {};
let applied = 0;
let skippedNoDash = 0;
let notFound = 0;

for (const u of UPDATES) {
  summary[u.slug] = summary[u.slug] || { changed: 0, skipped: 0 };
  const rowIdx = rows.findIndex(r => r[slugCol] === u.slug && r[stanzaCol] === u.stanza);
  if (rowIdx === -1) {
    console.log(`\n[NOT FOUND] ${u.slug} stanza ${u.stanza} lang ${u.lang} — no matching row in sheet`);
    notFound++;
    summary[u.slug].skipped++;
    continue;
  }
  const sheetRowNumber = rowIdx + 2; // +1 header, +1 to convert 0-index to 1-index
  const colIdx = langColMap[u.lang];
  const oldText = rows[rowIdx][colIdx] || '';

  if (!oldText.includes('—') && u.text.includes('—')) {
    console.log(`\n[WARN] ${u.slug} stanza ${u.stanza} lang ${u.lang} — replacement text still contains em-dash!`);
  }

  console.log(`\n--- ${u.slug} | stanza ${u.stanza} | meaning_${u.lang} | row ${sheetRowNumber} ---`);
  console.log('OLD:', oldText);
  console.log('NEW:', u.text);

  if (!oldText.includes('—')) {
    console.log('(note: source cell had no em-dash at fetch time — may already be edited, or slug/stanza mismatch; skipping write)');
    skippedNoDash++;
    summary[u.slug].skipped++;
    continue;
  }

  summary[u.slug].changed++;
  applied++;

  if (WRITE) {
    const range = `shloka_stanzas!${colLetter(colIdx)}${sheetRowNumber}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [[u.text]] },
    });
  }
}

console.log('\n=== SUMMARY ===');
for (const [slug, s] of Object.entries(summary)) {
  console.log(`${slug}: ${s.changed} changed, ${s.skipped} skipped`);
}
console.log(`TOTAL: ${applied} cells ${WRITE ? 'written' : 'would be written'}, ${skippedNoDash} skipped (no dash found), ${notFound} not found.`);
