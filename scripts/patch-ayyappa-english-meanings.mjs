/**
 * Patches meaning_en for all 18 stanzas with authoritative idiomatic English
 * provided by an Ayyappa devotee with knowledge of the traditional text.
 * Run: node scripts/patch-ayyappa-english-meanings.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '../research/ayyappa-kavacham-sourcing.json');
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

const enSource = 'Native English devotional tradition; meanings provided by an Ayyappa devotee. Cross-referenced with P.R. Ramachander translation (shastras.com / celextel.org).';

const MEANINGS_EN = [
  // 1 — Intro (Devi 1)
  'O Lord! O God of gods! O all-knowing One! O Destroyer of the three cities (Tripurantaka)! With the advent of the dreadful Kali Yuga, the earth has been completely enveloped by great and malevolent forces.',
  // 2 — Intro (Devi 2)
  'Great diseases, vicious beasts, and terrible kings have descended upon the world. Bad dreams, grief, anguish, and wicked men have filled every heart.',
  // 3 — Intro (Devi 3)
  'People have turned away from the path of their own Dharma, their hearts perpetually confused and lost. O Vrishadhvaja (Shiva, whose banner bears the sacred bull)! Tell me — how may they attain spiritual fulfillment and liberation?',
  // 4 — Intro (Ishvara 1)
  'O greatly blessed Goddess! O the very cause of all that is auspicious! Listen — I shall now reveal to you the Kavacham of Maha Shastha, the supreme cosmic ruler, which increases merit and spiritual virtue.',
  // 5 — Intro (Ishvara 2)
  'This armor has the power to freeze fire, water, and armies in their tracks. It pacifies the great elemental forces and wards off terrible diseases.',
  // 6 — Intro (Ishvara 3)
  'It bestows supreme wisdom and is highly auspicious; it specifically dispels the hardships and afflictions of the Kali Age. It provides the highest protection to all beings and increases both lifespan and good health.',
  // 7 — Intro (Ishvara 4)
  'What more needs to be said? Whatever a devoted person sincerely desires, all of that they shall obtain without any doubt, through the grace and blessings of Maha Shastha.',
  // 8 — Viniyoga
  'For this great mantra known as the Maha Shastha Kavacha Stotra: the presiding Sage is Lord Brahma; the poetic meter is Gayatri; the supreme deity is Shri Maha Shastha (Lord Ayyappa). The seed-syllable (Beejam) is Hraam; the power (Shakti) is Hreem; the pin (Keelakam) is Hroom. I perform this recitation to attain the complete grace, blessings, and spiritual realization of Lord Maha Shastha.',
  // 9 — Dhyana
  'I constantly seek refuge in Lord Shastha (Ayyappa), who shines radiantly in the center of a brilliant orb of light, who possesses three divine eyes, and is adorned in celestial garments. In His lotus-like hands, He holds a flower arrow, a sugarcane bow, a gleaming vessel made of rubies, and displays the Abhaya Mudra (gesture of fearlessness and protection). Riding majestically on the shoulders of a caparisoned elephant, He is the omnipresent Lord who captivates and enchants all three worlds.',
  // 10 — Verse 1 (head, forehead, eyes, ears)
  'May Maha Shastha, the supreme ruler, protect my head. May Hariharatmajah, the divine son of Vishnu (Hari) and Shiva (Hara), protect my forehead. May Kamarupi, the Lord who can assume any divine form at will, protect my eyes. May Sarvajno, the all-knowing and omniscient Lord, ever protect my ears.',
  // 11 — Verse 2 (nose, mouth, tongue, chin)
  'May Kripadhyaksho, the Lord who presides over absolute compassion, protect my nose. May Gauripriyah, the beloved of Goddess Gauri (Parvati), always protect my face. May Vedadhyayi, the master and teacher of the Vedas, protect my tongue. May Guruh, the Lord in His supreme form as the universal Guru, protect my chin.',
  // 12 — Verse 3 (throat, shoulders, arms, hands)
  'May Vishuddhatma, the purest and supreme soul, protect my throat. May Surarchitah, the Lord who is worshipped and adored by all celestial Devas, protect my shoulders. May Virupakshah, the Lord who possesses Shiva\'s transcendent divine vision, protect my arms. May Kamalapriyah, the beloved of Goddess Lakshmi (Kamala), protect my hands.',
  // 13 — Verse 4 (heart, abdomen, navel, waist)
  'May Bhutadhipo, the master and lord of all elements and living beings, protect my heart. May Mahabalah, the Lord of immense and infinite strength, protect my torso. May Mahavirah, the exceptionally courageous and heroic Lord, protect my navel. May Kamalaksho, the lotus-eyed Lord, protect my waist.',
  // 14 — Verse 5 (hips, genitals, thighs, knees)
  'May Vishvesha, the Lord of the entire universe, protect my hips. May Guhyarthavit, the knower of all secret and esoteric meanings, always protect my private parts. May Gajarudho, the Lord who rides majestically upon the elephant, protect my thighs. May Vajradhari, the wielder of the unyielding Vajra (thunderbolt), protect my knees.',
  // 15 — Verse 6 (calves, feet, all limbs)
  'May Ankushadharah, the Lord who holds the sacred elephant goad (ankusha), protect my calves. May Mahamatih, the Lord of supreme and ultimate intellect, protect my feet. May Manikanta (Mahamaya-Visharadah), the master of the great cosmic illusion, protect my entire body at all times.',
  // 16 — Phala Shruti 1
  'This sacred armor destroys the entire accumulated mass of all sins. It pacifies severe and debilitating diseases and annihilates the five great sins (Mahapatakas) as described in the Dharma Shastras.',
  // 17 — Phala Shruti 2
  'It bestows wisdom (Jnana) and detachment (Vairagya) upon all people, and grants the fruits of both worldly enjoyment (Bhukti) and final liberation (Mukti). Whatever one sincerely desires, one shall surely obtain it without any doubt.',
  // 18 — Phala Shruti 3
  'The wise and devoted person who recites this at the three sacred Sandhya times (dawn, midday, and dusk) shall attain the highest state of liberation (Moksha). Thus concludes the Shri Maha Shastha Anugraha Kavacham.',
];

if (MEANINGS_EN.length !== data.verses.length) {
  throw new Error(`Count mismatch: ${MEANINGS_EN.length} vs ${data.verses.length} verses`);
}

MEANINGS_EN.forEach((en, i) => {
  data.verses[i].meaning_en = en;
  data.verses[i].meaning_sources.en = enSource;
});

// vrajāmi now confirmed by three traditions — update the flag
data.unresolved_flags = data.unresolved_flags.map(f =>
  f.includes('pampā') || f.includes('Namaskara')
    ? 'Confirmed traditional closing Namaskara verse: "puṇya pampānadī tīre śabarī parvate sthite…" — confirmed independently by Telugu, Hindi, and English devotional traditions as a 4th section of this kavacham. Sanskrit text not yet verified from a print edition. Recommend adding as stanza 19 (label: Namaskara) once the full Sanskrit śloka is sourced.'
    : f
);

writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated meaning_en for all 18 stanzas.');
console.log('v10 en:', data.verses[9].meaning_en.slice(0, 90) + '...');
console.log('v15 en:', data.verses[14].meaning_en);
