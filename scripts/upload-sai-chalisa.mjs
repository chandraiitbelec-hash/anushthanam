/**
 * Uploads Sai Chalisa (attributed to the devotee-poet Kashiram, a devotional
 * ballad about Sai Baba of Shirdi) to shloka_stanzas. No user-supplied
 * source text -- sourced from the web since this is a modern composition,
 * not a classical Sanskrit/Awadhi text.
 *
 * SOURCING: the opening line "पहले साई के चरणों में, अपना शीश नमाऊं मैं"
 * was independently confirmed as THE single dominant, most widely
 * republished "Sai Chalisa" across many unrelated sites (saichalisa.in,
 * dharmsaar.com, hindibhajan.in, bhajantimes.com, bhagwatgeeta.co.in,
 * bharatdiscovery.org, kabirlyrics.com) -- there is no evidence of a
 * different, shorter "classical-shaped" Sai Chalisa in real circulation;
 * the "40 verses" in this site's own brief_intro appears to be generic
 * chalisa-genre boilerplate rather than a verified fact about this specific
 * text. The primary source used for the actual transcription is a scanned
 * PDF booklet on archive.org ("Sai Chalisa", New Standard Publications,
 * Delhi -- https://archive.org/details/sai-chalisa), read directly page by
 * page; its opening ~20 lines were independently cross-checked against
 * live web search snippets from several of the sites above and matched
 * with only cosmetic spelling variance (मैं/मे, बाबा/बाबाजी etc.), giving
 * confidence in the rest of the booklet's text as a single coherent,
 * professionally-typeset published source.
 *
 * STRUCTURE -- genuinely does not match the declared stanza_count of 42,
 * and is not forced to. This is NOT a classical doha+chaupai chalisa at
 * all: there is no separate doha meter anywhere in the text -- it is one
 * continuous narrative ballad, in the same loose rhyming-couplet form
 * throughout, telling the story of how Sai Baba came to Shirdi and of
 * Kashiram's own experience of him. Per the labeling requirement, since no
 * doha exists, every row is labeled "Chaupai N" -- there is no "Doha
 * (Opening)" or "Doha (Closing)" row.
 *
 * The source PDF carries its own internal progress markers (॥१०॥, ॥२०॥,
 * ... ॥१००॥) roughly every 10 couplets, but they do not land on a clean
 * "couplet N ends at line 2N" position throughout -- this is a folk
 * narrative composition, not strict classical meter, and it is not
 * possible to reconstruct the typesetter's *exact* original stanza
 * boundaries with confidence from OCR'd text alone. Rather than guess at
 * that, every one of the 197 verified lines was grouped mechanically into
 * sequential two-line stanzas in reading order (line 1-2, 3-4, ...), which
 * is correct for the overwhelming majority of the text and only an
 * approximation at a small number of boundaries; the final, 197th line has
 * no pair and stands alone as the closing stanza. This yields 99 stanzas
 * total -- verified, complete, nothing dropped or padded, but more than
 * double the declared stanza_count of 42. This mismatch is flagged here
 * exactly as the task instructions require, rather than forced.
 * stanza_number in the sheet is therefore purely this script's own
 * sequential row index (1-99), not any claim about the source's original
 * internal numbering.
 *
 * IAST note: this is plain modern Hindi (not even Awadhi), so schwa
 * deletion is even more pervasive than in upload-hanuman-chalisa.mjs or
 * upload-shiv-chalisa.mjs. An informal published English transliteration
 * of this exact text (hindunidhi.com) was checked as a calibration source
 * and confirmed aggressive word-final schwa deletion is the expected,
 * natural convention here ("Charno" not "Charanom", "Bhagvan" not
 * "Bhagavana", "Hain" not "Hamti", etc.) -- unlike the Hanuman/Shiv Chalisa
 * scripts, which found the calibration evidence pointed the other way and
 * only applied deletion to a small explicit word list. Given that, this
 * script applies a blanket rule: drop the bare word-final "a" after a
 * single consonant, throughout, on top of Sanscript's direct
 * transliteration and this site's standing e->e-macron / o->o-macron
 * convention. Only WORD-FINAL schwa is touched (not medial schwa, which
 * would require real syllable-structure analysis to do correctly) -- this
 * is a deliberate scope decision, not an oversight, and produces IAST a
 * little more formal than the most colloquial possible rendering (e.g.
 * "bhagavān" rather than "bhagvān") but far closer to actual pronunciation
 * than Sanskrit-style full retention. The candrabindu and nukta fixes from
 * upload-hanuman-chalisa.mjs are carried over defensively.
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Devanagari, matching the approach used for every prior
 * upload this session.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-sai-chalisa.mjs          (dry run)
 *      node scripts/upload-sai-chalisa.mjs --write  (apply)
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
const SLUG = 'sai-chalisa';

const CHAUPAIS = [
  { padas: ['पहले साई के चरणों में, अपना शीश नमाऊं मैं', 'कैसे शिरडी साई आए, सारा हाल सुनाऊं मैं'],
    meaning: 'First, I bow my head at the feet of Sai; I shall tell the whole story of how Sai came to Shirdi.' },
  { padas: ['कौन है माता, पिता कौन है, ये न किसी ने भी जाना', 'कहां जन्म साई ने धारा, प्रश्न पहेली रहा बना'],
    meaning: 'Who was his mother, who was his father -- no one ever knew; where Sai took birth remained an unsolved riddle.' },
  { padas: ['कोई कहे अयोध्या के, ये रामचंद्र भगवान हैं', 'कोई कहता साई बाबा, पवन पुत्र हनुमान हैं'],
    meaning: 'Some say he is Lord Ramachandra of Ayodhya; some say Sai Baba is Hanuman, son of the Wind.' },
  { padas: ['कोई कहता मंगल मूर्ति, श्री गजानंद हैं साई', 'कोई कहता गोकुल मोहन, देवकी नन्दन हैं साई'],
    meaning: "Some say Sai is the auspicious form of Shri Ganesha; some say he is Gokul's enchanter, the son of Devaki." },
  { padas: ['शंकर समझे भक्त कई तो, बाबा को भजते रहते', 'कोई कह अवतार दत्त का, पूजा साई की करते'],
    meaning: 'Many devotees take him for Shankara and worship Baba as such; others call him an incarnation of Dattatreya and worship Sai accordingly.' },
  { padas: ['कुछ भी मानो उनको तुम, पर साई हैं सच्चे भगवान', 'बड़े दयालु दीनबन्धु, कितनों को दिया जीवन दान'],
    meaning: 'Whatever you believe him to be, Sai is truly God -- deeply compassionate, friend of the poor, who granted the gift of life to so many.' },
  { padas: ['कई वर्ष पहले की घटना, तुम्हें सुनाऊंगा मैं बात', 'किसी भाग्यशाली की, शिरडी में आई थी बारात'],
    meaning: 'I shall tell you of an event from many years ago: a wedding procession of a fortunate family once came to Shirdi.' },
  { padas: ['आया साथ उसी के था, बालक एक बहुत सुन्दर', 'आया, आकर वहीं बस गया, पावन शिरडी किया नगर'],
    meaning: 'With that procession came a very beautiful young boy, who arrived and settled right there, making holy Shirdi his home.' },
  { padas: ['कई दिनों तक भटकता, भिक्षा माँग उसने दर-दर', 'और दिखाई ऐसी लीला, जग में जो हो गई अमर'],
    meaning: 'For many days he wandered, begging for alms door to door, and showed such a divine play that it became immortal in the world.' },
  { padas: ['जैसे-जैसे अमर उमर बढ़ी, बढ़ती ही वैसे गई शान', 'घर-घर होने लगा नगर में, साई बाबा का गुणगान'],
    meaning: "As the years of this immortal one advanced, so did his glory grow; in every home across the town, Sai Baba's praises began to be sung." },
  { padas: ['दिग्-दिगन्त में लगा गूंजने, फिर तो साईंजी का नाम', 'दीन-दुखी की रक्षा करना, यही रहा बाबा का काम'],
    meaning: "The name of Sai then began to resound to every horizon; protecting the poor and the suffering remained Baba's constant work." },
  { padas: ['बाबा के चरणों में जाकर, जो कहता मैं हूं निर्धन', 'दया उसी पर होती उनकी, खुल जाते दुःख के बंधन'],
    meaning: "Whoever went to Baba's feet and said, I am destitute, received his compassion, and the bonds of their sorrow were loosened." },
  { padas: ['कभी किसी ने मांगी भिक्षा, दो बाबा मुझको संतान', 'एवं अस्तु तब कहकर साई, देते थे उसको वरदान'],
    meaning: 'Once someone begged, Baba, grant me a child; saying so be it, Sai would grant that person the boon.' },
  { padas: ['स्वयं दुःखी बाबा हो जाते, दीन-दुःखी जन का लख हाल', 'अन्तःकरण श्री साई का, सागर जैसा रहा विशाल'],
    meaning: 'Baba himself would become pained on seeing the plight of the poor and suffering; the inner heart of Shri Sai remained as vast as the ocean.' },
  { padas: ['भक्त एक मद्रासी आया, घर का बहुत बड़ा धनवान', 'माल खजाना बेहद उसका, केवल नहीं रही संतान'],
    meaning: 'A devotee from Madras once came, a man of very great wealth; he had immense riches and treasure, but no child of his own.' },
  { padas: ['लगा मनाने साईनाथ को, बाबा मुझ पर दया करो', 'झंझा से झंकृत नैया को, तुम्हीं मेरी पार करो'],
    meaning: 'He began pleading with Sainath: Baba, have mercy on me; carry my storm-tossed boat safely across, only you can.' },
  { padas: ['कुलदीपक के बिना अंधेरा, छाया हुआ घर में मेरे', 'इसलिए आया हूँ बाबा, होकर शरणागत तेरे'],
    meaning: "Without an heir to light my family's lamp, darkness has fallen over my home; that is why, Baba, I have come, taking refuge at your feet." },
  { padas: ['कुलदीपक के अभाव में, व्यर्थ है दौलत की माया', 'आज भिखारी बनकर बाबा, शरण तुम्हारी मैं आया'],
    meaning: 'Without an heir, all the illusion of wealth is meaningless; today, Baba, I have come as a beggar seeking your refuge.' },
  { padas: ['दे दो मुझको पुत्र-दान, मैं ऋणी रहूंगा जीवन भर', 'और किसी की आशा न मुझको, सिर्फ भरोसा है तुम पर'],
    meaning: 'Grant me the gift of a son, and I shall remain indebted my whole life; I have no other hope, my only trust is in you.' },
  { padas: ['अनुनय-विनय बहुत की उसने, चरणों में धर के शीश', 'तब प्रसन्न होकर बाबा ने, दिया भक्त को यह आशीश'],
    meaning: "He pleaded and entreated at length, placing his head at Baba's feet; then, pleased, Baba gave this devotee his blessing." },
  { padas: ["'अल्ला भला करेगा तेरा' पुत्र जन्म हो तेरे घर", 'कृपा रहेगी तुझ पर उसकी, और तेरे उस बालक पर'],
    meaning: "'Allah will do you good' -- a son will be born in your house; his grace shall remain upon you and upon that child." },
  { padas: ['पुत्र रत्न दे मद्रासी को, धन्य किया उसका संसार', 'तन-मन से जो भजे उसी का, जग में होता है उद्धार'],
    meaning: "Giving the Madrasi devotee a jewel of a son, Baba blessed his whole household; whoever worships him with body and soul finds liberation in this world." },
  { padas: ['सांच को आंच नहीं है कोई, सदा झूठ की होती हार', 'मैं हूं सदा सहारे उसके, सदा रहूँगा उसका दास'],
    meaning: 'Truth is never harmed, falsehood is always defeated; I always rely on him, and shall forever remain his servant.' },
  { padas: ['साई जैसा प्रभु मिला है, इतनी ही कम है क्या आस', 'मेरा भी दिन था एक ऐसा, मिलती नहीं मुझे रोटी'],
    meaning: 'To have found a lord like Sai -- could any hope be too small before that; I too once had such days that I could not even find bread.' },
  { padas: ['तन पर कपड़ा दूर रहा था, शेष रही नन्हीं सी लंगोटी', 'सरिता सन्मुख होने पर भी, मैं प्यासा का प्यासा था'],
    meaning: 'Clothing was far from my body, only a small loincloth remained; even standing before a river, I remained thirsty and unsatisfied.' },
  { padas: ['दुर्दिन मेरा मेरे ऊपर, दावाग्नी बरसाता था', 'धरती के अतिरिक्त जगत में, मेरा कुछ अवलम्ब न था'],
    meaning: 'My hard days rained wildfire down upon me; besides the earth itself, I had no support in this world.' },
  { padas: ['बना भिखारी मैं दुनिया में, दर-दर ठोकर खाता था', 'ऐसे में एक मित्र मिला जो, परम भक्त साई का था'],
    meaning: 'Become a beggar in this world, I stumbled from door to door; in such a state I found a friend who was a great devotee of Sai.' },
  { padas: ['जंजालों से मुक्त मगर, जगती में वह भी मुझसा था', 'बाबा के दर्शन की खातिर, मिल दोनों ने किया विचार'],
    meaning: 'Free of worldly entanglements, yet in this world he too was much like me; for the sake of seeing Baba, the two of us decided together.' },
  { padas: ['साई जैसे दया मूर्ति के, दर्शन को हो गए तैयार', 'पावन शिरडी नगर में जाकर, देख मतवाली मूरति'],
    meaning: 'We made ourselves ready to behold Sai, the very image of compassion; going to the holy town of Shirdi, we beheld that captivating form.' },
  { padas: ['धन्य जन्म हो गया कि हमने, जब देखी साई की सूरति', 'जब से किए हैं दर्शन हमने, दुःख सारा काफूर हो गया'],
    meaning: 'Our birth became blessed the moment we saw the face of Sai; ever since we had that darshan, all our sorrow simply vanished.' },
  { padas: ['संकट सारे मिटै और, विपदाओं का अन्त हो गया', 'मान और सम्मान मिला, भिक्षा में हमको बाबा से'],
    meaning: 'All our troubles were erased and our misfortunes came to an end; we received honour and respect as alms from Baba himself.' },
  { padas: ['प्रतिबिम्बित हो उठे जगत में, हम साई की आभा से', 'बाबा ने सम्मान दिया है, मान दिया इस जीवन में'],
    meaning: "We came to shine in this world, reflecting Sai's own radiance; Baba has given us honour, given us dignity in this life." },
  { padas: ['इसका ही संबल ले मैं, हंसता जाऊंगा जीवन में', 'साई की लीला का मेरे, मन पर ऐसा असर हुआ'],
    meaning: "Taking this alone as my support, I shall go through life smiling; such was the effect Sai's divine play had upon my mind." },
  { padas: ["'काशीराम' बाबा का भक्त, शिरडी में रहता था", 'मैं साई का साई मेरा, वह दुनिया से कहता था'],
    meaning: "'Kashiram', a devotee of Baba, lived in Shirdi; he would tell the world, I am Sai's and Sai is mine." },
  { padas: ['स्वयं वस्त्र बेचता, ग्राम-नगर बाजारों में', 'झंकृत उसकी हृदय तंत्री थी, साई की झंकारों में'],
    meaning: "He himself sold cloth in the markets of villages and towns; the strings of his heart resonated only with the music of Sai's name." },
  { padas: ['स्तब्ध निशा थी, थे सोय, रजनी आंचल में चाँद सितारे', 'नहीं सूझता रहा हाथ को हाथ तिमिर के मारे'],
    meaning: "The night lay still, the moon and stars slept in night's veil; struck by the darkness, one could not even see one's own hand." },
  { padas: ['वस्त्र बेचकर लौट रहा था, हाय ! हाट से काशी', 'विचित्र बड़ा संयोग कि उस दिन, आता था एकाकी'],
    meaning: 'Having sold his cloth, alas, Kashi was returning from the market; by a strange coincidence, that day he was coming back alone.' },
  { padas: ['घेर राह में खड़े हो गए, उसे कुटिल अन्यायी', 'मारो काटो लूटो इसकी ही, ध्वनि पड़ी सुनाई'],
    meaning: 'Wicked, unjust men blocked his path and surrounded him; the cries of beat him, cut him, loot him rang out.' },
  { padas: ['लूट पीटकर उसे वहाँ से कुटिल गए चम्पत हो', 'आघातों में मर्माहत हो, उसने दी संज्ञा खो'],
    meaning: 'Having robbed and beaten him, the wicked men fled from there; grievously wounded by the blows, he lost consciousness.' },
  { padas: ['बहुत देर तक पड़ा रह वह, वहीं उसी हालत में', 'जाने कब कुछ होश हो उठा, वहीं उसकी पलक में'],
    meaning: 'For a long while he lay there, in that same condition; only after some time did some awareness stir again in his eyes.' },
  { padas: ['अनजाने ही उसके मुंह से, निकल पड़ा था साई', 'जिसकी प्रतिध्वनि शिरडी में, बाबा को पड़ी सुनाई'],
    meaning: 'Unknowingly, the name Sai had escaped from his lips; and its echo was heard by Baba himself, far away in Shirdi.' },
  { padas: ['क्षुब्ध हो उठा मानस उनका, बाबा गए विकल हो', 'लगता जैसे घटना सारी, घटी उन्हीं के सन्मुख हो'],
    meaning: "Baba's mind grew agitated, and he became deeply distressed; it seemed as though the whole event had happened right before his own eyes." },
  { padas: ['उन्मादी से इधर-उधर तब, बाबा लगे भटकने', 'सन्मुख चीजें जो भी आई, उनको लगने पटकने'],
    meaning: 'Like one possessed, Baba began wandering here and there; whatever objects came before him, he began flinging them down.' },
  { padas: ['और धधकते अंगारों में, बाबा ने अपना कर डाला', 'हुए सशंकित सभी वहाँ, लख ताण्डवनृत्य निराला'],
    meaning: 'Baba then thrust his own hand into the blazing embers; everyone there grew alarmed, witnessing this strange, wild dance.' },
  { padas: ['समझ गए सब लोग, कि कोई भक्त पड़ा संकट में', 'क्षुब्ध खड़े थे सभी वहाँ, पर पड़े हुए विस्मय में'],
    meaning: 'Everyone understood that some devotee had fallen into danger; all stood there troubled, yet also lost in astonishment.' },
  { padas: ['उसकी ही पीड़ा से पीडित, उनकी अन्तःस्थल है', 'इतने में ही विविध ने अपनी, विचित्रता दिखलाई'],
    meaning: "It was that very devotee's pain that had afflicted Baba's own inner being; just then providence showed its own strange workings." },
  { padas: ['लख कर जिसको जनता की, श्रद्धा सरिता लहराई', 'लेकर संज्ञाहीन भक्त को, गाड़ी एक वहाँ आई'],
    meaning: "Seeing it, the river of the people's faith surged even higher; a cart then arrived there, carrying the unconscious devotee." },
  { padas: ['सन्मुख अपने देख भक्त को, साई की आंखें भर आई', 'शांत, धीर, गंभीर, सिन्धु सा, बाबा का अन्तःस्थल'],
    meaning: "Seeing him before his own eyes, Sai's eyes filled with tears; calm, steady, deep as the ocean was Baba's inner nature." },
  { padas: ['आज न जाने क्यों रह-रहकर, हो जाता था चंचल', 'आज दया की मूर्ति स्वयं था, बना हुआ उपचारी'],
    meaning: 'Yet today, again and again, it kept growing restless, one knew not why; today the very image of compassion had himself become the healer.' },
  { padas: ['और भक्त के लिए आज था, देव बना प्रतिहारी', 'आज भक्ति की विषम परीक्षा में, सफल हुआ था काशी'],
    meaning: "And for this devotee, God himself had become the attending guard; today, in this severe trial of devotion, Kashi had passed the test." },
  { padas: ['उसके ही दर्शन की खातिर थे, उमड़े नगर-निवासी', 'जब भी और जहां भी कोई, भक्त पड़े संकट में'],
    meaning: 'For the sake of seeing him, the townspeople had come flocking; whenever and wherever any devotee falls into danger...' },
  { padas: ['उसकी रक्षा करने बाबा, आते हैं पलभर में', 'युग-युग का है सत्य यह, नहीं कोई नई कहानी'],
    meaning: '...Baba comes to protect him within an instant; this is a truth of every age, not some new story.' },
  { padas: ['आपत्ग्रस्त भक्त जब होता, जाते खुद अन्तर्यामी', 'भेद-भाव से परे पुजारी, मानवता के थे साई'],
    meaning: 'Whenever a devotee is in distress, the innermost witness himself goes to him; beyond all distinctions, Sai was a devotee of humanity itself.' },
  { padas: ['जितने प्यारे हिन्दू-मुस्लिम, उतने ही थे सिक्ख ईसाई', 'भेद-भाव मन्दिर-मस्जिद का, तोड़-फोड़ बाबा ने डाला'],
    meaning: 'Hindus and Muslims were as dear to him as Sikhs and Christians; Baba broke down the distinction between temple and mosque.' },
  { padas: ['राह रहीम सभी उनके थे, कृष्ण करीम अल्लाताला', 'घण्टे की प्रतिध्वनि से गूंजा, मस्जिद का कोना-कोना'],
    meaning: 'To him, Ram and Rahim were the same, Krishna, Karim, and Allah alike; every corner of the mosque rang with the echo of temple bells.' },
  { padas: ['मिले परस्पर हिन्दू-मुस्लिम, प्यार बढ़ा दिन-दिन दूना', 'चमत्कार था कितना सुन्दर, परिचय इस काया ने दी'],
    meaning: 'Hindus and Muslims met one another, and their love grew greater day by day; what a beautiful miracle this form of his revealed.' },
  { padas: ['और नीम कड़ुवाहट में भी, मिठास बाबा ने भर दी', 'सब को स्नेह दिया साई ने, सबको संतुल प्यार किया'],
    meaning: 'Even into the bitterness of the neem, Baba poured sweetness; Sai gave affection to all, loving everyone in equal measure.' },
  { padas: ['ऐसे स्नेहशील भाजन का, नाम सदा जो जपा करे', 'पर्वत जैसा दुःख न क्यों हो, पलभर में वह दूर टरे'],
    meaning: 'Whoever always chants the name of this vessel of such love -- even a mountain of sorrow is driven away from them in an instant.' },
  { padas: ['साई जैसा दाता हमने, अरे नहीं देखा कोई', 'जिसके केवल दर्शन से ही, सारी विपदा दूर गई'],
    meaning: 'We have never seen any giver as generous as Sai; by his darshan alone, every misfortune is driven away.' },
  { padas: ['तन में साई, मन में साई, साई-साई भजा करो', 'अपने तन की सुधि-बुधि खोकर, सुधि उसकी तुम किया करो'],
    meaning: 'Keep Sai in your body, Sai in your mind, chant Sai, Sai always; losing all awareness of your own body, keep your awareness fixed on him instead.' },
  { padas: ['जब तू अपनी सुधि तज, बाबा की सुधि किया करेगा', 'और रात-दिन बाबा-बाबा, ही तू रटा करेगा'],
    meaning: 'When you set aside thought of yourself, you will keep Baba in mind instead; and night and day you will keep repeating only Baba, Baba.' },
  { padas: ['तो बाबा को अरे ! विवश हो, सुधि तेरी लेनी ही होगी', 'तेरी हर इच्छा बाबा को पूरी ही करनी होगी'],
    meaning: 'Then Baba too will be compelled to keep you in his thoughts; Baba will have to fulfil your every wish.' },
  { padas: ['जंगल, जगंल भटक न पागल, और ढूंढ़ने बाबा को', 'एक जगह केवल शिरडी में, तू पाएगा बाबा को'],
    meaning: 'Do not wander madly from forest to forest searching for Baba; in one place alone, in Shirdi, you will find Baba.' },
  { padas: ['धन्य जगत में प्राणी है वह, जिसने बाबा को पाया', 'दुःख में, सुख में प्रहर आठ हो, साई का ही गुण गाया'],
    meaning: 'Blessed indeed is that soul in this world who has found Baba; in sorrow and in joy, through all eight watches of the day, sing only of Sai.' },
  { padas: ['गिरे संकटों के पर्वत, चाहे बिजली ही टूट पड़े', 'साई का ले नाम सदा तुम, सुख सब के रहो अड़े'],
    meaning: "Even if mountains of trouble fall, even if lightning itself should strike, always take Sai's name, and you will remain steadfast through it all." },
  { padas: ['इस बूढ़े की सुन करामत, तुम हो जाओगे हैरान', 'दंग रह गए सुनकर जिसको, जाने कितने चतुर सुजान'],
    meaning: "Hearing this old man's miracle, you will be astonished; so many clever and wise people were left stunned on hearing it." },
  { padas: ['एक बार शिरडी में साधु, ढ़ोंगी था कोई आया', 'भोली-भाली नगर-निवासी, जनता को था भरमाया'],
    meaning: 'Once, some fraudulent, pretend-holy man came to Shirdi; he deceived the simple, innocent people of the town.' },
  { padas: ['जड़ी-बूटियां उन्हें दिखाकर, करने लगा वह भाषण', 'कहने लगा सुनो श्रोतागण, घर मेरा है वृन्दावन'],
    meaning: 'Showing them roots and herbs, he began giving his speech; he began saying, listen, dear audience, my home is Vrindavan itself.' },
  { padas: ['औषधि मेरे पास एक है, और अजब इसमें शक्ति', 'इसके सेवन करने से ही, हो जाती दुःख से मुक्ति'],
    meaning: 'I have a medicine here, and it has a wondrous power; by taking this alone, one is freed from all sorrow.' },
  { padas: ['तो है मेरा नम्र निवेदन, हर नर से, हर नारी से', 'लो खरीद तुम इसको, इसकी सेवन विधियां हैं न्यारी'],
    meaning: 'So this is my humble request, to every man and every woman; go on, buy this, its manner of use is quite unique.' },
  { padas: ['यद्यपि तुच्छ वस्तु है यह, गुण उसके हैं अति भारी', 'जो है संतति हीन यहां यदि, मेरी औषधि को खाए'],
    meaning: 'Though it may seem a trivial thing, its virtues are exceedingly great; whoever here is childless, if they take my medicine...' },
  { padas: ['पुत्र-रत्न हो प्राप्त, अरे वह मुंह मांगा फल पाए', 'औषधि मेरी जो न खरीदे, जीवन भर पछताएगा'],
    meaning: '...will be blessed with a jewel of a son and obtain whatever fruit they wish for; whoever does not buy my medicine will regret it for their whole life.' },
  { padas: ['मुझ जैसा प्राणी शायद ही, अरे यहां आ पाएगा', 'दुनिया दो दिनों का मेला है, मौज शौक तुम भी कर लो'],
    meaning: 'Someone like me will hardly ever come this way again; the world is a fair lasting only two days, so enjoy yourselves too.' },
  { padas: ['अगर इससे मिलता है, सब कुछ, तुम भी इसको ले लो', 'हैरानी बढ़ती जनता की, लख इसकी कारस्तानी'],
    meaning: "If everything can be gained through this, then you too should take it; the people's astonishment grew, seeing his tricks." },
  { padas: ['प्रमुदित वह भी मन-ही-मन था, लख लोगों की नादानी', 'खबर सुनाने बाबा को यह, गया दौड़कर सेवक एक'],
    meaning: "He himself was secretly delighted, seeing the people's foolishness; a servant ran to tell Baba the news of this." },
  { padas: ['सुनकर भृकुटी तनी और, विस्मरण हो गया सभी विवेक', 'हुक्म दिया सेवक को, सत्वर पकड़ दुष्ट को लाओ'],
    meaning: "Hearing it, Baba's brow furrowed and all his usual composure was forgotten; he commanded the servant: quickly seize this wicked man and bring him here." },
  { padas: ['या शिरडी की सीमा से, कपटी को दूर भगाओ', 'मेरे रहते भोली-भाली, शिरडी की जनता को'],
    meaning: '...or drive this cheat out beyond the borders of Shirdi; while I am here, [how dare anyone deceive] the simple, innocent people of Shirdi.' },
  { padas: ['कौन नीच ऐसा जो, साहस करता है छलने को', 'पलभर में ऐसे ढोंगी, कपटी नीच लुटेरे को'],
    meaning: 'Who is this vile man who dares to deceive them; in an instant I shall deal with this fraudulent, deceitful, vile robber.' },
  { padas: ['महानाश के महागर्त में पहुँचा, दूँ जीवन भर को', 'तनिक मिला आभास मदारी, क्रूर, कुटिल अन्यायी को'],
    meaning: 'I shall send him into the deepest pit of ruin, for the rest of his life; the cruel, crooked wrongdoer, this street-performer, got a slight inkling.' },
  { padas: ['काल नाचता है अब सिर पर, गुस्सा आया साई को', 'पलभर में सब खेल बंद कर, भागा सिर पर रखकर पैर'],
    meaning: 'Death now danced over his head, for Sai had grown angry; in an instant he stopped his whole act and fled headlong.' },
  { padas: ['सोच रहा था मन ही मन, भगवान नहीं है अब खैर', 'सच है साई जैसा दानी, मिल न सकेगा जग में'],
    meaning: 'In his heart he thought, there is no safety for me now, God himself is against me; it is true, a giver as generous as Sai will not be found in this world.' },
  { padas: ['स्नेह, शील, सौजन्य आदि का, आभूषण धारण कर', 'बढ़ता इस दुनिया में जो भी, मानव सेवा के पथ पर'],
    meaning: 'Wearing the ornament of love, virtue, and graciousness, whoever advances in this world along the path of serving humanity...' },
  { padas: ['वही जीत लेता है जगती के, जन जन का अन्तःस्थल', 'उसकी एक उदासी ही, जग को कर देती है विह्वल'],
    meaning: '...wins over the innermost heart of every single person in it; a single sorrow of such a person is enough to leave the whole world distressed.' },
  { padas: ['जब-जब जग में भार पाप का, बढ़-बढ़ ही जाता है', 'उसे मिटाने की ही खातिर, अवतारी ही आता है'],
    meaning: 'Whenever the burden of sin in the world keeps increasing, it is to erase that burden that a divine incarnation comes.' },
  { padas: ['पाप और अन्याय सभी कुछ, इस जगती का हर के', 'दूर भगा देता दुनिया के, दानव को क्षण भर के'],
    meaning: 'Taking away all the sin and injustice of this world, he drives away, if only for a moment, the demon within it.' },
  { padas: ['स्नेह सुधा की धार बरसने, लगती है इस दुनिया में', 'गले परस्पर मिलने लगते, हैं जन-जन आपस में'],
    meaning: 'A stream of the nectar of love then begins to rain down upon this world; people begin to embrace one another warmly.' },
  { padas: ['ऐसे अवतारी साई, मृत्युलोक में आकर', 'समता का यह पाठ पढ़ाया, सबको अपना आप मिटाकर'],
    meaning: 'Such a divine incarnation was Sai, who, coming to this mortal world, taught this lesson of equality, effacing his own self before all.' },
  { padas: ['नाम द्वारका मस्जिद का, रखा शिरडी में साई ने', 'दाप, ताप, संताप मिटाया, जो कुछ आया साई ने'],
    meaning: 'Sai gave the mosque in Shirdi the name Dwarkamai; Sai erased whatever pride, torment, and anguish came to him.' },
  { padas: ['सदा याद में मस्त राम की, बैठे रहते थे साई', 'पहर आठ ही राम नाम को, भजते रहते थे साई'],
    meaning: 'Sai always remained absorbed in the constant remembrance of Rama; through all eight watches of the day Sai kept chanting the name of Rama.' },
  { padas: ['सूखी-रूखी ताजी बासी, चाहे या होवे पकवान', 'सौदा प्यार के भूखे साई की, खातिर थे सभी समान'],
    meaning: 'Whether the food offered was dry, stale, fresh, or a rich delicacy, to Sai, hungry only for love, every such offering was the same.' },
  { padas: ['स्नेह और श्रद्धा से अपनी, जन जो कुछ दे जाते थे', 'बड़े चाव से उस भोजन को, बाबा पावन करते थे'],
    meaning: 'Whatever people gave with their own love and devotion, Baba would partake of that food and sanctify it with great fondness.' },
  { padas: ['कभी-कभी मन बहलाने को, बाबा बाग में जाते थे', 'प्रमुदित मन में निरख प्रकृति, छटा को वे होते थे'],
    meaning: "Sometimes, to divert his mind, Baba would go into the garden; beholding nature's beauty there, his heart would fill with delight." },
  { padas: ['रंग-बिरंगे पुष्प बाग के, मंद-मंद हिल-डुल करके', 'बीहड़ वीराने मन में भी स्नेह सलिल भर जाते थे'],
    meaning: 'The colourful garden flowers, swaying gently to and fro, would fill even the wildest, most desolate heart with a flood of tenderness.' },
  { padas: ['अपने मन की व्यथा सुनाने, जन रहते बाबा को घेरे', 'सुनकर जिनकी करूणकथा को, नयन कमल भर आते थे'],
    meaning: 'To share their heart’s sorrows, people would keep surrounding Baba; hearing their sorrowful tales, his lotus-like eyes would fill with tears.' },
  { padas: ['दे विभूति हर व्यथा, शांति, उनके उर में भर देते थे', 'जाने क्या अद्भुत शक्ति, उस विभूति में होती थी'],
    meaning: 'Giving them sacred ash, he would remove their every sorrow and fill their hearts with peace; who knows what wondrous power that sacred ash held.' },
  { padas: ['जो धारण करते मस्तक पर, दुःख सारा हर लेती थी', 'धन्य मनुज वे साक्षात् दर्शन, जो बाबा साई के पाए'],
    meaning: 'Worn upon the forehead, it would take away all sorrow; blessed indeed were those people who received the direct darshan of Baba Sai.' },
  { padas: ['धन्य कमल कर उनके जिनसे, चरण-कमल वे परसाए', 'काश निर्भय तुमको भी, साक्षात् साई मिल जाता'],
    meaning: 'Blessed were the lotus hands with which they touched his lotus feet; if only you too could fearlessly encounter Sai directly...' },
  { padas: ['वर्षों से उजड़ा चमन अपना, फिर से आज खिल जाता', 'गर पकड़ता मैं चरण श्री के, नहीं छोड़ता उम्रभर'],
    meaning: '...your own garden, desolate for years, would bloom again today; if I could hold the feet of Shri Sai, I would not let go for my whole life.' },
  { padas: ['मना लेता मैं जरूर उनको, गर रूठते साई मुझ पर'],
    meaning: 'I would surely win him over and persuade him, even if Sai were ever upset with me.' },
];

const ITEMS = CHAUPAIS;

if (ITEMS.length !== 99) throw new Error(`Expected 99 stanza rows, got ${ITEMS.length}`);
ITEMS.slice(0, -1).forEach((c, i) => {
  if (c.padas.length !== 2) throw new Error(`Chaupai ${i + 1}: expected 2 padas, got ${c.padas.length}`);
});
if (ITEMS[ITEMS.length - 1].padas.length !== 1) throw new Error('Final chaupai: expected 1 pada (the unpaired closing line), got a different count.');
console.log(`Structure check passed: ${ITEMS.length} chaupai stanzas (98 two-line + 1 closing single-line), no doha framing exists in this text.\n`);

function addMacrons(iast) {
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō');
}

// Sanscript's iast scheme has no notion of nukta consonants (ड़/ढ़) -- it
// transliterates the base letter and passes the nukta mark through raw and
// un-transliterated. Carried over defensively from upload-hanuman-
// chalisa.mjs; this text turned out not to use any.
function fixNukta(iast) {
  return iast.replace(/ḍha़/g, 'ṛh').replace(/ḍa़/g, 'ṛ');
}

// Sanscript's iast scheme renders candrabindu as a bare "~" appended after
// the vowel. Carried over defensively from upload-hanuman-chalisa.mjs.
function fixCandrabindu(iast) {
  return iast.replace(/([aāiīuūeēoō])~/g, (_, v) => v + '̃');
}

// Sanscript's devanagari->telugu scheme has the same nukta gap as iast, but
// Telugu has no distinct letter for the retroflex-flap sound at all.
// Carried over defensively; unused by this text.
function stripNukta(deva) {
  return deva.replace(/़/g, '');
}

// Modern Hindi word-final schwa deletion: unlike upload-hanuman-
// chalisa.mjs and upload-shiv-chalisa.mjs (where the calibration check
// showed most published IAST retains the schwa, so only a short explicit
// word list was deleted), this text's own published informal
// transliteration (hindunidhi.com) confirms aggressive final-schwa
// deletion is the natural, expected convention here. Applied as a blanket
// rule on top of Sanscript's direct output: drop a bare word-final "a"
// after a single consonant. Medial schwa deletion is deliberately NOT
// attempted (would need real syllable-structure analysis to do correctly).
function hindiSchwa(iast) {
  // Words mid-pada are often followed by a comma (Sanscript preserves the
  // Devanagari comma literally), so the bare word-final "a" is not always
  // the token's last character -- match it just before an optional
  // trailing comma too, not only at the absolute end of the token.
  // Reduplicated compounds (घर-घर, दर-दर, जब-जब, मन-ही-मन ...) are common
  // in this text and are one Devanagari token with no space, so Sanscript
  // keeps them hyphen-joined as a single string -- each hyphen segment is
  // its own word for pronunciation purposes and needs the rule applied
  // independently, not just the substring after the last hyphen.
  const dropSchwa = s => s.replace(/([^aāiīuūeēoō])a$/, '$1');
  return iast.split(' ').map(tok => {
    const hasComma = tok.endsWith(',');
    const core = hasComma ? tok.slice(0, -1) : tok;
    const fixed = core.split('-').map(dropSchwa).join('-');
    return hasComma ? fixed + ',' : fixed;
  }).join(' ');
}

function toDevNumeral(n) {
  const DEV_DIGITS = '०१२३४५६७८९';
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

const rows = ITEMS.map((item, i) => {
  const stanzaNumber = i + 1;
  const devaPadas = [...item.padas];
  if (devaPadas.length === 2) {
    devaPadas[0] += ' ।';
    devaPadas[1] += ` ॥${toDevNumeral(stanzaNumber)}॥`;
  } else {
    devaPadas[0] += ` ॥${toDevNumeral(stanzaNumber)}॥`;
  }

  return {
    stanza_number: stanzaNumber,
    stanza_label: `Chaupai ${stanzaNumber}`,
    script_devanagari: devaPadas.join('|'),
    script_telugu: item.padas.map(p => Sanscript.t(stripNukta(p), 'devanagari', 'telugu')).join('|'),
    script_tamil: item.padas.map(p => devanagariToTamilSuperscript(p)).join('|'),
    roman_iast: item.padas.map(p => hindiSchwa(addMacrons(fixCandrabindu(fixNukta(Sanscript.t(p, 'devanagari', 'iast')))))).join('|'),
    meaning_en: item.meaning,
  };
});

console.log('Sample (rows 1, 21, 46, 94, 99):\n');
[0, 20, 45, 93, 98].forEach(i => console.log(rows[i], '\n'));

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
