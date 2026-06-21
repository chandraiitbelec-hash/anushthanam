// Run with: node scripts/populate-ashtothrams.mjs
// Parses deity_ashtothrams.md and populates shlokas + shloka_stanzas tabs

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config({ path: '../.env.local' });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

// Map deity heading to slug
const DEITY_SLUG_MAP = {
  'Lord Ganesha': 'ganesha',
  'Lord Shiva': 'shiva',
  'Goddess Lakshmi': 'lakshmi',
  'Lord Krishna': 'krishna',
  'Lord Rama': 'rama',
  'Lord Venkateswara': 'venkateswara',
  'Lord Hanuman': 'hanuman',
  'Goddess Saraswati': 'saraswati',
  'Goddess Durga': 'durga',
  'Lord Subrahmanya': 'subrahmanya',
  'Lord Vishnu': 'vishnu',
  'Goddess Parvati': 'parvati',
  'Goddess Lalitha': 'lalitha',
  'Goddess Gayatri': 'gayatri',
  'Lord Surya': 'surya',
  'Lord Narasimha': 'narasimha',
  'Lord Ayyappa': 'ayyappa',
  'Lord Shani': 'shani',
  'Sri Sai Baba': 'sai-baba',
  'Lord Chandra': 'chandra',
  'Lord Dattatreya': 'dattatreya',
  'Ganesha Gakara': 'ganesha',   // variant — links to ganesha
  'Sri Satyanarayana': 'satyanarayana',
  'Goddess Annapurna': 'annapurna',
  'Lord Sudarshana': 'sudarshana',
};

