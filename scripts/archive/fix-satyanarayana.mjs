/**
 * 1. Renames "Satyanarayana Vratham" → "Satyanarayana Swamy Vratham"
 * 2. Replaces compressed Telugu story paragraphs with properly split versions
 *    matching the English paragraph count for all 5 satyanarayana stories.
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID;
const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });
const WRITE = process.argv.includes('--write');

// ── CORRECTED TELUGU PARAGRAPHS ────────────────────────────────────────────
// Each story now matches the English paragraph count exactly.

const teluguStories = {
  'satyanarayana-story-1': [
    // P1 — Naimisharanya, rishis, Suta Muni's question
    'పురాతన నైమిశారణ్యంలో, ఆకాశాన్ని తమ కొమ్మలపై మోస్తున్నట్లు కనిపించే విశాల వృక్షాల నడుమ, ఎనభై ఎనిమిది వేల మంది ఋషులు పవిత్రాగ్ని చుట్టూ సమావేశమయ్యారు. నేతి ఆహుతుల పొగ, వేద ఘోష అన్నీ ఆ అరణ్యంలో ద్రవించిపోతున్నాయి. వ్యాసపీఠంపై సూత మహర్షి కూర్చున్నారు. ఋషులు హస్తాలు జోడించి అడిగారు: "కలియుగంలో మానవులు రోగాలు, దారిద్ర్యం, దుఃఖాలతో విలవిలలాడుతున్నారు. కులం, సొమ్ము, చదువు అన్నీ అటుంచి ఎవరైనా ఆచరించగలిగే సులభమైన పూజ ఏదైనా ఉందా?" సూత మహర్షి చిరునవ్వు నవ్వాడు — ఈ ప్రశ్నే ఒకప్పుడు నారదుడిని వైకుంఠానికి తీసుకువెళ్ళిందని తెలుసు.',
    // P2 — Narada on earth, sees suffering
    'ఒకప్పుడు దేవర్షి నారదుడు భూలోకంలో సంచరిస్తూ ఒక రైతు అష్టకష్టాలు పడుతూ కూడా పేదరికంలో మగ్గడం చూశాడు. ఒక వితంతువు పిల్లలతో వట్టి పళ్ళెం ముందు నిల్చోవడం చూశాడు. ధర్మాత్ముడైన రాజు, ఇచ్చినవాడు, పందులకు వేసినవాడు — అతని రాజ్యం దురాత్ముల చేతుల్లో పడింది. నారదుడి హృదయం ద్రవించింది. ఒక నది ఒడ్డు చేరి కూర్చున్నాడు, ఆకాశం వైపు చూసి అడిగాడు: "సత్ప్రవర్తనగల వారికి కూడా ఈ బాధలు తప్పడం లేదు. మార్గమేమైనా ఉందా?"',
    // P3 — Narada ascends to Vaikuntha (was merged into old P3 first half)
    'ఆ ప్రశ్న హృదయంలో వెలుగుతుండగా నారదుడు వైకుంఠం వైపు సాగాడు. లోకాలు దాటుతున్నకొద్దీ భూమి యొక్క బాధ దూరమైంది, కానీ ఆ మంట ఆరలేదు. వైకుంఠంలో క్షీరసాగరం పాల వెలుతురులో, అనంత శేషశయ్యపై విష్ణువు నిద్రిస్తున్నాడు. లక్ష్మీదేవి సేవలు చేస్తోంది. నారదుడు సాష్టాంగ నమస్కారం చేసి కన్నీళ్ళతో అడిగాడు: "ప్రభూ, మీ సృష్టిలో సత్ప్రవర్తనగల మనుషులు కూడా బాధపడుతున్నారు. వారికి ఒక్కటైనా ఉపాయం లేదా?"',
    // P4 — Vishnu's explanation + Narada spreads the word (was merged into old P3 second half)
    'విష్ణువు నయనాలు తెరిచి, నారదుడి నిజమైన కరుణ చూసి, ప్రేమగా నవ్వాడు. "నారదా, నీ మనసు నన్ను మెప్పించింది. కలియుగానికి సరిపడా వ్రతం చెప్తాను — సత్యనారాయణ వ్రతం. ఏ తిథి అయినా, ఏ రోజైనా, ఎంత ఆర్థిక స్తోమత ఉన్నా ఆచరించవచ్చు. కలశం, దీపం, పూలు, రవ్వతో చేసిన పానకం — ఇవి సరిపోతాయి. కానీ అన్నిటికంటే ముఖ్యమైనది మనసులో, మాటలో, చేతలో సత్యం. నేను సత్యనారాయణ స్వామిని — సత్యమే నా స్వరూపం. ఈ వ్రతం చేసినవారికి, చూసినవారికి, ప్రసాదం అందుకున్నవారికి కూడా అనుగ్రహం కలుగుతుంది." నారదుడు పాదాలకు నమస్కరించి భూలోకానికి దిగాడు, గ్రామగ్రామాన సత్యనారాయణ స్వామి వ్రతం యొక్క మహిమను ప్రచారం చేశాడు.',
  ],

  'satyanarayana-story-2': [
    // P1 — poor brahmin
    'పవిత్ర కాశీ నగరంలో, గంగా నదీ తీరాన, వేదాలు కంఠస్థం చేసిన ఒక నిరుపేద బ్రాహ్మణుడు నివసించేవాడు. శాస్త్రాలు తెలుసు, గంటల తరబడి స్తోత్రాలు పాడగలడు, కానీ కడుపు నిండా తినలేని స్థితి. ప్రతి ఉదయం ఘాటులపై అలా తిరుగుతూ, ఏ ఇంట్లో అన్నం పెడతారా అని చూస్తూ గడిపేవాడు.',
    // P2 — old man appears (unchanged)
    'ఒక తెల్లవారు జామున ఘాటుపై ఒక వృద్ధుడు కనిపించాడు — తెల్లని గడ్డం, కాషాయ వస్త్రం, చేతిలో కర్ర. "ఈ భారమైన మనసుతో ఎందుకు తిరుగుతున్నావు?" అని అడిగాడు. బ్రాహ్మణుడు తన కష్టాలు చెప్పాడు. వృద్ధుడు చెప్పాడు: "వచ్చే పౌర్ణమి నాడు కలశం, రవ్వ పానకంతో సత్యనారాయణ స్వామి పూజ చేయి. ఎంత సొమ్ముందో అంతే ఇవ్వు — ప్రభువు మనసు చూస్తాడు, సొమ్ము కాదు." వెళ్ళాడు. తిరిగి చూడగా అక్కడ ఎవరూ లేరు.',
    // P3 — puja day (split from old P3)
    'బ్రాహ్మణుడు ఇంటికి వెళ్ళి భార్య శ్రీమతికి అంతా చెప్పాడు. ఆమె సంతోషంగా అంగీకరించింది. పౌర్ణమి ఉదయం అద్భుతం జరిగింది — ఆ రోజు మామూలుకంటే చాలా ఎక్కువగా భిక్ష వచ్చింది. ఒక వ్యాపారి గురువు కావాలని వచ్చాడు, తగిన పారితోషికం చెల్లించాడు. సాయంత్రం చిరుదీపాల వెలుతురులో భార్యాభర్తలిద్దరూ శ్రద్ధగా పూజ చేశారు. పొరుగువారికి ప్రసాదం పంచారు. తొలిసారిగా ఆ ఇంట్లో నిండు మనసుతో పడుకున్నారు.',
    // P4 — weeks that followed (new paragraph)
    'వారాలు గడిచాయి. ఒక్కొక్కటిగా జీవితం మారసాగింది. ఒక విద్యార్థి చదువు కోసం వచ్చాడు. ఒక దూర బంధువు ఊహించని కానుక పంపించాడు. నగరంలో ఒక చిన్న భూమి కొనుక్కోవడానికి సరిపడా ఏర్పడింది. బ్రాహ్మణుడు ప్రతి పౌర్ణమికీ వ్రతం చేయడం మానలేదు. ఆయన భార్య మనసులో ఒక నమ్మకం పేరుకుంది: అందుబాటులో ఉన్నంతలో, నిజంగా ఇచ్చినప్పుడు ప్రభువు వినడు అని ఎప్పుడూ ఉండదు.',
    // P5 — woodcutter Dhaniram (was old P4)
    'నగరం పొలిమేరలో ధనిరాం అనే పేద కట్టెల అమ్మకుడు ఉండేవాడు. తెల్లవారు జామున అడవిలో కట్టెలు కొట్టి, వాటిని వీపుపై మోసుకు మార్కెట్‌కు వెళ్ళి అమ్మి జీవికను సాగించేవాడు. ఒక సాయంత్రం వీధిలో వెళ్తుండగా బ్రాహ్మణుడి ఇంటి నుండి దీప వెలుతురు, శంఖ నాదం వినిపించాయి. ఆగాడు, లోపలికి వెళ్ళి వెనక కూర్చున్నాడు. ప్రసాదం రెండు చేతులతో అందుకుని కళ్ళు మూసుకున్నాడు. ఏదో వెచ్చగా అనిపించింది. "ఇది ఏ పూజ?" అని అడిగాడు. బ్రాహ్మణుడు వివరించాడు. "రేపు నేను ఏం సంపాదిస్తానో దాంతో ఈ పూజ చేస్తాను" అన్నాడు ధనిరాం. మరుసటి రోజు అతని కట్టె రెట్టింపు ధరకు అమ్ముడైంది. ఆ రాత్రి పూజ చేశాడు. జీవితం మెల్లగా మారసాగింది.',
  ],

  'satyanarayana-story-3': [
    // P1 — Sadhu the merchant
    'ఒక నదీతీరంలో ఉన్న సంపన్న నగరంలో సాధు అనే ధనవంతుడైన వర్తకుడు ఉండేవాడు. దానశీలి, అందరికీ గౌరవప్రదుడు. అతని భార్య లీలావతి. వారికి ఏడేళ్ళు గడిచినా సంతానం కలుగలేదు. సంపద ఉంది, గౌరవం ఉంది — కానీ ఆ ఒక్క లోటు ఇంట్లో మౌనంగా నెలకొని ఉంది.',
    // P2 — king Ulkamukha's puja on the riverbank
    'ఒకనాడు సాధు తన నావలో వెళ్తూ ఒక నదీతీరంలో ఆగాడు. అక్కడ ఉల్కాముఖ రాజు మహారాణితో కలిసి సత్యనారాయణ స్వామి వ్రతం చేస్తున్నాడు. పూజా ఘోష, పూల సువాసన అన్నీ వాతావరణంలో నిండాయి. రాజు సాధుని పిలిచి వ్రతం గురించి చెప్పాడు. "మాకు కూడా చాలా సంవత్సరాలు సంతానం లేదు. ఈ వ్రతంతో కలిగారు." సాధు మనసులో మొక్కుకున్నాడు: "బిడ్డ కలిగితే వ్రతం చేస్తాను." తిరిగి వెళ్ళాడు. లీలావతి గర్భం ధరించింది. కళావతి అనే అందమైన కూతురు పుట్టింది.',
    // P3 — years pass, vow postponed
    'ఏళ్ళు గడిచాయి. వ్యాపారం, నావలు, లెక్కలు, దూర ప్రయాణాలు — సాధుకు వ్రతం చేయడానికి తీరికే దొరకలేదు. లీలావతి ప్రతి పౌర్ణమికీ గుర్తు చేసేది. "వచ్చే నెల" అని సాధు చెప్పేవాడు. నెల గడిచేది. కళావతి పెళ్లి కూడా అయింది. వ్రతం మాత్రం జరుగలేదు.',
    // P4 — merchant goes to Ratnapura, imprisoned
    'కొన్నాళ్ళ తర్వాత సాధు, అల్లుడు కలిసి రత్నపుర నగరానికి వ్యాపారం కోసం వెళ్లారు. ఆ రాత్రే దొంగలు చంద్రకేతు రాజు కోశాగారాన్ని దోచారు. పారిపోతూ దొంగలు దోచిన నగలు సాధు గిడ్డంగిలో దాచారు. మరుసటి రోజు సైనికులు వాటిని కనుగొని సాధుని, అల్లుడిని బంధించారు. రాజు విచారణ జరపకుండా జైలులో వేశాడు.',
    // P5 — months in prison, Sadhu reflects (was merged into old P5)
    'నెలలు గడిచాయి. చీకటి గది, పందికొక్కుల శబ్దం, జైలు అన్నం. ఆ నిశ్శబ్దంలో సాధు ఆలోచనలు లోపలికి తిరిగాయి. ఉల్కాముఖ రాజు తీరంలో వ్రతం చేస్తున్నప్పుడు తాను నావలో వేరే దిశకు వెళ్ళాడు. మొక్కుకుని ఉండి వ్రతం చేయలేదు. "అప్పుడు ఆగి ఉంటే..." — ఆ ప్రశ్న పదే పదే వచ్చింది. జైలు చీకటిలో సాధు మొదటిసారిగా లాభనష్టాల గురించి కాదు, ప్రభువు గురించి ఆలోచించాడు.',
    // P6 — king's dream, release (was merged into old P5)
    'ఆ రాత్రే చంద్రకేతు రాజుకు కల వచ్చింది. సహస్రసూర్య కాంతిగల ఒక వృద్ధుడు ప్రత్యక్షమై అన్నాడు: "రాజా, నీ జైలులో ఉన్న వర్తకుడు నిర్దోషి. వెంటనే వదిలిపెట్టు, తీసుకున్నది తిరిగి ఇచ్చి పంపు. ఆలస్యం చేస్తే నీ రాజ్యానికి అనర్థం." తెల్లవారి రాజు సాధుని, అల్లుడిని విడుదల చేశాడు, ఆస్తి తిరిగి ఇచ్చి, బహుమతులు ఇచ్చి గౌరవంగా పంపించాడు. సాధు ఇంటికి చేరాడు. ఒక్క రోజు కూడా ఆలస్యం చేయకుండా, మనసారా సత్యనారాయణ స్వామి వ్రతం చేశాడు.',
  ],

  'satyanarayana-story-4': [
    // P1 — setting sail for home (unchanged — already matches)
    'రాజు బహుమతులతో నావ నింపుకుని సాధు, అల్లుడు ఇంటికి బయలుదేరారు. నది తళతళ మెరుస్తోంది, పడవ నడిపేవారు పాటలు పాడుతున్నారు. జైలు నరకం గడిచింది, ఇప్పుడు మనసు హాయిగా ఉంది.',
    // P2 — the ascetic's test (unchanged — already matches)
    'సత్యనారాయణ స్వామి సాధుని చివరిసారిగా పరీక్షించాలని నిర్ణయించాడు. నదీ తీరాన ఒక వివస్త్రుడైన సన్యాసి కనిపించాడు — వెలిగే కళ్ళు, శరీరానికి భస్మం. "ఓ వర్తకా, నీ నావలో ఏముంది?" అని అడిగాడు. సాధు అనుమానపడి అబద్ధం చెప్పాడు: "పనికిమాలిన ఆకులు, కొమ్మలు తప్ప ఏమీ లేదు." సన్యాసి తలూపాడు: "అలాగే ఉండుగాక." వెళ్ళాడు.',
    // P3 — boat sinks, Sadhu repents (unchanged — already matches)
    'క్షణంలో నావ ఒరిగింది. సాధు లోపలికి పరుగెత్తాడు — అన్ని సరుకులు పోయి, పొడి ఆకులు కొమ్మలు మిగిలాయి. నావ మునగసాగింది. సాధు ఒడ్డుకు పరుగెత్తాడు, సన్యాసి పాదాలపై పడ్డాడు: "క్షమించు స్వామీ! అబద్ధం చెప్పాను." సన్యాసి రూపం మారింది — సత్యనారాయణ స్వామి నాలుగు చేతులతో, వేయి సూర్యుల కాంతితో ప్రత్యక్షమయ్యాడు. "సత్యంతో అబద్ధం కలపలేవు" అన్నాడు. సాధు మనసారా మళ్ళీ క్షమాపణ వేడుకున్నాడు. ప్రభువు చిరునవ్వుతో "నావకు తిరిగి వెళ్ళు" అన్నాడు. వెళ్తే నావ నిండింది.',
    // P4 — Kalavati abandons prasadam, boat sinks again (unchanged — already matches)
    'ముందే సందేశం పంపించారు. ఆ రోజు కళావతి ఇంట్లో వ్రతం చేస్తోంది. వార్త విన్న సంతోషంలో ప్రసాదం తీసుకోకుండా భర్తను చూడ్డానికి నదికి పరుగెత్తింది. నావ మళ్ళీ మునగసాగింది. సాధు గట్టిగా అరిచాడు: "కళావతీ, తిరిగి వెళ్ళి ప్రసాదం తీసుకో!" ఆమె పరుగున వెళ్ళి మనసారా ప్రసాదం తీసుకుంది. నావ లేచింది. భర్త ఒడ్డుకు నడిచివచ్చాడు. ఆ రోజు నుండి ఆ కుటుంబంలో ఏ పూజలో అయినా ప్రసాదం తీసుకోకుండా మధ్యలో లేచే అలవాటు ఎవరికీ లేదు.',
  ],

  'satyanarayana-story-5': [
    // P1 — king Tungadhwaja's character
    'తుంగధ్వజుడు అనే గొప్ప రాజు ఉండేవాడు. న్యాయమైన పాలన, విజయాలు, ప్రజారంజన — అన్నీ ఉన్నాయి. పన్నులు న్యాయంగా వసూలు చేసేవాడు, ఆలయాలు నిర్వహించేవాడు, పేదలకు ఇచ్చేవాడు. కానీ మనసు లోతులలో ఒక అహంకారం దాగి ఉంది: తన సాఫల్యం తన స్వంత శ్రమతో వచ్చింది, దేవుని అనుగ్రహంతో కాదు అనే నమ్మకం.',
    // P2 — forest scene, cowherds offer prasadam (split from old P2)
    'ఒక పౌర్ణమి రాత్రి వేటాడి తిరిగి వస్తుండగా, అడవి మైదానంలో రాజు ఒక దృశ్యం చూశాడు. గొల్ల కుటుంబాలు సమావేశమయ్యాయి — మట్టి దీపం, కొబ్బరాకుల పందిరి, మట్టి విగ్రహం, రవ్వ పానకం. పిల్లలు నవ్వుతున్నారు, పెద్దలు పాటలు పాడుతున్నారు. గొల్లవారు రాజు చూడడం గమనించి, రెండు చేతులతో పానకం తీసుకొచ్చి సమర్పించారు: "రాజా, సత్యనారాయణ స్వామి వ్రతం చేస్తున్నాం — ప్రసాదం స్వీకరించండి."',
    // P3 — king's internal pride, rides away (new split paragraph)
    'రాజు ఆ మట్టి పాత్ర చూశాడు. తన బంగారు పళ్ళెంలో తినే చేతులు. యుద్ధాలు గెలిచిన చేతులు ఆ గొల్లవారి చేతిలో ఉన్న మట్టి పాత్ర వైపు చాచడమా? ఏదో లోపల గట్టిగా వేడిగా కొట్టింది — అది అహంకారమా, లజ్జా అని తెలియదు. కృతజ్ఞతలు కూడా చెప్పకుండా, మాట కూడా మాట్లాడకుండా, రాజు గుర్రం తిప్పి నిరుత్తరంగా వెళ్ళిపోయాడు.',
    // P4 — that night, son falls ill (split from old P3)
    'ఆ రాత్రే రాజు ఇష్టమైన కుమారుడికి తీవ్రమైన జ్వరం వచ్చింది, ఒళ్ళు మండిపోసాగింది. తెల్లవారి మూడు కోటలు శత్రువుల వశమయ్యాయని వార్తలు వచ్చాయి. ముఖ్యమంత్రి అనారోగ్యంతో పడిపోయాడు. రాజు గుర్రాలు ఒక్కొక్కటి పారిపోయాయి. ఒక్క రాత్రిలో అన్నీ కుప్పకూలినట్లు అనిపించింది. రాజు నిలబడి చూశాడు — ఇది యాదృచ్ఛికమా, లేదా తాను ఆ అడవిలో చేసిన పొరపాటా?',
    // P5 — astrologer speaks (split from old P3)
    'రాజు వెంటనే రాజ జ్యోతిష్కుడిని పిలిపించాడు. ఆయన చాలా సేపు చుక్కలు పరిశీలించి చెప్పాడు: "మహారాజా, గ్రహస్థితి బాగుంది. ఈ కష్టం గ్రహాల వల్ల రాలేదు. నిన్న రాత్రి పౌర్ణమి నాడు మీరు ఒక పవిత్రమైన వ్రతాన్ని, ఆ ప్రసాదాన్ని తిరస్కరించారు — ఇది అందుండి వచ్చింది. ఆ పొరపాటు సరిదిద్దుకోవడం తప్ప మరో మార్గం లేదు."',
    // P6 — king returns to forest (was old P4)
    'రాజు మరుసటి రోజు ఉదయమే ఆ అడవి మైదానానికి వెళ్ళాడు. గొల్లవారి పూజ పోయింది, బూడిద మిగిలింది, పడిన మొగలి పూలు మిగిలాయి. రాజు గుర్రం దిగి, ఆ అడవి నేలలో మోకాళ్ళపై కూర్చున్నాడు, మొహం ఆనించి ఏడ్చాడు. తన అహంకారాన్ని అంగీకరించాడు. సమీపంలోని గొల్లవారి సహాయంతో రవ్వ, పూలు తెచ్చుకుని ఆ అడవి నేలలోనే వ్రతం చేశాడు.',
    // P7 — messengers arrive, restoration (was old P5)
    'వ్రతం పూర్తికాకుండానే మొదటి వార్తాహరుడు గుర్రంపై వచ్చాడు: కుమారుడి జ్వరం తగ్గిందని. రెండో వార్తాహరుడు వచ్చాడు: రెండు కోటలు తిరిగి వచ్చాయని. మూడో వార్తాహరుడు: మూడో కోట కూడా తిరిగొచ్చిందని. రాజు లేచాడు, తన బంగారు కిరీటం తీసి ఆ అడవి బూడిద దగ్గర ఉంచాడు. జీవితాంతం ప్రతి పౌర్ణమి వ్రతం చేస్తూ, గొల్లలను, రైతులను, సాదా ప్రజలను ప్రత్యేకంగా ఆహ్వానించి తన చేతులతో ప్రసాదం పెట్టాడు.',
  ],
};

async function run() {
  // ── 1. Update vratham title ───────────────────────────────────────────────
  const vRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'vrathams!A:Z',
  });
  const [vHeader, ...vRows] = vRes.data.values;
  const vSlugIdx = vHeader.indexOf('slug');
  const vTitleEnIdx = vHeader.indexOf('title_en');
  const vTitleTeIdx = vHeader.indexOf('title_te');
  const vTitleTaIdx = vHeader.indexOf('title_ta');
  const vTitleHiIdx = vHeader.indexOf('title_hi');

  const vRowIdx = vRows.findIndex(r => r[vSlugIdx] === 'satyanarayana-vratham');
  if (vRowIdx >= 0) {
    const sheetRow = vRowIdx + 2; // +1 for header, +1 for 1-based

    const updates = [
      { col: vTitleEnIdx, value: 'Satyanarayana Swamy Vratham' },
      { col: vTitleTeIdx, value: 'సత్యనారాయణ స్వామి వ్రతం' },
      { col: vTitleTaIdx, value: 'சத்யநாராயண சுவாமி விரதம்' },
      { col: vTitleHiIdx, value: 'सत्यनारायण स्वामी व्रत' },
    ];

    if (!WRITE) {
      console.log(`[DRY RUN] would update vratham title (row ${sheetRow}) to "Satyanarayana Swamy Vratham" in 4 languages`);
    } else {
      for (const { col, value } of updates) {
        const colLetter = String.fromCharCode(65 + col);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `vrathams!${colLetter}${sheetRow}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[value]] },
        });
      }
      console.log('✓ Updated vratham title to "Satyanarayana Swamy Vratham"');
    }
  }

  // ── 2. Replace Telugu story paragraphs ───────────────────────────────────
  const scRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'stories_content!A:E',
  });
  const [scHeader, ...scRows] = scRes.data.values;
  const slugIdx = scHeader.indexOf('story_slug');
  const langIdx = scHeader.indexOf('lang');
  const paraIdx = scHeader.indexOf('paragraph_num');
  const textIdx = scHeader.indexOf('text');

  // Collect row indices (1-based, including header) to delete
  const rowsToDelete = [];
  scRows.forEach((row, i) => {
    const slug = row[slugIdx];
    if (slug && slug.startsWith('satyanarayana-story-') && row[langIdx] === 'te') {
      rowsToDelete.push(i + 2); // +1 for header, +1 for 1-based
    }
  });

  // Append new Telugu paragraphs
  const newRows = [];
  for (const [slug, paras] of Object.entries(teluguStories)) {
    paras.forEach((text, i) => {
      newRows.push([slug, 'te', String(i + 1), '', text]);
    });
  }

  if (!WRITE) {
    console.log(`[DRY RUN] would delete ${rowsToDelete.length} old Telugu story row(s)`);
    console.log(`[DRY RUN] would append ${newRows.length} Telugu story paragraph(s)`);
    console.log('\nDry run only — no changes written. Re-run with --write to apply.');
    console.log('\nParagraph counts after fix:');
    for (const [slug, paras] of Object.entries(teluguStories)) {
      console.log(`  ${slug}: te=${paras.length}`);
    }
    return;
  }

  // Get sheet ID for stories_content
  const metaRes = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const scSheet = metaRes.data.sheets.find(s => s.properties.title === 'stories_content');
  const scSheetId = scSheet.properties.sheetId;

  // Delete rows in reverse order (to preserve row numbers)
  if (rowsToDelete.length > 0) {
    const deleteRequests = rowsToDelete.sort((a, b) => b - a).map(rowNum => ({
      deleteDimension: {
        range: {
          sheetId: scSheetId,
          dimension: 'ROWS',
          startIndex: rowNum - 1, // 0-based
          endIndex: rowNum,       // exclusive
        },
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: deleteRequests },
    });
    console.log(`✓ Deleted ${rowsToDelete.length} old Telugu story rows`);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'stories_content!A1',
    valueInputOption: 'RAW',
    requestBody: { values: newRows },
  });

  console.log(`✓ Added ${newRows.length} Telugu story paragraphs`);

  // Summary
  console.log('\nParagraph counts after fix:');
  for (const [slug, paras] of Object.entries(teluguStories)) {
    console.log(`  ${slug}: te=${paras.length}`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
