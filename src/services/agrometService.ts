import { CropAdvisory, AgrometDistrictBulletin } from '../types';

export interface CropCategory {
  id: string;
  name: string;
  crops: string[];
}

export const CROP_CATEGORIES: CropCategory[] = [
  {
    id: 'all',
    name: 'All Crops',
    crops: [
      'Rice (Paddy)',
      'Wheat',
      'Cotton',
      'Sugarcane',
      'Maize (Corn)',
      'Soybean',
      'Mustard',
      'Groundnut',
      'Gram (Chickpea)',
      'Tomato & Vegetables',
      'Potato',
    ],
  },
  {
    id: 'cereals',
    name: 'Cereals',
    crops: ['Rice (Paddy)', 'Wheat', 'Maize (Corn)', 'Barley', 'Bajra (Pearl Millet)'],
  },
  {
    id: 'pulses',
    name: 'Pulses',
    crops: ['Gram (Chickpea)', 'Arhar (Pigeon Pea)', 'Moong (Green Gram)', 'Urad (Black Gram)', 'Lentil'],
  },
  {
    id: 'oilseeds',
    name: 'Oilseeds',
    crops: ['Mustard', 'Soybean', 'Groundnut', 'Sunflower', 'Sesame'],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    crops: ['Tomato & Vegetables', 'Potato', 'Onion', 'Chilli & Capsicum', 'Cauliflower & Cabbage'],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    crops: ['Mango', 'Banana', 'Citrus & Orange', 'Apple', 'Pomegranate', 'Guava'],
  },
  {
    id: 'cash_crops',
    name: 'Cash Crops',
    crops: ['Cotton', 'Sugarcane', 'Jute', 'Tobacco', 'Tea & Plantation'],
  },
];

