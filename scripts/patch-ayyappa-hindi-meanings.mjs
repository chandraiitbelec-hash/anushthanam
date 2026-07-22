/**
 * Patches meaning_hi for all 18 stanzas with authoritative idiomatic Hindi
 * provided by a native Hindi-speaking devotee with knowledge of the traditional text.
 * Also upgrades the dhyana IAST from "bhajāmi" → "vrjāmi" (now confirmed by both
 * Telugu and Hindi recitation traditions) and regenerates all 4 scripts for v9.
 * Run: node scripts/patch-ayyappa-hindi-meanings.mjs
 */
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../research/ayyappa-kavacham-sourcing.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

const hiSource = 'Native Hindi devotional tradition; idiomatic Hindi meanings provided by a Hindi-speaking Ayyappa devotee familiar with traditional text recitation.';

// Fix dhyana IAST: bhajāmi → vrjāmi (confirmed by both Telugu and Hindi traditions)
const toDevanagariNum = n =>
  String(n).split('').map(d => String.fromCharCode(0x0966 + parseInt(d))).join('');
const toIastOut = s => Sanscript.t(s, 'devanagari', 'iast')
  .replace(/[eo]/g, c => c === 'e' ? 'ē' : 'ō');
const fixOm = s => s.replace(/्ॐ/g, 'ों');
const deva = iast => fixOm(Sanscript.t(iast, 'iast', 'devanagari'));

const dhyana_h1 = 'tejomaṇḍalāmadhyagaṃ trinayanaṃ divyāmbarālaṅkṛtaṃ devaṃ puṣpaśarekṣukārmuka lasanmāṇikyapātrābhayam';
const dhyana_h2 = 'bibhrāṇaṃ karapaṅkajaiḥ madagaja skandhādhirūḍhaṃ vibhuṃ śāstāraṃ śaraṇaṃ vrajāmi satataṃ trailokya sammohanam';

const deva_h1 = deva(dhyana_h1);
const deva_h2 = deva(dhyana_h2);
const marker = `॥${toDevanagariNum(9)}॥`;
data.verses[8].script_devanagari = `${deva_h1} ।|${deva_h2} ${marker}`;
data.verses[8].script_telugu = `${Sanscript.t(deva_h1,'devanagari','telugu')}|${Sanscript.t(deva_h2,'devanagari','telugu')}`;
data.verses[8].script_tamil = `${devanagariToTamilSuperscript(deva_h1)}|${devanagariToTamilSuperscript(deva_h2)}`;
data.verses[8].roman_iast = `${toIastOut(deva_h1)}|${toIastOut(deva_h2)}`;

// Update verification note on dhyana
data.verses[8].verification_note = data.verses[8].verification_note
  .replace(/\| Textual variant.*$/, '')
  .trim();
data.verses[8].verification_note += ' | Textual variant resolved: "śaraṇaṃ vrjāmi" (I take refuge — traditional recitation) is confirmed as the canonical reading by both Telugu and Hindi devotional traditions independently. Source text "bhajāmi" from sanatanweb.com appears to be a scribal variant. All 4 scripts updated to "vrjāmi".';

// Update the closing-verse flag now that it is confirmed by two independent traditions
data.unresolved_flags = data.unresolved_flags.map(f =>
  f.includes('pampā') || f.includes('Namaskara')
    ? 'Confirmed traditional closing Namaskara verse: "puṇya pampānadī tīre śabarī parvate sthite…" — confirmed by both Telugu and Hindi recitation traditions as a 4th section of this kavacham. Sanskrit text not yet verified from a print edition. Recommend adding as stanza 19 (label: Namaskara) once the full Sanskrit śloka is sourced.'
    : f
);

