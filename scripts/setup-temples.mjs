/**
 * One-shot script: sets up the `temples` entity and migrates `live_streams`
 * to reference it, for the 3 temples already seeded in live_streams
 * (ttd-tirumala, siddhivinayak-mumbai, kashi-vishwanath).
 *
 * What it does:
 *   1. Creates the `temples` tab with headers (if missing).
 *   2. Appends 3 temple rows — name/location only, copied from the existing
 *      live_streams rows. etymology/history/significance/official_website_url
 *      are left blank; a separate research thread is sourcing that content.
 *   3. Appends god_links rows (entity_type 'temple') for each temple's
 *      presiding deity.
 *   4. Adds a `temple_slug` column header to live_streams (if missing) and
 *      backfills it for the 3 existing rows (temple_slug === live_streams.slug
 *      here, since the temples tab reuses the same slugs).
 *
 * Does NOT touch or remove the old temple_name_en/te/ta/hi, location_en/te/ta/hi,
 * deity_slug columns on live_streams — those become dead columns, safe for
 * manual cleanup later (see CLAUDE.md / task notes).
 *
 * Usage:
 *   node scripts/setup-temples.mjs          (dry run — default)
 *   node scripts/setup-temples.mjs --write  (apply)
 *
 * Safe to re-run — checks existing state before writing.
 */

import { getSheetsClient, SPREADSHEET_ID as SHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);

const TEMPLES_HEADERS = [
  'slug', 'name_en', 'name_te', 'name_ta', 'name_hi',
  'etymology_en', 'etymology_te', 'etymology_ta', 'etymology_hi',
  'history_en', 'history_te', 'history_ta', 'history_hi',
  'significance_en', 'significance_te', 'significance_ta', 'significance_hi',
  'location_en', 'location_te', 'location_ta', 'location_hi',
  'official_website_url', 'display_order', 'status', 'translation_status',
];

// name/location copied verbatim from the existing live_streams rows (see
// scripts/seed-live-streams.mjs) — no new facts invented here.
const TEMPLE_ROWS = [
  {
    slug: 'ttd-tirumala',
    name_en: 'Tirumala Venkateswara Temple (TTD)',
    name_te: 'తిరుమల వేంకటేశ్వర దేవస్థానం',
    name_ta: 'திருமலை வெங்கடேஸ்வரர் கோயில் (TTD)',
    name_hi: 'तिरुमला वेंकटेश्वर मंदिर',
    etymology_en: '', etymology_te: '', etymology_ta: '', etymology_hi: '',
    history_en: '', history_te: '', history_ta: '', history_hi: '',
    significance_en: '', significance_te: '', significance_ta: '', significance_hi: '',
    location_en: 'Tirumala, Tirupati, Andhra Pradesh',
    location_te: 'తిరుమల, తిరుపతి, ఆంధ్రప్రదేశ్',
    location_ta: 'திருமலை, திருப்பதி, ஆந்திரப் பிரதேசம்',
    location_hi: 'तिरुमला, तिरुपति, आंध्र प्रदेश',
    official_website_url: '',
    display_order: 1,
    status: 'published',
    translation_status: 'partial',
  },
  {
    slug: 'siddhivinayak-mumbai',
    name_en: 'Shree Siddhivinayak Ganapati Temple',
    name_te: 'శ్రీ సిద్ధి వినాయక గణపతి దేవాలయం',
    name_ta: 'ஸ்ரீ சித்தி விநாயகர் கணபதி கோயில்',
    name_hi: 'श्री सिद्धिविनायक गणपती मंदिर',
    etymology_en: '', etymology_te: '', etymology_ta: '', etymology_hi: '',
    history_en: '', history_te: '', history_ta: '', history_hi: '',
    significance_en: '', significance_te: '', significance_ta: '', significance_hi: '',
    location_en: 'Prabhadevi, Mumbai, Maharashtra',
    location_te: 'ప్రభాదేవి, ముంబై, మహారాష్ట్ర',
    location_ta: 'பிரபாதேவி, மும்பை, மகாராஷ்டிரா',
    location_hi: 'प्रभादेवी, मुंबई, महाराष्ट्र',
    official_website_url: '',
    display_order: 2,
    status: 'published',
    translation_status: 'partial',
  },
  {
    slug: 'kashi-vishwanath',
    name_en: 'Shree Kashi Vishwanath Temple',
    name_te: 'శ్రీ కాశీ విశ్వనాథ దేవాలయం',
    name_ta: 'ஸ்ரீ காசி விஸ்வநாதர் கோயில்',
    name_hi: 'श्री काशी विश्वनाथ मंदिर',
    etymology_en: '', etymology_te: '', etymology_ta: '', etymology_hi: '',
    history_en: '', history_te: '', history_ta: '', history_hi: '',
    significance_en: '', significance_te: '', significance_ta: '', significance_hi: '',
    location_en: 'Varanasi, Uttar Pradesh',
    location_te: 'వారణాసి, ఉత్తర ప్రదేశ్',
    location_ta: 'வாரணாசி, உத்தரப் பிரதேசம்',
    location_hi: 'वाराणसी, उत्तर प्रदेश',
    official_website_url: '',
    display_order: 3,
    status: 'published',
    translation_status: 'partial',
  },
];

