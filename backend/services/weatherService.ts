// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Unified Weather Service (Data Layer with Cache, DB & Multi-Source Orchestration)
// ====================================================================

import {
  NormalizedWeather,
  NormalizedForecast,
  NormalizedHourlyItem,
  NormalizedDailyItem,
  StandardApiResponse,
  GeoLocation,
} from '../normalization/types';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
import { OpenMeteoProvider } from '../providers/openMeteo';
import { IMDProvider } from '../providers/imd';
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

    // 1. Cache Check
    const cached = await cacheService.get<NormalizedWeather>(cacheKey);
    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true);
      return {
        status: 'success',
        source: cached.data.source,
        dataStatus: cached.data.dataStatus,
        observedAt: cached.data.observedAt,
        fetchedAt: cached.data.fetchedAt,
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        attribution: cached.data.rawSourceAttribution,
        data: cached.data,
      };
    }

    // 2. Fetch from Providers (IMD if configured -> Open-Meteo as Free Baseline)
    let weatherData: NormalizedWeather | null = null;
    let isFallback = false;

    if (IMDProvider.isConfigured()) {
      weatherData = await IMDProvider.fetchCurrentWeather(loc);
    }

    if (!weatherData) {
      weatherData = await OpenMeteoProvider.fetchCurrentWeather(loc);
      isFallback = IMDProvider.isConfigured(); // fallback only if primary was attempted
    }

    if (!weatherData) {
      systemHealthService.recordRequest(false);
      // Return stale cache if available
      if (cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          dataStatus: 'STALE',
          observedAt: cached.data.observedAt,
          fetchedAt: cached.data.fetchedAt,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          attribution: cached.data.rawSourceAttribution,
          data: cached.data,
        };
      }

      throw new Error(`Weather telemetry unavailable for ${loc.name} (${loc.latitude}, ${loc.longitude})`);
    }

    weatherData.isFallback = isFallback;
    systemHealthService.recordRequest(true);

    // 3. Save to Cache & Database
    await cacheService.set(cacheKey, weatherData, 'CURRENT_WEATHER', weatherData.source);
    dbService.saveWeatherObservation(weatherData).catch(() => {});

    return {
      status: 'success',
      source: weatherData.source,
      dataStatus: weatherData.dataStatus,
      observedAt: weatherData.observedAt,
      fetchedAt: weatherData.fetchedAt,
      ageSeconds: weatherData.ageSeconds,
      primarySource: weatherData.source,
      attribution: weatherData.rawSourceAttribution,
      data: weatherData,
    };
  }

  public async getForecast(loc: GeoLocation): Promise<StandardApiResponse<NormalizedForecast>> {
    const cacheKey = cacheService.generateKey('FORECAST', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const cached = await cacheService.get<NormalizedForecast>(cacheKey);
    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true);
      return {
        status: 'success',
        source: cached.data.source,
        dataStatus: 'LIVE',
        observedAt: cached.data.generatedAt,
        fetchedAt: new Date().toISOString(),
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        attribution: cached.data.sourceAttribution,
        data: cached.data,
      };
    }

    const forecast = await OpenMeteoProvider.fetchForecast(loc);
    if (!forecast) {
      systemHealthService.recordRequest(false);
      if (cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          dataStatus: 'STALE',
          observedAt: cached.data.generatedAt,
          fetchedAt: new Date().toISOString(),
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          attribution: cached.data.sourceAttribution,
          data: cached.data,
        };
      }
      throw new Error(`Forecast projection unavailable for ${loc.name}`);
    }

    systemHealthService.recordRequest(true);
    await cacheService.set(cacheKey, forecast, 'FORECAST', forecast.source);
    dbService.saveForecast(forecast).catch(() => {});

    return {
      status: 'success',
      source: forecast.source,
      dataStatus: 'LIVE',
      observedAt: forecast.generatedAt,
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      primarySource: forecast.source,
      attribution: forecast.sourceAttribution,
      data: forecast,
    };
  }

  public async getHourly(loc: GeoLocation): Promise<StandardApiResponse<NormalizedHourlyItem[]>> {
    const forecast = await this.getForecast(loc);
    return {
      status: 'success',
      source: forecast.source,
      dataStatus: forecast.dataStatus,
      observedAt: forecast.observedAt,
      fetchedAt: forecast.fetchedAt,
      ageSeconds: forecast.ageSeconds,
      primarySource: forecast.primarySource,
      attribution: forecast.attribution,
      data: forecast.data.hourly,
    };
  }

  public async getDaily(loc: GeoLocation): Promise<StandardApiResponse<NormalizedDailyItem[]>> {
    const forecast = await this.getForecast(loc);
    return {
      status: 'success',
      source: forecast.source,
      dataStatus: forecast.dataStatus,
      observedAt: forecast.observedAt,
      fetchedAt: forecast.fetchedAt,
      ageSeconds: forecast.ageSeconds,
      primarySource: forecast.primarySource,
      attribution: forecast.attribution,
      data: forecast.data.daily,
    };
  }
}

export const weatherService = WeatherService.getInstance();
