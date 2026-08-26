export type Language =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  script: string;
  fontFamily: string;
  isRtl?: boolean;
}

export const SCHEDULED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', fontFamily: 'Roboto, "Noto Sans", Arial, sans-serif' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', fontFamily: '"Noto Sans Bengali", Arial, sans-serif' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', fontFamily: '"Noto Sans Bengali", Arial, sans-serif' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', fontFamily: '"Noto Sans Gujarati", Arial, sans-serif' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', fontFamily: '"Noto Sans Kannada", Arial, sans-serif' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', script: 'Perso-Arabic', fontFamily: '"Noto Nastaliq Urdu", "Noto Sans Arabic", Arial, sans-serif', isRtl: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', fontFamily: '"Noto Sans Malayalam", Arial, sans-serif' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন', script: 'Bengali-Meitei', fontFamily: '"Noto Sans Bengali", Arial, sans-serif' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', fontFamily: '"Noto Sans Oriya", Arial, sans-serif' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', fontFamily: '"Noto Sans Gurmukhi", Arial, sans-serif' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', fontFamily: '"Noto Sans Devanagari", Arial, sans-serif' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki / Devanagari', fontFamily: '"Noto Sans Devanagari", "Noto Sans", Arial, sans-serif' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'Perso-Arabic', fontFamily: '"Noto Nastaliq Urdu", "Noto Sans Arabic", Arial, sans-serif', isRtl: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', fontFamily: '"Noto Sans Tamil", Arial, sans-serif' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', fontFamily: '"Noto Sans Telugu", Arial, sans-serif' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', fontFamily: '"Noto Nastaliq Urdu", "Noto Sans Arabic", Arial, sans-serif', isRtl: true },
];

export interface TranslationDictionary {
  // Navigation & Core Tabs
  home: string;
  weather: string;
  forecast: string;
  warnings: string;
  radar: string;
  airQuality: string;
  agromet: string;
  reports: string;
  privacyPolicy: string;
  openDataApi: string;
  termsOfObservation: string;
  returnToPortal: string;

  // Header & Search
  portalTitle: string;
  portalSubtitle: string;
  searchPlaceholder: string;
  selectStation: string;
  popularObservatories: string;
  noStationsFound: string;
  askMausam: string;
  decreaseFont: string;
  resetFont: string;
  increaseFont: string;
  language: string;
  searchLanguage: string;
  istLabel: string;
  yourLocation: string;
  viewDetailedWeather: string;
  switchStation: string;

  // Weather Overview & Cards
  currentWeather: string;
  feelsLike: string;
  high: string;
  low: string;
  humidity: string;
  wind: string;
  windSpeed: string;
  pressure: string;
  visibility: string;
  uvIndex: string;
  dewPoint: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: string;
  precipitation: string;
  precipitationActive: string;
  normalStatus: string;
  highTemperature: string;
  observationVerified: string;
  dopplerRadarActive: string;
  updated: string;
  justNow: string;
  refresh: string;
  station: string;
  elevation: string;
  coordinates: string;
  allIndiaWeatherStatus: string;
  nationalWeatherSnapshot: string;
  stateWiseSummary: string;
  majorWeatherWarnings: string;
  quickAccess: string;
  recentUpdates: string;
  nationalStatistics: string;
  statesAndUTs: string;
  searchState: string;
  stateName: string;
  capitalStation: string;
  temperature: string;
  rainfall: string;
  aqi: string;
  condition: string;
  status: string;

  // Forecast
  today: string;
  tomorrow: string;
  sevenDayForecast: string;
  hourlyForecast: string;
  probabilityOfRain: string;
  temperatureTrend: string;
  daytime: string;
  nighttime: string;
  expectedConditions: string;

  // Alerts & Warnings
  weatherBulletin: string;
  synopticBulletin: string;
  activeAlerts: string;
  noActiveAlerts: string;
  viewAllAlerts: string;
  affectedArea: string;
  validUntil: string;
  normalSynopticStatus: string;
  noSevereWarnings: string;
  warningLevel: string;
  greenStatus: string;
  yellowWatch: string;
  orangeAlert: string;
  redWarning: string;
  sourceIMD: string;

  // Air Quality & Pollen
  aqiHeader: string;
  aqiCategory: string;
  naqiSatisfactory: string;
  naqiGood: string;
  naqiModerate: string;
  naqiPoor: string;
  naqiVeryPoor: string;
  naqiSevere: string;
  prominentPollutant: string;
  pollenSurveillance: string;
  pollenLevel: string;
  pollenLow: string;
  pollenModerate: string;
  pollenHigh: string;
  treePollen: string;
  grassPollen: string;
  weedPollen: string;

  // Agricultural Meteorology (Agromet)
  agrometTitle: string;
  agrometSubtitle: string;
  cropAdvisory: string;
  sowingAdvice: string;
  irrigationSchedule: string;
  pestWarning: string;
  soilMoisture: string;

  // Common UI
  source: string;
  lastUpdated: string;
  allRightsReserved: string;
  mausamPortal: string;
  footerTagline: string;
  dataProvidersTitle: string;
  citizenServicesTitle: string;
  standardProtocolsTitle: string;
  footerStandardNotice: string;
  imdCredit: string;
  ncmrwfCredit: string;
  cpcbCredit: string;
  isroCredit: string;
  exploreMaps: string;
  viewDetails: string;
  submitCitizenReport: string;
}

