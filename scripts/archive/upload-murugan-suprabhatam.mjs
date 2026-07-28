/**
 * Uploads Murugan Suprabhatam (18 verses, lyricist P. Senthilkumar, sung by
 * Ragam Sisters / music by Sivapuranam D V Ramani, album "Siragiri Velava",
 * produced by Vijay Musicals) to shloka_stanzas. Sourced from the web, no
 * user-supplied text.
 *
 * STANZA COUNT MISMATCH (flagged, not forced): the site's metadata declares
 * stanza_count: '22'. Extensive web sourcing (multiple search rounds across
 * bhajanlyricsworld.com, kaumaram.com, tvsubha.wordpress.com, tamilbrahmins.com,
 * musiclounge.in, and the official YouTube descriptions of every "Murugan
 * Suprabhatham" video found) turned up no distinct, verifiable 22-verse Tamil
 * text under that title. The only text actually and consistently titled
 * "Murugan Suprabhatham" that could be cross-checked is this 18-verse
 * composition, centered on the Sennimalai (Chennimalai) temple near Erode,
 * with Palani mentioned once (verse 15) but no mention of Tiruchendur or
 * Tirupparankunram -- so it also does not fully match the site metadata's
 * "Palani, Tiruchendur, Tirupparankunram" framing. This gap was raised with
 * the user directly (not silently resolved); the user chose to proceed with
 * this verified 18-verse text rather than keep searching or supply a source.
 * This mirrors how Vishnu Sahasranamam (108 of a declared 142) and Lalitha
 * Sahasranamam (183 vs 182) were handled: upload verified content, flag the
 * gap, do not fabricate to fill it.
 *
 * Sourcing: the Tamil text was cross-checked between bhajanlyricsworld.com
 * (2023 lyrics blog) and the official Vijay Musicals YouTube video
 * description for "Murugan Suprabhatham | Murugan Suprabhatham with Lyrics
 * Tamil | Murugan Songs | Vijay Musicals" (youtube.com/watch?v=VzaEGdkyIWE) --
 * the two matched word-for-word, including three verses (8, 14, 17) whose
 * opening couplet is sung twice before the closing line, confirming this is
 * a genuine feature of the song rather than a scraping artifact (the
 * repeated couplet is dropped from the stored text below -- see "Pada
 * structure" -- since it is a musical performance repeat, not distinct
 * text). A third, fully independent transcription could not be located
 * (this appears to be one single officially-released lyric sheet, not
 * multiple independent transcriptions), so this falls short of the usual
 * 2-3-independent-source bar; that shortfall is flagged here rather than
 * silently treated as fully cross-verified. A different, unrelated 8-verse
 * "Siruvapuri Murugan Suprabhatham" and a Sanskrit-language "Thiruchendur
 * Sri Sendhiladhipan Suprabhatham" (kaumaram.com) were both found and ruled
 * out during sourcing (wrong temple / wrong language respectively).
 *
 * TAMIL-AS-SOURCE TRANSLITERATION: this text is Tamil-original, not a
 * Sanskrit text transliterated into Tamil. script_tamil is therefore the
 * hand-verified primary field. Sanscript's tamil-as-source scheme
 * (Sanscript.t(text, 'tamil', 'devanagari'/'iast')) was spot-checked before
 * use and found badly broken -- it defaults almost every consonant to a
 * voiced/aspirated reading regardless of context, failing even on trivial
 * native words (தமிழ் -> "dhamiḻ" instead of "tamiḻ"; வணக்கம் ->
 * "vaṇaghgham" instead of "vaṇakkam"; முருகன் -> "murughaṉ" instead of
 * "murugan"). It was NOT used. Instead, script_devanagari below is
 * hand-authored directly from the verified Tamil, applying the actual
 * pronunciation rules of Tamil (documented below), and script_telugu /
 * roman_iast are then derived from that hand-authored Devanagari via
 * Sanscript's devanagari-source direction -- the one direction this
 * pipeline has validated and trusted throughout every prior upload.
 *
 * Devanagari authoring rules applied by hand, verse by verse:
 *   - Known Sanskrit-origin words/names use their actual Sanskrit spelling
 *     (e.g. ஆனந்த -> आनन्द, சிவன் -> शिवन्, சக்தி -> शक्ति, சரவணன் ->
 *     शरवण, சண்முகன் -> षण्मुख [ஷண்முக being ṣaṇmukha], குகன் -> गुह
 *     [the standard Tamil rendering of Guha], கார்த்திகேயன் -> कार्त्तिकेय,
 *     அருணாசலன் -> अरुणाच्चलन्, துர்கை -> दुर्गै, etc.) rather than a
 *     mechanical letter-for-letter pass.
 *   - Native Tamil க/ட/த/ப: voiceless unaspirated (க,ட,த,ப) word-initial or
 *     geminate (க்க etc.); voiced unaspirated (ग,ड,द,ब) when a single medial
 *     consonant (intervocalic, or after a liquid/glide) or in a
 *     nasal+stop cluster (ங்க,ந்த,ம்ப -> ङ्ग,न्द,म्ब). Exception: a
 *     ற்+stop cluster (பொற்பாதம், அற்புதம்) keeps the following stop
 *     voiceless, matching how these words are actually pronounced.
 *   - Native ச: word-initial or geminate ச்ச -> च (voiceless affricate,
 *     e.g. சென்னிமலை -> सॆन्निमलै); single medial ச -> स (matching the
 *     [s] realization Tamil actually gives intervocalic ச, a documented
 *     divergence from the other plosives, e.g. சிற்றின்பம்-type words).
 *   - ண,ன/ந,ல,ள -> ण,न,ल,ळ as usual. ழ (no Devanagari letter) -> ऴ
 *     (U+0934 DEVANAGARI LETTER LLLA, the standard nukta-extended letter
 *     for this Dravidian retroflex approximant) -- verified this renders
 *     correctly to IAST "ḻ" and Telugu "ఴ" via Sanscript. ற (no Devanagari
 *     letter) -> ऱ (U+0931 DEVANAGARI LETTER RRA, same rationale) --
 *     likewise verified to render as IAST "ṟ" / Telugu "ఱ".
 *   - Tamil short/long e and o are phonemically distinct (unlike Sanskrit,
 *     which has only long e/o). Short எ/ஒ -> independent ऎ/ऒ or matra
 *     ॆ/ॊ; long ஏ/ஓ -> ए/ओ or matra े/ो. Because of this, the IAST macron
 *     step used elsewhere in this pipeline (blanket e->ē, o->ō, since
 *     Sanskrit e/o are always long) is NOT correct here. Sanscript's
 *     devanagari->iast rendering already distinguishes them (long e/o come
 *     out as plain e/o; short e/o come out marked with a grave accent
 *     è/ò) -- verified with test cases before use. addMacrons() below is
 *     therefore extended for this script only: e->ē/o->ō (untouched short
 *     è/ò, a distinct Unicode codepoint from plain e/o) followed by
 *     è->e/ò->o (stripping the grave accent to get plain short vowels).
 *   - Grantha letters already used in the source for Sanskrit sounds
 *     (ஷ,ஸ,ஜ,ஹ) map directly: ஷ->ष, ஸ->स, ஜ->ज, ஹ->ह.
 *
 * Pada structure: each verse is sung as 3 content lines followed by the
 * refrain "திருப்பள்ளி எழுந்தருள்வாய் சிரகிரி வேலவா திருமுருகா" ("Awaken,
 * O Lord of Sirakiri, O sacred Muruga") -- stored here as 4 padas per
 * verse (3 content + refrain), every verse. Verses 8, 14 and 17 additionally
 * repeat their first two lines once more in performance (a musical repeat,
 * confirmed identical in both cross-checked sources) before the third line;
 * that sung repeat is not stored as separate padas since it duplicates
 * text already present, not new content.
 *
 * meaning_en is this script author's own translation composed directly
 * from the verified Tamil, matching the approach used for every prior
 * upload this session.
 *
 * Defaults to a dry run. Pass --write to apply.
 * Run: node scripts/upload-murugan-suprabhatam.mjs          (dry run)
 *      node scripts/upload-murugan-suprabhatam.mjs --write  (apply)
 */
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sanscript from '@indic-transliteration/sanscript';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const WRITE = process.argv.includes('--write');
const SLUG = 'murugan-suprabhatam';

