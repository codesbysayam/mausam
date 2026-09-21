// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Verified Product & Meteorological Domain Knowledge Base
// Answers general, conceptual, and educational queries locally (<5ms)
// without triggering external weather, AQI, radar, or warning APIs.
// ====================================================================

export interface KnowledgeEntry {
  id: string;
  category: 'MAUSAM' | 'WEATHER' | 'WARNINGS' | 'AQI' | 'RADAR' | 'AGRICULTURE' | 'MARINE';
  title: string;
  summary: string;
  bullets: string[];
  markdown: string;
  suggestedFollowUps: string[];
}

export const MAUSAM_PLATFORM_OVERVIEW: KnowledgeEntry = {
  id: 'about-mausam',
  category: 'MAUSAM',
  title: 'About MAUSAM Platform',
  summary: 'MAUSAM is a meteorological and atmospheric information platform designed to provide weather observations, forecasts, warnings, air-quality information, radar/map data, and agrometeorological information for locations across India.',
  bullets: [
    'Real-time atmospheric observations (temperature, humidity, wind, pressure, cloud cover)',
    '7-day numerical weather predictions and precipitation probability',
    'Official early alerts and color-coded disaster warnings (Red, Orange, Yellow, Green)',
    'Air Quality Index (AQI) with PM2.5 and PM10 particulate telemetry',
    'Doppler Weather Radar (DWR) imagery and precipitation tracking',
    'Agrometeorological advisories, soil moisture, and spraying suitability',
    'Coverage across all 28 Indian States and 8 Union Territories',
  ],
  markdown: `### About MAUSAM Platform

**MAUSAM** is a meteorological and atmospheric information platform designed to provide weather observations, forecasts, warnings, air-quality information, radar/map data, and agrometeorological information for locations across India.

**Key Capabilities:**
- **Real-Time Telemetry**: Grounded observations including dry-bulb temperature, apparent temperature, relative humidity, wind speed/direction, and surface barometric pressure.
- **7-Day Forecasts**: Medium-range numerical weather predictions with rain probabilities and temperature trends.
- **Official Disaster Warnings**: Color-coded alert bulletins (Red, Orange, Yellow, Green) grounded in SACHET / NDMA and IMD synoptic warning data.
- **Air Quality Intelligence**: National AQI metrics and particulate concentrations (PM2.5, PM10) aligned with Central Pollution Control Board (CPCB) standards.
- **Doppler Weather Radar**: Live reflectivity and cloud-top monitoring from national radar network installations.
- **Agromet & Marine**: Farm spraying advisories, soil moisture readings, wave height data, and sea state bulletins for coastal districts.

*You can ask me about current weather, forecasts, rainfall, official warnings, AQI, radar, marine conditions, or agricultural advisories for any location in India.*`,
  suggestedFollowUps: [
    'What weather data can you provide?',
    'Show current weather for Odisha',
    'Are there active warnings?',
    'Show the 7-day forecast',
  ],
};

export const MAUSAM_CAPABILITIES: KnowledgeEntry = {
  id: 'mausam-capabilities',
  category: 'MAUSAM',
  title: 'MAUSAM Capabilities & Features',
  summary: 'Ask MAUSAM can assist with current weather observations, 7-day forecasts, severe warning bulletins, air quality, radar imagery, and agricultural advisories.',
  bullets: [
    'Current Weather: Ask "What is the temperature in Delhi?" or "Is it raining in Mumbai?"',
    'Forecasts: Ask "Will it rain tomorrow in Kolkata?" or "Show 7-day forecast for Odisha"',
    'Warnings: Ask "Any rainfall warnings in Odisha?" or "Active alerts in Kerala"',
    'Air Quality: Ask "What is the AQI in Bhubaneswar?" or "Pollution level in Delhi"',
    'Comparisons: Ask "Which is cooler right now, Bhubaneswar or Cuttack?"',
    'Radar: Ask "Show radar for Odisha" or "Doppler radar status"',
    'Agriculture: Ask "Is it safe to spray pesticides tomorrow in Ganjam?"',
  ],
  markdown: `### MAUSAM Assistant Capabilities

You can ask me questions using natural language. Here is what I can do:

- **Current Weather Observations**: Retrieve live temperature, humidity, wind velocity, and sky conditions for any Indian city or district.
- **Forecasts & Predictions**: View next-day and 7-day daily temperature ranges and precipitation chances.
- **Official Warning Bulletins**: Check active Red, Orange, and Yellow weather alerts for flash floods, cyclones, thunderstorms, and heavy rainfall.
- **Air Quality Index (AQI)**: Check real-time ambient particulate levels (PM2.5 / PM10) and health advisories.
- **Multi-Location Comparison**: Compare current temperatures and atmospheric parameters between two Indian cities simultaneously.
- **Radar & Marine**: Explore Doppler Weather Radar coverage and coastal wave height conditions.`,
  suggestedFollowUps: [
    'Show current weather for Odisha',
    'Any active warnings?',
    'What is the AQI in Bhubaneswar?',
    'Show 7-day forecast',
  ],
};

