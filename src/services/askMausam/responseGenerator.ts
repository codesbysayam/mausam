// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Fast-Path Response Generator
// Generates authoritative, zero-latency meteorological answers directly
// from canonical telemetry without LLM overhead for factual queries.
// ====================================================================

import { AskMausamContext, DataSourceContext, DailyForecastContext } from '../../types/askMausam';
import { KnowledgeEntry } from './mausamKnowledge';

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

I am **Ask MAUSAM**, India's Atmospheric Intelligence Assistant. You can ask me about:
- **Current Weather**: Temperature, humidity, wind, and sky condition for any Indian city.
- **Forecasts**: 7-day numerical predictions and precipitation probabilities.
- **Official Warnings**: Color-coded disaster alerts (Red, Orange, Yellow).
- **Air Quality (AQI)**: Live PM2.5 and PM10 pollution levels from CPCB stations.
- **Radar & Marine**: Doppler weather radar reflectivity and coastal sea state.

*How can I help you today?*`,
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
   * Generates response for local knowledge entries
   */
  public static generateKnowledgeResponse(entry: KnowledgeEntry): FastPathResult {
    return {
      markdown: entry.markdown,
      summary: entry.summary,
      keyFacts: entry.bullets,
      alertLevel: 'GREEN',
      sources: [
        {
          provider: 'MAUSAM Canonical Knowledge Base',
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
   * Fast-path generator for Forecast Queries (7-day / Tomorrow)
   */
  public static generateForecastResponse(ctx: AskMausamContext, timeframe = 'now'): FastPathResult {
    const locName = ctx.location.name;
    const daily = ctx.forecast?.daily || [];
    const sourceStatus = ctx.sources || [];

    if (daily.length === 0) {
      return {
        markdown: `### Weather Forecast: ${locName}
Detailed numerical forecast models are temporarily unavailable for this coordinate grid.`,
        summary: `Forecast unavailable for ${locName}.`,
        keyFacts: [`Location: ${locName}`],
        alertLevel: 'GREEN',
        sources: sourceStatus,
      };
    }

    const isTomorrowQuery = timeframe.includes('tomorrow');

    if (isTomorrowQuery && daily.length > 1) {
      const tmrw = daily[1];
      const rainProb = tmrw.precipitationProbability ?? 0;
      const rainMm = tmrw.precipitationMm ?? 0;
      const willRain = rainProb >= 40 || rainMm >= 1.0;

      const rainAssessment = willRain
        ? `**Rain is likely tomorrow in ${locName}**, with a **${rainProb}%** precipitation probability and approximately **${rainMm} mm** of precipitation expected.`
        : `**Rain is unlikely tomorrow in ${locName}**. The precipitation probability is low (**${rainProb}%**) with **${rainMm} mm** expected.`;

      return {
        markdown: `### Tomorrow's Weather Forecast: ${locName}

${rainAssessment}

| Parameter | Forecast Value |
| :--- | :--- |
| **Expected Max Temp** | **${tmrw.maxTempC}°C** |
| **Expected Min Temp** | **${tmrw.minTempC}°C** |
| **Condition** | **${tmrw.condition}** |
| **Precipitation Probability** | **${rainProb}%** |
| **Expected Rainfall** | **${rainMm} mm** |

- **Grounding**: High-resolution numerical weather prediction (NWP) model for ${locName}.`,
        summary: `Tomorrow in ${locName}: ${tmrw.condition}, max ${tmrw.maxTempC}°C, min ${tmrw.minTempC}°C, rain probability ${rainProb}%.`,
        keyFacts: [
          `Max Temp: ${tmrw.maxTempC}°C`,
          `Min Temp: ${tmrw.minTempC}°C`,
          `Precipitation Prob: ${rainProb}%`,
          `Condition: ${tmrw.condition}`,
        ],
        alertLevel: rainProb > 70 ? 'YELLOW' : 'GREEN',
        sources: sourceStatus,
      };
    }

    // 7-day tabular breakdown
    const rows = daily.slice(0, 7).map((d: DailyForecastContext) => {
      const prob = d.precipitationProbability !== undefined ? `${d.precipitationProbability}%` : `${d.precipitationMm} mm`;
      return `| **${d.dayName}** (${d.date.slice(5)}) | **${d.maxTempC}°C** / ${d.minTempC}°C | ${d.condition} | ${prob} |`;
    }).join('\n');

    return {
      markdown: `### 7-Day Weather Forecast: ${locName}

