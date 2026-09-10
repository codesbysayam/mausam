// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// IMD Provider Adapter (Official India Meteorological Department Connector)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';
import { WeatherNormalizer } from '../normalization/weatherNormalizer';

export class IMDProvider {
  private static baseUrl = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1';

  public static isConfigured(): boolean {
    return !!(process.env.IMD_API_KEY || process.env.IMD_API_TOKEN);
  }

  public static async checkHealth(): Promise<{
    configured: boolean;
    operational: boolean;
    latencyMs: number | null;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        operational: false,
        latencyMs: null,
        error: 'IMD API credentials (IMD_API_KEY) not configured',
      };
    }

    const start = Date.now();
    try {
      const apiKey = process.env.IMD_API_KEY;
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': 'MAUSAM-Atmospheric-Platform/3.0',
      };
      if (apiKey) headers['X-API-KEY'] = apiKey;

      const res = await fetch(`${this.baseUrl}/health`, {
        headers,
        signal: AbortSignal.timeout(4000),
      });

      const latencyMs = Date.now() - start;
      return {
        configured: true,
        operational: res.ok,
        latencyMs,
        error: res.ok ? undefined : `HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        configured: true,
        operational: false,
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  public static async fetchCurrentWeather(loc: GeoLocation, stationId?: string): Promise<NormalizedWeather | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const targetStation = stationId || '42971';
    try {
      const apiKey = process.env.IMD_API_KEY;
      const apiToken = process.env.IMD_API_TOKEN;
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': 'MAUSAM-Atmospheric-Platform/3.0',
      };
      if (apiKey) headers['X-API-KEY'] = apiKey;
      if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

      const res = await fetch(`${this.baseUrl}/observation/${targetStation}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (!json || typeof json !== 'object') return null;

      const observedAt = json.observation_time || new Date().toISOString();
      const { status: dataStatus, ageSeconds } = WeatherNormalizer.computeDataStatus(observedAt);

      return {
        location: loc,
        observedAt,
        fetchedAt: new Date().toISOString(),
        dataStatus,
        ageSeconds,
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
        precipitation: typeof json.rainfall === 'number' ? json.rainfall : 0,
        rainfall24h: typeof json.rainfall_24h === 'number' ? json.rainfall_24h : 0,
        uvIndex: typeof json.uv_index === 'number' ? json.uv_index : null,
        weatherCode: json.weather_code ?? 0,
        condition: json.weather_condition || 'Observed Conditions',
        isDay: true,
        source: 'IMD',
        sourcePriority: 1,
        isFallback: false,
        rawSourceAttribution: 'Official data courtesy of India Meteorological Department (IMD), Ministry of Earth Sciences.',
      };
    } catch {
      return null;
    }
  }
}
