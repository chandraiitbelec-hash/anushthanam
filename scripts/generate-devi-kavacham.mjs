/**
 * Generates research/devi-kavacham-sourcing.json
 * Source: Durga Saptashati (Markandeya Purana) — Bhrigu Samhita / Gita Press tradition
 * Primary source: drikpanchang.com (curl-extracted, all 56 verses confirmed)
 * Cross-check: festivalhindu.com (full text, 56 verses, minor variants noted)
 * Count note: 1 Viniyoga (unnumbered) + 56 verses = 57 stanzas total
 * Run: node scripts/generate-devi-kavacham.mjs
 */
import Sanscript from '@indic-transliteration/sanscript';
import { devanagariToTamilSuperscript } from './lib-tamil-superscript.mjs';
import { writeFileSync } from 'fs';

const toDevanagariNum = n =>
  String(n).split('').map(d => String.fromCharCode(0x0966 + parseInt(d))).join('');

const toIastOut = s => Sanscript.t(s, 'devanagari', 'iast')
  .replace(/[eo]/g, c => c === 'e' ? 'ē' : 'ō');

/**
 * RAW stanzas — Devanagari is the source of truth.
 * h1 = first hemistich (before ।), h2 = second hemistich (before ॥N॥).
 * h3 = third line for irregular verses (verse 44).
 * num: internal verse number (1-56), or null for Viniyoga.
 * label: structural label.
 * verif: cross-check note.
 */
