import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const dotenv = await import('dotenv');
dotenv.config({ path: join(__dirname, '../.env.local') });

const { getPublished } = await import('../lib/sheets.js');

async function main() {
  const [gods, festivals, vrathams, shlokas] = await Promise.all([
    getPublished('gods'),
    getPublished('festivals'),
    getPublished('vrathams'),
    getPublished('shlokas'),
  ]);

  const index = [
    ...gods.map(g => ({
      id: `god-${g.slug}`,
      type: 'god',
      name_en: g.name_en,
      name_te: g.name_te || '',
      name_ta: g.name_ta || '',
      name_hi: g.name_hi || '',
      name_sa: g.name_sa || '',
      alternate_names: g.alternate_names_en || '',
      url: `/gods/${g.slug}`,
      illustration_drive_id: g.image_drive_id || '',
    })),
    ...festivals.map(f => ({
      id: `festival-${f.slug}`,
      type: 'festival',
      name_en: f.title_en,
      name_te: f.title_te || '',
      name_ta: f.title_ta || '',
      name_hi: f.title_hi || '',
      alternate_names: f.alternate_names_en || '',
      url: `/festivals/${f.slug}`,
      illustration_drive_id: f.illustration_drive_id || '',
    })),
    ...vrathams.map(v => ({
      id: `vratham-${v.slug}`,
      type: 'vratham',
      name_en: v.title_en,
      name_te: v.title_te || '',
      name_ta: v.title_ta || '',
      name_hi: v.title_hi || '',
      url: `/vrathams/${v.slug}`,
    })),
    ...shlokas.map(s => ({
      id: `shloka-${s.slug}`,
      type: 'shloka',
      name_en: s.title_en,
      name_te: s.title_te || '',
      name_ta: s.title_ta || '',
      name_hi: s.title_hi || '',
      shloka_type: s.type || '',
      url: `/shlokas/${s.slug}`,
    })),
  ];

  const outDir = join(__dirname, '../public');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(index));
  console.log(`✓ search-index.json written with ${index.length} entries`);
}

main().catch(err => { console.error(err); process.exit(1); });
