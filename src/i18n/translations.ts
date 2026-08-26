export type Language = 'en' | 'hi' | 'or';

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
  istLabel: string;
  english: string;
  hindi: string;
  odia: string;

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
  treePollen: string;
  grassPollen: string;
  weedPollen: string;

  // Agromet
  agrometTitle: string;
  cropAdvisories: string;
  soilMoisture: string;
  irrigationAdvice: string;
  pestWarning: string;
  farmerAdvisoryNotice: string;

  // Citizen Reports & Radar
  citizenReportsTitle: string;
  submitObservation: string;
  recentObservations: string;
  liveDopplerRadar: string;
  satelliteComposite: string;
  windStreamlines: string;
  radarEcho: string;

  // Footer & Institutional
  mausamPortal: string;
  footerTagline: string;
  dataProvidersTitle: string;
  citizenServicesTitle: string;
  standardProtocolsTitle: string;
  footerStandardNotice: string;
  allRightsReserved: string;
  imdCredit: string;
  cpcbCredit: string;
  ncmrwfCredit: string;
  isroCredit: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Navigation
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

    // Header & Search
    portalTitle: 'MAUSAM',
    portalSubtitle: 'Atmospheric Intelligence & Citizen Weather Platform',
    searchPlaceholder: 'Search station or state...',
    selectStation: 'SELECT REGIONAL MET STATION',
    popularObservatories: 'POPULAR OBSERVATORIES',
    noStationsFound: 'No matching stations found.',
    askMausam: 'Ask MAUSAM',
    decreaseFont: 'Decrease Font Size',
    resetFont: 'Reset Font Size',
    increaseFont: 'Increase Font Size',
    language: 'Language',
    istLabel: 'IST',
    english: 'English',
    hindi: 'Hindi',
    odia: 'Odia',

    // Weather Overview
    currentWeather: 'Current Weather',
    feelsLike: 'Feels like',
    high: 'High',
    low: 'Low',
    humidity: 'Humidity',
    wind: 'Wind',
    windSpeed: 'Wind Speed',
    pressure: 'Pressure',
    visibility: 'Visibility',
    uvIndex: 'UV Index',
    dewPoint: 'Dew Point',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    precipitation: 'Precipitation',
    precipitationActive: 'Precipitation Active',
    normalStatus: 'Normal Synoptic Status',
    highTemperature: 'High Temperature',
    observationVerified: 'Observation Verified',
    dopplerRadarActive: 'Doppler S-Band Radial Radar Coverage: Active',
    updated: 'Updated',
    justNow: 'Just Now',
    refresh: 'Refresh',
    station: 'Station',
    elevation: 'Elev',
    coordinates: 'Coordinates',

    // Forecast
    today: 'Today',
    tomorrow: 'Tomorrow',
    sevenDayForecast: '7-Day Forecast',
    hourlyForecast: 'Hourly Forecast (24 Hours)',
    probabilityOfRain: 'Probability of Rain',
    temperatureTrend: 'Temperature Trend',
    daytime: 'Day',
    nighttime: 'Night',
    expectedConditions: 'Expected Conditions',

    // Alerts
    weatherBulletin: 'WEATHER BULLETIN',
    synopticBulletin: 'SYNOPTIC BULLETIN: NORMAL METEOROLOGICAL CONDITIONS',
    activeAlerts: 'Active Weather Alerts',
    noActiveAlerts: 'No active severe storm warnings',
    viewAllAlerts: 'View All Alerts',
    affectedArea: 'Affected',
    validUntil: 'Valid until',
    normalSynopticStatus: 'Normal Synoptic Conditions',
    noSevereWarnings: 'No active severe storm warnings for the selected area. Monitored across all Doppler radars.',
    warningLevel: 'Warning Level',
    greenStatus: 'No Warning (Green)',
    yellowWatch: 'Be Updated (Yellow)',
    orangeAlert: 'Be Prepared (Orange)',
    redWarning: 'Take Action (Red)',

    // AQI & Pollen
    aqiHeader: 'National Air Quality Index (NAQI)',
    aqiCategory: 'AQI Status',
    naqiGood: 'Good',
    naqiSatisfactory: 'Satisfactory',
    naqiModerate: 'Moderate',
    naqiPoor: 'Poor',
    naqiVeryPoor: 'Very Poor',
    naqiSevere: 'Severe',
    prominentPollutant: 'Prominent Pollutant',
    pollenSurveillance: 'Aero-Allergen Pollen Surveillance',
    pollenLevel: 'Pollen Level',
    treePollen: 'Tree Pollen',
    grassPollen: 'Grass Pollen',
    weedPollen: 'Weed Pollen',

    // Agromet
    agrometTitle: 'Gramin Krishi Mausam Sewa (Agromet Advisory)',
    cropAdvisories: 'Agricultural & Crop Advisories',
    soilMoisture: 'Soil Moisture',
    irrigationAdvice: 'Irrigation & Sowing Guidance',
    pestWarning: 'Pest & Disease Advisory',
    farmerAdvisoryNotice: 'Field recommendations issued for local agro-climatic zones.',

    // Citizen & Radar
    citizenReportsTitle: 'Citizen Ground Observations',
    submitObservation: 'Submit Local Observation',
    recentObservations: 'Recent Citizen Reports',
    liveDopplerRadar: 'Live Doppler Radar (MAXZ / dBZ)',
    satelliteComposite: 'INSAT-3D Satellite Infrared Composite',
    windStreamlines: 'Surface Wind Streamlines',
    radarEcho: 'Radar Reflectivity (dBZ)',

    // Footer
    mausamPortal: 'MAUSAM PORTAL',
    footerTagline: 'National Atmospheric Intelligence & Citizen Weather Platform. Calibrated with Doppler weather radars, Automatic Weather Stations (AWS), and satellite telemetry.',
    dataProvidersTitle: 'Data Providers & Networks',
    citizenServicesTitle: 'Citizen Meteorological Services',
    standardProtocolsTitle: 'Standard Protocols',
    footerStandardNotice: 'Adheres to World Meteorological Organization (WMO) standards for meteorological instrument calibration and NDMA hazard classification.',
    allRightsReserved: '© 2026 MAUSAM National Meteorological Platform • Smart India Hackathon (SIH 2026)',
    imdCredit: 'India Meteorological Department (IMD)',
    cpcbCredit: 'Central Pollution Control Board (CPCB)',
    ncmrwfCredit: 'NCMRWF Global & Regional Models',
    isroCredit: 'ISRO MOSDAC Earth Observation',
  },

  hi: {
    // Navigation
    home: 'होम',
    weather: 'मौसम',
    forecast: 'पूर्वानुमान',
    warnings: 'चेतावनियाँ',
    radar: 'रडार और मानचित्र',
    airQuality: 'वायु गुणवत्ता',
    agromet: 'कृषि-मौसम',
    reports: 'रिपोर्ट',
    privacyPolicy: 'गोपनीयता नीति',
    openDataApi: 'ओपन डेटा API',
    termsOfObservation: 'अवलोकन की शर्तें',
    returnToPortal: 'मौसम पोर्टल पर वापस लौटें',

    // Header & Search
    portalTitle: 'मौसम',
    portalSubtitle: 'वायुमंडलीय बुद्धिमत्ता एवं नागरिक मौसम मंच',
    searchPlaceholder: 'स्टेशन या राज्य खोजें...',
    selectStation: 'क्षेत्रीय मौसम विज्ञान केंद्र चुनें',
    popularObservatories: 'प्रमुख वेधशालाएं',
    noStationsFound: 'कोई मेल खाता स्टेशन नहीं मिला।',
    askMausam: 'मौसम से पूछें',
    decreaseFont: 'फ़ॉन्ट आकार घटाएं',
    resetFont: 'फ़ॉन्ट आकार रीसेट करें',
    increaseFont: 'फ़ॉन्ट आकार बढ़ाएं',
    language: 'भाषा',
    istLabel: 'भा.मा.स.',
    english: 'English',
    hindi: 'हिन्दी',
    odia: 'ଓଡ଼ିଆ',

    // Weather Overview
    currentWeather: 'वर्तमान मौसम',
    feelsLike: 'महसूस होता है',
    high: 'अधिकतम',
    low: 'न्यूनतम',
    humidity: 'आर्द्रता',
    wind: 'हवा',
    windSpeed: 'हवा की गति',
    pressure: 'वायुदाब',
    visibility: 'दृश्यता',
    uvIndex: 'यूवी इंडेक्स',
    dewPoint: 'ओसांक',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    precipitation: 'वर्षण',
    precipitationActive: 'बारिश जारी है',
    normalStatus: 'सामान्य मौसमी स्थिति',
    highTemperature: 'उच्च तापमान',
    observationVerified: 'सत्यापित अवलोकन',
    dopplerRadarActive: 'डॉपलर एस-बैंड रेडियल रडार कवरेज: सक्रिय',
    updated: 'अद्यतन',
    justNow: 'अभी-अभी',
    refresh: 'ताज़ा करें',
    station: 'स्टेशन',
    elevation: 'ऊंचाई',
    coordinates: 'निर्देशांक',

    // Forecast
    today: 'आज',
    tomorrow: 'कल',
    sevenDayForecast: '7-दिवसीय पूर्वानुमान',
    hourlyForecast: 'प्रति घंटा पूर्वानुमान (24 घंटे)',
    probabilityOfRain: 'बारिश की संभावना',
    temperatureTrend: 'तापमान का रुझान',
    daytime: 'दिन',
    nighttime: 'रात',
    expectedConditions: 'अपेक्षित परिस्थितियां',

    // Alerts
    weatherBulletin: 'मौसम बुलेटिन',
    synopticBulletin: 'सिनॉप्टिक बुलेटिन: सामान्य मौसम की स्थिति',
    activeAlerts: 'सक्रिय मौसम चेतावनियाँ',
    noActiveAlerts: 'कोई गंभीर तूफान की चेतावनी नहीं',
    viewAllAlerts: 'सभी चेतावनियाँ देखें',
    affectedArea: 'प्रभावित क्षेत्र',
    validUntil: 'वैधता',
    normalSynopticStatus: 'सामान्य सिनॉप्टिक स्थिति',
    noSevereWarnings: 'चयनित क्षेत्र के लिए कोई गंभीर चेतावनी नहीं है। सभी डॉपलर रडार से निरंतर निगरानी जारी है।',
    warningLevel: 'चेतावनी स्तर',
    greenStatus: 'कोई चेतावनी नहीं (हरा)',
    yellowWatch: 'अपडेट रहें (पीला)',
    orangeAlert: 'तैयार रहें (नारंगी)',
    redWarning: 'कार्रवाई करें (लाल)',

    // AQI & Pollen
    aqiHeader: 'राष्ट्रीय वायु गुणवत्ता सूचकांक (NAQI)',
    aqiCategory: 'AQI स्थिति',
    naqiGood: 'अच्छा',
    naqiSatisfactory: 'संतोषजनक',
    naqiModerate: 'मध्यम',
    naqiPoor: 'खराब',
    naqiVeryPoor: 'बहुत खराब',
    naqiSevere: 'गंभीर',
    prominentPollutant: 'प्रमुख प्रदूषक',
    pollenSurveillance: 'परागकण एवं एलर्जी निगरानी',
    pollenLevel: 'परागकण स्तर',
    treePollen: 'वृक्ष पराग',
    grassPollen: 'घास पराग',
    weedPollen: 'खरपतवार पराग',

    // Agromet
    agrometTitle: 'ग्रामीण कृषि मौसम सेवा (कृषि सलाह)',
    cropAdvisories: 'कृषि एवं फसल संबंधी सलाह',
    soilMoisture: 'मृदा नमी',
    irrigationAdvice: 'सिंचाई एवं बुवाई संबंधी मार्गदर्शन',
    pestWarning: 'कीट एवं रोग चेतावनी',
    farmerAdvisoryNotice: 'स्थानीय कृषि-जलवायु क्षेत्रों के लिए जारी की गई सिफारिशें।',

    // Citizen & Radar
    citizenReportsTitle: 'नागरिक जमीनी अवलोकन',
    submitObservation: 'स्थानीय अवलोकन दर्ज करें',
    recentObservations: 'हालिया नागरिक रिपोर्टें',
    liveDopplerRadar: 'लाइव डॉपलर रडार (MAXZ / dBZ)',
    satelliteComposite: 'इन्सैट-3D उपग्रह इन्फ्रारेड कंपोजिट',
    windStreamlines: 'सतही पवन प्रवाह रेखाएं',
    radarEcho: 'रडार परावर्तन (dBZ)',

    // Footer
    mausamPortal: 'मौसम पोर्टल',
    footerTagline: 'राष्ट्रीय वायुमंडलीय बुद्धिमत्ता एवं नागरिक मौसम मंच। डॉपलर मौसम रडार, स्वचालित मौसम स्टेशन (AWS) और उपग्रह टेलीमेट्री से कैलिब्रेटेड।',
    dataProvidersTitle: 'डेटा प्रदाता एवं नेटवर्क',
    citizenServicesTitle: 'नागरिक मौसम सेवाएं',
    standardProtocolsTitle: 'मानक प्रोटोकॉल',
    footerStandardNotice: 'मौसम संबंधी उपकरणों के अंशांकन और NDMA आपदा वर्गीकरण के लिए विश्व मौसम विज्ञान संगठन (WMO) मानकों का पालन करता है।',
    allRightsReserved: '© 2026 मौसम राष्ट्रीय मौसम विज्ञान मंच • स्मार्ट इंडिया हैकथॉन (SIH 2026)',
    imdCredit: 'भारत मौसम विज्ञान विभाग (IMD)',
    cpcbCredit: 'केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB)',
    ncmrwfCredit: 'NCMRWF वैश्विक एवं क्षेत्रीय मॉडल',
    isroCredit: 'ISRO MOSDAC पृथ्वी अवलोकन',
  },

  or: {
    // Navigation
    home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    weather: 'ପାଣିପାଗ',
    forecast: 'ପୂର୍ବାନୁମାନ',
    warnings: 'ଚେତାବନୀ',
    radar: 'ରାଡାର ଏବଂ ମାନଚିତ୍ର',
    airQuality: 'ବାୟୁ ଗୁଣବତ୍ତା',
    agromet: 'କୃଷି-ପାଣିପାଗ',
    reports: 'ରିପୋର୍ଟ',
    privacyPolicy: 'ଗୋପନୀୟତା ନୀତି',
    openDataApi: 'ଓପନ୍ ଡାଟା API',
    termsOfObservation: 'ପର୍ଯ୍ୟବେକ୍ଷଣ ସର୍ତ୍ତାବଳୀ',
    returnToPortal: 'ପାଣିପାଗ ପୋର୍ଟାଲ୍ କୁ ଫେରନ୍ତୁ',

    // Header & Search
    portalTitle: 'ମୌସମ',
    portalSubtitle: 'ବାୟୁମଣ୍ଡଳୀୟ ବୁଦ୍ଧିମତା ଏବଂ ନାଗରିକ ପାଣିପାଗ ମଞ୍ଚ',
    searchPlaceholder: 'ଷ୍ଟେସନ କିମ୍ବା ରାଜ୍ୟ ଖୋଜନ୍ତୁ...',
    selectStation: 'ଆଞ୍ଚଳିକ ପାଣିପାଗ କେନ୍ଦ୍ର ଚୟନ କରନ୍ତୁ',
    popularObservatories: 'ମୁଖ୍ୟ ପାଣିପାଗ କେନ୍ଦ୍ରଗୁଡ଼ିକ',
    noStationsFound: 'କୌଣସି ଷ୍ଟେସନ ମିଳିଲା ନାହିଁ।',
    askMausam: 'ମୌସମ କୁ ପଚାରନ୍ତୁ',
    decreaseFont: 'ଫଣ୍ଟ ଆକାର ହ୍ରାସ କରନ୍ତୁ',
    resetFont: 'ଫଣ୍ଟ ଆକାର ପୁନଃସ୍ଥାପନ କରନ୍ତୁ',
    increaseFont: 'ଫଣ୍ଟ ଆକାର ବୃଦ୍ଧି କରନ୍ତୁ',
    language: 'ଭାଷା',
    istLabel: 'ଭା.ମା.ସ.',
    english: 'English',
    hindi: 'हिन्दी',
    odia: 'ଓଡ଼ିଆ',

    // Weather Overview
    currentWeather: 'ବର୍ତ୍ତମାନର ପାଣିପାଗ',
    feelsLike: 'ଅନୁଭୂତ ତାପମାତ୍ରା',
    high: 'ସର୍ବୋଚ୍ଚ',
    low: 'ସର୍ବନିମ୍ନ',
    humidity: 'ଆର୍ଦ୍ରତା',
    wind: 'ପବନ',
    windSpeed: 'ପବନର ବେଗ',
    pressure: 'ବାୟୁ ଚାପ',
    visibility: 'ଦୃଶ୍ୟମାନତା',
    uvIndex: 'ୟୁଭି ଇଣ୍ଡେକ୍ସ',
    dewPoint: 'କାକର ବିନ୍ଦୁ',
    sunrise: 'ସୂର୍ଯ୍ୟୋଦୟ',
    sunset: 'ସୂର୍ଯ୍ୟାସ୍ତ',
    precipitation: 'ବୃଷ୍ଟିପାତ',
    precipitationActive: 'ବର୍ଷା ଜାରି ରହିଛି',
    normalStatus: 'ସ୍ୱାଭାବିକ ପାଣିପାଗ ସ୍ଥିତି',
    highTemperature: 'ଉଚ୍ଚ ତାପମାତ୍ରା',
    observationVerified: 'ପ୍ରମାଣିତ ପର୍ଯ୍ୟବେକ୍ଷଣ',
    dopplerRadarActive: 'ଡପଲର ଏସ୍-ବ୍ୟାଣ୍ଡ ରାଡାର କଭରେଜ୍: ସକ୍ରିୟ',
    updated: 'ଅଦ୍ୟତନ',
    justNow: 'ବର୍ତ୍ତମାନ',
    refresh: 'ତାଜା କରନ୍ତୁ',
    station: 'ଷ୍ଟେସନ',
    elevation: 'ଉଚ୍ଚତା',
    coordinates: 'ସ୍ଥାନାଙ୍କ',

    // Forecast
    today: 'ଆଜି',
    tomorrow: 'ଆସନ୍ତାକାଲି',
    sevenDayForecast: '୭ ଦିନର ପୂର୍ବାନୁମାନ',
    hourlyForecast: 'ଘଣ୍ଟା ଅନୁସାରେ ପୂର୍ବାନୁମାନ (୨୪ ଘଣ୍ଟା)',
    probabilityOfRain: 'ବର୍ଷାର ସମ୍ଭାବନା',
    temperatureTrend: 'ତାପମାତ୍ରା ଧାରା',
    daytime: 'ଦିନ',
    nighttime: 'ରାତି',
    expectedConditions: 'ଅନୁମାନିତ ସ୍ଥିତି',

    // Alerts
    weatherBulletin: 'ପାଣିପାଗ ବୁଲେଟିନ୍',
    synopticBulletin: 'ସିନପ୍ଟିକ ବୁଲେଟିନ୍: ସ୍ୱାଭାବିକ ପାଣିପାଗ ସ୍ଥିତି',
    activeAlerts: 'ସକ୍ରିୟ ପାଣିପାଗ ଚେତାବନୀ',
    noActiveAlerts: 'କୌଣସି ବିପଦପୂର୍ଣ୍ଣ ଝଡ଼ ଚେତାବନୀ ନାହିଁ',
    viewAllAlerts: 'ସମସ୍ତ ଚେତାବନୀ ଦେଖନ୍ତୁ',
    affectedArea: 'ପ୍ରଭାବିତ ଅଞ୍ଚଳ',
    validUntil: 'ବୈଧତା ଅବଧି',
    normalSynopticStatus: 'ସ୍ୱାଭାବିକ ପାଣିପାଗ ସ୍ଥିତି',
    noSevereWarnings: 'ମନୋନୀତ ଅଞ୍ଚଳ ପାଇଁ କୌଣସି ଗମ୍ଭୀର ଚେତାବନୀ ନାହିଁ। ସମସ୍ତ ଡପଲର ରାଡାର ଦ୍ୱାରା ନିରନ୍ତର ନଜର ରଖାଯାଇଛି।',
    warningLevel: 'ଚେତାବନୀ ସ୍ତର',
    greenStatus: 'କୌଣସି ଚେତାବନୀ ନାହିଁ (ସବୁଜ)',
    yellowWatch: 'ଅପଡେଟ୍ ରୁହନ୍ତୁ (ହଳଦିଆ)',
    orangeAlert: 'ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ (କମଳା)',
    redWarning: 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଗ୍ରହଣ କରନ୍ତୁ (ନାଲି)',

    // AQI & Pollen
    aqiHeader: 'ଜାତୀୟ ବାୟୁ ଗୁଣବତ୍ତା ସୂଚକାଙ୍କ (NAQI)',
    aqiCategory: 'AQI ସ୍ଥିତି',
    naqiGood: 'ଉତ୍ତମ',
    naqiSatisfactory: 'ସନ୍ତୋଷଜନକ',
    naqiModerate: 'ମଧ୍ୟମ',
    naqiPoor: 'ଖରାପ',
    naqiVeryPoor: 'ଅତ୍ୟନ୍ତ ଖରାପ',
    naqiSevere: 'ଗମ୍ଭୀର',
    prominentPollutant: 'ମୁଖ୍ୟ ପ୍ରଦୂଷକ',
    pollenSurveillance: 'ପରାଗରେଣୁ ଏବଂ ଆଲର୍ଜି ନିରୀକ୍ଷଣ',
    pollenLevel: 'ପରାଗ ସ୍ତର',
    treePollen: 'ବୃକ୍ଷ ପରାଗ',
    grassPollen: 'ଘାସ ପରାଗ',
    weedPollen: 'ଅନାବନା ଘାସ ପରାଗ',

    // Agromet
    agrometTitle: 'ଗ୍ରାମୀଣ କୃଷି ମୌସମ ସେବା (କୃଷି ପରାମର୍ଶ)',
    cropAdvisories: 'କୃଷି ଏବଂ ଫସଲ ପରାମର୍ଶ',
    soilMoisture: 'ମୃତ୍ତିକା ଆର୍ଦ୍ରତା',
    irrigationAdvice: 'ଜଳସେଚନ ଓ ବୁଣାବୁଣି ମାର୍ଗଦର୍ଶନ',
    pestWarning: 'କୀଟ ଏବଂ ରୋଗ ସତର୍କତା',
    farmerAdvisoryNotice: 'ସ୍ଥାନୀୟ କୃଷି-ଜଳବାୟୁ କ୍ଷେତ୍ର ପାଇଁ ଜାରି କରାଯାଇଥିବା ସୁପାରିଶ।',

    // Citizen & Radar
    citizenReportsTitle: 'ନାଗରିକ ପ୍ରତ୍ୟକ୍ଷ ପର୍ଯ୍ୟବେକ୍ଷଣ',
    submitObservation: 'ସ୍ଥାନୀୟ ପର୍ଯ୍ୟବେକ୍ଷଣ ଦାଖଲ କରନ୍ତୁ',
    recentObservations: 'ସାମ୍ପ୍ରତିକ ନାଗରିକ ରିପୋର୍ଟ',
    liveDopplerRadar: 'ଲାଇଭ୍ ଡପଲର ରାଡାର (MAXZ / dBZ)',
    satelliteComposite: 'ଇନସାଟ୍-3D ଉପଗ୍ରହ ଇନଫ୍ରାରେଡ୍ କମ୍ପୋଜିଟ୍',
    windStreamlines: 'ଭୂପୃଷ୍ଠ ପବନ ପ୍ରବାହ ରେଖା',
    radarEcho: 'ରାଡାର ପ୍ରତିଫଳନ (dBZ)',

    // Footer
    mausamPortal: 'ମୌସମ ପୋର୍ଟାଲ୍',
    footerTagline: 'ଜାତୀୟ ବାୟୁମଣ୍ଡଳୀୟ ବୁଦ୍ଧିମତା ଏବଂ ନାଗରିକ ପାଣିପାଗ ମଞ୍ଚ। ଡପଲର ପାଣିପାଗ ରାଡାର, ସ୍ୱୟଂଚାଳିତ ପାଣିପାଗ ଷ୍ଟେସନ (AWS) ଏବଂ ଉପଗ୍ରହ ଟେଲିମେଟ୍ରି ସହିତ କାଲିବ୍ରେଟ୍।',
    dataProvidersTitle: 'ଡାଟା ପ୍ରଦାନକାରୀ ଏବଂ ନେଟୱାର୍କ',
    citizenServicesTitle: 'ନାଗରିକ ପାଣିପାଗ ସେବା',
    standardProtocolsTitle: 'ମାନକ ନିୟମାବଳୀ',
    footerStandardNotice: 'ପାଣିପାଗ ଯନ୍ତ୍ରପାତି ମାନାଙ୍କନ ଏବଂ NDMA ବିପର୍ଯ୍ୟୟ ବର୍ଗୀକରଣ ପାଇଁ ବିଶ୍ୱ ପାଣିପାଗ ସଂଗଠନ (WMO) ମାନଦଣ୍ଡ ପାଳନ କରେ।',
    allRightsReserved: '© ୨୦୨୬ ମୌସମ ଜାତୀୟ ପାଣିପାଗ ମଞ୍ଚ • ସ୍ମାର୍ଟ ଇଣ୍ଡିଆ ହାକାଥନ୍ (SIH 2026)',
    imdCredit: 'ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD)',
    cpcbCredit: 'କେନ୍ଦ୍ରୀୟ ପ୍ରଦୂଷଣ ନିୟନ୍ତ୍ରଣ ବୋର୍ଡ (CPCB)',
    ncmrwfCredit: 'NCMRWF ଗ୍ଲୋବାଲ ଏବଂ ଆଞ୍ଚଳିକ ମଡେଲ୍',
    isroCredit: 'ISRO MOSDAC ପୃଥିବୀ ପର୍ଯ୍ୟବେକ୍ଷଣ',
  },
};