// Titles in each language for each deity's ashtothram
const ASHTOTHRAM_TITLES = {
  'ganesha':       { en: 'Sri Ganesha Ashtothram', te: 'శ్రీ గణేశ అష్టోత్తరం', ta: 'ஸ்ரீ கணேஷ அஷ்டோத்திரம்', hi: 'श्री गणेश अष्टोत्तर' },
  'shiva':         { en: 'Sri Shiva Ashtothram', te: 'శ్రీ శివ అష్టోత్తరం', ta: 'ஸ்ரீ சிவ அஷ்டோத்திரம்', hi: 'श्री शिव अष्टोत्तर' },
  'lakshmi':       { en: 'Sri Lakshmi Ashtothram', te: 'శ్రీ లక్ష్మీ అష్టోత్తరం', ta: 'ஸ்ரீ லட்சுமி அஷ்டோத்திரம்', hi: 'श्री लक्ष्मी अष्टोत्तर' },
  'krishna':       { en: 'Sri Krishna Ashtothram', te: 'శ్రీ కృష్ణ అష్టోత్తరం', ta: 'ஸ்ரீ கிருஷ்ண அஷ்டோத்திரம்', hi: 'श्री कृष्ण अष्टोत्तर' },
  'rama':          { en: 'Sri Rama Ashtothram', te: 'శ్రీ రామ అష్టోత్తరం', ta: 'ஸ்ரீ ராம அஷ்டோத்திரம்', hi: 'श्री राम अष्टोत्तर' },
  'venkateswara':  { en: 'Sri Venkateswara Ashtothram', te: 'శ్రీ వేంకటేశ్వర అష్టోత్తరం', ta: 'ஸ்ரீ வேங்கடேஸ்வர அஷ்டோத்திரம்', hi: 'श्री वेंकटेश्वर अष्टोत्तर' },
  'hanuman':       { en: 'Sri Hanuman Ashtothram', te: 'శ్రీ హనుమాన్ అష్టోత్తరం', ta: 'ஸ்ரீ அனுமன் அஷ்டோத்திரம்', hi: 'श्री हनुमान अष्टोत्तर' },
  'saraswati':     { en: 'Sri Saraswati Ashtothram', te: 'శ్రీ సరస్వతీ అష్టోత్తరం', ta: 'ஸ்ரீ சரஸ்வதி அஷ்டோத்திரம்', hi: 'श्री सरस्वती अष्टोत्तर' },
  'durga':         { en: 'Sri Durga Ashtothram', te: 'శ్రీ దుర్గాదేవి అష్టోత్తరం', ta: 'ஸ்ரீ துர்கை அஷ்டோத்திரம்', hi: 'श्री दुर्गा अष्टोत्तर' },
  'subrahmanya':   { en: 'Sri Subrahmanya Ashtothram', te: 'శ్రీ సుబ్రహ్మణ్య అష్టోత్తరం', ta: 'ஸ்ரீ முருகன் அஷ்டோத்திரம்', hi: 'श्री सुब्रह्मण्य अष्टोत्तर' },
  'vishnu':        { en: 'Sri Vishnu Ashtothram', te: 'శ్రీ విష్ణు అష్టోత్తరం', ta: 'ஸ்ரீ விஷ்ணு அஷ்டோத்திரம்', hi: 'श्री विष्णु अष्टोत्तर' },
  'parvati':       { en: 'Sri Parvati Ashtothram', te: 'శ్రీ పార్వతీ అష్టోత్తరం', ta: 'ஸ்ரீ பார்வதி அஷ்டோத்திரம்', hi: 'श्री पार्वती अष्टोत्तर' },
  'lalitha':       { en: 'Sri Lalitha Ashtothram', te: 'శ్రీ లలితాదేవి అష్టోత్తరం', ta: 'ஸ்ரீ லளிதா அஷ்டோத்திரம்', hi: 'श्री ललिता अष्टोत्तर' },
  'gayatri':       { en: 'Sri Gayatri Ashtothram', te: 'శ్రీ గాయత్రీ అష్టోత్తరం', ta: 'ஸ்ரீ காயத்ரி அஷ்டோத்திரம்', hi: 'श्री गायत्री अष्टोत्तर' },
  'surya':         { en: 'Sri Surya Ashtothram', te: 'శ్రీ సూర్య అష్టోత్తరం', ta: 'ஸ்ரீ சூரிய அஷ்டோத்திரம்', hi: 'श्री सूर्य अष्टोत्तर' },
  'narasimha':     { en: 'Sri Narasimha Ashtothram', te: 'శ్రీ నరసింహ అష్టోత్తరం', ta: 'ஸ்ரீ நரசிம்ஹ அஷ்டோத்திரம்', hi: 'श्री नरसिंह अष्टोत्तर' },
  'ayyappa':       { en: 'Sri Ayyappa Ashtothram', te: 'శ్రీ అయ్యప్ప అష్టోత్తరం', ta: 'ஸ்ரீ அய்யப்பன் அஷ்டோத்திரம்', hi: 'श्री अयप्पा अष्टोत्तर' },
  'shani':         { en: 'Sri Shani Ashtothram', te: 'శ్రీ శని అష్టోత్తరం', ta: 'ஸ்ரீ சனீஸ்வர அஷ்டோத்திரம்', hi: 'श्री शनि अष्टोत्तर' },
  'sai-baba':      { en: 'Sri Sai Baba Ashtothram', te: 'శ్రీ సాయి బాబా అష్టోత్తరం', ta: 'ஸ்ரீ சாய் பாபா அஷ்டோத்திரம்', hi: 'श्री साईं बाबा अष्टोत्तर' },
  'chandra':       { en: 'Sri Chandra Ashtothram', te: 'శ్రీ చంద్ర అష్టోత్తరం', ta: 'ஸ்ரீ சந்திர அஷ்டோத்திரம்', hi: 'श्री चंद्र अष्टोत्तर' },
  'dattatreya':    { en: 'Sri Dattatreya Ashtothram', te: 'శ్రీ దత్తాత్రేయ అష్టోత్తరం', ta: 'ஸ்ரீ தத்தாத்ரேய அஷ்டோத்திரம்', hi: 'श्री दत्तात्रेय अष्टोत्तर' },
  'satyanarayana': { en: 'Sri Satyanarayana Ashtothram', te: 'శ్రీ సత్యనారాయణ అష్టోత్తరం', ta: 'ஸ்ரீ சத்யநாராயண அஷ்டோத்திரம்', hi: 'श्री सत्यनारायण अष्टोत्तर' },
  'annapurna':     { en: 'Sri Annapurna Ashtothram', te: 'శ్రీ అన్నపూర్ణా అష్టోత్తరం', ta: 'ஸ்ரீ அன்னபூர்ணா அஷ்டோத்திரம்', hi: 'श्री अन्नपूर्णा अष्टोत्तर' },
  'sudarshana':    { en: 'Sri Sudarshana Ashtothram', te: 'శ్రీ సుదర్శన అష్టోత్తరం', ta: 'ஸ்ரீ சுதர்சன அஷ்டோத்திரம்', hi: 'श्री सुदर्शन अष्टोत्तर' },
};