const REFRAIN = {
  tamil: 'திருப்பள்ளி எழுந்தருள்வாய் சிரகிரி வேலவா திருமுருகா',
  deva: 'तिरुप्पळ्ळि ऎऴुन्दरुळ्वाय् शिरगिरि वेलवा तिरुमुरुगा',
};

const VERSES = [
  {
    tamil: [
      'ஓம் ஆனந்த வெள்ளமாய் ஆதவன் கிரணங்கள் அருளைப் பொழிந்திடுமே',
      'வைகறை வேளையில் வடிவேலன் பொற்பாதம் அழைத்திடுமே',
      'கூவிடும் பூங்குயில் வண்ணமயில் முருகனின் புகழ் பாடுமே',
    ],
    deva: [
      'ओम् आनन्द वॆळ्ळमाय् आदवन् किरणङ्गळ् अरुळैप् पॊऴिन्दिडुमे',
      'वैगऱै वेळैयिल् वडिवेलन् पॊऱ्पादम् अऴैत्तिडुमे',
      'कूविडुम् पूङ्गुयिल् वण्णमयिल् मुरुगनिन् पुगऴ् पादुमे',
    ],
    meaning: 'Om! Like a flood of bliss, the rays of the sun shower forth grace; at the hour of dawn the golden feet of Vadivelan call out; the cuckoo and the beautiful peacock sing the fame of Murugan.',
  },
  {
    tamil: [
      'பொழுது புலர்ந்தது பொற்கோழி கூவிற்று செங்கதிர்வேலவனே',
      'சேவலும் மயிலுமுடைய சென்னிமலையானே தேவசேனாபதியே',
      'சக்திவேல் தாங்கிவரும் சரவணனே சதாசிவ பாலகனே',
    ],
    deva: [
      'पॊऴुदु पुलर्न्ददु पॊऱ्कोऴि कूविऱ्ऱु सॆङ्गदिर्वेलवने',
      'सेवलुम् मयिलुमुडैय सॆन्निमलैयाने देवसेनापतिये',
      'शक्तिवेल् ताङ्गिवरुम् शरवणने सदाशिव बालकने',
    ],
    meaning: 'Day has dawned, the golden cock has crowed, O ruddy-rayed bearer of the spear; O lord of Sennimalai who owns both rooster and peacock, O commander of the army of the gods; O Saravana who comes bearing the spear of Shakti, O eternal child of Sadashiva.',
  },
  {
    tamil: [
      'ஆர்வமோடு அடியார் கந்தசஷ்டி கவசம் பக்தியோடு முழங்குகிறார்',
      'கூர்த்தரும் மலர்க்கண் பூத்து குணமுடன் எழுந்தருவாய்',
      'சீத்தரும் மறையோர் போற்றித் துதிக்கும் அம்பிகை பாலகனே',
    ],
    deva: [
      'आर्वमोडु अडियार् कन्दषष्टि कवचम् भक्तियोडु मुऴङ्गुगिऱार्',
      'कूर्त्तरुम् मलर्क्कण् पूत्तु गुणमुडन् ऎऴुन्दरुवाय्',
      'शीत्तरुम् मऱैयोर् पोऱ्ऱित् तुदिक्कुम् अम्बिकै बालकने',
    ],
    meaning: 'With eagerness the devotees resound the Kanda Sashti Kavacham with devotion; may you graciously open your sharp, flower-like eyes and arise in good health; O child of Ambika, praised and extolled by the serene Vedic scholars.',
  },
  {
    tamil: [
      'சரவணபொய்கையின் கண்மணியே கடம்பனே கார்த்திகேயனே',
      'அன்னை அணைத்திட ஆறுமுகமான ஆதிபழனி ஆண்டவனே',
      'தேவர்களின் துயர்தனை நீக்கிய குகனே குமரவேலே',
    ],
    deva: [
      'शरवणपोय्गैयिन् कण्मणिये कदम्बने कार्त्तिकेयने',
      'अन्नै अणैत्तिड आऱुमुखमान आदिपऴनि आण्डवने',
      'देवर्गळिन् तुयर्दनै नीक्किय गुहने कुमरवेले',
    ],
    meaning: 'O jewel of the eye of the Saravana pond, O Kadamban, O Karttikeya; O six-faced one who is Adi Palani itself, so that Mother may embrace you; O Guha who removed the sorrow of the gods, O Kumara of the spear.',
  },
  {
    tamil: [
      'நடுநாயகமூர்த்தியாய் அங்காரகனாய் அஷ்டகிரஹங்களும் உனைத்தொழவே',
      'நலம்தரும் நவகிரஹங்களும் உனைவலம்வர தரும் வரமே',
      'செவ்வாய் தோஷம் நீங்க சென்னிமலையும் அங்காரகன் பரிகாரஸ்தலமே',
    ],
    deva: [
      'नडुनायगमूर्त्तियाय् अङ्गारकनाय् अष्टग्रहङ्गळुम् उनैत्तॊऴवे',
      'नलम्दरुम् नवग्रहङ्गळुम् उनैवलम्वर तरुम् वरमे',
      'सॆव्वाय् दोषम् नीङ्ग सॆन्निमलैयुम् अङ्गारकन् परिहारस्थलमे',
    ],
    meaning: 'As the presiding deity, as Angaraka (Mars) himself, so that the eight planets may worship you; granting good fortune, so that the nine planets may circle you and grant their boon; O Sennimalai where the affliction of Mars is removed, the very place of remedy for Angaraka.',
  },
  {
    tamil: [
      'மன்னனுக்கு ப்ரம்மஹத்தி தோஷம் நீக்கிய முதல்வனே முருகனே',
      'பதினாறு திருமூர்த்தங்களின் சாஹித்யமும் சென்னிமலையிலே',
      'வையகமும் வானகமும் வளர்ந்தோங்கிய மாமலையே',
    ],
    deva: [
      'मन्ननुक्कु ब्रह्महत्ति दोषम् नीक्किय मुदल्वने मुरुगने',
      'पदिनाऱु तिरुमूर्त्तङ्गळिन् साहित्यमुम् सॆन्निमलैयिले',
      'वैयगमुम् वानगमुम् वळर्न्दोङ्गिय मामलैये',
    ],
    meaning: 'O Primal One, O Murugan, who removed the sin of Brahmahatya from a king; the literature of the sixteen sacred forms rests at Sennimalai; O great hill where both this earthly world and the heavenly world have flourished and grown.',
  },
  {
    tamil: [
      'கார்த்திகை பெண்கள் பாலூட்ட வளர்ந்தவனே கார்த்திகேயனே',
      'முருகனாய் வந்துதித்த மோஹனமே சக்திவேலனே',
      'சூரர்குலம் வேரறுக்க தோன்றிய குலவிளக்கே',
    ],
    deva: [
      'कार्त्तिकै पॆण्गळ् पालूट्ट वळर्न्दवने कार्त्तिकेयने',
      'मुरुगनाय् वन्दुदित्त मोहनमे शक्तिवेलने',
      'शूरर्कुलम् वेरऱुक्क तोन्ऱिय कुलविळक्के',
    ],
    meaning: 'O Karttikeya who was nursed and raised by the six Krittika maidens; O enchanting one who arose taking birth as Murugan, O bearer of the spear of Shakti; O lamp of the [divine] clan who appeared to cut off the root of the lineage of the Asuras.',
  },
  {
    tamil: [
      'மனமுருக்கும் கந்தசஷ்டி கவசம் அரங்கேற்றிய ஸ்தனமே',
      'கணப்பொழுதில் காத்திட வந்திடும் கருணைவடிவான குகனே',
      'தினமுனைப் பணிந்து திருவருள் பெறபணிந்தோம் பாதமே',
    ],
    deva: [
      'मनमुरुक्कुम् कन्दषष्टि कवचम् अरङ्गेऱ्ऱिय स्तनमे',
      'कणप्पॊऴुदिल् कात्तिड वन्दिडुम् करुणैवडिवान गुहने',
      'दिनमुनैप् पणिन्दु तिरुवरुळ् पॆऱपणिन्दोम् पादमे',
    ],
    meaning: 'O breast [of the Mother] upon which the heart-melting Kanda Sashti Kavacham was first performed; O Guha of compassionate form who comes in an instant to protect; daily we have bowed to you, bowing to receive your sacred grace at your feet.',
  },
  {
    tamil: [
      'குறுமணிக்கருள் செய்த குமரகுருபரனே குகனே சண்முகனே',
      'வரும் அடியார்க்கும் அருளும் குஞ்சரி வள்ளி மணவாளனே',
      'புண்ணாக்கு சித்தர்க்கு முக்தி தந்த சென்னிமலை ஆண்டவனே',
    ],
    deva: [
      'कुऱुमणिक्करुळ् सॆय्द कुमारगुरुपरने गुहने षण्मुखने',
      'वरुम् अडियार्क्कुम् अरुळुम् कुञ्जरि वळ्ळि मणवाळने',
      'पुण्णाक्कु सिद्धर्क्कु मुक्ति तन्द सॆन्निमलै आण्डवने',
    ],
    meaning: 'O supreme Guru among gurus who showed grace to the little child, O Guha, O Shanmukha; who grants grace to devotees who come to you, O bridegroom of Valli, the elephant-graceful maiden; O Lord of Sennimalai who granted liberation to the siddhas of Punnakku.',
  },
  {
    tamil: [
      'எல்லையிலா அழகுமிகும் அருணாச்சலன் மைந்தனே',
      'கருணையே வடிவமாய் காட்சி தந்திடும் சரவணபவனே',
      'அமிர்தவல்லி சுந்தரவல்லி போற்றிடும் மால்மருகனே',
    ],
    deva: [
      'ऎल्लैयिला अऴगुमिगुम् अरुणाच्चलन् मैन्दने',
      'करुणैये वडिवमाय् काट्चि तन्दिडुम् शरवणभवने',
      'अमृतवल्लि सुन्दरवल्लि पोऱ्ऱिडुम् मालमरुगने',
    ],
    meaning: 'O boundless one of unsurpassed beauty, O son of Arunachala; who grants darshan in the very form of mercy, O Saravanabhava; O nephew of Vishnu, praised by Amritavalli and Sundaravalli.',
  },
  {
    tamil: [
      'க்ருதாயுகத்தில் மாலவன் பூஜித்த கனககிரியே சென்னிமலை',
      'ப்ரீத்தாயுகத்தில் திருமகள் போற்றிய மகுடகிரியே சென்னிமலை',
      'த்வாபரயுகத்தில் துர்கை வணங்கிய புஷ்பகிரியே சென்னிமலை',
    ],
    deva: [
      'कृतायुगत्तिल् मालवन् पूजित्त कनकगिरिये सॆन्निमलै',
      'प्रीत्तायुगत्तिल् तिरुमगळ् पोऱ्ऱिय मकुटगिरिये सॆन्निमलै',
      'द्वापरयुगत्तिल् दुर्गै वणङ्गिय पुष्पगिरिये सॆन्निमलै',
    ],
    meaning: 'In the Krita Yuga, Vishnu worshipped you as the golden mountain, O Sennimalai; in the age that follows, Lakshmi praised you as the crowned mountain, O Sennimalai; in the Dvapara Yuga, Durga worshipped you as the flower mountain, O Sennimalai.',
  },
  {
    tamil: [
      'கலியுகத்தில் தேவேந்திரன் பூஜித்த சிரகிரியே சென்னிமலை',
      'ஞானப்பழம் வேண்டி ஞாலம் சுற்றியவனுக்கு நிவேத்தியம் அதிகாலை',
      'சனகாதி முனிவரெல்லாம் சந்ததம் போற்றிடும் சண்முகனே',
    ],
    deva: [
      'कलियुगत्तिल् देवेन्द्रन् पूजित्त शिरगिरिये सॆन्निमलै',
      'ज्ञानप्पऴम् वेण्डि ञालम् सुऱ्ऱियवनुक्कु निवेत्तियम् अदिगालै',
      'सनकादि मुनिवरॆल्लाम् सन्ततम् पोऱ्ऱिडुम् षण्मुखने',
    ],
    meaning: 'In the Kali Yuga, Devendra worshipped you as Sirakiri itself, O Sennimalai; the early-dawn offering is for the one who circled the world seeking the fruit of wisdom; O Shanmukha, ever praised by Sanaka and all the sages.',
  },
  {
    tamil: [
      'சிவனார் மனம்குளிர உபதேசம் செய்த சிங்காரவேலனே',
      'தித்திக்கும் தமிழ்த் தேனும் திருப்புகழ் தினைமாவும் பக்தியுடன்',
      'அனுதினமும் படியேறிப் பாடிப் பாதம் பணிந்தோமே',
    ],
    deva: [
      'शिवनार् मनम्गुळिर उपदेशम् सॆय्द शिङ्गारवेलने',
      'तित्तिक्कुम् तमिऴ्त् तेनुम् तिरुप्पुगऴ् तिनैमावुम् भक्तियुडन्',
      'अनुदिनमुम् पडियेऱिप् पाडिप् पादम् पणिन्दोमे',
    ],
    meaning: 'O splendid bearer of the spear who gave the teaching that gladdened the heart of Lord Shiva; with the sweet honey of the Tamil language, with the Thiruppugazh, and with millet-flour offerings, with devotion; every single day we have climbed the steps, sung, and bowed at your feet.',
  },
  {
    tamil: [
      'அனுபூதி அலங்காரம் அந்தாதி தந்த அருணகிரிக்கு அருளியவா',
      'கந்தசஷ்டி கவசம் தேவராயன் தந்தது உன் கருணையல்லவா',
      'பன்னிருத் தோளழகா பங்கஜ மலைப்பாதா கோமளத்திருமுருகா',
    ],
    deva: [
      'अनुभूति अलङ्कारम् अन्तादि तन्द अरुणगिरिक्कु अरुळियवा',
      'कन्दषष्टि कवचम् देवरायन् तन्ददु उन् करुणैयल्लवा',
      'पन्निरुत् तोळऴगा पङ्कज मलैप्पादा कोमळत्तिरुमुरुगा',
    ],
    meaning: 'Was it not your grace that gave the Anubhuti, the Alankaram and the Andadi to Arunagirinathar? Was it not your compassion that gave the Kanda Sashti Kavacham to Devarayan? O beauty of the twelve shoulders, O feet like a mountain, O gentle and sacred Muruga.',
  },
  {
    tamil: [
      'பழனியம்பதிக்கு இடும்பனுக்கு வழிகாட்டிய சென்னிமலை முருகனே',
      'வேங்கை மரமாக நின்று லங்கை வள்ளியை மணந்த மணவாளனே',
      'வேங்கை ரதமேறி வேண்டிய வரம் தரும் கண் கண்ட தெய்வமே',
    ],
    deva: [
      'पऴनियम्बदिक्कु इडुम्बनुक्कु वऴिगाट्टिय सॆन्निमलै मुरुगने',
      'वेङ्गै मरमाग निन्ऱु लङ्कै वळ्ळियै मणन्द मणवाळने',
      'वेङ्गै रथमेऱि वेण्डिय वरम् तरुम् कण् कण्ड तॆय्वमे',
    ],
    meaning: 'O Murugan of Sennimalai who showed the way to Idumban toward the town of Palani; who stood as a Vengai tree and married Valli of Lanka [the hunter maiden]; O manifest deity who mounted the Vengai-wood chariot and grants before the very eyes whatever boon is sought.',
  },
  {
    tamil: [
      'திருப்புகழ் பாடிய அருணகிரிநாதருக்கு படிக்காசு தந்தான் மலையே',
      'சீர்வளரும் சென்னிமலை மேவிய செந்தமிழ்வாசா',
      'பாருலகத்தில் அடியவர்த் துதித்திடும் சிரகிரி வேலவா',
    ],
    deva: [
      'तिरुप्पुगऴ् पाडिय अरुणगिरिनाथरुक्कु पडिक्कासु तन्दान् मलैये',
      'सीर्वळरुम् सॆन्निमलै मेविय सॆन्दमिऴ्वासा',
      'पारुलगत्तिल् अडियवर्त् तुदित्तिडुम् शिरगिरि वेलवा',
    ],
    meaning: 'O mountain that gave gold coins to Arunagirinathar, who sang the Thiruppugazh; O speaker of refined Tamil who dwells at ever-flourishing Sennimalai; O Lord of Sirakiri, praised in this world by the devotees who worship you.',
  },
  {
    tamil: [
      'உலகமே வியந்திட மாடுகள் பூட்டிய வண்டி மலையேறிய அதிசயம்',
      'திருமஞ்சனத் தீர்த்தம் காளிகள் படியேறி தினம் கொணரும் அற்புதம்',
      'நல்லது நடந்திட உன் அருள்வேண்டி சிரசுப்பூ உத்தரவு வழக்கம்',
    ],
    deva: [
      'उलगमे वियन्दिड माडुगळ् पूट्टिय वण्डि मलैयेऱिय अदिशयम्',
      'तिरुमञ्जनत् तीर्त्तम् काळिगळ् पडियेऱि तिनम् कॊणरुम् अऱ्पुदम्',
      'नल्लदु नडन्दिड उन् अरुळ्वेण्डि शिरसुप्पू उत्तरवु वऴक्कम्',
    ],
    meaning: 'It is a wonder that the whole world marvels at: a cart yoked to oxen climbing the mountain; it is a miracle that the sacred bathing water is brought daily by the temple maidens ascending the steps; it is the custom to seek your permission through the flower atop the head, that good may come to pass by your grace.',
  },
  {
    tamil: [
      'விசாகப்பெருமானின் அரும் விலாசம் சென்னிமலையே',
      'ஏகன் அநேகன் சண்முகனே யோகங்கள் தந்திடும் குகனே',
      'கூப்பிட்டக் குரலுக்கு ஓடிவந்திடும் குமரகுருபரனே',
    ],
    deva: [
      'विशाकप्पॆरुमानिन् अरुम् विलासम् सॆन्निमलैये',
      'एकन् अनेकन् षण्मुखने योगङ्गळ् तन्दिडुम् गुहने',
      'कूप्पिट्टक् कुरलुक्कु ओडिवन्दिडुम् कुमारगुरुपरने',
    ],
    meaning: 'The rare splendor of Lord Vishakha is this Sennimalai itself; O Shanmukha who is the One and the Many, O Guha who grants all yogas; O supreme Guru among gurus, who comes running the moment your name is called.',
  },
];

