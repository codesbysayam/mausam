import { WeatherDataBundle } from './weatherService';
import { CurrentWeather, DailyForecastItem, HourlyForecastItem, LocationRecord } from '../types';

export type CropType =
  | 'Rice (Paddy)'
  | 'Wheat'
  | 'Maize'
  | 'Cotton'
  | 'Sugarcane'
  | 'Pulses'
  | 'Vegetables'
  | 'Horticulture';

export type PhenologicalStage =
  | 'Sowing'
  | 'Germination'
  | 'Vegetative'
  | 'Tillering'
  | 'Flowering'
  | 'Grain formation'
  | 'Maturity'
  | 'Harvest';

export const ALL_CROPS: CropType[] = [
  'Rice (Paddy)',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Pulses',
  'Vegetables',
  'Horticulture',
];

export const CROP_STAGES: PhenologicalStage[] = [
  'Sowing',
  'Germination',
  'Vegetative',
  'Tillering',
  'Flowering',
  'Grain formation',
  'Maturity',
  'Harvest',
];

export interface CropPhenologyProfile {
  crop: CropType;
  stage: PhenologicalStage;
  weatherSensitivity: 'HIGH' | 'MODERATE' | 'LOW';
  waterRequirement: 'CRITICAL' | 'MODERATE' | 'LOW';
  diseaseEnvironment: 'ELEVATED' | 'FAVORABLE' | 'LOW';
  optimumTempRange: [number, number]; // [min, max]
  maxWindToleranceKmh: number;
  criticalETdemandMm: number;
  priorities: string[];
  pestDiseaseWatch: {
    targetOrganism: string;
    favorableConditions: string;
    etlThreshold: string;
    ipmBioControl: string;
    chemicalIntervention: string;
  };
}

