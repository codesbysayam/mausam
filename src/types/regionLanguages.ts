// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Region to Language Configuration Registry (All 28 States + 8 UTs)
// ====================================================================

export type RegionLanguageConfig = {
  regionCode: string; // ISO 3166-2:IN code (e.g., 'IN-OD', 'IN-WB')
  regionName: string; // Canonical English State / UT name
  regionalLanguageCode: string; // ISO 639-1/2 code (e.g., 'or', 'bn', 'ta', 'mr')
  regionalLanguageName: string; // English name of regional language (e.g., 'Odia')
  regionalDisplayName: string; // Autonym in native Indic script (e.g., 'ଓଡ଼ିଆ', 'বাংলা')
  // Compatibility aliases
  primaryRegionalLanguage: string;
  primaryRegionalCode: string;
  primaryRegionalNativeName: string;
  english: string;
  hindi: string;
  regional: string[];
  scriptFontFamily?: string;
};

/**
 * Complete, authoritative registry for all 36 Indian States and Union Territories
 * Based on Government of India Official Languages Act & State Official Language Acts
 */
const RAW_INDIA_REGION_REGISTRY: Record<string, {
  regionCode: string;
  regionName: string;
  english: string;
  hindi: string;
  regional: string[];
  primaryRegionalLanguage: string;
  primaryRegionalCode: string;
  primaryRegionalNativeName: string;
  scriptFontFamily?: string;
}> = {
  // ─── 28 States ───────────────────────────────────────────────────────
  'IN-AP': {
    regionCode: 'IN-AP',
    regionName: 'Andhra Pradesh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Telugu', 'Urdu'],
    primaryRegionalLanguage: 'Telugu',
    primaryRegionalCode: 'te',
    primaryRegionalNativeName: 'తెలుగు',
  },
  'IN-AR': {
    regionCode: 'IN-AR',
    regionName: 'Arunachal Pradesh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['English', 'Hindi'],
    primaryRegionalLanguage: 'English',
    primaryRegionalCode: 'en',
    primaryRegionalNativeName: 'English',
  },
  'IN-AS': {
    regionCode: 'IN-AS',
    regionName: 'Assam',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Assamese', 'Bengali', 'Bodo'],
    primaryRegionalLanguage: 'Assamese',
    primaryRegionalCode: 'as',
    primaryRegionalNativeName: 'অসমীয়া',
  },
  'IN-BR': {
    regionCode: 'IN-BR',
    regionName: 'Bihar',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Urdu', 'Bhojpuri', 'Maithili'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-CG': {
    regionCode: 'IN-CG',
    regionName: 'Chhattisgarh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Chhattisgarhi'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-GA': {
    regionCode: 'IN-GA',
    regionName: 'Goa',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Konkani', 'Marathi'],
    primaryRegionalLanguage: 'Konkani',
    primaryRegionalCode: 'kok',
    primaryRegionalNativeName: 'कोंकणी',
  },
  'IN-GJ': {
    regionCode: 'IN-GJ',
    regionName: 'Gujarat',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Gujarati'],
    primaryRegionalLanguage: 'Gujarati',
    primaryRegionalCode: 'gu',
    primaryRegionalNativeName: 'ગુજરાતી',
  },
  'IN-HR': {
    regionCode: 'IN-HR',
    regionName: 'Haryana',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Punjabi'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-HP': {
    regionCode: 'IN-HP',
    regionName: 'Himachal Pradesh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-JH': {
    regionCode: 'IN-JH',
    regionName: 'Jharkhand',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Santhali', 'Bengali', 'Urdu'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-KA': {
    regionCode: 'IN-KA',
    regionName: 'Karnataka',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Kannada'],
    primaryRegionalLanguage: 'Kannada',
    primaryRegionalCode: 'kn',
    primaryRegionalNativeName: 'ಕನ್ನಡ',
  },
  'IN-KL': {
    regionCode: 'IN-KL',
    regionName: 'Kerala',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Malayalam'],
    primaryRegionalLanguage: 'Malayalam',
    primaryRegionalCode: 'ml',
    primaryRegionalNativeName: 'മലയാളം',
  },
  'IN-MP': {
    regionCode: 'IN-MP',
    regionName: 'Madhya Pradesh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-MH': {
    regionCode: 'IN-MH',
    regionName: 'Maharashtra',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Marathi'],
    primaryRegionalLanguage: 'Marathi',
    primaryRegionalCode: 'mr',
    primaryRegionalNativeName: 'मराठी',
  },
  'IN-MN': {
    regionCode: 'IN-MN',
    regionName: 'Manipur',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Manipuri (Meitei)'],
    primaryRegionalLanguage: 'Meitei/Manipuri',
    primaryRegionalCode: 'mni',
    primaryRegionalNativeName: 'মৈতৈলোନ୍',
  },
  'IN-ML': {
    regionCode: 'IN-ML',
    regionName: 'Meghalaya',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['English', 'Khasi', 'Garo'],
    primaryRegionalLanguage: 'English',
    primaryRegionalCode: 'en',
    primaryRegionalNativeName: 'English',
  },
  'IN-MZ': {
    regionCode: 'IN-MZ',
    regionName: 'Mizoram',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Mizo', 'English'],
    primaryRegionalLanguage: 'Mizo',
    primaryRegionalCode: 'lus',
    primaryRegionalNativeName: 'Mizo ṭawng',
  },
  'IN-NL': {
    regionCode: 'IN-NL',
    regionName: 'Nagaland',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['English'],
    primaryRegionalLanguage: 'English',
    primaryRegionalCode: 'en',
    primaryRegionalNativeName: 'English',
  },
  'IN-OD': {
    regionCode: 'IN-OD',
    regionName: 'Odisha',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Odia'],
    primaryRegionalLanguage: 'Odia',
    primaryRegionalCode: 'or',
    primaryRegionalNativeName: 'ଓଡ଼ିଆ',
  },
  'IN-PB': {
    regionCode: 'IN-PB',
    regionName: 'Punjab',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Punjabi'],
    primaryRegionalLanguage: 'Punjabi',
    primaryRegionalCode: 'pa',
    primaryRegionalNativeName: 'ਪੰਜਾਬੀ',
  },
  'IN-RJ': {
    regionCode: 'IN-RJ',
    regionName: 'Rajasthan',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Rajasthani'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-SK': {
    regionCode: 'IN-SK',
    regionName: 'Sikkim',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Nepali', 'Sikkimese', 'Lepcha', 'English'],
    primaryRegionalLanguage: 'Nepali',
    primaryRegionalCode: 'ne',
    primaryRegionalNativeName: 'नेपाली',
  },
  'IN-TN': {
    regionCode: 'IN-TN',
    regionName: 'Tamil Nadu',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Tamil'],
    primaryRegionalLanguage: 'Tamil',
    primaryRegionalCode: 'ta',
    primaryRegionalNativeName: 'தமிழ்',
  },
  'IN-TG': {
    regionCode: 'IN-TG',
    regionName: 'Telangana',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Telugu', 'Urdu'],
    primaryRegionalLanguage: 'Telugu',
    primaryRegionalCode: 'te',
    primaryRegionalNativeName: 'తెలుగు',
  },
  'IN-TR': {
    regionCode: 'IN-TR',
    regionName: 'Tripura',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Bengali', 'Kokborok', 'English'],
    primaryRegionalLanguage: 'Bengali',
    primaryRegionalCode: 'bn',
    primaryRegionalNativeName: 'বাংলা',
  },
  'IN-UP': {
    regionCode: 'IN-UP',
    regionName: 'Uttar Pradesh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Urdu'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-UK': {
    regionCode: 'IN-UK',
    regionName: 'Uttarakhand',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Sanskrit', 'Garhwali', 'Kumaoni'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-WB': {
    regionCode: 'IN-WB',
    regionName: 'West Bengal',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Bengali', 'Nepali'],
    primaryRegionalLanguage: 'Bengali',
    primaryRegionalCode: 'bn',
    primaryRegionalNativeName: 'বাংলা',
  },

  // ─── 8 Union Territories ─────────────────────────────────────────────
  'IN-AN': {
    regionCode: 'IN-AN',
    regionName: 'Andaman & Nicobar Islands',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'English', 'Bengali', 'Tamil'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-CH': {
    regionCode: 'IN-CH',
    regionName: 'Chandigarh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Punjabi', 'Hindi'],
    primaryRegionalLanguage: 'Punjabi',
    primaryRegionalCode: 'pa',
    primaryRegionalNativeName: 'ਪੰਜਾਬੀ',
  },
  'IN-DN': {
    regionCode: 'IN-DN',
    regionName: 'Dadra & Nagar Haveli and Daman & Diu',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Gujarati', 'Hindi', 'Marathi'],
    primaryRegionalLanguage: 'Gujarati',
    primaryRegionalCode: 'gu',
    primaryRegionalNativeName: 'ગુજરાતી',
  },
  'IN-DL': {
    regionCode: 'IN-DL',
    regionName: 'Delhi',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Hindi', 'Punjabi', 'Urdu'],
    primaryRegionalLanguage: 'Hindi',
    primaryRegionalCode: 'hi',
    primaryRegionalNativeName: 'हिन्दी',
  },
  'IN-JK': {
    regionCode: 'IN-JK',
    regionName: 'Jammu & Kashmir',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Urdu', 'Kashmiri', 'Dogri', 'Hindi'],
    primaryRegionalLanguage: 'Urdu',
    primaryRegionalCode: 'ur',
    primaryRegionalNativeName: 'اردو',
  },
  'IN-LA': {
    regionCode: 'IN-LA',
    regionName: 'Ladakh',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Ladakhi', 'Hindi', 'English', 'Urdu'],
    primaryRegionalLanguage: 'Ladakhi',
    primaryRegionalCode: 'lbj',
    primaryRegionalNativeName: 'ལ་དྭགས་སྐད།',
  },
  'IN-LD': {
    regionCode: 'IN-LD',
    regionName: 'Lakshadweep',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Malayalam', 'English'],
    primaryRegionalLanguage: 'Malayalam',
    primaryRegionalCode: 'ml',
    primaryRegionalNativeName: 'മലയാളം',
  },
  'IN-PY': {
    regionCode: 'IN-PY',
    regionName: 'Puducherry',
    english: 'English',
    hindi: 'हिन्दी',
    regional: ['Tamil', 'Telugu', 'Malayalam', 'French'],
    primaryRegionalLanguage: 'Tamil',
    primaryRegionalCode: 'ta',
    primaryRegionalNativeName: 'தமிழ்',
  },
};

export const INDIA_REGION_LANGUAGE_REGISTRY: Record<string, RegionLanguageConfig> = Object.fromEntries(
  Object.entries(RAW_INDIA_REGION_REGISTRY).map(([code, config]) => [
    code,
    {
      ...config,
      regionalLanguageCode: config.primaryRegionalCode,
      regionalLanguageName: config.primaryRegionalLanguage,
      regionalDisplayName: config.primaryRegionalNativeName,
    },
  ])
);

/**
 * Localized state & UT names across India's primary languages
 */
export const LOCALIZED_STATE_NAMES: Record<string, Record<string, string>> = {
  'Odisha': { en: 'Odisha', hi: 'ओडिशा', or: 'ଓଡ଼ିଶା', bn: 'ওড়িশা' },
  'West Bengal': { en: 'West Bengal', hi: 'पश्चिम बंगाल', bn: 'পশ্চিমবঙ্গ' },
  'Maharashtra': { en: 'Maharashtra', hi: 'महाराष्ट्र', mr: 'महाराष्ट्र' },
  'Tamil Nadu': { en: 'Tamil Nadu', hi: 'तमिलनाडु', ta: 'தமிழ்நாடு' },
  'Karnataka': { en: 'Karnataka', hi: 'कर्नाटक', kn: 'ಕರ್ನಾಟಕ' },
  'Kerala': { en: 'Kerala', hi: 'केरल', ml: 'കേരളം' },
  'Gujarat': { en: 'Gujarat', hi: 'गुजरात', gu: 'ગુજરાત' },
  'Punjab': { en: 'Punjab', hi: 'पंजाब', pa: 'ਪੰਜਾਬ' },
  'Andhra Pradesh': { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
  'Telangana': { en: 'Telangana', hi: 'तेलंगाना', te: 'తెలంగాణ' },
  'Assam': { en: 'Assam', hi: 'असम', as: 'অসম' },
  'Delhi': { en: 'Delhi', hi: 'दिल्ली' },
  'Uttar Pradesh': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  'Bihar': { en: 'Bihar', hi: 'बिहार' },
  'Rajasthan': { en: 'Rajasthan', hi: 'राजस्थान' },
  'Madhya Pradesh': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  'Jammu & Kashmir': { en: 'Jammu & Kashmir', hi: 'जम्मू और कश्मीर', ur: 'جموں و کشمیر' },
  'Goa': { en: 'Goa', hi: 'गोवा', kok: 'गोंय' },
  'Himachal Pradesh': { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  'Haryana': { en: 'Haryana', hi: 'हरियाणा' },
  'Jharkhand': { en: 'Jharkhand', hi: 'झारखंड' },
  'Chhattisgarh': { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  'Uttarakhand': { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  'Tripura': { en: 'Tripura', hi: 'त्रिपुरा', bn: 'ত্রিপুরা' },
  'Manipur': { en: 'Manipur', hi: 'मणिपुर', mni: 'মণিপুর' },
  'Meghalaya': { en: 'Meghalaya', hi: 'मेघालय' },
  'Mizoram': { en: 'Mizoram', hi: 'मिजोरम' },
  'Nagaland': { en: 'Nagaland', hi: 'नागालैंड' },
  'Sikkim': { en: 'Sikkim', hi: 'सिक्किम', ne: 'सिक्किम' },
  'Arunachal Pradesh': { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  'Chandigarh': { en: 'Chandigarh', hi: 'चंडीगढ़', pa: 'ਚੰਡੀਗੜ੍ਹ' },
  'Ladakh': { en: 'Ladakh', hi: 'लद्दाख', lbj: 'ལ་དྭགས' },
  'Puducherry': { en: 'Puducherry', hi: 'पुडुचेरी', ta: 'புதுச்சேரி' },
  'Lakshadweep': { en: 'Lakshadweep', hi: 'लक्षद्वीप', ml: 'ലക്ഷദ്വീപ്' },
  'Andaman & Nicobar Islands': { en: 'Andaman & Nicobar Islands', hi: 'अंडमान और निकोबार', bn: 'আন্দামান ও নিকোবর' },
  'Dadra & Nagar Haveli and Daman & Diu': { en: 'Dadra & Nagar Haveli and Daman & Diu', hi: 'दादरा और नगर हवेली और दमन और दीव', gu: 'દાદરા અને નગર हवेલી અને દમણ અને દીવ' },
};

export function getLocalizedStateName(stateName: string, langCode: string): string {
  if (!stateName) return stateName;
  const match = LOCALIZED_STATE_NAMES[stateName];
  if (match) {
    return match[langCode] || match.hi || match.en || stateName;
  }
  const lower = stateName.toLowerCase();
  for (const [key, val] of Object.entries(LOCALIZED_STATE_NAMES)) {
    if (key.toLowerCase() === lower) {
      return val[langCode] || val.hi || val.en || stateName;
    }
  }
  return stateName;
}

/**
 * Normalized alias dictionary mapping various spelling variations, short codes,
 * and district associations to canonical region codes.
 */
const REGION_ALIAS_MAP: Record<string, string> = {
  // Odisha
  odisha: 'IN-OD',
  orissa: 'IN-OD',
  od: 'IN-OD',
  or: 'IN-OD',
  bhubaneswar: 'IN-OD',
  cuttack: 'IN-OD',
  puri: 'IN-OD',
  ganjam: 'IN-OD',
  chandaka: 'IN-OD',

  // West Bengal
  'west bengal': 'IN-WB',
  bengal: 'IN-WB',
  'paschim banga': 'IN-WB',
  wb: 'IN-WB',
  kolkata: 'IN-WB',
  darjeeling: 'IN-WB',

  // Maharashtra
  maharashtra: 'IN-MH',
  mh: 'IN-MH',
  mumbai: 'IN-MH',
  pune: 'IN-MH',
  nagpur: 'IN-MH',

  // Tamil Nadu
  'tamil nadu': 'IN-TN',
  tamilnadu: 'IN-TN',
  tn: 'IN-TN',
  chennai: 'IN-TN',
  coimbatore: 'IN-TN',

  // Karnataka
  karnataka: 'IN-KA',
  ka: 'IN-KA',
  bengaluru: 'IN-KA',
  bangalore: 'IN-KA',
  mysuru: 'IN-KA',

  // Kerala
  kerala: 'IN-KL',
  kl: 'IN-KL',
  thiruvananthapuram: 'IN-KL',
  kochi: 'IN-KL',
  kozhikode: 'IN-KL',

  // Gujarat
  gujarat: 'IN-GJ',
  gj: 'IN-GJ',
  ahmedabad: 'IN-GJ',
  surat: 'IN-GJ',

  // Andhra Pradesh
  'andhra pradesh': 'IN-AP',
  andhra: 'IN-AP',
  ap: 'IN-AP',
  visakhapatnam: 'IN-AP',
  vijayawada: 'IN-AP',

  // Telangana
  telangana: 'IN-TG',
  tg: 'IN-TG',
  ts: 'IN-TG',
  hyderabad: 'IN-TG',

  // Punjab
  punjab: 'IN-PB',
  pb: 'IN-PB',
  amritsar: 'IN-PB',
  ludhiana: 'IN-PB',

  // Assam
  assam: 'IN-AS',
  as: 'IN-AS',
  guwahati: 'IN-AS',

  // Jammu & Kashmir
  'jammu & kashmir': 'IN-JK',
  'jammu and kashmir': 'IN-JK',
  jk: 'IN-JK',
  srinagar: 'IN-JK',
  jammu: 'IN-JK',

  // Goa
  goa: 'IN-GA',
  ga: 'IN-GA',
  panaji: 'IN-GA',

  // Delhi
  delhi: 'IN-DL',
  'new delhi': 'IN-DL',
  dl: 'IN-DL',
  ncr: 'IN-DL',

  // Uttar Pradesh
  'uttar pradesh': 'IN-UP',
  up: 'IN-UP',
  lucknow: 'IN-UP',
  varanasi: 'IN-UP',

  // Bihar
  bihar: 'IN-BR',
  br: 'IN-BR',
  patna: 'IN-BR',

  // Rajasthan
  rajasthan: 'IN-RJ',
  rj: 'IN-RJ',
  jaipur: 'IN-RJ',

  // Madhya Pradesh
  'madhya pradesh': 'IN-MP',
  mp: 'IN-MP',
  bhopal: 'IN-MP',
  indore: 'IN-MP',

  // Haryana
  haryana: 'IN-HR',
  hr: 'IN-HR',
  gurugram: 'IN-HR',

  // Himachal Pradesh
  'himachal pradesh': 'IN-HP',
  himachal: 'IN-HP',
  hp: 'IN-HP',
  shimla: 'IN-HP',

  // Uttarakhand
  uttarakhand: 'IN-UK',
  uttaranchal: 'IN-UK',
  uk: 'IN-UK',
  dehradun: 'IN-UK',

  // Jharkhand
  jharkhand: 'IN-JH',
  jh: 'IN-JH',
  ranchi: 'IN-JH',

  // Chhattisgarh
  chhattisgarh: 'IN-CG',
  cg: 'IN-CG',
  raipur: 'IN-CG',

  // Tripura
  tripura: 'IN-TR',
  tr: 'IN-TR',
  agartala: 'IN-TR',

  // Manipur
  manipur: 'IN-MN',
  mn: 'IN-MN',
  imphal: 'IN-MN',

  // Meghalaya
  meghalaya: 'IN-ML',
  ml: 'IN-ML',
  shillong: 'IN-ML',

  // Mizoram
  mizoram: 'IN-MZ',
  mz: 'IN-MZ',
  aizawl: 'IN-MZ',

  // Nagaland
  nagaland: 'IN-NL',
  nl: 'IN-NL',
  kohima: 'IN-NL',

  // Sikkim
  sikkim: 'IN-SK',
  sk: 'IN-SK',
  gangtok: 'IN-SK',

  // Arunachal Pradesh
  'arunachal pradesh': 'IN-AR',
  arunachal: 'IN-AR',
  ar: 'IN-AR',
  itanagar: 'IN-AR',

  // Chandigarh
  chandigarh: 'IN-CH',
  ch: 'IN-CH',

  // Ladakh
  ladakh: 'IN-LA',
  la: 'IN-LA',
  leh: 'IN-LA',

  // Puducherry
  puducherry: 'IN-PY',
  pondicherry: 'IN-PY',
  py: 'IN-PY',

  // Andaman & Nicobar
  'andaman & nicobar islands': 'IN-AN',
  'andaman and nicobar': 'IN-AN',
  andaman: 'IN-AN',
  an: 'IN-AN',

  // Lakshadweep
  lakshadweep: 'IN-LD',
  ld: 'IN-LD',

  // DNH & DD
  'dadra & nagar haveli and daman & diu': 'IN-DN',
  'dadra and nagar haveli': 'IN-DN',
  'daman and diu': 'IN-DN',
  dn: 'IN-DN',
  dd: 'IN-DN',
};

/**
 * Deterministically resolve a RegionLanguageConfig for any input string
 * (state name, district name, UT name, ISO code, or alias).
 * Defaults safely to National Configuration (India/Delhi) if unidentified.
 */
export function getRegionLanguageConfig(stateOrRegionInput?: string | null): RegionLanguageConfig {
  if (!stateOrRegionInput || typeof stateOrRegionInput !== 'string') {
    return INDIA_REGION_LANGUAGE_REGISTRY['IN-DL']; // Default to National Capital
  }

  const raw = stateOrRegionInput.trim();
  const normalized = raw.toLowerCase().replace(/^(state of|union territory of)\s+/i, '').trim();

  // 1. Direct key match (e.g. 'IN-OD', 'in-wb')
  const upperCode = raw.toUpperCase();
  if (INDIA_REGION_LANGUAGE_REGISTRY[upperCode]) {
    return INDIA_REGION_LANGUAGE_REGISTRY[upperCode];
  }

  // 2. Direct alias match
  const aliasKey = REGION_ALIAS_MAP[normalized];
  if (aliasKey && INDIA_REGION_LANGUAGE_REGISTRY[aliasKey]) {
    return INDIA_REGION_LANGUAGE_REGISTRY[aliasKey];
  }

  // 3. Scan canonical names
  for (const config of Object.values(INDIA_REGION_LANGUAGE_REGISTRY)) {
    if (
      config.regionName.toLowerCase() === normalized ||
      config.regionCode.toLowerCase() === normalized
    ) {
      return config;
    }
  }

  // 4. Substring contains match (e.g., "Bhubaneswar, Odisha" or "South 24 Parganas, West Bengal")
  for (const [key, code] of Object.entries(REGION_ALIAS_MAP)) {
    if (normalized.includes(key)) {
      const cfg = INDIA_REGION_LANGUAGE_REGISTRY[code];
      if (cfg) return cfg;
    }
  }

  // Fallback safe default: National / English-Hindi
  return INDIA_REGION_LANGUAGE_REGISTRY['IN-DL'];
}

export type SupportedLanguageMode = 'en' | 'hi' | 'regional';
