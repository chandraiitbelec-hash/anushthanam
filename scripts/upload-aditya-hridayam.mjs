/**
 * Uploads Aditya Hridayam (31 verses, Valmiki Ramayana) to shloka_stanzas.
 *
 * Source: user-supplied text giving all four scripts (IAST, Telugu,
 * Devanagari/Hindi, Tamil) directly, verbatim -- same situation as
 * lalitha-sahasranamam, so no transliteration library is used here either;
 * each script's own text is used as given.
 *
 * Structure: each script's text opens with a 2-line, unnumbered Dhyana
 * Slokam (invocatory verse, not part of the "31 verses") followed by the
 * 31 numbered verses. The shlokas-tab metadata already declares
 * stanza_count: '31' for this slug, confirming the dhyana verse is
 * intentionally excluded from the count -- this script uploads only the
 * 31 numbered verses, matching that.
 *
 * Verse 31 is in an extended meter (4 print-lines instead of the usual 2),
 * unlike verses 1-30. The parser below is line-boundary-driven rather than
 * assuming a fixed 2-lines-per-verse shape, so it handles this without a
 * special case: it accumulates lines into the current pada until a line
 * ends in a single separator (pada boundary) or a numbered double
 * separator (pada + verse boundary).
 *
 * Known source anomalies -- NOT corrected here, flagged only (per standing
 * rule against silently altering wording):
 *   - IAST verse 2 has "abrveed" where Telugu/Tamil have the equivalent of
 *     "abravīd" at the same position -- looks like a letter-transposition
 *     typo rather than a deliberate reading.
 *   - Hindi/Devanagari verse 2 has "अगरत्यो" where the same document
 *     spells the sage's name correctly as "अगस्त्यो" at verse 27 --
 *     internally inconsistent, likely a typo rather than a recension
 *     variant. The rest of that Hindi line ("भगवांस्तदा" instead of
 *     "भगवान् ऋषिः") may be a genuine recension difference -- Aditya
 *     Hridayam has more attested textual variation across recensions than
 *     most stotras -- so only the name spelling is flagged, not that
 *     substitution.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-aditya-hridayam.mjs          (dry run)
 *      node scripts/upload-aditya-hridayam.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'aditya-hridayam';

const IAST_RAW = `
namas-savitre jagad-eka-cakṣuṣe jagat-prasūti-sthiti-nāśa-hetave |
trayī-mayāya triguṇātma-dhāriṇe viriñci-nārāyaṇa-śaṅkarātmane ||
tato yuddha-pariśrāntaṁ samare cintayā sthitam |
rāvaṇaṁ cāgrato dṛṣṭvā yuddhāya samupasthitam || 1 ||
daivataiś-ca samāgamya draṣṭum-abhyāgato raṇam |
upāgamyābrveed-rāmaṁ agastyo bhagavān ṛṣiḥ || 2 ||
rāma rāma mahābāho śṛṇu guhyaṁ sanātanam |
yena sarvān-arīn vatsa samare vijayiṣyasi || 3 ||
āditya-hṛdayaṁ puṇyaṁ sarva-śatru-vināśanam |
jayāvahaṁ japen-nityaṁ akṣayyaṁ paramaṁ śivam || 4 ||
sarva-maṅgala-māṅgalyaṁ sarva-pāpa-praṇāśanam |
cintā-śoka-praśamanaṁ āyur-vardhanam-uttamam || 5 ||
raśmīmantaṁ samudyantaṁ devāsura-namaskṛtam |
pūjayasva vivasvantaṁ bhāskaraṁ bhuvaneśvaram || 6 ||
sarva-devātmakō hyeṣa tejasvī raśmi-bhāvanaḥ |
eṣa devāsurāṉ-lokāṉ pāti gabhasthibhiḥ || 7 ||
eṣa brahmā ca viṣṇuś-ca śivaḥ skandaḥ prajāpatiḥ |
mahendro dhanadaḥ kālo yamaḥ somō hyapāṁ-patiḥ || 8 ||
pitarō vasavaḥ sādhyā aśvinau marutō manuḥ |
vāyur-vahniḥ prajā-prāṇaḥ ṛtu-kartā prabhākaraḥ || 9 ||
ādityaḥ savitā sūryaḥ khagaḥ pūṣā gabhastimān |
suvarṇa-sadṛśō bhānur-hiraṇya-retā divākaraḥ || 10 ||
haridaśvaḥ sahasrārciḥ sapta-saptir-marīcimān |
timirōmthanaḥ śambhas-tvaṣṭā mārtāṇḍakōṁ'śumān || 11 ||
hiraṇya-garbhaḥ śiśiras-tapanō bhāskarō raviḥ |
agni-garbhō'diteḥ putraḥ śaṅkhaḥ śiśira-nāśanaḥ || 12 ||
vyoma-nāthas-tamōbhedī ṛg-yajuḥ-sāma-pāragaḥ |
ghana-vṛṣṭir-apāṁ-mitrō vindhya-vīthī-plavaṅgamaḥ || 13 ||
ātapī maṇḍalī mṛtyuḥ piṅgalaḥ sarva-tāpanaḥ |
kavir-viśvō mahā-tejaḥ raktaḥ sarva-bhavodbhavaḥ || 14 ||
nakṣatra-graha-tārāṇām-adhipō viśva-bhāvanaḥ |
tejasām-api tejasvī dvādaśātman-namo'stu te || 15 ||
namaḥ pūrvāya giraye paścimāyādraye namaḥ |
jyotir-gaṇānāṁ pataye dinādhipataye namaḥ || 16 ||
jayāya jaya-bhadrāya haryāśvāya namo namaḥ |
namo namaḥ sahasrāṁśo ādityāya namo namaḥ || 17 ||
nama ugrāya vīrāya sāraṅgāya namo namaḥ |
namaḥ padma-prabodhāya mārtāṇḍāya namo namaḥ || 18 ||
brahmeśānācyuteśāya sūryāyāditya-varcase |
bhāsvate sarva-bhakṣāya raudrāya vapuṣe namaḥ || 19 ||
tamoghnāya himaghnāya śatrughnāyāmītātmane |
kṛtaghnaghnāya devāya jyotiṣāṁ pataye namaḥ || 20 ||
taptacāmīkarābhāya vahnaye viśvakarmaṇe |
namas-tamobhinighnāya rucaye lokasākṣiṇe || 21 ||
nāśayaty-eṣa vai bhūtaṁ tadeva sṛjati prabhuḥ |
pāyaty-eṣa tapaty-eṣa varṣaty-eṣa gabhasthibhiḥ || 22 ||
eṣa supteṣu jāgarti bhūteṣu pariniṣṭhitaḥ |
eṣa evāgnihotraṁ ca phalaṁ caivāgnihotriṇām || 23 ||
vedāś-ca kratavaś-caiva kratūnāṁ phaladeva ca |
yāni kṛtyāni lokeṣu sarva eṣa raviḥ prabhuḥ || 24 ||
enam-āpat-su kṛcchreṣu kāntāreṣu bhayeṣu ca |
kīrtayan puruṣaḥ kaścin-nāvasīdati rāghava || 25 ||
pūjayasvainam-ekāgro devadevaṁ jagatpatim |
etat-triguṇitaṁ japtvā yuddheṣu vijayiṣyasi || 26 ||
asmin kṣaṇe mahābāho rāvaṇaṁ tvaṁ vadhiṣyasi |
evam-uktva tadāgastyo jagāma ca yathāgatam || 27 ||
etac-chrutvā mahātejā naṣṭa-śoko'bhavat-tadā |
dhārayāmāsa suprīto rāghavaḥ prayatātmavān || 28 ||
ādityaṁ prekṣya japtvā tu paraṁ harṣam-avāptavān |
trir-ācamya śucir-bhūtvā dhanur-ādāya vīryavān || 29 ||
rāvaṇaṁ prekṣya hṛṣṭātmā yuddhāya samupāgamat |
sarva-yatnena mahatā vadhe tasya dhṛto'bhavat || 30 ||
atha ravir-avadhan-nirīkṣya rāmaṁ
muditamanāḥ paramaṁ prahṛṣyamāṇaḥ |
niśicarapati-saṅkṣayaṁ viditvā
suragaṇa-madhyagato vacas-tvareti || 31 ||
`;

const TELUGU_RAW = `
నమస్సవిత్రే జగదేక చక్షుసే జగత్ప్రసూతి స్థితి నాశహేతవే |
త్రయీమయాయ త్రిగుణాత్మ ధారిణే విరించి నారాయణ శంకరాత్మనే ||
తతో యుద్ధ పరిశ్రాంతం సమరే చింతయాస్థితమ్ |
రావణం చాగ్రతో దృష్ట్వా యుద్ధాయ సముపస్థితమ్ || 1 ||
దైవతైశ్చ సమాగమ్య ద్రష్టుమభ్యాగతో రణమ్ |
ఉపాగమ్యాబ్రవీద్రామం అగస్త్యో భగవాన్ ఋషిః || 2 ||
రామ రామ మహాబాహో శృణు గుహ్యం సనాతనమ్ |
యేన సర్వానరీన్ వత్స సమరే విజయిష్యసి || 3 ||
ఆదిత్యహృదయం పుణ్యం సర్వశత్రు-వినాశనమ్ |
జయావహం జపేన్నిత్యం అక్షయ్యం పరమం శివమ్ || 4 ||
సర్వమంగళ మాంగళ్యం సర్వపాప ప్రణాశనమ్ |
చింతాశోక ప్రశమనం ఆయుర్వర్ధనముత్తమమ్ || 5 ||
రశ్మిమంతం సముద్యంతం దేవాసుర నమస్కృతమ్ |
పూజయస్వ వివస్వంతం భాస్కరం భువనేశ్వరమ్ || 6 ||
సర్వదేవాత్మకో హ్యేష తేజస్వీ రశ్మిభావనః |
ఏష దేవాసురగాన్ లోకాన్ పాతి గభస్తిభిః || 7 ||
ఏష బ్రహ్మా చ విష్ణుశ్చ శివః స్కందః ప్రజాపతిః |
మహేంద్రో ధనదః కాలో యమః సోమో హ్యపాంపతిః || 8 ||
పితరో వసవః సాధ్యా అశ్వినౌ మరుతో మనుః |
వాయుర్వహ్నిః ప్రజాప్రాణః ఋతుకర్తా ప్రభాకరః || 9 ||
ఆదిత్యః సవితా సూర్యః ఖగః పూషా గభస్తిమాన్ |
సువర్ణసదృశో భానుర్హిరణ్యరేతా దివాకరః || 10 ||
హరిదశ్వః సహస్రార్చిః సప్తసప్తిర్మరీచిమాన్ |
తిమిరోన్మథనః శంభుస్త్వష్టా మార్తాండకోఽంశుమాన్ || 11 ||
హిరణ్యగర్భః శిశిరస్తపనో భాస్కరో రవిః |
అగ్నిగర్భోఽదితేః పుత్రః శంఖః శిశిరనాశనః || 12 ||
వ్యోమనాథస్తమోభేదీ ఋగ్యజుఃసామపారగః |
ఘనవృష్టిరపామ్మిత్రో వింధ్యవీథీప్లవంగమః || 13 ||
ఆతపీ మండలీ మృత్యుః పింగళః సర్వతాపనః |
కవిర్విశ్వో మహాతేజా రక్తః సర్వభవద్భవః || 14 ||
నక్షత్రగ్రహతారాణామధిపో విశ్వభావనః |
తేజసామపి తేజస్వీ ద్వాదశాత్మన్నమోఽస్తు తే || 15 ||
నమః పూర్వాయ గిరయే పశ్చిమాయాద్రయే నమః |
జ్యోతిర్గణానాం పతయే దినాధిపతయే నమః || 16 ||
జయాయ జయభద్రాయ హర్యశ్వాయ నమో నమః |
నమో నమః సహస్రాంశో ఆదిత్యాయ నమో నమః || 17 ||
నమ ఉగ్రాయ వీరాయ సారంగాయ నమో నమః |
నమః పద్మప్రబోధాయ మార్తాండాయ నమో నమః || 18 ||
బ్రహ్మేశానాచ్యుతేశాయ సూర్యాయాదిత్యవర్చసే |
భాస్వతే సర్వభక్షాయ రౌద్రాయ వపుషే నమః || 19 ||
తమోఘ్నాయ హిమఘ్నాయ శత్రుఘ్నాయామితాత్మనే |
కృతఘ్నఘ్నాయ దేవాయ జ్యోతిషాం పతయే నమః || 20 ||
తప్తచామీకరాభాయ వహ్నయే విశ్వకర్మణే |
నమస్తమోభినిఘ్నాయ రుచయే లోకసాక్షిణే || 21 ||
నాశయత్యేష వై భూతం తదేవ సృజతి ప్రభుః |
పాయత్యేష తపత్యేష వర్షత్యేష గభస్తిభిః || 22 ||
ఏష సుప్తేషు జాగర్తి భూతేషు పరినిష్ఠితః |
ఏష ఏవాగ్నిహోత్రం చ ఫలం చైవాగ్నిహోత్రిణామ్ || 23 ||
వేదాశ్చ క్రతవశ్చైవ క్రతూనాం ఫలమేవ చ |
యాని కృత్యాని లోకేషు సర్వ ఏష రవిః ప్రభుః || 24 ||
ఏనమాపత్సు కృచ్ఛ్రేషు కాంతారేషు భయేషు చ |
కీర్తయన్ పురుషః కశ్చిన్నావసీదతి రాఘవ || 25 ||
పూజయస్వైనమేకాగ్రో దేవదేవం జగత్పతిమ్ |
ఏతత్త్రిగుణితం జప్త్వా యుద్ధేషు విజయిష్యసి || 26 ||
అస్మిన్ క్షణే మహాబాహో రావణం త్వం వధిష్యసి |
ఏవముక్త్వా తదాగస్త్యో జగామ చ యథాగతమ్ || 27 ||
ఏతచ్ఛ్రుత్వా మహాతేజా నష్టశోకోఽభవత్తదా |
ధారయామాస సుప్రీతో రాఘవః ప్రయతాత్మవాన్ || 28 ||
ఆదిత్యం ప్రేక్ష్య జప్త్వా తు పరం హర్షమవాప్తవాన్ |
త్రిరాచమ్య శుచిర్భూత్వా ధనురాదాయ వీర్యవాన్ || 29 ||
రావణం ప్రేక్ష్య హృష్టాత్మా యుద్ధాయ సముపాగమత్ |
సర్వయత్నేన మహతా వధే తస్య ధృతోఽభవత్ || 30 ||
అథ రవిరవదన్నిరీక్ష్య రామం
ముదితమనాః పరమం ప్రహృష్యమాణః |
నిశిచరపతిసంక్షయం విదిత్వా
సురగణమధ్యగతో వచస్త్వరేతి || 31 ||
`;

const DEVANAGARI_RAW = `
नमः सवित्रे जगदेकचक्षुषे जगत्प्रसूतिस्थितिनाशहेतवे ।
त्रयीमयाय त्रिगुणात्मधारिणे विरिञ्चिनारायणशङ्करात्मने ॥
ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥ १ ॥
दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।
उपगम्याब्रवीद्राममगरत्यो भगवांस्तदा ॥ २ ॥
राम राम महाबाहो शृणु गुह्यं सनातनम् ।
येन सर्वानरीन् वत्स समरे विजयिष्यसि ॥ ३ ॥
आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।
जयावहं जपेन्नित्यमक्षय्यं परमं शिवम् ॥ ४ ॥
सर्वमङ्गलमाङ्गल्यं सर्वपापप्रणाशनम् ।
चिन्ताशोकप्रशमनं आयुर्वर्धनमुत्तमम् ॥ ५ ॥
रश्मिमन्तं समुद्यन्तं देवासुरनमस्कृतम् ।
पूजयस्व विवस्वन्तं भास्करं भुवनेश्वरम् ॥ ६ ॥
सर्वदेवात्मको ह्येष तेजस्वी रश्मिभावनः ।
एष देवासुरान् लोकान् पाति गभस्तिभिः ॥ ७ ॥
एष ब्रह्मा च विष्णुश्च शिवः स्कन्दः प्रजापतिः ।
महेन्द्रो धनदः कालो यमः सोमो ह्यपां पतिः ॥ ८ ॥
पितरो वसवः साध्या अश्विनौ मरुतो मनुः ।
वायुर्वह्निः प्रजाप्राणः ऋतुकर्ता प्रभाकरः ॥ ९ ॥
आदित्यः सविता सूर्यः खगः पूषा गभस्तिमान् ।
सुवर्णसदृशो भानुर्हिरण्यरेता दिवाकरः ॥ १० ॥
हरिदश्वः सहस्रार्चिः सप्तसप्तिर्मरीचिमान् ।
तििमरोन्मथनः शम्भुस्त्वष्टा मार्तण्डकोंऽशुमान् ॥ ११ ॥
हिरण्यगर्भः शिशिरस्तपनो भास्करो रविः ।
अग्निगर्भोऽदितेः पुत्रः शङ्खः शिशिरनाशनः ॥ १२ ॥
व्योमनाथस्तमोभेदी ऋग्यजुःसामपारगः ।
घनवृष्टिरपां मित्रो विन्ध्यवीथीप्लवङ्गमः ॥ १३ ॥
आतपी मण्डली मृत्युः पिङ्गलः सर्वतापनः ।
कविर्विश्वो महातेजा रक्तः सर्वभवोद्भवः ॥ १४ ॥
नक्षत्रग्रहताराणामधिपो विश्वभावनः ।
तेजसामपि तेजस्वी द्वादशात्मन् नमोऽस्तु ते ॥ १५ ॥
नमः पूर्वाय गिरये पश्चिमायाद्रये नमः ।
ज्योतिर्गणानां पतये दिनाधिपतये नमः ॥ १६ ॥
जयाय जयभद्राय हर्यश्वाय नमो नमः ।
नमो नमः सहस्रांशो आदित्याय नमो नमः ॥ १७ ॥
नम उग्राय वीराय सारङ्गाय नमो नमः ।
नमः पद्मप्रबोधाय मार्तण्डाय नमो नमः ॥ १८ ॥
ब्रह्मेशानच्युतेशाय सूर्यायादित्यवर्चसे ।
भास्वते सर्वभक्षाय रौद्राय वपुषे नमः ॥ १९ ॥
तमोघ्नाय हिमघ्नाय शत्रुघ्नाय अमितात्मने ।
कृतघ्नघ्नाय देवाय ज्योतिषां पतये नमः ॥ २० ॥
तप्तचामीकराभाय वह्नये विश्वकर्मणे ।
नमस्तमोभिनिघ्नाय रुचये लोकसाक्षिणे ॥ २१ ॥
नाशयत्येष वै भूतं तदेव सृजती प्रभुः ।
पायत्येष तपत्येष वर्षत्येष गभस्तिभिः ॥ २२ ॥
एष सुप्तेषु जागर्ति भूतेषु परिनिष्ठितः ।
एष एव अग्निहोत्रं च फलं चैवाग्निहोत्रिणाम् ॥ २३ ॥
वेदाश्च क्रतवश्चैव क्रतूनां फलमेव च ।
यानी कृत्यानि लोकेषु सर्व एष रविः प्रभुः ॥ २४ ॥
एनमापत्सु कृच्छ्रेषु कान्तारेषु भयेषु च ।
कीर्तयन् पुरुषः कश्चिनावसीदति राघव ॥ २५ ॥
पूजयस्वैनमेकाग्रो देवदेवं जगत्पतिम् ।
एतद् त्रिगुणितं जप्त्वा युद्धेषु विजयिष्यसि ॥ २६ ॥
अस्मिन् क्षणे महाबाहो रावणं त्वं वधिष्यसि ।
एवमुक्त्वा तदागस्त्यो जगाम च यथागतम् ॥ २७ ॥
एतच्छ्रुत्वा महातेजा नष्टशोकोऽभवत्तदा ।
धारयामास सुप्रीतो राघवः प्रयतात्मवान् ॥ २८ ॥
आदित्यं प्रेक्ष्य जप्त्वा तु परं हर्षमवाप्तवान् ।
त्रिराचम्य शुचिर्भूत्वा धनुरादाय वीर्यवान् ॥ २९ ॥
रावणं प्रेक्ष्य हृष्टात्मा युद्धाय समुपागमत् ।
सर्वयत्नेन महता वधे तस्य धृतोऽभवत ॥ ३० ॥
अथ रविरवदन्निरीक्ष्य रामं
मुदितमनाः परमं प्रहृष्यमाणः ।
निशिचरपतिसंक्षयं विदित्वा
सुरगणमध्यगतो वचस्त्वरेति ॥ ३१ ॥
`;

const TAMIL_RAW = `
நமஸ்த்ஸவித்ரே ஜகதேக சக்ஷுஸே ஜகத்ப்ரஸூதி ஸ்திதி நாசஹேதவே |
த்ரயீமயாய த்ரிகுணாத்ம தாரிணே விரிஞ்சி நாராயண சங்கராத்மனே ||
ததோ யுத்த பரிச்ராந்தம் ஸமரே சிந்தயா ஸ்திதம் |
ராவணம் சாக்ரதோ த்ருஷ்ட்வா யுத்தாய ஸமுபஸ்திதம் || 1 ||
தைவதைஸ்ச ஸமாகம்ய த்ரஷ்டுமப்யாகதோ ரணம் |
உபாகம்யாப்ரவீத்ராமம் அகஸ்த்யோ பகவான் ரிஷிஹி || 2 ||
ராம ராம மஹாபாஹோ ச்ருணு குஹ்யம் ஸனாதனம் |
யேன ஸர்வான் அரீன் வத்ஸ ஸமரே விஜயிஷ்யஸி || 3 ||
ஆதித்ய ஹ்ருதயம் புண்யம் ஸர்வ சத்ரு விநாசனம் |
ஜயாவஹம் ஜபேந்நித்யம் அக்ஷய்யம் பரமம் சிவம் || 4 ||
ஸர்வமங்கள மாங்கல்யம் ஸர்வபாப ப்ரணாசனம் |
சிந்தாசோக ப்ரசமனம் ஆயுர்வர்த்தனமுத்தமம் || 5 ||
ரச்மிமந்தம் ஸமுத்யந்தம் தேவாஸுர நமஸ்க்ருதம் |
பூஜயஸ்வ விவஸ்வந்தம் பாஸ்கரம் புவனேஸ்வரம் || 6 ||
ஸர்வதேவாத்மகோ ஹ்யேஷ தேஜஸ்வீ ரச்மிபாவனஃ |
ஏஷ தேவாஸுரான் லோகான் பாதி கபஸ்திபிஃ || 7 ||
ஏஷ ப்ரஹ்மா ச விஷ்ணுஸ்ச சிவஃ ஸ்கந்தஃ ப்ரஜாபதிஃ |
மஹேந்த்ரோ தனதஃ காலஃ யமஃ ஸோமோ ஹ்யபாம்பதிஃ || 8 ||
பிதரோ வஸவஃ ஸாத்யா அச்வினௌ மருதோ மனுஃ |
வாயுர்வஹ்னிஃ ப்ரஜாப்ராணஃ ரிதுகர்த்தா ப்ரபாகரஃ || 9 ||
ஆதித்யஃ ஸவிதா ஸூர்யஃ ககஃ பூஷா கபஸ்திமான் |
ஸுவர்ணஸத்ருசோ பானுர்ஹிரண்யரேதா திவாகரஃ || 10 ||
ஹரிதச்வஃ ஸஹஸ்ரார்சிஃ ஸப்தஸப்திர்மரீசிமான் |
திமிரோன்மதனஃ சம்புஸ்த்வஷ்டா மார்த்தாண்டகோம்சுமான் || 11 ||
ஹிரண்யகர்பஃ சிசிரஸ்தபனோ பாஸ்கரோ ரவிஃ |
அக்னிகர்போதிதேஃ புத்ரஃ சங்கஃ சிசிரநாசனஃ || 12 ||
வ்யோமநாதஸ்தமோபேதீ ரிக்யஜுஃஸாமபாரகஃ |
கனவ்ருஷ்டிரபாம் மித்ரோ விந்த்யவீதீப்லவங்கமஃ || 13 ||
ஆதபீ மண்டலீ ம்ருத்யுஃ பிங்களஃ ஸர்வதாபனஃ |
கவிர்விஸ்வோ மஹாதேஜா ரக்தஃ ஸர்வபவோத்பவஃ || 14 ||
நக்ஷத்ரக்ரஹதாராணாமதிபோ விஸ்வபாவனஃ |
தேஜஸாமபி தேஜஸ்வீ த்வாதசாத்மன்னமோஸ்து தே || 15 ||
நமஃ பூர்வாய கிரயே பஸ்சிமாயாத்ரயே நமஃ |
ஜ்யோதிர்கணானாம் பதயே தினாதிபதயே நமஃ || 16 ||
ஜயாய ஜயபத்ராய ஹர்யச்வாய நமோ நமஃ |
நமோ நமஃ ஸஹஸ்ராம்சோ ஆதித்யாய நமோ நமஃ || 17 ||
நம உக்ராய வீராய ஸாரங்காய நமோ நமஃ |
நமஃ பத்மப்ரபோதாய மார்த்தாண்டாய நமோ நமஃ || 18 ||
ப்ரஹ்மேசானாச்யுதேசாய ஸூர்யாயாதித்யவர்சஸே |
பாஸ்வதே ஸர்வபக்ஷாய ரௌத்ராய வபுஷே நமஃ || 19 ||
தமோக்னாய ஹிமக்னாய சத்ருக்னாயாமிதாத்மனே |
க்ருதக்னக்னாய தேவாய ஜ்யோதிஷாம் பதயே நமஃ || 20 ||
தப்தசாமீகராபாய வஹ்னயே விஸ்வகர்மணே |
நமஸ்தமோபினிக்னாய ருசயே லோகஸாக்ஷிணே || 21 ||
நாசயத்யேஷ வை பூதம் ததேவ ஸ்ருஜதி ப்ரபுஃ |
பாயத்யேஷ தபத்யேஷ வர்ஷத்யேஷ கபஸ்திபிஃ || 22 ||
ஏஷ ஸுப்தேஷு ஜாகர்தி பூதேஷு பரினிஷ்டிதஃ |
ஏஷ ஏவாக்னிஹோத்ரம் ச பலம் சைவாக்னிஹோத்ரிணாம் || 23 ||
வேதாஸ்ச க்ரதுவஸ்சைவ க்ரதூநாம் பலமேவ ச |
யானி க்ருத்யானி லோகேஷு ஸர்வ ஏஷ ரவிஃ ப்ரபுஃ || 24 ||
ஏனமாபத்ஸு க்ருச்ச்ரேஷு காந்தாரேஷு பயேஷு ச |
கீர்த்தயன் புருஷஃ கஸ்சின்நாவஸீததி ராகவ || 25 ||
பூஜயஸ்வைனமேகாக்ரோ தேவதேவம் ஜகத்பதிம் |
ஏதத்த்ரிகுணிதம் ஜப்த்வா யுத்தேஷு விஜயிஷ்யஸி || 26 ||
அஸ்மின் க்ஷணே மஹாபாஹோ ராவணம் த்வம் வதிஷ்யஸி |
ஏவமுக்த்வா ததாகஸ்த்யோ ஜகாம ச யதாகதம் || 27 ||
ஏதச்ச்ருத்வா மஹாதேஜா நஷ்டசோகோபவத்ததா |
தாரயாமாஸ ஸுப்ரீதோ ராகவஃ ப்ரயதாத்மவான் || 28 ||
ஆதித்யம் ப்ரேக்ஷ்ய ஜப்த்வா து பரம் ஹர்ஷமவாப்தவான் |
த்ரிராசம்ய சுசிர்பூத்வா தநுராதாய வீர்யவான் || 29 ||
ராவணம் ப்ரேக்ஷ்ய ஹ்ருஷ்டாத்மா யுத்தாய ஸமுபாகமத் |
ஸர்வயத்னேன மஹதா வதே தஸ்ய த்ருதோபவத் || 30 ||
அத ரவிரவதந்நிரீக்ஷ்ய ராமம்
முதிதமனாஃ பரமம் ப்ரஹ்ருஷ்யமாணஃ |
நிசிசரபதிஸங்க்ஷயம் விதித்வா
ஸுரகணமத்யகதோ வசஸ்த்வரேதி || 31 ||
`;

function toLines(raw) {
  return raw.split('\n').map(l => l.trim()).filter(Boolean);
}

// Skip the 2-line, unnumbered Dhyana Slokam preamble common to all four
// scripts, then parse the remaining lines into verses. Line-boundary driven:
// a line ending in a single separator closes a pada; a line ending in a
// numbered double separator closes both the pada and the verse. Handles
// verse 31's 4-line extended-meter shape without a special case.
function parseVerses(raw) {
  const lines = toLines(raw).slice(2);
  const verses = [];
  let padaBuf = [];
  let padas = [];
  for (const line of lines) {
    const markerMatch = line.match(/^(.*?)\s*(?:\|\||॥)\s*([0-9०-९]+)\s*(?:\|\||॥)\s*$/);
    if (markerMatch) {
      padaBuf.push(markerMatch[1].trim());
      padas.push(padaBuf.join(' ').trim());
      padaBuf = [];
      const digits = markerMatch[2];
      const devMap = '०१२३४५६७८९';
      let numStr = '';
      for (const ch of digits) numStr += /[0-9]/.test(ch) ? ch : String(devMap.indexOf(ch));
      verses.push({ padas, num: parseInt(numStr, 10) });
      padas = [];
      continue;
    }
    const singleSepMatch = line.match(/^(.*?)\s*([|।])\s*$/);
    if (singleSepMatch) {
      padaBuf.push(singleSepMatch[1].trim());
      padas.push(padaBuf.join(' ').trim());
      padaBuf = [];
      continue;
    }
    padaBuf.push(line);
  }
  if (padaBuf.length || padas.length) {
    throw new Error(`Unclosed trailing content after parsing: padaBuf=${JSON.stringify(padaBuf)} padas=${JSON.stringify(padas)}`);
  }
  return verses;
}

const scripts = {
  devanagari: parseVerses(DEVANAGARI_RAW),
  telugu: parseVerses(TELUGU_RAW),
  tamil: parseVerses(TAMIL_RAW),
  iast: parseVerses(IAST_RAW),
};

for (const [label, verses] of Object.entries(scripts)) {
  if (verses.length !== 31) throw new Error(`${label}: expected 31 verses, got ${verses.length}`);
  verses.forEach((v, i) => {
    if (v.num !== i + 1) throw new Error(`${label}: verse index ${i} has marker ${v.num}, expected ${i + 1}`);
  });
}
console.log('Sequence check passed: all 31 verses present and sequential in all four scripts.\n');

const rows = [];
for (let i = 0; i < 31; i++) {
  const stanzaNumber = i + 1;
  rows.push({
    stanza_number: stanzaNumber,
    stanza_label: `Ślōka ${stanzaNumber}`,
    script_devanagari: scripts.devanagari[i].padas.join('|'),
    script_telugu: scripts.telugu[i].padas.join('|'),
    script_tamil: scripts.tamil[i].padas.join('|'),
    roman_iast: scripts.iast[i].padas.join('|'),
  });
}

const sampleIdx = [0, 1, 26, 29, 30];
console.log(`Sample (verses ${sampleIdx.map(i => i + 1).join(', ')}):\n`);
sampleIdx.forEach(i => console.log(rows[i], '\n'));

console.log('NOTE: no English meaning source was supplied -- meaning_en is left blank for all 31 rows.');
console.log('NOTE: two likely source typos flagged in this script\'s header comment (IAST verse 2 "abrveed"->"abravīd"; Devanagari verse 2 "अगरत्यो"->"अगस्त्यो") -- uploaded as given, not corrected.\n');

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
    '', '', '', '', '',
  ]);
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
    range: 'shloka_stanzas!A1',
    valueInputOption: 'RAW',
    requestBody: { values: appendRows },
  });
  console.log(`Appended ${appendRows.length} rows for "${SLUG}".`);
}