export function getCropPhenologyProfile(
  crop: CropType,
  stage: PhenologicalStage,
  weather?: WeatherDataBundle
): CropPhenologyProfile {
  const currentTemp = weather?.current?.temp ?? 30;
  const currentRH = weather?.current?.humidity ?? 75;
  const rain24h = weather?.current?.precipitation ?? 10;
  const isHighRH = currentRH > 75;
  const isWet = rain24h > 15;

  const baseProfiles: Record<CropType, Record<PhenologicalStage, Omit<CropPhenologyProfile, 'crop' | 'stage'>>> = {
    'Rice (Paddy)': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [25, 33],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.5,
        priorities: [
          'Treat seeds with Trichoderma viride @ 4g/kg seed or Carbendazim @ 2g/kg before soaking.',
          'Prepare raised nursery beds (1-1.2m wide) with perimeter drainage furrows.',
          'Broadcast pre-germinated seeds uniformly; maintain saturated nursery moisture without submerging.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Damping-off & Root Rot (Pythium / Rhizoctonia)',
          favorableConditions: 'High seedbed moisture coupled with cloudiness',
          etlThreshold: '5% nursery seedlings showing collar damping',
          ipmBioControl: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg',
          chemicalIntervention: 'Drench nursery bed with Copper Oxychloride 50 WP @ 2.5 g/L',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [24, 34],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 4.0,
        priorities: [
          'Maintain thin film of water (1-2 cm) during early plumule emergence.',
          'Protect young radicles from scorching if daytime temp exceeds 36°C by evening splash watering.',
          'Check for early whorl maggot attack on tender emerging shoots.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Whorl Maggot (Hydrellia philippina)',
          favorableConditions: 'Standing water with sunny afternoon spells',
          etlThreshold: '10% damaged central leaves',
          ipmBioControl: 'Intermittent drainage of nursery beds for 24 hours',
          chemicalIntervention: 'Apply Chlorantraniliprole 0.4% G @ 4 kg/acre if ETL crossed',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 33],
        maxWindToleranceKmh: 35,
        criticalETdemandMm: 5.2,
        priorities: [
          'Apply first split dose of Nitrogen (Urea @ 30-35 kg/acre) only when foliage is dry.',
          'Maintain 3-5 cm standing water layer in main field; avoid complete desiccation.',
          'Perform mechanical cono-weeding or hand weeding between rows to aerate root zone.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Yellow Stem Borer (Scirpophaga incertulas)',
          favorableConditions: 'Overcast skies and night temperatures around 23-26°C',
          etlThreshold: '1 egg mass/m² or 5% dead hearts at vegetative stage',
          ipmBioControl: 'Install pheromone traps @ 5/acre and release Trichogramma chilonis',
          chemicalIntervention: 'Foliar spray of Cartap Hydrochloride 50 SP @ 2 g/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH && isWet ? 'ELEVATED' : 'FAVORABLE',
        optimumTempRange: [25, 32],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 5.8,
        priorities: [
          'Maintain shallow standing water (2-3 cm) to promote maximum productive tillering.',
          'Apply second split of Nitrogen along with 25 kg/ha Zinc Sulphate if deficiency symptoms show.',
          'Inspect bottom of hill clumps for sheath blight sclerotia and bacterial leaf blight water-soaked lesions.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Bacterial Leaf Blight & Sheath Blight (Xanthomonas / Rhizoctonia)',
          favorableConditions: 'Relative humidity >80% and surface temperatures 28-32°C',
          etlThreshold: 'Initial lesion appearance on 5% of tillers',
          ipmBioControl: 'Foliar spray of Pseudomonas fluorescens @ 2.5 kg/ha in 500L water',
          chemicalIntervention: 'Streptocycline (30g) + Copper Oxychloride 50 WP (500g) in 200L water/acre',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [24, 30],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 6.5,
        priorities: [
          'Avoid spray operations between 09:00 and 12:00 to prevent pollen wash-off and anthesis disruption.',
          'Ensure continuous 5 cm water depth at panicle emergence to avoid sterile spikelets.',
          'Scout for Brown Plant Hopper (BPH) colonies at the water-line base of hills.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Brown Plant Hopper (Nilaparvata lugens)',
          favorableConditions: 'Dense canopy, high humidity, and warm still air',
          etlThreshold: '5-10 hoppers per hill at water contact line',
          ipmBioControl: 'Open 30cm alleyways every 2m (skip-rowing) to allow sunlight penetration',
          chemicalIntervention: 'Spray Pymetrozine 50 WG @ 120 g/acre or Dinotefuran 20 SG @ 80 g/acre',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [22, 29],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 5.5,
        priorities: [
          'Maintain saturated soil status with intermittent wetting and drying until dough stage.',
          'Foliar spray of 1% Potassium Nitrate (13:0:45) to enhance 1000-grain weight and test weight.',
          'Monitor for Rice Earhead Bug (Gundhi bug) during milk stage early morning hours.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Rice Gundhi Bug (Leptocorisa acuta)',
          favorableConditions: 'Sunny mornings following misty or humid dawn',
          etlThreshold: '1 adult or nymph per hill during milking stage',
          ipmBioControl: 'Light traps and hanging rotten fish meal attractants around bunds',
          chemicalIntervention: 'Dust Malathion 5% D @ 10 kg/acre or spray Cypermethrin 10 EC @ 1 ml/L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 32],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 2.8,
        priorities: [
          'Drain out standing water from fields 10-14 days prior to expected harvest date.',
          'Allow uniform drying of the soil surface to support harvest machinery entry.',
          'Inspect panicles for 80-85% golden yellow color conversion indicating physiological maturity.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'False Smut (Ustilaginoidea virens)',
          favorableConditions: 'High RH (>90%) with cloudy days during late grain hardening',
          etlThreshold: 'Presence of yellow/green smut balls on florets',
          ipmBioControl: 'Destruction of infected panicles during early rogueing',
          chemicalIntervention: 'Copper Hydroxide 77 WP @ 2 g/L applied during early heading phase',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [20, 34],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 1.5,
        priorities: [
          'Harvest during dry sunny hours when grain moisture reaches 18-20%.',
          'Thresh immediately and dry grains on clean tarpaulins until moisture drops to 12-14% for storage.',
          'Incorporate or bale paddy straw; strictly avoid open residue burning to maintain soil organic carbon.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Stored Grain Weevil & Fungal Molding',
          favorableConditions: 'Storage grain moisture >14% and ambient RH >75%',
          etlThreshold: 'Presence of live insects in seed sample',
          ipmBioControl: 'Mix neem leaf powder @ 2% with stored seed lots in airtight bags',
          chemicalIntervention: 'Fumigate airtight godown with Aluminium Phosphide @ 3g/tonne grain',
        },
      },
    },
    'Wheat': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 24],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 2.5,
        priorities: [
          'Sow when daily mean temperature drops below 23°C for timely wheat varieties.',
          'Treat certified seed with Carboxin + Thiram @ 2g/kg seed against loose smut.',
          'Ensure optimum seed depth of 4-5 cm using seed-cum-fertilizer drill.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Termites (Odontotermes obesus) & Loose Smut',
          favorableConditions: 'Sandy loam soils with dry top layers',
          etlThreshold: '5% damaged seed lines',
          ipmBioControl: 'Seed treatment with Trichoderma harzianum @ 5g/kg',
          chemicalIntervention: 'Seed treatment with Thiamethoxam 30 FS @ 3.3 ml/kg seed',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [16, 22],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 3.0,
        priorities: [
          'Ensure even emergence across rows; avoid crust formation on soil surface.',
          'Scout for cutworms and surface crickets active during dawn and dusk.',
          'Prepare field channels for first Crown Root Initiation (CRI) irrigation.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Cutworm (Agrotis ipsilon)',
          favorableConditions: 'Moist seedbeds with loose clods',
          etlThreshold: '2 cut seedlings per meter row',
          ipmBioControl: 'Deep summer ploughing and bird perches @ 10/acre',
          chemicalIntervention: 'Soil drenching with Chlorpyrifos 20 EC @ 2 ml/L',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [14, 20],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 3.8,
        priorities: [
          'First irrigation is mandatory at Crown Root Initiation (CRI) stage (20-25 days after sowing).',
          'Apply first split of Urea (65 kg/acre) immediately following CRI irrigation.',
          'Spray post-emergence herbicide (Clodinafop-propargyl for Phalaris minor) at 30-35 DAS.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Gull (Phalaris minor) weed & Armyworm',
          favorableConditions: 'Continuous low soil temperatures and high basal fertilizer',
          etlThreshold: '10 weed seedlings/m²',
          ipmBioControl: 'Crop rotation with berseem or mustard',
          chemicalIntervention: 'Spray Mesosulfuron + Iodosulfuron (Atlantis) @ 160 g/acre in 150L water',
        },
      },
      'Tillering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [12, 18],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 4.2,
        priorities: [
          'Provide second irrigation at active tillering (40-45 DAS).',
          'Apply balance half dose of Nitrogen to support healthy crown development.',
          'Scout lower leaves for yellow rust (stripe rust) stripes along leaf veins.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Yellow (Stripe) Rust (Puccinia striiformis)',
          favorableConditions: 'Night temp 8-13°C with heavy dew/fog and daylight 18-22°C',
          etlThreshold: 'First pustule appearance on lower leaf canopy',
          ipmBioControl: 'Plant resistant cultivars (HD 2967, HD 3086, PBW 550)',
          chemicalIntervention: 'Foliar spray of Propiconazole 25 EC (Tilt) @ 1 ml/L (200 ml/acre)',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [15, 23],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 5.0,
        priorities: [
          'Critical irrigation at flowering/heading (80-85 DAS); avoid water stress.',
          'Check for aphid colonies clustering on emerging earheads.',
          'Ensure no lodging occurs: avoid irrigating during forecasted windy days (>20 km/h).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Wheat Aphids (Sitobion avenae)',
          favorableConditions: 'Cloudy weather with temperatures between 15-22°C',
          etlThreshold: '10 aphids per earhead on 10% randomly selected tillers',
          ipmBioControl: 'Conserve Coccinellid predator ladybird beetles',
          chemicalIntervention: 'Spray Thiamethoxam 25 WG @ 50 g/acre or Dimethoate 30 EC @ 1.5 ml/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: currentTemp > 30 ? 'ELEVATED' : 'LOW',
        optimumTempRange: [18, 25],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 4.8,
        priorities: [
          'Milking & dough stage irrigation is crucial to prevent shriveled grains.',
          'If maximum temperature exceeds 32°C (terminal heat stress), spray 0.2% Potassium Nitrate.',
          'Monitor for powdery mildew and leaf blight on upper flag leaf.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Terminal Heat Stress & Karnal Bunt (Tilletia indica)',
          favorableConditions: 'High afternoon temperatures (>30°C) with morning dew',
          etlThreshold: 'Weather trigger: Temp >32°C during grain filling',
          ipmBioControl: 'Foliar spray of Salicylic acid (100 ppm) to alleviate heat stress',
          chemicalIntervention: 'Spray Tebuconazole 25.9 EC @ 1 ml/L at heading phase',
        },
      },
      'Maturity': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 28],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 2.0,
        priorities: [
          'Withhold all irrigations as crop reaches complete dough and golden senescence.',
          'Check grain hardness with thumbnail test before scheduling combine harvester.',
          'Arrange combine harvesters equipped with Super SMS (Straw Management System).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Bird Damage & Lodging',
          favorableConditions: 'Dry sunny days with mature grain fields',
          etlThreshold: 'Noticeable floret shattering in outer border rows',
          ipmBioControl: 'Reflective ribbon strips and bio-acoustics along perimeter',
          chemicalIntervention: 'No chemicals needed at maturity phase',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 35],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 1.0,
        priorities: [
          'Harvest when grain moisture is below 12-14% during bright sunny hours.',
          'Store grains in clean metal bins after cleaning with neem oil or Celphos fumigation.',
          'Incorporate wheat stubble into soil using happy seeder or rotavator for next crop cycle.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Storage Pests (Khapra Beetle / Lesser Grain Borer)',
          favorableConditions: 'Grain moisture >12% in ambient storage',
          etlThreshold: 'Presence of live insects in grain bags',
          ipmBioControl: 'Dry grains to 10% moisture in direct sunlight before sealing',
          chemicalIntervention: 'Fumigate storage bins with Aluminium Phosphide 56% tablet @ 1 tablet/tonne',
        },
      },
    },
    'Maize': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 32],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.2,
        priorities: [
          'Treat hybrid seeds with Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS @ 6 ml/kg against FAW.',
          'Ensure ridge and furrow planting (60 cm row-to-row, 20 cm plant-to-plant).',
          'Apply pre-emergence herbicide Atrazine 50% WP @ 1.0 kg/ha within 48h of sowing.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fall Armyworm (Spodoptera frugiperda)',
          favorableConditions: 'Warm humid weather and early seedling emergence',
          etlThreshold: '5% damaged seedlings with pinhole whorl symptoms',
          ipmBioControl: 'Apply neem cake @ 200 kg/ha in furrow; seed treatment with biopesticides',
          chemicalIntervention: 'Seed treatment with Fortenza Duo or Gaucho',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 32],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 3.5,
        priorities: [
          'Thin out excess seedlings to maintain single healthy plant per hill at 10-12 DAS.',
          'Ensure furrows are unobstructed to avoid water stagnation at seedling stage.',
          'Scout for FAW egg masses with hairy protective coverings on seedling leaves.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fall Armyworm & Shoot Fly',
          favorableConditions: 'Cloudy weather with warm temperatures',
          etlThreshold: '1 egg mass per 10 consecutive plants',
          ipmBioControl: 'Release egg parasitoid Trichogramma pretiosum @ 50,000/ha',
          chemicalIntervention: 'Spray Chlorantraniliprole 18.5 SC @ 0.4 ml/L into central whorl',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [22, 32],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 4.5,
        priorities: [
          'Top dress first split of Nitrogen (Urea @ 40 kg/acre) at knee-high stage (30 DAS).',
          'Perform earthing-up operation to provide root anchorage against monsoon winds.',
          'Maintain clean weed-free inter-row space using power weeder or hand hoe.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Turcicum Leaf Blight & Fall Armyworm',
          favorableConditions: 'High RH (>80%) and moderate temperature (20-26°C)',
          etlThreshold: '10% plants showing window-pane or whorl frass damage',
          ipmBioControl: 'Place sand + dry neem leaf powder (9:1 ratio) into central whorls',
          chemicalIntervention: 'Spray Emamectin Benzoate 5 SG @ 0.4 g/L or Spinetoram 11.7 SC @ 0.5 ml/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [24, 32],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 5.0,
        priorities: [
          'Remove secondary weak tillers to concentrate nutrients in main primary stalk.',
          'Apply Zinc Sulphate (21%) @ 10 kg/acre if interveinal chlorosis appears on upper leaves.',
          'Ensure good soil aeration around roots through shallow inter-cultivation.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Banded Leaf and Sheath Blight (Rhizoctonia solani)',
          favorableConditions: 'Continuous wet soil with high relative humidity',
          etlThreshold: 'Initial water-soaked lesions on lower leaf sheaths',
          ipmBioControl: 'Strip lower 2-3 dried leaves to improve inter-row ventilation',
          chemicalIntervention: 'Foliar spray of Validamycin 3L @ 2.5 ml/L or Azoxystrobin @ 1 ml/L',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [24, 30],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 6.2,
        priorities: [
          'Tasseling and silking are the most critical water stress periods; maintain field capacity.',
          'Apply third split of Nitrogen (Urea @ 30 kg/acre) at pre-tasseling stage.',
          'Avoid severe drought stress: 1 day of moisture stress at silking reduces yield by 7%.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Cob Borer (Helicoverpa armigera)',
          favorableConditions: 'Fresh silk emergence during warm humid spells',
          etlThreshold: '1 larva per 5 cobs or silk trimming damage',
          ipmBioControl: 'Install pheromone traps @ 5/acre for Helicoverpa armigera',
          chemicalIntervention: 'Targeted silk spray with Chlorantraniliprole 18.5 SC @ 0.3 ml/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 30],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 5.5,
        priorities: [
          'Maintain irrigation at milk and soft dough stage for complete cob grain filling.',
          'Foliar spray of 1% KNO3 (13:0:45) to enhance starch deposition and cob weight.',
          'Check for cob rot diseases if heavy rain occurs during late grain filling.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Maydis Leaf Blight & Ear Rots',
          favorableConditions: 'Warm humid spells during grain dough stage',
          etlThreshold: 'Lesions covering >10% ear leaf area',
          ipmBioControl: 'Use resistant hybrid cultivars and balanced N:K nutrition',
          chemicalIntervention: 'Spray Mancozeb 75 WP @ 2.5 g/L on ear foliage',
        },
      },
      'Maturity': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 32],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 2.2,
        priorities: [
          'Withhold irrigation when husk leaves turn straw yellow and dry.',
          'Check for black layer formation at the base of grains indicating physiological maturity.',
          'Protect drying cobs from parrots and wild boar in perimeter areas.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Stalk Rot & Bird Damage',
          favorableConditions: 'Dry conditions at senescence',
          etlThreshold: '5% drooping cobs due to stalk softness',
          ipmBioControl: 'Ensure timely harvest without keeping dried standing stalks',
          chemicalIntervention: 'No chemical intervention required',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 35],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 1.0,
        priorities: [
          'Harvest when cob moisture reaches 18-20% and de-husk immediately.',
          'Dry cobs on clean drying floors to 12% moisture before mechanical shelling.',
          'Store shelled grain in moisture-proof hermetic bags (PICS bags) or fumigated bins.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Maize Weevil & Aflatoxin (Aspergillus flavus)',
          favorableConditions: 'Storage moisture >13% and high temperature',
          etlThreshold: 'Grains showing greenish-yellow mold or weevil emergence',
          ipmBioControl: 'Sun dry grain to 10% moisture before bagging in hermetic containers',
          chemicalIntervention: 'Fumigate airtight storage with Aluminium Phosphide @ 3g/tonne',
        },
      },
    },
    'Cotton': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [25, 34],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.0,
        priorities: [
          'Sow Bt hybrid seeds on ridges (90x60 cm or 120x45 cm) with optimum soil moisture.',
          'Seed treatment with Imidacloprid 70 WS @ 7 g/kg or Thiamethoxam 70 WS @ 4 g/kg.',
          'Apply Pendimethalin 38.7 CS @ 650 ml/acre within 24-48h of sowing as pre-emergence.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Sucking Pests (Thrips / Jassids) & Seedling Blight',
          favorableConditions: 'High seedbed moisture and warm humid dawn',
          etlThreshold: '5% damaged emerging seedlings',
          ipmBioControl: 'Seed treatment with Trichoderma viride @ 10g/kg seed',
          chemicalIntervention: 'Seed treatment with Gaucho 70 WS @ 5 g/kg seed',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [24, 34],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 3.5,
        priorities: [
          'Gap filling within 7-10 DAS to ensure uniform crop stand.',
          'Thinning at 15 DAS leaving one vigorous seedling per hill.',
          'Inspect underside of cotyledon leaves for early thrips and jassid infestation.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Cotton Jassid / Leafhopper (Amrasca biguttula biguttula)',
          favorableConditions: 'Warm weather with intermittent drizzle',
          etlThreshold: '2 jassid nymphs per leaf or downward leaf curling',
          ipmBioControl: 'Install yellow sticky traps @ 10/acre along field borders',
          chemicalIntervention: 'Spray Flonicamid 50 WG @ 80 g/acre or Dinotefuran 20 SG @ 60 g/acre',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [25, 35],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 4.8,
        priorities: [
          'Top dress first split of Nitrogen (Urea @ 35 kg/acre) at 30-35 DAS.',
          'Perform inter-row cultivation (bullock/tractor hoeing) to break surface crust and weeds.',
          'Scout for Whitefly nymphs and adults on middle canopy leaves early in the morning.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Whitefly (Bemisia tabaci) & Leaf Curl Virus (CLCuD)',
          favorableConditions: 'Hot dry weather interspersed with high humidity spells',
          etlThreshold: '6-8 whitefly adults or 20 nymphs per leaf',
          ipmBioControl: 'Spray Neem Oil 1500 ppm @ 3 ml/L or castor border rows as trap crop',
          chemicalIntervention: 'Spray Pyriproxyfen 10 EC @ 400 ml/acre or Diafenthiuron 50 WP @ 240 g/acre',
        },
      },
      'Tillering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [26, 35],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 5.2,
        priorities: [
          'Promote sympodial (fruiting) branching through balanced vegetative management.',
          'Spray growth regulator Mepiquat Chloride (Chamatkar) @ 1 ml/L if crop shows excessive vegetative growth.',
          'Maintain clean drainage furrows to prevent root asphyxiation during heavy rain.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Spotted Bollworm (Earias vittella) & Jassids',
          favorableConditions: 'High canopy humidity with lush vegetative growth',
          etlThreshold: '5% terminal shoot damage or 2 jassids/leaf',
          ipmBioControl: 'Install pheromone traps @ 5/acre for Earias and Pectinophora',
          chemicalIntervention: 'Foliar spray of Chlorantraniliprole 18.5 SC @ 0.3 ml/L',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [26, 33],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 6.8,
        priorities: [
          'Square formation to flowering is extremely sensitive to moisture stress; do not let soil crack.',
          'Foliar spray of 2% DAP + 1% MgSO4 + 0.5% Boron to prevent square and flower drop.',
          'Monitor Pink Bollworm (PBW) in rosetted flowers and install delta pheromone traps @ 8/acre.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Pink Bollworm (Pectinophora gossypiella)',
          favorableConditions: 'Overcast warm evenings (24-28°C)',
          etlThreshold: '8 moths/trap/night for 3 consecutive days or 5% rosetted flowers',
          ipmBioControl: 'Mass trapping with pheromone lures and release of Trichogramma bactrae',
          chemicalIntervention: 'Foliar spray of Emamectin Benzoate 5 SG @ 100 g/acre or Profenofos 50 EC @ 2 ml/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [25, 32],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 5.8,
        priorities: [
          'Boll development stage requires steady moisture; alternate furrow irrigation is recommended.',
          'Spray 2% Potassium Nitrate (13:0:45) at 15-day intervals during boll swelling.',
          'Inspect green bolls for PBW entry pinholes and internal boll rot.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Boll Rot & Grey Mildew (Ramularia areola)',
          favorableConditions: 'High RH (>85%) with dense canopy shade',
          etlThreshold: 'Initial mildew patches on lower canopy leaves',
          ipmBioControl: 'Remove lower shaded leaves to increase sunlight exposure',
          chemicalIntervention: 'Foliar spray of Kresoxim-methyl 44.3 SC @ 1 ml/L or Copper Oxychloride @ 2.5 g/L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 34],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 2.5,
        priorities: [
          'Withhold irrigation when 20-30% bolls start opening naturally.',
          'Avoid chemical defoliant if picking is done manually; keep bolls clean of bract trash.',
          'Protect open lint from dew and unexpected rain.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Red Cotton Bug & Dusky Cotton Bug (Dysdercus cingulatus)',
          favorableConditions: 'Dry sunny days with open bolls',
          etlThreshold: '5 bugs per plant staining lint',
          ipmBioControl: 'Hand collection of congregating bugs in morning buckets of kerosenized water',
          chemicalIntervention: 'Spot dusting of Malathion 5% D @ 10 kg/acre on field margins',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 36],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 1.0,
        priorities: [
          'Pick clean, dry, fully-opened bolls after morning dew evaporates (after 10:00 AM).',
          'Keep stained and damaged cotton separate from first-grade clean white lint.',
          'Store picked seed cotton in clean dry cloth bags or rooms; never on moist soil.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Lint Staining & Mold Contamination',
          favorableConditions: 'Rain showers on opened bolls',
          etlThreshold: 'Any rain forecast during picking period',
          ipmBioControl: 'Speed up manual picking ahead of predicted rainfall spells',
          chemicalIntervention: 'No chemical application on open lint',
        },
      },
    },
    'Sugarcane': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [26, 35],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.5,
        priorities: [
          'Plant two or three-budded healthy setts from 8-10 month old nursery crop.',
          'Sett treatment with Carbendazim 50 WP @ 1 g/L + Chlorpyrifos 20 EC @ 2 ml/L for 15 minutes.',
          'Apply Trichoderma viride @ 5 kg/ha mixed in 500 kg FYM in planting furrows.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Termites & Sett Rot / Red Rot (Colletotrichum falcatum)',
          favorableConditions: 'Dry light soils or waterlogged furrows at sett placement',
          etlThreshold: '5% damaged sett eyes',
          ipmBioControl: 'Sett soaking in hot water at 52°C for 30 minutes + bio-fungicides',
          chemicalIntervention: 'Furrow drenching with Chlorpyrifos 20 EC @ 2 L/acre at planting',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [25, 34],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 3.8,
        priorities: [
          'Maintain light, frequent irrigations (7-10 days interval) to facilitate sett sprouting.',
          'Blind hoeing at 20-25 days after planting to break hard soil crust over buds.',
          'Gap filling with polybag pre-germinated setts at 30 DAS.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Early Shoot Borer (Chilo infuscatellus)',
          favorableConditions: 'Hot dry weather with low humidity (<50%) and high temp (>35°C)',
          etlThreshold: '15% dead hearts in emerging shoots',
          ipmBioControl: 'Trash mulching (10 cm thick) in furrows and release Trichogramma chilonis',
          chemicalIntervention: 'Soil application of Fipronil 0.3% G @ 10 kg/acre or Chlorantraniliprole 18.5 SC @ 150 ml/acre',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [25, 35],
        maxWindToleranceKmh: 35,
        criticalETdemandMm: 5.5,
        priorities: [
          'Apply first dose of Nitrogen (Urea @ 65 kg/acre) at 45 DAS along with light irrigation.',
          'Partial earthing-up at 60 DAS to control tillering and facilitate furrow irrigation.',
          'Inspect shoots for Early Shoot Borer dead hearts and pull them out.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Early Shoot Borer & Root Borer',
          favorableConditions: 'High temperature and soil moisture deficit',
          etlThreshold: '10% dead hearts',
          ipmBioControl: 'Soil drenching with Metarhizium anisopliae @ 2.5 kg/ha',
          chemicalIntervention: 'Drench root zone with Chlorantraniliprole 18.5 SC @ 0.4 ml/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [26, 34],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 6.0,
        priorities: [
          'Full earthing-up operation at 90-100 DAS after final top dressing of Nitrogen.',
          'Convert furrows into ridges and ridges into furrows for deep monsoon drainage.',
          'Apply remaining Nitrogen + Muriate of Potash @ 25 kg/acre before final earthing up.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Internode Borer (Chilo sacchariphagus indicus)',
          favorableConditions: 'Moderate temperature (26-30°C) with high humidity',
          etlThreshold: '5% damaged internodes',
          ipmBioControl: 'Release Trichogramma chilonis @ 2.5 cc/ha at 10-day intervals',
          chemicalIntervention: 'Spray Flubendiamide 39.35 SC @ 0.2 ml/L if severe infestation',
        },
      },
      'Flowering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [24, 32],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 6.5,
        priorities: [
          'Grand growth stage: propping and trash-twisting of adjacent cane rows to prevent lodging.',
          'Remove dry bottom leaves (detrashing) up to 5th node to improve aeration and deter pests.',
          'Maintain irrigation at 10-12 days interval in absence of rainfall.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Top Borer (Scirpophaga excerptalis) & Pyrilla',
          favorableConditions: 'High monsoon humidity and lush tall canopy',
          etlThreshold: '5% bunchy top symptoms or 3-5 Pyrilla adults/leaf',
          ipmBioControl: 'Conserve and release Epiricania melanoleuca cocoons @ 2000/ha for Pyrilla',
          chemicalIntervention: 'Apply Carbofuran 3G @ 12 kg/acre or spray Chlorpyrifos 20 EC @ 2 ml/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 30],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 4.8,
        priorities: [
          'Sucrose accumulation phase: bright sunny days and cool nights (diurnal gap >12°C) favor sugar synthesis.',
          'Extend irrigation interval to 15-20 days; avoid excess nitrogen fertilization.',
          'Check for Red Rot symptoms (drying third/fourth leaf with white cross bands inside pith).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Red Rot (Colletotrichum falcatum) & Smut',
          favorableConditions: 'Water stagnation in heavy soils with susceptible varieties',
          etlThreshold: 'First infected clump showing canopy yellowing',
          ipmBioControl: 'Uproot and burn diseased clumps immediately with surrounding soil',
          chemicalIntervention: 'Drench root zone with Carbendazim 50 WP @ 2 g/L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 30],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 2.5,
        priorities: [
          'Withhold irrigation 20-25 days prior to harvest to concentrate sucrose in cane stalks.',
          'Test brix reading using hand refractometer (optimal brix > 18-20% throughout cane height).',
          'Plan harvest schedule based on variety maturity group (early vs mid-late).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Woolly Aphid (Ceratovacuna lanigera) & Rats',
          favorableConditions: 'Dense mature un-detrashed cane stands',
          etlThreshold: 'Colonies covering >10% leaf area',
          ipmBioControl: 'Release predators Dipha aphidivora or Micromus igorotus',
          chemicalIntervention: 'Spot spray Acephate 75 SP @ 1.5 g/L on infested borders',
        },
      },
      'Harvest': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 32],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 1.0,
        priorities: [
          'Cut canes close to the ground level using sharp cane billhooks to harvest highest-sugar basal internodes.',
          'Supply harvested cane to sugar mills within 24-48 hours to minimize post-harvest sucrose inversion.',
          'For ratoon management, perform stubble shaving, inter-row trash mulching, and gap filling.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Ratoon Stunting Disease & Post-harvest Inversion',
          favorableConditions: 'Delay in crushing exceeding 48 hours in hot sun',
          etlThreshold: 'Time lag >24 hours from field cut',
          ipmBioControl: 'Cover cane carts/trucks with cane trash during transit',
          chemicalIntervention: 'Spray sodium metasilicate @ 0.5% on cut stalk ends if crushing delayed',
        },
      },
    },
    'Pulses': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 28],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 2.8,
        priorities: [
          'Inoculate seeds with Rhizobium culture and PSB (Phosphate Solubilizing Bacteria) @ 20g/kg seed.',
          'Seed treatment with Carbendazim + Thiram (1:1) @ 2g/kg seed against wilt and root rot.',
          'Ensure well-drained seedbed preparation; pulses cannot tolerate water stagnation even for 24 hours.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Wilt & Root Rot (Fusarium oxysporum / Rhizoctonia bataticola)',
          favorableConditions: 'Heavy clay soils with poor drainage',
          etlThreshold: '5% seedling wilt in initial stand',
          ipmBioControl: 'Soil application of Trichoderma harzianum @ 2.5 kg/ha with 500 kg FYM',
          chemicalIntervention: 'Seed treatment with Carboxin 37.5% + Thiram 37.5% DS @ 2 g/kg',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 26],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 3.0,
        priorities: [
          'Monitor seedling emergence at 6-8 DAS; clear crust if heavy rain occurs post-sowing.',
          'Ensure surface furrows drain out excess rainwater immediately.',
          'Scout for collar rot in low-lying pockets of the field.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Collar Rot (Sclerotium rolfsii)',
          favorableConditions: 'High soil moisture coupled with warm day temperatures (28-30°C)',
          etlThreshold: 'Initial seedling mortality in patches',
          ipmBioControl: 'Drenching with Pseudomonas fluorescens @ 5 g/L',
          chemicalIntervention: 'Spot drenching with Copper Oxychloride @ 2.5 g/L or Thiram @ 2 g/L',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [18, 26],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 3.8,
        priorities: [
          'Perform hand weeding or inter-cultivation at 25-30 DAS to keep field clean.',
          'Foliar spray of 2% DAP at 30 DAS to boost nodulation and vegetative canopy.',
          'Scout for early leaf eating caterpillars and aphids on tender shoots.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Black Aphids (Aphis craccivora) & Cutworm',
          favorableConditions: 'Cloudy weather and high humidity',
          etlThreshold: '20 aphids per top 5 cm shoot tip on 10% plants',
          ipmBioControl: 'Conserve Syrphid fly larvae and ladybird beetles',
          chemicalIntervention: 'Spray Dimethoate 30 EC @ 1.5 ml/L or Imidacloprid 17.8 SL @ 0.3 ml/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [18, 26],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 4.2,
        priorities: [
          'Nipping (terminal shoot plucking) in chickpea at 35-40 DAS to induce profuse lateral branching.',
          'Maintain light soil aeration around collar root zone.',
          'Apply Sulfur @ 20 kg/ha to enhance protein synthesis and nodule nitrogenase activity.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Ascochyta Blight & Cercospora Leaf Spot',
          favorableConditions: 'Cool wet weather with frequent dew spells',
          etlThreshold: 'Circular brown lesions on 5% branches',
          ipmBioControl: 'Spray bio-fungicide Bacillus subtilis @ 5 g/L',
          chemicalIntervention: 'Foliar spray of Mancozeb 75 WP @ 2.5 g/L or Chlorothalonil @ 2 g/L',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [16, 24],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 5.2,
        priorities: [
          'Flowering stage is critical: avoid severe drought stress, but NEVER over-irrigate (leads to vegetative overgrowth and flower drop).',
          'Foliar spray of Planofix (NAA) @ 4 ml/15 L water or 2% Urea at 50% flowering to prevent flower shedding.',
          'Install pheromone traps @ 5/acre for Gram Pod Borer (Helicoverpa armigera).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Gram Pod Borer (Helicoverpa armigera)',
          favorableConditions: 'Warm days (22-26°C) following overcast periods during floret opening',
          etlThreshold: '1 larva per meter row or 5-8 moths/trap/night',
          ipmBioControl: 'Spray HaNPV (Helicoverpa Nuclear Polyhedrosis Virus) @ 250 LE/ha in evening + bird perches',
          chemicalIntervention: 'Spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Emamectin Benzoate 5 SG @ 0.4 g/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 26],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 4.8,
        priorities: [
          'Pod filling stage: provide light irrigation if soil moisture is deficient.',
          'Foliar spray of 1% Potassium Nitrate (13:0:45) + 0.2% Boron to maximize pod filling and seed boldness.',
          'Inspect developing pods for entry boreholes and caterpillar frass.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Pod Borer & Pod Fly (Melanagromyza obtusa)',
          favorableConditions: 'Warm dry conditions during green pod swelling',
          etlThreshold: '5% damaged pods sampled across field',
          ipmBioControl: 'Neem seed kernel extract (NSKE 5%) foliar spray',
          chemicalIntervention: 'Spray Spinosad 45 SC @ 0.3 ml/L or Indoxacarb 14.5 SC @ 0.7 ml/L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [20, 30],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 2.0,
        priorities: [
          'Withhold all irrigations as 85% pods turn brownish-straw color.',
          'Check pods for rattle sound when shaken indicating readiness for harvesting.',
          'Protect drying field from sudden rain or morning moisture.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Pod Shattering & Bruchids (Callosobruchus chinensis)',
          favorableConditions: 'High afternoon heat and dry winds causing premature pod shattering',
          etlThreshold: 'Observed dehisced pods in outer rows',
          ipmBioControl: 'Timely morning harvesting before high noon heat',
          chemicalIntervention: 'No chemical intervention required in field',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 34],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 1.0,
        priorities: [
          'Harvest early in the morning when pods are slightly pliable to avoid shattering losses.',
          'Dry harvested crop on threshing floor for 3-4 days until seed moisture drops to 9-10%.',
          'Mix dry pulses with activated neem leaf powder or sweet flag rhizome powder before storage.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Pulse Beetle / Bruchid (Callosobruchus maculatus)',
          favorableConditions: 'Storage grain moisture >10% in unsealed gunny bags',
          etlThreshold: 'Presence of white egg spots on seed coats',
          ipmBioControl: 'Coat pulse seeds with edible oil (mustard/linseed oil) @ 5 ml/kg seed',
          chemicalIntervention: 'Fumigate storage container with Aluminium Phosphide @ 3g/tonne',
        },
      },
    },
    'Vegetables': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 30],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 3.2,
        priorities: [
          'Raise nursery on 15 cm high raised beds with 50 mesh insect-proof nylon net covering.',
          'Treat seeds with Thiram + Carbendazim @ 2g/kg or Trichoderma viride @ 4g/kg.',
          'Incorporate well-decomposed vermicompost + Trichoderma into nursery topsoil.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Damping-off (Pythium aphanidermatum) & Whitefly Vectors',
          favorableConditions: 'Excess moisture in dense nursery beds coupled with warm cloudiness',
          etlThreshold: 'Any patch showing seedling water-soaking and collar collapse',
          ipmBioControl: 'Use pro-trays with sterilized cocopeat inside shade net',
          chemicalIntervention: 'Drench nursery bed with Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L',
        },
      },
      'Germination': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [20, 28],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.5,
        priorities: [
          'Provide light rose-can irrigation in early morning; avoid evening waterlogging.',
          'Thin out overcrowded seedlings to prevent microclimate humidity build-up.',
          'Harden seedlings 4-5 days prior to transplanting by withholding water gradually.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Flea Beetles & Damping-off',
          favorableConditions: 'High soil humidity and overcast sky',
          etlThreshold: '10% damaged cotyledon leaves',
          ipmBioControl: 'Foliar spray of Neem Seed Kernel Extract (NSKE 5%)',
          chemicalIntervention: 'Spray Copper Oxychloride @ 2 g/L around seedling collars',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [20, 30],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 4.8,
        priorities: [
          'Transplant 25-30 day old sturdy seedlings in evening hours on raised ridges.',
          'Install drip irrigation and silver-black polyethylene mulch (25-30 micron) for moisture conservation.',
          'Provide bamboo staking and trellis support for indeterminate tomato and creeper cucurbits.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Whitefly, Leaf Miner & Tomato Leaf Curl Virus (ToLCV)',
          favorableConditions: 'Warm dry spells with high diurnal temperature variations',
          etlThreshold: '5 whiteflies/leaf or visible serpentine leaf mines',
          ipmBioControl: 'Install yellow and blue sticky traps @ 20/acre',
          chemicalIntervention: 'Spray Cyantraniliprole 10.26 OD @ 1.8 ml/L or Diafenthiuron 50 WP @ 1.2 g/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: 'FAVORABLE',
        optimumTempRange: [20, 28],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 5.0,
        priorities: [
          'Side shooting / pruning of lateral suckers to maintain single or double main stems.',
          'Earthing-up operation along ridges to cover exposed collar roots and support fertilizer bands.',
          'Apply 19:19:19 NPK water-soluble fertigation @ 3 kg/acre every 4 days.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Early Blight (Alternaria solani) & Sucking Thrips',
          favorableConditions: 'Alternating wet and dry periods with high dew duration',
          etlThreshold: 'Concentric ring target spots on lower leaves',
          ipmBioControl: 'Foliar spray of Trichoderma harzianum @ 5 g/L',
          chemicalIntervention: 'Foliar spray of Mancozeb 75 WP @ 2.5 g/L or Azoxystrobin 23 SC @ 1 ml/L',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [18, 28],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 6.0,
        priorities: [
          'Flower retention: spray 0.2% Boron (Solubor) + 0.1% Zinc chelate at flower cluster opening.',
          'Avoid spray operations during active bee pollination hours (07:00-11:00 AM).',
          'Maintain uniform soil moisture; fluctuations cause blossom end rot and flower drop.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fruit Borer (Helicoverpa armigera) & Bacterial Wilt (Ralstonia)',
          favorableConditions: 'High relative humidity with warm afternoons (>28°C)',
          etlThreshold: '1 egg or young larva per 5 plants',
          ipmBioControl: 'Install pheromone traps @ 8/acre and release Trichogramma chilonis',
          chemicalIntervention: 'Foliar spray of Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Emamectin Benzoate 5 SG @ 0.4 g/L',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [18, 28],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 5.5,
        priorities: [
          'Fruit development: apply Calcium Nitrate @ 5 kg/acre via drip to prevent blossom end rot and fruit cracking.',
          'Foliar spray of 0:52:34 (MKP) @ 5 g/L + 13:0:45 @ 5 g/L to accelerate fruit sizing.',
          'Inspect fruits for fruit borer bore holes and fungal anthracnose lesions.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fruit Borer, Fruit Fly (Bactrocera) & Anthracnose (Colletotrichum)',
          favorableConditions: 'Intermittent rainfall spells with high daytime humidity (>80%)',
          etlThreshold: '5% fruit damage or 5 fruit flies/trap/day',
          ipmBioControl: 'Install Methyl Eugenol / Cue-lure pheromone traps @ 10/acre for fruit flies',
          chemicalIntervention: 'Spray Difenoconazole 25 EC @ 1 ml/L or Tebuconazole 25.9 EC @ 1 ml/L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [18, 30],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.0,
        priorities: [
          'Harvest fruits at breaker or turning stage (pink stage) for long-distance transport.',
          'Withhold heavy watering 2 days prior to scheduled picking to enhance fruit shelf life and TSS (Total Soluble Solids).',
          'Keep harvested crates shaded from direct sun in clean collection yards.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fruit Soft Rot & Sunscald',
          favorableConditions: 'Exposure to intense direct sunlight (>35°C) followed by rain',
          etlThreshold: 'Visible sunscald bleaching on unshaded fruits',
          ipmBioControl: 'Maintain adequate canopy foliage coverage over developing fruits',
          chemicalIntervention: 'Spray Copper Hydroxide @ 2 g/L at clear weather intervals',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [20, 32],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 1.5,
        priorities: [
          'Harvest in cool early morning hours (06:00-09:30 AM) with clean sanitized clippers.',
          'Sort, grade, and pack in ventilated plastic crates; avoid overloading.',
          'Store in evaporative cool chamber (Zero Energy Cool Chamber - ZECC) for farm-gate storage.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Post-Harvest Rots (Rhizopus / Geotrichum)',
          favorableConditions: 'Harvesting wet fruits during rainy spells',
          etlThreshold: 'Visible skin abrasions on picked fruits',
          ipmBioControl: 'Wash crates with 0.1% sodium hypochlorite solution',
          chemicalIntervention: 'No post-harvest chemical dipping; ensure dry ventilation',
        },
      },
    },
    'Horticulture': {
      'Sowing': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [24, 34],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.5,
        priorities: [
          'Dig planting pits (1m x 1m x 1m) and expose to solarization for 15-20 days.',
          'Fill pits with topsoil + 25 kg well-rotted FYM + 2 kg Single Super Phosphate + 100g Chlorpyrifos dust.',
          'Plant genuine epicotyl/wedge grafted saplings with graft union kept 15 cm above ground.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Termites & Root Rot (Phytophthora / Rhizoctonia)',
          favorableConditions: 'Heavy soils with stagnant pit water',
          etlThreshold: 'Pit water stagnation >24 hours',
          ipmBioControl: 'Mix Trichoderma viride @ 100g/pit with FYM',
          chemicalIntervention: 'Pit drenching with Copper Oxychloride 50 WP @ 3 g/L',
        },
      },
      'Germination': {
        weatherSensitivity: 'MODERATE',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 32],
        maxWindToleranceKmh: 28,
        criticalETdemandMm: 3.8,
        priorities: [
          'Stake young grafted saplings with sturdy bamboo poles to keep main stem straight.',
          'Regularly remove rootstock sprouts emerging below the graft union.',
          'Provide light basin irrigation around root zone; avoid wetting collar stem.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Shoot Borer & Leaf Webbers',
          favorableConditions: 'Tender fresh flush emergence in warm humid weather',
          etlThreshold: '10% young shoots webbed or tunnelled',
          ipmBioControl: 'Manual removal of webbed leaves and egg masses',
          chemicalIntervention: 'Foliar spray of Quinalphos 25 EC @ 2 ml/L on tender flushes',
        },
      },
      'Vegetative': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'FAVORABLE' : 'LOW',
        optimumTempRange: [22, 35],
        maxWindToleranceKmh: 35,
        criticalETdemandMm: 5.0,
        priorities: [
          'Form ring basins around drip line (canopy edge); apply recommended basal NPK + FYM.',
          'Apply organic mulch (paddy straw / dried leaves) in tree basins to conserve moisture and suppress weeds.',
          'Perform pruning of dead, diseased, criss-cross branches to open canopy for sunlight.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Mango Hopper (Amritodus atkinsoni) & Shoot Gall Psylla',
          favorableConditions: 'Overcast skies and dense un-pruned canopy',
          etlThreshold: '5 hoppers per panicle/shoot',
          ipmBioControl: 'Spray bio-pesticide Beauveria bassiana @ 5 g/L',
          chemicalIntervention: 'Spray Imidacloprid 17.8 SL @ 0.3 ml/L or Thiamethoxam 25 WG @ 0.3 g/L',
        },
      },
      'Tillering': {
        weatherSensitivity: 'LOW',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 35],
        maxWindToleranceKmh: 30,
        criticalETdemandMm: 5.2,
        priorities: [
          'Canopy training: encourage 4-5 well-spaced scaffold limbs in all directions.',
          'Paint tree trunks up to 1m height with Bordeaux paste (1:1:10) to prevent bark infections.',
          'Maintain clean orchard inter-space; grow leguminous cover crops (cowpea / sunn hemp).',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Bark Eating Caterpillar & Gummosis',
          favorableConditions: 'Older neglected orchards with cracked tree barks',
          etlThreshold: 'Fresh ribbon-like webbing and sawdust on trunk forks',
          ipmBioControl: 'Clean webs and inject Dichlorvos 76 EC (0.05%) into bore holes with syringe and seal with mud',
          chemicalIntervention: 'Trunk painting with Bordeaux paste + Chlorpyrifos',
        },
      },
      'Flowering': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'MODERATE',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [20, 30],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 5.8,
        priorities: [
          'Panicle emergence to full bloom: strictly WITHHOLD irrigation before flowering to prevent vegetative flushing.',
          'Resume light watering only after fruit set reaches pea-size stage.',
          'NEVER spray chemical insecticides during peak bloom to protect honeybee pollinators.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Powdery Mildew (Oidium mangiferae) & Blossom Midge',
          favorableConditions: 'Cloudy weather with high morning RH (>80%) and cool nights during panicle emergence',
          etlThreshold: 'First white powdery patches on flower panicles',
          ipmBioControl: 'Foliar spray of Wettable Sulfur 80 WP @ 2.5 g/L before bloom',
          chemicalIntervention: 'Spray Hexaconazole 5 EC @ 1 ml/L or Dinocap 48 EC @ 1 ml/L at panicle emergence',
        },
      },
      'Grain formation': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'CRITICAL',
        diseaseEnvironment: isHighRH ? 'ELEVATED' : 'LOW',
        optimumTempRange: [22, 34],
        maxWindToleranceKmh: 22,
        criticalETdemandMm: 6.2,
        priorities: [
          'Fruit development stage (pea size to marble size): regular drip irrigation is critical to prevent fruit drop.',
          'Foliar spray of 1% Potassium Nitrate (13:0:45) + 0.2% Boron at marble size stage.',
          'Install fruit fly pheromone traps (Methyl Eugenol wooden blocks) @ 10/acre across orchard.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Oriental Fruit Fly (Bactrocera dorsalis) & Anthracnose',
          favorableConditions: 'Intermittent summer rain showers with temperatures >28°C',
          etlThreshold: '5 fruit flies trapped/day/trap or initial pinhole stings',
          ipmBioControl: 'Fruit bagging with double-layered parchment bags at 45 days after fruit set',
          chemicalIntervention: 'Foliar spray of Azoxystrobin 23 SC @ 1 ml/L + bait spray of Jaggery (10g) + Malathion (2ml) / L',
        },
      },
      'Maturity': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: 'LOW',
        optimumTempRange: [22, 36],
        maxWindToleranceKmh: 25,
        criticalETdemandMm: 3.5,
        priorities: [
          'Withhold irrigation 10-15 days before harvest to enhance fruit aroma, sweetness, and shelf life.',
          'Inspect fruits for shoulder development, pit formation at stalk end, and color break from olive green to light yellow.',
          'Harvest with 1 cm stalk attached using pole harvesters equipped with collection nets.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Fruit Drop & Stem End Rot (Lasiodiplodia theobromae)',
          favorableConditions: 'Heavy storms and rain before harvesting',
          etlThreshold: 'Premature fallen fruits under canopy',
          ipmBioControl: 'Harvest before fruit turns soft on the tree',
          chemicalIntervention: 'Post-harvest hot water treatment at 52°C for 5 minutes',
        },
      },
      'Harvest': {
        weatherSensitivity: 'HIGH',
        waterRequirement: 'LOW',
        diseaseEnvironment: isWet ? 'ELEVATED' : 'LOW',
        optimumTempRange: [24, 38],
        maxWindToleranceKmh: 20,
        criticalETdemandMm: 1.5,
        priorities: [
          'Harvest during dry morning hours; de-sap fruits immediately on inverted harvesting racks for 4 hours to avoid sap burn.',
          'Desap, wash, sponge dry, and pack in corrugated fiberboard (CFB) boxes with paper shreds.',
          'Ripen fruits naturally in ventilated ripening chambers with ethylene gas (100 ppm) at 20-22°C; avoid calcium carbide.',
        ],
        pestDiseaseWatch: {
          targetOrganism: 'Anthracnose & Stem End Rot during ripening',
          favorableConditions: 'Ambient storage RH >80% and temp >30°C',
          etlThreshold: 'Black circular sunken spots on ripening skin',
          ipmBioControl: 'Hot water dip treatment at 52°C for 5 minutes + bio-fungicide',
          chemicalIntervention: 'Prochloraz 45 EC dip @ 1 ml/L for export quality fruits',
        },
      },
    },
  };

  const cropGroup = baseProfiles[crop] || baseProfiles['Rice (Paddy)'];
  const stageProfile = cropGroup[stage] || cropGroup['Tillering'];

  return {
    crop,
    stage,
    ...stageProfile,
  };
}

