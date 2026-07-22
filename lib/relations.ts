import { getSheetRows, getSheetRowsLarge, getPublished } from './sheets';
import type { GodLink, ProcedureStep, MaterialItem, Puja, Occasion, PujaOccasion } from './types';

export async function getGodLinks(): Promise<GodLink[]> {
  const rows = await getSheetRows('god_links');
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
  const rows = await getSheetRows('procedure_steps');
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
  const rows = await getSheetRows('material_items');
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

export async function getShlokaStanzas(shlokaSlug: string) {
  const rows = await getSheetRowsLarge('shloka_stanzas');
  return rows
    .filter(r => r.shloka_slug === shlokaSlug)
    .map(r => ({
      shloka_slug: r.shloka_slug,
      stanza_number: parseInt(r.stanza_number) || 0,
      stanza_label: r.stanza_label,
      script_devanagari: r.script_devanagari,
      script_telugu: r.script_telugu,
      script_tamil: r.script_tamil,
      roman_iast: r.roman_iast,
      meaning_en: r.meaning_en,
      meaning_te: r.meaning_te,
      meaning_ta: r.meaning_ta,
      meaning_hi: r.meaning_hi,
      notes_en: r.notes_en,
    }))
    .sort((a, b) => a.stanza_number - b.stanza_number);
}

export async function getStoriesForParent(parentSlug: string) {
  const rows = await getPublished('stories_index');
  return rows.filter(r => r.parent_slug === parentSlug);
}

function rowToPuja(r: Record<string, string>): Puja {
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

// Returns published pujas where frequent=TRUE, sorted by title_en.
export async function getFrequentPujas(): Promise<Puja[]> {
  const rows = await getPublished('pujas');
  return rows.filter(r => r.frequent?.toUpperCase() === 'TRUE').map(rowToPuja);
}

// Returns all published occasions ordered by display_order.
export async function getOccasions(): Promise<Occasion[]> {
  const rows = await getPublished('occasions');
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
    getSheetRows('puja_occasions'),
    getPublished('pujas'),
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
    getSheetRows('puja_occasions'),
    getPublished('pujas'),
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
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  const items = [
    ...festivals
      .filter(f => f.next_occurrence >= today)
      .map(f => ({ type: 'festival' as const, slug: f.slug, title_en: f.title_en, title_te: f.title_te, title_ta: f.title_ta, title_hi: f.title_hi, next_occurrence: f.next_occurrence, next_occurrence_note_en: f.next_occurrence_note_en || '', illustration_drive_id: f.illustration_drive_id })),
    ...vrathams
      .filter(v => v.next_occurrence >= today)
      .map(v => ({ type: 'vratham' as const, slug: v.slug, title_en: v.title_en, title_te: v.title_te, title_ta: v.title_ta, title_hi: v.title_hi, next_occurrence: v.next_occurrence, next_occurrence_note_en: v.next_occurrence_note_en || '', illustration_drive_id: '' })),
  ].sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));

  return limit ? items.slice(0, limit) : items;
}
