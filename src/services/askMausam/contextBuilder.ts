// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical AskMausamContext Builder
// Produces the single authoritative context object for Header, Cards & AI
// ====================================================================

import {
  AskMausamContext,
  LocationMetadata,
  DataSourceContext,
} from '../../types/askMausam';
import { getAuthoritativeWeather } from '../weather/weatherService';
import { fetchAirQualityContext } from '../air/airQualityService';
import { getActiveWarningsForLocation } from '../warnings/warningService';

export interface BuildContextOptions {
  requiredTools?: Array<'WEATHER' | 'FORECAST' | 'WARNINGS' | 'AQI' | 'AGRICULTURE' | 'MARINE'>;
  stationCode?: string;
  isCoastal?: boolean;
}

export async function buildCanonicalAskMausamContext(
  location: LocationMetadata,
  options: BuildContextOptions = {}
): Promise<AskMausamContext> {
  const tools = options.requiredTools || ['WEATHER', 'FORECAST', 'WARNINGS', 'AQI'];

  // Check coastal nature
  const coastalStates = ['odisha', 'west bengal', 'andhra pradesh', 'tamil nadu', 'kerala', 'karnataka', 'goa', 'maharashtra', 'gujarat'];
  const isCoastal = options.isCoastal ?? coastalStates.includes((location.state || '').toLowerCase());

  // Parallel fetch of required real tools
  const promises: [
    Promise<any>,
    Promise<any>,
    Promise<any>
  ] = [
    tools.includes('WEATHER') || tools.includes('FORECAST') || tools.includes('AGRICULTURE') || tools.includes('MARINE')
      ? getAuthoritativeWeather(location.latitude, location.longitude, {
          stationCode: options.stationCode || location.imdStationCode,
          isCoastal,
        })
      : Promise.resolve({ sources: [] }),

    tools.includes('AQI')
      ? fetchAirQualityContext(location.latitude, location.longitude)
      : Promise.resolve(undefined),

    tools.includes('WARNINGS')
      ? Promise.resolve(getActiveWarningsForLocation(location.state, location.district, location.name))
      : Promise.resolve({ warnings: [] }),
  ];

  const [weatherRes, aqiRes, warningsRes] = await Promise.all(promises);

  const sources: DataSourceContext[] = [...(weatherRes.sources || [])];

  if (aqiRes) {
    sources.push({
      provider: aqiRes.source || 'Central Pollution Control Board / Open-Meteo',
      status: aqiRes.status === 'AVAILABLE' ? 'LIVE' : 'UNAVAILABLE',
      retrievedAt: new Date().toISOString(),
      observedAt: aqiRes.observedAt,
    });
  }

  if (warningsRes) {
    sources.push({
      provider: warningsRes.source || 'India Meteorological Department (IMD)',
      status: warningsRes.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'LIVE',
      retrievedAt: new Date().toISOString(),
      isOfficialIMD: true,
      details: warningsRes.status === 'ACTIVE_WARNINGS' ? 'Active Severe Warning Bulletins' : 'Normal / Routine Advisory',
    });
  }

  const context: AskMausamContext = {
    location,
    currentWeather: weatherRes.current,
    forecast: weatherRes.forecast,
    warnings: warningsRes.warnings || [],
    aqi: aqiRes,
    agriculture: weatherRes.agriculture,
    marine: weatherRes.marine,
    sources,
    contextVersion: `v2.${Date.now()}`,
  };

  return context;
}