export const DOMAIN_KNOWLEDGE_ENTRIES: Record<string, KnowledgeEntry> = {
  aqi: {
    id: 'what-is-aqi',
    category: 'AQI',
    title: 'Understanding the Air Quality Index (AQI)',
    summary: 'The Air Quality Index (AQI) is a standardized numerical scale used by environmental agencies like the Central Pollution Control Board (CPCB) to communicate how clean or polluted the ambient air is.',
    bullets: [
      '0–50 (Good): Minimal health impact, optimal air quality',
      '51–100 (Satisfactory): Minor breathing discomfort to sensitive individuals',
      '101–200 (Moderate): Breathing discomfort to people with lungs, asthma, and heart diseases',
      '201–300 (Poor): Breathing discomfort to most people on prolonged exposure',
      '301–400 (Very Poor): Respiratory illness on prolonged exposure',
      '401–500 (Severe): Affects healthy people and seriously impacts those with existing diseases',
      'Dominant pollutants tracked: PM2.5 (fine respirable particles) and PM10 (coarse particles)',
    ],
    markdown: `### What is the Air Quality Index (AQI)?

The **Air Quality Index (AQI)** is a standardized metric established by the **Central Pollution Control Board (CPCB)** to convert complex air-pollution measurements into a single easily understood number and health category:

| AQI Range | Category | Health Advisory |
| :--- | :--- | :--- |
| **0 – 50** | **Good** | Minimal impact. Clean, healthy air. |
| **51 – 100** | **Satisfactory** | Minor breathing discomfort to sensitive people. |
| **101 – 200** | **Moderate** | Discomfort to individuals with asthma or heart conditions. |
| **201 – 300** | **Poor** | Discomfort to most people on prolonged outdoor exposure. |
| **301 – 400** | **Very Poor** | Risk of respiratory illness upon prolonged physical activity. |
| **401 – 500** | **Severe** | Serious health impacts for both sensitive and healthy individuals. |

**Key Tracked Pollutants:**
- **PM2.5**: Fine inhalable particles with diameters 2.5 micrometers and smaller. They can penetrate deep into the lungs and bloodstream.
- **PM10**: Coarse inhalable particles with diameters 10 micrometers and smaller, typically derived from road dust, construction, and pollen.`,
    suggestedFollowUps: [
      'What is the AQI in Bhubaneswar?',
      'What is the AQI in Delhi?',
      'What is the difference between PM2.5 and PM10?',
      'Show current weather for Odisha',
    ],
  },

  radar: {
    id: 'what-is-radar',
    category: 'RADAR',
    title: 'How Doppler Weather Radar Works',
    summary: 'Doppler Weather Radar (DWR) transmits microwave pulses into the atmosphere to detect precipitation, cloud dynamics, wind velocity, and storm structure.',
    bullets: [
      'Measures microwave reflectivity (dBZ) to estimate rainfall intensity',
      'Uses the Doppler effect to measure the radial velocity of raindrops toward or away from the radar',
      'Crucial for detecting severe convective thunderstorms, squall lines, hailstorms, and cyclones',
      'Operated by the India Meteorological Department (IMD) across key coastal and inland stations',
    ],
    markdown: `### What is Doppler Weather Radar (DWR)?

**Doppler Weather Radar (DWR)** is an active remote sensing instrument that transmits focused pulses of microwave radiation into the atmosphere and analyzes the reflected energy from precipitation particles (rain, hail, snow):

**Key Operating Principles:**
1. **Reflectivity (dBZ)**: The amount of microwave energy scattered back to the antenna indicates the concentration, size, and phase of raindrops or ice particles. Higher dBZ values (e.g. >45 dBZ) signify heavy downpours or hail.
2. **Radial Velocity (Doppler Effect)**: By measuring the frequency shift of returning pulses, the radar calculates whether precipitation particles are moving toward or away from the radar, revealing internal storm rotation, gust fronts, and mesocyclones.
3. **Storm Nowcasting**: Radar imagery provides high temporal resolution (updates every 10–15 minutes) essential for early flash flood and cyclone tracking.`,
    suggestedFollowUps: [
      'Show radar for Odisha',
      'Are there active warnings?',
      'What is the weather in Odisha?',
      'How do weather warnings work?',
    ],
  },

  warnings: {
    id: 'what-are-warnings',
    category: 'WARNINGS',
    title: 'Understanding Official Weather Alert Color Codes',
    summary: 'The India Meteorological Department (IMD) and National Disaster Management Authority (SACHET/NDMA) use a standardized 4-tier color-coded alert system to convey severity and urgency of weather hazards.',
    bullets: [
      '🟢 GREEN (No Warning): Nominal conditions. No emergency action required.',
      '🟡 YELLOW (Watch / Be Updated): Weather condition is likely to deteriorate. Keep updated on local forecasts.',
      '🟠 ORANGE (Alert / Be Prepared): High likelihood of severe weather affecting transport, power, or property. Be prepared for action.',
      '🔴 RED (Warning / Take Action): Extreme atmospheric hazard with imminent risk to life and infrastructure. Take immediate defensive action.',
    ],
    markdown: `### Official Meteorological Warning Color Codes

The **India Meteorological Department (IMD)** and **SACHET / NDMA** issue weather warnings using a 4-color operational matrix based on hazard probability and expected societal impact:

- 🟢 **GREEN (No Warning)**: Normal seasonal weather. No adverse impact expected; normal outdoor and coastal activities can proceed.
- 🟡 **YELLOW (Watch - Be Updated)**: Moderately severe weather is expected (such as localized heavy rain or gusty winds). The public should monitor bulletin updates.
- 🟠 **ORANGE (Alert - Be Prepared)**: Significant hazard expected (e.g. very heavy rainfall, strong squalls, localized waterlogging). Transport, power, and marine operations may be disrupted.
- 🔴 **RED (Warning - Take Action)**: Extremely severe weather (such as extremely heavy downpours >204.4 mm, cyclone landfall, severe gale winds). Imminent danger to life and property requiring coordinated disaster response.`,
    suggestedFollowUps: [
      'Any rainfall warnings in Odisha?',
      'Are there active warnings in Kerala?',
      'Show current weather for Odisha',
      'Show the 7-day forecast',
    ],
  },

  rainfall: {
    id: 'what-is-rainfall',
    category: 'WEATHER',
    title: 'Understanding Rainfall & Monsoon in India',
    summary: 'Rainfall is liquid precipitation formed when atmospheric water vapor condenses into clouds and becomes sufficiently dense to fall under gravity. India receives over 75% of its annual precipitation from the Southwest Monsoon.',
    bullets: [
      'Very Light Rain: 0.1 to 2.4 mm in 24 hours',
      'Light Rain: 2.5 to 15.5 mm in 24 hours',
      'Moderate Rain: 15.6 to 64.4 mm in 24 hours',
      'Heavy Rain: 64.5 to 115.5 mm in 24 hours',
      'Very Heavy Rain: 115.6 to 204.4 mm in 24 hours',
      'Extremely Heavy Rain: Greater than 204.4 mm in 24 hours',
    ],
    markdown: `### Understanding Rainfall & Monsoon Classifications

Rainfall occurs when warm, moisture-laden air rises, expands, and cools, causing water vapor to condense around microscopic aerosols into water droplets. When droplets coalesce and exceed atmospheric updraft buoyancy, they precipitate.

**IMD Standard 24-Hour Rainfall Classifications:**
- **Light Rain**: 2.5 mm – 15.5 mm
- **Moderate Rain**: 15.6 mm – 64.4 mm
- **Heavy Rain**: 64.5 mm – 115.5 mm
- **Very Heavy Rain**: 115.6 mm – 204.4 mm
- **Extremely Heavy Rain**: Above 204.4 mm

**The Monsoon Systems:**
- **Southwest Monsoon (June–September)**: Driven by differential thermal heating between the Asian landmass and the Indian Ocean, bringing rain across the Indian subcontinent.
- **Northeast Monsoon (October–December)**: Affects southeastern peninsular India, particularly Tamil Nadu, coastal Andhra Pradesh, and Kerala.`,
    suggestedFollowUps: [
      'Will it rain tomorrow in Odisha?',
      'Any rainfall warnings in Odisha?',
      'Show current weather for Odisha',
      'What is humidity?',
    ],
  },

  humidity: {
    id: 'what-is-humidity',
    category: 'WEATHER',
    title: 'Why Atmospheric Humidity is Important',
    summary: 'Relative humidity is the percentage of moisture present in the air relative to the maximum amount the air could hold at that temperature. It governs evaporation rates, perspiration cooling, and storm formation.',
    bullets: [
      'High humidity (>80%) impairs human evaporative sweat cooling, resulting in elevated "Feels-Like" / Heat Index values',
      'Low humidity (<30%) increases skin dryness and enhances wildfire and dust hazard risks',
      'Dew point temperature indicates the exact saturation threshold where fog or dew forms',
      'High relative humidity combined with convective instability is the primary fuel for thunderstorms',
    ],
    markdown: `### What is Humidity and Why Does it Matter?

**Relative Humidity (RH)** represents the concentration of water vapor in the atmosphere as a percentage of the saturation capacity at a given temperature.

**Key Implications:**
- **Human Comfort & Heat Index**: High humidity restricts the evaporation of sweat, making hot temperatures feel significantly warmer (the "Feels-Like" temperature or Heat Index). For example, 32°C with 85% humidity feels like 42°C.
- **Condensation & Clouds**: When moist air cools to its dew point, water vapor condenses into fog, dew, or clouds.
- **Agricultural Impact**: High relative humidity accelerates fungal plant pathogens, whereas low humidity increases soil evapotranspiration and irrigation requirements.`,
    suggestedFollowUps: [
      'Show current weather for Odisha',
      'What is the temperature in Delhi?',
      'Will it rain tomorrow?',
      'What is AQI?',
    ],
  },

  agriculture: {
    id: 'what-is-agromet',
    category: 'AGRICULTURE',
    title: 'Agrometeorological Advisories & Crop Weather',
    summary: 'Agrometeorology applies meteorological observations and forecasts to agricultural management, optimizing planting, irrigation, fertilizer application, and crop protection.',
    bullets: [
      'Pesticide & Fungicide Spraying: Requires wind speed below 15 km/h, no rain within 4–6 hours, and moderate temperature',
      'Soil Moisture: Critical for seed germination, root respiration, and scheduling drip irrigation',
      'Evapotranspiration: Measures total water loss through soil evaporation and plant transpiration',
      'Frost & Heatwave Alerts: Protects standing crops from terminal heat stress or frost damage',
    ],
    markdown: `### Agrometeorological Information & Farming Advisories

**Agrometeorology** links atmospheric conditions with agricultural decision-making:

- **Spraying Suitability**: Applying chemical fertilizers or biological pest controls during high winds (>15 km/h) causes droplet drift; spraying before imminent rainfall washes chemicals into runoff.
- **Soil Moisture & Temperature**: Root zone water retention determines irrigation intervals and soil workability.
- **Crop Stages**: Extreme temperature deviations during flowering or grain-filling stages can severely reduce agricultural yields.`,
    suggestedFollowUps: [
      'Show rainfall forecast for Odisha',
      'Are there active warnings?',
      'What is the weather in Odisha?',
      'What is MAUSAM?',
    ],
  },
};

