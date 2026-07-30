/**
 * One-off: remove AI-tell em-dashes ("—") from festivals, pujas, and
 * material_items (the 3 tabs owned by this agent), rewriting each affected
 * cell as natural grammatical prose in its own language. Never touches
 * material_items.quantity_* (legitimate en-dash numeric ranges) or any tab
 * outside these 3.
 *
 * Row matching:
 *   - festivals / pujas: by `slug`
 *   - material_items: by (`group_slug`, `item_order`) since there is no
 *     per-row slug column on that tab
 *
 * Usage:
 *   node scripts/fix-em-dash-festivals-pujas-materials.mjs          <- dry run (default)
 *   node scripts/fix-em-dash-festivals-pujas-materials.mjs --write  <- apply
 *
 * PHASE 1 of 2: this run is dry-run only per instructions. Do not pass --write.
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const APPLY = parseWriteFlag(process.argv);
const sheets = await getSheetsClient();

// ---------------------------------------------------------------------------
// FESTIVALS (matched by slug)
// ---------------------------------------------------------------------------
const FESTIVALS_FIXES = [
  // next_occurrence_note_en
  { slug: 'ugadi', field: 'next_occurrence_note_en',
    old: 'Mar/Apr — Shukla Pratipada of Chaitra month (Telugu/Kannada New Year)',
    new: 'Mar/Apr: Shukla Pratipada of Chaitra month (Telugu/Kannada New Year)' },
  { slug: 'makar-sankranti', field: 'next_occurrence_note_en',
    old: 'January 14 — solar transit into Capricorn (Makara Rashi)',
    new: 'January 14: solar transit into Capricorn (Makara Rashi)' },
  { slug: 'pongal', field: 'next_occurrence_note_en',
    old: 'January 14-17 — Tamil month of Thai; 4-day harvest festival',
    new: 'January 14-17: Tamil month of Thai; 4-day harvest festival' },
  { slug: 'akshaya-tritiya', field: 'next_occurrence_note_en',
    old: 'Apr/May — Shukla Tritiya of Vaishakha month',
    new: 'Apr/May: Shukla Tritiya of Vaishakha month' },
  { slug: 'vasant-panchami', field: 'next_occurrence_note_en',
    old: 'Jan/Feb — Shukla Panchami of Magha month',
    new: 'Jan/Feb: Shukla Panchami of Magha month' },
  { slug: 'holi', field: 'next_occurrence_note_en',
    old: 'Feb/Mar — Purnima of Phalguna month; color play the next morning',
    new: 'Feb/Mar: Purnima of Phalguna month; color play the next morning' },

  // significance_en
  { slug: 'ugadi', field: 'significance_en',
    old: 'Ugadi marks the Telugu and Kannada New Year — the first day of the Hindu lunar calendar. It commemorates the day Brahma began creation. Families listen to the Panchanga Sravanam (almanac reading), prepare Ugadi Pachadi — a chutney with six tastes (sweet, sour, salty, bitter, spicy, astringent) symbolising the experiences of the coming year — and make new beginnings.',
    new: 'Ugadi marks the Telugu and Kannada New Year, the first day of the Hindu lunar calendar. It commemorates the day Brahma began creation. Families listen to the Panchanga Sravanam (almanac reading), prepare Ugadi Pachadi, a chutney with six tastes (sweet, sour, salty, bitter, spicy, astringent) that symbolises the experiences of the coming year, and make new beginnings.' },
  { slug: 'makar-sankranti', field: 'significance_en',
    old: "Makar Sankranti marks the sun's northward transit (Uttarayana) into Capricorn — one of the most auspicious solar events in the Hindu calendar. It signals the end of winter and the beginning of the harvest season. Celebrated with sesame-jaggery sweets (til-gur), kite flying, and ritual bathing in sacred rivers. The day marks six months of auspicious time for sacred activities.",
    new: "Makar Sankranti marks the sun's northward transit (Uttarayana) into Capricorn, one of the most auspicious solar events in the Hindu calendar. It signals the end of winter and the beginning of the harvest season. Celebrated with sesame-jaggery sweets (til-gur), kite flying, and ritual bathing in sacred rivers. The day marks six months of auspicious time for sacred activities." },
  { slug: 'pongal', field: 'significance_en',
    old: 'Pongal is the most important harvest festival of Tamil Nadu, celebrated over four days. The name comes from the Tamil word meaning "to boil over" — sweet rice (pongal) is boiled in the sun\'s first rays until it overflows, symbolising abundance. The four days are Bhogi Pongal, Surya Pongal (main day), Mattu Pongal (honouring cattle), and Kaanum Pongal (family gathering).',
    new: 'Pongal is the most important harvest festival of Tamil Nadu, celebrated over four days. The name comes from the Tamil word meaning "to boil over": sweet rice (pongal) is boiled in the sun\'s first rays until it overflows, symbolising abundance. The four days are Bhogi Pongal, Surya Pongal (main day), Mattu Pongal (honouring cattle), and Kaanum Pongal (family gathering).' },
  { slug: 'vijayadashami', field: 'significance_en',
    old: "Vijayadashami is the festival of victory of good over evil — the tenth day after Navratri. It marks Durga's final victory over the buffalo demon Mahishasura, and Rama's victory over Ravana. Tools, weapons, vehicles, and books are worshipped (Ayudha Puja). In South India, Saraswati Puja on the ninth day (Mahanavami) and the Vidyarambham ritual begin a child's formal education.",
    new: "Vijayadashami is the festival of victory of good over evil, falling on the tenth day after Navratri. It marks Durga's final victory over the buffalo demon Mahishasura, and Rama's victory over Ravana. Tools, weapons, vehicles, and books are worshipped (Ayudha Puja). In South India, Saraswati Puja on the ninth day (Mahanavami) and the Vidyarambham ritual begin a child's formal education." },
  { slug: 'vaikuntha-ekadashi', field: 'significance_en',
    old: "Vaikuntha Ekadashi is the most sacred of all Ekadashis — the day the Vaikuntha Dwara (gates of Vishnu's heaven) are said to be open. Devotees who observe this fast and spend the night in prayer and devotion at Vishnu temples attain moksha. At Tirupati and Srirangam, the Vaikuntha Dwara (a special door) is opened only on this day for devotees to pass through.",
    new: "Vaikuntha Ekadashi is the most sacred of all Ekadashis, the day the Vaikuntha Dwara (gates of Vishnu's heaven) is said to be open. Devotees who observe this fast and spend the night in prayer and devotion at Vishnu temples attain moksha. At Tirupati and Srirangam, the Vaikuntha Dwara (a special door) is opened only on this day for devotees to pass through." },
  { slug: 'karthika-pournami', field: 'significance_en',
    old: 'Karthika Pournami is one of the holiest nights in the Hindu calendar — the full moon of the sacred month of Karthika. Shiva destroyed the three cities (Tripura) of the asuras on this night. It is also the birthday of Kartikeya. Devotees light lamps (deepas) throughout the night, take pre-dawn river baths, and observe the Karthika Masa Deepotsavam. Pushkar (Rajasthan) holds its largest fair on this day.',
    new: 'Karthika Pournami is one of the holiest nights in the Hindu calendar, the full moon of the sacred month of Karthika. Shiva destroyed the three cities (Tripura) of the asuras on this night. It is also the birthday of Kartikeya. Devotees light lamps (deepas) throughout the night, take pre-dawn river baths, and observe the Karthika Masa Deepotsavam. Pushkar (Rajasthan) holds its largest fair on this day.' },
  { slug: 'akshaya-tritiya', field: 'significance_en',
    old: 'Akshaya Tritiya (literally "imperishable third") is one of the four most auspicious days in the Hindu calendar, considered self-luminously auspicious (swayam siddha muhurta) — no further muhurta is needed. Any action begun on this day — marriages, new businesses, gold purchases, construction — is believed to grow and never diminish. It is the birthday of Parashurama (sixth avatar of Vishnu).',
    new: 'Akshaya Tritiya (literally "imperishable third") is one of the four most auspicious days in the Hindu calendar, considered self-luminously auspicious (swayam siddha muhurta), so no further muhurta is needed. Any action begun on this day, whether marriages, new businesses, gold purchases, or construction, is believed to grow and never diminish. It is the birthday of Parashurama (sixth avatar of Vishnu).' },
  { slug: 'guru-purnima', field: 'significance_en',
    old: 'Guru Purnima is dedicated to honouring one\'s spiritual teacher (guru). It falls on the full moon of Ashadha — the birth anniversary of Veda Vyasa, the compiler of the Vedas, Mahabharata, and Puranas. The day celebrates the lineage of gurus who transmit knowledge. Disciples perform Guru Pada Puja, offer dakshina, and renew their spiritual commitment. The Buddha gave his first sermon at Sarnath on this day.',
    new: 'Guru Purnima is dedicated to honouring one\'s spiritual teacher (guru). It falls on the full moon of Ashadha, the birth anniversary of Veda Vyasa, the compiler of the Vedas, Mahabharata, and Puranas. The day celebrates the lineage of gurus who transmit knowledge. Disciples perform Guru Pada Puja, offer dakshina, and renew their spiritual commitment. The Buddha gave his first sermon at Sarnath on this day.' },
  { slug: 'vasant-panchami', field: 'significance_en',
    old: 'Vasant Panchami marks the arrival of spring and is the most important day for the worship of Saraswati, goddess of knowledge, arts, and learning. Children begin their formal education (Vidyarambha) on this day. Yellow is the colour of the day — mustard fields are in full bloom. Books, musical instruments, and artistic tools are placed before Saraswati and worshipped. This day is also considered ideal for marriages.',
    new: 'Vasant Panchami marks the arrival of spring and is the most important day for the worship of Saraswati, goddess of knowledge, arts, and learning. Children begin their formal education (Vidyarambha) on this day. Yellow is the colour of the day, as mustard fields are in full bloom. Books, musical instruments, and artistic tools are placed before Saraswati and worshipped. This day is also considered ideal for marriages.' },
  { slug: 'bathukamma', field: 'significance_en',
    old: 'Bathukamma is the most beloved festival of Telangana — a floral festival honouring the goddess Gauri/Bathukamma as the life-giving mother. Women stack wildflowers (particularly tangedu, banthikampa, and gunugu) in concentric circular patterns on a large plate, creating a living floral tower. They dance around it in circles singing folk songs. On the final day (Saddula Bathukamma), the flower arrangements are immersed in a pond or tank.',
    new: 'Bathukamma is the most beloved festival of Telangana, a floral festival honouring the goddess Gauri/Bathukamma as the life-giving mother. Women stack wildflowers (particularly tangedu, banthikampa, and gunugu) in concentric circular patterns on a large plate, creating a living floral tower. They dance around it in circles singing folk songs. On the final day (Saddula Bathukamma), the flower arrangements are immersed in a pond or tank.' },
  { slug: 'bonalu', field: 'significance_en',
    old: 'Bonalu is the quintessential festival of Hyderabad and Telangana — a joyous thanksgiving to Goddess Mahakali for her protection against epidemic diseases. Women carry earthen pots (bonam) filled with cooked rice, jaggery, curd, and neem leaves on their heads, adorned with neem twigs and a lit lamp on top, and offer them to the goddess at local temples. The festival moves through different neighbourhoods over several weeks.',
    new: 'Bonalu is the quintessential festival of Hyderabad and Telangana, a joyous thanksgiving to Goddess Mahakali for her protection against epidemic diseases. Women carry earthen pots (bonam) filled with cooked rice, jaggery, curd, and neem leaves on their heads, adorned with neem twigs and a lit lamp on top, and offer them to the goddess at local temples. The festival moves through different neighbourhoods over several weeks.' },
  { slug: 'karthigai-deepam', field: 'significance_en',
    old: 'Karthigai Deepam is a Tamil festival of lights celebrated in the month of Karthigai. Every home lights rows of oil lamps (agal vilakku) at dusk. The culmination is the Mahadeepam — the lighting of a massive beacon on the summit of Tiruvannamalai hill (Arunachala), visible for miles. This represents Shiva as the pillar of fire (Jyotirlinga) that has neither top nor bottom. The festival also honours the Krittika stars who nursed infant Kartikeya.',
    new: 'Karthigai Deepam is a Tamil festival of lights celebrated in the month of Karthigai. Every home lights rows of oil lamps (agal vilakku) at dusk. The culmination is the Mahadeepam, the lighting of a massive beacon on the summit of Tiruvannamalai hill (Arunachala), visible for miles. This represents Shiva as the pillar of fire (Jyotirlinga) that has neither top nor bottom. The festival also honours the Krittika stars who nursed infant Kartikeya.' },
  { slug: 'onam', field: 'significance_en',
    old: "Onam is Kerala's grandest festival — a 10-day harvest celebration centred on the mythical return of the beloved King Mahabali (Maveli) to his kingdom. Vishnu had sent Mahabali to the netherworld as Vamana, but granted him the boon of visiting his subjects once a year. Homes are decorated with elaborate flower carpets (Pookalam), the grand Onam Sadhya feast is served on banana leaves, and the famous Vallam Kali (snake boat races) are held.",
    new: "Onam is Kerala's grandest festival, a 10-day harvest celebration centred on the mythical return of the beloved King Mahabali (Maveli) to his kingdom. Vishnu had sent Mahabali to the netherworld as Vamana, but granted him the boon of visiting his subjects once a year. Homes are decorated with elaborate flower carpets (Pookalam), the grand Onam Sadhya feast is served on banana leaves, and the famous Vallam Kali (snake boat races) are held." },

  // significance_te
  { slug: 'ugadi', field: 'significance_te',
    old: 'ఉగాది తెలుగు మరియు కన్నడ నూతన సంవత్సరం — హిందూ చంద్ర పంచాంగంలో మొదటి రోజు. బ్రహ్మ సృష్టిని ప్రారంభించిన రోజు. పంచాంగ శ్రవణం, ఆరు రుచులతో ఉగాది పచ్చడి తయారుచేస్తారు — రాబోయే సంవత్సర అనుభవాలను సూచిస్తాయి.',
    new: 'ఉగాది తెలుగు మరియు కన్నడ నూతన సంవత్సరం, హిందూ చంద్ర పంచాంగంలో మొదటి రోజు. బ్రహ్మ సృష్టిని ప్రారంభించిన రోజు. పంచాంగ శ్రవణం, ఆరు రుచులతో ఉగాది పచ్చడి తయారుచేస్తారు; ఇవి రాబోయే సంవత్సర అనుభవాలను సూచిస్తాయి.' },
  { slug: 'makar-sankranti', field: 'significance_te',
    old: 'మకర సంక్రాంతి సూర్యుని ఉత్తరాయణ ప్రవేశాన్ని — మకర రాశిలోకి — జరుపుకుంటుంది. శీతాకాలం ముగించి పంట సీజన్ ప్రారంభమవుతుంది. నువ్వులు-బెల్లం వంటకాలు, గాలిపటాలు, పవిత్ర నదుల్లో స్నానం విశేషం.',
    new: 'మకర సంక్రాంతి సూర్యుని ఉత్తరాయణ ప్రవేశాన్ని (మకర రాశిలోకి) జరుపుకుంటుంది. శీతాకాలం ముగించి పంట సీజన్ ప్రారంభమవుతుంది. నువ్వులు-బెల్లం వంటకాలు, గాలిపటాలు, పవిత్ర నదుల్లో స్నానం విశేషం.' },
  { slug: 'vijayadashami', field: 'significance_te',
    old: 'విజయదశమి మంచి చెడుపై సాధించిన విజయం యొక్క పండుగ — నవరాత్రి తర్వాత పదవ రోజు. దుర్గ మహిషాసురుడిపై మరియు రాముడు రావణుడిపై సాధించిన విజయం. ఆయుధ పూజ, శారదా పూజ, మరియు విద్యారంభం శుభకార్యాలు.',
    new: 'విజయదశమి మంచి చెడుపై సాధించిన విజయం యొక్క పండుగ, నవరాత్రి తర్వాత పదవ రోజు. దుర్గ మహిషాసురుడిపై మరియు రాముడు రావణుడిపై సాధించిన విజయం. ఆయుధ పూజ, శారదా పూజ, మరియు విద్యారంభం శుభకార్యాలు.' },
  { slug: 'vaikuntha-ekadashi', field: 'significance_te',
    old: 'వైకుంఠ ఏకాదశి అన్ని ఏకాదశులలో పవిత్రమైనది — వైకుంఠ ద్వారాలు తెరవబడతాయని నమ్ముతారు. ఈ ఉపవాసం ఆచరించి రాత్రంతా విష్ణు మందిరాల్లో భక్తిలో గడిపిన వారికి మోక్షం లభిస్తుంది. తిరుపతి, శ్రీరంగంలో ప్రత్యేక ద్వారం తెరవబడుతుంది.',
    new: 'వైకుంఠ ఏకాదశి అన్ని ఏకాదశులలో పవిత్రమైనది; ఈ రోజు వైకుంఠ ద్వారాలు తెరవబడతాయని నమ్ముతారు. ఈ ఉపవాసం ఆచరించి రాత్రంతా విష్ణు మందిరాల్లో భక్తిలో గడిపిన వారికి మోక్షం లభిస్తుంది. తిరుపతి, శ్రీరంగంలో ప్రత్యేక ద్వారం తెరవబడుతుంది.' },
  { slug: 'akshaya-tritiya', field: 'significance_te',
    old: 'అక్షయ తృతీయ (అవినాశమైన తృతీయ) హిందూ పంచాంగంలో అత్యంత శుభకరమైన నాలుగు రోజులలో ఒకటి. స్వయంసిద్ధ ముహూర్తం — అదనపు ముహూర్తం అవసరం లేదు. ఈ రోజు ప్రారంభించిన పని వృద్ధి చెందుతుంది. పరశురాముని జన్మదినం.',
    new: 'అక్షయ తృతీయ (అవినాశమైన తృతీయ) హిందూ పంచాంగంలో అత్యంత శుభకరమైన నాలుగు రోజులలో ఒకటి. స్వయంసిద్ధ ముహూర్తం కావడంతో అదనపు ముహూర్తం అవసరం లేదు. ఈ రోజు ప్రారంభించిన పని వృద్ధి చెందుతుంది. పరశురాముని జన్మదినం.' },
  { slug: 'guru-purnima', field: 'significance_te',
    old: 'గురు పూర్ణిమ ఆధ్యాత్మిక గురువులను గౌరవించే రోజు. వేదవ్యాసుని జన్మదినం — వేదాలు, మహాభారతం మరియు పురాణాలను సంకలనం చేసిన ఆచార్యుడు. శిష్యులు గురు పాద పూజ చేసి, దక్షిణ సమర్పించి, ఆధ్యాత్మిక నిబద్ధతను పునరుద్ఘాటిస్తారు.',
    new: 'గురు పూర్ణిమ ఆధ్యాత్మిక గురువులను గౌరవించే రోజు. వేదవ్యాసుని జన్మదినం, వేదాలు, మహాభారతం మరియు పురాణాలను సంకలనం చేసిన ఆచార్యుడు. శిష్యులు గురు పాద పూజ చేసి, దక్షిణ సమర్పించి, ఆధ్యాత్మిక నిబద్ధతను పునరుద్ఘాటిస్తారు.' },
  { slug: 'holi', field: 'significance_te',
    old: 'హోళి రంగుల పండుగ, వసంత రుతువు రాక మరియు భక్తి చెడుపై సాధించిన విజయాన్ని జరుపుకుంటుంది. ముందు రోజు రాత్రి హోళికా దహనం — రాక్షసి హోళిక దహనం మరియు విష్ణు కృపతో ప్రహ్లాద రక్షణ. మరుసటి రోజు రంగులు, నీళ్ళతో ఆడతారు.',
    new: 'హోళి రంగుల పండుగ, వసంత రుతువు రాక మరియు భక్తి చెడుపై సాధించిన విజయాన్ని జరుపుకుంటుంది. ముందు రోజు రాత్రి హోళికా దహనం జరుగుతుంది: రాక్షసి హోళిక దహనం మరియు విష్ణు కృపతో ప్రహ్లాద రక్షణ. మరుసటి రోజు రంగులు, నీళ్ళతో ఆడతారు.' },
  { slug: 'bathukamma', field: 'significance_te',
    old: 'బతుకమ్మ తెలంగాణ అత్యంత ప్రీతిపాత్రమైన పండుగ — జీవనదాత్రి అయిన గౌరీ/బతుకమ్మ దేవతను గౌరవించే పుష్పాల పండుగ. మహిళలు అడవి పూలను (తంగేడు, బంతికంప, గునుగు) పెద్ద పళ్ళెంలో వలయాకారంలో పేర్చి పుష్ప స్తంభాన్ని తయారు చేస్తారు. చుట్టూ నృత్యం చేస్తూ జానపద గీతాలు పాడతారు.',
    new: 'బతుకమ్మ తెలంగాణ అత్యంత ప్రీతిపాత్రమైన పండుగ, జీవనదాత్రి అయిన గౌరీ/బతుకమ్మ దేవతను గౌరవించే పుష్పాల పండుగ. మహిళలు అడవి పూలను (తంగేడు, బంతికంప, గునుగు) పెద్ద పళ్ళెంలో వలయాకారంలో పేర్చి పుష్ప స్తంభాన్ని తయారు చేస్తారు. చుట్టూ నృత్యం చేస్తూ జానపద గీతాలు పాడతారు.' },
  { slug: 'bonalu', field: 'significance_te',
    old: 'బోనాలు హైదరాబాద్ మరియు తెలంగాణ యొక్క ప్రత్యేక పండుగ — మహమ్మారుల నుండి రక్షించిన మహాకాళి దేవతకు కృతజ్ఞతగా జరుపుకుంటారు. మహిళలు వండిన అన్నం, బెల్లం, పెరుగు, వేప ఆకులతో మట్టి కుండ (బోనం) తలపై పెట్టుకుని మందిరాలకు వెళ్ళి అర్పిస్తారు.',
    new: 'బోనాలు హైదరాబాద్ మరియు తెలంగాణ యొక్క ప్రత్యేక పండుగ, మహమ్మారుల నుండి రక్షించిన మహాకాళి దేవతకు కృతజ్ఞతగా జరుపుకుంటారు. మహిళలు వండిన అన్నం, బెల్లం, పెరుగు, వేప ఆకులతో మట్టి కుండ (బోనం) తలపై పెట్టుకుని మందిరాలకు వెళ్ళి అర్పిస్తారు.' },
  { slug: 'onam', field: 'significance_te',
    old: 'ఓణం కేరళ అత్యంత వైభవోపేతమైన పండుగ — 10 రోజుల పంట పండుగ. ప్రియమైన రాజు మహాబలి (మావేలి) తన రాజ్యానికి పౌరాణిక తిరిగి రాకను జరుపుకుంటారు. విష్ణువు వామన రూపంలో మహాబలిని పాతాళానికి పంపినా, సంవత్సరానికి ఒకసారి వచ్చే వరం ఇచ్చాడు. పూకలం, ఓణం సద్య, వల్లంకళి ప్రత్యేకతలు.',
    new: 'ఓణం కేరళ అత్యంత వైభవోపేతమైన పండుగ, 10 రోజుల పంట పండుగ. ప్రియమైన రాజు మహాబలి (మావేలి) తన రాజ్యానికి పౌరాణిక తిరిగి రాకను జరుపుకుంటారు. విష్ణువు వామన రూపంలో మహాబలిని పాతాళానికి పంపినా, సంవత్సరానికి ఒకసారి వచ్చే వరం ఇచ్చాడు. పూకలం, ఓణం సద్య, వల్లంకళి ప్రత్యేకతలు.' },

  // significance_ta
  { slug: 'ugadi', field: 'significance_ta',
    old: 'உகாதி தெலுங்கு மற்றும் கன்னட புத்தாண்டு — இந்து சந்திர நாட்காட்டியில் முதல் நாள். பிரம்மா படைப்பை தொடங்கிய நாள். பஞ்சாங்க ஸ்ரவணம், ஆறு சுவைகளுடன் உகாதி பச்சடி தயாரிக்கிறார்கள்.',
    new: 'உகாதி தெலுங்கு மற்றும் கன்னட புத்தாண்டு, இந்து சந்திர நாட்காட்டியில் முதல் நாள். பிரம்மா படைப்பை தொடங்கிய நாள். பஞ்சாங்க ஸ்ரவணம், ஆறு சுவைகளுடன் உகாதி பச்சடி தயாரிக்கிறார்கள்.' },
  { slug: 'pongal', field: 'significance_ta',
    old: 'பொங்கல் தமிழ்நாட்டின் மிக முக்கியமான அறுவடை திருவிழா, நான்கு நாட்கள் கொண்டாடப்படுகிறது. "பொங்கல்" என்றால் "பொங்குதல்" — சூரியனின் முதல் கிரணங்களில் இனிப்பு சாதம் பொங்கி வழிவது செழிப்பின் அடையாளம். நான்கு நாட்கள்: போகி, சூரிய பொங்கல், மட்டு பொங்கல், கானும் பொங்கல்.',
    new: 'பொங்கல் தமிழ்நாட்டின் மிக முக்கியமான அறுவடை திருவிழா, நான்கு நாட்கள் கொண்டாடப்படுகிறது. "பொங்கல்" என்றால் "பொங்குதல்": சூரியனின் முதல் கிரணங்களில் இனிப்பு சாதம் பொங்கி வழிவது செழிப்பின் அடையாளம். நான்கு நாட்கள்: போகி, சூரிய பொங்கல், மட்டு பொங்கல், கானும் பொங்கல்.' },
  { slug: 'vijayadashami', field: 'significance_ta',
    old: 'விஜயதசமி நன்மை தீமையை வென்ற திருவிழா — நவராத்திரியின் பத்தாம் நாள். துர்கா மகிஷாசுரனையும், இராமன் இராவணனையும் வென்றனர். ஆயுத பூஜை, சரஸ்வதி பூஜை மற்றும் வித்யாரம்பம் சுபகாரியங்கள்.',
    new: 'விஜயதசமி நன்மை தீமையை வென்ற திருவிழா, நவராத்திரியின் பத்தாம் நாள். துர்கா மகிஷாசுரனையும், இராமன் இராவணனையும் வென்றனர். ஆயுத பூஜை, சரஸ்வதி பூஜை மற்றும் வித்யாரம்பம் சுபகாரியங்கள்.' },
  { slug: 'vaikuntha-ekadashi', field: 'significance_ta',
    old: 'வைகுண்ட ஏகாதசி அனைத்து ஏகாதசிகளிலும் மிக புனிதமானது — வைகுண்ட வாசல் திறக்கப்படுகிறது என்று நம்பப்படுகிறது. இந்த விரதத்தை கடைப்பிடித்து இரவு முழுவதும் திருமால் கோவில்களில் பக்தியில் கழிப்பவர்களுக்கு மோட்சம் கிட்டும்.',
    new: 'வைகுண்ட ஏகாதசி அனைத்து ஏகாதசிகளிலும் மிக புனிதமானது; இந்நாளில் வைகுண்ட வாசல் திறக்கப்படுகிறது என்று நம்பப்படுகிறது. இந்த விரதத்தை கடைப்பிடித்து இரவு முழுவதும் திருமால் கோவில்களில் பக்தியில் கழிப்பவர்களுக்கு மோட்சம் கிட்டும்.' },
  { slug: 'akshaya-tritiya', field: 'significance_ta',
    old: 'அக்ஷய திருதியை (அழிவற்ற மூன்றாம் நாள்) இந்து நாட்காட்டியில் மிகவும் சுபமான நான்கு நாட்களில் ஒன்று. சுயம் சித்த முகூர்த்தம் — கூடுதல் முகூர்த்தம் தேவையில்லை. இந்நாளில் தொடங்கும் எல்லாமே வளரும். பரசுராமரின் பிறந்தநாள்.',
    new: 'அக்ஷய திருதியை (அழிவற்ற மூன்றாம் நாள்) இந்து நாட்காட்டியில் மிகவும் சுபமான நான்கு நாட்களில் ஒன்று. சுயம் சித்த முகூர்த்தமாக இருப்பதால் கூடுதல் முகூர்த்தம் தேவையில்லை. இந்நாளில் தொடங்கும் எல்லாமே வளரும். பரசுராமரின் பிறந்தநாள்.' },
  { slug: 'guru-purnima', field: 'significance_ta',
    old: 'குரு பூர்ணிமா ஆன்மீக குருவை மதிக்கும் நாள். வேத வியாசரின் பிறந்தநாள் — வேதங்கள், மகாபாரதம் மற்றும் புராணங்களை தொகுத்தவர். சீடர்கள் குரு பாத பூஜை செய்து, தட்சிணை அளித்து, ஆன்மீக உறுதிமொழியை புதுப்பிக்கிறார்கள்.',
    new: 'குரு பூர்ணிமா ஆன்மீக குருவை மதிக்கும் நாள். வேத வியாசரின் பிறந்தநாள், வேதங்கள், மகாபாரதம் மற்றும் புராணங்களை தொகுத்தவர். சீடர்கள் குரு பாத பூஜை செய்து, தட்சிணை அளித்து, ஆன்மீக உறுதிமொழியை புதுப்பிக்கிறார்கள்.' },
  { slug: 'holi', field: 'significance_ta',
    old: 'ஹோலி வர்ணங்களின் திருவிழா, வசந்த காலத்தின் வருகை மற்றும் பக்தியின் தீமையின் மீதான வெற்றியை கொண்டாடுகிறது. முந்தைய இரவு ஹோலிகா தகனம் — ஹோலிகா என்ற அரக்கி எரிந்து பக்தன் பிரகலாதன் விஷ்ணுவின் அருளால் காப்பாற்றப்படுகிறான். மறுநாள் காலை வண்ணங்கள் விளையாட்டு.',
    new: 'ஹோலி வர்ணங்களின் திருவிழா, வசந்த காலத்தின் வருகை மற்றும் பக்தியின் தீமையின் மீதான வெற்றியை கொண்டாடுகிறது. முந்தைய இரவு ஹோலிகா தகனம் நடைபெறுகிறது: ஹோலிகா என்ற அரக்கி எரிந்து பக்தன் பிரகலாதன் விஷ்ணுவின் அருளால் காப்பாற்றப்படுகிறான். மறுநாள் காலை வண்ணங்கள் விளையாட்டு.' },
  { slug: 'bathukamma', field: 'significance_ta',
    old: 'பதுகம்மா தெலங்கானாவின் மிகவும் விரும்பப்படும் திருவிழா — உயிர் தரும் தாயான கௌரி/பதுகம்மா தேவதையை மதிக்கும் பூத் திருவிழா. பெண்கள் காட்டு பூக்களை (தங்கேடு, பந்திகம்பா, குனுகு) பெரிய தட்டில் வட்டமாக அடுக்கி பூ கோபுரம் செய்கிறார்கள்.',
    new: 'பதுகம்மா தெலங்கானாவின் மிகவும் விரும்பப்படும் திருவிழா, உயிர் தரும் தாயான கௌரி/பதுகம்மா தேவதையை மதிக்கும் பூத் திருவிழா. பெண்கள் காட்டு பூக்களை (தங்கேடு, பந்திகம்பா, குனுகு) பெரிய தட்டில் வட்டமாக அடுக்கி பூ கோபுரம் செய்கிறார்கள்.' },
  { slug: 'bonalu', field: 'significance_ta',
    old: 'போனாலு ஹைதராபாத் மற்றும் தெலங்கானாவின் தனித்துவமான திருவிழா — தொற்றுநோயிலிருந்து பாதுகாத்த மகாகாளி தேவதைக்கு நன்றி கூறும் திருவிழா. பெண்கள் சமைத்த அரிசி, வெல்லம், தயிர், வேப்பிலை நிரப்பிய மண் குடத்தை தலையில் சுமந்து கோவில்களுக்கு சென்று அர்பிக்கிறார்கள்.',
    new: 'போனாலு ஹைதராபாத் மற்றும் தெலங்கானாவின் தனித்துவமான திருவிழா, தொற்றுநோயிலிருந்து பாதுகாத்த மகாகாளி தேவதைக்கு நன்றி கூறும் திருவிழா. பெண்கள் சமைத்த அரிசி, வெல்லம், தயிர், வேப்பிலை நிரப்பிய மண் குடத்தை தலையில் சுமந்து கோவில்களுக்கு சென்று அர்பிக்கிறார்கள்.' },
  { slug: 'karthigai-deepam', field: 'significance_ta',
    old: 'கார்த்திகை தீபம் கார்த்திகை மாதத்தில் கொண்டாடப்படும் தமிழ் விளக்கு திருவிழா. ஒவ்வொரு வீட்டிலும் மாலையில் அகல் விளக்குகள் ஏற்றப்படுகின்றன. உச்சகட்டம் திருவண்ணாமலை மலை உச்சியில் மகாதீபம் ஏற்றுதல் — சிவனின் ஜோதிர்லிங்க வடிவத்தை குறிக்கிறது.',
    new: 'கார்த்திகை தீபம் கார்த்திகை மாதத்தில் கொண்டாடப்படும் தமிழ் விளக்கு திருவிழா. ஒவ்வொரு வீட்டிலும் மாலையில் அகல் விளக்குகள் ஏற்றப்படுகின்றன. உச்சகட்டம் திருவண்ணாமலை மலை உச்சியில் மகாதீபம் ஏற்றுதல் ஆகும், இது சிவனின் ஜோதிர்லிங்க வடிவத்தை குறிக்கிறது.' },
  { slug: 'onam', field: 'significance_ta',
    old: 'ஓணம் கேரளாவின் மிகவும் சிறந்த திருவிழா — 10 நாள் அறுவடை கொண்டாட்டம். அன்பான அரசன் மகாபலி (மாவேலி) தன் ராஜ்யத்திற்கு திரும்புவதை கொண்டாடுகிறார்கள். விஷ்ணு வாமன ரூபத்தில் மகாபலியை பாதாளத்திற்கு அனுப்பினாலும், ஆண்டுக்கு ஒருமுறை வர வரம் கொடுத்தார். பூக்கோலம், ஓணம் சத்யா, வல்லம்களி சிறப்புகள்.',
    new: 'ஓணம் கேரளாவின் மிகவும் சிறந்த திருவிழா, 10 நாள் அறுவடை கொண்டாட்டம். அன்பான அரசன் மகாபலி (மாவேலி) தன் ராஜ்யத்திற்கு திரும்புவதை கொண்டாடுகிறார்கள். விஷ்ணு வாமன ரூபத்தில் மகாபலியை பாதாளத்திற்கு அனுப்பினாலும், ஆண்டுக்கு ஒருமுறை வர வரம் கொடுத்தார். பூக்கோலம், ஓணம் சத்யா, வல்லம்களி சிறப்புகள்.' },

  // significance_hi
  { slug: 'ugadi', field: 'significance_hi',
    old: 'उगादि तेलुगु और कन्नड़ नव वर्ष है — हिंदू चंद्र पंचांग का पहला दिन। ब्रह्मा ने इसी दिन सृष्टि आरंभ की। पंचांग श्रवण, छह स्वादों वाली उगादि पचड़ी — आने वाले वर्ष के अनुभवों का प्रतीक।',
    new: 'उगादि तेलुगु और कन्नड़ नव वर्ष है, हिंदू चंद्र पंचांग का पहला दिन। ब्रह्मा ने इसी दिन सृष्टि आरंभ की। पंचांग श्रवण किया जाता है, और छह स्वादों वाली उगादि पचड़ी बनाई जाती है, जो आने वाले वर्ष के अनुभवों का प्रतीक है।' },
  { slug: 'makar-sankranti', field: 'significance_hi',
    old: 'मकर संक्रांति सूर्य के उत्तरायण प्रवेश — मकर राशि में — का उत्सव है। शीत ऋतु की समाप्ति और फसल सीजन का आरंभ। तिल-गुड़ के व्यंजन, पतंगबाजी, और पवित्र नदियों में स्नान विशेष हैं।',
    new: 'मकर संक्रांति सूर्य के उत्तरायण प्रवेश (मकर राशि में) का उत्सव है। शीत ऋतु की समाप्ति और फसल सीजन का आरंभ। तिल-गुड़ के व्यंजन, पतंगबाजी, और पवित्र नदियों में स्नान विशेष हैं।' },
  { slug: 'vijayadashami', field: 'significance_hi',
    old: 'विजयादशमी बुराई पर अच्छाई की जीत का पर्व है — नवरात्रि के दस दिन बाद। दुर्गा ने महिषासुर और राम ने रावण पर विजय प्राप्त की। आयुध पूजा, सरस्वती पूजा और विद्यारंभ के शुभ कार्य होते हैं।',
    new: 'विजयादशमी बुराई पर अच्छाई की जीत का पर्व है, जो नवरात्रि के दस दिन बाद मनाया जाता है। दुर्गा ने महिषासुर और राम ने रावण पर विजय प्राप्त की। आयुध पूजा, सरस्वती पूजा और विद्यारंभ के शुभ कार्य होते हैं।' },
  { slug: 'vaikuntha-ekadashi', field: 'significance_hi',
    old: 'वैकुंठ एकादशी सभी एकादशियों में सबसे पवित्र है — वैकुंठ द्वार खुलने का दिन। इस व्रत को रखकर रात भर विष्णु मंदिरों में भक्ति में लीन रहने से मोक्ष मिलता है। तिरुपति और श्रीरंगम में विशेष द्वार केवल इसी दिन खोला जाता है।',
    new: 'वैकुंठ एकादशी सभी एकादशियों में सबसे पवित्र है, वह दिन जब वैकुंठ द्वार खुलने की मान्यता है। इस व्रत को रखकर रात भर विष्णु मंदिरों में भक्ति में लीन रहने से मोक्ष मिलता है। तिरुपति और श्रीरंगम में विशेष द्वार केवल इसी दिन खोला जाता है।' },
  { slug: 'rath-yatra', field: 'significance_hi',
    old: 'रथ यात्रा भगवान जगन्नाथ (कृष्ण), बलराम और सुभद्रा की भव्य रथ शोभायात्रा है — जगन्नाथ मंदिर से गुंडिचा मंदिर तक, पुरी, ओडिशा। तीन विशाल रथ हजारों भक्तों द्वारा खींचे जाते हैं। विश्व के प्राचीनतम और विशालतम धार्मिक जुलूसों में से एक।',
    new: 'रथ यात्रा भगवान जगन्नाथ (कृष्ण), बलराम और सुभद्रा की भव्य रथ शोभायात्रा है, जो पुरी, ओडिशा में जगन्नाथ मंदिर से गुंडिचा मंदिर तक निकाली जाती है। तीन विशाल रथ हजारों भक्तों द्वारा खींचे जाते हैं। विश्व के प्राचीनतम और विशालतम धार्मिक जुलूसों में से एक।' },
  { slug: 'akshaya-tritiya', field: 'significance_hi',
    old: 'अक्षय तृतीया (अक्षय = कभी न घटने वाला) हिंदू पंचांग के चार स्वयंसिद्ध मुहूर्तों में से एक। इस दिन किया गया कोई भी कार्य — विवाह, नया व्यापार, सोना खरीद, निर्माण — बढ़ता है और कभी कम नहीं होता। परशुराम जयंती भी है।',
    new: 'अक्षय तृतीया (अक्षय = कभी न घटने वाला) हिंदू पंचांग के चार स्वयंसिद्ध मुहूर्तों में से एक। इस दिन किया गया कोई भी कार्य, चाहे विवाह हो, नया व्यापार, सोना खरीद, या निर्माण, बढ़ता है और कभी कम नहीं होता। परशुराम जयंती भी है।' },
  { slug: 'guru-purnima', field: 'significance_hi',
    old: 'गुरु पूर्णिमा आध्यात्मिक गुरु को सम्मानित करने का दिन है। वेदव्यास का जन्मदिन — जिन्होंने वेदों, महाभारत और पुराणों का संकलन किया। शिष्य गुरु पाद पूजा करते हैं, दक्षिणा अर्पित करते हैं और आध्यात्मिक प्रतिबद्धता नवीनीकृत करते हैं।',
    new: 'गुरु पूर्णिमा आध्यात्मिक गुरु को सम्मानित करने का दिन है। वेदव्यास का जन्मदिन है, जिन्होंने वेदों, महाभारत और पुराणों का संकलन किया। शिष्य गुरु पाद पूजा करते हैं, दक्षिणा अर्पित करते हैं और आध्यात्मिक प्रतिबद्धता नवीनीकृत करते हैं।' },
  { slug: 'holi', field: 'significance_hi',
    old: 'होली रंगों का त्योहार है — वसंत के आगमन और भक्ति की बुराई पर विजय का उत्सव। एक दिन पहले होलिका दहन — राक्षसी होलिका का दहन और विष्णु की कृपा से प्रह्लाद की रक्षा। अगले दिन रंग और पानी से खेला जाता है।',
    new: 'होली रंगों का त्योहार है, वसंत के आगमन और भक्ति की बुराई पर विजय का उत्सव। एक दिन पहले होलिका दहन मनाया जाता है: राक्षसी होलिका का दहन और विष्णु की कृपा से प्रह्लाद की रक्षा। अगले दिन रंग और पानी से खेला जाता है।' },
  { slug: 'bathukamma', field: 'significance_hi',
    old: 'बतुकम्मा तेलंगाना का सबसे प्रिय त्योहार है — जीवनदायिनी देवी गौरी/बतुकम्मा का फूलों का पर्व। महिलाएं जंगली फूलों (तंगेडु, बंतिकंप, गुनुगु) को बड़े थाल में गोल-गोल सजाकर फूलों का स्तंभ बनाती हैं। उसके चारों ओर नृत्य करते हुए लोकगीत गाती हैं।',
    new: 'बतुकम्मा तेलंगाना का सबसे प्रिय त्योहार है, जीवनदायिनी देवी गौरी/बतुकम्मा का फूलों का पर्व। महिलाएं जंगली फूलों (तंगेडु, बंतिकंप, गुनुगु) को बड़े थाल में गोल-गोल सजाकर फूलों का स्तंभ बनाती हैं। उसके चारों ओर नृत्य करते हुए लोकगीत गाती हैं।' },
  { slug: 'bonalu', field: 'significance_hi',
    old: 'बोनालु हैदराबाद और तेलंगाना का अनूठा त्योहार है — महामारी से रक्षा करने वाली महाकाली को धन्यवाद का त्योहार। महिलाएं पकाया चावल, गुड़, दही, नीम के पत्तों से भरे मिट्टी के घड़े (बोनम) सिर पर रखकर मंदिरों में जाकर अर्पित करती हैं।',
    new: 'बोनालु हैदराबाद और तेलंगाना का अनूठा त्योहार है, महामारी से रक्षा करने वाली महाकाली को धन्यवाद का त्योहार। महिलाएं पकाया चावल, गुड़, दही, नीम के पत्तों से भरे मिट्टी के घड़े (बोनम) सिर पर रखकर मंदिरों में जाकर अर्पित करती हैं।' },
  { slug: 'karthigai-deepam', field: 'significance_hi',
    old: 'कार्तिगाई दीपम तमिल कार्तिगाई माह का प्रकाश उत्सव है। हर घर में शाम को मिट्टी के दीपक (अगल विलक्कु) की पंक्तियां जलाई जाती हैं। तिरुवण्णामलाई पहाड़ पर महादीपम का प्रज्वलन — शिव के ज्योतिर्लिंग स्वरूप का प्रतीक।',
    new: 'कार्तिगाई दीपम तमिल कार्तिगाई माह का प्रकाश उत्सव है। हर घर में शाम को मिट्टी के दीपक (अगल विलक्कु) की पंक्तियां जलाई जाती हैं। तिरुवण्णामलाई पहाड़ पर महादीपम प्रज्वलित किया जाता है, जो शिव के ज्योतिर्लिंग स्वरूप का प्रतीक है।' },
  { slug: 'onam', field: 'significance_hi',
    old: 'ओणम केरल का सबसे भव्य त्योहार है — 10 दिनों का फसल उत्सव। प्रिय राजा महाबलि (मावेली) के अपने राज्य में पौराणिक वापसी का उत्सव। विष्णु ने वामन रूप में महाबलि को पाताल भेजा लेकिन वर्ष में एक बार आने का वरदान दिया। पूकलम, ओणम साध्य, वल्लम कळी विशेषताएं।',
    new: 'ओणम केरल का सबसे भव्य त्योहार है, 10 दिनों का फसल उत्सव। प्रिय राजा महाबलि (मावेली) के अपने राज्य में पौराणिक वापसी का उत्सव। विष्णु ने वामन रूप में महाबलि को पाताल भेजा लेकिन वर्ष में एक बार आने का वरदान दिया। पूकलम, ओणम साध्य, वल्लम कळी विशेषताएं।' },
];

// ---------------------------------------------------------------------------
// PUJAS (matched by slug)
// ---------------------------------------------------------------------------
const PUJAS_FIXES = [
  { slug: 'satyanarayana-puja', field: 'brief_description_en',
    old: 'A widely observed home puja dedicated to Lord Satyanarayana — a benevolent, accessible form of Vishnu — performed on Purnima (full moon), Ekadashi, or any auspicious occasion. Done to seek blessings, fulfil vows, and express gratitude for prosperity.',
    new: 'A widely observed home puja dedicated to Lord Satyanarayana, a benevolent, accessible form of Vishnu, performed on Purnima (full moon), Ekadashi, or any auspicious occasion. Done to seek blessings, fulfil vows, and express gratitude for prosperity.' },

  { slug: 'satyanarayana-puja', field: 'prasad_en',
    old: 'Panchamrit (milk, curd, honey, ghee, sugar mixture) and sweet prasad — semolina (suji) halwa in North India, or banana and coconut in South India.',
    new: 'Panchamrit (milk, curd, honey, ghee, sugar mixture) and sweet prasad: semolina (suji) halwa in North India, or banana and coconut in South India.' },
  { slug: 'daily-home-puja', field: 'prasad_en',
    old: 'Any sweet cooked as naivedhya — common choices are sweet pongal (chakkarai pongal), kheer, or fruit. Fruits and the offered food are distributed as prasad.',
    new: 'Any sweet cooked as naivedhya, with common choices being sweet pongal (chakkarai pongal), kheer, or fruit. Fruits and the offered food are distributed as prasad.' },

  { slug: 'satyanarayana-puja', field: 'prasad_te',
    old: 'పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార) మరియు ప్రసాదం — దక్షిణాది: అరటి పండు, కొబ్బరికాయ; ఉత్తరాది: రవ్వ హల్వా.',
    new: 'పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార) మరియు ప్రసాదం: దక్షిణాదిలో అరటి పండు, కొబ్బరికాయ; ఉత్తరాదిలో రవ్వ హల్వా.' },
  { slug: 'daily-home-puja', field: 'prasad_te',
    old: 'నైవేద్యంగా వండిన తీపి పదార్థం — చక్కర పొంగలి, పాయసం లేదా పళ్ళు సాధారణంగా సమర్పిస్తారు. అర్పించిన పదార్థాలు ప్రసాదంగా పంచుతారు.',
    new: 'నైవేద్యంగా వండిన తీపి పదార్థంగా చక్కర పొంగలి, పాయసం లేదా పళ్ళు సాధారణంగా సమర్పిస్తారు. అర్పించిన పదార్థాలు ప్రసాదంగా పంచుతారు.' },
  { slug: 'shiva-puja', field: 'prasad_te',
    old: 'అభిషేకంలో ఉపయోగించిన పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార) తీర్థంగా అందిస్తారు. విభూతి (పవిత్ర భస్మం) ప్రధాన ప్రసాదం — నొసటికి పూస్తారు. పళ్ళు, కొబ్బరికాయ ముక్కలు కూడా పంచుతారు.',
    new: 'అభిషేకంలో ఉపయోగించిన పంచామృతం (పాలు, పెరుగు, తేనె, నెయ్యి, పంచదార) తీర్థంగా అందిస్తారు. విభూతి (పవిత్ర భస్మం) ప్రధాన ప్రసాదం, దీన్ని నొసటికి పూస్తారు. పళ్ళు, కొబ్బరికాయ ముక్కలు కూడా పంచుతారు.' },
  { slug: 'kubera-puja', field: 'prasad_te',
    old: 'నైవేద్యంగా చక్కెర పొంగలి, మోదకాలు లేదా అర్పించిన తీపి పదార్థాలు ప్రసాదంగా పంచుతారు. కొబ్బరికాయ ముక్కలు మరియు పళ్ళు కూడా ఉంటాయి. పూజలో దేవుని ముందు ఉంచిన బంగారు లేదా వెండి నాణేలు అత్యంత శుభకరంగా భావించి భద్రపరచుకుంటారు (తినరు) — ఇవి సంపద మరియు సమృద్ధి కోసం కుబేర దేవుని ఆశీర్వాదాన్ని కలిగి ఉంటాయి.',
    new: 'నైవేద్యంగా చక్కెర పొంగలి, మోదకాలు లేదా అర్పించిన తీపి పదార్థాలు ప్రసాదంగా పంచుతారు. కొబ్బరికాయ ముక్కలు మరియు పళ్ళు కూడా ఉంటాయి. పూజలో దేవుని ముందు ఉంచిన బంగారు లేదా వెండి నాణేలు అత్యంత శుభకరంగా భావించి భద్రపరచుకుంటారు (తినరు), ఎందుకంటే ఇవి సంపద మరియు సమృద్ధి కోసం కుబేర దేవుని ఆశీర్వాదాన్ని కలిగి ఉంటాయి.' },

  { slug: 'satyanarayana-puja', field: 'prasad_ta',
    old: 'பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை) மற்றும் பிரசாதம் — வாழைப்பழம், தேங்காய் (தென்னிந்தியா) அல்லது ரவை அல்வா (வட இந்தியா).',
    new: 'பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை) மற்றும் பிரசாதமாக வாழைப்பழம், தேங்காய் (தென்னிந்தியா) அல்லது ரவை அல்வா (வட இந்தியா) வழங்கப்படுகிறது.' },
  { slug: 'daily-home-puja', field: 'prasad_ta',
    old: 'நைவேத்தியமாக வைக்கப்படும் இனிப்பு — சக்கரை பொங்கல், பாயசம் அல்லது பழங்கள் சாதாரணமாக செய்யப்படுகின்றன. அர்ப்பணித்த பொருட்கள் பிரசாதமாக வழங்கப்படுகின்றன.',
    new: 'நைவேத்தியமாக வைக்கப்படும் இனிப்பாக சக்கரை பொங்கல், பாயசம் அல்லது பழங்கள் சாதாரணமாக செய்யப்படுகின்றன. அர்ப்பணித்த பொருட்கள் பிரசாதமாக வழங்கப்படுகின்றன.' },
  { slug: 'shiva-puja', field: 'prasad_ta',
    old: 'அபிஷேகத்தில் பயன்படுத்திய பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை) தீர்த்தமாக வழங்கப்படுகிறது. திருநீறு (விபூதி) முதன்மை பிரசாதம் — நெற்றியில் இடப்படுகிறது. பழங்கள் மற்றும் தேங்காய் துண்டுகளும் வழங்கப்படுகின்றன.',
    new: 'அபிஷேகத்தில் பயன்படுத்திய பஞ்சாமிர்தம் (பால், தயிர், தேன், நெய், சர்க்கரை) தீர்த்தமாக வழங்கப்படுகிறது. திருநீறு (விபூதி) முதன்மை பிரசாதம், நெற்றியில் இடப்படுகிறது. பழங்கள் மற்றும் தேங்காய் துண்டுகளும் வழங்கப்படுகின்றன.' },
  { slug: 'kubera-puja', field: 'prasad_ta',
    old: 'நைவேத்தியமாக சர்க்கரை பொங்கல், மோதகம் அல்லது அர்ப்பணிக்கப்பட்ட இனிப்புகள் பிரசாதமாக வழங்கப்படுகின்றன. தேங்காய் துண்டுகள் மற்றும் பழங்களும் இருக்கும். பூஜையில் தேவர் முன்னால் வைக்கப்பட்ட தங்க அல்லது வெள்ளி நாணயங்கள் மிக்க சுபகரமாக கருதப்பட்டு பாதுகாக்கப்படுகின்றன (சாப்பிடப்படுவதில்லை) — இவை செல்வம் மற்றும் செழிப்பிற்கு குபேர தேவரின் ஆசீர்வாதத்தை கொண்டிருக்கின்றன.',
    new: 'நைவேத்தியமாக சர்க்கரை பொங்கல், மோதகம் அல்லது அர்ப்பணிக்கப்பட்ட இனிப்புகள் பிரசாதமாக வழங்கப்படுகின்றன. தேங்காய் துண்டுகள் மற்றும் பழங்களும் இருக்கும். பூஜையில் தேவர் முன்னால் வைக்கப்பட்ட தங்க அல்லது வெள்ளி நாணயங்கள் மிக்க சுபகரமாக கருதப்பட்டு பாதுகாக்கப்படுகின்றன (சாப்பிடப்படுவதில்லை), ஏனெனில் இவை செல்வம் மற்றும் செழிப்பிற்கு குபேர தேவரின் ஆசீர்வாதத்தை கொண்டிருக்கின்றன.' },

  { slug: 'satyanarayana-puja', field: 'prasad_hi',
    old: 'पंचामृत (दूध, दही, शहद, घी, चीनी) और प्रसाद — उत्तर भारत: सूजी का हलवा; दक्षिण भारत: केला और नारियल।',
    new: 'पंचामृत (दूध, दही, शहद, घी, चीनी) और प्रसाद: उत्तर भारत में सूजी का हलवा; दक्षिण भारत में केला और नारियल।' },
  { slug: 'daily-home-puja', field: 'prasad_hi',
    old: 'नैवेद्य में अर्पित मीठा प्रसाद — मीठा पोंगल, खीर या फल सामान्यतः चढ़ाए जाते हैं। अर्पित किए गए पदार्थ प्रसाद के रूप में वितरित किए जाते हैं।',
    new: 'नैवेद्य में अर्पित मीठे प्रसाद के रूप में मीठा पोंगल, खीर या फल सामान्यतः चढ़ाए जाते हैं। अर्पित किए गए पदार्थ प्रसाद के रूप में वितरित किए जाते हैं।' },
  { slug: 'shiva-puja', field: 'prasad_hi',
    old: 'अभिषेक में प्रयुक्त पंचामृत (दूध, दही, शहद, घी, चीनी) तीर्थ के रूप में दिया जाता है। विभूति (पवित्र भस्म) प्रमुख प्रसाद है — माथे पर लगाया जाता है। फल और नारियल के टुकड़े भी वितरित किए जाते हैं।',
    new: 'अभिषेक में प्रयुक्त पंचामृत (दूध, दही, शहद, घी, चीनी) तीर्थ के रूप में दिया जाता है। विभूति (पवित्र भस्म) प्रमुख प्रसाद है, जिसे माथे पर लगाया जाता है। फल और नारियल के टुकड़े भी वितरित किए जाते हैं।' },
  { slug: 'kubera-puja', field: 'prasad_hi',
    old: 'नैवेद्य के रूप में मीठे चावल (शक्करपोंगल), मोदक, या अर्पित मिठाइयाँ प्रसाद के रूप में बाँटी जाती हैं। नारियल के टुकड़े और फल भी शामिल होते हैं। पूजा में देव के सम्मुख रखे गए सोने या चाँदी के सिक्के अत्यंत शुभ माने जाते हैं और सुरक्षित रखे जाते हैं (खाए नहीं जाते) — ये कुबेर देव का धन और समृद्धि का आशीर्वाद लेकर चलते हैं।',
    new: 'नैवेद्य के रूप में मीठे चावल (शक्करपोंगल), मोदक, या अर्पित मिठाइयाँ प्रसाद के रूप में बाँटी जाती हैं। नारियल के टुकड़े और फल भी शामिल होते हैं। पूजा में देव के सम्मुख रखे गए सोने या चाँदी के सिक्के अत्यंत शुभ माने जाते हैं और सुरक्षित रखे जाते हैं (खाए नहीं जाते), क्योंकि ये कुबेर देव का धन और समृद्धि का आशीर्वाद लेकर चलते हैं।' },
];

// ---------------------------------------------------------------------------
// MATERIAL_ITEMS (matched by group_slug + item_order; no per-row slug column)
// ---------------------------------------------------------------------------
const MATERIAL_ITEMS_FIXES = [
  { group_slug: 'ekadashi-vratham', item_order: '2', field: 'substitution_note_en',
    old: 'Essential — must not be omitted for Vishnu worship',
    new: 'Essential: must not be omitted for Vishnu worship' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: '2', field: 'substitution_note_en',
    old: 'Do not skip — Ganesha accepts no worship without durva',
    new: 'Do not skip this: Ganesha accepts no worship without durva' },
  { group_slug: 'vishnu-puja', item_order: '2', field: 'substitution_note_en',
    old: 'Essential for Vishnu puja — no substitute; always pluck fresh before puja',
    new: 'Essential for Vishnu puja, with no substitute; always pluck fresh before puja' },

  { group_slug: 'ekadashi-vratham', item_order: '2', field: 'substitution_note_te',
    old: 'తప్పనిసరి — విష్ణు పూజలో ఇది వదలకూడదు',
    new: 'తప్పనిసరి; విష్ణు పూజలో ఇది వదలకూడదు' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: '2', field: 'substitution_note_te',
    old: 'వదిలివేయకూడదు — దూర్వ లేకుండా గణేశుడు పూజను స్వీకరించడు',
    new: 'వదిలివేయకూడదు; దూర్వ లేకుండా గణేశుడు పూజను స్వీకరించడు' },
  { group_slug: 'vishnu-puja', item_order: '2', field: 'substitution_note_te',
    old: 'విష్ణు పూజకు అవసరమైనది — ప్రత్యామ్నాయం లేదు; ఎల్లప్పుడూ పూజకు ముందు తాజాగా తోడవండి.',
    new: 'విష్ణు పూజకు అవసరమైనది, ప్రత్యామ్నాయం లేదు; ఎల్లప్పుడూ పూజకు ముందు తాజాగా తోడవండి.' },
  { group_slug: 'navagraha-puja', item_order: '3', field: 'substitution_note_te',
    old: 'మొగ్గ (పసుపు/గురు), మల్లె (తెలుపు/చంద్ర+శుక్ర), ఎర్ర మందారం (ఎరుపు/సూర్య+కుజ) — ఈ మూడు పూలు కలిసి 9 గ్రహ అర్పణలు అన్నింటినీ కవర్ చేస్తాయి.',
    new: 'మొగ్గ (పసుపు/గురు), మల్లె (తెలుపు/చంద్ర+శుక్ర), ఎర్ర మందారం (ఎరుపు/సూర్య+కుజ) అనే ఈ మూడు పూలు కలిసి 9 గ్రహ అర్పణలు అన్నింటినీ కవర్ చేస్తాయి.' },
  { group_slug: 'navagraha-puja', item_order: '4', field: 'substitution_note_te',
    old: 'నల్ల నువ్వులు శనికి ప్రాథమిక అర్పణ — వీటికి ప్రత్యామ్నాయం తగదు.',
    new: 'నల్ల నువ్వులు శనికి ప్రాథమిక అర్పణ; వీటికి ప్రత్యామ్నాయం తగదు.' },

  { group_slug: 'ekadashi-vratham', item_order: '2', field: 'substitution_note_ta',
    old: 'அத்தியாவசியம் — விஷ்ணு வழிபாட்டில் தவிர்க்கக் கூடாது',
    new: 'அத்தியாவசியம்; விஷ்ணு வழிபாட்டில் தவிர்க்கக் கூடாது' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: '2', field: 'substitution_note_ta',
    old: 'தவிர்க்கக் கூடாது — துர்வா இல்லாமல் கணேசர் வழிபாட்டை ஏற்கமாட்டார்',
    new: 'தவிர்க்கக் கூடாது; துர்வா இல்லாமல் கணேசர் வழிபாட்டை ஏற்கமாட்டார்' },
  { group_slug: 'vishnu-puja', item_order: '2', field: 'substitution_note_ta',
    old: 'விஷ்ணு பூஜைக்கு அவசியமானது — மாற்று இல்லை; எப்போதும் பூஜைக்கு முன் புதிதாக பறிக்கவும்.',
    new: 'விஷ்ணு பூஜைக்கு அவசியமானது, மாற்று இல்லை; எப்போதும் பூஜைக்கு முன் புதிதாக பறிக்கவும்.' },
  { group_slug: 'navagraha-puja', item_order: '3', field: 'substitution_note_ta',
    old: 'சேவந்தி (மஞ்சள்/குரு), மல்லிகை (வெள்ளை/சந்திரன்+சுக்கிரன்), சிவப்பு செம்பருத்தி (சிவப்பு/சூரியன்+செவ்வாய்) — இந்த மூன்று மலர்கள் ஒன்றாக 9 கிரக அர்ப்பணங்கள் அனைத்தையும் உள்ளடக்கும்.',
    new: 'சேவந்தி (மஞ்சள்/குரு), மல்லிகை (வெள்ளை/சந்திரன்+சுக்கிரன்), சிவப்பு செம்பருத்தி (சிவப்பு/சூரியன்+செவ்வாய்) ஆகிய இந்த மூன்று மலர்களும் சேர்ந்து 9 கிரக அர்ப்பணங்கள் அனைத்தையும் உள்ளடக்கும்.' },
  { group_slug: 'navagraha-puja', item_order: '4', field: 'substitution_note_ta',
    old: 'கருப்பு எள்ளு சனிக்கு முதன்மை அர்ப்பணம் — இதற்கு மாற்று செய்யக்கூடாது.',
    new: 'கருப்பு எள்ளு சனிக்கு முதன்மை அர்ப்பணம்; இதற்கு மாற்று செய்யக்கூடாது.' },

  { group_slug: 'ekadashi-vratham', item_order: '2', field: 'substitution_note_hi',
    old: 'अनिवार्य — विष्णु पूजा में इसे छोड़ना नहीं चाहिए',
    new: 'अनिवार्य; विष्णु पूजा में इसे छोड़ना नहीं चाहिए' },
  { group_slug: 'sankashti-chaturthi-vratham', item_order: '2', field: 'substitution_note_hi',
    old: 'न छोड़ें — दूर्वा के बिना गणेश पूजा स्वीकार नहीं करते',
    new: 'न छोड़ें, क्योंकि दूर्वा के बिना गणेश पूजा स्वीकार नहीं करते' },
  { group_slug: 'vishnu-puja', item_order: '2', field: 'substitution_note_hi',
    old: 'विष्णु पूजा के लिए आवश्यक — कोई विकल्प नहीं; हमेशा पूजा से पहले ताजा तोड़ें।',
    new: 'विष्णु पूजा के लिए आवश्यक, कोई विकल्प नहीं; हमेशा पूजा से पहले ताजा तोड़ें।' },
  { group_slug: 'navagraha-puja', item_order: '3', field: 'substitution_note_hi',
    old: 'गेंदा (पीला/गुरु), चमेली (सफेद/चंद्र+शुक्र), लाल गुड़हल (लाल/सूर्य+मंगल) — ये तीनों मिलकर सभी 9 ग्रहों की आवश्यकताएँ पूरी करते हैं।',
    new: 'गेंदा (पीला/गुरु), चमेली (सफेद/चंद्र+शुक्र), और लाल गुड़हल (लाल/सूर्य+मंगल) मिलकर सभी 9 ग्रहों की आवश्यकताएँ पूरी करते हैं।' },
];

// ---------------------------------------------------------------------------

function assertNoEmDash(str, ctx) {
  if (str.includes('—')) {
    throw new Error(`Rewrite for ${ctx} still contains an em-dash — fix the draft before proceeding.`);
  }
}

async function applyBySlug(tab, fixes) {
  console.log(`\n\n########## ${tab} ##########`);
  const { rows, col } = await getTabWithHeaders(tab);
  const slugCol = col('slug');
  let changed = 0, skipped = 0;

  for (const fix of fixes) {
    const ctx = `${tab}.${fix.field} slug=${fix.slug}`;
    assertNoEmDash(fix.new, ctx);

    const rowIdx = rows.findIndex(r => r[slugCol] === fix.slug);
    if (rowIdx === -1) {
      console.log(`\n✗ ${ctx}: slug not found, skipping`);
      skipped++;
      continue;
    }
    const fc = col(fix.field);
    const rowNum = rowIdx + 2;
    const current = rows[rowIdx][fc] || '';

    console.log(`\n--- ${ctx} (row ${rowNum}) ---`);
    if (current !== fix.old) {
      console.log(`  ✗ SKIPPED: live cell text does not match expected old text.`);
      console.log(`    live:     ${current}`);
      console.log(`    expected: ${fix.old}`);
      skipped++;
      continue;
    }
    console.log(`  OLD: ${fix.old}`);
    console.log(`  NEW: ${fix.new}`);

    if (!APPLY) {
      console.log(`  (dry run — pass --write to apply)`);
      changed++;
      continue;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!${colLetter(fc)}${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[fix.new]] },
    });
    changed++;
  }
  console.log(`\n${tab}: ${changed} cell(s) ${APPLY ? 'written' : 'would be written'}, ${skipped} skipped.`);
  return { changed, skipped };
}

async function applyMaterialItems(fixes) {
  const tab = 'material_items';
  console.log(`\n\n########## ${tab} ##########`);
  const { rows, col } = await getTabWithHeaders(tab);
  const groupCol = col('group_slug');
  const orderCol = col('item_order');
  const nameCol = col('item_name_en');
  let changed = 0, skipped = 0;

  for (const fix of fixes) {
    const ctx = `${tab}.${fix.field} group=${fix.group_slug} order=${fix.item_order}`;
    assertNoEmDash(fix.new, ctx);

    const rowIdx = rows.findIndex(r => r[groupCol] === fix.group_slug && r[orderCol] === fix.item_order);
    if (rowIdx === -1) {
      console.log(`\n✗ ${ctx}: row not found, skipping`);
      skipped++;
      continue;
    }
    const fc = col(fix.field);
    const rowNum = rowIdx + 2;
    const current = rows[rowIdx][fc] || '';
    const itemName = rows[rowIdx][nameCol];

    console.log(`\n--- ${ctx} item="${itemName}" (row ${rowNum}) ---`);
    if (current !== fix.old) {
      console.log(`  ✗ SKIPPED: live cell text does not match expected old text.`);
      console.log(`    live:     ${current}`);
      console.log(`    expected: ${fix.old}`);
      skipped++;
      continue;
    }
    console.log(`  OLD: ${fix.old}`);
    console.log(`  NEW: ${fix.new}`);

    if (!APPLY) {
      console.log(`  (dry run — pass --write to apply)`);
      changed++;
      continue;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!${colLetter(fc)}${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[fix.new]] },
    });
    changed++;
  }
  console.log(`\n${tab}: ${changed} cell(s) ${APPLY ? 'written' : 'would be written'}, ${skipped} skipped.`);
  return { changed, skipped };
}

const festivalsResult = await applyBySlug('festivals', FESTIVALS_FIXES);
const pujasResult = await applyBySlug('pujas', PUJAS_FIXES);
const materialItemsResult = await applyMaterialItems(MATERIAL_ITEMS_FIXES);

console.log(`\n\n========== SUMMARY ==========`);
console.log(`festivals:       ${festivalsResult.changed} changed, ${festivalsResult.skipped} skipped`);
console.log(`pujas:           ${pujasResult.changed} changed, ${pujasResult.skipped} skipped`);
console.log(`material_items:  ${materialItemsResult.changed} changed, ${materialItemsResult.skipped} skipped`);
console.log(`\n${APPLY ? 'Done writing.' : 'Dry run complete — pass --write to apply.'}`);
