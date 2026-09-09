// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// AccuWeather Adapter (Commercial Optional Source)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';
import { WeatherValidator } from '../validation/weatherValidator';
import { dataHealthService } from '../services/DataHealthService';

export class AccuWeatherAdapter {
  private static baseUrl = 'https://dataservice.accuweather.com';

  public static isConfigured(): boolean {
    return !!process.env.ACCUWEATHER_API_KEY;
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    const apiKey = process.env.ACCUWEATHER_API_KEY;
    if (!apiKey) {
      // Gracefully unconfigured - do NOT break application
      dataHealthService.recordFailure('ACCUWEATHER', 'ACCUWEATHER_API_KEY not configured', 401);
      return null;
    }

    const startTime = Date.now();
    try {
      // 1. Geoposition search to obtain AccuWeather location key
      const geoUrl = `${this.baseUrl}/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${loc.latitude},${loc.longitude}`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(6000) });

      if (!geoRes.ok) {
        dataHealthService.recordFailure('ACCUWEATHER', `Location search HTTP ${geoRes.status}`, geoRes.status);
        return null;
      }

      const geoJson = await geoRes.json();
      const locationKey = geoJson?.Key;
      if (!locationKey) {
        dataHealthService.recordRejection('ACCUWEATHER', 1);
        return null;
      }

      // 2. Current conditions
      const condUrl = `${this.baseUrl}/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`;
      const condRes = await fetch(condUrl, { signal: AbortSignal.timeout(6000) });
      const latency = Date.now() - startTime;

      if (!condRes.ok) {
        dataHealthService.recordFailure('ACCUWEATHER', `Conditions HTTP ${condRes.status}`, condRes.status);
        return null;
      }

      const condJson = await condRes.json();
      const item = Array.isArray(condJson) ? condJson[0] : condJson;
      if (!item) {
        dataHealthService.recordRejection('ACCUWEATHER', 1);
        return null;
      }

      const tempC = item.Temperature?.Metric?.Value;
      const feelsC = item.RealFeelTemperature?.Metric?.Value;
      const humidity = item.RelativeHumidity;
      const pressureMb = item.Pressure?.Metric?.Value;
      const windKmh = item.Wind?.Speed?.Metric?.Value;
      const windDir = item.Wind?.Direction?.English;
      const windDeg = item.Wind?.Direction?.Degrees;
      const uv = item.UVIndex;

      const normalized: NormalizedWeather = {
        location: loc,
        observedAt: item.EpochTime ? new Date(item.EpochTime * 1000).toISOString() : new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        ageSeconds: 0,
        temperature: typeof tempC === 'number' ? tempC : null,
        feelsLike: typeof feelsC === 'number' ? feelsC : null,
        humidity: typeof humidity === 'number' ? humidity : null,
        dewPoint: typeof item.DewPoint?.Metric?.Value === 'number' ? item.DewPoint.Metric.Value : null,
        pressure: typeof pressureMb === 'number' ? pressureMb : null,
        windSpeed: typeof windKmh === 'number' ? windKmh : null,
        windDirection: windDir || null,
        windDirectionDegrees: typeof windDeg === 'number' ? windDeg : null,
        windGust: typeof item.WindGust?.Speed?.Metric?.Value === 'number' ? item.WindGust.Speed.Metric.Value : null,
        visibility: typeof item.Visibility?.Metric?.Value === 'number' ? item.Visibility.Metric.Value : null,
        cloudCover: typeof item.CloudCover === 'number' ? item.CloudCover : null,
        precipitation: item.HasPrecipitation ? (item.PrecipitationSummary?.PastHour?.Metric?.Value || 1) : 0,
        rainfall24h: item.PrecipitationSummary?.Past24Hours?.Metric?.Value || 0,
        uvIndex: typeof uv === 'number' ? uv : null,
        weatherCode: item.WeatherIcon || 1,
        condition: item.WeatherText || 'Clear',
        isDay: item.IsDayTime ?? true,
        source: 'AccuWeather',
        sourcePriority: 3,
        isFallback: false,
        rawSourceAttribution: 'Weather data provided by AccuWeather, Inc. © All rights reserved.',
      };

      const validation = WeatherValidator.validateObservation(normalized);
      if (!validation.isValid) {
        dataHealthService.recordRejection('ACCUWEATHER', 1);
        return null;
      }

      dataHealthService.recordSuccess('ACCUWEATHER', latency, 1, condRes.status);
      return normalized;
    } catch (err: any) {
      dataHealthService.recordFailure('ACCUWEATHER', err.message, 500);
      return null;
    }
  }
}
