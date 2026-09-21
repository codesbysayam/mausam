// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// IMD (India Meteorological Department) Official Adapter
// Provides authentic direct IMD station observation when available;
// Truthfully reports UNAVAILABLE when direct IMD API is not configured.
// ====================================================================

import { CurrentWeatherContext, DataSourceContext } from '../../types/askMausam';

export interface ImdObservationBundle {
  available: boolean;
  current?: CurrentWeatherContext;
  source: DataSourceContext;
  stationCode?: string;
  stationName?: string;
}

export async function fetchImdObservation(
  stationCodeOrId?: string,
  latitude?: number,
  longitude?: number
): Promise<ImdObservationBundle> {
  const retrievedAt = new Date().toISOString();

  // Check if official IMD API key or proxy is enabled
  const imdApiKey = typeof process !== 'undefined' ? process.env?.IMD_API_KEY : undefined;

  if (!imdApiKey) {
    return {
      available: false,
      source: {
        provider: 'India Meteorological Department (IMD)',
        status: 'UNAVAILABLE',
        retrievedAt,
        isOfficialIMD: true,
        details: 'Official IMD Direct API credentials not configured in environment. Using calibrated Open-Meteo telemetry.',
      },
    };
  }

  try {
    // If official credentials exist, query the official IMD platform
    const endpoint = `https://mausam.imd.gov.in/api/v1/observation?station=${stationCodeOrId || '42971'}`;
    const res = await fetch(endpoint, {
      headers: {
        'X-IMD-API-KEY': imdApiKey,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`IMD server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      available: true,
      current: {
        temperatureC: data.temperature,
        feelsLikeC: data.feelsLike,
        humidity: data.relativeHumidity,
        windSpeedKmh: data.windSpeed,
        windDirection: data.windDirection,
        precipitationMm: data.rainfall24h,
        condition: data.weatherDescription || 'Fair',
        pressureHpa: data.pressure,
        dewPointC: data.dewPoint,
        observedAt: data.observationTime,
      },
      source: {
        provider: 'India Meteorological Department (IMD)',
        status: 'LIVE',
        retrievedAt,
        observedAt: data.observationTime,
        isOfficialIMD: true,
        details: `Official IMD Synoptic Station (${data.stationName || stationCodeOrId})`,
      },
      stationCode: data.stationCode || stationCodeOrId,
      stationName: data.stationName,
    };
  } catch (err: any) {
    return {
      available: false,
      source: {
        provider: 'India Meteorological Department (IMD)',
        status: 'UNAVAILABLE',
        retrievedAt,
        isOfficialIMD: true,
        details: `IMD Gateway: ${err?.message || 'Connection timeout'}`,
      },
    };
  }
}
