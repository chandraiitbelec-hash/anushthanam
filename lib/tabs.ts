// Registry of every Google Sheets tab the app reads. Keep in sync with the
// tab list in CLAUDE.md — scripts/lib-sheets.mjs and the ~90 one-off scripts
// under scripts/ are out of scope and stay string-based.
export const TABS = {
  gods: 'gods',
  shlokas: 'shlokas',
  shloka_stanzas: 'shloka_stanzas',
  pujas: 'pujas',
  festivals: 'festivals',
  vrathams: 'vrathams',
  stories_index: 'stories_index',
  stories_content: 'stories_content',
  god_links: 'god_links',
  procedure_steps: 'procedure_steps',
  material_items: 'material_items',
  panchangam: 'panchangam',
  config: 'config',
  occasions: 'occasions',
  puja_occasions: 'puja_occasions',
  live_streams: 'live_streams',
} as const;

export type Tab = (typeof TABS)[keyof typeof TABS];
