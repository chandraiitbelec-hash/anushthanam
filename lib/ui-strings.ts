import type { Language } from './types';

type UiStrings = {
  // Panchangam
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  rahuKalam: string;
  masa: string;
  today: string;
  panchangam: string;
  upcoming: string;
  // Puja/procedure
  materialsRequired: string;
  procedure: string;
  showShloka: string;
  hideShloka: string;
  shlokaLabel: string;
  viewPasurams: string;
  todaysPasuram: string;
  // Stories
  otherStories: string;
  story: string;
  stories: string;
  partOf: (n: number, total: number) => string;
  // Breadcrumb section labels
  gods: string;
  shlokas: string;
  festivals: string;
  vrathams: string;
  pujas: string;
  storiesLabel: string;
  bhagavadGita: string;
  chapterLabel: (n: number) => string;
  chapterOf: (n: number, total: number) => string;
  verses: (n: number) => string;
  // Footer
  footerUpcoming: string;
  footerPanchangam: string;
  footerSiteIndex: string;
  footerStories: string;
  // Search
  searchBuilding: string;
  searchNoResults: (q: string) => string;
  // Related content
  related: string;
  // UpcomingList
  daysAway: (n: number) => string;
  // Not found
  notFoundTitle: string;
  notFoundBody: string;
  backToHome: string;
  // Site index
  siteIndexIntro: string;
  browseSection: string;
  // Duration
  minutesShort: string;
  // PasuramViewer
  day: string;
  // GitaVerseViewer
  jumpToChapter: string;
  jumpToVerse: string;
  verseEllipsis: string;
  chapterShort: (n: number) => string;
  // ShlokaViewer share / deep-link
  share: string;
  linkCopied: string;
  copyStanzaLink: string;
  // Panchangam empty state
  panchangamNoDataTitle: string;
  panchangamNoDataBody: string;
  panchangamNextAvailable: (date: string) => string;
  viewUpcoming: string;
  // Error boundary
  errorTitle: string;
  errorBody: string;
  tryAgain: string;
  // Theme toggle
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  // Pujas two-section browser
  pujasDaily: string;
  pujasOccasions: string;
  pujasSelectOccasion: string;
  pujasNoOccasionPujas: string;
  pujasShowPujas: string;
  pujasHidePujas: string;
  // Iconography (GodProfile)
  godIconography: string;
  // Shared entity-detail labels (Puja/Festival/Vratham profiles)
  materials: string;
  significance: string;
  festivalStories: string;
  readStory: string;
  next: string;
  fasting: string;
  benefits: string;
  pasurams: string;
  vrataKatha: string;
  // Shloka type tab labels
  shlokaTypeAshtothram: string;
  shlokaTypeSahasranamam: string;
  shlokaTypeChalisa: string;
  shlokaTypeStotra: string;
  shlokaTypeKavacham: string;
  shlokaTypeSuprabhatam: string;
  shlokaTypeNamavali: string;
  shlokaTypeOther: string;
  // Bhagavad Gita
  gitaChapterWord: string;
  gitaVerseWord: string;
  gitaTitle: string;
  gitaHeroSubtitle: (chapterCount: number, verseCount: number) => string;
  meaning: string;
  iastToggleLabel: string;
  copyLabel: string;
  copiedLabel: string;
  // Deity chips / explore grid
  deityLabel: string;
  exploreLabel: string;
  // Upcoming list
  upcomingEmptyHeading: string;
  upcomingEmptySub: string;
  festivalWord: string;
  vrathamWord: string;
  todayLabelUpcoming: string;
  // Search
  searchPlaceholder: string;
  // Breadcrumb
  home: string;
  // Materials list
  optional: string;
  reset: string;
  allItemsGathered: string;
  materialsChecklist: string;
  // Empty states
  emptyState: Record<'gods' | 'festivals' | 'vrathams' | 'pujas' | 'shlokas' | 'occasions' | 'occasion-pujas' | 'live-streams' | 'temples', { title: string; body: string }>;
  // Story content
  storyFallbackNote: string;
  // Daily devotional
  devotionalHeading: string;
  shlokaOfDay: string;
  storyOfDay: string;
  reflection: string;
  // Nav
  navSearchLabel: string;
  navSwitchLanguage: string;
  navMore: string;
  navOpenMenu: string;
  navCloseMenu: string;
  navLanguageHeading: string;
  // Font size toggle
  adjustTextSize: string;
  // Panchangam upcoming
  showingDays: (n: number) => string;
  // Live darshan
  liveDarshan: string;
  watchLive: string;
  arathiSchedule: string;
  visitChannel: string;
  liveDarshanLocation: string;
  showMoreSchedule: (n: number) => string;
  showLessSchedule: string;
  featuredLabel: string;
  establishedLabel: string;
  // Temples
  temples: string;
  templeEtymology: string;
  templeHistory: string;
  templeOfficialWebsite: string;
};