export const translations: Record<Language, Partial<TranslationDictionary>> = {
  en: {
    home: 'HOME',
    weather: 'WEATHER',
    forecast: 'FORECAST',
    warnings: 'WARNINGS',
    radar: 'RADAR & MAPS',
    airQuality: 'AQI & AIR',
    agromet: 'AGROMET',
    reports: 'REPORTS',
    privacyPolicy: 'Privacy Policy',
    openDataApi: 'Open Data API',
    termsOfObservation: 'Terms of Observation',
    returnToPortal: 'Return to Weather Portal',
    portalTitle: 'MAUSAM',
    portalSubtitle: 'Atmospheric Intelligence & Citizen Weather Platform',
    searchPlaceholder: 'Search station, city or state...',
    selectStation: 'SELECT REGIONAL MET STATION',
    popularObservatories: 'POPULAR OBSERVATORIES',
    noStationsFound: 'No matching stations found.',
    askMausam: 'Ask MAUSAM',
    decreaseFont: 'Decrease Font Size',
    resetFont: 'Reset Font Size',
    increaseFont: 'Increase Font Size',
    language: 'Language',
    searchLanguage: 'Search language...',
    istLabel: 'IST',
    yourLocation: 'YOUR LOCATION',
    viewDetailedWeather: 'View Detailed Weather →',
    switchStation: 'Switch Station',
    currentWeather: 'Current Weather',
    feelsLike: 'Feels Like',
    high: 'High',
    low: 'Low',
    humidity: 'Humidity',
    wind: 'Wind',
    windSpeed: 'Wind Speed',
    pressure: 'Atmospheric Pressure',
    visibility: 'Visibility',
    uvIndex: 'UV Index',
    dewPoint: 'Dew Point',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    solarNoon: 'Solar Noon',
    dayLength: 'Daylight Duration',
    precipitation: 'Precipitation',
    precipitationActive: 'Precipitation Active',
    normalStatus: 'Normal Meteorological Conditions',
    highTemperature: 'High Temperature Advisory',
    observationVerified: 'Verified Surface Telemetry',
    dopplerRadarActive: 'Doppler Radar Scan Active',
    updated: 'Updated',
    justNow: 'Just now',
    refresh: 'Refresh Data',
    station: 'Station ID',
    elevation: 'Elevation',
    coordinates: 'Observatory Coordinates',
    allIndiaWeatherStatus: 'ALL-INDIA SYNOPTIC STATUS',
    nationalWeatherSnapshot: 'NATIONAL WEATHER SNAPSHOT',
    stateWiseSummary: 'STATE-WISE WEATHER SUMMARY (28 STATES & 8 UTs)',
    majorWeatherWarnings: 'MAJOR WEATHER WARNINGS & ADVISORIES',
    quickAccess: 'QUICK ACCESS SERVICES',
    recentUpdates: 'RECENT WEATHER BULLETINS & UPDATES',
    nationalStatistics: 'NATIONAL METEOROLOGICAL STATISTICS',
    statesAndUTs: 'States & Union Territories',
    searchState: 'Filter by state or UT name...',
    stateName: 'State / UT',
    capitalStation: 'Capital Station',
    temperature: 'Temperature',
    rainfall: 'Rainfall',
    aqi: 'AQI',
    condition: 'Condition',
    status: 'Alert Level',
    today: 'Today',
    tomorrow: 'Tomorrow',
    sevenDayForecast: '7-Day Synoptic Forecast',
    hourlyForecast: "Today's Hourly Weather Timeline",
    probabilityOfRain: 'Precipitation Probability',
    temperatureTrend: 'Temperature Trend',
    daytime: 'Daytime',
    nighttime: 'Nighttime',
    expectedConditions: 'Expected Conditions',
    weatherBulletin: 'Official Synoptic Weather Bulletin',
    synopticBulletin: 'IMD Synoptic Bulletin',
    activeAlerts: 'Active Warnings',
    noActiveAlerts: 'No Active Severe Weather Warnings',
    viewAllAlerts: 'View Full Warning Matrix →',
    affectedArea: 'Affected Sub-Division',
    validUntil: 'Valid Until',
    normalSynopticStatus: 'ALL-INDIA SYNOPTIC STATUS: GREEN (NORMAL)',
    noSevereWarnings: 'No severe weather convective warnings in effect for the active operational zone.',
    warningLevel: 'Warning Level',
    greenStatus: 'Green (No Warning)',
    yellowWatch: 'Yellow (Be Updated / Watch)',
    orangeAlert: 'Orange (Be Prepared / Alert)',
    redWarning: 'Red (Take Action / Warning)',
    sourceIMD: 'Source: IMD / NDMA Multi-Hazard Network',
    aqiHeader: 'National Air Quality Index (NAQI)',
    aqiCategory: 'AQI Category',
    naqiSatisfactory: 'Satisfactory',
    naqiGood: 'Good',
    naqiModerate: 'Moderate',
    naqiPoor: 'Poor',
    naqiVeryPoor: 'Very Poor',
    naqiSevere: 'Severe',
    prominentPollutant: 'Prominent Pollutant',
    pollenSurveillance: 'Aero-Allergen Pollen Surveillance',
    pollenLevel: 'Pollen Level',
    pollenLow: 'Low',
    pollenModerate: 'Moderate',
    pollenHigh: 'High',
    treePollen: 'Tree Pollen',
    grassPollen: 'Grass Pollen',
    weedPollen: 'Weed Pollen',
    agrometTitle: 'Gramin Krishi Mausam Sewa (Agromet Advisory)',
    agrometSubtitle: 'District-level agro-meteorological advisory bulletins and crop-weather management guidelines.',
    cropAdvisory: 'Crop Advisory',
    sowingAdvice: 'Sowing & Field Operation Advice',
    irrigationSchedule: 'Irrigation & Drainage Planning',
    pestWarning: 'Pest & Disease Forecast',
    soilMoisture: 'Topsoil Moisture Saturation',
    source: 'Source',
    lastUpdated: 'Last Updated',
    allRightsReserved: '© 2026 MAUSAM National Meteorological Platform • Smart India Hackathon (SIH 2026)',
    mausamPortal: 'MAUSAM PORTAL',
    footerTagline: 'National Atmospheric Intelligence & Citizen Weather Platform. Calibrated with Doppler weather radars, Automatic Weather Stations (AWS), and satellite telemetry.',
    dataProvidersTitle: 'Data Providers & Networks',
    citizenServicesTitle: 'Citizen Meteorological Services',
    standardProtocolsTitle: 'Standard Protocols',
    footerStandardNotice: 'Adheres to World Meteorological Organization (WMO) standards for meteorological instrument calibration and NDMA hazard classification.',
    imdCredit: 'India Meteorological Department (IMD)',
    ncmrwfCredit: 'NCMRWF Global & Regional Models',
    cpcbCredit: 'Central Pollution Control Board (CPCB)',
    isroCredit: 'ISRO MOSDAC Earth Observation',
    exploreMaps: 'Open Dynamic Weather Map',
    viewDetails: 'View Detailed Telemetry',
    submitCitizenReport: 'Submit Citizen Observation',
  },

  hi: {
    home: 'मुख्य पृष्ठ',
    weather: 'मौसम',
    forecast: 'पूर्वानुमान',
    warnings: 'चेतावनियां',
    radar: 'रडार व मानचित्र',
    airQuality: 'वायु गुणवत्ता',
    agromet: 'कृषि मौसम',
    reports: 'रिपोर्ट',
    privacyPolicy: 'गोपनीयता नीति',
    openDataApi: 'ओपन डेटा एपीआई',
    termsOfObservation: 'अवलोकन की शर्तें',
    returnToPortal: 'मौसम पोर्टल पर वापस जाएं',
    portalTitle: 'मौसम',
    portalSubtitle: 'वायुमंडलीय प्रज्ञान एवं नागरिक मौसम मंच',
    searchPlaceholder: 'स्टेशन, शहर या राज्य खोजें...',
    selectStation: 'क्षेत्रीय मौसम विज्ञान केंद्र चुनें',
    popularObservatories: 'प्रमुख वेधशालाएं',
    noStationsFound: 'कोई मेल खाने वाला स्टेशन नहीं मिला।',
    askMausam: 'मौसम से पूछें',
    decreaseFont: 'फ़ॉन्ट का आकार घटाएं',
    resetFont: 'सामान्य आकार',
    increaseFont: 'फ़ॉन्ट का आकार बढ़ाएं',
    language: 'भाषा',
    searchLanguage: 'भाषा खोजें...',
    istLabel: 'भा.मा.स.',
    yourLocation: 'आपका स्थान',
    viewDetailedWeather: 'विस्तृत मौसम देखें →',
    switchStation: 'स्टेशन बदलें',
    currentWeather: 'वर्तमान मौसम',
    feelsLike: 'अनुभूत तापमान',
    high: 'अधिकतम',
    low: 'न्यूनतम',
    humidity: 'आर्द्रता',
    wind: 'हवा',
    windSpeed: 'पवन गति',
    pressure: 'वायुमंडलीय दबाव',
    visibility: 'दृश्यता',
    uvIndex: 'यूवी सूचकांक',
    dewPoint: 'ओसांक',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    solarNoon: 'मध्याह्न',
    dayLength: 'दिन की अवधि',
    precipitation: 'वर्षण',
    precipitationActive: 'वर्षा सक्रिय',
    normalStatus: 'सामान्य मौसमी स्थिति',
    highTemperature: 'उच्च तापमान चेतावनी',
    observationVerified: 'सत्यापित भूतल टेलीमेट्री',
    dopplerRadarActive: 'डॉपलर रडार सक्रिय',
    updated: 'अद्यतित',
    justNow: 'अभी-अभी',
    refresh: 'डेटा ताज़ा करें',
    station: 'स्टेशन कोड',
    elevation: 'ऊंचाई',
    coordinates: 'वेधशाला निर्देशांक',
    allIndiaWeatherStatus: 'अखिल भारतीय सिनॉप्टिक स्थिति',
    nationalWeatherSnapshot: 'राष्ट्रीय मौसम सारांश',
    stateWiseSummary: 'राज्यवार मौसम सारांश (28 राज्य और 8 केंद्र शासित प्रदेश)',
    majorWeatherWarnings: 'प्रमुख मौसम चेतावनियां एवं परामर्श',
    quickAccess: 'त्वरित सेवाएं',
    recentUpdates: 'नवीनतम मौसम बुलेटिन',
    nationalStatistics: 'राष्ट्रीय मौसम विज्ञान सांख्यिकी',
    statesAndUTs: 'राज्य एवं केंद्र शासित प्रदेश',
    searchState: 'राज्य या केंद्र शासित प्रदेश खोजें...',
    stateName: 'राज्य / केंद्र शासित प्रदेश',
    capitalStation: 'राजधानी स्टेशन',
    temperature: 'तापमान',
    rainfall: 'वर्षा',
    aqi: 'वायु गुणवत्ता',
    condition: 'स्थिति',
    status: 'चेतावनी स्तर',
    today: 'आज',
    tomorrow: 'कल',
    sevenDayForecast: '7-दिवसीय सिनॉप्टिक पूर्वानुमान',
    hourlyForecast: 'आज का प्रति घंटा मौसम',
    probabilityOfRain: 'वर्षा की संभावना',
    temperatureTrend: 'तापमान का रुझान',
    daytime: 'दिन का समय',
    nighttime: 'रात का समय',
    expectedConditions: 'अपेक्षित स्थिति',
    weatherBulletin: 'आधिकारिक सिनॉप्टिक मौसम बुलेटिन',
    synopticBulletin: 'आईएमडी सिनॉप्टिक बुलेटिन',
    activeAlerts: 'सक्रिय चेतावनियां',
    noActiveAlerts: 'कोई गंभीर चेतावनी सक्रिय नहीं है',
    viewAllAlerts: 'चेतावनी मैट्रिक्स देखें →',
    affectedArea: 'प्रभावित क्षेत्र',
    validUntil: 'मान्य अवधि',
    normalSynopticStatus: 'अखिल भारतीय स्थिति: हरा (सामान्य)',
    noSevereWarnings: 'सक्रिय क्षेत्र में कोई गंभीर मौसमी चेतावनी नहीं है।',
    warningLevel: 'चेतावनी स्तर',
    greenStatus: 'हरा (कोई चेतावनी नहीं)',
    yellowWatch: 'पीला (निगरानी रखें)',
    orangeAlert: 'नारंगी (तैयार रहें)',
    redWarning: 'लाल (कार्रवाई करें)',
    sourceIMD: 'स्रोत: भारत मौसम विज्ञान विभाग / एनडीएमए',
    aqiHeader: 'राष्ट्रीय वायु गुणवत्ता सूचकांक (NAQI)',
    aqiCategory: 'श्रेणी',
    naqiSatisfactory: 'संतोषजनक',
    naqiGood: 'अच्छा',
    naqiModerate: 'मध्यम',
    naqiPoor: 'खराब',
    naqiVeryPoor: 'बहुत खराब',
    naqiSevere: 'गंभीर',
    prominentPollutant: 'प्रमुख प्रदूषक',
    pollenSurveillance: 'परागकण निगरानी',
    pollenLevel: 'पराग स्तर',
    pollenLow: 'निम्न',
    pollenModerate: 'मध्यम',
    pollenHigh: 'उच्च',
    treePollen: 'वृक्ष पराग',
    grassPollen: 'घास पराग',
    weedPollen: 'खरपतवार पराग',
    agrometTitle: 'ग्रामीण कृषि मौसम सेवा (कृषि परामर्श)',
    agrometSubtitle: 'जिला स्तरीय कृषि मौसम विज्ञान परामर्श बुलेटिन एवं फसल प्रबंधन निर्देश।',
    cropAdvisory: 'फसल परामर्श',
    sowingAdvice: 'बुवाई व खेत कार्य सलाह',
    irrigationSchedule: 'सिंचाई एवं जल निकास योजना',
    pestWarning: 'कीट व रोग चेतावनी',
    soilMoisture: 'मृदा नमी संतृप्ति',
    source: 'स्रोत',
    lastUpdated: 'अंतिम अद्यतन',
    allRightsReserved: '© 2026 मौसम राष्ट्रीय मौसम मंच • स्मार्ट इंडिया हैकाथॉन (SIH 2026)',
    mausamPortal: 'मौसम पोर्टल',
    footerTagline: 'राष्ट्रीय वायुमंडलीय प्रज्ञान एवं नागरिक मौसम मंच। डॉपलर रडार और स्वचालित मौसम स्टेशनों द्वारा कैलिब्रेटेड।',
    dataProvidersTitle: 'डेटा प्रदाता एवं नेटवर्क',
    citizenServicesTitle: 'नागरिक मौसम सेवाएं',
    standardProtocolsTitle: 'मानक प्रोटोकॉल',
    footerStandardNotice: 'विश्व मौसम विज्ञान संगठन (WMO) और एनडीएमए आपदा वर्गीकरण मानकों का पालन।',
    imdCredit: 'भारत मौसम विज्ञान विभाग (IMD)',
    ncmrwfCredit: 'राष्ट्रीय मध्यम अवधि मौसम पूर्वानुमान केंद्र (NCMRWF)',
    cpcbCredit: 'केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB)',
    isroCredit: 'इसरो मॉसडैक भू-अवलोकन',
    exploreMaps: 'मौसम मानचित्र खोलें',
    viewDetails: 'विस्तृत टेलीमेट्री देखें',
    submitCitizenReport: 'नागरिक रिपोर्ट दर्ज करें',
  },

  or: {
    home: 'ମୂଳ ପୃଷ୍ଠା',
    weather: 'ପାଣିପାଗ',
    forecast: 'ପୂର୍ବାନୁମାନ',
    warnings: 'ସତର୍କତା',
    radar: 'ରାଡାର ଓ ମାନଚିତ୍ର',
    airQuality: 'ବାୟୁ ମାନ',
    agromet: 'କୃଷି ପାଣିପାଗ',
    reports: 'ରିପୋର୍ଟ',
    privacyPolicy: 'ଗୋପନୀୟତା ନୀତି',
    openDataApi: 'ଓପନ ଡାଟା API',
    termsOfObservation: 'ପର୍ଯ୍ୟବେକ୍ଷଣ ସର୍ତ୍ତାବଳୀ',
    returnToPortal: 'ପାଣିପାଗ ପୋର୍ଟାଲକୁ ଫେରନ୍ତୁ',
    portalTitle: 'ମୌସମ',
    portalSubtitle: 'ବାୟୁମଣ୍ଡଳୀୟ ପ୍ରଜ୍ଞା ଏବଂ ନାଗରିକ ପାଣିପାଗ ମଞ୍ଚ',
    searchPlaceholder: 'ଷ୍ଟେସନ, ସହର କିମ୍ବା ରାଜ୍ୟ ଖୋଜନ୍ତୁ...',
    selectStation: 'ଆଞ୍ଚଳିକ ପାଣିପାଗ କେନ୍ଦ୍ର ଚୟନ କରନ୍ତୁ',
    popularObservatories: 'ପ୍ରମୁଖ ପର୍ଯ୍ୟବେକ୍ଷଣ କେନ୍ଦ୍ର',
    noStationsFound: 'କୌଣସି ଷ୍ଟେସନ ମିଳିଲା ନାହିଁ।',
    askMausam: 'ମୌସମକୁ ପଚାରନ୍ତୁ',
    decreaseFont: 'ଅକ୍ଷର ଆକାର ଛୋଟ କରନ୍ତୁ',
    resetFont: 'ସ୍ୱାଭାବିକ ଆକାର',
    increaseFont: 'ଅକ୍ଷର ଆକାର ବଡ଼ କରନ୍ତୁ',
    language: 'ଭାଷା',
    searchLanguage: 'ଭାଷା ଖୋଜନ୍ତୁ...',
    istLabel: 'ଭା.ମା.ସ.',
    yourLocation: 'ଆପଣଙ୍କ ସ୍ଥାନ',
    viewDetailedWeather: 'ବିସ୍ତୃତ ପାଣିପାଗ ଦେଖନ୍ତୁ →',
    switchStation: 'ଷ୍ଟେସନ ପରିବର୍ତ୍ତନ',
    currentWeather: 'ବର୍ତ୍ତମାନର ପାଣିପାଗ',
    feelsLike: 'ଅନୁଭୂତ ତାପମାତ୍ରା',
    high: 'ସର୍ବୋଚ୍ଚ',
    low: 'ସର୍ବନିମ୍ନ',
    humidity: 'ଆର୍ଦ୍ରତା',
    wind: 'ପବନ',
    windSpeed: 'ପବନ ବେଗ',
    pressure: 'ବାୟୁମଣ୍ଡଳୀୟ ଚାପ',
    visibility: 'ଦୃଶ୍ୟମାନତା',
    uvIndex: 'ୟୁଭି ସୂଚକାଙ୍କ',
    dewPoint: 'ଶିଶିରାଙ୍କ',
    sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ',
    sunset: 'ସୂର୍ଯ୍ୟାସ୍ତ',
    solarNoon: 'ମଧ୍ୟାହ୍ନ',
    dayLength: 'ଦିନର ଅବଧି',
    precipitation: 'ବୃଷ୍ଟିପାତ',
    precipitationActive: 'ବର୍ଷା ସକ୍ରିୟ',
    normalStatus: 'ସ୍ୱାଭାବିକ ପାଣିପାଗ ସ୍ଥିତି',
    highTemperature: 'ଉଚ୍ଚ ତାପମାତ୍ରା ସତର୍କତା',
    observationVerified: 'ଯାଞ୍ଚ ହୋଇଥିବା ଭୂତଳ ତଥ୍ୟ',
    dopplerRadarActive: 'ଡପଲର ରାଡାର ସକ୍ରିୟ',
    updated: 'ଅଦ୍ୟତିତ',
    justNow: 'ଏହିମାତ୍ର',
    refresh: 'ତଥ୍ୟ ସତେଜ କରନ୍ତୁ',
    station: 'ଷ୍ଟେସନ କୋଡ୍',
    elevation: 'ଉଚ୍ଚତା',
    coordinates: 'କେନ୍ଦ୍ର ସ୍ଥାନାଙ୍କ',
    allIndiaWeatherStatus: 'ସର୍ବଭାରତୀୟ ସିନୋପ୍ଟିକ ସ୍ଥିତି',
    nationalWeatherSnapshot: 'ଜାତୀୟ ପାଣିପାଗ ସାରାଂଶ',
    stateWiseSummary: 'ରାଜ୍ୟଭିତ୍ତିକ ପାଣିପାଗ (୨୮ ରାଜ୍ୟ ଓ ୮ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ)',
    majorWeatherWarnings: 'ପ୍ରମୁଖ ପାଣିପାଗ ଚେତାବନୀ ଓ ସତର୍କତା',
    quickAccess: 'ଦ୍ରୁତ ସେବା',
    recentUpdates: 'ସଦ୍ୟତମ ପାଣିପାଗ ବୁଲେଟିନ୍',
    nationalStatistics: 'ଜାତୀୟ ପାଣିପାଗ ପରିସଂଖ୍ୟାନ',
    statesAndUTs: 'ରାଜ୍ୟ ଓ କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ',
    searchState: 'ରାଜ୍ୟ କିମ୍ବା କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ ଖୋଜନ୍ତୁ...',
    stateName: 'ରାଜ୍ୟ / କେନ୍ଦ୍ରଶାସିତ',
    capitalStation: 'ରାଜଧାନୀ ଷ୍ଟେସନ',
    temperature: 'ତାପମାତ୍ରା',
    rainfall: 'ବର୍ଷା',
    aqi: 'ବାୟୁ ମାନ',
    condition: 'ସ୍ଥିତି',
    status: 'ସତର୍କତା ସ୍ତର',
    today: 'ଆଜି',
    tomorrow: 'ଆସନ୍ତାକାଲି',
    sevenDayForecast: '୭-ଦିନିଆ ପାଣିପାଗ ପୂର୍ବାନୁମାନ',
    hourlyForecast: 'ଆଜିର ଘଣ୍ଟା ଅନୁସାରେ ପାଣିପାଗ',
    probabilityOfRain: 'ବର୍ଷା ସମ୍ଭାବନା',
    temperatureTrend: 'ତାପମାତ୍ରା ଧାରା',
    daytime: 'ଦିନ ସମୟ',
    nighttime: 'ରାତି ସମୟ',
    expectedConditions: 'ପ୍ରତ୍ୟାଶିତ ସ୍ଥିତି',
    weatherBulletin: 'ସରକାରୀ ସିନୋପ୍ଟିକ ପାଣିପାଗ ବୁଲେଟିନ୍',
    synopticBulletin: 'ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ ବୁଲେଟିନ୍',
    activeAlerts: 'ସକ୍ରିୟ ଚେତାବନୀ',
    noActiveAlerts: 'କୌଣସି ଗମ୍ଭୀର ଚେତାବନୀ ନାହିଁ',
    viewAllAlerts: 'ସତର୍କତା ତାଲିକା ଦେଖନ୍ତୁ →',
    affectedArea: 'ପ୍ରଭାବିତ ଅଞ୍ଚଳ',
    validUntil: 'ବୈଧତା ଅବଧି',
    normalSynopticStatus: 'ସର୍ବଭାରତୀୟ ସ୍ଥିତି: ସବୁଜ (ସ୍ୱାଭାବିକ)',
    noSevereWarnings: 'ସକ୍ରିୟ ଅଞ୍ଚଳରେ କୌଣସି ପ୍ରତିକୂଳ ପାଣିପାଗ ସତର୍କତା ନାହିଁ।',
    warningLevel: 'ସତର୍କତା ସ୍ତର',
    greenStatus: 'ସବୁଜ (କୌଣସି ଚେତାବନୀ ନାହିଁ)',
    yellowWatch: 'ହଳଦିଆ (ନଜର ରଖନ୍ତୁ)',
    orangeAlert: 'କମଳା (ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ)',
    redWarning: 'ନାଲି (ପଦକ୍ଷେପ ନିଅନ୍ତୁ)',
    sourceIMD: 'ଉତ୍ସ: ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD) / NDMA',
    aqiHeader: 'ଜାତୀୟ ବାୟୁ ଗୁଣବତ୍ତା ସୂଚକାଙ୍କ (NAQI)',
    aqiCategory: 'ବର୍ଗ',
    naqiSatisfactory: 'ସନ୍ତୋଷଜନକ',
    naqiGood: 'ଭଲ',
    naqiModerate: 'ମଧ୍ୟମ',
    naqiPoor: 'ଖରାପ',
    naqiVeryPoor: 'ଅତି ଖରାପ',
    naqiSevere: 'ଅତ୍ୟନ୍ତ ଗମ୍ଭୀର',
    prominentPollutant: 'ମୁଖ୍ୟ ପ୍ରଦୂଷକ',
    pollenSurveillance: 'ପରାଗରେଣୁ ନିରୀକ୍ଷଣ',
    pollenLevel: 'ପରାଗ ସ୍ତର',
    pollenLow: 'କମ୍',
    pollenModerate: 'ମଧ୍ୟମ',
    pollenHigh: 'ଅଧିକ',
    treePollen: 'ଗଛ ପରାଗ',
    grassPollen: 'ଘାସ ପରାଗ',
    weedPollen: 'ଅନାବନା ଘାସ ପରାଗ',
    agrometTitle: 'ଗ୍ରାମୀଣ କୃଷି ମୌସମ ସେବା (କୃଷି ପରାମର୍ଶ)',
    agrometSubtitle: 'ଜିଲ୍ଲାସ୍ତରୀୟ କୃଷି ପାଣିପାଗ ବୁଲେଟିନ୍ ଏବଂ ଫସଲ ପରିଚାଳନା ନିର୍ଦ୍ଦେଶାବଳୀ।',
    cropAdvisory: 'ଫସଲ ପରାମର୍ଶ',
    sowingAdvice: 'ବୁଣିବା ଓ କ୍ଷେତ କାର୍ଯ୍ୟ ପରାମର୍ଶ',
    irrigationSchedule: 'ଜଳସେଚନ ଓ ଜଳ ନିଷ୍କାସନ ଯୋଜନା',
    pestWarning: 'କୀଟ ଓ ରୋଗ ସତର୍କତା',
    soilMoisture: 'ମାଟିର ଆର୍ଦ୍ରତା',
    source: 'ଉତ୍ସ',
    lastUpdated: 'ଶେଷ ଅଦ୍ୟତନ',
    allRightsReserved: '© ୨୦୨୬ ମୌସମ ଜାତୀୟ ପାଣିପାଗ ମଞ୍ଚ • ସ୍ମାର୍ଟ ଇଣ୍ଡିଆ ହ୍ୟାକାଥନ (SIH 2026)',
    mausamPortal: 'ମୌସମ ପୋର୍ଟାଲ',
    footerTagline: 'ଜାତୀୟ ବାୟୁମଣ୍ଡଳୀୟ ପ୍ରଜ୍ଞା ଏବଂ ନାଗରିକ ପାଣିପାଗ ମଞ୍ଚ। ଡପଲର ରାଡାର ଏବଂ ସ୍ୱୟଂକ୍ରିୟ ପାଣିପାଗ କେନ୍ଦ୍ର ଦ୍ୱାରା ଯାଞ୍ଚ ହୋଇଛି।',
    dataProvidersTitle: 'ତଥ୍ୟ ପ୍ରଦାନକାରୀ ଓ ନେଟୱାର୍କ',
    citizenServicesTitle: 'ନାଗରିକ ପାଣିପାଗ ସେବା',
    standardProtocolsTitle: 'ମାନକ ନିୟମାବଳୀ',
    footerStandardNotice: 'ବିଶ୍ୱ ପାଣିପାଗ ସଂଗଠନ (WMO) ଏବଂ NDMA ବିପର୍ଯ୍ୟୟ ବର୍ଗୀକରଣ ମାନକ ଅନୁସାରେ ପରିଚାଳିତ।',
    imdCredit: 'ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD)',
    ncmrwfCredit: 'NCMRWF ମଡେଲ',
    cpcbCredit: 'କେନ୍ଦ୍ରୀୟ ପ୍ରଦୂଷଣ ନିୟନ୍ତ୍ରଣ ବୋର୍ଡ (CPCB)',
    isroCredit: 'ଇସ୍ରୋ MOSDAC ଉପଗ୍ରହ ନିରୀକ୍ଷଣ',
    exploreMaps: 'ପାଣିପାଗ ମାନଚିତ୍ର ଖୋଲନ୍ତୁ',
    viewDetails: 'ବିସ୍ତୃତ ତଥ୍ୟ ଦେଖନ୍ତୁ',
    submitCitizenReport: 'ନାଗରିକ ଅଭିଜ୍ଞତା ଦାଖଲ କରନ୍ତୁ',
  },

  bn: {
    home: 'হোম',
    weather: 'আবহাওয়া',
    forecast: 'পূর্বাভাস',
    warnings: 'সতর্কবার্তা',
    radar: 'রাডার ও মানচিত্র',
    airQuality: 'বায়ুর মান',
    agromet: 'কৃষি আবহাওয়া',
    reports: 'প্রতিবেদন',
    privacyPolicy: 'গোপনীয়তা নীতি',
    openDataApi: 'ওপেন ডেটা API',
    termsOfObservation: 'পর্যবেক্ষণ শর্তাবলী',
    returnToPortal: 'আবহাওয়া পোর্টালে ফিরুন',
    portalTitle: 'মৌসম',
    portalSubtitle: 'বায়ুমণ্ডলীয় গোয়েন্দা ও নাগরিক আবহাওয়া প্ল্যাটফর্ম',
    searchPlaceholder: 'স্টেশন, শহর বা রাজ্য খুঁজুন...',
    selectStation: 'আঞ্চলিক আবহাওয়া স্টেশন নির্বাচন করুন',
    popularObservatories: 'জনপ্রিয় মানমন্দির',
    noStationsFound: 'কোনো স্টেশন পাওয়া যায়নি।',
    askMausam: 'মৌসমকে জিজ্ঞাসা করুন',
    currentWeather: 'বর্তমান আবহাওয়া',
    feelsLike: 'অনুভূত তাপমাত্রা',
    high: 'সর্বোচ্চ',
    low: 'সর্বনিম্ন',
    humidity: 'আর্দ্রতা',
    wind: 'বাতাস',
    windSpeed: 'বাতাসের গতি',
    pressure: 'বায়ুমণ্ডলীয় চাপ',
    visibility: 'দৃশ্যমানতা',
    uvIndex: 'ইউভি সূচক',
    dewPoint: 'শিশিরাঙ্ক',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    allIndiaWeatherStatus: 'সর্বভারতীয় সিনপটিক অবস্থা',
    nationalWeatherSnapshot: 'জাতীয় আবহাওয়া চিত্র',
    stateWiseSummary: 'রাজ্যভিত্তিক আবহাওয়া সারাংশ (২৮ রাজ্য ও ৮ কেন্দ্রশাসিত অঞ্চল)',
    majorWeatherWarnings: 'প্রধান আবহাওয়া সতর্কতা',
    quickAccess: 'দ্রুত সেবা',
    recentUpdates: 'সাম্প্রতিক বুলেটিন',
  },

  ta: {
    home: 'முகப்பு',
    weather: 'வானிலை',
    forecast: 'முன்னறிவிப்பு',
    warnings: 'எச்சரிக்கைகள்',
    radar: 'ரேடார் & வரைபடம்',
    airQuality: 'காற்று தரம்',
    agromet: 'விவசாய வானிலை',
    reports: 'அறிக்கைகள்',
    privacyPolicy: 'தனியுரிமைக் கொள்கை',
    openDataApi: 'திறந்த தரவு API',
    termsOfObservation: 'கண்காணிப்பு விதிமுறைகள்',
    returnToPortal: 'வானிலை தளத்திற்கு திரும்பு',
    portalTitle: 'மௌசம்',
    portalSubtitle: 'வளிமண்டல நுண்ணறிவு & குடிமக்கள் வானிலை தளம்',
    searchPlaceholder: 'நிலையம், நகரம் அல்லது மாநிலத்தை தேடுங்கள்...',
    selectStation: 'வானிலை நிலையத்தைத் தேர்ந்தெடுக்கவும்',
    popularObservatories: 'பிரபல ஆய்வு மையங்கள்',
    noStationsFound: 'நிலையம் எதுவும் கிடைக்கவில்லை.',
    askMausam: 'மௌசமிடம் கேளுங்கள்',
    currentWeather: 'தற்போதைய வானிலை',
    feelsLike: 'உணரும் வெப்பநிலை',
    high: 'அதிகபட்சம்',
    low: 'குறைந்தபட்சம்',
    humidity: 'ஈரப்பதம்',
    wind: 'காற்று',
    windSpeed: 'காற்றின் வேகம்',
    pressure: 'வளிமண்டல அழுத்தம்',
    visibility: 'பார்வை தூரம்',
    uvIndex: 'UV குறியீடு',
    dewPoint: 'பனி நிலை',
    sunrise: 'சூரிய உதயம்',
    sunset: 'சூரிய அஸ்தமனம்',
    allIndiaWeatherStatus: 'அகில இந்திய வானிலை நிலை',
    nationalWeatherSnapshot: 'தேசிய வானிலை சுருக்கம்',
    stateWiseSummary: 'மாநில வாரியான வானிலை (28 மாநிலங்கள் & 8 யூனியன் பிரதேசங்கள்)',
    majorWeatherWarnings: 'முக்கிய வானிலை எச்சரிக்கைகள்',
    quickAccess: 'விரைவு சேவைகள்',
    recentUpdates: 'சமீபத்திய வானிலை செய்திகள்',
  },

  te: {
    home: 'హోమ్',
    weather: 'వాతావరణం',
    forecast: 'సూచన',
    warnings: 'హెచ్చరికలు',
    radar: 'రాడార్ & మ్యాప్‌లు',
    airQuality: 'గాలి నాణ్యత',
    agromet: 'వ్యవసాయ వాతావరణం',
    reports: 'నివేదికలు',
    privacyPolicy: 'గోప్యతా విధానం',
    openDataApi: 'ఓపెన్ డేటా API',
    termsOfObservation: 'పరిశీలన నిబంధనలు',
    returnToPortal: 'వాతావరణ పోర్టల్‌కు తిరిగి వెళ్లండి',
    portalTitle: 'మౌసమ్',
    portalSubtitle: 'వాతావరణ నిఘా & పౌర వాతావరణ వేదిక',
    searchPlaceholder: 'స్టేషన్, నగరం లేదా రాష్ట్రాన్ని శోధించండి...',
    selectStation: 'ప్రాంతీయ వాతావరణ కేంద్రాన్ని ఎంచుకోండి',
    popularObservatories: 'ప్రముఖ పరిశీలనా కేంద్రాలు',
    noStationsFound: 'ఎలాంటి స్టేషన్ కనుగొనబడలేదు.',
    askMausam: 'మౌసమ్‌ను అడగండి',
    currentWeather: 'ప్రస్తుత వాతావరణం',
    feelsLike: 'అనిపించే ఉష్ణోగ్రత',
    high: 'గరిష్ట',
    low: 'కనిష్ట',
    humidity: 'తేమ',
    wind: 'గాలి',
    windSpeed: 'గాలి వేగం',
    pressure: 'పీడనం',
    visibility: 'దృశ్యమానత',
    uvIndex: 'UV సూచిక',
    dewPoint: 'మంచు బిందువు',
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
    allIndiaWeatherStatus: 'అఖిల భారత సినాప్టిక్ స్థితి',
    nationalWeatherSnapshot: 'జాతీయ వాతావరణ స్నాప్‌షాట్',
    stateWiseSummary: 'రాష్ట్రాల వారీ వాతావరణం (28 రాష్ట్రాలు & 8 కేంద్రపాలిత ప్రాంతాలు)',
    majorWeatherWarnings: 'ప్రధాన వాతావరణ హెచ్చరికలు',
    quickAccess: 'త్వరిత సేవలు',
    recentUpdates: 'తాజా వాతావరణ బులెటిన్లు',
  },

  mr: {
    home: 'मुख्यपृष्ठ',
    weather: 'हवामान',
    forecast: 'अंदाज',
    warnings: 'इशारे',
    radar: 'रडार आणि नकाशे',
    airQuality: 'हवेची गुणवत्ता',
    agromet: 'कृषी हवामान',
    reports: 'अहवाल',
    privacyPolicy: 'गोपनीयता धोरण',
    openDataApi: 'ओपन डेटा API',
    termsOfObservation: 'निरीक्षण अटी',
    returnToPortal: 'हवामान पोर्टलवर परत जा',
    portalTitle: 'मौसम',
    portalSubtitle: 'वातावरणीय बुद्धिमत्ता आणि नागरिक हवामान व्यासपीठ',
    searchPlaceholder: 'स्थान, शहर किंवा राज्य शोधा...',
    selectStation: 'हवामान केंद्र निवडा',
    currentWeather: 'सध्याचे हवामान',
    feelsLike: 'जाणवणारे तापमान',
    high: 'कमाल',
    low: 'किमान',
    humidity: 'आर्द्रता',
    wind: 'वारा',
    windSpeed: 'वाऱ्याचा वेग',
    pressure: 'हवेचा दाब',
    visibility: 'दृश्यमानता',
    allIndiaWeatherStatus: 'अखिल भारतीय सिनॉप्टिक स्थिती',
    nationalWeatherSnapshot: 'राष्ट्रीय हवामान सारांश',
    stateWiseSummary: 'राज्यनिहाय हवामान (२८ राज्ये आणि ८ केंद्रशासित प्रदेश)',
    majorWeatherWarnings: 'प्रमुख हवामान इशारे',
    quickAccess: 'जलद सेवा',
  },

  gu: {
    home: 'મુખ્ય પૃષ્ઠ',
    weather: 'હવામાન',
    forecast: 'આગાહી',
    warnings: 'ચેતવણીઓ',
    radar: 'રડાર અને નકશા',
    airQuality: 'હવાની ગુણવત્તા',
    agromet: 'કૃષિ હવામાન',
    reports: 'અહેવાલો',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    openDataApi: 'ઓપન ડેટા API',
    termsOfObservation: 'નિરીક્ષણની શરતો',
    returnToPortal: 'હવામાન પોર્ટલ પર પાછા જાઓ',
    portalTitle: 'મૌસમ',
    portalSubtitle: 'વાતાવરણીય બુદ્ધિમત્તા અને નાગરિક હવામાન પ્લેટફોર્મ',
    searchPlaceholder: 'સ્ટેશન, શહેર અથવા રાજ્ય શોધો...',
    selectStation: 'હવામાન કેન્દ્ર પસંદ કરો',
    currentWeather: 'હાલનું હવામાન',
    feelsLike: 'અનુભવાતું તાપમાન',
    high: 'મહત્તમ',
    low: 'લઘુત્તમ',
    humidity: 'ભેજ',
    wind: 'પવન',
    windSpeed: 'પવનની ગતિ',
    pressure: 'વાતાવરણીય દબાણ',
    allIndiaWeatherStatus: 'અખિલ ભારતીય સિનોપ્ટિક સ્થિતિ',
    nationalWeatherSnapshot: 'રાષ્ટ્રીય હવામાન ઝાંખી',
    stateWiseSummary: 'રાજ્યવાર હવામાન (28 રાજ્યો અને 8 કેન્દ્રશાસિત પ્રદેશો)',
    majorWeatherWarnings: 'મુખ્ય હવામાન ચેતવણીઓ',
    quickAccess: 'ઝડપી સેવાઓ',
  },

  kn: {
    home: 'ಮುಖಪುಟ',
    weather: 'ಹವಾಮಾನ',
    forecast: 'ಮುನ್ಸೂಚನೆ',
    warnings: 'ಎಚ್ಚರಿಕೆಗಳು',
    radar: 'ರಾಡಾರ್ ಮತ್ತು ನಕ್ಷೆಗಳು',
    airQuality: 'ಗಾಳಿಯ ಗುಣಮಟ್ಟ',
    agromet: 'ಕೃಷಿ ಹವಾಮಾನ',
    reports: 'ವರದಿಗಳು',
    privacyPolicy: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    openDataApi: 'ಓಪನ್ ಡೇಟಾ API',
    termsOfObservation: 'ವೀಕ್ಷಣಾ ನಿಯಮಗಳು',
    returnToPortal: 'ಹವಾಮಾನ ಪೋರ್ಟಲ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    portalTitle: 'ಮೌಸಮ್',
    portalSubtitle: 'ವಾತಾವರಣದ ಗುಪ್ತಚರ ಮತ್ತು ನಾಗರಿಕ ಹವಾಮಾನ ವೇದಿಕೆ',
    searchPlaceholder: 'ನಿಲ್ದಾಣ, ನಗರ ಅಥವಾ ರಾಜ್ಯವನ್ನು ಹುಡುಕಿ...',
    selectStation: 'ಹವಾಮಾನ ಕೇಂದ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    currentWeather: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
    feelsLike: 'ಅನುಭವವಾಗುವ ತಾಪಮಾನ',
    high: 'ಗರಿಷ್ಠ',
    low: 'ಕನಿಷ್ಠ',
    humidity: 'ಆರ್ದ್ರತೆ',
    wind: 'ಗಾಳಿ',
    allIndiaWeatherStatus: 'ಅಖಿಲ ಭಾರತ ಸಿನಾಪ್ಟಿಕ್ ಸ್ಥಿತಿ',
    nationalWeatherSnapshot: 'ರಾಷ್ಟ್ರೀಯ ಹವಾಮಾನ ಸಾರಾಂಶ',
    stateWiseSummary: 'ರಾಜ್ಯವಾರು ಹವಾಮಾನ (28 ರಾಜ್ಯಗಳು ಮತ್ತು 8 ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳು)',
    majorWeatherWarnings: 'ಪ್ರಮುಖ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು',
    quickAccess: 'ತ್ವರಿತ ಸೇವೆಗಳು',
  },

  ml: {
    home: 'ഹോം',
    weather: 'കാലാവസ്ഥ',
    forecast: 'പ്രവചനം',
    warnings: 'മുന്നറിയിപ്പുകൾ',
    radar: 'റഡാറും മാപ്പുകളും',
    airQuality: 'വായു ഗുണനിലവാരം',
    agromet: 'കാർഷിക കാലാവസ്ഥ',
    reports: 'റിപ്പോർട്ടുകൾ',
    privacyPolicy: 'സ്വകാര്യതാ നയം',
    openDataApi: 'ഓപ്പൺ ഡാറ്റ API',
    termsOfObservation: 'നിരീക്ഷണ നിബന്ധനകൾ',
    returnToPortal: 'കാലാവസ്ഥാ പോർട്ടലിലേക്ക് മടങ്ങുക',
    portalTitle: 'മൗസം',
    portalSubtitle: 'അന്തരീക്ഷ ഇന്റലിജൻസും പൗര കാലാവസ്ഥാ പ്ലാറ്റ്‌ഫോമും',
    searchPlaceholder: 'സ്റ്റേഷൻ, നഗരം അല്ലെങ്കിൽ സംസ്ഥാനം തിരയുക...',
    currentWeather: 'നിലവിലെ കാലാവസ്ഥ',
    feelsLike: 'അനുഭവപ്പെടുന്ന താപനില',
    high: 'പരമാവധി',
    low: 'കുറഞ്ഞത്',
    humidity: 'ഈർപ്പം',
    allIndiaWeatherStatus: 'അഖിലേന്ത്യാ സിനോപ്റ്റിക് അവസ്ഥ',
    nationalWeatherSnapshot: 'ദേശീയ കാലാവസ്ഥാ വിവരണം',
    stateWiseSummary: 'സംസ്ഥാന തിരിച്ചുള്ള കാലാവസ്ഥ (28 സംസ്ഥാനങ്ങളും 8 കേന്ദ്രഭരണ പ്രദേശങ്ങളും)',
    majorWeatherWarnings: 'പ്രധാന കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ',
    quickAccess: 'ദ്രുത സേവനങ്ങൾ',
  },

  pa: {
    home: 'ਮੁੱਖ ਪੰਨਾ',
    weather: 'ਮੌਸਮ',
    forecast: 'ਭਵਿੱਖਬਾਣੀ',
    warnings: 'ਚੇਤਾਵਨੀਆਂ',
    radar: 'ਰਡਾਰ ਅਤੇ ਨਕਸ਼ੇ',
    airQuality: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ',
    agromet: 'ਖੇਤੀਬਾੜੀ ਮੌਸਮ',
    reports: 'ਰਿਪੋਰਟਾਂ',
    privacyPolicy: 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ',
    openDataApi: 'ਓਪਨ ਡਾਟਾ API',
    termsOfObservation: 'ਨਿਰੀਖਣ ਸ਼ਰਤਾਂ',
    returnToPortal: 'ਮੌਸਮ ਪੋਰਟਲ ਤੇ ਵਾਪਸ ਜਾਓ',
    portalTitle: 'ਮੌਸਮ',
    portalSubtitle: 'ਵਾਯੂਮੰਡਲ ਖੁਫੀਆ ਅਤੇ ਨਾਗਰਿਕ ਮੌਸਮ ਪਲੇਟਫਾਰਮ',
    searchPlaceholder: 'ਸਟੇਸ਼ਨ, ਸ਼ਹਿਰ ਜਾਂ ਰਾਜ ਖੋਜੋ...',
    currentWeather: 'ਮੌਜੂਦਾ ਮੌਸਮ',
    feelsLike: 'ਮਹਿਸੂਸ ਹੁੰਦਾ ਤਾਪਮਾਨ',
    high: 'ਵੱਧ ਤੋਂ ਵੱਧ',
    low: 'ਘੱਟ ਤੋਂ ਘੱਟ',
    humidity: 'ਨਮੀ',
    allIndiaWeatherStatus: 'ਅਖਿਲ ਭਾਰਤੀ ਸਿਨੋਪਟਿਕ ਸਥਿਤੀ',
    nationalWeatherSnapshot: 'ਰਾਸ਼ਟਰੀ ਮੌਸਮ ਸਾਰ',
    stateWiseSummary: 'ਰਾਜ-ਵਾਰ ਮੌਸਮ (28 ਰਾਜ ਅਤੇ 8 ਕੇਂਦਰ ਸ਼ਾਸਤ ਪ੍ਰਦੇਸ਼)',
    majorWeatherWarnings: 'ਮੁੱਖ ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ',
    quickAccess: 'ਤੁਰੰਤ ਸੇਵਾਵਾਂ',
  },

  ur: {
    home: 'ہوم',
    weather: 'موسم',
    forecast: 'پیش گوئی',
    warnings: 'انتباہات',
    radar: 'راڈار اور نقشے',
    airQuality: 'ہوا کا معیار',
    agromet: 'زرعی موسم',
    reports: 'رپورٹس',
    privacyPolicy: 'رازداری کی پالیسی',
    openDataApi: 'اوپن ڈیٹا API',
    termsOfObservation: 'مشاہدے کی شرائط',
    returnToPortal: 'موسم پورٹل پر واپس جائیں',
    portalTitle: 'موسم',
    portalSubtitle: 'ماحولیاتی ذہانت اور شہری موسمی پلیٹ فارم',
    searchPlaceholder: 'اسٹیشن، شہر یا ریاست تلاش کریں...',
    currentWeather: 'موجودہ موسم',
    feelsLike: 'محسوس درجہ حرارت',
    high: 'زیادہ سے زیادہ',
    low: 'کم سے کم',
    humidity: 'نمی',
    wind: 'ہوا',
    allIndiaWeatherStatus: 'کل ہند سائنوپٹک صورتحال',
    nationalWeatherSnapshot: 'قومی موسمی جائزہ',
    stateWiseSummary: 'ریاست وار موسم (28 ریاستیں اور 8 مرکز کے زیر انتظام علاقے)',
    majorWeatherWarnings: 'اہم موسمی انتباہات',
    quickAccess: 'فوری خدمات',
  },

  as: {
    home: 'মুখ্য পৃষ্ঠা',
    weather: 'বতৰ',
    forecast: 'পূৰ্বাভাস',
    warnings: 'সতৰ্কবাৰ্তা',
    radar: 'ৰাডাৰ আৰু মানচিত্ৰ',
    airQuality: 'বায়ুৰ গুণমান',
    agromet: 'কৃষি বতৰ',
    reports: 'প্ৰতিবেদন',
    portalTitle: 'মৌসম',
    portalSubtitle: 'বায়ুমণ্ডলীয় তথ্য আৰু নাগৰিক বতৰ মঞ্চ',
    searchPlaceholder: 'ষ্টেচন, চহৰ বা ৰাজ্য সন্ধান কৰক...',
    currentWeather: 'বৰ্তমান বতৰ',
    feelsLike: 'অনুভূত উষ্ণতা',
    allIndiaWeatherStatus: 'সৰ্বভাৰতীয় চিনপটিক স্থিতি',
    nationalWeatherSnapshot: 'ৰাষ্ট্ৰীয় বতৰৰ চমু ছবি',
    stateWiseSummary: 'ৰাজ্যভিত্তিক বতৰ (২৮ খন ৰাজ্য আৰু ৮ খন কেন্দ্ৰীয় শাসিত অঞ্চল)',
    majorWeatherWarnings: 'প্ৰধান বতৰৰ সতৰ্কবাৰ্তা',
    quickAccess: 'দ্ৰুত সেৱাসমূহ',
  },

  brx: {
    home: 'गाहाय बिखा',
    weather: 'अख्रां',
    forecast: 'सिगां खौरां',
    warnings: 'हुसियार खौरां',
    radar: 'रादार आरो मानसावगारि',
    portalTitle: 'मौसम',
    currentWeather: 'दानाव अख्रां',
    allIndiaWeatherStatus: 'गासै भारतनि अख्रां थासारि',
    nationalWeatherSnapshot: 'हादरनि अख्रां खौरां',
    stateWiseSummary: 'रायजोनि बादियै अख्रां',
    majorWeatherWarnings: 'गाहाय अख्रां हुसियार',
    quickAccess: 'थाब मोननो हानाय',
  },

  doi: {
    home: 'मुक्ख सफा',
    weather: 'मौसम',
    forecast: 'पेशीनगोई',
    warnings: 'चेतावनी',
    portalTitle: 'मौसम',
    currentWeather: 'हुन दा मौसम',
    allIndiaWeatherStatus: 'सारे भारत दी सिनॉप्टिक हालत',
    nationalWeatherSnapshot: 'कौमी मौसम दा सारांश',
    stateWiseSummary: 'रियासतवार मौसम',
    majorWeatherWarnings: 'मुक्ख मौसम चेतावनियां',
    quickAccess: 'तेज सेवान्',
  },

  ks: {
    home: 'اہم صفحہ',
    weather: 'موسم',
    forecast: 'پیشین گوئی',
    warnings: 'خبرداری',
    portalTitle: 'موسم',
    currentWeather: 'حالک موسم',
    allIndiaWeatherStatus: 'سارے ہندوستانچ سائنوپٹک حالت',
    nationalWeatherSnapshot: 'قومی موسمی خاکہ',
    stateWiseSummary: 'ریاست وار موسم',
    majorWeatherWarnings: 'اہم موسمی خبرداری',
    quickAccess: 'تیز خدمات',
  },

  kok: {
    home: 'मुखेल पान',
    weather: 'हवामान',
    forecast: 'अंदाज',
    warnings: 'शिटकावणी',
    portalTitle: 'मौसम',
    currentWeather: 'सद्याचें हवामान',
    allIndiaWeatherStatus: 'अखिल भारतीय सिनॉप्टिक स्थिती',
    nationalWeatherSnapshot: 'राष्ट्रीय हवामान चित्र',
    stateWiseSummary: 'राज्यवार हवामान',
    majorWeatherWarnings: 'मुखेल हवामान शिटकावण्यो',
    quickAccess: 'रोखड्यो सेवा',
  },

  mai: {
    home: 'मुख्य पृष्ठ',
    weather: 'मौसम',
    forecast: 'पूर्वानुमान',
    warnings: 'चेतावनी',
    portalTitle: 'मौसम',
    currentWeather: 'वर्तमान मौसम',
    allIndiaWeatherStatus: 'अखिल भारतीय सिनॉप्टिक स्थिति',
    nationalWeatherSnapshot: 'राष्ट्रीय मौसम सारांश',
    stateWiseSummary: 'राज्यवार मौसम विवरण',
    majorWeatherWarnings: 'प्रमुख मौसम चेतावनी',
    quickAccess: 'त्वरित सेवा',
  },

  mni: {
    home: 'মরুওইবা লামায়',
    weather: 'নোং-নুংশিৎ',
    forecast: 'মাংজৌননা খঙহনবা',
    warnings: 'চেকশিনৱা',
    portalTitle: 'মৌসম',
    currentWeather: 'হৌজিক্কী নোং-নুংশিৎ',
    allIndiaWeatherStatus: 'ভারত অপুনবগী সিনাঅপটিক ফিভম',
    nationalWeatherSnapshot: 'লৈবাক্কী নোং-নুংশিৎ ৱাফম',
    stateWiseSummary: 'রাজ্যগী মতুংইন্না নোং-নুংশিৎ',
    majorWeatherWarnings: 'মরুওইবা চেকশিনৱা',
    quickAccess: 'থুনা ফংবা সর্ভিস',
  },

  ne: {
    home: 'गृह पृष्ठ',
    weather: 'मौसम',
    forecast: 'पूर्वानुमान',
    warnings: 'चेतावनी',
    portalTitle: 'मौसम',
    currentWeather: 'हालको मौसम',
    allIndiaWeatherStatus: 'अखिल भारतीय सिनोप्टिक अवस्था',
    nationalWeatherSnapshot: 'राष्ट्रिय मौसम सारांश',
    stateWiseSummary: 'राज्यअनुसारको मौसम',
    majorWeatherWarnings: 'प्रमुख मौसम चेतावनीहरू',
    quickAccess: 'द्रुत सेवाहरू',
  },

  sa: {
    home: 'मुखपृष्ठम्',
    weather: 'ऋतुमानम्',
    forecast: 'पूर्वानुमानम्',
    warnings: 'सचेतनाः',
    portalTitle: 'मौसम',
    currentWeather: 'वर्तमानर्तुमानम्',
    allIndiaWeatherStatus: 'सर्वभारतीय सिनॉप्टिक स्थितिः',
    nationalWeatherSnapshot: 'राष्ट्रीयर्तुमान सारांशः',
    stateWiseSummary: 'राज्यवार ऋतुमानम्',
    majorWeatherWarnings: 'प्रमुखाः मौसम सचेतनाः',
    quickAccess: 'शीघ्र सेवाः',
  },

  sat: {
    home: 'ᱢᱩᱬᱩᱛ ᱥᱟᱦᱴᱟ',
    weather: 'ᱦᱚᱭ-ᱦᱤᱥᱤᱫ',
    forecast: 'ᱞᱟᱦᱟ ᱠᱷᱚᱵᱚᱨ',
    warnings: 'ᱦᱩᱥᱤᱭᱟᱹᱨ',
    portalTitle: 'ᱢᱚᱣᱥᱚᱢ',
    currentWeather: 'ᱱᱤᱛᱚᱜᱟᱜ ᱦᱚᱭ-ᱦᱤᱥᱤᱫ',
    allIndiaWeatherStatus: 'ᱥᱟᱱᱟᱢ ᱵᱷᱟᱨᱚᱛ ᱥᱤᱱᱚᱯᱴᱤᱠ ᱚᱵᱚᱥᱛᱟ',
    nationalWeatherSnapshot: 'ᱫᱤᱥᱚᱢ ᱦᱚᱭ-ᱦᱤᱥᱤᱫ ᱠᱷᱟᱴᱚᱛᱮ',
    stateWiseSummary: 'ᱯᱚᱱᱚᱛ ᱞᱮᱠᱟᱛᱮ ᱦᱚᱭ-ᱦᱤᱥᱤᱫ',
    majorWeatherWarnings: 'ᱢᱩᱬᱩᱛ ᱦᱩᱥᱤᱭᱟᱹᱨ ᱠᱚ',
    quickAccess: 'ᱞᱚᱜᱚᱱ ᱥᱮᱵᱟ',
  },

  sd: {
    home: 'مکيه صفحو',
    weather: 'موسم',
    forecast: 'پيشنگوئي',
    warnings: 'خبرداري',
    portalTitle: 'موسم',
    currentWeather: 'هاڻوڪي موسم',
    allIndiaWeatherStatus: 'سڄي ڀارت جي سائنوپٽڪ صورتحال',
    nationalWeatherSnapshot: 'قومي موسمي جائزو',
    stateWiseSummary: 'رياست وار موسم',
    majorWeatherWarnings: 'مکيه موسمي خبرداريون',
    quickAccess: 'تيز خدمتون',
  },
};

