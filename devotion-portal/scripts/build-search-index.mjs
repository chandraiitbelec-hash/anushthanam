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
  console.warn('⚠ Missing GOOGLE_SERVICE_ACCOUNT_KEY or SHEETS_SPREADSHEET_ID — writing empty search index');
  mkdirSync(join(__dirname, '../public'), { recursive: true });
  writeFileSync(join(__dirname, '../public/search-index.json'), '[]');
  process.exit(0);
}

const credentials = JSON.parse(raw);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function getPublished(tabName) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:ZZ`,
  });
  const values = res.data.values ?? [];
  if (values.length < 1) return [];
  const [headers, ...rows] = values;
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
