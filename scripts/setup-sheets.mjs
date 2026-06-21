// Run with: node scripts/setup-sheets.mjs
// Creates all tabs with correct headers in the Google Spreadsheet.
// Safe to re-run — skips tabs that already exist.

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '../.env.local' });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const TABS = {
  gods: ['slug','name_en','name_te','name_ta','name_hi','name_sa','alternate_names_en','tradition','description_en','description_te','description_ta','description_hi','iconography_en','illustration_filename','illustration_credit','image_drive_id','status','translation_status'],
  shlokas: ['slug','title_en','title_te','title_ta','title_hi','type','deity_slug','source_scripture_en','language_of_composition','brief_intro_en','brief_intro_te','brief_intro_ta','brief_intro_hi','audio_drive_id','status','translation_status'],
  shloka_stanzas: ['shloka_slug','stanza_number','stanza_label','script_devanagari','script_telugu','script_tamil','roman_iast','meaning_en','meaning_te','meaning_ta','meaning_hi','notes_en'],
  pujas: ['slug','title_en','title_te','title_ta','title_hi','deity_slug','occasion_type','duration_minutes','brief_description_en','brief_description_te','brief_description_ta','brief_description_hi','materials_group_slug','prasad_en','prasad_te','prasad_ta','prasad_hi','regional_variation_notes_en','status','translation_status'],
  festivals: ['slug','title_en','title_te','title_ta','title_hi','alternate_names_en','deity_slugs','illustration_filename','illustration_drive_id','calendar_month','tithi','paksha','next_occurrence','next_occurrence_note_en','significance_en','significance_te','significance_ta','significance_hi','linked_puja_slug','linked_story_slug','materials_group_slug','regional_notes_en','status','translation_status'],
  vrathams: ['slug','title_en','title_te','title_ta','title_hi','deity_slug','observance_day','tithi','paksha','duration','next_occurrence','next_occurrence_note_en','fasting_rules_en','fasting_rules_te','fasting_rules_ta','fasting_rules_hi','benefits_en','benefits_te','benefits_ta','benefits_hi','linked_puja_slug','linked_story_slug','status','translation_status'],
  stories_index: ['slug','title_en','title_te','title_ta','title_hi','deity_slug','story_type','source_scripture_en','reading_instruction_en','brief_summary_en','brief_summary_te','brief_summary_ta','brief_summary_hi','gdoc_id_en','gdoc_id_te','gdoc_id_ta','gdoc_id_hi','status','translation_status'],
  god_links: ['god_slug','entity_type','entity_slug','display_order'],
  procedure_steps: ['parent_slug','parent_type','step_number','step_title_en','step_title_te','step_title_ta','step_title_hi','instruction_en','instruction_te','instruction_ta','instruction_hi','recite_shloka_slug','recite_stanza_range','notes_en'],
  material_items: ['group_slug','item_order','item_name_en','item_name_te','item_name_ta','item_name_hi','quantity_en','is_optional','substitution_note_en'],
  panchangam: ['date','tithi_en','tithi_number','paksha','nakshatra_en','yoga_en','karana_en','lunar_month_en','sunrise','sunset','rahu_kalam','special_event_en','special_event_te','special_event_ta','special_event_hi'],
  tags: ['category','slug','label_en','label_te','label_ta','label_hi'],
  config: ['key','value'],
};

const CONFIG_ROWS = [
  ['site_title_en', 'Anushthanam'],
  ['site_title_te', 'అనుష్ఠానం'],
  ['site_title_ta', 'அனுஷ்டானம்'],
  ['site_title_hi', 'अनुष्ठान'],
  ['default_language', 'en'],
  ['supported_languages', 'en,te,ta,hi'],
  ['spreadsheet_id', spreadsheetId],
  ['isr_revalidate_seconds', '3600'],
  ['panchangam_timezone', 'Asia/Kolkata'],
];