export const UI: Record<Language, UiStrings> = {
  en: {
    tithi: 'Tithi',
    nakshatra: 'Nakshatra',
    yoga: 'Yoga',
    karana: 'Karana',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    rahuKalam: 'Rahu Kalam',
    masa: 'Masa',
    today: 'Today',
    panchangam: 'Panchangam',
    upcoming: 'Upcoming',
    materialsRequired: 'Materials Required',
    procedure: 'Procedure',
    showShloka: '▼ Show shloka',
    hideShloka: '▲ Hide shloka',
    shlokaLabel: 'Shloka',
    viewPasurams: '↓ View Pasurams',
    todaysPasuram: "Today's Pasuram",
    otherStories: 'Other Stories',
    story: 'story',
    stories: 'stories',
    partOf: (n, total) => `Part ${n} of ${total}`,
    gods: 'Gods',
    shlokas: 'Shlokas',
    festivals: 'Festivals',
    vrathams: 'Vrathams',
    pujas: 'Pujas',
    storiesLabel: 'Stories',
    bhagavadGita: 'Bhagavad Gita',
    chapterLabel: (n) => `Chapter ${n}`,
    chapterOf: (n, total) => `Chapter ${n} of ${total}`,
    verses: (n) => `${n} verses`,
    footerUpcoming: 'Upcoming',
    footerPanchangam: 'Panchangam',
    footerSiteIndex: 'Site Index',
    footerStories: 'Stories',
    searchBuilding: 'Search index is being built — it will be available after the next site deploy.',
    searchNoResults: (q) => `No results for "${q}"`,
    related: 'Related',
    daysAway: (n) => `in ${n} day${n > 1 ? 's' : ''}`,
    notFoundTitle: 'Page not found',
    notFoundBody: "The page you're looking for doesn't exist or may have moved.",
    backToHome: 'Back to home',
    siteIndexIntro: 'Browse everything on Anuṣṭhāna.',
    browseSection: 'Browse',
    minutesShort: 'min',
    day: 'Day',
    jumpToChapter: 'Jump to chapter',
    jumpToVerse: 'Jump to verse',
    verseEllipsis: 'Verse…',
    chapterShort: (n) => `Ch ${n}:`,
    share: 'Share',
    linkCopied: 'Link copied',
    copyStanzaLink: 'Copy link to this stanza',
    panchangamNoDataTitle: 'Panchangam not available for today',
    panchangamNoDataBody: 'The daily almanac entry for today has not been added yet. Check back soon, or browse upcoming festivals and vrathams below.',
    panchangamNextAvailable: (date) => `Next entry: ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    viewUpcoming: 'View upcoming festivals & vrathams',
    errorTitle: 'Something went wrong',
    errorBody: 'An error occurred while loading this page. This may be a temporary issue — please try again.',
    tryAgain: 'Try again',
    themeLabel: 'Theme',
    themeLight: '☀ Light',
    themeDark: '☾ Dark',
    themeSystem: '⊙ System',
    pujasDaily: 'Daily & Frequent',
    pujasOccasions: 'For Occasions',
    pujasSelectOccasion: 'Select an occasion to see related pujas.',
    pujasNoOccasionPujas: 'No pujas listed for this occasion yet.',
    pujasShowPujas: 'Show pujas',
    pujasHidePujas: 'Hide pujas',
    godIconography: 'Iconography',
    materials: 'Materials',
    significance: 'Significance',
    festivalStories: 'Stories',
    readStory: 'Read',
    next: 'Next',
    fasting: 'Fasting',
    benefits: 'Benefits',
    pasurams: 'Pasurams',
    vrataKatha: 'Vrata Katha',
    shlokaTypeAshtothram: 'Ashtothram',
    shlokaTypeSahasranamam: 'Sahasranamam',
    shlokaTypeChalisa: 'Chalisa',
    shlokaTypeStotra: 'Stotra',
    shlokaTypeKavacham: 'Kavacham',
    shlokaTypeSuprabhatam: 'Suprabhatam',
    shlokaTypeNamavali: 'Namavali',
    shlokaTypeOther: 'Other',
    gitaChapterWord: 'Chapter',
    gitaVerseWord: 'verses',
    gitaTitle: 'Srimad Bhagavad Gita',
    gitaHeroSubtitle: (chapterCount, verseCount) => `${chapterCount} chapters · ${verseCount} slokas · Sanskrit with Telugu, Tamil, Hindi & English`,
    meaning: 'Meaning',
    iastToggleLabel: 'Devanagari',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    deityLabel: 'Deity',
    exploreLabel: 'Explore',
    upcomingEmptyHeading: 'No upcoming dates set',
    upcomingEmptySub: 'Festival dates are updated before each season. Check back soon.',
    festivalWord: 'Festival',
    vrathamWord: 'Vratham',
    todayLabelUpcoming: 'Today',
    searchPlaceholder: 'Search gods, shlokas, festivals…',
    home: 'Home',
    optional: 'Optional',
    reset: 'Reset',
    allItemsGathered: 'All items gathered!',
    materialsChecklist: 'Materials checklist',
    emptyState: {
      gods: { title: 'No deities published yet', body: 'Gods and goddesses will appear here once published.' },
      festivals: { title: 'No festivals published yet', body: 'Festival listings will appear here once published.' },
      vrathams: { title: 'No vrathams published yet', body: 'Vow and fasting guides will appear here once published.' },
      pujas: { title: 'No pujas published yet', body: 'Puja guides will appear here once published.' },
      shlokas: { title: 'No shlokas published yet', body: 'Shlokas and stotras will appear here once published.' },
      occasions: { title: 'No occasions published yet', body: 'Life occasions and samskaras will appear here once published.' },
      'occasion-pujas': { title: 'No pujas listed yet', body: 'Puja guides for this occasion will appear here once added.' },
      'live-streams': { title: 'No live streams published yet', body: 'Temple live darshan streams will appear here once published.' },
      temples: { title: 'No temples published yet', body: 'Temple profiles will appear here once published.' },
    },
    storyFallbackNote: '',
    devotionalHeading: "Today's Devotional",
    shlokaOfDay: 'Shloka of the Day',
    storyOfDay: 'Story of the Day',
    reflection: 'Reflection',
    navSearchLabel: 'Search',
    navSwitchLanguage: 'Switch language',
    navMore: 'More',
    navOpenMenu: 'Open menu',
    navCloseMenu: 'Close menu',
    navLanguageHeading: 'Language',
    adjustTextSize: 'Adjust text size',
    showingDays: (n) => `Showing ${n} days`,
    liveDarshan: 'Live Darshan',
    watchLive: 'Watch Live',
    arathiSchedule: 'Arathi Schedule',
    visitChannel: 'Visit Channel',
    liveDarshanLocation: 'Location',
    showMoreSchedule: (n) => `Show ${n} more`,
    showLessSchedule: 'Show less',
    featuredLabel: 'Featured',
    establishedLabel: 'Est.',
    temples: 'Temples',
    templeEtymology: 'Etymology',
    templeHistory: 'History',
    templeOfficialWebsite: 'Official Website',
  },
  te: {
    tithi: 'తిథి',
    nakshatra: 'నక్షత్రం',
    yoga: 'యోగం',
    karana: 'కరణం',
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
    rahuKalam: 'రాహుకాలం',
    masa: 'మాసం',
    today: 'ఈ రోజు',
    panchangam: 'పంచాంగం',
    upcoming: 'రాబోయేవి',
    materialsRequired: 'కావలసిన సామగ్రి',
    procedure: 'విధానం',
    showShloka: '▼ శ్లోకం చూపించు',
    hideShloka: '▲ శ్లోకం దాచు',
    shlokaLabel: 'శ్లోకం',
    viewPasurams: '↓ పాశురాలు చూడండి',
    todaysPasuram: 'నేటి పాశురం',
    otherStories: 'ఇతర కథలు',
    story: 'కథ',
    stories: 'కథలు',
    partOf: (n, total) => `${total}లో ${n}వ భాగం`,
    gods: 'దేవతలు',
    shlokas: 'శ్లోకాలు',
    festivals: 'పండుగలు',
    vrathams: 'వ్రతాలు',
    pujas: 'పూజలు',
    storiesLabel: 'కథలు',
    bhagavadGita: 'భగవద్గీత',
    chapterLabel: (n) => `అధ్యాయం ${n}`,
    chapterOf: (n, total) => `${total}లో ${n}వ అధ్యాయం`,
    verses: (n) => `${n} శ్లోకాలు`,
    footerUpcoming: 'రాబోయేవి',
    footerPanchangam: 'పంచాంగం',
    footerSiteIndex: 'సైట్ విషయసూచిక',
    footerStories: 'కథలు',
    searchBuilding: 'సెర్చ్ ఇండెక్స్ తయారవుతోంది — తదుపరి డిప్లాయ్ తర్వాత అందుబాటులో ఉంటుంది.',
    searchNoResults: (q) => `"${q}" కోసం ఫలితాలు లేవు`,
    related: 'సంబంధిత',
    daysAway: (n) => `${n} రోజుల్లో`,
    notFoundTitle: 'పేజీ కనబడలేదు',
    notFoundBody: 'మీరు వెతుకుతున్న పేజీ లేదు లేదా తరలించబడి ఉండవచ్చు.',
    backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి',
    siteIndexIntro: 'అనుష్ఠానంలోని అన్నింటినీ విహరించండి.',
    browseSection: 'విహరించండి',
    minutesShort: 'నిమి',
    day: 'రోజు',
    jumpToChapter: 'అధ్యాయానికి వెళ్ళు',
    jumpToVerse: 'శ్లోకానికి వెళ్ళు',
    verseEllipsis: 'శ్లోకం…',
    chapterShort: (n) => `అ ${n}:`,
    share: 'షేర్',
    linkCopied: 'లింక్ కాపీ అయింది',
    copyStanzaLink: 'ఈ స్తబకానికి లింక్ కాపీ చేయండి',
    panchangamNoDataTitle: 'ఈ రోజు పంచాంగం అందుబాటులో లేదు',
    panchangamNoDataBody: 'ఈ రోజు పంచాంగం ఇంకా జోడించబడలేదు. త్వరలో తిరిగి చూడండి, లేదా క్రింద రాబోయే పండుగలు మరియు వ్రతాలు చూడండి.',
    panchangamNextAvailable: (date) => `తదుపరి నమోదు: ${new Date(date).toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    viewUpcoming: 'రాబోయే పండుగలు & వ్రతాలు చూడండి',
    errorTitle: 'ఏదో తప్పు జరిగింది',
    errorBody: 'ఈ పేజీని లోడ్ చేయడంలో లోపం వచ్చింది. ఇది తాత్కాలిక సమస్య కావచ్చు — దయచేసి మళ్ళీ ప్రయత్నించండి.',
    tryAgain: 'మళ్ళీ ప్రయత్నించండి',
    themeLabel: 'థీమ్',
    themeLight: '☀ వెలుతురు',
    themeDark: '☾ చీకటి',
    themeSystem: '⊙ సిస్టమ్',
    pujasDaily: 'రోజువారీ & తరుచుగా',
    pujasOccasions: 'సందర్భాల కోసం',
    pujasSelectOccasion: 'సంబంధిత పూజలు చూడటానికి ఒక సందర్భాన్ని ఎంచుకోండి.',
    pujasNoOccasionPujas: 'ఈ సందర్భానికి ఇంకా పూజలు జోడించబడలేదు.',
    pujasShowPujas: 'పూజలు చూపించు',
    pujasHidePujas: 'పూజలు దాచు',
    godIconography: 'ఆకృతి',
    materials: 'సామగ్రి',
    significance: 'ప్రాముఖ్యత',
    festivalStories: 'కథలు',
    readStory: 'చదవండి',
    next: 'తదుపరి',
    fasting: 'ఉపవాసం',
    benefits: 'ఫలితాలు',
    pasurams: 'పాశురాలు',
    vrataKatha: 'వ్రత కథ',
    shlokaTypeAshtothram: 'అష్టోత్తరం',
    shlokaTypeSahasranamam: 'సహస్రనామం',
    shlokaTypeChalisa: 'చాలీసా',
    shlokaTypeStotra: 'స్తోత్రం',
    shlokaTypeKavacham: 'కవచం',
    shlokaTypeSuprabhatam: 'సుప్రభాతం',
    shlokaTypeNamavali: 'నామావళి',
    shlokaTypeOther: 'ఇతరాలు',
    gitaChapterWord: 'అధ్యాయం',
    gitaVerseWord: 'శ్లోకాలు',
    gitaTitle: 'శ్రీమద్ భగవద్గీత',
    gitaHeroSubtitle: (chapterCount, verseCount) => `${chapterCount} అధ్యాయాలు · ${verseCount} శ్లోకాలు · తెలుగు, తమిళం, హిందీ & ఇంగ్లీష్ అర్థాలతో`,
    meaning: 'అర్థం',
    iastToggleLabel: 'IAST',
    copyLabel: 'కాపీ',
    copiedLabel: 'కాపీ అయింది',
    deityLabel: 'దేవత',
    exploreLabel: 'అన్వేషించండి',
    upcomingEmptyHeading: 'రాబోయే తేదీలు నిర్ణయించబడలేదు',
    upcomingEmptySub: 'పండుగ తేదీలు ప్రతి సీజన్ ముందు నవీకరించబడతాయి. త్వరలో తనిఖీ చేయండి.',
    festivalWord: 'పండుగ',
    vrathamWord: 'వ్రతం',
    todayLabelUpcoming: 'నేడు',
    searchPlaceholder: 'వెతకండి…',
    home: 'హోమ్',
    optional: 'ఐచ్ఛికం',
    reset: 'రీసెట్',
    allItemsGathered: 'అన్నీ సిద్ధంగా ఉన్నాయి!',
    materialsChecklist: 'సామగ్రి చెక్‌లిస్ట్',
    emptyState: {
      gods: { title: 'ఇంకా దేవతలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత దేవతలు ఇక్కడ కనిపిస్తారు.' },
      festivals: { title: 'ఇంకా పండుగలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత పండుగలు ఇక్కడ కనిపిస్తాయి.' },
      vrathams: { title: 'ఇంకా వ్రతాలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత వ్రత మార్గదర్శకాలు ఇక్కడ కనిపిస్తాయి.' },
      pujas: { title: 'ఇంకా పూజలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత పూజా మార్గదర్శకాలు ఇక్కడ కనిపిస్తాయి.' },
      shlokas: { title: 'ఇంకా శ్లోకాలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత శ్లోకాలు, స్తోత్రాలు ఇక్కడ కనిపిస్తాయి.' },
      occasions: { title: 'ఇంకా సందర్భాలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత జీవిత సందర్భాలు ఇక్కడ కనిపిస్తాయి.' },
      'occasion-pujas': { title: 'ఇంకా పూజలు జోడించబడలేదు', body: 'ఈ సందర్భానికి పూజా మార్గదర్శకాలు జోడించిన తర్వాత ఇక్కడ కనిపిస్తాయి.' },
      'live-streams': { title: 'ఇంకా లైవ్ స్ట్రీమ్‌లు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత ఆలయ ప్రత్యక్ష దర్శన ప్రసారాలు ఇక్కడ కనిపిస్తాయి.' },
      temples: { title: 'ఇంకా ఆలయాలు ప్రచురించబడలేదు', body: 'ప్రచురించిన తర్వాత ఆలయ ప్రొఫైల్‌లు ఇక్కడ కనిపిస్తాయి.' },
    },
    storyFallbackNote: 'పూర్తి కథ ఇంకా తెలుగులో అందుబాటులో లేదు — ఇంగ్లీష్‌లో చదువుతున్నారు',
    devotionalHeading: 'నేటి భక్తి',
    shlokaOfDay: 'నేటి శ్లోకం',
    storyOfDay: 'నేటి కథ',
    reflection: 'చింతన',
    navSearchLabel: 'వెతకండి',
    navSwitchLanguage: 'భాష మార్చండి',
    navMore: 'మరిన్ని',
    navOpenMenu: 'మెనూ తెరవండి',
    navCloseMenu: 'మెనూ మూసివేయండి',
    navLanguageHeading: 'భాష',
    adjustTextSize: 'టెక్స్ట్ పరిమాణం మార్చండి',
    showingDays: (n) => `${n} రోజులు చూపిస్తోంది`,
    liveDarshan: 'ప్రత్యక్ష దర్శనం',
    watchLive: 'ప్రత్యక్షంగా చూడండి',
    arathiSchedule: 'హారతి వేళలు',
    visitChannel: 'ఛానెల్ చూడండి',
    liveDarshanLocation: 'స్థానం',
    showMoreSchedule: (n) => `మరిన్ని ${n} చూపించు`,
    showLessSchedule: 'తక్కువగా చూపించు',
    featuredLabel: 'ప్రత్యేకం',
    establishedLabel: 'స్థాపన',
    temples: 'ఆలయాలు',
    templeEtymology: 'పదవ్యుత్పత్తి',
    templeHistory: 'చరిత్ర',
    templeOfficialWebsite: 'అధికారిక వెబ్‌సైట్',
  },
  ta: {
    tithi: 'திதி',
    nakshatra: 'நட்சத்திரம்',
    yoga: 'யோகம்',
    karana: 'கரணம்',
    sunrise: 'சூரிய உதயம்',
    sunset: 'சூரிய அஸ்தமனம்',
    rahuKalam: 'ராகு காலம்',
    masa: 'மாதம்',
    today: 'இன்று',
    panchangam: 'பஞ்சாங்கம்',
    upcoming: 'வரவிருப்பவை',
    materialsRequired: 'தேவையான பொருட்கள்',
    procedure: 'முறை',
    showShloka: '▼ ஸ்லோகம் காட்டு',
    hideShloka: '▲ ஸ்லோகம் மறை',
    shlokaLabel: 'ஸ்லோகம்',
    viewPasurams: '↓ பாசுரங்கள் காண்க',
    todaysPasuram: 'இன்றைய பாசுரம்',
    otherStories: 'பிற கதைகள்',
    story: 'கதை',
    stories: 'கதைகள்',
    partOf: (n, total) => `${total}இல் ${n}வது பகுதி`,
    gods: 'தெய்வங்கள்',
    shlokas: 'ஸ்லோகங்கள்',
    festivals: 'திருவிழாக்கள்',
    vrathams: 'விரதங்கள்',
    pujas: 'பூஜைகள்',
    storiesLabel: 'கதைகள்',
    bhagavadGita: 'பகவத் கீதை',
    chapterLabel: (n) => `அத்தியாயம் ${n}`,
    chapterOf: (n, total) => `${total}இல் ${n}வது அத்தியாயம்`,
    verses: (n) => `${n} ஸ்லோகங்கள்`,
    footerUpcoming: 'வரவிருப்பவை',
    footerPanchangam: 'பஞ்சாங்கம்',
    footerSiteIndex: 'தள அட்டவணை',
    footerStories: 'கதைகள்',
    searchBuilding: 'தேடல் குறியீடு உருவாகிறது — அடுத்த வரிசையீட்டிற்குப் பிறகு கிடைக்கும்.',
    searchNoResults: (q) => `"${q}" க்கு முடிவுகள் இல்லை`,
    related: 'தொடர்புடையவை',
    daysAway: (n) => `${n} நாட்களில்`,
    notFoundTitle: 'பக்கம் கிடைக்கவில்லை',
    notFoundBody: 'நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டிருக்கலாம்.',
    backToHome: 'முகப்புக்குத் திரும்பு',
    siteIndexIntro: 'அனுஷ்டானத்தில் உள்ள அனைத்தையும் உலாவுங்கள்.',
    browseSection: 'உலாவு',
    minutesShort: 'நிமி',
    day: 'நாள்',
    jumpToChapter: 'அத்தியாயத்திற்குச் செல்',
    jumpToVerse: 'ஸ்லோகத்திற்குச் செல்',
    verseEllipsis: 'ஸ்லோகம்…',
    chapterShort: (n) => `அ ${n}:`,
    share: 'பகிர்',
    linkCopied: 'இணைப்பு நகலெடுக்கப்பட்டது',
    copyStanzaLink: 'இந்த தாவலுக்கான இணைப்பை நகலெடுக்கவும்',
    panchangamNoDataTitle: 'இன்றைய பஞ்சாங்கம் கிடைக்கவில்லை',
    panchangamNoDataBody: 'இன்றைய பஞ்சாங்கம் இன்னும் சேர்க்கப்படவில்லை. சீக்கிரம் திரும்பி வாருங்கள், அல்லது கீழே வரவிருக்கும் திருவிழாக்கள் மற்றும் விரதங்களைப் பாருங்கள்.',
    panchangamNextAvailable: (date) => `அடுத்த பதிவு: ${new Date(date).toLocaleDateString('ta-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    viewUpcoming: 'வரவிருக்கும் திருவிழாக்கள் & விரதங்களைக் காண்க',
    errorTitle: 'ஏதோ தவறு நடந்தது',
    errorBody: 'இந்தப் பக்கத்தை ஏற்றுவதில் பிழை ஏற்பட்டது. இது தற்காலிக பிரச்சினையாக இருக்கலாம் — மீண்டும் முயற்சிக்கவும்.',
    tryAgain: 'மீண்டும் முயற்சி',
    themeLabel: 'தீம்',
    themeLight: '☀ வெளிச்சம்',
    themeDark: '☾ இருட்டு',
    themeSystem: '⊙ கணினி',
    pujasDaily: 'தினசரி & அடிக்கடி',
    pujasOccasions: 'சந்தர்ப்பங்களுக்கு',
    pujasSelectOccasion: 'தொடர்புடைய பூஜைகளைக் காண ஒரு சந்தர்ப்பத்தை தேர்ந்தெடுக்கவும்.',
    pujasNoOccasionPujas: 'இந்த சந்தர்ப்பத்திற்கு இன்னும் பூஜைகள் சேர்க்கப்படவில்லை.',
    pujasShowPujas: 'பூஜைகள் காட்டு',
    pujasHidePujas: 'பூஜைகள் மறை',
    godIconography: 'உருவ அமைப்பு',
    materials: 'பொருட்கள்',
    significance: 'முக்கியத்துவம்',
    festivalStories: 'கதைகள்',
    readStory: 'படிக்க',
    next: 'அடுத்தது',
    fasting: 'உபவாசம்',
    benefits: 'பலன்கள்',
    pasurams: 'பாசுரங்கள்',
    vrataKatha: 'விரத கதை',
    shlokaTypeAshtothram: 'அஷ்டோத்திரம்',
    shlokaTypeSahasranamam: 'சஹஸ்ரநாமம்',
    shlokaTypeChalisa: 'சாலீசா',
    shlokaTypeStotra: 'ஸ்தோத்திரம்',
    shlokaTypeKavacham: 'கவசம்',
    shlokaTypeSuprabhatam: 'சுப்ரபாதம்',
    shlokaTypeNamavali: 'நாமாவளி',
    shlokaTypeOther: 'மற்றவை',
    gitaChapterWord: 'அத்தியாயம்',
    gitaVerseWord: 'வசனங்கள்',
    gitaTitle: 'ஸ்ரீமத் பகவத் கீதை',
    gitaHeroSubtitle: (chapterCount, verseCount) => `${chapterCount} அத்தியாயங்கள் · ${verseCount} ஸ்லோகங்கள் · தெலுங்கு, தமிழ், இந்தி & ஆங்கிலம்`,
    meaning: 'பொருள்',
    iastToggleLabel: 'IAST',
    copyLabel: 'நகல்',
    copiedLabel: 'நகலெடுக்கப்பட்டது',
    deityLabel: 'தெய்வம்',
    exploreLabel: 'ஆராயுங்கள்',
    upcomingEmptyHeading: 'வரவிருக்கும் நாட்கள் நிர்ணயிக்கப்படவில்லை',
    upcomingEmptySub: 'திருவிழா நாட்கள் ஒவ்வொரு பருவத்திற்கும் முன் புதுப்பிக்கப்படும். விரைவில் சரிபாருங்கள்.',
    festivalWord: 'திருவிழா',
    vrathamWord: 'விரதம்',
    todayLabelUpcoming: 'இன்று',
    searchPlaceholder: 'தேடு…',
    home: 'முகப்பு',
    optional: 'விருப்பத்தேர்வு',
    reset: 'மீட்டமை',
    allItemsGathered: 'அனைத்தும் தயார்!',
    materialsChecklist: 'பொருட்கள் சரிபார்ப்புப் பட்டியல்',
    emptyState: {
      gods: { title: 'இன்னும் தெய்வங்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் தெய்வங்கள் இங்கே தோன்றும்.' },
      festivals: { title: 'இன்னும் திருவிழாக்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் திருவிழாக்கள் இங்கே தோன்றும்.' },
      vrathams: { title: 'இன்னும் விரதங்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் விரத வழிகாட்டிகள் இங்கே தோன்றும்.' },
      pujas: { title: 'இன்னும் பூஜைகள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் பூஜை வழிகாட்டிகள் இங்கே தோன்றும்.' },
      shlokas: { title: 'இன்னும் ஸ்லோகங்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் ஸ்லோகங்கள் இங்கே தோன்றும்.' },
      occasions: { title: 'இன்னும் சந்தர்ப்பங்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் வாழ்க்கை சந்தர்ப்பங்கள் இங்கே தோன்றும்.' },
      'occasion-pujas': { title: 'இன்னும் பூஜைகள் சேர்க்கப்படவில்லை', body: 'இந்த சந்தர்ப்பத்திற்கான பூஜை வழிகாட்டிகள் சேர்க்கப்பட்டவுடன் இங்கே தோன்றும்.' },
      'live-streams': { title: 'இன்னும் நேரடி ஒளிபரப்புகள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் கோயில் நேரடி தரிசன ஒளிபரப்புகள் இங்கே தோன்றும்.' },
      temples: { title: 'இன்னும் கோயில்கள் வெளியிடப்படவில்லை', body: 'வெளியிடப்பட்டவுடன் கோயில் விவரங்கள் இங்கே தோன்றும்.' },
    },
    storyFallbackNote: 'முழு கதை இன்னும் தமிழில் கிடைக்கவில்லை — ஆங்கிலத்தில் படிக்கிறீர்கள்',
    devotionalHeading: 'இன்றைய பக்தி',
    shlokaOfDay: 'இன்றைய ஸ்லோகம்',
    storyOfDay: 'இன்றைய கதை',
    reflection: 'சிந்தனை',
    navSearchLabel: 'தேடு',
    navSwitchLanguage: 'மொழியை மாற்று',
    navMore: 'மேலும்',
    navOpenMenu: 'மெனுவைத் திற',
    navCloseMenu: 'மெனுவை மூடு',
    navLanguageHeading: 'மொழி',
    adjustTextSize: 'உரை அளவை மாற்று',
    showingDays: (n) => `${n} நாட்கள் காட்டப்படுகின்றன`,
    liveDarshan: 'நேரடி தரிசனம்',
    watchLive: 'நேரடியாகக் காண்க',
    arathiSchedule: 'ஆரத்தி நேரங்கள்',
    visitChannel: 'சேனலைப் பார்க்க',
    liveDarshanLocation: 'இடம்',
    showMoreSchedule: (n) => `மேலும் ${n} காட்டு`,
    showLessSchedule: 'குறைவாகக் காட்டு',
    featuredLabel: 'சிறப்பு',
    establishedLabel: 'நிறுவப்பட்டது',
    temples: 'கோயில்கள்',
    templeEtymology: 'சொல் வரலாறு',
    templeHistory: 'வரலாறு',
    templeOfficialWebsite: 'அதிகாரப்பூர்வ இணையதளம்',
  },
  hi: {
    tithi: 'तिथि',
    nakshatra: 'नक्षत्र',
    yoga: 'योग',
    karana: 'करण',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    rahuKalam: 'राहु काल',
    masa: 'मास',
    today: 'आज',
    panchangam: 'पंचांग',
    upcoming: 'आगामी',
    materialsRequired: 'आवश्यक सामग्री',
    procedure: 'विधि',
    showShloka: '▼ श्लोक दिखाएं',
    hideShloka: '▲ श्लोक छुपाएं',
    shlokaLabel: 'श्लोक',
    viewPasurams: '↓ पासुर देखें',
    todaysPasuram: 'आज का पासुर',
    otherStories: 'अन्य कथाएं',
    story: 'कथा',
    stories: 'कथाएं',
    partOf: (n, total) => `${total} में से ${n}वां भाग`,
    gods: 'देवता',
    shlokas: 'श्लोक',
    festivals: 'त्योहार',
    vrathams: 'व्रत',
    pujas: 'पूजाएं',
    storiesLabel: 'कथाएं',
    bhagavadGita: 'भगवद्गीता',
    chapterLabel: (n) => `अध्याय ${n}`,
    chapterOf: (n, total) => `${total} में से अध्याय ${n}`,
    verses: (n) => `${n} श्लोक`,
    footerUpcoming: 'आगामी',
    footerPanchangam: 'पंचांग',
    footerSiteIndex: 'साइट अनुक्रमणिका',
    footerStories: 'कथाएं',
    searchBuilding: 'खोज अनुक्रमणिका बन रही है — अगले डिप्लॉय के बाद उपलब्ध होगी।',
    searchNoResults: (q) => `"${q}" के लिए कोई परिणाम नहीं`,
    related: 'संबंधित',
    daysAway: (n) => `${n} दिन में`,
    notFoundTitle: 'पृष्ठ नहीं मिला',
    notFoundBody: 'आप जिस पृष्ठ को खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।',
    backToHome: 'होम पर वापस जाएं',
    siteIndexIntro: 'अनुष्ठान की सारी सामग्री देखें।',
    browseSection: 'देखें',
    minutesShort: 'मिनट',
    day: 'दिन',
    jumpToChapter: 'अध्याय पर जाएं',
    jumpToVerse: 'श्लोक पर जाएं',
    verseEllipsis: 'श्लोक…',
    chapterShort: (n) => `अ ${n}:`,
    share: 'साझा करें',
    linkCopied: 'लिंक कॉपी हो गया',
    copyStanzaLink: 'इस श्लोक का लिंक कॉपी करें',
    panchangamNoDataTitle: 'आज का पंचांग उपलब्ध नहीं है',
    panchangamNoDataBody: 'आज का पंचांग अभी तक नहीं जोड़ा गया है। जल्द ही वापस आएं, या नीचे आगामी त्योहार और व्रत देखें।',
    panchangamNextAvailable: (date) => `अगली प्रविष्टि: ${new Date(date).toLocaleDateString('hi-IN', { weekday: 'long', month: 'long', day: 'numeric' })}`,
    viewUpcoming: 'आगामी त्योहार और व्रत देखें',
    errorTitle: 'कुछ गलत हो गया',
    errorBody: 'इस पृष्ठ को लोड करने में त्रुटि हुई। यह एक अस्थायी समस्या हो सकती है — कृपया फिर से प्रयास करें।',
    tryAgain: 'फिर से प्रयास करें',
    themeLabel: 'थीम',
    themeLight: '☀ उजाला',
    themeDark: '☾ अंधेरा',
    themeSystem: '⊙ सिस्टम',
    pujasDaily: 'दैनिक & नियमित',
    pujasOccasions: 'अवसरों के लिए',
    pujasSelectOccasion: 'संबंधित पूजाएँ देखने के लिए एक अवसर चुनें।',
    pujasNoOccasionPujas: 'इस अवसर के लिए अभी तक कोई पूजा नहीं जोड़ी गई है।',
    pujasShowPujas: 'पूजाएं दिखाएं',
    pujasHidePujas: 'पूजाएं छुपाएं',
    godIconography: 'प्रतिमा विज्ञान',
    materials: 'सामग्री',
    significance: 'महत्व',
    festivalStories: 'कथाएं',
    readStory: 'पढ़ें',
    next: 'अगला',
    fasting: 'उपवास',
    benefits: 'लाभ',
    pasurams: 'पासुर',
    vrataKatha: 'व्रत कथा',
    shlokaTypeAshtothram: 'अष्टोत्तरम्',
    shlokaTypeSahasranamam: 'सहस्रनामम्',
    shlokaTypeChalisa: 'चालीसा',
    shlokaTypeStotra: 'स्तोत्र',
    shlokaTypeKavacham: 'कवचम्',
    shlokaTypeSuprabhatam: 'सुप्रभातम्',
    shlokaTypeNamavali: 'नामावली',
    shlokaTypeOther: 'अन्य',
    gitaChapterWord: 'अध्याय',
    gitaVerseWord: 'श्लोक',
    gitaTitle: 'श्रीमद् भगवद्गीता',
    gitaHeroSubtitle: (chapterCount, verseCount) => `${chapterCount} अध्याय · ${verseCount} श्लोक · तेलुगु, तमिल, हिंदी और अंग्रेज़ी अर्थों के साथ`,
    meaning: 'अर्थ',
    iastToggleLabel: 'IAST',
    copyLabel: 'कॉपी',
    copiedLabel: 'कॉपी हो गया',
    deityLabel: 'देवता',
    exploreLabel: 'खोजें',
    upcomingEmptyHeading: 'आगामी तिथियाँ अभी निर्धारित नहीं',
    upcomingEmptySub: 'त्योहार की तारीखें हर मौसम से पहले अपडेट की जाती हैं। जल्द वापस देखें।',
    festivalWord: 'त्योहार',
    vrathamWord: 'व्रत',
    todayLabelUpcoming: 'आज',
    searchPlaceholder: 'खोजें…',
    home: 'होम',
    optional: 'वैकल्पिक',
    reset: 'रीसेट',
    allItemsGathered: 'सब तैयार है!',
    materialsChecklist: 'सामग्री चेकलिस्ट',
    emptyState: {
      gods: { title: 'अभी तक कोई देवता प्रकाशित नहीं', body: 'प्रकाशित होने पर देवी-देवता यहाँ दिखाई देंगे।' },
      festivals: { title: 'अभी तक कोई त्योहार प्रकाशित नहीं', body: 'प्रकाशित होने पर त्योहार यहाँ दिखाई देंगे।' },
      vrathams: { title: 'अभी तक कोई व्रत प्रकाशित नहीं', body: 'प्रकाशित होने पर व्रत मार्गदर्शिकाएँ यहाँ दिखाई देंगी।' },
      pujas: { title: 'अभी तक कोई पूजा प्रकाशित नहीं', body: 'प्रकाशित होने पर पूजा मार्गदर्शिकाएँ यहाँ दिखाई देंगी।' },
      shlokas: { title: 'अभी तक कोई श्लोक प्रकाशित नहीं', body: 'प्रकाशित होने पर श्लोक और स्तोत्र यहाँ दिखाई देंगे।' },
      occasions: { title: 'अभी तक कोई अवसर प्रकाशित नहीं', body: 'प्रकाशित होने पर जीवन-अवसर यहाँ दिखाई देंगे।' },
      'occasion-pujas': { title: 'अभी तक कोई पूजा नहीं जोड़ी गई', body: 'इस अवसर के लिए पूजा मार्गदर्शिकाएँ जोड़े जाने पर यहाँ दिखाई देंगी।' },
      'live-streams': { title: 'अभी तक कोई लाइव स्ट्रीम प्रकाशित नहीं', body: 'प्रकाशित होने पर मंदिर के लाइव दर्शन प्रसारण यहाँ दिखाई देंगे।' },
      temples: { title: 'अभी तक कोई मंदिर प्रकाशित नहीं', body: 'प्रकाशित होने पर मंदिर प्रोफ़ाइल यहाँ दिखाई देंगी।' },
    },
    storyFallbackNote: 'पूरी कथा अभी हिंदी में उपलब्ध नहीं है — अंग्रेज़ी में पढ़ रहे हैं',
    devotionalHeading: 'आज की भक्ति',
    shlokaOfDay: 'आज का श्लोक',
    storyOfDay: 'आज की कहानी',
    reflection: 'चिंतन',
    navSearchLabel: 'खोजें',
    navSwitchLanguage: 'भाषा बदलें',
    navMore: 'अधिक',
    navOpenMenu: 'मेनू खोलें',
    navCloseMenu: 'मेनू बंद करें',
    navLanguageHeading: 'भाषा',
    adjustTextSize: 'टेक्स्ट आकार समायोजित करें',
    showingDays: (n) => `${n} दिन दिखाए जा रहे हैं`,
    liveDarshan: 'लाइव दर्शन',
    watchLive: 'लाइव देखें',
    arathiSchedule: 'आरती का समय',
    visitChannel: 'चैनल देखें',
    liveDarshanLocation: 'स्थान',
    showMoreSchedule: (n) => `${n} और दिखाएं`,
    showLessSchedule: 'कम दिखाएं',
    featuredLabel: 'विशेष',
    establishedLabel: 'स्थापित',
    temples: 'मंदिर',
    templeEtymology: 'शब्द व्युत्पत्ति',
    templeHistory: 'इतिहास',
    templeOfficialWebsite: 'आधिकारिक वेबसाइट',
  },
};
