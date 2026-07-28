/**
 * Uploads the Vishnu Sahasranamam (108 traditional slokas, ~1000 names) to
 * shloka_stanzas. Structurally different from the ashtottarams processed so
 * far: each row here is one full 2-line sloka (not one name), with a
 * name-by-name English gloss packed into meaning_en.
 *
 * Source note: the pasted document's own header said "(Slokas 1-36)" but the
 * body actually contains all 108 slokas through the closing benediction --
 * that header label appears to be a stale/incorrect artifact of the source
 * document, not a reflection of the actual content, which is complete and
 * internally consistent (sequential sloka numbers 1-108 with matching
 * checkpoint markers throughout).
 *
 * Convention decisions (no existing shloka_stanzas precedent for a multi-name
 * verse-style stotra; follows the closest available precedent, the
 * lib/data/bhagavad-gita.json corpus):
 *   - script_devanagari keeps the traditional verse-ending "॥N॥" marker
 *     (matches bhagavad-gita.json's "sanskrit" field, which is the one field
 *     that retains chapter-verse numbering).
 *   - script_telugu / script_tamil / roman_iast strip that numeral marker
 *     before transliterating (matches bhagavad-gita.json's script_te/ta/iast
 *     fields, none of which carry the numeral).
 *   - roman_iast reuses the source's own given IAST line (already accurate)
 *     rather than re-deriving it, only stripping the "(N)" annotation and
 *     applying this site's existing e->ē / o->ō macron convention.
 *   - meaning_en is the per-sloka run of "Name – gloss." sentences joined
 *     with a space (ShlokaViewer renders meaning_en as one continuous block,
 *     not pipe-split, per the existing rendering code).
 *
 * The site's own shlokas-tab metadata (scripts/populate-shlokas-metadata.mjs)
 * already declares vishnu-sahasranamam with stanza_count: 142 -- i.e. it
 * expects ~34 more slokas beyond these 108 (traditional dhyana/phalashruti
 * verses not part of the core 1000-name recitation). This script only adds
 * the 108 core slokas; the gap to 142 is expected and not something to pad.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-vishnu-sahasranamam.mjs          (dry run)
 *      node scripts/upload-vishnu-sahasranamam.mjs --write  (apply)
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
const SLUG = 'vishnu-sahasranamam';

const RAW = `
विश्वं विष्णुर्वषट्कारो भूतभव्यभवत्प्रभुः ।
भूतकृद् भूतभृद्भावो भूतात्मा भूतभावनः ॥१॥
viśvaṃ viṣṇur vaṣaṭkāro bhūtabhavyabhavatprabhuḥ,
bhūtakṛd bhūtabhṛd bhāvo bhūtātmā bhūtabhāvanaḥ. (1)
Viśvaṃ – The all or the Universe.
Viṣṇuḥ – He who pervades everything.
Vaṣaṭkāraḥ – He for whom the sacrificial verses are uttered in yajñas.
Bhūta-bhavya-bhavat-prabhuḥ – The master who transcends past, present and future.
Bhūtakṛd – The creator and destroyer of all existences in the universe.
Bhūtabhṛd – One who supports, sustains and governs the universe.
Bhāvaḥ – Pure existence.
Bhūtātmā – The essence of all beings.
Bhūta-bhāvanaḥ – He who originates and develops all elements.
पूतात्मा परमात्मा च मुक्तानां परमा गतिः ।
अव्ययः पुरुषः साक्षी क्षेत्रज्ञोऽक्षर एव च ॥२॥
pūtātmā paramātmā ca muktānāṃ paramā gatiḥ,
avyayaḥ puruṣaḥ sākṣī kṣetrajño 'kṣara eva ca. (2)
Pūtātmā – One whose nature is purity.
Paramātmā – The supreme Self.
Muktānāṃ paramā gatiḥ – The highest goal of the liberated ones.
Avyayaḥ – One for whom there is no decay.
Puruṣaḥ – One who abides in the body (pura).
Sākṣī – One who witnesses everything.
Kṣetrajñaḥ – The knower of the field (body).
Akṣaraḥ – He who is indestructible.
योगो योगविदां नेता प्रधानपुरुषेश्वरः ।
नारसिंहवपुः श्रीमान् केशवः पुरुषोत्तमः ॥३॥
yogo yogavidāṃ netā pradhānapuruṣeśvaraḥ,
nārasiṃhavapuḥ śrīmān keśavaḥ puruṣottamaḥ. (3)
Yogaḥ – One attainable through Yoga.
Yogavidāṃ netā – The master of those established in Yoga.
Pradhāna-puruṣeśvaraḥ – The master of Pradhāna (Prakṛti) and Puruṣa (Jīva).
Nārasiṃha-vapuḥ – One who combined the bodies of a man and a lion.
Śrīmān – One on whose chest the goddess Śrī always dwells.
Keśavaḥ – One whose locks (keśa) are beautiful.
Puruṣottamaḥ – The greatest among all Puruṣas.
सर्वः शर्वः शिवः स्थाणुर्भूतादिर्निधिरव्ययः ।
सम्भवो भावनो भर्ता प्रभवः प्रभुरीश्वरः ॥४॥
sarvaḥ śarvaḥ śivaḥ sthāṇur bhūtādir nidhir avyayaḥ,
saṃbhavo bhāvano bhartā prabhavaḥ prabhur īśvaraḥ. (4)
Sarvaḥ – The omniscient source of all existence.
Śarvaḥ – Destroyer.
Śivaḥ – The pure one.
Sthāṇuḥ – One who is steady, immovable and changeless.
Bhūtādiḥ – Source of all elements.
Nidhir-avyayaḥ – The changeless, indestructible Being in whom the universe dissolves at Pralaya.
Sambhavaḥ – One who incarnates by His own will.
Bhāvanaḥ – One who generates the fruits of Karma for all Jīvas.
Bhartā – One who supports the universe as its substratum.
Prabhavaḥ – One from whom all great elements have their birth.
Prabhuḥ – One who is adept in all rites.
Īśvaraḥ – One who has unlimited lordliness and power over all things.
स्वयम्भूः शम्भुरादित्यः पुष्कराक्षो महास्वनः ।
अनादिनिधनो धाता विधाता धातुरुत्तमः ॥५॥
svayaṃbhūḥ śambhur ādityaḥ puṣkarākṣo mahāsvanaḥ,
anādinidhano dhātā vidhātā dhāturuttamaḥ. (5)
Svayambhūḥ – One who exists by Himself, uncaused.
Śambhuḥ – One who bestows happiness on devotees.
Ādityaḥ – The golden-hued person in the sun's orb.
Puṣkarākṣaḥ – One with eyes resembling lotus petals.
Mahāsvanaḥ – One from whom comes the great sound – the Veda.
Anādi-nidhanaḥ – The one existence that has neither beginning nor end.
Dhātā – One who is the support of the universe.
Vidhātā – He who generates Karmas and their fruits.
Dhāturuttamaḥ – The ultimate support of everything.
अप्रमेयो हृषीकेशः पद्मनाभोऽमरप्रभुः ।
विश्वकर्मा मनुस्त्वष्टा स्थविष्ठः स्थविरो ध्रुवः ॥६॥
aprameyo hṛṣīkeśaḥ padmanābho 'maraprabhuḥ,
viśvakarmā manus tvaṣṭā sthaviṣṭhaḥ sthaviro dhruvaḥ. (6)
Aprameyaḥ – One not measurable by any means of knowledge.
Hṛṣīkeśaḥ – The master of the senses.
Padmanābhaḥ – He in whose navel stands the lotus, the source of the universe.
Amara-prabhuḥ – The master of the immortal ones (Devas).
Viśvakarmā – He whose works have resulted in all that exists.
Manuḥ – He who thinks.
Tvaṣṭā – He who makes all beings contract at the time of cosmic dissolution.
Sthaviṣṭhaḥ – He who excels in bulk and substantiality.
Sthaviraḥ-dhruvaḥ – The eternal, most ancient and unchanging One.
अग्राह्यः शाश्वतः कृष्णो लोहिताक्षः प्रतर्दनः ।
प्रभूतस्त्रिककुब्धाम पवित्रं मङ्गलं परम् ॥७॥
agrāhyaḥ śāśvataḥ kṛṣṇo lohitākṣaḥ pratardanaḥ,
prabhūtas trikakubdhāma pavitraṃ maṅgalaṃ param. (7)
Agrāhyaḥ – One who cannot be grasped by the organs of knowledge.
Śāśvataḥ – One who exists at all times.
Kṛṣṇaḥ – Existence-Knowledge-Bliss.
Lohitākṣaḥ – One whose eyes are tinged red.
Pratardanaḥ – Destroyer of all at the time of cosmic dissolution.
Prabhūtaḥ – Great because of unique qualities like omnipotence and omniscience.
Tri-kakub-dhāma – The support of the three regions – above, below and in the middle.
Pavitraṃ – That which purifies everything
Maṅgalaṃ param – Supremely auspicious.
ईशानः प्राणदः प्राणो ज्येष्ठः श्रेष्ठः प्रजापतिः ।
हिरण्यगर्भो भूगर्भो माधवो मधुसूदनः ॥८॥
īśānaḥ prāṇadaḥ prāṇo jyeṣṭhaḥ śreṣṭhaḥ prajāpatiḥ,
hiraṇyagarbho bhūgarbho mādhavo madhusūdanaḥ. (8)
Īśānaḥ – He who controls and regulates everything.
Prāṇadaḥ – One who bestows and activates Prāṇa, the vital energy
Prāṇaḥ – The Supreme Being.
Jyeṣṭhaḥ – The eldest of all; for there is nothing before Him.
Śreṣṭhaḥ – One deserving the highest praise.
Prajāpatiḥ – The master of all living beings.
Hiraṇyagarbhaḥ – One who is the Ātman of even Brahmā the creator.
Bhūgarbhaḥ – One who has the world within Himself.
Mādhavaḥ – The Consort of Mā (Mahālakṣmī); or one known through Madhu-Vidyā.
Madhusūdanaḥ – The destroyer of the demon Madhu.
ईश्वरो विक्रमी धन्वी मेधावी विक्रमः क्रमः ।
अनुत्तमो दुराधर्षः कृतज्ञः कृतिरात्मवान् ॥९॥
īśvaro vikramī dhanvī medhāvī vikramaḥ kramaḥ,
anuttamo durādharṣaḥ kṛtajñaḥ kṛtir ātmavān. (9)
Īśvaraḥ – The Omnipotent Being.
Vikramī – The courageous One.
Dhanvī – One armed with a bow.
Medhāvī – He of great intelligence capable of grasping all texts.
Vikramaḥ – He who transcends saṃsāra; or one whose mount is Garuḍa.
Kramaḥ – The cause of crossing the ocean of saṃsāra for devotees.
Anuttamaḥ – He than whom there is none greater.
Durādharṣaḥ – One whom none can overcome.
Kṛtajñaḥ – One who knows everything done by Jīvas; pleased even by simple offerings.
Kṛtiḥ – That which is achieved through all human effort.
Ātmavān – One established in His own greatness, requiring no other support.
सुरेशः शरणं शर्म विश्वरेताः प्रजाभवः ।
अहः संवत्सरो व्यालः प्रत्ययः सर्वदर्शनः ॥१०॥
sureśaḥ śaraṇaṃ śarma viśvaretāḥ prajābhavaḥ,
ahaḥ saṃvatsaro vyālaḥ pratyayaḥ sarvadarśanaḥ. (10)
Sureśaḥ – The lord of the Suras (Devas).
Śaraṇaṃ – One who removes the sorrows of those in distress.
Śarma – One who is of the nature of supreme bliss.
Viśvaretāḥ – The seed of the universe.
Prajābhavaḥ – He from whom all beings have originated.
Ahaḥ – The luminous one.
Saṃvatsaraḥ – As Time is a form of Viṣṇu, He is called Saṃvatsara (a year).
Vyālaḥ – Being ungraspable like a serpent.
Pratyayaḥ – One of the nature of Prajñā (consciousness).
Sarva-darśanaḥ – One with eyes everywhere.
अजः सर्वेश्वरः सिद्धः सिद्धिः सर्वादिरच्युतः ।
वृषाकपिरमेयात्मा सर्वयोगविनिःसृतः ॥११॥
ajaḥ sarveśvaraḥ siddhaḥ siddhiḥ sarvādy acyutaḥ,
vṛṣākapir ameyātmā sarvayogaviniḥsṛtaḥ. (11)
Ajaḥ – One who has no birth.
Sarveśvaraḥ – The supreme Lord of all lords.
Siddhaḥ – One ever established in one's own nature.
Siddhiḥ – One who is of the nature of Consciousness in all.
Sarvādiḥ – One who is the first cause of all elements.
Acyutaḥ – One who never loses His inherent nature and powers.
Vṛṣākapiḥ – One who showers all objects of desire.
Ameyātmā – One whose form or nature cannot be measured.
Sarvayoga-viniḥsṛtaḥ – One completely free from all bondage.
वसुर्वसुमनाः सत्यः समात्माऽसम्मितः समः ।
अमोघः पुण्डरीकाक्षो वृषकर्मा वृषाकृतिः ॥१२॥
vasur vasumanāḥ satyaḥ samātmā sammitaḥ samaḥ,
amoghaḥ puṇḍarīkākṣo vṛṣakarmā vṛṣākṛtiḥ. (12)
Vasuḥ – One in whom all beings dwell and who dwells in all beings.
Vasumanāḥ – One possessed of a great, unattached mind.
Satyaḥ – One whose nature is Truth.
Samātmā – One whose mind is the same towards all beings.
Sammitaḥ – The immeasurable one.
Samaḥ – One unperturbed at all times.
Amoghaḥ – One whose worship never goes in vain.
Puṇḍarīkākṣaḥ – One whose eyes resemble lotus petals.
Vṛṣakarmā – One whose actions are in accordance with Dharma.
Vṛṣākṛtiḥ – One who takes form for the sake of Dharma.
रुद्रो बहुशिरा बभ्रुर्विश्वयोनिः शुचिश्रवाः ।
अमृतः शाश्वतस्थाणुर्वरारोहो महातपाः ॥१३॥
rudro bahuśirā babhrur viśvayoniḥ śuciśravāḥ,
amṛtaḥ śāśvatasthāṇur varāroho mahātapāḥ. (13)
Rudraḥ – One who makes all beings cry at the time of cosmic dissolution.
Bahuśirāḥ – One with innumerable heads.
Babhruḥ – One who governs the world.
Viśvayoniḥ – One who is the cause of the world.
Śuciśravāḥ – One whose names and glories are holy and purifying to hear.
Amṛtaḥ – One who is deathless.
Śāśvata-sthāṇuḥ – One who is both eternal and firmly established, unchanging.
Varārohaḥ – He whose lap gives the highest blessings.
Mahātapāḥ – One of great potent knowledge-austerity.
सर्वगः सर्वविद्भानुर्विष्वक्सेनो जनार्दनः ।
वेदो वेदविदव्यङ्गो वेदाङ्गो वेदवित् कविः ॥१४॥
sarvagaḥ sarvavid bhānur viṣvakṣeno janārdanaḥ,
vedo vedavid avyaṅgo vedāṅgo vedavit kaviḥ. (14)
Sarvagaḥ – One who pervades everything as their material cause.
Sarvavid-bhānuḥ – One who is omniscient and illumines everything.
Viṣvakṣenaḥ – He before whom all Asura armies are scattered.
Janārdanaḥ – One who inflicts suffering on evil men.
Vedaḥ – He who is of the form of the Veda.
Vedavid – One who knows the Veda and its meaning.
Avyaṅgaḥ – One who is self-fulfilled and free from every defect.
Vedāṅgaḥ – He to whom the Vedas stand as organs.
Vedavit – One who knows all the Vedas.
Kaviḥ – One who sees everything.
लोकाध्यक्षः सुराध्यक्षो धर्माध्यक्षः कृताकृतः ।
चतुरात्मा चतुर्व्यूहश्चतुर्दंष्ट्रश्चतुर्भुजः ॥१५॥
lokādhyakṣaḥ surādhyakṣo dharmādhyakṣaḥ kṛtākṛtaḥ,
caturātmā caturvyūhaś caturdaṃṣṭraś caturbhujaḥ. (15)
Lokādhyakṣaḥ – He who witnesses the whole universe.
Surādhyakṣaḥ – One who is the overlord of the protecting divinities of all regions.
Dharmādhyakṣaḥ – One who directly sees the merits and demerits of beings.
Kṛtākṛtaḥ – One who is both effect (the worlds) and non-effect (their cause).
Caturātmā – One who assumes forms for creation, sustentation and dissolution.
Caturvyūhaḥ – One who adopts a fourfold manifestation.
Caturdaṃṣṭraḥ – One with four fangs in His Narasiṃha incarnation.
Caturbhujaḥ – One with four arms.
भ्राजिष्णुर्भोजनं भोक्ता सहिष्णुर्जगदादिजः ।
अनघो विजयो जेता विश्वयोनिः पुनर्वसुः ॥१६॥
bhrājiṣṇur bhojanaṃ bhoktā sahiṣṇur jagadādijaḥ,
anagho vijayo jetā viśvayoniḥ punarvasuḥ. (16)
Bhrājiṣṇuḥ – One who is pure luminosity.
Bhojanam – Prakṛti or Māyā, which is enjoyed by the Lord.
Bhoktā – He who enjoys Prakṛti.
Sahiṣṇuḥ – He who suppresses Asuras like Hiraṇyākṣa.
Jagadādijaḥ – One who manifested as Hiraṇyagarbha at the beginning of creation.
Anaghaḥ – The sinless one.
Vijayaḥ – One who has mastery over the whole universe.
Jetā – One who is naturally victorious over all beings.
Viśvayoniḥ – The source of the universe.
Punarvasuḥ – One who dwells again and again in bodies as the Jīvas.
उपेन्द्रो वामनः प्रांशुरमोघः शुचिरूर्जितः ।
अतीन्द्रः सङ्ग्रहः सर्गो धृतात्मा नियमो यमः ॥१७॥
upendro vāmanaḥ prāṃśur amoghaḥ śucir ūrjitaḥ,
atīndraḥ saṅgrahaḥ sargo dhṛtātmā niyamo yamaḥ. (17)
Upendraḥ – One born as the younger brother of Indra.
Vāmanaḥ – One who in the form of the dwarf went begging to Bali.
Prāṃśuḥ – One of great height.
Amoghaḥ – One whose acts do not go in vain.
Śuciḥ – One who purifies those who adore and praise Him.
Ūrjitaḥ – One of infinite strength.
Atīndraḥ – One who is superior to Indra.
Saṅgrahaḥ – One who is of the subtle form of the universe to be created.
Sargaḥ – The creator of Himself.
Dhṛtātmā – One ever in His inherent form, without transformation.
Niyamaḥ – One who appoints creatures to their particular stations.
Yamaḥ – One who regulates all, remaining within them.
वेद्यो वैद्यः सदायोगी वीरहा माधवो मधुः ।
अतीन्द्रियो महामायो महोत्साहो महाबलः ॥१८॥
vedyo vaidyaḥ sadāyogī vīrahā mādhavo madhuḥ,
atīndriyo mahāmāyo mahotsāho mahābalaḥ. (18)
Vedyaḥ – One who has to be known by those who aspire for Mokṣa.
Vaidyaḥ – One who knows all branches of knowledge.
Sadāyogī – One who is ever experienceable, being ever existent.
Vīrahā – One who destroys heroic Asuras for the protection of Dharma.
Mādhavaḥ – One who is the Lord or Master of Mā (knowledge).
Madhuḥ – Honey – because the Lord gives joy, just like honey.
Atīndriyaḥ – One who is not knowable by the senses.
Mahāmāyaḥ – One who can cause illusion even over great illusionists.
Mahotsāhaḥ – One ever busy in the work of creation, sustentation and dissolution.
Mahābalaḥ – The strongest among all who have strength.
महाबुद्धिर्महावीर्यो महाशक्तिर्महाद्युतिः ।
अनिर्देश्यवपुः श्रीमानमेयात्मा महाद्रिधृक् ॥१९॥
mahābuddhir mahāvīryo mahāśaktir mahādyutiḥ,
anirdeśyavapuḥ śrīmān ameyātmā mahādridhṛk. (19)
Mahābuddhiḥ – The wisest among the wise.
Mahāvīryaḥ – The most powerful one.
Mahāśaktiḥ – One with great resources of strength and skill.
Mahādyutiḥ – One who is intensely brilliant both within and without.
Anirdeśya-vapuḥ – One whose form cannot be indicated as 'He is this'.
Śrīmān – One endowed with greatness of every kind.
Ameyātmā – The Spirit with intelligence that cannot be measured.
Mahādridhṛk – One who held up the great mountain Mandara and also Govardhana.
महेष्वासो महीभर्ता श्रीनिवासः सतां गतिः ।
अनिरुद्धः सुरानन्दो गोविन्दो गोविदां पतिः ॥२०॥
maheṣvāso mahībhartā śrīnivāsaḥ satāṃ gatiḥ,
aniruddhaḥ surānando govindo govidāṃ patiḥ. (20)
Maheṣvāsaḥ – One equipped with the great bow.
Mahībhartā – One who held up the earth submerged in Pralaya waters.
Śrīnivāsaḥ – One on whose chest the Goddess Śrī dwells.
Satāṃgatiḥ – One who bestows the highest destiny to all holy men.
Aniruddhaḥ – One who has never been obstructed in manifesting in various forms.
Surānandaḥ – One who bestows joy on all divinities.
Govindaḥ – Gau means words; He who pervades all words, giving them power.
Govidāṃ patiḥ – The master of all words and their knowers.
मरीचिर्दमनो हंसः सुपर्णो भुजगोत्तमः ।
हिरण्यनाभः सुतपाः पद्मनाभः प्रजापतिः ॥२१॥
marīcir damano haṃsaḥ suparṇo bhujagottamaḥ,
hiraṇyanābhaḥ sutapāḥ padmanābhaḥ prajāpatiḥ. (21)
Marīciḥ – The supreme power and impressiveness in virtuous persons.
Damanaḥ – One who as Yama inflicts punishments on the unrighteous.
Haṃsaḥ – One who removes the fear of Saṃsāra from those who meditate on Him.
Suparṇaḥ – One who has two wings in the shape of Dharma and Adharma.
Bhujagottamaḥ – One who is the greatest of those who move on arms (serpents).
Hiraṇyanābhaḥ – From whose golden navel arose Brahmā the creator.
Sutapāḥ – One who performs rigorous austerities at Badarikāśrama.
Padmanābhaḥ – One whose navel is beautifully shaped like a lotus.
Prajāpatiḥ – The father of all beings, who are His children.
अमृत्युः सर्वदृक् सिंहः सन्धाता सन्धिमान् स्थिरः ।
अजो दुर्मर्षणः शास्ता विश्रुतात्मा सुरारिहा ॥२२॥
amṛtyuḥ sarvadṛk siṃhaḥ sandhātā sandhimān sthiraḥ,
ajo durmarṣaṇaḥ śāstā viśrutātmā surārihā. (22)
Amṛtyuḥ – One who is without death or its cause.
Sarvadṛk – One who sees the Karmas of all Jīvas through His inherent wisdom.
Siṃhaḥ – One who does Hiṃsā (destruction).
Sandhātā – One who unites the Jīvas with the fruits of their actions.
Sandhimān – One who is Himself the enjoyer of the fruits of actions.
Sthiraḥ – One who is always of the same nature.
Ajaḥ – One who goes into the hearts of devotees or destroys Asuras.
Durmarṣaṇaḥ – One whose might the Asuras cannot bear.
Śāstā – One who instructs and directs all through the scriptures.
Viśrutātmā – One who is specially known through signifying terms like Truth, Knowledge.
Surārihā – One who destroys the enemies of Suras or Devas.
गुरुर्गुरुतमो धाम सत्यः सत्यपराक्रमः ।
निमिषोऽनिमिषः स्रग्वी वाचस्पतिरुदारधीः ॥२३॥
gurur gurutamo dhāma satyaḥ satyaparākramaḥ,
nimiṣo 'nimiṣaḥ sragvī vācaspatir udāradhīḥ. (23)
Guruḥ – The greatest teacher.
Gurutamaḥ – One who is the teacher of all forms of knowledge.
Dhāma – The Supreme Light.
Satyaḥ – One who is embodied as the virtue of truth.
Satyaparākramaḥ – One of unfailing valour.
Nimiṣaḥ – One whose eyelids are closed in Yoga-nidrā.
Animiṣaḥ – One who is ever awake.
Sragvī – One who has the necklace Vaijayantī, strung with the five elements.
Vācaspatir-udāradhīḥ – The master of Vāk (knowledge), of wide intelligence.
अग्रणीर्ग्रामणीः श्रीमान् न्यायो नेता समीरणः ।
सहस्रमूर्धा विश्वात्मा सहस्राक्षः सहस्रपात् ॥२४॥
agraṇīr grāmaṇīḥ śrīmān nyāyo netā samīraṇaḥ,
sahasramūrdhā viśvātmā sahasrākṣaḥ sahasrapāt. (24)
Agraṇīḥ – One who leads all liberation-seekers to the highest status.
Grāmaṇīḥ – One who has command over the collectivity of all beings.
Śrīmān – One more resplendent than everything.
Nyāyaḥ – The consistency which runs through all ways of knowing.
Netā – One who moves this world of becoming.
Sahasramūrdhā – One with a thousand (innumerable) heads.
Samīraṇaḥ – One who in the form of breath keeps all living beings functioning.
Viśvātmā – The soul of the universe.
Sahasrākṣaḥ – One with a thousand (innumerable) eyes.
Sahasrapāt – One with a thousand (innumerable) legs.
आवर्तनो निवृत्तात्मा संवृतः सम्प्रमर्दनः।
अहः संवर्तको वह्निरनिलो धरणीधरः ॥२५॥
āvartano nivṛttātmā saṃvṛtaḥ saṃpramardanaḥ,
ahaḥ saṃvartako vahnir anilo dharaṇīdharaḥ. (25)
Āvartanaḥ – One who whirls round and round the Samsara-chakra, the wheel of Samsara or worldly existence.
Nivṛttātmā – One whose being is free or untouched by the bondage of Snamsara.
Saṃvṛtaḥ – One who is covered by all-covering Avidyā or ignorance.
Sampramardanaḥ – One who delivers destructive blows on all beings through His Vibhutis (power manifestation like Rudra, Yama etc.).
Ahaḥ-saṃvartakaḥ – The Lord who, as the sun, regulates the succession of day and night.
Vahniḥ – One who as fire carries the offerings made to the Devas in sacrifices.
Anilaḥ – One who has no fixed residence.
Dharaṇī-dharaḥ – One who supports the worlds, Adisesha, elephants of the quarters, etc.
सुप्रसादः प्रसन्नात्मा विश्वधृग्विश्वभुग्विभुः ।
सत्कर्ता सत्कृतः साधुर्जह्नुर्नारायणो नरः ॥२६॥
suprasādaḥ prasannātmā viśvadhṛg viśvabhug vibhuḥ,
satkartā satkṛtaḥ sādhur jahnur nārāyaṇo naraḥ. (26)
Suprasādaḥ – One whose Prasada or mercy is uniquely wonderful, because He gives salvation to Sisupala and others who try to harm Him.
Prasannātmā – One whose mind is never contaminated by Rajas or Tamas.
Viśvadhṛg – One who holds the universe by his power.
Viśvabhug – One who eats up or enjoys or protects the worlds.
Vibhuḥ – One who takes various forms.
Satkartā – One who offers benefits.
Satkṛtaḥ – One who is adored even by those who deserve adoration.
Sādhuḥ – One who acts according to justice.
Jahnuḥ – One who dissolves all beings in oneself at the time of dissolution.
Nārāyaṇaḥ – Nara means Ātman. Narayana, that is, one having His residence in all beings.
Naraḥ – He directs everything, the eternal Paramatma is called Nara.
असङ्ख्येयोऽप्रमेयात्मा विशिष्टः शिष्टकृच्छुचिः ।
सिद्धार्थः सिद्धसङ्कल्पः सिद्धिदः सिद्धिसाधनः ॥२७॥
asaṅkhyeyo 'prameyātmā viśiṣṭaḥ śiṣṭakṛc chuciḥ,
siddhārthaḥ siddhasaṅkalpaḥ siddhidaḥ siddhisādhanaḥ. (27)
Asaṅkhyeyaḥ – One who has no Sankhya or differences of name and form.
Aprameyātmā – One whose nature cannot be grasped by any of the means of knowledge.
Viśiṣṭaḥ – One who excels everything.
Śiṣṭakṛt – One who commands everything. Or one who protects shishtas or good men.
Suciḥ – Pure
Siddhārthaḥ – One whose object is always fulfilled.
Siddhasaṅkalpaḥ – One whose resolutions are always fulfilled.
Siddhidaḥ – One who bestows Siddhi or fulfillment on all who practise disciplines, in accordance with their eligibility.
Siddhisādhanaḥ – One who brings fulfillment to works that deserve the same.
वृषाही वृषभो विष्णुर्वृषपर्वा वृषोदरः ।
वर्धनो वर्धमानश्च विविक्तः श्रुतिसागरः ॥२८॥
vṛṣāhī vṛṣabho viṣṇur vṛṣaparvā vṛṣodaraḥ,
vardhano vardhamānaś ca viviktaḥ śrutisāgaraḥ. (28)
Vṛṣāhī – One who is the possessor of Dharma.
Vṛṣābhaḥ – One who showers on the devotees all that they pray for.
Viṣṇuḥ – One who pervades everything.
Vṛṣaparva – One who has given as steps (Parvas), observances of the nature of Dharma, to those who want to attain the supreme state.
Vṛṣodaraḥ – One whose abdomen showers offspring.
Vardhanaḥ – One who increases the ecstasy of His devotees.
Vardhamānaḥ – One who multiplies in the form of the universe.
Viviktaḥ – One who is untouched and unaffected.
Śrutisāgaraḥ – One to whom all the shruti or Vedic words and sentences flow.
सुभुजो दुर्धरो वाग्मी महेन्द्रो वसुदो वसुः ।
नैकरूपो बृहद्रूपः शिपिविष्टः प्रकाशनः ॥२९॥
subhujo durddharo vāgmī mahendro vasudo vasuḥ,
naikarūpo bṛhadrūpaḥ śipiviṣṭaḥ prakāśanaḥ. (29)
Subhujaḥ – One possessing excellent arms that protect the worlds.
Durdharaḥ – One who holds up the universe – a work which none else can do.
Vāgmi – One from whom the words constituting the Veda come out.
Mahendraḥ – The great Lord, that is, the Supreme Being, who is the God of all gods.
Vasudaḥ – One who bestows riches.
Vasuḥ – One who is himself the Vasu.
Naikarūpaḥ – One who is without an exclusive form.
Bṛhadrūpaḥ – One who has adopted mysterious forms like that of a Boar.
Śipiviṣṭaḥ – Shipi means cow. One who resides in cows as Yajna.
Prakāśanaḥ – One who illumines everthing.
ओजस्तेजोद्युतिधरः प्रकाशात्मा प्रतापनः ।
ऋद्धः स्पष्टाक्षरो मन्त्रश्चन्द्रांशुर्भास्करद्युतिः ॥३०॥
ojas tejo dyutidharaḥ prakāśātmā pratāpanaḥ,
ṛddhaḥ spaṣṭākṣaro mantraś candrāṃśur bhāskaradyutiḥ. (30)
Ōjas-tejō-dyuti-dharaḥ – One who is endowed with strength, vigour and brilliance.
Prakāśātmā – One whose form is radiant.
Pratāpanaḥ – One who warms the world through the power manifestations like the Sun.
Jñāna – One who is rich in excellences like Dharma, Gyana (knowledge), Vairagya (renunciation) etc.
Spaṣṭākṣaraḥ – He is so called because  Oṃkāra, the manifesting sound of the Lord, is Spashta or high pitched.
Mantraḥ – One who manifests as the Mantras of the Rk, Sama, Yajus etc., or one who is known through Mantras.
Candrāṃśuḥ – He is called 'Chandramshu' or moonlight because just as the moon-light gives relief to men burnt in the heat of the sun, He gives relief and shelter to those who are subjected to the heat of Samsara.
Bhāskara-dyutiḥ – He who has the effulgence of the sun.
अमृतांशूद्भवो भानुः शशबिन्दुः सुरेश्वरः ।
औषधं जगतः सेतुः सत्यधर्मपराक्रमः ॥३१॥
amṛtāṃśūdbhavo bhānuḥ śaśabinduḥ sureśvaraḥ,
auṣadhaṃ jagataḥ setuḥ satyadharmaparākramaḥ. (31)
Amṛtāṃśūdbhavaḥ – The Paramātman from whom Amrutamshu or the Moon originated at the time of the churning of the Milk-ocean.
Bhānuḥ – One who shines.
Śaśabinduḥ – The word means one who has the mark of the hare, that is the Moon.
Sureśvaraḥ – One who is the Lord of all Devas and those who do good.
Auṣadham – One who is the Aushadha or medicine for the great disease of Samsara.
Jagataḥ setuḥ – One who is the aid to go across the ocean of Samsara.
Satya-dharma-parākramaḥ – One whose excellences like righteousness, omniscience, puissance, etc. are all true.
भूतभव्यभवन्नाथः पवनः पावनोऽनलः ।
कामहा कामकृत्कान्तः कामः कामप्रदः प्रभुः ॥३२॥
bhūtabhavyabhavannāthaḥ pavanaḥ pāvano 'nalaḥ,
kāmahā kāmakṛt kāntaḥ kāmaḥ kāmapradaḥ prabhuḥ. (32)
Bhūta-bhavya-bhavan-nāthaḥ – One who is the master for all the beings of the past, future and present.
Pavanaḥ – One who is the purifier.
Pāvanaḥ – One who causes movement.
Analaḥ – The Jivatma is called Anala because it recognizes Ana or Prāṇa as Himself.
Kāmahā – One who destroys the desire-nature in seekers after liberation.
Kāmakṛt – One who fulfils the wants of pure minded devotees.
Kāntaḥ – One who is extremely beautiful.
Kāmaḥ – One who is sought after by those who desire to attain the four supreme values of life.
Kāmapradaḥ – One who liberally fulfils the desires of devotees.
Prabhuḥ – One who surpasses all.
युगादिकृद्युगावर्तो नैकमायो महाशनः ।
अदृश्यो व्यक्तरूपश्च सहस्रजिदनन्तजित् ॥३३॥
yugādikṛd yugāvarto naikamāyo mahāśanaḥ,
adṛśyo vyaktarūpaś ca sahasrajid anantajit. (33)
Yugādikṛd – One who is the cause of periods of time like Yuga.
Yugāvartaḥ – One who as time causes the repetition of the four Yugas beginning with Satya Yuga.
Naikamāyaḥ – One who can assume numerous forms of Maya, not one only.
Mahāśanaḥ – One who consumes everything at the end of a Kalpa.
Adṛśyaḥ – One who cannot be grasped by any of the five organs of knowledge.
Vyaktarūpaḥ – He is so called because His gross form as universe can be clearly perceived.
Sahasrajit – One who is victorious over innumerable enemies of the Devas in battle.
Anantajit – One who, being endowed with all powers, is victorious at all times over everything.
इष्टोऽविशिष्टः शिष्टेष्टः शिखण्डी नहुषो वृषः ।
क्रोधहा क्रोधकृत्कर्ता विश्वबाहुर्महीधरः ॥३४॥
iṣṭo 'viśiṣṭaḥ śiṣṭeṣṭaḥ śikhaṇḍī nahuṣo vṛṣaḥ,
krodhahā krodhakṛt kartā viśvabāhur mahīdharaḥ. (34)
Iṣṭaḥ – One who is dear to all because He is of the nature of supreme Bliss.
Aviśiṣṭaḥ – One who resides within all.
Śiṣṭeṣṭaḥ – One who is dear to shishta or Knowing Ones.
Śikhaṇḍī – Sikhanda means feather of a peacock. One who used it as a decoration for His crown when he adopted the form of a cowherd (Gopa).
Nahuṣaḥ – One who binds all beings by Maya the root 'nah' means bondage.
Vṛṣaḥ – One who is of the form of Dharma.
Krōdhahā – One who eradicates anger in virtuous people.
Krōdhakṛt-kartā – One who generates Krodha or anger in evil people.
Viśvabāhuḥ – One who is the support of all or one who has got all beings as His arms.
Mahīdharaḥ – Mahi means both earth and worship. So the name means one who supports the earth or receives all forms of worship.
अच्युतः प्रथितः प्राणः प्राणदो वासवानुजः ।
अपांनिधिरधिष्ठानमप्रमत्तः प्रतिष्ठितः ॥३५॥
acyutaḥ prathitaḥ prāṇaḥ prāṇado vāsavānujaḥ,
apāṃ nidhir adhiṣṭhānam apramattaḥ pratiṣṭhitaḥ. (35)
Acyutaḥ – One who is without the six transformations beginning with birth.
Prathitaḥ – One who is famous because of His works like creation of the worlds etc.
Prāṇaḥ – One who as Hiranyagarbha endows all beings with Prana.
Prāṇadaḥ – One who bestows Prāṇa, that is, strength, on Devas and Asuras and also destroys them by withdrawing it.
Vāsavānujaḥ – One who was born as younger brother of Indra (Vasava) in His incarnation as Vamana.
Apāṃ nidhiḥ – The word means collectivity of water or the ocean.
Adhiṣṭhānam – The seat or support for everything.
Apramattaḥ – One who is always vigilant in awarding the fruits of actions to those who are entitled to them.
Pratiṣṭhitaḥ – One who is supported and established in His own greatness.
स्कन्दः स्कन्दधरो धुर्यो वरदो वायुवाहनः ।
वासुदेवो बृहद्भानुरादिदेवः पुरन्दरः ॥३६॥
skandaḥ skandadharo dhuryo varado vāyuvāhanaḥ,
vāsudevo bṛhadbhānur ādidevaḥ purandaraḥ. (36)
Skandaḥ – One who drives everything as air.
Skanda-dharaḥ – One who supports Skanda or the righteous path.
Dhuryaḥ – One who bears the weight of the burden of all beings in the form of birth etc.
Varadaḥ – One who gives boons.
Vāyuvāhanaḥ – One who vibrates the seven Vayus or atmospheres beginning with Avaha.
Vāsudevaḥ – One who is both Vasu and Deva.
Bṛhadbhānuḥ – The great brilliance.
Ādidevaḥ – The Divinity who is the source of all Devas.
Purandaraḥ – One who destroys the cities of the enemies of Devas.
अशोकस्तारणस्तारः शूरः शौरिर्जनेश्वरः ।
अनुकूलः शतावर्तः पद्मी पद्मनिभेक्षणः ॥३७॥
aśokas tāraṇas tāraḥ śūraḥ śaurir janeśvaraḥ,
anukūlaḥ śatāvartaḥ padmī padmanibhekṣaṇaḥ. (37)
Aśokaḥ – One without the six defects – sorrow, infatuation, hunger, thirst, birth and death.
Tāraṇaḥ – One who uplifts beings from the ocean of samsara.
Tāraḥ – One who liberates beings from the fear of residence in the womb, birth, old age, death etc.
Śūraḥ – One of great prowess, that is, who fulfils the four supreme satisfactions of life – Dharma, Artha, Kama and Mokṣa.
Śauriḥ – One who was born as Kṛṣṇa, the son of Śūra (i.e. Vasudeva, grandson of Śūra).
Janeśvaraḥ – The Lord of all beings.
Anukūlaḥ – One who, being the Ātman of all beings, is favorable to all, for no one will act against oneself.
Śatāvartaḥ – One who has had several Avataras or incarnations.
Padmī – One having Padma or lotus in his hands.
Padma-nibhekṣaṇaḥ – One with eyes resembling lotus.
पद्मनाभोऽरविन्दाक्षः पद्मगर्भः शरीरभृत् ।
महर्द्धिरृद्धो वृद्धात्मा महाक्षो गरुडध्वजः ॥३८॥
padmanābho 'ravindākṣaḥ padmagarbhaḥ śarīrabhṛt,
maharddhir ṛddho vṛddhātmā mahākṣo garuḍadhvajaḥ. (38)
Padma-nābhaḥ – One who resides in the Nabhi or the central part of the heart-lotus.
Aravindākṣaḥ – One whose eyes resemble Aravinda or the Lotus.
Padma-garbhaḥ – One who is fit to be worshipped in the middle of the heart-lotus.
Śarīra-bhṛt – One who supports the bodies of beings, strengthening them in the form of Anna (Food) and Prāṇa.
Maharddhiḥ – One who has enormous Ruddhi or prosperity.
Ṛddhaḥ – One who is seen as standing in the form of the world.
Vṛddhātmā – One whose Atma or body is Vruddha or ancient.
Mahākṣaḥ – One who has got two or many glorious eyes.
Garuḍa-dhvajaḥ – One who has got Garuda as his flag.
अतुलः शरभो भीमः समयज्ञो हविर्हरिः ।
सर्वलक्षणलक्षण्यो लक्ष्मीवान् समितिञ्जयः ॥३९॥
atulaḥ śarabho bhīmaḥ samayajño havirhariḥ,
sarvalakṣaṇalakṣaṇyo lakṣmīvān samitiñjayaḥ. (39)
Atulaḥ – One who cannot be compared to anything else.
Śarabhaḥ – The body is called 'Sara' as it is perishable.
Bhīmaḥ – One of whom everyone is afraid.
Samayajñaḥ – One who knows the time for creation, sustentation and dissolution.
Havir-hariḥ – One who takes the portion of offerings (Havis) in Yajnas.
Sarva-lakṣaṇa-lakṣaṇyaḥ – The supreme knowledge obtained through all criteria of knowledge i.e. Paramātma.
Lakṣmīvān – One on whose chest the Goddess Lakshmi is always residing.
Samitiñjayaḥ – One who is victorious in Samiti or war.
विक्षरो रोहितो मार्गो हेतुर्दामोदरः सहः ।
महीधरो महाभागो वेगवानमिताशनः ॥४०॥
vikṣaro rohito mārgo hetur dāmodaraḥ sahaḥ,
mahīdharo mahābhāgo vegavān amitāśanaḥ. (40)
Vikṣaraḥ – One who is without Kshara or destruction.
Rōhitaḥ – One who assumed the form of a kind of fish called Rohita.
Mārgaḥ – One who is sought after by persons seeking Mokṣa or Liberation.
Hetuḥ – One who is both the instrumental and the material cause of the universe.
Damodaraḥ – One who has very benevolent mind because of disciplines like self-control.
Sahaḥ – One who subordinates everything.
Mahīdharaḥ – One who props up the earth in the form of mountain.
Mahābhāgaḥ – He who, taking a body by His own will, enjoys supreme felicities.
Vegavān – One of tremendous speed.
Amitāśanaḥ – He who consumes all the worlds at the time of Dissolution.
उद्भवः क्षोभणो देवः श्रीगर्भः परमेश्वरः ।
करणं कारणं कर्ता विकर्ता गहनो गुहः ॥४१॥
udbhavaḥ kṣobhaṇo devaḥ śrīgarbhaḥ parameśvaraḥ,
karaṇaṃ kāraṇaṃ kartā vikartā gahano guhaḥ. (41)
Udbhavaḥ – One who is the material cause of creation.
Kṣōbhaṇaḥ – One who at the time of creation entered into the Purusha through Prakriti and caused agitation.
Devaḥ – 'Divyati' means sports oneself through creation and other cosmic activities.
Śrīgarbhaḥ – One in whose abdomen (Garbha) Shri or His unique manifestation as Samsara has its existence.
Parameśvaraḥ – 'Parama' means the supreme. 'Ishvarah' means one who hold sway over all beings.
Karaṇam – He who is the most important factor in the generation of this universe.
Kāraṇam – The Cause – He who causes others to act.
Kartā – One who is free and is therefore one's own master.
Vikartā – One who makes this unique universe.
Gahanaḥ – One whose nature, greatness and actions cannot be known by anybody.
Guhaḥ – One who hides one's own nature with the help of His power of Maya.
व्यवसायो व्यवस्थानः संस्थानः स्थानदो ध्रुवः ।
परर्द्धिः परमस्पष्टस्तुष्टः पुष्टः शुभेक्षणः ॥४२॥
vyavasāyo vyavasthānaḥ saṃsthānaḥ sthānado dhruvaḥ,
pararddhiḥ paramaspaṣṭas tuṣṭaḥ puṣṭaḥ śubhekṣaṇaḥ. (42)
Vyavasāyaḥ – One who is wholly of the nature of knowledge.
Vyavasthānaḥ – He in whom the orderly regulation of the universe rests.
Sāṃsthānaḥ – One in whom all beings dwell in the states of dissolution.
Sthānadaḥ – One who gives their particular status to persons like Dhruva according to their Karma.
Dhruvaḥ – One who is indestructible.
Pararddhiḥ – One who possesses lordliness of this most exalted type.
Paramaspaṣṭaḥ – One in whom 'Para' or supremely glorious 'Ma' or Lakshmi dwells. Or one who is the greatest of all beings without any other's help.
Tuṣṭaḥ – One who is of the nature of supreme.
Puṣṭaḥ – One who in fills everything.
Śubhekṣaṇaḥ – One whose Ikshanam or vision bestows good on all beings that is, gives liberation to those who want  Mokṣa and enjoyments to those who are after it, and also cuts asunder the knots of the heart by eliminating all doubts.
रामो विरामो विरजो मार्गो नेयो नयोऽनयः ।
वीरः शक्तिमतां श्रेष्ठो धर्मो धर्मविदुत्तमः ॥४३॥
rāmo virāmo virajo mārgo neyo nayo 'nayaḥ,
vīraḥ śaktimatāṃ śreṣṭho dharmo dharmaviduttamaḥ. (43)
Ramaḥ – The eternally blissful one in whom the Yogis find delight.
Virāmaḥ – One in whom the Virama or end of all beings takes place.
Virajaḥ – One in whom the desire for enjoyments has ceased
Mārgaḥ – The path.
Neyaḥ – One who directs or leads the Jiva to the Supreme Being through spiritual realization.
Nayaḥ – One who leads, that is, who is the leader in the form of spiritual illumination.
Anayaḥ – One for whom there is no leader.
Vīraḥ – One who is valorous.
Śaktimatāṃ śreṣṭhaḥ – One who is the most powerful among all powerful beings like Brahma.
Dharmaḥ – One who supports all beings.
Dharma-viduttamaḥ – The greatest of knower of Dharma. He is called so because all the scriptures consisting of Shrutis and Smrutis form His commandments.
वैकुण्ठः पुरुषः प्राणः प्राणदः प्रणवः पृथुः ।
हिरण्यगर्भः शत्रुघ्नो व्याप्तो वायुरधोक्षजः ॥४४॥
vaikuṇṭhaḥ puruṣaḥ prāṇaḥ prāṇadaḥ praṇavaḥ pṛthuḥ,
hiraṇyagarbhaḥ śatrughno vyāpto vāyur adhokṣajaḥ. (44)
Vaikuṇṭhaḥ – The bringing together of the diversified categories is Vikuntha. He who is the agent of it is Vaikunthah.
Puruṣaḥ – One who existed before everything.
Prāṇaḥ – One who lives as Kshetrajana (knower in the body) or one who functions in the form of vital force called Prāṇa.
Prāṇadaḥ – One who is the giver of life.
Praṇavaḥ – One who is praised or to whom prostration is made with Om.
Pṛthuḥ – One who has expanded himself as the world.
Hiraṇyagarbhaḥ – He who was the cause of the golden-coloured egg out of which Brahma was born.
Śatrughnaḥ – One who destroys the enemies of the Devas.
Vyāptaḥ – One who as the cause pervades all effects.
Vāyuḥ – One who moves towards His devotees.
Adhokṣajaḥ – He is Adhokshaja because he undergoes no degeneration from His original nature.
ऋतुः सुदर्शनः कालः परमेष्ठी परिग्रहः ।
उग्रः संवत्सरो दक्षो विश्रामो विश्वदक्षिणः ॥४५॥
ṛtuḥ sudarśanaḥ kālaḥ parameṣṭhī parigrahaḥ,
ugraḥ saṃvatsaro dakṣo viśrāmo viśvadakṣiṇaḥ. (45)
Ṛtuḥ – One who is of the nature of Kala (time) which is indicated by the word Ritu or season.
Sudarśanaḥ – One whose Darshana or vision that is knowledge, bestows the most auspicious fruit Mokṣa.
Kālaḥ – One who measures and sets a limit to everything.
Parameṣṭhī – One who dwells in his supreme greatness in the sky of the heart.
Parigrahaḥ – One who, being everywhere, is grasped on all sides by those who seek refuge in Him. Or one who grasps or receives the offerings made by devotees.
Ugraḥ – One who is the cause of fear even to beings like Sun.
Saṃvatsaraḥ – One in whom all beings reside.
Dakṣaḥ – One who augments in the form of the world.
Viśrāmaḥ – One who bestows Vishrama or liberation to aspirants who seek relief from the ocean of Samsara with its waves of various tribulations in the from of Hunger, Thirst etc., and difficulties like Avidyā, pride, infatuation etc.
Viśvadakṣiṇaḥ – One who is more skilled (Daksha) than every one. Or One who is proficient in everything.
विस्तारः स्थावरस्थाणुः प्रमाणं बीजमव्ययम् ।
अर्थोऽनर्थो महाकोशो महाभोगो महाधनः ॥४६॥
vistāraḥ sthāvaraḥ sthāṇuḥ pramāṇaṃ bījam avyayam,
artho 'nartho mahākośo mahābhogo mahādhanaḥ. (46)
Vistāraḥ – One in whom all the worlds have attained manifestation.
Sthāvaraḥ-sthāṇuḥ – One who is firmly established is Sthavara, and in whom long lasting entities like earth are established in Sthanu. The Lord is both these.
Pramāṇaṃ – One who is of the nature of pure consciousness.
Bījamavyayam – One who is the seed or cause of Samsara without Himself undergoing any change.
Arthaḥ – One who is sought (Arthita) by all, as He is of the nature of bliss.
Anarthaḥ – One who, being self-fulfilled, has no other Artha or end to seek.
Mahākōśaḥ – One who has got as His covering the great Koshas like Annamaya, Prāṇamaya etc.
Mahābhōgaḥ – One who has Bliss as the great source of enjoyment.
Mahādhanaḥ – One who has got the whole universe as the wealth (Dhana) for His enjoyment.
अनिर्विण्णः स्थविष्ठोऽभूर्धर्मयूपो महामखः ।
नक्षत्रनेमिर्नक्षत्री क्षमः क्षामः समीहनः ॥४७॥
anirviṇṇaḥ sthaviṣṭho 'bhūr dharmayūpo mahāmakhaḥ,
nakṣatranemiḥ nakṣatrī kṣamaḥ kṣāmaḥ samīhanaḥ. (47)
Anirviṇṇaḥ – One who is never heedless, because He is ever self-fulfilled.
Sthaviṣṭhaḥ – One of huge proportions, because He is in the form of cosmic person.
Abhūḥ – One without birth. Or one has no existence.
Dharma-yūpaḥ – The sacrificial post for Dharmas, that is, one to whom all the forms of Dharma, which are His own form of worship, are attached, just as a sacrificial animal is attached to a Yupa or a sacrificial post.
Mahāmakhaḥ – One by offering sacrifices to whom, those sacrifices deserve to be called great, because they would give the fruit of Nirvana.
Nakṣatra-nemiḥ – The heart of all nakshatras.
Nakṣatrī – He is in the form of the nakshatra, Moon.
Kṣamaḥ – One who is clever in everything.
Kṣāmaḥ – One who remains in the state of pure self after all the modifications of the mind have dwindled.
Samīhanaḥ – One who exerts well for creation, etc.
यज्ञ इज्यो महेज्यश्च क्रतुः सत्रं सतां गतिः ।
सर्वदर्शी विमुक्तात्मा सर्वज्ञो ज्ञानमुत्तमम् ॥४८॥
yajña ijyo mahejyaś ca kratuḥ satraṃ satāṃ gatiḥ,
sarvadarśī vimuktātmā sarvajño jñānam uttamam. (48)
Yajñaḥ – One who is all-knowing.
Ijyaḥ – One who is fit to be worshipped in sacrifices.
Mahejyaḥ – He who, of all deities worshipped, is alone capable of giving the blessing of liberation.
Kratuḥ – A Yajna in which there is a sacrificial post is Kratu.
Satraṃ – One who is of the nature of ordained Dharma.
Satāṃ-gatiḥ – One who is the sole support for holy men who are seekers of Mokṣa.
Sarva-darśī – One who by His inborn insight is able to see all good and evil actions of living beings.
Vimuktātmā – One who is naturally free.
Sarvagñaḥ – One who is all and also the knower of all.
Jñānam-uttamam – That consciousness which is superior to all, birthless, unlimited by time and space and the cause of all achievements.
सुव्रतः सुमुखः सूक्ष्मः सुघोषः सुखदः सुहृत् ।
मनोहरो जितक्रोधो वीरबाहुर्विदारणः ॥४९॥
suvrataḥ sumukhaḥ sūkṣmaḥ sughoṣaḥ sukhadaḥ suhṛt,
manoharaḥ jitakrodho vīrabāhur vidāraṇaḥ. (49)
Suvrataḥ – One who has take the magnanimous vow to save all refuge-seekers.
Sumukhaḥ – One with a pleasant face.
Sūkṣmaḥ – One who is subtle because He is without any gross causes like sound etc.
Sughōṣaḥ – One whose auspicious sound is the Veda. Or one who has got a deep and sonorous sound like the clouds.
Sukhadaḥ – One who gives happiness to good people.
Suhṛt – One who helps without looking for any return.
Manōharaḥ – One who attracts the mind by His incomparable blissful nature.
Jitakrōdhaḥ – One who has overcome anger.
Vīrabāhuḥ – One whose arms are capable of heroic deeds as demonstrated in his destruction of Asuras for establishing Vedic Dharma.
Vidāraṇaḥ – One who destroys those who live contrary to Dharma.
स्वापनः स्ववशो व्यापी नैकात्मा नैककर्मकृत् ।
वत्सरो वत्सलो वत्सी रत्नगर्भो धनेश्वरः ॥५०॥
svāpanaḥ svavaśo vyāpī naikātmā naikakarmakṛt,
vatsaro vatsalo vatsī ratnagarbho dhaneśvaraḥ. (50)
Svāpanaḥ – One who enfolds the Jivas in the sleep of Ajnana.
Svavaśaḥ – One who is dominated by oneself and not anything else, as He is the cause of the whole cosmic process.
Vyāpī – One who interpenetrates everything like Akasha.
Naikātmā – One who manifests in different forms as the subsidiary agencies causing the various cosmic processes.
Naikakarmakṛt – One who engages in innumerable activities in the process of creation, sustentation, etc.
Vatsaraḥ – One in whom everything dwells.
Vatsalaḥ – One who has love for His devotees.
Vatsī – One who protects those who are dear to Him.
Ratnagarbhaḥ – The Ocean is so called because gems are found in its depths. As the Lord has taken the form of the ocean, He is called by this name.
Dhaneśvaraḥ – One who is the Lord of all wealth.
धर्मगुब्धर्मकृद्धर्मी सदसत्क्षरमक्षरम् ।
अविज्ञाता सहस्रांशुर्विधाता कृतलक्षणः ॥५१॥
dharmagub dharmakṛd dharmī sadasat kṣaram akṣaram,
avijñātā sahasrāṃśur vidhātā kṛtalakṣaṇaḥ. (51)
Dharmagub – One who protects Dharma.
Dharmakṛd – Though above. Dharma and Adharma, He performs Dharma in order to keep up the traditions in respect of it.
Dharmī – One who upholds Dharma.
Sat – The Parabrahman who is of the nature of truth.
Asat – As the Aparabrahma has manifested as the world He is called Asat (not having reality).
Kṣaram – All beings subjected to change.
Akṣaram – The changeless one.
Avijñātā – One who is without the attributes of a Jiva or vigyata like sense of agency, etc.
Sahasrāṃśuḥ – One with numerous rays, that is the Sun.
Vidhātā – One who is the unique support of all agencies like Ananta who bear the whole universe.
Kṛtalakṣaṇaḥ – One who is of the nature of consciousness.
गभस्तिनेमिः सत्त्वस्थः सिंहो भूतमहेश्वरः ।
आदिदेवो महादेवो देवेशो देवभृद्गुरुः ॥५२॥
gabhastinemiḥ sattvasthaḥ siṃho bhūtamaheśvaraḥ,
ādidevo mahādevo deveśo devabhṛd guruḥ. (52)
Gabhastinemiḥ – He who dwells in the middle of Gabhasti or rays as the Sun.
Sattvasthaḥ – One who dwells specially in sattvaguna, which is luminous by nature.
Simhaḥ – One who has irresistible power like a lion.
Bhūtamaheśvaraḥ – The supreme Lord of all beings.
Ādidevaḥ – He who is the first of all beings.
Mahādevaḥ – One whose greatness consists in His supreme self-knowledge.
Deveśaḥ – One who is the lord of all Devas, being the most important among them.
Devabhṛd-guruḥ – Indra who governs the Devas is Devabhrut. The Lord is even that Indra's controller (Guru).
उत्तरो गोपतिर्गोप्ता ज्ञानगम्यः पुरातनः ।
शरीरभूतभृद्भोक्ता कपीन्द्रो भूरिदक्षिणः ॥५३॥
uttaro gopatiḥ goptā jñānagamyaḥ purātanaḥ,
śarīrabhūtabhṛd bhoktā kapīndro bhūridakṣiṇaḥ. (53)
Uttaraḥ – One who is Uttirna or liberated from Samsara.
Gōpatiḥ – Krishna who tends the cattle in the form of a Gopa. One who is the master of the earth.
Gōptā – One who is the protector of all beings.
Jñānagamyaḥ – The Lord cannot be known through Karma or a combination of Karma and Jñāna.
Purātanaḥ – One who is not limited by time and who existed before anything else.
Śarīrabhūtabhṛd – One who is the master of the five Bhutas (elements) of which the body is made.
Bhōktā – One who protects. Or one who is the enjoyer of infinite bliss.
Kapīndraḥ – Kapi means Varah (boar). The word means, the Lord who is Indra and also one who manifested as Varaha or the Boar in one of the incarnations. Or it signifies His Rama incarnation in which He played the role of the master of the monkeys.
Bhūridakṣiṇaḥ – One to whom numerous Dakshinas or votive offerings are made in Yajnas.
सोमपोऽमृतपः सोमः पुरुजित्पुरुसत्तमः ।
विनयो जयः सत्यसन्धो दाशार्हः सात्वताम्पतिः ॥५४॥
somapo 'mṛtapaḥ somaḥ purujit purusattamaḥ,
vinayo jayaḥ satyasandho dāśārhaḥ sātvatāṃ patiḥ. (54)
Sōmapaḥ – One who drinks the Soma in all Yajnas in the form of the Devata.
Amṛtapaḥ – One who drinks the drink of immortal Bliss which is of one's own nature.
Sōmaḥ – One who as the moon invigorates the plants.
Purujit – One who gains victory over numerous people.
Puruṣhottamaḥ – As His form is of cosmic dimension He is Puru or great, and as He is the most important of all, He is Sattama.
Vinayaḥ – One who inflicts Vinaya or punishment on evil ones.
Jayaḥ – One who is victorious over all beings.
Satyasandhaḥ – One whose 'Sandha' or resolve becomes always true.
Dāśārhaḥ – Dasha means charitable offering. Therefore, He to whom charitable offerings deserve to be made.
Sātvatāṃ-patiḥ – 'Satvatam' is the name of a Tantra. So the one who gave it out or commented upon it.
जीवो विनयिता साक्षी मुकुन्दोऽमितविक्रमः ।
अम्भोनिधिरनन्तात्मा महोदधिशयोऽन्तकः ॥५५॥
jīvo vinayitā sākṣī mukundo 'mitavikramaḥ,
ambhonidhir anantātmā mahodadhiśayo 'ntakaḥ. (55)
Jīvaḥ – One who as the Kshetragya or knower of the field or the body, is associated with the Prāṇas.
Vinayitā-sākṣī – One who witnesses the Vinayita or worshipful attitude of all devotees.
Mukundaḥ – One who bestows Mukti or Liberation.
Amitavikramaḥ – One whose three strides were limitless.
Ambhōnidhiḥ – One in whom the Ambas or all beings from Devas down dwell.
Anantātmā – One who cannot be determined by space, time and causation.
Mahōdadhi-śayaḥ – One who lies in the water of Cosmic Dissolution into which all entities in the universe have been dissolved.
Antakaḥ – One who brings about the end of all beings.
अजो महार्हः स्वाभाव्यो जितामित्रः प्रमोदनः ।
आनन्दो नन्दनो नन्दः सत्यधर्मा त्रिविक्रमः ॥५६॥
ajo mahārhaḥ svābhāvyo jitāmitraḥ pramodanaḥ,
ānando nandano nandaḥ satyadharmā trivikramaḥ. (56)
Ajaḥ – 'A' means Mahavishnu. So the word means one who is born of Vishnu i.e. Kama Deva.
Mahārhaḥ – One who is fit for worship.
Svābhāvyaḥ – Being eternally perfect He is naturally without a beginning.
Jitāmitraḥ – One who has conquered the inner enemies like attachment, anger, etc. as also external enemies like Ravana, Kumbhakarna etc.
Pramōdanaḥ – One who is always joyous as He is absorbed in immortal Bliss.
Ānandaḥ – One whose form is Ananda or Bliss.
Nandanaḥ – One who gives delight.
Nandaḥ – One endowed with all perfections.
Satyadharmā – One whose knowledge and other attributes are true.
Trivikramaḥ – One whose three strides covered the whole world.
महर्षिः कपिलाचार्यः कृतज्ञो मेदिनीपतिः ।
त्रिपदस्त्रिदशाध्यक्षो महाशङ्गः कृतान्तकृत् ॥५७॥
maharṣiḥ kapilācāryaḥ kṛtajño medinīpatiḥ,
tripadas tridaśādhyakṣo mahāśṛṅgaḥ kṛtāntakṛt. (57)
Maharṣiḥ Kapilācāryaḥ – Kapila is called Maharshi because he was master of all the Vedas.
Kṛtajñaḥ – Kruta means the world because it is of the nature of an effect.
Medinīpatiḥ – One who is the Lord of the earth.
Tripadaḥ – One having three strides.
Tridaśādhyakṣaḥ – One who is the witness of the three states of waking, dream and sleep, which spring from the influence of the Gunas.
Mahāśṛṅgaḥ – One with a great horn.
Kṛtānta-kṛt – One who brings about the destruction of the Kṛta or the manifested condition of the universe.
महावराहो गोविन्दः सुषेणः कनकाङ्गदी ।
गुह्यो गभीरो गहनो गुप्तश्चक्रगदाधरः ॥५८॥
mahāvarāho govindaḥ suṣeṇaḥ kanakāṅgadī,
guhyo gabhīro gahano guptaś cakragadādharaḥ. (58)
Mahā-varāhaḥ – The great Cosmic Boar.
Gōvindaḥ – 'Go' means Words, that is the Vedic sentences. He who is known by them is Gōvindaḥ.
Suṣeṇaḥ – One who has got about Him an armed guard in the shape of His eternal associates.
Kanakāṅgadī – One who has Angadas (armlets) made of gold.
Guhyaḥ – One who is to be known by the Guhya or the esoteric knowledge conveyed by the Upanishads. Or one who is hidden in the Guha or heart.
Gabhīraḥ – One who is of profound majesty because of attributes like omniscience, lordliness, strength, prowess, etc.
Gahanaḥ – One who could be entered into only with great difficulty. One who is the witness of the three states of waking, dreams and sleep as also their absence.
Guptaḥ – One who is not an object of words, thought, etc.
Chakra-gadā-dharaḥ – One who has discus and Gada in hand.
वेधाः स्वाङ्गोऽजितः कृष्णो दृढः सङ्कर्षणोऽच्युतः ।
वरुणो वारुणो वृक्षः पुष्कराक्षो महामनाः ॥५९॥
vedhāḥ svāṅgo 'jitaḥ kṛṣṇo dṛḍhaḥ saṅkarṣaṇo 'cyutaḥ,
varuṇo vāruṇo vṛkṣaḥ puṣkarākṣo mahāmanāḥ. (59)
Vedhāḥ – One who does Vidhana or regulation.
Svāṅgaḥ – One who is oneself the participant in accomplishing works.
Ajitaḥ – One who has not been conquered by anyone in His various incarnations.
Kṛṣṇaḥ – One who is known as Krishna-dvaipayana.
Dṛḍhaḥ – One whose nature and capacity know no decay.
Saṅkarṣaṇo-acyutaḥ – Sankarshana is one who attracts to oneself all beings at the time of cosmic Dissolution and Acyuta is one who knows no fall from His real nature. They form one word with the first as the qualification – Acyuta who is Sankarshana.
Varuṇaḥ – The evening sun is called Varuna, because he withdraws his rays into himself.
Vāruṇaḥ – The Lord manifested as Vasishta or Agastya, the sons of Mitra-Varuṇa.
Vṛukṣaḥ – One who is unshakable like a tree.
Puṣkarākṣaḥ – One who shines as the light of consciousness when meditated upon in the lotus of the heart. Or one who has eyes resembling the lotus.
Mahāmanāḥ – One who fulfils the three functions of creation, sustentation and dissolution of the universe by the mind alone.
भगवान् भगहाऽऽनन्दी वनमाली हलायुधः ।
आदित्यो ज्योतिरादित्यः सहिष्णुर्गतिसत्तमः ॥६०॥
bhagavān bhagahānandī vanamālī halāyudhaḥ,
ādityo jyotir ādityaḥ sahiṣṇur gatisattamaḥ. (60)
Bhagavān – The origin, dissolution, the bondage and salvation of creatures, knowledge, ignorance – one who knows all these is Bhagavan.
Bhagahā – One who withdraws the six divine attributes (bhaga) into Himself at dissolution.
Ānandī – One whose nature is Ananda (bliss).
Vanamālī – One who wears the floral wreath (Vanamala) called Vaijayanti, which consists of the categories of five elements.
Halāyudhaḥ – One who in His incarnation as Balabhadra had Hala or ploughshare as His weapon.
Ādityaḥ – One who was born of Aditi in His incarnation as Vamana.
Jyōtir-ādityaḥ – One who dwells in the brilliance of the sun's orb.
Sahiṣṇuḥ – One who puts up with the contraries like heat and cold.
Gatisattamaḥ – One who is the ultimate resort and support of all, and the greatest of all beings.
सुधन्वा खण्डपरशुर्दारुणो द्रविणप्रदः ।
दिवस्पृक् सर्वदृग्व्यासो वाचस्पतिरयोनिजः ॥६१॥
sudhanvā khaṇḍaparaśur dāruṇo draviṇapradaḥ,
divaḥspṛk sarvadṛg vyāso vācaspatir ayonijaḥ. (61)
Sudhanvā – One who has got as His weapon the bow named Saranga of great excellence.
Khaṇda-paraśuḥ – The battle-axe that destroys enemies.
Dāruṇaḥ – One who is harsh and merciless to those who are on the evil path.
Draviṇapradaḥ – One who bestows the desired wealth on devotees.
Divah-spṛk – One who touches the heavens.
Sarvadṛg-vyāsaḥ – One whose comprehension includes everything in its ambit.
Vācaspatirayōnijaḥ – The Lord is Vachaspati because He is the master of all learning. He is Ayonija because He was not born of a mother. This forms a noun in combination with the attribute.
त्रिसामा सामगः साम निर्वाणं भेषजं भिषक् ।
संन्यासकृच्छमः शान्तो निष्ठा शान्तिः परायणम् ॥६२॥
trisāmā sāmagaḥ sāma nirvāṇaṃ bheṣajaṃ bhiṣak,
saṃnyāsakṛc chamaḥ śānto niṣṭhā śāntiḥ parāyaṇam. (62)
Trisāmā – One who is praised by the chanters of Sama-gana through the three Samas known as Devavratam.
Sāmagaḥ – One who chants the Sama-gana.
Sāma – Among the Vedas, I am Sama Veda.
Nirvāṇaṃ – That in which all miseries cease and which is of the nature of supreme bliss.
Bheṣajaṃ – The medicine for the disease of Samsara.
Bhiṣak – The Lord is called Bhishak or physician.
Saṃnyāsakṛt – One who instituted the fourth Ashrama of Sanyasa for the attainment of Mokṣa.
Samaḥ – One who has ordained the pacification of the mind as the most important discipline for Sannyasins (ascetics).
Sāntaḥ – The peaceful, being without interest in pleasures of the world.
Niṣṭhā – One in whom all beings remain in abeyance at the time of Pralaya.
Śāntiḥ – One in whom there is complete erasing of Avidyā or ignorance. That is Brahman.
Parāyaṇam – The state, which is the highest and from which there is no return to lower states.
शुभाङ्गः शान्तिदः स्रष्टा कुमुदः कुवलेशयः ।
गोहितो गोपतिर्गोप्ता वृषभाक्षो वृषप्रियः ॥६३॥
śubhāṅgaḥ śāntidaḥ sraṣṭā kumudaḥ kuvaleśayaḥ,
gohito gopatiḥ goptā vṛṣabhākṣo vṛṣapriyaḥ. (63)
Śubhāṅgaḥ – One with a handsome form.
Śāntidaḥ – One who bestows shanti, that is, a state of freedom from attachment, antagonism, etc.
Sraṣṭā – One who brought forth everything at the start of the creative cycle.
Kumudaḥ – 'Ku' means the earth. One who delights in it.
Kuvaleśayaḥ – 'Ku' means earth. That which surrounds it is water, so 'Kuvala' means water. One who lies in water is Kuvalesaya. 'Kuvala' also means the underside of serpents. One who lies on a serpent, known as Adisesha, is Kuvalesaya.
Gōhitaḥ – One who protected the cows by uplifting the mount Govardhana in His incarnation as Krishna.
Gōpatiḥ – The Lord of the earth is Vishnu.
Gōptā – One who is the protector of the earth. Or one who hides Himself by His Maya.
Vṛṣabhākṣaḥ – One whose eyes shower all desired objects on devotees; one whose glance is full of Dharma.
Vṛṣ apriyaḥ – One to whom Vṛṣa or Dharma is dear.
अनिवर्ती निवृत्तात्मा सङ्क्षेप्ता क्षेमकृच्छिवः ।
श्रीवत्सवक्षाः श्रीवासः श्रीपतिः श्रीमतांवरः ॥६४॥
anivartī nivṛttātmā saṃkṣeptā kṣemakṛc chivaḥ,
śrīvatsavakṣāḥ śrīvāsaḥ śrīpatiḥ śrīmatāṃ varaḥ. (64)
Anivartī – One who never retreats in the battle with Asuras. Or one who, being devoted to Dharma, never abandons it.
Nivṛttātmā – One whose mind is naturally withdrawn from the objects of senses.
Saṃkṣeptā – One who at the time of cosmic dissolution contracts the expansive universe into a subtle state.
Kṣemakṛt – One who gives Kshema or protection to those that go to him.
Śivaḥ – One who purifies everyone by the very utterance of His name.
Śrīvatsavakṣāḥ – One on whose chest there is a mark called Śrīvatsa.
Śrīvāsaḥ – One on whose chest Śrīdevī always dwells.
Śrīpatiḥ – One whom at the time of the churning of the Milk ocean Shridevi chose as her consort, rejecting all other Devas and Asuras. Or Shri mean supreme Cosmic Power. The Lord is the master of that Power.
Śrīmatāṃ-varaḥ – One who is supreme over all deities like Brahma who are endowed with power and wealth of the Vedas.
श्रीदः श्रीशः श्रीनिवासः श्रीनिधिः श्रीविभावनः ।
श्रीधरः श्रीकरः श्रेयः श्रीमाँल्लोकत्रयाश्रयः ॥६५॥
śrīdaḥ śrīśaḥ śrīnivāsaḥ śrīnidhiḥ śrīvibhāvanaḥ,
śrīdharaḥ śrīkaraḥ śreyaḥ śrīmān lokatrayāśrayaḥ. (65)
Śrīdaḥ – One who bestows prosperity on devotees.
Śrīśaḥ – One who is Lord of the Goddess Shri.
Śrīnivāsaḥ – Shri here denotes men with Shri, that is, virtue and power. He who dwells in such men is Shrinivasa.
Śrīnidhiḥ – One who is the seat of all Shri, that is, virtues and powers.
Śrīvibhāvanaḥ – One who grants every form of prosperity and virtue according to their Karma.
Śrīdharaḥ – One who bears on His chest Shri who is the mother of all.
Śrīkaraḥ – One who makes devotees – those who praise, think about Him and worship Him- into virtuous and powerful beings.
Śreyaḥ – 'Shreyas' means the attainment of what is un-decaying good and happiness. Such a state is the nature of the Lord.
Śrīmān – One in whom there are all forms of Shri that is power, virtue, beauty, etc.
Lōkatrayāśrayaḥ – One who is the support of all the three worlds.
स्वक्षः स्वङ्गः शतानन्दो नन्दिर्ज्योतिर्गणेश्वरः ।
विजितात्माऽविधेयात्मा सत्कीर्तिश्छिन्नसंशयः ॥६६॥
svakṣaḥ svaṅgaḥ śatānando nandir jyotirgaṇeśvaraḥ,
vijitātmā vidheyātmā satkīrtiś chinnasaṃśayaḥ. (66)
Svakṣaḥ – One who's Akshas (eyes) are handsome like lotus flowers.
Svaṅgaḥ – One whose limbs are beautiful.
Śatānandaḥ – One who is non-dual and is of the nature of supreme bliss.
Nandiḥ – One who is of the nature of supreme Bliss.
Jyōtir-gaṇeśvaraḥ – One who is the Lord of the stars, that is, Jyotirgana.
Vijitātmā – One who has conquered the Atma that is the mind.
Vidheyātmā – One whose Self is perfectly disciplined/governed.
Satkīrtiḥ – One whose fame is of the nature of truth.
Chinna-saṃśayaḥ – One who has no doubts, as everything is clear to him like a fruit in the palm.
उदीर्णः सर्वतश्चक्षुरनीशः शाश्वतस्थिरः ।
भूशयो भूषणो भूतिर्विशोकः शोकनाशनः ॥६७॥
udīrṇaḥ sarvataś cakṣur anīśaḥ śāśvatasthiraḥ,
bhūśayo bhūṣaṇo bhūtir viśokaḥ śokanāśanaḥ. (67)
Udīrṇaḥ – He who is superior to all beings.
Sarvataḥ-cakṣuḥ – One who, being of the nature of pure consciousness, can see everthing in all directions.
Anīśaḥ – One who cannot have anyone to lord over him.
Śāśvata-sthiraḥ – One, who though eternal is also unchanging.
Bhūśayaḥ – One who, while seeking the means to cross over to Lanka, had to sleep on the ground of the sea-beach.
Bhūṣaṇaḥ – One who adorned the earth by manifesting as various incarnations.
Bhūtiḥ – One who is the abode or the essence of everthing, or is the source of all glorious manifestations.
Viśōkaḥ – One who, being of the nature of bliss, is free from all sorrow.
Śōkanāśanaḥ – One who effaces the sorrows of devotees even by mere remembrance.
अर्चिष्मानर्चितः कुम्भो विशुद्धात्मा विशोधनः ।
अनिरुद्धोऽप्रतिरथः प्रद्युम्नोऽमितविक्रमः ॥६८॥
arciṣmān arcitaḥ kumbho viśuddhātmā viśodhanaḥ,
aniruddho 'pratirathaḥ pradyumno 'mitavikramaḥ. (68)
Arciṣmān – He by whose rays of light (Arciṣ), the sun, the moon and other luminaries are endowed with brilliance.
Arcitaḥ – One who is worshipped by Brahma and other Devas who are themselves objects of worship in all the worlds.
Kumbhaḥ – He who contains everything within Himself, as in a pot.
Viśuddhātmā – Being above the three Guṇas – Sattva, Rajas and Tamas – the Lord is pure spirit and is also free from all impurities.
Viśodhanaḥ – One who destroys all sins by mere remembrance.
Aniruddhaḥ – The last of the four Vyūhas – Vāsudeva, Saṃkarṣaṇa, Pradyumna and Aniruddha. Or one who cannot be obstructed by enemies.
Aprati-rathaḥ – One who has no equal antagonist to confront.
Pradyumnaḥ – One whose Dyumna (wealth) is of a superior and sacred order. Or one of the four Vyūhas.
Amitavikramaḥ – One of unlimited prowess, whose courage cannot be obstructed by anyone.
कालनेमिनिहा वीरः शौरिः शूरजनेश्वरः ।
त्रिलोकात्मा त्रिलोकेशः केशवः केशिहा हरिः ॥६९॥
kālaneminihā vīraḥ śauriḥ śūrajaneśvaraḥ,
trilokātmā trilokeśaḥ keśavaḥ keśihā hariḥ. (69)
Kālanemi-nihā – One who destroyed the Asura named Kālanemi.
Vīraḥ – One who is courageous and valiant.
Śauriḥ – One who was born in the clan of Śūra, as Kṛṣṇa.
Śūrajaneśvaraḥ – One who by his overwhelming prowess controls even great powers like Indra and others.
Trilokātmā – One who, in his capacity as the inner pervader, is the soul of the three worlds.
Trilokeśaḥ – One under whose guidance and command everything in the three worlds is functioning.
Keśavaḥ – By Keśa is meant the rays of light spreading within the orbit of the sun; the Lord is thus their source.
Keśihā – One who destroyed the Asura named Keśi.
Hariḥ – One who destroys Saṃsāra – entanglement in the cycle of birth and death – along with ignorance, its cause.
कामदेवः कामपालः कामी कान्तः कृतागमः ।
अनिर्देश्यवपुर्विष्णुर्वीरोऽनन्तो धनञ्जयः ॥७०॥
kāmadevaḥ kāmapālaḥ kāmī kāntaḥ kṛtāgamaḥ,
anirdeśyavapuḥ viṣṇuḥ vīro 'nanto dhanañjayaḥ. (70)
Kāmadevaḥ – One who is desired by persons seeking the four values of life – Dharma, Artha, Kāma and Mokṣa.
Kāmapālaḥ – One who protects and fulfils the desired ends of people endowed with righteous desires.
Kāmī – One who by nature has all His desires perpetually satisfied.
Kāntaḥ – One whose form is endowed with great beauty. Or one who effects the dissolution of Brahmā at the end of a Dviparārdha.
Kṛtāgamaḥ – He who produced the scriptures – Śruti, Smṛti and Āgama.
Anirdeśya-vapuḥ – One whose form cannot be determined, being beyond the Guṇas.
Viṣṇuḥ – One whose brilliance has spread over the sky and the earth.
Vīraḥ – One who has the power of movement and heroic action.
Anantaḥ – One who pervades everything, is eternal, the soul of all, and cannot be limited by space, time or location.
Dhanañjayaḥ – Arjuna is so called because by conquering kingdoms in all four quarters he acquired great wealth. Arjuna is a Vibhūti, a glorious manifestation of the Lord.
ब्रह्मण्यो ब्रह्मकृद् ब्रह्मा ब्रह्म ब्रह्मविवर्धनः ।
ब्रह्मविद् ब्राह्मणो ब्रह्मी ब्रह्मज्ञो ब्राह्मणप्रियः ॥७१॥
brahmaṇyo brahmakṛd brahmā brahma brahmavivardhanaḥ,
brahmavid brāhmaṇo brahmī brahmajño brāhmaṇapriyaḥ. (71)
Brahmaṇyaḥ – The Vedas, Brāhmaṇas and knowledge are indicated by the word Brahma. As the Lord promotes these, He is called Brahmaṇya.
Brahmakṛt – One who performs Brahma – i.e., Tapas (austerity).
Brahmā – One who creates everything, as the creator Brahmā.
Brahma – Being vast and all-expanding, the Lord known through indicators like Satya (Truth) is called Brahma. Brahma is Truth, Knowledge and Infinity.
Brahma-vivardhanaḥ – One who promotes Tapas (austerity) and spiritual disciplines.
Brahmavid – One who knows the Vedas and their real meaning.
Brāhmaṇaḥ – One who, in the form of a Brāhmaṇa, instructs the whole world in the injunctions of the Veda.
Brahmī – One in whom entities such as Tapas, Veda, mind and Prāṇa – all called Brahma – are established.
Brahmajñaḥ – One who knows the nature of Brahman.
Brāhmaṇapriyaḥ – One to whom holy men (Brāhmaṇas) are devoted, and who is dear to them.
महाक्रमो महाकर्मा महातेजा महोरगः ।
महाक्रतुर्महायज्वा महायज्ञो महाहविः ॥७२॥
mahākramo mahākarmā mahātejā mahoragaḥ,
mahākratur mahāyajvā mahāyajño mahāhaviḥ. (72)
Mahākramaḥ – One with enormous strides. May Viṣṇu with enormous strides bestow on us happiness.
Mahākarmā – One who performs great works such as the creation of the world.
Mahātejāḥ – He from whose brilliance the sun and other luminaries derive their brilliance.
Mahoragaḥ – He who is also the great serpent (Ādiśeṣa).
Mahākratuḥ – He who is the great Kratu (sacrifice).
Mahāyajvā – One who is great and performs sacrifices for the good of the world.
Mahāyajñaḥ – He who is the great Yajña (sacrifice) itself.
Mahāhaviḥ – The whole universe conceived as Brahman and offered as sacrificial oblation (Havis) into the fire of the Self, which is Brahman.
स्तव्यः स्तवप्रियः स्तोत्रं स्तुतिः स्तोता रणप्रियः ।
पूर्णः पूरयिता पुण्यः पुण्यकीर्तिरनामयः ॥७३॥
stavyaḥ stavapriyaḥ stotraṃ stutiḥ stotā raṇapriyaḥ,
pūrṇaḥ pūrayitā puṇyaḥ puṇyakīrtir anāmayaḥ. (73)
Stavyaḥ – One who is the object of laudations by all, but who Himself never praises any other being.
Stava-priyaḥ – One who is pleased with hymns of praise.
Stotraṃ – A Stotra – a hymn proclaiming the glory, attributes and names of the Lord.
Stutiḥ – Praise itself; the act of glorification.
Stotā – One who, being all-formed, is also the person who sings the hymn of praise.
Raṇapriyaḥ – One who is fond of battle for the protection of the world, ever bearing the discus Sudarśana, the mace Kaumodakī, the bow Śārṅga, the sword Nandaka and the conch Pāñcajanya.
Pūrṇaḥ – One who is self-fulfilled, being the source of all powers and excellences.
Pūrayitā – One who is not only self-fulfilled but gives all fulfillments to others.
Puṇyaḥ – One by merely hearing about whom all sins are erased.
Puṇyakīrtiḥ – One of holy fame, whose excellences confer great merit on others.
Anāmayaḥ – One who is not afflicted by any disease arising from internal or external causes.
मनोजवस्तीर्थकरो वसुरेता वसुप्रदः ।
वसुप्रदो वासुदेवो वसुर्वसुमना हविः ॥७४॥
manojavastīrthakaraḥ vasuretas vasupradaḥ,
vasuprado vāsudevo vasur vasumānā haviḥ. (74)
Manojavaḥ – One who, being all-pervading, is said to be endowed with speed like that of the mind.
Tīrthakaraḥ – Tīrtha means Vidyā, a branch of knowledge or skill. One who is the source of all sacred knowledge.
Vasu-retāḥ – He whose Retas (creative essence) is golden (Vasu) in nature.
Vasupradaḥ (1) – One who gladly bestows wealth in abundance; the true master of all wealth.
Vasupradaḥ (2) – One who bestows on devotees the highest wealth of all, Mokṣa.
Vāsudevaḥ – The son of Vasudeva.
Vasuḥ – He in whom all creation dwells.
Vasumānāḥ – One whose mind dwells equally in all things.
Haviḥ – Havis, the sacrificial oblation.
सद्गतिः सत्कृतिः सत्ता सद्भूतिः सत्परायणः ।
शूरसेनो यदुश्रेष्ठः सन्निवासः सुयामुनः ॥७५॥
sadgatiḥ satkṛtiḥ sattā sadbhūtiḥ satparāyaṇaḥ,
śūraseno yaduśreṣṭhaḥ sannivāsaḥ suyāmunaḥ. (75)
Sadgatiḥ – One who is attained by the virtuous; or one who is endowed with intelligence of great excellence.
Satkṛtiḥ – One whose achievements are for the protection of the world.
Sattā – Experience that is without any internal or external differences – Pure Being.
Sad-bhūtiḥ – The Paramātman who is pure existence and consciousness, unsublatable and manifesting in many ways.
Satparāyaṇaḥ – He who is the highest status attainable by holy men who have realised the Truth.
Śūrasenaḥ – One having an army of heroic warriors like Hanumān.
Yaduśreṣṭhaḥ – One who is the greatest among the Yadus.
Sannivāsaḥ – One who is the resort of holy and knowing ones.
Suyāmunaḥ – One surrounded by illustrious persons associated with the river Yamunā: Devakī, Vasudeva, Nandagopa, Yaśodā, Balarāma, Subhadrā and others.
भूतावासो वासुदेवः सर्वासुनिलयोऽनलः ।
दर्पहा दर्पदो दृप्तो दुर्धरोऽथापराजितः ॥७६॥
bhūtāvāso vāsudevaḥ sarvāsunilayo 'nalaḥ,
darpahā darpado dṛpto durddharo 'thāparājitaḥ. (76)
Bhūtāvāsaḥ – He in whom all beings dwell.
Vāsudevaḥ – The Divinity who pervades the whole universe by Māyā.
Sarvāsunilayaḥ – He in whose form as the Jīva all the vital energy (Prāṇa) of all living beings dissolves.
Analaḥ – One whose wealth or power has no limits.
Darpahā – One who subdues the pride of those who walk the unrighteous path.
Darpadaḥ – One who endows those who walk the path of righteousness with a sense of dignified self-respect.
Dṛptaḥ – One who is ever satisfied through the enjoyment of His own inherent bliss.
Durdharaḥ – One who is very difficult to contain in the heart during meditation.
Aparājitaḥ – One who is never conquered by internal enemies like attachment nor by external enemies like the Asuras.
विश्वमूर्तिर्महामूर्तिर्दीप्तमूर्तिरमूर्तिमान् ।
अनेकमूर्तिरव्यक्तः शतमूर्तिः शताननः ॥७७॥
viśvamūrtir mahāmūrtir dīptamūrtir amūrtimān,
anekamūrtir avyaktaḥ śatamūrtiḥ śatānanaḥ. (77)
Viśvamūrtiḥ – One who, being the soul of all, has the whole universe as His body.
Mahāmūrtiḥ – One with an enormous form reclining on the serpent-couch of Ādiśeṣa.
Dīptamūrtiḥ – One with a luminous form of knowledge.
Amūrtimān – He who is without a body born of Karma.
Anekamūrtiḥ – One who assumes several bodies in His incarnations in order to help the world.
Avyaktaḥ – One who, though having many forms, cannot be clearly pointed to as 'This'.
Śatamūrtiḥ – One who, though of the nature of Pure Consciousness, assumes different forms for temporary purposes.
Śatānanaḥ – One with a hundred faces – indicating that He has countless forms.
एको नैकः सवः कः किं यत् तत्पदमनुत्तमम् ।
लोकबन्धुर्लोकनाथो माधवो भक्तवत्सलः ॥७८॥
eko naikaḥ savaḥ kaḥ kiṃ yat tat padam anuttamam,
lokabandhuḥ lokānātho mādhavo bhaktavatsalaḥ. (78)
Ekaḥ – One without any kind of internal, external or dissimilar differences – absolutely non-dual.
Naikaḥ – One who has numerous bodies born of Māyā.
Savaḥ – That Yajña in which Soma is prepared and used.
Kaḥ – The syllable 'Ka' indicates joy or happiness; thus one who is hymned as constituted of joy.
Kim – One who is fit to be contemplated upon, being the summation of all values.
Yat – One who is by nature self-existent; 'Yat' indicates a self-subsisting entity.
Tat – Brahma is so called because He 'expands' (Tanoti).
Padamanuttamam – Brahman is 'Pada' or the ultimate Status – the goal of all Mokṣa-seekers. It is Anuttama because there is nothing beyond It to be attained.
Lokabandhuḥ – One who is the friend of all the worlds.
Lokānāthaḥ – One to whom all the worlds pray.
Mādhavaḥ – One who was born in the clan of Madhu.
Bhaktavatsalaḥ – One who has boundless love for devotees.
सुवर्णवर्णो हेमाङ्गो वराङ्गश्चन्दनाङ्गदी ।
वीरहा विषमः शून्यो घृताशीरचलश्चलः ॥७९॥
suvarṇavarṇo hemāṅgo varāṅgaś candanāṅgadī,
vīrahā viṣamaḥ śūnyo ghṛtāśīr acalaś calaḥ. (79)
Suvarṇavarṇaḥ – One who has the colour of gold.
Hemāṅgaḥ – One whose form is like gold.
Varāṅgaḥ – He whose bodily parts are all brilliantly beautiful.
Candanāṅgadī – One who is adorned with fragrant sandalwood paste and armlets that generate joy.
Vīrahā – One who destroyed heroes (Vīras) like Hiraṇyakaśipu for protecting Dharma.
Viṣamaḥ – One to whom there is no equal, because nothing is comparable to Him by any characteristic.
Śūnyaḥ – One who, being without any limiting attributes, appears as Śūnya (emptiness) to those seeking to define Him.
Ghṛtāśīḥ – One whose blessings are unfailing.
Acalaḥ – One who cannot be deprived of His real nature as Truth, Intelligence and Infinity.
Calaḥ – One who moves in the form of air (Vāyu).
अमानी मानदो मान्यो लोकस्वामी त्रिलोकधृक् ।
सुमेधा मेधजो धन्यः सत्यमेधा धराधरः ॥८०॥
amānī mānado mānyo lokasvāmī trilokadhṛk,
sumedhā medhajo dhanyaḥ satyamedhā dharādharaḥ. (80)
Amānī – He who, being of the nature of Pure Consciousness, has no sense of identification with anything that is not the Ātman.
Mānadaḥ – One who by His Māyā induces the sense of self in non-self; or one who bestows honour and grace upon devotees.
Mānyaḥ – One who is to be adored by all, because He is the God of all.
Lokasvāmī – One who is the Lord of all the fourteen spheres.
Trilokadhṛt – One who supports all the three worlds.
Sumedhāḥ – One with great and beneficent intelligence.
Medhajaḥ – One who arose from Yāga (a kind of sacrifice).
Dhanyaḥ – One who has attained all His ends and is therefore perfectly self-satisfied.
Satyamedhāḥ – One whose intelligence always bears fruit.
Dharādharaḥ – One who supports the worlds through His fractions (aspects) like Ādiśeṣa.
तेजोवृषो द्युतिधरः सर्वशस्त्रभृतां वरः ।
प्रग्रहो निग्रहो व्यग्रो नैकशृङ्गो गदाग्रजः ॥८१॥
tejovṛṣo dyutidharaḥ sarvaśastrabhṛtāṃ varaḥ,
pragraho nigraho vyagro naikaśṛṅgo gadāgrajaḥ. (81)
Tejovṛṣaḥ – One who in the form of the sun causes rainfall at all times.
Dyutidharaḥ – One whose form is always resplendent.
Sarva-śastra-bhṛtāṃ varaḥ – One who is superior to all who bear arms.
Pragrahaḥ – One who accepts the offerings of devotees with great delight.
Nigrahaḥ – One who controls and ultimately dissolves everything.
Vyagraḥ – One who has no end (Agra). Or one who is ever attentive in granting the prayers of devotees.
Naikaśṛṅgaḥ – One with four horns, as the Cosmic Boar (Varāha).
Gadāgrajaḥ – One who is first revealed by Mantra (Nigada). Or one who is the elder brother of Gada.
चतुर्मूर्तिश्चतुर्बाहुश्चतुर्व्यूहश्चतुर्गतिः ।
चतुरात्मा चतुर्भावश्चतुर्वेदविदेकपात् ॥८२॥
caturmūrtiś caturbāhuś caturvyūhaś caturgatiḥ,
caturātmā caturbhāvaś caturvedavid ekapāt. (82)
Caturmūrtiḥ – One with four aspects: Virāṭ, Sūtrātman, Avyākṛta and Turīya. Or one with four horns of white, red, yellow and black.
Caturbāhuḥ – One with four arms, as Vāsudeva is always described.
Caturvyūhaḥ – One having four manifestations: Vāsudeva, Saṃkarṣaṇa, Pradyumna and Aniruddha.
Caturgatiḥ – One who is sought as the end by the four orders of life (Āśramas) and four Varṇas ordained by the scriptures.
Caturātmā – One whose Self is specially endowed with puissance, being without attachment, antagonism or limitation.
Caturbhāvaḥ – One from whom the four human values – Dharma, Artha, Kāma and Mokṣa – have originated.
Catur-vedavid – One who understands the true meaning of the four Vedas.
Ekapāt – One with a single Pāda (foot or manifestation), suggesting His transcendent unity.
समावर्तोऽनिवृत्तात्मा दुर्जयो दुरतिक्रमः ।
दुर्लभो दुर्गमो दुर्गो दुरावासो दुरारिहा ॥८३॥
samāvarto 'nivṛttātmā durjayo duratikramaḥ,
durlabho durgamo durgo durāvāso durārihā. (83)
Samāvartaḥ – One who effectively whirls the wheel of Saṃsāra.
Anivṛttātmā – One who is not separated from anything or anywhere, because He is all-pervading.
Durjayaḥ – One who cannot be conquered.
Duratikramaḥ – One out of fear of whom even heavenly beings like the sun dare not oppose His command.
Durlabhaḥ – One who can be attained by Bhakti, which is itself difficult to cultivate.
Durgamaḥ – One whom it is difficult to attain.
Durgaḥ – One the attainment of whom is rendered difficult by various obstacles.
Durāvāsaḥ – He whom Yogīs, only with great difficulty, bring to reside in their hearts in Samādhi.
Durārihā – One who destroys inimical beings like the Asuras.
शुभाङ्गो लोकसारङ्गः सुतन्तुस्तन्तुवर्धनः ।
इन्द्रकर्मा महाकर्मा कृतकर्मा कृतागमः ॥८४॥
śubhāṅgo lokasāraṅgaḥ sutantus tantuvardhanaḥ,
indrakarmā mahākarmā kṛtakarmā kṛtāgamaḥ. (84)
Śubhāṅgaḥ – One whose form is very auspicious to meditate upon.
Lokasāraṅgaḥ – One who like the Sāraṅga (honey-bee) extracts the essence from the world.
Sutantuḥ – As this universe of infinite extension belongs to Him, the Lord is called Sutantu ('beautiful web').
Tantu-vardhanaḥ – One who can augment or contract the web of this world.
Indra-karmā – One whose actions are like those of Indra – highly commendable and excellent.
Mahākarmā – One of whom the great elements like Ākāśa are effects.
Kṛtakarmā – One who has fulfilled everything and has nothing more to accomplish.
Kṛtāgamaḥ – One who has given out the Āgama in the form of the Veda.
उद्भवः सुन्दरः सुन्दो रत्ननाभः सुलोचनः ।
अर्को वाजसनः शृङ्गी जयन्तः सर्वविज्जयी ॥८५॥
udbhavaḥ sundaraḥ sundo ratnanābhaḥ sulocanaḥ,
arko vājasanaḥ śṛṅgī jayantaḥ sarvavij jayī. (85)
Udbhavaḥ – One who assumes great and noble embodiments entirely out of His own will.
Sundaraḥ – One who has a graceful beauty that enchants everyone.
Sundaḥ – One noted for extreme tenderness (Undana).
Ratna-nābhaḥ – Ratna indicates beauty; one whose navel is exceedingly beautiful.
Sulocanaḥ – One who has brilliant eyes, the knowledge of everything.
Arkaḥ – One who is worshipped even by beings like Brahmā who are themselves objects of worship.
Vājasanaḥ – One who gives Vāja (food) to those who entreat Him.
Śṛṅgī – One who at the time of Pralaya assumed the form of a fish with a prominent horn.
Jayantaḥ – One who conquers enemies easily.
Sarvavijjayī – The Lord is 'Sarvavit' (all-knowing) and 'Jayī' (conqueror of all inner forces like attachment and anger as well as outer foes like Hiraṇyākṣa).
सुवर्णबिन्दुरक्षोभ्यः सर्ववागीश्वरेश्वरः ।
महाह्रदो महागर्तो महाभूतो महानिधिः ॥८६॥
suvarṇabindur akṣobhyaḥ sarvavāgīśvareśvaraḥ,
mahāhrado mahāgarto mahābhūto mahānidhiḥ. (86)
Suvarṇabinduḥ – One whose limbs (Bindus) are equal to gold in brilliance.
Akṣobhyaḥ – One who is never perturbed by passions like attachment and aversion, by sense-objects, nor by the Asuras.
Sarva-vāgīśvareśvaraḥ – One who is the master of all masters of learning, including Brahmā.
Mahāhradaḥ – He is called a great lake (Hrada) because, being the Paramātman of the nature of Bliss, Yogīs who contemplate on Him dip themselves in that lake of Bliss and attain great joy.
Mahāgartaḥ – One whose Māyā is as difficult to cross as a great pit.
Mahābhūtaḥ – One who is undivided by the three periods of time – past, present and future.
Mahānidhiḥ – One in whom all the great elements have their support – the Mahān (great) and most precious (Nidhi).
कुमुदः कुन्दरः कुन्दः पर्जन्यः पावनोऽनिलः ।
अमृताशोऽमृतवपुः सर्वज्ञः सर्वतोमुखः ॥८७॥
kumudaḥ kundaraḥ kundaḥ parjanyaḥ pāvano 'nilaḥ,
amṛtāśo 'mṛtavapuḥ sarvajñaḥ sarvatomukhaḥ. (87)
Kumudaḥ – 'Ku' means earth; one who gives joy (muda) to the earth by freeing it of its burdens.
Kundaraḥ – One who offers blessings as pure as the Kunda (jasmine) flower.
Kundaḥ – One whose limbs are as beautiful as the Kunda (jasmine).
Parjanyaḥ – One who, like a cloud, extinguishes the three Tāpas (miseries) – from psychological, material and spiritual causes – and rains down all desired things.
Pāvanaḥ – One by merely remembering whom a devotee attains purity.
Anilaḥ – One who is without any inducement or conditioning; also 'one who never sleeps', ever awake.
Amṛtāśaḥ – One who consumes Amṛta (immortal bliss), which is His own nature.
Amṛtavapuḥ – One whose form is deathless and undecaying.
Sarvajñaḥ – One who is all-knowing.
Sarvatomukhaḥ – One who has faces everywhere.
सुलभः सुव्रतः सिद्धः शत्रुजिच्छत्रुतापनः ।
न्यग्रोधोऽदुम्बरोऽश्वत्थश्चाणूरान्ध्रनिषूदनः ॥८८॥
sulabhaḥ suvrataḥ siddhaḥ śatrujic chatrutāpanaḥ,
nyagrodho 'dumbaro 'śvatthaś cāṇūrāndhraniṣūdanaḥ. (88)
Sulabhaḥ – One who is attained easily by offering trifles – leaf, flower and fruit – with devotion.
Suvrataḥ – One who enjoys pure offerings; or one who is a mere witness (non-enjoyer).
Siddhaḥ – One whose purposes are always accomplished – omnipotent and unobstructed by any other will.
Śatrujit – Conqueror of all forces of evil.
Śatrutāpanaḥ – One who destroys the enemies of the Devas.
Nyagrodhaḥ – That which remains above all and yet grows downward – the source of all that is manifest.
Udumbaraḥ – One who, as the Supreme cause, is 'above the sky' – superior to all.
Aśvatthaḥ – That which does not last even until the next day – the ever-changing universe as His form.
Cāṇūrāndhra-niṣūdanaḥ – One who destroyed the valiant fighter Cāṇūra belonging to the Āndhra race.
सहस्रार्चिः सप्तजिह्वः सप्तैधाः सप्तवाहनः ।
अमूर्तिरनघोऽचिन्त्यो भयकृद्भयनाशनः ॥८९॥
sahasrārciḥ saptajihvaḥ saptaidhāḥ saptavāhanaḥ,
amūrtir anagho 'cintyo bhayakṛd bhayanāśanaḥ. (89)
Sahasrārciḥ – One with innumerable rays (Arcis).
Sapta-jihvaḥ – The Lord in His manifestation as Fire is conceived as having seven tongues of flame.
Saptaidhāḥ – The Lord who is of the nature of fire has seven Edhās (forms of brilliance).
Saptavāhanaḥ – The Lord in the form of Sūrya (sun) has seven horses as His vehicles.
Amūrtiḥ – One who is without a gross physical form, formless pure consciousness.
Anaghaḥ – One who is without sin or sorrow.
Acintyaḥ – One who is not determinable by any criteria of knowledge, being Himself the witnessing Self certifying all knowledge.
Bhayakṛt – One who generates fear in those who walk the evil path; or one who cuts at the root of all fear.
Bhaya-nāśanaḥ – One who destroys the fears of the virtuous.
अणुर्बृहत्कृशः स्थूलो गुणभृन्निर्गुणो महान् ।
अधृतः स्वधृतः स्वास्यः प्राग्वंशो वंशवर्धनः ॥९०॥
aṇur bṛhat kṛśaḥ sthūlo guṇabhṛn nirguṇo mahān,
adhṛtaḥ svadhṛtaḥ svāsyaḥ prāgvaṃśo vaṃśavardhanaḥ. (90)
Aṇuḥ – One who is extremely subtle.
Bṛhat – The huge and mighty.
Kṛśaḥ – One who is non-material; beyond all Prakṛtic substance.
Sthūlaḥ – Being the inner pervader of all, He is described as Sthūla (huge) in a figurative sense.
Guṇa-bhṛt – The support of the Guṇas – Sattva, Rajas and Tamas – through which creation, sustentation and dissolution are performed.
Nirguṇaḥ – One who is without the Guṇas of Prakṛti.
Mahān – The great.
Adhṛtaḥ – One who, being the support of all supporting agencies like Pṛthvī (Earth), is Himself not supported by anything external.
Svadhṛtaḥ – One supported only by Himself.
Svāsyaḥ – One whose face is beautiful and slightly red, like the inside of a lotus flower.
Prāgvaṃśaḥ – The Lord's 'lineage' (the world-system) is not preceded by any prior cause – He alone is the ultimate.
Vaṃśavardhanaḥ – One who augments or dissolves the world-system, which is His offspring.
भारभृत् कथितो योगी योगीशः सर्वकामदः ।
आश्रमः श्रमणः क्षामः सुपर्णो वायुवाहनः ॥९१॥
bhārabhṛt kathito yogī yogīśaḥ sarvakāmadaḥ,
āśramaḥ śramaṇaḥ kṣāmaḥ suparṇo vāyuvāhanaḥ. (91)
Bhārabhṛt – One who bears the weight of the earth by assuming the form of Ananta (Ādiśeṣa).
Kathitaḥ – One who is spoken of as the highest by the Veda, of whom all Vedas speak.
Yogī – Yoga here means knowledge; He who is attained by that is Yogī. Or one ever established in His own Self, the Paramātmā.
Yogīśaḥ – He who is never shaken from Yoga or knowledge of the Self, unlike ordinary Yogīs who slip away on account of obstacles.
Sarva-kāmadaḥ – One who bestows all desired fruits.
Āśramaḥ – One who is the bestower of rest on all who are wandering in the forest of Saṃsāra.
Śramaṇaḥ – One who brings tribulations to those who live without using their discriminative wisdom.
Kṣāmaḥ – He who brings about the decline and dissolution of all beings.
Suparṇaḥ – The Lord manifested as the tree of Saṃsāra has excellent leaves (Parṇa) in the form of Vedic passages (Chandas).
Vāyuvāhanaḥ – He for fear of whom Vāyu (Air) carries all beings.
धनुर्धरो धनुर्वेदो दण्डो दमयिता दमः ।
अपराजितः सर्वसहो नियन्ताऽनियमोऽयमः ॥९२॥
dhanurdharo dhanurvedo daṇḍo damayitā damaḥ,
aparājitaḥ sarvasaho niyantā 'niyamo 'yamaḥ. (92)
Dhanurdharaḥ – He who, as Rāma, wielded the great bow.
Dhanurvedaḥ – He who, as Rāma the son of Daśaratha, was master of the science of archery (Dhanurveda).
Daṇḍaḥ – He who is discipline personified among all disciplinarians.
Damayitā – He who inflicts punishment on the wicked as Yama and as king.
Damaḥ – He who is self-discipline in men as a result of righteous enforcement.
Aparājitaḥ – One who is never defeated by any enemy.
Sarvasahaḥ – One who is expert in all Karmas (works) and bears all with equanimity.
Niyantā – One who appoints every person to their respective duties.
Aniyamaḥ – One upon whom no external law is enforced, being Himself the controller of everything.
Ayamaḥ – One upon whom Yama has no control; one who has no death.
सत्त्ववान् सात्त्विकः सत्यः सत्यधर्मपरायणः ।
अभिप्रायः प्रियार्होऽर्हः प्रियकृत् प्रीतिवर्धनः ॥९३॥
sattvavān sāttvikaḥ satyaḥ satyadharmaparāyaṇaḥ,
abhiprāyaḥ priyārho 'rhaḥ priyakṛt prītivardhanāḥ. (93)
Sattvavān – One who has the strengthening qualities: heroism, prowess, fortitude, etc.
Sāttvikaḥ – One essentially established in the Sattva Guṇa.
Satyaḥ – One who is truly present in and established in good people.
Satya-dharma-parāyaṇaḥ – One who is the very foundation of truthfulness and righteousness in all their aspects.
Abhiprāyaḥ – The One sought after by those who seek the ultimate values of life (Puruṣārtha).
Priyārhaḥ – The being to whom whatever is dearest to oneself is fittingly offered.
Arhaḥ – One who deserves to be worshipped with all the ingredients and rites of worship.
Priyakṛt – One who not only merits love but who actively does what is good and dear to those who worship Him.
Prītivardhanāḥ – One who enhances the joy and devotion of His devotees.
विहायसगतिर्ज्योतिः सुरुचिर्हुतभुग्विभुः ।
रविर्विरोचनः सूर्यः सविता रविलोचनः ॥९४॥
vihāyasagatir jyotiḥ surucir hutabhug vibhuḥ,
ravir virocanaḥ sūryaḥ savitā ravilocanaḥ. (94)
Vihāyasa-gatiḥ – One who moves in (or is the support of) Viṣṇupada – the highest region.
Jyotiḥ – One who is the light of self-luminous consciousness that reveals itself and all other things.
Suruciḥ – The Lord whose Ruci (brilliance or will) is of an eminently attractive nature.
Hutabhuk – One who receives whatever is offered to any deity in all sacrifices.
Vibhuḥ – One who dwells everywhere; or one who is the master of all the three worlds.
Raviḥ – One who absorbs all Rasas (fluids) in the form of the Sun.
Virocanaḥ – One who shines in many ways.
Sūryaḥ – One who generates Śrī (brilliance) in Sūrya. Or Agni (Fire) is what is called Sūrya.
Savitā – One who brings forth (Prasava) all the worlds.
Ravi-locanaḥ – One having the sun as His eye.
अनन्तो हुतभुग्भोक्ता सुखदो नैकजोऽग्रजः ।
अनिर्विण्णः सदामर्षी लोकाधिष्ठानमद्भुतः ॥९५॥
ananto hutabhug bhoktā sukhado naikajo 'grajaḥ,
anirviṇṇaḥ sadāmarṣī lokādhiṣṭhānam adbhutaḥ. (95)
Anantaḥ – One who is eternal, all-pervading and indeterminable by space and time.
Hutabhuk – One who consumes what is offered in fire sacrifices.
Bhoktā – One to whom the insentient Prakṛti is the object of experience.
Sukhadaḥ – One who bestows liberation (Mokṣa) on devotees.
Naikajaḥ – One who takes birth again and again for the preservation of Dharma.
Agrajaḥ – One who was born before everything else – Hiraṇyagarbha.
Anirviṇṇaḥ – One who is free from all sorrow, having secured all His desires without any obstruction.
Sadāmarṣī – One who is always patient and forbearing towards good men.
Lokādhiṣṭhānam – Brahman who, though without any support for Himself, supports all the three worlds.
Adbhutaḥ – The wonderful, marvellous Being.
सनात्सनातनतमः कपिलः कपिरव्ययः ।
स्वस्तिदः स्वस्तिकृत्स्वस्ति स्वस्तिभुक्स्वस्तिदक्षिणः ॥९६॥
sanāt sanātanatamaḥ kapilaḥ kapir avyayaḥ,
svastidaḥ svastikṛt svasti svastibhuk svastidakṣiṇaḥ. (96)
Sanāt – The word Sanāt indicates a great length of time; time itself is a manifestation of the Supreme Being.
Sanātanatamaḥ – Being the cause of all, He is more ancient than Brahmā and other beings who are generally considered eternal.
Kapilaḥ – A subterranean fire in the ocean, Kapila, light red in colour; also the name of the sage who embodied divine knowledge.
Kapiḥ – 'Ka' means water; one who drinks or absorbs all water by means of His form as the Sun.
Avyayaḥ – One in whom all the worlds dissolve at Pralaya without loss.
Svastidaḥ – One who gives what is auspicious to devotees.
Svastikṛt – One who works for the bestowal of what is good.
Svasti – One whose auspicious form is characterised by supreme Bliss.
Svastibhuk – One who enjoys the Svasti (auspiciousness) above, or who preserves the well-being of devotees.
Svastidakṣiṇaḥ – One who augments auspiciousness (Svasti) through His grace.
अरौद्रः कुण्डली चक्री विक्रम्यूर्जितशासनः ।
शब्दातिगः शब्दसहः शिशिरः शर्वरीकरः ॥९७॥
araudraḥ kuṇḍalī cakrī vikramī ūrjitaśāsanaḥ,
śabdātigaḥ śabdasahaḥ śiśiraḥ śarvarīkaraḥ. (97)
Araudraḥ – Action, attachment and anger are Raudra. The Lord, having all desires fulfilled, is free from attachment and anger – hence Araudra.
Kuṇḍalī – One who has taken the form of Ādiśeṣa – the coiled one.
Cakrī – One who wields the discus Sudarśana – representing Manas – for the protection of all the worlds.
Vikramī – Vikrama means taking a stride, as also great courage and valour.
Ūrjita-śāsanaḥ – One whose dictates in the form of Śrutis and Smṛtis are of an extremely sublime nature.
Śabdātigaḥ – One who cannot be denoted by any sound because He has none of the characteristics that could be grasped by words.
Śabdasahaḥ – One who is the ultimate purport of all the Vedas.
Śiśiraḥ – One who is a cooling shelter to those burning in the three types of worldly fires: sufferings from material, psychological and spiritual causes.
Śarvarīkaraḥ – For those in bondage the Ātman appears like night (Śarvarī); for the enlightened, Saṃsāra is like night. The Lord generates this 'night' of transcendence for both.
अक्रूरः पेशलो दक्षो दक्षिणः क्षमिणांवरः ।
विद्वत्तमो वीतभयः पुण्यश्रवणकीर्तनः ॥९८॥
akrūraḥ peśalo dakṣo dakṣiṇaḥ kṣamiṇāṃ varaḥ,
vidvattamo vītabhayaḥ puṇyaśravaṇakīrtanaḥ. (98)
Akrūraḥ – One who is without cruelty.
Peśalaḥ – One who is handsome and graceful in action, mind, word and body.
Dakṣaḥ – One who is full-grown, strong and does everything effectively; a highly capable one.
Dakṣiṇaḥ – One who is expert and adroit; same purport as the above name from another angle.
Kṣamiṇāṃ varaḥ – The greatest among the patient ones, more patient than all Yogīs noted for forbearance.
Vidvattamaḥ – He who possesses unsurpassable and all-inclusive knowledge of everything.
Vītabhayaḥ – One who, being eternally free and Lord of all, is free from any fear of transmigratory life.
Puṇya-śravaṇa-kīrtanaḥ – One to hear about and to sing of whom is deeply meritorious.
उत्तारणो दुष्कृतिहा पुण्यो दुःस्वप्ननाशनः ।
वीरहा रक्षणः सन्तो जीवनः पर्यवस्थितः ॥९९॥
uttāraṇo duṣkṛtihā puṇyo duḥsvapnanāśanaḥ,
vīrahā rakṣaṇaḥ santo jīvanaḥ paryavasthitaḥ. (99)
Uttāraṇaḥ – One who takes beings across to the other shore of the ocean of Saṃsāra.
Duṣkṛtihā – One who effaces the evil effects of evil actions; or one who destroys those who perform evil.
Puṇyaḥ – One who bestows holiness on those who remember and adore Him.
Duḥsvapna-nāśanaḥ – When adored and meditated upon, He saves one from dreams foreboding danger.
Vīrahā – One who frees Jīvas from bondage, saving them from transmigratory paths by bestowing liberation.
Rakṣaṇaḥ – One who, endowed with Sattvaguṇa, protects all the three worlds.
Santaḥ – Those who adopt the virtuous path are called Santas (good people); the Lord is their very soul.
Jīvanaḥ – One who sustains the lives of all beings as Prāṇa.
Paryavasthitaḥ – One who remains pervading everywhere in this universe.
अनन्तरूपोऽनन्तश्रीर्जितमन्युर्भयापहः ।
चतुरश्रो गभीरात्मा विदिशो व्यादिशो दिशः ॥१००॥
anantarūpo 'nantaśrīr jitamanyur bhayāpahaḥ,
caturaśro gabhīrātmā vidiśo vyādiśo diśaḥ. (100)
Ananta-rūpaḥ – One who has innumerable forms, as He dwells in this all-comprehending universe.
Anantaśrīḥ – One whose Śrī (glory) is infinite.
Jita-manyuḥ – One who has overcome anger.
Bhayāpahaḥ – One who destroys the fears of beings arising from Saṃsāra.
Caturaśraḥ – One who is just, bestowing on Jīvas the fruits of their Karma.
Gabhīrātmā – One whose nature is unfathomable.
Vidiśaḥ – One who distributes various fruits of actions to persons differing in form according to their competency.
Vyādiśaḥ – One who gives to Indra and other deities directions according to their varied functions.
Diśaḥ – One who in the form of the Vedas bestows the fruits of ritualistic actions on different beings.
अनादिर्भूर्भुवो लक्ष्मीः सुवीरो रुचिराङ्गदः ।
जननो जनजन्मादिर्भीमो भीमपराक्रमः ॥१०१॥
anādir bhūrbhuvo lakṣmīḥ suvīro rucirāṅgadaḥ,
janano janajanmādir bhīmo bhīmaparākramaḥ. (101)
Anādiḥ – One who has no beginning, being the ultimate cause of all.
Bhūrbhuvaḥ – 'Bhu' means support; one who is the support of even the earth, which itself supports all things.
Lakṣmīḥ – He who is the bestower of all that is auspicious to the earth, besides being its supporter.
Suvīraḥ – One who has many brilliant ways of manifestation.
Rucirāṅgadaḥ – One who wears very attractive armlets.
Jananaḥ – One who gives birth to all living beings.
Jana-janmādiḥ – One who is the root cause of the origin of Jīvas that come to have embodiment.
Bhīmaḥ – One who is the cause of awe and fear.
Bhīma-parākramaḥ – One whose power and courage in His incarnations was a cause of terror for the Asuras.
आधारनिलयोऽधाता पुष्पहासः प्रजागरः ।
ऊर्ध्वगः सत्पथाचारः प्राणदः प्रणवः पणः ॥१०२॥
ādhāranilayo 'dhātā puṣpahāsaḥ prajāgaraḥ,
ūrdhvagaḥ satpathācāraḥ prāṇadaḥ praṇavaḥ paṇaḥ. (102)
Ādhāra-nilayaḥ – One who is the support of all basic supporting factors – the five elements (Ether, Air, Fire, Water and Earth).
Adhātā – One who is His own support and therefore requires no external support.
Puṣpahāsaḥ – One whose manifestation as the universe resembles the blooming (Hāsa) of buds into flowers.
Prajāgaraḥ – One who is particularly awake – being eternal Awareness itself.
Ūrdhvagaḥ – One who is above everything.
Satpathācāraḥ – One who always follows the conduct of the good.
Prāṇadaḥ – One who restores life to the dead, as in the case of Parīkṣit.
Praṇavaḥ – Praṇava (Oṃ) – the manifesting sound-symbol of Brahman. As He is inseparably related to Praṇava, He is called Praṇava.
Paṇaḥ – From the root meaning transaction – one who bestows the fruits of Karma on all according to their actions.
प्रमाणं प्राणनिलयः प्राणभृत्प्राणजीवनः ।
तत्त्वं तत्त्वविदेकात्मा जन्ममृत्युजरातिगः ॥१०३॥
pramāṇaṃ prāṇanilayaḥ prāṇabhṛt prāṇajīvanaḥ,
tattvaṃ tattvavid ekātmā janmamṛtyujarātigaḥ. (103)
Pramāṇaṃ – One who is self-certifying, being Pure Consciousness.
Prāṇanilayaḥ – The home and dissolving ground of the Prāṇas.
Prāṇa-bhṛt – One who strengthens the Prāṇas as food (Anna) nourishes.
Prāṇa-jīvanaḥ – He who keeps human beings alive through the Vāyus known as Prāṇa, Apāna, etc.
Tattvaṃ – Means Brahman – like words such as Amṛta, Satya, Paramārtha.
Tattvavid – One who knows His own true nature.
Ekātmā – One who is the sole being and the spirit (Ātmā) in all.
Janma-mṛtyu-jarātigaḥ – One who subsists without being subject to the six kinds of transformation – birth, existence, growth, transformation, decay and death.
भूर्भुवःस्वस्तरुस्तारः सविता प्रपितामहः ।
यज्ञो यज्ञपतिर्यज्वा यज्ञाङ्गो यज्ञवाहनः ॥१०४॥
bhūrbhuvaḥ svastaruḥ tāraḥ savitā prapitāmahaḥ,
yajño yajñapatir yajvā yajñāṅgo yajñavāhanaḥ. (104)
Bhūr-bhuvaḥ-svastaruḥ – The three Vyāhṛtis – Bhūḥ, Bhuvaḥ, Svaḥ – are the essence of the Veda; He is the tree (Taru) from which they spring.
Tāraḥ – One who helps Jīvas cross over the ocean of Saṃsāra.
Savitā – He who generates all the worlds.
Prapitāmahaḥ – One who is the father of Brahmā and therefore the grandfather of all.
Yajñaḥ – One who is of the form of Yajña.
Yajñapatiḥ – The protector and master of all Yajñas.
Yajvā – One who manifests as the performer of a Yajña.
Yajñāṅgaḥ – All the parts of His body as the Cosmic Boar are identified with the parts of a Yajña.
Yajña-vāhanaḥ – One who supports the Yajñas which yield various fruits.
यज्ञभृद् यज्ञकृद् यज्ञी यज्ञभुग् यज्ञसाधनः ।
यज्ञान्तकृद् यज्ञगुह्यमन्नमन्नाद एव च ॥१०५॥
yajñabhṛd yajñakṛd yajñī yajñabhug yajñasādhanaḥ,
yajñāntakṛd yajñaguhyam annam annāda eva ca. (105)
Yajñabhṛd – One who is the protector and supporter of all Yajñas.
Yajñakṛd – One who performs Yajña at the beginning and end of the world.
Yajñī – One who is the Principal, the Lord of Yajña.
Yajñabhug – One who is the enjoyer and protector of Yajña.
Yajña-sādhanaḥ – One to whom the Yajña is the approach – He is both the means and the end.
Yajñāntakṛd – One who is the end and the fruit of Yajña.
Yajñaguhyam – The Jñāna Yajña (sacrifice of knowledge), which is the esoteric (Guhyam) essence of all Yajñas.
Annam – That which is eaten by living beings; or He who pervades all beings as their sustenance.
Annādaḥ – One who is the eater of the whole world as food. Eva (indeed) is added to show that He is also Anna – the food itself.
आत्मयोनिः स्वयञ्जातो वैखानः सामगायनः ।
देवकीनन्दनः स्रष्टा क्षितीशः पापनाशनः ॥१०६॥
ātmayoniḥ svayaṃjāto vaikhānaḥ sāmagāyanaḥ,
devakīnandanaḥ sraṣṭā kṣitīśaḥ pāpanāśanaḥ. (106)
Ātmayoniḥ – One who is the source of all – there is no material cause other than Himself for the universe.
Svayaṃ-jātaḥ – He is also the instrumental cause – self-born, brought into existence by none other.
Vaikhānaḥ – One who excavated the earth in a unique form (as Varāha, the Cosmic Boar).
Sāmagāyanaḥ – One who recites and is sung through the Sāma chants.
Devakī-nandanaḥ – The son of Devakī in the incarnation as Kṛṣṇa.
Sraṣṭā – The creator of all the worlds.
Kṣitīśaḥ – Master of the world – here denoting Rāma.
Pāpanāśanaḥ – He who destroys the sins of those who adore, meditate upon, remember and sing hymns of praise to Him.
शङ्खभृन्नन्दकी चक्री शार्ङ्गधन्वा गदाधरः ।
रथाङ्गपाणिरक्षोभ्यः सर्वप्रहरणायुधः ॥१०७॥
सर्वप्रहरणायुध ॐ नम इति ।
śaṅkhabhṛn nandakī cakrī śārṅgadhanvā gadādharaḥ,
rathāṅgapāṇir akṣobhyaḥ sarvapraharaṇāyudhaḥ. (107)
sarvapraharaṇāyudha oṃ nama iti.
Śaṅkhabhṛt – One who bears the conch Pāñcajanya, which stands for Tāmasāhaṃkāra, from which the five elements were born.
Nandakī – One who holds the sword Nandaka, which stands for Vidyā (spiritual illumination).
Cakrī – One who bears the discus Sudarśana, which stands for Rājasāhaṃkāra, from which the Indriyas (senses) have come.
Śārṅga-dhanvā – One who wields the Śārṅga bow.
Gadādharaḥ – One who holds the mace Kaumodakī, which stands for the category of Buddhi (intellect).
Rathāṅga-pāṇiḥ – One in whose hand is a wheel (Cakra).
Akṣobhyaḥ – One who cannot be upset by anything, controlling all the above-mentioned weapons.
Sarva-praharaṇā-yudhaḥ – All things that can be used for contacting or striking are His weapons; His arsenal is unlimited.
वनमाली गदी शार्ङ्गी शङ्खी चक्री च नन्दकी ।
श्रीमान् नारायणो विष्णुर्वासुदेवोऽभिरक्षतु ॥१०८॥
श्री वासुदेवोऽभिरक्षतु ॐ नम इति ।
vanamālī gadī śārṅgī śaṅkhī cakrī ca nandakī,
śrīmān nārāyaṇo viṣṇur vāsudevo 'bhirakṣatu. (108)
śrī vāsudevo 'bhirakṣatu oṃ nama iti.
May the glorious Lord Nārāyaṇa protect us – He who wears the forest garland (Vanamālā), who bears the mace (Gadā), the bow Śārṅga, the conch (Śaṅkha), the discus (Cakra) and the sword Nandaka, and who is known as Viṣṇu and Vāsudeva.
`;

function classify(line) {
  if (/[ऀ-ॿ]/.test(line)) return 'deva';
  if (line.includes('–')) return 'name'; // en dash
  return 'iast';
}

const lines = RAW.split('\n').map(l => l.trim()).filter(Boolean);

const stanzas = [];
let current = null;
for (const line of lines) {
  const type = classify(line);
  if (type === 'deva') {
    if (!current) {
      current = { deva: [], iast: [], names: [] };
    } else if (current.iast.length > 0 || current.names.length > 0) {
      stanzas.push(current);
      current = { deva: [], iast: [], names: [] };
    }
    current.deva.push(line);
  } else if (type === 'iast') {
    if (!current) throw new Error(`IAST line before any devanagari line: "${line}"`);
    current.iast.push(line);
  } else {
    if (!current) throw new Error(`Name line before any devanagari line: "${line}"`);
    current.names.push(line);
  }
}
if (current) stanzas.push(current);

console.log(`Parsed ${stanzas.length} stanzas (expect 108).`);
if (stanzas.length !== 108) {
  console.error('Stanza count mismatch -- stopping for review.');
  process.exit(1);
}

// Cross-check each stanza's own embedded "(N)" against its position.
stanzas.forEach((st, i) => {
  const markedLine = st.iast.find(l => /\(\d+\)/.test(l));
  if (!markedLine) throw new Error(`Stanza ${i + 1}: no "(N)" marker found in any IAST line: ${JSON.stringify(st.iast)}`);
  const m = markedLine.match(/\((\d+)\)/);
  if (parseInt(m[1], 10) !== i + 1) {
    throw new Error(`Stanza ${i + 1}: embedded marker says (${m[1]}) -- sequence mismatch.`);
  }
});
console.log('Sequence check passed: all 108 stanzas have matching embedded (N) markers.\n');

function stripDevaMarker(line) {
  return line.replace(/॥\s*[०-९]+\s*॥\s*$/, '').trim();
}
function stripIastMarker(line) {
  return line.replace(/\s*\(\d+\)\s*$/, '').trim();
}
function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

let totalNameCount = 0;
const rows = stanzas.map((st, i) => {
  const stanzaNumber = i + 1;
  const devaLines = st.deva; // keep verse-numeral marker, matches bhagavad-gita.json's "sanskrit" field precedent
  const teluguLines = st.deva.map(l => Sanscript.t(stripDevaMarker(l), 'devanagari', 'telugu'));
  const tamilLines = st.deva.map(l => devanagariToTamilSuperscript(stripDevaMarker(l)));
  const iastLines = st.iast.map(l => addMacrons(stripIastMarker(l)));

  const nameCount = st.names.length;
  totalNameCount += stanzaNumber <= 107 ? nameCount : 0; // 108 restates existing names, not counted toward 1000
  const rangeLabel = stanzaNumber <= 107
    ? `Ślōka ${stanzaNumber} (Nāmas ${totalNameCount - nameCount + 1}–${totalNameCount})`
    : `Ślōka ${stanzaNumber} (closing benediction)`;

  return {
    stanza_number: stanzaNumber,
    stanza_label: rangeLabel,
    script_devanagari: devaLines.join('|'),
    script_telugu: teluguLines.join('|'),
    script_tamil: tamilLines.join('|'),
    roman_iast: iastLines.join('|'),
    meaning_en: st.names.join(' '),
  };
});

console.log(`Total names counted across slokas 1-107: ${totalNameCount} (traditional count is exactly 1000).\n`);

const sampleIdx = [0, 53, 106, 107];
console.log(`Sample (stanzas ${sampleIdx.map(i => i + 1).join(', ')}):\n`);
sampleIdx.forEach(i => console.log(rows[i], '\n'));

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
