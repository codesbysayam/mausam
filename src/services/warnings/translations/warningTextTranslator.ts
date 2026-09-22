// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Official Warning Text Preservation & Multilingual Adapter
// Ensures genuine official text provenance is never misrepresented
// ====================================================================

import { WeatherWarning } from '../../../types/warnings';
import {
  getAlertLabel,
  getLocalizedHazard,
  getLocalizedSeverity,
} from './warningTranslations';
import { INDIA_REGION_LANGUAGE_REGISTRY, RegionLanguageConfig, getLocalizedStateName } from '../../../types/regionLanguages';

export interface LocalizedWarningDisplay {
  headline: string;
  description: string;
  isOfficialQuote: boolean; // true if text is the exact government bulletin in that language
  badgeLabel: string; // 'OFFICIAL GOVERNMENT NOTICE' or 'TRANSLATED SUMMARY'
  officialText: string; // Untouched original official text
  officialLanguageCode: string; // e.g. 'or', 'hi', 'en'
  officialLanguageName: string; // e.g. 'Odia', 'Hindi', 'English'
  hasUntranslatedOriginal: boolean;
  hazardLabel: string;
  severityLabel: string;
  stateOrRegionLabel: string;
  affectedRegions: string[];
  safetyInstructions: string[];
}

/**
 * Detect script / official language of input text based on Unicode blocks
 */
export function detectTextLanguage(text?: string | null): { code: string; name: string } {
  if (!text || typeof text !== 'string') {
    return { code: 'en', name: 'English' };
  }

  // Odia (\u0B00-\u0B7F)
  if (/[\u0B00-\u0B7F]/.test(text)) {
    return { code: 'or', name: 'Odia' };
  }
  // Bengali / Assamese (\u0980-\u09FF)
  if (/[\u0980-\u09FF]/.test(text)) {
    return { code: 'bn', name: 'Bengali' };
  }
  // Devanagari (Hindi, Marathi, Konkani, Nepali) (\u0900-\u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return { code: 'hi', name: 'Hindi' };
  }
  // Telugu (\u0C00-\u0C7F)
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return { code: 'te', name: 'Telugu' };
  }
  // Tamil (\u0B80-\u0BFF)
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return { code: 'ta', name: 'Tamil' };
  }
  // Kannada (\u0C80-\u0CFF)
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return { code: 'kn', name: 'Kannada' };
  }
  // Malayalam (\u0D00-\u0D7F)
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return { code: 'ml', name: 'Malayalam' };
  }
  // Gujarati (\u0A80-\u0AFF)
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return { code: 'gu', name: 'Gujarati' };
  }
  // Gurmukhi (Punjabi) (\u0A00-\u0A7F)
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return { code: 'pa', name: 'Punjabi' };
  }
  // Arabic / Urdu (\u0600-\u06FF)
  if (/[\u0600-\u06FF]/.test(text)) {
    return { code: 'ur', name: 'Urdu' };
  }

  return { code: 'en', name: 'English' };
}

/**
 * Standard hazard safety instructions dictionary across languages
 */