// One row per temple's presiding deity, verified against the live gods tab
// (see conversation) — venkateswara / ganesha / shiva all exist there.
const GOD_LINK_ROWS = [
  { god_slug: 'venkateswara', entity_type: 'temple', entity_slug: 'ttd-tirumala', display_order: 1 },
  { god_slug: 'ganesha', entity_type: 'temple', entity_slug: 'siddhivinayak-mumbai', display_order: 1 },
  { god_slug: 'shiva', entity_type: 'temple', entity_slug: 'kashi-vishwanath', display_order: 1 },
];

const sheets = await getSheetsClient();

console.log('\n══ setup-temples.mjs ══════════════════════════════════');
console.log(`Mode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN (pass --write to apply)'}`);

async function getSpreadsheetMeta() {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  return res.data;
}

async function getSheetValues(tab, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!${range}`,
  });
  return res.data.values ?? [];
}

async function writeValues(tab, range, values) {
  if (!WRITE) {
    console.log(`  [DRY] ${tab}!${range} ←`, JSON.stringify(values[0]).slice(0, 100));
    return;
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tab}!${range}`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  console.log(`  ✓ wrote ${tab}!${range}`);
}

async function appendRows(tab, headers, rows) {
  const values = rows.map(row => headers.map(h => String(row[h] ?? '')));
  if (!WRITE) {
    console.log(`  [DRY] would append ${values.length} row(s) to ${tab}:`);
    for (const row of rows) {
      console.log(`    ${JSON.stringify(row).slice(0, 140)}`);
    }
    return;
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  console.log(`  ✓ appended ${values.length} row(s) to ${tab}`);
}

// Sheets caps a tab's grid to its declared columnCount (defaults to 26 = Z)
// regardless of how many header cells you try to write past it — writing to
// e.g. AA1 on a 26-column grid 400s with "exceeds grid limits" until the grid
// itself is expanded via appendDimension.
async function ensureColumnCapacity(tab, neededCols) {
  const sheetMeta = meta.sheets?.find(s => s.properties?.title === tab);
  if (!sheetMeta) return;
  const currentCols = sheetMeta.properties?.gridProperties?.columnCount ?? 0;
  if (currentCols >= neededCols) return;
  const toAdd = neededCols - currentCols;
  if (!WRITE) {
    console.log(`  [DRY] would expand ${tab} grid columns from ${currentCols} to ${neededCols}`);
    return;
  }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{ appendDimension: { sheetId: sheetMeta.properties.sheetId, dimension: 'COLUMNS', length: toAdd } }],
    },
  });
  console.log(`  ✓ expanded ${tab} grid columns from ${currentCols} to ${neededCols}`);
}

async function ensureTab(title, existingTabs) {
  if (existingTabs.has(title)) {
    console.log(`  '${title}' tab exists`);
    return;
  }
  if (!WRITE) {
    console.log(`  [DRY] would create tab: ${title}`);
    return;
  }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
  console.log(`  ✓ created tab: ${title}`);
}

