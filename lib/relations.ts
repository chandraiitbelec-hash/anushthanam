import { getSheetRows, getPublished } from './sheets';
import type { GodLink, ProcedureStep, MaterialItem } from './types';

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
      is_optional: r.is_optional?.toLowerCase() === 'true',
      substitution_note_en: r.substitution_note_en,
    }))
    .sort((a, b) => a.item_order - b.item_order);
}

export async function getShlokaStanzas(shlokaSlug: string) {
  const rows = await getSheetRows('shloka_stanzas');
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

export async function getUpcoming(limit?: number) {
  const [festivals, vrathams] = await Promise.all([
    getPublished('festivals'),
    getPublished('vrathams'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  const items = [
    ...festivals
      .filter(f => f.next_occurrence >= today)
      .map(f => ({ type: 'festival' as const, slug: f.slug, title_en: f.title_en, title_te: f.title_te, title_ta: f.title_ta, title_hi: f.title_hi, next_occurrence: f.next_occurrence, illustration_drive_id: f.illustration_drive_id })),
    ...vrathams
      .filter(v => v.next_occurrence >= today)
      .map(v => ({ type: 'vratham' as const, slug: v.slug, title_en: v.title_en, title_te: v.title_te, title_ta: v.title_ta, title_hi: v.title_hi, next_occurrence: v.next_occurrence, illustration_drive_id: '' })),
  ].sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence));

  return limit ? items.slice(0, limit) : items;
}
