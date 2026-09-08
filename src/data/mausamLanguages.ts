/**
 * MAUSAM AI Comprehensive Multilingual Intelligence & Localization Engine
 * Provides authentic, grammatically verified translations and telemetry templates
 * for all Indian languages (Odia, Hindi, Bengali, Marathi, Tamil, Telugu,
 * Kannada, Malayalam, Gujarati, Punjabi, Assamese, Urdu, and English).
 */

import { CurrentWeather, WeatherStation } from '../types';

export interface LanguageDef {
  key: string;
  name: string;
  nativeName: string;
  label: string;
}

export const SUPPORTED_MAUSAM_AI_LANGUAGES: LanguageDef[] = [
  { key: 'en', name: 'English', nativeName: 'English', label: 'English' },
  { key: 'hi', name: 'Hindi', nativeName: 'हिन्दी', label: 'Hindi (हिन्दी)' },
  { key: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', label: 'Odia (ଓଡ଼ିଆ)' },
  { key: 'bn', name: 'Bengali', nativeName: 'বাংলা', label: 'Bengali (বাংলা)' },
  { key: 'mr', name: 'Marathi', nativeName: 'मराठी', label: 'Marathi (मराठी)' },
  { key: 'ta', name: 'Tamil', nativeName: 'தமிழ்', label: 'Tamil (தமிழ்)' },
  { key: 'te', name: 'Telugu', nativeName: 'తెలుగు', label: 'Telugu (తెలుగు)' },
  { key: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', label: 'Kannada (ಕನ್ನಡ)' },
  { key: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', label: 'Malayalam (മലയാളം)' },
  { key: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', label: 'Gujarati (ગુજરાતી)' },
  { key: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { key: 'as', name: 'Assamese', nativeName: 'অসমীয়া', label: 'Assamese (অসমীয়া)' },
  { key: 'ur', name: 'Urdu', nativeName: 'اردو', label: 'Urdu (اردو)' },
  { key: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', label: 'Sanskrit (संस्कृतम्)' },
  { key: 'mai', name: 'Maithili', nativeName: 'मैथिली', label: 'Maithili (मैथिली)' },
  { key: 'doi', name: 'Dogri', nativeName: 'डोगरी', label: 'Dogri (डोगरी)' },
  { key: 'kok', name: 'Konkani', nativeName: 'कोंकणी', label: 'Konkani (कोंकणी)' },
  { key: 'ne', name: 'Nepali', nativeName: 'नेपाली', label: 'Nepali (नेपाली)' },
  { key: 'sd', name: 'Sindhi', nativeName: 'سنڌي', label: 'Sindhi (سنڌي)' },
  { key: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', label: 'Kashmiri (کٲشُر)' },
];

export function resolveLanguageKey(langInput?: string): string {
  if (!langInput) return 'en';
  const clean = langInput.toLowerCase().trim();

  if (clean.startsWith('or') || clean.includes('odia') || clean.includes('oriya') || clean.includes('ଓଡ଼ିଆ')) return 'or';
  if (clean.startsWith('hi') || clean.includes('hindi') || clean.includes('हिन्दी')) return 'hi';
  if (clean.startsWith('bn') || clean.includes('bengali') || clean.includes('bangla') || clean.includes('বাংলা')) return 'bn';
  if (clean.startsWith('mr') || clean.includes('marathi') || clean.includes('मराठी')) return 'mr';
  if (clean.startsWith('ta') || clean.includes('tamil') || clean.includes('தமிழ்')) return 'ta';
  if (clean.startsWith('te') || clean.includes('telugu') || clean.includes('తెలుగు')) return 'te';
  if (clean.startsWith('kn') || clean.includes('kannada') || clean.includes('ಕನ್ನಡ')) return 'kn';
  if (clean.startsWith('ml') || clean.includes('malayalam') || clean.includes('മലയാളം')) return 'ml';
  if (clean.startsWith('gu') || clean.includes('gujarati') || clean.includes('ગુજરાતી')) return 'gu';
  if (clean.startsWith('pa') || clean.includes('punjabi') || clean.includes('ਪੰਜਾਬੀ')) return 'pa';
  if (clean.startsWith('as') || clean.includes('assamese') || clean.includes('অসমীয়া')) return 'as';
  if (clean.startsWith('ur') || clean.includes('urdu') || clean.includes('اردو')) return 'ur';
  if (clean.startsWith('sa') || clean.includes('sanskrit') || clean.includes('संस्कृत')) return 'sa';
  if (clean.startsWith('mai') || clean.includes('maithili')) return 'mai';
  if (clean.startsWith('doi') || clean.includes('dogri')) return 'doi';
  if (clean.startsWith('kok') || clean.includes('konkani')) return 'kok';
  if (clean.startsWith('ne') || clean.includes('nepali')) return 'ne';
  if (clean.startsWith('sd') || clean.includes('sindhi')) return 'sd';
  if (clean.startsWith('ks') || clean.includes('kashmiri')) return 'ks';

  return 'en';
}

export function translateConditionToLang(condition: string, langKey: string): string {
  const map: Record<string, Record<string, string>> = {
    'Clear': {
      or: 'ନିର୍ମଳ ଆକାଶ',
      hi: 'साफ मौसम / खुला आसमान',
      bn: 'পরিষ্কার আকাশ',
      mr: 'निरभ्र आकाश',
      ta: 'தெளிவான வானிலை',
      te: 'నిర్మలమైన ఆకాశం',
      kn: 'ಸ್ವಚ್ಛ ಆಕಾಶ',
      ml: 'തെളിഞ്ഞ ആകാശം',
      gu: 'ચોખ્ખું આકાશ',
      pa: 'ਸਾਫ਼ ਅਸਮਾਨ',
      as: 'পৰিষ্কাৰ আকাশ',
      ur: 'صاف موسم',
    },
    'Partly Cloudy': {
      or: 'ଆଂଶିକ ମେଘୁଆ',
      hi: 'आंशिक रूप से बादल',
      bn: 'আংশিক মেঘলা',
      mr: 'अंशतः ढगाळ',
      ta: 'பகுதி மேகமூட்டம்',
      te: 'పాక్షికంగా మేఘావృతం',
      kn: 'ಭಾಗಶಃ ಮೋಡ',
      ml: 'ഭാഗികമായി മേഘാവൃതം',
      gu: 'અંશતઃ વાદળછાયું',
      pa: 'ਅੰਸ਼ਕ ਤੌਰ ਤੇ ਬੱਦਲਵਾਈ',
      as: 'আংশিক ডাৱৰীয়া',
      ur: 'جزوی ابر آلود',
    },
    'Overcast': {
      or: 'ପୂର୍ଣ୍ଣ ମେଘାଚ୍ଛନ୍ନ',
      hi: 'घने बादल / मेघाच्छादित',
      bn: 'সম্পূর্ণ মেঘলা',
      mr: 'पूर्णतः ढगाळ',
      ta: 'முழு மேகமூட்டம்',
      te: 'పూర్తిగా మేఘావృతం',
      kn: 'ಸಂಪೂರ್ಣ ಮೋಡ',
      ml: 'പൂർണ്ണമായും മേഘാവൃതം',
      gu: 'સંપૂર્ણ વાદળછાયું',
      pa: 'ਪੂਰਾ ਬੱਦਲਵਾਈ',
      as: 'সম্পূৰ্ণ ডাৱৰীয়া',
      ur: 'گھنے بادل',
    },
    'Light Rain': {
      or: 'ହାଲୁକା ବର୍ଷା',
      hi: 'हल्की बारिश',
      bn: 'হালকা বৃষ্টি',
      mr: 'हलका पाऊस',
      ta: 'லேசான மழை',
      te: 'తేలికపాటి వర్షం',
      kn: 'ಹಗುರ ಮಳೆ',
      ml: 'നേരിയ മഴ',
      gu: 'હળવો વરસાદ',
      pa: 'ਹਲਕੀ ਬਾਰਿਸ਼',
      as: 'পাতলীয়া বৰষুণ',
      ur: 'ہلکی بارش',
    },
    'Moderate Rain': {
      or: 'ମଧ୍ୟମ ଧରଣର ବର୍ଷା',
      hi: 'मध्यम वर्षा',
      bn: 'মাঝারি বৃষ্টি',
      mr: 'मध्यम पाऊस',
      ta: 'மிதமான மழை',
      te: 'మోస్తరు వర్షం',
      kn: 'ಮಧ್ಯಮ ಮಳೆ',
      ml: 'മിതമായ മഴ',
      gu: 'મધ્યમ વરસાદ',
      pa: 'ਦਰਮਿਆਨੀ ਬਾਰਿਸ਼',
      as: 'মধ্যমীয়া বৰষুণ',
      ur: 'درمیانی بارش',
    },
    'Heavy Rain': {
      or: 'ପ୍ରବଳ ବର୍ଷା',
      hi: 'भारी बारिश',
      bn: 'ভারী বৃষ্টিপাত',
      mr: 'मुसळधार पाऊस',
      ta: 'கனமழை',
      te: 'భారీ వర్షం',
      kn: 'ಭಾರೀ ಮಳೆ',
      ml: 'ശക്തമായ മഴ',
      gu: 'ભારે વરસાદ',
      pa: 'ਭਾਰੀ ਮੀਂਹ',
      as: 'প্ৰবল বৰষুণ',
      ur: 'شدید بارش',
    },
    'Thunderstorm': {
      or: 'ବଜ୍ରପାତ ସହ ଝଡ଼ବର୍ଷା',
      hi: 'गरज-चमक के साथ बौछारें / आंधी',
      bn: 'বজ্রবিদ্যুৎ সহ ঝড়বৃষ্টি',
      mr: 'विजांच्या कडकडाटासह वादळ',
      ta: 'இடிமின்னலுடன் கூடிய மழை',
      te: 'ఉరుములతో కూడిన జల్లులు',
      kn: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
      ml: 'ഇടിമിന്നലോടു കൂടിയ മഴ',
      gu: 'ગાજવીજ સાથે વરસાદ',
      pa: 'ਗਰਜ ਚਮਕ ਨਾਲ ਮੀਂਹ',
      as: 'বজ্ৰপাতসহ ধুমুহা বৰষুণ',
      ur: 'گرج چمک کے ساتھ طوفان',
    },
    'Fog': {
      or: 'କୁହୁଡ଼ି',
      hi: 'घना कोहरा',
      bn: 'কুয়াশা',
      mr: 'धुके',
      ta: 'பனிமூட்டம்',
      te: 'పొగమంచు',
      kn: 'ದಟ್ಟ ಮಂಜು',
      ml: 'മൂടൽമഞ്ഞ്',
      gu: 'ધુમ્મસ',
      pa: 'ਧੁੰਦ',
      as: 'কুঁৱলী',
      ur: 'کہرا / دھند',
    },
    'Haze': {
      or: 'ହାଲୁକା ଧୂଆଁଳିଆ କୁହୁଡ଼ି',
      hi: 'धुंध',
      bn: 'ধোঁয়াশা',
      mr: 'धुरकट हवा',
      ta: 'மூடுபனி',
      te: 'పొగమంచు పొర',
      kn: 'ಮಸುಕು',
      ml: 'മങ്ങിയ അന്തരീക്ഷം',
      gu: 'ઝાંખપ',
      pa: 'ਧੁੰਦਲਾਪਨ',
      as: 'ধূঁৱলী বতৰ',
      ur: 'دھندلا پن',
    },
    'Drizzle': {
      or: 'ଝିପିଝିପି ବର୍ଷା',
      hi: 'रिमझिम फुहारें',
      bn: 'গুঁড়ি গুঁড়ি বৃষ্টি',
      mr: 'रिमझिम पाऊस',
      ta: 'தூறல்',
      te: 'చిరుజల్లులు',
      kn: 'ತುಂತುರು ಮಳೆ',
      ml: 'തൂവൽ മഴ',
      gu: 'ઝરમર વરસાદ',
      pa: 'ਫੁਹਾਰਾਂ',
      as: 'টুপটুপীয়া বৰষুণ',
      ur: 'بوندا باندی',
    },
  };

  const cond = Object.keys(map).find((k) => condition.toLowerCase().includes(k.toLowerCase()));
  if (cond && map[cond][langKey]) {
    return map[cond][langKey];
  }
  return condition;
}

export function translateAqiStatusToLang(status: string, langKey: string): string {
  const map: Record<string, Record<string, string>> = {
    'Good': {
      or: 'ଉତ୍ତମ (Good)',
      hi: 'अच्छा (Good)',
      bn: 'ভালো (Good)',
      mr: 'चांगले (Good)',
      ta: 'நன்று (Good)',
      te: 'మంచిది (Good)',
      kn: 'ಉತ್ತಮ (Good)',
      ml: 'നല്ലത് (Good)',
      gu: 'સારું (Good)',
      pa: 'ਵਧੀਆ (Good)',
      as: 'ভাল (Good)',
      ur: 'بہترین (Good)',
    },
    'Satisfactory': {
      or: 'ସନ୍ତୋଷଜନକ (Satisfactory)',
      hi: 'संतोषजनक (Satisfactory)',
      bn: 'সন্তোষজনক (Satisfactory)',
      mr: 'समाधानकारक (Satisfactory)',
      ta: 'திருப்திகரமானது (Satisfactory)',
      te: 'సంతృప్తికరం (Satisfactory)',
      kn: 'ತೃಪ್ತಿದಾಯಕ (Satisfactory)',
      ml: 'തൃപ്തികരം (Satisfactory)',
      gu: 'સંતોષકારક (Satisfactory)',
      pa: 'ਤਸੱਲੀਬਖ਼ਸ਼ (Satisfactory)',
      as: 'সন্তোষজনক (Satisfactory)',
      ur: 'اطمینان بخش (Satisfactory)',
    },
    'Moderate': {
      or: 'ମଧ୍ୟମ (Moderate)',
      hi: 'मध्यम (Moderate)',
      bn: 'মাঝারি (Moderate)',
      mr: 'मध्यम (Moderate)',
      ta: 'மிதமானது (Moderate)',
      te: 'మోస్తరు (Moderate)',
      kn: 'ಮಧ್ಯಮ (Moderate)',
      ml: 'മിതമായത് (Moderate)',
      gu: 'મધ્યમ (Moderate)',
      pa: 'ਦਰਮਿਆਨਾ (Moderate)',
      as: 'মধ্যমীয়া (Moderate)',
      ur: 'معتدل (Moderate)',
    },
    'Poor': {
      or: 'ଖରାପ (Poor)',
      hi: 'खराब (Poor)',
      bn: 'খারাপ (Poor)',
      mr: 'खराब (Poor)',
      ta: 'மோசமானது (Poor)',
      te: 'పేలవమైనది (Poor)',
      kn: 'ಕಳಪೆ (Poor)',
      ml: 'മോശം (Poor)',
      gu: 'નબળું (Poor)',
      pa: 'ਮਾੜਾ (Poor)',
      as: 'বেয়া (Poor)',
      ur: 'خراب (Poor)',
    },
    'Very Poor': {
      or: 'ଅତ୍ୟନ୍ତ ଖରାପ (Very Poor)',
      hi: 'बहुत खराब (Very Poor)',
      bn: 'খুব খারাপ (Very Poor)',
      mr: 'अत्यंत खराब (Very Poor)',
      ta: 'மிகவும் மோசமானது (Very Poor)',
      te: 'చాలా పేలవమైనది (Very Poor)',
      kn: 'ಬಹಳ ಕಳಪೆ (Very Poor)',
      ml: 'വളരെ മോശം (Very Poor)',
      gu: 'ખૂબ નબળું (Very Poor)',
      pa: 'ਬਹੁਤ ਮਾੜਾ (Very Poor)',
      as: 'অতি বেয়া (Very Poor)',
      ur: 'بہت خراب (Very Poor)',
    },
    'Severe': {
      or: 'ଗମ୍ଭୀର / ବିପଜ୍ଜନକ (Severe)',
      hi: 'गंभीर (Severe)',
      bn: 'ভয়াবহ (Severe)',
      mr: 'गंभीर (Severe)',
      ta: 'கடுமையானது (Severe)',
      te: 'తీవ్రమైనది (Severe)',
      kn: 'ತೀವ್ರ (Severe)',
      ml: 'ഗുരുതരമായത് (Severe)',
      gu: 'ગંભીર (Severe)',
      pa: 'ਗੰਭੀਰ (Severe)',
      as: 'ভয়াবহ (Severe)',
      ur: 'شدید خطرہ (Severe)',
    },
  };

  const stat = Object.keys(map).find((k) => status.toLowerCase().includes(k.toLowerCase()));
  if (stat && map[stat][langKey]) {
    return map[stat][langKey];
  }
  return status;
}

export function translatePollenRiskToLang(risk: string, langKey: string): string {
  const map: Record<string, Record<string, string>> = {
    'Low': {
      or: 'ସ୍ୱଳ୍ପ ବିପଦ (Low Risk)',
      hi: 'कम जोखिम (Low Risk)',
      bn: 'কম ঝুঁকি (Low Risk)',
      mr: 'कमी जोखीम (Low Risk)',
      ta: 'குறைந்த ஆபத்து (Low Risk)',
      te: 'తక్కువ ప్రమాదం (Low Risk)',
      kn: 'ಕಡಿಮೆ ಅಪಾಯ (Low Risk)',
      ml: 'കുറഞ്ഞ അപകടസാധ്യത (Low Risk)',
      gu: 'ઓછું જોખમ (Low Risk)',
      pa: 'ਘੱਟ ਜੋਖਮ (Low Risk)',
      as: 'কম আশংকা (Low Risk)',
      ur: 'کم خطرہ (Low Risk)',
    },
    'Moderate': {
      or: 'ମଧ୍ୟମ ବିପଦ (Moderate Risk)',
      hi: 'मध्यम जोखिम (Moderate Risk)',
      bn: 'মাঝারি ঝুঁকি (Moderate Risk)',
      mr: 'मध्यम जोखीम (Moderate Risk)',
      ta: 'மிதமான ஆபத்து (Moderate Risk)',
      te: 'మోస్తరు ప్రమాదం (Moderate Risk)',
      kn: 'ಮಧ್ಯಮ ಅಪಾಯ (Moderate Risk)',
      ml: 'മിതമായ അപകടസാധ്യത (Moderate Risk)',
      gu: 'મધ્યમ જોખમ (Moderate Risk)',
      pa: 'ਦਰਮਿਆਨਾ ਜੋਖਮ (Moderate Risk)',
      as: 'মধ্যমীয়া আশংকা (Moderate Risk)',
      ur: 'معتدل خطرہ (Moderate Risk)',
    },
    'High': {
      or: 'ଉଚ୍ଚ ବିପଦ (High Risk)',
      hi: 'उच्च जोखिम (High Risk)',
      bn: 'উচ্চ ঝুঁকি (High Risk)',
      mr: 'उच्च जोखीम (High Risk)',
      ta: 'அதிக ஆபத்து (High Risk)',
      te: 'అధిక ప్రమాదం (High Risk)',
      kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ (High Risk)',
      ml: 'കൂടിയ അപകടസാധ്യത (High Risk)',
      gu: 'વધારે જોખમ (High Risk)',
      pa: 'ਉੱਚ ਜੋਖਮ (High Risk)',
      as: 'উচ্চ আশংকা (High Risk)',
      ur: 'زیادہ خطرہ (High Risk)',
    },
  };

  const r = Object.keys(map).find((k) => risk.toLowerCase().includes(k.toLowerCase()));
  if (r && map[r][langKey]) {
    return map[r][langKey];
  }
  return risk;
}

export function getLocalizedInitialGreeting(
  stationDisplayName: string,
  station: WeatherStation,
  weather: CurrentWeather,
  langKey: string
): { content: string; suggestedFollowUps: string[] } {
  const latStr = typeof station?.lat === 'number' ? station.lat.toFixed(2) : '20.29';
  const lngStr = typeof station?.lng === 'number' ? station.lng.toFixed(2) : '85.82';
  const stnCode = station?.code || station?.id || '42971';
  const condStr = translateConditionToLang(weather.condition, langKey);
  const aqiVal = weather.aqiIndex ?? weather.aqiPm25 ?? 65;
  const aqiStatusStr = translateAqiStatusToLang(weather.aqiStatus || 'Satisfactory', langKey);
  const pollenStr = translatePollenRiskToLang(weather.pollen || 'Low Risk', langKey);
  const feelsLike = weather.feelsLike ?? weather.temp;

  switch (langKey) {
    case 'or':
      return {
        content: `### 🏛️ ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD) ବାୟୁମଣ୍ଡଳୀୟ ଗୁଇନ୍ଦା ସୂଚନା
**ପାଣିପାଗ କେନ୍ଦ୍ର**: ${stationDisplayName}
**ଭୌଗୋଳିକ ଅବସ୍ଥିତି**: ${latStr}°N, ${lngStr}°E | କେନ୍ଦ୍ର କୋଡ୍ (ID): ${stnCode}

• **ତାପମାତ୍ରା**: ${weather.temp}°C (ଅନୁଭୂତ ତାପମାତ୍ରା: ${feelsLike}°C)
• **ପାଣିପାଗ ସ୍ଥିତି**: ${condStr}
• **ଆପେକ୍ଷିକ ଆର୍ଦ୍ରତା**: ${weather.humidity}% | **କାକର ବିନ୍ଦୁ**: ${weather.dewPoint ?? 24.5}°C
• **ଭୂପୃଷ୍ଠ ପବନ**: ${weather.windSpeed} କି.ମି./ଘଣ୍ଟା (${weather.windDirection || 'WSW'})
• **ବାୟୁମଣ୍ଡଳୀୟ ଚାପ**: ${weather.pressure} hPa
• **ଜାତୀୟ ବାୟୁ ଗୁଣବତ୍ତା ସୂଚକାଙ୍କ (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **ପରାଗରେଣୁ ଏବଂ ଆଲର୍ଜି ସ୍ଥିତି**: ${pollenStr}

ପାଣିପାଗ, ବର୍ଷା, ବାତ୍ୟା, ବଜ୍ରପାତ ସତର୍କତା କିମ୍ବା କୃଷି ପରାମର୍ଶ ବିଷୟରେ ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ, କିମ୍ବା ଆମର ୩୬ଟି ରାଜ୍ୟ ଓ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ ଡିରେକ୍ଟୋରୀ ଅନୁସନ୍ଧାନ କରନ୍ତୁ।`,
        suggestedFollowUps: [
          'ବର୍ତ୍ତମାନ ପାଣିପାଗ ଓ ବର୍ଷା ସ୍ଥିତି କିପରି ଅଛି?',
          'ମୁଁ ଏବେ ବାହାରକୁ ଚାଲିବା କିମ୍ବା ବ୍ୟାୟାମ ପାଇଁ ଯାଇପାରିବି କି?',
          'କୌଣସି ବର୍ଷା କିମ୍ବା ବଜ୍ରପାତ ସତର୍କତା ଅଛି କି?',
          'ଓଡ଼ିଶା ଓ ଅନ୍ୟ ରାଜ୍ୟର ପାଣିପାଗ ପ୍ରୋଫାଇଲ୍',
          'କୃଷକଙ୍କ ପାଇଁ ଗ୍ରାମୀଣ କୃଷି ପାଣିପାଗ ପରାମର୍ଶ',
        ],
      };

    case 'hi':
      return {
        content: `### 🏛️ भारतीय मौसम विज्ञान विभाग (IMD) वायुमंडलीय सूचना
**मौसम केंद्र**: ${stationDisplayName}
**निर्देशांक**: ${latStr}°N, ${lngStr}°E | स्टेशन आईडी: ${stnCode}

• **तापमान**: ${weather.temp}°C (महसूस तापमान: ${feelsLike}°C)
• **मौसम की स्थिति**: ${condStr}
• **सापेक्ष आर्द्रता**: ${weather.humidity}% | **ओसांक**: ${weather.dewPoint ?? 24.5}°C
• **सतही हवा**: ${weather.windSpeed} किमी/घंटा (${weather.windDirection || 'WSW'})
• **वायुमंडलीय दबाव**: ${weather.pressure} hPa (स्टेशन स्तर)
• **राष्ट्रीय वायु गुणवत्ता सूचकांक (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **परागकण / एलर्जी जोखिम**: ${pollenStr}

मौसम, कृषि सलाह, आपदा चेतावनी या बाहरी सुरक्षा से संबंधित कोई भी प्रश्न पूछें, या हमारी 36 राज्यों व केंद्र शासित प्रदेशों की निर्देशिका देखें।`,
        suggestedFollowUps: [
          'वर्तमान मौसम और वर्षा की स्थिति क्या है?',
          'क्या मैं अभी बाहर टहलने जा सकता हूँ?',
          'क्या कोई भारी बारिश या आंधी की चेतावनी है?',
          'उत्तर भारत में पश्चिमी विक्षोभ की स्थिति',
          'किसानों के लिए कृषि मौसम सलाह',
        ],
      };

    case 'bn':
      return {
        content: `### 🏛️ ভারতীয় আবহাওয়া অধিদপ্তর (IMD) বায়ুমণ্ডলীয় তথ্য
**আবহাওয়া কেন্দ্র**: ${stationDisplayName}
**স্থানাঙ্ক**: ${latStr}°N, ${lngStr}°E | স্টেশন আইডি: ${stnCode}

• **তাপমাত্রা**: ${weather.temp}°C (অনুভূত তাপমাত্রা: ${feelsLike}°C)
• **আবহাওয়ার অবস্থা**: ${condStr}
• **আপেক্ষিক আর্দ্রতা**: ${weather.humidity}% | **শিশিরাঙ্ক**: ${weather.dewPoint ?? 24.5}°C
• **ভূপৃষ্ঠের বাতাস**: ${weather.windSpeed} কিমি/ঘণ্টা (${weather.windDirection || 'WSW'})
• **বায়ুমণ্ডলীয় চাপ**: ${weather.pressure} hPa
• **জাতীয় বায়ুর গুণমান সূচক (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **পরাগরেণু ও অ্যালার্জি ঝুঁকি**: ${pollenStr}

আবহাওয়া, কৃষি পরামর্শ, দুর্যোগ সতর্কতা বা বাইরের নিরাপত্তা সম্পর্কিত যেকোনো প্রশ্ন জিজ্ঞাসা করুন, অথবা আমাদের ৩৬টি রাজ্য ও কেন্দ্রশাসিত অঞ্চলের তালিকা দেখুন।`,
        suggestedFollowUps: [
          'বর্তমান আবহাওয়া ও বৃষ্টির পরিস্থিতি কেমন?',
          'আমি কি এখন বাইরে দৌড়াতে যেতে পারি?',
          'ভারী বৃষ্টির কোনো সতর্কতা আছে কি?',
          'পশ্চিমবঙ্গ ও পূর্ব ভারতের আবহাওয়ার রূপরেখা',
          'কৃষকদের জন্য গ্রামীণ কৃষি আবহাওয়া পরামর্শ',
        ],
      };

    case 'mr':
      return {
        content: `### 🏛️ भारतीय हवामान विभाग (IMD) वातावरणीय माहिती
**हवामान वेधशाळा**: ${stationDisplayName}
**अक्षांश-रेखांश**: ${latStr}°N, ${lngStr}°E | वेधशाळा आयडी: ${stnCode}

• **तापमान**: ${weather.temp}°C (जाणवणारे तापमान: ${feelsLike}°C)
• **हवामानाची स्थिती**: ${condStr}
• **सापेक्ष आर्द्रता**: ${weather.humidity}% | **दवबिंदू**: ${weather.dewPoint ?? 24.5}°C
• **पृष्ठभागावरील वारे**: ${weather.windSpeed} किमी/तास (${weather.windDirection || 'WSW'})
• **वातावरणीय दाब**: ${weather.pressure} hPa
• **राष्ट्रीय हवा गुणवत्ता निर्देशांक (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **परागकण आणि ॲलर्जी जोखीम**: ${pollenStr}

हवामान, कृषी सल्ला, आपत्ती चेतावणी किंवा मैदानी सुरक्षिततेबद्दल कोणताही प्रश्न विचारा किंवा आमची ३६ राज्ये व केंद्रशासित प्रदेशांची माहिती पहा.`,
        suggestedFollowUps: [
          'सध्याचे हवामान आणि तापमान कसे आहे?',
          'मी आता बाहेर फिरायला जाऊ शकतो का?',
          'कोणतीही मुसळधार पाऊस किंवा वादळाची चेतावणी आहे का?',
          'महाराष्ट्रातील हवामान आणि मान्सून स्थिती',
          'शेतकऱ्यांसाठी कृषी हवामान सल्ला',
        ],
      };

    case 'ta':
      return {
        content: `### 🏛️ இந்திய வானிலை ஆய்வு மையம் (IMD) வளிமண்டல நுண்ணறிவு
**வானிலை நிலையம்**: ${stationDisplayName}
**அமைவிடம்**: ${latStr}°N, ${lngStr}°E | நிலைய எண்: ${stnCode}

• **வெப்பநிலை**: ${weather.temp}°C (உணரப்படும் வெப்பநிலை: ${feelsLike}°C)
• **வானிலை நிலை**: ${condStr}
• **ஒப்பீட்டு ஈரப்பதம்**: ${weather.humidity}% | **பனி நிலை புள்ளி**: ${weather.dewPoint ?? 24.5}°C
• **மேற்பரப்பு காற்று**: ${weather.windSpeed} கி.மீ/மணி (${weather.windDirection || 'WSW'})
• **வளிமண்டல அழுத்தம்**: ${weather.pressure} hPa
• **தேசிய காற்றுத் தரக் குறியீடு (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **மகரந்த ஒவ்வாமை ஆபத்து**: ${pollenStr}

வானிலை, வேளாண்மை ஆலோசனை, புயல்/மின்னல் எச்சரிக்கை அல்லது வெளிப்புற பாதுகாப்பு தொடர்பான கேள்விகளைக் கேட்கவும்.`,
        suggestedFollowUps: [
          'தற்போதைய வானிலை மற்றும் வெப்பநிலை என்ன?',
          'நான் இப்போது வெளியே உடற்பயிற்சி செய்யலாமா?',
          'ஏதேனும் கனமழை எச்சரிக்கை உள்ளதா?',
          'தமிழ்நாட்டின் வானிலை விவரக்குறிப்பு',
          'விவசாயிகளுக்கான மேகதூத் வேளாண் ஆலோசனை',
        ],
      };

    case 'te':
      return {
        content: `### 🏛️ భారత వాతావరణ శాఖ (IMD) వాతావరణ సమాచారం
**వాతావరణ కేంద్రం**: ${stationDisplayName}
**కోఆర్డినేట్స్**: ${latStr}°N, ${lngStr}°E | కేంద్రం ఐడీ: ${stnCode}

• **ఉష్ణోగ్రత**: ${weather.temp}°C (అనుభూతి చెందే ఉష్ణోగ్రత: ${feelsLike}°C)
• **వాతావరణ స్థితి**: ${condStr}
• **సాపేక్ష తేమ**: ${weather.humidity}% | **మంచు బిందువు**: ${weather.dewPoint ?? 24.5}°C
• **భూతల గాలి**: ${weather.windSpeed} కి.మీ/గంట (${weather.windDirection || 'WSW'})
• **వాతావరణ పీడనం**: ${weather.pressure} hPa
• **జాతీయ గాలి నాణ్యత సూచిక (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **పరాగరేణువు / అలెర్జీ ప్రమాదం**: ${pollenStr}

వాతావరణం, వ్యవసాయ సూచనలు, తుఫాను/పిడుగుల హెచ్చరికలు లేదా భద్రతా సంబంధిత ప్రశ్నలు అడగండి.`,
        suggestedFollowUps: [
          'ప్రస్తుత వాతావరణం మరియు ఉష్ణోగ్రత ఎలా ఉంది?',
          'నేను ఇప్పుడు బయటకు వెళ్లవచ్చా?',
          'ఏదైనా భారీ వర్షపాత హెచ్చరిక ఉందా?',
          'ఆంధ్రప్రదేశ్ మరియు తెలంగాణ వాతావరణ స్థితి',
          'రైతుల కోసం వ్యవసాయ సలహాలు',
        ],
      };

    case 'kn':
      return {
        content: `### 🏛️ ಭಾರತೀಯ ಹವಾಮಾನ ಇಲಾಖೆ (IMD) ವಾತಾವರಣ ಮಾಹಿತಿ
**ಹವಾಮಾನ ಕೇಂದ್ರ**: ${stationDisplayName}
**ನಿರ್ದೇಶಾಂಕಗಳು**: ${latStr}°N, ${lngStr}°E | ಕೇಂದ್ರ ಐಡಿ: ${stnCode}

• **ತಾಪಮಾನ**: ${weather.temp}°C (ಅನಿಸುವ ತಾಪಮಾನ: ${feelsLike}°C)
• **ಹವಾಮಾನ ಸ್ಥಿತಿ**: ${condStr}
• **ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ**: ${weather.humidity}% | **ಇಬ್ಬನಿ ಬಿಂದು**: ${weather.dewPoint ?? 24.5}°C
• **ಮೇಲ್ಮೈ ಗಾಳಿ**: ${weather.windSpeed} ಕಿ.ಮೀ/ಗಂಟೆ (${weather.windDirection || 'WSW'})
• **ವಾಯುಭಾರ ಒತ್ತಡ**: ${weather.pressure} hPa
• **ರಾಷ್ಟ್ರೀಯ ವಾಯು ಗುಣಮಟ್ಟ ಸೂಚಿ (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **ಪರಾಗ ಅಲರ್ಜಿ ಅಪಾಯ**: ${pollenStr}

ಹವಾಮಾನ, ಕೃಷಿ ಸಲಹೆ, ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ ಅಥವಾ ಹೊರಾಂಗಣ ಸುರಕ್ಷತೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.`,
        suggestedFollowUps: [
          'ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಮತ್ತು ತಾಪಮಾನ ಹೇಗಿದೆ?',
          'ನಾನು ಈಗ ಹೊರಗೆ ಓಟಕ್ಕೆ ಹೋಗಬಹುದೇ?',
          'ಯಾವುದಾದರೂ ಮಳೆ ಎಚ್ಚರಿಕೆ ಇದೆಯೇ?',
          'ಕರ್ನಾಟಕದ ಹವಾಮಾನ ವಿವರಣೆ',
          'ರೈತರಿಗಾಗಿ ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆ',
        ],
      };

    case 'ml':
      return {
        content: `### 🏛️ ഭാരതീയ കാലാവസ്ഥാ വകുപ്പ് (IMD) അന്തരീക്ഷ വിവരങ്ങൾ
**കാലാവസ്ഥാ കേന്ദ്രം**: ${stationDisplayName}
**കോർഡിനേറ്റുകൾ**: ${latStr}°N, ${lngStr}°E | സ്റ്റേഷൻ ഐഡി: ${stnCode}

• **താപനില**: ${weather.temp}°C (അനുഭവപ്പെടുന്ന താപനില: ${feelsLike}°C)
• **കാലാവസ്ഥാ അവസ്ഥ**: ${condStr}
• **ആപേക്ഷിക ആർദ്രത**: ${weather.humidity}% | **ഹിമബിന്ദു**: ${weather.dewPoint ?? 24.5}°C
• **ഉപരിതല കാറ്റ്**: ${weather.windSpeed} കി.മീ/മണിക്കൂർ (${weather.windDirection || 'WSW'})
• **വായുമർദ്ദം**: ${weather.pressure} hPa
• **ദേശീയ വായു ഗുണനിലവാര സൂചിക (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **പരാഗണ അലർജി സാധ്യത**: ${pollenStr}

കാലാവസ്ഥ, കാർഷിക നിർദ്ദേശങ്ങൾ, ദുരന്ത മുന്നറിയിപ്പുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.`,
        suggestedFollowUps: [
          'നിലവിലെ കാലാവസ്ഥയും മഴ സാധ്യതയും എന്താണ്?',
          'എനിക്ക് ഇപ്പോൾ പുറത്ത് വ്യായാമത്തിന് പോകാമോ?',
          'ശക്തമായ മഴ മുന്നറിയിപ്പ് നിലവിലുണ്ടോ?',
          'കേരളത്തിലെ കാലാവസ്ഥാ വിവരണം',
          'കർഷകർക്കുള്ള കാർഷിക നിർദ്ദേശങ്ങൾ',
        ],
      };

    case 'gu':
      return {
        content: `### 🏛️ ભારતીય હવામાન વિભાગ (IMD) વાતાવરણીય માહિતી
**હવામાન કેન્દ્ર**: ${stationDisplayName}
**અક્ષાંશ-રેખાંશ**: ${latStr}°N, ${lngStr}°E | કેન્દ્ર આઈડી: ${stnCode}

• **તાપમાન**: ${weather.temp}°C (અનુભવાતું તાપમાન: ${feelsLike}°C)
• **હવામાન પરિસ્થિતિ**: ${condStr}
• **સાપેક્ષ ભેજ**: ${weather.humidity}% | **ઝાકળ બિંદુ**: ${weather.dewPoint ?? 24.5}°C
• **સપાટી પવન**: ${weather.windSpeed} કિમી/કલાક (${weather.windDirection || 'WSW'})
• **વાતાવરણીય દબાણ**: ${weather.pressure} hPa
• **રાષ્ટ્રીય હવા ગુણવત્તા આંક (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **પરાગરજ / એલર્જી જોખમ**: ${pollenStr}

હવામાન, કૃષિ સલાહ, વાવાઝોડું/વીજળી ચેતવણી અથવા સુરક્ષા સંબંધિત પ્રશ્નો પૂછો.`,
        suggestedFollowUps: [
          'હાલનું હવામાન અને તાપમાન કેવું છે?',
          'શું હું અત્યારે બહાર જઈ શકું?',
          'શું કોઈ ભારે વરસાદની ચેતવણી છે?',
          'ગુજરાતનું વાતાવરણીય પ્રોફાઇલ',
          'ખેડૂતો માટે કૃષિ હવામાન સલાહ',
        ],
      };

    case 'pa':
      return {
        content: `### 🏛️ ਭਾਰਤੀ ਮੌਸਮ ਵਿਭਾਗ (IMD) ਵਾਯੂਮੰਡਲ ਜਾਣਕਾਰੀ
**ਮੌਸਮ ਕੇਂਦਰ**: ${stationDisplayName}
**ਕੋਆਰਡੀਨੇਟ**: ${latStr}°N, ${lngStr}°E | ਸਟੇਸ਼ਨ ਆਈਡੀ: ${stnCode}

• **ਤਾਪਮਾਨ**: ${weather.temp}°C (ਮਹਿਸੂਸ ਹੁੰਦਾ ਤਾਪਮਾਨ: ${feelsLike}°C)
• **ਮੌਸਮ ਦੀ ਸਥਿਤੀ**: ${condStr}
• **ਨਮੀ / ਆਰਦਰਤਾ**: ${weather.humidity}% | **ਤਰੇਲ ਬਿੰਦੂ**: ${weather.dewPoint ?? 24.5}°C
• **ਸਤਹੀ ਹਵਾ**: ${weather.windSpeed} ਕਿਮੀ/ਘੰਟਾ (${weather.windDirection || 'WSW'})
• **ਹਵਾ ਦਾ ਦਬਾਅ**: ${weather.pressure} hPa
• **ਰਾਸ਼ਟਰੀ ਹਵਾ ਗੁਣਵੱਤਾ ਸੂਚਕਾਂਕ (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **ਪਰਾਗ ਐਲਰਜੀ ਜੋਖਮ**: ${pollenStr}

ਮੌਸਮ, ਖੇਤੀਬਾੜੀ ਸਲਾਹ, ਤੂਫ਼ਾਨ ਜਾਂ ਅਸਮਾਨੀ ਬਿਜਲੀ ਚੇਤਾਵਨੀਆਂ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ।`,
        suggestedFollowUps: [
          'ਮੌਜੂਦਾ ਮੌਸਮ ਅਤੇ ਤਾਪਮਾਨ ਕੀ ਹੈ?',
          'ਕੀ ਮੈਂ ਹੁਣ ਬਾਹਰ ਜਾ ਸਕਦਾ ਹਾਂ?',
          'ਕੀ ਕੋਈ ਭਾਰੀ ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ ਹੈ?',
          'ਪੰਜਾਬ ਅਤੇ ਉੱਤਰੀ ਭਾਰਤ ਦਾ ਮੌਸਮ',
          'ਕਿਸਾਨਾਂ ਲਈ ਖੇਤੀਬਾੜੀ ਸਲਾਹ',
        ],
      };

    case 'as':
      return {
        content: `### 🏛️ ভাৰতীয় বতৰ বিজ্ঞান বিভাগ (IMD) বায়ুমণ্ডলীয় তথ্য
**বতৰ নিৰীক্ষণ কেন্দ্ৰ**: ${stationDisplayName}
**স্থানাংক**: ${latStr}°N, ${lngStr}°E | ষ্টেচন আইডি: ${stnCode}

• **তাপমাত্ৰা**: ${weather.temp}°C (অনুভৱ হোৱা তাপমাত্ৰা: ${feelsLike}°C)
• **বতৰৰ অৱস্থা**: ${condStr}
• **আপেক্ষিক আৰ্দ্ৰতা**: ${weather.humidity}% | **শিশিৰাংক**: ${weather.dewPoint ?? 24.5}°C
• **পৃষ্ঠীয় বতাহ**: ${weather.windSpeed} কিমি/ঘণ্টা (${weather.windDirection || 'WSW'})
• **বায়ুমণ্ডলীয় চাপ**: ${weather.pressure} hPa
• **ৰাষ্ট্ৰীয় বায়ুৰ গুণাগুণ সূচক (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **পৰাগৰেণু আৰু এলাৰ্জী আশংকা**: ${pollenStr}

বতৰ, কৃষি পৰামৰ্শ, দুৰ্যোগ সতৰ্কবাণী বা সুৰক্ষা সম্পৰ্কীয় যিকোনো প্ৰশ্ন সোধক।`,
        suggestedFollowUps: [
          'বৰ্তমান বতৰ আৰু বৰষুণৰ অৱস্থা কেনেকুৱা?',
          'মই এতিয়া বাহিৰলৈ ওলাই যাব পাৰিমনে?',
          'কোনো ধুমুহা-বৰষুণৰ সতৰ্কবাণী আছেনে?',
          'অসম আৰু উত্তৰ-পূবৰ বতৰৰ তথ্য',
          'কৃষকসকলৰ বাবে বতৰ পৰামৰ্শ',
        ],
      };

    case 'ur':
      return {
        content: `### 🏛️ محکمہ موسمیات بھارت (IMD) ماحولیاتی معلومات
**موسمی اسٹیشن**: ${stationDisplayName}
**مقام**: ${latStr}°N, ${lngStr}°E | اسٹیشن کوڈ: ${stnCode}

• **درجہ حرارت**: ${weather.temp}°C (محسوس درجہ حرارت: ${feelsLike}°C)
• **موسم کی کیفیت**: ${condStr}
• **اضافی نمی**: ${weather.humidity}% | **شبنم کا نقطہ**: ${weather.dewPoint ?? 24.5}°C
• **سطحی ہوا**: ${weather.windSpeed} کلومیٹر/گھنٹہ (${weather.windDirection || 'WSW'})
• **ہوائی دباؤ**: ${weather.pressure} hPa
• **قومی ہوا کے معیار کا انڈیکس (NAQI)**: ${aqiVal} (${aqiStatusStr})
• **پولن الرجک خطرہ**: ${pollenStr}

موسم، زرعی مشورے، طوفان یا قدرتی آفات کے متعلق سوالات پوچھیں۔`,
        suggestedFollowUps: [
          'موجودہ موسم اور درجہ حرارت کیسا ہے؟',
          'کیا میں ابھی باہر واک پر جا سکتا ہوں؟',
          'کیا بارش یا طوفان کی کوئی وارننگ ہے؟',
          'موسمیات کی تفصیلی رپورٹ',
          'کسانوں کے لیے زرعی مشورہ',
        ],
      };

    default:
      return {
        content: `### 🏛️ IMD Grounded Atmospheric Intelligence
**Station**: ${stationDisplayName}
**Coordinates**: ${latStr}°N, ${lngStr}°E | Station ID: ${stnCode}

• **Temperature**: ${weather.temp}°C (Feels like ${feelsLike}°C)
• **Condition**: ${weather.condition}
• **Relative Humidity**: ${weather.humidity}% | **Dew Point**: ${weather.dewPoint ?? 24.5}°C
• **Surface Wind**: ${weather.windSpeed} km/h ${weather.windDirection || 'WSW'}
• **Barometric Pressure**: ${weather.pressure} hPa (Station Level)
• **National Air Quality Index (NAQI)**: ${aqiVal} (${weather.aqiStatus || 'Satisfactory'})
• **Aero-Allergen Risk**: ${weather.pollen || 'Low Risk'}

Ask any meteorological, agricultural, disaster warning, or outdoor safety question below, or explore our complete 36 States & UTs intelligence directory and FAQ library.`,
        suggestedFollowUps: [
          'What is the current weather & conditions?',
          'Can I go for an outdoor run right now?',
          'Is there an active rainfall warning?',
          'Weather & synoptic profile for Kerala',
          'Western Disturbance in North India',
        ],
      };
  }
}

export function getDrawerUiStrings(langKey: string) {
  const dict: Record<string, Record<string, string>> = {
    chatStream: {
      or: 'ଚାଟ୍ ଷ୍ଟ୍ରିମ୍',
      hi: 'चैट स्ट्रीम',
      bn: 'চ্যাট স্ট্রিম',
      mr: 'चॅट स्ट्रीम',
      ta: 'உரையாடல்',
      te: 'చాట్ స్ట్రీమ్',
      kn: 'ಸಂವಾದ',
      ml: 'ചാറ്റ് സ്ട്രീം',
      gu: 'ચેટ સ્ટ્રીમ',
      pa: 'ਚੈਟ ਸਟ੍ਰੀਮ',
      as: 'চেট ষ্ট্ৰীম',
      ur: 'چیٹ اسٹریم',
      en: 'Chat Stream',
    },
    faqLibrary: {
      or: 'ପ୍ରଶ୍ନୋତ୍ତର ପାଠାଗାର',
      hi: 'एफएक्यू पुस्तकालय',
      bn: 'প্রশ্নোত্তর ভান্ডার',
      mr: 'वारंवार विचारले जाणारे प्रश्न',
      ta: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      te: 'తరచుగా అడిగే ప్రశ్నలు',
      kn: 'ಆಗಾಗ್ಗೆ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
      ml: 'പതിവ് ചോദ്യങ്ങൾ',
      gu: 'પ્રશ્નોત્તરી પુસ્તકાલય',
      pa: 'ਸਵਾਲ-ਜਵਾਬ ਲਾਇਬ੍ਰੇਰੀ',
      as: 'সঘনাই সোধা প্ৰশ্নাৱলী',
      ur: 'اکثر پوچھے گئے سوالات',
      en: 'FAQ Library',
    },
    statesDirectory: {
      or: 'ରାଜ୍ୟ ଓ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ (୩୬)',
      hi: 'राज्य व केंद्र शासित प्रदेश (36)',
      bn: 'রাজ্য ও কেন্দ্রশাসিত অঞ্চল (৩৬)',
      mr: 'राज्ये व केंद्रशासित प्रदेश (३६)',
      ta: 'மாநிலங்கள் & யூ.டி (36)',
      te: 'రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలు (36)',
      kn: 'ರಾಜ್ಯಗಳು ಮತ್ತು ಯುಟಿಗಳು (36)',
      ml: 'സംസ്ഥാനങ്ങളും യു.ടികളും (36)',
      gu: 'રાજ્યો અને કેન્દ્રશાસિત પ્રદેશો (36)',
      pa: 'ਰਾਜ ਅਤੇ ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼ (36)',
      as: 'ৰাজ্য আৰু কেন্দ্ৰীয় ভূখণ্ড (৩৬)',
      ur: 'ریاستیں اور یوٹیز (36)',
      en: 'States & UTs (36)',
    },
    inputPlaceholder: {
      or: 'ପାଣିପାଗ, ବର୍ଷା, ବାତ୍ୟା, କୃଷି ପରାମର୍ଶ, ରାଜ୍ୟ ସ୍ଥିତି ବିଷୟରେ ପଚାରନ୍ତୁ...',
      hi: 'मौसम, वायु गुणवत्ता, वर्षा पूर्वानुमान, फसल सलाह, चेतावनियों के बारे में पूछें...',
      bn: 'আবহাওয়া, বায়ুমান, বৃষ্টিপাত পূর্বাভাস, কৃষি পরামর্শ বা সতর্কতা সম্পর্কে জিজ্ঞাসা করুন...',
      mr: 'हवामान, हवेची गुणवत्ता, पाऊस अंदाज, पीक सल्ला किंवा चेतावणींबद्दल विचारा...',
      ta: 'வானிலை, காற்று தரம், மழை முன்னறிவிப்பு, பயிர் ஆலோசனை பற்றி கேட்கவும்...',
      te: 'వాతావరణం, వర్షపాత అంచనా, పంట సలహాలు, హెచ్చరికల గురించి అడగండి...',
      kn: 'ಹವಾಮಾನ, ಮಳೆ ಮುನ್ಸೂಚನೆ, ಬೆಳೆ ಸಲಹೆ, ಎಚ್ಚರಿಕೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
      ml: 'കാലാവസ്ഥ, മഴ പ്രവചനം, കാർഷിക ഉപദേശം, മുന്നറിയിപ്പുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...',
      gu: 'હવામાન, વરસાદની આગાહી, પાક સલાહ, ચેતવણીઓ વિશે પૂછો...',
      pa: 'ਮੌਸਮ, ਮੀਂਹ ਦੀ ਭਵਿੱਖਬਾਣੀ, ਫ਼ਸਲ ਸਲਾਹ, ਚੇਤਾਵਨੀਆਂ ਬਾਰੇ ਪੁੱਛੋ...',
      as: 'বতৰ, বৰষুণৰ পূৰ্বানুমান, শস্য পৰামৰ্শ, সতৰ্কবাণী সম্পৰ্কে সোধক...',
      ur: 'موسم، بارش کی پیشگوئی، فصل کا مشورہ، انتباہات کے بارے میں پوچھیں...',
      en: 'Ask about weather, AQI, rain forecast, crop advice, states, warnings...',
    },
    faqSearchPlaceholder: {
      or: 'ପ୍ରଶ୍ନୋତ୍ତର ଖୋଜନ୍ତୁ (ଯଥା: ବର୍ଷା, ବାୟୁମାନ, ବଜ୍ରପାତ, ତାପ ପ୍ରବାହ, କୃଷି)...',
      hi: 'प्रश्नोत्तरी खोजें (उदा. बारिश, एक्यूआई, आंधी, हीटवेव, खेती)...',
      bn: 'প্রশ্নোত্তর খুঁজুন (যেমন: বৃষ্টি, বায়ুমান, বজ্রপাত, তাপপ্রবাহ, কৃষি)...',
      mr: 'प्रश्न शोधा (उदा. पाऊस, हवेची गुणवत्ता, वीज, उष्णतेची लाट, शेती)...',
      ta: 'கேள்விகளைத் தேடுங்கள் (மழை, காற்றுத் தரம், மின்னல், வெப்ப அலை)...',
      te: 'ప్రశ్నలను శోధించండి (వర్షం, గాలి నాణ్యత, పిడుగులు, ఎండతీవ్రత, వ్యవసాయం)...',
      kn: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಹುಡುಕಿ (ಮಳೆ, ವಾಯು ಗುಣಮಟ್ಟ, ಮಿಂಚು, ಶಾಖದ ಅಲೆ, ಕೃಷಿ)...',
      ml: 'ചോദ്യങ്ങൾ തിരയുക (മഴ, വായു ഗുണനിലവാരം, മിന്നൽ, ഉഷ്ണതരംഗം)...',
      gu: 'પ્રશ્નો શોધો (વરસાદ, હવા ગુણવત્તા, વીજળી, લૂ, ખેતી)...',
      pa: 'ਸਵਾਲ ਖੋਜੋ (ਮੀਂਹ, ਹਵਾ ਗੁਣਵੱਤਾ, ਅਸਮਾਨੀ ਬਿਜਲੀ, ਗਰਮੀ ਦੀ ਲਹਿਰ, ਖੇਤੀ)...',
      as: 'প্ৰশ্নাৱলী সন্ধান কৰক (বৰষুণ, বায়ুমান, বজ্ৰপাত, গৰমৰ প্ৰকোপ)...',
      ur: 'سوالات تلاش کریں (بارش، ہوا کا معیار، آسمانی بجلی، لو، کاشتکاری)...',
      en: 'Search FAQs (e.g. rain, aqi, running, heatwave, farming)...',
    },
    statesSearchPlaceholder: {
      or: '୨୮ ରାଜ୍ୟ ଓ ୮ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ ଖୋଜନ୍ତୁ (ଯଥା: ଓଡ଼ିଶା, କେରଳ, ଆସାମ, ଗୋଆ)...',
      hi: '28 राज्यों व 8 केंद्र शासित प्रदेशों में खोजें (उदा. ओडिशा, केरल, असम, राजस्थान)...',
      bn: '২৮টি রাজ্য ও ৮টি কেন্দ্রশাসিত অঞ্চল খুঁজুন (যেমন: পশ্চিমবঙ্গ, আসাম, কেরালা)...',
      mr: '२८ राज्ये व ८ केंद्रशासित प्रदेशांमध्ये शोधा (उदा. महाराष्ट्र, गोवा, केरळ)...',
      ta: '28 மாநிலங்கள் & 8 யூ.டி-களில் தேடுங்கள் (தமிழ்நாடு, கேரளா, அசாம்)...',
      te: '28 రాష్ట్రాలు & 8 యూటీలలో శోధించండి (ఆంధ్రప్రదేశ్, తెలంగాణ, కేరళ)...',
      kn: '28 ರಾಜ್ಯಗಳು ಮತ್ತು 8 ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳನ್ನು ಹುಡುಕಿ (ಕರ್ನಾಟಕ, ಕೇರಳ, ಗೋವಾ)...',
      ml: '28 സംസ്ഥാനങ്ങളും 8 യു.ടികളും തിരയുക (കേരളം, തമിഴ്നാട്, ഗോവ)...',
      gu: '28 રાજ્યો અને 8 કેન્દ્રશાસિત પ્રદેશોમાં શોધો (ગુજરાત, મહારાષ્ટ્ર, કેરળ)...',
      pa: '28 ਰਾਜਾਂ ਅਤੇ 8 ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼ਾਂ ਵਿੱਚ ਖੋਜੋ (ਪੰਜਾਬ, ਹਿਮਾਚਲ, ਰਾਜਸਥਾਨ)...',
      as: '২৮ খন ৰাজ্য আৰু ৮ খন কেন্দ্ৰীয় ভূখণ্ড সন্ধান কৰক (অসম, মেঘালয়, কেৰালা)...',
      ur: '28 ریاستوں اور 8 یوٹیز میں تلاش کریں (کشمیر، دہلی، پنجاب، کیرالہ)...',
      en: 'Search any of 28 States & 8 UTs (e.g. Kerala, Ladakh, Assam, Rajasthan, Goa)...',
    },
    loadingText: {
      or: 'ପାଣିପାଗ ତଥ୍ୟ ବିଶ୍ଳେଷଣ ଚାଲିଛି...',
      hi: 'मौसम डेटा का विश्लेषण जारी है...',
      bn: 'আবহাওয়ার তথ্য বিশ্লেষণ করা হচ্ছে...',
      mr: 'हवामान माहितीचे विश्लेषण सुरू आहे...',
      ta: 'வானிலை தரவு பகுப்பாய்வு செய்யப்படுகிறது...',
      te: 'వాతావరణ డేటా విశ్లేషించబడుతోంది...',
      kn: 'ಹವಾಮಾನ ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ...',
      ml: 'കാലാവസ്ഥാ വിവരങ്ങൾ വിശകലനം ചെയ്യുന്നു...',
      gu: 'હવામાન ડેટાનું વિશ્લેષણ થઈ રહ્યું છે...',
      pa: 'ਮੌਸਮ ਡੇਟਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਜਾਰੀ ਹੈ...',
      as: 'বতৰৰ তথ্য বিশ্লেষণ চলি আছে...',
      ur: 'موسمیاتی ڈیٹا کا تجزیہ جاری ہے...',
      en: 'Synthesizing location telemetry for',
    },
    officialReferences: {
      or: 'ସରକାରୀ ପାଣିପାଗ ଉତ୍ସ:',
      hi: 'आधिकारिक मौसम संदर्भ:',
      bn: 'অফিসিয়াল আবহাওয়া সূত্র:',
      mr: 'अधिकृत हवामान संदर्भ:',
      ta: 'அதிகாரப்பூர்வ வானிலை குறிப்புகள்:',
      te: 'అధికారిక వాతావరణ ఆధారాలు:',
      kn: 'ಅಧಿಕೃತ ಹವಾಮಾನ ಉಲ್ಲೇಖಗಳು:',
      ml: 'ഔദ്യോഗിക കാലാവസ്ഥാ സ്രോതസ്സുകൾ:',
      gu: 'સત્તાવાર હવામાન સંદર્ભ:',
      pa: 'ਅਧਿਕਾਰਤ ਮੌਸਮ ਹਵਾਲੇ:',
      as: 'চৰকাৰী বতৰ বিজ্ঞানৰ তথ্যসূত্ৰ:',
      ur: 'سرکاری موسمیاتی حوالہ جات:',
      en: 'Official Meteorological References:',
    },
    suggestedInquiries: {
      or: 'ପ୍ରସ୍ତାବିତ ପ୍ରଶ୍ନ:',
      hi: 'सुझाए गए प्रश्न:',
      bn: 'প্রস্তাবিত প্রশ্নাবলী:',
      mr: 'सुचवलेले प्रश्न:',
      ta: 'பரிந்துரைக்கப்பட்ட கேள்விகள்:',
      te: 'సూచించిన ప్రశ్నలు:',
      kn: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು:',
      ml: 'നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ:',
      gu: 'સૂચવેલા પ્રશ્નો:',
      pa: 'ਸੁਝਾਏ ਗਏ ਸਵਾਲ:',
      as: 'প্ৰস্তাৱিত প্ৰশ্নসমূহ:',
      ur: 'تجویز کردہ سوالات:',
      en: 'Suggested Inquiries:',
    },
    copy: {
      or: 'କପି କରନ୍ତୁ',
      hi: 'कॉपी करें',
      bn: 'কপি করুন',
      mr: 'कॉपी करा',
      ta: 'நகலெடு',
      te: 'కాపీ చేయండి',
      kn: 'ಕಾಪಿ ಮಾಡಿ',
      ml: 'പകർപ്പേറ്റുക',
      gu: 'કૉપિ કરો',
      pa: 'ਕਾਪੀ ਕਰੋ',
      as: 'কপি কৰক',
      ur: 'کاپی کریں',
      en: 'Copy',
    },
    copied: {
      or: 'କପି ହୋଇଗଲା',
      hi: 'कॉपी हो गया',
      bn: 'কপি করা হয়েছে',
      mr: 'कॉपी झाले',
      ta: 'நகலெடுக்கப்பட்டது',
      te: 'కాపీ చేయబడింది',
      kn: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ',
      ml: 'പകർപ്പായി',
      gu: 'કૉપિ થઈ ગયું',
      pa: 'ਕਾਪੀ ਹੋ ਗਿਆ',
      as: 'কপি হ\'ল',
      ur: 'کاپی ہو گیا',
      en: 'Copied',
    },
  };

  return {
    chatStream: dict.chatStream[langKey] || dict.chatStream.en,
    faqLibrary: dict.faqLibrary[langKey] || dict.faqLibrary.en,
    statesDirectory: dict.statesDirectory[langKey] || dict.statesDirectory.en,
    inputPlaceholder: dict.inputPlaceholder[langKey] || dict.inputPlaceholder.en,
    faqSearchPlaceholder: dict.faqSearchPlaceholder[langKey] || dict.faqSearchPlaceholder.en,
    statesSearchPlaceholder: dict.statesSearchPlaceholder[langKey] || dict.statesSearchPlaceholder.en,
    loadingText: dict.loadingText[langKey] || dict.loadingText.en,
    officialReferences: dict.officialReferences[langKey] || dict.officialReferences.en,
    suggestedInquiries: dict.suggestedInquiries[langKey] || dict.suggestedInquiries.en,
    copy: dict.copy[langKey] || dict.copy.en,
    copied: dict.copied[langKey] || dict.copied.en,
  };
}
