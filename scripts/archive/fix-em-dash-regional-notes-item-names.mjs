/**
 * One-off mop-up fix for em-dashes left behind by an earlier em-dash-removal
 * pass on festivals/pujas/material_items. Scope (confirmed live against the
 * Sheet, 42 cells total):
 *
 *   1. festivals.regional_notes_en                          (2 cells)
 *   2. pujas.regional_variation_notes_en/te/ta/hi            (16 cells)
 *   3. material_items.item_name_en/te/ta/hi                  (24 cells)
 *
 * (1) and (2) are prose paragraphs -> restructured into natural grammatical
 * prose per language (colon/semicolon/parenthetical/connector), not a
 * mechanical delete-and-glue. (3) is short item-name labels following a
 * "Label — description" pattern -> converted to "Label: description",
 * matching the title/subtitle convention used elsewhere on the site.
 *
 * festivals/pujas rows are matched by `slug`. material_items has no slug
 * column, so rows are matched by (group_slug, item_order).
 *
 * Only the named columns are ever written to. In particular this script
 * never touches material_items.quantity_* or substitution_note_* (handled
 * in an earlier pass).
 *
 * Dry-run by default. Pass --write to apply. (This run must NOT use --write;
 * the calling agent is required to leave --write unused and report the diff
 * for manual review.)
 */
