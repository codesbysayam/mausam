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

export const MAUSAM_KNOWLEDGE = {
  about: {
    title: 'About MAUSAM',
    answer:
      'MAUSAM is the meteorological and atmospheric information platform used to provide weather observations, forecasts, warnings, air-quality information, radar and map-based atmospheric information, and agrometeorological information for locations across India.',
  },
  capabilities: [
    'Current weather observations',
    'Weather forecasts',
    'Official weather warnings',
    'Rainfall information',
    'Air-quality information',
    'Radar and atmospheric maps',
    'Agrometeorological information',
  ],
  developer: {
    name: '',
    organization: '',
    verified: false,
    unverifiedMessage: "I don't have verified developer information in my current project data.",
  },
};

export const DEVELOPER_KNOWLEDGE: KnowledgeEntry = {
  id: 'about-developer',
  category: 'MAUSAM',
  title: 'Developer Information',
  summary: "I don't have verified developer information in my current project data.",
  bullets: [
    'Platform: MAUSAM Atmospheric Intelligence Platform',
    'Developer Data: Not verified in current project metadata',
  ],
  markdown: `I don't have verified developer information in my current project data.`,
  suggestedFollowUps: [
    'What is MAUSAM?',
    'What does MAUSAM do?',
    'Show current weather for Odisha',
    'What is AQI?',
  ],
};

export const MAUSAM_PLATFORM_OVERVIEW: KnowledgeEntry = {
  id: 'about-mausam',
  category: 'MAUSAM',
  title: 'About MAUSAM Platform',
  summary:
    'MAUSAM is a meteorological and atmospheric information platform designed to provide weather observations, forecasts, warnings, air-quality information, radar/map data, and agrometeorological information for locations across India.',
  bullets: [
    'Current weather observations',
    'Weather forecasts',
    'Official weather warnings',
    'Rainfall information',
    'Air-quality information',
    'Radar and atmospheric maps',
    'Agrometeorological information',
    'Coverage across all 28 Indian States and 8 Union Territories',
  ],
  markdown: `## What is MAUSAM?

MAUSAM is a meteorological and atmospheric information platform designed to provide weather and environmental information for locations across India.

It can provide information such as:

• **Current weather observations**: Temperature, humidity, wind, and sky condition for any Indian location.
• **Forecasts**: 7-day numerical predictions and precipitation probabilities.
• **Official weather warnings**: Color-coded disaster alerts (Red, Orange, Yellow).
• **Rainfall information**: Real-time precipitation measurements and radar estimates.
• **Air-quality information**: Live PM2.5 and PM10 pollution levels from CPCB stations.
• **Radar and atmospheric maps**: Doppler weather radar composite reflectivity.
• **Agrometeorological information**: Soil moisture, spray suitability, and crop advisories.

You can ask me about a specific Indian state, Union Territory, district or location.`,
  suggestedFollowUps: [
    'What can you do?',
    'Show current weather for Odisha',
    'Any rainfall warnings in Odisha?',
    'What is AQI?',
  ],
};

export const MAUSAM_CAPABILITIES: KnowledgeEntry = {
  id: 'mausam-capabilities',
  category: 'MAUSAM',
  title: 'MAUSAM Capabilities & Inquiries',
  summary:
    'Ask MAUSAM can assist with current weather observations, 7-day forecasts, severe warning bulletins, air quality, radar imagery, and agricultural advisories.',
  bullets: [
    'Current Weather: Ask "What is the weather in Odisha?" or "Is it raining in Bhubaneswar?"',
    'Forecasts: Ask "What is the 7 day forecast for Odisha?" or "Will it rain tomorrow?"',
    'Warnings: Ask "Any rainfall warnings in Odisha?" or "Active alerts in Kerala"',
    'Air Quality: Ask "What is the AQI in Bhubaneswar?" or "Pollution level in Delhi"',
    'Radar: Ask "Show radar for Odisha" or "Doppler radar status"',
    'General Knowledge: Ask "What is AQI?" or "How does weather radar work?"',
  ],
  markdown: `### What Ask MAUSAM Can Do

You can ask me questions about weather and atmospheric conditions across India:

- **Current Weather Observations**: Retrieve live temperature, humidity, wind velocity, and sky conditions.
- **Forecasts & Predictions**: View next-day and 7-day temperature trends and precipitation chances.
- **Official Warning Bulletins**: Check active Red, Orange, and Yellow weather alerts from official authorities.
- **Air Quality Index (AQI)**: Check real-time ambient particulate levels (PM2.5 / PM10) and health categories.
- **Radar & Nowcasting**: Explore Doppler Weather Radar composite reflectivity.
- **Atmospheric Concepts**: Ask conceptual questions like *"What is AQI?"* or *"How does weather radar work?"*`,
  suggestedFollowUps: [
    'What is MAUSAM?',
    'Show current weather for Odisha',
    'Any rainfall warnings in Odisha?',
    'What is the AQI in Bhubaneswar?',
  ],
};

