/**
 * Uploads Govinda Ashtakam (8 verses, Adi Shankaracharya) to shloka_stanzas.
 * Sourced from the web, no user-supplied text.
 *
 * DISAMBIGUATION: there are (at least) two texts commonly called "Govinda
 * Ashtakam" online. One is the short, extremely famous pastoral verse
 * beginning "kastūri tilakaṁ lalāta paṭale..." (which is more accurately a
 * "Krishnashtakam"/"Govinda Damodara Stotram" and is NOT this one). The
 * text uploaded here is the philosophical ashtakam beginning "satyaṁ
 * jñānam anantaṁ..." with the refrain "praṇamata gōvindaṁ paramānandam" --
 * confirmed as the one specifically attributed to Adi Shankaracharya by
 * kamakoti.org, sanskritpustakalaya.com, vedaboys.com, and every other
 * source checked, matching this site's deity (krishna) and description
 * (Govinda's cosmic/philosophical nature) exactly.
 *
 * The site's metadata declares stanza_count: '8'. Same pattern as
 * kala-bhairava-ashtakam this session: multiple sources (kamakoti.org,
 * sanskritpustakalaya.com, an ISKCON Desire Tree reproduction) independently
 * describe the full text as "8 main verses plus 1 phala-shruti" (9 total),
 * where the 9th verse describes the benefit of reciting "this Govindashtakam"
 * by name -- so the phala-shruti is excluded here, matching the declared 8
 * exactly, the same exclusion made for kala-bhairava-ashtakam's appended
 * phala-shruti verse.
 *
 * Sourcing and cross-checks performed before use:
 *   - Full text of all 8 verses from vedaboys.com, cross-checked against
 *     independent full-verse quotes surfaced via targeted search (verses 1,
 *     3, 4, 5, 7, 8 confirmed word-for-word against kamakoti.org-sourced and
 *     other independent quotations; verses 2 and 6 confirmed via matching
 *     content/meaning glosses from further independent sources, consistent
 *     with vedaboys.com's wording).
 *   - One real discrepancy found and resolved: verse 1's closing pada ends
 *     "kṣmāyā nāthamanātham" (lord of the earth, yet without a lord --
 *     continuing the verse's pattern of paradoxical epithets) per
 *     vedaboys.com; an alternate search-surfaced quote instead ran the
 *     words together as "kṣmāmānātham", which does not parse as cleanly and
 *     breaks the paradox pattern established by every other line of the
 *     verse (anākāśaṁ paramākāśaṁ, anāyāsaṁ paramāyāsam, anākāraṁ
 *     bhuvanākāraṁ) -- kept the grammatically coherent, pattern-consistent
 *     reading.
 *   - Verse 4's third pada showed a second, more minor variant across
 *     sources for its final compound ("gōpī-gōcara-pathikam", vedaboys.com
 *     and one other independent source, vs. an isolated "gōdha-gōcara-dūram"
 *     from one search result where "gōdha" does not parse as a standard
 *     word) -- kept the majority, grammatically valid reading.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session.
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: all 8 verses are 2 long padas each (Sragdhara-family
 * meter), danda after pada 1, numbered double-danda after pada 2 -- this is
 * the punctuation shown consistently across every source checked, not the
 * 4-pada convention used for kala-bhairava-ashtakam's shorter Panchachamara
 * lines; the two ashtakams share the refrain-per-verse shape but not the
 * same meter or pada count.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-govinda-ashtakam.mjs          (dry run)
 *      node scripts/upload-govinda-ashtakam.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'govinda-ashtakam';

const VERSES = [
  {
    padas: ['सत्यं ज्ञानमनन्तं नित्यमनाकाशं परमाकाशं गोष्ठप्राङ्गणरिङ्खणलोलमनायासं परमायासम्', 'मायाकल्पितनानाकारमनाकारं भुवनाकारं क्ष्माया नाथमनाथं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- who is truth, knowledge, and the infinite, eternal, formless yet the supreme space itself; who plays without effort in the courtyard of the cowherd settlement, yet is supreme effort itself; who is formless yet takes on the many forms fashioned by maya and becomes the very form of the universe; who is lord of the earth, yet has no lord above him.',
  },
  {
    padas: ['मृत्स्नामत्सीहेति यशोदाताडनशैशव सन्त्रासं व्यदितवक्त्रालोकितलोकालोकचतुर्दशलोकालिम्', 'लोकत्रयपुरमूलस्तम्भं लोकालोकमनालोकं लोकेशं परमेशं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- who, as a child, feigned terror when Yashoda scolded him for eating clay, yet in whose open mouth was seen the entire row of fourteen worlds, visible and invisible; who is the very pillar supporting the city of the three worlds, the light of all realms yet beyond all light, the lord of the worlds, the supreme lord.',
  },
  {
    padas: ['त्रैविष्टपरिपुवीरघ्नं क्षितिभारघ्नं भवरोगघ्नं कैवल्यं नवनीताहारमनाहारं भुवनाहारम्', 'वैमल्यस्फुटचेतोवृत्तिविशेषाभासमनाभासं शैवं केवलशान्तं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: "Bow to Govinda, the supreme bliss -- the slayer of heaven's mighty foes, the reliever of the earth's burden, the destroyer of the disease of worldly existence, the very state of liberation; who feeds on butter yet needs no food at all, for he is himself the food of the universe; who shines as the clear movement of a pure mind, yet is beyond all such appearance; who is auspicious, wholly at peace.",
  },
  {
    padas: ['गोपालं प्रभुलीलाविग्रहगोपालं कुलगोपालं गोपीखेलनगोवर्धनधृतिलीलालालितगोपालम्', 'गोभिर्निगदित गोविन्दस्फुटनामानं बहुनामानं गोपीगोचरपथिकं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- the cowherd whose very form is the sportive play of the Lord, protector of his cowherd clan, who delighted the cowherd-maidens at play by lifting Govardhana as mere sport; whose clear name Govinda is uttered even by the cows, who bears many names, and who walks the paths within sight of the gopis.',
  },
  {
    padas: ['गोपीमण्डलगोष्ठीभेदं भेदावस्थमभेदाभं शश्वद्गोखुरनिर्घूतोद्धतधूलीधूसरसौभाग्यम्', 'श्रद्धाभक्तिगृहीतानन्दमचिन्त्यं चिन्तितसद्भावं चिन्तामणिमहिमानं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- who moves distinctly among the many circles of gopis, present in every distinction yet appearing as one undivided reality; whose lovely form is grayed by the dust ever kicked up by the cows\' hooves; whose bliss is grasped only through faith and devotion, the inconceivable one whose true nature is realized by contemplation, whose greatness equals that of the wish-fulfilling gem.',
  },
  {
    padas: ['स्नानव्याकुलयोशिद्वस्त्रमुपादायागमुपारूढं व्यदित्सन्तिरथ दिग्वस्त्रा ह्युपुदातुमुपाकर्षन्तम्', 'निर्धूतद्वयशोकविमोहं बुद्धं बुद्धेरन्तस्थं सत्तामात्रशरीरं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- who, taking the garments of the women anxiously bathing, climbed up a tree, drawing them to come and beg for their clothes back; who has shaken off the twin afflictions of grief and delusion, who is awakened, dwelling within the very intellect, whose body is pure existence itself.',
  },
  {
    padas: ['कान्तं कारणकारणमादिमनादिं कालमनाभासं कालिन्दीगतकालियशिरसि मुहुर्नृत्यन्तं नृत्यन्तम्', 'कालं कालकलातीतं कलिताशेषं कलिदोषघ्नं कालत्रयगतिहेतुं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'Bow to Govinda, the supreme bliss -- the beautiful one, the cause of causes, the beginning yet without beginning, time itself yet beyond all appearance; who dances again and again upon the head of the serpent Kaliya in the waters of the Kalindi; who is time, yet beyond the reckoning of time, who knows all things, who destroys the taint of Kali, and who is the very cause of the movement of the three divisions of time.',
  },
  {
    padas: ['वृन्दावनभुवि वृन्दारकगणवृन्दाराध्यं वन्देऽहं कुन्दाभामलमन्दस्मेरसुधानन्दं सुहृदानन्दम्', 'वन्द्याशेषमहामुनिमानसवन्द्यानन्दपदद्वन्द्वं वन्द्याशेषगुणाब्धिं प्रणमत गोविन्दं परमानन्दम्'],
    meaning: 'I bow to him who, in the land of Vrindavana, is worshipped by hosts upon hosts of celestials -- whose gentle smile, spotless as a jasmine bud, pours forth the nectar-bliss of one who delights every friend; whose paired feet of bliss are venerated in the minds of every great sage, who is the very ocean of every praiseworthy virtue. Bow to Govinda, the supreme bliss.',
  },
];

if (VERSES.length !== 8) throw new Error(`Expected 8 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 2) throw new Error(`Verse ${i + 1}: expected 2 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 8 verses, 2 padas each.\n');

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

const rows = VERSES.map((v, i) => {
  const stanzaNumber = i + 1;
  const devaPadas = [...v.padas];
  devaPadas[0] += ' ।'; // danda after pada 1
  devaPadas[1] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after pada 2

  return {
    stanza_number: stanzaNumber,
    stanza_label: `Ślōka ${stanzaNumber}`,
    script_devanagari: devaPadas.join('|'),
    script_telugu: v.padas.map(p => Sanscript.t(p, 'devanagari', 'telugu')).join('|'),
    script_tamil: v.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: v.padas.map(p => addMacrons(Sanscript.t(p, 'devanagari', 'iast'))).join('|'),
    meaning_en: v.meaning,
  };
});

console.log('Sample (all 8 verses):\n');
rows.forEach(r => console.log(r, '\n'));

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: client });

const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEETS_SPREADSHEET_ID, range: 'shloka_stanzas!A:A' });
const existingCount = (res.data.values || []).slice(1).filter(r => r[0] === SLUG).length;
console.log(`Existing shloka_stanzas rows for "${SLUG}": ${existingCount}`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  if (existingCount > 0) {
    console.error(`Refusing to append: ${existingCount} rows already exist for "${SLUG}". This script only handles the pure-append (0 existing rows) case.`);
    process.exit(1);
  }
  const appendRows = rows.map(r => [
    SLUG, r.stanza_number, r.stanza_label, r.script_devanagari, r.script_telugu, r.script_tamil, r.roman_iast,
    r.meaning_en, '', '', '', '',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: appendRows },
  });
  console.log(`Appended ${appendRows.length} rows for "${SLUG}".`);
}