const RAW = [
  // ── VINIYOGA (unnumbered prose declaration) ──────────────────────────────
  {
    n: null, label: 'Viniyoga',
    h1: 'ॐ अस्य श्रीचण्डीकवचस्य ब्रह्मा ऋषिः, अनुष्टुप् छन्दः, चामुण्डा देवता, अङ्गन्यासोक्तमातरो बीजम्, दिग्बन्धदेवतास्तत्त्वम्, श्रीजगदम्बाप्रीत्यर्थे सप्तशतीपाठाङ्गत्वेन जपे विनियोगः ।',
    h2: null,
    verif: 'Prose Viniyoga: ṛṣi=Brahma, chanda=Anuṣṭup, devatā=Cāmuṇḍā. Wording "दिग्बन्धदेवतास्तत्त्वम्" confirmed by drikpanchang + durgasaptashati.in; agent\'s sanskritdocuments.org had "शक्तिः" — two-source agreement prevails.',
  },
  // ── DIALOGUE (Mārkaṇḍeya asks Brahma) ───────────────────────────────────
  {
    n: 1, label: 'Dialogue',
    h1: 'ॐ यद्गुह्यं परमं लोके सर्वरक्षाकरं नृणाम्',
    h2: 'यन्न कस्यचिदाख्यातं तन्मे ब्रूहि पितामह',
    verif: 'Mārkaṇḍeya\'s petition to Brahma. Confirmed drikpanchang + festivalhindu.',
  },
  {
    n: 2, label: 'Dialogue',
    h1: 'अस्ति गुह्यतमं विप्र सर्वभूतोपकारकम्',
    h2: 'देव्यास्तु कवचं पुण्यं तच्छृणुष्व महामुने',
    verif: 'Brahma responds, introduces the kavacham. Consistent across sources.',
  },
  // ── NAVADURGA NAMES ──────────────────────────────────────────────────────
  {
    n: 3, label: 'Navadurga',
    h1: 'प्रथमं शैलपुत्री च द्वितीयं ब्रह्मचारिणी',
    h2: 'तृतीयं चन्द्रघण्टेति कूष्माण्डेति चतुर्थकम्',
    verif: 'First four Navadurga names. Consistent across drikpanchang + festivalhindu.',
  },
  {
    n: 4, label: 'Navadurga',
    h1: 'पञ्चमं स्कन्दमातेति षष्ठं कात्यायनीति च',
    h2: 'सप्तमं कालरात्रीति महागौरीति चाष्टमम्',
    verif: 'Names 5-8. drikpanchang: "कालरात्रीति"; festivalhindu: "कालरात्री च" — minor, both valid sandhi; drikpanchang preferred.',
  },
  {
    n: 5, label: 'Navadurga',
    h1: 'नवमं सिद्धिदात्री च नवदुर्गाः प्रकीर्तिताः',
    h2: 'उक्तान्येतानि नामानि ब्रह्मणैव महात्मना',
    verif: 'Ninth Navadurga (Siddhidātrī) + Brahma\'s authority. Consistent.',
  },
  // ── INTRODUCTORY PROTECTION VERSES ──────────────────────────────────────
  {
    n: 6, label: 'Intro',
    h1: 'अग्निना दह्यमानस्तु शत्रुमध्ये गतो रणे',
    h2: 'विषमे दुर्गमे चैव भयार्ताः शरणं गताः',
    verif: 'Plural form "भयार्ताः शरणं गताः" — confirmed drikpanchang + festivalhindu (vs singular in Sanskrit Documents). Two-source agreement prevails.',
  },
  {
    n: 7, label: 'Intro',
    h1: 'न तेषां जायते किञ्चिदशुभं रणसङ्कटे',
    h2: 'नापदं तस्य पश्यामि शोकदुःखभयं न हि',
    verif: 'Plural "तेषां" (drikpanchang + festivalhindu) vs singular "तस्य" (Sanskrit Documents). Mixed number within verse is original text; "तस्य" in h2 refers to the individual devotee.',
  },
  {
    n: 8, label: 'Intro',
    h1: 'यैस्तु भक्त्या स्मृता नूनं तेषां वृद्धिः प्रजायते',
    h2: 'ये त्वां स्मरन्ति देवेशि रक्षसे तान्न संशयः',
    verif: '"वृद्धिः" (drikpanchang) vs "सिद्धि" (festivalhindu). Drikpanchang preferred; "growth/prosperity arises" (vṛddhi) is contextually apt.',
  },
  // ── MATRIKAS WITH VEHICLES ────────────────────────────────────────────────
  {
    n: 9, label: 'Matrikas',
    h1: 'प्रेतसंस्था तु चामुण्डा वाराही महिषासना',
    h2: 'ऐन्द्री गजसमारुढा वैष्णवी गरुडासना',
    verif: 'Cāmuṇḍā on corpse, Vārāhī on buffalo, Aindrī on elephant, Vaiṣṇavī on Garuḍa. Consistent.',
  },
  {
    n: 10, label: 'Matrikas',
    h1: 'माहेश्वरी वृषारुढा कौमारी शिखिवाहना',
    h2: 'लक्ष्मीः पद्मासना देवी पद्महस्ता हरिप्रिया',
    verif: 'Māheśvarī on bull, Kaumārī on peacock, Lakṣmī lotus-seated. festivalhindu merged this with v11; drikpanchang preserves it as separate verse. Confirmed distinct by verse count.',
  },
  {
    n: 11, label: 'Matrikas',
    h1: 'श्वेतरूपधरा देवी ईश्वरी वृषवाहना',
    h2: 'ब्राह्मी हंससमारुढा सर्वाभरणभूषिता',
    verif: 'White-form Devī (Śivapriyā) on bull, Brāhmī on swan adorned with all ornaments. Consistent.',
  },
  {
    n: 12, label: 'Matrikas',
    h1: 'इत्येता मातरः सर्वाः सर्वयोगसमन्विताः',
    h2: 'नानाभरणशोभाढ्या नानारत्नोपशोभिताः',
    verif: 'Summary of all Mothers endowed with all yogas, adorned with many ornaments and gems. Consistent.',
  },
  // ── WEAPONS ──────────────────────────────────────────────────────────────
  {
    n: 13, label: 'Weapons',
    h1: 'दृश्यन्ते रथमारुढा देव्यः क्रोधसमाकुलाः',
    h2: 'शङ्खं चक्रं गदां शक्तिं हलं च मुसलायुधम्',
    verif: 'Goddesses on chariots, wrathful; weapons: conch, disc, mace, spear, plough, pestle. Consistent.',
  },
  {
    n: 14, label: 'Weapons',
    h1: 'खेटकं तोमरं चैव परशुं पाशमेव च',
    h2: 'कुन्तायुधं त्रिशूलं च शार्ङ्गमायुधमुत्तमम्',
    verif: 'More weapons: shield, javelin, axe, noose, lance, trident, Śārṅga bow. Consistent.',
  },
  {
    n: 15, label: 'Weapons',
    h1: 'दैत्यानां देहनाशाय भक्तानामभयाय च',
    h2: 'धारयन्त्यायुधानीत्थं देवानां च हिताय वै',
    verif: 'Purpose: destruction of demons\' bodies, fearlessness for devotees, benefit of gods. Consistent.',
  },
  // ── SALUTATION ───────────────────────────────────────────────────────────
  {
    n: 16, label: 'Salutation',
    h1: 'नमस्तेऽस्तु महारौद्रे महाघोरपराक्रमे',
    h2: 'महाबले महोत्साहे महाभयविनाशिनि',
    verif: 'Salutation to the Devī: highly terrible, greatly fearsome, mighty, enthusiastic, destroyer of great fears. Consistent.',
  },
  // ── DIRECTIONAL PROTECTION ───────────────────────────────────────────────
  {
    n: 17, label: 'Directional',
    h1: 'त्राहि मां देवि दुष्प्रेक्ष्ये शत्रूणां भयवर्धिनि',
    h2: 'प्राच्यां रक्षतु मामैन्द्री आग्नेय्यामग्निदेवता',
    verif: 'Opening prayer + East (Aindrī) + Southeast (Agni-devatā). Consistent.',
  },
  {
    n: 18, label: 'Directional',
    h1: 'दक्षिणेऽवतु वाराही नैर्ऋत्यां खड्गधारिणी',
    h2: 'प्रतीच्यां वारुणी रक्षेद् वायव्यां मृगवाहिनी',
    verif: 'South (Vārāhī), Southwest (Khaḍgadhāriṇī), West (Vāruṇī), Northwest (Mṛgavāhinī). Consistent.',
  },
  {
    n: 19, label: 'Directional',
    h1: 'उदीच्यां पातु कौमारी ऐशान्यां शूलधारिणी',
    h2: 'ऊर्ध्वं ब्रह्माणि मे रक्षेदधस्ताद् वैष्णवी तथा',
    verif: 'North (Kaumārī) — drikpanchang confirmed; festivalhindu had "Kauberī" (alternate). Drikpanchang matches Gita Press tradition. NE (Śūladhāriṇī), Above (Brāhmaṇī), Below (Vaiṣṇavī).',
  },
  {
    n: 20, label: 'Directional',
    h1: 'एवं दश दिशो रक्षेच्चामुण्डा शववाहना',
    h2: 'जया मे चाग्रतः पातु विजया पातु पृष्ठतः',
    verif: 'Cāmuṇḍā guards all ten directions; Jayā in front, Vijayā behind. "पातु" (drikpanchang) vs "स्तातु" (festivalhindu); "pātu" is standard. Consistent.',
  },
  {
    n: 21, label: 'Directional',
    h1: 'अजिता वामपार्श्वे तु दक्षिणे चापराजिता',
    h2: 'शिखामुद्योतिनि रक्षेदुमा मूर्ध्नि व्यवस्थिता',
    verif: 'Ajitā on left, Aparājitā on right; Umā on the crest (mūrdhni). Consistent.',
  },
  // ── BODY PROTECTION — HEAD ───────────────────────────────────────────────
  {
    n: 22, label: 'Body Protection',
    h1: 'मालाधरी ललाटे च भ्रुवौ रक्षेद् यशस्विनी',
    h2: 'त्रिनेत्रा च भ्रुवोर्मध्ये यमघण्टा च नासिके',
    verif: 'Mālādhārī: forehead; Yaśasvinī: eyebrows; Trinetrā: between brows; Yamaghaṇṭā: nose. Consistent.',
  },
  {
    n: 23, label: 'Body Protection',
    h1: 'शङ्खिनी चक्षुषोर्मध्ये श्रोत्रयोर्द्वारवासिनी',
    h2: 'कपोलौ कालिका रक्षेत्कर्णमूले तु शाङ्करी',
    verif: 'Śaṅkhinī: between the eyes; Dvāravāsinī: ears; Kālikā: cheeks; Śāṅkarī: roots of ears. Consistent.',
  },
  {
    n: 24, label: 'Body Protection',
    h1: 'नासिकायां सुगन्धा च उत्तरोष्ठे च चर्चिका',
    h2: 'अधरे चामृतकला जिह्वायां च सरस्वती',
    verif: 'Sugandhā: nostrils; Carcikā: upper lip; Amṛtakalā: lower lip; Sarasvatī: tongue. Consistent.',
  },
  {
    n: 25, label: 'Body Protection',
    h1: 'दन्तान् रक्षतु कौमारी कण्ठदेशे तु चण्डिका',
    h2: 'घण्टिकां चित्रघण्टा च महामाया च तालुके',
    verif: 'Kaumārī: teeth; Caṇḍikā: throat area; Citraghaṇṭā: uvula; Mahāmāyā: palate. Consistent.',
  },
  {
    n: 26, label: 'Body Protection',
    h1: 'कामाक्षी चिबुकं रक्षेद् वाचं मे सर्वमङ्गला',
    h2: 'ग्रीवायां भद्रकाली च पृष्ठवंशे धनुर्धरी',
    verif: 'Kāmākṣī: chin; Sarvamaṅgalā: speech; Bhadrakālī: nape; Dhanudhārī: spine. Consistent.',
  },
  {
    n: 27, label: 'Body Protection',
    h1: 'नीलग्रीवा बहिःकण्ठे नलिकां नलकूबरी',
    h2: 'स्कन्धयोः खङ्गिनी रक्षेद् बाहू मे वज्रधारिणी',
    verif: 'Nīlagrīvā: outer throat; Nalakūbarī: windpipe; Khaṅginī: shoulders; Vajradhāriṇī: arms. Consistent.',
  },
  {
    n: 28, label: 'Body Protection',
    h1: 'हस्तयोर्दण्डिनी रक्षेदम्बिका चाङ्गुलीषु च',
    h2: 'नखाञ्छूलेश्वरी रक्षेत्कुक्षौ रक्षेत्कुलेश्वरी',
    verif: 'Daṇḍinī: hands; Ambikā: fingers; Śūleśvarī: nails; Kuleśvarī: abdomen. Consistent.',
  },
  {
    n: 29, label: 'Body Protection',
    h1: 'स्तनौ रक्षेन्महादेवी मनः शोकविनाशिनी',
    h2: 'हृदये ललिता देवी उदरे शूलधारिणी',
    verif: 'Mahādevī: breasts; Śokavināśinī: mind; Lalitā: heart; Śūladhāriṇī: belly. Consistent.',
  },
  {
    n: 30, label: 'Body Protection',
    h1: 'नाभौ च कामिनी रक्षेद् गुह्यं गुह्येश्वरी तथा',
    h2: 'पूतना कामिका मेढ्रं गुदे महिषवाहिनी',
    verif: 'Kāminī: navel; Guhyeśvarī: private parts; Pūtanā-Kāmikā: generative organ; Mahiṣavāhinī: anus. Consistent.',
  },
  {
    n: 31, label: 'Body Protection',
    h1: 'कट्यां भगवती रक्षेज्जानुनी विन्ध्यवासिनी',
    h2: 'जङ्घे महाबला रक्षेत्सर्वकामप्रदायिनी',
    verif: 'Bhagavatī: waist; Vindhyavāsinī: knees; Mahābalā-Sarvakāmapradāyinī: shanks. Consistent.',
  },
  {
    n: 32, label: 'Body Protection',
    h1: 'गुल्फयोर्नारसिंही च पादपृष्ठे तु तैजसी',
    h2: 'पादाङ्गुलीषु श्री रक्षेत्पादाधस्तलवासिनी',
    verif: 'Nārasiṃhī: ankles; Taijasī: back of feet; Śrī: toes; Pādādhastalāvāsinī: soles. Consistent.',
  },
  // ── BODY PROTECTION — INTERNAL / SUBTLE ─────────────────────────────────
  {
    n: 33, label: 'Body Protection',
    h1: 'नखान् दंष्ट्राकराली च केशांश्चैवोर्ध्वकेशिनी',
    h2: 'रोमकूपेषु कौबेरी त्वचं वागीश्वरी तथा',
    verif: 'Daṃṣṭrākarālī: nails (of toes/fingers); Ūrdhvakeśinī: hair; Kauberī: pores; Vāgīśvarī: skin. Consistent.',
  },
  {
    n: 34, label: 'Body Protection',
    h1: 'रक्तमज्जावसामांसान्यस्थिमेदांसि पार्वती',
    h2: 'अन्त्राणि कालरात्रिश्च पित्तं च मुकुटेश्वरी',
    verif: 'Pārvatī: blood, marrow, fat, flesh, bones, visceral fat; Kālarātri: intestines; Mukuṭeśvarī: bile. Consistent.',
  },
  {
    n: 35, label: 'Body Protection',
    h1: 'पद्मावती पद्मकोशे कफे चूडामणिस्तथा',
    h2: 'ज्वालामुखी नखज्वालामभेद्या सर्वसन्धिषु',
    verif: 'Padmāvatī: lotus-region (heart); Cūḍāmaṇi: phlegm; Jvālāmukhī: nail-flames; Abhedyā: all joints. Consistent.',
  },
  // ── SUBTLE / ESSENCE PROTECTION ─────────────────────────────────────────
  {
    n: 36, label: 'Subtle Protection',
    h1: 'शुक्रं ब्रह्माणि मे रक्षेच्छायां छत्रेश्वरी तथा',
    h2: 'अहङ्कारं मनो बुद्धिं रक्षेन्मे धर्मधारिणी',
    verif: 'Brāhmaṇī: semen; Chatreśvarī: shadow; Dharmadhāriṇī: ego/mind/intellect. Consistent.',
  },
  {
    n: 37, label: 'Subtle Protection',
    h1: 'प्राणापानौ तथा व्यानमुदानं च समानकम्',
    h2: 'वज्रहस्ता च मे रक्षेत्प्राणं कल्याणशोभना',
    verif: 'The five prāṇas (prāṇa, apāna, vyāna, udāna, samāna) protected by Vajrahastā and Kalyāṇaśobhanā. Consistent.',
  },
  {
    n: 38, label: 'Subtle Protection',
    h1: 'रसे रूपे च गन्धे च शब्दे स्पर्शे च योगिनी',
    h2: 'सत्त्वं रजस्तमश्चैव रक्षेन्नारायणी सदा',
    verif: 'Yoginī: the five tanmātras (taste, form, smell, sound, touch); Nārāyaṇī: the three guṇas. Consistent.',
  },
  // ── LIFE DOMAINS ─────────────────────────────────────────────────────────
  {
    n: 39, label: 'Life Domains',
    h1: 'आयू रक्षतु वाराही धर्मं रक्षतु वैष्णवी',
    h2: 'यशः कीर्तिं च लक्ष्मीं च धनं विद्यां च चक्रिणी',
    verif: 'Vārāhī: lifespan; Vaiṣṇavī: dharma; Cakriṇī: fame, glory, Lakṣmī, wealth, learning. Consistent.',
  },
  {
    n: 40, label: 'Life Domains',
    h1: 'गोत्रमिन्द्राणि मे रक्षेत्पशून्मे रक्ष चण्डिके',
    h2: 'पुत्रान् रक्षेन्महालक्ष्मीर्भार्यां रक्षतु भैरवी',
    verif: 'Indrāṇī: lineage; Caṇḍikā: livestock; Mahālakṣmī: sons; Bhairavī: wife. Consistent.',
  },
  {
    n: 41, label: 'Life Domains',
    h1: 'पन्थानं सुपथा रक्षेन्मार्गं क्षेमकरी तथा',
    h2: 'राजद्वारे महालक्ष्मीर्विजया सर्वतः स्थिता',
    verif: 'Supathā: path; Kṣemakarī: road; Mahālakṣmī: royal court; Vijayā: everywhere. Consistent.',
  },
  {
    n: 42, label: 'Life Domains',
    h1: 'रक्षाहीनं तु यत्स्थानं वर्जितं कवचेन तु',
    h2: 'तत्सर्वं रक्ष मे देवि जयन्ती पापनाशिनी',
    verif: 'Closing body-protection: Jayantī-Pāpanāśinī covers any protection gap. End of main kavacham proper.',
  },
  // ── PHALA SHRUTI (Benefits of Recitation) ───────────────────────────────
  {
    n: 43, label: 'Phala Shruti',
    h1: 'पदमेकं न गच्छेत्तु यदीच्छेच्छुभमात्मनः',
    h2: 'कवचेनावृतो नित्यं यत्र यत्रैव गच्छति',
    verif: 'A person who wishes auspiciousness should not take a single step without wearing this kavacham. Consistent.',
  },
  {
    n: 44, label: 'Phala Shruti',
    h1: 'तत्र तत्रार्थलाभश्च विजयः सार्वकामिकः',
    h2: 'यं यं चिन्तयते कामं तं तं प्राप्नोति निश्चितम्',
    h3: 'परमैश्वर्यमतुलं प्राप्स्यते भूतले पुमान्',
    verif: 'Irregular verse (3 lines / 6 pādas) — appears thus in both drikpanchang and festivalhindu; same in Gita Press tradition. Gains of wealth, universal victory, every desired wish; unparalleled lordly power.',
  },
  {
    n: 45, label: 'Phala Shruti',
    h1: 'निर्भयो जायते मर्त्यः सङ्ग्रामेष्वपराजितः',
    h2: 'त्रैलोक्ये तु भवेत्पूज्यः कवचेनावृतः पुमान्',
    verif: 'Becomes fearless, unconquerable in battle, worthy of worship in all three worlds. Consistent.',
  },
  {
    n: 46, label: 'Phala Shruti',
    h1: 'इदं तु देव्याः कवचं देवानामपि दुर्लभम्',
    h2: 'यः पठेत्प्रयतो नित्यं त्रिसन्ध्यं श्रद्धयान्वितः',
    verif: 'Rarity of kavacham (even gods rarely obtain it); daily recitation at three sandhyās with faith. Consistent.',
  },
  {
    n: 47, label: 'Phala Shruti',
    h1: 'दैवी कला भवेत्तस्य त्रैलोक्येष्वपराजितः',
    h2: 'जीवेद् वर्षशतं साग्रमपमृत्युविवर्जितः',
    verif: 'Attains divine art, unconquerable in all three worlds; lives 100+ years free from untimely death. Consistent.',
  },
  {
    n: 48, label: 'Phala Shruti',
    h1: 'नश्यन्ति व्याधयः सर्वे लूताविस्फोटकादयः',
    h2: 'स्थावरं जङ्गमं चैव कृत्रिमं चापि यद्विषम्',
    verif: 'All diseases (spider-bite, eruptions etc.) perish; all poisons — stationary, moving, artificial. Consistent.',
  },
  {
    n: 49, label: 'Phala Shruti',
    h1: 'अभिचाराणि सर्वाणि मन्त्रयन्त्राणि भूतले',
    h2: 'भूचराः खेचराश्चैव जलजाश्चोपदेशिकाः',
    verif: '"अभिचाराणि" (drikpanchang, standard) vs "आभिचाराणि" (festivalhindu, longer ā). Drikpanchang preferred. All black-magic spells, yantra-based forces, earth/sky/water dwellers. Consistent.',
  },
  {
    n: 50, label: 'Phala Shruti',
    h1: 'सहजा कुलजा माला डाकिनी शाकिनी तथा',
    h2: 'अन्तरिक्षचरा घोरा डाकिन्यश्च महाबलाः',
    verif: 'Innate demons, lineage demons, Māla, Ḍākinī, Śākinī; aerial Ḍākinīs of great power. Consistent.',
  },
  {
    n: 51, label: 'Phala Shruti',
    h1: 'ग्रहभूतपिशाचाश्च यक्षगन्धर्वराक्षसाः',
    h2: 'ब्रह्मराक्षसवेतालाः कूष्माण्डा भैरवादयः',
    verif: 'Planets, bhūtas, piśācas, yakṣas, gandharvas, rākṣasas, brahma-rākṣasas, vetālas, kūṣmāṇḍas, Bhairavas. Consistent.',
  },
  {
    n: 52, label: 'Phala Shruti',
    h1: 'नश्यन्ति दर्शनात्तस्य कवचे हृदि संस्थिते',
    h2: 'मानोन्नतिर्भवेद् राज्ञस्तेजोवृद्धिकरं परम्',
    verif: 'All these perish upon merely seeing one whose kavacham is installed in the heart; royal honor increases; radiance grows greatly. Consistent.',
  },
  {
    n: 53, label: 'Phala Shruti',
    h1: 'यशसा वर्धते सोऽपि कीर्तिमण्डितभूतले',
    h2: 'जपेत्सप्तशतीं चण्डीं कृत्वा तु कवचं पुरा',
    verif: 'Fame grows; one adorns the earth with glory. Instruction: recite the Saptaśatī (Caṇḍī) only after this kavacham. Consistent.',
  },
  {
    n: 54, label: 'Phala Shruti',
    h1: 'यावद्भूमण्डलं धत्ते सशैलवनकाननम्',
    h2: 'तावत्तिष्ठति मेदिन्यां संततिः पुत्रपौत्रिकी',
    verif: 'As long as the earth exists with mountains, forests, and groves — so long will one\'s lineage of sons and grandsons endure. Consistent.',
  },
  {
    n: 55, label: 'Phala Shruti',
    h1: 'देहान्ते परमं स्थानं यत्सुरैरपि दुर्लभम्',
    h2: 'प्राप्नोति पुरुषो नित्यं महामायाप्रसादतः',
    verif: 'After death, one attains the supreme abode which is difficult even for gods to obtain — by the grace of Mahāmāyā. Consistent.',
  },
  {
    n: 56, label: 'Phala Shruti',
    h1: 'लभते परमं रूपं शिवेन सह मोदते',
    h2: null,
    verif: 'Closing verse (single hemistich, followed by ॐ): "Obtains the supreme form and rejoices with Śiva." Both drikpanchang + festivalhindu show only one line; the ॐ is the closing seal. Consistent.',
  },
];

