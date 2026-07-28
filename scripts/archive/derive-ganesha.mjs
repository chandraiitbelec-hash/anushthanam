import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('/tmp/ganesha-raw-verses.json', 'utf8'));

// Filter out non-Devanagari verses (romanized phala-shruti)
const devaRe = /[ऀ-ॿ]/;
const verses = raw.filter(v => devaRe.test(v.pada1) && devaRe.test(v.pada2));

// Devanagari digit map for converting ॥1॥ → ॥१॥
const toDevanagariNum = n => String(n).split('').map(d => String.fromCharCode(0x0966 + parseInt(d))).join('');

// Strip the ॥N॥ marker from a pada string
const stripMarker = s => s.replace(/॥\d+॥$/, '').trim();

// IAST long-vowel normalisation (Sanskrit e/o always long)
const toIast = s => Sanscript.t(s, 'devanagari', 'iast')
  .replace(/[eoEO]/g, c => ({e:'ē',o:'ō',E:'Ē',O:'Ō'}[c]));

const output = verses.map(v => {
  const n = v.n;
  const pada1_clean = v.pada1.replace(/।\s*$/, '').trim();
  const pada2_clean = stripMarker(v.pada2);
  const marker = `॥${toDevanagariNum(n)}॥`;

  // Devanagari: keep danda in pada1, keep marker in pada2
  const deva_pada1 = pada1_clean;
  const deva_pada2 = `${pada2_clean} ${marker}`;
  const script_devanagari = `${deva_pada1}|${deva_pada2}`;

  // Derived scripts use clean padas (no marker)
  const script_telugu = `${Sanscript.t(pada1_clean,'devanagari','telugu')}|${Sanscript.t(pada2_clean,'devanagari','telugu')}`;
  const script_tamil  = `${devanagariToTamilSuperscript(pada1_clean)}|${devanagariToTamilSuperscript(pada2_clean)}`;
  const roman_iast    = `${toIast(pada1_clean)}|${toIast(pada2_clean)}`;

  return {
    stanza_number: n,
    stanza_label: `Ślōka ${n}`,
    script_devanagari,
    script_telugu,
    script_tamil,
    roman_iast,
    meaning_en: null,
    meaning_hi: null,
    meaning_te: null,
    meaning_ta: null,
    meaning_sources: { en: null, hi: null, te: null, ta: null },
    verification_note: 'sourced from drikpanchang.com; single source, Ganesha Purana version'
  };
});

const out = {
  slug: 'ganesha-sahasranamam',
  deity_slug: 'ganesha',
  declared_stanza_count: 130,
  actual_stanza_count: output.length,
  count_reconciliation_note: `drikpanchang.com serves 167 Devanagari verses for the Ganesha Purana sahasranama. The declared count of 130 was an underestimate; the actual text has ${output.length} shlokas (the Ganesha Purana GP 1.46 version is typically 185 total verses including dhyana/phalashruti, but the stotra body is 167 here).`,
  sources_consulted: [
    { url: 'https://www.drikpanchang.com/deities-namavali/gods/lord-ganesha/stotram/ganesha-sahasranama-stotram.html', role: 'primary', notes: 'Full Unicode Devanagari text, 167 stotra verses, Ganesha Purana version' }
  ],
  verses: output,
  unresolved_flags: [
    'Only one source consulted (drikpanchang.com) — cross-check pending against a second source.',
    'All meaning fields are null; meanings to be filled in a separate pass.',
    'Declared count of 130 was incorrect; actual is 167 verses.'
  ]
};

const outPath = '/Users/ChandraKanth/Documents/dev_experiments/devotion_platform/research/ganesha-sahasranamam-sourcing.json';
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Verses: ${output.length}`);
console.log(`Sample v1 deva: ${output[0].script_devanagari.slice(0,80)}`);
console.log(`Sample v1 telugu: ${output[0].script_telugu.slice(0,80)}`);
console.log(`Sample v1 tamil: ${output[0].script_tamil.slice(0,80)}`);
console.log(`Sample v1 iast: ${output[0].roman_iast.slice(0,80)}`);
