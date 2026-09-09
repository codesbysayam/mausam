// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// IMD Adapter (India Meteorological Department)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';
import { WeatherValidator } from '../validation/weatherValidator';
import { dataHealthService } from '../services/DataHealthService';

export class IMDAdapter {
  private static baseUrl = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1';

  public static isConfigured(): boolean {
    return !!(process.env.IMD_API_KEY || process.env.IMD_API_TOKEN);
  }

  public static async fetchCurrentWeather(loc: GeoLocation, stationId: string = '42971'): Promise<NormalizedWeather | null> {
    if (!this.isConfigured()) {
      dataHealthService.recordFailure('IMD', 'IMD API credentials not configured', 401);
      return null;
    }

    const startTime = Date.now();
    try {
      const apiKey = process.env.IMD_API_KEY;
      const apiToken = process.env.IMD_API_TOKEN;

      const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': 'MAUSAM-Atmospheric-Platform/2.0',
      };
      if (apiKey) headers['X-API-KEY'] = apiKey;
      if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

      const res = await fetch(`${this.baseUrl}/observation/${stationId}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('IMD', `HTTP ${res.status}: ${res.statusText}`, res.status);
        return null;
      }

      const json = await res.json();
      if (!json || typeof json !== 'object') {
        dataHealthService.recordRejection('IMD', 1);
        return null;
      }

      const normalized: NormalizedWeather = {
        location: loc,
        observedAt: json.observation_time || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        ageSeconds: 0,
        temperature: typeof json.temperature === 'number' ? json.temperature : null,
        feelsLike: typeof json.feels_like === 'number' ? json.feels_like : null,
        humidity: typeof json.relative_humidity === 'number' ? json.relative_humidity : null,
        dewPoint: typeof json.dew_point === 'number' ? json.dew_point : null,
        pressure: typeof json.pressure === 'number' ? json.pressure : null,
        pressureTrend: json.pressure_trend || 'steady',
        windSpeed: typeof json.wind_speed === 'number' ? json.wind_speed : null,
        windDirection: json.wind_direction || 'CALM',
        windDirectionDegrees: typeof json.wind_direction_deg === 'number' ? json.wind_direction_deg : null,
        windGust: typeof json.wind_gust === 'number' ? json.wind_gust : null,
        visibility: typeof json.visibility === 'number' ? json.visibility : null,
        cloudCover: typeof json.cloud_cover === 'number' ? json.cloud_cover : null,
        precipitation: typeof json.rain_fall === 'number' ? json.rain_fall : 0,
        rainfall24h: typeof json.rainfall_24h === 'number' ? json.rainfall_24h : 0,
        uvIndex: typeof json.uv_index === 'number' ? json.uv_index : null,
        weatherCode: json.weather_code || 1,
        condition: json.weather_description || 'Clear',
        isDay: json.is_day ?? true,
        source: 'IMD',
        sourcePriority: 1,
        isFallback: false,
        rawSourceAttribution: 'India Meteorological Department (IMD), Ministry of Earth Sciences',
      };

      const validation = WeatherValidator.validateObservation(normalized);
      if (!validation.isValid) {
        dataHealthService.recordRejection('IMD', 1);
        console.warn('[IMDAdapter] Observation rejected by validator:', validation.errors);
        return null;
      }

      dataHealthService.recordSuccess('IMD', latency, 1, res.status);
      return normalized;
    } catch (err: any) {
      dataHealthService.recordFailure('IMD', err.message, 500);
      return null;
    }
  }
}