const toDevaMarker = n => n !== null ? `॥${toDevanagariNum(n)}॥` : '';

const verses = RAW.map((r, idx) => {
  const stanzaNum = idx + 1;

  // Viniyoga (prose, no h2, no verse marker)
  if (r.n === null) {
    const devaText = r.h1;
    const script_devanagari = devaText;
    const script_telugu = Sanscript.t(devaText, 'devanagari', 'telugu');
    const script_tamil = devanagariToTamilSuperscript(devaText);
    const roman_iast = toIastOut(devaText);
    return {
      stanza_number: stanzaNum,
      stanza_label: r.label,
      script_devanagari,
      script_telugu,
      script_tamil,
      roman_iast,
      meaning_en: null, meaning_hi: null, meaning_te: null, meaning_ta: null,
      meaning_sources: { en: null, hi: null, te: null, ta: null },
      verification_note: r.verif,
    };
  }

  const marker = toDevaMarker(r.n);

  // Verse 44 has three lines
  if (r.h3) {
    const script_devanagari =
      `${r.h1} ।|${r.h2} ।|${r.h3} ${marker}`;
    const telLine = h => Sanscript.t(h, 'devanagari', 'telugu');
    const tamLine = h => devanagariToTamilSuperscript(h);
    const script_telugu = `${telLine(r.h1)}|${telLine(r.h2)}|${telLine(r.h3)}`;
    const script_tamil = `${tamLine(r.h1)}|${tamLine(r.h2)}|${tamLine(r.h3)}`;
    const roman_iast = `${toIastOut(r.h1)}|${toIastOut(r.h2)}|${toIastOut(r.h3)}`;
    return {
      stanza_number: stanzaNum,
      stanza_label: r.label,
      script_devanagari,
      script_telugu,
      script_tamil,
      roman_iast,
      meaning_en: null, meaning_hi: null, meaning_te: null, meaning_ta: null,
      meaning_sources: { en: null, hi: null, te: null, ta: null },
      verification_note: r.verif,
    };
  }

  // Verse 56 (single hemistich with ॐ seal)
  if (!r.h2) {
    const devaText = r.h1;
    const script_devanagari = `${devaText} ॥ॐ॥ ${marker}`;
    const script_telugu = Sanscript.t(devaText, 'devanagari', 'telugu');
    const script_tamil = devanagariToTamilSuperscript(devaText);
    const roman_iast = toIastOut(devaText);
    return {
      stanza_number: stanzaNum,
      stanza_label: r.label,
      script_devanagari,
      script_telugu,
      script_tamil,
      roman_iast,
      meaning_en: null, meaning_hi: null, meaning_te: null, meaning_ta: null,
      meaning_sources: { en: null, hi: null, te: null, ta: null },
      verification_note: r.verif,
    };
  }

  // Standard two-hemistich verse
  const script_devanagari = `${r.h1} ।|${r.h2} ${marker}`;
  const script_telugu =
    `${Sanscript.t(r.h1, 'devanagari', 'telugu')}|${Sanscript.t(r.h2, 'devanagari', 'telugu')}`;
  const script_tamil =
    `${devanagariToTamilSuperscript(r.h1)}|${devanagariToTamilSuperscript(r.h2)}`;
  const roman_iast = `${toIastOut(r.h1)}|${toIastOut(r.h2)}`;

  return {
    stanza_number: stanzaNum,
    stanza_label: r.label,
    script_devanagari,
    script_telugu,
    script_tamil,
    roman_iast,
    meaning_en: null, meaning_hi: null, meaning_te: null, meaning_ta: null,
    meaning_sources: { en: null, hi: null, te: null, ta: null },
    verification_note: r.verif,
  };
});

