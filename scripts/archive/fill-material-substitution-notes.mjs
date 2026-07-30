/**
 * One-off: fill substitution_note_{en,te,ta,hi} for material_items rows that
 * currently have substitution_note_en empty, where a genuinely common
 * substitute exists in Hindu puja practice. Rows with no sensible substitute
 * (deity idols already offering "or image", core symbolic items like
 * coconut/milk/bilva leaves, decorative-only items) are deliberately left
 * empty and logged as skipped.
 *
 * Dry-run by default; pass --write to apply.
 */
import { getTabWithHeaders, getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

// Canonical notes, reused across rows that share the same real-world substitute.
const NOTES = {
  N1: {
    en: "If a clay idol isn't available, a metal or paper-mache idol can be used, but avoid immersing non-biodegradable materials in water.",
    te: 'మట్టి విగ్రహం అందుబాటులో లేకపోతే లోహపు లేదా పేపర్-మేషే విగ్రహాన్ని వాడవచ్చు, కానీ కరగని పదార్థాలను నీటిలో నిమజ్జనం చేయకండి.',
    ta: 'களிமண் சிலை கிடைக்காவிட்டால் உலோகம் அல்லது காகித மாவுச் சிலையை பயன்படுத்தலாம், ஆனால் மக்காத பொருட்களை நீரில் நிமிர்த்த வேண்டாம்.',
    hi: 'अगर मिट्टी की मूर्ति उपलब्ध न हो तो धातु या पेपर-माशे की मूर्ति का उपयोग किया जा सकता है, लेकिन न घुलने वाली सामग्री को पानी में विसर्जित न करें।',
  },
  N2: {
    en: 'Can be substituted with red roses or any other red flowers if unavailable.',
    te: 'అందుబాటులో లేకపోతే ఎర్ర గులాబీలు లేదా ఇతర ఎర్ర పువ్వులతో భర్తీ చేయవచ్చు.',
    ta: 'கிடைக்காவிட்டால் சிவப்பு ரோஜாக்கள் அல்லது வேறு சிவப்பு பூக்களால் மாற்றிக்கொள்ளலாம்.',
    hi: 'उपलब्ध न होने पर लाल गुलाब या किसी अन्य लाल फूल से बदला जा सकता है।',
  },
  N3: {
    en: "Fresh green grass blades can be used if durva grass isn't available.",
    te: 'దూర్వ గడ్డి అందుబాటులో లేకపోతే తాజా పచ్చి గడ్డి రెబ్బలను వాడవచ్చు.',
    ta: 'அருகம்புல் கிடைக்காவிட்டால் புதிய பச்சை புல் தளிர்களை பயன்படுத்தலாம்.',
    hi: 'दूर्वा घास उपलब्ध न हो तो ताज़ी हरी घास की पत्तियों का उपयोग किया जा सकता है।',
  },
  N4: {
    en: "Can be substituted with laddu or any other sweet if modak isn't available.",
    te: 'మోదకం అందుబాటులో లేకపోతే లడ్డూ లేదా ఇతర తీపి పదార్థంతో భర్తీ చేయవచ్చు.',
    ta: 'மோதகம் கிடைக்காவிட்டால் லட்டு அல்லது வேறு இனிப்புடன் மாற்றிக்கொள்ளலாம்.',
    hi: 'मोदक उपलब्ध न होने पर लड्डू या किसी अन्य मिठाई से बदला जा सकता है।',
  },
  N5: {
    en: "Dhoop or sambrani (resin incense) can be used if incense sticks aren't available.",
    te: 'అగరవత్తులు అందుబాటులో లేకపోతే ధూపం లేదా సాంబ్రాణి వాడవచ్చు.',
    ta: 'ஊதுவத்திகள் கிடைக்காவிட்டால் தூபம் அல்லது சாம்பிராணி பயன்படுத்தலாம்.',
    hi: 'अगरबत्ती उपलब्ध न होने पर धूप या सांबरानी का उपयोग किया जा सकता है।',
  },
  N6: {
    en: "A ghee lamp flame can be used for aarti if camphor isn't available.",
    te: 'కర్పూరం అందుబాటులో లేకపోతే హారతికి నెయ్యి దీపం మంటను వాడవచ్చు.',
    ta: 'கற்பூரம் கிடைக்காவிட்டால் ஆரத்திக்கு நெய் விளக்கு சுடரைப் பயன்படுத்தலாம்.',
    hi: 'कपूर उपलब्ध न होने पर आरती के लिए घी के दीये की लौ का उपयोग किया जा सकता है।',
  },
  N7: {
    en: 'Sindoor can be used interchangeably with kumkum if unavailable.',
    te: 'కుంకుమ అందుబాటులో లేకపోతే సిందూరాన్ని బదులుగా వాడవచ్చు.',
    ta: 'குங்குமம் கிடைக்காவிட்டால் சிந்தூரத்தை மாற்றாகப் பயன்படுத்தலாம்.',
    hi: 'कुमकुम उपलब्ध न होने पर सिंदूर का उपयोग किया जा सकता है।',
  },
  N8: {
    en: 'If one ingredient is missing, panchamrit can still be prepared with the remaining ones.',
    te: 'ఒక పదార్థం లేకపోయినా మిగిలిన వాటితో పంచామృతం తయారు చేయవచ్చు.',
    ta: 'ஒரு பொருள் இல்லாவிட்டாலும் மீதமுள்ளவற்றுடன் பஞ்சாமிர்தம் தயாரிக்கலாம்.',
    hi: 'एक सामग्री न होने पर भी शेष सामग्रियों से पंचामृत तैयार किया जा सकता है।',
  },
  N9: {
    en: "A steel or brass plate can be used if a banana leaf isn't available.",
    te: 'అరటి ఆకు అందుబాటులో లేకపోతే స్టీలు లేదా ఇత్తడి పళ్ళెం వాడవచ్చు.',
    ta: 'வாழை இலை கிடைக்காவிட்டால் ஸ்டீல் அல்லது பித்தளை தட்டைப் பயன்படுத்தலாம்.',
    hi: 'केले का पत्ता उपलब्ध न होने पर स्टील या पीतल की थाली का उपयोग किया जा सकता है।',
  },
  N10: {
    en: 'Sesame or any vegetable oil can be used in place of ghee for the lamp.',
    te: 'నెయ్యి అందుబాటులో లేకపోతే దీపం కోసం నువ్వుల నూనె లేదా ఏదైనా వంట నూనె వాడవచ్చు.',
    ta: 'நெய் கிடைக்காவிட்டால் விளக்கிற்கு எள்ணெய் அல்லது வேறு சமையல் எண்ணெயைப் பயன்படுத்தலாம்.',
    hi: 'घी उपलब्ध न होने पर दीये के लिए तिल या किसी भी खाद्य तेल का उपयोग किया जा सकता है।',
  },
  N11: {
    en: "Any other light-colored seasonal flower can be substituted if the specific white flower isn't available.",
    te: 'నిర్దిష్ట తెల్ల పువ్వు అందుబాటులో లేకపోతే ఇతర లేత రంగు కాలానుగుణ పువ్వులతో భర్తీ చేయవచ్చు.',
    ta: 'குறிப்பிட்ட வெள்ளை பூ கிடைக்காவிட்டால் வேறு வெளிர் நிற பருவகால பூக்களால் மாற்றலாம்.',
    hi: 'विशेष सफेद फूल उपलब्ध न होने पर किसी अन्य हल्के रंग के मौसमी फूल से बदला जा सकता है।',
  },
  N12: {
    en: "A plain thread or wooden bead mala can be used if a rudraksha mala isn't available.",
    te: 'రుద్రాక్ష మాల అందుబాటులో లేకపోతే సాధారణ దారం లేదా చెక్క పూసల మాలను వాడవచ్చు.',
    ta: 'உருத்திராட்ச மாலை கிடைக்காவிட்டால் சாதாரண நூல் அல்லது மரப்பூண் மாலையை பயன்படுத்தலாம்.',
    hi: 'रुद्राक्ष माला उपलब्ध न होने पर साधारण धागे या लकड़ी के मनकों की माला का उपयोग किया जा सकता है।',
  },
  N13: {
    en: "A steel or clay pot can be used if a copper or brass kalash isn't available.",
    te: 'రాగి లేదా ఇత్తడి కలశం అందుబాటులో లేకపోతే స్టీలు లేదా మట్టి కుండను వాడవచ్చు.',
    ta: 'செம்பு அல்லது பித்தளை கலசம் கிடைக்காவிட்டால் ஸ்டீல் அல்லது மண் பானையை பயன்படுத்தலாம்.',
    hi: 'तांबे या पीतल का कलश उपलब्ध न होने पर स्टील या मिट्टी के बर्तन का उपयोग किया जा सकता है।',
  },
  N14: {
    en: "Leaves from other auspicious trees like ashoka or banyan can be substituted if mango leaves aren't available.",
    te: 'మామిడి ఆకులు అందుబాటులో లేకపోతే అశోక లేదా మర్రి వంటి శుభకరమైన చెట్ల ఆకులతో భర్తీ చేయవచ్చు.',
    ta: 'மாவிலை கிடைக்காவிட்டால் அசோகம் அல்லது ஆலமரம் போன்ற சுப மரங்களின் இலைகளால் மாற்றலாம்.',
    hi: 'आम के पत्ते उपलब्ध न होने पर अशोक या बरगद जैसे शुभ वृक्षों के पत्तों से बदला जा सकता है।',
  },
  N16: {
    en: "A regular oil lamp kept continuously lit can be used if a dedicated akhand jyoti lamp isn't available.",
    te: 'ప్రత్యేక అఖండ జ్యోతి దీపం అందుబాటులో లేకపోతే నిరంతరం వెలిగించే సాధారణ నూనె దీపాన్ని వాడవచ్చు.',
    ta: 'தனி அகண்ட ஜோதி விளக்கு கிடைக்காவிட்டால் தொடர்ந்து எரியும் சாதாரண எண்ணெய் விளக்கைப் பயன்படுத்தலாம்.',
    hi: 'विशेष अखंड ज्योति दीपक उपलब्ध न होने पर लगातार जलते रहने वाले साधारण तेल के दीये का उपयोग किया जा सकता है।',
  },
  N17: {
    en: 'Any locally available lentil or legume can be substituted for the specified variety.',
    te: 'నిర్దిష్ట రకం అందుబాటులో లేకపోతే స్థానికంగా లభించే ఏదైనా పప్పుధాన్యంతో భర్తీ చేయవచ్చు.',
    ta: 'குறிப்பிட்ட வகை கிடைக்காவிட்டால் உள்ளூரில் கிடைக்கும் எந்த பருப்பு வகையையும் பயன்படுத்தலாம்.',
    hi: 'निर्दिष्ट किस्म उपलब्ध न होने पर स्थानीय रूप से उपलब्ध किसी भी दाल का उपयोग किया जा सकता है।',
  },
  N18: {
    en: "Electric or battery-operated diyas can be used if oil lamps aren't available.",
    te: 'నూనె దీపాలు అందుబాటులో లేకపోతే విద్యుత్ లేదా బ్యాటరీతో పనిచేసే దీపాలను వాడవచ్చు.',
    ta: 'எண்ணெய் விளக்குகள் கிடைக்காவிட்டால் மின்சார அல்லது பேட்டரி இயங்கும் தீபங்களைப் பயன்படுத்தலாம்.',
    hi: 'तेल के दीये उपलब्ध न होने पर बिजली या बैटरी से चलने वाले दीयों का उपयोग किया जा सकता है।',
  },
  N19: {
    en: "A framed picture of Goddess Lakshmi can be used if an idol isn't available.",
    te: 'విగ్రహం అందుబాటులో లేకపోతే లక్ష్మీదేవి ఫ్రేమ్ చేసిన చిత్రపటాన్ని వాడవచ్చు.',
    ta: 'சிலை கிடைக்காவிட்டால் லட்சுமி தேவியின் சட்டமிடப்பட்ட படத்தைப் பயன்படுத்தலாம்.',
    hi: 'मूर्ति उपलब्ध न होने पर देवी लक्ष्मी की फ्रेम की हुई तस्वीर का उपयोग किया जा सकता है।',
  },
  N20: {
    en: "Any pink or white flower can be substituted if lotus flowers aren't available.",
    te: 'తామర పువ్వులు అందుబాటులో లేకపోతే గులాబీ లేదా తెల్ల రంగు పువ్వులతో భర్తీ చేయవచ్చు.',
    ta: 'தாமரை பூக்கள் கிடைக்காவிட்டால் இளஞ்சிவப்பு அல்லது வெள்ளை பூக்களால் மாற்றலாம்.',
    hi: 'कमल के फूल उपलब्ध न होने पर गुलाबी या सफेद फूल से बदला जा सकता है।',
  },
  N21: {
    en: 'Flower petals or colored rice can be used in place of rangoli colors.',
    te: 'రంగోలి రంగుల బదులు పూల రేకులు లేదా రంగు వేసిన బియ్యాన్ని వాడవచ్చు.',
    ta: 'ரங்கோலி வண்ணங்களுக்குப் பதிலாக பூ இதழ்கள் அல்லது வண்ணமிடப்பட்ட அரிசியைப் பயன்படுத்தலாம்.',
    hi: 'रंगोली के रंगों की जगह फूलों की पंखुड़ियों या रंगे हुए चावल का उपयोग किया जा सकता है।',
  },
  N22: {
    en: 'Any yellow flower such as marigold can be substituted.',
    te: 'బంతి వంటి ఏదైనా పసుపు రంగు పువ్వుతో భర్తీ చేయవచ్చు.',
    ta: 'செண்டு போன்ற எந்த மஞ்சள் நிற பூவையும் மாற்றாகப் பயன்படுத்தலாம்.',
    hi: 'गेंदे जैसे किसी भी पीले फूल से बदला जा सकता है।',
  },
  N23: {
    en: "Any saffron-colored cloth can be substituted if yellow cloth isn't available.",
    te: 'పసుపు రంగు వస్త్రం అందుబాటులో లేకపోతే కుంకుమ రంగు వస్త్రాన్ని వాడవచ్చు.',
    ta: 'மஞ்சள் நிற துணி கிடைக்காவிட்டால் குங்குமப்பூ நிற துணியைப் பயன்படுத்தலாம்.',
    hi: 'पीला वस्त्र उपलब्ध न होने पर केसरिया रंग के वस्त्र का उपयोग किया जा सकता है।',
  },
  N24: {
    en: "A plain yellow or kalava thread can be substituted if raksha doram isn't available.",
    te: 'రక్ష దారం అందుబాటులో లేకపోతే సాధారణ పసుపు దారం లేదా కళవ దారంతో భర్తీ చేయవచ్చు.',
    ta: 'ரக்ஷா தோரம் கிடைக்காவிட்டால் சாதாரண மஞ்சள் நூல் அல்லது கலவ நூலால் மாற்றலாம்.',
    hi: 'रक्षा दोरम उपलब्ध न होने पर साधारण पीले धागे या कलावा से बदला जा सकता है।',
  },
  N25: {
    en: 'Dhoop or sambrani can replace incense sticks, and a ghee lamp flame can serve in place of camphor for aarti.',
    te: 'అగరవత్తుల బదులు ధూపం లేదా సాంబ్రాణి, హారతికి కర్పూరం బదులు నెయ్యి దీపం మంటను వాడవచ్చు.',
    ta: 'ஊதுவத்திக்குப் பதிலாக தூபம் அல்லது சாம்பிராணி, ஆரத்திக்கு கற்பூரத்திற்குப் பதிலாக நெய் விளக்கு சுடரைப் பயன்படுத்தலாம்.',
    hi: 'अगरबत्ती के स्थान पर धूप या सांबरानी, और आरती के लिए कपूर के स्थान पर घी के दीये की लौ का उपयोग किया जा सकता है।',
  },
  N26: {
    en: "A brass or metal pot can be used if a clay karwa isn't available.",
    te: 'మట్టి కర్వా అందుబాటులో లేకపోతే ఇత్తడి లేదా లోహపు కుండను వాడవచ్చు.',
    ta: 'மண் கர்வா கிடைக்காவிட்டால் பித்தளை அல்லது உலோகப் பானையைப் பயன்படுத்தலாம்.',
    hi: 'मिट्टी का करवा उपलब्ध न होने पर पीतल या धातु के बर्तन का उपयोग किया जा सकता है।',
  },
  N27: {
    en: 'Dhoop or sambrani can be used in place of incense, and any oil lamp in place of a ghee lamp.',
    te: 'అగరవత్తుల బదులు ధూపం లేదా సాంబ్రాణి, నెయ్యి దీపం బదులు ఏదైనా నూనె దీపాన్ని వాడవచ్చు.',
    ta: 'தூப்பிற்குப் பதிலாக தூபம் அல்லது சாம்பிராணி, நெய் விளக்கிற்குப் பதிலாக எந்த எண்ணெய் விளக்கையும் பயன்படுத்தலாம்.',
    hi: 'धूप के स्थान पर सांबरानी, और घी के दीये के स्थान पर किसी भी तेल के दीये का उपयोग किया जा सकता है।',
  },
  N28: {
    en: "A metal idol or photograph can be used if a clay idol isn't available.",
    te: 'మట్టి విగ్రహం అందుబాటులో లేకపోతే లోహపు విగ్రహం లేదా ఫోటోను వాడవచ్చు.',
    ta: 'களிமண் சிலை கிடைக்காவிட்டால் உலோக சிலை அல்லது புகைப்படத்தைப் பயன்படுத்தலாம்.',
    hi: 'मिट्टी की मूर्ति उपलब्ध न होने पर धातु की मूर्ति या तस्वीर का उपयोग किया जा सकता है।',
  },
  N29: {
    en: "Regular oil lamps can be used if wheat-flour lamps aren't available.",
    te: 'గోధుమ పిండి దీపాలు అందుబాటులో లేకపోతే సాధారణ నూనె దీపాలను వాడవచ్చు.',
    ta: 'கோதுமை மாவு விளக்குகள் கிடைக்காவிட்டால் சாதாரண எண்ணெய் விளக்குகளைப் பயன்படுத்தலாம்.',
    hi: 'गेहूं के आटे के दीये उपलब्ध न होने पर साधारण तेल के दीयों का उपयोग किया जा सकता है।',
  },
  N30: {
    en: "Any clean coin can be used if a gold or silver one isn't available.",
    te: 'బంగారు లేదా వెండి నాణెం అందుబాటులో లేకపోతే శుభ్రమైన ఏదైనా నాణెం వాడవచ్చు.',
    ta: 'தங்கம் அல்லது வெள்ளி நாணயம் கிடைக்காவிட்டால் சுத்தமான எந்த நாணயத்தையும் பயன்படுத்தலாம்.',
    hi: 'सोने या चांदी का सिक्का उपलब्ध न होने पर कोई भी साफ सिक्का उपयोग किया जा सकता है।',
  },
  N31: {
    en: "A framed picture of Murugan with the Vel can be used if an idol isn't available.",
    te: 'విగ్రహం అందుబాటులో లేకపోతే వేలుతో ఉన్న మురుగన్ ఫ్రేమ్ చిత్రపటాన్ని వాడవచ్చు.',
    ta: 'சிலை கிடைக்காவிட்டால் வேலுடன் கூடிய முருகனின் சட்டமிடப்பட்ட படத்தைப் பயன்படுத்தலாம்.',
    hi: 'मूर्ति उपलब्ध न होने पर वेल सहित मुरुगन की फ्रेम की हुई तस्वीर का उपयोग किया जा सकता है।',
  },
  N32: {
    en: 'Any winnowing tray or large steel plate can be substituted.',
    te: 'వెదురు చేట అందుబాటులో లేకపోతే ఏదైనా చేట లేదా పెద్ద స్టీలు పళ్ళెంతో భర్తీ చేయవచ్చు.',
    ta: 'மூங்கில் சூப் கிடைக்காவிட்டால் எந்த முறம் அல்லது பெரிய ஸ்டீல் தட்டையும் பயன்படுத்தலாம்.',
    hi: 'बांस का सूप उपलब्ध न होने पर कोई भी सूप या बड़ी स्टील की थाली का उपयोग किया जा सकता है।',
  },
  N33: {
    en: "A steel or copper vessel can be used if a brass lota isn't available.",
    te: 'ఇత్తడి లోటా అందుబాటులో లేకపోతే స్టీలు లేదా రాగి పాత్రను వాడవచ్చు.',
    ta: 'பித்தளை லோட்டா கிடைக்காவிட்டால் ஸ்டீல் அல்லது செம்பு பாத்திரத்தைப் பயன்படுத்தலாம்.',
    hi: 'पीतल का लोटा उपलब्ध न होने पर स्टील या तांबे के बर्तन का उपयोग किया जा सकता है।',
  },
  N34: {
    en: "Any clean wooden stool or plank can be used if a proper peetham isn't available.",
    te: 'సరైన పీఠం అందుబాటులో లేకపోతే శుభ్రమైన ఏదైనా చెక్క పీట లేదా పలకను వాడవచ్చు.',
    ta: 'சரியான பீடம் கிடைக்காவிட்டால் சுத்தமான மரப் பலகை அல்லது தூக்கு பீடத்தைப் பயன்படுத்தலாம்.',
    hi: 'उचित पीठम उपलब्ध न होने पर कोई भी साफ लकड़ी की चौकी या तख्ती का उपयोग किया जा सकता है।',
  },
  N35: {
    en: "Can be made at home by mixing raw rice with a little turmeric if ready-made akshata isn't available.",
    te: 'సిద్ధంగా ఉన్న అక్షతలు అందుబాటులో లేకపోతే బియ్యానికి కొద్దిగా పసుపు కలిపి ఇంట్లోనే తయారు చేసుకోవచ్చు.',
    ta: 'தயார் அக்ஷதை கிடைக்காவிட்டால் அரிசியுடன் சிறிது மஞ்சளைக் கலந்து வீட்டிலேயே தயாரிக்கலாம்.',
    hi: 'तैयार अक्षत उपलब्ध न होने पर कच्चे चावल में थोड़ी हल्दी मिलाकर घर पर बनाया जा सकता है।',
  },
  N37: {
    en: "A plain red or yellow cotton thread can be used if kalava/mauli isn't available.",
    te: 'కళవ/మౌళి అందుబాటులో లేకపోతే సాధారణ ఎర్ర లేదా పసుపు రంగు దారాన్ని వాడవచ్చు.',
    ta: 'கலவா/மௌலி கிடைக்காவிட்டால் சாதாரண சிவப்பு அல்லது மஞ்சள் பருத்தி நூலைப் பயன்படுத்தலாம்.',
    hi: 'कलावा/मौली उपलब्ध न होने पर साधारण लाल या पीले सूती धागे का उपयोग किया जा सकता है।',
  },
};
// N15 reuses N2 (red flower substitute), N36 reuses N25 (combined incense+camphor note)
NOTES.N15 = NOTES.N2;
NOTES.N36 = NOTES.N25;

// Decisions keyed by `${group_slug}:${item_order}`. Value is a NOTES key (fill)
// or a string skip reason (leave empty, logged for review).
const DECISIONS = {
  'ganesh-chaturthi:1': 'N1',
  'ganesh-chaturthi:2': 'N2',
  'ganesh-chaturthi:3': 'N3',
  'ganesh-chaturthi:4': 'N4',
  'ganesh-chaturthi:5': 'no substitute — coconut is a core symbolic offering',
  'ganesh-chaturthi:6': 'N5',
  'ganesh-chaturthi:7': 'N6',
  'ganesh-chaturthi:8': 'no substitute — turmeric has no common replacement',
  'ganesh-chaturthi:9': 'N7',
  'ganesh-chaturthi:10': 'N8',
  'ganesh-chaturthi:11': 'N9',
  'ganesh-chaturthi:12': 'N3',

  'maha-shivaratri:1': 'no substitute — bilva leaves are irreplaceable for Shiva puja',
  'maha-shivaratri:2': 'no substitute — milk used directly for abhishekam',
  'maha-shivaratri:3': 'no substitute — curd used directly for abhishekam',
  'maha-shivaratri:4': 'no substitute — honey used directly for abhishekam',
  'maha-shivaratri:5': 'no substitute — ghee used directly for abhishekam',
  'maha-shivaratri:6': 'no substitute — plain sugar, no known replacement',
  'maha-shivaratri:7': 'N11',
  'maha-shivaratri:8': 'no substitute — sacred ash specific to Shiva worship',
  'maha-shivaratri:9': 'N5',
  'maha-shivaratri:11': 'N12',

  'navaratri:1': "already flexible — item lists idol or image as alternatives",
  'navaratri:2': 'N13',
  'navaratri:3': 'no substitute — coconut is a core symbolic offering',
  'navaratri:4': 'N14',
  'navaratri:5': 'N15',
  'navaratri:6': 'N7',
  'navaratri:7': 'no substitute — turmeric has no common replacement',
  'navaratri:8': 'N5',
  'navaratri:9': 'N16',
  'navaratri:10': 'N17',
  'navaratri:11': 'no substitute — decorative dolls specific to Golu display',

  'diwali:1': 'N18',
  'diwali:2': "already flexible — item already lists oil or ghee as alternatives",
  'diwali:3': 'N19',
  'diwali:4': 'N20',
  'diwali:5': 'N21',
  'diwali:6': 'no substitute — "sweets" is already a generic term',
  'diwali:7': 'N5',
  'diwali:8': 'no substitute — "dry fruits" is already a generic assortment',
  'diwali:9': 'no substitute — safety/legality varies by region, out of scope',

  'satyanarayana-vratham:1': "already flexible — item lists idol or image as alternatives",
  'satyanarayana-vratham:2': 'no substitute — tulsi leaves are specific to Vishnu worship',
  'satyanarayana-vratham:3': 'no substitute — milk used directly for panchamrit/abhishekam',
  'satyanarayana-vratham:4': 'no substitute — curd used directly for panchamrit',
  'satyanarayana-vratham:5': 'no substitute — honey used directly for panchamrit',
  'satyanarayana-vratham:6': 'no substitute — ghee used directly for panchamrit',
  'satyanarayana-vratham:9': 'no substitute — coconut is a core symbolic offering',
  'satyanarayana-vratham:10': 'N22',
  'satyanarayana-vratham:11': 'no substitute — pancha phala is a fixed fruit set',
  'satyanarayana-vratham:12': 'N5',
  'satyanarayana-vratham:13': 'N6',
  'satyanarayana-vratham:14': 'no substitute — no common replacement for betel leaves/areca nuts',
  'satyanarayana-vratham:15': 'N23',
  'satyanarayana-vratham:16': 'N7',

  'varalakshmi-vratham:1': "already flexible — item lists idol or image as alternatives",
  'varalakshmi-vratham:2': "already flexible — item already lists brass or copper as alternatives",
  'varalakshmi-vratham:3': 'no substitute — coconut is a core symbolic offering',
  'varalakshmi-vratham:4': 'N14',
  'varalakshmi-vratham:5': 'N7',
  'varalakshmi-vratham:6': 'no substitute — turmeric has no common replacement',
  'varalakshmi-vratham:7': 'no substitute — glass bangles are a specific ritual item',
  'varalakshmi-vratham:8': "already flexible — item already lists yellow/marigold as alternatives",
  'varalakshmi-vratham:9': 'N24',
  'varalakshmi-vratham:10': 'no substitute — "assorted fruits" is already a generic term',
  'varalakshmi-vratham:11': "already flexible — item already lists sweet pongal or payasam as alternatives",
  'varalakshmi-vratham:12': 'N25',
  'varalakshmi-vratham:13': 'no substitute — blouse piece is a specific ritual offering to the Goddess',

  'ekadashi-vratham:1': "already flexible — item lists idol or image as alternatives",
  'ekadashi-vratham:3': 'N22',
  'ekadashi-vratham:4': 'no substitute — "non-grain prasad fruits" is already a generic term',
  'ekadashi-vratham:5': 'no substitute — milk used directly as an offering',
  'ekadashi-vratham:6': 'N25',
  'ekadashi-vratham:7': "already flexible — item already lists sabudana/amaranth as alternatives",

  'pradosha-vratham:1': 'no substitute — bilva leaves are irreplaceable for Shiva puja',
  'pradosha-vratham:2': 'no substitute — milk used directly for abhishekam',
  'pradosha-vratham:3': 'no substitute — honey used directly for abhishekam',
  'pradosha-vratham:4': 'no substitute — ghee used directly for abhishekam',
  'pradosha-vratham:5': 'no substitute — sacred ash specific to Shiva worship',
  'pradosha-vratham:6': 'N11',
  'pradosha-vratham:7': 'N25',

  'mondays-shiva-vratham:1': "already flexible — item lists idol or image as alternatives",
  'mondays-shiva-vratham:2': 'no substitute — bilva leaves are irreplaceable for Shiva puja',
  'mondays-shiva-vratham:3': 'no substitute — milk used directly for abhishekam',
  'mondays-shiva-vratham:4': 'N11',
  'mondays-shiva-vratham:5': 'no substitute — sacred ash specific to Shiva worship',
  'mondays-shiva-vratham:6': 'N25',
  'mondays-shiva-vratham:7': 'N12',

  'karwa-chauth:1': 'N26',
  'karwa-chauth:3': 'no substitute — puja thali with diya is a fixed ritual kit',
  'karwa-chauth:4': 'no substitute — sargi is a specific pre-dawn meal tradition',
  'karwa-chauth:5': 'no substitute — henna and bangles are specific ritual items',
  'karwa-chauth:6': "already flexible — item already lists mathri/fenia as alternatives",

  'santoshi-mata:1': "already flexible — item lists image or idol as alternatives",
  'santoshi-mata:4': 'N27',

  'kedareswara-vratham:1': "already flexible — item already lists clay or metal as alternatives",
  'kedareswara-vratham:2': 'no substitute — bilva leaves are irreplaceable for Shiva puja',
  'kedareswara-vratham:3': 'no substitute — milk, honey, ghee used directly for abhishekam',
  'kedareswara-vratham:4': 'no substitute — sacred ash specific to Shiva worship',

  'mangala-gauri-vratham:1': 'N28',
  'mangala-gauri-vratham:2': 'N29',
  'mangala-gauri-vratham:3': 'no substitute — fixed ritual kit (kumkum, bangles, mirror, comb)',
  'mangala-gauri-vratham:4': "already flexible — item already says red preferred, implying other colors acceptable",

  'hartalika-teej:1': "already flexible — item already lists river sand or natural clay as alternatives",
  'hartalika-teej:2': "already flexible — item already lists banana or sugarcane stalks as alternatives",
  'hartalika-teej:3': 'no substitute — bridal kit is a specific set of ritual items',
  'hartalika-teej:4': 'no substitute — bilva leaves and dhatura are specific to Shiva worship',

  'vaibhav-lakshmi-vrat:1': "already flexible — item already lists yantra or picture as alternatives",
  'vaibhav-lakshmi-vrat:2': 'N13',
  'vaibhav-lakshmi-vrat:3': 'N30',
  'vaibhav-lakshmi-vrat:4': 'no substitute — plain rice, no known replacement needed',
  'vaibhav-lakshmi-vrat:5': 'N2',
  'vaibhav-lakshmi-vrat:6': 'no substitute — kheer is already a flexible dessert offering',

  'skanda-sashti-vratham:1': 'N31',
  'skanda-sashti-vratham:2': 'no substitute — brass Vel is a specific ritual item',
  'skanda-sashti-vratham:3': 'N8',
  'skanda-sashti-vratham:4': 'no substitute — fixed count (108) specific to the ritual',
  'skanda-sashti-vratham:5': 'N2',
  'skanda-sashti-vratham:6': 'no substitute — devotional text, not a physical material',

  'chhath-puja:1': 'N32',
  'chhath-puja:3': 'no substitute — sugarcane stalks are specific to Chhath Puja',
  'chhath-puja:4': 'no substitute — coconut is a core symbolic offering',
  'chhath-puja:5': 'N33',

  'sankashti-chaturthi-vratham:1': 'no substitute — trunk direction is a devotional preference, not a material substitute',
  'sankashti-chaturthi-vratham:3': 'N4',

  'savitri-vratham:1': 'no substitute — kachha soot thread is a specific ritual item',
  'savitri-vratham:2': 'no substitute — "soaked chickpeas" is already a specific prasad item',
  'savitri-vratham:3': 'no substitute — "seasonal fruits" is already a generic term',
  'savitri-vratham:4': 'no substitute — vermilion and turmeric have no common replacement',
  'savitri-vratham:5': 'no substitute — specific devotional image, not a generic idol/photo swap',

  'dhanurmasa-vratam:1': "already flexible — item lists idol or photo as alternatives",
  'dhanurmasa-vratam:2': 'N34',
  'dhanurmasa-vratam:3': 'N22',
  'dhanurmasa-vratam:4': 'no substitute — tulasi leaves are specific to Vishnu/Krishna worship',
  'dhanurmasa-vratam:5': 'N7',
  'dhanurmasa-vratam:6': 'no substitute — sandalwood paste has no common replacement',
  'dhanurmasa-vratam:7': 'no substitute — coconut is a core symbolic offering',
  'dhanurmasa-vratam:8': 'no substitute — "bananas and fresh fruits" is already a generic term',
  'dhanurmasa-vratam:9': 'no substitute — no common replacement for betel leaves/nuts',
  'dhanurmasa-vratam:10': 'N35',
  'dhanurmasa-vratam:11': 'N36',
  'dhanurmasa-vratam:12': 'N10',
  'dhanurmasa-vratam:13': "already flexible — item already lists pongal or semolina prasadam as alternatives",
  'dhanurmasa-vratam:14': "already flexible — item already lists brass or copper as alternatives",

  'satyanarayana-puja:1': "already flexible — item lists idol or image as alternatives",
  'satyanarayana-puja:3': 'no substitute — "bananas" is already a generic term',
  'satyanarayana-puja:4': 'no substitute — coconut is a core symbolic offering',
  'satyanarayana-puja:5': 'N8',
  'satyanarayana-puja:8': 'N7',
  'satyanarayana-puja:9': 'no substitute — no common replacement for betel leaves/areca nuts',
  'satyanarayana-puja:10': 'N6',
  'satyanarayana-puja:11': 'N5',
  'satyanarayana-puja:12': 'N37',

  'vinayaka-puja:1': "already flexible — item already lists clay or brass as alternatives",
  'vinayaka-puja:5': 'no substitute — coconut is a core symbolic offering',
  'vinayaka-puja:6': "already flexible — item already lists yellow or red as alternatives",
  'vinayaka-puja:7': 'N7',
  'vinayaka-puja:8': 'N6',
  'vinayaka-puja:9': 'N5',
  'vinayaka-puja:10': 'no substitute — no common replacement for betel leaves/areca nuts',

  'lakshmi-puja:1': "already flexible — item lists idol or image as alternatives",
  'lakshmi-puja:2': "already flexible — item already lists pink/white flowers as alternatives",
  'lakshmi-puja:4': 'no substitute — turmeric has no common replacement',
  'lakshmi-puja:6': 'no substitute — plain white rice, no known replacement needed',
  'lakshmi-puja:7': 'no substitute — coconut is a core symbolic offering',
  'lakshmi-puja:8': 'N6',
  'lakshmi-puja:9': 'N5',
  'lakshmi-puja:10': 'N18',
  'lakshmi-puja:11': 'no substitute — no common replacement for betel leaves/areca nuts',

  'saraswati-puja:1': "already flexible — item lists idol or image as alternatives",
  'saraswati-puja:2': 'no substitute — specific devotional books/texts, not interchangeable',
  'saraswati-puja:4': 'no substitute — plain altar cloth, no known replacement needed',
  'saraswati-puja:5': 'no substitute — coconut is a core symbolic offering',
  'saraswati-puja:6': 'no substitute — "fruits" is already a generic term',
  'saraswati-puja:7': 'N6',
  'saraswati-puja:8': 'N5',

  'durga-puja:1': "already flexible — item lists idol, image, or yantra as alternatives",
  'durga-puja:4': 'no substitute — turmeric powder has no common replacement',
  'durga-puja:5': 'no substitute — coconut is a core symbolic offering',
  'durga-puja:7': 'N6',
  'durga-puja:8': 'N5',
  'durga-puja:9': 'N18',
  'durga-puja:11': "already flexible — item already lists banana/apple/seasonal as alternatives",
  'durga-puja:12': 'no substitute — no common replacement for betel leaves/areca nuts',

  'daily-home-puja:1': "already flexible — item lists idol or framed image as alternatives",
  'daily-home-puja:5': 'N6',
  'daily-home-puja:6': 'N5',
  'daily-home-puja:8': 'no substitute — turmeric powder has no common replacement',
  'daily-home-puja:10': 'no substitute — coconut is a core symbolic offering',
  'daily-home-puja:11': 'no substitute — "fruits" is already a generic term',

  'hanuman-puja:1': "already flexible — item lists idol or image as alternatives",
  'hanuman-puja:6': 'no substitute — coconut is a core symbolic offering',
  'hanuman-puja:8': 'N6',
  'hanuman-puja:9': 'N5',
  'hanuman-puja:10': 'N18',
  'hanuman-puja:11': 'N7',

  'shiva-puja:4': 'N8',
  'shiva-puja:5': 'no substitute — sacred ash specific to Shiva worship',
  'shiva-puja:7': 'no substitute — coconut is a core symbolic offering',
  'shiva-puja:8': 'N6',
  'shiva-puja:9': 'N5',
  'shiva-puja:10': "already flexible — item already lists oil or ghee lamp as alternatives",
  'shiva-puja:12': "already flexible — item is already a specific fixed combo (banana and coconut pieces)",

  'subrahmanya-puja:1': "already flexible — item lists idol or image as alternatives",
  'subrahmanya-puja:4': 'no substitute — milk used directly for panchamritam abhishekam',
  'subrahmanya-puja:5': 'N8',
  'subrahmanya-puja:6': 'no substitute — coconut is a core symbolic offering',
  'subrahmanya-puja:7': 'no substitute — "banana" is already a generic term',
  'subrahmanya-puja:8': 'N7',
  'subrahmanya-puja:9': 'N6',
  'subrahmanya-puja:10': 'N5',
  'subrahmanya-puja:11': 'N18',

  'vishnu-puja:4': 'N8',
  'vishnu-puja:6': 'N6',
  'vishnu-puja:7': 'N5',
  'vishnu-puja:10': 'no substitute — coconut is a core symbolic offering',
  'vishnu-puja:12': 'no substitute — no common replacement for betel leaves/areca nuts',

  'navagraha-puja:5': 'no substitute — coconut is a core symbolic offering',
  'navagraha-puja:6': 'N7',
  'navagraha-puja:7': 'N6',
  'navagraha-puja:8': 'N5',
  'navagraha-puja:9': "already flexible — item already lists sesame or ghee as alternatives",
  'navagraha-puja:13': 'N37',

  'vastu-puja:2': 'N8',
  'vastu-puja:4': 'no substitute — coconut is a core symbolic offering',
  'vastu-puja:5': 'N7',
  'vastu-puja:9': 'N6',
  'vastu-puja:10': 'N5',
  'vastu-puja:11': 'N18',
  'vastu-puja:13': 'N37',
  'vastu-puja:15': 'no substitute — "assorted fruits" is already a generic term',

  'gauri-puja:5': 'no substitute — coconut is a core symbolic offering',
  'gauri-puja:6': 'no substitute — "assorted fruits" is already a generic term',
  'gauri-puja:8': 'N6',
  'gauri-puja:9': 'N5',
  'gauri-puja:10': 'N18',
  'gauri-puja:11': 'N14',
  'gauri-puja:14': 'N37',
  'gauri-puja:15': 'no substitute — no common replacement for betel leaves/areca nuts',

  'kubera-puja:5': 'N8',
  'kubera-puja:6': 'no substitute — sandalwood paste has no common replacement',
  'kubera-puja:7': 'N7',
  'kubera-puja:8': 'no substitute — coconut is a core symbolic offering',
  'kubera-puja:9': 'no substitute — "assorted fruits" is already a generic term',
  'kubera-puja:10': 'N6',
  'kubera-puja:11': 'N5',
  'kubera-puja:12': 'N18',
  'kubera-puja:13': "already flexible — item already lists copper or brass as alternatives",
  'kubera-puja:14': 'N37',
  'kubera-puja:15': 'no substitute — no common replacement for betel leaves/areca nuts',
};

async function main() {
  const { headers, rows, col } = await getTabWithHeaders('material_items');
  const giIdx = col('group_slug');
  const ioIdx = col('item_order');
  const enIdx = col('item_name_en');
  const subEnIdx = col('substitution_note_en');
  const subTeIdx = col('substitution_note_te');
  const subTaIdx = col('substitution_note_ta');
  const subHiIdx = col('substitution_note_hi');

  const filled = [];
  const skipped = [];
  const unrecognized = [];

  const writes = []; // { rowNumber (1-indexed incl header), values: {en,te,ta,hi} }

  rows.forEach((r, i) => {
    const group = r[giIdx] || '';
    const order = r[ioIdx] || '';
    const key = `${group}:${order}`;
    const currentSub = (r[subEnIdx] || '').trim();
    if (currentSub) return; // already has a note, not our concern

    const decision = DECISIONS[key];
    const itemName = r[enIdx] || '';

    if (!decision) {
      unrecognized.push({ key, itemName });
      return;
    }

    if (NOTES[decision]) {
      const note = NOTES[decision];
      filled.push({ key, itemName, note: note.en });
      writes.push({ rowNumber: i + 2, values: note }); // +2: 1-indexed + header row
    } else {
      skipped.push({ key, itemName, reason: decision });
    }
  });

  console.log(`\n=== FILL (${filled.length}) ===`);
  filled.forEach((f) => console.log(`[${f.key}] ${f.itemName}\n    -> ${f.note}`));

  console.log(`\n=== SKIP (${skipped.length}) ===`);
  skipped.forEach((s) => console.log(`[${s.key}] ${s.itemName}\n    (skipped: ${s.reason})`));

  if (unrecognized.length) {
    console.log(`\n=== UNRECOGNIZED / NOT IN DECISION TABLE (${unrecognized.length}) ===`);
    unrecognized.forEach((u) => console.log(`[${u.key}] ${u.itemName}`));
    console.log('\nThese rows were skipped from writes because they are not in DECISIONS. Investigate before --write.');
  }

  console.log(`\nTotals: ${filled.length} to fill, ${skipped.length} deliberately left empty, ${unrecognized.length} unrecognized.`);

  if (!WRITE) {
    console.log('\nDry run only. Re-run with --write to apply these changes.');
    return;
  }

  if (unrecognized.length) {
    console.error('\nRefusing to write: unrecognized rows present. Fix DECISIONS table first.');
    process.exit(1);
  }

  const sheets = await getSheetsClient();
  const data = [];
  for (const w of writes) {
    data.push({ range: `material_items!${colLetter(subEnIdx)}${w.rowNumber}`, values: [[w.values.en]] });
    data.push({ range: `material_items!${colLetter(subTeIdx)}${w.rowNumber}`, values: [[w.values.te]] });
    data.push({ range: `material_items!${colLetter(subTaIdx)}${w.rowNumber}`, values: [[w.values.ta]] });
    data.push({ range: `material_items!${colLetter(subHiIdx)}${w.rowNumber}`, values: [[w.values.hi]] });
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });

  console.log(`\nWrote substitution notes for ${writes.length} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
