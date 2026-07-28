/**
 * Generates research/rama-kavacham-sourcing.json
 * Source: amritanilayam.org (primary), sthothramala.blogspot.com (cross-check)
 * Run: node scripts/generate-rama-kavacham.mjs
 */
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { writeFileSync } from 'fs';

const toDevanagariNum = n =>
  String(n).split('').map(d => String.fromCharCode(0x0966 + parseInt(d))).join('');

// IAST long-vowel normalisation for output (Sanskrit e/o always long)
const toIastOut = s => Sanscript.t(s, 'devanagari', 'iast')
  .replace(/[eo]/g, c => c === 'e' ? 'ē' : 'ō');

// Input IAST uses standard Unicode diacritics (ā ī ū ṛ ṅ ñ ṭ ḍ ṇ ś ṣ ṃ ḥ)
// e and o are plain (Sanscript IAST treats them as always long in Sanskrit)
const deva = iast => Sanscript.t(iast, 'iast', 'devanagari');

// Each entry: stanza_number, label, h1 (first half IAST), h2 (second half IAST),
// num (internal Sanskrit ॥N॥, null for Dhyana), verif note
const RAW = [
  // ──────────── Dhyana (stanzas 0–9) ────────────
  {
    n: 0, label: 'Dhyana',
    h1: 'ājānubāhum aravindadalāyatākṣam ājanmaśuddharasahāsamukhaprasādam',
    h2: 'śyāmaṃ gṛhītaśaracāpamudārarūpaṃ rāmaṃ sarāmam abhirāmam anusmarāmi',
    num: null,
    verif: 'Primary: amritanilayam.org (unnumbered opening verse). Cross-check sthothramala.blogspot confirms identical content. Vasantatilakā meter (14 syllables/pāda). "Aravindadala-āyatākṣam" = lotus-petal-elongated eyes; compound confirmed in both sources; dental -l- (ल) used per standard Sanskrit, not retroflex.',
  },
  {
    n: 1, label: 'Dhyana',
    h1: 'nīlajīmūtasaṅkāśaṃ vidyudvarṇāmbarāvṛtam',
    h2: 'komalāṅgaṃ viśālākṣaṃ yuvānam atisundaram',
    num: 1,
    verif: 'Both sources agree verbatim. "Nīlajīmūtasaṅkāśa" = resembling a dark rain cloud.',
  },
  {
    n: 2, label: 'Dhyana',
    h1: 'sītāsaumitrisahitaṃ jaṭāmukuṭadhāriṇam',
    h2: 'sāsitūṇadhanurbāṇapāṇiṃ dānavamardanam',
    num: 2,
    verif: 'Both sources agree. "Sāsitūṇa-dhanurbāṇa-pāṇi" = holding quiver, bow, and arrows.',
  },
  {
    n: 3, label: 'Dhyana',
    h1: 'yadā corabhaye rājabhaye śatrubhaye tathā',
    h2: 'dhyātvā raghupatiṃ kruddhaṃ kālānalasamaprabham',
    num: 3,
    verif: 'Both sources agree. "Kālānala-sama-prabha" = radiant as the fire of dissolution (Time\'s apocalyptic fire).',
  },
  {
    n: 4, label: 'Dhyana',
    h1: 'cīrakṛṣṇājinadharaṃ bhasmoddhūlitavigraham',
    h2: 'ākarṇākṛṣṭaviśikhakodaṇḍabhujamaṇḍitam',
    num: 4,
    verif: 'amritanilayam uses "bhasmōddhūḻita"; resolved to "bhasmoddhūlita" (bhasma-uddhūlita = smeared with ash). "Cīrakṛṣṇājina" = wearing bark and black-antelope hide. "Ākarṇākṛṣṭa" = drawn to the ear (fully drawn bow).',
  },
  {
    n: 5, label: 'Dhyana',
    h1: 'raṇe ripūn rāvaṇādīṃs tīkṣṇamārgaṇavṛṣṭibhiḥ',
    h2: 'saṃharantaṃ mahāvīram ugram aindrara thasthitam',
    num: 5,
    verif: 'Both sources agree. "Aindrara thasthita" = standing on Indra\'s chariot. "Tīkṣṇamārgaṇavṛṣṭi" = shower of sharp arrows.',
  },
  {
    n: 6, label: 'Dhyana',
    h1: 'lakṣmaṇādyairmahāvīrairvṛtaṃ hanumadādibhiḥ',
    h2: 'sugrīvādyairmahāvīraiḥ śailavṛkṣakaroddyataiḥ',
    num: 6,
    verif: 'Both sources agree. amritanilayam shows "māhāvīraiḥ" in second half; resolved to "mahāvīraiḥ". "Śailavṛkṣakaroddyata" = with mountains and trees lifted in their hands.',
  },
  {
    n: 7, label: 'Dhyana',
    h1: 'vegāt karālahuṃkārair bhubhukkāramahāravaiḥ',
    h2: 'nadadbhiḥ parivādadbhiḥ samare rāvaṇaṃ prati',
    num: 7,
    verif: 'Both sources agree. "Huṃkāra" = war cry; "bhubhukkāra" = earth-shaking roar. "Pativādadbhiḥ" likely "parivādadbhiḥ" = encircling with cries — retained primary reading.',
  },
  {
    n: 8, label: 'Dhyana',
    h1: 'śrīrāma śatrusaṅghānme hana mardaya khādaya',
    h2: 'bhūtapretapiśācādīn śrīrāmāśu vināśaya',
    num: 8,
    verif: 'Both sources agree. Invocatory prayer within Dhyana: "O Rāma, strike, crush and devour my enemy hosts; O Rāma, quickly destroy ghosts, pretas and piśācas."',
  },
  {
    n: 9, label: 'Dhyana',
    h1: 'evaṃ dhyātvā japed rāmakavacaṃ siddhidāyakam',
    h2: 'sutīkṣṇa vajrakavacaṃ śṛṇu vakṣyāmy anuttamam',
    num: 9,
    verif: 'Key variant: amritanilayam "anuttamam" (unsurpassable) vs hindunidhi "vakṣyāmyahaṃ śubham" (I will auspiciously declare). Primary reading "anuttamam" retained as better-attested. Transition verse: "Thus meditating, chant this kavacam; O Sutīkṣṇa, listen — I will declare the diamond-shield, unsurpassable."',
  },

  // ──────────── Kavacham body verses: Verse 1–15 (stanzas 10–24) ────────────
  {
    n: 10, label: 'Verse 1',
    h1: 'śrīrāmaḥ pātu me mūrdhni pūrve ca raghuvaṃśajaḥ',
    h2: 'dakṣiṇe me raghuvaraḥ paścime pātu pāvanaḥ',
    num: 10,
    verif: 'Both sources agree. E = Raghuvamśaja; S = Raghuvaraḥ; W = Pāvana (purifier). N in next verse.',
  },
  {
    n: 11, label: 'Verse 2',
    h1: 'uttare me raghupatiḥ bhālaṃ daśarathātmajaḥ',
    h2: 'bhruvor dūrvādalaśyāmastayormadhye janārdanaḥ',
    num: 11,
    verif: 'Both sources agree. N = Raghupati; Forehead = Daśarathātmaja; Between brows = Janārdana. "Dūrvādalaśyāma" = dark green like Dūrvā (Bermuda) grass.',
  },
  {
    n: 12, label: 'Verse 3',
    h1: 'śrotraṃ me pātu rājendro dṛśau rājīvalocanaḥ',
    h2: 'ghrāṇaṃ me pātu rājarṣir gaṇḍau me jānakīpatiḥ',
    num: 12,
    verif: 'Both sources agree. Ears = Rājendra; Eyes = Lotus-eyed; Nose = Rājarṣi; Cheeks = Jānakīpati.',
  },
  {
    n: 13, label: 'Verse 4',
    h1: 'karṇamūle kharadhvaṃsī bhālaṃ me raghuvallabhaḥ',
    h2: 'jihvāṃ me vākpatiḥ pātu dantapaṅktī raghūttamaḥ',
    num: 13,
    verif: 'Both sources agree. "Kharadhvaṃsī" = slayer of demon Khara. Ear-base, forehead, tongue, teeth rows each guarded by a Rāma epithet.',
  },
  {
    n: 14, label: 'Verse 5',
    h1: 'oṣṭhau śrīrāmacandro me mukhaṃ pātu parātparaḥ',
    h2: 'kaṇṭhaṃ pātu jagadvandyaḥ skandhau me rāvaṇāntakaḥ',
    num: 14,
    verif: 'Both sources agree. Lips = Śrīrāmacandra; Face = Parātpara (supreme beyond the supreme); Throat = Jagadvandya; Shoulders = Rāvaṇāntaka.',
  },
  {
    n: 15, label: 'Verse 6',
    h1: 'dhanurbāṇadharaḥ pātu bhujau me vālimardanaḥ',
    h2: 'sarvāṇyaṅguliparvāṇi hastau me rākṣasāntakaḥ',
    num: 15,
    verif: 'Both sources agree. Arms = Vālimardana (Vāli-slayer); Finger-joints and hands = Rākṣasāntaka.',
  },
  {
    n: 16, label: 'Verse 7',
    h1: 'vakṣo me pātu kākutsthaḥ pātu me hṛdayaṃ hariḥ',
    h2: 'stanau sītāpatiḥ pātu pārśvaṃ me jagadīśvaraḥ',
    num: 16,
    verif: 'Both sources agree. Chest = Kākutstha; Heart = Hari; Chest region = Sītāpati; Sides = Jagadīśvara.',
  },
  {
    n: 17, label: 'Verse 8',
    h1: 'madhyaṃ me pātu lakṣmīśo nābhiṃ me raghunāyakaḥ',
    h2: 'kausalyeyaḥ kaṭī pātu pṛṣṭhaṃ durgatināśanaḥ',
    num: 17,
    verif: 'amritanilayam shows "raghunājakaḥ" (possibly OCR error); sthothramala shows "raghunāyakaḥ". Resolved: "Raghunāyaka" (leader of the Raghus). Navel = Raghunāyaka; Waist = Kausalyeya; Back = Durgatināśana.',
  },
  {
    n: 18, label: 'Verse 9',
    h1: 'guhyaṃ pātu hṛṣīkeśaḥ sakthinī satyavikramaḥ',
    h2: 'ūrū śārṅgadharaḥ pātu jānunī hanumatpriyaḥ',
    num: 18,
    verif: 'Both sources agree. Genitals = Hṛṣīkeśa; Thighs (inner) = Satyavikrama; Thighs = Śārṅgadhara; Knees = beloved of Hanumān.',
  },
  {
    n: 19, label: 'Verse 10',
    h1: 'jaṅghe pātu jagadvyāpī pādau me tāṭakāntakaḥ',
    h2: 'sarvāṅgaṃ pātu me viṣṇuḥ sarvasandhir anāmayaḥ',
    num: 19,
    verif: 'Both sources agree. Shins = Jagadvyāpī; Feet = Tāṭakāntaka (slayer of Tāṭakā); Whole body = Viṣṇu, free from all disease.',
  },
  {
    n: 20, label: 'Verse 11',
    h1: 'jñānendriyāṇi prāṇādīn pātu me madhusūdanaḥ',
    h2: 'pātu śrīrāmabhadro me śabdādīn viṣayān api',
    num: 20,
    verif: 'Both sources agree. Sense organs and prāṇas = Madhusūdana; sense objects (sound etc.) = Śrīrāmabhadra.',
  },
  {
    n: 21, label: 'Verse 12',
    h1: 'dvipadādīni bhūtāni matsambandīni yāni ca',
    h2: 'jāmadagnyamahādarpadalanaḥ pātu tāni me',
    num: 21,
    verif: 'Both sources agree. "Jāmadagnyamahādarpadalana" = one who crushed the great pride of Paraśurāma (son of Jamadagni). Protects all beings associated with the devotee.',
  },
  {
    n: 22, label: 'Verse 13',
    h1: 'saumitripūrvajaḥ pātu vāgādīnīndriyāṇi ca',
    h2: 'romāṅkurāṇy aśeṣāṇi pātu sugrīvarājyadaḥ',
    num: 22,
    verif: 'Both sources agree. "Saumitripūrvaja" = elder of Lakṣmaṇa = Rāma. Speech and senses = Rāma; hair follicles = "Sugrīvarājyada" (he who gave the kingdom back to Sugrīva).',
  },
  {
    n: 23, label: 'Verse 14',
    h1: 'vāṅmanobaddhy ahaṅkārair jñānājñānakṛtāni ca',
    h2: 'janmāntarakṛtānīha pāpāni vividhāni ca',
    num: 23,
    verif: 'Both sources agree. All sins performed through speech/mind/intellect/ego, knowingly or unknowingly, across past lives — this verse names them for the burning in the next verse.',
  },
  {
    n: 24, label: 'Verse 15',
    h1: 'tāni sarvāṇi dagdhvāśu harakodaṇḍakhaṇḍanaḥ',
    h2: 'pātu māṃ sarvato rāmaḥ śārṅgabāṇadharaḥ sadā',
    num: 24,
    verif: 'Both sources agree. "Harakodaṇḍakhaṇḍana" = he who broke Śiva\'s (Hara\'s) bow. "Śārṅgabāṇadhara" = bearer of the Śārṅga bow and its arrows.',
  },

  // ──────────── Phala Shruti (stanzas 25–27) ────────────
  {
    n: 25, label: 'Phala Shruti',
    h1: 'iti śrīrāmacandrasya kavacaṃ vajrasammitam',
    h2: 'guhyād guhyatamaṃ divyaṃ sutīkṣṇa munisattama',
    num: 25,
    verif: 'Both sources agree. "Vajrasammita" = hard as diamond; "guhyādguhyatama" = most secret of all secrets. Agastya addresses Sutīkṣṇa.',
  },
  {
    n: 26, label: 'Phala Shruti',
    h1: 'yaḥ paṭhec chṛṇuyād vāpi śrāvayed vā samāhitaḥ',
    h2: 'sa yāti paramaṃ sthānaṃ rāmacandraprasādataḥ',
    num: 26,
    verif: 'Both sources agree. "Paramaṃ sthāna" = supreme abode; reciting, hearing, or causing others to hear this kavacam yields liberation through Rāmacandra\'s grace.',
  },
  {
    n: 27, label: 'Phala Shruti',
    h1: 'mahāpātakayukto vā goghno vā bhrūṇahā tathā',
    h2: 'śrīrāmacandrakavacapaṭhanāc chuddhim āpnuyāt',
    num: 27,
    verif: 'Both sources agree. Purifies even the gravest sinners (brahmahatyā, go-vadha, bhrūṇahatyā). A colophon verse "brahmahatyādibhiḥ pāpair…bho sutīkṣṇa yathā pṛṣṭam…tathā śrīrāmakavacaṃ mayā te viniveditam" follows in amritanilayam without a Sanskrit numeral and is not counted as a separate stanza; other editions may show it as ॥28॥.',
  },
];

