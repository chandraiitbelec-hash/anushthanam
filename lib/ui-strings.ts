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
  },
};