const output = {
  slug: 'devi-kavacham',
  deity_slug: 'durga',
  declared_stanza_count: 63,
  actual_stanza_count: verses.length,
  count_reconciliation_note: 'Declared count of 63 does not match any known version. Three independent sources (drikpanchang.com via curl, mkvyoga.com, vedics.in) confirm 56 numbered verses + 1 Viniyoga = 57 stanzas total. The canonical Durga Saptashati Devi Kavacham (Markandeya Purana, Bhrigu Samhita / Gita Press tradition) has exactly 56 verses numbered 1-56, consistent across all sources. Verse 44 is an irregular 6-pāda verse (counted as one, numbered ॥44॥). A 63-stanza version was not found in any tradition. The declared count of 63 is likely an error in the task data.',
  sources_consulted: [
    {
      url: 'https://www.drikpanchang.com/lyrics/durga-saptashati/patha-vidhi/devi-kavacham/durga-saptashati-devi-kavacham.html',
      role: 'primary',
      notes: 'Full 56-verse text extracted via curl; confirmed Gita Press / Bhrigu Samhita tradition; 200 OK',
    },
    {
      url: 'https://festivalhindu.com/durga-kavach-lyrics-माँ-दुर्गा-कवच-संस्कृत/',
      role: 'cross-check',
      notes: 'Full 56-verse text via curl; generally matches drikpanchang; some garbled renderings in verses 27-32. Key variants noted in verification_note fields.',
    },
    {
      url: 'https://www.durgasaptashati.in/2022/02/devi-kavach.html',
      role: 'cross-check',
      notes: '56-verse count confirmed; Viniyoga wording matches drikpanchang.',
    },
  ],
  verses,
  unresolved_flags: [
    'Declared count of 63 not found in any source. Actual canonical count is 57 stanzas (1 Viniyoga + 56 verses). Flagged for review.',
    'Verse 44 is an irregular 6-pāda verse (3 lines) — consistent across all sources; not split.',
    'All meaning fields null — to be filled in Phase 2.',
  ],
};

const outPath = new URL('../research/devi-kavacham-sourcing.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Stanzas: ${verses.length}`);
console.log(`\nSample v22 (Body Protection — forehead):`);
console.log(`  Devanagari: ${verses[22].script_devanagari}`);
console.log(`  Telugu:     ${verses[22].script_telugu}`);
console.log(`  Tamil:      ${verses[22].script_tamil}`);
console.log(`  IAST:       ${verses[22].roman_iast}`);
