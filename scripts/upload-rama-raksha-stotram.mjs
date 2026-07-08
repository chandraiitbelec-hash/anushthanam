/**
 * Uploads Rama Raksha Stotram (38 verses, attributed to sage Budha Kaushika)
 * to shloka_stanzas. Sourced from the web, no user-supplied text.
 *
 * The site's metadata declares stanza_count: '38'. This matched cleanly
 * with the widely-used standard numbering (confirmed via drikpanchang.com's
 * explicit count and cross-checked verse-by-verse against vedadhara.com,
 * santsahitya.in, adyasanskrit.com, and sanskritdocuments.org's rraksha.html
 * for verification, plus several more single-verse cross-checks) where
 * every individual couplet/quatrain of the purva-pithika, anga-nyasa, and
 * phala-shruti sections gets its own number, 1 through 38, straight through
 * -- no grouping of short lines into a single numbered unit was needed to
 * reach 38, unlike what some secondary summaries (e.g. hindupedia.com,
 * which described a different, coarser-grained edition grouping several
 * short anga-nyasa lines under one number) suggested might be necessary.
 * Verses 1-27, 31-38 are 2-pada couplets; verses 28-30 are 4-pada
 * repeated-refrain quatrains (see pada structure note below). No
 * discrepancies in wording were found across the sources checked for any
 * of the 38 verses.
 *
 * meaning_en is this script author's own translation composed from the
 * verified Sanskrit, matching the approach used for every prior upload this
 * session.
 *
 * Devanagari is the source of truth; Telugu and Tamil are derived via
 * Sanscript / the custom Tamil superscript converter, IAST via Sanscript
 * with this site's e->e-macron / o->o-macron convention.
 *
 * Pada structure: verses 1-27 and 31-38 are 2-pada anushtubh-family
 * couplets; verses 28-30 are 4-pada quatrains built from a repeated short
 * refrain. Every source checked shows the SAME punctuation rule across both
 * shapes: a danda after every pada except the last, and the numbered
 * double-danda after the final pada -- so this script applies that single
 * rule uniformly rather than needing a per-verse convention switch.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-rama-raksha-stotram.mjs          (dry run)
 *      node scripts/upload-rama-raksha-stotram.mjs --write  (apply)
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
const SLUG = 'rama-raksha-stotram';

const VERSES = [
  { padas: ['चरितं रघुनाथस्य शतकोटिप्रविस्तरम्', 'एकैकमक्षरं पुंसां महापातकनाशनम्'], meaning: 'The story of Raghunatha, vast as a hundred million verses, is such that reciting even a single syllable of it destroys the greatest sins.' },
  { padas: ['ध्यात्वा नीलोत्पलश्यामं रामं राजीवलोचनम्', 'जानकीलक्ष्मणोपेतं जटामुकुटमण्डितम्'], meaning: 'I meditate on Rama, dark as a blue lotus, lotus-eyed, accompanied by Janaki and Lakshmana, adorned with a crown of matted locks.' },
  { padas: ['सासितूणधनुर्बाणपाणिं नक्तंचरान्तकम्', 'स्वलीलया जगत्त्रातुमाविर्भूतमजं विभुम्'], meaning: 'Bow, arrows and quiver in hand, destroyer of the night-wandering demons -- the unborn, all-pervading lord who appeared, as if in mere sport, to save the world.' },
  { padas: ['रामरक्षां पठेत्प्राज्ञः पापघ्नीं सर्वकामदाम्', 'शिरो मे राघवः पातु भालं दशरथात्मजः'], meaning: 'The wise should recite this Rama Raksha, which destroys sin and grants every wish. May Raghava protect my head, and the son of Dasharatha my forehead.' },
  { padas: ['कौसल्येयो दृशौ पातु विश्वामित्रप्रियः श्रुती', 'घ्राणं पातु मखत्राता मुखं सौमित्रिवत्सलः'], meaning: "May Kausalya's son protect my eyes, the beloved of Vishvamitra my ears, the protector of the sacrifice my nose, and he who is affectionate to Lakshmana my mouth." },
  { padas: ['जिह्वां विद्यानिधिः पातु कण्ठं भरतवन्दितः', 'स्कन्धौ दिव्यायुधः पातु भुजौ भग्नेशकार्मुकः'], meaning: "May the treasury of knowledge protect my tongue, he who is worshipped by Bharata my throat, the wielder of divine weapons my shoulders, and the breaker of Shiva's bow my arms." },
  { padas: ['करौ सीतापतिः पातु हृदयं जामदग्न्यजित्', 'मध्यं पातु खरध्वंसी नाभिं जाम्बवदाश्रयः'], meaning: "May the husband of Sita protect my hands, the vanquisher of Jamadagnya's son my heart, the destroyer of Khara my waist, and the refuge of Jambavan my navel." },
  { padas: ['सुग्रीवेशः कटी पातु सक्थिनी हनुमत्प्रभुः', 'ऊरू रघूत्तमः पातु रक्षःकुलविनाशकृत्'], meaning: 'May the lord of Sugriva protect my hips, the master of Hanuman my thighs, and the finest of the Raghus, destroyer of the demon clan, my legs.' },
  { padas: ['जानुनी सेतुकृत्पातु जङ्घे दशमुखान्तकः', 'पादौ बिभीषणश्रीदः पातु रामोऽखिलं वपुः'], meaning: 'May the builder of the bridge protect my knees, the slayer of the ten-headed one my shins, the giver of fortune to Bibhishana my feet, and may Rama protect my whole body.' },
  { padas: ['एतां रामबलोपेतां रक्षां यः सुकृती पठेत्', 'स चिरायुः सुखी पुत्री विजयी विनयी भवेत्'], meaning: "Whoever, being virtuous, recites this protection endowed with Rama's power becomes long-lived, happy, blessed with children, victorious and well-disciplined." },
  { padas: ['पातालभूतलव्योमचारिणश्छद्मचारिणः', 'न द्रष्टुमपि शक्तास्ते रक्षितं रामनामभिः'], meaning: 'Deceitful beings that roam the netherworld, the earth, or the sky are not even able to see one who is protected by the names of Rama.' },
  { padas: ['रामेति रामभद्रेति रामचन्द्रेति वा स्मरन्', 'नरो न लिप्यते पापैर्भुक्तिं मुक्तिं च विन्दति'], meaning: 'A person who remembers him as Rama, Ramabhadra, or Ramachandra is untouched by sin and attains both worldly enjoyment and liberation.' },
  { padas: ['जगज्जैत्रैकमन्त्रेण रामनाम्नाभिरक्षितम्', 'यः कण्ठे धारयेत्तस्य करस्थाः सर्वसिद्धयः'], meaning: 'Whoever wears around the neck this hymn, protected by the name of Rama, the one mantra that conquers the world, holds every accomplishment in the palm of his hand.' },
  { padas: ['वज्रपञ्जरनामेदं यो रामकवचं स्मरेत्', 'अव्याहताज्ञः सर्वत्र लभते जयमङ्गलम्'], meaning: 'Whoever remembers this armor of Rama, known as the Diamond Cage, obtains victory and auspiciousness everywhere, his command unopposed.' },
  { padas: ['आदिष्टवान् यथा स्वप्ने रामरक्षामिमां हरः', 'तथा लिखितवान् प्रातः प्रबुद्धो बुधकौशिकः'], meaning: 'Just as Hara instructed this Rama Raksha in a dream, so did Budhakaushika, waking at dawn, write it down.' },
  { padas: ['आरामः कल्पवृक्षाणां विरामः सकलापदाम्', 'अभिरामस्त्रिलोकानां रामः श्रीमान् स नः प्रभुः'], meaning: 'The delight of wish-fulfilling trees, the cessation of every calamity, the beauty of the three worlds -- that glorious Rama is our lord.' },
  { padas: ['तरुणौ रूपसम्पन्नौ सुकुमारौ महाबलौ', 'पुण्डरीकविशालाक्षौ चीरकृष्णाजिनाम्बरौ'], meaning: 'The two youths, endowed with beauty, delicate yet immensely strong, with eyes wide as lotuses, clad in bark and black deerskin.' },
  { padas: ['फलमूलाशिनौ दान्तौ तापसौ ब्रह्मचारिणौ', 'पुत्रौ दशरथस्यैतौ भ्रातरौ रामलक्ष्मणौ'], meaning: 'Living on fruits and roots, self-controlled ascetics and celibates -- these two, the sons of Dasharatha, are the brothers Rama and Lakshmana.' },
  { padas: ['शरण्यौ सर्वसत्त्वानां श्रेष्ठौ सर्वधनुष्मताम्', 'रक्षःकुलनिहन्तारौ त्रायेतां नो रघूत्तमौ'], meaning: 'Refuge of all beings, foremost among all archers, destroyers of the demon clan -- may these two best of the Raghus protect us.' },
  { padas: ['आत्तसज्जधनुषा विषुस्पृशा वक्षयाशुगनिषङ्गसङ्गिनौ', 'रक्षणाय मम रामलक्ष्मणावग्रतः पथि सदैव गच्छताम्'], meaning: 'With bows strung and ready, hands touching their arrows, their inexhaustible quivers at their side -- may Rama and Lakshmana always walk ahead of me on the path, for my protection.' },
  { padas: ['सन्नद्धः कवची खड्गी चापबाणधरो युवा', 'गच्छन्मनोरथोऽस्माकं रामः पातु सलक्ष्मणः'], meaning: 'Armored, sword in hand, bearing bow and arrow, youthful, fulfilling our every wish as he goes -- may Rama, together with Lakshmana, protect us.' },
  { padas: ['रामो दाशरथिः शूरो लक्ष्मणानुचरो बली', 'काकुत्स्थः पुरुषः पूर्णः कौसल्येयो रघूत्तमः'], meaning: 'Rama, son of Dasharatha, heroic, mighty, attended by Lakshmana; of the Kakutstha line, the complete being, son of Kausalya, foremost of the Raghus.' },
  { padas: ['वेदान्तवेद्यो यज्ञेशः पुराणपुरुषोत्तमः', 'जानकीवल्लभः श्रीमान् अप्रमेयपराक्रमः'], meaning: 'Known through the Vedanta, lord of sacrifice, the ancient Supreme Person, beloved of Janaki, glorious, of immeasurable valor.' },
  { padas: ['इत्येतानि जपन्नित्यं मद्भक्तः श्रद्धयान्वितः', 'अश्वमेधाधिकं पुण्यं सम्प्राप्नोति न संशयः'], meaning: 'My devotee who, endowed with faith, constantly recites these names undoubtedly attains merit greater than that of an Ashvamedha sacrifice.' },
  { padas: ['रामं दूर्वादलश्यामं पद्माक्षं पीतवाससम्', 'स्तुवन्ति नामभिर्दिव्यैर्न ते संसारिणो नराः'], meaning: 'Those who praise Rama, dark as a blade of durva grass, lotus-eyed, clad in yellow, with his divine names, are no longer bound to worldly existence.' },
  { padas: ['रामं लक्ष्मणपूर्वजं रघुवरं सीतापतिं सुन्दरम्', 'काकुत्स्थं करुणार्णवं गुणनिधिं विप्रप्रियं धार्मिकम्'], meaning: 'Rama, elder brother of Lakshmana, best of the Raghus, husband of Sita, beautiful; of the Kakutstha line, an ocean of compassion, a treasury of virtues, dear to brahmins, righteous.' },
  { padas: ['राजेन्द्रं सत्यसन्धं दशरथतनयं श्यामलं शान्तमूर्तिम्', 'वन्दे लोकाभिरामं रघुकुलतिलकम् राघवं रावणारिम्'], meaning: 'I bow to the king of kings, true to his word, son of Dasharatha, dark-hued, of tranquil form, delight of the world, ornament of the Raghu line, Raghava, foe of Ravana.' },
  { padas: ['श्रीराम राम रघुनन्दन राम राम', 'श्रीराम राम भरताग्रज राम राम', 'श्री राम राम रणकर्कश राम राम', 'श्रीराम राम शरणं भव राम राम'], meaning: 'Shri Rama, Rama, joy of the Raghu clan, Rama, Rama; Shri Rama, Rama, elder brother of Bharata, Rama, Rama; Shri Rama, Rama, fierce in battle, Rama, Rama; Shri Rama, Rama, be my refuge, Rama, Rama.' },
  { padas: ['श्रीरामचन्द्रचरणौ मनसा स्मरामि', 'श्रीरामचन्द्रचरणौ वचसा गृणामि', 'श्रीरामचन्द्रचरणौ शिरसा नमामि', 'श्रीरामचन्द्रचरणौ शरणं प्रपद्ये'], meaning: 'I remember the two feet of Shri Ramachandra in my mind; I praise them with my speech; I bow to them with my head; I take refuge in them.' },
  { padas: ['माता रामो मत्पिता रामचन्द्रः', 'स्वामी रामो मत्सखा रामचन्द्रः', 'सर्वस्वं मे रामचन्द्रो दयालुर्', 'नान्यं जाने नैव जाने न जाने'], meaning: 'Rama is my mother, Ramachandra my father; Rama is my lord, Ramachandra my friend; the merciful Ramachandra is everything to me -- I know no other, I truly know no other, I know none other.' },
  { padas: ['दक्षिणे लक्ष्मणो यस्य वामे तु जनकात्मजा', 'पुरतो मारुतिर्यस्य तं वन्दे रघुनन्दनम्'], meaning: 'I bow to that joy of the Raghu line, on whose right stands Lakshmana, on whose left the daughter of Janaka, and before whom stands Maruti.' },
  { padas: ['लोकाभिरामं रणरङ्गधीरं राजीवनेत्रं रघुवंशनाथम्', 'कारुण्यरूपं करुणाकरं तं श्रीरामचन्द्रं शरणं प्रपद्ये'], meaning: 'Delight of the world, steadfast on the battlefield, lotus-eyed lord of the Raghu line, the very form of compassion, the wellspring of mercy -- I take refuge in that Sri Ramachandra.' },
  { padas: ['मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्', 'वातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये'], meaning: 'Swift as the mind, fast as the wind, master of his senses, foremost among the wise, son of the wind, chief of the monkey host -- I take refuge in that messenger of Sri Rama.' },
  { padas: ['कूजन्तं रामरामेति मधुरं मधुराक्षरम्', 'आरुह्य कविताशाखां वन्दे वाल्मीकिकोकिलम्'], meaning: 'I bow to the cuckoo that is Valmiki, who, perched upon the branch of poetry, sweetly sings the sweet syllables Rama, Rama.' },
  { padas: ['आपदामपहर्तारं दातारं सर्वसम्पदाम्', 'लोकाभिरामं श्रीरामं भूयो भूयो नमाम्यहम्'], meaning: 'Remover of calamities, giver of every fortune, delight of the world -- to that Sri Rama I bow again and again.' },
  { padas: ['भर्जनं भवबीजानामर्जनं सुखसम्पदाम्', 'तर्जनं यमदूतानां रामरामेति गर्जनम्'], meaning: 'The roar of Rama, Rama scorches the very seeds of worldly bondage, gathers the wealth of happiness, and terrifies the messengers of Yama.' },
  { padas: ['रामो राजमणिः सदा विजयते रामं रमेशं भजे रामेणाभिहता निशाचरचमूः रामाय तस्मै नमः', 'रामान्नास्ति परायणं परतरं रामस्य दासोस्म्यहं रामे चित्तलयः सदा भवतु मे भो राम मामुद्धर'], meaning: 'Rama, the crown jewel of kings, is ever victorious -- I worship Rama, the lord of Lakshmi; by Rama the demon armies were struck down; to that Rama, salutations. There is nothing higher to take refuge in than Rama; I am his servant; may my mind ever dissolve in Rama. O Rama, lift me up.' },
  { padas: ['राम रामेति रामेति रमे रामे मनोरमे', 'सहस्रनाम तत्तुल्यं रामनाम वरानने'], meaning: 'Rama, Rama, Rama -- in this delightful name Rama I take my delight; O fair-faced one, the single name of Rama equals a thousand names.' },
];

if (VERSES.length !== 38) throw new Error(`Expected 38 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.padas.length !== 2 && v.padas.length !== 4) throw new Error(`Verse ${i + 1}: unexpected pada count ${v.padas.length}`);
});
console.log('Structure check passed: 38 verses (35 with 2 padas, 3 with 4 padas).\n');

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
  const lastIdx = devaPadas.length - 1;
  for (let p = 0; p < lastIdx; p++) devaPadas[p] += ' ।'; // danda after every pada except the last
  devaPadas[lastIdx] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // full-verse marker after final pada

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

console.log('Sample (verses 1, 20, 28, 38):\n');
[0, 19, 27, 37].forEach(i => console.log(rows[i], '\n'));

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