const TAGS_ROWS = [
  ['tradition','shaiva','Shaiva','శైవ','சைவம்','शैव'],
  ['tradition','vaishnava','Vaishnava','వైష్ణవ','வைணவம்','वैष्णव'],
  ['tradition','shakta','Shakta','శాక్త','சாக்தம்','शाक्त'],
  ['tradition','ganapatya','Ganapatya','గాణాపత్య','காணபத்யம்','गाणापत्य'],
  ['tradition','saura','Saura','సౌర','சௌரம்','सौर'],
  ['tradition','kaumara','Kaumara','కౌమార','கௌமாரம்','कौमार'],
  ['tradition','smartha','Smartha','స్మార్త','ஸ்மார்த்தம்','स्मार्त'],
  ['region','andhra-telangana','Andhra & Telangana','ఆంధ్ర & తెలంగాణ','ஆந்திரா & தெலங்கானா','आंध्र & तेलंगाना'],
  ['region','tamil-nadu','Tamil Nadu','తమిళనాడు','தமிழ்நாடு','तमिलनाडु'],
  ['region','pan-india','Pan India','అఖిల భారత','அகில இந்தியா','अखिल भारत'],
  ['region','karnataka','Karnataka','కర్ణాటక','கர்நாடகா','कर्नाटक'],
  ['region','kerala','Kerala','కేరళ','கேரளா','केरल'],
  ['shloka_type','stotra','Stotra','స్తోత్రం','ஸ்தோத்திரம்','स्तोत्र'],
  ['shloka_type','sahasranama','Sahasranama','సహస్రనామం','சஹஸ்ரநாமம்','सहस्रनाम'],
  ['shloka_type','ashtothram','Ashtothram','అష్టోత్తరం','அஷ்டோத்திரம்','अष्टोत्तर'],
  ['shloka_type','dhyanam','Dhyanam','ధ్యానం','த்யானம்','ध्यान'],
  ['shloka_type','kavacham','Kavacham','కవచం','கவசம்','कवच'],
  ['shloka_type','mangalashtakam','Mangalashtakam','మంగళాష్టకం','மங்களாஷ்டகம்','मंगलाष्टक'],
  ['shloka_type','suprabhatam','Suprabhatam','సుప్రభాతం','சுப்ரபாதம்','सुप्रभातम्'],
  ['shloka_type','chalisa','Chalisa','చాలీసా','சாலீஸா','चालीसा'],
  ['occasion_type','daily','Daily','రోజువారీ','தினசரி','दैनिक'],
  ['occasion_type','weekly','Weekly','వారపు','வாராந்திர','साप्ताहिक'],
  ['occasion_type','monthly','Monthly','మాసపు','மாதாந்திர','मासिक'],
  ['occasion_type','festival-specific','Festival Specific','పండుగ నిర్దిష్ట','திருவிழா குறிப்பிட்ட','त्योहार विशिष्ट'],
  ['occasion_type','vratham-specific','Vratham Specific','వ్రత నిర్దిష్ట','விரத குறிப்பிட்ட','व्रत विशिष्ट'],
  ['occasion_type','general','General','సామాన్య','பொது','सामान्य'],
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Get existing sheets
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set(meta.data.sheets?.map(s => s.properties?.title) ?? []);

  const tabNames = Object.keys(TABS);

  // Add missing sheets
  const toAdd = tabNames.filter(name => !existing.has(name));
  if (toAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: toAdd.map(title => ({
          addSheet: { properties: { title } },
        })),
      },
    });
    console.log(`Created tabs: ${toAdd.join(', ')}`);
  }

  // Write headers to each tab
  for (const [tab, headers] of Object.entries(TABS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
    console.log(`Headers written: ${tab}`);
  }

  // Pre-populate config tab
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'config!A2',
    valueInputOption: 'RAW',
    requestBody: { values: CONFIG_ROWS },
  });
  console.log('Config rows written');

  // Pre-populate tags tab
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'tags!A2',
    valueInputOption: 'RAW',
    requestBody: { values: TAGS_ROWS },
  });
  console.log('Tags rows written');

  console.log('\nDone. Spreadsheet is ready.');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