const MEANINGS_HI = [
  // 1 — Intro (Devi 1)
  'हे भगवान, हे देवों के देव, हे सर्वज्ञ, हे त्रिपुरांतक! इस भयंकर कलियुग के आगमन से महाभूतों ने पृथ्वी को चारों ओर से घेर लिया है।',
  // 2 — Intro (Devi 2)
  'महारोग, भयंकर दुष्ट प्राणी और क्रूर राजाओं से पृथ्वी आवृत हो गई है। बुरे स्वप्न, शोक, संताप और दुर्वृत्त जन सर्वत्र फैल गए हैं।',
  // 3 — Intro (Devi 3)
  'लोग अपने स्वधर्म के मार्ग से विमुख होकर, सदा हृदय में भटकते रहते हैं। हे वृषध्वज (वृषभ-ध्वज शिव)! उन्हें सिद्धि और मुक्ति कैसे मिलेगी, यह मुझे बताइए।',
  // 4 — Intro (Ishvara 1)
  'हे महाभागे देवी, हे सर्वकल्याण की कारणरूपे! सुनो — मैं तुम्हें महाशास्ता के उस कवच के विषय में बताता हूँ जो पुण्य को बढ़ाने वाला है।',
  // 5 — Intro (Ishvara 2)
  'यह कवच अग्नि, जल और सेना को स्तंभित करने में समर्थ है। यह महाभूतों को शांत करता है और भयंकर रोगों को दूर करता है।',
  // 6 — Intro (Ishvara 3)
  'यह महाज्ञान प्रदान करने वाला, पुण्यदायक है और विशेषतः कलियुग के संतापों को हरता है। यह सभी को सर्वश्रेष्ठ सुरक्षा प्रदान करता है और आयु तथा आरोग्य को बढ़ाता है।',
  // 7 — Intro (Ishvara 4)
  'और अधिक कहने से क्या लाभ? भक्त जो भी कामना करे, वह सब उसे निःसंदेह महाशास्ता की कृपा से प्राप्त होता है।',
  // 8 — Viniyoga
  'इस महाशास्ता कवच स्तोत्र महामंत्र के ऋषि ब्रह्मा हैं, छंद गायत्री है, और देवता स्वयं श्री महाशास्ता (अय्यप्पा स्वामी) हैं। बीज ह्राँ है, शक्ति ह्रीं है, कीलक ह्रूँ है। श्री महाशास्ता की प्रसन्नता और उनकी सम्पूर्ण कृपा-सिद्धि के लिए मैं इस कवच का पाठ कर रहा/रही हूँ।',
  // 9 — Dhyana  (vrjāmi confirmed)
  'जो दिव्य तेजोमंडल के मध्य में विराजमान हैं, जिनके तीन नेत्र हैं, जो दिव्य वस्त्रों से सुशोभित हैं; जिनके कमल-हाथों में फूलों के बाण, गन्ने का धनुष, माणिक्य-जड़ित दिव्य पात्र है और जो अभयमुद्रा से भक्तों को सुरक्षा देते हैं; जो मतवाले हाथी के स्कंध पर सवार हैं और तीनों लोकों को सम्मोहित करने वाले हैं — उन प्रभु महाशास्ता (अय्यप्पा) की शरण में मैं निरंतर जाता/जाती हूँ।',
  // 10 — Verse 1 (head, forehead, eyes, ears)
  'परम शासक महाशास्ता मेरे सिर की रक्षा करें। हरि (विष्णु) और हर (शिव) के पुत्र हरिहरात्मज मेरे माथे की रक्षा करें। इच्छानुसार रूप धारण करने में सक्षम कामरूपी मेरी आँखों की रक्षा करें। सब कुछ जानने वाले सर्वज्ञ भगवान मेरे कानों की सदा रक्षा करें।',
  // 11 — Verse 2 (nose, mouth, tongue, chin)
  'करुणा के अधिपति कृपाध्यक्ष मेरी नासिका की रक्षा करें। माता गौरी को अत्यंत प्रिय गौरीप्रिय स्वामी मेरे मुख की सदा रक्षा करें। वेदों का अध्ययन करने वाले वेदाध्यायी मेरी जिह्वा की रक्षा करें। जगद्गुरु रूप में अय्यप्पा (गुरु) मेरी ठोड़ी की रक्षा करें।',
  // 12 — Verse 3 (throat, shoulders, arms, hands)
  'परम पवित्र और शुद्ध आत्मा स्वरूप विशुद्धात्मा मेरे कंठ की रक्षा करें। देवताओं द्वारा पूजे जाने वाले सुरार्चित मेरे कंधों की रक्षा करें। शिव-स्वरूप विरूपाक्ष मेरी भुजाओं की रक्षा करें। माता लक्ष्मी के प्रिय कमलाप्रिय मेरे हाथों की रक्षा करें।',
  // 13 — Verse 4 (heart, abdomen, navel, waist)
  'समस्त पंचभूतों और गणों के स्वामी भूताधिप मेरे हृदय की रक्षा करें। अत्यंत बलशाली महाबल मेरे शरीर के मध्य भाग की रक्षा करें। परम पराक्रमी महावीर अय्यप्पा मेरी नाभि की रक्षा करें। कमल के समान सुंदर नेत्रों वाले कमलाक्ष मेरी कमर की रक्षा करें।',
  // 14 — Verse 5 (hips, genitals, thighs, knees)
  'ब्रह्मांड के स्वामी विश्वेश मेरे नितंबों की रक्षा करें। गूढ़ अर्थों के ज्ञाता गुह्यार्थवित् सदा मेरे गुह्यांगों की रक्षा करें। गज (हाथी) की सवारी करने वाले गजारूढ़ मेरी जाँघों की रक्षा करें। इंद्र के समान वज्र धारण करने वाले वज्रधारी मेरे घुटनों की रक्षा करें।',
  // 15 — Verse 6 (calves, feet, all limbs)
  'अंकुश धारण करने वाले अंकुशधर मेरी पिंडलियों की रक्षा करें। परम बुद्धिमान महामति मेरे पैरों की रक्षा करें। महामाया की कलाओं में निपुण भगवान मणिकंठ (महामायाविशारद) मेरे पूरे शरीर की हर समय रक्षा करें।',
  // 16 — Phala Shruti 1
  'यह पवित्र कवच समस्त पापों के समूह को काट देता है। यह महारोगों को शांत करता है और धर्मशास्त्र में वर्णित महापातकों को नष्ट करता है।',
  // 17 — Phala Shruti 2
  'यह सभी लोगों को ज्ञान और वैराग्य प्रदान करता है तथा भोग और मुक्ति — दोनों का फल देता है। भक्त जो भी कामना करे, वह सब बिना किसी संशय के प्राप्त होती है।',
  // 18 — Phala Shruti 3
  'जो विद्वान इसे तीनों संध्याओं (प्रातःकाल, मध्याह्न, सायंकाल) में पढ़ता है, वह परमगति (मोक्ष) प्राप्त करता है। इति श्री महाशास्ता अनुग्रह कवचम् सम्पूर्णम्।',
];

if (MEANINGS_HI.length !== data.verses.length) {
  throw new Error(`Count mismatch: ${MEANINGS_HI.length} vs ${data.verses.length} verses`);
}

MEANINGS_HI.forEach((hi, i) => {
  data.verses[i].meaning_hi = hi;
  data.verses[i].meaning_sources.hi = hiSource;
});

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated meaning_hi for all 18 stanzas.');
console.log('dhyana iast (vrjāmi):', data.verses[8].roman_iast.split('|')[1].slice(-30));
console.log('v10 hi:', data.verses[9].meaning_hi.slice(0, 80) + '...');