import { getTabWithHeaders, getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

// ---------------------------------------------------------------------------
// 1. festivals.regional_notes_en
// ---------------------------------------------------------------------------
const festivalFixes = [
  {
    slug: 'rath-yatra',
    field: 'regional_notes_en',
    oldValue:
      'The festival originates from Puri, Odisha and is now celebrated globally. Lord Jagannath is a unique form — wooden icon without arms, representing the universal, formless aspect of Krishna. The "Juggernaut" in English is derived from Jagannath.',
    newValue:
      'The festival originates from Puri, Odisha and is now celebrated globally. Lord Jagannath takes a unique form: a wooden icon without arms, representing the universal, formless aspect of Krishna. The "Juggernaut" in English is derived from Jagannath.',
  },
  {
    slug: 'karthigai-deepam',
    field: 'regional_notes_en',
    oldValue:
      'Primarily a Tamil festival. The Tiruvannamalai Deepam draws millions of pilgrims. The Arunachala hill itself is worshipped as Shiva — circumambulation (Girivalam) of the hill is performed by hundreds of thousands, especially on full moon nights.',
    newValue:
      'Primarily a Tamil festival. The Tiruvannamalai Deepam draws millions of pilgrims. The Arunachala hill itself is worshipped as Shiva, where circumambulation (Girivalam) of the hill is performed by hundreds of thousands, especially on full moon nights.',
  },
];

// ---------------------------------------------------------------------------
// 2. pujas.regional_variation_notes_en/te/ta/hi
// ---------------------------------------------------------------------------
const pujaFixes = [
  // shiva-puja
  {
    slug: 'shiva-puja',
    field: 'regional_variation_notes_en',
    oldValue:
      'North India (UP/Bihar/Uttarakhand): Jalabhisheka with Ganga water on Mondays is extremely common; Shiva temples are thronged on Shravan Mondays. South India: Lingashtakam and Shiva Panchakshara Stotram are standard; bilva is mandatory. Tamil Nadu (Shaiva tradition): Thevaram (Devaram) passages are recited in addition to Sanskrit texts. In many regions, Mahashivratri involves night-long vigil, 4-yama pujas (once every 3 hours through the night), and bilva archana with the 1008 names. Note: Kumkum is not applied to Shiva in standard Shaiva practice — vibhuti alone.',
    newValue:
      'North India (UP/Bihar/Uttarakhand): Jalabhisheka with Ganga water on Mondays is extremely common; Shiva temples are thronged on Shravan Mondays. South India: Lingashtakam and Shiva Panchakshara Stotram are standard; bilva is mandatory. Tamil Nadu (Shaiva tradition): Thevaram (Devaram) passages are recited in addition to Sanskrit texts. In many regions, Mahashivratri involves night-long vigil, 4-yama pujas (once every 3 hours through the night), and bilva archana with the 1008 names. Note: Kumkum is not applied to Shiva in standard Shaiva practice; vibhuti alone is used.',
  },
  {
    slug: 'shiva-puja',
    field: 'regional_variation_notes_te',
    oldValue:
      'ఉత్తర భారతం (యూపి/బిహార్/ఉత్తరాఖండ్): సోమవారాలలో గంగాజలంతో జలాభిషేకం చాలా సాధారణం; శ్రావణ సోమవారాలలో శివ దేవాలయాలు జనంతో నిండిపోతాయి. దక్షిణ భారతం: లింగాష్టకం మరియు శివ పంచాక్షర స్తోత్రం సాధారణ పాఠాలు; బిల్వం తప్పనిసరి. తమిళనాడు (శైవ సంప్రదాయం): సంస్కృత పాఠాలతో పాటు తేవారం (దేవారం) వాక్యాలు పఠిస్తారు. చాలా ప్రాంతాలలో మహాశివరాత్రి రాత్రంతా జాగరణ, 4 యామ పూజలు (రాత్రంతా మూడు గంటలకు ఒకసారి), మరియు 1008 నామాలతో బిల్వ అర్చన ఉంటాయి. గమనిక: సాధారణ శైవ ఆచారంలో శివుడికి కుంకుమ పూయకూడదు — విభూతి మాత్రమే.',
    newValue:
      'ఉత్తర భారతం (యూపి/బిహార్/ఉత్తరాఖండ్): సోమవారాలలో గంగాజలంతో జలాభిషేకం చాలా సాధారణం; శ్రావణ సోమవారాలలో శివ దేవాలయాలు జనంతో నిండిపోతాయి. దక్షిణ భారతం: లింగాష్టకం మరియు శివ పంచాక్షర స్తోత్రం సాధారణ పాఠాలు; బిల్వం తప్పనిసరి. తమిళనాడు (శైవ సంప్రదాయం): సంస్కృత పాఠాలతో పాటు తేవారం (దేవారం) వాక్యాలు పఠిస్తారు. చాలా ప్రాంతాలలో మహాశివరాత్రి రాత్రంతా జాగరణ, 4 యామ పూజలు (రాత్రంతా మూడు గంటలకు ఒకసారి), మరియు 1008 నామాలతో బిల్వ అర్చన ఉంటాయి. గమనిక: సాధారణ శైవ ఆచారంలో శివుడికి కుంకుమ పూయకూడదు; విభూతి మాత్రమే ఉపయోగిస్తారు.',
  },
  {
    slug: 'shiva-puja',
    field: 'regional_variation_notes_ta',
    oldValue:
      'வட இந்தியா (யூபி/பீகார்/உத்தராகண்ட்): திங்கள்கிழமைகளில் கங்கா ஜலத்தால் ஜலாபிஷேகம் மிகவும் வழக்கமானது; சாவன் திங்கள்கிழமைகளில் சிவன் கோயில்கள் நிரம்பி வழிகின்றன. தென்னிந்தியா: லிங்காஷ்டகம் மற்றும் சிவ பஞ்சாட்சர ஸ்தோத்திரம் வழக்கமான பாட்டாக உள்ளன; வில்வம் கட்டாயம். தமிழ்நாடு (சைவ பாரம்பரியம்): சமஸ்கிருத நூல்களுடன் தேவாரம் வாக்கியங்களும் ஓதப்படுகின்றன. பல பகுதிகளில் மஹாசிவராத்திரியில் இரவு முழுவதும் விழிப்பு, 4 யாம பூஜைகள் (இரவு மூன்று மணி நேரத்திற்கு ஒருமுறை), மற்றும் 1008 நாமங்களுடன் வில்வ அர்ச்சனை நடைபெறுகின்றன. குறிப்பு: சாதாரண சைவ நடைமுறையில் சிவனுக்கு குங்குமம் இடப்படுவதில்லை — திருநீறு மட்டுமே.',
    newValue:
      'வட இந்தியா (யூபி/பீகார்/உத்தராகண்ட்): திங்கள்கிழமைகளில் கங்கா ஜலத்தால் ஜலாபிஷேகம் மிகவும் வழக்கமானது; சாவன் திங்கள்கிழமைகளில் சிவன் கோயில்கள் நிரம்பி வழிகின்றன. தென்னிந்தியா: லிங்காஷ்டகம் மற்றும் சிவ பஞ்சாட்சர ஸ்தோத்திரம் வழக்கமான பாட்டாக உள்ளன; வில்வம் கட்டாயம். தமிழ்நாடு (சைவ பாரம்பரியம்): சமஸ்கிருத நூல்களுடன் தேவாரம் வாக்கியங்களும் ஓதப்படுகின்றன. பல பகுதிகளில் மஹாசிவராத்திரியில் இரவு முழுவதும் விழிப்பு, 4 யாம பூஜைகள் (இரவு மூன்று மணி நேரத்திற்கு ஒருமுறை), மற்றும் 1008 நாமங்களுடன் வில்வ அர்ச்சனை நடைபெறுகின்றன. குறிப்பு: சாதாரண சைவ நடைமுறையில் சிவனுக்கு குங்குமம் இடப்படுவதில்லை; திருநீறு மட்டுமே பயன்படுத்தப்படுகிறது.',
  },
  {
    slug: 'shiva-puja',
    field: 'regional_variation_notes_hi',
    oldValue:
      'उत्तर भारत (UP/बिहार/उत्तराखंड): सोमवार को गंगाजल से जलाभिषेक बहुत प्रचलित है; श्रावण सोमवार को शिव मंदिरों में भीड़ रहती है। दक्षिण भारत: लिंगाष्टकम और शिव पंचाक्षर स्तोत्र मानक हैं; बिल्व अनिवार्य है। तमिलनाडु (शैव परंपरा): संस्कृत ग्रंथों के साथ तेवारम (देवारम) के अंश पढ़े जाते हैं। कई क्षेत्रों में महाशिवरात्रि में रात भर जागरण, 4 याम पूजाएं (रात में हर 3 घंटे), और 1008 नामों से बिल्व अर्चना होती है। नोट: मानक शैव प्रथा में शिव पर कुमकुम नहीं लगाया जाता — केवल विभूति।',
    newValue:
      'उत्तर भारत (UP/बिहार/उत्तराखंड): सोमवार को गंगाजल से जलाभिषेक बहुत प्रचलित है; श्रावण सोमवार को शिव मंदिरों में भीड़ रहती है। दक्षिण भारत: लिंगाष्टकम और शिव पंचाक्षर स्तोत्र मानक हैं; बिल्व अनिवार्य है। तमिलनाडु (शैव परंपरा): संस्कृत ग्रंथों के साथ तेवारम (देवारम) के अंश पढ़े जाते हैं। कई क्षेत्रों में महाशिवरात्रि में रात भर जागरण, 4 याम पूजाएं (रात में हर 3 घंटे), और 1008 नामों से बिल्व अर्चना होती है। नोट: मानक शैव प्रथा में शिव पर कुमकुम नहीं लगाया जाता; केवल विभूति लगाई जाती है।',
  },
  // subrahmanya-puja
  {
    slug: 'subrahmanya-puja',
    field: 'regional_variation_notes_en',
    oldValue:
      'Tamil Nadu: Murugan is the patron deity of Tamil Nadu; Sashti (sixth tithi) is the primary fasting and puja day. Kanda Sashti Kavasam and Thirupugazh are recited. Panakam (jaggery-water-cardamom drink) and vadai (fried lentil donut) are traditional offerings at Murugan temples. The six sacred abodes (Arupadai Veedu) — Tiruchendur, Palani, Swamimalai, Thiruparankundram, Pazhamudircholai, Thiruttani — are key pilgrimage sites. AP/TG: Known as Subrahmanya or Karthikeya; Friday puja on every Shukravara; peacock feathers and vel are used. Karnataka: Subrahmanya temples often combine snake worship (Sarpa Devata aspect); Kukke Subrahmanya is a major pilgrimage temple. Maharashtra/North India: Kartikeya is worshipped mainly on Sashti; less prevalent as a daily puja deity. The home puja described here is the simplified Friday/Sashti form.',
    newValue:
      'Tamil Nadu: Murugan is the patron deity of Tamil Nadu; Sashti (sixth tithi) is the primary fasting and puja day. Kanda Sashti Kavasam and Thirupugazh are recited. Panakam (jaggery-water-cardamom drink) and vadai (fried lentil donut) are traditional offerings at Murugan temples. The six sacred abodes (Arupadai Veedu), namely Tiruchendur, Palani, Swamimalai, Thiruparankundram, Pazhamudircholai, and Thiruttani, are key pilgrimage sites. AP/TG: Known as Subrahmanya or Karthikeya; Friday puja on every Shukravara; peacock feathers and vel are used. Karnataka: Subrahmanya temples often combine snake worship (Sarpa Devata aspect); Kukke Subrahmanya is a major pilgrimage temple. Maharashtra/North India: Kartikeya is worshipped mainly on Sashti; less prevalent as a daily puja deity. The home puja described here is the simplified Friday/Sashti form.',
  },
  {
    slug: 'subrahmanya-puja',
    field: 'regional_variation_notes_te',
    oldValue:
      'తమిళనాడు: మురుగన్ తమిళనాడు ఆరాధ్య దైవం; షష్టి (ఆరవ తిథి) ప్రధాన ఉపవాస మరియు పూజ రోజు. కందసష్టి కవసం మరియు తిరుపుకழ் పఠిస్తారు. పానకం (బెల్లం-నీళ్ళు-యాలకులు) మరియు వడ మురుగన్ దేవాలయాల్లో సాంప్రదాయ నైవేద్యాలు. ఆరుపడై వీడు — తిరుచెందూర్, పళని, స్వామిమలై, తిరుపరంగుంద్రం, పళముడిర్‌చోలై, తిరుత్తణి — ముఖ్యమైన యాత్రా స్థలాలు. AP/TG: సుబ్రహ్మణ్య లేదా కార్తికేయుడు అని పిలుస్తారు; ప్రతి శుక్రవారం పూజ; నెమలి ఈకలు మరియు వేల్ ఉపయోగిస్తారు. కర్ణాటక: సుబ్రహ్మణ్య దేవాలయాల్లో తరచుగా సర్పదేవత ఆరాధన కూడా జరుగుతుంది; కుక్కే సుబ్రహ్మణ్య ముఖ్య పుణ్యక్షేత్రం. మహారాష్ట్ర/ఉత్తర భారతం: కార్తికేయుని ప్రధానంగా షష్టిలో పూజిస్తారు; నిత్య పూజ దైవంగా తక్కువ ప్రచారంలో ఉన్నారు. ఇక్కడ వివరించిన గృహ పూజ సరళీకృత శుక్రవారం/షష్టి రూపం.',
    newValue:
      'తమిళనాడు: మురుగన్ తమిళనాడు ఆరాధ్య దైవం; షష్టి (ఆరవ తిథి) ప్రధాన ఉపవాస మరియు పూజ రోజు. కందసష్టి కవసం మరియు తిరుపుకழ் పఠిస్తారు. పానకం (బెల్లం-నీళ్ళు-యాలకులు) మరియు వడ మురుగన్ దేవాలయాల్లో సాంప్రదాయ నైవేద్యాలు. ఆరుపడై వీడు: తిరుచెందూర్, పళని, స్వామిమలై, తిరుపరంగుంద్రం, పళముడిర్‌చోలై, తిరుత్తణి ముఖ్యమైన యాత్రా స్థలాలు. AP/TG: సుబ్రహ్మణ్య లేదా కార్తికేయుడు అని పిలుస్తారు; ప్రతి శుక్రవారం పూజ; నెమలి ఈకలు మరియు వేల్ ఉపయోగిస్తారు. కర్ణాటక: సుబ్రహ్మణ్య దేవాలయాల్లో తరచుగా సర్పదేవత ఆరాధన కూడా జరుగుతుంది; కుక్కే సుబ్రహ్మణ్య ముఖ్య పుణ్యక్షేత్రం. మహారాష్ట్ర/ఉత్తర భారతం: కార్తికేయుని ప్రధానంగా షష్టిలో పూజిస్తారు; నిత్య పూజ దైవంగా తక్కువ ప్రచారంలో ఉన్నారు. ఇక్కడ వివరించిన గృహ పూజ సరళీకృత శుక్రవారం/షష్టి రూపం.',
  },
  {
    slug: 'subrahmanya-puja',
    field: 'regional_variation_notes_ta',
    oldValue:
      'தமிழ்நாடு: முருகன் தமிழ்நாட்டின் குலதெய்வம்; சஷ்டி (ஆறாவது திதி) முக்கிய விரதம் மற்றும் பூஜை நாள். கந்த சஷ்டி கவசமும் திருப்புகழும் ஓதப்படுகின்றன. பானகம் (வெல்லம்-நீர்-ஏலக்காய்) மற்றும் வடை முருகன் கோயில்களில் மரபான காணிக்கைகள். ஆறுபடை வீடு — திருசெந்தூர், பழனி, சுவாமிமலை, திருப்பரங்குன்றம், பழமுதிர்ச்சோலை, திருத்தணி — முக்கிய யாத்திரை தலங்கள். AP/TG: சுப்பிரமண்ய அல்லது கார்த்திகேயன் என்று அழைக்கப்படுகிறார்; ஒவ்வொரு வெள்ளிக்கிழமையும் பூஜை; மயில் தோகைகளும் வேலும் பயன்படுத்தப்படுகின்றன. கர்நாடகா: சுப்பிரமண்ய கோயில்களில் பெரும்பாலும் சர்ப்ப தேவதை வழிபாடும் இணைக்கப்படுகிறது; குக்கே சுப்பிரமண்ய முக்கிய யாத்திரை தலம். மகாராஷ்டிரா/வட இந்தியா: கார்த்திகேயன் முக்கியமாக சஷ்டியில் வழிபடப்படுகிறார். இங்கு விவரிக்கப்பட்ட வீட்டு பூஜை எளிமையான வெள்ளி/சஷ்டி வடிவம்.',
    newValue:
      'தமிழ்நாடு: முருகன் தமிழ்நாட்டின் குலதெய்வம்; சஷ்டி (ஆறாவது திதி) முக்கிய விரதம் மற்றும் பூஜை நாள். கந்த சஷ்டி கவசமும் திருப்புகழும் ஓதப்படுகின்றன. பானகம் (வெல்லம்-நீர்-ஏலக்காய்) மற்றும் வடை முருகன் கோயில்களில் மரபான காணிக்கைகள். ஆறுபடை வீடு: திருசெந்தூர், பழனி, சுவாமிமலை, திருப்பரங்குன்றம், பழமுதிர்ச்சோலை, திருத்தணி ஆகியவை முக்கிய யாத்திரை தலங்கள். AP/TG: சுப்பிரமண்ய அல்லது கார்த்திகேயன் என்று அழைக்கப்படுகிறார்; ஒவ்வொரு வெள்ளிக்கிழமையும் பூஜை; மயில் தோகைகளும் வேலும் பயன்படுத்தப்படுகின்றன. கர்நாடகா: சுப்பிரமண்ய கோயில்களில் பெரும்பாலும் சர்ப்ப தேவதை வழிபாடும் இணைக்கப்படுகிறது; குக்கே சுப்பிரமண்ய முக்கிய யாத்திரை தலம். மகாராஷ்டிரா/வட இந்தியா: கார்த்திகேயன் முக்கியமாக சஷ்டியில் வழிபடப்படுகிறார். இங்கு விவரிக்கப்பட்ட வீட்டு பூஜை எளிமையான வெள்ளி/சஷ்டி வடிவம்.',
  },
  {
    slug: 'subrahmanya-puja',
    field: 'regional_variation_notes_hi',
    oldValue:
      'तमिलनाडु: मुरुगन तमिलनाडु के कुलदेवता हैं; सष्टी (छठी तिथि) मुख्य उपवास और पूजा का दिन है। कंद सष्टी कवसम् और तिरुपुगझ पढ़े जाते हैं। पानकम् (गुड़-जल-इलायची) और वड़ा मुरुगन मंदिरों में परंपरागत अर्पण हैं। आरुपदई वीडु — तिरुचेंदूर, पलनी, स्वामिमलई, तिरुपरंगुंड्रम, पझमुदिर्चोलई, तिरुत्तणी — प्रमुख तीर्थ स्थल हैं। AP/TG: सुब्रह्मण्य या कार्तिकेय कहलाते हैं; हर शुक्रवार पूजा; मोर पंख और वेल उपयोग होते हैं। कर्नाटका: सुब्रह्मण्य मंदिरों में अक्सर सर्पदेवता पूजा भी होती है; कुक्के सुब्रह्मण्य प्रमुख तीर्थस्थल है। महाराष्ट्र/उत्तर भारत: कार्तिकेय मुख्यतः सष्टी पर पूजे जाते हैं। यहाँ वर्णित गृह पूजा सरलीकृत शुक्रवार/सष्टी रूप है।',
    newValue:
      'तमिलनाडु: मुरुगन तमिलनाडु के कुलदेवता हैं; सष्टी (छठी तिथि) मुख्य उपवास और पूजा का दिन है। कंद सष्टी कवसम् और तिरुपुगझ पढ़े जाते हैं। पानकम् (गुड़-जल-इलायची) और वड़ा मुरुगन मंदिरों में परंपरागत अर्पण हैं। आरुपदई वीडु: तिरुचेंदूर, पलनी, स्वामिमलई, तिरुपरंगुंड्रम, पझमुदिर्चोलई, और तिरुत्तणी, प्रमुख तीर्थ स्थल हैं। AP/TG: सुब्रह्मण्य या कार्तिकेय कहलाते हैं; हर शुक्रवार पूजा; मोर पंख और वेल उपयोग होते हैं। कर्नाटका: सुब्रह्मण्य मंदिरों में अक्सर सर्पदेवता पूजा भी होती है; कुक्के सुब्रह्मण्य प्रमुख तीर्थस्थल है। महाराष्ट्र/उत्तर भारत: कार्तिकेय मुख्यतः सष्टी पर पूजे जाते हैं। यहाँ वर्णित गृह पूजा सरलीकृत शुक्रवार/सष्टी रूप है।',
  },
  // navagraha-puja
  {
    slug: 'navagraha-puja',
    field: 'regional_variation_notes_en',
    oldValue:
      'South India (AP/TG/KA): Nine separate copper or clay idols — one per planet — are placed in their cardinal directions; the puja follows a strict planetary sequence. Tamil Nadu: traditionally performed at the Navagraha mandapam in Shiva temples; the home version uses a single framed Navagraha image. North India: individual planet pujas (Surya on Sunday, Mangal on Tuesday, Shani on Saturday) are more common than a combined puja; black sesame and mustard oil are especially important for Shani. For serious astrological remedies, a Navagraha Shanti Homam performed by a priest is preferred over the home puja.',
    newValue:
      'South India (AP/TG/KA): Nine separate copper or clay idols, one per planet, are placed in their cardinal directions; the puja follows a strict planetary sequence. Tamil Nadu: traditionally performed at the Navagraha mandapam in Shiva temples; the home version uses a single framed Navagraha image. North India: individual planet pujas (Surya on Sunday, Mangal on Tuesday, Shani on Saturday) are more common than a combined puja; black sesame and mustard oil are especially important for Shani. For serious astrological remedies, a Navagraha Shanti Homam performed by a priest is preferred over the home puja.',
  },
  {
    slug: 'navagraha-puja',
    field: 'regional_variation_notes_te',
    oldValue:
      'దక్షిణ భారతం (ఆంధ్ర/తెలంగాణ/కర్ణాటక): ప్రతి గ్రహానికి ఒక్కొక్క రాగి లేదా మట్టి విగ్రహం — మొత్తం తొమ్మిది — వారి ప్రధాన దిశలలో అమర్చబడతాయి; పూజ ఖచ్చితమైన గ్రహ క్రమంలో జరుగుతుంది. తమిళనాడు: శివాలయాల్లోని నవగ్రహ మండపంలో సాంప్రదాయంగా చేస్తారు; ఇంటి పూజలో ఒకే ఫ్రేమ్ చేసిన నవగ్రహ చిత్రాన్ని ఉపయోగిస్తారు. ఉత్తర భారతం: సంయుక్త పూజ కంటే వ్యక్తిగత గ్రహ పూజలు (ఆదివారం సూర్య, మంగళవారం మంగళ, శనివారం శని) ఎక్కువ సాధారణం; శనికి నల్ల నువ్వులు మరియు ఆవాల నూనె ముఖ్యమైనవి. తీవ్రమైన జ్యోతిష్య నివారణలకు, ఇంటి పూజ కంటే పూజారి నిర్వహించే నవగ్రహ శాంతి హోమానికి ప్రాధాన్యత ఉంటుంది.',
    newValue:
      'దక్షిణ భారతం (ఆంధ్ర/తెలంగాణ/కర్ణాటక): ప్రతి గ్రహానికి ఒక్కొక్క రాగి లేదా మట్టి విగ్రహం, మొత్తం తొమ్మిది, వారి ప్రధాన దిశలలో అమర్చబడతాయి; పూజ ఖచ్చితమైన గ్రహ క్రమంలో జరుగుతుంది. తమిళనాడు: శివాలయాల్లోని నవగ్రహ మండపంలో సాంప్రదాయంగా చేస్తారు; ఇంటి పూజలో ఒకే ఫ్రేమ్ చేసిన నవగ్రహ చిత్రాన్ని ఉపయోగిస్తారు. ఉత్తర భారతం: సంయుక్త పూజ కంటే వ్యక్తిగత గ్రహ పూజలు (ఆదివారం సూర్య, మంగళవారం మంగళ, శనివారం శని) ఎక్కువ సాధారణం; శనికి నల్ల నువ్వులు మరియు ఆవాల నూనె ముఖ్యమైనవి. తీవ్రమైన జ్యోతిష్య నివారణలకు, ఇంటి పూజ కంటే పూజారి నిర్వహించే నవగ్రహ శాంతి హోమానికి ప్రాధాన్యత ఉంటుంది.',
  },
  {
    slug: 'navagraha-puja',
    field: 'regional_variation_notes_hi',
    oldValue:
      'दक्षिण भारत (आं.प्र./तेलंगाना/कर्नाटक): प्रत्येक ग्रह के लिए एक-एक तांबे या मिट्टी की मूर्ति — कुल नौ — उनकी प्रमुख दिशाओं में रखी जाती है; पूजा एक सख्त ग्रहीय क्रम का पालन करती है। तमिलनाडु: शिव मंदिरों में नवग्रह मंडपम पर परंपरागत रूप से की जाती है; घरेलू पूजा एकल फ्रेम की गई नवग्रह छवि का उपयोग करती है। उत्तर भारत: व्यक्तिगत ग्रह पूजाएँ (रविवार को सूर्य, मंगलवार को मंगल, शनिवार को शनि) संयुक्त पूजा से अधिक सामान्य हैं; शनि के लिए काले तिल और सरसों का तेल विशेष महत्वपूर्ण हैं। गंभीर ज्योतिषीय उपायों के लिए, घरेलू पूजा की बजाय पुजारी द्वारा किए गए नवग्रह शांति हवन को प्राथमिकता दी जाती है।',
    newValue:
      'दक्षिण भारत (आं.प्र./तेलंगाना/कर्नाटक): प्रत्येक ग्रह के लिए एक-एक तांबे या मिट्टी की मूर्ति, कुल नौ, उनकी प्रमुख दिशाओं में रखी जाती है; पूजा एक सख्त ग्रहीय क्रम का पालन करती है। तमिलनाडु: शिव मंदिरों में नवग्रह मंडपम पर परंपरागत रूप से की जाती है; घरेलू पूजा एकल फ्रेम की गई नवग्रह छवि का उपयोग करती है। उत्तर भारत: व्यक्तिगत ग्रह पूजाएँ (रविवार को सूर्य, मंगलवार को मंगल, शनिवार को शनि) संयुक्त पूजा से अधिक सामान्य हैं; शनि के लिए काले तिल और सरसों का तेल विशेष महत्वपूर्ण हैं। गंभीर ज्योतिषीय उपायों के लिए, घरेलू पूजा की बजाय पुजारी द्वारा किए गए नवग्रह शांति हवन को प्राथमिकता दी जाती है।',
  },
  // vastu-puja
  {
    slug: 'vastu-puja',
    field: 'regional_variation_notes_en',
    oldValue:
      'Tamil Nadu: a Vastu Homam (fire ritual) conducted by a priest is preferred; the home puja is done as an accompanying rite. The milk-boiling ritual (paal kachchi) — where milk is made to overflow on the stove of the new home — is an essential auspicious act. Andhra/Telangana: a silver or copper coin is placed at the main entrance threshold before the first entry; the eldest woman of the household enters first carrying a pot of water. North India: Bhoomi Puja (earth worship) is performed before construction begins; the Griha Pravesh involves breaking a clay pot of water at the door. Many families also perform a Satyanarayan Puja on the same day as a combined occasion blessing.',
    newValue:
      'Tamil Nadu: a Vastu Homam (fire ritual) conducted by a priest is preferred; the home puja is done as an accompanying rite. The milk-boiling ritual (paal kachchi), where milk is made to overflow on the stove of the new home, is an essential auspicious act. Andhra/Telangana: a silver or copper coin is placed at the main entrance threshold before the first entry; the eldest woman of the household enters first carrying a pot of water. North India: Bhoomi Puja (earth worship) is performed before construction begins; the Griha Pravesh involves breaking a clay pot of water at the door. Many families also perform a Satyanarayan Puja on the same day as a combined occasion blessing.',
  },
  // kubera-puja
  {
    slug: 'kubera-puja',
    field: 'regional_variation_notes_en',
    oldValue:
      "North India: Dhanteras (Dhan Trayodashi, two days before Diwali) is the primary Kubera puja day; new gold, silver, or utensils are purchased as Kubera's blessing. Maharashtra/Gujarat: both Dhanteras and Akshaya Tritiya are major Kubera puja days; Lakshmi-Kubera puja (worshipping both together) is common. South India: Akshaya Tritiya and Dhanteras both observed; traders open new account books (Bahi-Puja). Business openings: puja always faces North (Kubera's direction — Uttara); a Kubera yantra is installed permanently in the north side of the cash box or locker.",
    newValue:
      "North India: Dhanteras (Dhan Trayodashi, two days before Diwali) is the primary Kubera puja day; new gold, silver, or utensils are purchased as Kubera's blessing. Maharashtra/Gujarat: both Dhanteras and Akshaya Tritiya are major Kubera puja days; Lakshmi-Kubera puja (worshipping both together) is common. South India: Akshaya Tritiya and Dhanteras both observed; traders open new account books (Bahi-Puja). Business openings: puja always faces North (Kubera's direction, Uttara); a Kubera yantra is installed permanently in the north side of the cash box or locker.",
  },
  {
    slug: 'kubera-puja',
    field: 'regional_variation_notes_te',
    oldValue:
      'ఉత్తర భారతం: ధన్ తేరస్ (ధన త్రయోదశి, దీపావళికి రెండు రోజుల ముందు) ప్రాథమిక కుబేర పూజ రోజు; కుబేర ఆశీర్వాదంగా కొత్త బంగారం, వెండి లేదా పాత్రలు కొనుగోలు చేస్తారు. మహారాష్ట్ర/గుజరాత్: ధన్ తేరస్ మరియు అక్షయ తృతీయ రెండూ ప్రముఖ కుబేర పూజ రోజులు; లక్ష్మీ-కుబేర పూజ (ఇద్దరినీ కలిసి పూజించడం) సాధారణం. దక్షిణ భారతం: అక్షయ తృతీయ మరియు ధన్ తేరస్ రెండూ జరుపుతారు; వ్యాపారులు కొత్త ఖాతా పుస్తకాలు (బహీ-పూజ) తెరుస్తారు. వ్యాపార ప్రారంభాలు: పూజ ఎల్లప్పుడూ ఉత్తర దిశగా (కుబేర దిశ — ఉత్తర) ఉంటుంది; కుబేర యంత్రాన్ని డబ్బు పెట్టె లేదా లాకర్ యొక్క ఉత్తర వైపున శాశ్వతంగా ప్రతిష్ఠిస్తారు.',
    newValue:
      'ఉత్తర భారతం: ధన్ తేరస్ (ధన త్రయోదశి, దీపావళికి రెండు రోజుల ముందు) ప్రాథమిక కుబేర పూజ రోజు; కుబేర ఆశీర్వాదంగా కొత్త బంగారం, వెండి లేదా పాత్రలు కొనుగోలు చేస్తారు. మహారాష్ట్ర/గుజరాత్: ధన్ తేరస్ మరియు అక్షయ తృతీయ రెండూ ప్రముఖ కుబేర పూజ రోజులు; లక్ష్మీ-కుబేర పూజ (ఇద్దరినీ కలిసి పూజించడం) సాధారణం. దక్షిణ భారతం: అక్షయ తృతీయ మరియు ధన్ తేరస్ రెండూ జరుపుతారు; వ్యాపారులు కొత్త ఖాతా పుస్తకాలు (బహీ-పూజ) తెరుస్తారు. వ్యాపార ప్రారంభాలు: పూజ ఎల్లప్పుడూ ఉత్తర దిశగా (కుబేర దిశ, ఉత్తర) ఉంటుంది; కుబేర యంత్రాన్ని డబ్బు పెట్టె లేదా లాకర్ యొక్క ఉత్తర వైపున శాశ్వతంగా ప్రతిష్ఠిస్తారు.',
  },
  {
    slug: 'kubera-puja',
    field: 'regional_variation_notes_ta',
    oldValue:
      'வட இந்தியா: தன் தேரஸ் (தன திரயோதசி, தீபாவளிக்கு இரண்டு நாட்கள் முன்) முதன்மை குபேர பூஜை நாள்; குபேர ஆசீர்வாதமாக புதிய தங்கம், வெள்ளி அல்லது பாத்திரங்கள் வாங்கப்படுகின்றன. மகாராஷ்டிரா/குஜராத்: தன் தேரஸ் மற்றும் அக்ஷய திரிதியை இரண்டும் முக்கிய குபேர பூஜை நாட்கள்; லட்சுமி-குபேர பூஜை (இருவரையும் ஒன்றாக வழிபடுதல்) பொதுவானது. தென் இந்தியா: அக்ஷய திரிதியை மற்றும் தன் தேரஸ் இரண்டும் கடைப்பிடிக்கப்படுகின்றன; வியாபாரிகள் புதிய கணக்கு புத்தகங்கள் திறக்கின்றனர் (பஹி-பூஜை). வியாபார தொடக்கங்கள்: பூஜை எப்போதும் வடக்கு நோக்கி (குபேர திசை — உத்தர); குபேர யந்திரம் பணப்பெட்டி அல்லது லாக்கரின் வடக்கு பகுதியில் நிரந்தரமாக நிறுவப்படுகிறது.',
    newValue:
      'வட இந்தியா: தன் தேரஸ் (தன திரயோதசி, தீபாவளிக்கு இரண்டு நாட்கள் முன்) முதன்மை குபேர பூஜை நாள்; குபேர ஆசீர்வாதமாக புதிய தங்கம், வெள்ளி அல்லது பாத்திரங்கள் வாங்கப்படுகின்றன. மகாராஷ்டிரா/குஜராத்: தன் தேரஸ் மற்றும் அக்ஷய திரிதியை இரண்டும் முக்கிய குபேர பூஜை நாட்கள்; லட்சுமி-குபேர பூஜை (இருவரையும் ஒன்றாக வழிபடுதல்) பொதுவானது. தென் இந்தியா: அக்ஷய திரிதியை மற்றும் தன் தேரஸ் இரண்டும் கடைப்பிடிக்கப்படுகின்றன; வியாபாரிகள் புதிய கணக்கு புத்தகங்கள் திறக்கின்றனர் (பஹி-பூஜை). வியாபார தொடக்கங்கள்: பூஜை எப்போதும் வடக்கு நோக்கி (குபேர திசை, உத்தரம்); குபேர யந்திரம் பணப்பெட்டி அல்லது லாக்கரின் வடக்கு பகுதியில் நிரந்தரமாக நிறுவப்படுகிறது.',
  },
  {
    slug: 'kubera-puja',
    field: 'regional_variation_notes_hi',
    oldValue:
      'उत्तर भारत: धनतेरस (धन त्रयोदशी, दीपावली से दो दिन पहले) प्राथमिक कुबेर पूजा का दिन है; कुबेर के आशीर्वाद के रूप में नया सोना, चांदी या बर्तन खरीदे जाते हैं। महाराष्ट्र/गुजरात: धनतेरस और अक्षय तृतीया दोनों प्रमुख कुबेर पूजा दिन हैं; लक्ष्मी-कुबेर पूजा (दोनों को एक साथ पूजना) सामान्य है। दक्षिण भारत: अक्षय तृतीया और धनतेरस दोनों मनाए जाते हैं; व्यापारी नई खाता-बही खोलते हैं (बही-पूजा)। व्यापार उद्घाटन: पूजा हमेशा उत्तर दिशा में (कुबेर की दिशा — उत्तर) होती है; कुबेर यंत्र कैश बॉक्स या लॉकर के उत्तरी भाग में स्थायी रूप से स्थापित किया जाता है।',
    newValue:
      'उत्तर भारत: धनतेरस (धन त्रयोदशी, दीपावली से दो दिन पहले) प्राथमिक कुबेर पूजा का दिन है; कुबेर के आशीर्वाद के रूप में नया सोना, चांदी या बर्तन खरीदे जाते हैं। महाराष्ट्र/गुजरात: धनतेरस और अक्षय तृतीया दोनों प्रमुख कुबेर पूजा दिन हैं; लक्ष्मी-कुबेर पूजा (दोनों को एक साथ पूजना) सामान्य है। दक्षिण भारत: अक्षय तृतीया और धनतेरस दोनों मनाए जाते हैं; व्यापारी नई खाता-बही खोलते हैं (बही-पूजा)। व्यापार उद्घाटन: पूजा हमेशा उत्तर दिशा में (कुबेर की दिशा, उत्तर) होती है; कुबेर यंत्र कैश बॉक्स या लॉकर के उत्तरी भाग में स्थायी रूप से स्थापित किया जाता है।',
  },
];

// ---------------------------------------------------------------------------
// 3. material_items.item_name_en/te/ta/hi (matched by group_slug + item_order)
// ---------------------------------------------------------------------------
const materialItemFixes = [
  // navagraha-puja / item 2
  {
    group_slug: 'navagraha-puja',
    item_order: '2',
    field: 'item_name_en',
    oldValue: 'Nava Dhanyam — 9 sacred grains in separate bowls: wheat, white rice, red lentil, green gram, chickpeas, white sesame, black sesame, urad dal, horse gram',
    newValue: 'Nava Dhanyam: 9 sacred grains in separate bowls (wheat, white rice, red lentil, green gram, chickpeas, white sesame, black sesame, urad dal, horse gram)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '2',
    field: 'item_name_te',
    oldValue: 'నవ ధాన్యాలు — 9 గిన్నెల్లో: గోధుమ, తెల్లని బియ్యం, మసూరి, పెసలు, శెనగలు, తెల్ల నువ్వులు, నల్ల నువ్వులు, మినుములు, ఉలవలు',
    newValue: 'నవ ధాన్యాలు: 9 గిన్నెల్లో (గోధుమ, తెల్లని బియ్యం, మసూరి, పెసలు, శెనగలు, తెల్ల నువ్వులు, నల్ల నువ్వులు, మినుములు, ఉలవలు)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '2',
    field: 'item_name_ta',
    oldValue: 'நவ தானியங்கள் — 9 கிண்ணங்களில்: கோதுமை, வெண் அரிசி, மசூர் பருப்பு, பாசிப்பயறு, கொண்டைக்கடலை, வெள்ளை எள்ளு, கருப்பு எள்ளு, உளுத்தம் பருப்பு, கொள்ளு',
    newValue: 'நவ தானியங்கள்: 9 கிண்ணங்களில் (கோதுமை, வெண் அரிசி, மசூர் பருப்பு, பாசிப்பயறு, கொண்டைக்கடலை, வெள்ளை எள்ளு, கருப்பு எள்ளு, உளுத்தம் பருப்பு, கொள்ளு)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '2',
    field: 'item_name_hi',
    oldValue: 'नव धान्य — 9 कटोरियों में: गेहूं, सफेद चावल, मसूर, मूंग, चना, सफेद तिल, काले तिल, उड़द, कुलथी',
    newValue: 'नव धान्य: 9 कटोरियों में (गेहूं, सफेद चावल, मसूर, मूंग, चना, सफेद तिल, काले तिल, उड़द, कुलथी)',
  },
  // navagraha-puja / item 3
  {
    group_slug: 'navagraha-puja',
    item_order: '3',
    field: 'item_name_en',
    oldValue: 'Flowers — at least 3 colors: red, white, and yellow bunches',
    newValue: 'Flowers: at least 3 colors (red, white, and yellow bunches)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '3',
    field: 'item_name_te',
    oldValue: 'పూలు — కనీసం 3 రంగులు: ఎరుపు, తెలుపు, పసుపు',
    newValue: 'పూలు: కనీసం 3 రంగులు (ఎరుపు, తెలుపు, పసుపు)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '3',
    field: 'item_name_ta',
    oldValue: 'மலர்கள் — குறைந்தது 3 நிறங்கள்: சிவப்பு, வெள்ளை, மஞ்சள்',
    newValue: 'மலர்கள்: குறைந்தது 3 நிறங்கள் (சிவப்பு, வெள்ளை, மஞ்சள்)',
  },
  {
    group_slug: 'navagraha-puja',
    item_order: '3',
    field: 'item_name_hi',
    oldValue: 'फूल — कम से कम 3 रंग: लाल, सफेद, और पीले',
    newValue: 'फूल: कम से कम 3 रंग (लाल, सफेद, और पीले)',
  },
  // vastu-puja / item 6
  {
    group_slug: 'vastu-puja',
    item_order: '6',
    field: 'item_name_en',
    oldValue: 'Fresh flowers — white or yellow (jasmine, marigold, or white lotus)',
    newValue: 'Fresh flowers: white or yellow (jasmine, marigold, or white lotus)',
  },
  {
    group_slug: 'vastu-puja',
    item_order: '6',
    field: 'item_name_te',
    oldValue: 'తాజా పూలు — తెల్లని లేదా పసుపు (మల్లె, మొగ్గ పూలు లేదా తెల్ల కమలం)',
    newValue: 'తాజా పూలు: తెల్లని లేదా పసుపు (మల్లె, మొగ్గ పూలు లేదా తెల్ల కమలం)',
  },
  {
    group_slug: 'vastu-puja',
    item_order: '6',
    field: 'item_name_ta',
    oldValue: 'புதிய மலர்கள் — வெள்ளை அல்லது மஞ்சள் (மல்லிகை, சேவந்தி அல்லது வெள்ளை தாமரை)',
    newValue: 'புதிய மலர்கள்: வெள்ளை அல்லது மஞ்சள் (மல்லிகை, சேவந்தி அல்லது வெள்ளை தாமரை)',
  },
  {
    group_slug: 'vastu-puja',
    item_order: '6',
    field: 'item_name_hi',
    oldValue: 'ताजे फूल — सफेद या पीले (चमेली, गेंदा, या सफेद कमल)',
    newValue: 'ताजे फूल: सफेद या पीले (चमेली, गेंदा, या सफेद कमल)',
  },
  // gauri-puja / item 2
  {
    group_slug: 'gauri-puja',
    item_order: '2',
    field: 'item_name_en',
    oldValue: 'Turmeric (haridra) — for decoration, archana, and prasad distribution',
    newValue: 'Turmeric (haridra): for decoration, archana, and prasad distribution',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '2',
    field: 'item_name_te',
    oldValue: 'పసుపు (హరిద్రా) — అలంకారం, అర్చన మరియు ప్రసాద పంపిణీ కోసం',
    newValue: 'పసుపు (హరిద్రా): అలంకారం, అర్చన మరియు ప్రసాద పంపిణీ కోసం',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '2',
    field: 'item_name_ta',
    oldValue: 'மஞ்சள் (ஹரித்ரா) — அலங்காரம், அர்ச்சனை மற்றும் பிரசாத வழங்கல் கோசம்',
    newValue: 'மஞ்சள் (ஹரித்ரா): அலங்காரம், அர்ச்சனை மற்றும் பிரசாத வழங்கல் கோசம்',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '2',
    field: 'item_name_hi',
    oldValue: 'हल्दी (हरिद्रा) — सजावट, अर्चना और प्रसाद वितरण के लिए',
    newValue: 'हल्दी (हरिद्रा): सजावट, अर्चना और प्रसाद वितरण के लिए',
  },
  // gauri-puja / item 3
  {
    group_slug: 'gauri-puja',
    item_order: '3',
    field: 'item_name_en',
    oldValue: 'Kumkum (vermilion) — for archana and distribution to married women',
    newValue: 'Kumkum (vermilion): for archana and distribution to married women',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '3',
    field: 'item_name_te',
    oldValue: 'కుంకుమ — అర్చన మరియు సౌభాగ్యవతులకు పంపిణీ కోసం',
    newValue: 'కుంకుమ: అర్చన మరియు సౌభాగ్యవతులకు పంపిణీ కోసం',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '3',
    field: 'item_name_ta',
    oldValue: 'குங்குமம் — அர்ச்சனை மற்றும் திருமணமான பெண்களுக்கு வழங்கல் கோசம்',
    newValue: 'குங்குமம்: அர்ச்சனை மற்றும் திருமணமான பெண்களுக்கு வழங்கல் கோசம்',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '3',
    field: 'item_name_hi',
    oldValue: 'कुमकुम — अर्चना और सुहागन स्त्रियों के वितरण के लिए',
    newValue: 'कुमकुम: अर्चना और सुहागन स्त्रियों के वितरण के लिए',
  },
  // gauri-puja / item 4
  {
    group_slug: 'gauri-puja',
    item_order: '4',
    field: 'item_name_en',
    oldValue: 'Flowers — white jasmine, pink lotus, or yellow marigold',
    newValue: 'Flowers: white jasmine, pink lotus, or yellow marigold',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '4',
    field: 'item_name_te',
    oldValue: 'పూలు — తెల్లని మల్లె, గులాబీ కమలం లేదా పసుపు మొగ్గ',
    newValue: 'పూలు: తెల్లని మల్లె, గులాబీ కమలం లేదా పసుపు మొగ్గ',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '4',
    field: 'item_name_ta',
    oldValue: 'மலர்கள் — வெள்ளை மல்லிகை, இளஞ்சிவப்பு தாமரை அல்லது மஞ்சள் சேவந்தி',
    newValue: 'மலர்கள்: வெள்ளை மல்லிகை, இளஞ்சிவப்பு தாமரை அல்லது மஞ்சள் சேவந்தி',
  },
  {
    group_slug: 'gauri-puja',
    item_order: '4',
    field: 'item_name_hi',
    oldValue: 'फूल — सफेद चमेली, गुलाबी कमल, या पीले गेंदे',
    newValue: 'फूल: सफेद चमेली, गुलाबी कमल, या पीले गेंदे',
  },
];

function logDiff(label, oldValue, newValue) {
  console.log(`\n--- ${label} ---`);
  console.log(`OLD: ${oldValue}`);
  console.log(`NEW: ${newValue}`);
}

async function processSlugTab(tabName, fixes, groupLabel) {
  const { headers, rows, col } = await getTabWithHeaders(tabName);
  const slugCol = col('slug');
  const sheets = WRITE ? await getSheetsClient() : null;
  const updates = [];
  let changed = 0;
  let skipped = 0;

  console.log(`\n============================\n${groupLabel}\n============================`);

  for (const fix of fixes) {
    const rowIdx = rows.findIndex((r) => r[slugCol] === fix.slug);
    if (rowIdx === -1) {
      console.log(`\n!! SKIP: slug "${fix.slug}" not found in ${tabName}`);
      skipped++;
      continue;
    }
    const fCol = col(fix.field);
    const row = rows[rowIdx];
    const currentValue = row[fCol] || '';

    if (currentValue !== fix.oldValue) {
      console.log(`\n!! SKIP (live value doesn't match expected old value): ${tabName}.${fix.field} [slug=${fix.slug}]`);
      console.log(`   EXPECTED OLD: ${fix.oldValue}`);
      console.log(`   ACTUAL LIVE : ${currentValue}`);
      skipped++;
      continue;
    }

    logDiff(`${tabName}.${fix.field} [slug=${fix.slug}]`, fix.oldValue, fix.newValue);
    changed++;

    const sheetRowNumber = rowIdx + 2; // +1 header row, +1 for 1-indexing
    const range = `${tabName}!${colLetter(fCol)}${sheetRowNumber}`;
    updates.push({ range, values: [[fix.newValue]] });
  }

  console.log(`\n${groupLabel}: ${changed} changed, ${skipped} skipped`);

  if (WRITE && updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    });
    console.log(`  -> wrote ${updates.length} cells to ${tabName}`);
  }

  return { changed, skipped };
}

