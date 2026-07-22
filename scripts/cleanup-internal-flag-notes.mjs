/**
 * Removes internal authoring markers ([FLAG-*], [NOTE]) that leaked into user-facing
 * procedure_steps.notes_en. Per-note action:
 *   remove  → the note is a pure authoring TODO; blank it.
 *   strip   → genuine guidance with a junk prefix; drop the leading [TAG], keep the text.
 *
 * Safety: scans ALL puja notes for "[FLAG" / "[NOTE"; if any tagged note isn't in the
 * action map, it WARNS and does not touch it (so we notice and add a rule).
 *
 * Usage: node scripts/cleanup-internal-flag-notes.mjs [--write]
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });
const WRITE = process.argv.includes('--write');

// key = `${parent_slug}#${step_number}`
const ACTIONS = {
  'satyanarayana-puja#6': { action: 'remove' },
  'gauri-puja#8':         { action: 'remove' },
  'navagraha-puja#7':     { action: 'remove' },
  'saraswati-puja#1':     { action: 'strip' },
  'shiva-puja#4':         { action: 'strip' },
  'vastu-puja#9':         { action: 'strip' },
  'kubera-puja#8':        { action: 'strip' },
};
const TAG_RE = /^\s*\[[^\]]+\]\s*/;

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
const SHEET_ID = process.env.SHEETS_SPREADSHEET_ID;

const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'procedure_steps!A:ZZ' });
const [headers, ...rows] = res.data.values;
const c = n => headers.indexOf(n);
const cSlug = c('parent_slug'), cType = c('parent_type'), cStep = c('step_number'), cNotes = c('notes_en');
const colLetter = i => { let s=''; i+=1; while(i>0){const m=(i-1)%26; s=String.fromCharCode(65+m)+s; i=Math.floor((i-1)/26);} return s; };

const updates = [];
const unhandled = [];
rows.forEach((r, idx) => {
  if ((r[cType] ?? '') !== 'puja') return;
  const notes = r[cNotes] ?? '';
  const key = `${r[cSlug]}#${r[cStep]}`;
  const tagged = /\[FLAG|\[NOTE/i.test(notes);
  const rule = ACTIONS[key];
  if (!rule) { if (tagged) unhandled.push(`${key}: ${notes.slice(0, 70)}`); return; }
  const sheetRow = idx + 2;
  const cleaned = rule.action === 'remove' ? '' : notes.replace(TAG_RE, '').trim();
  console.log(`\n${rule.action.toUpperCase()} ${key} (row ${sheetRow})`);
  console.log(`  before: ${notes.slice(0, 90)}`);
  console.log(`  after:  ${cleaned ? cleaned.slice(0, 90) : '(blank)'}`);
  updates.push({ range: `procedure_steps!${colLetter(cNotes)}${sheetRow}`, values: [[cleaned]] });
});

if (unhandled.length) {
  console.log(`\n⚠️  ${unhandled.length} TAGGED notes NOT in action map (review + add rules):`);
  unhandled.forEach(u => console.log(`   ${u}`));
}
console.log(`\nMode: ${WRITE ? '⚡ WRITE' : '🔍 DRY RUN'} | ${updates.length} notes to clean`);
if (WRITE && updates.length) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates },
  });
  console.log('✓ applied');
} else if (!WRITE) {
  console.log('Dry run — pass --write to apply.');
}
