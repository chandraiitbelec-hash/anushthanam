/**
 * Third content-authoring step from research/puja-vidhi-content-audit.md:
 * lakshmi-puja is currently framed only as a weekly Friday ritual with no
 * Diwali-specific content, despite that being the highest-search-volume
 * gap found in the audit. Appends a new step 6 covering the Diwali-specific
 * timing/customs plus a Kubera Puja cross-reference.
 *
 * Dry-run by default; pass --write to apply.
 */
import { getSheetsClient, SPREADSHEET_ID, getTabWithHeaders, parseWriteFlag } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const steps = await getTabWithHeaders('procedure_steps');
const H = steps.headers;
function rowValues(obj) { return H.map(h => obj[h] ?? ''); }

const diwaliStep = {
  parent_slug: 'lakshmi-puja',
  parent_type: 'puja',
  step_number: '6',
  step_title_en: 'Diwali Variant: Timing and Additional Customs',
  step_title_te: 'దీపావళి ప్రత్యేకత: సమయం మరియు అదనపు ఆచారాలు',
  step_title_ta: 'தீபாவளி சிறப்பு: நேரமும் கூடுதல் பழக்கங்களும்',
  step_title_hi: 'दिवाली विशेष: समय एवं अतिरिक्त रीति-रिवाज़',
  instruction_en: "When this puja is performed specifically for Diwali (rather than as the weekly Friday ritual above), a few customs differ: perform it on Amavasya (new moon) evening, ideally during Pradosh Kaal (the twilight window just after sunset) rather than in the morning. Draw small rangoli footprints leading from the entrance to the puja altar, symbolizing the Goddess's arrival into the home. Light as many diyas as possible around the house — 13 is a commonly followed count. Business owners traditionally place their account books/ledgers before the Goddess to be blessed for the coming year. In most households, Lord Ganesha and Kubera (the treasurer of the gods) are worshipped together with Lakshmi on this night — see the Kubera Puja page for Kubera-specific mantras and materials.",
  instruction_te: "ఈ పూజను (పైన పేర్కొన్న వారంవారీ శుక్రవార పూజకు బదులుగా) ప్రత్యేకంగా దీపావళి కోసం చేసేటప్పుడు కొన్ని ఆచారాలు మారతాయి: దీన్ని అమావాస్య సాయంత్రం, వీలైతే ప్రదోష కాలంలో (సూర్యాస్తమయం తర్వాతి సంధ్యా సమయం) చేయాలి, ఉదయం కాదు. ఇంటి గుమ్మం నుండి పూజా వేదిక వరకూ చిన్న రంగోలీ పాదముద్రలు గీయండి — ఇది దేవి ఇంట్లోకి రాకను సూచిస్తుంది. వీలైనన్ని ఎక్కువ దీపాలు వెలిగించండి — 13 దీపాలు సాధారణంగా పాటించే సంఖ్య. వ్యాపారులు తమ లెక్కల పుస్తకాలను/ఖాతా పుస్తకాలను రాబోయే సంవత్సరానికి ఆశీర్వదించడానికి దేవి ముందు ఉంచడం సంప్రదాయం. చాలా ఇళ్లలో ఈ రాత్రి గణేశుడు మరియు కుబేరుడు (దేవతల ఖజానాదారు) కూడా లక్ష్మితో పాటు పూజించబడతారు — కుబేర సంబంధిత మంత్రాలు, సామగ్రి కోసం కుబేర పూజ పేజీ చూడండి.",
  instruction_ta: "இப்பூஜையை (மேலே கூறிய வாராந்திர வெள்ளிக்கிழமை பூஜைக்குப் பதிலாக) குறிப்பாக தீபாவளிக்காக செய்யும்போது சில பழக்கங்கள் மாறுபடும்: இதை அமாவாசை மாலையில், முடிந்தால் பிரதோஷ காலத்தில் (சூரிய அஸ்தமனத்திற்குப் பிறகான அந்தி நேரம்) செய்யவும், காலையில் அல்ல. வீட்டு வாசலில் இருந்து பூஜை பீடம் வரை சிறிய ரங்கோலி பாதச் சுவடுகள் வரையவும் — இது தேவியின் வீட்டிற்குள் வருகையை குறிக்கிறது. முடிந்தவரை அதிக அளவு தீபங்களை ஏற்றுங்கள் — 13 என்பது பொதுவாக பின்பற்றப்படும் எண்ணிக்கை. வணிகர்கள் தங்கள் கணக்குப் புத்தகங்களை வரும் ஆண்டிற்காக ஆசீர்வதிக்கப்பட தேவி முன் வைப்பது வழக்கம். பெரும்பாலான வீடுகளில் இந்த இரவு விநாயகர் மற்றும் குபேரர் (தேவர்களின் கருவூலர்) லக்ஷ்மியுடன் சேர்ந்து வழிபடப்படுகிறார்கள் — குபேர-குறிப்பிட்ட மந்திரங்கள், பொருட்களுக்கு குபேர பூஜை பக்கத்தைப் பார்க்கவும்.",
  instruction_hi: "जब यह पूजा विशेष रूप से दिवाली के लिए की जाती है (ऊपर बताई गई साप्ताहिक शुक्रवार पूजा के बजाय), तो कुछ रीति-रिवाज़ अलग होते हैं: इसे अमावस्या की शाम, संभव हो तो प्रदोष काल (सूर्यास्त के तुरंत बाद की संध्या) में करें, सुबह नहीं। घर के प्रवेश द्वार से पूजा स्थल तक छोटे रंगोली पैरों के निशान बनाएं — यह देवी के घर में आगमन का प्रतीक है। घर के चारों ओर जितने संभव हो उतने दीये जलाएं — 13 दीये जलाना सामान्यतः प्रचलित संख्या है। व्यापारी परंपरागत रूप से आने वाले वर्ष के लिए आशीर्वाद हेतु अपनी बही-खाते देवी के सामने रखते हैं। अधिकांश घरों में इस रात लक्ष्मी के साथ भगवान गणेश और कुबेर (देवताओं के कोषाध्यक्ष) की भी पूजा की जाती है — कुबेर से संबंधित मंत्रों और सामग्री के लिए कुबेर पूजा पृष्ठ देखें।",
  recite_shloka_slug: '',
  recite_stanza_range: '',
  notes_en: "Exact Pradosh Kaal and auspicious lagna timings shift every year with the tithi — check a current panchangam for the specific muhurat window rather than relying on a fixed clock time.",
  notes_te: "ఖచ్చితమైన ప్రదోష కాల మరియు శుభ లగ్న సమయాలు ప్రతి సంవత్సరం తిథిని బట్టి మారతాయి — స్థిరమైన గడియార సమయంపై ఆధారపడకుండా, నిర్దిష్ట ముహూర్తం కోసం ప్రస్తుత పంచాంగాన్ని చూడండి.",
  notes_ta: "சரியான பிரதோஷ காலம் மற்றும் சுப லக்ன நேரங்கள் ஒவ்வொரு ஆண்டும் திதியைப் பொறுத்து மாறுபடும் — நிலையான கடிகார நேரத்தை நம்பாமல், குறிப்பிட்ட முகூர்த்தத்திற்கு தற்போதைய பஞ்சாங்கத்தைப் பார்க்கவும்.",
  notes_hi: "सटीक प्रदोष काल और शुभ लग्न समय हर वर्ष तिथि के अनुसार बदलते हैं — एक निश्चित घड़ी के समय पर निर्भर रहने के बजाय विशिष्ट मुहूर्त के लिए वर्तमान पंचांग देखें।",
};

console.log('=== new row to append ===');
console.log(`  ${diwaliStep.parent_slug} step ${diwaliStep.step_number}: ${diwaliStep.step_title_en}`);

if (!WRITE) {
  console.log('\nDry run only. Pass --write to apply.');
  process.exit(0);
}

const sheets = await getSheetsClient();
await sheets.spreadsheets.values.append({
  spreadsheetId: SPREADSHEET_ID,
  range: 'procedure_steps!A:A',
  valueInputOption: 'RAW',
  insertDataOption: 'INSERT_ROWS',
  requestBody: { values: [rowValues(diwaliStep)] },
});
console.log('Appended Diwali variant as step 6.');