const HAZARD_SAFETY_INSTRUCTIONS: Record<string, Record<string, string[]>> = {
  HEAVY_RAIN: {
    en: [
      'Avoid waterlogged low-lying roads and underpasses during intense downpours.',
      'Check local municipal drainage advisories before undertaking inter-district travel.',
      'Ensure agricultural drainage channels are cleared to prevent root submergence.',
      'Stay away from dilapidated structures and open electrical installations.',
    ],
    hi: [
      'भारी बारिश के दौरान जलभराव वाले निचले क्षेत्रों और अंडरपास में जाने से बचें।',
      'यात्रा करने से पहले जिला आपदा प्रबंधन की एडवाइजरी की पुष्टि करें।',
      'खेतों में जल निकासी की उचित व्यवस्था सुनिश्चित करें ताकि फसलें जलमग्न न हों।',
      'पुराने जीर्ण-शीर्ण भवनों और बिजली के खंभों/तारों से सुरक्षित दूरी बनाए रखें।',
    ],
    or: [
      'ପ୍ରବଳ ବର୍ଷା ସମୟରେ ଜଳବନ୍ଦୀ ତଳିଆ ଅଞ୍ଚଳ ଓ ଅଣ୍ଡରପାସ୍ ଯାତାୟାତରୁ ନିବୃତ୍ତ ରୁହନ୍ତୁ ।',
      'ଯାତ୍ରା ପୂର୍ବରୁ ଜିଲ୍ଲା ପ୍ରଶାସନ ଓ ବିପର୍ଯ୍ୟୟ ପରିଚାଳନା କର୍ତ୍ତୃପକ୍ଷଙ୍କ ବୁଲେଟିନ୍ ଅନୁସରଣ କରନ୍ତୁ ।',
      'ଜମିରୁ ବଳକା ପାଣି ନିଷ୍କାସନ ପାଇଁ ଡ୍ରେନେଜ୍ ବ୍ୟବସ୍ଥା ସୁନିଶ୍ଚିତ କରନ୍ତୁ ।',
      'ଦୁର୍ବଳ ଘର, ଗଛ ଏବଂ ବିଦ୍ୟୁତ୍ ତାର/ଖୁଣ୍ଟ ନିକଟରୁ ଦୂରେଇ ରୁହନ୍ତୁ ।',
    ],
    bn: [
      'ভারী বৃষ্টির সময় জলাবদ্ধ নিচু রাস্তা ও আন্ডারপাস এড়িয়ে চলুন।',
      'ভ্রমণের আগে জেলা দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষের নির্দেশিকা অনুসরণ করুন।',
      'ফসলের জমিতে অতিরিক্ত জল নিষ্কাশনের ব্যবস্থা রাখুন।',
      'ঝুঁকিপূর্ণ ভবন ও বৈদ্যুতিক খুঁটি থেকে নিরাপদ দূরত্ব বজায় রাখুন।',
    ],
    te: [
      'భారీ వర్షాల సమయంలో లోతట్టు ప్రాంతాలు మరియు నీటి నిల్వ ఉన్న రహదారుల వైపు వెళ్లవద్దు.',
      'ప్రయాణాలకు ముందు విపత్తు నిర్వహణ బులెటిన్‌లను పరిశీలించండి.',
      'పంట పొలాల్లో నీరు నిలవకుండా డ్రైనేజీ ఏర్పాట్లు చూసుకోండి.',
      'శిథిలావస్థలో ఉన్న భవనాలు మరియు విద్యుత్ స్తంభాలకు దూరంగా ఉండండి.',
    ],
    ta: [
      'கனமழையின் போது தாழ்வான பகுதிகள் மற்றும் சுரங்கப்பாதைகளைத் தவிர்க்கவும்.',
      'பயணங்களை மேற்கொள்ளும் முன் மாவட்ட பேரிடர் அறிவிப்புகளைப் பார்க்கவும்.',
      'விவசாய நிலங்களில் நீர் தேங்காமல் வடிகால் வசதி செய்யப்பட வேண்டும்.',
      'பழுதடைந்த கட்டிடங்கள் மற்றும் மின்கம்பங்களிலிருந்து விலகி இருக்கவும்.',
    ],
    kn: [
      'ಭಾರೀ ಮಳೆಯ ಸಮಯದಲ್ಲಿ ತಗ್ಗು ಪ್ರದೇಶಗಳು ಮತ್ತು ಜಲಾವೃತ ರಸ್ತೆಗಳಲ್ಲಿ ಸಂಚರಿಸಬೇಡಿ.',
      'ಪ್ರಯಾಣಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಸಲಹೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      'ಕೃಷಿ ಭೂಮಿಯಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಕಾಲುವೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.',
      'ಶಿಥಿಲ ಕಟ್ಟಡಗಳು ಮತ್ತು ವಿದ್ಯುತ್ ಕಂಬಗಳಿಂದ ದೂರವಿರಿ.',
    ],
    ml: [
      'ശക്തമായ മഴയുള്ളപ്പോൾ വെള്ളക്കെട്ടുള്ള പ്രദേശങ്ങളിലേക്കുള്ള യാത്ര ഒഴിവാക്കുക.',
      'യാത്രയ്ക്ക് മുൻപ് ദുരന്ത നിവാരണ അതോറിറ്റിയുടെ നിർദ്ദേശങ്ങൾ ശ്രദ്ധിക്കുക.',
      'കൃഷിയിടങ്ങളിൽ വെള്ളക്കെട്ട് ഒഴിവാക്കാൻ ഡ്രെയിനേജ് സംവിധാനം ഉറപ്പാക്കുക.',
      'പഴയ കെട്ടിടങ്ങൾക്കും വൈദ്യുത തൂണുകൾക്കും സമീപം നിൽക്കരുത്.',
    ],
    mr: [
      'मुसळधार पावसादरम्यान सखल भागातील साचलेल्या पाstat जाणे टाळावे.',
      'प्रवासाला निघण्यापूर्वी आपत्ती व्यवस्थापन विभागाच्या सूचना तपासा.',
      'शेतात पाणी साचू नये म्हणून पाण्याचा निचरा होण्याची व्यवस्था करावी.',
      'धोकादायक जुन्या इमारती आणि विजेच्या तारांपासून सुरक्षित अंतर ठेवा.',
    ],
    gu: [
      'ભારે વરસાદ દરમિયાન નીચાણવાળા પાણી ભરાયેલા રસ્તાઓ પર જવાનું ટાળો.',
      'મુસાફરી કરતા પહેલા જિલ્લા વહીવટીતંત્રની માર્ગદર્શિકા તપાસો.',
      'ખેતરોમાં પાણીનો ભરાવો ન થાય તે માટે નિકાલની વ્યવસ્થા કરો.',
      'જર્જરિત મકાનો અને વીજળીના થાંભલાઓથી દૂર રહો.',
    ],
    pa: [
      'ਭਾਰੀ ਮੀਂਹ ਦੌਰਾਨ ਪਾਣੀ ਭਰੇ ਨੀਵੇਂ ਇਲਾਕਿਆਂ ਵਿੱਚ ਜਾਣ ਤੋਂ ਬਚੋ।',
      'ਸਫ਼ਰ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਜ਼ਿਲ੍ਹਾ ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਦੀਆਂ ਹਦਾਇਤਾਂ ਦੀ ਜਾਂਚ ਕਰੋ।',
      'ਖੇਤਾਂ ਵਿੱਚ ਪਾਣੀ ਦੀ ਨਿਕਾਸੀ ਦਾ ਢੁਕਵਾਂ ਪ੍ਰਬੰਧ ਕਰੋ।',
      'ਕਮਜ਼ੋਰ ਇਮਾਰਤਾਂ ਅਤੇ ਬਿਜਲੀ ਦੇ ਖੰਭਿਆਂ ਤੋਂ ਦੂਰ ਰਹੋ।',
    ],
  },
  THUNDERSTORM: {
    en: [
      'Do not take shelter under isolated trees, metal sheds, or open fields during lightning activity.',
      'Unplug sensitive electronic appliances and avoid using wired landline telephones.',
      'If caught outdoors in an open area, crouch low on the balls of your feet; do not lie flat.',
      'Stay indoors until at least 30 minutes after the last clap of thunder is heard.',
    ],
    hi: [
      'आंधी और बिजली कड़कने के दौरान पेड़ों, धातु के शेड या खुले मैदानों में शरण न लें।',
      'संवेदनशील इलेक्ट्रॉनिक उपकरणों के प्लग निकाल दें और लैंडलाइन फोन का उपयोग न करें।',
      'यदि खुले में हों तो जमीन पर पैरों के पंजों के बल झुक जाएं, कभी भी सीधे जमीन पर न लेटें।',
      'अंतिम गड़गड़ाहट के कम से कम 30 मिनट बाद तक घर के अंदर ही सुरक्षित रहें।',
    ],
    or: [
      'ବଜ୍ରପାତ ସମୟରେ ଖୋଲା ପଡ଼ିଆ, ଗଛ ମୂଳ କିମ୍ବା ଟିଣ ଛାତ ତଳେ ଆଶ୍ରୟ ନିଅନ୍ତୁ ନାହିଁ ।',
      'ଘରେ ଥିବା ବୈଦ୍ୟୁତିକ ଉପକରଣଗୁଡ଼ିକର ପ୍ଲଗ୍ ଖୋଲି ଦିଅନ୍ତୁ ।',
      'ବାହାରେ ଥିଲେ ଆଣ୍ଠୁ ମାଡ଼ି ଗୋଡ଼ ଆଙ୍ଗୁଳି ଉପରେ ବସିପଡ଼ନ୍ତୁ, ଜମିରେ ସିଧା ଶୁଅନ୍ତୁ ନାହିଁ ।',
      'ବିଜୁଳି ଓ ଘଡ଼ଘଡ଼ି ଶେଷ ହେବାର ଅତି କମରେ ୩୦ ମିନିଟ୍ ପର୍ଯ୍ୟନ୍ତ ଘର ଭିତରେ ରୁହନ୍ତୁ ।',
    ],
    bn: [
      'বজ্রপাতের সময় খোলা মাঠ, বিচ্ছিন্ন গাছ বা ধাতব শেডের নিচে আশ্রয় নেবেন না।',
      'বৈদ্যুতিক সরঞ্জামের সংযোগ বিচ্ছিন্ন করুন।',
      'বাইরে থাকলে মাটিতে দুই পায়ের আঙুলের ওপর ভর দিয়ে বসে পড়ুন, শুয়ে পড়বেন না।',
      'শেষ বজ্রপাতের অন্তত ৩০ মিনিট পর পর্যন্ত ঘরের ভেতরে অবস্থান করুন।',
    ],
    te: [
      'ఉరుములు మరియు మెరుపుల సమయంలో చెట్ల కింద లేదా బహిరంగ ప్రదేశాలలో ఆశ్రయం పొందవద్దు.',
      'ఎలక్ట్రానిక్ పరికరాల ప్లగ్‌లను తీసివేయండి.',
      'బయట ఉంటే మోకాళ్లపై వంగి కూర్చోండి, నేలపై పడుకోవద్దు.',
      'చివరి ఉరుము వినిపించిన తర్వాత కనీసం 30 నిమిషాల వరకు ఇంట్లోనే ఉండండి.',
    ],
    ta: [
      'இடி மின்னலின் போது மரங்களின் கீழோ அல்லது திறந்தவெளியிலோ தஞ்சம் புகாதீர்கள்.',
      'மின்சாதனங்களின் இணைப்புகளைத் துண்டிக்கவும்.',
      'வெளியில் இருந்தால் கால்களின் முன்பகுதியில் உடலை குறுக்கி உட்காரவும்.',
      'கடைசி இடி சத்தம் கேட்ட பிறகு குறைந்தது 30 நிமிடங்கள் வரை வீட்டிற்குள் இருக்கவும்.',
    ],
  },
};

