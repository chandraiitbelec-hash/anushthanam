/**
 * Parses the codex "multilingual" chalisa markdown docs (Krishna, Lakshmi,
 * Shani) into structured stanza objects. Each doc follows a fixed shape:
 *   ## Opening dohas / ## Chaupais (### N per chaupai) / ## Closing dohas
 * with per-stanza blocks of **Hindi**, **Telugu (phonetic script)**,
 * **Tamil (phonetic script)**, **Roman transliteration (literal)**,
 * **Meaning — English**, **अर्थ — हिंदी**, **అర్థం — తెలుగు**,
 * **பொருள் — தமிழ்**.
 *
 * Only the Hindi (Devanagari) padas and the four meanings are extracted --
 * Telugu/Tamil/IAST are regenerated from the Devanagari via Sanscript /
 * lib-tamil-superscript.mjs in the calling upload script, for the same
 * transliteration-convention consistency used by every other stotra on the
 * site (candrabindu/nukta fixes, macron convention, schwa-deletion
 * calibration), rather than reusing this doc's independently-authored
 * scripts.
 */
import fs from 'fs';

// The docs embed their own trailing danda (।) / double-danda (॥) on every
// line. Stripped here so hindiLines are bare, matching the convention used
// by every other stotra upload script (danda/chaupai-numeral punctuation is
// added back explicitly when building script_devanagari), and so the bare
// form used to derive Telugu/Tamil/IAST doesn't carry a doubled-up danda.
//
// Lakshmi Chalisa's second opening doha carries the source edition's own
// "॥ टेक॥" (teka/refrain) editorial marker -- an annotation noting the line
// is repeated as a refrain, not devotional text itself. Stripped the same
// way chaupai numerals (॥१॥ etc.) are excluded from stored content and
// regenerated as clean, systematic punctuation instead.
function stripTrailingDanda(line) {
  return line.replace(/\s*॥\s*टेक\s*॥?\s*$/, '').replace(/\s*[।॥]\s*$/, '');
}

function parseStanzaBlock(block) {
  const hindiMatch = block.match(/\*\*Hindi\*\*\s*\n([\s\S]*?)\n\n\*\*Telugu/);
  const hindiLines = hindiMatch[1].trim().split('\n').map(l => stripTrailingDanda(l.trim())).filter(Boolean);

  const meaningEn = block.match(/\*\*Meaning — English\*\*\s*\n([\s\S]*?)\n\n/)[1].trim();
  const meaningHi = block.match(/\*\*अर्थ — हिंदी\*\*\s*\n([\s\S]*?)\n\n/)[1].trim();
  const meaningTe = block.match(/\*\*అర్థం — తెలుగు\*\*\s*\n([\s\S]*?)\n\n/)[1].trim();
  const meaningTaMatch = block.match(/\*\*பொருள் — தமிழ்\*\*\s*\n([\s\S]*?)(?:\n\n|$)/);
  const meaningTa = meaningTaMatch[1].trim();

  return { hindiLines, meaningEn, meaningHi, meaningTe, meaningTa };
}

function parseSection(sectionText) {
  const blocks = sectionText.split(/(?=\*\*Hindi\*\*\s*\n)/).slice(1);
  return blocks.map(parseStanzaBlock);
}

export function parseChalisaDoc(path) {
  const text = fs.readFileSync(path, 'utf8');

  const openingIdx = text.indexOf('## Opening dohas');
  const chaupaiIdx = text.indexOf('## Chaupais');
  const closingIdx = text.indexOf('## Closing dohas');
  const guideIdx = text.indexOf('## Multilingual meaning guide');

  if (openingIdx === -1 || chaupaiIdx === -1 || closingIdx === -1 || guideIdx === -1) {
    throw new Error('Could not locate all expected section headings in ' + path);
  }

  const openingText = text.slice(openingIdx, chaupaiIdx);
  const chaupaiText = text.slice(chaupaiIdx, closingIdx);
  const closingText = text.slice(closingIdx, guideIdx);

  return {
    opening: parseSection(openingText),
    chaupais: parseSection(chaupaiText),
    closing: parseSection(closingText),
  };
}

// Merges N consecutive doha stanzas (each { hindiLines, meaningEn, meaningHi, meaningTe, meaningTa })
// into one combined stanza (padas = concatenated hindiLines, meanings = space-joined).
export function mergeDohas(dohas, label) {
  return {
    label,
    padas: dohas.flatMap(d => d.hindiLines),
    meaningEn: dohas.map(d => d.meaningEn).join(' '),
    meaningHi: dohas.map(d => d.meaningHi).join(' '),
    meaningTe: dohas.map(d => d.meaningTe).join(' '),
    meaningTa: dohas.map(d => d.meaningTa).join(' '),
  };
}
