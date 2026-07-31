/**
 * One-off fixer: remove em-dashes ("—") from meaning_en/te/ta/hi in the
 * shloka_stanzas tab, scoped ONLY to shloka_slug = "narasimha-sahasranamam".
 *
 * Dry-run by default. Pass --write to apply.
 *
 * Strategy:
 *  - The dominant pattern in this sahasranama is an epithet list followed by
 *    a salutation clause, originally punctuated with an em-dash:
 *      EN: "To EPITHETS — salutations."
 *      TA: "EPITHETS — இவர்களுக்கு நமஸ்காரம்."
 *    For these we apply a mechanical, per-clause restructure:
 *      EN: move "salutations" to the front of the clause ("Salutations to EPITHETS.")
 *      TA: replace the dash with a comma before the resumptive-pronoun clause
 *          ("இவர்களுக்கு" = "to them"), which is the natural native punctuation
 *          for a list followed by a summarizing demonstrative clause.
 *    meaning_te / meaning_hi do not use this em-dash pattern in the epithet
 *    section (they already use semicolons there), so no automated pass is
 *    needed/applied for those two fields.
 *  - Everything else (phala-shruti narrative verses, cross-stanza sentence
 *    continuations, and a handful of oddly-phrased epithet rows) is covered
 *    by a hand-authored override map (overrides.mjs) read after the
 *    automated pass and given priority.
 *
 * Only meaning_en/te/ta/hi cells are ever written. script_devanagari,
 * script_telugu, script_tamil, roman_iast, stanza_label, notes_en are never
 * touched.
 */
import { getTabWithHeaders, getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter } from './lib-sheets.mjs';
import { OVERRIDES } from './fix-em-dash-narasimha-sahasranamam.overrides.mjs';

const TAB = 'shloka_stanzas';
const SLUG = 'narasimha-sahasranamam';
const FIELDS = ['meaning_en', 'meaning_te', 'meaning_ta', 'meaning_hi'];

const CLICHE_WORDS = [
  'delve', 'tapestry', 'testament', 'seamless', 'myriad', 'plethora', 'garner',
  'leverage', 'holistic', 'unlock', 'embark', 'harness', 'boast', 'boasts',
  'vibrant', 'elevate', 'symbolize',
];

function capitalizeFirst(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

// ---- Automated transform: English "To EPITHETS — salutations" clauses ----
function transformEnglishClause(clause, isFirst) {
  let m;
  if ((m = clause.match(/^To (.+) — salutations$/))) {
    return (isFirst ? 'Salutations' : 'and salutations') + ' to ' + m[1];
  }
  if ((m = clause.match(/^To (.+), salutations$/))) {
    return (isFirst ? 'Salutations' : 'and salutations') + ' to ' + m[1];
  }
  if ((m = clause.match(/^to (.+) — salutations$/))) {
    return 'and salutations to ' + m[1];
  }
  if ((m = clause.match(/^to (.+), salutations$/))) {
    return 'and salutations to ' + m[1];
  }
  // Already in the target shape (no dash) -> pass through unchanged, just
  // glue the connector back on for non-first clauses.
  if (/^Salutations to .+$/.test(clause)) {
    return isFirst ? clause : 'and ' + clause[0].toLowerCase() + clause.slice(1);
  }
  if (/^salutations to .+$/.test(clause)) {
    return isFirst ? capitalizeFirst(clause) : 'and ' + clause;
  }
  // Hybrid: "To A, salutations to B" — a clause naming two epithet groups
  // with the salutation word wedged in the middle rather than at either end.
  if ((m = clause.match(/^To (.+), salutations to (.+)$/))) {
    return (isFirst ? 'Salutations' : 'and salutations') + ' to ' + m[1] + ' and to ' + m[2];
  }
  // Plain "To LIST" / "to LIST" with no dash and no salutations word at all —
  // occurs when one clause of a multi-clause sentence carries the sentence's
  // single "— salutations" and the other clause(s) share it implicitly.
  // Every clause in this sahasranama's salutation verses is addressed to the
  // deity, so it is safe to give each clause its own explicit "salutations".
  if ((m = clause.match(/^To (.+)$/))) {
    return (isFirst ? 'Salutations' : 'and salutations') + ' to ' + m[1];
  }
  if ((m = clause.match(/^to (.+)$/))) {
    return 'and salutations to ' + m[1];
  }
  return null; // unmatched -> caller should not use automated pass for this row
}

function tryAutoTransformEnglish(text) {
  if (!text.includes('—')) return null;
  const hadTrailingPeriod = /\.\s*$/.test(text.trim());
  const raw = text.trim().replace(/\.\s*$/, '');
  const clauses = raw.split(';').map((s) => s.trim());
  const out = [];
  for (let i = 0; i < clauses.length; i++) {
    const transformed = transformEnglishClause(clauses[i], i === 0);
    if (transformed === null) return null; // bail -> needs manual override
    out.push(transformed);
  }
  let result = out.join('; ');
  result = capitalizeFirst(result);
  if (hadTrailingPeriod) result += '.';
  if (result.includes('—')) return null;
  return result;
}

// ---- Automated transform: Tamil "EPITHETS — இவர்களுக்கு(ம்) நமஸ்காரம்" ----
function tryAutoTransformTamil(text) {
  if (!text.includes('—')) return null;
  // Replace an em-dash that directly precedes the resumptive salutation
  // clause with a comma. Only touch dashes in that specific position;
  // if any dash remains afterward, bail so it gets a manual override.
  const result = text.replace(/\s*—\s*(இவர்களுக்கு(?:ம்)?\s+நமஸ்காரம்)/g, ', $1');
  if (result.includes('—')) return null;
  return result;
}

function scanCliches(text) {
  const hits = [];
  for (const word of CLICHE_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, 'i');
    if (re.test(text)) hits.push(word);
  }
  return hits;
}

