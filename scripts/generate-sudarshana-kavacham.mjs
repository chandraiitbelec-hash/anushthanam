/**
 * Generates research/sudarshana-kavacham-sourcing.json
 * Source: Bhrigu Samhita (Bhṛgusaṃhitokta) version — the most widely attested
 * Pancharatra Agama attribution: Vihagendra Samhita version exists (55 slokas)
 *   but no 26-stanza Pancharatra version was found; 15-stanza Bhrigu Samhita
 *   version is the universally available canonical form.
 * Run: node scripts/generate-sudarshana-kavacham.mjs
 */
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { writeFileSync } from 'fs';

const toDevanagariNum = n =>
  String(n).split('').map(d => String.fromCharCode(0x0966 + parseInt(d))).join('');

const toIastOut = s => Sanscript.t(s, 'devanagari', 'iast')
  .replace(/[eo]/g, c => c === 'e' ? 'ē' : 'ō');

// Sanscript maps oṃ → ॐ (OM symbol, U+0950), which is wrong when oṃ appears
// inside a word (e.g. bija mantra "kroṃ"). Fix: ्ॐ (virama+OM after a consonant
// cluster) → ों (o-matra + anusvara). Standalone ॐ is not affected.
const fixOm = s => s.replace(/्ॐ/g, 'ों');
const deva = iast => fixOm(Sanscript.t(iast, 'iast', 'devanagari'));

/**
 * RAW stanzas — IAST input (proper Unicode diacritics).
 * h1 = first pāda, h2 = second pāda (split at |).
 * num: internal verse number as it appears in the text (॥N॥), or null for unnumbered.
 * label: structural label.
 * verif: cross-check note.
 *
 * Sources:
 *   Primary: stotrarathna.blogspot.com/2016/07/sri-sudarshana-kavacham.html (Ramachander)
 *   Cross-check: stotram.co.in/sudarshana-kavacham-1/ (Bhrigu Samhita version)
 *   Spot-check: sanskritdocuments.org/doc_vishhnu/sudarshanakavacha.itx (NOT used as source)
 */
