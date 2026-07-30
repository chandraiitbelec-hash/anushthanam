/**
 * One-off fix: remove the em-dash ("—") from 4 small, agent-owned tabs
 * (gods, shlokas, stories_index, vrathams) where it reads as an AI-writing
 * tell, and restructure the surrounding prose so it stays natural and
 * grammatical in each language. Meaning is preserved; only sentence
 * structure/punctuation changes. Each language is fixed independently from
 * its own existing text — nothing here is re-translated from English.
 *
 * Scope is intentionally narrow: only the specific columns named below are
 * touched, matched by slug. A handful of other em-dash cells were found in
 * these tabs during research (title_te/title_ta/title_hi in stories_index,
 * and tithi in vrathams) but are OUT OF SCOPE per the assignment brief and
 * are deliberately left untouched — see the report for details.
 *
 * Usage:
 *   node scripts/fix-em-dash-small-tabs.mjs          <- dry run (default)
 *   node scripts/fix-em-dash-small-tabs.mjs --write  <- apply
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const APPLY = parseWriteFlag(process.argv);

// ---------------------------------------------------------------------------
// Fix data: { tab, slug, field, before, after }
// `before` is asserted against the live cell value before writing, so the
// script fails loudly instead of silently overwriting something unexpected.
// ---------------------------------------------------------------------------

const FIXES = [
  // ----------------------------- gods ---------------------------------
  {
    tab: 'gods', slug: 'kali', field: 'description_en',
    before: "Kali is the fierce goddess of time, death, and transformation — the most powerful manifestation of Shakti. She destroys ego and liberates souls from the cycle of birth and death. Despite her terrifying appearance, Kali is the ultimate loving mother who annihilates evil without hesitation. She is especially venerated in Bengal, Assam, and throughout South India.",
    after: "Kali, the most powerful manifestation of Shakti, is the fierce goddess of time, death, and transformation. She destroys ego and liberates souls from the cycle of birth and death. Despite her terrifying appearance, Kali is the ultimate loving mother who annihilates evil without hesitation. She is especially venerated in Bengal, Assam, and throughout South India.",
  },
  {
    tab: 'gods', slug: 'kartikeya', field: 'description_en',
    before: "Kartikeya is the god of war, victory, and wisdom — son of Shiva and Parvati, and commander of the divine army. Known as Murugan in Tamil tradition, he is the supreme deity of the Tamils and one of the most widely worshipped gods in South India and among the Tamil diaspora worldwide. He defeated the asura Soorapadman and restored order to the cosmos.",
    after: "Kartikeya, son of Shiva and Parvati and commander of the divine army, is the god of war, victory, and wisdom. Known as Murugan in Tamil tradition, he is the supreme deity of the Tamils and one of the most widely worshipped gods in South India and among the Tamil diaspora worldwide. He defeated the asura Soorapadman and restored order to the cosmos.",
  },
  {
    tab: 'gods', slug: 'kali', field: 'description_te',
    before: "కాళి కాలం, మరణం మరియు రూపాంతరం యొక్క భయంకర దేవత — శక్తి యొక్క అత్యంత శక్తివంతమైన అభివ్యక్తి. ఆమె అహంకారాన్ని నాశనం చేసి ఆత్మలను మోక్షానికి చేర్చుతుంది. భయంకరమైన రూపం ఉన్నప్పటికీ, కాళి అంతిమ స్నేహపూర్వక తల్లి.",
    after: "శక్తి యొక్క అత్యంత శక్తివంతమైన అభివ్యక్తి అయిన కాళి, కాలం, మరణం మరియు రూపాంతరం యొక్క భయంకర దేవత. ఆమె అహంకారాన్ని నాశనం చేసి ఆత్మలను మోక్షానికి చేర్చుతుంది. భయంకరమైన రూపం ఉన్నప్పటికీ, కాళి అంతిమ స్నేహపూర్వక తల్లి.",
  },
  {
    tab: 'gods', slug: 'bhairava', field: 'description_te',
    before: "భైరవ శివుని భయంకర రూపం — కాలం మరియు కాలాతీతమైన వాస్తవికతతో సంబంధం కలిగి ఉంటాడు. అష్ట భైరవులు ఎనిమిది దిక్కులను రక్షిస్తారు. కాల భైరవ కాశీ నగర అధిష్ఠాన దేవత. శ్వానాలు ఆయనకు పవిత్రమైనవి.",
    after: "భైరవ శివుని భయంకర రూపం. ఇతడు కాలం మరియు కాలాతీతమైన వాస్తవికతతో సంబంధం కలిగి ఉంటాడు. అష్ట భైరవులు ఎనిమిది దిక్కులను రక్షిస్తారు. కాల భైరవ కాశీ నగర అధిష్ఠాన దేవత. శ్వానాలు ఆయనకు పవిత్రమైనవి.",
  },
  {
    tab: 'gods', slug: 'kartikeya', field: 'description_te',
    before: "కార్తికేయ యుద్ధం, విజయం మరియు జ్ఞానం యొక్క దేవత — శివ పార్వతుల పుత్రుడు, దేవసేన అధిపతి. తమిళ సంప్రదాయంలో మురుగన్ గా పరిచితుడు. సూరపద్మాసురుని సంహరించి విశ్వంలో శాంతిని నెలకొల్పాడు.",
    after: "శివ పార్వతుల పుత్రుడు, దేవసేన అధిపతి అయిన కార్తికేయ యుద్ధం, విజయం మరియు జ్ఞానం యొక్క దేవత. తమిళ సంప్రదాయంలో మురుగన్ గా పరిచితుడు. సూరపద్మాసురుని సంహరించి విశ్వంలో శాంతిని నెలకొల్పాడు.",
  },
  {
    tab: 'gods', slug: 'kali', field: 'description_ta',
    before: "காளி காலம், மரணம் மற்றும் உருமாற்றத்தின் கொடூரமான தேவி — சக்தியின் மிகவும் சக்திவாய்ந்த வெளிப்பாடு. அவள் அகந்தையை அழித்து ஆன்மாக்களை மோட்சத்திற்கு அழைத்துச் செல்கிறாள்.",
    after: "சக்தியின் மிகவும் சக்திவாய்ந்த வெளிப்பாடான காளி, காலம், மரணம் மற்றும் உருமாற்றத்தின் கொடூரமான தேவி. அவள் அகந்தையை அழித்து ஆன்மாக்களை மோட்சத்திற்கு அழைத்துச் செல்கிறாள்.",
  },
  {
    tab: 'gods', slug: 'bhairava', field: 'description_ta',
    before: "பைரவர் சிவனின் கொடூரமான வடிவம் — காலம் மற்றும் கால வெளியே உள்ள பரம உண்மையுடன் தொடர்புடையவர். அஷ்ட பைரவர்கள் எட்டு திசைகளை காக்கிறார்கள். காலபைரவர் வாரணாசியின் தலைமை தெய்வம். நாய்கள் அவருக்கு புனிதமானவை.",
    after: "பைரவர் சிவனின் கொடூரமான வடிவம். இவர் காலம் மற்றும் கால வெளியே உள்ள பரம உண்மையுடன் தொடர்புடையவர். அஷ்ட பைரவர்கள் எட்டு திசைகளை காக்கிறார்கள். காலபைரவர் வாரணாசியின் தலைமை தெய்வம். நாய்கள் அவருக்கு புனிதமானவை.",
  },
  {
    tab: 'gods', slug: 'kartikeya', field: 'description_ta',
    before: "கார்த்திகேயன் போர், வெற்றி மற்றும் ஞானத்தின் கடவுள் — சிவன் மற்றும் பார்வதியின் புதல்வன், தேவசேனாபதி. தமிழ் மரபில் முருகன் என அழைக்கப்படும் இவர் தமிழர்களின் தலைமை தெய்வம். சூரபத்மனை அழித்து பிரபஞ்சத்தில் அமைதியை நிலைநாட்டினார்.",
    after: "சிவன் மற்றும் பார்வதியின் புதல்வனும் தேவசேனாபதியுமான கார்த்திகேயன் போர், வெற்றி மற்றும் ஞானத்தின் கடவுள். தமிழ் மரபில் முருகன் என அழைக்கப்படும் இவர் தமிழர்களின் தலைமை தெய்வம். சூரபத்மனை அழித்து பிரபஞ்சத்தில் அமைதியை நிலைநாட்டினார்.",
  },
  {
    tab: 'gods', slug: 'kali', field: 'description_hi',
    before: "काली काल, मृत्यु और परिवर्तन की उग्र देवी हैं — शक्ति का सबसे शक्तिशाली रूप। वे अहंकार का नाश करके आत्माओं को मोक्ष दिलाती हैं। भयंकर रूप के बावजूद, काली परम स्नेहमयी माता हैं।",
    after: "शक्ति के सबसे शक्तिशाली रूप काली, काल, मृत्यु और परिवर्तन की उग्र देवी हैं। वे अहंकार का नाश करके आत्माओं को मोक्ष दिलाती हैं। भयंकर रूप के बावजूद, काली परम स्नेहमयी माता हैं।",
  },
  {
    tab: 'gods', slug: 'bhairava', field: 'description_hi',
    before: "भैरव शिव का उग्र रूप हैं — काल और काल से परे की सत्ता से संबद्ध। अष्ट भैरव आठ दिशाओं की रक्षा करते हैं। काल भैरव काशी के अधिष्ठाता देव हैं। श्वान उनके प्रिय वाहन हैं।",
    after: "भैरव शिव का उग्र रूप हैं, जो काल और काल से परे की सत्ता से संबद्ध हैं। अष्ट भैरव आठ दिशाओं की रक्षा करते हैं। काल भैरव काशी के अधिष्ठाता देव हैं। श्वान उनके प्रिय वाहन हैं।",
  },
  {
    tab: 'gods', slug: 'kartikeya', field: 'description_hi',
    before: "कार्तिकेय युद्ध, विजय और ज्ञान के देवता हैं — शिव-पार्वती के पुत्र और देवसेना के सेनापति। तमिल परंपरा में मुरुगन के नाम से प्रसिद्ध, वे दक्षिण भारत के सर्वाधिक पूजित देवताओं में हैं। सूरपद्म का संहार कर ब्रह्मांड में शांति स्थापित की।",
    after: "शिव-पार्वती के पुत्र और देवसेना के सेनापति कार्तिकेय युद्ध, विजय और ज्ञान के देवता हैं। तमिल परंपरा में मुरुगन के नाम से प्रसिद्ध, वे दक्षिण भारत के सर्वाधिक पूजित देवताओं में हैं। सूरपद्म का संहार कर ब्रह्मांड में शांति स्थापित की।",
  },
  {
    tab: 'gods', slug: 'sita', field: 'iconography_en',
    before: "Golden complexion, dressed in a yellow or red sari. Always depicted alongside Rama — on his left, slightly shorter. Holds a lotus. Gentle, serene expression. Sometimes shown with Lakshmana during forest exile.",
    after: "Golden complexion, dressed in a yellow or red sari. Always depicted alongside Rama, on his left and slightly shorter. Holds a lotus. Gentle, serene expression. Sometimes shown with Lakshmana during forest exile.",
  },
  {
    tab: 'gods', slug: 'kartikeya', field: 'iconography_en',
    before: "Youthful, handsome form with six faces (Shanmukha) or one face. Rides a peacock (Mayura). Carries a vel (spear/lance) — his primary weapon. Two or twelve arms. Accompanied by his consorts Devasena and Valli.",
    after: "Youthful, handsome form with six faces (Shanmukha) or one face. Rides a peacock (Mayura). Carries a vel (spear/lance), his primary weapon. Two or twelve arms. Accompanied by his consorts Devasena and Valli.",
  },

  // ----------------------------- shlokas -------------------------------
  {
    tab: 'shlokas', slug: 'annamacharya-keertana-collection', field: 'brief_intro_en',
    before: 'Devotional compositions by Annamacharya (15th century), the saint-composer of Tirupati. Called "Telugu Vedas" — over 32,000 sankirtanas were composed, of which ~14,000 survive.',
    after: 'Devotional compositions by Annamacharya (15th century), the saint-composer of Tirupati. Known as the "Telugu Vedas," over 32,000 sankirtanas were composed, of which ~14,000 survive.',
  },
  {
    tab: 'shlokas', slug: 'hanuman-chalisa', field: 'brief_intro_te',
    before: "తులసీదాసు రచించిన హనుమాన్ చాలీసా — ఆంజనేయస్వామిని స్తుతించే 40 పద్యాలు.",
    after: "తులసీదాసు రచించిన హనుమాన్ చాలీసాలో ఆంజనేయస్వామిని స్తుతించే 40 పద్యాలు ఉన్నాయి.",
  },
  {
    tab: 'shlokas', slug: 'devi-aparadha-kshama-stotram', field: 'brief_intro_te',
    before: "ఆదిశంకరాచార్యులు రచించిన — తెలిసి తెలియకుండా చేసిన అపరాధాలకు దేవి క్షమాపణ కోరే స్తోత్రం.",
    after: "ఆదిశంకరాచార్యులు రచించిన ఈ స్తోత్రం, తెలిసి తెలియకుండా చేసిన అపరాధాలకు దేవి క్షమాపణ కోరుతుంది.",
  },
  {
    tab: 'shlokas', slug: 'devi-kavacham', field: 'brief_intro_te',
    before: "దేవీ మాహాత్మ్యం (దుర్గా సప్తశతి) నుండి — నవరాత్రి సమయంలో పారాయణ చేసే దేవీ కవచం.",
    after: "దేవీ మాహాత్మ్యం (దుర్గా సప్తశతి) నుండి తీసుకున్న ఈ దేవీ కవచాన్ని నవరాత్రి సమయంలో పారాయణ చేస్తారు.",
  },
  {
    tab: 'shlokas', slug: 'devi-aparadha-kshama-stotram', field: 'brief_intro_ta',
    before: "ஆதிசங்கரர் இயற்றிய — தெரிந்தோ தெரியாமலோ செய்த பாவங்களுக்கு மன்னிப்பு கேட்கும் ஸ்தோத்ரம்.",
    after: "ஆதிசங்கரர் இயற்றிய இந்த ஸ்தோத்ரம், தெரிந்தோ தெரியாமலோ செய்த பாவங்களுக்கு மன்னிப்பு கேட்கிறது.",
  },
  {
    tab: 'shlokas', slug: 'devi-kavacham', field: 'brief_intro_ta',
    before: "தேவி மகாத்ம்யத்திலிருந்து (துர்கா சப்தசதி) — நவராத்திரியில் பாராயணம் செய்யும் தேவி கவசம்.",
    after: "தேவி மகாத்ம்யத்திலிருந்து (துர்கா சப்தசதி) எடுக்கப்பட்ட இந்த தேவி கவசம் நவராத்திரியில் பாராயணம் செய்யப்படுகிறது.",
  },
  {
    tab: 'shlokas', slug: 'hanuman-chalisa', field: 'brief_intro_hi',
    before: "तुलसीदास रचित हनुमान चालीसा — भगवान हनुमान की स्तुति में 40 चौपाइयाँ।",
    after: "तुलसीदास रचित हनुमान चालीसा में भगवान हनुमान की स्तुति में 40 चौपाइयाँ हैं।",
  },
  {
    tab: 'shlokas', slug: 'soundarya-lahari', field: 'brief_intro_hi',
    before: "आदि शंकराचार्य द्वारा रचित 100 श्लोक — देवी पार्वती की सुंदरता का वर्णन।",
    after: "आदि शंकराचार्य द्वारा रचित ये 100 श्लोक देवी पार्वती की सुंदरता का वर्णन करते हैं।",
  },
  {
    tab: 'shlokas', slug: 'devi-aparadha-kshama-stotram', field: 'brief_intro_hi',
    before: "आदि शंकराचार्य की रचना — जाने-अनजाने अपराधों के लिए देवी से क्षमायाचना।",
    after: "आदि शंकराचार्य की यह रचना जाने-अनजाने किए अपराधों के लिए देवी से क्षमायाचना करती है।",
  },
  {
    tab: 'shlokas', slug: 'narasimha-kavacham', field: 'brief_intro_hi',
    before: "ब्रह्मांड पुराण से नरसिंह का कवच — शरीर के प्रत्येक अंग की रक्षा के लिए।",
    after: "ब्रह्मांड पुराण से लिया गया नरसिंह का यह कवच शरीर के प्रत्येक अंग की रक्षा करता है।",
  },
  {
    tab: 'shlokas', slug: 'devi-kavacham', field: 'brief_intro_hi',
    before: "देवी महात्म्य (दुर्गा सप्तशती) से — नवरात्रि पर पाठ किया जाने वाला कवच।",
    after: "देवी महात्म्य (दुर्गा सप्तशती) से लिया गया यह कवच नवरात्रि पर पाठ किया जाता है।",
  },
  {
    tab: 'shlokas', slug: 'govinda-namalu', field: 'brief_intro_hi',
    before: 'वेंकटेश्वर की पारंपरिक तेलुगु नामावली — "गोविंदा, गोविंदा!" के साथ समाप्त होने वाले युगल।',
    after: 'वेंकटेश्वर की पारंपरिक तेलुगु नामावली, जिसके युगल "गोविंदा, गोविंदा!" के साथ समाप्त होते हैं।',
  },
  {
    tab: 'shlokas', slug: 'kanda-sashti-kavasam', field: 'brief_intro_hi',
    before: "देवराय स्वामीगल की 19वीं सदी की रचना — मुरुगन का तमिल कवच।",
    after: "देवराय स्वामीगल की यह 19वीं सदी की रचना मुरुगन का तमिल कवच है।",
  },

  // -------------------------- stories_index ----------------------------
  {
    tab: 'stories_index', slug: 'maha-shivaratri-katha', field: 'brief_summary_en',
    before: "The hunter Lubdhaka, trapped by debt, unknowingly performed every rite of Mahashivaratri — fasting, keeping night vigil, and dropping bilva leaves and water onto a hidden Shiva lingam — while sparing a family of deer who begged for time before their fated death. His compassion earned him Shiva's forgiveness and a place in Kailash.",
    after: "The hunter Lubdhaka, trapped by debt, unknowingly performed every rite of Mahashivaratri: fasting, keeping night vigil, and dropping bilva leaves and water onto a hidden Shiva lingam, all while sparing a family of deer who begged for time before their fated death. His compassion earned him Shiva's forgiveness and a place in Kailash.",
  },
  {
    tab: 'stories_index', slug: 'sankashti-chaturthi-katha', field: 'brief_summary_en',
    before: "When Shiva sets a race around the universe to decide which son deserves to be worshipped first, Kartikeya flies off on his peacock while Ganesha simply circles his parents seven times, reasoning that the entire universe resides within them — winning the crown of Vighneshwara and the right of Agrapuja.",
    after: "When Shiva sets a race around the universe to decide which son deserves to be worshipped first, Kartikeya flies off on his peacock while Ganesha simply circles his parents seven times, reasoning that the entire universe resides within them, which wins him the crown of Vighneshwara and the right of Agrapuja.",
  },
  {
    tab: 'stories_index', slug: 'savitri-katha', field: 'brief_summary_en',
    before: "Savitri marries Satyavan knowing he is fated to die within a year; when Yama comes to claim his soul, she follows him into the underworld, wins him over with wit and devotion, and cleverly extracts a boon that can only be fulfilled if her husband lives — restoring Satyavan to life.",
    after: "Savitri marries Satyavan knowing he is fated to die within a year; when Yama comes to claim his soul, she follows him into the underworld, wins him over with wit and devotion, and cleverly extracts a boon that can only be fulfilled if her husband lives, restoring Satyavan to life.",
  },
  {
    tab: 'stories_index', slug: 'mondays-shiva-vratham-katha', field: 'brief_summary_en',
    before: "A childless merchant's wife's unbroken Monday devotion to Shiva and Parvati wins her a son fated to a short life — until her faithful vow itself becomes the grace that saves him.",
    after: "A childless merchant's wife's unbroken Monday devotion to Shiva and Parvati wins her a son fated to a short life, until her faithful vow itself becomes the grace that saves him.",
  },
  {
    tab: 'stories_index', slug: 'maha-shivaratri-katha', field: 'brief_summary_te',
    before: "అప్పుల్లో చిక్కుకున్న లుబ్ధకుడు అనే వేటగాడు, తనకు తెలియకుండానే మహాశివరాత్రి వ్రతంలోని అన్ని నియమాలను — ఉపవాసం, రాత్రి జాగారం, మరియు దాగివున్న శివలింగంపై బిల్వ పత్రాలు, నీటిని జారవిడవడం — పూర్తిచేశాడు; అదే సమయంలో తమ మరణానికి ముందు కొంత సమయం కోరిన జింకల కుటుంబాన్ని కూడా వదిలేశాడు. అతని కరుణ శివుని క్షమాభిక్షను, కైలాసంలో స్థానాన్ని అతనికి తెచ్చిపెట్టింది.",
    after: "అప్పుల్లో చిక్కుకున్న లుబ్ధకుడు అనే వేటగాడు, తనకు తెలియకుండానే మహాశివరాత్రి వ్రతంలోని అన్ని నియమాలను: ఉపవాసం, రాత్రి జాగారం, మరియు దాగివున్న శివలింగంపై బిల్వ పత్రాలు, నీటిని జారవిడవడం వంటివి పూర్తిచేశాడు; అదే సమయంలో తమ మరణానికి ముందు కొంత సమయం కోరిన జింకల కుటుంబాన్ని కూడా వదిలేశాడు. అతని కరుణ శివుని క్షమాభిక్షను, కైలాసంలో స్థానాన్ని అతనికి తెచ్చిపెట్టింది.",
  },
  {
    tab: 'stories_index', slug: 'sankashti-chaturthi-katha', field: 'brief_summary_te',
    before: "మొదట పూజించదగినది ఎవరు అని నిర్ణయించడానికి శివుడు విశ్వం చుట్టూ ఒక పరుగు పెడతాడు; కార్తికేయుడు నెమలిపై ఎగిరిపోగా, గణేశుడు తన తల్లిదండ్రుల చుట్టూ ఏడుసార్లు ప్రదక్షిణ చేసి, మొత్తం విశ్వం వారిలోనే ఉందని వాదిస్తాడు — దీంతో విఘ్నేశ్వరుని కిరీటం, అగ్రపూజ హక్కు గణేశుడికి దక్కుతాయి.",
    after: "మొదట పూజించదగినది ఎవరు అని నిర్ణయించడానికి శివుడు విశ్వం చుట్టూ ఒక పరుగు పెడతాడు; కార్తికేయుడు నెమలిపై ఎగిరిపోగా, గణేశుడు తన తల్లిదండ్రుల చుట్టూ ఏడుసార్లు ప్రదక్షిణ చేసి, మొత్తం విశ్వం వారిలోనే ఉందని వాదిస్తాడు; దీంతో విఘ్నేశ్వరుని కిరీటం, అగ్రపూజ హక్కు గణేశుడికి దక్కుతాయి.",
  },
  {
    tab: 'stories_index', slug: 'savitri-katha', field: 'brief_summary_te',
    before: "సావిత్రి తన భర్త సత్యవంతుడు ఒక సంవత్సరంలో మరణిస్తాడని తెలిసినా అతన్ని వివాహం చేసుకుంటుంది; యముడు అతని ఆత్మను తీసుకువెళ్లడానికి రాగా, ఆమె అతన్ని పాతాళం వరకు వెంబడించి, తన బుద్ధి, భక్తితో యముడిని మెప్పించి, భర్త జీవించి ఉంటేనే నెరవేరే వరం తెలివిగా పొందుతుంది — దీంతో సత్యవంతుడు తిరిగి జీవం పోసుకుంటాడు.",
    after: "సావిత్రి తన భర్త సత్యవంతుడు ఒక సంవత్సరంలో మరణిస్తాడని తెలిసినా అతన్ని వివాహం చేసుకుంటుంది; యముడు అతని ఆత్మను తీసుకువెళ్లడానికి రాగా, ఆమె అతన్ని పాతాళం వరకు వెంబడించి, తన బుద్ధి, భక్తితో యముడిని మెప్పించి, భర్త జీవించి ఉంటేనే నెరవేరే వరం తెలివిగా పొందుతుంది; దీంతో సత్యవంతుడు తిరిగి జీవం పోసుకుంటాడు.",
  },
  {
    tab: 'stories_index', slug: 'mondays-shiva-vratham-katha', field: 'brief_summary_te',
    before: "ఒక సంతానం లేని వర్తకుని భార్య శివపార్వతులను సోమవారాల్లో నిష్ఠగా పూజించి, పన్నెండేళ్లు మాత్రమే జీవించే కుమారుడిని పొందుతుంది—చివరికి ఆమె అచంచల వ్రతమే అతని ప్రాణాలను కాపాడుతుంది.",
    after: "ఒక సంతానం లేని వర్తకుని భార్య శివపార్వతులను సోమవారాల్లో నిష్ఠగా పూజించి, పన్నెండేళ్లు మాత్రమే జీవించే కుమారుడిని పొందుతుంది; చివరికి ఆమె అచంచల వ్రతమే అతని ప్రాణాలను కాపాడుతుంది.",
  },
  {
    tab: 'stories_index', slug: 'maha-shivaratri-katha', field: 'brief_summary_ta',
    before: "கடனில் சிக்கிய லுப்தகன் என்ற வேட்டைக்காரன், தனக்குத் தெரியாமலேயே மகாசிவராத்திரியின் அனைத்து விதிகளையும் — விரதம், இரவு விழிப்பு, மறைந்திருந்த சிவலிங்கத்தின் மீது வில்வ இலைகளும் நீரும் விழச் செய்தல் — நிறைவேற்றினான்; தங்கள் மரணத்திற்கு முன் சிறிது நேரம் கேட்ட மான் குடும்பத்தையும் விட்டுவிட்டான். அவனது கருணை சிவனின் மன்னிப்பையும் கைலாயத்தில் ஒரு இடத்தையும் பெற்றுத் தந்தது.",
    after: "கடனில் சிக்கிய லுப்தகன் என்ற வேட்டைக்காரன், தனக்குத் தெரியாமலேயே மகாசிவராத்திரியின் அனைத்து விதிகளையும்: விரதம், இரவு விழிப்பு, மறைந்திருந்த சிவலிங்கத்தின் மீது வில்வ இலைகளும் நீரும் விழச் செய்தல் ஆகியவற்றை நிறைவேற்றினான்; தங்கள் மரணத்திற்கு முன் சிறிது நேரம் கேட்ட மான் குடும்பத்தையும் விட்டுவிட்டான். அவனது கருணை சிவனின் மன்னிப்பையும் கைலாயத்தில் ஒரு இடத்தையும் பெற்றுத் தந்தது.",
  },
  {
    tab: 'stories_index', slug: 'sankashti-chaturthi-katha', field: 'brief_summary_ta',
    before: "முதலில் யாரை வழிபடவேண்டும் என்பதை தீர்மானிக்க சிவன் பிரபஞ்சம் முழுவதும் ஒரு பந்தயத்தை ஏற்பாடு செய்கிறார்; கார்த்திகேயன் தனது மயிலில் பறந்து செல்ல, கணேசன் தன் பெற்றோரை ஏழு முறை வலம் வந்து, முழு பிரபஞ்சமும் அவர்களுக்குள் இருக்கிறது என வாதிடுகிறார் — இதனால் விக்னேஸ்வரர் பட்டமும் அக்ரபூஜை உரிமையும் கணேசனுக்கு கிடைக்கின்றன.",
    after: "முதலில் யாரை வழிபடவேண்டும் என்பதை தீர்மானிக்க சிவன் பிரபஞ்சம் முழுவதும் ஒரு பந்தயத்தை ஏற்பாடு செய்கிறார்; கார்த்திகேயன் தனது மயிலில் பறந்து செல்ல, கணேசன் தன் பெற்றோரை ஏழு முறை வலம் வந்து, முழு பிரபஞ்சமும் அவர்களுக்குள் இருக்கிறது என வாதிடுகிறார்; இதனால் விக்னேஸ்வரர் பட்டமும் அக்ரபூஜை உரிமையும் கணேசனுக்கு கிடைக்கின்றன.",
  },
  {
    tab: 'stories_index', slug: 'savitri-katha', field: 'brief_summary_ta',
    before: "சாவித்திரி தன் கணவன் சத்தியவான் ஒரு வருடத்தில் இறப்பான் என்று அறிந்தே அவனை மணக்கிறாள்; யமன் அவனது ஆன்மாவை எடுக்க வர, அவள் அவனை பாதாளம் வரை பின்தொடர்ந்து, தன் புத்திசாலித்தனத்தாலும் பக்தியாலும் யமனை வசப்படுத்தி, கணவன் உயிருடன் இருந்தால் மட்டுமே நிறைவேறும் வரத்தை புத்திசாலித்தனமாக பெறுகிறாள் — இதனால் சத்தியவான் மீண்டும் உயிர் பெறுகிறான்.",
    after: "சாவித்திரி தன் கணவன் சத்தியவான் ஒரு வருடத்தில் இறப்பான் என்று அறிந்தே அவனை மணக்கிறாள்; யமன் அவனது ஆன்மாவை எடுக்க வர, அவள் அவனை பாதாளம் வரை பின்தொடர்ந்து, தன் புத்திசாலித்தனத்தாலும் பக்தியாலும் யமனை வசப்படுத்தி, கணவன் உயிருடன் இருந்தால் மட்டுமே நிறைவேறும் வரத்தை புத்திசாலித்தனமாக பெறுகிறாள்; இதனால் சத்தியவான் மீண்டும் உயிர் பெறுகிறான்.",
  },
  {
    tab: 'stories_index', slug: 'mondays-shiva-vratham-katha', field: 'brief_summary_ta',
    before: "மகவற்ற வணிகனின் மனைவி திங்கள்தோறும் சிவபார்வதியை பக்தியுடன் வழிபட்டு, பன்னிரண்டு ஆண்டுகள் மட்டுமே வாழும் மகனைப் பெறுகிறாள்—இறுதியில் அவளது உறுதியான விரதமே அவனது உயிரைக் காக்கிறது.",
    after: "மகவற்ற வணிகனின் மனைவி திங்கள்தோறும் சிவபார்வதியை பக்தியுடன் வழிபட்டு, பன்னிரண்டு ஆண்டுகள் மட்டுமே வாழும் மகனைப் பெறுகிறாள்; இறுதியில் அவளது உறுதியான விரதமே அவனது உயிரைக் காக்கிறது.",
  },
  {
    tab: 'stories_index', slug: 'maha-shivaratri-katha', field: 'brief_summary_hi',
    before: "कर्ज में फंसे शिकारी लुब्धक ने बिना जाने ही महाशिवरात्रि के सभी विधान — व्रत, रात्रि जागरण, और छिपे हुए शिवलिंग पर बेल पत्र व जल का गिरना — पूरे कर दिए; साथ ही उसने अपनी मृत्यु से पहले कुछ समय माँगने वाले मृगों के परिवार को भी छोड़ दिया। उसकी करुणा ने उसे शिव की क्षमा और कैलाश में स्थान दिलाया।",
    after: "कर्ज में फंसे शिकारी लुब्धक ने बिना जाने ही महाशिवरात्रि के सभी विधान: व्रत, रात्रि जागरण, और छिपे हुए शिवलिंग पर बेल पत्र व जल चढ़ाना, पूरे कर दिए; साथ ही उसने अपनी मृत्यु से पहले कुछ समय माँगने वाले मृगों के परिवार को भी छोड़ दिया। उसकी करुणा ने उसे शिव की क्षमा और कैलाश में स्थान दिलाया।",
  },
  {
    tab: 'stories_index', slug: 'sankashti-chaturthi-katha', field: 'brief_summary_hi',
    before: "किसे पहले पूजा जाए यह तय करने के लिए शिव ब्रह्मांड की परिक्रमा की दौड़ रखते हैं; कार्तिकेय अपने मोर पर उड़ जाते हैं, जबकि गणेश अपने माता-पिता की सात बार परिक्रमा करके तर्क देते हैं कि संपूर्ण ब्रह्मांड उन्हीं में समाहित है — इससे गणेश को विघ्नेश्वर का ताज और अग्रपूजा का अधिकार मिलता है।",
    after: "किसे पहले पूजा जाए यह तय करने के लिए शिव ब्रह्मांड की परिक्रमा की दौड़ रखते हैं; कार्तिकेय अपने मोर पर उड़ जाते हैं, जबकि गणेश अपने माता-पिता की सात बार परिक्रमा करके तर्क देते हैं कि संपूर्ण ब्रह्मांड उन्हीं में समाहित है; इससे गणेश को विघ्नेश्वर का ताज और अग्रपूजा का अधिकार मिलता है।",
  },
  {
    tab: 'stories_index', slug: 'savitri-katha', field: 'brief_summary_hi',
    before: "सावित्री जानते हुए भी कि सत्यवान की मृत्यु एक वर्ष में होगी, उनसे विवाह करती हैं; यम जब उनकी आत्मा लेने आते हैं, तो वे उनके पीछे पाताल तक जाती हैं, अपनी बुद्धि और भक्ति से यम को प्रभावित करती हैं, और चतुराई से ऐसा वरदान माँगती हैं जो केवल पति के जीवित रहने पर ही पूर्ण हो सकता है — इस प्रकार सत्यवान पुनः जीवित हो जाते हैं।",
    after: "सावित्री जानते हुए भी कि सत्यवान की मृत्यु एक वर्ष में होगी, उनसे विवाह करती हैं; यम जब उनकी आत्मा लेने आते हैं, तो वे उनके पीछे पाताल तक जाती हैं, अपनी बुद्धि और भक्ति से यम को प्रभावित करती हैं, और चतुराई से ऐसा वरदान माँगती हैं जो केवल पति के जीवित रहने पर ही पूर्ण हो सकता है, जिससे सत्यवान पुनः जीवित हो जाते हैं।",
  },
  {
    tab: 'stories_index', slug: 'mondays-shiva-vratham-katha', field: 'brief_summary_hi',
    before: "एक निःसंतान व्यापारी की पत्नी हर सोमवार शिव-पार्वती की अटूट भक्ति से पूजा करती है और उसे केवल बारह वर्ष जीने वाला पुत्र प्राप्त होता है—अंततः उसका अडिग व्रत ही उसके पुत्र के प्राणों की रक्षा करता है।",
    after: "एक निःसंतान व्यापारी की पत्नी हर सोमवार शिव-पार्वती की अटूट भक्ति से पूजा करती है और उसे केवल बारह वर्ष जीने वाला पुत्र प्राप्त होता है; अंततः उसका अडिग व्रत ही उसके पुत्र के प्राणों की रक्षा करता है।",
  },

  // ----------------------------- vrathams -------------------------------
  {
    tab: 'vrathams', slug: 'maha-shivaratri', field: 'fasting_rules_en',
    before: "Fast from sunrise on Mahashivratri until the next morning. A nirjala fast is ideal; fruits and milk are permitted for those unable to fast completely. Four abhishekams are performed throughout the night — at 9 PM, midnight, 3 AM, and 6 AM. No sleep allowed.",
    after: "Fast from sunrise on Mahashivratri until the next morning. A nirjala fast is ideal; fruits and milk are permitted for those unable to fast completely. Four abhishekams are performed throughout the night: at 9 PM, midnight, 3 AM, and 6 AM. No sleep allowed.",
  },
  {
    tab: 'vrathams', slug: 'santoshi-mata', field: 'fasting_rules_en',
    before: "Fast every Friday for 16 consecutive weeks. Avoid sour foods entirely (lemon, tamarind, curd) — this is the most critical rule. Take only fruits and milk until the evening puja. Break fast after offering gur-chana to the goddess.",
    after: "Fast every Friday for 16 consecutive weeks. Avoid sour foods entirely (lemon, tamarind, curd); this is the most critical rule. Take only fruits and milk until the evening puja. Break fast after offering gur-chana to the goddess.",
  },
  {
    tab: 'vrathams', slug: 'hartalika-teej', field: 'fasting_rules_en',
    before: "Absolute 24-hour nirjala (no water, no food) fast. All-night vigil is mandatory — sleeping breaks the vrat. Women mold sand idols of Shiva-Parvati by hand. Fast ends the next morning after idol immersion.",
    after: "Absolute 24-hour nirjala (no water, no food) fast. All-night vigil is mandatory, since sleeping breaks the vrat. Women mold sand idols of Shiva-Parvati by hand. Fast ends the next morning after idol immersion.",
  },
  {
    tab: 'vrathams', slug: 'chhath-puja', field: 'fasting_rules_en',
    before: "4-day ritual including 36-hour continuous waterless fast. Day 1: bathe in river, single pure meal. Day 2: fast all day, break at sunset with jaggery-kheer — then 36-hour nirjala begins. Days 3-4: arghya offerings to setting and rising sun while standing waist-deep in water.",
    after: "4-day ritual including 36-hour continuous waterless fast. Day 1: bathe in river, single pure meal. Day 2: fast all day, break at sunset with jaggery-kheer, then begin the 36-hour nirjala. Days 3-4: arghya offerings to setting and rising sun while standing waist-deep in water.",
  },
  {
    tab: 'vrathams', slug: 'sankashti-chaturthi-vratham', field: 'fasting_rules_en',
    before: "Monthly fast on Krishna Paksha Chaturthi. Take only fruits and milk until moonrise. The fast must be broken strictly after viewing the moon and offering arghya. Offer 21 durva bundles and 21 modaks — these are mandatory.",
    after: "Monthly fast on Krishna Paksha Chaturthi. Take only fruits and milk until moonrise. The fast must be broken strictly after viewing the moon and offering arghya. Offering 21 durva bundles and 21 modaks is mandatory.",
  },
  {
    tab: 'vrathams', slug: 'hartalika-teej', field: 'fasting_rules_te',
    before: "పూర్తి 24 గంటల నిర్జల ఉపవాసం. రాత్రి మొత్తం జాగరం తప్పనిసరి — నిద్రపోతే వ్రతం భంగమవుతుంది. ఆడవారు చేతులతో మట్టి శివ-పార్వతి విగ్రహాలు తయారు చేస్తారు.",
    after: "పూర్తి 24 గంటల నిర్జల ఉపవాసం. రాత్రి మొత్తం జాగరం తప్పనిసరి, ఎందుకంటే నిద్రపోతే వ్రతం భంగమవుతుంది. ఆడవారు చేతులతో మట్టి శివ-పార్వతి విగ్రహాలు తయారు చేస్తారు.",
  },
  {
    tab: 'vrathams', slug: 'hartalika-teej', field: 'fasting_rules_ta',
    before: "முழுமையான 24 மணி நேர நிர்ஜல உபவாசம். இரவு முழுவதும் விழிப்புடன் இருக்க வேண்டும் — தூக்கம் விரதத்தை கலைக்கும். பெண்கள் கையால் மண் சிவ-பார்வதி சிலைகள் செய்கிறார்கள்.",
    after: "முழுமையான 24 மணி நேர நிர்ஜல உபவாசம். இரவு முழுவதும் விழிப்புடன் இருக்க வேண்டும், ஏனெனில் தூக்கம் விரதத்தை கலைக்கும். பெண்கள் கையால் மண் சிவ-பார்வதி சிலைகள் செய்கிறார்கள்.",
  },
  {
    tab: 'vrathams', slug: 'hartalika-teej', field: 'fasting_rules_hi',
    before: "पूर्ण 24 घंटे का निर्जला व्रत। रात भर जागरण अनिवार्य — सोने से व्रत टूटता है। महिलाएं हाथ से मिट्टी के शिव-पार्वती बनाती हैं।",
    after: "पूर्ण 24 घंटे का निर्जला व्रत। रात भर जागरण अनिवार्य है, क्योंकि सोने से व्रत टूटता है। महिलाएं हाथ से मिट्टी के शिव-पार्वती बनाती हैं।",
  },
  {
    tab: 'vrathams', slug: 'sankashti-chaturthi-vratham', field: 'benefits_en',
    before: "Monthly obstacle removal — dissolves material blockages, financial difficulties, health crises, and family disputes. The Angarki Chaturthi (when it falls on Tuesday) is especially powerful for clearing debts.",
    after: "Monthly obstacle removal: dissolves material blockages, financial difficulties, health crises, and family disputes. The Angarki Chaturthi (when it falls on Tuesday) is especially powerful for clearing debts.",
  },
  {
    tab: 'vrathams', slug: 'dhanurmasa-vratam', field: 'benefits_en',
    before: "Blesses unmarried devotees with a virtuous and compatible life partner, removing obstacles to marriage. Awakens deep devotion, inner peace, and divine consciousness. Eliminates obstacles in career, education, and personal life through Lord Vishnu's grace. Brings health, wealth, and Lakshmi's blessings to the household. Grants liberation (Moksha) — release from the cycle of birth and death.",
    after: "Blesses unmarried devotees with a virtuous and compatible life partner, removing obstacles to marriage. Awakens deep devotion, inner peace, and divine consciousness. Eliminates obstacles in career, education, and personal life through Lord Vishnu's grace. Brings health, wealth, and Lakshmi's blessings to the household. Grants liberation (Moksha), release from the cycle of birth and death.",
  },
  {
    tab: 'vrathams', slug: 'sankashti-chaturthi-vratham', field: 'benefits_te',
    before: "నెలవారీ అడ్డంకులు తొలగుతాయి — ఆర్థిక సమస్యలు, ఆరోగ్య సంక్షోభాలు, కుటుంబ కలహాలు పరిష్కారమవుతాయి. అంగారకి చతుర్థి అప్పులు తీర్చడానికి ప్రత్యేకంగా శక్తివంతమైనది.",
    after: "నెలవారీ అడ్డంకులు తొలగుతాయి: ఆర్థిక సమస్యలు, ఆరోగ్య సంక్షోభాలు, కుటుంబ కలహాలు పరిష్కారమవుతాయి. అంగారకి చతుర్థి అప్పులు తీర్చడానికి ప్రత్యేకంగా శక్తివంతమైనది.",
  },
  {
    tab: 'vrathams', slug: 'sankashti-chaturthi-vratham', field: 'benefits_hi',
    before: "मासिक बाधाएं दूर होती हैं — आर्थिक मुश्किलें, स्वास्थ्य संकट, पारिवारिक विवाद हल होते हैं। अंगारकी चतुर्थी ऋण मुक्ति के लिए विशेष शक्तिशाली।",
    after: "मासिक बाधाएं दूर होती हैं: आर्थिक मुश्किलें, स्वास्थ्य संकट, पारिवारिक विवाद हल होते हैं। अंगारकी चतुर्थी ऋण मुक्ति के लिए विशेष शक्तिशाली।",
  },
  {
    tab: 'vrathams', slug: 'maha-shivaratri', field: 'next_occurrence_note_en',
    before: "Feb/Mar — 14th night of waning moon in Phalguna month",
    after: "Feb/Mar: 14th night of waning moon in Phalguna month",
  },
  {
    tab: 'vrathams', slug: 'savitri-vratham', field: 'next_occurrence_note_en',
    before: "May/Jun — Amavasya or Purnima of Jyeshtha month (varies by region)",
    after: "May/Jun: Amavasya or Purnima of Jyeshtha month (varies by region)",
  },
  {
    tab: 'vrathams', slug: 'kedareswara-vratham', field: 'observance_day',
    before: "Tritiya of Bhadrapada — 21 consecutive days",
    after: "Tritiya of Bhadrapada, for 21 consecutive days",
  },
];

async function main() {
  const sheets = await getSheetsClient();
  const byTab = new Map();
  for (const fix of FIXES) {
    if (!byTab.has(fix.tab)) byTab.set(fix.tab, []);
    byTab.get(fix.tab).push(fix);
  }

  let totalChanged = 0;
  let totalSkipped = 0;

  for (const [tab, fixes] of byTab) {
    console.log(`\n=== TAB: ${tab} ===`);
    const { headers, rows, col } = await getTabWithHeaders(tab);
    const slugCol = col('slug');

    for (const fix of fixes) {
      const fieldCol = col(fix.field);
      const rowIdx = rows.findIndex(r => r[slugCol] === fix.slug);
      if (rowIdx === -1) {
        console.log(`  [SKIP] slug="${fix.slug}" field=${fix.field}: row not found`);
        totalSkipped++;
        continue;
      }
      const rowNum = rowIdx + 2;
      const liveVal = rows[rowIdx][fieldCol] || '';

      if (liveVal !== fix.before) {
        console.log(`  [SKIP] slug="${fix.slug}" field=${fix.field}: live value doesn't match expected "before" (sheet may have changed since research). Leaving untouched.`);
        console.log(`    live:     ${JSON.stringify(liveVal)}`);
        console.log(`    expected: ${JSON.stringify(fix.before)}`);
        totalSkipped++;
        continue;
      }

      console.log(`  --- slug="${fix.slug}" field=${fix.field} row=${rowNum} ---`);
      console.log(`  OLD: ${liveVal}`);
      console.log(`  NEW: ${fix.after}`);

      if (!APPLY) {
        console.log(`    (dry run — pass --write to apply)`);
        totalChanged++;
        continue;
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${tab}!${colLetter(fieldCol)}${rowNum}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[fix.after]] },
      });
      console.log(`    ✓ written`);
      totalChanged++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`${APPLY ? 'Applied' : 'Would apply'}: ${totalChanged} cell(s)`);
  console.log(`Skipped: ${totalSkipped} cell(s)`);
  if (!APPLY) {
    console.log(`\nThis was a DRY RUN. Pass --write to apply these changes.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