/**
 * Searches the local knowledge base for matching concepts
 */
export function findKnowledge(query: string): KnowledgeEntry | null {
  const q = (query || '').trim().toLowerCase();

  // 1. Direct MAUSAM platform questions
  if (
    q === 'what is mausam' ||
    q === 'what is mausam?' ||
    q === 'what does mausam do' ||
    q === 'what does mausam do?' ||
    q === 'what can you do' ||
    q === 'what can you do?' ||
    q === 'how does mausam work' ||
    q === 'how does mausam work?' ||
    q === 'tell me about mausam' ||
    q === 'explain mausam' ||
    q === 'what is this platform' ||
    q === 'what is this platform?' ||
    q === 'what are the features of mausam' ||
    q === 'what are the features of mausam?' ||
    q.includes('about mausam') ||
    q.includes('what is mausam') ||
    q.includes('explain mausam') ||
    q.includes('what does mausam mean') ||
    q.includes('what information can you provide') ||
    q.includes('who are you')
  ) {
    if (q.includes('what can you do') || q.includes('features of mausam') || q.includes('what information can you provide')) {
      return MAUSAM_CAPABILITIES;
    }
    return MAUSAM_PLATFORM_OVERVIEW;
  }

  // 2. Conceptual Questions: AQI
  if (
    q === 'what is aqi' ||
    q === 'what is aqi?' ||
    q === 'what does aqi mean' ||
    q === 'what does aqi mean?' ||
    q === 'explain aqi' ||
    q === 'what is air quality index' ||
    q === 'what is air quality index?' ||
    q.startsWith('what is aqi') ||
    q.startsWith('explain aqi')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.aqi;
  }

  // 3. Conceptual Questions: Radar
  if (
    q === 'what is radar' ||
    q === 'what is radar?' ||
    q === 'what is weather radar' ||
    q === 'what is weather radar?' ||
    q === 'how does radar work' ||
    q === 'how does radar work?' ||
    q === 'how does weather radar work' ||
    q === 'how does weather radar work?' ||
    q === 'explain radar' ||
    q.startsWith('how does radar') ||
    q.startsWith('how does weather radar') ||
    q.startsWith('what is radar')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.radar;
  }

  // 4. Conceptual Questions: Weather Warnings
  if (
    q === 'explain weather warnings' ||
    q === 'what are weather warnings' ||
    q === 'what are weather warnings?' ||
    q === 'explain warnings' ||
    q === 'what do warning colors mean' ||
    q === 'what is red alert' ||
    q === 'what is orange alert' ||
    q.includes('explain weather warning') ||
    q.includes('what do weather warnings mean')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.warnings;
  }

  // 5. Conceptual Questions: Rainfall / Monsoon
  if (
    q === 'what is rainfall' ||
    q === 'what is rainfall?' ||
    q === 'why does it rain' ||
    q === 'why is it raining' ||
    q === 'why is it raining?' ||
    q === 'explain monsoon' ||
    q.startsWith('what is rainfall') ||
    q.startsWith('explain monsoon') ||
    q.startsWith('why does it rain')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.rainfall;
  }

  // 6. Conceptual Questions: Humidity
  if (
    q === 'what is humidity' ||
    q === 'what is humidity?' ||
    q === 'why is humidity important' ||
    q === 'why is humidity important?' ||
    q.startsWith('what is humidity') ||
    q.startsWith('why is humidity important')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.humidity;
  }

  // 7. Conceptual Questions: Agriculture
  if (
    q === 'what is agromet' ||
    q === 'what is agrometeorology' ||
    q.includes('agrometeorology')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.agriculture;
  }

  return null;
}