/**
 * Standard fallback template for synthesizing localized summaries
 * without modifying or falsifying official quotes.
 */
function buildLocalizedSummary(
  warning: WeatherWarning,
  targetLangCode: string,
  regionConfig: RegionLanguageConfig
): string {
  const hazardName = getLocalizedHazard(warning.hazard, targetLangCode);
  const severityText = getLocalizedSeverity(warning.severity, targetLangCode);
  const stateOrRegion = warning.state || regionConfig.regionName;
  const districts = warning.affectedRegions && warning.affectedRegions.length > 0
    ? warning.affectedRegions.slice(0, 5).join(', ')
    : warning.district || stateOrRegion;

  switch (targetLangCode) {
    case 'hi':
      return `${stateOrRegion} (${districts}) के लिए ${hazardName} हेतु ${severityText} जारी। नागरिक सतर्क रहें एवं आधिकारिक परामर्श का पालन करें।`;
    case 'or':
      return `${stateOrRegion} (${districts}) ପାଇଁ ${hazardName} ପରିପ୍ରେକ୍ଷୀରେ ${severityText} ଜାରି କରାଯାଇଛି । ସତର୍କ ରୁହନ୍ତୁ ଓ ସରକାରୀ ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ ।`;
    case 'bn':
      return `${stateOrRegion} (${districts})-এর জন্য ${hazardName} সংক্রান্ত ${severityText} জারি করা হয়েছে। নাগরিকগণ সতর্ক থাকুন।`;
    case 'te':
      return `${stateOrRegion} (${districts}) ప్రాంతానికి ${hazardName} దృష్ట్యా ${severityText} జారీ చేయబడింది. ప్రజలు అప్రమత్తంగా ఉండగలరు.`;
    case 'ta':
      return `${stateOrRegion} (${districts}) பகுதிக்கு ${hazardName} முன்னிட்டு ${severityText} விடுக்கப்பட்டுள்ளது. பொதுமக்கள் பாதுகாப்பாக இருக்கவும்.`;
    case 'kn':
      return `${stateOrRegion} (${districts}) ವಲಯಕ್ಕೆ ${hazardName} ಹಿನ್ನೆಲೆಯಲ್ಲಿ ${severityText} ಹೊರಡಿಸಲಾಗಿದೆ. ಸಾರ್ವಜನಿಕರು ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.`;
    case 'ml':
      return `${stateOrRegion} (${districts}) മേഖലയിൽ ${hazardName} മുൻനിർത്തി ${severityText} പുറപ്പെടുവിച്ചു. പൊതുജനങ്ങൾ ജാഗ്രത പാലിക്കുക.`;
    case 'mr':
      return `${stateOrRegion} (${districts}) करिता ${hazardName} अनुषंगाने ${severityText} जारी करण्यात आला आहे. नागरिकांनी दक्षता बाळगावी.`;
    case 'gu':
      return `${stateOrRegion} (${districts}) માટે ${hazardName} સંદર્ભે ${severityText} જારી કરવામાં આવી છે. નાગરિકો સાવચેત રહે.`;
    case 'pa':
      return `${stateOrRegion} (${districts}) ਲਈ ${hazardName} ਸਬੰਧੀ ${severityText} ਜਾਰੀ ਕੀਤਾ ਗਿਆ ਹੈ। ਨਾਗਰਿਕ ਸੁਚੇਤ ਰਹਿਣ।`;
    case 'as':
      return `${stateOrRegion} (${districts})ৰ বাবে ${hazardName} সন্দৰ্ভত ${severityText} জাৰি কৰা হৈছে। নাগৰিকসকল সতৰ୍କ থাকক।`;
    case 'ur':
      return `${stateOrRegion} (${districts}) کے لیے ${hazardName} کے پیش نظر ${severityText} جاری کیا گیا ہے۔ شہری محتاط رہیں۔`;
    case 'en':
    default:
      return `${severityText} issued for ${hazardName} across ${stateOrRegion} (${districts}). Public advisory in effect. Follow official directives.`;
  }
}