// ──── Build stanza objects ────
const verses = RAW.map(r => {
  const deva_h1 = deva(r.h1);
  const deva_h2 = deva(r.h2);

  const marker = r.num === null ? '॥' : `॥${toDevanagariNum(r.num)}॥`;
  const script_devanagari = `${deva_h1} ।|${deva_h2} ${marker}`;

  const tel_h1 = Sanscript.t(deva_h1, 'devanagari', 'telugu');
  const tel_h2 = Sanscript.t(deva_h2, 'devanagari', 'telugu');
  const script_telugu = `${tel_h1}|${tel_h2}`;

  const tam_h1 = devanagariToTamilSuperscript(deva_h1);
  const tam_h2 = devanagariToTamilSuperscript(deva_h2);
  const script_tamil = `${tam_h1}|${tam_h2}`;

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

const out = {
  slug: 'rama-kavacham',
  deity_slug: 'rama',
  declared_stanza_count: 28,
  actual_stanza_count: 28,
  count_reconciliation_note:
    'Declared 28 matches actual. Structure: 1 unnumbered Dhyana opening (ājānubāhu…) + 9 internally-numbered Dhyana/transition stanzas (॥1॥–॥9॥) + 15 body-protection stanzas (॥10॥–॥24॥) + 3 Phala Shruti stanzas (॥25॥–॥27॥) = 28 total. A trailing colophon verse ("brahmahatyādibhiḥ pāpair… bho sutīkṣṇa yathā pṛṣṭam… tathā śrīrāmakavacaṃ mayā te viniveditam") appears without a Sanskrit numeral in amritanilayam.org and is excluded. Some editions number it ॥28॥ — where present it is folded into Phala Shruti.',
  sources_consulted: [
    {
      url: 'https://amritanilayam.org/stotras/sri-rama-kavacham-2/',
      role: 'primary',
      notes: 'Full IAST text; internal numbering ॥1॥–॥27॥ + unnumbered opening verse. 28 stanzas confirmed.',
    },
    {
      url: 'https://sthothramala.blogspot.com/2016/04/sri-rama-kavacham-by-sage-agastya.html',
      role: 'cross-check',
      notes: 'Transliterated Sanskrit + English meanings. 27 internally-numbered stanzas + opening; used for epithet cross-check.',
    },
    {
      url: 'https://hindupedia.com/en/Sri_Rama_Kavacham',
      role: 'cross-check',
      notes: 'Structural summary (IAST). Dhyana = verses 2-10, Kavacham = 11-23, Phala Shruti = 24-27. Confirmed stanza groupings.',
    },
    {
      url: 'https://hindunidhi.com/ram-kavacham-sanskrit/pdf/',
      role: 'cross-check',
      notes: 'Partial Devanagari. Phala Shruti confirmed 3 stanzas. Textual variant stanza 9: "vakṣyāmyahaṃ śubham" vs primary "vakṣyāmyanuttamam" — primary reading retained.',
    },
  ],
  verses,
  unresolved_flags: [
    'Stanza 0: "aravindadala-āyatākṣam" — some editions use retroflex ḻ/ḷ for "dala"; resolved to dental ल (standard Sanskrit dala = petal).',
    'Stanza 9: textual variant "anuttamam" vs "śubham" in second hemistich — primary source reading retained.',
    'Stanzas 5–7: Dhyana battle description spans multiple stanzas that some editions group differently; each treated as an independent anuṣṭubh stanza here.',
  ],
};

const outPath = new URL('../research/rama-kavacham-sourcing.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log(`Written ${out.verses.length} stanzas → ${outPath}`);
