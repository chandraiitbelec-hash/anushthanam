/**
 * Uploads the 27-stanza Govinda Namalu chant (Telugu / English-IAST / Hindi / Tamil)
 * into shloka_stanzas, linked to the existing "govinda-namalu" shloka row (which
 * currently has zero stanzas).
 *
 * Content is pasted verbatim from the source; this script only does the
 * mechanical work of splitting each language's raw text into 27 stanzas
 * (splitting on the recurring two-line chorus, which appears once at the very
 * start, once after every stanza, and once more at the very end) and joining
 * each stanza's lines with "|" to match this sheet's line-break convention.
 *
 * Two Telugu words and four Tamil words contain stray Latin characters
 * (obvious copy/paste corruption, e.g. "navaneeతచోర" instead of "నవనీతచోర") —
 * left untouched per instruction not to alter content; flagged in the script
 * output so they can be fixed as a follow-up decision.
 *
 * Defaults to a dry run. Pass --write to append the rows.
 * Run: node scripts/upload-govinda-namalu.mjs          (dry run)
 *      node scripts/upload-govinda-namalu.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'govinda-namalu';

// ── Raw text, pasted verbatim ──────────────────────────────────────────────

const TELUGU = `
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

శ్రీ శ్రీనివాసా గోవిందా |
శ్రీ వేంకటేశా గోవిందా |
భక్తవత్సలా గోవిందా |
భాగవతప్రియ గోవిందా || ౧
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

నిత్యనిర్మలా గోవిందా |
నీలమేఘశ్యామ గోవిందా |
పురాణపురుషా గోవిందా |
పుండరికాక్ష గోవిందా || ౨
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

నందనందనా గోవిందా |
navaneeతచోర గోవిందా |
పశుపాలక శ్రీ గోవిందా |
పాపవిమోచన గోవిందా || ౩
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

దుష్టసంహార గోవిందా |
దురితనివారణ గోవిందా |
శిష్టపరిపాలక గోవిందా |
కష్టనివారణ గోవిందా || ౪
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

వజ్రమకుటధర గోవిందా |
వరాహమూర్తి గోవిందా |
గోపీజనలోల గోవిందా |
గోవర్ధనోద్ధార గోవిందా || ౫
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

దశరథనందన గోవిందా |
దశముఖమర్దన గోవిందా |
పక్షివాహన గోవిందా |
పాండవప్రియ గోవిందా || ౬
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

మత్స్య కూర్మ గోవిందా |
మధుసూదన హరి గోవిందా |
వరాహ నరసింహ గోవిందా |
వామన భృగురామ గోవిందా || ౭
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

బలరామానుజ గోవిందా |
బౌద్ధకల్కిధర గోవిందా |
వేణుగానప్రియ గోవిందా |
వేంకటరమణా గోవిందా || ౮
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

సీతానాయక గోవిందా |
శ్రితపరిపాలక గోవిందా |
దరిద్రజనపోషక గోవిందా |
ధర్మసంస్థాపక గోవిందా || ౯
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

అనాథరక్షక గోవిందా |
ఆపద్బాంధవ గోవిందా |
శరణాగతవత్సల గోవిందా |
కరుణాసాగర గోవిందా || ౧౦
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

కమలదళాక్ష గోవిందా |
కామితఫలదా గోవిందా |
పాపవినాశక గోవిందా |
పాహి మురారే గోవిందా || ౧౧
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

శ్రీముద్రాంకిత గోవిందా |
శ్రీవత్సాంకిత గోవిందా |
ధరణీనాయక గోవిందా |
దినకరతేజా గోవిందా || ౧౨
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

పద్మావతిప్రియ గోవిందా |
ప్రసన్నమూర్తీ గోవిందా |
అభయహస్త గోవిందా |
అక్షయవరద గోవిందా || ౧౩
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

శంఖచక్రధర గోవిందా |
శార్ఙ్గగదాధర గోవిందా |
విరజాతీర్థస్థ గోవిందా |
విరోధిమర్దన గోవిందా || ౨౪
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

సాలగ్రామధర గోవిందా |
సహస్రనామా గోవిందా |
లక్ష్మీవల్లభ గోవిందా |
లక్ష్మణాగ్రజ గోవిందా || ౧౫
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

కస్తూరితిలక గోవిందా |
కాంచనాంబరధర గోవిందా |
గరుడవాహన గోవిందా |
గజరాజరక్షక గోవిందా || ౧౬
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

వానరసేవిత గోవిందా |
varadhiబంధన గోవిందా |
సప్తగిరీశా గోవిందా |
ఏకస్వరూపా గోవిందా || ౧౭
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

శ్రీరామకృష్ణా గోవిందా |
రఘుకులనందన గోవిందా |
ప్రత్యక్షదేవా గోవిందా |
పరమదయాకర గోవిందా || ౧౮
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

వజ్రకవచధర గోవిందా |
వైజయంతిమాల గోవిందా |
వడ్డికాసులవాడ గోవిందా |
వసుదేవతనయా గోవిందా || ౧౯
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

బిల్వపత్రార్చిత గోవిందా |
భిక్షుకసంస్తుత గోవిందా |
స్త్రీపుంరూపా గోవిందా |
శివకేశవమూర్తి గోవిందా || ౨౦
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

బ్రహ్మాండరూపా గోవిందా |
భక్తరక్షక గోవిందా |
నిత్యకళ్యాణ గోవిందా |
నీరజనాభ గోవిందా || ౨౧
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

హథీరామప్రియ గోవిందా |
హరిసర్వోత్తమ గోవిందా |
జనార్దనమూర్తి గోవిందా |
జగత్సాక్షిరూప గోవిందా || ౨౨
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

అభిషేకప్రియ గోవిందా |
ఆపన్నివారణ గోవిందా |
రత్నకిరీటా గోవిందా |
రామానుజనుత గోవిందా || ౨౩
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

స్వయంప్రకాశా గోవిందా |
ఆశ్రితపక్ష గోవిందా |
నిత్యశుభప్రద గోవిందా |
నిఖిలలోకేశ గోవిందా || ౨౫
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

ఆనందరూపా గోవిందా |
ఆద్యంతరహితా గోవిందా |
ఇహపరదాయక గోవిందా |
ఇభరాజరక్షక గోవిందా || ౨౫
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

పరమదయాళో గోవిందా |
పద్మనాభహరి గోవిందా |
తిరుమలవాసా గోవిందా |
తులసీవనమాల గోవిందా || ౨౬
గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |

శేషసాయినే గోవిందా |
శేషాద్రినిలయా గోవిందా |
శ్రీనివాస శ్రీ గోవిందా |
శ్రీ వేంకటేశా గోవిందా || ౨౭

గోవిందా హరి గోవిందా |
గోకులనందన గోవిందా |
`;

const ENGLISH = `
Govinda Hari Govinda |
Gokulanandana Govinda |

Shri Shrinivasa Govinda |
Shri Venkatesha Govinda |
Bhaktavatsala Govinda |
Bhagavatapriya Govinda || 1
Govinda Hari Govinda |
Gokulanandana Govinda |

Nityanirmala Govinda |
Nilameghashyama Govinda |
Puranapurusha Govinda |
Pundarikaksha Govinda || 2
Govinda Hari Govinda |
Gokulanandana Govinda |

Nandanandana Govinda |
Navanitachora Govinda |
Pashupalaka Shri Govinda |
Papavimocana Govinda || 3
Govinda Hari Govinda |
Gokulanandana Govinda |

Dushtasamhara Govinda |
Duritanivarana Govinda |
Shishtaparipalaka Govinda |
Kashtanivarana Govinda || 4
Govinda Hari Govinda |
Gokulanandana Govinda |

Vajramakutadhara Govinda |
Varahamurti Govinda |
Gopijanalola Govinda |
Govardhanoddhara Govinda || 5
Govinda Hari Govinda |
Gokulanandana Govinda |

Dasharathanandana Govinda |
Dashamukhamardana Govinda |
Pakshivahana Govinda |
Pandavapriya Govinda || 6
Govinda Hari Govinda |
Gokulanandana Govinda |

Matsya Kurma Govinda |
Madhusudhana Hari Govinda |
Varaha Narasimha Govinda |
Vamana Bhrigurama Govinda || 7
Govinda Hari Govinda |
Gokulanandana Govinda |

Balaramanuja Govinda |
Bauddhakalkidhara Govinda |
Venuganapriya Govinda |
Venkataramana Govinda || 8
Govinda Hari Govinda |
Gokulanandana Govinda |

Sitanayaka Govinda |
Shritaparipalaka Govinda |
Daridrajanaposhaka Govinda |
Dharmasamsthapaka Govinda || 9
Govinda Hari Govinda |
Gokulanandana Govinda |

Anatharaksaka Govinda |
Apadbandhava Govinda |
Sharanagatavatsala Govinda |
Karunasagara Govinda || 10
Govinda Hari Govinda |
Gokulanandana Govinda |

Kamaladalaksha Govinda |
Kamitafalada Govinda |
Papavinashaka Govinda |
Pahi Murare Govinda || 11
Govinda Hari Govinda |
Gokulanandana Govinda |

Shrimudrankita Govinda |
Shrivatsankita Govinda |
Dharanininayaka Govinda |
Dinakarateja Govinda || 12
Govinda Hari Govinda |
Gokulanandana Govinda |

Padmavatipriya Govinda |
Prasannamurti Govinda |
Abhayahasta Govinda |
Aksayavarada Govinda || 13
Govinda Hari Govinda |
Gokulanandana Govinda |

Shankhachakradhara Govinda |
Sharngagadadhara Govinda |
Virajatirthastha Govinda |
Virodhimardana Govinda || 14
Govinda Hari Govinda |
Gokulanandana Govinda |

Salagramadhara Govinda |
Sahasranama Govinda |
Lakshmivallabha Govinda |
Lakshmanagraja Govinda || 15
Govinda Hari Govinda |
Gokulanandana Govinda |

Kasturitilaka Govinda |
Kanchanambaradhara Govinda |
Garudavahana Govinda |
Gajarajarakshaka Govinda || 16
Govinda Hari Govinda |
Gokulanandana Govinda |

Vanarasevita Govinda |
Varadhibandhana Govinda |
Saptagirisha Govinda |
Ekasvarupa Govinda || 17
Govinda Hari Govinda |
Gokulanandana Govinda |

Shriramakrishna Govinda |
Raghukulanandana Govinda |
Pratyakshadeva Govinda |
Paramadayakara Govinda || 18
Govinda Hari Govinda |
Gokulanandana Govinda |

Vajrakavachadhara Govinda |
Vaijayantimala Govinda |
Vaddikasulavada Govinda |
Vasudevatanaya Govinda || 19
Govinda Hari Govinda |
Gokulanandana Govinda |

Bilvapatrarchita Govinda |
Bhikshukasamstuta Govinda |
Striparumpa Govinda |
Shivakeshavamurti Govinda || 20
Govinda Hari Govinda |
Gokulanandana Govinda |

Brahmandarupa Govinda |
Bhaktarakshaka Govinda |
Nityakalyana Govinda |
Nirajanabha Govinda || 21
Govinda Hari Govinda |
Gokulanandana Govinda |

Hathiramapriya Govinda |
Harisarvottama Govinda |
Janardanamurti Govinda |
Jagatsakshirupa Govinda || 22
Govinda Hari Govinda |
Gokulanandana Govinda |

Abhishekapriya Govinda |
Apannivarana Govinda |
Ratnakirita Govinda |
Ramanujanuta Govinda || 23
Govinda Hari Govinda |
Gokulanandana Govinda |

Svayamprakasha Govinda |
Ashritapaksha Govinda |
Nityashubhada Govinda |
Nikhilalokesha Govinda || 24
Govinda Hari Govinda |
Gokulanandana Govinda |

Anandarupa Govinda |
Adyantarahita Govinda |
Ihaparadayaka Govinda |
Ibharajarakshaka Govinda || 25
Govinda Hari Govinda |
Gokulanandana Govinda |

Paramadayalo Govinda |
Padmanabahahari Govinda |
Tirumalavasa Govinda |
Tulasivanamala Govinda || 26
Govinda Hari Govinda |
Gokulanandana Govinda |

Sheshashayine Govinda |
Sheshadrinilaya Govinda |
Shrinivasa Shri Govinda |
Shri Venkatesha Govinda || 27

Govinda Hari Govinda |
Gokulanandana Govinda |
`;

const HINDI = `
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

श्री श्रीनिवासा गोविंदा |
श्री वेंकटेशा गोविंदा |
भक्तवत्सला गोविंदा |
भागवतप्रिया गोविंदा || १
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

नित्यनिर्मला गोविंदा |
नीलमेघश्यामा गोविंदा |
पुराणपुरुषा गोविंदा |
पुंडरीकाक्ष गोविंदा || २
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

नंदनंदना गोविंदा |
नवनीतचोरा गोविंदा |
पशुपालक श्री गोविंदा |
पापविमोचना गोविंदा || ३
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

दुष्टसंहारा गोविंदा |
दुरितनिवारणा गोविंदा |
शिष्टपरिपालका गोविंदा |
कष्टनिवारणा गोविंदा || ४
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

वज्रमकुटधरा गोविंदा |
वराहमूर्ति गोविंदा |
गोपीजनलोला गोविंदा |
गोवर्धनोद्धारा गोविंदा || ५
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

दशरथनंदना गोविंदा |
दशमुखमर्दना गोविंदा |
पक्षिवाहना गोविंदा |
पांडवप्रिया गोविंदा || ६
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

मत्स्य कूर्मा गोविंदा |
मधुसूदना हरि गोविंदा |
वराह नरसिंहा गोविंदा |
वामन भृगुरामा गोविंदा || ७
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

बलरामानुजा गोविंदा |
बौद्धकल्किधरा गोविंदा |
वेणुगानप्रिया गोविंदा |
वेंकटरमणा गोविंदा || ८
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

सीतानायका गोविंदा |
श्रितपरिपालका गोविंदा |
दरिद्रजनपोषका गोविंदा |
धर्मसंस्थापका गोविंदा || ९
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

अनाथरक्षका गोविंदा |
आपद्बांधवा गोविंदा |
शरणागतवत्सला गोविंदा |
करुणासागरा गोविंदा || १०
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

कमलदलाक्षा गोविंदा |
कामितफलदा गोविंदा |
पापविनाशका गोविंदा |
पाहि मुरारे गोविंदा || ११
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

श्रीमुद्रांकिता गोविंदा |
श्रीवत्सांकिता गोविंदा |
धरणीनायका गोविंदा |
दिनकरतेजा गोविंदा || १२
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

पद्मावतिप्रिया गोविंदा |
प्रसन्नमूर्ती गोविंदा |
अभयहस्ता गोविंदा |
अक्षयवरदा गोविंदा || १३
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

शंखचक्रधरा गोविंदा |
शार्ङ्गगदाधरा गोविंदा |
विरजातीर्थस्था गोविंदा |
विरोधीमर्दना गोविंदा || १४
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

सालग्रामधरा गोविंदा |
सहस्रनामा गोविंदा |
लक्ष्मीवल्लभा गोविंदा |
लक्ष्मणाग्रजा गोविंदा || १५
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

कस्तूरीतिलका गोविंदा |
कांचनांबरधरा गोविंदा |
गरुड़वाहना गोविंदा |
गजराजरक्षका गोविंदा || १६
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

वानरसेविता गोविंदा |
वारधिबंधना गोविंदा |
सप्तगिरीशा गोविंदा |
एकस्वरूपा गोविंदा || १७
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

श्रीरामकृष्णा गोविंदा |
रघुकुलनंदना गोविंदा |
प्रत्यक्षदेवा गोविंदा |
परमदयाकरा गोविंदा || १८
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

वज्रकवचधरा गोविंदा |
वैजयंतीमाला गोविंदा |
वड्डीकासुलावाड़ा गोविंदा |
वसुदेवतन्या गोविंदा || १९
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

बिल्वपत्रार्चिता गोविंदा |
भिक्षुकसंस्तुता गोविंदा |
स्त्रीपुंरूपा गोविंदा |
शिवकेशवमूर्ती गोविंदा || २०
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

ब्रह्मांडरूपा गोविंदा |
भक्तरक्षका गोविंदा |
नित्यकल्याणा गोविंदा |
नीरजनाभा गोविंदा || २१
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

हथीरामप्रिया गोविंदा |
हरिसर्वोत्तमा गोविंदा |
जनार्दनमूर्ती गोविंदा |
जगत्साक्षीरूपा गोविंदा || २२
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

अभिषेकप्रिया गोविंदा |
आपन्निवारणा गोविंदा |
रत्नकिरीटा गोविंदा |
रामानुजनुता गोविंदा || २३
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

स्वयंप्रकाशा गोविंदा |
आश्रितपक्षा गोविंदा |
नित्यशुभप्रदा गोविंदा |
निखिलोकेशा गोविंदा || २४
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

आनंदरूपा गोविंदा |
आद्यन्तरहिता गोविंदा |
इहपरदायका गोविंदा |
इभराजरक्षका गोविंदा || २५
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

परमदयालो गोविंदा |
पद्मनाभहरी गोविंदा |
तिरुमलावासा गोविंदा |
तुलसीवनमाला गोविंदा || २६
गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |

शेषशायिने गोविंदा |
शेषाद्रिनिलया गोविंदा |
श्रीनिवास श्री गोविंदा |
श्री वेंकटेशा गोविंदा || २७

गोविंदा हरि गोविंदा |
गोकुलनंदना गोविंदा |
`;

const TAMIL = `
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸ்ரீ ஸ்ரீநிவாஸா கோவிந்தா |
ஸ்ரீ வேங்கடேஸா கோவிந்தா |
பக்தவத்ஸலா கோவிந்தா |
பாகவதப்ரியா கோவிந்தா || 1
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

நித்யநிர்மலா கோவிந்தா |
நீலமேகஸ்யாமா கோவிந்தா |
புராணபுருஷா கோவிந்தா |
புண்டரீகாக்ஷா கோவிந்தா || 2
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

நந்தநந்தனா கோவிந்தா |
நவநீதசோரா கோவிந்தா |
பசுபாலக ஸ்ரீ கோவிந்தா |
பாபவிமோசனா கோவிந்தா || 3
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

துஷ்டஸம்ஹாரா கோவிந்தா |
துரிதநிவாரணா கோவிந்தா |
சிஷ்டபரிபாலகா கோவிந்தா |
கஷ்டநிவாரணா கோவிந்தா || 4
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

வஜிரமகுடதரா கோவிந்தா |
வராஹமூர்த்தி கோவிந்தா |
கோபீஜனலோலா கோவிந்தா |
கோவர்தனோத்தாரா கோவிந்தா || 5
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

தஸரதநந்தனா கோவிந்தா |
தஸமுகமர்தனா கோவிந்தா |
பக்ஷிவாஹனா கோவிந்தா |
பாண்டவப்ரியா கோவிந்தா || 6
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

மத்ஸ்ய கூர்மா கோவிந்தா |
மதுஸூதனா ஹரி கோவிந்தா |
வராஹ நரஸிம்ஹா கோவிந்தா |
வாமன ப்ருகுராமா கோவிந்தா || 7
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

பலராமானுஜா கோவிந்தா |
பௌத்த கல்கிதரா கோவிந்தா |
வேணுகானப்ரியா கோவிந்தா |
வேங்கடரமணா கோவிந்தா || 8
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸீதாநாயகா கோவிந்தா |
ஸ்ரிதபரிபாலகா கோவிந்தா |
தரித்ரஜனபோஷகா கோவிந்தா |
தர்மஸம்ஸ்தாபகா கோவிந்தா || 9
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

அநாதரக்ஷகா கோவிந்தா |
ஆபத்பாந்தவா கோவிந்தா |
ஸரணாகதவத்ஸலா கோவிந்தா |
கருணாஸாகரா கோவிந்தா || 10
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

கமலதளாக்ஷா கோவிந்தா |
காமிதபலதா கோவிந்தா |
பாபவிநாஸகா கோவிந்தா |
பாஹி முராரே கோவிந்தா || 11
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸ்ரீமுத்ராங்கிதா கோவிந்தா |
ஸ்ரீவத்ஸாங்கிதா கோவிந்தா |
தரணிநாயகா கோவிந்தா |
தினகரதேஜா கோவிந்தா || 12
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

பத்மாவதிப்ரியா கோவிந்தா |
ப்ரஸன்னமூர்த்தி கோவிந்தா |
அபயஹஸ்தா கோவிந்தா |
அக்ஷயவரதா கோவிந்தா || 13
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸங்கசக்rதரா கோவிந்தா |
ஸார்ங்ககதாதரா கோவிந்தா |
விரஜாதீர்தஸ்தா கோவிந்தா |
விரோதிமர்தனா கோவிந்தா || 14
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸாலக்ராமதரா கோவிந்தா |
ஸஹஸ்ரநாமா கோவிந்தா |
லக்ஷ்மீவல்லபா கோவிந்தா |
லக்ஷ்மணாக்ரஜா கோவிந்தா || 15
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

கஸ்தூரிதிலகா கோவிந்தா |
காஞ்சனாம்பரதரா கோவிந்தா |
கருடவாஹனா கோவிந்தா |
கஜராஜரக்ஷகா கோவிந்தா || 16
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

வானரஸேவிதா கோவிந்தா |
வாரதிபந்தனா கோவிந்தா |
ஸப்தகிரீஸா கோவிந்தா |
ஏகஸ்வரூபா கோவிந்தா || 17
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸ்ரீராமகிருஷ்ணா கோவிந்தா |
ரகுகuலநந்தனா கோவிந்தா |
ப்ரத்யக்ஷதேவா கோவிந்தா |
பரமதயாகரா கோவிந்தா || 18
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

வஜ்ரகவசதரா கோவிந்தா |
வைஜயந்திமாலா கோவிந்தா |
வட்டிகாஸuலவாடா கோவிந்தா |
வஸuதேவதநயா கோவிந்தா || 19
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

பில்வபத்ரார்சிதா கோவிந்தா |
பிக்ஷுகஸம்ஸ்துதா கோவிந்தா |
ஸ்த்ரீபும்ரூபா கோவிந்தா |
சிவகேஸவமூர்த்தி கோவிந்தா || 20
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ப்ரஹ்மாண்டரூபா கோவிந்தா |
பக்தரக்ஷகா கோவிந்தா |
நித்யகல்யாணா கோவிந்தா |
நீரஜநாபா கோவிந்தா || 21
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஹதீராமப்ரியா கோவிந்தா |
ஹரிஸர்வோத்தமா கோவிந்தா |
ஜனார்தனமூர்த்தி கோவிந்தா |
ஜகத்ஸாக்ஷிரூபா கோவிந்தா || 22
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

அபிஷேகப்ரியா கோவிந்தா |
ஆபந்நிவாரணா கோவிந்தா |
ரத்னகிரீடா கோவிந்தா |
ராமானுஜனுதா கோவிந்தா || 23
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸ்வயம்ப்ரகாஸா கோவிந்தா |
ஆஸ்ரிதபக்ஷா கோவிந்தா |
நித்யசுபப்ரதா கோவிந்தா |
நிகிலலோகேஸா கோவிந்தா || 24
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஆனந்தரூபா கோவிந்தா |
ஆத்யந்தரஹிதா கோவிந்தா |
இஹபரதாயகா கோவிந்தா |
இபராஜரக்ஷகா கோவிந்தா || 25
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

பரமதயாளோ கோவிந்தா |
பத்மநாபஹரி கோவிந்தா |
திருமலவாஸா கோவிந்தா |
துளஸீவனமாலா கோவிந்தா || 26
கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |

ஸேஷஸாயினே கோவிந்தா |
ஸேஷாத்ரிநிலயா கோவிந்தா |
ஸ்ரீநிவாஸ ஸ்ரீ கோவிந்தா |
ஸ்ரீ வேங்கடேஸா கோவிந்தா || 27

கோவிந்தா ஹரி கோவிந்தா |
கோகுலநந்தனா கோவிந்தா |
`;

// ── Parsing ──────────────────────────────────────────────────────────────
// Each language repeats a 2-line chorus: once at the start, once after every
// stanza, and once more (alone) at the very end. Splitting on consecutive
// chorus-line pairs isolates exactly 27 "unique content" blocks in between.

function parseStanzas(raw, langLabel) {
  const lines = raw.split('\n').map(l => l.replace(/\*\*/g, '').trim()).filter(Boolean);
  const chorusA = lines[0];
  const chorusB = lines[1];

  const stanzaBlocks = [];
  let current = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i] === chorusA && lines[i + 1] === chorusB) {
      if (current.length > 0) {
        stanzaBlocks.push(current);
        current = [];
      }
      i += 2;
      continue;
    }
    current.push(lines[i]);
    i += 1;
  }
  if (current.length > 0) stanzaBlocks.push(current);

  if (stanzaBlocks.length !== 27) {
    throw new Error(`${langLabel}: expected 27 stanzas, got ${stanzaBlocks.length}`);
  }

  return stanzaBlocks.map(block => {
    // Last line carries a trailing "|| <numeral>" verse-end marker — strip the
    // numeral (redundant with the stanza_number column) but keep it as a plain line.
    const cleanedLines = block.map(l => l.replace(/\s*\|+\s*[0-9౦-౯௦-௯०-९]*\s*$/u, '').trim());
    return [...cleanedLines, chorusA.replace(/\s*\|\s*$/, ''), chorusB.replace(/\s*\|\s*$/, '')].join('|');
  });
}