// Weather condition translations dictionary
export const weatherConditionTranslations: Record<
  Language,
  Record<string, string>
> = {
  en: {
    Clear: 'Clear',
    Sunny: 'Sunny',
    'Partly Cloudy': 'Partly Cloudy',
    'Partly Sunny': 'Partly Sunny',
    Cloudy: 'Cloudy',
    Overcast: 'Overcast',
    Rain: 'Rain',
    'Light Rain': 'Light Rain',
    'Moderate Rain': 'Moderate Rain',
    'Heavy Rain': 'Heavy Rain',
    'Patchy Rain': 'Patchy Rain',
    Showers: 'Showers',
    Thunderstorm: 'Thunderstorm',
    'Severe Thunderstorm': 'Severe Thunderstorm',
    Drizzle: 'Drizzle',
    'Light Drizzle': 'Light Drizzle',
    Haze: 'Haze',
    Mist: 'Mist',
    Fog: 'Fog',
    Smoke: 'Smoke',
    Windy: 'Windy',
    Breezy: 'Breezy',
    Squall: 'Squall',
    'Dust Storm': 'Dust Storm',
  },
  hi: {
    Clear: 'साफ मौसम',
    Sunny: 'धूप',
    'Partly Cloudy': 'आंशिक रूप से बादल',
    'Partly Sunny': 'आंशिक रूप से धूप',
    Cloudy: 'बादल छाए रहेंगे',
    Overcast: 'घने बादल',
    Rain: 'बारिश',
    'Light Rain': 'हल्की बारिश',
    'Moderate Rain': 'मध्यम बारिश',
    'Heavy Rain': 'भारी बारिश',
    'Patchy Rain': 'छिटपुट बारिश',
    Showers: 'फुहारें',
    Thunderstorm: 'गरज के साथ बारिश',
    'Severe Thunderstorm': 'भीषण आंधी-तूफान',
    Drizzle: 'बूंदाबांदी',
    'Light Drizzle': 'हल्की बूंदाबांदी',
    Haze: 'धुंध',
    Mist: 'कोहरा / धुंध',
    Fog: 'घना कोहरा',
    Smoke: 'धुआं',
    Windy: 'तेज हवा',
    Breezy: 'मंद हवा',
    Squall: 'झक्कड़ / तूफान',
    'Dust Storm': 'धूल भरी आंधी',
  },
  or: {
    Clear: 'ସ୍ୱଚ୍ଛ ପାଣିପାଗ',
    Sunny: 'ଖରାଟିଆ',
    'Partly Cloudy': 'ଆଂଶିକ ମେଘୁଆ',
    'Partly Sunny': 'ଆଂଶିକ ଖରା',
    Cloudy: 'ମେଘୁଆ',
    Overcast: 'ଘନ ମେଘାଚ୍ଛନ୍ନ',
    Rain: 'ବର୍ଷା',
    'Light Rain': 'ହାଲୁକା ବର୍ଷା',
    'Moderate Rain': 'ମଧ୍ୟମ ବର୍ଷା',
    'Heavy Rain': 'ପ୍ରବଳ ବର୍ଷା',
    'Patchy Rain': 'ଖଣ୍ଡିଆ ବର୍ଷା',
    Showers: 'ବର୍ଷା ଝଲକ',
    Thunderstorm: 'ବିଜୁଳି ଘଡ଼ଘଡ଼ି ସହ ବର୍ଷା',
    'Severe Thunderstorm': 'ଭୟଙ୍କର କାଳବୈଶାଖୀ',
    Drizzle: 'ଝିପିଝିପି ବର୍ଷା',
    'Light Drizzle': 'ହାଲୁକା ଝିପିଝିପି ବର୍ଷା',
    Haze: 'କୁହୁଡ଼ିଆ ପାଗ',
    Mist: 'କୁହୁଡ଼ି',
    Fog: 'ଘନ କୁହୁଡ଼ି',
    Smoke: 'ଧୂଆଁଳିଆ',
    Windy: 'ପବନମୟ',
    Breezy: 'ମୃଦୁ ପବନ',
    Squall: 'ଝଡ଼ ପବନ',
    'Dust Storm': 'ଧୂଳି ଝଡ଼',
  },
};

