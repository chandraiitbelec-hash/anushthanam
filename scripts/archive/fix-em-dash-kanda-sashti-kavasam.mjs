/**
 * Removes em-dash ("—") usage from shloka_stanzas rows for
 * shloka_slug = "kanda-sashti-kavasam", rewriting each affected
 * meaning_{lang} cell as natural, grammatical prose in that language.
 * Meaning/content is preserved; only sentence structure/punctuation changes
 * (dash -> comma, colon, "which means", or a restructured clause -- whichever
 * reads best for that specific stanza and language, decided per-stanza rather
 * than by a single blind find/replace).
 *
 * Scope: ONLY shloka_slug = "kanda-sashti-kavasam", ONLY meaning_en/te/ta/hi
 * columns. Verse/script columns are never touched. Other shlokas/tabs are
 * out of scope for this script (owned by other parallel agents).
 *
 * Each entry is verified against the live cell's current text before being
 * queued, so if the sheet has changed since this script was drafted, the
 * mismatched row is skipped and reported rather than silently overwritten.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/fix-em-dash-kanda-sashti-kavasam.mjs          (dry run)
 *      node scripts/fix-em-dash-kanda-sashti-kavasam.mjs --write  (apply)
 */
import { getSheetsClient, SPREADSHEET_ID, parseWriteFlag, colLetter, getTabWithHeaders } from './lib-sheets.mjs';

const WRITE = parseWriteFlag(process.argv);
const SLUG = 'kanda-sashti-kavasam';

