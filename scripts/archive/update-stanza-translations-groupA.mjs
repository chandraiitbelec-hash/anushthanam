#!/usr/bin/env node
/**
 * update-stanza-translations-groupA.mjs
 *
 * Writes meaning_te / meaning_ta / meaning_hi (columns I:K) for the four
 * Group-A shlokas.  Defaults to DRY-RUN; pass --write to apply.
 *
 * Usage:
 *   node scripts/update-stanza-translations-groupA.mjs
 *   node scripts/update-stanza-translations-groupA.mjs --slug vishnu-sahasranamam
 *   node scripts/update-stanza-translations-groupA.mjs --write
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] ??= m[2].trim().replace(/^"|"$/g, '');
    }
  } catch {}
}
loadEnv();

const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
const SERVICE_ACCOUNT_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 'null');
if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_KEY) {
  console.error('Missing SHEETS_SPREADSHEET_ID or GOOGLE_SERVICE_ACCOUNT_KEY');
  process.exit(1);
}

// ── args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const SLUG_FILTER = (() => {
  const i = args.indexOf('--slug');
  return i !== -1 ? args[i + 1] : null;
})();

const SLUGS = [
  'vishnu-sahasranamam',
  'ganesh-chalisa',
  'subrahmanya-bhujangam',
  'kanakadhara-stotram',
];
const targets = SLUG_FILTER ? [SLUG_FILTER] : SLUGS;

// ── auth ──────────────────────────────────────────────────────────────────────
const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// ── read sheet ────────────────────────────────────────────────────────────────
async function readSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'shloka_stanzas!A:L',
  });
  return res.data.values || [];
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY-RUN'}`);

  const rows = await readSheet();
  // rows[0] is header; data rows start at index 1 → sheet row 2
  const header = rows[0];
  const colIdx = (name) => header.indexOf(name);

  const COL_SLUG = colIdx('shloka_slug');
  const COL_NUM  = colIdx('stanza_number');
  const COL_TE   = colIdx('meaning_te');
  const COL_TA   = colIdx('meaning_ta');
  const COL_HI   = colIdx('meaning_hi');

  // Build lookup: slug+stanza_number → { sheetRow (1-indexed), hasTe, hasTa, hasHi }
  const rowMap = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const slug = r[COL_SLUG] || '';
    const num  = parseInt(r[COL_NUM] || '0', 10);
    if (slug && num) {
      rowMap.set(`${slug}|${num}`, {
        sheetRow: i + 1,
        hasTe: !!(r[COL_TE] || '').trim(),
        hasTa: !!(r[COL_TA] || '').trim(),
        hasHi: !!(r[COL_HI] || '').trim(),
      });
    }
  }

  const allData = [];
  let totalToWrite = 0;
  let totalSkipped = 0;

  for (const slug of targets) {
    const meaningsPath = resolve(ROOT, `research/${slug}-meanings.json`);
    let meanings;
    try {
      meanings = JSON.parse(readFileSync(meaningsPath, 'utf8'));
    } catch (e) {
      console.error(`Cannot read ${meaningsPath}: ${e.message}`);
      continue;
    }

    let willWrite = 0;
    let skipped = 0;
    const updates = [];

    for (const m of meanings) {
      const key = `${slug}|${m.n}`;
      const info = rowMap.get(key);
      if (!info) {
        console.warn(`  [WARN] ${slug} stanza ${m.n}: not found in sheet`);
        continue;
      }
      if (info.hasTe || info.hasTa || info.hasHi) {
        skipped++;
        continue;
      }
      const te = (m.meaning_te || '').trim();
      const ta = (m.meaning_ta || '').trim();
      const hi = (m.meaning_hi || '').trim();
      if (!te && !ta && !hi) continue;

      updates.push({
        range: `shloka_stanzas!I${info.sheetRow}:K${info.sheetRow}`,
        values: [[te, ta, hi]],
      });
      willWrite++;
    }

    console.log(`\n${slug}: ${willWrite} to write, ${skipped} already filled`);
    if (updates.length) {
      // Show sample
      const sample = updates.slice(0, 2);
      for (const u of sample) {
        const [te, ta, hi] = u.values[0];
        console.log(`  ${u.range}: te="${te.slice(0, 40)}…"`);
      }
    }

    allData.push(...updates);
    totalToWrite += willWrite;
    totalSkipped += skipped;
  }

  console.log(`\nTotal: ${totalToWrite} rows to write, ${totalSkipped} skipped (already filled)`);

  if (!WRITE) {
    console.log('\nDRY-RUN complete — pass --write to apply');
    return;
  }

  if (!allData.length) {
    console.log('Nothing to write.');
    return;
  }

  // Batch update in chunks of 500
  const CHUNK = 500;
  for (let i = 0; i < allData.length; i += CHUNK) {
    const chunk = allData.slice(i, i + CHUNK);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: chunk,
      },
    });
    console.log(`  Wrote rows ${i + 1}–${Math.min(i + CHUNK, allData.length)}`);
  }
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
