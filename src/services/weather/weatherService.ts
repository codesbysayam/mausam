// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Unified Weather Service for Ask MAUSAM
// Executes real tools: IMD (when configured) -> Open-Meteo fallback
// ====================================================================

import {
  CurrentWeatherContext,
  ForecastContext,
  AgricultureContext,
  MarineContext,
  DataSourceContext,
} from '../../types/askMausam';
import { fetchImdObservation } from './imdAdapter';
import { fetchOpenMeteoBundle } from './openMeteoAdapter';

export interface UnifiedWeatherResult {
  current?: CurrentWeatherContext;
  forecast?: ForecastContext;
  agriculture?: AgricultureContext;
  marine?: MarineContext;
  sources: DataSourceContext[];
}

export async function getAuthoritativeWeather(
  latitude: number,
  longitude: number,
  options?: {
    stationCode?: string;
    isCoastal?: boolean;
  }
): Promise<UnifiedWeatherResult> {
  const sources: DataSourceContext[] = [];

  // 1. Try Official IMD Observation first
  const imdRes = await fetchImdObservation(options?.stationCode, latitude, longitude);
  sources.push(imdRes.source);

  // 2. Fetch Open-Meteo bundle for forecast & complete telemetry
  const openMeteoRes = await fetchOpenMeteoBundle(latitude, longitude);
  sources.push(openMeteoRes.source);

  // Determine current weather: prefer IMD if available, otherwise Open-Meteo
  let current = imdRes.available && imdRes.current ? imdRes.current : openMeteoRes.current;

  // Build agriculture context if atmospheric variables exist
  let agriculture: AgricultureContext | undefined;
  if (current) {
    const soilMoisture = openMeteoRes.soilMoisture;
    const soilTemp = openMeteoRes.soilTemperature;
    const et0 = openMeteoRes.evapotranspiration;
    const rainProb = current.precipitationProbability ?? 0;
    const rainMm = current.precipitationMm ?? 0;
    const temp = current.temperatureC;
    const humidity = current.humidity ?? 60;
    const windSpeed = current.windSpeedKmh ?? 10;

    let spraySuitability: 'OPTIMAL' | 'MODERATE' | 'NOT_RECOMMENDED' = 'OPTIMAL';
    if (rainProb > 40 || rainMm > 2 || windSpeed > 20) {
      spraySuitability = 'NOT_RECOMMENDED';
    } else if (rainProb > 20 || windSpeed > 15 || temp > 35) {
      spraySuitability = 'MODERATE';
    }

    let advisoryText = `Soil moisture is at ${soilMoisture !== undefined ? `${Math.round(soilMoisture * 100)}%` : 'seasonal levels'}. `;
    if (spraySuitability === 'NOT_RECOMMENDED') {
      advisoryText += 'Pesticide/fertilizer spraying NOT recommended due to wind/rain risk.';
    } else if (spraySuitability === 'MODERATE') {
      advisoryText += 'Exercise caution during chemical application; morning window preferred.';
    } else {
      advisoryText += 'Atmospheric conditions are favorable for spraying, irrigation scheduling, and harvesting.';
    }

    agriculture = {
      soilMoisture0To1cm: soilMoisture,
      soilTemperatureC: soilTemp,
      rainfall24hMm: rainMm,
      precipitationProbability: rainProb,
      temperatureC: temp,
      humidity,
      evapotranspirationMm: et0,
      spraySuitability,
      advisoryText,
    };
  }

  // Build marine context if coastal or requested
  let marine: MarineContext | undefined;
  if (options?.isCoastal && current) {
    const windKts = Math.round((current.windSpeedKmh ?? 10) * 0.539957);
    const estWaveHeight = Math.round((windKts * 0.1) * 10) / 10;
    marine = {
      waveHeightM: estWaveHeight,
      seaSurfaceTempC: Math.round((current.temperatureC - 2) * 10) / 10,
      tideStatus: 'Normal tidal cycle',
      windSpeedKts: windKts,
      seaCondition: windKts > 25 ? 'Rough' : windKts > 15 ? 'Moderate' : 'Smooth to Slight',
      coastalAdvisory: windKts > 25
        ? 'Fishermen advised not to venture into deep sea due to squally weather.'
        : 'Sea conditions normal for coastal navigation and artisanal fisheries.',
    };
  }

  return {
    current,
    forecast: openMeteoRes.forecast,
    agriculture,
    marine,
    sources,
  };
}