export const INDIAN_STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Punjab': ['Ludhiana', 'Amritsar', 'Patiala', 'Jalandhar', 'Bathinda', 'Sangrur', 'Firozpur', 'Hoshiarpur', 'Gurdaspur'],
  'Maharashtra': ['Nashik', 'Pune', 'Nagpur', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Solapur', 'Kolhapur', 'Ahmednagar', 'Amravati', 'Jalgaon'],
  'Uttar Pradesh': ['Varanasi', 'Lucknow', 'Kanpur Nagar', 'Prayagraj', 'Meerut', 'Agra', 'Gorakhpur', 'Bareilly', 'Ayodhya', 'Jhansi'],
  'Tamil Nadu': ['Thanjavur', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Dindigul'],
  'West Bengal': ['Hooghly', 'Purba Bardhaman', 'Nadia', 'Murshidabad', 'North 24 Parganas', 'Bankura', 'Malda', 'Jalpaiguri'],
  'Odisha': ['Khordha (Bhubaneswar)', 'Cuttack', 'Sambalpur', 'Balasore', 'Ganjam', 'Puri', 'Bargarh', 'Mayurbhanj', 'Sundargarh'],
  'Karnataka': ['Mandya', 'Mysuru', 'Belagavi', 'Dharwad', 'Shivamogga', 'Tumakuru', 'Vijayapura', 'Ballari', 'Hassan'],
  'Gujarat': ['Anand', 'Rajkot', 'Surat', 'Mehsana', 'Junagadh', 'Vadodara', 'Ahmedabad', 'Banaskantha', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Sri Ganganagar', 'Bikaner', 'Alwar', 'Ajmer', 'Bharatpur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Jabalpur', 'Gwalior', 'Hoshangabad (Narmadapuram)', 'Sagar', 'Chhindwara'],
  'Bihar': ['Patna', 'Muzaffarpur', 'Gaya', 'Bhagalpur', 'Samastipur', 'Darbhanga', 'Nalanda', 'Purnia', 'Rohtas'],
  'Andhra Pradesh': ['Guntur', 'Krishna (Vijayawada)', 'East Godavari', 'West Godavari', 'Kurnool', 'Visakhapatnam', 'Chittoor', 'Anantapur'],
  'Telangana': ['Warangal', 'Karimnagar', 'Nalgonda', 'Khammam', 'Nizamabad', 'Rangareddy', 'Mahabubnagar', 'Medak'],
  'Haryana': ['Karnal', 'Hisar', 'Ambala', 'Sirsa', 'Kurukshetra', 'Rohtak', 'Sonipat', 'Fatehabad'],
  'Kerala': ['Palakkad', 'Wayanad', 'Thrissur', 'Kottayam', 'Alappuzha', 'Idukki', 'Kozhikode', 'Malappuram'],
  'Assam': ['Jorhat', 'Kamrup (Guwahati)', 'Sonitpur', 'Nagaon', 'Cachar', 'Dibrugarh', 'Barpeta'],
  'Himachal Pradesh': ['Shimla', 'Kangra (Dharamshala)', 'Kullu', 'Mandi', 'Solan', 'Una'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Udham Singh Nagar (Pantnagar)', 'Nainital', 'Almora'],
  'Jharkhand': ['Ranchi', 'Hazaribagh', 'Dhanbad', 'Palamu', 'East Singhbhum (Jamshedpur)', 'Dumka'],
  'Chhattisgarh': ['Raipur', 'Durg', 'Bilaspur', 'Rajnandgaon', 'Bastar (Jagdalpur)', 'Surguja'],
};

export interface RainfallDay {
  dayName: string;
  dateStr: string;
  amountMm: number;
  probPercent: number;
  condition: string;
  isWet: boolean;
}

export interface SoilMoistureData {
  topsoilPct: number; // 0-15 cm
  rootZonePct: number; // 15-45 cm
  subsoilPct: number; // 45-100 cm
  overallPct: number;
  status: 'Saturated' | 'Optimal' | 'Adequate' | 'Deficit / Dry';
  trend: 'increasing' | 'stable' | 'decreasing';
  fieldCapacityPct: number;
  wiltingPointPct: number;
  waterAvailableMm: number;
}

export interface FarmActionItem {
  id: string;
  category: 'irrigation' | 'nutrients' | 'pest' | 'operations' | 'harvest';
  title: string;
  action: string;
  reason: string;
  when: string;
  priority: 'High Priority' | 'Moderate' | 'Favorable' | 'Caution' | 'Actionable';
  icon: string;
  statusColor: 'amber' | 'emerald' | 'cyan' | 'rose' | 'indigo';
}

export interface ImpactTimelineStep {
  step: number;
  label: string;
  value: string;
  status: 'favorable' | 'caution' | 'action_needed';
  description: string;
  icon: string;
}

export interface HourlyOperationSlot {
  timeLabel: string;
  rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'AVOID';
  spraying: boolean;
  sowing: boolean;
  irrigation: boolean;
  harvesting: boolean;
  machinery: boolean;
  tempC: number;
  rhPct: number;
  windKmh: number;
  rainMm: number;
}

export interface FarmRiskAnalysis {
  overallScore: number; // 0 - 100
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' | 'Severe Risk';
  color: 'emerald' | 'amber' | 'orange' | 'rose';
  factors: {
    rainfallRisk: { score: number; label: string; explanation: string };
    thermalStress: { score: number; label: string; explanation: string };
    windGustRisk: { score: number; label: string; explanation: string };
    pestFungalRisk: { score: number; label: string; explanation: string };
    soilWaterlogging: { score: number; label: string; explanation: string };
  };
  whyExplanation: string[];
}

export interface ExtendedAgrometBulletin extends AgrometDistrictBulletin {
  rainfall5DaysList: RainfallDay[];
  cumulativeRainfallMm: number;
  soilMoisture: SoilMoistureData;
  actionPlan: FarmActionItem[];
  impactTimeline: ImpactTimelineStep[];
  operationsTimeline: HourlyOperationSlot[];
  riskAnalysis: FarmRiskAnalysis;
  pestDiseaseWatch: {
    overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    primaryConcern: string;
    scientificName?: string;
    etiology: string;
    symptoms: string;
    etlThreshold: string;
    immediateAction: string;
    organicRemedy: string;
    chemicalControl: string;
    riskDrivers: { name: string; value: string; impact: 'high' | 'medium' | 'low' }[];
  };
  sevenDayCalendar: {
    day: string;
    date: string;
    icon: string;
    condition: string;
    tempMax: number;
    tempMin: number;
    rainMm: number;
    rainProb: number;
    soilCondition: string;
    farmSuitability: 'EXCELLENT' | 'GOOD' | 'LIMITED' | 'RESTRICTED';
  }[];
}

export const AGROMET_BULLETINS: Record<string, AgrometDistrictBulletin> = {
  'Punjab-Ludhiana': {
    state: 'Punjab',
    district: 'Ludhiana',
    amfuUnit: 'AMFU Ludhiana • Punjab Agricultural University (PAU)',
    bulletinNo: 'PAU/AGMET/2026/68',
    issueDay: 'Tuesday',
    issueDate: 'August 24, 2026',
    validPeriod: '24 Aug - 28 Aug 2026',
    weatherSummary: 'Partly cloudy sky with light convective rainfall (10-25mm) expected in the next 48 hours. Max temp: 31-33°C, Min temp: 24-25°C. High morning RH (75-85%). Wind from South-East at 10-14 km/h.',
    rainfallForecast5Days: 'Day 1: 15mm | Day 2: 10mm | Day 3: Nil | Day 4: Nil | Day 5: 5mm',
    crops: [
      {
        cropName: 'Rice (Paddy)',
        stage: 'Tillering to Panicle Initiation',
        sowingAdvice: 'Direct Seeded Rice (DSR) should be monitored for weed emergence; maintain shallow moisture.',
        irrigationAdvice: 'Postpone irrigation for the next 2 days due to light showers. Maintain 2-3 cm standing water thereafter.',
        fertilizerAdvice: 'Apply second split of Urea @ 35 kg/acre only after rain subsides and foliage is dry.',
        pestDiseaseAdvice: 'High humidity is conducive for Bacterial Leaf Blight & Sheath Blight. Spray Streptocycline (30g) + Copper Oxychloride (500g) in 200L water if lesions appear.',
        harvestingAdvice: 'Early short-duration basmati crops should be inspected for lodging risk.',
        riskLevel: 'Moderate',
        riskAlert: 'Humidity spike increases fungal sheath rot vulnerability.',
      },
      {
        cropName: 'Cotton',
        stage: 'Square Formation to Flowering',
        sowingAdvice: 'Ensure field drainage channels are cleared to avoid water stagnation after anticipated showers.',
        irrigationAdvice: 'No irrigation needed until soil moisture drops below 50% field capacity.',
        fertilizerAdvice: 'Spray 2% Potassium Nitrate (13:0:45) at flowering stage during clear sunny hours.',
        pestDiseaseAdvice: 'Monitor for Whitefly (ETL: 6-8 adults/leaf) and Pink Bollworm. Install pheromone traps @ 5/acre.',
        harvestingAdvice: 'Not applicable for current crop stage.',
        riskLevel: 'High',
        riskAlert: 'Whitefly counts rising in border rows due to overcast weather.',
      },
      {
        cropName: 'Maize (Corn)',
        stage: 'Knee-high to Tasseling',
        sowingAdvice: 'Inter-cultivation recommended before rain to suppress broadleaf weeds.',
        irrigationAdvice: 'Avoid waterlogging; ensure prompt drainage in heavy clay soils.',
        fertilizerAdvice: 'Top dress Nitrogen @ 25 kg/ha along with Zinc Sulphate if deficient.',
        pestDiseaseAdvice: 'Scout for Fall Armyworm (FAW) egg masses in central whorls. Apply Emamectin Benzoate 5 SG @ 0.4 g/L if required.',
        harvestingAdvice: 'Green cob harvesting for local markets can proceed under dry intervals.',
        riskLevel: 'Low',
        riskAlert: 'Favorable crop conditions with adequate thermal units.',
      },
      {
        cropName: 'Sugarcane',
        stage: 'Grand Growth Stage',
        sowingAdvice: 'Earthing-up operation should be carried out to prevent crop lodging from gusty winds.',
        irrigationAdvice: 'Irrigate at 8-10 days interval if rainfall remains below 10mm.',
        fertilizerAdvice: 'Apply Urea @ 50 kg/ha with irrigation water.',
        pestDiseaseAdvice: 'Monitor for Top Borer and Pyrilla infestation. Spray Chlorpyrifos 20 EC @ 2ml/L if required.',
        harvestingAdvice: 'Ratoon management for succeeding harvest cycle.',
        riskLevel: 'Moderate',
        riskAlert: 'Wind gusts (20 km/h) require propping of tall canes.',
      },
    ],
  },
  'Odisha-Khordha (Bhubaneswar)': {
    state: 'Odisha',
    district: 'Khordha (Bhubaneswar)',
    amfuUnit: 'AMFU Bhubaneswar • Orissa University of Agriculture & Technology (OUAT)',
    bulletinNo: 'OUAT/AGMET/2026/71',
    issueDay: 'Tuesday',
    issueDate: 'August 24, 2026',
    validPeriod: '24 Aug - 28 Aug 2026',
    weatherSummary: 'Monsoon low pressure trough active over coastal Odisha. Moderate to heavy rainfall with thunderstorm spells. Max temp: 31°C, Min temp: 25°C, RH: 85-95%. Wind from South-West at 16-22 km/h.',
    rainfallForecast5Days: 'Day 1: 28mm | Day 2: 35mm | Day 3: 14mm | Day 4: 6mm | Day 5: 18mm',
    crops: [
      {
        cropName: 'Rice (Paddy)',
        stage: 'Active Tillering to Stem Elongation',
        sowingAdvice: 'Ensure drainage outlets on field bunds are free from silt and weed clogging.',
        irrigationAdvice: 'Suspend all irrigation pumps. Excess rainwater should be channelized into farm ponds (Jalkund).',
        fertilizerAdvice: 'Strictly avoid broadcasting Urea or DAP during rainy spells to prevent runoff losses.',
        pestDiseaseAdvice: 'High risk of Brown Spot, Bacterial Leaf Streak, and Caseworm. Drain stagnant water and apply Carbendazim + Mancozeb @ 2g/L after rain stops.',
        harvestingAdvice: 'Keep harvested seed bags on raised wooden platforms inside dry storage.',
        riskLevel: 'High',
        riskAlert: 'Water stagnation and leaf moisture duration exceed 12 hours.',
      },
      {
        cropName: 'Tomato & Vegetables',
        stage: 'Vegetative & Staking',
        sowingAdvice: 'Provide strong bamboo staking and earthing-up to prevent waterlogged root suffocation.',
        irrigationAdvice: 'Withhold irrigation completely; dig drainage furrows 20 cm deep between rows.',
        fertilizerAdvice: 'Spray micronutrient mixture (0.2%) once foliage dries.',
        pestDiseaseAdvice: 'Watch for Damping-off and Early Blight. Apply Copper Oxychloride 50 WP @ 2.5 g/L.',
        harvestingAdvice: 'Pick ready fruits immediately in clear morning slots to avoid fruit cracking.',
        riskLevel: 'High',
        riskAlert: 'Fungal damping-off threat in nursery seedbeds.',
      },
      {
        cropName: 'Groundnut',
        stage: 'Flowering & Pegging',
        sowingAdvice: 'Avoid soil compaction around the collar region.',
        irrigationAdvice: 'No supplemental watering needed; ensure excess surface water drains quickly.',
        fertilizerAdvice: 'Apply Gypsum @ 150 kg/acre after rainfall subsides.',
        pestDiseaseAdvice: 'Scout for Tikka leaf spot and Spodoptera larvae.',
        harvestingAdvice: 'Not applicable for current crop stage.',
        riskLevel: 'Moderate',
        riskAlert: 'Excessive soil wetness can impede peg penetration in heavy clay.',
      },
    ],
  },
  'Maharashtra-Nashik': {
    state: 'Maharashtra',
    district: 'Nashik',
    amfuUnit: 'AMFU Nashik • Mahatma Phule Krishi Vidyapeeth (MPKV)',
    bulletinNo: 'MPKV/AGMET/2026/82',
    issueDay: 'Friday',
    issueDate: 'August 22, 2026',
    validPeriod: '22 Aug - 26 Aug 2026',
    weatherSummary: 'Moderate to heavy overcast with intermittent drizzle. Wind speed 18-22 km/h from South-West. Average temp 26°C, RH 80-90%. Evapotranspiration: 3.8 mm/day.',
    rainfallForecast5Days: 'Day 1: 5mm | Day 2: 12mm | Day 3: 20mm | Day 4: 8mm | Day 5: Nil',
    crops: [
      {
        cropName: 'Tomato & Vegetables',
        stage: 'Fruiting and Harvesting',
        sowingAdvice: 'Raise nursery beds by 15cm to prevent damping-off in upcoming spell.',
        irrigationAdvice: 'Withhold drip irrigation for 3 days to prevent fruit cracking and root rot.',
        fertilizerAdvice: 'Foliar application of Calcium Nitrate (5g/L) + Boron (1g/L) to enhance fruit firmness.',
        pestDiseaseAdvice: 'High risk of Early Blight and Fruit Borer. Spray Mancozeb 75 WP @ 2.5g/L at clear weather breaks.',
        harvestingAdvice: 'Harvest mature fruits immediately before predicted heavy shower on Day 3.',
        riskLevel: 'High',
        riskAlert: 'Downy mildew and fruit rot alerts active across Niphad & Dindori blocks.',
      },
      {
        cropName: 'Soybean',
        stage: 'Pod Formation',
        sowingAdvice: 'Keep ridges and furrows open to channel excess runoff away from roots.',
        irrigationAdvice: 'Rainfall will meet crop water requirements; avoid supplemental pumping.',
        fertilizerAdvice: 'Foliar spray of 0:52:34 @ 10g/L during pod filling stage.',
        pestDiseaseAdvice: 'Check for Girdle Beetle and Semilooper. Spray Chlorantraniliprole 18.5 SC @ 3ml/10L water.',
        harvestingAdvice: 'Prepare drying yards and threshing mats for early maturing varieties.',
        riskLevel: 'Moderate',
        riskAlert: 'Excess soil saturation can induce root rot in low-lying fields.',
      },
      {
        cropName: 'Sugarcane',
        stage: 'Grand Growth Stage',
        sowingAdvice: 'Remove lower dried leaves (trash mulching) to improve aeration in dense canopy.',
        irrigationAdvice: 'Postpone drip cycle; resume only after topsoil dries.',
        fertilizerAdvice: 'Fertigation can be suspended until soil moisture stabilizes.',
        pestDiseaseAdvice: 'Inspect for White Grub in root zone; drench with Chlorpyrifos if required.',
        harvestingAdvice: 'Maintain farm drains.',
        riskLevel: 'Low',
        riskAlert: 'Optimal thermal accumulation for vegetative biomass.',
      },
    ],
  },
  'Maharashtra-Pune': {
    state: 'Maharashtra',
    district: 'Pune',
    amfuUnit: 'AMFU Pune • College of Agriculture Pune & IMD Agromet Central',
    bulletinNo: 'IMD/COA/PUN/2026/85',
    issueDay: 'Tuesday',
    issueDate: 'August 24, 2026',
    validPeriod: '24 Aug - 28 Aug 2026',
    weatherSummary: 'Generally cloudy sky with light showers in western ghat catchments. Max temp: 28°C, Min temp: 22°C. RH: 75-88%. Gusty winds up to 24 km/h.',
    rainfallForecast5Days: 'Day 1: 8mm | Day 2: 12mm | Day 3: 5mm | Day 4: 2mm | Day 5: 4mm',
    crops: [
      {
        cropName: 'Sugarcane',
        stage: 'Tillering to Grand Growth',
        sowingAdvice: 'Propping and tying of canes to prevent lodging under gusty monsoon wind.',
        irrigationAdvice: 'Rainfall is adequate; ensure water is not allowed to stagnate.',
        fertilizerAdvice: 'Apply 3rd split of nitrogen alongside micronutrient spray.',
        pestDiseaseAdvice: 'Scout for Woolly Aphid and Pyrilla. Release bio-agents like Chrysoperla.',
        harvestingAdvice: 'Not applicable.',
        riskLevel: 'Low',
        riskAlert: 'Good vegetative vigor with balanced soil moisture.',
      },
      {
        cropName: 'Soybean',
        stage: 'Flowering to Pod Initiation',
        sowingAdvice: 'Weeding and hoeing in dry spells to break soil crust.',
        irrigationAdvice: 'Natural precipitation is sufficient for next 5 days.',
        fertilizerAdvice: 'Foliar spray of Potassium Nitrate @ 10g/L during clear morning.',
        pestDiseaseAdvice: 'Monitor for Spodoptera and Leaf Miner. Install yellow sticky traps.',
        harvestingAdvice: 'Keep equipment serviced.',
        riskLevel: 'Moderate',
        riskAlert: 'High humidity favors foliar anthracnose lesions.',
      },
    ],
  },
  'Uttar Pradesh-Varanasi': {
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    amfuUnit: 'AMFU Varanasi • Banaras Hindu University (BHU)',
    bulletinNo: 'BHU/AGMET/2026/51',
    issueDay: 'Tuesday',
    issueDate: 'August 24, 2026',
    validPeriod: '24 Aug - 28 Aug 2026',
    weatherSummary: 'Warm and humid condition with isolated thundershowers. Max temp: 34°C, Min temp: 26°C. High solar radiation indices (UV 8.5). RH 65-80%.',
    rainfallForecast5Days: 'Day 1: 8mm | Day 2: 2mm | Day 3: 15mm | Day 4: Nil | Day 5: Nil',
    crops: [
      {
        cropName: 'Rice (Paddy)',
        stage: 'Active Vegetative & Tillering',
        sowingAdvice: 'Remove rogue plants and maintain pure stand density.',
        irrigationAdvice: 'Provide light irrigation on Day 2 and Day 4; maintain thin layer of water (3-5 cm).',
        fertilizerAdvice: 'Apply remaining 1/3 dose of Nitrogen with 20% Zinc coating for higher assimilation.',
        pestDiseaseAdvice: 'Watch for Yellow Stem Borer dead hearts. Install Trichogramma cards @ 20,000 parasitoids/acre.',
        harvestingAdvice: 'Store harvested straw safely from rain.',
        riskLevel: 'Low',
        riskAlert: 'Good vegetative vigor with optimum solar exposure.',
      },
      {
        cropName: 'Sugarcane',
        stage: 'Grand Growth Stage',
        sowingAdvice: 'Earthing-up operation should be carried out to prevent crop lodging from gusty winds.',
        irrigationAdvice: 'Irrigate at 8-10 days interval if rainfall remains below 10mm.',
        fertilizerAdvice: 'Apply Urea @ 50 kg/ha with irrigation water.',
        pestDiseaseAdvice: 'Monitor for Top Borer and Pyrilla infestation. Spray Chlorpyrifos 20 EC @ 2ml/L if required.',
        harvestingAdvice: 'Ratoon management for succeeding harvest cycle.',
        riskLevel: 'Moderate',
        riskAlert: 'Wind gusts (25 km/h) require propping of tall canes.',
      },
    ],
  },
  'Tamil Nadu-Thanjavur': {
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    amfuUnit: 'AMFU Thanjavur • Tamil Nadu Rice Research Institute (TRRI)',
    bulletinNo: 'TRRI/AGMET/2026/74',
    issueDay: 'Friday',
    issueDate: 'August 22, 2026',
    validPeriod: '22 Aug - 26 Aug 2026',
    weatherSummary: 'Dry and bright weather with moderate coastal winds. Max temp: 36°C, Min temp: 27°C. Evapotranspiration rate: 6.2 mm/day. Low precipitation risk.',
    rainfallForecast5Days: 'Day 1: Nil | Day 2: Nil | Day 3: 2mm | Day 4: Nil | Day 5: Nil',
    crops: [
      {
        cropName: 'Rice (Paddy)',
        stage: 'Kuruvai Heading & Grain Filling',
        sowingAdvice: 'Nursery preparation for upcoming Thaladi crop can be initiated.',
        irrigationAdvice: 'Critical irrigation needed during grain hardening. Maintain 5cm water depth.',
        fertilizerAdvice: 'Spray 1% DAP + 1% Potassium Chloride to accelerate uniform grain filling.',
        pestDiseaseAdvice: 'Monitor for Brown Plant Hopper (BPH) at base of tillers. Keep field bunds free of weeds.',
        harvestingAdvice: 'Plan harvest of early Kuruvai plots when 80% grains turn golden yellow.',
        riskLevel: 'Moderate',
        riskAlert: 'High heat index requires vigilant water level regulation to prevent grain chaffiness.',
      },
      {
        cropName: 'Groundnut',
        stage: 'Pegging to Pod Development',
        sowingAdvice: 'Soil loosening around root zone to facilitate smooth peg penetration.',
        irrigationAdvice: 'Ensure adequate moisture during pegging stage; apply light sprinkler irrigation.',
        fertilizerAdvice: 'Apply Gypsum @ 200 kg/acre followed by light hoeing.',
        pestDiseaseAdvice: 'Scout for Tikka leaf spot and Spodoptera. Spray Carbendazim (1g/L) if spots appear on lower leaves.',
        harvestingAdvice: 'Not ready for harvest.',
        riskLevel: 'Low',
        riskAlert: 'Healthy pod initiation with optimal soil aeration.',
      },
    ],
  },
};

/**
 * Generate a high-fidelity synthetic/deterministic bulletin for any state and district
 */
export function getAgrometBulletin(state: string, district: string): ExtendedAgrometBulletin {
  const key = `${state}-${district}`;
  const baseBulletin: AgrometDistrictBulletin = AGROMET_BULLETINS[key] || {
    state,
    district,
    amfuUnit: `AMFU ${district} • State Agricultural University & IMD Agromet Node`,
    bulletinNo: `IMD/AMFU/${district.toUpperCase().slice(0, 4)}/2026/104`,
    issueDay: 'Tuesday',
    issueDate: 'August 24, 2026',
    validPeriod: '24 Aug - 28 Aug 2026',
    weatherSummary: `Partly cloudy sky with light convective rainfall spells over ${district}. Relative humidity ranging between 65-82%. Wind velocity 12-18 km/h from South-West. Max temp: 32°C, Min temp: 24°C.`,
    rainfallForecast5Days: 'Day 1: 14mm | Day 2: 8mm | Day 3: Nil | Day 4: 2mm | Day 5: 6mm',
    crops: [
      {
        cropName: 'Rice (Paddy)',
        stage: 'Vegetative to Tillering',
        sowingAdvice: 'Maintain optimal plant density and clear weed seedlings from border bunds.',
        irrigationAdvice: 'Manage irrigation according to localized rain showers; avoid deep inundation.',
        fertilizerAdvice: 'Top dress balanced NPK with split nitrogen during clear weather intervals.',
        pestDiseaseAdvice: 'Inspect field weekly for leaf folders and blast lesions; practice IPM.',
        harvestingAdvice: 'Keep storage structures clean and fumigated.',
        riskLevel: 'Moderate',
        riskAlert: 'Monitor local cloudburst or localized water stagnation in low areas.',
      },
      {
        cropName: 'Cotton',
        stage: 'Squaring & Boll Formation',
        sowingAdvice: 'Clean drainage channels to prevent waterlogging around root zone.',
        irrigationAdvice: 'Avoid flooding; maintain moderate root zone moisture.',
        fertilizerAdvice: 'Apply potassium nitrate (13:0:45) @ 1.5% during boll initiation.',
        pestDiseaseAdvice: 'Install sticky traps for whitefly and jassids monitoring.',
        harvestingAdvice: 'Prepare for early picking in mature bolls.',
        riskLevel: 'Moderate',
        riskAlert: 'Moderate pest pressure due to humid afternoon spells.',
      },
      {
        cropName: 'Tomato & Vegetables',
        stage: 'Flowering & Fruiting',
        sowingAdvice: 'Provide staking for creeper vegetables and maintain clean furrows.',
        irrigationAdvice: 'Irrigate only when top 2 inches of soil feel dry to touch.',
        fertilizerAdvice: 'Apply micronutrient foliar spray (Zinc, Boron, Iron) for improved fruit set.',
        pestDiseaseAdvice: 'Spray bio-pesticides like Neem Oil 1500 ppm @ 3ml/L against sucking pests.',
        harvestingAdvice: 'Harvest early in the morning to preserve fresh market crispness.',
        riskLevel: 'Low',
        riskAlert: 'Favorable vegetative and reproductive weather conditions.',
      },
      {
        cropName: 'Maize (Corn)',
        stage: 'Knee-High to Silking',
        sowingAdvice: 'Ensure adequate plant population with timely hoeing.',
        irrigationAdvice: 'Critical moisture needed at silking and grain filling stage.',
        fertilizerAdvice: 'Apply second dose of nitrogen alongside zinc sulphate.',
        pestDiseaseAdvice: 'Scout for Fall Armyworm whorl damage; apply neem-based biopesticide.',
        harvestingAdvice: 'Plan storage with moisture below 12%.',
        riskLevel: 'Low',
        riskAlert: 'Good vegetative growth with adequate sunshine hours.',
      },
    ],
  };

  // Derive 5-day quantitative rainfall list
  const rainfall5DaysList = parse5DayRainfall(baseBulletin.rainfallForecast5Days);
  const cumulativeRainfallMm = rainfall5DaysList.reduce((acc, curr) => acc + curr.amountMm, 0);

  // Derive Soil Moisture Model
  const soilMoisture = deriveSoilMoisture(cumulativeRainfallMm, rainfall5DaysList[0]?.amountMm || 0);

  // Derive Action Plan
  const actionPlan = deriveActionPlan(baseBulletin, rainfall5DaysList, soilMoisture);

  // Derive Causal Impact Timeline
  const impactTimeline = deriveImpactTimeline(rainfall5DaysList[0]?.amountMm || 0, soilMoisture);

  // Derive Operations Timeline
  const operationsTimeline = deriveOperationsTimeline(rainfall5DaysList[0]?.amountMm || 0);

  // Derive Farm Risk Analysis
  const riskAnalysis = deriveRiskAnalysis(baseBulletin, cumulativeRainfallMm, soilMoisture);

  // Derive Pest & Disease Watch
  const pestDiseaseWatch = derivePestDiseaseWatch(baseBulletin.crops[0], baseBulletin);

  // Derive 7-Day Farm Calendar
  const sevenDayCalendar = deriveSevenDayCalendar(rainfall5DaysList, baseBulletin);

  return {
    ...baseBulletin,
    rainfall5DaysList,
    cumulativeRainfallMm,
    soilMoisture,
    actionPlan,
    impactTimeline,
    operationsTimeline,
    riskAnalysis,
    pestDiseaseWatch,
    sevenDayCalendar,
  };
}

function parse5DayRainfall(rawString: string): RainfallDay[] {
  // e.g. "Day 1: 15mm | Day 2: 10mm | Day 3: Nil | Day 4: Nil | Day 5: 5mm"
  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  const dates = ['30 Aug', '31 Aug', '01 Sep', '02 Sep', '03 Sep'];

  const parts = rawString.split('|').map((s) => s.trim());
  return dayNames.map((dName, idx) => {
    const rawPart = parts[idx] || '';
    let amount = 0;
    const match = rawPart.match(/(\d+)\s*mm/i);
    if (match) {
      amount = parseInt(match[1], 10);
    } else if (rawPart.toLowerCase().includes('nil')) {
      amount = 0;
    } else {
      amount = idx === 0 ? 12 : idx === 1 ? 8 : 0;
    }

    const probPercent = amount >= 20 ? 88 : amount >= 10 ? 72 : amount > 0 ? 45 : 15;
    const condition = amount >= 25 ? 'Heavy Showers' : amount >= 10 ? 'Moderate Rain' : amount > 0 ? 'Light Drizzle' : 'Partly Cloudy';
    const isWet = amount > 2;

    return {
      dayName: dName,
      dateStr: dates[idx] || `Day ${idx + 1}`,
      amountMm: amount,
      probPercent,
      condition,
      isWet,
    };
  });
}

function deriveSoilMoisture(cumulativeRain: number, todayRain: number): SoilMoistureData {
  let overall = 62;
  if (cumulativeRain > 50) overall = 85;
  else if (cumulativeRain > 25) overall = 74;
  else if (cumulativeRain > 10) overall = 66;
  else if (cumulativeRain > 0) overall = 58;
  else overall = 48;

  const topsoilPct = Math.min(95, Math.round(overall * (todayRain > 5 ? 1.15 : 0.95)));
  const rootZonePct = Math.round(overall);
  const subsoilPct = Math.max(40, Math.round(overall * 0.92));

  let status: SoilMoistureData['status'] = 'Optimal';
  if (overall > 82) status = 'Saturated';
  else if (overall >= 60) status = 'Optimal';
  else if (overall >= 45) status = 'Adequate';
  else status = 'Deficit / Dry';

  const trend: SoilMoistureData['trend'] = todayRain > 5 ? 'increasing' : todayRain > 0 ? 'stable' : 'decreasing';

  return {
    topsoilPct,
    rootZonePct,
    subsoilPct,
    overallPct: overall,
    status,
    trend,
    fieldCapacityPct: 82,
    wiltingPointPct: 28,
    waterAvailableMm: Math.round(overall * 0.65),
  };
}

function deriveActionPlan(
  bulletin: AgrometDistrictBulletin,
  rainfallList: RainfallDay[],
  soil: SoilMoistureData
): FarmActionItem[] {
  const rainToday = rainfallList[0]?.amountMm || 0;
  const rainTomorrow = rainfallList[1]?.amountMm || 0;
  const willRainSoon = rainToday + rainTomorrow >= 8;

  const actions: FarmActionItem[] = [];

  // 1. Irrigation
  if (willRainSoon || soil.overallPct > 70) {
    actions.push({
      id: 'act-irrigation',
      category: 'irrigation',
      title: 'IRRIGATION MANAGEMENT',
      action: 'POSTPONE / WAIT',
      reason: `Anticipated rainfall (${rainToday + rainTomorrow} mm in 48h) and current soil moisture (${soil.overallPct}%) fulfill crop water requirements. Avoid electrical pumping.`,
      when: 'Next 24–48 Hours',
      priority: 'High Priority',
      icon: 'water_drop',
      statusColor: 'cyan',
    });
  } else {
    actions.push({
      id: 'act-irrigation',
      category: 'irrigation',
      title: 'IRRIGATION MANAGEMENT',
      action: 'LIGHT IRRIGATION RECOMMENDED',
      reason: `Soil moisture at ${soil.overallPct}%. Provide shallow watering in morning hours to prevent moisture stress.`,
      when: 'Morning 06:30 – 09:30 AM',
      priority: 'Actionable',
      icon: 'water_drop',
      statusColor: 'emerald',
    });
  }

  // 2. Nutrients
  if (willRainSoon) {
    actions.push({
      id: 'act-nutrients',
      category: 'nutrients',
      title: 'NUTRIENT & FERTILIZER',
      action: 'HOLD BROADCAST APPLICATION',
      reason: 'Foliar washing and nitrogen leaching likely under wet canopy. Apply next split after rain spell ceases and surface dries.',
      when: 'After rain spell (Day 3)',
      priority: 'Moderate',
      icon: 'eco',
      statusColor: 'amber',
    });
  } else {
    actions.push({
      id: 'act-nutrients',
      category: 'nutrients',
      title: 'NUTRIENT & FERTILIZER',
      action: 'SUITABLE FOR FOLIAR SPRAY',
      reason: 'Optimal canopy absorption with moderate temperature and calm morning breeze. Apply micronutrient/potash spray.',
      when: '08:00 AM – 11:00 AM',
      priority: 'Favorable',
      icon: 'eco',
      statusColor: 'emerald',
    });
  }

  // 3. Pest Monitoring
  actions.push({
    id: 'act-pest',
    category: 'pest',
    title: 'PEST & DISEASE SURVEILLANCE',
    action: 'INSPECT LOWER CANOPY',
    reason: 'Elevated morning relative humidity (75–90%) creates favorable microclimate for sheath blight, blast, and sucking pests.',
    when: 'Morning Scout (07:30 – 10:00 AM)',
    priority: 'High Priority',
    icon: 'pest_control',
    statusColor: 'rose',
  });

  // 4. Field Operations
  if (rainToday > 15) {
    actions.push({
      id: 'act-ops',
      category: 'operations',
      title: 'FIELD OPERATIONS & SPRAYING',
      action: 'SUSPEND TRACTOR & SPRAYING',
      reason: 'Heavy rain creates muddy topsoil prone to compaction and chemical dilution. Ensure field drainage bunds are unclogged.',
      when: 'Restricted today',
      priority: 'Caution',
      icon: 'precision_manufacturing',
      statusColor: 'rose',
    });
  } else {
    actions.push({
      id: 'act-ops',
      category: 'operations',
      title: 'FIELD OPERATIONS & SPRAYING',
      action: 'FAVORABLE MORNING WINDOW',
      reason: 'Low surface wind (<12 km/h) before noon provides safe drift conditions for manual weeding and preventive bio-spraying.',
      when: '08:00 AM – 11:30 AM',
      priority: 'Actionable',
      icon: 'precision_manufacturing',
      statusColor: 'indigo',
    });
  }

  return actions;
}

function deriveImpactTimeline(todayRain: number, soil: SoilMoistureData): ImpactTimelineStep[] {
  return [
    {
      step: 1,
      label: 'RAINFALL OUTLOOK',
      value: todayRain > 0 ? `${todayRain} mm Expected` : 'Dry / Sunny',
      status: todayRain > 15 ? 'caution' : 'favorable',
      description: todayRain > 0 ? 'Convective showers replenishing soil profile' : 'Adequate solar insolation for photosynthesis',
      icon: 'cloud',
    },
    {
      step: 2,
      label: 'SOIL MOISTURE',
      value: `${soil.overallPct}% (${soil.status})`,
      status: soil.overallPct > 80 ? 'caution' : 'favorable',
      description: 'Root zone moisture buffer adequate for crop transpiration',
      icon: 'grass',
    },
    {
      step: 3,
      label: 'DISEASE RISK',
      value: soil.overallPct > 70 ? 'Elevated Fungal Risk' : 'Low Pathogen Threat',
      status: soil.overallPct > 70 ? 'caution' : 'favorable',
      description: 'High relative humidity encourages spore germination',
      icon: 'bug_report',
    },
    {
      step: 4,
      label: 'IRRIGATION NEED',
      value: todayRain > 5 || soil.overallPct > 65 ? 'POSTPONE 24-48H' : 'NORMAL SCHEDULE',
      status: 'favorable',
      description: 'Conserve farm power & groundwater reserves',
      icon: 'water_drop',
    },
    {
      step: 5,
      label: 'FIELD MACHINERY',
      value: todayRain > 10 ? 'WAIT 12-24 HOURS' : 'ACCESSIBLE NOW',
      status: todayRain > 10 ? 'caution' : 'favorable',
      description: 'Prevent tyre rutting & soil compaction in wet tracts',
      icon: 'agriculture',
    },
  ];
}

function deriveOperationsTimeline(todayRain: number): HourlyOperationSlot[] {
  const slots: HourlyOperationSlot[] = [
    {
      timeLabel: '06:00 AM',
      rating: 'GOOD',
      spraying: true,
      sowing: true,
      irrigation: false,
      harvesting: true,
      machinery: true,
      tempC: 24,
      rhPct: 88,
      windKmh: 6,
      rainMm: 0,
    },
    {
      timeLabel: '09:00 AM',
      rating: 'EXCELLENT',
      spraying: true,
      sowing: true,
      irrigation: false,
      harvesting: true,
      machinery: true,
      tempC: 27,
      rhPct: 78,
      windKmh: 9,
      rainMm: 0,
    },
    {
      timeLabel: '12:00 PM',
      rating: todayRain > 10 ? 'MODERATE' : 'GOOD',
      spraying: todayRain <= 10,
      sowing: true,
      irrigation: false,
      harvesting: true,
      machinery: true,
      tempC: 31,
      rhPct: 68,
      windKmh: 14,
      rainMm: 1,
    },
    {
      timeLabel: '03:00 PM',
      rating: todayRain > 5 ? 'POOR' : 'MODERATE',
      spraying: false,
      sowing: false,
      irrigation: false,
      harvesting: false,
      machinery: false,
      tempC: 32,
      rhPct: 74,
      windKmh: 18,
      rainMm: todayRain > 0 ? 8 : 0,
    },
    {
      timeLabel: '06:00 PM',
      rating: 'GOOD',
      spraying: true,
      sowing: true,
      irrigation: false,
      harvesting: true,
      machinery: true,
      tempC: 28,
      rhPct: 82,
      windKmh: 10,
      rainMm: 2,
    },
    {
      timeLabel: '09:00 PM',
      rating: 'MODERATE',
      spraying: false,
      sowing: false,
      irrigation: false,
      harvesting: false,
      machinery: false,
      tempC: 26,
      rhPct: 86,
      windKmh: 8,
      rainMm: 0,
    },
  ];
  return slots;
}

function deriveRiskAnalysis(
  bulletin: AgrometDistrictBulletin,
  cumulativeRain: number,
  soil: SoilMoistureData
): FarmRiskAnalysis {
  const rainScore = Math.min(100, Math.round(cumulativeRain * 1.8 + 15));
  const thermalScore = 28; // mild monsoon temps
  const windScore = 32;
  const pestScore = soil.overallPct > 70 ? 72 : 45;
  const waterloggingScore = soil.overallPct > 80 ? 68 : 34;

  const overallScore = Math.round(
    rainScore * 0.25 +
    thermalScore * 0.15 +
    windScore * 0.15 +
    pestScore * 0.25 +
    waterloggingScore * 0.2
  );

  let riskLevel: FarmRiskAnalysis['riskLevel'] = 'Moderate Risk';
  let color: FarmRiskAnalysis['color'] = 'amber';

  if (overallScore >= 75) {
    riskLevel = 'Severe Risk';
    color = 'rose';
  } else if (overallScore >= 55) {
    riskLevel = 'Elevated Risk';
    color = 'orange';
  } else if (overallScore >= 35) {
    riskLevel = 'Moderate Risk';
    color = 'amber';
  } else {
    riskLevel = 'Low Risk';
    color = 'emerald';
  }

  const whyExplanation = [
    `Convective rainfall projection contributes ${rainScore}/100 to precipitation stress.`,
    `Persistent ambient humidity above 75% raises fungal pathogen conduciveness to ${pestScore}/100.`,
    `Root-zone soil saturation index stands at ${soil.overallPct}%, posing moderate waterlogging risk (${waterloggingScore}/100).`,
    `Thermal parameters (Max 31°C / Min 24°C) remain well within physiological thresholds.`,
  ];

  return {
    overallScore,
    riskLevel,
    color,
    factors: {
      rainfallRisk: {
        score: rainScore,
        label: rainScore > 50 ? 'Moderate Rain Influx' : 'Normal Precipitation',
        explanation: `${cumulativeRain} mm expected over 5 days.`,
      },
      thermalStress: {
        score: thermalScore,
        label: 'Optimal Growing Degree',
        explanation: 'Temperatures between 24°C and 32°C favorable for vegetative growth.',
      },
      windGustRisk: {
        score: windScore,
        label: 'Gentle to Moderate Breeze',
        explanation: 'Wind speeds 12-18 km/h safe for propped tall stands.',
      },
      pestFungalRisk: {
        score: pestScore,
        label: pestScore > 60 ? 'Elevated Spore Microclimate' : 'Manageable Pest Pressure',
        explanation: 'Foliar wetness & warm air favor sheath blight and foliar pathogens.',
      },
      soilWaterlogging: {
        score: waterloggingScore,
        label: waterloggingScore > 50 ? 'Surface Drainage Caution' : 'Good Aeration',
        explanation: 'Monitor low-lying furrows after heavy afternoon showers.',
      },
    },
    whyExplanation,
  };
}

function derivePestDiseaseWatch(crop: CropAdvisory | undefined, bulletin: AgrometDistrictBulletin) {
  const cropName = crop?.cropName || 'Rice (Paddy)';
  
  if (cropName.includes('Rice')) {
    return {
      overallRisk: 'Moderate' as const,
      primaryConcern: 'Bacterial Leaf Blight & Sheath Blight',
      scientificName: 'Xanthomonas oryzae / Rhizoctonia solani',
      etiology: 'Persistent morning humidity >80% with intermittent showers accelerates bacterial exudate spread.',
      symptoms: 'Water-soaked lesions turning straw-colored on leaf margins; snake-skin lesions on sheath near waterline.',
      etlThreshold: '1-2 lesions per hill on 5% sampled hills across diagonal transect.',
      immediateAction: 'Drain standing water for 48 hours to aerate crop base; avoid nitrogen top-dressing.',
      organicRemedy: 'Spray Pseudomonas fluorescens @ 10g/L or Cow-dung slurry supernatant (20%) at 10-day intervals.',
      chemicalControl: 'Streptocycline (30g) + Copper Oxychloride (500g) in 200L water per acre under calm skies.',
      riskDrivers: [
        { name: 'Morning Relative Humidity', value: '84%', impact: 'high' as const },
        { name: 'Canopy Leaf Wetness', value: '7.5 hours/day', impact: 'high' as const },
        { name: 'Mean Temperature', value: '28.4°C', impact: 'medium' as const },
        { name: 'Wind Velocity', value: '14 km/h', impact: 'low' as const },
      ],
    };
  }

  if (cropName.includes('Cotton')) {
    return {
      overallRisk: 'High' as const,
      primaryConcern: 'Whitefly & Pink Bollworm Infestation',
      scientificName: 'Bemisia tabaci / Pectinophora gossypiella',
      etiology: 'Intermittent sunny breaks during cloudy spells trigger rapid whitefly nymph multiplication on leaf undersides.',
      symptoms: 'Yellowing and upward curling of leaves, sooty mold on honey-dew secretions, rosette flowers.',
      etlThreshold: 'Whitefly: 6-8 adults per leaf; Pink Bollworm: 1 larva per 20 green bolls.',
      immediateAction: 'Install yellow sticky traps @ 10/acre and pheromone traps @ 5/acre for nocturnal mass trapping.',
      organicRemedy: 'Neem seed kernel extract (NSKE 5%) or Neem oil 1500 ppm @ 3-5 ml/L.',
      chemicalControl: 'Diafenthiuron 50 WP @ 1.2 g/L or Pyriproxyfen 10 EC @ 2 ml/L on border rows.',
      riskDrivers: [
        { name: 'Cloud Cover Overcast', value: '65%', impact: 'high' as const },
        { name: 'Thermal Units', value: 'Favorable (31°C)', impact: 'high' as const },
        { name: 'Spray Drift Window', value: '08:00 - 11:30 AM', impact: 'medium' as const },
      ],
    };
  }

  return {
    overallRisk: 'Moderate' as const,
    primaryConcern: 'Foliar Early Blight & Sucking Pests',
    scientificName: 'Alternaria solani / Sucking Aphids',
    etiology: 'Conducive temperature-humidity profile encourages spore germination in dense lower canopies.',
    symptoms: 'Concentric ring target-spots on older leaves and curling of fresh shoots.',
    etlThreshold: '10% foliar coverage on lower branches.',
    immediateAction: 'Remove and burn infected lower leaves; improve air circulation between rows.',
    organicRemedy: 'Bio-fungicide Trichoderma harzianum @ 5g/L + Panchagavya 3% foliar spray.',
    chemicalControl: 'Mancozeb 75 WP @ 2.5 g/L or Azoxystrobin 23 SC @ 1 ml/L during clear morning hours.',
    riskDrivers: [
      { name: 'Relative Humidity', value: '78%', impact: 'high' as const },
      { name: 'Soil Surface Wetness', value: 'Moderate', impact: 'medium' as const },
      { name: 'Air Temperature', value: '29°C', impact: 'medium' as const },
    ],
  };
}

function deriveSevenDayCalendar(rainfallList: RainfallDay[], bulletin: AgrometDistrictBulletin) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = ['30 Aug', '31 Aug', '01 Sep', '02 Sep', '03 Sep', '04 Sep', '05 Sep'];
  
  return dates.map((dateStr, idx) => {
    const rain = rainfallList[idx]?.amountMm ?? (idx === 5 ? 0 : idx === 6 ? 4 : 2);
    const rainProb = rain > 15 ? 85 : rain > 5 ? 65 : rain > 0 ? 35 : 10;
    const isHeavyRain = rain > 15;
    const isModerateRain = rain > 4;

    const condition = isHeavyRain ? 'Heavy Showers' : isModerateRain ? 'Scattered Rain' : rain > 0 ? 'Light Drizzle' : 'Partly Sunny';
    const icon = isHeavyRain ? 'rain_heavy' : isModerateRain ? 'rain' : rain > 0 ? 'cloudy' : 'sunny';

    const tempMax = 31 + (idx % 2 === 0 ? 1 : -1);
    const tempMin = 24 + (idx % 3 === 0 ? 1 : 0);

    let soilCondition = 'Optimal Moisture';
    let farmSuitability: 'EXCELLENT' | 'GOOD' | 'LIMITED' | 'RESTRICTED' = 'GOOD';

    if (rain > 15) {
      soilCondition = 'Saturated / Wet';
      farmSuitability = 'RESTRICTED';
    } else if (rain > 5) {
      soilCondition = 'Adequate Moisture';
      farmSuitability = 'LIMITED';
    } else if (rain === 0 && idx > 2) {
      soilCondition = 'Drying Topsoil';
      farmSuitability = 'EXCELLENT';
    }

    return {
      day: days[idx] || 'Day',
      date: dateStr,
      icon,
      condition,
      tempMax,
      tempMin,
      rainMm: rain,
      rainProb,
      soilCondition,
      farmSuitability,
    };
  });
}
