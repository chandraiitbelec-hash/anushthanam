import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local in dev; Vercel injects env vars directly
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: join(__dirname, '../.env.local') });
} catch {}

const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;

if (!raw || !spreadsheetId) {
  const message = '⚠ Missing GOOGLE_SERVICE_ACCOUNT_KEY or SHEETS_SPREADSHEET_ID';
  if (process.env.VERCEL || process.env.CI) {
    console.error(`${message} — failing build (set VERCEL/CI env vars are present, so a misconfigured deploy must not ship silently broken search)`);
    process.exit(1);
  }
  console.warn(`${message} — writing empty search index (local dev only; this escape hatch is disabled on Vercel/CI)`);
  mkdirSync(join(__dirname, '../public'), { recursive: true });
  writeFileSync(join(__dirname, '../public/search-index.json'), '[]');
  process.exit(0);
}

const credentials = JSON.parse(raw);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Columns this script reads per tab. A renamed column would otherwise
// silently degrade to '' in the built index — assert it exists instead.
const REQUIRED_COLUMNS = {
  gods: ['slug', 'status', 'name_en', 'name_te', 'name_ta', 'name_hi', 'name_sa', 'alternate_names_en'],
  festivals: ['slug', 'status', 'title_en', 'title_te', 'title_ta', 'title_hi', 'alternate_names_en'],
  vrathams: ['slug', 'status', 'title_en', 'title_te', 'title_ta', 'title_hi'],
  shlokas: ['slug', 'status', 'title_en', 'title_te', 'title_ta', 'title_hi', 'type'],
};

// Same bounded exponential backoff as lib/sheets.ts fetchWithRetry — a
// transient 429 must not abort the deploy.
async function fetchWithRetry(tabName) {
  const MAX_RETRIES = 5;
  let delay = 2000;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: client });
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tabName}!A:ZZ`,
      });
      return res.data.values ?? [];
    } catch (err) {
      const status = err?.status ?? err?.code;
      if (status === 429 && attempt < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay * 2, 30000);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to fetch sheet tab "${tabName}" after ${MAX_RETRIES} retries`);
}

async function getPublished(tabName) {
  const values = await fetchWithRetry(tabName);
  if (values.length < 1) return [];
  const [headers, ...rows] = values;

  const required = REQUIRED_COLUMNS[tabName] ?? [];
  const missing = required.filter(c => !headers.includes(c));
  if (missing.length > 0) {
    console.error(`✗ build-search-index: tab "${tabName}" is missing column(s): ${missing.join(', ')} — cannot build search index`);
    process.exit(1);
  }

  return rows
    .map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])))
    .filter(r => r.status === 'published');
}

async function main() {
  const [gods, festivals, vrathams, shlokas] = await Promise.all([
    getPublished('gods'),
    getPublished('festivals'),
    getPublished('vrathams'),
    getPublished('shlokas'),
  ]);

  const index = [
    ...gods.map(g => ({
      id: `god-${g.slug}`, type: 'god',
      name_en: g.name_en, name_te: g.name_te || '', name_ta: g.name_ta || '',
      name_hi: g.name_hi || '', name_sa: g.name_sa || '',
      alternate_names: g.alternate_names_en || '',
      url: `/gods/${g.slug}`,
    })),
    ...festivals.map(f => ({
      id: `festival-${f.slug}`, type: 'festival',
      name_en: f.title_en, name_te: f.title_te || '', name_ta: f.title_ta || '',
      name_hi: f.title_hi || '', alternate_names: f.alternate_names_en || '',
      url: `/festivals/${f.slug}`,
    })),
    ...vrathams.map(v => ({
      id: `vratham-${v.slug}`, type: 'vratham',
      name_en: v.title_en, name_te: v.title_te || '', name_ta: v.title_ta || '',
      name_hi: v.title_hi || '',
      url: `/vrathams/${v.slug}`,
    })),
    ...shlokas.map(s => ({
      id: `shloka-${s.slug}`, type: 'shloka',
      name_en: s.title_en, name_te: s.title_te || '', name_ta: s.title_ta || '',
      name_hi: s.title_hi || '', shloka_type: s.type || '',
      url: `/shlokas/${s.slug}`,
    })),
  ];

  const outDir = join(__dirname, '../public');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(index));
  console.log(`✓ search-index.json: ${index.length} entries`);
}

main().catch(err => { console.error(err); process.exit(1); });
