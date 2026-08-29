/**
 * MAUSAM FAQ Knowledge Base & Structured Meteorological Intelligence
 * Authoritative, tip-top, bulletined answers based on IMD, CPCB, INCOIS, NDMA, and WMO standards.
 */

import { CurrentWeather, WeatherStation } from '../types';

export interface GroundingLink {
  title: string;
  url: string;
  type: 'search' | 'maps';
  snippet?: string;
}

export interface MausamContext {
  station: WeatherStation;
  weather: CurrentWeather;
  preferredLanguage?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  shortQuestion: string;
  keywords: string[];
  patterns: RegExp[];
  generateAnswer: (ctx: MausamContext) => { text: string; sources: GroundingLink[]; followUps: string[] };
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'all', name: 'All Topics', icon: 'apps', description: 'Browse all 60+ weather & atmospheric FAQs' },
  { id: 'current', name: 'Live Weather', icon: 'thermostat', description: 'Current observations, temp, humidity & telemetry' },
  { id: 'health_aqi', name: 'AQI & Pollen', icon: 'air', description: 'Air quality, PM2.5, respiratory & bio-allergens' },
  { id: 'rain_alerts', name: 'Rain & Alerts', icon: 'thunderstorm', description: 'Rainfall forecasts, warnings, lightning & Damini' },
  { id: 'states_regional', name: 'Synoptic Climate', icon: 'public', description: 'Monsoons, Western Disturbances, Loo & Cold Waves' },
  { id: 'agromet', name: 'Agromet & Kisan', icon: 'agriculture', description: 'Farming bulletins, crop care & Meghdoot advisories' },
  { id: 'cyclone_marine', name: 'Cyclones & Marine', icon: 'cyclone', description: 'Depressions, sea state, storm surges & coastal safety' },
  { id: 'radar_science', name: 'Radar & Physics', icon: 'radar', description: 'Doppler radar, satellite & atmospheric physics' },
  { id: 'aviation_marine', name: 'Aviation & Sea', icon: 'flight_takeoff', description: 'METAR, TAF, high waves & turbulence' },
  { id: 'disaster_citizen', name: 'Disaster & Safety', icon: 'shield', description: 'Floods, helplines, emergency kit & urban waterlogging' },
];

