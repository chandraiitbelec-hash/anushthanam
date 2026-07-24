import { getSheetRows, getPublished } from './sheets';
import { TABS } from './tabs';
import { todayIST } from './utils';
import type { GodLink, ProcedureStep, MaterialItem, Puja, Occasion, PujaOccasion, God, Festival, Vratham, Shloka, Story } from './types';

export async function getGodLinks(): Promise<GodLink[]> {
  const rows = await getSheetRows(TABS.god_links);
  return rows.map(r => ({
    god_slug: r.god_slug,
    entity_type: r.entity_type as GodLink['entity_type'],
    entity_slug: r.entity_slug,
    display_order: parseInt(r.display_order) || 0,
  }));
}

export async function getLinksForGod(godSlug: string): Promise<GodLink[]> {
  const links = await getGodLinks();
  return links
    .filter(l => l.god_slug === godSlug)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getProcedureSteps(parentSlug: string): Promise<ProcedureStep[]> {
  const rows = await getSheetRows(TABS.procedure_steps);
  return rows
    .filter(r => r.parent_slug === parentSlug)
    .map(r => ({
      parent_slug: r.parent_slug,
      parent_type: r.parent_type as ProcedureStep['parent_type'],
      step_number: parseInt(r.step_number) || 0,
      step_title_en: r.step_title_en,
      step_title_te: r.step_title_te,
      step_title_ta: r.step_title_ta,
      step_title_hi: r.step_title_hi,
      instruction_en: r.instruction_en,
      instruction_te: r.instruction_te,
      instruction_ta: r.instruction_ta,
      instruction_hi: r.instruction_hi,
      recite_shloka_slug: r.recite_shloka_slug,
      recite_stanza_range: r.recite_stanza_range,
      notes_en: r.notes_en,
      notes_te: r.notes_te,
      notes_ta: r.notes_ta,
      notes_hi: r.notes_hi,
    }))
    .sort((a, b) => a.step_number - b.step_number);
}

export async function getMaterialItems(groupSlug: string): Promise<MaterialItem[]> {
  const rows = await getSheetRows(TABS.material_items);
  return rows
    .filter(r => r.group_slug === groupSlug)
    .map(r => ({
      group_slug: r.group_slug,
      item_order: parseInt(r.item_order) || 0,
      item_name_en: r.item_name_en,
      item_name_te: r.item_name_te,
      item_name_ta: r.item_name_ta,
      item_name_hi: r.item_name_hi,
      quantity_en: r.quantity_en,
      quantity_te: r.quantity_te,
      quantity_ta: r.quantity_ta,
      quantity_hi: r.quantity_hi,
      is_optional: r.is_optional?.toLowerCase() === 'true',
      substitution_note_en: r.substitution_note_en,
      substitution_note_te: r.substitution_note_te,
      substitution_note_ta: r.substitution_note_ta,
      substitution_note_hi: r.substitution_note_hi,
    }))
    .sort((a, b) => a.item_order - b.item_order);
}

export async function getStoriesForParent(parentSlug: string): Promise<Story[]> {
  const rows = await getPublished(TABS.stories_index);
  return rows.filter(r => r.parent_slug === parentSlug).map(rowToStory);
}

export function rowToPuja(r: Record<string, string>): Puja {
  return {
    slug: r.slug,
    title_en: r.title_en,
    title_te: r.title_te,
    title_ta: r.title_ta,
    title_hi: r.title_hi,
    deity_slug: r.deity_slug,
    occasion_type: r.occasion_type as Puja['occasion_type'],
    duration_minutes: parseInt(r.duration_minutes) || 0,
    brief_description_en: r.brief_description_en,
    brief_description_te: r.brief_description_te,
    brief_description_ta: r.brief_description_ta,
    brief_description_hi: r.brief_description_hi,
    materials_group_slug: r.materials_group_slug,
    prasad_en: r.prasad_en,
    prasad_te: r.prasad_te,
    prasad_ta: r.prasad_ta,
    prasad_hi: r.prasad_hi,
    regional_variation_notes_en: r.regional_variation_notes_en,
    regional_variation_notes_te: r.regional_variation_notes_te,
    regional_variation_notes_ta: r.regional_variation_notes_ta,
    regional_variation_notes_hi: r.regional_variation_notes_hi,
    status: r.status as Puja['status'],
    translation_status: r.translation_status as Puja['translation_status'],
    frequent: r.frequent?.toUpperCase() === 'TRUE',
  };
}

export function rowToGod(r: Record<string, string>): God {
  return {
    slug: r.slug,
    name_en: r.name_en,
    name_te: r.name_te,
    name_ta: r.name_ta,
    name_hi: r.name_hi,
    name_sa: r.name_sa,
    alternate_names_en: r.alternate_names_en,
    tradition: (r.tradition || 'smartha') as God['tradition'],
    description_en: r.description_en,
    description_te: r.description_te,
    description_ta: r.description_ta,
    description_hi: r.description_hi,
    iconography_en: r.iconography_en,
    illustration_filename: r.illustration_filename,
    illustration_credit: r.illustration_credit,
    image_drive_id: r.image_drive_id,
    status: (r.status || 'draft') as God['status'],
    translation_status: (r.translation_status || 'en-only') as God['translation_status'],
  };
}

export function rowToFestival(r: Record<string, string>): Festival {
  return {
    slug: r.slug,
    title_en: r.title_en,
    title_te: r.title_te,
    title_ta: r.title_ta,
    title_hi: r.title_hi,
    alternate_names_en: r.alternate_names_en,
    deity_slugs: r.deity_slugs,
    illustration_filename: r.illustration_filename,
    illustration_drive_id: r.illustration_drive_id,
    calendar_month: r.calendar_month,
    tithi: r.tithi,
    paksha: r.paksha,
    next_occurrence: r.next_occurrence,
    next_occurrence_note_en: r.next_occurrence_note_en,
    significance_en: r.significance_en,
    significance_te: r.significance_te,
    significance_ta: r.significance_ta,
    significance_hi: r.significance_hi,
    linked_puja_slug: r.linked_puja_slug,
    linked_story_slug: r.linked_story_slug,
    materials_group_slug: r.materials_group_slug,
    regional_notes_en: r.regional_notes_en,
    status: (r.status || 'draft') as Festival['status'],
    translation_status: (r.translation_status || 'en-only') as Festival['translation_status'],
  };
}

export function rowToVratham(r: Record<string, string>): Vratham {
  return {
    slug: r.slug,
    title_en: r.title_en,
    title_te: r.title_te,
    title_ta: r.title_ta,
    title_hi: r.title_hi,
    deity_slug: r.deity_slug,
    observance_day: r.observance_day,
    tithi: r.tithi,
    paksha: r.paksha,
    duration: r.duration,
    next_occurrence: r.next_occurrence,
    next_occurrence_note_en: r.next_occurrence_note_en,
    fasting_rules_en: r.fasting_rules_en,
    fasting_rules_te: r.fasting_rules_te,
    fasting_rules_ta: r.fasting_rules_ta,
    fasting_rules_hi: r.fasting_rules_hi,
    benefits_en: r.benefits_en,
    benefits_te: r.benefits_te,
    benefits_ta: r.benefits_ta,
    benefits_hi: r.benefits_hi,
    linked_puja_slug: r.linked_puja_slug,
    linked_story_slug: r.linked_story_slug,
    shloka_slug: r.shloka_slug,
    shloka_start_date: r.shloka_start_date,
    status: (r.status || 'draft') as Vratham['status'],
    translation_status: (r.translation_status || 'en-only') as Vratham['translation_status'],
  };
}

const VALID_SHLOKA_TYPES: Shloka['type'][] = [
  'shloka', 'stotra', 'sahasranama', 'ashtothram', 'mangalashtakam',
  'dhyanam', 'kavacham', 'suprabhatam', 'chalisa',
];

export function rowToShloka(r: Record<string, string>): Shloka {
  return {
    slug: r.slug,
    title_en: r.title_en,
    title_te: r.title_te,
    title_ta: r.title_ta,
    title_hi: r.title_hi,
    type: (VALID_SHLOKA_TYPES.includes(r.type as Shloka['type']) ? r.type : 'shloka') as Shloka['type'],
    deity_slug: r.deity_slug,
    source_scripture_en: r.source_scripture_en,
    language_of_composition: r.language_of_composition,
    brief_intro_en: r.brief_intro_en,
    brief_intro_te: r.brief_intro_te,
    brief_intro_ta: r.brief_intro_ta,
    brief_intro_hi: r.brief_intro_hi,
    audio_drive_id: r.audio_drive_id,
    status: (r.status || 'draft') as Shloka['status'],
    translation_status: (r.translation_status || 'en-only') as Shloka['translation_status'],
  };
}

const VALID_STORY_TYPES: Story['story_type'][] = [
  'vrata-katha', 'mahatmya', 'purana-story', 'sthala-purana',
];
const VALID_PARENT_TYPES: Story['parent_type'][] = ['festival', 'vratham', ''];

export function rowToStory(r: Record<string, string>): Story {
  return {
    slug: r.slug,
    title_en: r.title_en,
    title_te: r.title_te,
    title_ta: r.title_ta,
    title_hi: r.title_hi,
    deity_slug: r.deity_slug,
    story_type: (VALID_STORY_TYPES.includes(r.story_type as Story['story_type']) ? r.story_type : 'vrata-katha') as Story['story_type'],
    source_scripture_en: r.source_scripture_en,
    reading_instruction_en: r.reading_instruction_en,
    brief_summary_en: r.brief_summary_en,
    brief_summary_te: r.brief_summary_te,
    brief_summary_ta: r.brief_summary_ta,
    brief_summary_hi: r.brief_summary_hi,
    gdoc_id_en: r.gdoc_id_en,
    gdoc_id_te: r.gdoc_id_te,
    gdoc_id_ta: r.gdoc_id_ta,
    gdoc_id_hi: r.gdoc_id_hi,
    parent_slug: r.parent_slug,
    parent_type: (VALID_PARENT_TYPES.includes(r.parent_type as Story['parent_type']) ? r.parent_type : '') as Story['parent_type'],
    status: (r.status || 'draft') as Story['status'],
    translation_status: (r.translation_status || 'en-only') as Story['translation_status'],
  };
}

// Returns published pujas where frequent=TRUE, sorted by title_en.
export async function getFrequentPujas(): Promise<Puja[]> {
  const rows = await getPublished(TABS.pujas);
  return rows.filter(r => r.frequent?.toUpperCase() === 'TRUE').map(rowToPuja);
}

// Returns all published occasions ordered by display_order.
export async function getOccasions(): Promise<Occasion[]> {
  const rows = await getPublished(TABS.occasions);
  return rows
    .map(r => ({
      slug: r.slug,
      title_en: r.title_en,
      title_te: r.title_te,
      title_ta: r.title_ta,
      title_hi: r.title_hi,
      description_en: r.description_en,
      description_te: r.description_te,
      description_ta: r.description_ta,
      description_hi: r.description_hi,
      icon: r.icon,
      display_order: parseInt(r.display_order) || 0,
      status: r.status as Occasion['status'],
    }))
    .sort((a, b) => a.display_order - b.display_order);
}

// Returns ordered published Puja[] for a given occasion slug via puja_occasions join tab.
export async function resolveOccasionPujas(occasionSlug: string): Promise<Puja[]> {
  const [joinRows, pujaRows] = await Promise.all([
    getSheetRows(TABS.puja_occasions),
    getPublished(TABS.pujas),
  ]);
  const pujaIndex = new Map(pujaRows.map(r => [r.slug, r]));
  return joinRows
    .filter(r => r.occasion_slug === occasionSlug)
    .sort((a, b) => (parseInt(a.display_order) || 0) - (parseInt(b.display_order) || 0))
    .map(r => pujaIndex.get(r.puja_slug))
    .filter((r): r is Record<string, string> => Boolean(r))
    .map(rowToPuja);
}

// Returns occasionSlug → ordered Puja[] for ALL occasions in one fetch.
// Used by /pujas list page to hydrate PujasBrowser without N+1 calls.
export async function getAllOccasionPujas(): Promise<Record<string, Puja[]>> {
  const [joinRows, pujaRows] = await Promise.all([
    getSheetRows(TABS.puja_occasions),
    getPublished(TABS.pujas),
  ]);
  const pujaIndex = new Map(pujaRows.map(r => [r.slug, r]));
  const sorted = [...joinRows].sort(
    (a, b) => (parseInt(a.display_order) || 0) - (parseInt(b.display_order) || 0)
  );
  const result: Record<string, Puja[]> = {};
  for (const r of sorted) {
    const pujaRow = pujaIndex.get(r.puja_slug);
    if (!pujaRow) continue;
    if (!result[r.occasion_slug]) result[r.occasion_slug] = [];
    result[r.occasion_slug].push(rowToPuja(pujaRow));
  }
  return result;
}

export async function getUpcoming(limit?: number) {
  const [festivals, vrathams] = await Promise.all([
    getPublished(TABS.festivals),
    getPublished(TABS.vrathams),
  ]);

  const today = todayIST();

  const items = [
    ...festivals
      .filter(f => f.next_occurrence >= today)
      .map(f => ({ type: 'festival' as const, slug: f.slug, title_en: f.title_en, title_te: f.title_te, title_ta: f.title_ta, title_hi: f.title_hi, next_occurrence: f.next_occurrence, next_occurrence_note_en: f.next_occurrence_note_en || '' })),
    ...vrathams
      .filter(v => v.next_occurrence >= today)
      .map(v => ({ type: 'vratham' as const, slug: v.slug, title_en: v.title_en, title_te: v.title_te, title_ta: v.title_ta, title_hi: v.title_hi, next_occurrence: v.next_occurrence, next_occurrence_note_en: v.next_occurrence_note_en || '' })),
  ].sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));

  return limit ? items.slice(0, limit) : items;
}