export const DOMAIN_KNOWLEDGE_ENTRIES: Record<string, KnowledgeEntry> = {
  developer: DEVELOPER_KNOWLEDGE,
  about_mausam: MAUSAM_PLATFORM_OVERVIEW,
  capabilities: MAUSAM_CAPABILITIES,
  aqi: {
    id: 'what-is-aqi',
    category: 'AQI',
    title: 'Understanding the Air Quality Index (AQI)',
    summary:
      'The Air Quality Index (AQI) is a standardized numerical scale used by environmental agencies like the Central Pollution Control Board (CPCB) to communicate ambient air pollution levels and associated health impacts.',
    bullets: [
      '0–50 (Good): Minimal health impact, optimal air quality',
      '51–100 (Satisfactory): Minor breathing discomfort to sensitive individuals',
      '101–200 (Moderate): Breathing discomfort to people with asthma and heart conditions',
      '201–300 (Poor): Breathing discomfort to most people on prolonged exposure',
      '301–400 (Very Poor): Respiratory illness on prolonged exposure',
      '401–500 (Severe): Affects healthy people and seriously impacts those with existing diseases',
      'Dominant pollutants tracked: PM2.5 (fine respirable particles) and PM10 (coarse particles)',
    ],
    markdown: `### What is the Air Quality Index (AQI)?

The **Air Quality Index (AQI)** is a standardized metric established by the **Central Pollution Control Board (CPCB)** to convert complex pollutant concentrations into a single numerical index and color-coded category:

| AQI Range | Category | Health Advisory |
| :--- | :--- | :--- |
| **0 – 50** | **Good** | Minimal impact. Clean, healthy air. |
| **51 – 100** | **Satisfactory** | Minor breathing discomfort to sensitive individuals. |
| **101 – 200** | **Moderate** | Breathing discomfort to individuals with lung, asthma, or heart disease. |
| **201 – 300** | **Poor** | Breathing discomfort to most people on prolonged outdoor exposure. |
| **301 – 400** | **Very Poor** | Respiratory illness upon prolonged physical activity. |
| **401 – 500** | **Severe** | Significant health impacts for both sensitive and healthy individuals. |

**Key Tracked Pollutants:**
- **PM2.5**: Fine respirable particles (≤ 2.5 µm) that penetrate deep into the alveolar region of the lungs.
- **PM10**: Coarse inhalable particles (≤ 10 µm) from vehicular exhaust, road dust, and construction.`,
    suggestedFollowUps: [
      'What is the AQI in Bhubaneswar?',
      'What is the AQI in Delhi?',
      'Show current weather for Odisha',
      'What is MAUSAM?',
    ],
  },

  radar: {
    id: 'what-is-radar',
    category: 'RADAR',
    title: 'How Weather Radar Works (Doppler Weather Radar)',
    summary:
      'Doppler Weather Radar (DWR) emits directional microwave pulses and analyzes the backscattered echo power (reflectivity in dBZ) and Doppler frequency shift to detect precipitation, cloud velocity, and storm severity.',
    bullets: [
      'Reflectivity (dBZ): Quantifies precipitation intensity (light rain ~20 dBZ to severe hail >55 dBZ)',
      'Doppler Principle: Measures radial velocity of raindrops toward or away from the antenna',
      'Nowcasting: Crucial for detecting severe thunderstorms, squall lines, and cyclonic vortices 0–6 hours in advance',
      'National Network: India operates an extensive network of S-band and C-band DWR installations',
    ],
    markdown: `### How Weather Radar Works (Doppler Weather Radar)

A **Doppler Weather Radar (DWR)** is an active remote-sensing instrument used to detect hydrometeors (rain, drizzle, hail, snow) in the atmosphere:

1. **Microwave Pulse Transmission**: The radar transmits focused electromagnetic pulses in the microwave frequency spectrum (e.g., S-band ~2.8 GHz or C-band ~5.6 GHz).
2. **Reflectivity Echoes (dBZ)**: When the pulse strikes raindrops or ice particles, a portion of the energy is backscattered to the antenna. The returned power is converted into **equivalent radar reflectivity factor ($Z$)** in decibels (dBZ).
   - **< 20 dBZ**: Clouds / Very light drizzle
   - **20 – 35 dBZ**: Light to moderate rain
   - **35 – 50 dBZ**: Heavy rainfall
   - **> 50 dBZ**: Intense convective thunderstorm or hail
3. **Doppler Shift**: By measuring the phase shift between consecutive returned pulses, the radar calculates the **radial velocity** of air parcels, identifying rotation, wind shear, and tornadoes.`,
    suggestedFollowUps: [
      'Show radar for Odisha',
      'Any rainfall warnings in Odisha?',
      'What is the weather in Odisha?',
      'What is MAUSAM?',
    ],
  },

  warnings: {
    id: 'what-are-warnings',
    category: 'WARNINGS',
    title: 'Understanding Weather Warnings & Alert Levels',
    summary:
      'Official meteorological warnings follow a standardized 4-stage color matrix (Green, Yellow, Orange, Red) to communicate the severity and certainty of severe atmospheric hazards.',
    bullets: [
      'Green (No Warning): Normal weather conditions, routine operations',
      'Yellow (Watch / Be Updated): Severe weather possible, stay informed',
      'Orange (Alert / Be Prepared): Severe weather expected, prepare for disruptions',
      'Red (Warning / Take Action): Extremely severe weather imminent, emergency measures required',
      'Issuing Authorities: India Meteorological Department (IMD) & NDMA SACHET',
    ],
    markdown: `### Weather Warnings & Color-Coded Alert Levels

Official meteorological warnings use a standardized 4-tier matrix to signal threat levels:

| Color Code | Operational Meaning | Recommended Public Action |
| :--- | :--- | :--- |
| **GREEN** | **No Warning** | Normal atmospheric conditions. No special precautions required. |
| **YELLOW** | **Watch (Be Updated)** | Moderately adverse weather possible. Stay informed through official bulletins. |
| **ORANGE** | **Alert (Be Prepared)** | Severe weather expected with disruption to transport, power, or waterlogging. |
| **RED** | **Warning (Take Action)** | Extremely severe weather imminent. Threat to life and property; follow disaster directives. |

Bulletins are coordinated nationally by the **India Meteorological Department (IMD)** and disseminated through the **NDMA SACHET** Common Alerting Protocol (CAP).`,
    suggestedFollowUps: [
      'Any rainfall warnings in Odisha?',
      'What is the weather in Odisha?',
      'Will it rain tomorrow in Odisha?',
      'What is MAUSAM?',
    ],
  },

  rainfall: {
    id: 'what-is-rainfall',
    category: 'WEATHER',
    title: 'Rainfall Measurement & Classifications',
    summary:
      'Rainfall is measured in millimeters (mm) using standard rain gauges. Meteorologists categorize 24-hour rainfall accumulation into standardized tiers from Very Light to Extremely Heavy.',
    bullets: [
      'Very Light Rain: 0.1 to 2.4 mm in 24 hours',
      'Light Rain: 2.5 to 15.5 mm in 24 hours',
      'Moderate Rain: 15.6 to 64.4 mm in 24 hours',
      'Heavy Rain: 64.5 to 115.5 mm in 24 hours',
      'Very Heavy Rain: 115.6 to 204.4 mm in 24 hours',
      'Extremely Heavy Rain: ≥ 204.5 mm in 24 hours',
    ],
    markdown: `### What is Rainfall & How is it Measured?

**Rainfall** is liquid precipitation measured as the depth (in millimeters) of water that would accumulate on a flat surface if no water ran off or evaporated:

- **Measurement**: Standard non-recording and tipping-bucket automatic rain gauges (ARG) measure precipitation in 0.1 mm increments.
- **IMD 24-Hour Rainfall Intensity Scale**:
  - **Light Rain**: 2.5 mm to 15.5 mm
  - **Moderate Rain**: 15.6 mm to 64.4 mm
  - **Heavy Rain**: 64.5 mm to 115.5 mm *(triggers Yellow/Orange alerts)*
  - **Very Heavy Rain**: 115.6 mm to 204.4 mm *(triggers Orange/Red alerts)*
  - **Extremely Heavy Rain**: ≥ 204.5 mm *(high risk of localized inundation and flash floods)*`,
    suggestedFollowUps: [
      'Any rainfall warnings in Odisha?',
      'What is the weather in Odisha?',
      'Will it rain tomorrow in Odisha?',
      'What is radar?',
    ],
  },

  humidity: {
    id: 'what-is-humidity',
    category: 'WEATHER',
    title: 'Understanding Relative Humidity & Heat Index',
    summary:
      'Relative humidity (RH) is the percentage of moisture present in the air relative to the maximum amount the air can hold at that specific temperature.',
    bullets: [
      'Saturation: At 100% RH, air is fully saturated and water vapor condenses into fog, dew, or rain',
      'Evaporative Cooling: High RH inhibits sweat evaporation, making temperatures feel hotter (Heat Index / Apparent Temperature)',
      'Comfort Zone: 30% to 60% relative humidity is generally considered comfortable',
      'Monsoon: Coastal and monsoon regimes routinely exceed 80–95% RH',
    ],
    markdown: `### What is Humidity & Why Does It Matter?

**Relative Humidity (RH)** expresses the quantity of water vapor present in the ambient air as a percentage of the maximum moisture the air can hold at that dry-bulb temperature:

- **The Heat Index Factor**: When RH is elevated (>70%), human sweat cannot evaporate efficiently into the moisture-laden air. The body retains metabolic heat, resulting in a significantly higher **apparent temperature ("Feels Like")**.
- **Meteorological Significance**: High humidity combined with daytime solar insolation provides latent heat that fuels convective thunderclouds and monsoon depressions.`,
    suggestedFollowUps: [
      'What is the weather in Odisha?',
      'Show 7-day forecast for Odisha',
      'What is rainfall?',
      'What is MAUSAM?',
    ],
  },

  monsoon: {
    id: 'explain-monsoon',
    category: 'WEATHER',
    title: 'Monsoon Dynamics in India',
    summary:
      'The Indian Monsoon is a seasonal reversal of winds driven by differential thermal heating between the Indian subcontinent landmass and the Indian Ocean.',
    bullets: [
      'Southwest Monsoon (June–September): Brings over 70% of India’s annual precipitation',
      'Northeast Monsoon (October–December): Primarily impacts southeastern peninsular India (Tamil Nadu, coastal AP)',
      'Monsoon Trough: Low-pressure belt whose oscillations govern active vs. break rainfall phases',
    ],
    markdown: `### Monsoon Dynamics in the Indian Subcontinent

The **Indian Monsoon** is one of the world's most significant atmospheric phenomena, driven by the seasonal migration of the Intertropical Convergence Zone (ITCZ) and differential heating:

- **Southwest Monsoon (June–September)**: The intense summer heating of the Tibetan Plateau and northwestern plains establishes a strong thermal low. Moisture-laden southeasterly trades from the southern Indian Ocean cross the equator, veer southwesterly, and divide into the Arabian Sea and Bay of Bengal branches.
- **Northeast / Post-Monsoon (October–December)**: As the landmass cools, high pressure forms over northern India, driving northeasterly winds that pick up Bay of Bengal moisture and deliver seasonal rains to Tamil Nadu, Puducherry, and Coastal Andhra Pradesh.`,
    suggestedFollowUps: [
      'Any rainfall warnings in Odisha?',
      'Show 7-day forecast for Odisha',
      'What is rainfall?',
      'What is MAUSAM?',
    ],
  },

  agriculture: {
    id: 'what-is-agromet',
    category: 'AGRICULTURE',
    title: 'Agrometeorological Advisories & Crop Planning',
    summary:
      'Agrometeorology applies atmospheric intelligence to agricultural decision-making, such as pesticide spraying suitability, irrigation scheduling, and frost protection.',
    bullets: [
      'Spraying Suitability: Evaluates wind speed (<15 km/h) and imminent precipitation risk',
      'Soil Moisture: Tracks moisture retention across shallow and deep root zones',
      'Evapotranspiration: Guides precise irrigation volume calculation',
    ],
    markdown: `### Agrometeorological Information & Farming Advisories

**Agrometeorology** links atmospheric conditions with agricultural decision-making:

- **Spraying Suitability**: Applying chemical fertilizers or biological pest controls during high winds (>15 km/h) causes droplet drift; spraying before imminent rainfall washes chemicals into runoff.
- **Soil Moisture & Temperature**: Root zone water retention determines irrigation intervals and soil workability.
- **Crop Stages**: Extreme temperature deviations during flowering or grain-filling stages can severely reduce agricultural yields.`,
    suggestedFollowUps: [
      'What is the weather in Odisha?',
      'Any rainfall warnings in Odisha?',
      'What is rainfall?',
      'What is MAUSAM?',
    ],
  },

  cyclones: {
    id: 'cyclone-classification',
    category: 'WARNINGS',
    title: 'Cyclone Classification in India (IMD Scale)',
    summary:
      'The India Meteorological Department (IMD) classifies low-pressure systems in the North Indian Ocean (Bay of Bengal and Arabian Sea) based on 3-minute sustained maximum surface wind speeds.',
    bullets: [
      'Depression: 31–49 km/h (17–27 knots)',
      'Deep Depression: 50–61 km/h (28–33 knots)',
      'Cyclonic Storm (Named): 62–88 km/h (34–47 knots)',
      'Severe Cyclonic Storm: 89–117 km/h (48–63 knots)',
      'Very Severe Cyclonic Storm: 118–165 km/h (64–89 knots)',
      'Extremely Severe Cyclonic Storm: 166–221 km/h (90–119 knots)',
      'Super Cyclonic Storm: ≥ 222 km/h (≥ 120 knots)',
    ],
    markdown: `### Cyclone Classification in the North Indian Ocean (IMD Scale)

The **India Meteorological Department (IMD)** classifies tropical cyclonic disturbances in the Bay of Bengal and Arabian Sea according to their maximum sustained surface wind speed (3-minute average):

| Category | Sustained Wind Speed (km/h) | Wind Speed (knots) | Potential Hazard & Impact |
| :--- | :--- | :--- | :--- |
| **Depression** | **31 – 49 km/h** | 17 – 27 kts | Minor sea roughness, squally weather |
| **Deep Depression** | **50 – 61 km/h** | 28 – 33 kts | Rough seas, localized heavy rain |
| **Cyclonic Storm** | **62 – 88 km/h** | 34 – 47 kts | Named system, damage to thatched structures |
| **Severe Cyclonic Storm** | **89 – 117 km/h** | 48 – 63 kts | Structural damage, uprooted trees, storm surge |
| **Very Severe Cyclonic Storm** | **118 – 165 km/h** | 64 – 89 kts | Extensive damage, storm surge 2–4 m, power failures |
| **Extremely Severe Cyclonic Storm** | **166 – 221 km/h** | 90 – 119 kts | Catastrophic damage, storm surge 4–6 m |
| **Super Cyclonic Storm** | **≥ 222 km/h** | **≥ 120 kts** | Total destruction of infrastructure, storm surge > 6 m |

IMD issues standardized cyclone alerts: Pre-Cyclone Watch (72h), Cyclone Alert (Yellow, 48h), Cyclone Warning (Orange, 24h), and Post-Landfall Outlook (Red, 12h).`,
    suggestedFollowUps: [
      'Any rainfall warnings in Odisha?',
      'What is radar?',
      'What are weather warnings?',
      'What is MAUSAM?',
    ],
  },

  pressure: {
    id: 'what-is-pressure',
    category: 'WEATHER',
    title: 'Atmospheric & Barometric Pressure',
    summary:
      'Atmospheric pressure is the force exerted on a surface by the weight of the air column above it, measured in hectopascals (hPa) or millibars (mb).',
    bullets: [
      'Standard Sea-Level Pressure: 1013.25 hPa (1 atmosphere)',
      'Low Pressure (< 1005 hPa): Indicates converging rising air, clouds, precipitation, and cyclonic storms',
      'High Pressure (> 1018 hPa): Indicates descending stable dry air, clear skies, and gentle breezes',
      'Barometer: Instrument used to measure atmospheric pressure trends (rising or falling)',
    ],
    markdown: `### What is Atmospheric Pressure?

**Atmospheric Pressure** (or barometric pressure) is the force per unit area exerted by the weight of the atmospheric column of air pressing down on the Earth's surface:

- **Standard Sea-Level Pressure**: **1013.25 hPa** (or millibars).
- **Low-Pressure Systems**: As air warms and rises, surface pressure decreases. Surrounding air rushes inward, creating wind and uplifting moisture to form convective clouds, rain, and cyclonic storms.
- **High-Pressure Systems**: Cool air sinks, creating stable, dry, and cloudless weather with gentle breezes.
- **Why Pressure Trends Matter**: A rapid fall in barometric pressure is the primary early indicator of an approaching storm or tropical depression.`,
    suggestedFollowUps: [
      'What is the weather in Odisha?',
      'What is humidity?',
      'How are cyclones classified in India?',
      'What is MAUSAM?',
    ],
  },

  uv_index: {
    id: 'what-is-uv-index',
    category: 'WEATHER',
    title: 'Understanding the Ultraviolet (UV) Index',
    summary:
      'The UV Index is an international standard measurement of the strength of sunburn-producing ultraviolet radiation at a particular place and time.',
    bullets: [
      '0–2 (Low): Minimal sun protection required',
      '3–5 (Moderate): Wear sunglasses, hat, and sunscreen if outside',
      '6–7 (High): Protection essential; reduce direct sun exposure between 11 AM and 4 PM',
      '8–10 (Very High): Extra precaution; skin burns quickly on unprotected exposure',
      '11+ (Extreme): Full protection mandatory; unprotected skin can burn in minutes',
    ],
    markdown: `### What is the UV Index?

The **Ultraviolet (UV) Index** is an international standard scale developed by the WHO and WMO that quantifies the intensity of erythemal (sunburn-causing) solar ultraviolet radiation:

| UV Index | Exposure Category | Recommended Public Action |
| :--- | :--- | :--- |
| **0 – 2** | **Low** | Minimal risk. Wear sunglasses on bright days. |
| **3 – 5** | **Moderate** | Wear sunscreen (SPF 30+), protective hat, and seek shade during midday. |
| **6 – 7** | **High** | Protection essential. Limit direct outdoor sun between 11 AM and 3 PM. |
| **8 – 10** | **Very High** | Unprotected skin can burn quickly. Use full sun protection and stay in shade. |
| **11+** | **Extreme** | Take all precautions. Unprotected skin and eyes can burn within 10 minutes. |`,
    suggestedFollowUps: [
      'What is the weather in Odisha?',
      'What is AQI?',
      'What is humidity?',
      'What is MAUSAM?',
    ],
  },

  dew_point: {
    id: 'what-is-dew-point',
    category: 'WEATHER',
    title: 'Understanding the Dew Point',
    summary:
      'The dew point is the temperature to which air must be cooled, at constant barometric pressure, for water vapor to condense into liquid water (dew).',
    bullets: [
      'Saturation Point: When air temperature equals dew point, relative humidity is 100%',
      'Human Comfort Metric: Dew points > 20°C feel uncomfortably humid; > 24°C feel oppressive',
      'Fog & Cloud Formation: When surface air cools below its dew point, radiation fog or mist develops',
      'Frost Point: When dew point is below 0°C, moisture deposits directly as frost',
    ],
    markdown: `### What is Dew Point?

The **Dew Point** is the temperature to which ambient air must be cooled (at constant atmospheric pressure and moisture content) to reach **100% saturation**, causing water vapor to condense into liquid dew, mist, or fog:

- **Dew Point vs. Relative Humidity**: While relative humidity changes with air temperature throughout the day, the dew point is an absolute measure of the actual moisture quantity in the air.
- **Human Comfort Levels**:
  - **< 10°C (50°F)**: Dry and crisp
  - **10°C – 15°C**: Comfortable
  - **16°C – 20°C**: Becoming humid
  - **21°C – 24°C**: Sticky, muggy, and uncomfortable
  - **> 24°C (75°F)**: Oppressive, tropical, and stifling (common in Indian coastal summers)`,
    suggestedFollowUps: [
      'What is humidity?',
      'What is the weather in Odisha?',
      'What is rainfall?',
      'What is MAUSAM?',
    ],
  },

  satellites: {
    id: 'how-do-weather-satellites-work',
    category: 'RADAR',
    title: 'How Meteorological Satellites Work (INSAT Series)',
    summary:
      'Weather satellites monitor atmospheric dynamics from space using multi-spectral radiometers across visible, infrared, and water vapor bands to track cyclones, clouds, and temperature profiles.',
    bullets: [
      'Geostationary Orbits (~36,000 km): Fixed above the equator (e.g., INSAT-3D, INSAT-3DR, INSAT-3DS) providing continuous imagery every 15–30 minutes',
      'Polar-Orbiting Satellites (~800 km): Circle the Earth from pole to pole for high-resolution global scans',
      'Spectral Channels: Visible (daytime clouds), Thermal Infrared (cloud-top temperatures), and Water Vapor (tropospheric moisture flows)',
      'Cyclone Tracking: Critical for monitoring eye formation and estimating intensity using the Dvorak technique',
    ],
    markdown: `### How Do Weather Satellites Work?

**Meteorological Satellites** provide continuous remote sensing of Earth's atmosphere and oceans from space:

1. **Orbital Platforms**:
   - **Geostationary Satellites** (e.g., India's **INSAT-3D, INSAT-3DR, INSAT-3DS**) orbit at **35,786 km** matching Earth's rotation, observing the Indian subcontinent continuously.
   - **Polar-Orbiting Satellites** orbit closer (~800 km), scanning high-resolution atmospheric soundings twice daily.
2. **Imaging Payloads**:
   - **Visible (VIS)**: Measures reflected sunlight to observe cloud texture and land surface during daylight.
   - **Thermal Infrared (TIR)**: Measures radiated heat 24/7. Colder cloud tops indicate taller, more severe convective thunderstorm clouds.
   - **Water Vapor (WV)**: Detects upper-tropospheric humidity streams and jet streams even where no clouds exist.
3. **Cyclone Tracking**: Using the **Dvorak Technique**, meteorologists analyze satellite cloud patterns to estimate cyclone intensity before landfall.`,
    suggestedFollowUps: [
      'What is radar?',
      'How are cyclones classified in India?',
      'What are weather warnings?',
      'What is MAUSAM?',
    ],
  },
};

