/**
 * One-off fixer: removes em-dash ("—") usage from shloka_stanzas
 * meaning_en/te/ta/hi cells for 13 shloka_slug values (Group F).
 *
 * Scope (13 slugs only — never touch anything outside this list):
 *   ganesha-sahasranamam, ayyappa-kavacham, durga-chalisa,
 *   ayyappa-sahasranamam, hanuman-sahasranamam, shiv-chalisa,
 *   shiva-sahasranamam, surya-sahasranamam, mahishasura-mardini-stotram,
 *   shani-chalisa, durga-sahasranamam, lakshmi-sahasranamam,
 *   rama-sahasranamam
 *
 * Matches rows by shloka_slug + stanza_number, and only writes to the
 * meaning_{lang} column that actually changed — verse/script columns are
 * never touched. Each edit is applied only if the live cell's current
 * text still matches the expected "old" text captured at draft time
 * (safety check against concurrent edits).
 *
 * Dry-run by default. Pass --write to apply changes to the live Sheet.
 *
 * Usage:
 *   node scripts/fix-em-dash-group-f.mjs           # dry run (default)
 *   node scripts/fix-em-dash-group-f.mjs --write   # apply
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, getTabWithHeaders, colLetter } from './lib-sheets.mjs';

const TAB = 'shloka_stanzas';

// Each entry: { slug, stanza, lang, old, new }
const EDITS = [
  // ---------------- ganesha-sahasranamam ----------------
  {
    slug: 'ganesha-sahasranamam', stanza: '1', lang: 'te',
    old: 'గణేశుని కు నమస్కారము — గణేశ్వరుడు, గణక్రీడుడు, గణనాథుడు, గణాధిపుడు, ఏకదంతుడు, వక్రతుండుడు, గజవక్త్రుడు మరియు మహోదరుడు.',
    new: 'గణేశ్వరుడు, గణక్రీడుడు, గణనాథుడు, గణాధిపుడు, ఏకదంతుడు, వక్రతుండుడు, గజవక్త్రుడు మరియు మహోదరుడు అయిన గణేశునికి నమస్కారము.',
  },
  {
    slug: 'ganesha-sahasranamam', stanza: '1', lang: 'ta',
    old: 'கணேசனுக்கு வணக்கம் — கணேஸ்வரன், கண விளையாட்டுடையவன், கண நாதன், கண அதிபன், ஏக தந்தன், வக்ர துண்டன், கஜ வக்த்ரன், மஹோதரன்.',
    new: 'கணேஸ்வரன், கண விளையாட்டுடையவன், கண நாதன், கண அதிபன், ஏக தந்தன், வக்ர துண்டன், கஜ வக்த்ரன், மஹோதரன் ஆகிய கணேசனுக்கு வணக்கம்.',
  },
  {
    slug: 'ganesha-sahasranamam', stanza: '1', lang: 'hi',
    old: 'गणेश को नमन — गणेश्वर, गणक्रीड, गणनाथ, गणाधिप, एकदन्त, वक्रतुण्ड, गजवक्त्र और महोदर।',
    new: 'गणेश्वर, गणक्रीड, गणनाथ, गणाधिप, एकदन्त, वक्रतुण्ड, गजवक्त्र और महोदर स्वरूप गणेश को नमन।',
  },
  {
    slug: 'ganesha-sahasranamam', stanza: '137', lang: 'en',
    old: 'Praise of Ganesha, who is worshipped by all eight divine elephants — Airavata, Pundarika and others — who is the guardian of all the eight directions.',
    new: 'Praise of Ganesha, who is worshipped by all eight divine elephants, including Airavata and Pundarika, and who is the guardian of all eight directions.',
  },
  {
    slug: 'ganesha-sahasranamam', stanza: '159', lang: 'en',
    old: 'Praise of Ganesha, who is the supreme ruler of the three gunas — sattva, rajas and tamas — who is beyond all three gunas, the transcendent absolute.',
    new: 'Praise of Ganesha, who is the supreme ruler of the three gunas of sattva, rajas and tamas, yet who stands beyond all three gunas as the transcendent absolute.',
  },
  {
    slug: 'ganesha-sahasranamam', stanza: '161', lang: 'en',
    old: 'Praise of Ganesha, who is the master of all times — past, present and future — who stands beyond time itself, who grants the highest wisdom.',
    new: 'Praise of Ganesha, who is the master of all times, past, present and future, who stands beyond time itself, and who grants the highest wisdom.',
  },

  // ---------------- ayyappa-kavacham ----------------
  {
    slug: 'ayyappa-kavacham', stanza: '3', lang: 'en',
    old: "People have turned away from the path of their own Dharma, their hearts perpetually confused and lost. O Vrishadhvaja (Shiva, whose banner bears the sacred bull)! Tell me — how may they attain spiritual fulfillment and liberation?",
    new: "People have turned away from the path of their own Dharma, their hearts perpetually confused and lost. O Vrishadhvaja (Shiva, whose banner bears the sacred bull), tell me how they may attain spiritual fulfillment and liberation?",
  },
  {
    slug: 'ayyappa-kavacham', stanza: '4', lang: 'en',
    old: 'O greatly blessed Goddess! O the very cause of all that is auspicious! Listen — I shall now reveal to you the Kavacham of Maha Shastha, the supreme cosmic ruler, which increases merit and spiritual virtue.',
    new: 'O greatly blessed Goddess! O the very cause of all that is auspicious! Listen, for I shall now reveal to you the Kavacham of Maha Shastha, the supreme cosmic ruler, which increases merit and spiritual virtue.',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '4', lang: 'te',
    old: 'ఓ మహాభాగ్యవతీ దేవీ, ఓ సర్వ కళ్యాణ కారణమా! వినుము — పుణ్యమును వర్థిల్లజేసే మహాశాస్తా కవచాన్ని నేను నీకు చెప్పెదను.',
    new: 'ఓ మహాభాగ్యవతీ దేవీ, ఓ సర్వ కళ్యాణ కారణమా! వినుము, పుణ్యమును వర్థిల్లజేసే మహాశాస్తా కవచాన్ని నేను నీకు చెప్పెదను.',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '4', lang: 'ta',
    old: 'ஓ மகாபாக்யசாலியான தேவீ, ஓ எல்லா மங்களத்திற்கும் காரணமே! கேள் — புண்யத்தை பெருக்கும் மகாஶாஸ்தா கவசத்தை நான் இப்போது உனக்கு சொல்கிறேன்.',
    new: 'ஓ மகாபாக்யசாலியான தேவீ, ஓ எல்லா மங்களத்திற்கும் காரணமே! கேள், புண்யத்தை பெருக்கும் மகாஶாஸ்தா கவசத்தை நான் இப்போது உனக்கு சொல்கிறேன்.',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '4', lang: 'hi',
    old: 'हे महाभागे देवी, हे सर्वकल्याण की कारणरूपे! सुनो — मैं तुम्हें महाशास्ता के उस कवच के विषय में बताता हूँ जो पुण्य को बढ़ाने वाला है।',
    new: 'हे महाभागे देवी, हे सर्वकल्याण की कारणरूपे! सुनो, मैं तुम्हें महाशास्ता के उस कवच के विषय में बताता हूँ जो पुण्य को बढ़ाने वाला है।',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '9', lang: 'ta',
    old: 'நான் என்றும் ஶாஸ்தாவை சரணடைகிறேன் — தேஜோமண்டல மத்தியில் விளங்குபவரை, முக்கண்ணனை, திவ்ய வஸ்திர ஆபரணங்கள் அணிந்தவரை, தாமரை கரங்களில் புஷ்பஶரம் (பூ அம்பு), கரும்பு வில், மாணிக்யபாத்திரம், அபயமுத்திரை ஏந்தியவரை, மதகஜ ஸ்கந்தத்தில் எழுந்தருளியவரை, திரிலோக ஸம்மோஹனனை.',
    new: 'தேஜோமண்டல மத்தியில் விளங்குபவரும், முக்கண்ணரும், திவ்ய வஸ்திர ஆபரணங்கள் அணிந்தவரும், தாமரை கரங்களில் புஷ்பஶரம் (பூ அம்பு), கரும்பு வில், மாணிக்யபாத்திரம் ஏந்தி அபயமுத்திரை காட்டுபவரும், மதகஜ ஸ்கந்தத்தில் எழுந்தருளியவரும், திரிலோகத்தையும் மயக்கும் ஶாஸ்தாவை நான் என்றும் சரணடைகிறேன்.',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '9', lang: 'hi',
    old: 'जो दिव्य तेजोमंडल के मध्य में विराजमान हैं, जिनके तीन नेत्र हैं, जो दिव्य वस्त्रों से सुशोभित हैं; जिनके कमल-हाथों में फूलों के बाण, गन्ने का धनुष, माणिक्य-जड़ित दिव्य पात्र है और जो अभयमुद्रा से भक्तों को सुरक्षा देते हैं; जो मतवाले हाथी के स्कंध पर सवार हैं और तीनों लोकों को सम्मोहित करने वाले हैं — उन प्रभु महाशास्ता (अय्यप्पा) की शरण में मैं निरंतर जाता/जाती हूँ।',
    new: 'जो दिव्य तेजोमंडल के मध्य में विराजमान हैं, जिनके तीन नेत्र हैं, जो दिव्य वस्त्रों से सुशोभित हैं, जिनके कमल-हाथों में फूलों के बाण, गन्ने का धनुष और माणिक्य-जड़ित दिव्य पात्र है, जो अभयमुद्रा से भक्तों को सुरक्षा देते हैं, तथा जो मतवाले हाथी के स्कंध पर सवार होकर तीनों लोकों को सम्मोहित करने वाले हैं, उन प्रभु महाशास्ता (अय्यप्पा) की शरण में मैं निरंतर जाता/जाती हूँ।',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '12', lang: 'ta',
    old: 'விஶுத்தாத்மா (தூய ஆத்மன்) என் கழுத்தை காப்பாற்றட்டும். ஸுராரசிதன் (தேவர்களால் வணங்கப்பட்டவன்) என் தோள்களை காப்பாற்றட்டும். விரூபாக்ஷன் (அற்புத கண்களுடையவன் — சிவனின் குணம் ஶாஸ்தாவில் வெளிப்பட்டது) என் கரங்களை காப்பாற்றட்டும். கமலாப்ரியன் (கமலா/லக்ஷ்மிக்கு பிரியமானவன்) என் கைகளை காப்பாற்றட்டும்.',
    new: 'விஶுத்தாத்மா (தூய ஆத்மன்) என் கழுத்தை காப்பாற்றட்டும். ஸுராரசிதன் (தேவர்களால் வணங்கப்பட்டவன்) என் தோள்களை காப்பாற்றட்டும். விரூபாக்ஷன் (சிவனுடைய குணமான அற்புத கண்களை உடையவன்) என் கரங்களை காப்பாற்றட்டும். கமலாப்ரியன் (கமலா/லக்ஷ்மிக்கு பிரியமானவன்) என் கைகளை காப்பாற்றட்டும்.',
  },
  {
    slug: 'ayyappa-kavacham', stanza: '17', lang: 'hi',
    old: 'यह सभी लोगों को ज्ञान और वैराग्य प्रदान करता है तथा भोग और मुक्ति — दोनों का फल देता है। भक्त जो भी कामना करे, वह सब बिना किसी संशय के प्राप्त होती है।',
    new: 'यह सभी लोगों को ज्ञान और वैराग्य प्रदान करता है तथा भोग और मुक्ति, दोनों का फल देता है। भक्त जो भी कामना करे, वह सब बिना किसी संशय के प्राप्त होती है।',
  },

  // ---------------- durga-chalisa ----------------
  {
    slug: 'durga-chalisa', stanza: '15', lang: 'te',
    old: 'మాతంగి, ధూమావతి తల్లి, భువనేశ్వరి, బగళాముఖి — సుఖదాయినులు.',
    new: 'సుఖదాయినులైన మాతంగి, ధూమావతి తల్లి, భువనేశ్వరి, బగళాముఖి.',
  },
  {
    slug: 'durga-chalisa', stanza: '15', lang: 'ta',
    old: 'மாதங்கி, தூமாவதி தாய், புவனேஷ்வரி, பகளாமுகி — சுகம் தருவோர்.',
    new: 'சுகம் தரும் மாதங்கி, தூமாவதி தாய், புவனேஷ்வரி, பகளாமுகி.',
  },
  {
    slug: 'durga-chalisa', stanza: '16', lang: 'te',
    old: 'భైరవి, తార — జగమును తరింపజేసేవారు; ఛిన్నమస్త — సంసార దుఃఖ నివారిణి.',
    new: 'జగమును తరింపజేసే భైరవి, తార; సంసార దుఃఖ నివారిణి అయిన ఛిన్నమస్త.',
  },
  {
    slug: 'durga-chalisa', stanza: '16', lang: 'ta',
    old: 'பைரவி, தாரா — உலகை கடிப்பவர்கள்; சின்னமஸ்தா — சமுசார துக்கம் தீர்ப்பவள்.',
    new: 'உலகைக் கடக்கச் செய்யும் பைரவி, தாரா; சமுசார துக்கம் தீர்க்கும் சின்னமஸ்தா.',
  },
  {
    slug: 'durga-chalisa', stanza: '16', lang: 'hi',
    old: 'भैरवी और तारा — जग को तारने वाली; छिन्नमस्ता — सांसारिक दुःख निवारिणी।',
    new: 'जग को तारने वाली भैरवी और तारा; सांसारिक दुःख निवारिणी छिन्नमस्ता।',
  },

  // ---------------- ayyappa-sahasranamam ----------------
  {
    slug: 'ayyappa-sahasranamam', stanza: '1', lang: 'en',
    old: 'Who has a form that subjugates the entire universe, who delights in the hunt, who gives fruits fitting all desires, the lord of all beings — I take refuge in that Shasta.',
    new: 'I take refuge in that Shasta, who has a form that subjugates the entire universe, who delights in the hunt, who gives fruits fitting all desires, and who is the lord of all beings.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '1', lang: 'te',
    old: 'విశ్వాన్ని వశీభూతం చేయు విగ్రహం కల, వేటాటలో ఆనందించే, కోరికకు తగిన ఫళమిచ్చే, ఉత్తమ భూతనాథుడు — ఆ శాస్తను నేను శరణు వేడుతున్నాను.',
    new: 'విశ్వాన్ని వశీభూతం చేయు విగ్రహం కలిగి, వేటాటలో ఆనందించి, కోరికకు తగిన ఫలమిచ్చే ఉత్తమ భూతనాథుడైన ఆ శాస్తను నేను శరణు వేడుతున్నాను.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '1', lang: 'ta',
    old: 'உலகனைத்தையும் வசப்படுத்தும் வடிவுடையவர், வேட்டையில் மகிழ்பவர், விருப்பத்திற்கேற்ப பலனளிப்பவர், சிறந்த பூதநாதர் — அந்த சாஸ்தாவை சரண் அடைகிறேன்.',
    new: 'உலகனைத்தையும் வசப்படுத்தும் வடிவுடையவரும், வேட்டையில் மகிழ்பவரும், விருப்பத்திற்கேற்ப பலனளிப்பவரும், சிறந்த பூதநாதருமான அந்த சாஸ்தாவை சரண் அடைகிறேன்.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '1', lang: 'hi',
    old: 'जिनका रूप सम्पूर्ण जगत् को वशीभूत करता है, जो मृगया में आनंदित होते हैं, इच्छानुसार फल देते हैं, वे भूतनाथ — उनकी शरण में मैं जाता हूँ।',
    new: 'जिनका रूप सम्पूर्ण जगत् को वशीभूत करता है, जो मृगया में आनंदित होते हैं, इच्छानुसार फल देते हैं, उन भूतनाथ की शरण में मैं जाता हूँ।',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '2', lang: 'en',
    old: 'Who wears a tall gem-studded crown, with curling locks of hair, the Shasta who grants desired boons — I take refuge in him.',
    new: 'I take refuge in the Shasta who wears a tall gem-studded crown, with curling locks of hair, and who grants desired boons.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '2', lang: 'te',
    old: 'ఉన్నతమైన రత్నఖచిత కిరీటం ధరించి, కురుచుకున్న కేశాగ్రం కలిగి, ఇష్టవరమిచ్చే శాస్త — ఆయనను శరణు వేడుతున్నాను.',
    new: 'ఉన్నతమైన రత్నఖచిత కిరీటం ధరించి, కురుచుకున్న కేశాగ్రం కలిగి, ఇష్టవరమిచ్చే ఆ శాస్తను నేను శరణు వేడుతున్నాను.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '2', lang: 'ta',
    old: 'உயர்ந்த ரத்னம் பதிந்த கிரீடம் அணிந்தவர், சுருண்ட நுனி கேசம் உடையவர், விரும்பிய வரமளிக்கும் சாஸ்தா — அவரை சரண் அடைகிறேன்.',
    new: 'உயர்ந்த ரத்னம் பதிந்த கிரீடம் அணிந்தவரும், சுருண்ட நுனி கேசம் உடையவரும், விரும்பிய வரமளிக்கும் சாஸ்தாவுமான அவரை சரண் அடைகிறேன்.',
  },
  {
    slug: 'ayyappa-sahasranamam', stanza: '2', lang: 'hi',
    old: 'जो ऊँचे रत्नजड़ित मुकुट धारण करते हैं, जिनके केश कुंचित अग्रभाग वाले हैं, जो इष्टवर देने वाले शास्ता हैं — उनकी शरण में मैं जाता हूँ।',
    new: 'जो ऊँचे रत्नजड़ित मुकुट धारण करते हैं, जिनके केश कुंचित अग्रभाग वाले हैं, तथा जो इष्टवर देने वाले शास्ता हैं, उनकी शरण में मैं जाता हूँ।',
  },

  // ---------------- hanuman-sahasranamam ----------------
  {
    slug: 'hanuman-sahasranamam', stanza: '130', lang: 'en',
    old: "This verse states that the four types of people become subjected to the devotee's will — kings, princes, royal officials, and ministers.",
    new: "This verse states that four types of people, namely kings, princes, royal officials, and ministers, become subjected to the devotee's will.",
  },
  {
    slug: 'hanuman-sahasranamam', stanza: '130', lang: 'te',
    old: 'నాలుగు రకాల వారు — రాజులు, రాజపుత్రులు, రాజ అధికారులు మరియు మంత్రులు — అతని వశంలో ఉంటారు.',
    new: 'రాజులు, రాజపుత్రులు, రాజ అధికారులు మరియు మంత్రులు అనే నాలుగు రకాల వారు అతని వశంలో ఉంటారు.',
  },
  {
    slug: 'hanuman-sahasranamam', stanza: '130', lang: 'ta',
    old: 'நான்கு வகையானவர்கள் — ராஜாக்கள், ராஜ புத்திரர்கள், ராஜ அதிகாரிகள், மந்திரிகள் — அவரின் கட்டுப்பாட்டுக்கு வருவார்கள்.',
    new: 'ராஜாக்கள், ராஜ புத்திரர்கள், ராஜ அதிகாரிகள், மந்திரிகள் ஆகிய நான்கு வகையானவர்களும் அவரின் கட்டுப்பாட்டுக்கு வருவார்கள்.',
  },
  {
    slug: 'hanuman-sahasranamam', stanza: '130', lang: 'hi',
    old: 'चार प्रकार के लोग — राजा, राजपुत्र, राजकीय अधिकारी और मंत्री — उसके वश में हो जाते हैं।',
    new: 'राजा, राजपुत्र, राजकीय अधिकारी और मंत्री, ये चार प्रकार के लोग उसके वश में हो जाते हैं।',
  },

  // ---------------- shiv-chalisa ----------------
  {
    slug: 'shiv-chalisa', stanza: '1', lang: 'te',
    old: 'గిరిజా పుత్రుడైన, సర్వ శుభాలకు మూలమైన, సర్వజ్ఞుడైన గణేశునికి జయం జయం — అయోధ్యాదాసు అంటున్నాడు: నిర్భయత్వమనే వరమిమ్ము.',
    new: 'గిరిజా పుత్రుడైన, సర్వ శుభాలకు మూలమైన, సర్వజ్ఞుడైన గణేశునికి జయం జయం. అయోధ్యాదాసు నిర్భయత్వమనే వరమిమ్మని కోరుతున్నాడు.',
  },
  {
    slug: 'shiv-chalisa', stanza: '1', lang: 'ta',
    old: 'கிரிஜா புத்திரனான, எல்லா மங்களங்களுக்கும் மூலமான, சர்வஞானியான கணேசனுக்கு ஜய் ஜய் — அயோத்யாதாஸ் கூறுகிறார்: அஞ்சாமை என்ற வரமளியும்.',
    new: 'கிரிஜா புத்திரனான, எல்லா மங்களங்களுக்கும் மூலமான, சர்வஞானியான கணேசனுக்கு ஜய் ஜய். அஞ்சாமை என்ற வரமளியுமாறு அயோத்யாதாஸ் வேண்டுகிறார்.',
  },
  {
    slug: 'shiv-chalisa', stanza: '1', lang: 'hi',
    old: 'गिरिजापुत्र, समस्त शुभों के स्रोत, सर्वज्ञ गणेश की जय जय — अयोध्यादास कहते हैं: निर्भयता का वर दीजिए।',
    new: 'गिरिजापुत्र, समस्त शुभों के स्रोत, सर्वज्ञ गणेश की जय जय। अयोध्यादास कहते हैं, निर्भयता का वर दीजिए।',
  },
  {
    slug: 'shiv-chalisa', stanza: '8', lang: 'te',
    old: 'నంది మరియు గణేశుడు అతని ప్రక్కన ఉన్నారు — సముద్రమందు తామర పువ్వు వలె.',
    new: 'సముద్రమందు తామర పువ్వు వలె, నంది మరియు గణేశుడు అతని ప్రక్కన ఉన్నారు.',
  },
  {
    slug: 'shiv-chalisa', stanza: '8', lang: 'ta',
    old: 'நந்தி மற்றும் கணேசன் அவனருகில் இருக்கிறார்கள் — கடலில் தாமரை மலர் போல.',
    new: 'கடலில் தாமரை மலர் போல, நந்தி மற்றும் கணேசன் அவனருகில் இருக்கிறார்கள்.',
  },
  {
    slug: 'shiv-chalisa', stanza: '8', lang: 'hi',
    old: 'नंदी और गणेश उनके पार्श्व में हैं — समुद्र में कमल-पुष्प के समान।',
    new: 'समुद्र में कमल-पुष्प के समान, नंदी और गणेश उनके पार्श्व में हैं।',
  },

  // ---------------- shiva-sahasranamam ----------------
  {
    slug: 'shiva-sahasranamam', stanza: '1', lang: 'te',
    old: 'శివుని కు నమస్కారము — స్థిరుడు, స్థాణువు, ప్రభువు, భీముడు, ప్రవరుడు, వరదుడు, సర్వాత్మ, సర్వవిఖ్యాతుడు మరియు సర్వుడు.',
    new: 'స్థిరుడు, స్థాణువు, ప్రభువు, భీముడు, ప్రవరుడు, వరదుడు, సర్వాత్మ, సర్వవిఖ్యాతుడు మరియు సర్వుడు అయిన శివునికి నమస్కారము.',
  },
  {
    slug: 'shiva-sahasranamam', stanza: '1', lang: 'ta',
    old: 'சிவனுக்கு வணக்கம் — நிலையானவன், ஸ்தாணு, பிரபு, பீமன், பிரவரன், வரதன், சர்வாத்மா, சர்வவிக்யாதன்.',
    new: 'நிலையானவன், ஸ்தாணு, பிரபு, பீமன், பிரவரன், வரதன், சர்வாத்மா, சர்வவிக்யாதன் ஆகிய சிவனுக்கு வணக்கம்.',
  },
  {
    slug: 'shiva-sahasranamam', stanza: '1', lang: 'hi',
    old: 'शिव को नमन — स्थिर, स्थाणु, प्रभु, भीम, प्रवर, वरद, सर्वात्मा, सर्वविख्यात और सर्वकर्ता।',
    new: 'स्थिर, स्थाणु, प्रभु, भीम, प्रवर, वरद, सर्वात्मा, सर्वविख्यात और सर्वकर्ता स्वरूप शिव को नमन।',
  },
  {
    slug: 'shiva-sahasranamam', stanza: '48', lang: 'en',
    old: 'Praise of Shiva, lord of seeds, the seed-maker, who follows the innermost self, the mighty, the narrative, the complete — adorned by Gautama and great sages.',
    new: 'Praise of Shiva, lord of seeds, the seed-maker, who follows the innermost self, the mighty, the narrative, the complete, and who is adorned by Gautama and great sages.',
  },
  {
    slug: 'shiva-sahasranamam', stanza: '112', lang: 'en',
    old: 'Praise of Shiva as the unit of time — the division, moment, unit, instant, lapse, day, night — and as the cosmic field, the supreme Brahman, the universal ground.',
    new: 'Praise of Shiva as the unit of time, encompassing the division, moment, unit, instant, lapse, day and night, and as the cosmic field, the supreme Brahman, the universal ground.',
  },

  // ---------------- surya-sahasranamam ----------------
  {
    slug: 'surya-sahasranamam', stanza: '1', lang: 'te',
    old: 'సూర్యునకు నమస్కారము — సర్వజ్ఞుడు, విశ్వజయుడు, విశ్వాత్మ, విశ్వేశ్వరుడు, విశ్వయోని, జితేంద్రియుడు.',
    new: 'సర్వజ్ఞుడు, విశ్వజయుడు, విశ్వాత్మ, విశ్వేశ్వరుడు, విశ్వయోని, జితేంద్రియుడు అయిన సూర్యునకు నమస్కారము.',
  },
  {
    slug: 'surya-sahasranamam', stanza: '1', lang: 'ta',
    old: 'சூரியனுக்கு வணக்கம் — எல்லாம் அறிந்தவர், உலகை வென்றவர், விசுவாத்மா, விசுவேசுவரர், புலன்களை வென்றவர்.',
    new: 'எல்லாம் அறிந்தவரும், உலகை வென்றவரும், விசுவாத்மாவும், விசுவேசுவரரும், புலன்களை வென்றவருமான சூரியனுக்கு வணக்கம்.',
  },
  {
    slug: 'surya-sahasranamam', stanza: '14', lang: 'en',
    old: 'Praise of Surya as knower of all levels, traverser with ray-garland, mind-captivating wise one — the life-giving Sun and radiant Vishnu.',
    new: 'Praise of Surya as knower of all levels, traverser with ray-garland, and mind-captivating wise one, the life-giving Sun and radiant Vishnu.',
  },
  {
    slug: 'surya-sahasranamam', stanza: '23', lang: 'en',
    old: 'Salutations to Surya, the ocean of wealth, destroyer of darkness and inner and outer fire — the inner conscience and the hidden one.',
    new: 'Salutations to Surya, the ocean of wealth, destroyer of darkness and inner and outer fire, the inner conscience and the hidden one.',
  },
  {
    slug: 'surya-sahasranamam', stanza: '38', lang: 'en',
    old: "Praise of Surya, the sky-pervader and truth itself, mind-captivating Savita — Hari, Hara and Vayu brilliant as time's fire.",
    new: "Praise of Surya, the sky-pervader and truth itself, mind-captivating Savita, and as Hari, Hara and Vayu, brilliant as time's fire.",
  },
  {
    slug: 'surya-sahasranamam', stanza: '41', lang: 'en',
    old: 'Salutations to Surya, cause of health, attainment, prosperity and growth — the golden-seeded, wise great Brihaspati who is health personified.',
    new: 'Salutations to Surya, cause of health, attainment, prosperity and growth, the golden-seeded, wise great Brihaspati who is health personified.',
  },

  // ---------------- mahishasura-mardini-stotram ----------------
  {
    slug: 'mahishasura-mardini-stotram', stanza: '7', lang: 'hi',
    old: "हे केवल अपनी गर्जना से ही धूम्रलोचन का संहार करने वाली महादेवी! युद्ध में बहे रक्त से और भी रक्तजन्मा असुर उत्पन्न होकर स्वयं नष्ट हुए — ऐसी अद्भुत शक्ति! शुंभ-निशुंभ के महायुद्ध में तृप्त भूत-प्रेत-गणों के मध्य 'शिव शिव' कहती विचरण करने वाली उग्रमाता! जय जय हे महिषासुरमर्दिनी, रम्यकपर्दिनी, शैलसुते!",
    new: "हे केवल अपनी गर्जना से ही धूम्रलोचन का संहार करने वाली महादेवी! युद्ध में बहे रक्त से और भी रक्तजन्मा असुर उत्पन्न होकर स्वयं नष्ट हुए, ऐसी अद्भुत शक्ति! शुंभ-निशुंभ के महायुद्ध में तृप्त भूत-प्रेत-गणों के मध्य 'शिव शिव' कहती विचरण करने वाली उग्रमाता! जय जय हे महिषासुरमर्दिनी, रम्यकपर्दिनी, शैलसुते!",
  },
  {
    slug: 'mahishasura-mardini-stotram', stanza: '21', lang: 'te',
    old: 'హే నా వంటి నీచుడి పట్ల కూడా కేవలం కరుణతో నిశ్చయముగా నాకు దయ చూపించాల్సిన తల్లి! హే జగన్మాతా! నీ కరుణ ఎప్పుడూ నిజమైనదే అయినందున నా నమ్రమైన స్తుతి కూడా ఆ నిజమునకు అనుగుణంగానే అర్పించబడింది. ఇక్కడ తగినదేదైనా ప్రసాదించు, ఈ మహా కష్టమును తొలగించు — జయ జయ హే మహిషాసురమర్దిని, రమ్యకపర్దిని, శైలసుతే!',
    new: 'హే నా వంటి నీచుడి పట్ల కూడా కేవలం కరుణతో నిశ్చయముగా నాకు దయ చూపించాల్సిన తల్లి! హే జగన్మాతా! నీ కరుణ ఎప్పుడూ నిజమైనదే అయినందున నా నమ్రమైన స్తుతి కూడా ఆ నిజమునకు అనుగుణంగానే అర్పించబడింది. ఇక్కడ తగినదేదైనా ప్రసాదించు, ఈ మహా కష్టమును తొలగించు. జయ జయ హే మహిషాసురమర్దిని, రమ్యకపర్దిని, శైలసుతే!',
  },
  {
    slug: 'mahishasura-mardini-stotram', stanza: '21', lang: 'ta',
    old: 'ஹே என்னைப் போன்ற அற்பனிடமும் கருணையால் மட்டுமே நிச்சயமாக எனக்கு அருள் புரியும் தாயே! ஹே உலகத்தாயே! உன் கருணை எப்போதும் உண்மையானதே என்பதால் என் நம்ரமான துதியும் அந்த உண்மைக்கு ஏற்றபடியே செய்யப்பட்டது. இங்கு தகுந்ததை அருளி, இந்த பெரும் துன்பத்தை நீக்கு — ஜய ஜய ஹே மஹிஷாஸுரமர்தினி, ரம்யகபர்தினி, சைலசுதே!',
    new: 'ஹே என்னைப் போன்ற அற்பனிடமும் கருணையால் மட்டுமே நிச்சயமாக எனக்கு அருள் புரியும் தாயே! ஹே உலகத்தாயே! உன் கருணை எப்போதும் உண்மையானதே என்பதால் என் நம்ரமான துதியும் அந்த உண்மைக்கு ஏற்றபடியே செய்யப்பட்டது. இங்கு தகுந்ததை அருளி, இந்த பெரும் துன்பத்தை நீக்கு. ஜய ஜய ஹே மஹிஷாஸுரமர்தினி, ரம்யகபர்தினி, சைலசுதே!',
  },
  {
    slug: 'mahishasura-mardini-stotram', stanza: '21', lang: 'hi',
    old: 'हे मुझ जैसे नीच पर भी केवल करुणा से निश्चित रूप से दया दिखाने वाली माता! हे जगन्माता! तुम्हारी करुणा सदा यथार्थ है, इसलिए मेरी नम्र स्तुति भी उसी सत्य के अनुरूप अर्पित है। जो यहाँ उचित हो वह प्रदान करो और इस महाकष्ट को दूर करो — जय जय हे महिषासुरमर्दिनी, रम्यकपर्दिनी, शैलसुते!',
    new: 'हे मुझ जैसे नीच पर भी केवल करुणा से निश्चित रूप से दया दिखाने वाली माता! हे जगन्माता! तुम्हारी करुणा सदा यथार्थ है, इसलिए मेरी नम्र स्तुति भी उसी सत्य के अनुरूप अर्पित है। जो यहाँ उचित हो वह प्रदान करो और इस महाकष्ट को दूर करो। जय जय हे महिषासुरमर्दिनी, रम्यकपर्दिनी, शैलसुते!',
  },

  // ---------------- shani-chalisa ----------------
  {
    slug: 'shani-chalisa', stanza: '8', lang: 'te',
    old: 'సౌరి, మందుడు, శని—ఈ పది పేర్లు; సూర్యపుత్రుడిని అన్ని కోరికల నెరవేర్పు కోసం పూజిస్తారు.',
    new: 'సౌరి, మందుడు, శని అనే ఈ పది పేర్లు కలిగిన సూర్యపుత్రుడిని అన్ని కోరికల నెరవేర్పు కోసం పూజిస్తారు.',
  },
  {
    slug: 'shani-chalisa', stanza: '8', lang: 'ta',
    old: 'சௌரி, மந்தன், சனி—இந்தப் பத்து பெயர்கள்; சூரிய புத்திரரை அனைத்து விருப்பங்களும் நிறைவேற பூஜிக்கிறார்கள்.',
    new: 'சௌரி, மந்தன், சனி எனும் இந்தப் பத்து பெயர்களைக் கொண்ட சூரிய புத்திரரை அனைத்து விருப்பங்களும் நிறைவேற பூஜிக்கிறார்கள்.',
  },
  {
    slug: 'shani-chalisa', stanza: '8', lang: 'hi',
    old: 'सौरी, मन्द, शनि—ये दस नाम हैं; सूर्यपुत्र सभी कामनाएँ पूर्ण करने हेतु पूजे जाते हैं।',
    new: 'सौरी, मन्द, शनि इन दस नामों वाले सूर्यपुत्र, सभी कामनाएँ पूर्ण करने हेतु पूजे जाते हैं।',
  },

  // ---------------- durga-sahasranamam ----------------
  {
    slug: 'durga-sahasranamam', stanza: '136', lang: 'te',
    old: 'సర్వసిద్ధిప్రద, శక్తి, సర్వమంగళమంగళ — ఈ శివా యొక్క పవిత్ర సహస్రనామం శివుడే భక్తుల మోక్షం కోసం చెప్పాడు.',
    new: 'సర్వసిద్ధిప్రద, శక్తి, సర్వమంగళమంగళ అయిన ఈ శివా యొక్క పవిత్ర సహస్రనామం శివుడే భక్తుల మోక్షం కోసం చెప్పాడు.',
  },
  {
    slug: 'durga-sahasranamam', stanza: '136', lang: 'ta',
    old: 'சர்வ சித்தி பிரதா, சக்தி, சர்வ மங்கள மங்களா — இந்த சிவாவின் சஹஸ்ரநாமம் சிவனே பக்தர்களின் முக்திக்காக சொன்னது.',
    new: 'சர்வ சித்தி பிரதா, சக்தி, சர்வ மங்கள மங்களா ஆகிய இந்த சிவாவின் சஹஸ்ரநாமம் சிவனே பக்தர்களின் முக்திக்காக சொன்னது.',
  },
  {
    slug: 'durga-sahasranamam', stanza: '136', lang: 'hi',
    old: 'सर्वसिद्धिप्रदा, शक्ति, सर्वमङ्गलमङ्गला — यह शिवा का पवित्र सहस्रनाम स्वयं शिव ने भक्तों के उद्धार के लिए कहा।',
    new: 'सर्वसिद्धिप्रदा, शक्ति, सर्वमङ्गलमङ्गला स्वरूप शिवा का यह पवित्र सहस्रनाम स्वयं शिव ने भक्तों के उद्धार के लिए कहा।',
  },

  // ---------------- lakshmi-sahasranamam ----------------
  {
    slug: 'lakshmi-sahasranamam', stanza: '32', lang: 'en',
    old: 'Praise of Durga, who is the power of the sun, the moon, fire, and stars, who destroys afflictions in the three types of time — past, present and future.',
    new: 'Praise of Durga, who is the power of the sun, the moon, fire, and stars, and who destroys afflictions in the three types of time, namely past, present and future.',
  },
  {
    slug: 'lakshmi-sahasranamam', stanza: '154', lang: 'en',
    old: 'Praise of the supreme goddess who is the auspiciousness of all auspicious things, the giver of all aims of life, the refuge of all, the three-eyed divine Narayani — we bow to you.',
    new: 'We bow to the supreme goddess who is the auspiciousness of all auspicious things, the giver of all aims of life, the refuge of all, the three-eyed divine Narayani.',
  },

  // ---------------- rama-sahasranamam ----------------
  {
    slug: 'rama-sahasranamam', stanza: '1', lang: 'te',
    old: 'రామున కు నమస్కారము — రాజీవలోచనుడు, శ్రీమాన్, రఘుపుంగవుడు, రామభద్రుడు, సదాచారుడు, రాజేంద్రుడు, జానకీపతి.',
    new: 'రాజీవలోచనుడు, శ్రీమాన్, రఘుపుంగవుడు, రామభద్రుడు, సదాచారుడు, రాజేంద్రుడు, జానకీపతి అయిన రామునికి నమస్కారము.',
  },
  {
    slug: 'rama-sahasranamam', stanza: '1', lang: 'ta',
    old: 'ராமனுக்கு வணக்கம் — தாமரைக்கண்ணினன், ஸ்ரீமான், ரகுபுங்கவன், ராமபத்ரன், நல்லொழுக்கமுடையவன், ஜானகிபதி.',
    new: 'தாமரைக்கண்ணினன், ஸ்ரீமான், ரகுபுங்கவன், ராமபத்ரன், நல்லொழுக்கமுடையவன், ஜானகிபதி ஆகிய ராமனுக்கு வணக்கம்.',
  },
];

async function main() {
  const write = parseWriteFlag();
  const { rows, col } = await getTabWithHeaders(TAB);
  const slugCol = col('shloka_slug');
  const stanzaCol = col('stanza_number');
  const meanCols = { en: col('meaning_en'), te: col('meaning_te'), ta: col('meaning_ta'), hi: col('meaning_hi') };

  const sheets = write ? await getSheetsClient() : null;
  let applied = 0;
  let skipped = 0;

  for (const edit of EDITS) {
    // rows array is 0-indexed data rows; sheet row number = index + 2 (1 header row + 1-based)
    const rowIndex = rows.findIndex(r => r[slugCol] === edit.slug && r[stanzaCol] === edit.stanza);
    if (rowIndex === -1) {
      console.log(`[NOT FOUND] ${edit.slug} stanza ${edit.stanza} (${edit.lang})`);
      skipped++;
      continue;
    }
    const row = rows[rowIndex];
    const currentValue = row[meanCols[edit.lang]] || '';
    console.log(`\n=== ${edit.slug} :: stanza ${edit.stanza} :: meaning_${edit.lang} ===`);
    if (currentValue !== edit.old) {
      console.log('[SKIP - live cell does not match expected old text, needs re-check]');
      console.log('  expected old:', edit.old);
      console.log('  live value  :', currentValue);
      skipped++;
      continue;
    }
    console.log('OLD:', edit.old);
    console.log('NEW:', edit.new);

    if (write) {
      const sheetRowNumber = rowIndex + 2;
      const colName = `meaning_${edit.lang}`;
      const range = `${TAB}!${colLetter(meanCols[edit.lang])}${sheetRowNumber}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: [[edit.new]] },
      });
      console.log(`  -> WROTE to ${range}`);
    }
    applied++;
  }

  console.log(`\n${write ? 'Applied' : 'Would apply'} ${applied} edits. Skipped ${skipped}.`);
  if (!write) {
    console.log('Dry run only — pass --write to apply.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
