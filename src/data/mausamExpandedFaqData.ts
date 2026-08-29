/**
 * Extended Meteorological FAQ Items
 * Highly detailed, accurate, bulletined answers based on IMD, CPCB, INCOIS, NDMA, and WMO standards.
 */

import { FAQItem } from './mausamFaqData';

export const EXPANDED_FAQ_ITEMS: FAQItem[] = [
  // =========================================================================
  // 1. ADVANCED TELEMETRY & CLOUDS
  // =========================================================================
  {
    id: 'cloud_classification_rain',
    categoryId: 'current',
    question: 'What are the different cloud types and which clouds produce heavy rain?',
    shortQuestion: 'Cloud types & Rain indications',
    keywords: ['cloud', 'cumulonimbus', 'cirrus', 'stratus', 'nimbostratus', 'altocumulus', 'cloud classification'],
    patterns: [/what are the types of clouds/i, /which clouds bring rain/i, /cumulonimbus/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### WMO Cloud Classification & Precipitation Indicators
• **Current Cloud & Sky Observation**: ${w.condition}

**High-Level Clouds (6,000m – 12,000m)**:
• **Cirrus (Ci)**: Thin, feathery ice-crystal wisps; indicates fair weather but precedes an approaching warm front or cyclone when thickening.
• **Cirrostratus (Cs)**: Thin sheet causing solar/lunar halos.

**Mid-Level Clouds (2,000m – 6,000m)**:
• **Altocumulus (Ac)**: "Mackerel sky" patches; indicates mid-level convective instability.
• **Altostratus (As)**: Gray/blue sheet; often thickens into steady rain.

**Low-Level & Rain-Bearing Clouds (Surface – 2,000m)**:
• **Nimbostratus (Ns)**: Dark, continuous gray layer producing widespread, steady moderate-to-heavy rainfall.
• **Cumulonimbus (Cb)**: Massive towering anvil-topped storm clouds reaching up to 15,000m; produces violent downpours, lightning, hail, squalls, and cloudbursts.`,
        sources: [
          { title: 'WMO International Cloud Atlas', url: 'https://cloudatlas.wmo.int', type: 'search' },
        ],
        followUps: [
          'Cloudburst physics & Mountain flash floods',
          'Current weather & conditions',
        ],
      };
    },
  },

  // =========================================================================
  // 2. GASEOUS POLLUTANTS & ENVIRONMENTAL CHEMISTRY
  // =========================================================================
  {
    id: 'gaseous_pollutants_ozone_no2',
    categoryId: 'health_aqi',
    question: 'What are the health effects of Ground-Level Ozone (O3), NO2, SO2, and Carbon Monoxide?',
    shortQuestion: 'Gaseous pollutants (Ozone, NO2, SO2)',
    keywords: ['ozone', 'no2', 'so2', 'carbon monoxide', 'gaseous pollutants', 'smog chemistry'],
    patterns: [/ground level ozone/i, /nitrogen dioxide/i, /sulfur dioxide/i, /gaseous pollutants/i],
    generateAnswer: () => {
      return {
        text: `### Gaseous Air Pollutants & Toxicological Impacts (CPCB / WHO)
• **Ground-Level Ozone (O3)**:
  - *Formation*: Formed by photochemical reactions between NOx and VOCs under intense summer sunlight.
  - *Impact*: Powerful lung oxidant; triggers severe coughing, reduced lung volume, and asthma exacerbation.
• **Nitrogen Dioxide (NO2)**:
  - *Source*: High-temperature combustion in vehicular engines and thermal power plants.
  - *Impact*: Deep airway inflammation and increased susceptibility to respiratory infections.
• **Sulfur Dioxide (SO2)**:
  - *Source*: Burning of fossil fuels (coal, diesel) and petroleum refineries.
  - *Impact*: Bronchoconstriction and precursor to corrosive sulfuric acid rain.
• **Carbon Monoxide (CO)**:
  - *Source*: Incomplete combustion from vehicular tailpipes and biomass burning.
  - *Impact*: Binds to blood hemoglobin forming carboxyhemoglobin, impairing oxygen delivery to the heart and brain.`,
        sources: [
          { title: 'CPCB Air Quality Criteria for Gaseous Pollutants', url: 'https://cpcb.nic.in', type: 'search' },
        ],
        followUps: [
          'National AQI (NAQI) scale breakdown',
          'PM2.5 vs PM10 particles explained',
        ],
      };
    },
  },

  // =========================================================================
  // 3. SEVERE WEATHER & STORMS
  // =========================================================================
  {
    id: 'urban_waterlogging_flash_floods',
    categoryId: 'rain_alerts',
    question: 'What causes sudden urban waterlogging and how should citizens stay safe during floods?',
    shortQuestion: 'Urban waterlogging & Flood safety',
    keywords: ['waterlogging', 'urban flood', 'drainage', 'submerged roads', 'flood safety', 'mumbai flood'],
    patterns: [/urban flood/i, /waterlogging/i, /how to stay safe in flood/i],
    generateAnswer: () => {
      return {
        text: `### Urban Waterlogging Mechanics & Flood Safety Protocol
Urban flooding occurs when rainfall intensity exceeds municipal stormwater drainage capacity (often designed for only 25–50 mm/hr):

**Contributing Factors**:
• High surface impermeability (concrete/asphalt prevent natural soil infiltration).
• Encroachment on natural wetlands, floodplains, and storm channels.

**Citizen Survival Protocols**:
1. **Never Drive Through Flooded Streets**: 30 cm (1 foot) of moving water can float a passenger car; 60 cm (2 feet) can sweep away SUVs.
2. **Beware of Open Manholes & Electrocution**: Avoid wading in standing floodwater; submerged live electrical wires and open storm drains pose fatal hazards.
3. **Turn Off Mains**: Switch off the main household electrical breaker and LPG gas cylinder valves if water begins entering the premises.
4. **Emergency Relocation**: Move to upper floors with your 72-hour disaster survival kit and phone power bank.`,
        sources: [
          { title: 'NDMA Urban Flood Management Guidelines', url: 'https://ndma.gov.in', type: 'search' },
        ],
        followUps: [
          '72-Hour emergency disaster kit',
          'IMD 4-Colour Warning Matrix',
        ],
      };
    },
  },

  {
    id: 'hailstorm_formation_damage',
    categoryId: 'rain_alerts',
    question: 'How do hailstorms form in thunderstorms and how can farmers protect standing crops?',
    shortQuestion: 'Hailstorm physics & Crop protection',
    keywords: ['hail', 'hailstorm', 'ice pellets', 'crop damage', 'anti-hail net', 'convective updraft'],
    patterns: [/how does hail form/i, /hailstorm damage/i, /anti-hail net/i],
    generateAnswer: () => {
      return {
        text: `### Hailstorm Physics & Agro-Horticulture Defense
• **Formation Mechanism**:
  - Occurs inside severe cumulonimbus thunderstorms with powerful vertical updrafts (> 80–120 km/h).
  - Supercooled water droplets freeze onto ice nuclei and are recycled upward multiple times through sub-zero cloud layers (-15°C to -40°C), adding concentric layers of ice like an onion.
  - When the hailstone weight exceeds the updraft capacity, it plummets to earth at speeds of 60–160 km/h.

**Crop & Orchard Protection**:
• **Anti-Hail Nets**: High-density polyethylene (HDPE) netting installed over apple, pomegranate, grape, and citrus orchards.
• **Pruning & Drainage**: Clear hail deposits promptly from canopies to prevent branch breakage and fungal blight infections.
• **Crop Insurance (PMFBY)**: Report hailstorm damage within 72 hours via the Crop Insurance App for localized disaster assessment.`,
        sources: [
          { title: 'IMD Severe Weather & Agro-Meteorology Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Doppler Radar & dBZ reflectivity',
          'Agromet (GKMS) & Meghdoot App Guide',
        ],
      };
    },
  },

  {
    id: 'downburst_squall_wind_safety',
    categoryId: 'rain_alerts',
    question: 'What is a Downburst / Microburst and how to stay safe from high-speed squall winds?',
    shortQuestion: 'Downburst & Squall wind safety',
    keywords: ['downburst', 'microburst', 'squall', 'gust front', 'straight line winds', 'tree falling'],
    patterns: [/what is a downburst/i, /what is a microburst/i, /squall wind safety/i],
    generateAnswer: () => {
      return {
        text: `### Severe Convective Downbursts & Squall Winds
• **Microburst / Macroburst Physics**:
  - A concentrated column of sinking air (downdraft) generated by evaporative cooling inside a thunderstorm.
  - Upon hitting the ground, it violently bursts outward in all directions, producing straight-line winds exceeding **100 to 160 km/h**.
  - Highly hazardous to civil aviation during takeoff/landing and destructive to roofs, billboards, and trees.

**Squall Safety Protocols**:
1. Stay well clear of metal sheet roofs, temporary hoardings, glass facades, and large eucalyptus/poplar trees.
2. Park motor vehicles away from overhead power lines and old masonry walls.
3. Secure loose rooftop water tanks, solar panels, and construction materials ahead of squall warnings.`,
        sources: [
          { title: 'IMD Severe Weather Warning Guidelines', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD 4-Colour Warning Matrix',
          'Wind speed & Beaufort scale',
        ],
      };
    },
  },

  // =========================================================================
  // 4. REGIONAL SYNOPTIC PHENOMENA
  // =========================================================================
  {
    id: 'coldwave_ground_frost',
    categoryId: 'states_regional',
    question: 'What defines an IMD Cold Wave, Severe Cold Wave, and how does Ground Frost damage crops?',
    shortQuestion: 'IMD Cold Wave & Ground Frost criteria',
    keywords: ['cold wave', 'severe cold wave', 'ground frost', 'chillai kalan', 'winter cold', 'fog'],
    patterns: [/what is (a )?cold wave/i, /cold wave criteria/i, /severe cold wave/i],
    generateAnswer: () => {
      return {
        text: `### IMD Cold Wave & Ground Frost Criteria (Plains & Hills)
• **Standard Baseline**: Minimum temperature is **≤ 10°C** for Plains and **≤ 0°C** for Hilly regions.

**Plains Classification**:
• **Cold Wave**:
  - Departure from normal minimum is **4.5°C to 6.4°C**, OR actual minimum temperature is **≤ 4.0°C**.
• **Severe Cold Wave**:
  - Departure from normal minimum is **> 6.4°C**, OR actual minimum temperature is **≤ 2.0°C**.

**Cold Day vs Cold Wave**:
• *Cold Day*: Occurs when maximum daytime temperature remains **4.5°C to 6.4°C below normal** under thick, persistent stratus fog, blocking daytime solar heating.

**Chillai Kalan (Kashmir Valley)**:
• The harshest 40-day winter period in Kashmir (Dec 21 – Jan 31) with frequent sub-zero temperatures freezing water supply pipes and Dal Lake edges.`,
        sources: [
          { title: 'IMD National Cold Wave Action Plan', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Western Disturbances (WD) explained',
          'Winter frost protection for crops',
        ],
      };
    },
  },

  {
    id: 'kalbaishakhi_norwesters',
    categoryId: 'states_regional',
    question: 'What are Kalbaishakhi (Nor\'westers) and Bordoisila storms in Eastern & NE India?',
    shortQuestion: 'Kalbaishakhi (Nor\'westers) & Bordoisila',
    keywords: ['kalbaishakhi', 'norwester', 'bordoisila', 'bengal storm', 'assam storm', 'pre monsoon squall'],
    patterns: [/what is kalbaishakhi/i, /nor'westers/i, /bordoisila/i],
    generateAnswer: () => {
      return {
        text: `### Kalbaishakhi (Nor'westers) & Bordoisila Dynamics
Violent pre-monsoon convective meso-scale storms occurring during March, April, and May across West Bengal, Odisha, Bihar, Jharkhand, and Assam:

**Thermodynamic Genesis**:
• Dry, cool mid-tropospheric westerly winds originating from the Chota Nagpur Plateau override warm, moist southerly air streaming off the Bay of Bengal.
• Creates extreme atmospheric instability (CAPE > 3,000 J/kg), erupting into towering supercell thunderstorms moving from Northwest to Southeast.

**Characteristics & Impacts**:
• Gale winds exceeding **80–120 km/h**, destructive hail, torrential downpours, and intense lightning.
• *Agricultural Dual-Nature*: While destructive to standing Rabi crops and thatched homes, the showers are vital for **Tea cultivation in Assam/Bengal** and **pre-Kharif Jute and Aus paddy sowing**.`,
        sources: [
          { title: 'RMC Kolkata Pre-Monsoon Thunderstorm Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Damini Lightning 30-30 Safety Rule',
          'Downburst & Squall wind safety',
        ],
      };
    },
  },

  {
    id: 'dust_storm_andhi_thar',
    categoryId: 'states_regional',
    question: 'What is an "Andhi" (Dust Storm) in Rajasthan and North-West India and how to handle it?',
    shortQuestion: 'Andhi (Dust Storms) in Thar Desert',
    keywords: ['andhi', 'dust storm', 'sandstorm', 'rajasthan', 'haboob', 'thar desert', 'visibility drop'],
    patterns: [/what is andhi/i, /dust storm in rajasthan/i, /how to survive dust storm/i],
    generateAnswer: () => {
      return {
        text: `### "Andhi" (Convective Dust Storm) Mechanics in North-West India
Common in Rajasthan, Punjab, Haryana, and Western UP from April to June:

**Mechanism**:
• Intense summer desert heating generates convective thermal updrafts.
• As downdrafts slam down onto dry, loose sandy soil, a rolling wall of suspended dust and sand particles (Haboob) charges outward at 50–90 km/h.
• Surface visibility plummets from 10 km to **< 50 meters in seconds**.
• Followed by a sharp temperature drop of 5°C–10°C and occasional light squall showers ("mud rain").

**Safety Guidance**:
1. Pull motor vehicles completely off the road, turn on hazard lights, and keep brakes engaged.
2. Seal all indoor windows and doors to prevent fine silica dust infiltration.
3. Wear a damp cloth or N95 mask over nose and mouth to prevent dust inhalation.`,
        sources: [
          { title: 'MC Jaipur Desert Meteorology Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD Heatwave & Loo Wind criteria',
          'Visibility: Fog vs Mist vs Haze',
        ],
      };
    },
  },

  // =========================================================================
  // 5. AGROMET & ANIMAL HUSBANDRY
  // =========================================================================
  {
    id: 'livestock_heat_stress_management',
    categoryId: 'agromet',
    question: 'How should dairy cattle, buffaloes, and poultry farms be protected from extreme heat stress?',
    shortQuestion: 'Livestock & Dairy heat stress care',
    keywords: ['livestock', 'dairy', 'cattle', 'cows', 'buffalo', 'poultry', 'heat stress', 'thi index'],
    patterns: [/heat stress in cattle/i, /dairy heat management/i, /poultry heatwave/i],
    generateAnswer: () => {
      return {
        text: `### Livestock & Dairy Heat Stress Mitigation (ICAR Guidelines)
Cattle and buffaloes experience severe thermal distress when the **Temperature-Humidity Index (THI) exceeds 72**, resulting in 20%–40% drops in daily milk yield and reduced conception rates:

**Protective Protocols**:
1. **Shed Cooling**:
   • Install thatch/bamboo false ceilings under metal roofs. Paint roof exteriors white with reflective lime.
   • Install misting fans and sprinklers inside cattle sheds; operate during peak heat (11:00–16:00 IST).
2. **Hydration & Electrolytes**:
   • Provide fresh, cool drinking water at all times; high-yielding cows consume 100–150 liters daily during summer.
   • Add mineral mixtures, sodium bicarbonate (buffer), and potassium chloride to feed rations.
3. **Wallowing for Buffaloes**:
   • Buffaloes have fewer sweat glands; provide wallowing tanks or water hose showers 3–4 times daily.
4. **Poultry Care**:
   • Increase cross-ventilation, lower stocking density, and feed birds during cool evening hours to prevent mortality.`,
        sources: [
          { title: 'ICAR National Dairy Research Institute (NDRI)', url: 'https://ndri.res.in', type: 'search' },
        ],
        followUps: [
          'Agromet (GKMS) & Meghdoot App Guide',
          'IMD Heatwave & Loo Wind criteria',
        ],
      };
    },
  },

  // =========================================================================
  // 6. PORT SIGNALS & COASTAL SAFETY
  // =========================================================================
  {
    id: 'port_warning_signals_1_to_11',
    categoryId: 'cyclone_marine',
    question: 'What do the Port Danger Signals (Signal 1 to Signal 11) hoisted at Indian ports mean?',
    shortQuestion: 'Port Danger Warning Signals (1 to 11)',
    keywords: ['port signal', 'signal 1', 'signal 3', 'signal 4', 'signal 8', 'signal 10', 'signal 11', 'harbour danger signal'],
    patterns: [/what do port signals mean/i, /port warning signals/i, /great danger signal 10/i],
    generateAnswer: () => {
      return {
        text: `### Port Warning Danger Signals (Hoisted at Indian Maritime Harbors)
Standard visual signaling system (flags by day, lamps by night) operated by IMD:

• **Signal 1 (Cautionary)**: Squally weather / system in distance; no immediate port impact.
• **Signal 2 (Warning)**: Cyclonic storm has formed in deep sea; ships leaving port face hazard.
• **Signal 3 (Local Cautionary)**: Port threatened by squalls from depression.
• **Signal 4 (Local Warning)**: Port threatened by cyclonic storm, but not yet direct strike.
• **Signal 5 (Danger - South)**: Cyclonic storm expected to strike coast keeping port to the south.
• **Signal 6 (Danger - North)**: Cyclonic storm expected to strike coast keeping port to the north.
• **Signal 7 (Danger - Over)**: Cyclonic storm expected to cross directly over or very close to port.
• **Signal 8 (Great Danger - South)**: Severe/Super cyclone crossing keeping port to the south.
• **Signal 9 (Great Danger - North)**: Severe/Super cyclone crossing keeping port to the north.
• **Signal 10 (Great Danger - Over)**: Severe/Super cyclone crossing directly over port.
• **Signal 11 (Communication Failure)**: All communication with Met Centre severed; great danger presumed.`,
        sources: [
          { title: 'IMD Port Warning Services Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          '4 Stages of IMD Cyclone Warning',
          'Tropical cyclone intensity scale',
        ],
      };
    },
  },

  // =========================================================================
  // 7. ATMOSPHERIC DYNAMICS & PHYSICS
  // =========================================================================
  {
    id: 'madden_julian_oscillation_mjo',
    categoryId: 'radar_science',
    question: 'What is the Madden-Julian Oscillation (MJO) and how does it trigger active/break monsoon spells?',
    shortQuestion: 'Madden-Julian Oscillation (MJO)',
    keywords: ['mjo', 'madden julian', 'equatorial wave', 'monsoon surge', 'active break spell', 'convective pulse'],
    patterns: [/what is mjo/i, /madden julian oscillation/i, /monsoon break/i],
    generateAnswer: () => {
      return {
        text: `### Madden-Julian Oscillation (MJO) Dynamics
• **Definition**:
  - An eastward-moving planetary-scale pulse of cloudiness, rainfall, and wind anomalies in the tropical atmosphere propagating around the globe every **30 to 60 days**.

**Impact on Indian Subcontinent**:
• **Active Phase (Phases 2 & 3 over Indian Ocean)**:
  - Enhances low-level moisture convergence and deep atmospheric convection.
  - Triggers **active monsoon surges, low-pressure depressions, and tropical cyclogenesis**.
• **Suppressed Phase (Phases 6, 7 & 8 over Pacific)**:
  - Subsiding dry air suppresses rainfall over India, driving prolonged **monsoon breaks** and heat spikes.`,
        sources: [
          { title: 'IMD Extended Range Forecast Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Southwest (SW) Monsoon dynamics',
          'El Niño, La Niña & IOD climate drivers',
        ],
      };
    },
  },

  // =========================================================================
  // 8. AVIATION & TRANSPORT
  // =========================================================================
  {
    id: 'cat_iii_ils_airport_fog',
    categoryId: 'aviation_marine',
    question: 'What is CAT-III Instrument Landing System (ILS) and Low Visibility Procedures (LVP) at airports?',
    shortQuestion: 'CAT-III ILS & Airport Fog Operations',
    keywords: ['cat iii', 'ils', 'low visibility', 'lvp', 'delhi airport fog', 'rvr', 'flight delay'],
    patterns: [/what is cat iii ils/i, /why are flights delayed in fog/i, /low visibility procedures/i],
    generateAnswer: () => {
      return {
        text: `### CAT-III Instrument Landing System (ILS) & Airport Operations
During dense winter radiation fog (December–January) at major hubs like Delhi IGI, Lucknow, and Amritsar:

**ILS Operational Categories**:
• **CAT-I**: Runway Visual Range (RVR) ≥ 550m, Decision Height ≥ 200 ft.
• **CAT-II**: RVR ≥ 300m, Decision Height ≥ 100 ft.
• **CAT-III A**: RVR ≥ 175m, Decision Height < 100 ft.
• **CAT-III B (Installed at Delhi Airport)**:
  - Permits safe precision landings with Runway Visual Range down to **50 meters (zero decision height)** using automated autopilots and specialized ground transponders.

**Why Flights Still Get Delayed**:
1. Takeoff minimums require at least 125m RVR (CAT-III B only governs landings).
2. Non-CAT III certified regional aircraft or non-certified pilots cannot operate.
3. Air traffic separation distances are tripled during Low Visibility Procedures (LVP) for safety.`,
        sources: [
          { title: 'Airports Authority of India (AAI) & DGCA Guidelines', url: 'https://aai.aero', type: 'search' },
        ],
        followUps: [
          'Aviation METAR & TAF report decoding',
          'Visibility: Fog vs Mist vs Haze',
        ],
      };
    },
  },

  // =========================================================================
  // 9. DISASTER EPIDEMIOLOGY & WATER PURIFICATION
  // =========================================================================
  {
    id: 'post_flood_water_purification',
    categoryId: 'disaster_citizen',
    question: 'How can families purify water and prevent waterborne diseases (cholera, typhoid) after floods?',
    shortQuestion: 'Post-flood drinking water purification',
    keywords: ['water purification', 'chlorine', 'boiling', 'flood disease', 'cholera', 'ors', 'disinfection'],
    patterns: [/how to purify water after flood/i, /prevent flood diseases/i, /chlorine tablets/i],
    generateAnswer: () => {
      return {
        text: `### Post-Flood Drinking Water Disinfection & Epidemic Prevention (WHO / Ministry of Health)
Floods frequently submerge municipal pipelines, contaminating potable water with sewage pathogens:

**Purification Methods**:
1. **Rolling Boil (Most Reliable)**:
   • Bring water to a vigorous rolling boil for at least **1 full minute** (3 minutes at high altitude); kills all bacteria, viruses, and amoebic cysts.
2. **Chlorine (Halazone) Tablets**:
   • Add one 0.5g chlorine tablet per 20 liters of clear water; let stand for **30 minutes** before drinking.
3. **Bleaching Powder (Super-Chlorination)**:
   • For well water: Mix 2.5 grams of standard bleaching powder (with 33% available chlorine) per 1,000 liters of water.

**Disease Safeguards**:
• Administer Oral Rehydration Salts (ORS) at the first sign of acute diarrhea.
• Avoid consuming unpeeled raw vegetables or food exposed to flood moisture.`,
        sources: [
          { title: 'National Centre for Disease Control (NCDC)', url: 'https://ncdc.gov.in', type: 'search' },
        ],
        followUps: [
          '72-Hour emergency disaster kit',
          'Urban waterlogging & Flood safety',
        ],
      };
    },
  },
];
