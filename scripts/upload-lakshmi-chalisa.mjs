/**
 * Uploads Lakshmi Chalisa (Hindi devotional tradition, attributed to
 * Ramdas per its own closing colophon doha) to shloka_stanzas.
 * Source: the codex doc `codex/chalisa docs/lakshmi-chalisa-multilingual.md`
 * -- Hindi (Devanagari) text sourced from SanskritDocuments.org's Hindi
 * editions, with a unique, per-stanza English/Hindi/Telugu/Tamil meaning
 * composed directly from that Devanagari for every doha and chaupai (not a
 * repeated theme-level summary).
 *
 * Only the Devanagari padas and the four meanings are taken from that doc;
 * Telugu, Tamil, and IAST are regenerated here from the Devanagari via
 * Sanscript / lib-tamil-superscript.mjs, for the same transliteration-
 * convention consistency (candrabindu/nukta fixes, macron convention) used
 * by every other stotra on this site, rather than reusing the doc's own
 * independently-authored scripts.
 *
 * Verse-count reconciliation: the traditional structure is 2 opening dohas
 * + 40 chaupais + 2 closing dohas = 44 verses total. The site's declared
 * stanza_count is 42. Rather than drop verified content, both doha pairs --
 * each conventionally printed/recited as a single unit with no chaupai in
 * between -- are combined into ONE row apiece ("Doha (Opening)", "Doha
 * (Closing)"), mirroring upload-hanuman-chalisa.mjs (opening merge) and
 * upload-shiv-chalisa.mjs (closing merge) combined. All 44 traditional
 * verse-lines are present, spread across exactly 42 database rows.
 *
 * IAST note: candrabindu occurs in this text (16 instances) and is fixed
 * per the standard tihu~->tihũ style correction. No nukta consonants
 * (ड़/ढ़) occur. The rāma/nāma/dhāma standalone schwa-deletion map is
 * carried over defensively from upload-hanuman-chalisa.mjs; none of those
 * three words occur standalone in this text, so it has no effect here.
 *
 * Editorial-marker note: the second opening doha carries the source
 * edition's own "॥ टेक॥" (teka/refrain) annotation, marking that line as a
 * repeated refrain -- not devotional text itself. Stripped from the stored
 * content by lib-parse-chalisa-md.mjs's stripTrailingDanda(), the same way
 * chaupai numerals (॥१॥ etc.) are excluded from stored text everywhere on
 * this site and regenerated as clean punctuation instead.
 *
 * meaning_en/meaning_hi/meaning_te/meaning_ta are all populated from the
 * doc's per-stanza meanings, matching upload-krishna-chalisa.mjs.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-lakshmi-chalisa.mjs          (dry run)
 *      node scripts/upload-lakshmi-chalisa.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { parseChalisaDoc, mergeDohas } from './lib-parse-chalisa-md.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'lakshmi-chalisa';
const DOC_PATH = '/Users/ChandraKanth/Documents/dev_experiments/codex/chalisa docs/lakshmi-chalisa-multilingual.md';

const doc = parseChalisaDoc(DOC_PATH);

if (doc.opening.length !== 2) throw new Error(`Expected 2 opening dohas, got ${doc.opening.length}`);
if (doc.chaupais.length !== 40) throw new Error(`Expected 40 chaupais, got ${doc.chaupais.length}`);
if (doc.closing.length !== 2) throw new Error(`Expected 2 closing dohas, got ${doc.closing.length}`);

const OPEN_DOHA = mergeDohas(doc.opening, 'Doha (Opening)');
const CLOSE_DOHA = mergeDohas(doc.closing, 'Doha (Closing)');
const CHAUPAIS = doc.chaupais.map((c, i) => ({
  n: i + 1, label: `Chaupai ${i + 1}`, padas: c.hindiLines,
  meaningEn: c.meaningEn, meaningHi: c.meaningHi, meaningTe: c.meaningTe, meaningTa: c.meaningTa,
}));

const ITEMS = [OPEN_DOHA, ...CHAUPAIS, CLOSE_DOHA];
if (ITEMS.length !== 42) throw new Error(`Expected 42 stanza rows, got ${ITEMS.length}`);
if (OPEN_DOHA.padas.length !== 4) throw new Error(`Opening doha: expected 4 padas, got ${OPEN_DOHA.padas.length}`);
if (CLOSE_DOHA.padas.length !== 4) throw new Error(`Closing doha: expected 4 padas, got ${CLOSE_DOHA.padas.length}`);
CHAUPAIS.forEach((c, i) => {
  if (c.padas.length !== 2) throw new Error(`Chaupai ${c.n}: expected 2 padas, got ${c.padas.length}`);
});
console.log('Structure check passed: 1 opening doha (4 padas, merged from 2) + 40 chaupais (2 padas each) + 1 closing doha (4 padas, merged from 2) = 42 rows.\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}
function fixCandrabindu(iast) {
  return iast.replace(/([aāiīuūeēoō])~/g, (_, v) => v + '̃');
}
function stripNukta(deva) {
  return deva.replace(/़/g, '');
}
const SCHWA_DELETED = { rāma: 'rām', nāma: 'nām', dhāma: 'dhām' };
function hindiSchwa(iast) {
  return iast.split(' ').map(tok => SCHWA_DELETED[tok] || tok).join(' ');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

function toRow(item, stanzaNumber, devaPadas) {
  return {
    stanza_number: stanzaNumber,
    stanza_label: item.label,
    script_devanagari: devaPadas.join('|'),
    script_telugu: item.padas.map(p => Sanscript.t(stripNukta(p), 'devanagari', 'telugu')).join('|'),
    script_tamil: item.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: item.padas.map(p => hindiSchwa(addMacrons(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: item.meaningEn,
    meaning_te: item.meaningTe,
    meaning_ta: item.meaningTa,
    meaning_hi: item.meaningHi,
  };
}

const rows = [];

// Row 1: opening doha (both traditional opening dohas combined; no numeral)
{
  const devaPadas = [...OPEN_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  devaPadas[2] += ' ।';
  devaPadas[3] += ' ॥';
  rows.push(toRow(OPEN_DOHA, 1, devaPadas));
}

// Rows 2-41: chaupai 1-40 (Devanagari numeral is the TRADITIONAL chaupai
// number, e.g. ॥१॥..॥४०॥, not the row's own stanza_number)
CHAUPAIS.forEach((c, i) => {
  const devaPadas = [...c.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ` ॥${toDevNumeral(c.n)}॥`;
  rows.push(toRow(c, i + 2, devaPadas));
});

// Row 42: closing doha (both traditional closing dohas combined; no numeral)
{
  const devaPadas = [...CLOSE_DOHA.padas];
  devaPadas[0] += ' ।';
  devaPadas[1] += ' ॥';
  devaPadas[2] += ' ।';
  devaPadas[3] += ' ॥';
  rows.push(toRow(CLOSE_DOHA, 42, devaPadas));
}

console.log('Sample (rows 1, 2, 21, 41, 42):\n');
[0, 1, 20, 40, 41].forEach(i => console.log(rows[i], '\n'));

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:A' });
const existingCount = (res.data.values || []).slice(1).filter(r => r[0] === SLUG).length;
console.log(`Existing shloka_stanzas rows for "${SLUG}": ${existingCount}`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  if (existingCount > 0) {
    console.error(`Refusing to append: ${existingCount} rows already exist for "${SLUG}". This script only handles the pure-append (0 existing rows) case.`);
    process.exit(1);
  }
  const appendRows = rows.map(r => [
    SLUG, r.stanza_number, r.stanza_label, r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
    r.meaning_en, r.meaning_te, r.meaning_ta, r.meaning_hi, '',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: appendRows },
  });
  console.log(`Appended ${appendRows.length} rows for "${SLUG}".`);
}
