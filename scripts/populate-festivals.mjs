// node scripts/populate-festivals.mjs
import { google } from 'googleapis';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

const FESTIVALS = [
  {
    slug: 'ganesh-chaturthi',
    title_en: 'Ganesh Chaturthi', title_te: 'వినాయక చవితి', title_ta: 'கணேஷ் சதுர்த்தி', title_hi: 'गणेश चतुर्थी',
    deity_slug: 'ganesha', tradition: 'ganapatya', calendar_month: 'August-September',
    tithi: 'Bhadrapada Shukla Chaturthi', next_occurrence: '2025-08-27',
    significance_en: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha, the remover of obstacles and god of beginnings. Celebrated with great enthusiasm across India, especially in Maharashtra, Andhra Pradesh, and Telangana. Clay idols of Ganesha are installed in homes and public pandals for 1 to 11 days, followed by immersion in water bodies.',
    significance_te: 'వినాయక చవితి గణేశుని జన్మదినాన్ని జరుపుకుంటుంది. ఆంధ్రప్రదేశ్, తెలంగాణలో విస్తృతంగా జరుపుకుంటారు. మట్టి విగ్రహాలను ఇళ్ళలో మరియు పందిళ్ళలో ప్రతిష్టిస్తారు.',
    significance_ta: 'கணேஷ் சதுர்த்தி கணேஷ் பிறந்த நாளைக் கொண்டாடுகிறது. மண் சிலைகளை வீடுகளிலும் பொது பந்தல்களிலும் நிறுவி 1 முதல் 11 நாட்கள் வழிபடுகின்றனர்.',
    significance_hi: 'गणेश चतुर्थी भगवान गणेश के जन्मदिन का उत्सव है। महाराष्ट्र, आंध्र प्रदेश और तेलंगाना में विशेष उत्साह के साथ मनाया जाता है।',
    status: 'published',
  },
  {
    slug: 'maha-shivaratri',
    title_en: 'Maha Shivaratri', title_te: 'మహా శివరాత్రి', title_ta: 'மஹா சிவராத்திரி', title_hi: 'महा शिवरात्रि',
    deity_slug: 'shiva', tradition: 'shaiva', calendar_month: 'February-March',
    tithi: 'Phalguna Krishna Chaturdashi', next_occurrence: '2026-02-26',
    significance_en: 'Maha Shivaratri is the great night of Shiva, marking the convergence of Shiva and Shakti. Devotees observe a day-long fast, stay awake through the night chanting prayers, and offer bel leaves, milk, and flowers to the Shiva Lingam. It is one of the most sacred nights in the Hindu calendar.',
    significance_te: 'మహా శివరాత్రి శివ-శక్తుల కలయికను సూచిస్తుంది. భక్తులు ఒక రోజు ఉపవాసం ఉండి, రాత్రంతా జాగరణ చేసి శివలింగానికి బిల్వ పత్రాలు, పాలు అర్పిస్తారు.',
    significance_ta: 'மஹா சிவராத்திரி சிவன் மற்றும் சக்தியின் இணைவை குறிக்கிறது. பக்தர்கள் ஒரு நாள் உண்ணாவிரதம் இருந்து இரவு முழுவதும் விழித்திருந்து வழிபடுகின்றனர்.',
    significance_hi: 'महा शिवरात्रि शिव और शक्ति के मिलन का महान उत्सव है। भक्त दिनभर उपवास करके रात भर जागकर शिवलिंग की पूजा करते हैं।',
    status: 'published',
  },
  {
    slug: 'navaratri',
    title_en: 'Navaratri', title_te: 'నవరాత్రి', title_ta: 'நவராத்திரி', title_hi: 'नवरात्रि',
    deity_slug: 'durga', tradition: 'shakta', calendar_month: 'September-October',
    tithi: 'Ashwina Shukla Pratipada', next_occurrence: '2025-09-29',
    significance_en: 'Navaratri is a nine-night festival dedicated to the nine forms of Goddess Durga (Navadurga). Each day is associated with a different form of the goddess. The festival culminates on Vijayadasami (Dussehra), celebrating the victory of good over evil.',
    significance_te: 'నవరాత్రి దేవి నవదుర్గ తొమ్మిది రూపాలకు అంకితమైన తొమ్మిది రాత్రుల పండుగ. విజయదశమి రోజు మహిషాసురుని వధను జరుపుకుంటారు.',
    significance_ta: 'நவராத்திரி தேவி நவதுர்கையின் ஒன்பது வடிவங்களுக்கு அர்ப்பணிக்கப்பட்ட ஒன்பது இரவுகள் கொண்டாட்டம். விஜயதசமி நாளில் நன்மை தீமையை வென்றதை கொண்டாடுகின்றனர்.',
    significance_hi: 'नवरात्रि देवी दुर्गा के नौ रूपों को समर्पित नौ रातों का उत्सव है। विजयदशमी पर बुराई पर अच्छाई की जीत मनाई जाती है।',
    status: 'published',
  },
  {
    slug: 'diwali',
    title_en: 'Diwali', title_te: 'దీపావళి', title_ta: 'தீபாவளி', title_hi: 'दीपावली',
    deity_slug: 'lakshmi', tradition: 'vaishnava', calendar_month: 'October-November',
    tithi: 'Kartika Amavasya', next_occurrence: '2025-10-20',
    significance_en: 'Diwali, the festival of lights, commemorates the return of Lord Rama to Ayodhya after 14 years of exile. It also marks the worship of Goddess Lakshmi for prosperity. Homes are decorated with lamps and rangoli, and fireworks are lit to drive away darkness.',
    significance_te: 'దీపావళి వెలుతురు పండుగ. శ్రీ రాముని 14 సంవత్సరాల వనవాసం పూర్తయి అయోధ్యకు తిరిగి రావడాన్ని జ్ఞాపకం చేసుకుంటారు. లక్ష్మీదేవిని పూజిస్తారు.',
    significance_ta: 'தீபாவளி வெளிச்சத்தின் திருவிழா. ஸ்ரீ ராமர் 14 ஆண்டு வனவாசம் முடிந்து அயோத்திக்கு திரும்பியதை நினைவு கூர்கிறது. லட்சுமி பூஜை செய்கின்றனர்.',
    significance_hi: 'दीपावली प्रकाश का त्योहार है। भगवान राम के 14 वर्ष के वनवास के बाद अयोध्या लौटने की याद में मनाया जाता है। धन की देवी लक्ष्मी की पूजा होती है।',
    status: 'published',
  },
  {
    slug: 'krishna-janmashtami',
    title_en: 'Krishna Janmashtami', title_te: 'కృష్ణ జన్మాష్టమి', title_ta: 'கிருஷ்ண ஜன்மாஷ்டமி', title_hi: 'कृष्ण जन्माष्टमी',
    deity_slug: 'krishna', tradition: 'vaishnava', calendar_month: 'August',
    tithi: 'Bhadrapada Krishna Ashtami', next_occurrence: '2025-08-16',
    significance_en: 'Janmashtami celebrates the birth of Lord Krishna, the eighth avatar of Lord Vishnu. Devotees fast until midnight, recreate the birth scene, and sing devotional songs. Dahi Handi celebrations mark the playful side of young Krishna breaking pots of butter.',
    significance_te: 'జన్మాష్టమి శ్రీ కృష్ణుని జన్మదినాన్ని జరుపుకుంటుంది. భక్తులు అర్ధరాత్రి వరకు ఉపవాసం పాటిస్తారు మరియు భగవద్భజనలు పాడతారు.',
    significance_ta: 'ஜன்மாஷ்டமி ஸ்ரீ கிருஷ்ணரின் பிறந்தநாளை கொண்டாடுகிறது. பக்தர்கள் நடுச்சாமம் வரை உண்ணாவிரதம் இருந்து பக்தி பாடல்கள் பாடுகின்றனர்.',
    significance_hi: 'जन्माष्टमी भगवान कृष्ण के जन्मदिन का उत्सव है। भक्त आधी रात तक उपवास रखते हैं और भजन-कीर्तन करते हैं।',
    status: 'published',
  },
  {
    slug: 'rama-navami',
    title_en: 'Rama Navami', title_te: 'రామ నవమి', title_ta: 'ராம நவமி', title_hi: 'राम नवमी',
    deity_slug: 'rama', tradition: 'vaishnava', calendar_month: 'March-April',
    tithi: 'Chaitra Shukla Navami', next_occurrence: '2026-03-29',
    significance_en: 'Rama Navami celebrates the birth of Lord Rama, the seventh avatar of Vishnu and the ideal king of Ayodhya. Devotees read the Ramayana, perform pujas, and observe fasts on this day.',
    significance_te: 'రామ నవమి విష్ణువు యొక్క ఏడవ అవతారమైన శ్రీ రాముని జన్మదినాన్ని జరుపుకుంటుంది. భక్తులు రామాయణాన్ని పారాయణం చేస్తారు మరియు ఉపవాసాలు పాటిస్తారు.',
    significance_ta: 'ராம நவமி விஷ்ணுவின் ஏழாவது அவதாரமான ஸ்ரீ ராமரின் பிறந்தநாளைக் கொண்டாடுகிறது. பக்தர்கள் ராமாயணம் படிக்கின்றனர்.',
    significance_hi: 'राम नवमी भगवान राम के जन्मदिन का उत्सव है। भक्त रामायण पाठ करते हैं और उपवास रखते हैं।',
    status: 'published',
  },
  {
    slug: 'hanuman-jayanti',
    title_en: 'Hanuman Jayanti', title_te: 'హనుమాన్ జయంతి', title_ta: 'அனுமன் ஜயந்தி', title_hi: 'हनुमान जयंती',
    deity_slug: 'hanuman', tradition: 'vaishnava', calendar_month: 'April',
    tithi: 'Chaitra Purnima', next_occurrence: '2026-04-13',
    significance_en: 'Hanuman Jayanti celebrates the birth of Lord Hanuman, the devoted servant of Rama and symbol of strength, courage, and devotion. Devotees recite the Hanuman Chalisa and visit temples.',
    significance_te: 'హనుమాన్ జయంతి బలం, భక్తి యొక్క సంకేతమైన శ్రీ హనుమంతుని జన్మదినాన్ని జరుపుకుంటుంది. భక్తులు హనుమాన్ చాలీసాను పఠిస్తారు.',
    significance_ta: 'அனுமன் ஜயந்தி வலிமை மற்றும் பக்தியின் சின்னமான ஸ்ரீ அனுமனின் பிறந்தநாளைக் கொண்டாடுகிறது.',
    significance_hi: 'हनुमान जयंती भगवान हनुमान के जन्मदिन का उत्सव है। भक्त हनुमान चालीसा का पाठ करते हैं।',
    status: 'published',
  },
  {
    slug: 'saraswati-puja',
    title_en: 'Saraswati Puja', title_te: 'సరస్వతీ పూజ', title_ta: 'சரஸ்வதி பூஜை', title_hi: 'सरस्वती पूजा',
    deity_slug: 'saraswati', tradition: 'shakta', calendar_month: 'September-October',
    tithi: 'Ashwina Shukla Navami', next_occurrence: '2025-10-07',
    significance_en: 'Saraswati Puja, also called Ayudha Puja and Saraswati Avani Avittam, is dedicated to Goddess Saraswati, the deity of learning, arts, and wisdom. Books, musical instruments, and tools are placed before the goddess for blessings.',
    significance_te: 'సరస్వతీ పూజ జ్ఞానం, కళలు, విద్యల దేవత అయిన సరస్వతీదేవికి అంకితమైన పండుగ. పుస్తకాలు, సంగీత వాద్యాలు దేవి ముందు పెట్టి ఆశీర్వాదం కోరతారు.',
    significance_ta: 'சரஸ்வதி பூஜை கல்வி, கலை மற்றும் ஞானத்தின் தேவியான சரஸ்வதிக்கு அர்ப்பணிக்கப்பட்டது. புத்தகங்கள் மற்றும் கருவிகளை தேவி முன் வைத்து ஆசி வேண்டுகின்றனர்.',
    significance_hi: 'सरस्वती पूजा विद्या, कला और ज्ञान की देवी सरस्वती को समर्पित है। पुस्तकें और वाद्य यंत्र देवी के सामने रखकर आशीर्वाद मांगते हैं।',
    status: 'published',
  },
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Read existing headers
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'festivals!A1:ZZ1' });
  let headers = res.data.values?.[0] ?? [];

  // If empty, write headers first
  if (!headers.length) {
    headers = ['slug','title_en','title_te','title_ta','title_hi','deity_slug','tradition',
      'calendar_month','tithi','next_occurrence','significance_en','significance_te',
      'significance_ta','significance_hi','illustration_drive_id','status'];
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: 'festivals!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }

  const rows = FESTIVALS.map(f => headers.map(h => (f[h] ?? '') + ''));

  await sheets.spreadsheets.values.append({
    spreadsheetId, range: 'festivals!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  console.log(`✓ wrote ${rows.length} festivals`);
}

main().catch(e => { console.error(e); process.exit(1); });