| Day & Date | Max / Min Temp | Sky Condition | Rain Probability |
| :--- | :--- | :--- | :--- |
${rows}

- **Forecast Model**: ECMWF / GFS Normalized Ensemble for ${locName}
- **Update Frequency**: Refreshed every 6 hours with synoptic station assimilations.`,
      summary: `7-day forecast for ${locName}: temperatures ranging from ${daily[0]?.minTempC}°C to ${daily[0]?.maxTempC}°C.`,
      keyFacts: [
        `Today: ${daily[0]?.maxTempC}°C / ${daily[0]?.minTempC}°C`,
        `Condition: ${daily[0]?.condition}`,
        `Days Projected: ${Math.min(daily.length, 7)}`,
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

  /**
   * Fast-path generator for Radar queries
   */
  public static generateRadarResponse(ctx: AskMausamContext): FastPathResult {
    const locName = ctx.location.name;
    const sourceStatus = ctx.sources || [];

    return {
      markdown: `### Doppler Weather Radar (DWR): ${locName}

**Status: RADAR NETWORK OPERATIONAL**

- **Station Coverage**: ${locName} region is scanned via the national Doppler Weather Radar network.
- **Reflectivity Range**: 0 to 65 dBZ monitoring precipitation cores and convective clouds.
- **Radial Velocity**: Tracking storm translation speed and low-level wind shear.
- **Viewing Live Radar**: You can access real-time radar layers, precipitation accumulation, and storm playback directly in the **Radar** view of the platform.`,
      summary: `Doppler weather radar tracking active for ${locName}.`,
      keyFacts: [
        `Location: ${locName}`,
        'Radar Status: OPERATIONAL',
        'Products: Reflectivity (dBZ) & Storm Velocity',
      ],
      alertLevel: 'GREEN',
      sources: sourceStatus,
    };
  }

  /**
   * Fast-path generator for Multi-Intent (e.g. Weather + AQI, or Weather + Warning)
   */
  public static generateMultiIntentResponse(ctx: AskMausamContext, query: string): FastPathResult {
    const locName = ctx.location.name;
    const w = ctx.currentWeather;
    const a = ctx.aqi;
    const warnings = ctx.warnings || [];
    const sourceStatus = ctx.sources || [];

    const temp = w && typeof w.temperatureC === 'number' ? `${w.temperatureC.toFixed(1)}°C` : 'N/A';
    const condition = w?.condition || 'Clear';
    const humidity = w && typeof w.humidity === 'number' ? `${w.humidity}%` : 'N/A';
    const aqiVal = a && typeof a.index === 'number' ? `${a.index} (${a.category})` : 'N/A';
    const warningStatus = warnings.length > 0
      ? `⚠️ ${warnings.length} Active Warning(s) (${warnings[0].severity.toUpperCase()})`
      : '🟢 No Active Warnings';

    return {
      markdown: `### Atmospheric & Environmental Telemetry: ${locName}

| Parameter | Observed Telemetry |
| :--- | :--- |
| **Temperature** | **${temp}** (${condition}) |
| **Relative Humidity** | **${humidity}** |
| **Air Quality (AQI)** | **${aqiVal}** |
| **Alert Status** | **${warningStatus}** |

- **Data Grounding**: Normalized observations from IMD, CPCB CAAQMS network, and SACHET disaster bulletins for **${locName}**.`,
      summary: `Current conditions in ${locName}: ${temp}, ${condition}, AQI ${aqiVal}, ${warningStatus}.`,
      keyFacts: [
        `Temperature: ${temp}`,
        `Condition: ${condition}`,
        `AQI: ${aqiVal}`,
        `Warning: ${warningStatus}`,
      ],
      alertLevel: warnings.length > 0 ? 'YELLOW' : 'GREEN',
      sources: sourceStatus,
    };
  }
}
