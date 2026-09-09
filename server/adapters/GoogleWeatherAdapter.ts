// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Google Weather Adapter (Commercial / Google Maps Platform Weather SKU)
// ====================================================================

import { NormalizedWeather, GeoLocation } from '../normalization/types';
import { WeatherValidator } from '../validation/weatherValidator';
import { dataHealthService } from '../services/DataHealthService';

export class GoogleWeatherAdapter {
  private static baseUrl = 'https://weather.googleapis.com/v1';

  public static isConfigured(): boolean {
    return !!process.env.GOOGLE_WEATHER_API_KEY;
  }

  public static async fetchCurrentWeather(loc: GeoLocation): Promise<NormalizedWeather | null> {
    const apiKey = process.env.GOOGLE_WEATHER_API_KEY;
    if (!apiKey) {
      dataHealthService.recordFailure('GOOGLE_WEATHER', 'GOOGLE_WEATHER_API_KEY not configured', 401);
      return null;
    }

    const startTime = Date.now();
    try {
      const url = `${this.baseUrl}/currentConditions:lookup?key=${apiKey}&location.latitude=${loc.latitude}&location.longitude=${loc.longitude}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const latency = Date.now() - startTime;

      if (!res.ok) {
        dataHealthService.recordFailure('GOOGLE_WEATHER', `HTTP ${res.status}: ${res.statusText}`, res.status);
        return null;
      }

      const json = await res.json();
      if (!json || !json.currentConditions) {
        dataHealthService.recordRejection('GOOGLE_WEATHER', 1);
        return null;
      }

      const c = json.currentConditions;
      const normalized: NormalizedWeather = {
        location: loc,
        observedAt: c.observationTime || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        dataStatus: 'LIVE',
        ageSeconds: 0,
        temperature: typeof c.temperature?.degrees === 'number' ? c.temperature.degrees : null,
        feelsLike: typeof c.feelsLikeTemperature?.degrees === 'number' ? c.feelsLikeTemperature.degrees : null,
        humidity: typeof c.relativeHumidity === 'number' ? c.relativeHumidity : null,
        dewPoint: typeof c.dewPoint?.degrees === 'number' ? c.dewPoint.degrees : null,
        pressure: typeof c.airPressure?.millibars === 'number' ? c.airPressure.millibars : null,
        windSpeed: typeof c.wind?.speed?.kilometersPerHour === 'number' ? c.wind.speed.kilometersPerHour : null,
        windDirection: c.wind?.direction?.cardinal || null,
        windDirectionDegrees: typeof c.wind?.direction?.degrees === 'number' ? c.wind.direction.degrees : null,
        windGust: typeof c.wind?.gust?.kilometersPerHour === 'number' ? c.wind.gust.kilometersPerHour : null,
        visibility: typeof c.visibility?.kilometers === 'number' ? c.visibility.kilometers : null,
        cloudCover: typeof c.cloudCoverPercent === 'number' ? c.cloudCoverPercent : null,
        precipitation: typeof c.precipitation?.amount?.millimeters === 'number' ? c.precipitation.amount.millimeters : 0,
        rainfall24h: 0,
        uvIndex: typeof c.uvIndex === 'number' ? c.uvIndex : null,
        weatherCode: 1,
        condition: c.conditionDescription?.text || 'Clear',
        isDay: c.isDaytime ?? true,
        source: 'Google Weather',
        sourcePriority: 2,
        isFallback: false,
        rawSourceAttribution: 'Weather data provided by Google Maps Platform Weather Service.',
      };

      const validation = WeatherValidator.validateObservation(normalized);
      if (!validation.isValid) {
        dataHealthService.recordRejection('GOOGLE_WEATHER', 1);
        return null;
      }

      dataHealthService.recordSuccess('GOOGLE_WEATHER', latency, 1, res.status);
      return normalized;
    } catch (err: any) {
      dataHealthService.recordFailure('GOOGLE_WEATHER', err.message, 500);
      return null;
    }
  }
}
