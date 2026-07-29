/**
 * Uploads the Annamacharya Keertanas collection (slug:
 * annamacharya-keertana-collection) to shloka_stanzas, one row at a time in
 * a sequential awaited loop -- work on one keertana fully (author, write,
 * verify) before moving to the next. Resumable: on restart, skips any
 * keertana whose stanzas are already present in the sheet.
 *
 * Reads verified content from research/annamacharya-keertana-collection.json
 * (Telugu text sourced from Telugu Wikisource raw wikitext, cross-checked
 * against stotranidhi.com / annamacharya-lyrics.blogspot.com -- see that
 * file's sourcing_note and per-keertana source_urls for details).
 *
 * Unlike the usual Sanskrit-primary pipeline (Devanagari hand-authored,
 * Telugu/Tamil/IAST derived from it), these are TELUGU-original
 * compositions -- Telugu is the hand-authored/verified field, and
 * Devanagari, Tamil, and IAST are derived FROM Telugu via
 * Sanscript.t(text, 'telugu', ...) and the Tamil superscript converter.
 * The one exception is "Bhavayami Gopalabalam", a Sanskrit-language
 * composition transmitted in Telugu script -- handled the same
 * derivation path, since Sanskrit phonology maps losslessly through
 * Telugu script (unlike genuinely Telugu vernacular words).
 *
 * IAST macron convention for the 5 Telugu-language keertanas: Sanscript's
 * telugu->iast scheme marks SHORT e/o with a grave accent (e.g. "ò") and
 * leaves LONG e/o bare ("o") -- the opposite polarity of standard Dravidian
 * IAST convention (short unmarked, long macroned). addTeluguMacrons() below
 * swaps polarity: bare e/o -> macron ē/ō (long), grave è/ò -> bare e/o
 * (short). For the one Sanskrit-language keertana, plain e/o are always
 * long in Sanskrit, so the site's usual blanket e->ē/o->ō rule is used
 * instead (verified the source text contains no short-e/o Telugu vowel
 * signs, only long/inherent ones).
 *
 * No Devanagari verse-ending numerals (॥N॥) are added -- unlike Sanskrit
 * slokas/chalisas, the source Wikisource texts for these keertanas carry no
 * such numbering convention; stanza_label (Pallavi / Charanam N) already
 * identifies structure unambiguously.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-annamacharya-keertanas.mjs          (dry run)
 *      node scripts/upload-annamacharya-keertanas.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './archive/lib-tamil-superscript.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'annamacharya-keertana-collection';

const dataPath = resolve(__dirname, '../research/annamacharya-keertana-collection.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

// Sanscript's telugu->iast scheme renders retroflex ళ as "l" + COMBINING
// DIAERESIS BELOW (U+0324) instead of the standard precomposed ḷ (U+1E37,
// l + COMBINING DOT BELOW) that the rest of this site's IAST data uses
// (e.g. lib/data/stanzas/subrahmanya-bhujangam.json's "kḷpta"). Fix it up.
function fixRetroflexL(iast) {
  return iast.replace(/l̤/g, 'ḷ');
}

function addTeluguMacrons(iast) {
  // Sanscript's telugu->iast scheme: short e/o -> grave (è/ò), long e/o -> bare (e/o).
  // Site's Dravidian-text convention: short unmarked, long macroned. Swap polarity.
  iast = fixRetroflexL(iast);
  let out = '';
  for (const ch of iast) {
    if (ch === 'è') out += 'e';
    else if (ch === 'ò') out += 'o';
    else if (ch === 'e') out += 'ē';
    else if (ch === 'o') out += 'ō';
    else out += ch;
  }
  return out;
}

function addSanskritMacrons(iast) {
  // Sanskrit e/o are always long -- blanket macron, same convention used
  // for every prior Devanagari-primary upload in this pipeline.
  return fixRetroflexL(iast).replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// Structural self-check: every keertana must have a pallavi + at least 1 charanam.
for (const k of data.keertanas) {
  if (k.stanzas.length < 2 || k.stanzas[0].label !== 'Pallavi') {
    throw new Error(`Structural check failed for "${k.title_en}": expected Pallavi + charanams, got ${JSON.stringify(k.stanzas.map(s => s.label))}`);
  }
}

// Flatten into (keertana, stanza) pairs with a single sequential stanza_number
// across the whole collection, and derive devanagari/telugu/tamil/iast per pada.
let stanzaNumber = 0;
const allRows = [];
for (const k of data.keertanas) {
  const rowsForKeertana = [];
  for (const s of k.stanzas) {
    stanzaNumber += 1;
    const devaPadas = s.padas.map(p => Sanscript.t(p, 'telugu', 'devanagari'));
    const tamilPadas = devaPadas.map(devanagariToTamilSuperscript);
    const iastPadas = s.padas.map(p => {
      const raw = Sanscript.t(p, 'telugu', 'iast');
      return k.language === 'sanskrit' ? addSanskritMacrons(raw) : addTeluguMacrons(raw);
    });
    rowsForKeertana.push({
      stanza_number: stanzaNumber,
      stanza_label: `${k.title_en} — ${s.label}`,
      script_devanagari: devaPadas.join('|'),
      script_telugu: s.padas.join('|'),
      script_tamil: tamilPadas.join('|'),
      roman_iast: iastPadas.join('|'),
      meaning_en: s.meaning_en,
      meaning_te: '',
      meaning_ta: '',
      meaning_hi: '',
      notes_en: `${k.title_en} (raga: ${k.raga}, tala: ${k.tala})`,
    });
  }
  allRows.push({ title_en: k.title_en, rows: rowsForKeertana });
}

const totalStanzas = allRows.reduce((sum, k) => sum + k.rows.length, 0);
console.log(`Slug:            ${SLUG}`);
console.log(`Keertanas:       ${allRows.length}`);
console.log(`Total stanzas:   ${totalStanzas} (declared: ${data.declared_stanza_count})`);
if (totalStanzas !== data.declared_stanza_count) {
  console.log(`Count note:      ${data.count_reconciliation_note}`);
}
console.log(`Unresolved flags: ${data.unresolved_flags.join(' | ')}`);

const sample = allRows[0].rows[0];
console.log(`\nSample row (stanza 1, "${sample.stanza_label}"):`);
console.log(`  telugu: ${sample.script_telugu}`);
console.log(`  deva:   ${sample.script_devanagari}`);
console.log(`  tamil:  ${sample.script_tamil}`);
console.log(`  iast:   ${sample.roman_iast}`);
console.log(`  meaning_en: ${sample.meaning_en}`);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

async function getExistingLabels() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A:C',
  });
  const rows = (res.data.values || []).slice(1).filter(r => r[0] === SLUG);
  return new Set(rows.map(r => r[2]));
}

if (!WRITE) {
  console.log('\nDry run -- no changes written. Re-run with --write to apply.');
  console.log(`\nAll ${allRows.length} keertanas, ${totalStanzas} stanzas total:`);
  for (const k of allRows) {
    console.log(`  - ${k.title_en}: ${k.rows.length} stanzas`);
  }
  process.exit(0);
}

// Sequential, resumable: one keertana at a time, one row at a time, verified
// after each keertana before moving to the next. No Promise.all / parallel calls.
for (const k of allRows) {
  const existingLabels = await getExistingLabels();
  const alreadyDone = k.rows.every(r => existingLabels.has(r.stanza_label));
  if (alreadyDone) {
    console.log(`Skipping "${k.title_en}" -- all ${k.rows.length} stanzas already present.`);
    continue;
  }
  const partiallyDone = k.rows.some(r => existingLabels.has(r.stanza_label));
  if (partiallyDone) {
    console.error(`Refusing "${k.title_en}": some but not all of its stanzas already exist -- manual check needed.`);
    process.exit(1);
  }

  console.log(`\nWriting "${k.title_en}" (${k.rows.length} stanzas)...`);
  for (const r of k.rows) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
      range: 'shloka_stanzas!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          SLUG, r.stanza_number, r.stanza_label,
          r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
          r.meaning_en, r.meaning_te, r.meaning_ta, r.meaning_hi, r.notes_en,
        ]],
      },
    });
    console.log(`  wrote stanza ${r.stanza_number}: ${r.stanza_label}`);
  }

  const verifyLabels = await getExistingLabels();
  const allLanded = k.rows.every(r => verifyLabels.has(r.stanza_label));
  if (!allLanded) {
    console.error(`Verification FAILED for "${k.title_en}" -- not all stanzas found after write. Stopping.`);
    process.exit(1);
  }
  console.log(`Verified "${k.title_en}": all ${k.rows.length} stanzas present in sheet.`);
}

console.log(`\nDone. ${totalStanzas} stanzas across ${allRows.length} keertanas.`);