/**
 * Searches the local knowledge base for matching concepts
 */
export function findKnowledge(query: string): KnowledgeEntry | null {
  const q = (query || '')
    .trim()
    .toLowerCase()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ');

  // 1. Developer questions (Section 5 requirement)
  if (
    q.includes('who developed') ||
    q.includes('who created') ||
    q.includes('who built') ||
    q.includes('who made') ||
    q.includes('who is behind') ||
    q.includes('who are the developers') ||
    q.includes('who is the developer') ||
    q.includes('developer of mausam') ||
    q.includes('developers of mausam') ||
    q.includes('who is the author') ||
    q === 'who developed this' ||
    q === 'who created this' ||
    q === 'who made this' ||
    q === 'who built this' ||
    q === 'who developed mausam' ||
    q === 'who created mausam' ||
    q === 'who built mausam' ||
    q === 'who made mausam'
  ) {
    return DEVELOPER_KNOWLEDGE;
  }

  // 2. Direct MAUSAM platform questions
  if (
    q === 'what is mausam' ||
    q === 'what does mausam do' ||
    q === 'what can you do' ||
    q === 'how does mausam work' ||
    q === 'tell me about mausam' ||
    q === 'explain mausam' ||
    q === 'what is this platform' ||
    q === 'what is this application' ||
    q === 'what are the features of mausam' ||
    q === 'what can mausam do' ||
    q.includes('about mausam') ||
    q.includes('what is mausam') ||
    q.includes('what does mausam do') ||
    q.includes('explain mausam') ||
    q.includes('what does mausam mean') ||
    q.includes('what information can you provide') ||
    q.includes('who are you')
  ) {
    if (
      q.includes('what can you do') ||
      q.includes('features of mausam') ||
      q.includes('what information can you provide') ||
      q.includes('what can mausam do')
    ) {
      return MAUSAM_CAPABILITIES;
    }
    return MAUSAM_PLATFORM_OVERVIEW;
  }

  // If query targets a specific location (e.g. "AQI in Bhubaneswar", "rainfall in Mumbai"),
  // it is NOT a conceptual definition query.
  const isAllIndia = /\b(in india|across india|entire india|national)\b/i.test(q);
  const hasLocationTarget = !isAllIndia && /\b(in|at|for|near|around)\s+[a-z]{3,}\b/i.test(q);
  if (hasLocationTarget) {
    return null;
  }

  // 3. Conceptual Questions: AQI
  if (
    q.includes('aqi') ||
    q.includes('air quality') ||
    q.includes('air quality index')
  ) {
    if (
      q.includes('what is') ||
      q.includes('what does') ||
      q.includes('stand for') ||
      q.includes('mean') ||
      q.includes('explain') ||
      q.includes('define') ||
      q.includes('understanding') ||
      q === 'aqi'
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.aqi;
    }
  }

  // 4. Conceptual Questions: Radar
  if (
    q.includes('radar') ||
    q.includes('doppler') ||
    q.includes('dwr')
  ) {
    if (
      q.includes('what is') ||
      q.includes('how does') ||
      q.includes('how do') ||
      q.includes('explain') ||
      q.includes('define') ||
      q.includes('work') ||
      q === 'radar' ||
      q === 'doppler radar'
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.radar;
    }
  }

  // 5. Conceptual Questions: Weather Warnings
  if (
    q === 'explain weather warnings' ||
    q === 'what are weather warnings' ||
    q === 'what are warnings' ||
    q === 'explain warnings' ||
    q === 'what do warning colors mean' ||
    q === 'what is red alert' ||
    q === 'what is orange alert' ||
    q === 'what is yellow alert' ||
    q.includes('explain weather warning') ||
    q.includes('what do weather warnings mean') ||
    q.includes('what do warning colors mean')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.warnings;
  }

  // 6. Conceptual Questions: Rainfall / Monsoon / Rain Measurement
  if (
    q === 'what is rainfall' ||
    q === 'why does it rain' ||
    q === 'why is it raining' ||
    q === 'how does rain happen' ||
    q === 'explain monsoon' ||
    q === 'what is monsoon' ||
    q.includes('how is rainfall measured') ||
    q.includes('how do you measure rainfall') ||
    q.includes('how is rain measured') ||
    q.includes('rainfall measurement') ||
    q.startsWith('what is rainfall') ||
    q.startsWith('explain monsoon') ||
    q.startsWith('what is monsoon') ||
    q.startsWith('why does it rain')
  ) {
    if (q.includes('monsoon')) return DOMAIN_KNOWLEDGE_ENTRIES.monsoon;
    return DOMAIN_KNOWLEDGE_ENTRIES.rainfall;
  }

  // 7. Conceptual Questions: Humidity & Relative Humidity
  if (
    q === 'what is humidity' ||
    q === 'what is relative humidity' ||
    q === 'why is humidity important' ||
    q === 'why does humidity matter' ||
    q.startsWith('what is humidity') ||
    q.startsWith('what is relative humidity') ||
    q.startsWith('explain humidity') ||
    q.startsWith('why is humidity') ||
    q.startsWith('why does humidity')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.humidity;
  }

  // 8. Conceptual Questions: Agriculture
  if (
    q === 'what is agromet' ||
    q === 'what is agrometeorology' ||
    q.includes('agrometeorology')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.agriculture;
  }

  // 9. Conceptual Questions: Cyclones & Classification
  if (
    q.includes('cyclone') ||
    q.includes('cyclones')
  ) {
    if (
      q.includes('how are cyclones classified') ||
      q.includes('cyclone classification') ||
      q.includes('what is a cyclone') ||
      q.includes('what are cyclones') ||
      q.includes('imd scale') ||
      q.includes('depression') ||
      q.includes('super cyclone') ||
      q.startsWith('explain cyclone')
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.cyclones;
    }
  }

  // 10. Conceptual Questions: Atmospheric Pressure
  if (
    q.includes('pressure')
  ) {
    if (
      q.includes('atmospheric pressure') ||
      q.includes('barometric pressure') ||
      q === 'what is pressure' ||
      q.startsWith('what is atmospheric pressure') ||
      q.startsWith('explain atmospheric pressure') ||
      q.startsWith('what is pressure')
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.pressure;
    }
  }

  // 11. Conceptual Questions: UV Index
  if (
    q.includes('uv') ||
    q.includes('ultraviolet')
  ) {
    if (
      q.includes('uv index') ||
      q.includes('ultraviolet index') ||
      q === 'what is uv' ||
      q.startsWith('what is uv') ||
      q.startsWith('explain uv')
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.uv_index;
    }
  }

  // 12. Conceptual Questions: Dew Point
  if (
    q.includes('dew point') ||
    q.includes('dewpoint')
  ) {
    return DOMAIN_KNOWLEDGE_ENTRIES.dew_point;
  }

  // 13. Conceptual Questions: Weather Satellites
  if (
    q.includes('satellite') ||
    q.includes('insat')
  ) {
    if (
      q.includes('how do weather satellites work') ||
      q.includes('weather satellite') ||
      q.includes('how do satellites work') ||
      q.startsWith('what is insat') ||
      q.startsWith('explain weather satellite')
    ) {
      return DOMAIN_KNOWLEDGE_ENTRIES.satellites;
    }
  }

  return null;
}
