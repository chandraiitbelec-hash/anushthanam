#!/usr/bin/env node
/**
 * Read-only content health check against the live Google Sheet. Intended as
 * the pre-deploy check (see CLAUDE.md) — run it before "Publish to site".
 *
 * Checks, per tab:
 *   (a) the header row contains every column the app reads (exits 1 if not)
 *   (b) published-row count, warning on 0 for tabs that should never be empty
 *   (c) festivals/vrathams next_occurrence values parse as YYYY-MM-DD
 *
 * Only a missing header fails the run (exit 1). Everything else is a
 * warning — the script never writes to Sheets.
 */
import { getTabWithHeaders } from './lib-sheets.mjs';

// Hand-maintained expected-column list per tab, derived from the rowTo*
// mappers in lib/relations.ts and the readers in lib/panchangam.ts,
// lib/docs.ts, lib/stanzas.ts, lib/sheets.ts (getConfig). Update this list
// whenever one of those starts reading a new column.
const EXPECTED_COLUMNS = {
  gods: [
    'slug', 'name_en', 'name_te', 'name_ta', 'name_hi', 'name_sa',
    'alternate_names_en', 'tradition', 'description_en', 'description_te',
    'description_ta', 'description_hi', 'iconography_en',
    'illustration_filename', 'illustration_credit', 'image_drive_id',
    'status', 'translation_status',
  ],
  shlokas: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi', 'type',
    'deity_slug', 'source_scripture_en', 'language_of_composition',
    'brief_intro_en', 'brief_intro_te', 'brief_intro_ta', 'brief_intro_hi',
    'audio_drive_id', 'status', 'translation_status',
  ],
  shloka_stanzas: [
    'shloka_slug', 'stanza_number', 'stanza_label', 'script_devanagari',
    'script_telugu', 'script_tamil', 'roman_iast', 'meaning_en', 'meaning_te',
    'meaning_ta', 'meaning_hi', 'notes_en',
  ],
  pujas: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi', 'deity_slug',
    'occasion_type', 'duration_minutes', 'brief_description_en',
    'brief_description_te', 'brief_description_ta', 'brief_description_hi',
    'materials_group_slug', 'prasad_en', 'prasad_te', 'prasad_ta', 'prasad_hi',
    'regional_variation_notes_en', 'regional_variation_notes_te',
    'regional_variation_notes_ta', 'regional_variation_notes_hi', 'status',
    'translation_status', 'frequent',
  ],
  festivals: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi',
    'alternate_names_en', 'deity_slugs', 'illustration_filename',
    'illustration_drive_id', 'calendar_month', 'tithi', 'paksha',
    'next_occurrence', 'next_occurrence_note_en', 'significance_en',
    'significance_te', 'significance_ta', 'significance_hi',
    'linked_puja_slug', 'linked_story_slug', 'materials_group_slug',
    'regional_notes_en', 'status', 'translation_status',
  ],
  vrathams: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi', 'deity_slug',
    'observance_day', 'tithi', 'paksha', 'duration', 'next_occurrence',
    'next_occurrence_note_en', 'fasting_rules_en', 'fasting_rules_te',
    'fasting_rules_ta', 'fasting_rules_hi', 'benefits_en', 'benefits_te',
    'benefits_ta', 'benefits_hi', 'linked_puja_slug', 'linked_story_slug',
    'shloka_slug', 'shloka_start_date', 'status', 'translation_status',
  ],
  stories_index: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi', 'deity_slug',
    'story_type', 'source_scripture_en', 'reading_instruction_en',
    'brief_summary_en', 'brief_summary_te', 'brief_summary_ta',
    'brief_summary_hi', 'gdoc_id_en', 'gdoc_id_te', 'gdoc_id_ta',
    'gdoc_id_hi', 'parent_slug', 'parent_type', 'status', 'translation_status',
  ],
  stories_content: ['story_slug', 'lang', 'paragraph_num', 'text'],
  god_links: ['god_slug', 'entity_type', 'entity_slug', 'display_order'],
  procedure_steps: [
    'parent_slug', 'parent_type', 'step_number', 'step_title_en',
    'step_title_te', 'step_title_ta', 'step_title_hi', 'instruction_en',
    'instruction_te', 'instruction_ta', 'instruction_hi',
    'recite_shloka_slug', 'recite_stanza_range', 'notes_en', 'notes_te',
    'notes_ta', 'notes_hi',
  ],
  material_items: [
    'group_slug', 'item_order', 'item_name_en', 'item_name_te',
    'item_name_ta', 'item_name_hi', 'quantity_en', 'quantity_te',
    'quantity_ta', 'quantity_hi', 'is_optional', 'substitution_note_en',
    'substitution_note_te', 'substitution_note_ta', 'substitution_note_hi',
  ],
  panchangam: [
    'date', 'tithi_en', 'tithi_number', 'paksha', 'nakshatra_en', 'yoga_en',
    'karana_en', 'lunar_month_en', 'sunrise', 'sunset', 'rahu_kalam',
    'special_event_en', 'special_event_te', 'special_event_ta',
    'special_event_hi',
  ],
  config: ['key', 'value'],
  occasions: [
    'slug', 'title_en', 'title_te', 'title_ta', 'title_hi',
    'description_en', 'description_te', 'description_ta', 'description_hi',
    'icon', 'display_order', 'status',
  ],
  puja_occasions: ['occasion_slug', 'puja_slug', 'display_order'],
  live_streams: [
    'slug', 'temple_slug', 'youtube_video_id', 'channel_url',
    'arathi_schedule_en', 'arathi_schedule_te', 'arathi_schedule_ta',
    'arathi_schedule_hi', 'hero_image_url', 'description_en', 'description_te',
    'description_ta', 'description_hi', 'established_note_en', 'featured',
    'display_order', 'status', 'translation_status',
  ],
  temples: [
    'slug', 'name_en', 'name_te', 'name_ta', 'name_hi',
    'etymology_en', 'etymology_te', 'etymology_ta', 'etymology_hi',
    'history_en', 'history_te', 'history_ta', 'history_hi',
    'significance_en', 'significance_te', 'significance_ta', 'significance_hi',
    'location_en', 'location_te', 'location_ta', 'location_hi',
    'official_website_url', 'display_order', 'status', 'translation_status',
  ],
};

