import { getPublished } from './sheets';
import type { SearchRecord } from './types';

export async function buildSearchIndex(): Promise<SearchRecord[]> {
  const [gods, festivals, vrathams, shlokas] = await Promise.all([
    getPublished('gods'),
    getPublished('festivals'),
    getPublished('vrathams'),
    getPublished('shlokas'),
  ]);

  const godRecords: SearchRecord[] = gods.map(g => ({
    id: g.slug,
    type: 'god',
    name_en: g.name_en,
    name_te: g.name_te,
    name_ta: g.name_ta,
    name_hi: g.name_hi,
    name_sa: g.name_sa,
    alternate_names: g.alternate_names_en,
    url: `/gods/${g.slug}`,
    illustration_drive_id: g.image_drive_id,
  }));

  const festivalRecords: SearchRecord[] = festivals.map(f => ({
    id: f.slug,
    type: 'festival',
    name_en: f.title_en,
    name_te: f.title_te,
    name_ta: f.title_ta,
    name_hi: f.title_hi,
    url: `/festivals/${f.slug}`,
    illustration_drive_id: f.illustration_drive_id,
  }));

  const vrathamRecords: SearchRecord[] = vrathams.map(v => ({
    id: v.slug,
    type: 'vratham',
    name_en: v.title_en,
    name_te: v.title_te,
    name_ta: v.title_ta,
    name_hi: v.title_hi,
    url: `/vrathams/${v.slug}`,
  }));

  const shlokaRecords: SearchRecord[] = shlokas.map(s => ({
    id: s.slug,
    type: 'shloka',
    name_en: s.title_en,
    name_te: s.title_te,
    name_ta: s.title_ta,
    name_hi: s.title_hi,
    shloka_type: s.type,
    url: `/shlokas/${s.slug}`,
  }));

  return [...godRecords, ...festivalRecords, ...vrathamRecords, ...shlokaRecords];
}

export const fuseOptions = {
  keys: [
    { name: 'name_en', weight: 0.4 },
    { name: 'name_te', weight: 0.2 },
    { name: 'name_ta', weight: 0.2 },
    { name: 'name_hi', weight: 0.1 },
    { name: 'name_sa', weight: 0.05 },
    { name: 'alternate_names', weight: 0.05 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
};