/**
 * Translates a condition string safely, falling back to original if unknown.
 */
export function translateWeatherCondition(
  condition: string,
  lang: Language
): string {
  if (!condition) return '';
  if (lang === 'en') return condition;

  const dict = weatherConditionTranslations[lang] || {};
  // Exact match
  if (dict[condition]) {
    return dict[condition];
  }

  // Case-insensitive match
  const matchKey = Object.keys(dict).find(
    (k) => k.toLowerCase() === condition.toLowerCase()
  );
  if (matchKey && dict[matchKey]) {
    return dict[matchKey];
  }

  // Partial substring matches
  const lower = condition.toLowerCase();
  if (lower.includes('thunder')) {
    return lang === 'hi' ? 'गरज के साथ बारिश' : 'ବିଜୁଳି ଘଡ଼ଘଡ଼ି ସହ ବର୍ଷା';
  }
  if (lower.includes('heavy rain')) {
    return lang === 'hi' ? 'भारी बारिश' : 'ପ୍ରବଳ ବର୍ଷା';
  }
  if (lower.includes('rain') || lower.includes('shower')) {
    return lang === 'hi' ? 'बारिश' : 'ବର୍ଷା';
  }
  if (lower.includes('cloud')) {
    return lang === 'hi' ? 'बादल' : 'ମେଘୁଆ';
  }
  if (lower.includes('clear') || lower.includes('sunny')) {
    return lang === 'hi' ? 'साफ मौसम' : 'ସ୍ୱଚ୍ଛ ପାଣିପାଗ';
  }
  if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) {
    return lang === 'hi' ? 'धुंध / कोहरा' : 'କୁହୁଡ଼ି';
  }

  return condition;
}

/**
 * Format a Date object into localized IST representation without breaking IST clock.
 */
export function formatLocalizedDate(date: Date, lang: Language): string {
  if (lang === 'hi') {
    return new Intl.DateTimeFormat('hi-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  if (lang === 'or') {
    // Odia localized date
    try {
      return new Intl.DateTimeFormat('or-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      // Fallback if browser locale lacks or-IN
      const days = ['ରବିବାର', 'ସୋମବାର', 'ମଙ୍ଗଳବାର', 'ବୁଧବାର', 'ଗୁରୁବାର', 'ଶୁକ୍ରବାର', 'ଶନିବାର'];
      const months = ['ଜାନୁଆରୀ', 'ଫେବୃଆରୀ', 'ମାର୍ଚ୍ଚ', 'ଏପ୍ରିଲ', 'ମେ', 'ଜୁନ୍', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡିସେମ୍ବର'];
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${dayName}, ${dayNum} ${monthName} ${year}`;
    }
  }

  // English default: Wed, 26 Aug, 2026
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
