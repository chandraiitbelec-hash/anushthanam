// Run with: node scripts/populate-stories.mjs
// Parses festival_stories.md + vratam_stories.md
// Stores content in stories_index + stories_content tabs (no Docs API needed)

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../../.env.local') });

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const FESTIVAL_SLUGS = {
  'Ganesh Chaturthi': 'ganesh-chaturthi',
  'Maha Shivaratri': 'maha-shivaratri',
  'Diwali (Deepavali)': 'diwali',
  'Navaratri & Dussehra': 'navaratri',
};

const VRATHAM_SLUGS = {
  'Sri Satyanarayana Vratam': 'satyanarayana',
  'Varalakshmi Vratam': 'varalakshmi',
};

function parseStoriesFile(markdown, slugMap, entityType) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentSlug = null;
  let currentHeading = null;
  let state = null;
  let currentLang = null;
  let currentStory = null;
  let buffer = [];
  const significance = { en: [], te: [], ta: [], hi: [] };
  const stories = [];

  function flushBuffer() {
    if (!currentLang || !buffer.length) return;
    const text = buffer.join(' ').trim();
    if (!text) return;
    if (state === 'significance') {
      significance[currentLang].push(text);
    } else if (state === 'story' && currentStory) {
      // Split double-newlines into paragraphs
      const parts = buffer.join('\n').split(/\n\n+/).map(p => p.trim()).filter(Boolean);
      currentStory.body[currentLang].push(...parts);
    }
    buffer = [];
  }

  function flushStory() {
    if (currentStory) { stories.push(currentStory); currentStory = null; }
  }

  function flushSection() {
    flushBuffer();
    flushStory();
    if (currentSlug) {
      sections.push({
        slug: currentSlug, entityType, headingEn: currentHeading,
        significance: { en: significance.en.join(' '), te: significance.te.join(' '), ta: significance.ta.join(' '), hi: significance.hi.join(' ') },
        stories: [...stories],
      });
    }
    significance.en = []; significance.te = []; significance.ta = []; significance.hi = [];
    stories.length = 0;
    state = null; currentLang = null; currentStory = null;
  }

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      flushSection();
      const raw = h2[1].split('|')[0].trim();
      currentHeading = raw;
      currentSlug = slugMap[raw];
      if (!currentSlug) console.warn(`No slug for: "${raw}"`);
      continue;
    }
    if (!currentSlug) continue;

    if (line.match(/^### Significance/i) || line.match(/^### Vratam Chapters/i)) {
      flushBuffer(); state = 'significance'; continue;
    }

    const h4 = line.match(/^#### (.+)$/);
    if (h4) {
      flushBuffer(); flushStory(); state = 'story';
      const parts = h4[1].split('|').map(p => p.trim());
      currentStory = {
        title: { en: parts[0] || '', te: parts[1] || parts[0] || '', ta: parts[3] || parts[0] || '', hi: parts[2] || parts[0] || '' },
        body: { en: [], te: [], ta: [], hi: [] },
      };
      currentLang = null; continue;
    }

    const h5 = line.match(/^##### (.+)$/);
    if (h5) {
      flushBuffer();
      const l = h5[1].trim().toLowerCase();
      currentLang = l === 'english' ? 'en' : l === 'telugu' ? 'te' : l === 'hindi' ? 'hi' : l === 'tamil' ? 'ta' : null;
      continue;
    }

    const inline = line.match(/^\*\*(English|Telugu|Hindi|Tamil)\*\*:\s*(.+)$/i);
    if (inline && state === 'significance') {
      const l = inline[1].toLowerCase();
      const lk = l === 'english' ? 'en' : l === 'telugu' ? 'te' : l === 'hindi' ? 'hi' : 'ta';
      significance[lk].push(inline[2].trim());
      continue;
    }

    if (line.match(/^---+$/) || line.match(/^#/)) continue;

    if (currentLang && (state === 'significance' || state === 'story')) {
      if (line.trim()) buffer.push(line.trim());
      else if (buffer.length) { buffer.push(''); }
    }
  }

  flushSection();
  return sections;
}

async function ensureTab(sheets, tabName, headers) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets.find(s => s.properties.title === tabName);
  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
    console.log(`Created tab: ${tabName}`);
  }
}

async function expandSheet(sheets, tabName, neededRows) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find(s => s.properties.title === tabName);
  if (sheet && (sheet.properties.gridProperties.rowCount || 0) < neededRows) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: { sheetId: sheet.properties.sheetId, gridProperties: { rowCount: neededRows } },
            fields: 'gridProperties.rowCount',
          },
        }],
      },
    });
  }
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const festMd = readFileSync(process.env.HOME + '/Downloads/festival_stories.md', 'utf-8');
  const vratMd = readFileSync(process.env.HOME + '/Downloads/vratam_stories.md', 'utf-8');

  const sections = [
    ...parseStoriesFile(festMd, FESTIVAL_SLUGS, 'festival'),
    ...parseStoriesFile(vratMd, VRATHAM_SLUGS, 'vratham'),
  ];
  console.log(`Parsed ${sections.length} sections`);

  // Ensure stories_content tab exists
  await ensureTab(sheets, 'stories_content', [
    'story_slug', 'lang', 'paragraph_num', 'text',
  ]);

  const indexRows = [];
  const contentRows = [];

  for (const section of sections) {
    if (!section.slug) continue;
    console.log(`  ${section.slug}: ${section.stories.length} stories`);

    for (let si = 0; si < section.stories.length; si++) {
      const story = section.stories[si];
      const storySlug = section.stories.length === 1
        ? `${section.slug}-katha`
        : `${section.slug}-story-${si + 1}`;

      indexRows.push([
        storySlug,
        story.title.en, story.title.te, story.title.ta, story.title.hi,
        section.slug,
        section.entityType === 'festival' ? 'mahatmya' : 'vrata-katha',
        '', '', // source_scripture_en, reading_instruction_en
        section.significance.en, section.significance.te,
        section.significance.ta, section.significance.hi,
        '', '', '', '', // gdoc_id_en/te/ta/hi — empty, content is in stories_content
        'published',
        'en-only',
      ]);

      for (const lang of ['en', 'te', 'ta', 'hi']) {
        story.body[lang].forEach((para, idx) => {
          contentRows.push([storySlug, lang, idx + 1, para]);
        });
      }
    }
  }

  // Expand and write stories_index
  await expandSheet(sheets, 'stories_index', indexRows.length + 10);
  await sheets.spreadsheets.values.update({
    spreadsheetId, range: 'stories_index!A2',
    valueInputOption: 'RAW', requestBody: { values: indexRows },
  });
  console.log(`✓ stories_index: ${indexRows.length} rows`);

  // Expand and write stories_content
  await expandSheet(sheets, 'stories_content', contentRows.length + 10);
  const BATCH = 500;
  for (let i = 0; i < contentRows.length; i += BATCH) {
    await sheets.spreadsheets.values.update({
      spreadsheetId, range: `stories_content!A${i + 2}`,
      valueInputOption: 'RAW', requestBody: { values: contentRows.slice(i, i + BATCH) },
    });
  }
  console.log(`✓ stories_content: ${contentRows.length} paragraphs`);
  console.log('Done.');
}

main().catch(err => { console.error(err.message || err); process.exit(1); });