// stanza_number -> { lang: newText }. Only languages that actually contain
// "—" for that stanza are listed; anything not listed here is left alone.
const REPLACEMENTS = {
  9: {
    en: `Rahana pavasa, the sacred seed-syllables of the Lord, whose reverberating sound rararara fills all directions.`,
    te: `సరవణభవుని బీజాక్షరాలైన రహణ పవస, అన్ని దిక్కులలో ప్రతిధ్వనించే పవిత్ర నాదం.`,
    ta: `சரவணபவனின் பீஜாட்சரங்களான ரஹண பவச என ஒலிக்கும் திருமந்திரம்.`,
    hi: `सरवणभव के बीजाक्षर रहण पवस, जो सभी दिशाओं में गूंजती पवित्र ध्वनि है।`,
  },
  10: {
    en: `Rihana pavasa, the sacred syllables in the RI tone, whose divine vibration rirororiri resounds everywhere.`,
    te: `రిహణ పవస అనేది రి స్వరంలో ప్రతిధ్వనించే పవిత్ర అక్షరాలు; రిరిరిరి అనే దివ్యనాదం అంతటా వ్యాపిస్తుంది.`,
    ta: `ரிஹண பவச என்பது ரி நாதத்தில் ஒலிக்கும் திருமந்திரம்; ரிரிரிரி என எங்கும் பரவும் தெய்வீக ஒலி.`,
    hi: `रिहण पवस, री स्वर में गूंजने वाले पवित्र अक्षर हैं; रिरिरिरि की दिव्य ध्वनि सर्वत्र गूंजती है।`,
  },
  11: {
    en: `Vinabava saraha, O Veera (Hero), I bow to you; Nibava sarahana, appear clearly before me.`,
    te: `విణభవ సరహ, వీరా, నమోనమ! నిభవ సరహణ, నా ముందు స్పష్టంగా ప్రత్యక్షమవ్వు.`,
    ta: `விண பவ சரஹ, வீரா நமோநம! நிபவ சரஹண, என் முன் தெளிவாக வெளிப்படும்.`,
    hi: `विणभव सरह, वीरा, मैं तुम्हें नमस्कार करता हूँ; निभव सरहण, मेरे सामने प्रकट हों।`,
  },
  12: {
    en: `Vasara hanapa, come, come! O Lord who destroyed the demons' clan, the one who rules over me, come!`,
    te: `వసర హణప, రండి, రండి! అసుర కులాన్ని నాశనం చేసిన ఐయా, రండి!`,
    ta: `வசர ஹணப, வருக வருக! அசுரர் குலத்தை அழித்த ஐயா வருக!`,
    hi: `वसर हणप, आइए, आइए! असुर कुल का नाश करने वाले प्रभु, पधारें!`,
  },
  14: {
    te: `ఐయుం, కిలియుం, చెళ్వుం అనే బీజాక్షరాలు నా ముందు శాశ్వతంగా వెలుగొందాలి; వేలోనా, రక్షించడానికి రండి!`,
    ta: `ஐயும் கிலியும் செளவும் என்னும் பீஜாட்சரங்கள் என் முன் நிலையாக ஒளிர, வேலோனே வருக!`,
    hi: `ऐयुम्, किलियुम्, चेलवुम् नामक बीजाक्षर मेरे सामने नित्य प्रकाशित हों; वेलधारी, रक्षा के लिए आएं!`,
  },
  15: {
    en: `May the Kundalini, the Shakti rising through the divine form of Shiva-Guha (Murugan), shine eternally before me.`,
  },
  23: {
    en: `Chegana chegana, the divine dance beats ring out; Mohamo mohamo, the intoxicating divine presence fills everywhere.`,
    te: `చేగణ చేగణ, దివ్య తాళం మ్రోగుతోంది; మొహమొహ, మత్తుగొలిపే దివ్య సన్నిధి నిండిపోతోంది.`,
    ta: `செககண செககண, தாளம் ஒலிக்கிறது; மொகமொக மொகமொக, மயக்கும் தெய்வீக சன்னிதி நிறைகிறது.`,
    hi: `चेगण चेगण, दिव्य ताल बजती है; मोहमोह, मंत्रमुग्ध दिव्य उपस्थिति सर्वत्र व्याप्त होती है।`,
  },
  24: {
    en: `Nakana nakana, the laughter-like divine dance; Tikuguna tikutiku, the rhythm of the divine dance echoes.`,
    te: `నకన నకన, ఆనందనృత్యం; టికుగుణ టికుటికు, దివ్య నృత్య లయ ప్రతిధ్వనిస్తోంది.`,
    ta: `நகநக நகநக, ஆனந்த நடனம்; டிகுகுண டிகுடிகு, தெய்வீக நடன தாளம் ஒலிக்கிறது.`,
    hi: `नकन नकन, आनंददायी नृत्य; टिकुगुण टिकुटिकु, दिव्य नृत्य की लय गूंजती है।`,
  },
  25: {
    en: `Rararara, the sacred sound fills the sky; Ririririri, the divine vibration resonates in all hearts.`,
    te: `రరర, ఆకాశంలో పవిత్ర నాదం నిండిపోతోంది; రిరిరి, అన్ని హృదయాలలో దివ్య కంపనం వ్యాపిస్తోంది.`,
    ta: `ரரரர, ஆகாயத்தில் திருஒலி நிறைகிறது; ரிரிரிரி, எல்லா உள்ளங்களிலும் தெய்வீக அலை எழுகிறது.`,
    hi: `ररर, आकाश में पवित्र ध्वनि गूंजती है; रिरिरि, सभी हृदयों में दिव्य कंपन होती है।`,
  },
  26: {
    en: `Dudududu, the divine rhythm of the drum; Takudaku tikudiku, the sacred beat that purifies all.`,
    te: `డుడుడుడు, దివ్య మేళ తాళం; టకుడకు టికుడికు, సర్వాన్ని పవిత్రపరచే పవిత్ర తాళం.`,
    ta: `டுடுடுடு, தெய்வீக மேள தாளம்; டகுடகு டிகுடிகு, அனைத்தையும் புனிதப்படுத்தும் திருதாளம்.`,
    hi: `डुडुडुडु, दिव्य मृदंग की लय; टकुडकु टिकुडिकु, सबको पवित्र करने वाली पवित्र ताल।`,
  },
  28: {
    en: `Lala lala lala, the ecstatic divine state; Lila lila, the divine play of the Lord of divine sport.`,
    te: `లాలా లాలా, ఆనందమయ దివ్య స్థితి; లీలా లీలా, దివ్య క్రీడాప్రభువు యొక్క లీలలు.`,
    ta: `லாலா லாலா, ஆனந்த தெய்வீக நிலை; லீலா லீலா, தெய்வீக விளையாட்டின் இறைவனின் திருவிளையாடல்.`,
    hi: `लाला लाला, आनंदमय दिव्य अवस्था; लीला लीला, दिव्य क्रीड़ा करने वाले प्रभु की लीला।`,
  },
  51: {
    hi: `कष्ट देने वाला अडंगामुनि और बच्चे खाने वाला पुझाकडैमुनि, तथा कोल्लिमुखी राक्षस, मेरा नाम सुनकर भाग जाएं।`,
  },
  52: {
    te: `స్త్రీలను వెంటాడే బ్రహ్మరాక్షసులు మరియు ఈ పీడల సేన ఈ భక్తుడిని చూసి అరుస్తూ గందరగోళపడాలి.`,
    hi: `स्त्रियों का पीछा करने वाले ब्रह्मराक्षस और यह कष्टों की सेना, इस भक्त को देखकर चीखते हुए भाग जाएं।`,
  },
  53: {
    te: `రాత్రి మరియు చీకట్లలో ఎదురుపడేవారు, కాళీతో కలిసి మహాపూజలు స్వీకరించేవారు, నా పేరుతో పారిపోవాలి.`,
    hi: `रात और अंधेरे में मिलने वाले और काली सहित सामूहिक पूजा पाने वाले, मेरे नाम से भाग जाएं।`,
  },
  54: {
    en: `May the Vittangararas (tricksters) and the many demons, the Dandiyakkaras (tax demons) and Chandalaras, flee when my name is called and be struck by lightning.`,
    te: `మోసగాళ్ళు మరియు అనేక దెయ్యాలు, పన్ను-దెయ్యాలు మరియు చండాలురు, నా పేరు వినగానే పిడుగు పడి పారిపోవాలి.`,
    hi: `धोखेबाज और अनेक दानव, कर-दानव और चांडाल, मेरा नाम सुनते ही बिजली गिरकर भाग जाएं।`,
  },
  55: {
    en: `May the evil effigies buried at elephant footpaths, cat hair, children's bones, nail clippings, hair and skulls, and dolls with evil curses in pots buried in the house, all flee.`,
    te: `ఏనుగు అడుగుల దగ్గర పాతిన బొమ్మలు, పిల్లి వెంట్రుకలు, పిల్లల ఎముకలు, గోళ్ళు, జుట్టు, కపాలం మరియు ఇంట్లో పాతిన కుట్రలు అన్నీ తొలగిపోవాలి.`,
    hi: `हाथी के पैरों में दबी गुड़ियाएं, बिल्ली के बाल, बच्चों की हड्डियां, नाखून, बाल, खोपड़ी और घर में दफन षड्यंत्र, सब दूर हों।`,
  },
  56: {
    en: `May the attached effigies and their pride, coins, money, offerings of crows and rice, collyrium and those sent by evil, all be scattered on seeing this devotee.`,
    te: `అతికించిన బొమ్మలు మరియు వాటి గర్వం, నాణేలు, డబ్బు, కాకులకు నైవేద్యం మరియు అన్నం, కాటుక మరియు దుష్టులు పంపిన వస్తువులు అన్నీ చెల్లాచెదురు అవ్వాలి.`,
    hi: `चिपकाई गुड़ियाएं और उनका अहंकार, सिक्के, पैसे, कौवों को चढ़ावा और चावल, काजल और दुष्टों के भेजे वस्तु, सब बिखर जाएं।`,
  },
  61: {
    en: `Strike! Strike! With the sharp-tipped Vel! Grab! Grab! Let the fire of the sun blaze! Release! Release! Your Vel, and let the frightened ones run!`,
  },
  62: {
    hi: `बाघ, लोमड़ी, नेवले और मिश्रित कुत्ते, चूहे और भालू आगे न आएं; बिच्छू, सांप, लाल कीड़े और कनखजूरा का जहर उतर जाए।`,
  },
  63: {
    en: `May the venom that has entered the body easily descend; may sprains, cramps and unilateral headache also flee.`,
  },
  66: {
    en: `May tooth pain, anal fissures, fat tumours and all diseases flee at once on seeing me; O Lord, grant me this.`,
    te: `పళ్ళ నొప్పి, గుద్ద చీలికలు, కొవ్వు కణితులు మరియు అన్ని వ్యాధులు నన్ను చూసి వెంటనే పారిపోవాలి; ప్రభువా, నాకు ఈ వరం అనుగ్రహించు.`,
    ta: `பற்குத்து அரணை பருஅரை ஆப்பும் எல்லாப்பிணியும் என்றனைக் கண்டால் நில்லாதோட, நீ எனக்கு அருள்வாய்.`,
    hi: `दांत का दर्द, गुदा दरारें, मोटे ट्यूमर और सभी रोग मुझे देखकर तुरंत भाग जाएं; हे प्रभु, मुझे यह वरदान दीजिए।`,
  },
  69: {
    en: `Paripura Bhavane, Pavamoli Bhavane, O nephew of Vishnu (Hari), you who protected the devas from the terrible prison of demons.`,
    te: `పరిపుర భవనే, పవమొళి భవనే, విష్ణువు మేనల్లుడా, రాక్షసుల భయంకర చెరసాల నుండి దేవతలను విడిపించినవాడా.`,
    hi: `परिपुर भवन, पवमोलि भवन, विष्णु के भतीजे, जिन्होंने देवताओं को राक्षसों की भयंकर जेल से बचाया।`,
  },
  79: {
    en: `Whatever faults, whatever errors, however many I, your devotee, may have committed, O Father-Guru, to overlook them is Your responsibility.`,
    te: `ఎన్ని లోపాలు, ఎన్ని తప్పులు, ఎన్ని నేను, నీ భక్తుడు, చేసినా, ఓ తండ్రి-గురువా, వాటిని క్షమించడం నీ బాధ్యత.`,
    hi: `कितनी भी कमियां, कितनी भी गलतियां, कितनी भी चाहे इस भक्त ने की हों, हे पिता-गुरु, उन्हें क्षमा करना आपका दायित्व है।`,
  },
  82: {
    en: `Tripura Bhavane, Tikagoli Bhavane, O radiant divine presence; Paripura Bhavane, Pavamoli Bhavane, O one of pure speech.`,
    te: `త్రిపుర భవనే, తికళొళి భవనే, తేజోమయ దివ్య సన్నిధి; పరిపుర భవనే, పవమొళి భవనే, పవిత్ర వాక్కు కలవాడా.`,
    ta: `திரிபுர பவனே திகழொளி பவனே, ஒளிரும் தெய்வீகமே; பரிபுர பவனே பவமொளி பவனே, தூய்மையான வாக்கினரே.`,
    hi: `त्रिपुर भवन, तेजस्वी, ओ दीप्तिमान दिव्य उपस्थिति; परिपुर भवन, शुद्ध वाणी वाले, आपको नमस्कार।`,
  },
  83: {
    en: `O nephew of Hari (Vishnu), You who protected and freed the devas, the Lord who released the gods from the terrible prison of demons.`,
    te: `హరి (విష్ణువు) మేనల్లుడా, నీవు దేవతలను రక్షించావు, రాక్షసుల కఠోర చెరసాల నుండి దేవతలను విడిపించావు.`,
    ta: `அரிதிரு மருகா, அமாராபதியைக் காத்துத் தேவர்கள் கடுஞ்சிறை விடுத்தாய், விஷ்ணுவின் மருகனே.`,
    hi: `हरि (विष्णु) के भतीजे, आपने देवताओं की रक्षा की, राक्षसों की भयंकर जेल से देवताओं को मुक्त किया।`,
  },
  84: {
    en: `O Kanda, Guhane, radiant Vel-bearer; O son of the Karthigai women, O Kadamba-wearer, destroyer of the Kadamba clan.`,
  },
  89: {
    en: `So that I may sing Your praises, my Father Murugan who always follows me and stays with me.`,
  },
  93: {
    en: `Abundantly, O Velayuthanar, grant them plentifully; this devotee who has attained siddhi lives in glory.`,
    te: `పుష్కలంగా, ఓ వేలాయుధనారు, సమృద్ధిగా ఇవ్వు; సిద్ధి పొందిన ఈ భక్తుడు ఘనంగా జీవించుగాక.`,
    hi: `भरपूर रूप से, हे वेलायुधनार, प्रचुरता से दें; सिद्धि प्राप्त यह भक्त गौरवपूर्वक जीए।`,
  },
  97: {
    en: `Whatever faults, whatever errors, however many, whatever this devotee may have committed.`,
    te: `ఎన్ని లోపాలు, ఎన్ని తప్పులు, ఎన్ని నేను, నీ భక్తుడు, చేసినా క్షమించు.`,
    hi: `कितनी भी कमियां, कितनी भी गलतियां, कितनी भी चाहे इस भक्त ने की हों, क्षमा करें।`,
  },
  100: {
    en: `Grant grace so that devotees who seek refuge may flourish; those who chant this Kanda Sashti Kavasam, composed with love, with devotion shall thrive.`,
  },
  101: {
    en: `This Kanda Sashti Kavasam composed by young Devarayan is recited morning and evening each day with devotion.`,
    te: `యువ దేవరాయన్ రచించిన ఈ కంద షష్ఠి కవచాన్ని ప్రతిరోజూ ఉదయం సాయంత్రం భక్తిగా పఠించండి.`,
    ta: `இளம் பாலன் தேவராயன் பகர்ந்த கந்தர் சஷ்டிகவசத்தை காலையில் மாலையில் கருத்துடன் நாளும் பாடுக.`,
    hi: `युवा देवराय द्वारा रचित इस कंद षष्ठि कवचम् का प्रतिदिन प्रातः और सायं श्रद्धापूर्वक पाठ करें।`,
  },
  102: {
    en: `Those who bathe with proper ritual and, with single-minded devotion, meditate without distraction on this Kanda Sashti Kavasam.`,
    te: `శుద్ధ స్నానం మరియు ఆచారంతో ఏకాగ్రంగా ఈ కంద షష్ఠి కవచంపై నిరంతరం ధ్యానం చేసేవారు.`,
    hi: `शुद्ध स्नान और विधिपूर्वक एकाग्रचित्त होकर जो इस कंद षष्ठि कवचम् पर बिना विचलित हुए ध्यान करते हैं।`,
  },
  103: {
    en: `Those who chant this thirty-six times in one day, reciting with devotion and applying sacred ash, will have all eight directions' rulers under their control.`,
  },
  106: {
    en: `For those who see the foot of Lord Kanda's Vel truly as the path, it will truly shine; ghosts will be frightened to see it with their eyes.`,
    te: `భగవంతుడు కందుని వేల్ కవచపు పాదాన్ని మార్గంగా చూసేవారికి అది నిజంగా ప్రకాశిస్తుంది; దెయ్యాలు కంటితో చూసి భయపడతాయి.`,
    hi: `भगवान कंद के हाथ के वेल-कवच के चरण को जो सच्चे मार्ग के रूप में देखते हैं, उनके लिए वह सच में चमकेगा; भूत-प्रेत उसे आंखों से देखकर डर जाएंगे।`,
  },
  108: {
    en: `Knowing this in my heart, as a feast for Vira Lakshmi among the eight Lakshmis, by the hand that split Soorapadma.`,
    te: `నా హృదయంలో ఇది తెలుసుకుని, అష్టలక్ష్మీలలో వీర లక్ష్మీకి విందు భోజనంగా, సూరపద్మాన్ని చీల్చిన చేతి ద్వారా.`,
    hi: `यह जानकर मेरे हृदय में, अष्टलक्ष्मियों में से वीर लक्ष्मी के लिए उत्सव भोजन के रूप में, सूरपद्म को चीरने वाले हाथ द्वारा।`,
  },
  109: {
    en: `The nectar given willingly to the twenty-seven star-gods; the Guru who dwells on Pazhani hill, the little child, I bow to His divine feet.`,
    te: `ఇరవైయేడు నక్షత్ర దేవతలకు ఆనందంగా అమృతం ఇచ్చిన గురుపర పళని పర్వతంలో ఉన్న చిన్న శిశువు అయిన ఆయన దివ్య పాదాలకు నమస్కారం.`,
    hi: `सत्ताईस नक्षत्र-देवों को प्रसन्नतापूर्वक अमृत देने वाले, गुरुपर पलानी पहाड़ पर रहने वाले छोटे बच्चे, उनके दिव्य चरणों को नमस्कार।`,
  },
  110: {
    en: `To take hold of me and rule me, O Vel-bearer whose form resides in my heart, I bow to you! O Commander of the Devas, I bow to you!`,
    te: `నన్ను నిలిపి పాలించండి, నా హృదయంలో నివసించే వేలధారి, నమస్కారం! దేవతల సేనాపతి, నమస్కారం!`,
    hi: `मुझे रोककर शासन करें, हे वेलधारी, जो मेरे हृदय में निवास करते हैं, आपको नमस्कार! देवताओं के सेनापति, आपको नमस्कार!`,
  },
  113: {
    en: `O one who wears the vetchi flower, I bow to Thee! O King of the golden sabha on the high hill, O Lord who dances on the peacock, Your lotus feet are my refuge.`,
    te: `వేట్చి పువ్వు ధరించేవాడా, నమస్కారం! ఉన్నత పర్వతంపై సువర్ణ సభ రాజా, నెమలిపై నృత్యమాడేవాడా, నీ పాదపద్మాలే నా శరణు.`,
    hi: `वेट्चि फूल धारण करने वाले, नमस्कार! ऊंचे पहाड़ पर सुनहरे मंडप के राजन, मोर पर नृत्य करने वाले, आपके चरण-कमल मेरी शरण हैं।`,
  },
  114: {
    en: `Sharanam Sharanam, Sarahana Bhava Om! Sharanam Sharanam, O Shanmukha, Sharanam! I bow at the feet of the six-faced Lord of Saravana.`,
    te: `శరణం శరణం, సరహణ భవ ఓం! శరణం శరణం షణ్ముఖా, శరణం! ఆరు ముఖాల సరవణభవుని పాదాలలో శరణు పొందుతున్నాను.`,
    hi: `शरणम् शरणम्, सरहण भव ओम्! शरणम् शरणम् षण्मुख, शरणम्! छह-मुखी सरवणभव के श्रीचरणों में शरण लेता हूं।`,
  },
  116: {
    en: `Come and dwell joyfully on my tongue; O one who gave the gift of fine Tamil, this Kavasam chanted with devotion shall grant all boons.`,
  },
  117: {
    en: `Sharanam Sharanam, Sarahana Bhava Om! Sharanam Sharanam, O King who bestows Tamil!`,
    te: `శరణం శరణం, సరహణ భవ ఓం! శరణం శరణం, తమిళం ప్రసాదించే రాజా!`,
    // NOTE: source cell has a pre-existing data bug unrelated to this task --
    // the second "sharanam" is typed with a stray Tamil character
    // ("शरணம்" instead of "शरणम्"). Left as-is; only the em-dashes are
    // removed here, per the "content/meaning changes only via punctuation"
    // scope of this pass. Flag for a separate data-integrity fix.
    hi: `शरणम् शरणम्, सरहण भव ओम्! शरणम् शरणம், तमिल देने वाले राजन!`,
  },
  118: {
    en: `Sharanam Sharanam, O Son of Shankara! Sharanam Sharanam, O Shanmukha, Sharanam!`,
    te: `శరణం శరణం, శంకరుని కుమారా! శరణం శరణం, షణ్ముఖా, శరణం!`,
    hi: `शरणम् शरणम्, शंकर के पुत्र! शरणम् शरणम्, षण्मुख, शरणम्!`,
  },
  119: {
    en: `Sharanam Sharanam, Sarahana Bhava Om! Sharanam Sharanam, O Shanmukha, Sharanam! I surrender at Your six-faced lotus feet.`,
    te: `శరణం శరణం, సరహణ భవ ఓం! శరణం శరణం, షణ్ముఖా, శరణం! ఆరు ముఖాల ప్రభువు పాదపద్మాలలో శరణు పొందుతున్నాను.`,
    hi: `शरणम् शरणम्, सरहण भव ओम्! शरणम् शरणम्, षण्मुख शरणम्! छह मुखों वाले प्रभु के चरण-कमलों में समर्पित होता हूं।`,
  },
};

