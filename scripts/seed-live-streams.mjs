#!/usr/bin/env node
/**
 * Seeds the `live_streams` tab with temple live-darshan entries.
 *
 * Dry-run by default — prints what would be appended. Pass --write to
 * actually append rows to the live Sheet.
 *
 * Usage:
 *   node scripts/seed-live-streams.mjs           # dry run
 *   node scripts/seed-live-streams.mjs --write   # append to Sheets
 *
 * ROWS below is intentionally empty. Fill it in with confirmed
 * temple_name / youtube_video_id / arathi_schedule content before running
 * --write — do not fabricate temple data or video IDs.
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag();

const HEADERS = [
  'slug', 'temple_name_en', 'temple_name_te', 'temple_name_ta', 'temple_name_hi',
  'deity_slug', 'youtube_video_id', 'channel_url',
  'location_en', 'location_te', 'location_ta', 'location_hi',
  'arathi_schedule_en', 'arathi_schedule_te', 'arathi_schedule_ta', 'arathi_schedule_hi',
  'display_order', 'status', 'translation_status',
];

// Confirmed via direct YouTube spot-check (see conversation) — each of these
// three video IDs was verified live/persistent, not a stale or daily-dated
// upload, before being added here.
const ROWS = [
  {
    slug: 'ttd-tirumala',
    temple_name_en: 'Tirumala Venkateswara Temple (TTD)',
    temple_name_te: 'తిరుమల వేంకటేశ్వర దేవస్థానం',
    temple_name_ta: 'திருமலை வெங்கடேஸ்வரர் கோயில் (TTD)',
    temple_name_hi: 'तिरुमला वेंकटेश्वर मंदिर',
    deity_slug: 'venkateswara',
    youtube_video_id: 'dwsS3bxweBw',
    channel_url: 'https://www.youtube.com/@svbcttd',
    location_en: 'Tirumala, Tirupati, Andhra Pradesh',
    location_te: 'తిరుమల, తిరుపతి, ఆంధ్రప్రదేశ్',
    location_ta: 'திருமலை, திருப்பதி, ஆந்திரப் பிரதேசம்',
    location_hi: 'तिरुमला, तिरुपति, आंध्र प्रदेश',
    arathi_schedule_en: 'Suprabhatam 2:30-3:00 AM, Thomala Seva 3:30-4:00 AM, Archana (Sahasranama) 4:15-5:00 AM, Sarva Darshan ~7:00 AM-7:00 PM (varies by day), Sahasra Deepalankarana Seva 5:30-6:30 PM, Night Darshan 8:00 PM-1:00 AM. Times vary by weekday special sevas.',
    arathi_schedule_te: 'సుప్రభాతం ఉదయం 2:30-3:00, తోమాల సేవ 3:30-4:00, అర్చన (సహస్రనామం) 4:15-5:00, సర్వ దర్శనం సాధారణంగా ఉదయం 7:00 నుండి రాత్రి 7:00 వరకు (రోజును బట్టి మారుతుంది), సహస్ర దీపాలంకరణ సేవ సాయంత్రం 5:30-6:30, రాత్రి దర్శనం రాత్రి 8:00 నుండి తెల్లవారుజామున 1:00 వరకు. వారంవారీ ప్రత్యేక సేవలను బట్టి సమయాలు మారవచ్చు.',
    arathi_schedule_ta: 'சுப்ரபாதம் காலை 2:30-3:00, தோமала சேவை 3:30-4:00, அர்ச்சனை (சஹஸ்ரநாமம்) 4:15-5:00, சர்வ தரிசனம் பொதுவாக காலை 7:00 முதல் இரவு 7:00 வரை (நாளுக்கு நாள் மாறுபடும்), சஹஸ்ர தீபாலங்கரண சேவை மாலை 5:30-6:30, இரவு தரிசனம் இரவு 8:00 முதல் அதிகாலை 1:00 வரை. வார சிறப்பு சேவைகளுக்கேற்ப நேரங்கள் மாறலாம்.',
    arathi_schedule_hi: 'सुप्रभातम् सुबह 2:30-3:00 बजे, थोमाला सेवा 3:30-4:00 बजे, अर्चना (सहस्रनाम) 4:15-5:00 बजे, सर्व दर्शन सामान्यतः सुबह 7:00 से रात 7:00 बजे तक (दिन के अनुसार बदलता है), सहस्र दीपालंकरण सेवा शाम 5:30-6:30 बजे, रात्रि दर्शन रात 8:00 से 1:00 बजे तक। साप्ताहिक विशेष सेवाओं के अनुसार समय बदल सकता है।',
    display_order: 1,
    status: 'published',
    translation_status: 'complete',
  },
  {
    slug: 'siddhivinayak-mumbai',
    temple_name_en: 'Shree Siddhivinayak Ganapati Temple',
    temple_name_te: 'శ్రీ సిద్ధి వినాయక గణపతి దేవాలయం',
    temple_name_ta: 'ஸ்ரீ சித்தி விநாயகர் கணபதி கோயில்',
    temple_name_hi: 'श्री सिद्धिविनायक गणपती मंदिर',
    deity_slug: 'ganesha',
    youtube_video_id: 'So84PrO3Rxg',
    channel_url: 'https://www.youtube.com/@ShreeSiddhivinayakTemple',
    location_en: 'Prabhadevi, Mumbai, Maharashtra',
    location_te: 'ప్రభాదేవి, ముంబై, మహారాష్ట్ర',
    location_ta: 'பிரபாதேவி, மும்பை, மகாராஷ்டிரா',
    location_hi: 'प्रभादेवी, मुंबई, महाराष्ट्र',
    arathi_schedule_en: 'Wed-Mon: Kakad Aarti 5:30-6:00 AM, Morning Darshan 6:00 AM-12:00 PM, Naivedhya 12:05-12:30 PM, Afternoon Darshan 12:30-7:00 PM, Dhup Aarti 7:00-7:10 PM, Evening Aarti 7:30-8:00 PM, Night Darshan 8:00-9:50 PM, Shejaarti 9:50 PM (temple closes). Tuesdays open earlier (~3:15 AM) with extended night hours to ~11:45 PM.',
    arathi_schedule_te: 'బుధ-సోమవారం: కాకడ హారతి ఉదయం 5:30-6:00, ఉదయం దర్శనం 6:00 నుండి మధ్యాహ్నం 12:00 వరకు, నైవేద్యం 12:05-12:30, మధ్యాహ్న దర్శనం 12:30 నుండి సాయంత్రం 7:00 వరకు, ధూప హారతి 7:00-7:10, సాయంత్రం హారతి 7:30-8:00, రాత్రి దర్శనం 8:00-9:50, శేజారతి 9:50 (దేవాలయం మూసివేత). మంగళవారాలలో ఉదయం సుమారు 3:15కి తెరుచుకుని రాత్రి సుమారు 11:45 వరకు పొడిగించబడుతుంది.',
    arathi_schedule_ta: 'புதன்-திங்கள்: காகட் ஆரத்தி காலை 5:30-6:00, காலை தரிசனம் 6:00 முதல் மதியம் 12:00 வரை, நைவேத்யம் 12:05-12:30, மதிய தரிசனம் 12:30 முதல் மாலை 7:00 வரை, தூப ஆரத்தி 7:00-7:10, மாலை ஆரத்தி 7:30-8:00, இரவு தரிசனம் 8:00-9:50, ஷேஜாரத்தி 9:50 (கோயில் மூடல்). செவ்வாய்க்கிழமைகளில் காலை சுமார் 3:15 மணிக்குத் திறந்து இரவு சுமார் 11:45 வரை நீட்டிக்கப்படும்.',
    arathi_schedule_hi: 'बुध-सोम: काकड़ आरती सुबह 5:30-6:00, सुबह दर्शन 6:00 से दोपहर 12:00 बजे तक, नैवेद्य 12:05-12:30, दोपहर दर्शन 12:30 से शाम 7:00 बजे तक, धूप आरती 7:00-7:10, शाम आरती 7:30-8:00, रात्रि दर्शन 8:00-9:50, शेजारती 9:50 बजे (मंदिर बंद)। मंगलवार को सुबह लगभग 3:15 बजे खुलता है और रात लगभग 11:45 बजे तक विस्तारित रहता है।',
    display_order: 2,
    status: 'published',
    translation_status: 'complete',
  },
  {
    slug: 'kashi-vishwanath',
    temple_name_en: 'Shree Kashi Vishwanath Temple',
    temple_name_te: 'శ్రీ కాశీ విశ్వనాథ దేవాలయం',
    temple_name_ta: 'ஸ்ரீ காசி விஸ்வநாதர் கோயில்',
    temple_name_hi: 'श्री काशी विश्वनाथ मंदिर',
    deity_slug: 'shiva',
    youtube_video_id: 'Ccl49nwIrrA',
    channel_url: 'https://www.youtube.com/@ShreeKashiVishwanathMandir',
    location_en: 'Varanasi, Uttar Pradesh',
    location_te: 'వారణాసి, ఉత్తర ప్రదేశ్',
    location_ta: 'வாரணாசி, உத்தரப் பிரதேசம்',
    location_hi: 'वाराणसी, उत्तर प्रदेश',
    arathi_schedule_en: 'Not published on the pages checked — the official web portal directs devotees to call +91 6393131608 / +91 7080292930 (9 AM-6 PM) for live darshan / aarti timing support.',
    arathi_schedule_te: 'పరిశీలించిన పేజీలలో ప్రచురించలేదు - అధికారిక వెబ్ పోర్టల్ లైవ్ దర్శన్/హారతి సమయ మద్దతు కోసం +91 6393131608 / +91 7080292930 (ఉదయం 9 - సాయంత్రం 6) కు కాల్ చేయమని భక్తులకు సూచిస్తుంది.',
    arathi_schedule_ta: 'பரிசோதிக்கப்பட்ட பக்கங்களில் வெளியிடப்படவில்லை - அதிகாரப்பூர்வ இணைய போர்ட்டல் லைவ் தரிசன்/ஆரத்தி நேர உதவிக்கு +91 6393131608 / +91 7080292930 (காலை 9 - மாலை 6) என்ற எண்ணை அழைக்குமாறு பக்தர்களை வழிநடத்துகிறது.',
    arathi_schedule_hi: 'जांची गई पृष्ठों पर प्रकाशित नहीं है - आधिकारिक वेब पोर्टल लाइव दर्शन/आरती समय सहायता हेतु +91 6393131608 / +91 7080292930 (सुबह 9 - शाम 6 बजे) पर कॉल करने का सुझाव देता है।',
    display_order: 3,
    status: 'published',
    translation_status: 'complete',
  },
];

async function main() {
  if (ROWS.length === 0) {
    console.log('No rows configured in ROWS — nothing to seed. See script header.');
    return;
  }

  const { headers } = await getTabWithHeaders('live_streams');
  const missing = HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`live_streams tab is missing header(s): ${missing.join(', ')}. Add the header row to Sheets first.`);
  }

  const values = ROWS.map(row => headers.map(h => row[h] ?? ''));

  console.log(`${WRITE ? 'Writing' : 'Dry run — would write'} ${values.length} row(s) to live_streams:`);
  for (const row of ROWS) {
    console.log(`  ${row.slug}: ${row.temple_name_en}`);
  }

  if (!WRITE) {
    console.log('\nRe-run with --write to append these rows.');
    return;
  }

  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'live_streams!A:A',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
