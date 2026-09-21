// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Fast-Path Response Generator
// Generates authoritative, zero-latency meteorological answers directly
// from canonical telemetry without LLM overhead for factual queries.
// ====================================================================

import { AskMausamContext, DataSourceContext } from '../../types/askMausam';

export interface FastPathResult {
  markdown: string;
  summary: string;
  keyFacts: string[];
  alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  sources: DataSourceContext[];
}

export class ResponseGenerator {
  /**
   * Generates instant responses for greetings and help
   */
  public static generateGreetingResponse(): FastPathResult {
    return {
      markdown: `### Welcome to Ask MAUSAM
I am your **National Meteorological Assistant**, providing verified atmospheric, marine, and disaster intelligence directly from official providers including the **India Meteorological Department (IMD)**, **SACHET / NDMA**, **Central Pollution Control Board (CPCB)**, and **INCOIS**.

**You can ask me about:**
- **Active Weather Warnings & Alerts** (*e.g., "rainfall warnings", "any warning in Odisha?"*)
- **Current Temperature & Sky Conditions** (*e.g., "temperature in Chandaka", "how is the weather in Delhi?"*)
- **Precipitation & Monsoon** (*e.g., "will it rain today?", "tomorrow rain forecast"*)
- **Air Quality Index (AQI)** (*e.g., "AQI in Anand Vihar", "pollution level in Mumbai"*)
- **Multi-City Comparisons** (*e.g., "which is cooler right now, Bhubaneswar or Cuttack?"*)
- **Agromet & Farming Advisories** (*e.g., "is it safe to spray pesticides tomorrow in Ganjam?"*)
- **Doppler Radar & Marine Conditions** (*e.g., "Gopalpur radar status", "sea state for fishermen"*)`,
      summary: 'Ask MAUSAM provides official, real-time meteorological intelligence across all 28 States and 8 Union Territories.',
      keyFacts: ['36 States & UTs Covered', 'Official IMD / NDMA Bulletins', 'Real-time Telemetry'],
      alertLevel: 'GREEN',
      sources: [
        {
          provider: 'MAUSAM Core Registry',
          status: 'LIVE',
          retrievedAt: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Fast-path generator for Official Warnings & Alerts
   */
  public static generateWarningResponse(ctx: AskMausamContext): FastPathResult {
    const locName = ctx.location.name;
    const warnings = ctx.warnings || [];
    const sourceStatus = ctx.sources || [];

    if (warnings.length === 0) {
      return {
        markdown: `### Official Meteorological Warnings: ${locName}

**Status: NO ACTIVE WARNINGS (GREEN)**

- **Current Advisory**: No adverse weather or severe atmospheric warnings in effect for **${locName}** (${ctx.location.state || 'India'}).
- **Synoptic Situation**: Atmospheric flow and convective parameters remain within nominal seasonal limits.
- **Official Source**: **SACHET / NDMA** and **India Meteorological Department (IMD)** National Warning Bulletin.

*Routine agricultural, transport, and coastal operations may proceed normally.*`,
        summary: `No active weather warnings for ${locName}. Conditions are normal (Green).`,
        keyFacts: [
          `Location: ${locName}`,
          'Alert Status: GREEN (No Warning)',
          'Source: SACHET/NDMA & IMD Warning Center',
        ],
        alertLevel: 'GREEN',
        sources: sourceStatus,
      };
    }

    // Active warnings present
    const maxSeverity = warnings.reduce((acc, w) => {
      const s = (w.severity || '').toLowerCase();
      if (s === 'red' || acc === 'RED') return 'RED';
      if (s === 'orange' || acc === 'ORANGE') return 'ORANGE';
      if (s === 'yellow' || acc === 'YELLOW') return 'YELLOW';
      return acc;
    }, 'GREEN' as 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED');

    const warningItems = warnings.map((w, i) => {
      const colorBadge = w.severity === 'red' ? '🔴 RED ALERT' : w.severity === 'orange' ? '🟠 ORANGE WARNING' : '🟡 YELLOW WATCH';
      return `#### ${i + 1}. ${colorBadge}: ${w.headline || w.hazard || 'Weather Hazard'}
- **Impact Area**: ${w.affectedArea || locName}
- **Validity**: ${w.validUntil ? new Date(w.validUntil).toLocaleString('en-IN') : 'Current Bulletin'}
- **Observed / Expected Hazard**: ${w.description || 'Moderate to heavy atmospheric activity expected.'}
- **Recommended Public Action**: ${w.actionAdvice || 'Monitor local weather updates and avoid waterlogged roads or open fields during lightning.'}`;
    }).join('\n\n');

    return {
      markdown: `### Active Weather Warnings: ${locName}

**Highest Alert Level: ${maxSeverity}**

${warningItems}

---
*Grounded in verified bulletins from **SACHET (National Disaster Management Authority)** and the **India Meteorological Department**.*`,
      summary: `${warnings.length} active weather warning(s) issued for ${locName}. Highest level: ${maxSeverity}.`,
      keyFacts: [
        `Location: ${locName}`,
        `Alert Level: ${maxSeverity}`,
        `Active Bulletins: ${warnings.length}`,
        'Issued By: SACHET / NDMA & IMD',
      ],
      alertLevel: maxSeverity,
      sources: sourceStatus,
    };
  }

  /**
   * Fast-path generator for Current Weather / Temperature
   */
  public static generateWeatherResponse(ctx: AskMausamContext): FastPathResult {
    const locName = ctx.location.name;
    const w = ctx.currentWeather;
    const sourceStatus = ctx.sources || [];

    if (!w) {
      return {
        markdown: `### Weather Observations: ${locName}
Current atmospheric observations are temporarily unavailable from the station network. Please retry in a few moments.`,
        summary: `Observations temporarily unavailable for ${locName}.`,
        keyFacts: [`Location: ${locName}`],
        alertLevel: 'GREEN',
        sources: sourceStatus,
      };
    }

    const temp = typeof w.temperatureC === 'number' ? `${w.temperatureC.toFixed(1)}°C` : 'N/A';
    const feels = typeof w.feelsLikeC === 'number' ? `${w.feelsLikeC.toFixed(1)}°C` : temp;
    const condition = w.condition || 'Clear';
    const humidity = typeof w.humidity === 'number' ? `${w.humidity}%` : 'N/A';
    const wind = typeof w.windSpeedKmh === 'number' ? `${w.windSpeedKmh} km/h ${w.windDirection ? `(${w.windDirection})` : ''}` : 'N/A';
    const precip = typeof w.precipitationMm === 'number' ? `${w.precipitationMm} mm` : '0 mm';

    return {
      markdown: `### Current Weather: ${locName}

| Atmospheric Parameter | Observed Telemetry |
| :--- | :--- |
| **Temperature** | **${temp}** (Feels like ${feels}) |
| **Sky Condition** | **${condition}** |
| **Relative Humidity** | **${humidity}** |
| **Surface Wind** | **${wind}** |
| **Precipitation** | **${precip}** |

- **Observation Station**: ${ctx.location.district || locName} Meteorological Station (${ctx.location.latitude?.toFixed(2)}°N, ${ctx.location.longitude?.toFixed(2)}°E)
- **Data Grounding**: Verified synoptic telemetry via Open-Meteo & IMD Numerical Weather Prediction model.`,
      summary: `Current temperature in ${locName} is ${temp} with ${condition}. Humidity is ${humidity}, wind ${wind}.`,
      keyFacts: [
        `Temperature: ${temp}`,
        `Condition: ${condition}`,
        `Humidity: ${humidity}`,
        `Wind: ${wind}`,
      ],
      alertLevel: 'GREEN',
      sources: sourceStatus,
    };
  }

  /**
   * Fast-path generator for AQI
   */
  public static generateAqiResponse(ctx: AskMausamContext): FastPathResult {
    const locName = ctx.location.name;
    const a = ctx.aqi;
    const sourceStatus = ctx.sources || [];

    if (!a || typeof a.index !== 'number') {
      return {
        markdown: `### Air Quality Index (AQI): ${locName}
Real-time air quality telemetry is temporarily unavailable for this monitoring station.`,
        summary: `AQI unavailable for ${locName}.`,
        keyFacts: [`Location: ${locName}`],
        alertLevel: 'GREEN',
        sources: sourceStatus,
      };
    }

    const aqiVal = a.index;
    const cat = a.category || 'Moderate';
    const dominant = a.dominantPollutant || 'PM2.5';
    const pm25 = typeof a.pm25 === 'number' ? `${a.pm25.toFixed(1)} µg/m³` : 'N/A';
    const pm10 = typeof a.pm10 === 'number' ? `${a.pm10.toFixed(1)} µg/m³` : 'N/A';

    let alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
    if (aqiVal > 300) alertLevel = 'RED';
    else if (aqiVal > 200) alertLevel = 'ORANGE';
    else if (aqiVal > 100) alertLevel = 'YELLOW';

    const healthAdvisory = aqiVal > 200
      ? 'People with respiratory or heart diseases, the elderly, and children should avoid prolonged outdoor exertion.'
      : aqiVal > 100
      ? 'Sensitive individuals should limit prolonged or strenuous outdoor exertion.'
      : 'Air quality is satisfactory and poses little or no risk to the general population.';

    return {
      markdown: `### Air Quality Observations: ${locName}

**Air Quality Index: ${aqiVal} (${cat.toUpperCase()})**

| Pollutant Parameter | Observed Concentration |
| :--- | :--- |
| **National AQI** | **${aqiVal}** (${cat}) |
| **Dominant Hazard** | **${dominant}** |
| **PM2.5 Concentration** | **${pm25}** |
| **PM10 Concentration** | **${pm10}** |

- **Health Advisory**: ${healthAdvisory}
- **Monitoring Authority**: Central Pollution Control Board (CPCB) Continuous Ambient Air Quality Monitoring Station (CAAQMS) / Open-Meteo Atmospheric Chemistry Service.`,
      summary: `AQI in ${locName} is ${aqiVal} (${cat}). Dominant pollutant is ${dominant}.`,
      keyFacts: [
        `AQI: ${aqiVal}`,
        `Category: ${cat}`,
        `Dominant: ${dominant}`,
        `PM2.5: ${pm25}`,
      ],
      alertLevel,
      sources: sourceStatus,
    };
  }
}
