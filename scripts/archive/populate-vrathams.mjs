// node scripts/populate-vrathams.mjs
import { google } from 'googleapis';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../../.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

const VRATHAMS = [
  {
    slug: 'satyanarayana-vratham',
    title_en: 'Satyanarayana Vratham', title_te: 'సత్యనారాయణ వ్రతం', title_ta: 'சத்யநாராயண விரதம்', title_hi: 'सत्यनारायण व्रत',
    deity_slug: 'satyanarayana', tradition: 'vaishnava',
    duration: '1 day', observance_day: 'Purnima or auspicious occasion',
    next_occurrence: '2025-07-10',
    fasting_rules_en: 'Devotees observe a partial fast on the day of the puja. They avoid non-vegetarian food, consume only fruits and milk during the day, and break the fast after the puja is completed and prasad is received.',
    fasting_rules_te: 'భక్తులు పూజ రోజు పాక్షిక ఉపవాసం పాటిస్తారు. మాంసాహారం నివారిస్తారు మరియు పూజ పూర్తయి ప్రసాదం తీసుకున్న తర్వాత ఉపవాసం విరమిస్తారు.',
    fasting_rules_ta: 'பக்தர்கள் பூஜை நாளில் பகுதி உண்ணாவிரதம் இருக்கின்றனர். அசைவ உணவை தவிர்க்கின்றனர்.',
    fasting_rules_hi: 'भक्त पूजा के दिन आंशिक उपवास रखते हैं। मांसाहार से परहेज करते हैं।',
    benefits_en: 'The Satyanarayana Puja brings peace, prosperity, and fulfillment of wishes to the household. It is performed to express gratitude for blessings received and to seek divine protection for the family.',
    benefits_te: 'సత్యనారాయణ పూజ కుటుంబానికి శాంతి, సంపద మరియు మనోవాంఛితాలను నెరవేరుస్తుంది. పొందిన ఆశీర్వాదాలకు కృతజ్ఞత తెలుపడానికి చేస్తారు.',
    benefits_ta: 'சத்யநாராயண பூஜை குடும்பத்திற்கு அமைதி, செழிப்பு மற்றும் ஆசைகளை நிறைவேற்றுகிறது.',
    benefits_hi: 'सत्यनारायण पूजा से घर में शांति, समृद्धि और मनोकामनाएं पूर्ण होती हैं।',
    status: 'published',
  },
  {
    slug: 'varalakshmi-vratham',
    title_en: 'Varalakshmi Vratham', title_te: 'వరలక్ష్మీ వ్రతం', title_ta: 'வரலட்சுமி விரதம்', title_hi: 'वरलक्ष्मी व्रत',
    deity_slug: 'lakshmi', tradition: 'shakta',
    duration: '1 day', observance_day: 'Friday before Shravana Purnima',
    next_occurrence: '2025-08-08',
    fasting_rules_en: 'Married women observe this fast for the well-being of their husbands and family. They wake up early, take a bath, and perform the puja with flowers, turmeric, and kumkum. The fast is broken after the evening puja.',
    fasting_rules_te: 'వివాహిత స్త్రీలు తమ భర్తల మరియు కుటుంబ శ్రేయస్సు కోసం ఈ వ్రతం ఆచరిస్తారు. పూజ అనంతరం ఉపవాసం విరమిస్తారు.',
    fasting_rules_ta: 'திருமணமான பெண்கள் தங்கள் கணவர் மற்றும் குடும்பத்தின் நலனுக்காக இந்த விரதம் இருக்கின்றனர்.',
    fasting_rules_hi: 'विवाहित महिलाएं पति और परिवार की सुख-समृद्धि के लिए यह व्रत रखती हैं।',
    benefits_en: 'Varalakshmi Vratham bestows wealth, prosperity, and happiness to the family. Goddess Varalakshmi, who grants boons, blesses the household with material and spiritual abundance.',
    benefits_te: 'వరలక్ష్మీ వ్రతం కుటుంబానికి సంపద, ఐశ్వర్యం మరియు ఆనందాన్ని అందిస్తుంది.',
    benefits_ta: 'வரலட்சுமி விரதம் குடும்பத்திற்கு செல்வம், செழிப்பு மற்றும் மகிழ்ச்சியை அளிக்கிறது.',
    benefits_hi: 'वरलक्ष्मी व्रत से परिवार में धन, समृद्धि और सुख प्राप्त होता है।',
    status: 'published',
  },
  {
    slug: 'ekadashi-vratham',
    title_en: 'Ekadashi Vratham', title_te: 'ఏకాదశి వ్రతం', title_ta: 'ஏகாதசி விரதம்', title_hi: 'एकादशी व्रत',
    deity_slug: 'vishnu', tradition: 'vaishnava',
    duration: '1 day', observance_day: 'Ekadashi (11th lunar day) twice a month',
    next_occurrence: '2025-07-06',
    fasting_rules_en: 'Devotees observe a complete fast without food or water on Ekadashi. Some observe a partial fast consuming only fruits and milk. The fast begins at sunrise on Ekadashi and ends at sunrise on the following day (Dwadashi).',
    fasting_rules_te: 'ఏకాదశి రోజున భక్తులు నిర్జల ఉపవాసం పాటిస్తారు. కొందరు పళ్ళు మరియు పాలు మాత్రమే తీసుకుంటారు. ద్వాదశి ఉదయం ఉపవాసం విరమిస్తారు.',
    fasting_rules_ta: 'ஏகாதசி நாளில் பக்தர்கள் முழு உண்ணாவிரதம் இருக்கின்றனர். சிலர் பழங்கள் மட்டும் உண்கின்றனர்.',
    fasting_rules_hi: 'एकादशी के दिन भक्त निर्जल उपवास रखते हैं। कुछ लोग केवल फल और दूध लेते हैं।',
    benefits_en: 'Ekadashi fasting cleanses the body and mind, purifies sins, and brings one closer to Vishnu. It is said to grant moksha and remove all obstacles in life.',
    benefits_te: 'ఏకాదశి ఉపవాసం శరీరాన్ని, మనసును పవిత్రం చేస్తుంది మరియు పాపాలను పోగొడుతుంది. మోక్షాన్ని ప్రసాదిస్తుందని చెప్పబడుతుంది.',
    benefits_ta: 'ஏகாதசி விரதம் உடல் மற்றும் மனதை தூய்மைப்படுத்துகிறது. பாவங்களை போக்கி மோட்சத்தை அளிக்கிறது.',
    benefits_hi: 'एकादशी उपवास से शरीर और मन शुद्ध होते हैं, पाप नष्ट होते हैं और मोक्ष प्राप्ति का मार्ग खुलता है।',
    status: 'published',
  },
  {
    slug: 'pradosha-vratham',
    title_en: 'Pradosha Vratham', title_te: 'ప్రదోష వ్రతం', title_ta: 'பிரதோஷ விரதம்', title_hi: 'प्रदोष व्रत',
    deity_slug: 'shiva', tradition: 'shaiva',
    duration: '1 day', observance_day: 'Trayodashi (13th lunar day) twice a month',
    next_occurrence: '2025-07-17',
    fasting_rules_en: 'Devotees fast from sunrise until the evening puja, which takes place during the Pradosha Kala (1.5 hours before and after sunset). They bathe, wear clean clothes, and offer bel leaves to Shiva.',
    fasting_rules_te: 'భక్తులు ఉదయం నుండి సాయంత్రం పూజ వరకు ఉపవాసం పాటిస్తారు. ప్రదోష కాలంలో శివుడికి బిల్వ పత్రాలు అర్పిస్తారు.',
    fasting_rules_ta: 'பக்தர்கள் காலை முதல் மாலை பூஜை வரை உண்ணாவிரதம் இருக்கின்றனர். சிவனுக்கு வில்வ இலைகள் அர்ப்பணிக்கின்றனர்.',
    fasting_rules_hi: 'भक्त सूर्योदय से शाम की पूजा तक उपवास रखते हैं। प्रदोष काल में शिव को बेल पत्र चढ़ाते हैं।',
    benefits_en: 'Pradosha Vratham removes sins, fulfills desires, and grants liberation. Shiva and Parvati are said to be in an especially receptive mood during Pradosha time, making prayers particularly effective.',
    benefits_te: 'ప్రదోష వ్రతం పాపాలను తొలగించి, కోరికలను తీరుస్తుంది. ప్రదోష కాలంలో శివపార్వతులు ప్రసన్న స్థితిలో ఉంటారు.',
    benefits_ta: 'பிரதோஷ விரதம் பாவங்களை போக்கி ஆசைகளை நிறைவேற்றுகிறது.',
    benefits_hi: 'प्रदोष व्रत पापों को नष्ट करके मनोकामनाएं पूर्ण करता है और मोक्ष प्रदान करता है।',
    status: 'published',
  },
  {
    slug: 'mondays-shiva-vratham',
    title_en: 'Monday Shiva Vratham', title_te: 'సోమవార శివ వ్రతం', title_ta: 'திங்கட்கிழமை சிவ விரதம்', title_hi: 'सोमवार शिव व्रत',
    deity_slug: 'shiva', tradition: 'shaiva',
    duration: '1 day', observance_day: 'Every Monday',
    next_occurrence: '2025-07-07',
    fasting_rules_en: 'Devotees fast on Mondays dedicated to Lord Shiva. They consume only one meal or observe a complete fast. Shiva temples are visited in the evening, and the fast is broken after offering prayers.',
    fasting_rules_te: 'శివ భక్తులు ప్రతి సోమవారం ఉపవాసం పాటిస్తారు. ఒక పూట మాత్రమే భోజనం చేస్తారు. సాయంత్రం శివాలయానికి వెళ్ళి పూజ చేస్తారు.',
    fasting_rules_ta: 'சிவ பக்தர்கள் ஒவ்வொரு திங்கட்கிழமையும் உண்ணாவிரதம் இருக்கின்றனர். மாலையில் சிவன் கோவிலுக்கு சென்று வழிபடுகின்றனர்.',
    fasting_rules_hi: 'शिव भक्त प्रत्येक सोमवार को उपवास रखते हैं। एक समय भोजन करते हैं। शाम को शिव मंदिर में पूजा करते हैं।',
    benefits_en: 'Monday fasting pleases Lord Shiva and brings his blessings for health, wealth, and removal of obstacles. It is especially beneficial for those seeking a good spouse.',
    benefits_te: 'సోమవార ఉపవాసం శివుని ప్రసన్నం చేసి, ఆరోగ్యం, సంపద మరియు అడ్డంకుల తొలగింపును అందిస్తుంది.',
    benefits_ta: 'திங்கட்கிழமை விரதம் சிவனை மகிழ்விக்கிறது. ஆரோக்கியம் மற்றும் செல்வத்திற்கான ஆசி கிடைக்கிறது.',
    benefits_hi: 'सोमवार व्रत भगवान शिव को प्रसन्न करके स्वास्थ्य, धन और बाधाओं का नाश करता है।',
    status: 'published',
  },
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'vrathams!A1:ZZ1' });
  let headers = res.data.values?.[0] ?? [];

  if (!headers.length) {
    headers = ['slug','title_en','title_te','title_ta','title_hi','deity_slug','tradition',
      'duration','observance_day','next_occurrence','tithi',
      'fasting_rules_en','fasting_rules_te','fasting_rules_ta','fasting_rules_hi',
      'benefits_en','benefits_te','benefits_ta','benefits_hi','status'];
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: 'vrathams!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }

  const rows = VRATHAMS.map(v => headers.map(h => (v[h] ?? '') + ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId, range: 'vrathams!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  console.log(`✓ wrote ${rows.length} vrathams`);
}

main().catch(e => { console.error(e); process.exit(1); });
