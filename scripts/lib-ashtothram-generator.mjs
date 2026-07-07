/**
 * Shared generator for ashtottara-shatanamavali-style shloka_stanzas rows.
 * Given a clean array of Devanagari names (OM prefix stripped, no trailing
 * danda/numerals) and a shloka_slug, produces row objects with
 * script_devanagari, script_telugu, script_tamil, and roman_iast — using
 * @indic-transliteration/sanscript for Devanagari/Telugu/IAST (verified
 * against this site's existing ganesha-ashtothram data) and the custom
 * lib-tamil-superscript.mjs converter for Tamil (library's own Tamil scheme
 * has a known bug around liquid consonants — see that file's header).
 */
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';

const OM = { devanagari: 'ॐ', telugu: 'ఓం', tamil: 'ஓம்', iast: 'ōṃ' };

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// Strips a leading ओं/ॐ (if present) and trailing danda/numeral clutter from one name.
export function cleanName(raw) {
  return raw
    .trim()
    .replace(/^(ओं|ॐ)\s*/, '')
    .replace(/\s*[।॥]+\s*[०-९0-9]*\s*$/, '')
    .replace(/\s*[०-९0-9]+\s*$/, '')
    .trim();
}

export function generateRows(names, slug) {
  return names.map((name, i) => {
    const iastRaw = Sanscript.t(name, 'devanagari', 'iast');
    return {
      stanza_number: i + 1,
      script_devanagari: `${OM.devanagari} ${name}`,
      script_telugu: `${OM.telugu} ${Sanscript.t(name, 'devanagari', 'telugu')}`,
      script_tamil: `${OM.tamil} ${devanagariToTamilSuperscript(name)}`,
      roman_iast: `${OM.iast} ${addMacrons(iastRaw)}`,
    };
  });
}

export function toSheetRows(rows, slug) {
  return rows.map(r => [
    slug, r.stanza_number, '',
    r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
    '', '', '', '', '',
  ]);
}