async function main() {
  const write = parseWriteFlag();
  const { headers, rows, col } = await getTabWithHeaders(TAB);
  const slugIdx = col('shloka_slug');
  const stanzaIdx = col('stanza_number');

  const fieldCol = {};
  for (const f of FIELDS) fieldCol[f] = col(f);

  const updates = []; // { rowIndex (1-based incl header), field, oldVal, newVal, stanza }
  const leftAlone = []; // { stanza, field, text, reason }
  const clicheNotes = [];

  rows.forEach((row, i) => {
    if ((row[slugIdx] || '') !== SLUG) return;
    const stanza = row[stanzaIdx];
    const sheetRowNum = i + 2; // +1 header, +1 to move to 1-based

    for (const field of FIELDS) {
      const idx = fieldCol[field];
      const oldVal = row[idx] || '';
      if (!oldVal.includes('—')) continue;

      let newVal = null;
      const override = OVERRIDES[stanza] && OVERRIDES[stanza][field];
      if (override !== undefined) {
        newVal = override;
      } else if (field === 'meaning_en') {
        newVal = tryAutoTransformEnglish(oldVal);
      } else if (field === 'meaning_ta') {
        newVal = tryAutoTransformTamil(oldVal);
      }

      if (newVal === null || newVal === undefined) {
        leftAlone.push({ stanza, field, text: oldVal, reason: 'no automated pattern match and no override provided' });
        continue;
      }
      if (newVal.includes('—')) {
        leftAlone.push({ stanza, field, text: oldVal, reason: 'transform still contains em-dash (bug) — left untouched' });
        continue;
      }
      updates.push({ sheetRowNum, field, col: idx, stanza, oldVal, newVal });
    }

    // Light cliché scan on meaning_en regardless of dash presence
    const enIdx = fieldCol['meaning_en'];
    const enVal = row[enIdx] || '';
    const hits = scanCliches(enVal);
    if (hits.length) clicheNotes.push({ stanza, words: hits, text: enVal });
  });

  console.log(`Mode: ${write ? 'WRITE' : 'DRY RUN'}`);
  console.log(`shloka_slug = ${SLUG}`);
  console.log(`Total cell updates to apply: ${updates.length}`);
  console.log(`Total cells left alone (no safe automated/manual fix found): ${leftAlone.length}`);
  console.log('');

  console.log('=== UPDATES (old -> new) ===');
  for (const u of updates) {
    console.log(`--- stanza ${u.stanza} | ${u.field} | sheet row ${u.sheetRowNum} ---`);
    console.log(`OLD: ${u.oldVal}`);
    console.log(`NEW: ${u.newVal}`);
    console.log('');
  }

  if (leftAlone.length) {
    console.log('=== LEFT ALONE (needs manual attention before Phase 2) ===');
    for (const l of leftAlone) {
      console.log(`stanza ${l.stanza} | ${l.field} | reason: ${l.reason}`);
      console.log(`TEXT: ${l.text}`);
      console.log('');
    }
  }

  if (clicheNotes.length) {
    console.log('=== CLICHE-WORD SCAN HITS (meaning_en) — review, not auto-fixed ===');
    for (const c of clicheNotes) {
      console.log(`stanza ${c.stanza} | words: ${c.words.join(', ')}`);
      console.log(`TEXT: ${c.text}`);
      console.log('');
    }
  } else {
    console.log('=== CLICHE-WORD SCAN: no hits in meaning_en for the tracked word list ===');
  }

  if (!write) {
    console.log('\nDry run complete. Re-run with --write to apply these updates to the live Sheet.');
    return;
  }

  const sheets = await getSheetsClient();
  for (const u of updates) {
    const range = `${TAB}!${colLetter(u.col)}${u.sheetRowNum}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [[u.newVal]] },
    });
    console.log(`Wrote ${range}`);
  }
  console.log(`\nDone. Wrote ${updates.length} cells.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