// ── step 1 & 2: temples tab + 3 rows ──────────────────────────────────────────

console.log('\n── Step 1: temples tab ──');
const meta = await getSpreadsheetMeta();
const existingTabs = new Set(meta.sheets?.map(s => s.properties?.title) ?? []);
await ensureTab('temples', existingTabs);
await writeValues('temples', 'A1', [TEMPLES_HEADERS]);

console.log('\n── Step 2: seed 3 temple rows (name/location only) ──');
if (existingTabs.has('temples')) {
  const existingRows = await getSheetValues('temples', 'A:A');
  const existingSlugs = new Set(existingRows.slice(1).map(r => r[0]));
  const toAdd = TEMPLE_ROWS.filter(r => !existingSlugs.has(r.slug));
  if (toAdd.length === 0) {
    console.log('  all 3 temple rows already present — skip');
  } else {
    await appendRows('temples', TEMPLES_HEADERS, toAdd);
  }
} else {
  await appendRows('temples', TEMPLES_HEADERS, TEMPLE_ROWS);
}

// ── step 3: god_links rows ─────────────────────────────────────────────────

console.log('\n── Step 3: god_links rows (entity_type=temple) ──');
const { headers: glHeaders, rows: glDataRows } = await getTabWithHeaders('god_links');
const existingGodLinks = new Set(
  glDataRows.map(r => `${r[0]}|${r[1]}|${r[2]}`)
);
const godLinksToAdd = GOD_LINK_ROWS.filter(
  r => !existingGodLinks.has(`${r.god_slug}|${r.entity_type}|${r.entity_slug}`)
);
if (godLinksToAdd.length === 0) {
  console.log('  all 3 god_links rows already present — skip');
} else {
  await appendRows('god_links', glHeaders, godLinksToAdd);
}

// ── step 4: live_streams temple_slug column + backfill ────────────────────

console.log('\n── Step 4: live_streams — add + backfill temple_slug ──');
const { headers: lsHeaders } = await getTabWithHeaders('live_streams');
let templeSlugCol = lsHeaders.indexOf('temple_slug');

if (templeSlugCol !== -1) {
  console.log(`  'temple_slug' column already exists at col ${templeSlugCol + 1}`);
} else {
  const newCol = colLetter(lsHeaders.length);
  console.log(`  appending 'temple_slug' at col ${newCol} (index ${lsHeaders.length + 1})`);
  await ensureColumnCapacity('live_streams', lsHeaders.length + 1);
  await writeValues('live_streams', `${newCol}1`, [['temple_slug']]);
  templeSlugCol = lsHeaders.length;
}

const { rows: lsDataRows, col: lsCol } = await getTabWithHeaders('live_streams');
let slugCol;
try {
  slugCol = lsCol('slug');
} catch {
  console.log('  ⚠ slug column not found on live_streams — cannot backfill.');
}

if (slugCol !== undefined) {
  const templeSlugsBySlug = new Set(TEMPLE_ROWS.map(r => r.slug));
  for (let i = 0; i < lsDataRows.length; i++) {
    const row = lsDataRows[i];
    const slug = row[slugCol] ?? '';
    const current = row[templeSlugCol] ?? '';
    if (!templeSlugsBySlug.has(slug)) {
      console.log(`  ${slug || '(no slug)'}: not one of the 3 scoped temples — skip`);
      continue;
    }
    if (current === slug) {
      console.log(`  ${slug}: temple_slug already '${current}' — skip`);
      continue;
    }
    const sheetRow = i + 2;
    console.log(`  ${slug}: temple_slug '${current || '(empty)'}' → '${slug}' (row ${sheetRow})`);
    await writeValues('live_streams', `${colLetter(templeSlugCol)}${sheetRow}`, [[slug]]);
  }
}

console.log('\n══ Done ══════════════════════════════════════════════════════');
if (!WRITE) console.log('Run with --write to apply changes.');