const teluguStanzas = parseStanzas(TELUGU, 'Telugu');
const englishStanzas = parseStanzas(ENGLISH, 'English');
const hindiStanzas = parseStanzas(HINDI, 'Hindi');
const tamilStanzas = parseStanzas(TAMIL, 'Tamil');

console.log('Parsed 27 stanzas in all four languages. Sample (stanza 1):\n');
console.log('  TE:', teluguStanzas[0]);
console.log('  EN:', englishStanzas[0]);
console.log('  HI:', hindiStanzas[0]);
console.log('  TA:', tamilStanzas[0]);

console.log('\nFlagged likely copy/paste typos (left as-is, not auto-corrected):');
console.log('  Telugu stanza 3:  "navaneeతచోర" -- likely "నవనీతచోర" (cf. English "Navanitachora")');
console.log('  Telugu stanza 17: "varadhiబంధన" -- likely "వారధిబంధన" (cf. English "Varadhibandhana")');
console.log('  Tamil stanza 14:  "ஸங்கசக்rதரா" -- likely "ஸங்கசக்ரதரா" (cf. English "Shankhachakradhara")');
console.log('  Tamil stanza 18:  "ரகுகuலநந்தனா" -- likely "ரகுகுலநந்தனா" (cf. English "Raghukulanandana")');
console.log('  Tamil stanza 19:  "வட்டிகாஸuலவாடா" -- likely "வட்டிகாஸுலவாடா"');
console.log('  Tamil stanza 19:  "வஸuதேவதநயா" -- likely "வசுதேவதநயா" (cf. English "Vasudevatanaya")');

const rows = teluguStanzas.map((_, i) => [
  SLUG,
  i + 1,
  '',
  hindiStanzas[i],
  teluguStanzas[i],
  tamilStanzas[i],
  englishStanzas[i],
  '', '', '', '',
  '',
]);

console.log(`\n${rows.length} rows ready to append to shloka_stanzas.`);

if (!WRITE) {
  console.log('Dry run only — no changes written. Re-run with --write to apply.');
} else {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
  console.log('Appended.');
}