if (VERSES.length !== 18) throw new Error(`Expected 18 verses, got ${VERSES.length}`);
VERSES.forEach((v, i) => {
  if (v.tamil.length !== 3) throw new Error(`Verse ${i + 1}: expected 3 content padas, got ${v.tamil.length}`);
  if (v.deva.length !== 3) throw new Error(`Verse ${i + 1}: expected 3 devanagari padas, got ${v.deva.length}`);
});
console.log('Structure check passed: 18 verses, 3 content padas + refrain each (declared stanza_count is 22 -- flagged mismatch, see header comment).\n');

function addMacronsTamil(iast) {
  // Sanskrit-sourced scripts in this pipeline blanket-replace e->e-macron,
  // o->o-macron because Sanskrit e/o are always long. Tamil has genuine
  // short e/o too: Sanscript's devanagari->iast already renders long e/o as
  // plain e/o and short e/o as e-grave/o-grave (è/ò) -- distinct codepoints
  // from plain e/o, so the macron step below only touches the long ones.
  return iast.replace(/e/g, 'ē').replace(/o/g, 'ō').replace(/è/g, 'e').replace(/ò/g, 'o');
}

const DEV_DIGITS = '०१२३४५६७८९';
function toDevNumeral(n) {
  return String(n).split('').map(d => DEV_DIGITS[+d]).join('');
}

const rows = VERSES.map((v, i) => {
  const stanzaNumber = i + 1;
  const tamilPadas = [...v.tamil, REFRAIN.tamil];
  const devaPadas = [...v.deva, REFRAIN.deva];

  const devaWithPunct = [...devaPadas];
  devaWithPunct[2] += ' ।'; // single danda after the third (last content) pada
  devaWithPunct[3] += ` ॥${toDevNumeral(stanzaNumber)}॥`; // numbered double-danda after the refrain

  return {
    stanza_number: stanzaNumber,
    stanza_label: `Ślōka ${stanzaNumber}`,
    script_tamil: tamilPadas.join('|'),
    script_devanagari: devaWithPunct.join('|'),
    script_telugu: devaPadas.map(p => Sanscript.t(p, 'devanagari', 'telugu')).join('|'),
    roman_iast: devaPadas.map(p => addMacronsTamil(Sanscript.t(p, 'devanagari', 'iast'))).join('|'),
    meaning_en: `${v.meaning} Awaken, O Lord of Sirakiri, O sacred Muruga!`,
  };
});

console.log('Sample (verses 1, 8, 14, 18):\n');
[0, 7, 13, 17].forEach(i => console.log(rows[i], '\n'));

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
