import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const auth = new google.auth.GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const WRITE = process.argv.includes('--write');
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

async function getAllRows() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'stories_content!A:D' });
  return res.data.values || [];
}
async function getSheetId() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  return meta.data.sheets.find(s => s.properties.title === 'stories_content').properties.sheetId;
}
async function deleteRows(sheetId, indices) {
  if (!WRITE) { console.log(`  [DRY RUN] would delete ${indices.length} row(s)`); return; }
  const sorted = [...indices].sort((a, b) => b - a);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: sorted.map(i => ({ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: i, endIndex: i + 1 } } })) },
  });
}
async function appendRows(rows) {
  if (!WRITE) { console.log(`  [DRY RUN] would append ${rows.length} row(s)`); return; }
  await sheets.spreadsheets.values.append({ spreadsheetId: SPREADSHEET_ID, range: 'stories_content!A:D', valueInputOption: 'RAW', requestBody: { values: rows } });
}

// chhath-puja-katha ta: 5 → 13 (full story matching Hindi's 13 paragraphs)
const chhathTa = [
  `மகாபாரதத்தின் வன பர்வத்தில் இது பதிவு செய்யப்பட்டுள்ளது. நேர்மையான இளவரசன் யுதிஷ்டிரனும் அவனது சகோதரர்களும் கௌரவர்களின் தந்திரமான சூது ஆட்டத்தில் தோற்று, தங்கள் வாழ்விடம் இழந்தனர். பாண்டவர்கள் அழகிய தேவி திரௌபதியுடன் தங்கள் அரசக் கோலத்தை இழந்து கடும் வனவாசம் செல்ல நேர்ந்தது.`,
  `உடல் துன்பத்தை விட, வனவாசம் யுதிஷ்டிரனுக்கு ஒரு பெரிய ஆன்மீக சிக்கலை ஏற்படுத்தியது. தர்மத்தின் உண்மையான அரசனாக, தினமும் தன் வன முகாமுக்கு வரும் ஆயிரக்கணக்கான துறவிகளுக்கும் அலைந்தோர்க்கும் சிறந்த உணவும் ஆதிதேய உபசாரமும் அளிக்கும் கடமை அவனுக்கு இருந்தது.`,
  `ஒரு பிற்பகல், சிறிய மனப்பான்மை கொண்ட ரிஷி துர்வாசர் தலைமையில் பத்தாயிரம் தீவிர தவசியான முனிவர்கள் யுதிஷ்டிரனின் இலை குடிலில் வந்து, மாலை வழிபாட்டிற்கு முன் ஒரு கோட்டை விருந்தை கேட்டனர்.`,
  `திரௌபதி சமையலறைக்கு சென்று பாண்டங்களை பார்த்தாள். அவை முழுக்க காலியாக இருந்தன. ஒரு குழந்தைக்கு கூட ஊட்ட ஒரு தானியமும் இல்லை. அவள் முழு நம்பிக்கையிழந்து மண் தரையில் வீழ்ந்து அழுதாள். 'இந்த புனிதர்கள் பசியுடன் சென்றால் என் கணவர்கள் மேல் கொடிய சாபம் விழும், நாங்கள் அழிவோம்!' என்று எண்ணினாள்.`,
  `யுதிஷ்டிரன் அவளது துயரை கண்டு, மரத்தின் கீழ் தியானத்தில் அமர்ந்திருந்த குரு ஆசாரியர் ரிஷி தவுமியிடம் ஓடினான்: "சுவாமி! காப்பாற்றுங்கள்! புனிதர்களுக்கு உணவளிக்க வழியை சொல்லுங்கள்!"`,
  `ரிஷி தவுமியர் கண்களை திறந்து, "யுதிஷ்டிரா! அண்டத்தில் உள்ள அனைத்து உணவும், உயிரும், உடல் சக்தியும் சூரிய தேவன் சூரியனிடமிருந்து வருகின்றன. கார்த்திகை மாதத்தின் ஆறாம் நாளில் கொண்டாடப்படும் சூர்ய ஷஷ்டி விரதம் என்ற ஒரு பழமையான வேத வழிபாடு உண்டு. உன் ராணி திரௌபதி இந்த விரதத்தை அனுஷ்டிக்கட்டும். ஆற்றில் இடுப்பு வரை நின்று, மறையும் மற்றும் உதிக்கும் சூரியனுக்கு அர்க்கியம் செய்யட்டும். அவ்வாறு செய்தால் சூரிய தேவன் தீர்வு தர வேண்டிவரும்" என்றார்.`,
  `திரௌபதிக்கு ஆழ்ந்த நம்பிக்கையோடு வழிமுறை கிட்டியது. கார்த்திகை மாதம் வந்தது. அவள் ஆற்றங்கரையில் ஒரு சிறிய இடத்தை சுத்தப்படுத்தி, காட்டு பழங்கள் சேர்த்து, காட்டு தினை கொண்டு சடங்கு படையலை தயார் செய்தாள்.`,
  `36 மணி நேரம் நீர் அருந்தாமல் விரதம் இருந்தாள். மூன்றாம் நாள் மாலை, சூரியன் கூர்மையான மலை பாறைகளுக்குப் பின்னால் மறையத் தொடங்கியபோது, திரௌபதி குளிர்ந்த காட்டு ஆற்றில் இறங்கினாள். நடுக்கம் கொண்ட உடலுடன் இடுப்பு வரை நின்று, மேற்கு திசை நோக்கி படையல் கூடையை தூக்கினாள். கணவர்கள் தட்டில் காட்டு பால் ஊற்றினர், அவள் மறையும் சூரியனுக்கு ஆத்மாவை அர்பணித்தாள்.`,
  `இரவு முழுவதும் ஆற்றங்கரையில் அமர்ந்து இடைவிடாது வேண்டினாள், தூங்க மறுத்தாள்.`,
  `அடுத்த நாள் காலை, வானம் மென்மையான சிவப்பு வண்ணமடைந்தபோது, அவள் கிழக்கு திசை நோக்கி இடுப்பு வரை நின்று ஆற்றில் மீண்டும் இறங்கினாள். சூரியனின் முதல் பொன்னிற ஒளி மலையுச்சியிலிருந்து தெரிந்தபோது காலை அர்க்கியம் செய்தாள்.`,
  `அர்க்கிய நீர் அவளது கைகளிலிருந்து விழுந்த கணமே ஆற்றங்கரையில் ஒரு பிரதாப ஒளி பரவியது. உறைந்த காட்டை உடனே உருக்கும் வெப்பம் பரப்பிய சூரிய தேவன் நேரடியாக அவள் முன் பிரத்யட்சமானான். அவர் கையில் ஒரு பளபளக்கும் செம்பு பாத்திரம் — அக்ஷய பாத்திரம்.`,
  `சூரிய தேவன் மிகுந்த கருணையுடன் அருளினார்: "திரௌபதி! உன் முழுமையான பக்தியும் உடல் தவமும் என்னையும் சஷ்டி மையாவையும் மகிழ்வித்தது. இந்த தெய்வீக பாத்திரத்தை — அக்ஷய பாத்திரத்தை — உனக்கு அளிக்கிறேன். இன்று முதல், நீ உன் உணவை உண்ணும் வரை, இந்த பாத்திரம் தினமும் லட்சக்கணக்கானோரை ஊட்ட போதுமான சிறந்த உணவை முடிவில்லாமல் தரும். உன் விருந்தோம்பல் தோல்வி காணாது!"`,
  `திரௌபதி மகிழ்ச்சியின் கண்ணீரோடு பாத்திரம் பெற்று முகாமுக்கு ஓடினாள். அனைத்து ஆபத்துகளையும் விலக்கி பத்தாயிரம் முனிவர்களுக்கும் கோட்டை விருந்து வழங்கினாள். பாண்டவர்கள் முழு ஆரோக்கியத்துடனும் வளத்துடனும் வனவாசத்தை கடந்தனர், இறுதியில் குரு க்ஷேத்திரத்தில் வெற்றி பெற்று தம் சாம்ராஜ்யத்தை மீட்டனர். சுத்தியின் மற்றும் சூரிய சக்தியின் உன்னத சடங்காக சஷ்டி பூஜை உலகெங்கும் நிலைபெற்றது.`,
];

const rows = await getAllRows();
const sheetId = await getSheetId();

const existing = rows.map((r, i) => ({ r, i })).filter(({ r }) => r[0] === 'chhath-puja-katha' && r[1] === 'ta');
console.log(`chhath-puja-katha ta: deleting ${existing.length}, adding ${chhathTa.length}`);
await deleteRows(sheetId, existing.map(e => e.i));
const newRows = chhathTa.map((p, i) => ['chhath-puja-katha', 'ta', String(i + 1), p]);
await appendRows(newRows);
console.log(`Done. Deleted ${existing.length} rows, added ${chhathTa.length} paragraphs.`);
if (!WRITE) console.log('\nDry run only — no changes written. Re-run with --write to apply.');