export interface FarmOperationsEvaluation {
  overallStatus: 'OPTIMAL' | 'CAUTION' | 'RESTRICTED';
  overallReason: string;
  operations: {
    id: string;
    name: string;
    status: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER';
    statusColor: 'emerald' | 'amber' | 'rose' | 'cyan';
    recommendedWindow: string;
    reason: string;
    weatherTrigger: string;
    icon: string;
  }[];
}

export function evaluateFarmOperations(
  weather: WeatherDataBundle | undefined,
  crop: CropType,
  stage: PhenologicalStage
): FarmOperationsEvaluation {
  const current = weather?.current;
  const temp = current?.temp ?? 30;
  const rain24h = current?.precipitation ?? 0;
  const rainProb = current?.precipitationProbability ?? (weather?.daily?.[0]?.rainProb ?? 20);
  const windSpeed = current?.windSpeed ?? 12;
  const humidity = current?.humidity ?? 68;

  const isRainImminent = rain24h > 5 || rainProb > 55;
  const isHighWind = windSpeed > 15;
  const isExtremeHeat = temp > 38;

  let overallStatus: FarmOperationsEvaluation['overallStatus'] = 'OPTIMAL';
  let overallReason = 'Favorable atmospheric conditions for standard agricultural operations across the district.';

  if (isRainImminent && isHighWind) {
    overallStatus = 'RESTRICTED';
    overallReason = 'Elevated precipitation probability and gusty winds restrict field spraying and fertilizer top-dressing.';
  } else if (isRainImminent || isHighWind || isExtremeHeat) {
    overallStatus = 'CAUTION';
    overallReason = isRainImminent
      ? 'Convective rain spells anticipated; suspend irrigation pumping and protect open-field inputs.'
      : isHighWind
      ? 'Surface wind gusts exceed spraying threshold (>15 km/h); postpone foliar applications to prevent drift.'
      : 'Elevated daytime temperatures; schedule machinery and manual work during cooler morning hours.';
  }

  // 1. IRRIGATION
  let irrigationStatus: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER' = 'RECOMMENDED';
  let irrigationColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
  let irrigationWindow = '06:00 – 09:30 IST / 16:30 – 18:30 IST';
  let irrigationReason = 'Maintain optimal root zone moisture balance.';
  let irrigationTrigger = `Ambient Temp: ${temp}°C | RH: ${humidity}%`;

  if (rain24h > 15 || rainProb > 60) {
    irrigationStatus = 'DEFER';
    irrigationColor = 'rose';
    irrigationWindow = 'Hold for next 48 hours';
    irrigationReason = 'Significant precipitation forecast meets crop evapotranspirative demand.';
    irrigationTrigger = `Rain Probability: ${rainProb}% | 24h Rain: ${rain24h}mm`;
  } else if (rain24h > 5 || rainProb > 35) {
    irrigationStatus = 'CAUTION';
    irrigationColor = 'amber';
    irrigationWindow = 'Light surface cycle / As needed';
    irrigationReason = 'Light showers expected; verify soil moisture tension before activating pumps.';
    irrigationTrigger = `Rain Probability: ${rainProb}% | Light Showers`;
  } else if (temp > 35) {
    irrigationStatus = 'RECOMMENDED';
    irrigationColor = 'emerald';
    irrigationWindow = 'Early Morning (05:30 – 08:30 IST)';
    irrigationReason = 'High evapotranspiration rate; early morning application minimizes evaporative loss.';
    irrigationTrigger = `High ET demand | Temp: ${temp}°C`;
  }

  // 2. SPRAYING
  let sprayingStatus: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER' = 'RECOMMENDED';
  let sprayingColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
  let sprayingWindow = '06:30 – 09:30 IST (Clear Calm Slot)';
  let sprayingReason = 'Calm winds and clear sky facilitate uniform droplet deposition.';
  let sprayingTrigger = `Wind: ${windSpeed} km/h | Rain: ${rainProb}%`;

  if (isRainImminent) {
    sprayingStatus = 'NOT RECOMMENDED';
    sprayingColor = 'rose';
    sprayingWindow = 'Postpone until weather clears';
    sprayingReason = 'High risk of foliar wash-off and chemical dilution from rainfall.';
    sprayingTrigger = `Precipitation Risk: ${rainProb}%`;
  } else if (isHighWind) {
    sprayingStatus = 'NOT RECOMMENDED';
    sprayingColor = 'rose';
    sprayingWindow = 'Window opens when wind drops < 12 km/h';
    sprayingReason = 'Excessive wind causes spray drift, uneven coverage, and off-target hazard.';
    sprayingTrigger = `Wind Speed: ${windSpeed} km/h (Threshold: 15 km/h)`;
  } else if (temp > 34) {
    sprayingStatus = 'CAUTION';
    sprayingColor = 'amber';
    sprayingWindow = 'Strictly 06:00 – 08:30 IST';
    sprayingReason = 'Avoid midday spraying to prevent rapid droplet evaporation and foliar phytotoxicity.';
    sprayingTrigger = `Daytime Max Temp: ${temp}°C`;
  }

  // 3. FERTILIZATION
  let fertStatus: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER' = 'RECOMMENDED';
  let fertColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
  let fertWindow = 'Morning hours on dry foliage';
  let fertReason = 'Soil moisture is optimal for nutrient dissolution and root uptake.';
  let fertTrigger = `Optimal soil moisture | Moderate temp`;

  if (rain24h > 20 || rainProb > 65) {
    fertStatus = 'NOT RECOMMENDED';
    fertColor = 'rose';
    fertWindow = 'Postpone broadcasting';
    fertReason = 'Heavy rain causes severe leaching of Nitrogen and surface fertilizer runoff.';
    fertTrigger = `Heavy Rain Risk: ${rainProb}%`;
  } else if (isRainImminent) {
    fertStatus = 'CAUTION';
    fertColor = 'amber';
    fertWindow = 'Apply between light showers only';
    fertReason = 'Ensure fertilizer is incorporated into soil rather than broadcasted on wet surface.';
    fertTrigger = `Moist surface condition`;
  }

  // 4. SOWING / TILLAGE
  let sowingStatus: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER' = 'RECOMMENDED';
  let sowingColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
  let sowingWindow = 'Morning to Afternoon (08:00 – 16:00 IST)';
  let sowingReason = 'Soil tilth and moisture content are in ideal working condition.';
  let sowingTrigger = `Stable soil moisture profile`;

  if (rain24h > 35) {
    sowingStatus = 'NOT RECOMMENDED';
    sowingColor = 'rose';
    sowingWindow = 'Hold until field reaches field capacity';
    sowingReason = 'Excessive soil saturation; tractor machinery will cause soil compaction and smear.';
    sowingTrigger = `Saturated soil from ${rain24h}mm rain`;
  } else if (isRainImminent) {
    sowingStatus = 'CAUTION';
    sowingColor = 'amber';
    sowingWindow = 'Complete raised-bed operations';
    sowingReason = 'Ensure seedbeds have perimeter drainage channels before incoming showers.';
    sowingTrigger = `Upcoming rain forecast`;
  }

  // 5. HARVESTING / FIELD OPS
  let harvestStatus: 'RECOMMENDED' | 'CAUTION' | 'NOT RECOMMENDED' | 'DEFER' = 'RECOMMENDED';
  let harvestColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
  let harvestWindow = '10:00 – 16:00 IST (Dry Sunshine)';
  let harvestReason = 'Low atmospheric humidity accelerates crop drying and smooth mechanical threshing.';
  let harvestTrigger = `RH: ${humidity}% | Clear sky`;

  if (isRainImminent) {
    harvestStatus = 'NOT RECOMMENDED';
    harvestColor = 'rose';
    harvestWindow = 'Defer harvest; secure drying yard';
    harvestReason = 'Rain causes grain shattering, lodging of mature stands, and high storage moisture.';
    harvestTrigger = `Rain risk: ${rainProb}%`;
  } else if (humidity > 80) {
    harvestStatus = 'CAUTION';
    harvestColor = 'amber';
    harvestWindow = 'Midday only (11:00 – 15:00 IST)';
    harvestReason = 'High morning foliar dew dampens stalks; wait for canopy to dry completely.';
    harvestTrigger = `Elevated morning RH: ${humidity}%`;
  }

  return {
    overallStatus,
    overallReason,
    operations: [
      {
        id: 'irrigation',
        name: 'IRRIGATION',
        status: irrigationStatus,
        statusColor: irrigationColor,
        recommendedWindow: irrigationWindow,
        reason: irrigationReason,
        weatherTrigger: irrigationTrigger,
        icon: 'Droplets',
      },
      {
        id: 'spraying',
        name: 'SPRAYING',
        status: sprayingStatus,
        statusColor: sprayingColor,
        recommendedWindow: sprayingWindow,
        reason: sprayingReason,
        weatherTrigger: sprayingTrigger,
        icon: 'SprayCan',
      },
      {
        id: 'fertilization',
        name: 'FERTILIZATION',
        status: fertStatus,
        statusColor: fertColor,
        recommendedWindow: fertWindow,
        reason: fertReason,
        weatherTrigger: fertTrigger,
        icon: 'Sprout',
      },
      {
        id: 'sowing',
        name: 'SOWING / TILLAGE',
        status: sowingStatus,
        statusColor: sowingColor,
        recommendedWindow: sowingWindow,
        reason: sowingReason,
        weatherTrigger: sowingTrigger,
        icon: 'Tractor',
      },
      {
        id: 'harvesting',
        name: 'HARVESTING / FIELD OPS',
        status: harvestStatus,
        statusColor: harvestColor,
        recommendedWindow: harvestWindow,
        reason: harvestReason,
        weatherTrigger: harvestTrigger,
        icon: 'Wheat',
      },
    ],
  };
}