export function translateWeatherCondition(condition: string, lang: Language): string {
  const norm = (condition || '').toLowerCase();
  
  if (lang === 'hi') {
    if (norm.includes('partly cloudy')) return 'आंशिक रूप से बादल';
    if (norm.includes('cloudy') || norm.includes('overcast')) return 'बादल छाए रहेंगे';
    if (norm.includes('heavy rain')) return 'भारी वर्षा';
    if (norm.includes('light rain') || norm.includes('drizzle')) return 'हल्की वर्षा / बूंदाबांदी';
    if (norm.includes('rain')) return 'वर्षा';
    if (norm.includes('thunderstorm')) return 'गरज के साथ बौछारें';
    if (norm.includes('clear') || norm.includes('sunny')) return 'साफ मौसम';
    if (norm.includes('fog') || norm.includes('mist')) return 'कोहरा';
    if (norm.includes('dust') || norm.includes('haze')) return 'धुंध / धूल';
  } else if (lang === 'or') {
    if (norm.includes('partly cloudy')) return 'ଆଂଶିକ ମେଘୁଆ';
    if (norm.includes('cloudy') || norm.includes('overcast')) return 'ମେଘୁଆ ପାଗ';
    if (norm.includes('heavy rain')) return 'ପ୍ରବଳ ବର୍ଷା';
    if (norm.includes('light rain') || norm.includes('drizzle')) return 'ହାଲୁକା ବର୍ଷା';
    if (norm.includes('rain')) return 'ବର୍ଷା';
    if (norm.includes('thunderstorm')) return 'ବଜ୍ରପାତ ସହ ବର୍ଷା';
    if (norm.includes('clear') || norm.includes('sunny')) return 'ପରିଷ୍କାର ପାଗ';
    if (norm.includes('fog') || norm.includes('mist')) return 'କୁହୁଡ଼ି';
    if (norm.includes('dust') || norm.includes('haze')) return 'ଧୂଆଁଳିଆ / ଧୂଳି';
  } else if (lang === 'bn') {
    if (norm.includes('partly cloudy')) return 'আংশিক মেঘলা';
    if (norm.includes('cloudy') || norm.includes('overcast')) return 'মেঘলা';
    if (norm.includes('heavy rain')) return 'ভারী বৃষ্টিপাত';
    if (norm.includes('rain')) return 'বৃষ্টি';
    if (norm.includes('thunderstorm')) return 'বজ্রবিদ্যুৎসহ বৃষ্টি';
    if (norm.includes('clear') || norm.includes('sunny')) return 'পরিষ্কার আকাশ';
  } else if (lang === 'ta') {
    if (norm.includes('partly cloudy')) return 'பகுதி மேகமூட்டம்';
    if (norm.includes('cloudy')) return 'மேகமூட்டம்';
    if (norm.includes('rain')) return 'மழை';
    if (norm.includes('thunderstorm')) return 'இடியுடன் கூடிய மழை';
    if (norm.includes('clear') || norm.includes('sunny')) return 'தெளிவான வானம்';
  } else if (lang === 'te') {
    if (norm.includes('partly cloudy')) return 'పాక్షికంగా మేఘావృతం';
    if (norm.includes('cloudy')) return 'మేఘావృతం';
    if (norm.includes('rain')) return 'వర్షం';
    if (norm.includes('thunderstorm')) return 'ఉరుములతో కూడిన వర్షం';
    if (norm.includes('clear') || norm.includes('sunny')) return 'నిర్మలమైన ఆకాశం';
  }

  return condition;
}

export function formatLocalizedDate(date: Date, lang: Language): string {
  try {
    const localeMap: Record<Language, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      or: 'or-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      ur: 'ur-IN',
      as: 'as-IN',
      brx: 'hi-IN',
      doi: 'hi-IN',
      ks: 'ur-IN',
      kok: 'kok-IN',
      mai: 'hi-IN',
      mni: 'bn-IN',
      ne: 'ne-NP',
      sa: 'sa-IN',
      sat: 'hi-IN',
      sd: 'ur-IN',
    };

    const targetLocale = localeMap[lang] || 'en-IN';
    return new Intl.DateTimeFormat(targetLocale, {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}