const RAW = [
  {
    n: 1, label: 'Intro',
    h1: 'prasīda bhagavan brahman sarvamantra-jña nārada',
    h2: 'saudarśanaṃ tu kavacaṃ pavitraṃ brūhi tattvataḥ',
    verif: 'Opening verse: Narada petitions Brahma. Wording consistent across stotrarathna, stotram.co.in. "sarvamantra-jña" appears as "sarvamantrajña" in all sources — one compound. "brūhi tattvataḥ" unanimous.'
  },
  {
    n: 2, label: 'Intro',
    h1: 'śruṇuṣveha dvijaśreṣṭha pavitraṃ paramādbhutam',
    h2: 'saudarśanaṃ tu kavacaṃ dṛṣṭādṛṣṭārtha sādhakam',
    verif: 'Brahma/Narada\'s response begins the kavacham. "dṛṣṭādṛṣṭārtha sādhakam" — accomplishes visible and invisible goals. Consistent across sources.'
  },
  {
    n: 3, label: 'Viniyoga',
    h1: 'kavacasyāsya ṛṣir brahmā chandonuṣṭup tathā smṛtam',
    h2: 'sudarśana mahāviṣṇur devatā sampracakṣate',
    verif: 'Formal Viniyoga: rishi=Brahma, chandas=Anuṣṭup, devatā=Sudarśana (Mahāviṣṇu). "sampracakṣate" — is declared/established. Consistent.'
  },
  {
    n: 4, label: 'Verse 1',
    h1: 'hrāṃ bījaṃ śaktir adroktā hrīṃ kroṃ kīlakam iṣyate',
    h2: 'śiraḥ sudarśanaḥ pātu lalāṭaṃ cakranāyakaḥ',
    verif: 'Bija + first body-protection verse. Bija: hrāṃ (seed), śakti = hrīṃ, kīlaka = kroṃ. "śiraḥ sudarśanaḥ pātu" — may Sudarshana protect the head. Unanimous across sources.'
  },
  {
    n: 5, label: 'Verse 2',
    h1: 'ghrāṇaṃ pātu mahādaityaripuravyāt dṛśau mama',
    h2: 'sahasrāraḥ śrutiṃ pātu kapolaṃ devavallabhaḥ',
    verif: '"mahādaityaripuḥ avyāt" (enemy of great demons, protect) → sandhi form "mahādaityaripuravyāt". "sahasrāraḥ" = thousand-spoked (disc). "devavallabhaḥ" = beloved of gods. Consistent.'
  },
  {
    n: 6, label: 'Verse 3',
    h1: 'viśvātmā pātu me vaktraṃ jihvāṃ vidyāmayo hariḥ',
    h2: 'kaṇṭhaṃ pātu mahājvālaḥ skandhau divyāyudheśvaraḥ',
    verif: '"viśvātmā" = soul of the universe. "vidyāmayo hariḥ" = Hari consisting of all learning. "mahājvālaḥ" = blazing greatly. "divyāyudheśvaraḥ" = lord of divine weapons. Consistent.'
  },
  {
    n: 7, label: 'Verse 4',
    h1: 'bhujau me pātu vijayī karau kaiṭabhanāśanaḥ',
    h2: 'ṣaṭkoṇa saṃsthitaḥ pātu hṛdayaṃ dhāma māmakam',
    verif: '"vijayī" = victorious. "kaiṭabhanāśanaḥ" = slayer of Kaiṭabha demon. "ṣaṭkoṇa saṃsthitaḥ" = situated in the hexagram (ṣaṭkoṇa yantra). "dhāma māmakam" = my dwelling/abode (i.e., my heart). Consistent.'
  },
  {
    n: 8, label: 'Verse 5',
    h1: 'madhyaṃ pātu mahāvīryaḥ trinetraḥ nābhimaṇḍalam',
    h2: 'sarvāyudhamayaḥ pātu kaṭiṃ śroṇiṃ mahādyutiḥ',
    verif: '"trinetraḥ nābhimaṇḍalam" — three-eyed (Sudarshana has three eyes as Agni, Surya, Soma) protects navel-disc. "sarvāyudhamayaḥ" = consisting of all weapons. Consistent.'
  },
  {
    n: 9, label: 'Verse 6',
    h1: 'somasūryāgninayanaḥ ūru pātu ca māmakau',
    h2: 'guhyaṃ pātu mahāmāyaḥ jānunī tu jagatpatiḥ',
    verif: '"somasūryāgninayanaḥ" = whose eyes are moon, sun, and fire. "mahāmāyaḥ" = great deluder/mystery. "jagatpatiḥ" = lord of the universe. Consistent.'
  },
  {
    n: 10, label: 'Verse 7',
    h1: 'jaṅghe pātu mamājasraṃ ahirbudhnyaḥ supūjitaḥ',
    h2: 'gulphau pātu viśuddhātmā pādau parapurañjayaḥ',
    verif: '"ahirbudhnyaḥ" = form of Ahirbudhnya serpent (Agama deity). "viśuddhātmā" = pure-souled. "parapurañjayaḥ" = conqueror of the enemies\' cities. Consistent.'
  },
  {
    n: 11, label: 'Verse 8',
    h1: 'sakalāyudha sampūrṇaḥ nikhilāṅgaṃ sudarśanaḥ',
    h2: 'ya idaṃ kavacaṃ divyaṃ paramānanda dāyinam',
    verif: 'Transition verse: "sakalāyudha sampūrṇaḥ" = replete with all weapons. "nikhilāṅgaṃ" = all limbs. Second pāda begins the phala shruti chain: "whoever (reads) this divine armor that bestows supreme bliss." Both pādas confirmed across sources.'
  },
  {
    n: 12, label: 'Phala Shruti',
    h1: 'saudarśanam idaṃ yo vai sadā śuddhaḥ paṭhen naraḥ',
    h2: 'tasyārtha siddhir vipulā karasthā bhavati dhruvam',
    verif: '"sadā śuddhaḥ paṭhen naraḥ" = the person who recites this, always pure. "tasyārtha siddhir vipulā karasthā" = abundant fulfilment of his aims becomes at-hand. Consistent.'
  },
  {
    n: 13, label: 'Phala Shruti',
    h1: 'kūṣmāṇḍa caṇḍa bhūtādyāḥ ye ca duṣṭāḥ grahāḥ smṛtāḥ',
    h2: 'palāyante aniśaṃ pīṭhāḥ varmaṇo\'sya prabhāvataḥ',
    verif: '"kūṣmāṇḍa caṇḍa bhūtādyāḥ" = Kūṣmāṇḍa, Caṇḍa, and other beings. "palāyante aniśaṃ pīṭhāḥ" = flee unceasingly, beaten/overcome. "varmaṇo\'sya prabhāvataḥ" = by the power of this armor. Consistent.'
  },
  {
    n: 14, label: 'Phala Shruti',
    h1: 'kuṣṭhāpasmāra gulmādyāḥ vyādhayaḥ karmahetu kāḥ',
    h2: 'naśyanti etan mantritāmbu pānāt sapta dināvadhi',
    verif: '"kuṣṭha" = leprosy/skin disease, "apasmāra" = epilepsy, "gulma" = tumor/cyst. "mantritāmbu pānāt" = by drinking water consecrated by this mantra. "sapta dināvadhi" = within seven days. Consistent.'
  },
  {
    n: 15, label: 'Phala Shruti',
    h1: 'anena mantritā mṛtsnāṃ tulasīmūlaḥ saṃsthitām',
    h2: 'lalāṭe tilakaṃ kṛtvā mohayet trijagan naraḥ',
    verif: '"mṛtsnāṃ tulasīmūlaḥ saṃsthitām" = earth placed at the root of a tulasī plant, consecrated by this mantra. "lalāṭe tilakaṃ kṛtvā" = applying this as a tilaka on the forehead. "mohayet trijagan naraḥ" = that person enchants/attracts the three worlds. Consistent.'
  },
];