export interface SevenDayAgriculturalItem {
  dayName: string;
  dateStr: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProb: number;
  humidity: number;
  windKmh: number;
  conditionText: string;
  cropImpact: string;
  fieldSuitability: {
    irrigation: 'LOW NEED' | 'MODERATE' | 'CRITICAL' | 'HOLD';
    irrigationColor: 'emerald' | 'amber' | 'rose' | 'cyan';
    spraying: 'IDEAL' | 'ACCEPTABLE' | 'AVOID' | 'CAUTION';
    sprayingColor: 'emerald' | 'amber' | 'rose';
    harvesting: 'FAVORABLE' | 'CAUTION' | 'AVOID';
    harvestingColor: 'emerald' | 'amber' | 'rose';
  };
}

export function generate7DayAgriculturalForecast(
  weather: WeatherDataBundle | undefined,
  crop: CropType,
  stage: PhenologicalStage
): SevenDayAgriculturalItem[] {
  const daily = weather?.daily || [];
  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  return dayNames.map((dName, idx) => {
    const dItem: DailyForecastItem | undefined = daily[idx];
    const tempMax = dItem ? Math.round(dItem.high) : 32 - (idx % 3);
    const tempMin = dItem ? Math.round(dItem.low) : 24 + (idx % 2);
    const rainProb = dItem ? dItem.rainProb : (idx === 0 ? 60 : 20);
    const rainMm = rainProb > 70 ? 18 : rainProb > 40 ? 6 : 0;
    const humidity = dItem ? Math.round(dItem.humidity) : (rainMm > 0 ? 82 : 68);
    const windKmh = 12 + (idx % 4);
    const conditionText = dItem ? dItem.condition : (rainMm > 15 ? 'Moderate Showers' : rainMm > 0 ? 'Light Rain' : 'Partly Cloudy');

    // Date String
    const now = new Date();
    now.setDate(now.getDate() + idx);
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    // Derive Crop Impact
    let cropImpact = 'Balanced growth conditions; steady thermal accumulation.';
    if (rainMm > 25) {
      cropImpact = `Heavy rainfall may cause surface pooling around ${crop} root zone. Check drainage.`;
    } else if (rainMm > 8) {
      cropImpact = `Moderate moisture recharge beneficial for ${crop} during ${stage} phase.`;
    } else if (tempMax > 38) {
      cropImpact = `High thermal load (>38°C); watch for leaf curl and moisture stress in ${crop}.`;
    } else if (windKmh > 25) {
      cropImpact = `Gusty surface winds (${windKmh} km/h); inspect tall stands for mechanical stress.`;
    }

    // Suitability calculations
    let irrigation: 'LOW NEED' | 'MODERATE' | 'CRITICAL' | 'HOLD' = 'MODERATE';
    let irrigationColor: 'emerald' | 'amber' | 'rose' | 'cyan' = 'emerald';
    if (rainMm > 10 || rainProb > 60) {
      irrigation = 'HOLD';
      irrigationColor = 'rose';
    } else if (rainMm > 2) {
      irrigation = 'LOW NEED';
      irrigationColor = 'cyan';
    } else if (tempMax > 35) {
      irrigation = 'CRITICAL';
      irrigationColor = 'amber';
    }

    let spraying: 'IDEAL' | 'ACCEPTABLE' | 'AVOID' | 'CAUTION' = 'IDEAL';
    let sprayingColor: 'emerald' | 'amber' | 'rose' = 'emerald';
    if (rainProb > 50 || windKmh > 18) {
      spraying = 'AVOID';
      sprayingColor = 'rose';
    } else if (rainProb > 25 || windKmh > 12 || tempMax > 35) {
      spraying = 'CAUTION';
      sprayingColor = 'amber';
    }

    let harvesting: 'FAVORABLE' | 'CAUTION' | 'AVOID' = 'FAVORABLE';
    let harvestingColor: 'emerald' | 'amber' | 'rose' = 'emerald';
    if (rainProb > 50 || rainMm > 5) {
      harvesting = 'AVOID';
      harvestingColor = 'rose';
    } else if (humidity > 78 || rainProb > 25) {
      harvesting = 'CAUTION';
      harvestingColor = 'amber';
    }

    return {
      dayName: dName,
      dateStr,
      tempMax,
      tempMin,
      rainMm,
      rainProb,
      humidity,
      windKmh,
      conditionText,
      cropImpact,
      fieldSuitability: {
        irrigation,
        irrigationColor,
        spraying,
        sprayingColor,
        harvesting,
        harvestingColor,
      },
    };
  });
}

