// Hand-authored replacement text for every row/field that the generic
// "epithet-list — salutations" transform can't handle safely (narrative
// phala-shruti section, cross-stanza sentence continuations, and a few
// oddly-phrased epithet rows). Keyed by stanza_number -> field -> new text.
// Only rows/fields that actually contained an em-dash are listed.

export const OVERRIDES = {
  1: {
    meaning_te: "త్రినేత్రుడు, చక్రధారి, సూర్యకాంతి, శేషనాగు గొడుగు నీడలో మరియు చంద్రుని వలె తెల్లగా ఉన్న లక్ష్మీనృసింహుని నేను ఆరాధిస్తాను.",
  },
  2: {
    meaning_te: "సంసారబంధాన్ని ఛేదించే జగద్గురువైన వేదాంతగోచర బ్రహ్మ నృసింహుని మేము ధ్యానిస్తాము.",
  },
  55: {
    meaning_ta: "அற்புத ஆமை, அற்புதமானவன், நமஸ்காரம் அற்புத சூரியனுக்கு; மாயையை கடந்தவன், மாயை, மஹா வீரன், இவர்களுக்கு நமஸ்காரம்.",
  },
  56: {
    meaning_en: "To the great blazer, the seed, the abode of brilliance, and the seeded; salutations to the tejas-formed Narasimha, the wonderful sun.",
  },
  57: {
    meaning_ta: "மஹா கோரை, திருப்தியுடையவன், நமஸ்காரம் பலன் தருபவனுக்கு; பசுக்களில் புகுந்தவன், மகிழ்ந்தவன், போஷிக்கப்பட்டவன், பரமேஷ்டி, இவர்களுக்கு நமஸ்காரம்.",
  },
  74: {
    meaning_ta: "அழகு, அரிவாள், நமஸ்காரம் ஒளிமயமானவனுக்கு; அடையாளம் அறிந்தவன், இலட்சம், அடையாளம், இவர்களுக்கு நமஸ்காரம்.",
  },
  83: {
    meaning_ta: "பயங்கர சுப சிம்மம், கலங்கிய கண் சிம்மம், முழங்கும் உயிர் சிம்மம், தூய்மையான அற்புத சிம்மம், இவர்களுக்கு மீண்டும் மீண்டும் நமஸ்காரம்.",
  },
  84: {
    meaning_ta: "காலத்தை வென்ற சிம்மம், கல்ப உண்டாக்கும் சிம்மம், விருப்பம் தரும் சிம்மம், உலகில் தனிச்சிம்மம், இவர்களுக்கு மீண்டும் மீண்டும் நமஸ்காரம்.",
  },
  87: {
    meaning_en: "The Rudras, Adityas, Vasus, Sadhyas, Vishvadevas, Maruts, the ancestors, Gandharvas, Yakshas, Asuras, and hosts of Siddhas all behold you with amazement.",
    meaning_te: "రుద్ర, ఆదిత్య, వసు, సాధ్య, విశ్వేదేవ, మరుత, ఊష్మప, గంధర్వ, యక్ష, అసుర మరియు సిద్ధగణాలు, ఇవన్నీ ఆశ్చర్యంతో మీను చూస్తున్నాయి.",
    meaning_ta: "ருத்திரர்கள், ஆதித்யர்கள், வசுக்கள், சாத்யர்கள், விஸ்வேதேவர்கள், மருத்துகள், பிதுர்கள், கந்தர்வர்கள், யக்ஷர்கள், அசுரர்கள், சித்தர்கள், இவர்கள் எல்லோரும் வியப்புடன் உன்னை காண்கின்றனர்.",
    meaning_hi: "रुद्र, आदित्य, वसु, साध्य, विश्वेदेव, मरुत, ऊष्मप, गन्धर्व, यक्ष, असुर और सिद्धगण, ये सभी आश्चर्यचकित होकर आपको देख रहे हैं।",
  },
  100: {
    meaning_en: "You are my way, you are my thought; you are my father, mother, teacher, and friend; you are my benefactor and my self-form, and without you there is no way for me.",
    meaning_te: "మీరు నా గతి, నా మతి; మీరు నా తండ్రి, తల్లి, గురువు మరియు సఖ; మీరు నా సుహృద మరియు ఆత్మరూప; మీ లేకుండా నాకు గతి లేదు.",
    meaning_ta: "நீ என் கதி, என் மதி; நீ என் தந்தை, தாய், குரு, நண்பன்; நீ என் நலன் விரும்பி, என் ஆத்ம வடிவம்; உன் இல்லாமல் எனக்கு கதி இல்லை.",
    meaning_hi: "आप मेरी गति, मेरी मति हैं; आप मेरे पिता, माता, गुरु और सखा हैं; आप मेरे सुहृद और आत्मरूप हैं; आपके बिना मेरी कोई गति नहीं।",
  },
  137: {
    meaning_ta: "மூல வாசி, நமஸ்காரம், நீல ஆடை அணிந்தவன், நமஸ்காரம்; மஞ்சள் ஆடை, ஆயுதம், சிவப்பு ஆடை அணிந்தவன், இவர்களுக்கு நமஸ்காரம்.",
  },
  141: {
    meaning_ta: "பித்தமுடையவன், போதையுடையவன், நமஸ்காரம் அசுரர் எதிரியே; சாரம் அறிந்தவன், சாரத்தின் தலைவன், சிவவாயற்ற நாவுடையவன், இவர்களுக்கும் நமஸ்காரம்.",
  },
  143: {
    meaning_ta: "மேல்நோக்கிய சிங்கம், சிங்கம், நமஸ்காரம் மேல்நோக்கிய தோள்களுக்கு; மேலோர் அழிப்பவன், சங்கு சக்கரம் தரிப்பவன், இவர்களுக்கு நமஸ்காரம்.",
  },
  156: {
    meaning_en: "Salutations to the knowledge-self, the knowledge, the world-lord, and the supreme self; salutations to the one-self, to you, and to the twelve-self.",
    meaning_ta: "ஞான ஆத்மா, ஞானம், உலக ஈஸ்வரன், பர ஆத்மா, இவர்களுக்கு நமஸ்காரம்; ஒரே ஆத்மா, நமஸ்காரம், பன்னிரண்டு ஆத்மா, நமஸ்காரம்.",
  },
  171: {
    meaning_en: "Seeing this extremely fierce and overwhelming form, difficult to overcome, all the gods, frightened, approached you.",
  },
  172: {
    meaning_en: "See these: the great lord Shiva, Brahma, me the lord of Shachi, the guardians of the directions, the twelve Adityas, the Rudras, the serpents, and the demons.",
    meaning_te: "వీరిని చూడండి: మహేశ, బ్రహ్మ, నన్ను శచీపతిని, దిక్పాళులను, పన్నెండు ఆదిత్యులను, రుద్రులను, నాగులను మరియు రాక్షసులను.",
    meaning_ta: "இவர்களை பாருங்கள்: மஹேசன், பிரம்மன், என்னை சாசியின் கணவனை, திக்குப் பாலகர்களை, பன்னிரண்டு ஆதித்யர்களை, ருத்திரர்களை, நாகர்களை, ராக்ஷசர்களை.",
    meaning_hi: "इन्हें देखो: महेश, ब्रह्मा, मुझ शचीपति को, दिक्पालों को, बारह आदित्यों, रुद्रों, नागों और राक्षसों को।",
  },
  177: {
    meaning_en: "Narasimha spoke, looking at all the best gods, who were trembling, terror-struck, and had come seeking refuge.",
    meaning_te: "నారసింహుడు అన్ని సురోత్తములను చూసి పలికాడు, కంపిత, భయసంవిగ్న, శరణాగతులైన వారిని.",
    meaning_ta: "நரசிம்மன் எல்லா தேவர்களிலும் சிறந்தோரை பார்த்து பேசினான், நடுங்கும், பயத்தால் கலைந்த, சரண் அடைந்தவர்களை.",
    meaning_hi: "नारसिंह ने उन सभी श्रेष्ठ देवताओं को देखकर बोले, जो कंपित, भयसंविग्न और शरण में आए हुए थे।",
  },
  178: {
    meaning_en: "O all you best gods headed by the Grandfather, hear my word and be freed from fever.",
    meaning_te: "హే పితామహ నేతృత్వంలో సర్వదేవవరులారా, నా వాక్యాన్ని వినండి మరియు నిర్జ్వరులు అవండి.",
    meaning_ta: "ஓ பிதாமஹரால் தலைமை தாங்கப்படும் எல்லா தேவர்களிலும் சிறந்தவர்களே, என் வார்த்தையை கேளுங்கள், காய்ச்சலற்று இருங்கள்.",
    meaning_hi: "हे पितामह के नेतृत्व में सभी श्रेष्ठ देवताओ, मेरे वचन को सुनो और निर्ज्वर होओ।",
  },
  179: {
    meaning_en: "Whatever is beneficial to you I will surely do at present. Whoever recites this thousand names of mine three times a day with purity,",
    meaning_te: "మీకు హితకరమైనది నేను ఇప్పుడు తప్పక చేస్తాను. ఈ నా నామసహస్రాన్ని మూడు సంధ్యాలలో పవిత్రులై పఠించే వారు,",
    meaning_ta: "உங்களுக்கு நன்மையானதை நான் இப்போது நிச்சயம் செய்வேன். என்னுடைய இந்த ஆயிரம் நாமங்களை மூன்று சந்திகளிலும் தூய்மையுடன் பாராயணம் செய்பவர்,",
    meaning_hi: "जो आपके लिए हितकर है वह मैं अभी अवश्य करूंगा। जो मेरे इस नामसहस्र को तीनों संध्याओं में पवित्र होकर पढ़ता है,",
  },
  180: {
    meaning_en: "or listens to or causes others to listen, with devotion in worship, will obtain all wishes and live a hundred autumns.",
    meaning_te: "లేదా భక్తితో పూజలో వినే లేదా వినిపించే, వారు అన్ని కాముకతలు పొంది నూరు సంవత్సరాలు జీవిస్తారు.",
    meaning_ta: "அல்லது பக்தியுடன் வழிபாட்டில் கேட்கிறார் அல்லது கேட்கச் செய்கிறார், அவர்கள் எல்லா விருப்பங்களையும் பெற்று நூறு ஆண்டுகள் வாழ்வர்.",
    meaning_hi: "या भक्ति से पूजा के साथ सुनता या सुनाता है, वह सभी इच्छाओं को प्राप्त करता है और सौ वर्षों तक जीता है।",
  },
  184: {
    meaning_en: "Bhuta-vetala, Kushmanda, Pishacha, Brahma-rakshasas, Shakini, Dakini, Jyeshtha, Nili, and child-planetary afflictions,",
    meaning_te: "భూత-బేతాళ, కూష్మాండ, పిశాచ, బ్రహ్మరాక్షస, శాకిని, డాకిని, జ్యేష్ఠ, నీళి మరియు బాళగ్రహాది,",
    meaning_ta: "பூத வேதாளம், குஷ்மாண்டம், பிசாசு, பிரம்ம ராக்ஷசர், சாகினி, டாகினி, ஜ்யேஷ்டா, நீளி, குழந்தை கிரகங்கள்,",
    meaning_hi: "भूत-बेताल, कूष्माण्ड, पिशाच, ब्रह्मराक्षस, शाकिनी, डाकिनी, ज्येष्ठा, नीली और बालग्रहादि,",
  },
  185: {
    meaning_en: "Evil planetary influences, Yakshas, Rakshasas, serpents are destroyed; all the evening-time planetary afflictions, those called Chandala-planets,",
    meaning_te: "దుష్టగ్రహ, యక్ష, రాక్షస, పన్నగ నాశనమవుతాయి; సమస్త సంధ్యాగ్రహ మరియు చాండాళగ్రహ సంజ్ఞికలు,",
    meaning_ta: "துஷ்ட கிரகங்கள், யக்ஷர்கள், ராக்ஷசர்கள், பாம்புகள் அழிகின்றனர்; எல்லா சந்தி கிரகங்கள், சண்டாள கிரகங்கள் என்று அழைக்கப்படுபவை,",
    meaning_hi: "दुष्टग्रह, यक्ष, राक्षस, सर्प नष्ट होते हैं; समस्त संध्याग्रह और चाण्डालग्रह संज्ञक,",
  },
  186: {
    meaning_en: "All night-wandering planets flee far away. Abdominal disease, heart disease, colic, and epilepsy,",
    meaning_te: "అన్ని రాత్రిసంచారగ్రహాలు దూరంగా నాశనమవుతాయి. ఉదరరోగ, హృద్రోగ, శూళ మరియు అపస్మార,",
    meaning_ta: "இரவில் சுற்றும் எல்லா கிரகங்களும் தூரத்தில் அழிகின்றன. வயிற்று நோய், இதய நோய், சூலை, மூர்ச்சை நோய்,",
    meaning_hi: "सभी रात्रिचरग्रह दूर से नष्ट होते हैं। पेट का रोग, हृदयरोग, शूल और अपस्मार,",
  },
  187: {
    meaning_en: "single-day fever, two-day fever, four-day fever, and chronic fever; all mental and physical ailments, diseases, and their presiding deities,",
    meaning_te: "ఏకాహిక, ద్వ్యాహిక, చాతుర్ధిక మరియు జీర్ణ జ్వర; అన్ని ఆధి-వ్యాధి, రోగ మరియు రోగాధిదేవతలు,",
    meaning_ta: "ஒரு நாள் காய்ச்சல், இரண்டு நாள் காய்ச்சல், நான்கு நாள் காய்ச்சல், பழைய காய்ச்சல்; எல்லா மனநோய் உடல்நோய், வியாதிகள், அவற்றின் அதிதேவதைகள்,",
    meaning_hi: "एकाहिक, द्वाहिक, चातुर्धिक और जीर्ण ज्वर; सभी आधि-व्याधि, रोग और रोगाधिदेवताएं,",
  },
  188: {
    meaning_en: "All of them are quickly destroyed through meditation on Narasimha; kings become servants, enemies become friends.",
    meaning_te: "ఇవన్నీ నృసింహ స్మరణతో శీఘ్రంగా నాశనమవుతాయి; రాజులు దాసులవుతారు, శత్రువులు మిత్రులవుతారు.",
    meaning_ta: "இவை எல்லாம் நரசிம்மனை நினைத்ததால் விரைவில் அழிகின்றன; ராஜாக்கள் சேவகர்களாகின்றனர், எதிரிகள் நண்பர்களாகின்றனர்.",
    meaning_hi: "ये सभी नृसिंह के स्मरण से शीघ्र नष्ट होते हैं; राजा दास बन जाते हैं, शत्रु मित्र बन जाते हैं।",
  },
  192: {
    meaning_en: "Good sons, wealth, and grain, all these come about free from fever; through the grace of Narasimha all this is accomplished.",
    meaning_te: "సుపుత్ర, ధన, ధాన్యం, ఇవన్నీ నిర్జ్వరంగా కలుగుతాయి; నృసింహ ప్రసాదంతో ఇవన్నీ సిద్ధిస్తాయి.",
    meaning_ta: "நல் மகன்கள், செல்வம், தானியம், இவை எல்லாம் காய்ச்சலின்றி கிடைக்கும்; நரசிம்மனின் அருளால் இவை எல்லாம் நிறைவேறும்.",
    meaning_hi: "सुपुत्र, धन, धान्य, ये सभी निर्ज्वर होते हैं; नृसिंह के प्रसाद से यह सब प्राप्त होता है।",
  },
  193: {
    meaning_en: "In crossing water, on mountains and in forests, wandering even in the wilderness, on a difficult and dangerous path,",
    meaning_te: "జలసంతరణలో, పర్వత మరియు వనంలో, కఠిన స్థానంలో విచరిస్తున్న మనుష్యుడు, కష్టమైన మరియు విషమ మార్గంలో,",
    meaning_ta: "நீர் கடக்கும்போது, மலையிலும் காட்டிலும், கடினமான இடத்தில் சுற்றும் மனிதன், கடினமான ஆபத்தான பாதையில்,",
    meaning_hi: "जल पार करते समय, पर्वत और वन में, विकट स्थान में विचरण करते हुए मनुष्य, कठिन और विषम मार्ग में,",
  },
  194: {
    meaning_en: "Even on entering Kali's domain, one should not forget Narasimha. One who kills a Brahmin, kills cattle, kills a foetus, or violates the guru's bed,",
    meaning_te: "కలిలో ప్రవేశించినా నారసింహాన్ని మరువకుండా ఉండాలి. బ్రహ్మఘ్న, పశుఘ్న, భ్రూణహ, గురుతళ్పగ,",
    meaning_ta: "கலியில் நுழையும்போதும் நரசிம்மனை மறக்கக்கூடாது. பிராமணனை கொல்பவன், கால்நடைகளை கொல்பவன், கர்ப்பத்தை கொல்பவன், குரு மனைவியை அனுபவிப்பவன்,",
    meaning_hi: "कलि में प्रवेश करने पर भी नारसिंह को न भूले। ब्रह्महत्यारा, पशुहत्यारा, भ्रूणहत्यारा, गुरुपत्नीगामी,",
  },
  195: {
    meaning_en: "the ungrateful, the killer of women, is freed from all sins; the defiler of the Vedas, the reviler of parents,",
    meaning_te: "కృతఘ్న, స్త్రీవిఘాతక, సమస్త పాపాల నుండి విముక్తి పొందుతాడు; వేద దూషక, మాతాపితృ నిందక,",
    meaning_ta: "நன்றி கெட்டவன், பெண்ணை கொல்பவன், எல்லா பாவங்களிலிருந்தும் விடுபடுவான்; வேதம் கெடுப்பவன், பெற்றோரை நிந்திப்பவன்,",
    meaning_hi: "कृतघ्न, स्त्रीहन्ता, सभी पापों से मुक्त होता है; वेद दूषक, माता-पिता की निन्दक,",
  },
  196: {
    meaning_en: "the liar, the defiler of sacrifices, and the reviler of the world, by remembering Narasimha even once, is freed from all sins.",
    meaning_te: "అసత్యవాది, యజ్ఞ నిందక, లోక నిందక, ఒక్కసారి నృసింహ స్మరణతో సమస్త పాపాల నుండి విముక్తి పొందుతారు.",
    meaning_ta: "பொய்யன், யஜ்ஞம் நிந்திப்பவன், உலகை நிந்திப்பவன், ஒருமுறை நரசிம்மனை நினைப்பதால் எல்லா பாவங்களிலிருந்தும் விடுபடுவர்.",
    meaning_hi: "असत्यवादी, यज्ञ निन्दक, लोकनिन्दक, एक बार नृसिंह का स्मरण करने से सभी पापों से मुक्त होते हैं।",
  },
  198: {
    meaning_en: "Going, standing, sleeping, eating, waking, even laughing, one who always remembers 'Narasimha, Narasimha, Narasimha',",
    meaning_te: "వెళ్ళుతూ, నిలుచుంటూ, నిద్రిస్తూ, తింటూ, మేల్కొంటూ, నవ్వుతూ కూడా, సదా 'నృసింహ, నృసింహ, నృసింహ' అని స్మరించే వాడు,",
    meaning_ta: "செல்லும்போது, நிற்கும்போது, தூங்கும்போது, சாப்பிடும்போது, விழிக்கும்போது, சிரிக்கும்போதும், எப்போதும் 'நரசிம்ம, நரசிம்ம, நரசிம்ம' என்று நினைக்கும் ஒருவன்,",
    meaning_hi: "जाते हुए, खड़े होते हुए, सोते, खाते, जागते, हंसते हुए भी, जो सदा 'नृसिंह, नृसिंह, नृसिंह' का स्मरण करता है,",
  },
  199: {
    meaning_en: "Such a person is not touched by sins; they attain enjoyment and liberation. A woman attains auspiciousness, good fortune, and her natural beauty.",
    meaning_te: "అతడు పాపంతో లిప్తుడు కాడు; భోగ మరియు ముక్తి పొందుతాడు. స్త్రీ సుభగత్వ, సౌభాగ్య మరియు స్వరూపతలు పొందుతుంది.",
    meaning_ta: "அவர் பாவத்தால் பற்றப்படமாட்டார்; இன்பமும் மோக்ஷமும் அடைவார். பெண்ணோ சுபத்வம், நல்வாழ்வு, இயற்கை அழகு அடைவாள்.",
    meaning_hi: "वह पाप से लिप्त नहीं होता; भोग और मुक्ति पाता है। स्त्री सौभाग्य, शुभाग्य और स्वरूपता पाती है।",
  },
  201: {
    meaning_en: "The same merit that a person slowly obtains from circumambulating the earth is obtained by circumambulating the form of Narasimha.",
    meaning_te: "మనుష్యుడు భూమిప్రదక్షిణ వలన దీర్ఘకాలంలో పొందే ఫలమే నారసింహమూర్తి ప్రదక్షిణ వలన లభిస్తుంది.",
    meaning_ta: "ஒருவன் பூமி வலம் வருவதால் மெல்ல மெல்ல பெறும் அதே பலன், நரசிம்ம மூர்த்தி வலம் வருவதால் கிடைக்கும்.",
    meaning_hi: "मनुष्य जो फल पृथ्वी प्रदक्षिणा से धीरे-धीरे पाता है, वही फल नारसिंहमूर्ति प्रदक्षिणा से प्राप्त होता है।",
  },
  205: {
    meaning_en: "Out of fear of Hiranyakashipu, the lord of Shachi had fled; driven out from his heavenly kingdom for twenty-one eons,",
    meaning_te: "హిరణ్యకశిపు భయంతో శచీపతి పారిపోయాడు; తన స్వర్గరాజ్యం నుండి ఇరవైఒక్క యుగాలు వెళ్ళగొట్టబడ్డాడు,",
    meaning_ta: "ஹிரண்யகசிபுவின் பயத்தால் சாசியின் கணவன் ஓடிவிட்டான்; தன் சுவர்க ராஜ்யத்திலிருந்து இருபத்தொரு யுகங்கள் வெளியேற்றப்பட்டிருந்தான்,",
    meaning_hi: "हिरण्यकशिपु के भय से शचीपति भाग गए थे; अपने स्वर्गराज्य से इक्कीस युगों तक निकाले गए थे,",
  },
  206: {
    meaning_en: "After the demon was slain by Narasimha, he obtained the heavenly world. The guardians of the directions also properly obtained their own excellent places.",
    meaning_te: "దైత్యుడు నృసింహుడిచే వధింపబడిన తర్వాత ఆయన స్వర్గలోకాన్ని పొందాడు. దిక్పాళులు కూడా తమ తమ ఉత్తమ స్థానాలను సమ్యక్ పొందారు.",
    meaning_ta: "அசுரன் நரசிம்மனால் கொல்லப்பட்ட பின்னர், அவன் சுவர்க உலகை அடைந்தான். திக்குப் பாலகர்களும் தத்தம் உயர்ந்த இடங்களை சரியாக அடைந்தனர்.",
    meaning_hi: "दैत्य के नृसिंह द्वारा वध के बाद उन्होंने स्वर्गलोक प्राप्त किया। दिक्पाल भी अपने-अपने उत्तम स्थान को सम्यक् प्राप्त हुए।",
  },
  207: {
    meaning_en: "Then the mind of all beings turned toward dharma. Thus this thousand names of mine was composed of old by Brahma,",
    meaning_te: "అప్పుడు సమస్త ప్రజల మనస్సు ధర్మం వైపు అయింది. ఇలా నా ఈ నామసహస్రాన్ని బ్రహ్మ పూర్వకాలంలో రచించాడు,",
    meaning_ta: "பின்னர் எல்லா மக்களின் மனமும் தர்மத்தை நோக்கி திரும்பியது. இவ்வாறு என்னுடைய இந்த ஆயிரம் நாமங்களை பிரம்மன் முன்காலத்தில் இயற்றினான்,",
    meaning_hi: "तब सभी प्रजाओं का मन धर्म की ओर हो गया। इस प्रकार मेरे इस नामसहस्र को ब्रह्मा ने पूर्वकाल में रचा,",
  },
  208: {
    meaning_en: "The great-minded one taught his sons Sanaka and the others; they spoke it out of desire for the welfare of all the worlds,",
    meaning_te: "మహామతి సనకాది పుత్రులకు బోధించాడు; వారు సమస్త లోకహితాన్ని కోరి దాన్ని చెప్పారు,",
    meaning_ta: "மஹாமதியான அவன் சனகாதி மகன்களுக்கு போதித்தான்; அவர்கள் எல்லா உலகின் நலனை விரும்பி அதை கூறினர்,",
    meaning_hi: "महामति ने सनकादि पुत्रों को पढ़ाया; उन्होंने सभी लोकों के कल्याण की इच्छा से उसे बोला,",
  },
  209: {
    meaning_en: "to gods, sages, siddhas, yakshas, vidyadharas, serpents, gandharvas, and humans seeking results here and hereafter.",
    meaning_te: "దేవతలు, ఋషులు, సిద్ధులు, యక్షులు, విద్యాధరులు, నాగులు, గంధర్వులు మరియు ఇహపర ఫలేచ్ఛువులైన మనుష్యులకు.",
    meaning_ta: "தேவர்கள், ரிஷிகள், சித்தர்கள், யக்ஷர்கள், வித்யாதரர்கள், நாகர்கள், கந்தர்வர்கள், இம்மை மறுமை பலன் விரும்பும் மக்களுக்கு.",
    meaning_hi: "देवता, ऋषि, सिद्ध, यक्ष, विद्याधर, नाग, गन्धर्व और मनुष्यों को जो इहलोक और परलोक के फल चाहते हैं।",
  },
  210: {
    meaning_en: "Sanatkumara and the greatly intelligent Bharadvajas, whose minds became purified through the reading of this hymn, arrived.",
    meaning_te: "ఈ స్తోత్ర పఠనంతో మనస్సులు విశుద్ధమైన సనత్కుమార మరియు మహామతి భారద్వాజులు వచ్చారు.",
    meaning_ta: "இந்த துதியை பாராயணம் செய்வதால் மனம் தூய்மையாகிய சனத்குமாரர் மற்றும் மஹாமதியான பரத்வாஜர்கள் வந்தனர்.",
    meaning_hi: "सनत्कुमार और महामति भारद्वाज आए, जिनके मन इस स्तोत्र के पाठ से विशुद्ध हुए।",
  },
  217: {
    meaning_en: "Having worshipped and hymned the god Narasimha, the refuge of all beings and fond of devotees, and having made offerings with a steady mind,",
    meaning_te: "సర్వభూతాశ్రయ, భక్తవత్సళ భగవాన్ నృసింహుని పూజించి, స్తవం జపించి, హోమం చేసి, నిశ్చళ మనస్కుడై,",
    meaning_ta: "எல்லா உயிர்களின் அடைக்கலம், பக்தர்களை நேசிக்கும் பகவான் நரசிம்மனை வழிபட்டு, துதி ஜபித்து, ஹவனம் செய்து, நிலையான மனதுடன்,",
    meaning_hi: "सर्वभूताश्रय, भक्तवत्सल भगवान नृसिंह की पूजा करके, स्तव जपकर, हवन करके, निश्चलमन से,",
  },
  218: {
    meaning_en: "You will attain great accomplishment and all the desired supreme boons. This itself is the supreme dharma, this itself is the supreme tapas.",
    meaning_te: "మహతీ సిద్ధి మరియు అన్ని ఇష్ట పరమవరాలు పొందుతావు. ఇదే పరమ ధర్మం, ఇదే పరమ తపస్సు.",
    meaning_ta: "மஹத்தான சித்தியும் எல்லா விரும்பிய பரம வரங்களும் அடைவாய். இதுவே பரம தர்மம், இதுவே பரம தவம்.",
    meaning_hi: "महती सिद्धि और सभी इष्ट परमवर प्राप्त करोगे। यही परम धर्म है, यही परम तप है।",
  },
  222: {
    meaning_en: "Being the supreme, consisting of all mantras, the highest remover of the three fires of suffering, and the divine accomplisher of all purposes, what more do you wish to hear?",
    meaning_te: "సర్వమంత్రమయ, తాపత్రయోపశమన, దివ్య సర్వార్థసాధన, ఇంకేమి వినాలనుకుంటున్నారు?",
    meaning_ta: "எல்லா மந்திரங்களும் நிரம்பியது, மூன்று வகை ஆதாபங்களை போக்குவது, திவ்யமான எல்லா நோக்கங்களையும் சாதிப்பது, இன்னும் என்ன கேட்க விரும்புகிறாய்?",
    meaning_hi: "सर्वमन्त्रमय, तापत्रयोपशमन, दिव्य सर्वार्थसाधन, और क्या सुनना चाहते हो?",
  },
  223: {
    meaning_en: "With hair-tips like molten gold, with eyes blazing like fire, and with a touch sharper than the thunderbolt, salutations to you, the divine lion.",
    meaning_te: "కరిగిన బంగారం వంటి కేశాగ్రం, జ్వలిత అగ్ని వంటి కళ్ళు, వజ్రాధిక నఖ స్పర్శ, దివ్యసింహ నమస్తే.",
    meaning_ta: "உருகிய தங்கம் போன்ற கூந்தல் நுனிகள், எரிந்த தீ போன்ற கண்கள், வஜ்ரத்தை விட கூர்மையான நகங்களின் தொடு, திவ்ய சிங்கமே உனக்கு நமஸ்காரம்.",
    meaning_hi: "पिघले सोने जैसे बालों के सिरे, जलती आग जैसी आंखें, वज्र से भी तेज नाखूनों के स्पर्श वाले, दिव्यसिंह को नमस्ते।",
  },
  224: {
    meaning_en: "Narasimha preceded by Shri, O unconquerable one, twice in the middle: one who recites it twenty-one times is freed from great fear.",
    meaning_te: "శ్రీ-పూర్వక నృసింహ, హే దుర్జయ, రెండుసార్లు మధ్యలో, ఇరవైఒక్క సార్లు జపించే వారు మహాభయ నివారణ పొందుతారు.",
    meaning_ta: "ஸ்ரீ முன்னே நரசிம்ம, ஓ வெல்ல முடியாதவனே, நடுவில் இரண்டு முறை, இருபத்தொரு முறை ஜபிப்பவன் மஹா பயத்திலிருந்து விடுபடுவான்.",
    meaning_hi: "श्री-पूर्वक नृसिंह, हे दुर्जय, दो बार मध्य में, जो इक्कीस बार जपता है, महाभय से मुक्त होता है।",
  },
  228: {
    meaning_en: "I bow down to the destroyer of poverty, suffering, fear, and sorrow: the great remover of terrible fear, the Shri Narasimha mantra.",
    meaning_te: "దారిద్ర్య, దుఃఖ, భయ మరియు శోక వినాశమంత్రం, మహాభయహర శ్రీనరసింహమంత్రాన్ని నేను వందిస్తున్నాను.",
    meaning_ta: "வறுமை, துன்பம், பயம், சோகம் அழிக்கும் மந்திரம், மஹா பயம் போக்கும் ஸ்ரீ நரசிம்ம மந்திரத்தை வணங்குகிறேன்.",
  },
};