// Tabs whose published-row count should never realistically be 0.
const NEVER_EMPTY = ['gods', 'shlokas', 'pujas', 'festivals', 'vrathams'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let hasError = false;
let hasWarning = false;

function warn(msg) {
  console.warn(`⚠ ${msg}`);
  hasWarning = true;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  hasError = true;
}

async function checkTab(tab) {
  let headers, rows;
  try {
    ({ headers, rows } = await getTabWithHeaders(tab));
  } catch (err) {
    const notFound = /unable to parse range/i.test(err.message ?? '');
    fail(`${tab}: ${notFound ? 'tab does not exist yet' : `failed to read tab (${err.message})`}`);
    return null;
  }

  const expected = EXPECTED_COLUMNS[tab];
  const missing = expected.filter(c => !headers.includes(c));

  if (missing.length > 0) {
    fail(`${tab}: missing header(s): ${missing.join(', ')}`);
  } else {
    console.log(`✓ ${tab}: all ${expected.length} expected headers present`);
  }

  const statusIdx = headers.indexOf('status');
  if (statusIdx !== -1) {
    const publishedCount = rows.filter(r => r[statusIdx] === 'published').length;
    if (NEVER_EMPTY.includes(tab) && publishedCount === 0) {
      warn(`${tab}: 0 published rows`);
    } else {
      console.log(`  ${publishedCount} published row(s) of ${rows.length} total`);
    }
  }

  return { headers, rows };
}

function checkOccurrenceDates(tab, headers, rows) {
  const nextIdx = headers.indexOf('next_occurrence');
  if (nextIdx === -1) return;
  const slugIdx = headers.indexOf('slug');

  const offenders = rows
    .map(r => ({ slug: r[slugIdx] || '(no slug)', value: r[nextIdx] || '' }))
    .filter(({ value }) => value && !DATE_RE.test(value));

  if (offenders.length > 0) {
    warn(
      `${tab}: next_occurrence not in YYYY-MM-DD format for: ` +
        offenders.map(({ slug, value }) => `${slug}="${value}"`).join(', ')
    );
  }
}

async function main() {
  for (const tab of Object.keys(EXPECTED_COLUMNS)) {
    const result = await checkTab(tab);
    if (!result) continue;
    const { headers, rows } = result;
    if (tab === 'festivals' || tab === 'vrathams') {
      checkOccurrenceDates(tab, headers, rows);
    }
  }

  console.log('');
  if (hasError) {
    console.error('✗ content health check FAILED — see missing headers above');
    process.exit(1);
  }
  console.log(hasWarning ? '⚠ content health check passed with warnings' : '✓ content health check passed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
