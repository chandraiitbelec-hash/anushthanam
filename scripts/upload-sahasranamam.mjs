/**
 * Generic sahasranamam uploader — reads pre-sourced JSON from research/ and
 * appends rows to shloka_stanzas. Handles all 11 sahasranamams.
 *
 * For each slug, reads:
 *   research/<slug>-sourcing.json  — scripts (devanagari/telugu/tamil/iast) + stanza metadata
 *   research/<slug>-meanings.json  — meanings (en/hi/te/ta), if it exists
 *
 * If a meanings file is present, its entries (keyed by field "n") override
 * the meaning fields in the sourcing file. Otherwise the sourcing file's own
 * meaning_en/hi/te/ta fields are used directly.
 *
 * Row column order matches shloka_stanzas schema:
 *   shloka_slug, stanza_number, stanza_label,
 *   script_devanagari, script_telugu, script_tamil, roman_iast,
 *   meaning_en, meaning_te, meaning_ta, meaning_hi, notes_en
 *
 * Usage:
 *   node scripts/upload-sahasranamam.mjs --slug shiva-sahasranamam           (dry run)
 *   node scripts/upload-sahasranamam.mjs --slug shiva-sahasranamam --write   (apply)
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WRITE = parseWriteFlag(process.argv);
const slugArg = process.argv.indexOf('--slug');
if (slugArg === -1 || !process.argv[slugArg + 1]) {
  console.error('Usage: node scripts/upload-sahasranamam.mjs --slug <slug> [--write]');
  process.exit(1);
}
const SLUG = process.argv[slugArg + 1];

const VALID_SLUGS = [
  'shiva-sahasranamam', 'ganesha-sahasranamam', 'lakshmi-sahasranamam',
  'durga-sahasranamam', 'subrahmanya-sahasranamam', 'narasimha-sahasranamam',
  'surya-sahasranamam', 'hanuman-sahasranamam', 'rama-sahasranamam',
  'saraswati-sahasranamam', 'ayyappa-sahasranamam',
];
if (!VALID_SLUGS.includes(SLUG)) {
  console.error(`Unknown slug: "${SLUG}". Valid slugs:\n  ${VALID_SLUGS.join('\n  ')}`);
  process.exit(1);
}

const sourcingPath = resolve(__dirname, `../research/${SLUG}-sourcing.json`);
const meaningsPath = resolve(__dirname, `../research/${SLUG}-meanings.json`);

if (!existsSync(sourcingPath)) {
  console.error(`Sourcing file not found: ${sourcingPath}`);
  process.exit(1);
}

const sourcing = JSON.parse(readFileSync(sourcingPath, 'utf8'));

// Build meanings lookup by stanza_number from meanings file if it exists,
// otherwise fall back to the meaning fields already in the sourcing file.
let meaningsMap = null;
if (existsSync(meaningsPath)) {
  const mf = JSON.parse(readFileSync(meaningsPath, 'utf8'));
  const entries = mf.verses ?? mf.meanings ?? [];
  meaningsMap = new Map(entries.map(e => [e.n, e]));
  console.log(`Meanings file found: ${entries.length} entries`);
} else {
  console.log('No separate meanings file — using sourcing file meanings');
}

// Merge: for each verse in sourcing, pick meanings from the meanings file if available
const rows = sourcing.verses.map(v => {
  const m = meaningsMap?.get(v.stanza_number);
  return {
    stanza_number: v.stanza_number,
    stanza_label: v.stanza_label ?? `Ślōka ${v.stanza_number}`,
    script_devanagari: v.script_devanagari ?? '',
    script_telugu: v.script_telugu ?? '',
    script_tamil: v.script_tamil ?? '',
    roman_iast: v.roman_iast ?? '',
    meaning_en: (m?.meaning_en ?? v.meaning_en) || '',
    meaning_hi: (m?.meaning_hi ?? v.meaning_hi) || '',
    meaning_te: (m?.meaning_te ?? v.meaning_te) || '',
    meaning_ta: (m?.meaning_ta ?? v.meaning_ta) || '',
  };
});

// Structural checks
const missing_scripts = rows.filter(r =>
  !r.script_devanagari || !r.script_telugu || !r.script_tamil || !r.roman_iast
);
if (missing_scripts.length > 0) {
  console.error(`ERROR: ${missing_scripts.length} rows have missing script fields (stanzas: ${missing_scripts.map(r => r.stanza_number).join(', ')})`);
  process.exit(1);
}

console.log(`\nSlug:             ${SLUG}`);
console.log(`Declared count:   ${sourcing.declared_stanza_count}`);
console.log(`Actual count:     ${rows.length}`);
if (rows.length !== sourcing.declared_stanza_count) {
  console.log(`Count note:       ${sourcing.count_reconciliation_note}`);
}
console.log(`Unresolved flags: ${sourcing.unresolved_flags?.length ? sourcing.unresolved_flags.join('; ') : 'none'}`);

// Sample first and last row
const sample = (r) => `  [${r.stanza_number}] ${r.script_devanagari.slice(0, 60)}…`;
console.log(`\nFirst row:\n${sample(rows[0])}`);
console.log(`  meaning_en: ${rows[0].meaning_en?.slice(0, 80) ?? '(blank)'}…`);
console.log(`  meaning_hi: ${rows[0].meaning_hi?.slice(0, 60) ?? '(blank)'}…`);
console.log(`  meaning_te: ${rows[0].meaning_te?.slice(0, 60) ?? '(blank)'}…`);
console.log(`  meaning_ta: ${rows[0].meaning_ta?.slice(0, 60) ?? '(blank)'}…`);
console.log(`Last row:\n${sample(rows[rows.length - 1])}`);

const sheets = await getSheetsClient();

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: 'shloka_stanzas!A:A',
});
const existingCount = (res.data.values || []).slice(1).filter(r => r[0] === SLUG).length;
console.log(`\nExisting rows in sheet for "${SLUG}": ${existingCount}`);

if (!WRITE) {
  console.log('\nDry run — no changes written. Re-run with --write to apply.');
} else {
  if (existingCount > 0) {
    console.error(`Refusing to append: ${existingCount} rows already exist for "${SLUG}". Only handles pure-append (0 existing rows).`);
    process.exit(1);
  }
  const appendRows = rows.map(r => [
    SLUG,
    r.stanza_number,
    r.stanza_label,
    r.script_devanagari,
    r.script_telugu,
    r.script_tamil,
    r.roman_iast,
    r.meaning_en,
    r.meaning_te,
    r.meaning_ta,
    r.meaning_hi,
    '', // notes_en
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: appendRows },
  });
  console.log(`\nAppended ${appendRows.length} rows for "${SLUG}".`);
}
