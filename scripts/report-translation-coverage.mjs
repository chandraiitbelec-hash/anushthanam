#!/usr/bin/env node
/**
 * Read-only translation-coverage report against the live Google Sheet.
 *
 * For every content tab, auto-detects field groups where a `<base>_en`
 * column has `<base>_te` / `<base>_ta` / `<base>_hi` siblings (by scanning
 * the live header row — no hardcoded field lists) and reports, per
 * language, how many published rows have a non-empty value.
 *
 * Read-only: uses the spreadsheets.readonly OAuth scope and never writes.
 * There is no --write mode.
 *
 * Usage:
 *   node scripts/report-translation-coverage.mjs             # summary
 *   node scripts/report-translation-coverage.mjs --verbose    # + slugs missing each language
 */
import { google } from 'googleapis';
import { loadEnv, SPREADSHEET_ID } from './lib-sheets.mjs';

loadEnv();

const TABS = [
  'gods',
  'shlokas',
  'pujas',
  'festivals',
  'vrathams',
  'stories_index',
  'occasions',
  'material_items',
  'procedure_steps',
  'shloka_stanzas',
];

const LANGS = ['te', 'ta', 'hi'];

// Candidate identifier columns, in preference order, per tab — used only
// for --verbose reporting of which row is missing a language.
const IDENTIFIER_CANDIDATES = ['slug', 'shloka_slug', 'story_slug', 'group_slug', 'parent_slug'];
const SECONDARY_IDENTIFIER_CANDIDATES = ['stanza_number', 'step_number', 'item_order'];

const VERBOSE = process.argv.includes('--verbose');

let _readonlyClient = null;

async function getReadonlySheetsClient() {
  if (_readonlyClient) return _readonlyClient;
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const client = await auth.getClient();
  _readonlyClient = google.sheets({ version: 'v4', auth: client });
  return _readonlyClient;
}

async function getTabWithHeadersReadonly(tab) {
  const sheets = await getReadonlySheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:ZZ`,
  });
  const [headers = [], ...rows] = res.data.values || [];
  return { headers, rows };
}

function detectFieldGroups(headers) {
  const groups = [];
  for (const header of headers) {
    if (!header.endsWith('_en')) continue;
    const base = header.slice(0, -'_en'.length);
    const siblings = LANGS.filter(lang => headers.includes(`${base}_${lang}`));
    if (siblings.length > 0) groups.push({ base, siblings });
  }
  return groups;
}

function pickIdentifier(headers) {
  const primary = IDENTIFIER_CANDIDATES.find(c => headers.includes(c));
  const secondary = SECONDARY_IDENTIFIER_CANDIDATES.find(c => headers.includes(c));
  return { primary, secondary };
}

function rowIdentifier(row, headers, { primary, secondary }) {
  const primaryVal = primary ? row[headers.indexOf(primary)] || '(no slug)' : '(no slug)';
  if (!secondary) return primaryVal;
  const secondaryVal = row[headers.indexOf(secondary)] || '?';
  return `${primaryVal}#${secondaryVal}`;
}

// shloka_stanzas.meaning is segmented by the parent shloka's `type`: name-list
// entries (ashtothram/sahasranama, 108/1000 individual names) are a separate
// authoring decision from per-stanza meanings on verse types, so blending them
// into one percentage is misleading either way you read it.
const NAME_LIST_SHLOKA_TYPES = new Set(['ashtothram', 'sahasranama']);

function reportGroupForRows(tab, base, siblings, rows, headers, identifier, label) {
  const suffix = label ? ` [${label}]` : '';
  const total = rows.length;
  if (total === 0) {
    console.log(`  ${tab}.${base}${suffix}: 0 rows to check`);
    return;
  }

  const fillCounts = {};
  const missingBySlug = {};
  for (const lang of siblings) {
    const colIdx = headers.indexOf(`${base}_${lang}`);
    let filled = 0;
    const missing = [];
    for (const row of rows) {
      const value = (row[colIdx] || '').trim();
      if (value) {
        filled++;
      } else {
        missing.push(rowIdentifier(row, headers, identifier));
      }
    }
    fillCounts[lang] = filled;
    missingBySlug[lang] = missing;
  }

  const summary = siblings.map(lang => `${lang} ${fillCounts[lang]}/${total}`).join(', ');
  console.log(`  ${tab}.${base}${suffix}: ${summary}`);

  if (VERBOSE) {
    for (const lang of siblings) {
      if (missingBySlug[lang].length > 0) {
        console.log(`    missing ${lang}: ${missingBySlug[lang].join(', ')}`);
      }
    }
  }
}

async function reportTab(tab) {
  const { headers, rows } = await getTabWithHeadersReadonly(tab);
  if (headers.length === 0) {
    console.log(`\n${tab}: (empty or missing tab)`);
    return;
  }

  const statusIdx = headers.indexOf('status');
  const hasStatus = statusIdx !== -1;
  const publishedRows = hasStatus ? rows.filter(r => r[statusIdx] === 'published') : rows;
  const total = publishedRows.length;

  console.log(`\n${tab}: ${total} ${hasStatus ? 'published' : 'total (no status column)'} row(s)`);

  const groups = detectFieldGroups(headers);
  if (groups.length === 0) {
    console.log('  (no *_en field groups with translated siblings)');
    return;
  }

  const identifier = pickIdentifier(headers);

  let shlokaTypeBySlug = null;
  if (tab === 'shloka_stanzas' && groups.some(g => g.base === 'meaning')) {
    const { headers: shlokaHeaders, rows: shlokaRows } = await getTabWithHeadersReadonly('shlokas');
    const slugIdx = shlokaHeaders.indexOf('slug');
    const typeIdx = shlokaHeaders.indexOf('type');
    shlokaTypeBySlug = new Map();
    if (slugIdx !== -1 && typeIdx !== -1) {
      for (const row of shlokaRows) {
        shlokaTypeBySlug.set(row[slugIdx], row[typeIdx]);
      }
    }
  }

  for (const { base, siblings } of groups) {
    if (tab === 'shloka_stanzas' && base === 'meaning' && shlokaTypeBySlug) {
      const shlokaSlugIdx = headers.indexOf('shloka_slug');
      const nameListRows = [];
      const otherRows = [];
      for (const row of publishedRows) {
        const parentSlug = shlokaSlugIdx !== -1 ? row[shlokaSlugIdx] : undefined;
        const type = shlokaTypeBySlug.get(parentSlug);
        if (NAME_LIST_SHLOKA_TYPES.has(type)) {
          nameListRows.push(row);
        } else {
          otherRows.push(row);
        }
      }
      reportGroupForRows(tab, base, siblings, nameListRows, headers, identifier, 'name-list: ashtothram/sahasranama');
      reportGroupForRows(tab, base, siblings, otherRows, headers, identifier, 'verse types: shloka/stotra/etc');
      continue;
    }

    if (total === 0) {
      console.log(`  ${tab}.${base}: 0 rows to check`);
      continue;
    }

    reportGroupForRows(tab, base, siblings, publishedRows, headers, identifier);
  }
}

async function main() {
  console.log('Translation coverage report (read-only)');
  console.log('='.repeat(60));
  for (const tab of TABS) {
    try {
      await reportTab(tab);
    } catch (err) {
      console.error(`\n${tab}: ERROR — ${err.message}`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
