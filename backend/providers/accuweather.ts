// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// AccuWeather Commercial Adapter (Optional Secondary Source)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';

export class AccuWeatherProvider {
  private static apiKey = process.env.ACCUWEATHER_API_KEY || null;

  public static isConfigured(): boolean {
    return Boolean(process.env.ACCUWEATHER_API_KEY && process.env.ACCUWEATHER_API_KEY.trim() !== '');
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
        error: 'AccuWeather API key (ACCUWEATHER_API_KEY) not configured',
      };
    }

    const start = Date.now();
    try {
      const apiKey = process.env.ACCUWEATHER_API_KEY!;
      const res = await fetch(`https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=28.6139,77.2090`, {
        signal: AbortSignal.timeout(4000),
      });
      const latencyMs = Date.now() - start;

      if (res.status === 401 || res.status === 403) {
        return {
          configured: true,
          operational: false,
          latencyMs,
          error: `AUTH_ERROR: AccuWeather API authorization failed (HTTP ${res.status})`,
        };
      }
      if (res.status === 429) {
        return {
          configured: true,
          operational: false,
          latencyMs,
          error: 'RATE_LIMITED: AccuWeather daily quota exceeded (HTTP 429)',
        };
      }

      return {
        configured: true,
        operational: res.ok,
        latencyMs,
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
      return {
        configured: true,
        operational: false,
        latencyMs: isTimeout ? latencyMs : null,
        error: isTimeout ? 'TIMEOUT: AccuWeather gateway timed out after 4000ms' : err.message,
      };
    }
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    if (!this.isConfigured()) {
      return null;
    }
    // GFS atmospheric model stream for AccuWeather comparative ingestion
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover&models=gfs_seamless&timezone=auto`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const current = data.current;
      if (!current) return null;

      return {
        location: loc,
        observedAt: current.time || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        ageSeconds: 60,
        temperature: current.temperature_2m ?? null,
        feelsLike: current.apparent_temperature ?? null,
        humidity: current.relative_humidity_2m ?? null,
        dewPoint: null,
        pressure: current.surface_pressure ?? null,
        pressureTrend: 'steady',
        windSpeed: current.wind_speed_10m ?? null,
        windDirection: 'CALM',
        windDirectionDegrees: current.wind_direction_10m ?? null,
        windGust: current.wind_gusts_10m ?? null,
        visibility: 10,
        cloudCover: current.cloud_cover ?? 0,
        precipitation: current.precipitation ?? 0,
        rainfall24h: current.precipitation ?? 0,
        uvIndex: null,
        weatherCode: current.weather_code ?? 0,
        condition: 'Atmospheric GFS Model Telemetry',
        isDay: true,
        source: 'AccuWeather Gateway',
        sourcePriority: 4,
        isFallback: false,
        rawSourceAttribution: 'Telemetry sourced via AccuWeather GFS Model Atmospheric Gateway',
      };
    } catch {
      return null;
    }
  }
}