function parseAshtothrams(markdown) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentDeity = null;
  let inTable = false;
  let tableRows = [];

  for (const line of lines) {
    // Deity heading: ## Lord Ganesha
    const headingMatch = line.match(/^## (.+)$/);
    if (headingMatch) {
      if (currentDeity && tableRows.length > 0) {
        sections.push({ deity: currentDeity, rows: tableRows });
      }
      currentDeity = headingMatch[1].trim();
      inTable = false;
      tableRows = [];
      continue;
    }

    // Table row: | 1 | text | text | text | text |
    const tableRowMatch = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (tableRowMatch) {
      tableRows.push({
        num: parseInt(tableRowMatch[1]),
        iast: tableRowMatch[2].trim(),
        telugu: tableRowMatch[3].trim(),
        devanagari: tableRowMatch[4].trim(),
        tamil: tableRowMatch[5].trim(),
      });
    }
  }

  // Push last section
  if (currentDeity && tableRows.length > 0) {
    sections.push({ deity: currentDeity, rows: tableRows });
  }

  return sections;
}

async function main() {
  const mdPath = process.env.HOME + '/Downloads/deity_ashtothrams.md';
  const markdown = readFileSync(mdPath, 'utf-8');
  const sections = parseAshtothrams(markdown);

  console.log(`Parsed ${sections.length} deity sections`);

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const shlokaRows = [];
  const stanzaRows = [];
  const seenSlugs = new Set();

  for (const section of sections) {
    const deitySlug = DEITY_SLUG_MAP[section.deity];
    if (!deitySlug) {
      console.warn(`No slug mapping for: ${section.deity}`);
      continue;
    }

    // Use ganesha-gakara as separate slug if it's the Gakara variant
    const shlokaSlug = section.deity === 'Ganesha Gakara'
      ? 'ganesha-gakara-ashtothram'
      : `${deitySlug}-ashtothram`;

    if (seenSlugs.has(shlokaSlug)) {
      console.log(`Skipping duplicate: ${shlokaSlug}`);
      continue;
    }
    seenSlugs.add(shlokaSlug);

    const titles = ASHTOTHRAM_TITLES[deitySlug] || { en: `Sri ${section.deity} Ashtothram`, te: '', ta: '', hi: '' };

    shlokaRows.push([
      shlokaSlug,
      titles.en, titles.te, titles.ta, titles.hi,
      'ashtothram',
      deitySlug,
      '', // source_scripture_en
      'sanskrit',
      `The 108 sacred names of ${section.deity}, recited for blessings and devotion.`,
      '', '', '', // brief intros in other languages
      '', // audio_drive_id
      'published',
      'en-only',
    ]);

    for (const row of section.rows) {
      stanzaRows.push([
        shlokaSlug,
        row.num,
        '', // stanza_label
        row.devanagari,
        row.telugu,
        row.tamil,
        row.iast,
        '', '', '', '', '', // meanings + notes
      ]);
    }
  }

  // Write shlokas
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'shlokas!A2',
    valueInputOption: 'RAW',
    requestBody: { values: shlokaRows },
  });
  console.log(`Written ${shlokaRows.length} shlokas`);

  // Write stanzas in batches of 500
  const BATCH = 500;
  let offset = 2;
  for (let i = 0; i < stanzaRows.length; i += BATCH) {
    const batch = stanzaRows.slice(i, i + BATCH);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `shloka_stanzas!A${offset}`,
      valueInputOption: 'RAW',
      requestBody: { values: batch },
    });
    offset += batch.length;
    console.log(`Written stanzas ${i + 1}–${Math.min(i + BATCH, stanzaRows.length)}`);
  }

  console.log(`\nTotal stanzas: ${stanzaRows.length}`);
  console.log('Done.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