export interface RiskFactorItem {
  id: string;
  name: string;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  color: 'emerald' | 'amber' | 'orange' | 'rose';
  driver: string;
  managementAction: string;
}

export function evaluateWeatherCropRisks(
  weather: WeatherDataBundle | undefined,
  crop: CropType,
  stage: PhenologicalStage
): RiskFactorItem[] {
  const current = weather?.current;
  const temp = current?.temp ?? 30;
  const humidity = current?.humidity ?? 68;
  const rain24h = current?.precipitation ?? 0;
  const rainProb = current?.precipitationProbability ?? (weather?.daily?.[0]?.rainProb ?? 20);
  const windSpeed = current?.windSpeed ?? 12;

  // 1. HEAT STRESS
  let heatLevel: RiskFactorItem['level'] = 'LOW';
  let heatScore = 18;
  let heatColor: RiskFactorItem['color'] = 'emerald';
  let heatAction = 'Thermal accumulation within safe physiological bounds.';
  if (temp > 42) {
    heatLevel = 'CRITICAL';
    heatScore = 92;
    heatColor = 'rose';
    heatAction = 'Emergency light irrigation in early dawn; spray 0.2% KNO3 anti-transpirant.';
  } else if (temp > 37) {
    heatLevel = 'HIGH';
    heatScore = 76;
    heatColor = 'orange';
    heatAction = 'Frequent light watering; avoid mid-day canopy disturbance.';
  } else if (temp > 33) {
    heatLevel = 'MODERATE';
    heatScore = 48;
    heatColor = 'amber';
    heatAction = 'Monitor soil moisture tension; schedule field work early morning.';
  }

  // 2. WATER STRESS (Deficit)
  let waterDeficitLevel: RiskFactorItem['level'] = 'LOW';
  let waterDeficitScore = 20;
  let waterDeficitColor: RiskFactorItem['color'] = 'emerald';
  let waterDeficitAction = 'Soil moisture balance meets crop requirement.';
  if (rain24h === 0 && temp > 35 && humidity < 40) {
    waterDeficitLevel = 'HIGH';
    waterDeficitScore = 78;
    waterDeficitColor = 'orange';
    waterDeficitAction = 'Deploy drip/sprinkler cycle immediately to avoid permanent wilting point.';
  } else if (rain24h === 0 && temp > 32) {
    waterDeficitLevel = 'MODERATE';
    waterDeficitScore = 45;
    waterDeficitColor = 'amber';
    waterDeficitAction = 'Inspect root zone tension; prepare next irrigation rotation.';
  }

  // 3. EXCESS RAIN & WATERLOGGING
  let rainLevel: RiskFactorItem['level'] = 'LOW';
  let rainScore = 15;
  let rainColor: RiskFactorItem['color'] = 'emerald';
  let rainAction = 'Field drainage channels operational without standing surface pools.';
  if (rain24h > 50 || rainProb > 85) {
    rainLevel = 'CRITICAL';
    rainScore = 90;
    rainColor = 'rose';
    rainAction = 'Open all peripheral bund drains immediately to avoid root asphyxiation.';
  } else if (rain24h > 25 || rainProb > 65) {
    rainLevel = 'HIGH';
    rainScore = 72;
    rainColor = 'orange';
    rainAction = 'Clear silt and weeds from drainage furrows; suspend all pumping.';
  } else if (rain24h > 10 || rainProb > 40) {
    rainLevel = 'MODERATE';
    rainScore = 46;
    rainColor = 'amber';
    rainAction = 'Monitor low-lying plots for localized surface ponding.';
  }

  // 4. HIGH HUMIDITY & DEW PERIOD
  let rhLevel: RiskFactorItem['level'] = 'LOW';
  let rhScore = 22;
  let rhColor: RiskFactorItem['color'] = 'emerald';
  let rhAction = 'Foliar surface dries quickly under gentle daytime ventilation.';
  if (humidity > 85) {
    rhLevel = 'HIGH';
    rhScore = 80;
    rhColor = 'orange';
    rhAction = 'Extended leaf wetness (>10h) triggers fungal spore incubation. Avoid night watering.';
  } else if (humidity > 72) {
    rhLevel = 'MODERATE';
    rhScore = 52;
    rhColor = 'amber';
    rhAction = 'Maintain canopy spacing; inspect bottom leaves for water-soaked spots.';
  }

  // 5. WIND DAMAGE & LODGING
  let windLevel: RiskFactorItem['level'] = 'LOW';
  let windScore = 15;
  let windColor: RiskFactorItem['color'] = 'emerald';
  let windAction = 'Gentle wind flow; no mechanical lodging hazard.';
  if (windSpeed > 35) {
    windLevel = 'CRITICAL';
    windScore = 88;
    windColor = 'rose';
    windAction = 'Tying/propping of tall crop stands; suspend all boom spraying.';
  } else if (windSpeed > 22) {
    windLevel = 'HIGH';
    windScore = 68;
    windColor = 'orange';
    windAction = 'Postpone chemical spraying due to excessive droplet drift.';
  } else if (windSpeed > 14) {
    windLevel = 'MODERATE';
    windScore = 42;
    windColor = 'amber';
    windAction = 'Calibrate spray nozzle pressure for low-drift droplets.';
  }

  // 6. PEST PRESSURE
  let pestLevel: RiskFactorItem['level'] = 'LOW';
  let pestScore = 25;
  let pestColor: RiskFactorItem['color'] = 'emerald';
  let pestAction = 'Pest counts below Economic Threshold Level (ETL).';
  if (humidity > 75 && temp >= 26 && temp <= 33) {
    pestLevel = 'HIGH';
    pestScore = 75;
    pestColor = 'orange';
    pestAction = 'Favorable microclimate for sucking pests and borers. Install pheromone traps.';
  } else if (humidity > 65 || temp > 28) {
    pestLevel = 'MODERATE';
    pestScore = 48;
    pestColor = 'amber';
    pestAction = 'Scout 20 hill samples diagonally across field twice weekly.';
  }

  // 7. DISEASE PRESSURE
  let diseaseLevel: RiskFactorItem['level'] = 'LOW';
  let diseaseScore = 20;
  let diseaseColor: RiskFactorItem['color'] = 'emerald';
  let diseaseAction = 'Atmospheric parameters unfavorable for pathogen sporulation.';
  if (humidity > 80 && temp >= 22 && temp <= 30) {
    diseaseLevel = 'HIGH';
    diseaseScore = 82;
    diseaseColor = 'orange';
    diseaseAction = 'Environmental conditions favorable for foliar blights/sheath rot. Keep bio-fungicides ready.';
  } else if (humidity > 70) {
    diseaseLevel = 'MODERATE';
    diseaseScore = 50;
    diseaseColor = 'amber';
    diseaseAction = 'Ensure proper field drainage and air circulation in crop canopy.';
  }

  return [
    {
      id: 'heat',
      name: 'HEAT STRESS',
      level: heatLevel,
      score: heatScore,
      color: heatColor,
      driver: `Max Air Temp: ${temp}°C`,
      managementAction: heatAction,
    },
    {
      id: 'water_stress',
      name: 'WATER STRESS',
      level: waterDeficitLevel,
      score: waterDeficitScore,
      color: waterDeficitColor,
      driver: `Rainfall Deficit / Soil Hydrology`,
      managementAction: waterDeficitAction,
    },
    {
      id: 'excess_rain',
      name: 'EXCESS RAIN',
      level: rainLevel,
      score: rainScore,
      color: rainColor,
      driver: `24h Precip: ${rain24h}mm | Prob: ${rainProb}%`,
      managementAction: rainAction,
    },
    {
      id: 'high_humidity',
      name: 'HIGH HUMIDITY',
      level: rhLevel,
      score: rhScore,
      color: rhColor,
      driver: `Relative Humidity: ${humidity}%`,
      managementAction: rhAction,
    },
    {
      id: 'wind_damage',
      name: 'WIND DAMAGE',
      level: windLevel,
      score: windScore,
      color: windColor,
      driver: `Wind Velocity: ${windSpeed} km/h`,
      managementAction: windAction,
    },
    {
      id: 'pest_pressure',
      name: 'PEST PRESSURE',
      level: pestLevel,
      score: pestScore,
      color: pestColor,
      driver: `Overcast Skies & Warm Microclimate`,
      managementAction: pestAction,
    },
    {
      id: 'disease_pressure',
      name: 'DISEASE PRESSURE',
      level: diseaseLevel,
      score: diseaseScore,
      color: diseaseColor,
      driver: `Leaf Wetness & Incubation Index`,
      managementAction: diseaseAction,
    },
  ];
}