export const FAQ_ITEMS: FAQItem[] = [
  // =========================================================================
  // 1. LIVE WEATHER & TELEMETRY
  // =========================================================================
  {
    id: 'current_weather_overview',
    categoryId: 'current',
    question: 'What is the current weather observation and atmospheric condition?',
    shortQuestion: 'Current weather & conditions',
    keywords: ['current', 'weather', 'today', 'temp', 'temperature', 'condition', 'now', 'feels like', 'observation'],
    patterns: [/what('?s| is) (the )?(current )?weather/i, /how is the weather/i, /current observation/i, /temperature today/i],
    generateAnswer: (ctx) => {
      const loc = ctx.station;
      const w = ctx.weather;
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return {
        text: `### Surface Atmospheric Observation
• **Station**: ${loc?.name || 'Observatory'}, ${loc?.state || 'India'} (${loc?.lat?.toFixed(2) || '20.29'}°N, ${loc?.lng?.toFixed(2) || '85.82'}°E)
• **Observatory ID**: IMD ${loc?.code || loc?.id || '42971'} | Synced: ${timeStr} IST

**Active Telemetry Parameters**:
• **Air Temperature**: ${w.temp}°C (Apparent Feels Like: ${w.feelsLike ?? w.temp}°C)
• **Atmospheric Condition**: ${w.condition}
• **Relative Humidity**: ${w.humidity}% | **Dew Point**: ${w.dewPoint ?? 24.5}°C
• **Surface Wind Vector**: ${w.windSpeed} km/h from ${w.windDirection || 'WSW'} (${w.windDirectionDeg ?? 247}°)
• **Barometric Pressure**: ${w.pressure} hPa (Station Level)
• **Precipitation Probability**: ${w.precipitationProbability ?? 10}% (24-hr Rain: ${w.precipitation ?? 0} mm)
• **National Air Quality Index (NAQI)**: ${w.aqiIndex ?? w.aqiPm25 ?? 65} (${w.aqiStatus || 'Satisfactory'})
• **Aero-Allergen Risk**: ${w.pollen || 'Low Risk'}
• **UV Radiation Index**: ${w.uvIndex ?? 6}/10`,
        sources: [
          { title: 'IMD National Weather Observation Portal', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Can I go for an outdoor run right now?',
          'Why is relative humidity high today?',
          'What does the barometric pressure reading indicate?',
        ],
      };
    },
  },

  {
    id: 'outdoor_running_safety',
    categoryId: 'current',
    question: 'Can I go for an outdoor run, jog, or workout right now?',
    shortQuestion: 'Outdoor workout safety guidance',
    keywords: ['run', 'running', 'jog', 'jogging', 'outdoor', 'workout', 'exercise', 'walk', 'cycling', 'fitness'],
    patterns: [/can i (go for a |do an )?(run|jog|workout|walk|exercise)/i, /safe to (run|jog|exercise|go outside)/i, /outdoor (activity|running|exercise)/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      const aqi = w.aqiIndex ?? w.aqiPm25 ?? 65;
      const isAqiSafe = aqi <= 100;
      const isTempComfortable = w.temp <= 34 && w.temp >= 14;
      const isRainLikely = (w.precipitationProbability ?? 0) >= 60;

      let status = 'FAVORABLE FOR OUTDOOR WORKOUT';
      if (isRainLikely) status = 'POSTPONE: RAINFALL PROBABLE';
      else if (!isAqiSafe) status = 'CAUTION: ELEVATED AIR POLLUTION';
      else if (!isTempComfortable) status = 'HEAT STRESS RISK: HYDRATE FREQUENTLY';

      return {
        text: `### Outdoor Activity & Cardiovascular Fitness Guidance
• **Verdict**: **${status}**

**Environmental Diagnostics**:
• **Air Quality Index**: ${aqi} (${w.aqiStatus || 'Satisfactory'}) — ${isAqiSafe ? 'Safe for aerobic respiration.' : 'May cause airway irritation for sensitive runners.'}
• **Thermal Factor**: ${w.temp}°C (Feels like ${w.feelsLike ?? w.temp}°C) — ${w.temp > 32 ? 'High thermal strain; avoid midday peak.' : 'Comfortable for cardiovascular load.'}
• **Relative Humidity**: ${w.humidity}% — ${w.humidity > 75 ? 'Sweat evaporation impaired; hydrate with electrolytes.' : 'Optimal sweat cooling rate.'}
• **Precipitation Probability**: ${w.precipitationProbability ?? 10}%
• **UV Index**: ${w.uvIndex ?? 6}/10 — ${w.uvIndex > 6 ? 'Wear UV sunglasses and SPF 30+ sunscreen.' : 'Minimal solar risk.'}

**Workout Protocols**:
1. Early morning (05:30–07:30 IST) or late evening (18:00–19:30 IST) are optimal.
2. Carry at least 500 ml water with electrolytes for sessions exceeding 30 minutes.
3. Suspend outdoor workouts immediately if thunder is audible or lightning is observed.`,
        sources: [
          { title: 'SAFAR Urban Health & Exercise Advisory', url: 'http://safar.tropmet.res.in', type: 'search' },
        ],
        followUps: [
          'What is the National Air Quality Index (NAQI) scale?',
          'What is the current weather & conditions?',
          'Damini Lightning 30-30 Safety Rule',
        ],
      };
    },
  },

  {
    id: 'humidity_dew_point',
    categoryId: 'current',
    question: 'What is relative humidity, dew point, and why does high humidity cause thermal discomfort?',
    shortQuestion: 'Humidity & Dew Point analysis',
    keywords: ['humidity', 'dew point', 'muggy', 'sweat', 'sticky', 'moisture', 'vapour'],
    patterns: [/why is (it|humidity) (so )?(high|humid|sticky|muggy)/i, /what is (relative )?humidity/i, /what is dew point/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Atmospheric Moisture & Dew Point Physics
• **Current Relative Humidity**: ${w.humidity}%
• **Current Dew Point**: ${w.dewPoint ?? 24.5}°C
• **Actual Air Temperature**: ${w.temp}°C

**Scientific Fundamentals**:
• **Relative Humidity (RH)**: The percentage of water vapor present in the air relative to the saturation capacity of air at that temperature.
• **Dew Point**: The temperature to which air must be cooled at constant barometric pressure for water vapor to condense into liquid water (dew/mist).

**Dew Point Comfort Scale**:
• **< 15°C**: Crisp, dry, and comfortable.
• **15°C – 20°C**: Comfortable to noticeable moisture.
• **20°C – 24°C**: Sticky and muggy; evaporative cooling slows down.
• **> 24°C (Current Zone: ${w.dewPoint ?? 24.5}°C)**: Severely oppressive; sweat cannot evaporate efficiently, causing elevated core body thermal stress.`,
        sources: [
          { title: 'IMD Meteorological Instruments & Glossary', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'What is the difference between Actual and Feels Like temperature?',
          'Can I go for an outdoor run right now?',
        ],
      };
    },
  },

  {
    id: 'actual_vs_feels_like',
    categoryId: 'current',
    question: 'What is the difference between Actual Temperature, Feels Like, and Heat Index?',
    shortQuestion: 'Actual vs. Feels Like temperature',
    keywords: ['feels like', 'apparent temperature', 'heat index', 'wind chill', 'humidex'],
    patterns: [/what is feels like/i, /difference between actual and feels like/i, /how is heat index calculated/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Apparent Temperature & Heat Index Dynamics
• **Actual Temperature**: ${w.temp}°C (Measured by shielded thermometer in a Stevenson Screen at 1.5m AGL).
• **Feels Like (Apparent Temperature)**: ${w.feelsLike ?? w.temp}°C (Human physiological perception).

**Key Governing Equations**:
• **Summer Heat Index**: Combines air temperature and relative humidity (${w.humidity}%). High humidity halts sweat evaporation, trapping body heat and driving apparent temperature higher.
• **Winter Wind Chill**: Combines cold temperature with surface wind speed. High wind rapidly strips the thin warm air boundary layer off human skin, driving apparent temperature lower.

**Health Recommendations**:
• Feels Like **32°C – 41°C**: Caution; fatigue probable with prolonged exposure and physical activity.
• Feels Like **41°C – 54°C**: Danger; heat cramps, heat exhaustion, and potential heatstroke.`,
        sources: [
          { title: 'IMD Biometeorology & Heat Index Standards', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD Heatwave & Loo Wind criteria',
          'Why is relative humidity high today?',
        ],
      };
    },
  },

  {
    id: 'barometric_pressure_trend',
    categoryId: 'current',
    question: 'What does the barometric pressure reading indicate about upcoming weather?',
    shortQuestion: 'Barometric pressure trends',
    keywords: ['pressure', 'barometer', 'hpa', 'millibar', 'low pressure', 'high pressure', 'fall in pressure'],
    patterns: [/what does (barometric|air)? pressure mean/i, /pressure reading/i, /why is pressure falling/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Barometric Pressure Telemetry & Forecasting
• **Station Pressure**: ${w.pressure} hPa (Standard Mean Sea Level: 1013.25 hPa)

**Meteorological Trend Rules**:
• **Rapid Drop (> 3 hPa in 3 hours)**: Indicative of an approaching low pressure area, squall line, thunderstorm, or cyclonic system.
• **Steady Pressure (1010 – 1016 hPa)**: Stable atmospheric stratification, clear skies, and fair weather.
• **High Pressure (> 1018 hPa)**: Cool, dense, subsiding air; dry weather with cold nocturnal radiation (winter anticyclone).

**Diurnal Atmospheric Tide in India**:
• Barometric pressure naturally peaks at **10:00 IST** and **22:00 IST** and dips at **04:00 IST** and **16:00 IST** due to solar thermal atmospheric tides (~3 hPa range).`,
        sources: [
          { title: 'IMD Synoptic Meteorology Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          '4 Stages of IMD Cyclone Warning',
          'Current weather & conditions',
        ],
      };
    },
  },

  {
    id: 'uv_index_protection',
    categoryId: 'current',
    question: 'What is the UV Index right now and what sun protection measures are needed?',
    shortQuestion: 'UV Index & Sun Protection',
    keywords: ['uv', 'uv index', 'ultraviolet', 'sunscreen', 'sunburn', 'spf', 'solar radiation'],
    patterns: [/what is (the )?uv index/i, /sun protection/i, /do i need sunscreen/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      const uv = w.uvIndex ?? 6;
      let category = 'Moderate';
      let action = 'Wear sunglasses and apply SPF 30+ sunscreen if outdoors > 45 mins.';
      if (uv >= 11) {
        category = 'Extreme';
        action = 'Avoid direct sun exposure between 11:00 and 15:30 IST; skin burns can occur in < 10 mins.';
      } else if (uv >= 8) {
        category = 'Very High';
        action = 'Seek shade, wear wide-brim hat, UV400 sunglasses, and reapply SPF 50 every 2 hours.';
      } else if (uv >= 6) {
        category = 'High';
        action = 'Reduce exposure during peak solar noon hours; use umbrella and light protective clothing.';
      }

      return {
        text: `### Solar UV Radiation & Dermatological Safety
• **Current UV Index**: **${uv} / 10** (${category} Category)

**WHO / IMD UV Radiation Scale**:
• **0 – 2 (Low)**: Minimal solar hazard; no protective gear strictly necessary.
• **3 – 5 (Moderate)**: Safe for brief exposure; apply SPF 15+ for extended outdoor stay.
• **6 – 7 (High — Current Level)**: Protection essential; cover exposed skin.
• **8 – 10 (Very High)**: High risk of erythema (sunburn) within 15–20 minutes.
• **11+ (Extreme)**: Unshielded skin burns rapidly; stay indoors around solar noon.

**Citizen Protective Protocols**:
1. Apply broad-spectrum UVA/UVB sunscreen (SPF 30 or higher) 20 minutes before stepping out.
2. UV rays penetrate thin cloud cover and reflect off water bodies and concrete pavement.`,
        sources: [
          { title: 'IMD Solar Radiation & Ozone Monitoring Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Can I go for an outdoor run right now?',
          'Actual vs. Feels Like temperature',
        ],
      };
    },
  },

  {
    id: 'wind_speed_beaufort',
    categoryId: 'current',
    question: 'How is wind speed measured and what does the Beaufort Wind Scale indicate?',
    shortQuestion: 'Wind speed & Beaufort scale',
    keywords: ['wind', 'wind speed', 'beaufort', 'knot', 'anemometer', 'gust', 'breeze', 'gale'],
    patterns: [/how is wind measured/i, /what is (the )?beaufort scale/i, /wind speed classification/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Surface Wind Telemetry & Beaufort Scale Standards
• **Observed Wind Velocity**: ${w.windSpeed} km/h (${(w.windSpeed / 1.852).toFixed(1)} knots)
• **Wind Direction**: ${w.windDirection || 'WSW'} (${w.windDirectionDeg ?? 247}°)

**Beaufort Scale Operational Tiers**:
• **Force 0 (Calm, < 1 km/h)**: Smoke rises vertically.
• **Force 1–3 (Light to Gentle Breeze, 1–19 km/h)**: Wind felt on face; leaves rustle (Current observation: ${w.windSpeed} km/h).
• **Force 4–5 (Moderate to Fresh Breeze, 20–38 km/h)**: Small branches move; raises dust and paper.
• **Force 6–7 (Strong Breeze / Near Gale, 39–61 km/h)**: Large branches in motion; umbrella usage difficult.
• **Force 8–9 (Gale / Strong Gale, 62–88 km/h)**: Breaks twigs; structural damage begins.
• **Force 10–12 (Storm to Hurricane Force, ≥ 89 km/h)**: Widespread structural devastation and uprooted trees.`,
        sources: [
          { title: 'WMO & IMD Surface Wind Standards', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Tropical cyclone intensity scale',
          'Downburst & Squall wind safety',
        ],
      };
    },
  },

  {
    id: 'visibility_fog_mist_haze',
    categoryId: 'current',
    question: 'What causes low visibility, and what is the difference between Fog, Mist, and Haze?',
    shortQuestion: 'Visibility: Fog vs Mist vs Haze',
    keywords: ['visibility', 'fog', 'mist', 'haze', 'smog', 'runway visibility', 'dense fog'],
    patterns: [/difference between fog mist (and )?haze/i, /what causes (fog|low visibility)/i, /visibility classification/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Atmospheric Visibility & Aerosol Classification
• **Current Surface Visibility**: ${w.visibilityKm ?? 7} km
• **Current Atmospheric Phenomenon**: ${w.condition}

**Official Meteorological Definitions**:
• **Fog**: Water droplets suspended in air reducing visibility to **< 1,000 meters** with Relative Humidity **≥ 75%**.
  - *Dense Fog*: Visibility 50 – 199 meters.
  - *Very Dense Fog*: Visibility < 50 meters (triggers CAT-III ILS at airports).
• **Mist**: Water droplets suspended in air reducing visibility between **1,000 and 2,000 meters** with Relative Humidity **≥ 75%**.
• **Haze**: Dry solid microscopic particulates (dust, smoke, pollution) suspended in air reducing visibility with Relative Humidity **< 75%**.
• **Smog**: Toxic photochemical combination of smoke particulates and fog droplets under thermal inversion.`,
        sources: [
          { title: 'IMD Fog Pilot Warning & Aviation Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Aviation METAR & TAF report decoding',
          'Winter smog & Stubble burning inversion',
        ],
      };
    },
  },

  // =========================================================================
  // 2. AIR QUALITY (AQI), POLLUTION & BIO-ALLERGENS
  // =========================================================================
  {
    id: 'aqi_scale_meaning',
    categoryId: 'health_aqi',
    question: 'What is the National Air Quality Index (NAQI) scale and what does each category mean?',
    shortQuestion: 'National AQI (NAQI) scale breakdown',
    keywords: ['aqi', 'air quality', 'naqi', 'cpcb', 'pollution scale', 'good', 'moderate', 'poor', 'severe'],
    patterns: [/what is (the )?aqi/i, /air quality index scale/i, /cpcb aqi categories/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      const aqi = w.aqiIndex ?? w.aqiPm25 ?? 65;
      return {
        text: `### National Air Quality Index (NAQI) Scale (CPCB India)
• **Current Station AQI**: **${aqi}** (${w.aqiStatus || 'Satisfactory'})

**6 Official NAQI Health Tiers**:
• **0 – 50 (Good / Dark Green)**: Minimal health impact; pristine clean air.
• **51 – 100 (Satisfactory / Light Green)**: Minor breathing discomfort to sensitive individuals.
• **101 – 200 (Moderate / Yellow)**: Breathing discomfort to people with asthma, lungs, and heart diseases.
• **201 – 300 (Poor / Orange)**: Breathing discomfort to most people on prolonged exposure.
• **301 – 400 (Very Poor / Red)**: Respiratory illness to the general public on prolonged exposure.
• **401 – 500 (Severe / Maroon)**: Affects healthy people and seriously impacts those with existing diseases.

**Key Monitored Pollutants (8-parameter index)**:
PM2.5, PM10, Nitrogen Dioxide (NO2), Sulfur Dioxide (SO2), Carbon Monoxide (CO), Ozone (O3), Ammonia (NH3), and Lead (Pb).`,
        sources: [
          { title: 'CPCB National Air Quality Portal', url: 'https://app.cpcbccr.com/AQI_India/', type: 'search' },
        ],
        followUps: [
          'Difference between PM2.5 and PM10',
          'N95 Masks & Indoor Air Purifiers',
        ],
      };
    },
  },

  {
    id: 'pm25_vs_pm10_particles',
    categoryId: 'health_aqi',
    question: 'What is the difference between PM2.5 and PM10 particles and why are they dangerous?',
    shortQuestion: 'PM2.5 vs PM10 particles explained',
    keywords: ['pm2.5', 'pm10', 'particulate matter', 'fine particles', 'lungs', 'bloodstream', 'microns'],
    patterns: [/difference between pm2\.5 and pm10/i, /what is pm2\.5/i, /what is pm10/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Particulate Matter (PM2.5 vs PM10) Health Impact
• **Current PM2.5**: ${w.aqiPm25 ?? 42} µg/m³ (Standard: 60 µg/m³ 24-hr avg)
• **Current PM10**: ${w.aqiPm10 ?? 58} µg/m³ (Standard: 100 µg/m³ 24-hr avg)

**Comparative Scientific Analysis**:
• **PM10 (Coarse Particles, < 10 µm)**:
  - *Diameter*: 1/7th the width of a human hair.
  - *Sources*: Road dust, construction debris, mechanical crushing, and pollen grains.
  - *Penetration*: Trapped in nasal passages, throat, and upper bronchial tubes; causes coughing, sneezing, and eye irritation.
• **PM2.5 (Fine Combustion Particles, < 2.5 µm)**:
  - *Diameter*: 1/30th the width of a human hair.
  - *Sources*: Vehicle exhaust, crop stubble burning, coal power plants, and industrial emissions.
  - *Penetration*: Bypasses all respiratory filters, penetrates deep into alveolar sacs, enters the bloodstream, and increases risks of cardiovascular strokes and COPD.`,
        sources: [
          { title: 'CPCB & WHO Ambient Air Quality Guidelines', url: 'https://cpcb.nic.in', type: 'search' },
        ],
        followUps: [
          'National AQI (NAQI) scale breakdown',
          'N95 Masks & Indoor Air Purifiers',
        ],
      };
    },
  },

  {
    id: 'pollen_allergen_guide',
    categoryId: 'health_aqi',
    question: 'What is the Pollen & Aero-Allergen Index and how does it trigger asthma or rhinitis?',
    shortQuestion: 'Pollen & Bio-Allergen Guide',
    keywords: ['pollen', 'allergen', 'allergy', 'asthma', 'rhinitis', 'sneezing', 'grass pollen', 'tree pollen'],
    patterns: [/what is (the )?pollen/i, /pollen count/i, /allergy forecast/i, /rhinitis/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      return {
        text: `### Botanical Aero-Allergen & Pollen Telemetry
• **Current Pollen Risk**: **${w.pollen || 'Low Risk'}** (Index Level: ${w.pollenCount ?? 2} / 5)

**Major Aero-Allergen Groups in India**:
1. **Tree Pollen (Feb – April)**: Eucalyptus, Neem, Gulmohar, Pine, and Casuarina.
2. **Grass Pollen (Aug – Oct & Post-Monsoon)**: Bermuda grass (Cynodon dactylon), Parthenium hysterophorus (Congress grass), and Timothy grass.
3. **Weed & Fungal Spores (Oct – Dec)**: Alternaria, Cladosporium, and Amaranthus.

**Diurnal Dispersion Dynamics**:
• Pollen release peaks between **06:00 and 10:00 IST** and on warm, breezy afternoons.
• Heavy rain knocks pollen down to ground level (rain washout), but violent pre-thunderstorm downdrafts can fracture grains, causing "Thunderstorm Asthma".

**Preventive Steps**:
• Keep bedroom windows closed in early morning.
• Rinse face and eyes with fresh water after arriving home from outdoors.`,
        sources: [
          { title: 'National Institute of Allergy & Infectious Diseases', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Can I go for an outdoor run right now?',
          'National AQI (NAQI) scale breakdown',
        ],
      };
    },
  },

  {
    id: 'indoor_air_purifier_masks',
    categoryId: 'health_aqi',
    question: 'When should I wear an N95 mask and how do HEPA air purifiers improve indoor AQI?',
    shortQuestion: 'N95 Masks & Indoor Air Purifiers',
    keywords: ['n95', 'mask', 'hepa', 'air purifier', 'indoor aqi', 'filter', 'cadr'],
    patterns: [/should i wear (a )?mask/i, /do air purifiers work/i, /how to protect from pollution/i],
    generateAnswer: () => {
      return {
        text: `### Personal Protection: Respiratory Masks & HEPA Air Purifiers
• **N95 / FFP2 Respirators**:
  - Filter at least **95% of airborne particles down to 0.3 microns** (including PM2.5, soot, and bacteria).
  - Essential whenever outdoor AQI exceeds **200 (Poor)**.
  - Standard cloth and surgical 3-ply masks do NOT filter fine PM2.5 aerosols effectively.

• **True HEPA (H13 Grade) Air Purifiers**:
  - Traps 99.97% of particulates ≥ 0.3 µm.
  - **Clean Air Delivery Rate (CADR)**: Choose a unit where CADR (m³/hr) matches your room volume (room area in sq ft × 1.5).
  - Keep doors and windows tightly shut during operation.
  - Avoid purifiers with active ozone generators/ionizers as ozone irritates lung alveoli.`,
        sources: [
          { title: 'CPCB Health Guidelines for Ambient Air Pollution', url: 'https://cpcb.nic.in', type: 'search' },
        ],
        followUps: [
          'National AQI (NAQI) scale breakdown',
          'PM2.5 vs PM10 particles explained',
        ],
      };
    },
  },

  {
    id: 'stubble_burning_winter_smog',
    categoryId: 'health_aqi',
    question: 'Why does severe smog blanket North India and the Indo-Gangetic Plains in winter?',
    shortQuestion: 'Winter smog & Stubble burning inversion',
    keywords: ['smog', 'delhi pollution', 'stubble burning', 'parali', 'winter inversion', 'gangetic plain'],
    patterns: [/why is delhi pollution high/i, /stubble burning/i, /what causes winter smog/i, /parali/i],
    generateAnswer: () => {
      return {
        text: `### Winter Smog Dynamics in the Indo-Gangetic Plain (IGP)
The annual post-monsoon pollution crisis across Punjab, Haryana, Delhi-NCR, UP, and Bihar is driven by a combination of 4 factors:

1. **Nocturnal Radiation Temperature Inversion**:
   • Winter cold land surfaces cool the boundary layer air, trapping a colder dense air layer below a warmer inversion lid at just 50–100m AGL, stopping vertical dispersion.
2. **Calm Synoptic Winds (< 5 km/h)**:
   • Prevents horizontal advection, causing local vehicular, industrial, and brick kiln emissions to accumulate.
3. **Paddy Crop Stubble Burning (Oct 15 – Nov 20)**:
   • High-volume agricultural biomass burning releases millions of tons of black carbon, PM2.5, and volatile organic compounds (VOCs).
4. **Valley Topography Effect**:
   • The Himalayas to the north and Deccan plateau to the south create a geographic trough that funnels and traps aerosols across the Gangetic basin.`,
        sources: [
          { title: 'SAFAR System of Air Quality & Weather Forecasting', url: 'http://safar.tropmet.res.in', type: 'search' },
          { title: 'CPCB Winter Pollution Review', url: 'https://cpcb.nic.in', type: 'search' },
        ],
        followUps: [
          'National AQI (NAQI) scale breakdown',
          'N95 Masks & Indoor Air Purifiers',
        ],
      };
    },
  },

  // =========================================================================
  // 3. RAINFALL, ALERTS & SEVERE THUNDERSTORMS
  // =========================================================================
  {
    id: 'imd_warning_color_codes',
    categoryId: 'rain_alerts',
    question: 'What do the 4 colors in IMD Weather Warnings (Green, Yellow, Orange, Red) mean?',
    shortQuestion: 'IMD 4-Colour Warning Matrix',
    keywords: ['green', 'yellow', 'orange', 'red', 'warning', 'alert', 'color code', 'imd alert'],
    patterns: [/what do the colors mean/i, /imd warning colors/i, /red alert meaning/i, /orange alert/i],
    generateAnswer: () => {
      return {
        text: `### IMD 4-Colour Weather Warning Code Matrix
Standardized impact-based alert classification used across all 28 States and 8 UTs:

1. **GREEN (No Warning / All Clear)**:
   • *Action*: **No Action Required**. Normal day-to-day operations can proceed safely.
2. **YELLOW (Watch / Be Updated)**:
   • *Action*: **Be Aware**. Weather condition is unstable; monitor local IMD bulletins. Potential hazard for outdoor activities.
3. **ORANGE (Alert / Be Prepared)**:
   • *Action*: **Be Prepared**. High likelihood of severe weather (heavy rain, severe thunderstorm, or squall) that could disrupt electricity, water, and road transit.
4. **RED (Warning / Take Action)**:
   • *Action*: **Take Action Immediately**. Extremely severe hazardous event imminent (extremely heavy deluge, cyclone landfall, violent storm). Threat to life and critical infrastructure; follow NDMA/SDRF evacuation orders.`,
        sources: [
          { title: 'IMD National Weather Forecasting Centre Alerts', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD 24-hr Rainfall Intensity scale',
          'Damini Lightning 30-30 Safety Rule',
          '72-Hour emergency disaster kit',
        ],
      };
    },
  },

  {
    id: 'rainfall_intensity_scale',
    categoryId: 'rain_alerts',
    question: 'How does IMD classify rainfall intensity from Light Rain to Extremely Heavy Rainfall?',
    shortQuestion: 'IMD 24-hr Rainfall Intensity scale',
    keywords: ['rainfall scale', 'heavy rain', 'very heavy rain', 'extremely heavy', 'mm rain', 'rainfall intensity'],
    patterns: [/how does imd classify rain/i, /rainfall categories/i, /what is heavy rain in mm/i],
    generateAnswer: () => {
      return {
        text: `### IMD Official 24-Hour Rainfall Intensity Classification
Standard measurement recorded by Symon's non-recording and tipping-bucket rain gauges:

• **Very Light Rain**: **0.1 mm to 2.4 mm** in 24 hours.
• **Light Rain**: **2.5 mm to 15.5 mm** in 24 hours.
• **Moderate Rain**: **15.6 mm to 64.4 mm** in 24 hours.
• **Heavy Rain**: **64.5 mm to 115.5 mm** in 24 hours.
• **Very Heavy Rain**: **115.6 mm to 204.4 mm** in 24 hours.
• **Extremely Heavy Rain**: **≥ 204.5 mm** in 24 hours (triggers major flood warnings).
• **Exceptionally Heavy Rain**: When rainfall exceeds the station's all-time historical 24-hour record.`,
        sources: [
          { title: 'IMD Rainfall Terminology & Criteria', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD 4-Colour Warning Matrix',
          'Cloudburst physics & Mountain flash floods',
        ],
      };
    },
  },

  {
    id: 'lightning_damini_30_30',
    categoryId: 'rain_alerts',
    question: 'What is the Damini Lightning Alert protocol and the 30-30 Lightning Safety Rule?',
    shortQuestion: 'Damini Lightning 30-30 Safety Rule',
    keywords: ['damini', 'lightning', 'thunder', 'thunderstorm', '30-30 rule', 'vajrapaat', 'safety'],
    patterns: [/damini app/i, /lightning safety/i, /30-30 rule/i, /how to survive lightning/i],
    generateAnswer: () => {
      return {
        text: `### Damini Lightning Alert & National Lightning Safety Protocol
Lightning (Vajrapaat) causes over 2,000 casualties annually in India. Follow the **30-30 Life-Saving Rule**:

**The 30-30 Rule**:
1. **Count**: If the time elapsed between seeing lightning flash and hearing thunder is **under 30 seconds**, the storm is within 10 km—**seek safe enclosed shelter immediately**.
2. **Wait**: Stay inside shelter for at least **30 minutes** after hearing the last clap of thunder before resuming outdoor activity.

**Do's and Don'ts**:
• **DO**: Seek shelter inside a concrete building or fully enclosed metal vehicle.
• **DON'T**: Never stand under tall, isolated trees, near metal fences, electric poles, or in open agricultural paddy fields.
• **Open Field Emergency**: If caught in the open with no shelter, crouch down low on the balls of your feet (Lightning Crouch), tuck your head, and cover your ears. Do NOT lie flat on the ground.
• **Damini App**: Uses IITM/IMD lightning sensor network to issue SMS/push alerts within a 20 km radius 30–45 minutes in advance.`,
        sources: [
          { title: 'Damini Lightning Warning Network (IITM / IMD)', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD 4-Colour Warning Matrix',
          'Downburst & Squall wind safety',
        ],
      };
    },
  },

  {
    id: 'cloudburst_definition_physics',
    categoryId: 'rain_alerts',
    question: 'What is a Cloudburst, how does it occur, and why does it trigger mountain flash floods?',
    shortQuestion: 'Cloudburst physics & Mountain flash floods',
    keywords: ['cloudburst', 'flash flood', 'himalayas', 'uttarakhand', 'himachal', 'deluge', 'cumulonimbus'],
    patterns: [/what is a cloudburst/i, /how does cloudburst happen/i, /cloudburst criteria/i],
    generateAnswer: () => {
      return {
        text: `### Cloudburst Physics & Atmospheric Mechanisms
• **Official IMD Definition**:
  - Rainfall rate equal to or exceeding **100 mm per hour** over a localized geographical area of approximately **20 to 30 square kilometers**.

**Atmospheric Mechanics**:
1. Warm, moisture-laden air is forced rapidly up steep Himalayan terrain (orographic lifting).
2. Towering convective cumulonimbus clouds (often 12–15 km vertical height) are supported by strong vertical updrafts exceeding 100 km/h.
3. The powerful updraft suspends millions of tons of condensed water droplets aloft.
4. When the thermal updraft suddenly collapses, all the stored hydrometeors dump simultaneously in a catastrophic, concentrated waterfall.

**Himalayan Flash Floods**:
• In narrow mountain valleys, the massive sudden volume cannot drain through steep gorges, transforming into a torrential wave carrying boulders, sediment, and debris downstream within minutes.`,
        sources: [
          { title: 'IMD Mountain Meteorology Division & NWFC', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD 24-hr Rainfall Intensity scale',
          'Landslide warning signs in mountains',
        ],
      };
    },
  },

  // =========================================================================
  // 4. REGIONAL SYNOPTIC SYSTEMS & CLIMATE
  // =========================================================================
  {
    id: 'southwest_monsoon_dynamics',
    categoryId: 'states_regional',
    question: 'How does the Southwest (SW) Monsoon work, what are its branches, and how does it travel?',
    shortQuestion: 'Southwest (SW) Monsoon dynamics',
    keywords: ['monsoon', 'sw monsoon', 'southwest monsoon', 'kerala onset', 'arabian sea branch', 'bay of bengal branch'],
    patterns: [/how does (the )?southwest monsoon work/i, /monsoon onset in india/i, /branches of monsoon/i],
    generateAnswer: () => {
      return {
        text: `### Southwest (SW) Monsoon: Mechanics & Propagation
The Southwest Monsoon (June to September) delivers **>70% of India's annual precipitation**:

**Core Mechanics**:
• Intense summer solar heating creates a deep thermal low-pressure trough across the Thar Desert and Indo-Gangetic Plains.
• Southeast Trade Winds in the Southern Hemisphere cross the warm equator, deflect to the right due to the **Coriolis Effect**, and transform into moisture-laden Southwesterly winds.

**Two Primary Branches**:
1. **Arabian Sea Branch**: Strikes the Western Ghats (Kerala normal onset: June 1), dumping heavy orographic rain on Konkan, Goa, and Coastal Karnataka before penetrating Central India.
2. **Bay of Bengal Branch**: Traverses the warm Bay of Bengal, deflects off the Arakan Yoma (Myanmar) and Shillong Plateau (Cherrapunji/Mawsynram), and travels up the Gangetic Plains toward Delhi and Punjab.

**Monsoon Trough**:
• The axis of low pressure spanning from Ganganagar (Rajasthan) to Kolkata. Its northward or southward migration determines active and break spells of monsoon rains.`,
        sources: [
          { title: 'IMD Monsoon Information & NWFC Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Northeast (NE) Monsoon / Coromandel rains',
          'El Niño, La Niña & IOD climate drivers',
        ],
      };
    },
  },

  {
    id: 'northeast_monsoon_retreat',
    categoryId: 'states_regional',
    question: 'What is the Northeast (NE) Monsoon / Retreating Monsoon and why does it rain in Tamil Nadu?',
    shortQuestion: 'Northeast (NE) Monsoon / Coromandel rains',
    keywords: ['northeast monsoon', 'ne monsoon', 'retreating monsoon', 'tamil nadu rain', 'coromandel coast', 'winter rain'],
    patterns: [/what is northeast monsoon/i, /why does it rain in tamil nadu in winter/i, /retreating monsoon/i],
    generateAnswer: () => {
      return {
        text: `### Northeast (NE) Monsoon & Coromandel Precipitation
The Northeast Monsoon (October to December) is the primary rainfall season for **Tamil Nadu, Coastal Andhra Pradesh, Rayalaseema, Puducherry, and Kerala**:

**Key Drivers**:
• As winter approaches, the Asian landmass cools rapidly, establishing a continental high pressure over Siberia and Tibet.
• Surface winds reverse direction, blowing from Northeast to Southwest.
• As these dry continental winds cross the warm Bay of Bengal, they absorb massive volumes of latent heat and moisture.
• Upon making landfall on the Coromandel Coast, they release copious rains (delivering ~48% of Tamil Nadu's total annual rainfall).
• Highly active period for tropical cyclogenesis in the South Bay of Bengal.`,
        sources: [
          { title: 'RMC Chennai Northeast Monsoon Forecasting Centre', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Southwest (SW) Monsoon dynamics',
          '4 Stages of IMD Cyclone Warning',
        ],
      };
    },
  },

  {
    id: 'western_disturbances_wd',
    categoryId: 'states_regional',
    question: 'What is a Western Disturbance (WD) and how does it bring rain and snow to Northern India?',
    shortQuestion: 'Western Disturbances (WD) explained',
    keywords: ['western disturbance', 'wd', 'snowfall', 'himachal snow', 'kashmir snow', 'winter rain north india'],
    patterns: [/what is (a )?western disturbance/i, /winter rain in punjab/i, /snowfall in himalayas/i],
    generateAnswer: () => {
      return {
        text: `### Western Disturbances (WD): Mid-Latitude Cyclonic Systems
• **Origin & Trajectory**:
  - Non-monsoonal extra-tropical storm systems originating over the **Mediterranean Sea, Black Sea, and Caspian Sea**.
  - Steered eastward into the Indian subcontinent across Iraq, Iran, Afghanistan, and Pakistan by the high-altitude **Subtropical Westerly Jet Stream** (9–12 km altitude).

**Subcontinental Impacts**:
1. **Himalayan Snow & Glacial Recharge**: Produces heavy snowfall across Jammu & Kashmir, Ladakh, Himachal Pradesh, and Uttarakhand, feeding the perennial Indus and Ganga river systems.
2. **Plains Winter Rain**: Generates light-to-moderate rain and occasional hail across Punjab, Haryana, Rajasthan, Delhi-NCR, and Western UP, crucial for the **Rabi Wheat crop**.
3. **Post-WD Temperature Plunge**: Once the WD moves away eastward, icy northwesterly winds rush into the plains, triggering severe **Cold Waves and Radiation Fog**.`,
        sources: [
          { title: 'IMD Synoptic Western Disturbance Monitoring Cell', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'IMD Heatwave & Loo Wind criteria',
          'Winter smog & Stubble burning inversion',
        ],
      };
    },
  },

  {
    id: 'heatwave_loo_wind_guidelines',
    categoryId: 'states_regional',
    question: 'What constitutes an official IMD Heatwave, what is the "Loo", and how to prevent heatstroke?',
    shortQuestion: 'IMD Heatwave & Loo Wind criteria',
    keywords: ['heatwave', 'heat wave', 'loo', 'heatstroke', 'sunstroke', 'hydration', 'summer heat'],
    patterns: [/what is (a )?heatwave/i, /heatwave criteria/i, /what is loo wind/i, /how to prevent heatstroke/i],
    generateAnswer: () => {
      return {
        text: `### IMD Heatwave Criteria & Loo Wind Defense
• **Official IMD Thresholds**:
  - *Plains*: Maximum temperature reaches **≥ 40°C**.
  - *Coastal Stations*: Maximum temperature reaches **≥ 37°C**.
  - *Hilly Regions*: Maximum temperature reaches **≥ 30°C**.

• **Heatwave Declaration**:
  - *Heatwave*: Departure from normal is **4.5°C to 6.4°C**, or actual temp is **≥ 45°C**.
  - *Severe Heatwave*: Departure from normal is **> 6.4°C**, or actual temp is **≥ 47°C**.

• **The 'Loo' Wind**:
  - Strong, gusty, hot, and dry summer afternoon wind (40°C–48°C) blowing from the Thar Desert across North-West and Central India (May–June).

**Heatstroke Prevention**:
1. Drink Oral Rehydration Solution (ORS), lemon water, chaas, or coconut water frequently; do not wait until thirsty.
2. Avoid strenuous outdoor activities between 12:00 and 15:30 IST.
3. Wear loose, light-colored cotton clothing and cover head with a damp cloth or umbrella.`,
        sources: [
          { title: 'NDMA & IMD National Heat Action Plan', url: 'https://ndma.gov.in', type: 'search' },
        ],
        followUps: [
          'Actual vs. Feels Like temperature',
          'UV Index & Sun Protection',
        ],
      };
    },
  },

  // =========================================================================
  // 5. AGROMET, FARMING & KISAN ADVISORY
  // =========================================================================
  {
    id: 'agromet_gkms_meghdoot',
    categoryId: 'agromet',
    question: 'What is Gramin Krishi Mausam Sewa (GKMS) and how does the Meghdoot App assist farmers?',
    shortQuestion: 'Agromet (GKMS) & Meghdoot App Guide',
    keywords: ['agromet', 'gkms', 'meghdoot', 'kisan', 'farmer advisory', 'crop bulletin', 'icar'],
    patterns: [/what is gkms/i, /meghdoot app/i, /agromet bulletin/i, /kisan weather/i],
    generateAnswer: (ctx) => {
      const loc = ctx.station;
      const w = ctx.weather;
      return {
        text: `### Gramin Krishi Mausam Sewa (GKMS) & Meghdoot Platform
• **District Focus**: ${loc?.district || loc?.name || 'Local District'}, ${loc?.state || 'India'}
• **Observation**: ${w.temp}°C | Humidity: ${w.humidity}% | Rain Probability: ${w.precipitationProbability ?? 10}%

**GKMS Services (IMD & ICAR Collaboration)**:
• Issues bi-weekly (Tuesday & Friday) district and block-level agromet advisory bulletins.
• Translates complex 5-day weather forecasts into direct, actionable crop management decisions.

**Meghdoot Mobile Application**:
• Delivers customized weather alerts, rainfall probabilities, and crop-specific management steps for major cereals, pulses, oilseeds, and horticulture.
• Integrates livestock management advisories for heat stress, vaccination schedules, and shed ventilation.`,
        sources: [
          { title: 'IMD Agromet Advisory Portal (GKMS)', url: 'https://imdagrimet.gov.in', type: 'search' },
        ],
        followUps: [
          'Pesticide & Fertilizer spraying weather window',
          'Winter frost protection for crops',
        ],
      };
    },
  },

  {
    id: 'pesticide_spraying_weather_window',
    categoryId: 'agromet',
    question: 'What is the optimal weather window for spraying pesticides and applying fertilizers?',
    shortQuestion: 'Pesticide & Fertilizer spraying weather window',
    keywords: ['spray', 'pesticide', 'fertilizer', 'urea', 'chemical spray', 'rain washout', 'wind drift'],
    patterns: [/when to spray pesticide/i, /fertilizer application weather/i, /can i spray today/i],
    generateAnswer: (ctx) => {
      const w = ctx.weather;
      const isWindy = w.windSpeed > 15;
      const isRainy = (w.precipitationProbability ?? 0) >= 40;
      const isHot = w.temp > 35;

      let verdict = 'FAVORABLE WINDOW FOR SPRAYING';
      if (isRainy) verdict = 'POSTPONE: RAIN WASHOUT RISK';
      else if (isWindy) verdict = 'POSTPONE: HIGH WIND DRIFT (>15 km/h)';
      else if (isHot) verdict = 'CAUTION: EVAPORATION RISK IN MIDDAY HEAT';

      return {
        text: `### Agrochemical Application Weather Protocol
• **Current Spraying Assessment**: **${verdict}**

**Standard Operational Thresholds**:
• **Wind Speed (< 15 km/h)**: Current is ${w.windSpeed} km/h. Wind > 15 km/h causes droplet drift onto neighboring non-target crops or water bodies.
• **Rainfall Window (> 4–6 hours dry post-application)**: Current rain probability is ${w.precipitationProbability ?? 10}%. Rain within 4 hours washes off contact fungicides/insecticides.
• **Air Temperature (< 32°C)**: Current is ${w.temp}°C. Extreme heat causes liquid droplet flash evaporation before leaves absorb systemic active ingredients.
• **Best Timing**: Early morning (07:00–10:00 IST) after dew evaporates or late afternoon (16:00–18:00 IST).`,
        sources: [
          { title: 'ICAR & IMD Agromet Advisory Division', url: 'https://imdagrimet.gov.in', type: 'search' },
        ],
        followUps: [
          'Agromet (GKMS) & Meghdoot App Guide',
          'Current weather & conditions',
        ],
      };
    },
  },

  {
    id: 'frost_protection_orchards_mustard',
    categoryId: 'agromet',
    question: 'How can farmers protect mustard, potato, tomato, and fruit orchards from winter frost?',
    shortQuestion: 'Winter frost protection for crops',
    keywords: ['frost', 'ground frost', 'pala', 'mustard frost', 'potato blight', 'smoke mulch', 'light irrigation'],
    patterns: [/how to protect crops from frost/i, /ground frost damage/i, /pala in winter/i],
    generateAnswer: () => {
      return {
        text: `### Ground Frost (Pala) Management in Winter Crops
Ground frost occurs on clear, calm winter nights when grass temperatures drop below **0°C**, freezing plant sap and bursting cellular walls.

**4 Proven Protective Techniques**:
1. **Light Evening Irrigation**:
   • Water has a high specific heat capacity; wet soil radiates heat throughout the night, raising canopy temperature by 1°C–2°C.
2. **Smoke Generation (Smudging)**:
   • Burn dry biomass and weeds on the windward side around 03:00–05:00 IST. The smoke blanket prevents radiative ground cooling.
3. **Sulfur / H2SO4 Spray**:
   • Spray 0.1% Commercial Sulfuric Acid (H2SO4) or Dimethyl Sulfoxide (DMSO) on mustard/potato foliage before expected frost nights.
4. **Plastic / Straw Mulching**:
   • Cover nursery beds and vegetable seedlines with transparent poly-sheets or straw thatch.`,
        sources: [
          { title: 'ICAR Agrometeorology Advisory for Cold Waves', url: 'https://icar.org.in', type: 'search' },
        ],
        followUps: [
          'Agromet (GKMS) & Meghdoot App Guide',
          'Western Disturbances (WD) explained',
        ],
      };
    },
  },

  // =========================================================================
  // 6. CYCLONES, STORM SURGES & COASTAL SAFETY
  // =========================================================================
  {
    id: 'cyclone_4_stage_warning',
    categoryId: 'cyclone_marine',
    question: 'What are the 4 Stages of IMD Cyclone Warnings (Watch, Alert, Warning, Outlook)?',
    shortQuestion: '4 Stages of IMD Cyclone Warning',
    keywords: ['cyclone warning', 'pre-cyclone watch', 'cyclone alert', 'cyclone warning', 'post landfall outlook'],
    patterns: [/4 stages of cyclone warning/i, /cyclone alert stages/i, /how does imd warn for cyclones/i],
    generateAnswer: () => {
      return {
        text: `### 4-Stage Cyclone Warning Protocol (IMD / RSMC New Delhi)
Issued by the Cyclone Warning Division to Disaster Management Authorities:

1. **Stage 1: Pre-Cyclone Watch (Issued 72 hours in advance)**:
   • Warns of low pressure development and potential cyclogenesis; advises deep-sea fishermen to return.
2. **Stage 2: Cyclone Alert (YELLOW MESSAGE — Issued 48 hours in advance)**:
   • Issued when a deep depression/cyclone is tracked heading toward the coast; specifies expected landfall district.
3. **Stage 3: Cyclone Warning (ORANGE MESSAGE — Issued 24 hours in advance)**:
   • Specifies exact landfall coordinates, gale wind radius, storm surge inundation heights, and district evacuation orders.
4. **Stage 4: Post-Landfall Outlook (RED MESSAGE — Issued 12 hours prior to landfall)**:
   • Focuses on the inland path of the decaying system, flash floods in river basins, and gale wind damage to interior districts.`,
        sources: [
          { title: 'RSMC New Delhi Tropical Cyclone Warning Division', url: 'https://rsmcnewdelhi.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Tropical cyclone intensity scale',
          'INCOIS High Wave & Sea Alerts',
          '72-Hour emergency disaster kit',
        ],
      };
    },
  },

  {
    id: 'cyclone_intensity_scale',
    categoryId: 'cyclone_marine',
    question: 'How does IMD classify tropical cyclones from Low Pressure to Super Cyclonic Storm?',
    shortQuestion: 'Tropical cyclone intensity scale',
    keywords: ['cyclone scale', 'depression', 'deep depression', 'super cyclone', 'severe cyclonic storm', 'wind speed cyclone'],
    patterns: [/cyclone classification/i, /cyclone intensity/i, /what is a super cyclone/i, /depression wind speed/i],
    generateAnswer: () => {
      return {
        text: `### North Indian Ocean Tropical Cyclone Intensity Scale (IMD / RSMC)
Ranked by 3-minute sustained maximum surface wind speed:

1. **Low Pressure Area**: Winds < 31 km/h (< 17 knots).
2. **Depression (D)**: Winds **31–49 km/h** (17–27 knots).
3. **Deep Depression (DD)**: Winds **50–61 km/h** (28–33 knots).
4. **Cyclonic Storm (CS)**: Winds **62–88 km/h** (34–47 knots) — *Storm is named at this stage*.
5. **Severe Cyclonic Storm (SCS)**: Winds **89–117 km/h** (48–63 knots).
6. **Very Severe Cyclonic Storm (VSCS)**: Winds **118–166 km/h** (64–89 knots).
7. **Extremely Severe Cyclonic Storm (ESCS)**: Winds **167–221 km/h** (90–119 knots).
8. **Super Cyclonic Storm (SuCS)**: Winds **≥ 222 km/h** (≥ 120 knots) — *Catastrophic damage*.`,
        sources: [
          { title: 'RSMC Cyclone Classification & Terminology', url: 'https://rsmcnewdelhi.imd.gov.in', type: 'search' },
        ],
        followUps: [
          '4 Stages of IMD Cyclone Warning',
          'INCOIS High Wave & Sea Alerts',
        ],
      };
    },
  },

  {
    id: 'incois_marine_fishermen_alerts',
    categoryId: 'cyclone_marine',
    question: 'What are the INCOIS High Wave, Swell Surge (Kallakkadal), and rough sea advisories?',
    shortQuestion: 'INCOIS High Wave & Sea Alerts',
    keywords: ['incois', 'marine', 'fishermen', 'sea state', 'high wave', 'swell surge', 'ocean', 'kallakkadal'],
    patterns: [/incois (alert|warning)/i, /fishermen (warning|advisory)/i, /sea condition/i, /high wave alert/i],
    generateAnswer: () => {
      return {
        text: `### INCOIS Ocean State & Fishermen Marine Advisory Protocol
Issued jointly by **INCOIS (Hyderabad)** and IMD for coastal maritime safety:

• **Swell Surge (Kallakkadal)**:
  - Sudden high-energy swells generated thousands of kilometers away in the Southern Ocean striking the Indian coast without local wind clues.
• **High Wave Warning (Orange/Red Alert)**:
  - Significant wave heights exceeding **3.0 to 5.5 meters** along coastal stretches.

**Fishermen Directives**:
• **Squally Weather (40–50 km/h)**: Small country craft and artisanal motorized boats advised not to venture into deep sea.
• **Gale Wind Alert (> 60 km/h)**: Total suspension of all marine and harbor operations; deep-sea vessels must dock immediately.`,
        sources: [
          { title: 'INCOIS Ocean State Forecast Portal', url: 'https://incois.gov.in', type: 'search' },
        ],
        followUps: [
          '4 Stages of IMD Cyclone Warning',
          'Tropical cyclone intensity scale',
        ],
      };
    },
  },

  // =========================================================================
  // 7. RADAR, SATELLITE & ATMOSPHERIC PHYSICS
  // =========================================================================
  {
    id: 'doppler_radar_dbz_scale',
    categoryId: 'radar_science',
    question: 'How does Doppler Weather Radar (DWR) work and what does the dBZ reflectivity scale mean?',
    shortQuestion: 'Doppler Radar & dBZ reflectivity',
    keywords: ['radar', 'doppler', 'dwr', 'dbz', 'reflectivity', 'echo', 's-band', 'c-band', 'x-band'],
    patterns: [/how does (doppler )?radar work/i, /what is dbz/i, /dwr radar/i],
    generateAnswer: () => {
      return {
        text: `### Doppler Weather Radar (DWR) Principles & dBZ Interpretation
**Working Principle**:
Transmits microwave pulses (S-Band 2.7 GHz for coastal cyclones, C-Band 5.6 GHz for inland plains, X-Band 9.3 GHz for mountain valleys) and measures echo return power and Doppler phase shifts to calculate **rain rate** and **wind velocity vectors**.

**dBZ Reflectivity Scale Guide**:
• **10 to 20 dBZ (Blue)**: Very light drizzle, mist, or non-precipitating clouds.
• **20 to 35 dBZ (Green)**: Light to moderate steady rain.
• **35 to 45 dBZ (Yellow)**: Moderate to heavy rain showers.
• **45 to 55 dBZ (Orange/Red)**: Severe thunderstorm, intense downpour.
• **> 55 dBZ (Purple/White)**: **Severe Hailstorm**, violent squall cell, or tornado vortex signature.`,
        sources: [
          { title: 'IMD Doppler Weather Radar Network Portal', url: 'https://mausam.imd.gov.in/imd_latest/contents/radar.php', type: 'search' },
        ],
        followUps: [
          'INSAT Satellite imagery channels',
          'El Niño, La Niña & IOD climate drivers',
        ],
      };
    },
  },

  {
    id: 'insat_satellite_channels',
    categoryId: 'radar_science',
    question: 'How does IMD use INSAT-3D and INSAT-3DR meteorological satellite imagery channels?',
    shortQuestion: 'INSAT Satellite imagery channels',
    keywords: ['insat', 'satellite', 'infrared', 'water vapor', 'visible', 'tir', 'isro', 'sounder'],
    patterns: [/insat (satellite|imagery)/i, /how do weather satellites work/i, /infrared channel/i],
    generateAnswer: () => {
      return {
        text: `### INSAT-3D / INSAT-3DR Geostationary Meteorological Sounders (ISRO / IMD)
Captures images of India and the Indian Ocean every **15 minutes**:

1. **Visible (VIS, 0.55–0.75 µm)**: High-resolution daylight photography of cloud structure, snow cover, and cyclone spiral bands.
2. **Thermal Infrared (TIR-1, 10.3–11.3 µm)**: Measures cloud-top temperatures 24/7. Colder cloud tops (-60°C to -80°C) indicate towering convective cumulonimbus storms.
3. **Water Vapor (WV, 6.5–7.1 µm)**: Tracks mid-to-upper tropospheric moisture transport and subtropical jet streams.
4. **Middle Infrared (MIR, 3.7–4.0 µm)**: Detects nocturnal low clouds, radiation fog layers, and active forest fire hot-spots.`,
        sources: [
          { title: 'MOSDAC ISRO Meteorological Satellite Data Archival Centre', url: 'https://mosdac.gov.in', type: 'search' },
        ],
        followUps: [
          'Doppler Radar & dBZ reflectivity',
          'El Niño, La Niña & IOD climate drivers',
        ],
      };
    },
  },

  {
    id: 'el_nino_la_nina_iod',
    categoryId: 'radar_science',
    question: 'How do El Niño, La Niña, and the Indian Ocean Dipole (IOD) impact Indian monsoon rainfall?',
    shortQuestion: 'El Niño, La Niña & IOD climate drivers',
    keywords: ['el nino', 'la nina', 'iod', 'indian ocean dipole', 'enso', 'pacific', 'climate driver', 'drought'],
    patterns: [/el ni(ñ|n)o/i, /la ni(ñ|n)a/i, /indian ocean dipole/i, /iod/i, /enso/i],
    generateAnswer: () => {
      return {
        text: `### Macro Climate Drivers of the Indian Monsoon
**1. El Niño (Pacific Ocean Warm Phase)**:
• Abnormal warming of sea surface temperatures in the central/eastern equatorial Pacific.
• Weakens Walker Circulation; historically correlated with **monsoon deficits and drought risk** in India (~60% of past El Niño years had below-normal rains).

**2. La Niña (Pacific Ocean Cool Phase)**:
• Cooler than average eastern Pacific waters.
• Enhances the Indian Monsoon, frequently resulting in **above-normal rainfall, severe flooding**, and colder winter cold waves.

**3. Indian Ocean Dipole (IOD)**:
• **Positive IOD**: Warmer western Indian Ocean relative to the east; acts as a beneficial buffer that boosts rainfall over India.
• **Negative IOD**: Cooler western Indian Ocean; suppresses monsoon rainfall.`,
        sources: [
          { title: 'IMD Long Range Forecasting & Climate Diagnostics Centre', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Southwest (SW) Monsoon dynamics',
          'Western Disturbances (WD) explained',
        ],
      };
    },
  },

  // =========================================================================
  // 8. AVIATION & MARITIME OPERATIONS
  // =========================================================================
  {
    id: 'aviation_metar_taf_decoding',
    categoryId: 'aviation_marine',
    question: 'How do pilots decode aviation METAR and TAF meteorological reports in India?',
    shortQuestion: 'Aviation METAR & TAF report decoding',
    keywords: ['metar', 'taf', 'aviation', 'airport weather', 'pilot', 'runway visibility', 'rvr', 'cavok'],
    patterns: [/what is metar/i, /how to read metar/i, /taf report/i, /aviation weather/i],
    generateAnswer: () => {
      return {
        text: `### Aviation METAR (Aerodrome Routine Report) Structure
Example: \`VECC 241200Z 21008KT 4000 HZ FEW020 32/26 Q1008 NOSIG\`

**Decoding Breakdown**:
• **VECC**: ICAO station identifier (Kolkata NSCBI Airport).
• **241200Z**: Issued on 24th day at 12:00 UTC (Zulu time).
• **21008KT**: Surface wind from 210° (SSW) at 08 knots.
• **4000 HZ**: Prevailing surface visibility 4,000 meters in Haze.
• **FEW020**: Cloud coverage (1–2 octas) with base at 2,000 feet AGL.
• **32/26**: Dry bulb temperature 32°C / Dew point 26°C.
• **Q1008**: Altimeter subscale setting QNH = 1008 hPa.
• **NOSIG**: No significant meteorological change expected in the next 2 hours.`,
        sources: [
          { title: 'DGCA & IMD Aviation Meteorology Division', url: 'https://mausam.imd.gov.in', type: 'search' },
        ],
        followUps: [
          'Visibility: Fog vs Mist vs Haze',
          'Current weather & conditions',
        ],
      };
    },
  },

  // =========================================================================
  // 9. DISASTER RESPONSE & CITIZEN SAFETY
  // =========================================================================
  {
    id: 'emergency_disaster_kit_checklist',
    categoryId: 'disaster_citizen',
    question: 'What items must be in a 72-hour family emergency disaster survival kit?',
    shortQuestion: '72-Hour emergency disaster kit',
    keywords: ['kit', 'emergency kit', 'disaster kit', 'survival', 'first aid', 'supplies', 'flood kit'],
    patterns: [/disaster kit/i, /emergency kit/i, /what to pack for flood/i, /survival kit/i],
    generateAnswer: () => {
      return {
        text: `### 72-Hour Family Emergency Disaster Survival Checklist (NDMA)
Pack these essentials in a portable, waterproof backpack:

1. **Water & Food**:
   • 3 liters of potable drinking water per person per day.
   • 3-day supply of non-perishable high-calorie food (energy bars, roasted chana, biscuits).
2. **Medical & First Aid**:
   • Comprehensive First Aid Kit (antiseptic, bandages, ORS sachets, burn cream).
   • 7-day supply of personal prescription chronic medications.
3. **Power & Light**:
   • Heavy-duty LED torch with extra batteries, hand-crank radio, charged 20,000 mAh power bank.
4. **Critical Documents**:
   • Aadhaar, passport, insurance, property records in airtight ziplock bags + USB digital backup.
5. **Tools & Hygiene**:
   • Multi-tool knife, emergency whistle, N95 masks, water purification chlorine tablets, and cash in small denominations.`,
        sources: [
          { title: 'National Disaster Management Authority (NDMA) Citizen Kit', url: 'https://ndma.gov.in', type: 'search' },
        ],
        followUps: [
          'Emergency disaster helplines in India',
          'IMD 4-Colour Warning Matrix',
        ],
      };
    },
  },

  {
    id: 'emergency_helplines_india',
    categoryId: 'disaster_citizen',
    question: 'What are the official national and state disaster emergency helplines in India?',
    shortQuestion: 'Emergency disaster helplines in India',
    keywords: ['helpline', 'emergency number', 'ndrf', 'sdma', 'ambulance', 'police', 'fire', '112', '1070'],
    patterns: [/emergency (number|helpline|phone)/i, /disaster helpline/i, /who to call in flood/i],
    generateAnswer: () => {
      return {
        text: `### Emergency Disaster Response Helplines in India
Save these 24/7 toll-free emergency numbers:

• **112**: Unified National Emergency Helpline (Police, Fire, Ambulance, Disaster Response).
• **1070**: State Disaster Management Authority (SDMA) State Control Room.
• **1077**: District Disaster Management Authority (DDMA) Control Room.
• **108**: Emergency Medical Ambulance Services.
• **1078**: National Disaster Management Authority (NDMA) Control Room.
• **011-24611276**: IMD National Weather Forecasting Centre, New Delhi.
• **1913**: Coastal Security & Marine Emergency Services.`,
        sources: [
          { title: 'NDMA 24/7 Control Room & Helplines', url: 'https://ndma.gov.in', type: 'search' },
        ],
        followUps: [
          '72-Hour emergency disaster kit',
          'IMD 4-Colour Warning Matrix',
        ],
      };
    },
  },
];
