/**
 * Writes freely-licensed hero photos onto the `temples` tab, and mirrors the
 * chosen URL onto the matching `live_streams` rows.
 *
 * Source file: research/temple-hero-images.json — one entry per temple slug,
 *   produced by a research pass over the English Wikipedia + Wikimedia Commons
 *   APIs and then reviewed by eye. Every entry carries the Commons file-page
 *   URL and the licence short name alongside the image URL, because most of
 *   these photos are CC BY-SA and the credit has to travel with the picture
 *   wherever the site renders it.
 *
 * Licensing rule enforced here, not just upstream: this script refuses to
 * write a row whose image URL is not on upload.wikimedia.org, or whose licence
 * is not on the free-licence allowlist below. A temple with no acceptable
 * photo is simply left blank — a missing hero degrades to a clean card, a
 * wrong or unlicensed one does not.
 *
 * Behavior:
 *   - Adds the four hero_image_* columns to the `temples` header row if they
 *     are not already there (idempotent; existing columns are left alone).
 *   - Fills hero cells only where they are currently EMPTY, so a hand-picked
 *     replacement made in the Sheet is never clobbered by a re-run. Pass
 *     --force to overwrite non-empty cells too.
 *   - Mirrors hero_image_url onto `live_streams` rows via their temple_slug,
 *     same empty-only rule. The live_streams column already exists.
 *   - Touches no other column: not status, not display_order, not content.
 *
 * Usage:
 *   node scripts/set-temple-heroes.mjs           (dry run — prints the plan)
 *   node scripts/set-temple-heroes.mjs --write   (apply)
 *   node scripts/set-temple-heroes.mjs --write --force   (also overwrite non-empty hero cells)
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = parseWriteFlag(process.argv);
const FORCE = process.argv.includes('--force');

const TEMPLES_TAB = 'temples';
const STREAMS_TAB = 'live_streams';
const HERO_COLUMNS = ['hero_image_url', 'hero_image_license', 'hero_image_attribution', 'hero_image_source_url'];

// Only these licences may reach the Sheet. Anything else — including a blank
// licence field — is treated as unverified and skipped.
const FREE_LICENCE = /^(cc0|cc[- ]by([- ]sa)?([- ]\d(\.\d)?)?|public domain|pd([- ]|$)|attribution|copyrighted free use|gfdl)/i;
const IMAGE_HOST = 'https://upload.wikimedia.org/';

const source = JSON.parse(readFileSync(resolve(__dirname, '../research/temple-hero-images.json'), 'utf8'));

const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;

/** Returns a reason string when the entry must not be written, or null when it is fine. */
function rejectReason(entry) {
  if (!nonEmpty(entry.hero_image_url)) return 'no image sourced';
  if (!entry.hero_image_url.startsWith(IMAGE_HOST)) return `image URL is not on ${IMAGE_HOST} (refusing to hotlink a third-party host)`;
  if (!nonEmpty(entry.hero_image_license)) return 'no licence recorded';
  if (!FREE_LICENCE.test(entry.hero_image_license.trim())) return `licence "${entry.hero_image_license}" is not on the free-licence allowlist`;
  if (!nonEmpty(entry.hero_image_source_url)) return 'no Commons file-page URL recorded (licence would be unverifiable)';
  return null;
}

const usable = [];
const skipped = [];
for (const entry of source) {
  const reason = rejectReason(entry);
  if (reason) skipped.push({ slug: entry.slug, reason });
  else usable.push(entry);
}
const bySlug = new Map(usable.map(e => [e.slug, e]));

// ─── temples tab ──────────────────────────────────────────────────────────────

const sheets = await getSheetsClient();
const temples = await getTabWithHeaders(TEMPLES_TAB);
let templeHeaders = temples.headers;

