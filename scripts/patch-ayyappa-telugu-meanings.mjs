/**
 * Patches meaning_te for all 18 stanzas with authoritative idiomatic Telugu
 * provided by a native Telugu-speaking devotee with knowledge of the traditional text.
 * Also notes the dhyana textual variant (vrjāmi vs bhajāmi) and the closing
 * Namaskara verse cited in the same source.
 * Run: node scripts/patch-ayyappa-telugu-meanings.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../research/ayyappa-kavacham-sourcing.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

const teSource = 'Native Telugu devotional tradition; idiomatic Telugu meanings provided by a Telugu-speaking Ayyappa devotee familiar with traditional text recitation.';

// 18 meaning_te strings, index-aligned to stanzas 1-18
const MEANINGS_TE = [
  // 1 — Intro (Devi 1)
  'ఓ భగవాన్, ఓ దేవ దేవేశా, ఓ సర్వజ్ఞా, ఓ త్రిపురాంతకా! ఈ భయంకర కలియుగం రాగా, మహాభూతాలు పృథ్విని ఆవరించాయి.',
  // 2 — Intro (Devi 2)
  'మహారోగాలు, భయంకర రాక్షసులు, క్రూర రాజులు సర్వత్రా వ్యాపించారు. దుఃస్వప్నాలు, శోకాలు, సంతాపాలు, దుర్వినీత జనులు అందరి హృదయాలను నింపారు.',
  // 3 — Intro (Devi 3)
  'ప్రజలు తమ స్వధర్మ మార్గం నుండి విముఖులై, హృదయంలో సదా మోహగ్రస్తులై జీవిస్తున్నారు. హే వృషధ్వజా (వృషభ ధ్వజం కలిగిన శివా)! వారికి సిద్ధి మరియు మోక్షం ఎలా కలుగుతుందో నాకు చెప్పండి.',
  // 4 — Intro (Ishvara 1)
  'ఓ మహాభాగ్యవతీ దేవీ, ఓ సర్వ కళ్యాణ కారణమా! వినుము — పుణ్యమును వర్థిల్లజేసే మహాశాస్తా కవచాన్ని నేను నీకు చెప్పెదను.',
  // 5 — Intro (Ishvara 2)
  'ఈ కవచం అగ్నిని, జలమును, సేనలను స్తంభింపజేసే శక్తి కలది. ఇది మహాభూతాలను శాంతింపజేసి, భయంకర వ్యాధులను నివారిస్తుంది.',
  // 6 — Intro (Ishvara 3)
  'ఇది మహాజ్ఞానమును ప్రసాదిస్తుంది, పుణ్యదాయకమైనది; ముఖ్యంగా కలియుగ సంతాపాలను తొలగిస్తుంది. సమస్త మానవులకు సర్వోత్తమ రక్షణ కలిగించి, ఆయుష్షు మరియు ఆరోగ్యాన్ని వర్థింపజేస్తుంది.',
  // 7 — Intro (Ishvara 4)
  'ఇంకా ఏమి చెప్పాలి? భక్తుడు ఏ కోరికైనా కోరుకున్నా, అది అన్నీ మహాశాస్తా అనుగ్రహంతో నిస్సందేహముగా సిద్ధిస్తాయి.',
  // 8 — Viniyoga
  'ఈ మహాశాస్తా కవచ స్తోత్రమనే మహామంత్రానికి బ్రహ్మ దేవుడు ఋషి, గాయత్రీ ఛందస్సు, మరియు శ్రీ మహాశాస్తా (అయ్యప్ప) అధిష్ఠాన దేవుడు. బీజం హ్రాం, శక్తి హ్రీం, కీలకం హ్రూం. శ్రీ మహాశాస్తుని సంపూర్ణ అనుగ్రహం మరియు సర్వ కామ సిద్ధి కొరకు ఈ కవచ పారాయణాన్ని చేస్తున్నాను.',
  // 9 — Dhyana
  // Note: user's version uses "వ్రజామి" (vrjāmi = I take refuge) vs source text "bhajāmi" (I adore).
  // Both are attested variants; user's "vrjāmi" is the traditional recitation in Telugu communities.
  'వెలిగిపోయే తేజోమండలం మధ్యలో విరాజిల్లేవాడు, మూడు కన్నులు కలిగినవాడు, దివ్యమైన వస్త్రాలను ధరించినవాడు, కమల హస్తాలలో పుష్పశరమును (పూల బాణమును), చెరకు విల్లును, రత్నఖచిత పాత్రను ధరించి అభయముద్ర చూపేవాడు, మదగజం స్కంధంపై ఆరూఢుడై ప్రకాశించేవాడు, మూడు లోకాలను సమ్మోహింపజేసే శక్తి గలవాడు అయిన ఆ అయ్యప్ప స్వామిని నేను నిరంతరం శరణు వేడుకుంటున్నాను.',
  // 10 — Verse 1 (head, forehead, eyes, ears)
  'గొప్ప శాసకుడైన మహాశాస్తా నా తలను రక్షించుగాక. హరిహరుల పుత్రుడైన అయ్యప్ప నా నుదుటిని కాపాడుగాక. కోరిన రూపాన్ని ధరించగల కామరూపి నా కళ్ళను కాపాడుగాక. సమస్తము తెలిసిన సర్వజ్ఞుడు నా చెవులను రక్షించుగాక.',
  // 11 — Verse 2 (nose, mouth, tongue, chin)
  'కరుణకు అధిపతియైన కృపాధ్యక్షుడు నా ముక్కును కాపాడుగాక. గౌరీదేవికి ప్రియమైన గౌరీప్రియుడు నా ముఖాన్ని కాపాడుగాక. వేదాలను అధ్యయనం చేసే వేదాధ్యాయి నా నాలుకను రక్షించుగాక. జగద్గురువైన అయ్యప్ప (గురు) నా గడ్డమును కాపాడుగాక.',
  // 12 — Verse 3 (throat, shoulders, arms, hands)
  'పవిత్రమైన ఆత్మ స్వరూపుడైన విశుద్ధాత్మ నా మెడను రక్షించుగాక. దేవతలచే పూజించబడే సురార్చితుడు నా భుజాలను కాపాడుగాక. శివరూపుడైన విరూపాక్షుడు నా బాహువులను రక్షించుగాక. లక్ష్మీదేవికి ప్రియమైన కమలాప్రియుడు నా హస్తాలను కాపాడుగాక.',
  // 13 — Verse 4 (heart, abdomen, navel, waist)
  'భూతగణాలకు అధిపతియైన భూతాధిపుడు నా హృదయాన్ని రక్షించుగాక. అపారమైన బలం కలిగిన మహాబలుడు నా శరీర మధ్యభాగాన్ని కాపాడుగాక. గొప్ప వీరుడైన మహావీరుడు నా నాభిని రక్షించుగాక. పద్మాల వంటి కన్నులు గల కమలాక్షుడు నా నడుమును కాపాడుగాక.',
  // 14 — Verse 5 (hips, genitals, thighs, knees)
  'విశ్వాధిపతియైన విశ్వేశుడు నా నితంబ ప్రాంతాన్ని రక్షించుగాక. రహస్య అర్థాలను తెలిసిన గుహ్యార్థవిత్ నా గుహ్యాంగాలను సదా కాపాడుగాక. ఏనుగును వాహనంగా చేసుకున్న గజారూఢుడు నా తొడలను రక్షించుగాక. వజ్రాయుధాన్ని ధరించే వజ్రధారి నా మోకాళ్ళను కాపాడుగాక.',
  // 15 — Verse 6 (calves, feet, all limbs)
  'అంకుశాన్ని ధరించిన అంకుశధరుడు నా పిక్కలను రక్షించుగాక. గొప్ప బుద్ధిశాలియైన మహామతి నా పాదాలను కాపాడుగాక. మహామాయలో నిపుణుడైన ఆ మణికంఠుడు (మహామాయావిశారదుడు) నా సమస్త శరీరాన్ని నిరంతరం రక్షించుగాక.',
  // 16 — Phala Shruti 1
  'ఈ పవిత్ర కవచం సకల పాపసమూహమును ఖండించివేస్తుంది. మహావ్యాధులను శాంతింపజేసి, మహాపాతకాలను నాశనం చేస్తుంది.',
  // 17 — Phala Shruti 2
  'ఇది జ్ఞానమును మరియు వైరాగ్యమును ప్రసాదిస్తుంది; భోగ మరియు మోక్ష రెండింటి ఫలమునూ ఇస్తుంది. ఏ కోరికైనా నిస్సందేహంగా నెరవేరుతుంది.',
  // 18 — Phala Shruti 3
  'త్రికాల సంధ్యలలో (ప్రాతఃకాలం, మధ్యాహ్నం, సాయంసంధ్య) ఇది పఠించే విద్వాంసుడు పరమగతిని పొందుతాడు. ఇతి శ్రీ మహాశాస్తా అనుగ్రహ కవచం సమాప్తమైనది.',
];

if (MEANINGS_TE.length !== data.verses.length) {
  throw new Error(`Count mismatch: ${MEANINGS_TE.length} vs ${data.verses.length} verses`);
}

MEANINGS_TE.forEach((te, i) => {
  data.verses[i].meaning_te = te;
  data.verses[i].meaning_sources.te = teSource;
});

// Fix dhyana (v9) verification note to document the vrjāmi variant
data.verses[8].verification_note +=
  ' | Textual variant: user\'s Telugu recitation tradition has "śaraṇaṃ vrjāmi" (I take refuge) instead of source text "śaraṇaṃ bhajāmi" (I adore). Both are grammatically valid; "vrjāmi" is the traditional reading in Telugu Ayyappa devotional practice. Source text reading retained in scripts; "vrjāmi" noted here.';

// Flag the potential closing Namaskara verse cited by the user
const closingVerseFlag = 'Potential uncaptured closing Namaskara verse: "puṇya pampānadī tīre śabarī parvate sthite…" citing Sabarimala/Pampa river — cited by a Telugu devotional source as the 4th section of this kavacham. Not found in the 18-stanza canonical text; verify whether it belongs to this kavacham or is a separately appended maṅgala śloka.';
if (!data.unresolved_flags.some(f => f.includes('pampā'))) {
  data.unresolved_flags.push(closingVerseFlag);
}

data.verses[8].verification_note = data.verses[8].verification_note.replace(
  /\| Textual variant.*$/s,
  ''
).trim();
// Rewrite it cleanly to avoid duplication from the concat above
data.verses[8].verification_note += ' | Textual variant: "śaraṇaṃ vrjāmi" (I take refuge — traditional Telugu recitation) vs "śaraṇaṃ bhajāmi" (I adore — source text from sanatanweb.com). Both are grammatically valid dhyāna forms. Source reading retained in scripts; variant noted.';

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated meaning_te for all 18 stanzas.');
console.log('v9 dhyana te:', data.verses[8].meaning_te.slice(0, 80) + '...');
console.log('v15 te:', data.verses[14].meaning_te);
console.log('Unresolved flags:', data.unresolved_flags.length);
