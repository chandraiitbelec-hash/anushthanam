/**
 * Uploads Devi Aparadha Kshama Stotram (10 verses, Adi Shankaracharya) to
 * shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * DISAMBIGUATION: confirmed this is the specific stotram opening "na
 * mantram no yantram tadapi ca na jane stutimaho..." with the recurring
 * refrain "kuputro jayeta kvacidapi kumata na bhavati" in verses 2-4 --
 * matching this site's declared attribution (Adi Shankaracharya) and deity
 * (durga) exactly, per greenmesg.org, karmkandvidhi.in, and
 * bhaktvatsal.com. This is distinct from other similarly-named "Kshamapana"
 * hymns that exist for other deities/occasions.
 *
 * VERSE-COUNT RECONCILIATION (the honest, non-slam-dunk part): every full
 * source checked (greenmesg.org, drikpanchang.com, karmkandvidhi.in,
 * sanatanveda.com) presents this stotram as a complete, 12-verse text,
 * with the "sampurnam" (complete) colophon appearing only after verse 12,
 * not after verse 10 -- no source was found that treats a 10-verse
 * sequence as independently "complete" with its own colophon. However,
 * verses 1-10 form a clear, self-contained unit (Shikharini meter
 * throughout, each verse an independent confession/plea), while verse 11
 * is a short coda-style addition and verse 12 ("matsamah patakI nasti
 * papaghnI tvatsama na hi...") is an extremely well-known, independently-
 * circulating Sanskrit subhashita in its own right, commonly appended to
 * this stotram in print but not tied to its confession structure the way
 * verses 1-10 are. Given the site's declared count of 10, and following
 * the same pattern already established this session for kala-bhairava-
 * ashtakam, govinda-ashtakam, and shiva-panchakshara-stotram (where a
 * shorter declared count consistently corresponds to core verses with a
 * later-appended tail excluded), this script uploads verses 1-10 and
 * excludes 11-12. Flagging explicitly, per instructions, that this
 * exclusion is a reasoned judgment call based on textual character and
 * session precedent, not a directly sourced "the 10-verse edition ends
 * here" citation -- unlike some of this session's other reconciliations.
 *
 * Sourcing and cross-checks performed on verses 1-10: full text from
 * greenmesg.org, cross-checked word-for-word against karmkandvidhi.in
 * (matched exactly) and bhaktvatsal.com (matched for verses 1-10, with two
 * real discrepancies found and resolved by majority):
 *   - Verse 1: "na mantram" (with the nasal reflected as expected) is
 *     confirmed by karmkandvidhi.in and bhaktvatsal.com; an initial
 *     greenmesg.org fetch rendered it as "na matram", which is not a real
 *     word -- resolved to the majority, grammatically valid reading.
 *   - Verse 5: "parityakta deva vividhavidha-sevakulataya" (the gods have
 *     been neglected, out of weariness with the many prescribed rites) is
 *     confirmed by greenmesg.org and karmkandvidhi.in; bhaktvatsal.com
 *     alone has "parityakta devan vividhavidhi-sevakulataya", which reads
 *     less grammatically cleanly against the participle "parityakta" --
 *     kept the 2-of-3 majority reading.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, deliberately specific to what each verse actually
 * confesses rather than a generic paraphrase, per the task's own
 * instruction that this text's meanings are clear and direct enough to
 * warrant that care.
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: all 10 verses are 4 padas each (Shikharini meter for
 * verses 1-8, Vasantatilaka for verse 9, Indravajra/Upajati for verse 10),
 * danda after pada 2 only, nothing after padas 1/3, numbered double-danda
 * after pada 4 -- confirmed directly from source punctuation and
 * consistent across all three meters used.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-devi-aparadha-kshama-stotram.mjs          (dry run)
 *      node scripts/upload-devi-aparadha-kshama-stotram.mjs --write  (apply)
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
const SLUG = 'devi-aparadha-kshama-stotram';

const VERSES = [
  {
    padas: ['न मन्त्रं नो यन्त्रं तदपि च न जाने स्तुतिमहो', 'न चाह्वानं ध्यानं तदपि च न जाने स्तुतिकथाः', 'न जाने मुद्रास्ते तदपि च न जाने विलपनं', 'परं जाने मातस्त्वदनुसरणं क्लेशहरणम्'],
    meaning: 'I know no mantra, nor any yantra, nor even the greatness of your praise; I know no invocation, no meditation, nor the words of your praise-hymns. I know none of your sacred hand-gestures, nor even how to lament properly before you; I know only this, O Mother -- that following after you removes all affliction.',
  },
  {
    padas: ['विधेरज्ञानेन द्रविणविरहेणालसतया', 'विधेयाशक्यत्वात्तव चरणयोर्या च्युतिरभूत्', 'तदेतत् क्षन्तव्यं जननि सकलोद्धारिणि शिवे', 'कुपुत्रो जायेत क्वचिदपि कुमाता न भवति'],
    meaning: 'Whatever falling-away from your feet has occurred -- through ignorance of the proper rites, through lack of means, through laziness, or through simple incapacity to perform what is prescribed -- forgive that, O Mother, redeemer of all, auspicious one. A bad son may sometimes be born, but a bad mother never is.',
  },
  {
    padas: ['पृथिव्यां पुत्रास्ते जननि बहवः सन्ति सरलाः', 'परं तेषां मध्ये विरलतरलोऽहं तव सुतः', 'मदीयोऽयं त्यागः समुचितमिदं नो तव शिवे', 'कुपुत्रो जायेत क्वचिदपि कुमाता न भवति'],
    meaning: 'O Mother, you have many upright sons on this earth, but among them I am the most unreliable and restless of your children. Yet for you to abandon me for this is not fitting, O auspicious one -- a bad son may sometimes be born, but a bad mother never is.',
  },
  {
    padas: ['जगन्मातर्मातस्तव चरणसेवा न रचिता', 'न वा दत्तं देवि द्रविणमपि भूयस्तव मया', 'तथापि त्वं स्नेहं मयि निरुपमं यत्प्रकुरुषे', 'कुपुत्रो जायेत क्वचिदपि कुमाता न भवति'],
    meaning: 'O mother of the universe, O mother, I have never performed proper service at your feet, nor, O goddess, have I ever offered you any wealth. Yet still you show me matchless affection -- a bad son may sometimes be born, but a bad mother never is.',
  },
  {
    padas: ['परित्यक्ता देवा विविधविधसेवाकुलतया', 'मया पञ्चाशीतेरधिकमपनीते तु वयसि', 'इदानीं चेन्मातस्तव यदि कृपा नापि भविता', 'निरालम्बो लम्बोदरजननि कं यामि शरणम्'],
    meaning: 'Weary of the many kinds of prescribed service, I have neglected the gods now that more than eighty-five years of my life have passed. If even now, O Mother, your grace should fail to come, then, O mother of the pot-bellied Ganesha, without any support, to whom else shall I go for refuge?',
  },
  {
    padas: ['श्वपाको जल्पाको भवति मधुपाकोपमगिरा', 'निरातङ्को रङ्को विहरति चिरं कोटिकनकैः', 'तवापर्णे कर्णे विशति मनुवर्णे फलमिदं', 'जनः को जानीते जननि जपनीयं जपविधौ'],
    meaning: 'An outcaste dog-cooker becomes a speaker whose words are sweet as honey; a pauper, freed of all fear, comes to enjoy millions in gold for a long time -- such is the fruit that follows the instant your mantra-syllables enter the ear, O Parvati. Who, O Mother, truly understands what ought to be recited in the manner of proper japa?',
  },
  {
    padas: ['चिताभस्मालेपो गरलमशनं दिक्पटधरो', 'जटाधारी कण्ठे भुजगपतिहारी पशुपतिः', 'कपाली भूतेशो भजति जगदीशैकपदवीं', 'भवानि त्वत्पाणिग्रहणपरिपाटीफलमिदम्'],
    meaning: 'He who smears himself with the ash of the funeral pyre, who eats poison, who wears the directions themselves as his garment, who bears matted locks, who wears the serpent-king as a necklace, the lord of creatures, the skull-bearer, the lord of ghosts -- that Pashupati alone attains the singular rank of lord of the universe. O Bhavani, this is the sole fruit of the ritual of having taken your hand in marriage.',
  },
  {
    padas: ['न मोक्षस्याकाङ्क्षा भवविभववाञ्छापि च न मे', 'न विज्ञानापेक्षा शशिमुखि सुखेच्छापि न पुनः', 'अतस्त्वां संयाचे जननि जननं यातु मम वै', 'मृडानी रुद्राणी शिव शिव भवानीति जपतः'],
    meaning: 'I have no longing for liberation, nor any desire for worldly power or wealth, nor any wish for philosophical knowledge, O moon-faced one, nor even any wish for happiness. So this alone I beg of you, Mother -- let my life pass away while I repeat, again and again, Mridani, Rudrani, Shiva Shiva Bhavani.',
  },
  {
    padas: ['नाराधितासि विधिना विविधोपचारैः', 'किं रुक्षचिन्तनपरैर्न कृतं वचोभिः', 'श्यामे त्वमेव यदि किञ्चन मय्यनाथे', 'धत्से कृपामुचितमम्ब परं तवैव'],
    meaning: 'I have not worshipped you properly with the various prescribed offerings; what use, then, are these harsh, anxious thoughts and unaccomplished words? O dark one, if you nonetheless show even a little compassion to me, helpless as I am, that is entirely fitting of you alone, O Mother.',
  },
  {
    padas: ['आपत्सु मग्नः स्मरणं त्वदीयं', 'करोमि दुर्गे करुणार्णवेशि', 'नैतच्छठत्वं मम भावयेथाः', 'क्षुधातृषार्ता जननीं स्मरन्ति'],
    meaning: 'Sunk in calamities, I now remember you, O Durga, O queen of the ocean of compassion. Do not take this as mere deceit on my part -- children afflicted by hunger and thirst naturally remember their mother.',
  },
];

if (VERSES.length !== 10) throw new Error(`Expected 10 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 4) throw new Error(`Verse ${i + 1}: expected 4 padas, got ${v.padas.length}`);
});
console.log('Structure check passed: 10 verses, 4 padas each.\n');

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
  devaPadas[1] += ' ।'; // danda after pada 2
  devaPadas[3] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after pada 4

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

console.log('Sample (all 10 verses):\n');
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