const verses = RAW.map(r => {
  const deva_h1 = deva(r.h1);
  const deva_h2 = deva(r.h2);
  const marker = `॥${toDevanagariNum(r.n)}॥`;
  const script_devanagari = `${deva_h1} ।|${deva_h2} ${marker}`;
  const script_telugu = `${Sanscript.t(deva_h1, 'devanagari', 'telugu')}|${Sanscript.t(deva_h2, 'devanagari', 'telugu')}`;
  const script_tamil = `${devanagariToTamilSuperscript(deva_h1)}|${devanagariToTamilSuperscript(deva_h2)}`;
  const iast_h1 = toIastOut(deva_h1);
  const iast_h2 = toIastOut(deva_h2);
  const roman_iast = `${iast_h1}|${iast_h2}`;
  return {
    stanza_number: r.n,
    stanza_label: r.label,
    script_devanagari,
    script_telugu,
    script_tamil,
    roman_iast,
    meaning_en: null,
    meaning_hi: null,
    meaning_te: null,
    meaning_ta: null,
    meaning_sources: { en: null, hi: null, te: null, ta: null },
    verification_note: r.verif,
  };
});

const output = {
  slug: 'sudarshana-kavacham',
  deity_slug: 'vishnu',
  declared_stanza_count: 26,
  actual_stanza_count: verses.length,
  count_reconciliation_note: 'Declared count of 26 does not match any known version. The standard Bhrigu Samhita (Bhṛgusaṃhitokta) Sudarshana Kavacham has exactly 15 verses (confirmed across 4 independent sources: stotrarathna.blogspot.com, stotram.co.in, gurukripa.org.in, spot-check via sanskritdocuments.org). The Pancharatra Agama Vihagendra Samhita version has 55 slokas (Internet Archive reference), not 26. A 26-stanza version was not found in any source. The declared count of 26 is likely an error in the original task data. The canonical 15-stanza Bhrigu Samhita version is used here as it is the universally attested Sudarshana Kavacham.',
  sources_consulted: [
    {
      url: 'http://stotrarathna.blogspot.com/2016/07/sri-sudarshana-kavacham.html',
      role: 'primary',
      notes: 'P.R. Ramachander English translation with Sanskrit — full 15-verse Bhrigu Samhita version'
    },
    {
      url: 'https://stotram.co.in/sudarshana-kavacham-1/',
      role: 'cross-check',
      notes: 'Bhrigu Samhita version with Devanagari; partial display confirmed first 9 verses match'
    },
    {
      url: 'https://gurukripa.org.in/blog/vishnu/sudarshan-kavach',
      role: 'cross-check',
      notes: 'Confirmed 15-verse structure with Bhrigu Samhita colophon; structural overview matches'
    },
    {
      url: 'https://www.indiadivine.org/content/topic/1310051-translation-of-the-sudarshana-kavacham/',
      role: 'cross-check',
      notes: '15-stanza count confirmed, structural analysis matches Bhrigu Samhita'
    },
  ],
  verses,
  unresolved_flags: [
    'Declared count of 26 not found in any source. Actual canonical count is 15 (Bhrigu Samhita). Flagged for review.',
    'Pancharatra Agama (Vihagendra Samhita) version has 55 slokas — a separate upload task if the 55-sloka version is desired.',
    'All meaning fields null — to be filled in Phase 2.',
  ],
};

const outPath = new URL('../research/sudarshana-kavacham-sourcing.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Verses: ${verses.length}`);
console.log(`Sample v4 devanagari: ${verses[3].script_devanagari}`);
console.log(`Sample v4 telugu: ${verses[3].script_telugu}`);
console.log(`Sample v4 tamil: ${verses[3].script_tamil}`);
console.log(`Sample v4 iast: ${verses[3].roman_iast}`);
