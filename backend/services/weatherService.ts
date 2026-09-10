// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Weather Service (Current Weather, Forecasts, Hourly, Daily)
// Multi-Tier Caching, PostgreSQL Logging & Normalized Response
// ====================================================================

import {
  NormalizedWeather,
  NormalizedForecast,
  StandardApiResponse,
  GeoLocation,
} from '../normalization/types';
import { OpenMeteoProvider } from '../providers/openMeteo';
import { IMDProvider } from '../providers/imd';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
import { systemHealthService } from './systemHealthService';

export class WeatherService {
  private static instance: WeatherService;

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  public async getCurrentWeather(loc: GeoLocation): Promise<StandardApiResponse<NormalizedWeather>> {
    const cacheKey = cacheService.generateKey('CURRENT_WEATHER', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    // 1. Check Cache
    const cached = await cacheService.get<NormalizedWeather>(cacheKey);
    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true, cached.data.source === 'IMD' ? 'IMD' : 'OPEN_METEO');
      const nowStr = new Date().toISOString();
      return {
        status: 'success',
        source: cached.data.source,
        provider: cached.data.source,
        dataStatus: cached.data.dataStatus,
        observedAt: cached.data.observedAt,
        receivedAt: cached.data.fetchedAt || nowStr,
        fetchedAt: cached.data.fetchedAt || nowStr,
        cached: true,
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        attribution: cached.data.rawSourceAttribution,
        data: cached.data,
        error: null,
      };
    }

    // 2. Fetch from Providers (IMD if configured -> Open-Meteo as Free Baseline)
    let weatherData: NormalizedWeather | null = null;
    let isFallback = false;
    const startTime = Date.now();

    if (IMDProvider.isConfigured()) {
      weatherData = await IMDProvider.fetchCurrentWeather(loc);
    }

    if (!weatherData) {
      weatherData = await OpenMeteoProvider.fetchCurrentWeather(loc);
      isFallback = IMDProvider.isConfigured();
    }

    const latencyMs = Date.now() - startTime;

    if (!weatherData) {
      systemHealthService.recordRequest(false, 'OPEN_METEO', latencyMs, 'Data unavailable');
      if (cached.data) {
        const nowStr = new Date().toISOString();
        return {
          status: 'success',
          source: cached.data.source,
          provider: cached.data.source,
          dataStatus: 'STALE',
          observedAt: cached.data.observedAt,
          receivedAt: cached.data.fetchedAt || nowStr,
          fetchedAt: cached.data.fetchedAt || nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          attribution: cached.data.rawSourceAttribution,
          data: cached.data,
          error: null,
        };
      }

      throw new Error(`Weather telemetry unavailable for ${loc.name} (${loc.latitude}, ${loc.longitude})`);
    }

    weatherData.isFallback = isFallback;
    systemHealthService.recordRequest(true, weatherData.source === 'IMD' ? 'IMD' : 'OPEN_METEO', latencyMs);

    // 3. Save to Cache & Database
    await cacheService.set(cacheKey, weatherData, 'CURRENT_WEATHER', weatherData.source);
    dbService.saveWeatherObservation(weatherData).catch(() => {});

    const nowStr = new Date().toISOString();
    return {
      status: 'success',
      source: weatherData.source,
      provider: weatherData.source,
      dataStatus: weatherData.dataStatus,
      observedAt: weatherData.observedAt,
      receivedAt: weatherData.fetchedAt || nowStr,
      fetchedAt: weatherData.fetchedAt || nowStr,
      cached: false,
      ageSeconds: weatherData.ageSeconds,
      primarySource: weatherData.source,
      attribution: weatherData.rawSourceAttribution,
      data: weatherData,
      error: null,
    };
  }

  public async getForecast(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast>> {
    const cacheKey = cacheService.generateKey('FORECAST', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const cached = await cacheService.get<NormalizedForecast>(cacheKey);
    const nowStr = new Date().toISOString();

    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true, 'OPEN_METEO');
      return {
        status: 'success',
        source: cached.data.source,
        provider: cached.data.source,
        dataStatus: 'LIVE',
        observedAt: cached.data.generatedAt,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: true,
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        attribution: cached.data.sourceAttribution,
        data: cached.data,
        error: null,
      };
    }

    const startTime = Date.now();
    const forecast = await OpenMeteoProvider.fetchForecast(loc);
    const latency = Date.now() - startTime;

    if (!forecast) {
      systemHealthService.recordRequest(false, 'OPEN_METEO', latency, 'Forecast unavailable');
      if (cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          provider: cached.data.source,
          dataStatus: 'STALE',
          observedAt: cached.data.generatedAt,
          receivedAt: nowStr,
          fetchedAt: nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          attribution: cached.data.sourceAttribution,
          data: cached.data,
          error: null,
        };
      }
      throw new Error(`Forecast unavailable for ${loc.name}`);
    }

    systemHealthService.recordRequest(true, 'OPEN_METEO', latency);
    await cacheService.set(cacheKey, forecast, 'FORECAST', forecast.source);
    dbService.saveForecast(forecast).catch(() => {});

    return {
      status: 'success',
      source: forecast.source,
      provider: forecast.source,
      dataStatus: 'LIVE',
      observedAt: forecast.generatedAt,
      receivedAt: nowStr,
      fetchedAt: nowStr,
      cached: false,
      ageSeconds: 0,
      primarySource: forecast.source,
      attribution: forecast.sourceAttribution,
      data: forecast,
      error: null,
    };
  }

  public async getHourly(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast['hourly']>> {
    const forecastRes = await this.getForecast(loc);
    return {
      ...forecastRes,
      data: forecastRes.data.hourly,
    };
  }

  public async getDaily(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast['daily']>> {
    const forecastRes = await this.getForecast(loc);
    return {
      ...forecastRes,
      data: forecastRes.data.daily,
    };
  }
}

export const weatherService = WeatherService.getInstance();
