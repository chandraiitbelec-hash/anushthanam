/**
 * Fetch shloka_stanzas rows for Group B slugs and write to research/<slug>-stanzas.json.
 * Reads columns A:L (slug, stanza_number, label, scripts, meanings, notes).
 *
 * Usage: node scripts/fetch-stanzas-groupB.mjs [--slug <slug>]
 *   --slug <slug>  Only fetch this slug (default: all Group B)
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GROUP_B_SLUGS = [
  'soundarya-lahari',
  'shiv-chalisa',
  'rama-raksha-stotram',
  'mahishasura-mardini-stotram',
];

const slugArg = process.argv.indexOf('--slug');
const SLUGS = slugArg !== -1 && process.argv[slugArg + 1]
  ? [process.argv[slugArg + 1]]
  : GROUP_B_SLUGS;

const { headers: header, rows: dataRows, col } = await getTabWithHeaders('shloka_stanzas');
console.log('Header:', header?.join(' | '));

const cSlug = col('shloka_slug');
const cStanza = col('stanza_number');
const cLabel = col('stanza_label');
const cDeva = col('script_devanagari');
const cTelugu = col('script_telugu');
const cTamil = col('script_tamil');
const cIast = col('roman_iast');
const cMeaningEn = col('meaning_en');
const cMeaningTe = col('meaning_te');
const cMeaningTa = col('meaning_ta');
const cMeaningHi = col('meaning_hi');

const researchDir = resolve(__dirname, '../research');
mkdirSync(researchDir, { recursive: true });

for (const slug of SLUGS) {
  const slugRows = dataRows.filter(r => r[cSlug] === slug);
  const stanzas = slugRows.map(r => ({
    stanza_number: parseInt(r[cStanza], 10),
    stanza_label: r[cLabel] || '',
    script_devanagari: r[cDeva] || '',
    script_telugu: r[cTelugu] || '',
    script_tamil: r[cTamil] || '',
    roman_iast: r[cIast] || '',
    meaning_en: r[cMeaningEn] || '',
    meaning_te: r[cMeaningTe] || '',
    meaning_ta: r[cMeaningTa] || '',
    meaning_hi: r[cMeaningHi] || '',
  }));

  const outPath = resolve(researchDir, `${slug}-stanzas.json`);
  writeFileSync(outPath, JSON.stringify(stanzas, null, 2), 'utf8');
  console.log(`${slug}: ${stanzas.length} stanzas → ${outPath}`);

  const empty_te = stanzas.filter(s => !s.meaning_te).length;
  const empty_ta = stanzas.filter(s => !s.meaning_ta).length;
  const empty_hi = stanzas.filter(s => !s.meaning_hi).length;
  console.log(`  Empty meanings — te: ${empty_te}, ta: ${empty_ta}, hi: ${empty_hi}`);
}