/**
 * Main Content Localization Pipeline
 * Adheres strictly to the provenance rules:
 * - Direct official text is never machine-translated and falsely claimed as government quote.
 * - When target language matches the official source text, it is rendered verbatim with OFFICIAL GOVERNMENT NOTICE badge.
 * - When target language differs, a clear TRANSLATED SUMMARY badge is rendered, and the verbatim official text is preserved underneath.
 */
export function getLocalizedWarningContent(
  warning: WeatherWarning | null | undefined,
  targetLangCode: string,
  regionConfig: RegionLanguageConfig
): LocalizedWarningDisplay {
  if (!warning) {
    const allClearTitle = getAlertLabel('allClear', targetLangCode);
    const allClearDesc = getAlertLabel('allClearSub', targetLangCode);
    return {
      headline: allClearTitle,
      description: allClearDesc,
      isOfficialQuote: true,
      badgeLabel: getAlertLabel('officialGovtNotice', targetLangCode),
      officialText: allClearTitle,
      officialLanguageCode: targetLangCode,
      officialLanguageName: 'Official',
      hasUntranslatedOriginal: false,
      hazardLabel: 'NORMAL',
      severityLabel: getLocalizedSeverity('GREEN', targetLangCode),
      stateOrRegionLabel: regionConfig.regionName,
      affectedRegions: [regionConfig.regionName],
      safetyInstructions: [],
    };
  }

  const rawOfficialText = (warning.title || warning.description || '').trim();
  const detected = detectTextLanguage(rawOfficialText);

  // Check if target language matches official text language
  const isDirectLanguageMatch =
    targetLangCode === detected.code ||
    (targetLangCode === 'en' && detected.code === 'en') ||
    (targetLangCode === 'hi' && detected.code === 'hi') ||
    (targetLangCode === 'or' && detected.code === 'or') ||
    (targetLangCode === 'bn' && detected.code === 'bn');

  let headline: string;
  let isOfficialQuote: boolean;
  let badgeLabel: string;
  let hasUntranslatedOriginal: boolean;

  if (isDirectLanguageMatch) {
    // Exact official text matches user's chosen display language
    headline = rawOfficialText;
    isOfficialQuote = true;
    badgeLabel = getAlertLabel('officialGovtNotice', targetLangCode);
    hasUntranslatedOriginal = false;
  } else {
    // Generate an accurate structured summary in user's target language
    // and preserve untouched official text underneath
    headline = buildLocalizedSummary(warning, targetLangCode, regionConfig);
    isOfficialQuote = false;
    badgeLabel = getAlertLabel('translatedSummary', targetLangCode);
    hasUntranslatedOriginal = true;
  }

  // Localized instructions
  const hazardKey = String(warning.hazard);
  const instructionMap = HAZARD_SAFETY_INSTRUCTIONS[hazardKey] || HAZARD_SAFETY_INSTRUCTIONS.HEAVY_RAIN;
  const safetyInstructions =
    instructionMap[targetLangCode] ||
    instructionMap.hi ||
    instructionMap.en ||
    warning.instructions ||
    [];

  return {
    headline,
    description: warning.description && warning.description !== rawOfficialText ? warning.description : getAlertLabel('disasterAdvisory', targetLangCode),
    isOfficialQuote,
    badgeLabel,
    officialText: rawOfficialText,
    officialLanguageCode: detected.code,
    officialLanguageName: detected.name,
    hasUntranslatedOriginal,
    hazardLabel: getLocalizedHazard(warning.hazard, targetLangCode),
    severityLabel: getLocalizedSeverity(warning.severity, targetLangCode),
    stateOrRegionLabel: getLocalizedStateName(warning.state || regionConfig.regionName, targetLangCode),
    affectedRegions: warning.affectedRegions && warning.affectedRegions.length > 0
      ? warning.affectedRegions
      : [warning.district || warning.state || regionConfig.regionName],
    safetyInstructions,
  };
}