async function processMaterialItems(fixes) {
  const tabName = 'material_items';
  const { headers, rows, col } = await getTabWithHeaders(tabName);
  const groupCol = col('group_slug');
  const orderCol = col('item_order');
  const sheets = WRITE ? await getSheetsClient() : null;
  const updates = [];
  let changed = 0;
  let skipped = 0;

  console.log(`\n============================\nmaterial_items.item_name_en/te/ta/hi\n============================`);

  for (const fix of fixes) {
    const rowIdx = rows.findIndex(
      (r) => r[groupCol] === fix.group_slug && r[orderCol] === fix.item_order
    );
    if (rowIdx === -1) {
      console.log(`\n!! SKIP: (group_slug=${fix.group_slug}, item_order=${fix.item_order}) not found in ${tabName}`);
      skipped++;
      continue;
    }
    const fCol = col(fix.field);
    const row = rows[rowIdx];
    const currentValue = row[fCol] || '';

    if (currentValue !== fix.oldValue) {
      console.log(`\n!! SKIP (live value doesn't match expected old value): ${tabName}.${fix.field} [group_slug=${fix.group_slug}, item_order=${fix.item_order}]`);
      console.log(`   EXPECTED OLD: ${fix.oldValue}`);
      console.log(`   ACTUAL LIVE : ${currentValue}`);
      skipped++;
      continue;
    }

    logDiff(`${tabName}.${fix.field} [group_slug=${fix.group_slug}, item_order=${fix.item_order}]`, fix.oldValue, fix.newValue);
    changed++;

    const sheetRowNumber = rowIdx + 2;
    const range = `${tabName}!${colLetter(fCol)}${sheetRowNumber}`;
    updates.push({ range, values: [[fix.newValue]] });
  }

  console.log(`\nmaterial_items: ${changed} changed, ${skipped} skipped`);

  if (WRITE && updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    });
    console.log(`  -> wrote ${updates.length} cells to ${tabName}`);
  }

  return { changed, skipped };
}

async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE (applying changes)' : 'DRY RUN (no changes will be written)'}`);

  const r1 = await processSlugTab('festivals', festivalFixes, 'festivals.regional_notes_en');
  const r2 = await processSlugTab('pujas', pujaFixes, 'pujas.regional_variation_notes_en/te/ta/hi');
  const r3 = await processMaterialItems(materialItemFixes);

  const totalChanged = r1.changed + r2.changed + r3.changed;
  const totalSkipped = r1.skipped + r2.skipped + r3.skipped;
  const totalPlanned = festivalFixes.length + pujaFixes.length + materialItemFixes.length;

  console.log(`\n============================`);
  console.log(`TOTAL: ${totalPlanned} cells planned, ${totalChanged} would change, ${totalSkipped} skipped`);
  if (!WRITE) {
    console.log('Dry run only — pass --write to apply.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