export interface Timeline72hItem {
  offsetLabel: string;
  hourTime: string;
  tempC: number;
  humidityPct: number;
  windKmh: number;
  rainMm: number;
  rainProbPct: number;
  fieldSuitability: 'OPTIMAL' | 'MODERATE' | 'RESTRICTED';
  recommendedOperation: string;
}

export function generate72HourTimeline(
  weather: WeatherDataBundle | undefined
): Timeline72hItem[] {
  const hourly = weather?.hourly || [];
  const offsets = [
    { offset: '+0H (NOW)', index: 0 },
    { offset: '+6H', index: 6 },
    { offset: '+12H', index: 12 },
    { offset: '+18H', index: 18 },
    { offset: '+24H', index: 24 },
    { offset: '+36H', index: 36 },
    { offset: '+48H', index: 48 },
    { offset: '+72H', index: Math.min(71, hourly.length - 1) },
  ];

  const now = new Date();

  return offsets.map(({ offset, index }) => {
    const item: HourlyForecastItem | undefined = hourly[index];
    const targetDate = new Date(now.getTime() + (index || 0) * 3600 * 1000);
    const hourTime = targetDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const tempC = item ? Math.round(item.temp) : 28;
    const humidityPct = item ? Math.round(item.humidity) : 75;
    const windKmh = item ? Math.round(item.windSpeed) : 12;
    const rainMm = item?.qpf ? Math.round(item.qpf * 10) / 10 : 0;
    const rainProbPct = item ? item.rainProb : (rainMm > 0 ? 60 : 15);

    let fieldSuitability: Timeline72hItem['fieldSuitability'] = 'OPTIMAL';
    let recommendedOperation = 'Ideal for canopy inspection & weeding';

    if (rainProbPct > 55 || rainMm > 5) {
      fieldSuitability = 'RESTRICTED';
      recommendedOperation = 'Hold field equipment; check drainage bunds';
    } else if (windKmh > 15) {
      fieldSuitability = 'MODERATE';
      recommendedOperation = 'Avoid spray drift; manual weeding permitted';
    } else if (tempC > 35) {
      fieldSuitability = 'MODERATE';
      recommendedOperation = 'Operate irrigation pumps early in dawn';
    } else if (humidityPct < 75 && windKmh < 12) {
      fieldSuitability = 'OPTIMAL';
      recommendedOperation = 'Safe window for foliar nutrient spraying';
    }

    return {
      offsetLabel: offset,
      hourTime,
      tempC,
      humidityPct,
      windKmh,
      rainMm,
      rainProbPct,
      fieldSuitability,
      recommendedOperation,
    };
  });
}
