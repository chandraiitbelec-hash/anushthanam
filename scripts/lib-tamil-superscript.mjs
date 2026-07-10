// Custom Devanagari -> Tamil-superscripted converter, built from first principles
// after finding the @indic-transliteration/sanscript library's tamil_superscripted
// scheme misplaces voicing/aspiration superscripts around liquid consonants (l/r).
//
// Rule (reverse-engineered from this site's own ganesha-ashtothram data):
// each consonant maps to a Tamil base letter + an optional superscript digit
// (2=voiceless aspirated, 3=voiced unaspirated, 4=voiced aspirated). The
// superscript is placed immediately after whatever completes that consonant's
// syllable: after the vowel matra if one is attached, after the virama if the
// consonant is bare (clustering), or immediately after the consonant itself if
// it carries the inherent vowel with nothing else attached.

const CONS = {
  'क':['க',''], 'ख':['க','²'], 'ग':['க','³'], 'घ':['க','⁴'], 'ङ':['ங',''],
  'च':['ச',''], 'छ':['ச','²'], 'ज':['ஜ',''], 'झ':['ஜ','⁴'], 'ञ':['ஞ',''],
  'ट':['ட',''], 'ठ':['ட','²'], 'ड':['ட','³'], 'ढ':['ட','⁴'], 'ण':['ண',''],
  'त':['த',''], 'थ':['த','²'], 'द':['த','³'], 'ध':['த','⁴'],
  'प':['ப',''], 'फ':['ப','²'], 'ब':['ப','³'], 'भ':['ப','⁴'], 'म':['ம',''],
  'य':['ய',''], 'र':['ர',''], 'ल':['ல',''], 'व':['வ',''],
  'श':['ஶ',''], 'ष':['ஷ',''], 'स':['ஸ',''], 'ह':['ஹ',''], 'ळ':['ள',''],
};
// न (na) is context-dependent: word-initial or geminate (न्न) -> dental ந;
// elsewhere (the common case) -> alveolar ன. Handled separately below, not in CONS.
const MATRA = {
  'ा':'ா', 'ि':'ி', 'ी':'ீ', 'ु':'ு', 'ू':'ூ',
  'ॆ':'ெ', 'े':'ே', 'ै':'ை', 'ॊ':'ொ', 'ो':'ோ', 'ौ':'ௌ',
};
const INDEP_VOWEL = {
  'अ':'அ','आ':'ஆ','इ':'இ','ई':'ஈ','उ':'உ','ऊ':'ஊ',
  'ऎ':'எ','ए':'ஏ','ऐ':'ஐ','ऒ':'ஒ','ओ':'ஓ','औ':'ஔ',
};

// न (na): word-initial, or bare/clustering forward into a stop consonant -> dental ந;
// otherwise (carries its own vowel, or clusters into a glide/liquid/sibilant/h) -> alveolar ன
const STOPS = new Set([...'कखगघचछजझटठडढतथदधपफबभ']);
function naBase(chars, i) {
  const wordInitial = i === 0 || chars[i - 1] === ' ';
  const clustersIntoStop = chars[i + 1] === '्' && STOPS.has(chars[i + 2]);
  return (wordInitial || clustersIntoStop) ? 'ந' : 'ன';
}

export function devanagariToTamilSuperscript(dev) {
  const chars = [...dev];
  let out = '';
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (CONS[ch] || ch === 'न') {
      const [base, sup] = ch === 'न' ? [naBase(chars, i), ''] : CONS[ch];
      // Nukta (़, e.g. ड़/ढ़ in Hindi/Awadhi) has no distinct Tamil-script
      // letter -- same precedent as avagraha below -- so look past it for
      // whatever virama/matra actually follows the consonant.
      const hasNukta = chars[i + 1] === '़';
      const next = hasNukta ? chars[i + 2] : chars[i + 1];
      const skip = hasNukta ? 2 : 1;
      if (next === '्') {
        out += base + '்' + sup;
        i += skip + 1;
      } else if (next === 'ृ') {
        out += base + '்' + sup + 'ரு';
        i += skip + 1;
      } else if (next && MATRA[next]) {
        out += base + MATRA[next] + sup;
        i += skip + 1;
      } else {
        out += base + sup;
        i += skip;
      }
    } else if (ch === 'ं') {
      out += 'ம்'; i += 1;
    } else if (ch === 'ः') {
      out += ':'; i += 1;
    } else if (ch === 'ृ') {
      out += 'ரு'; i += 1; // standalone vocalic r (rare, word-initial)
    } else if (ch === 'ऌ') {
      out += 'ரு'; i += 1; // standalone vocalic l (extremely rare, e.g. क्ऌप्त) -- Tamil has no dedicated glyph for either vocalic liquid, so approximate the same way as vocalic r above
    } else if (INDEP_VOWEL[ch]) {
      out += INDEP_VOWEL[ch]; i += 1;
    } else if (ch === ' ') {
      out += ' '; i += 1;
    } else if (ch === 'ऽ') {
      i += 1; // avagraha (sandhi elision marker) has no Tamil-script equivalent; drop it
    } else if (ch === 'ॐ') {
      out += 'ஓம்'; i += 1; // matches the OM.tamil literal used across the site's ashtottaram data
    } else {
      out += ch; i += 1; // pass through anything unexpected (danda, digits, etc.)
    }
  }
  return out;
}