const missingColumns = HERO_COLUMNS.filter(h => !templeHeaders.includes(h));
if (missingColumns.length > 0 && WRITE) {
  const startIdx = templeHeaders.length;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TEMPLES_TAB}!${colLetter(startIdx)}1:${colLetter(startIdx + missingColumns.length - 1)}1`,
    valueInputOption: 'RAW',
    requestBody: { values: [missingColumns] },
  });
  templeHeaders = [...templeHeaders, ...missingColumns];
  console.log(`✓ Added column(s) to ${TEMPLES_TAB}: ${missingColumns.join(', ')}`);
}

// After a header write the local view is up to date; on a dry run, model the
// columns as if they had been added so the plan below is the real plan.
const plannedHeaders = missingColumns.length > 0 && !WRITE ? [...templeHeaders, ...missingColumns] : templeHeaders;
const templeCol = name => {
  const i = plannedHeaders.indexOf(name);
  if (i === -1) throw new Error(`${TEMPLES_TAB}: header "${name}" not found. Headers: ${plannedHeaders.join(', ')}`);
  return i;
};

const templeSlugCol = templeCol('slug');
const templeUpdates = []; // { slug, rowNum, cells: [{ header, colIdx, value }] }
const untouched = [];     // slugs present in the sheet but with no usable image

temples.rows.forEach((row, i) => {
  const slug = row[templeSlugCol];
  const entry = bySlug.get(slug);
  if (!entry) { untouched.push(slug); return; }
  const values = {
    hero_image_url: entry.hero_image_url,
    hero_image_license: entry.hero_image_license,
    hero_image_attribution: entry.hero_image_attribution,
    hero_image_source_url: entry.hero_image_source_url,
  };
  const cells = [];
  for (const header of HERO_COLUMNS) {
    const colIdx = templeCol(header);
    const existing = row[colIdx] ?? '';
    if (nonEmpty(existing) && !FORCE) continue;
    if (existing === values[header]) continue;
    cells.push({ header, colIdx, value: values[header] });
  }
  if (cells.length) templeUpdates.push({ slug, rowNum: i + 2, cells });
});

const unmatchedEntries = usable.filter(e => !temples.rows.some(r => r[templeSlugCol] === e.slug));

// ─── live_streams tab ─────────────────────────────────────────────────────────

const streams = await getTabWithHeaders(STREAMS_TAB);
const streamTempleSlugCol = streams.col('temple_slug');
const streamHeroCol = streams.col('hero_image_url');
const streamSlugCol = streams.col('slug');

const streamUpdates = [];
streams.rows.forEach((row, i) => {
  const entry = bySlug.get(row[streamTempleSlugCol]);
  if (!entry) return;
  const existing = row[streamHeroCol] ?? '';
  if (nonEmpty(existing) && !FORCE) return;
  if (existing === entry.hero_image_url) return;
  streamUpdates.push({ slug: row[streamSlugCol], rowNum: i + 2, value: entry.hero_image_url });
});

// ─── Report ───────────────────────────────────────────────────────────────────

console.log('\n══ set-temple-heroes.mjs ═════════════════════════════════════');
console.log(`Mode:   ${WRITE ? (FORCE ? '⚡ WRITE (--force: overwrites non-empty hero cells)' : '⚡ WRITE') : '🔍 DRY RUN'}`);
console.log(`Source: research/temple-hero-images.json (${source.length} entries)`);
console.log(`Usable after licence/host checks: ${usable.length}; skipped: ${skipped.length}`);
if (missingColumns.length) console.log(`Columns ${WRITE ? 'added' : 'to add'} on ${TEMPLES_TAB}: ${missingColumns.join(', ')}`);
console.log('');

console.log('── Licence breakdown (usable entries) ──');
const licenceCounts = {};
for (const e of usable) licenceCounts[e.hero_image_license] = (licenceCounts[e.hero_image_license] ?? 0) + 1;
for (const [lic, n] of Object.entries(licenceCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${lic}`);

console.log('');
console.log(`── ${TEMPLES_TAB}: ${templeUpdates.length} row(s) to update ──`);
for (const u of templeUpdates.slice(0, 5)) {
  console.log(`  ${u.slug} (row ${u.rowNum}): ${u.cells.map(c => c.header).join(', ')}`);
}
if (templeUpdates.length > 5) console.log(`  … and ${templeUpdates.length - 5} more`);

console.log('');
console.log(`── ${STREAMS_TAB}: ${streamUpdates.length} row(s) to update ──`);
for (const u of streamUpdates) console.log(`  ${u.slug} (row ${u.rowNum}) → ${u.value}`);

if (skipped.length) {
  console.log('');
  console.log(`── Left blank on purpose (${skipped.length}) ──`);
  for (const s of skipped) console.log(`  ${s.slug}: ${s.reason}`);
}
if (untouched.length) {
  console.log('');
  console.log(`── Sheet rows with no source entry (${untouched.length}) ──`);
  console.log('  ' + untouched.join(', '));
}
if (unmatchedEntries.length) {
  console.log('');
  console.log(`⚠ ${unmatchedEntries.length} source entry/entries have no matching sheet row: ${unmatchedEntries.map(e => e.slug).join(', ')}`);
}

if (!WRITE) {
  console.log('\n🔍 Dry run only — no changes written. Re-run with --write to apply.\n');
  process.exit(0);
}

// ─── Apply ────────────────────────────────────────────────────────────────────

const data = [];
for (const u of templeUpdates) {
  for (const c of u.cells) {
    data.push({ range: `${TEMPLES_TAB}!${colLetter(c.colIdx)}${u.rowNum}`, values: [[c.value]] });
  }
}
for (const u of streamUpdates) {
  data.push({ range: `${STREAMS_TAB}!${colLetter(streamHeroCol)}${u.rowNum}`, values: [[u.value]] });
}

for (let i = 0; i < data.length; i += 200) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: data.slice(i, i + 200) },
  });
  console.log(`✓ Wrote ${Math.min(i + 200, data.length)}/${data.length} cell(s)`);
}

console.log(`\n✅ Done — ${templeUpdates.length} temple row(s), ${streamUpdates.length} live_streams row(s).\n`);