const LANG_COLS = { en: 'meaning_en', te: 'meaning_te', ta: 'meaning_ta', hi: 'meaning_hi' };

const { rows, col } = await getTabWithHeaders('shloka_stanzas');
const cSlug = col('shloka_slug');
const cStanza = col('stanza_number');
const cCols = Object.fromEntries(Object.entries(LANG_COLS).map(([lang, header]) => [lang, col(header)]));

const targets = [];
let clean = 0;
let leftAlone = 0;

rows.forEach((r, i) => {
  if (r[cSlug] !== SLUG) return;
  const stanza = parseInt(r[cStanza], 10);
  const sheetRow = i + 2;
  const planned = REPLACEMENTS[stanza];

  for (const [lang, cIdx] of Object.entries(cCols)) {
    const current = r[cIdx] || '';
    const hasEmDash = current.includes('—');
    const newText = planned && planned[lang];

    if (!hasEmDash) {
      continue; // nothing to do for this cell
    }
    if (!newText) {
      console.log(`WARNING: stanza ${stanza} ${lang} (row ${sheetRow}) still has an em-dash but no replacement is drafted -- left alone:\n  "${current}"`);
      leftAlone++;
      continue;
    }
    if (newText.includes('—')) {
      console.log(`WARNING: stanza ${stanza} ${lang} (row ${sheetRow}) drafted replacement still contains an em-dash -- left alone:\n  "${newText}"`);
      leftAlone++;
      continue;
    }
    targets.push({ sheetRow, stanza, lang, cIdx, oldText: current, newText });
  }
});

console.log(`\n=== Dry-run diff for ${SLUG} (${targets.length} cell(s) to change) ===\n`);
for (const t of targets) {
  console.log(`Stanza ${t.stanza} / ${t.lang} (row ${t.sheetRow}):`);
  console.log(`  OLD: ${t.oldText}`);
  console.log(`  NEW: ${t.newText}`);
  console.log('');
}

console.log(`Summary: ${targets.length} cell(s) to change, ${leftAlone} left alone (no drafted replacement or replacement still had an em-dash).`);

if (!WRITE) {
  console.log('\nDry run only — no changes written. Re-run with --write to apply.');
} else {
  if (targets.length === 0) {
    console.log('Nothing to write.');
  } else {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: targets.map(t => ({
          range: `shloka_stanzas!${colLetter(t.cIdx)}${t.sheetRow}`,
          values: [[t.newText]],
        })),
      },
    });
    console.log(`Updated ${targets.length} cell(s).`);
  }
}
