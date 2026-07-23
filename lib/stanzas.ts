import { getSheetRowsLarge } from './sheets';
import type { ShlokaStanza } from './types';

type RawStanzaRow = Record<string, string>;

function toStanza(r: RawStanzaRow): ShlokaStanza {
  return {
    shloka_slug: r.shloka_slug,
    stanza_number: parseInt(r.stanza_number, 10) || 0,
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
  };
}

async function getShlokaStanzasFromSheetsFallback(shlokaSlug: string): Promise<ShlokaStanza[]> {
  console.error(`CONTENT ERROR: no static JSON for shloka_slug "${shlokaSlug}" — falling back to live Sheets fetch. Run scripts/export-shloka-stanzas.mjs to fix.`);
  const rows = await getSheetRowsLarge('shloka_stanzas');
  return rows
    .filter(r => r.shloka_slug === shlokaSlug)
    .map(toStanza)
    .sort((a, b) => a.stanza_number - b.stanza_number);
}

// Static JSON exported from the shloka_stanzas Sheets tab by
// scripts/export-shloka-stanzas.mjs — see STOTRA_UPLOAD_PIPELINE.md for when
// to re-run it. Falls back to a live Sheets fetch only if a slug's file is
// missing (e.g. the export has not been re-run yet after a new upload).
export async function getShlokaStanzas(shlokaSlug: string): Promise<ShlokaStanza[]> {
  try {
    const rows = (await import(`./data/stanzas/${shlokaSlug}.json`)).default as RawStanzaRow[];
    return rows.map(toStanza).sort((a, b) => a.stanza_number - b.stanza_number);
  } catch {
    return getShlokaStanzasFromSheetsFallback(shlokaSlug);
  }
}
