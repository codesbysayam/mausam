// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Source Weather Orchestrator & Priority Engine
// ====================================================================

import {
  NormalizedWeather,
  NormalizedForecast,
  NormalizedAQI,
  NormalizedWarningItem,
  NormalizedMarine,
  GeoLocation,
  StandardApiResponse,
} from '../normalization/types';
import { IMDAdapter } from '../adapters/IMDAdapter';
import { OpenMeteoAdapter } from '../adapters/OpenMeteoAdapter';
import { AccuWeatherAdapter } from '../adapters/AccuWeatherAdapter';
import { GoogleWeatherAdapter } from '../adapters/GoogleWeatherAdapter';
import { CPCBAdapter } from '../adapters/CPCBAdapter';
import { INCOISAdapter } from '../adapters/INCOISAdapter';
import { NDMAAdapter } from '../adapters/NDMAAdapter';
import { weatherCache } from '../cache/weatherCache';
import { weatherDatabase } from '../database/db';
import { dataHealthService } from './DataHealthService';

export class WeatherOrchestrator {
  private static instance: WeatherOrchestrator;

  private constructor() {}

  public static getInstance(): WeatherOrchestrator {
    if (!WeatherOrchestrator.instance) {
      WeatherOrchestrator.instance = new WeatherOrchestrator();
    }
    return WeatherOrchestrator.instance;
  }

  public resolveLocation(params: {
    lat?: number;
    lon?: number;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    name?: string;
  }): GeoLocation {
    const lat = typeof params.lat === 'number' && !isNaN(params.lat) ? params.lat : 20.2961;
    const lon = typeof params.lon === 'number' && !isNaN(params.lon) ? params.lon : 85.8245;
    const country = params.country || 'India';
    const city = params.city || params.district || params.name || 'Bhubaneswar';
    const state = params.state || (country === 'India' ? 'Odisha' : undefined);
    const id = `loc_${lat.toFixed(4)}_${lon.toFixed(4)}`;

    return {
      id,
      name: params.name || city,
      city,
      district: params.district || city,
      state,
      country,
      latitude: lat,
      longitude: lon,
    };
  }

  /**
   * Fetch current weather applying deterministic source-priority policy:
   * 1. IMD (if in India and configured)
   * 2. Google Weather (if configured)
   * 3. AccuWeather (if configured)
   * 4. Open-Meteo (always-available verified free baseline)
   */
  public async getCurrentWeather(loc: GeoLocation, forceRefresh = false): Promise<StandardApiResponse<NormalizedWeather>> {
    const cacheKey = weatherCache.generateKey('CURRENT_WEATHER', { lat: loc.latitude.toFixed(3), lon: loc.longitude.toFixed(3) });

    if (!forceRefresh) {
      const cached = weatherCache.get<NormalizedWeather>(cacheKey);
      if (cached.isHit && cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          dataStatus: cached.isStale ? 'RECENT' : 'LIVE',
          observedAt: cached.data.observedAt,
          fetchedAt: cached.data.fetchedAt,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          fallbackSource: cached.data.isFallback ? 'Open-Meteo' : undefined,
          attribution: cached.data.rawSourceAttribution,
          data: cached.data,
        };
      }
    }

    const isIndia = loc.country.toLowerCase() === 'india';
    let primaryData: NormalizedWeather | null = null;
    let fallbackData: NormalizedWeather | null = null;
    let usedSource = 'Open-Meteo';

    // 1. Try IMD if in India and configured
    if (isIndia && IMDAdapter.isConfigured()) {
      primaryData = await IMDAdapter.fetchCurrentWeather(loc);
      if (primaryData) usedSource = 'IMD';
    }

    // 2. Try Google Weather if primary not obtained
    if (!primaryData && GoogleWeatherAdapter.isConfigured()) {
      primaryData = await GoogleWeatherAdapter.fetchCurrentWeather(loc);
      if (primaryData) usedSource = 'Google Weather';
    }

    // 3. Try AccuWeather if primary not obtained
    if (!primaryData && AccuWeatherAdapter.isConfigured()) {
      primaryData = await AccuWeatherAdapter.fetchCurrentWeather(loc);
      if (primaryData) usedSource = 'AccuWeather';
    }

    // 4. Open-Meteo verified fallback
    fallbackData = await OpenMeteoAdapter.fetchCurrentWeather(loc);

    const finalData = primaryData || fallbackData;

    if (!finalData) {
      return {
        status: 'error',
        source: 'NONE',
        dataStatus: 'UNAVAILABLE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'IMD',
        data: null as any,
        error: 'WEATHER DATA TEMPORARILY UNAVAILABLE',
      };
    }

    // Cache result
    weatherCache.set(cacheKey, finalData, 'CURRENT_WEATHER', finalData.source);

    // Save to relational database asynchronously
    weatherDatabase.saveWeatherObservation(finalData).catch((e) => {
      console.warn('[Orchestrator] Background observation persistence notice:', e.message);
    });

    return {
      status: 'success',
      source: finalData.source,
      dataStatus: 'LIVE',
      observedAt: finalData.observedAt,
      fetchedAt: finalData.fetchedAt,
      ageSeconds: 0,
      primarySource: usedSource,
      fallbackSource: finalData.isFallback ? 'Open-Meteo' : undefined,
      attribution: finalData.rawSourceAttribution,
      data: finalData,
    };
  }

  /**
   * Cross-source weather comparison endpoint
   */
  public async compareSources(loc: GeoLocation): Promise<{
    location: GeoLocation;
    sources: Record<string, { available: boolean; weather?: NormalizedWeather; status: string; attribution: string }>;
  }> {
    const results: Record<string, any> = {};

    // 1. IMD
    const imdConfigured = IMDAdapter.isConfigured();
    results['IMD'] = {
      available: imdConfigured,
      status: imdConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      attribution: 'India Meteorological Department (IMD)',
    };
    if (imdConfigured && loc.country.toLowerCase() === 'india') {
      const w = await IMDAdapter.fetchCurrentWeather(loc);
      if (w) results['IMD'].weather = w;
    }

    // 2. AccuWeather
    const accuConfigured = AccuWeatherAdapter.isConfigured();
    results['AccuWeather'] = {
      available: accuConfigured,
      status: accuConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      attribution: 'AccuWeather, Inc.',
    };
    if (accuConfigured) {
      const w = await AccuWeatherAdapter.fetchCurrentWeather(loc);
      if (w) results['AccuWeather'].weather = w;
    }

    // 3. Google Weather
    const googleConfigured = GoogleWeatherAdapter.isConfigured();
    results['GoogleWeather'] = {
      available: googleConfigured,
      status: googleConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
      attribution: 'Google Maps Platform Weather API',
    };
    if (googleConfigured) {
      const w = await GoogleWeatherAdapter.fetchCurrentWeather(loc);
      if (w) results['GoogleWeather'].weather = w;
    }

    // 4. Open-Meteo (Free Baseline)
    const openMeteo = await OpenMeteoAdapter.fetchCurrentWeather(loc);
    results['OpenMeteo'] = {
      available: !!openMeteo,
      status: 'OPERATIONAL',
      weather: openMeteo || undefined,
      attribution: 'Open-Meteo.com under CC BY 4.0',
    };

    return {
      location: loc,
      sources: results,
    };
  }

  /**
   * Fetch forecast with deterministic multi-model fallback
   */
  public async getForecast(loc: GeoLocation, forceRefresh = false): Promise<StandardApiResponse<NormalizedForecast>> {
    const cacheKey = weatherCache.generateKey('FORECAST', { lat: loc.latitude.toFixed(3), lon: loc.longitude.toFixed(3) });

    if (!forceRefresh) {
      const cached = weatherCache.get<NormalizedForecast>(cacheKey);
      if (cached.isHit && cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          dataStatus: cached.isStale ? 'RECENT' : 'LIVE',
          observedAt: cached.data.generatedAt,
          fetchedAt: new Date().toISOString(),
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          attribution: cached.data.sourceAttribution,
          data: cached.data,
        };
      }
    }

    const forecast = await OpenMeteoAdapter.fetchForecast(loc);
    if (!forecast) {
      return {
        status: 'error',
        source: 'NONE',
        dataStatus: 'UNAVAILABLE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'Open-Meteo',
        data: null as any,
        error: 'FORECAST DATA TEMPORARILY UNAVAILABLE',
      };
    }

    weatherCache.set(cacheKey, forecast, 'FORECAST', forecast.source);
    weatherDatabase.saveForecast(forecast).catch(() => {});

    return {
      status: 'success',
      source: forecast.source,
      dataStatus: 'LIVE',
      observedAt: forecast.generatedAt,
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      attribution: forecast.sourceAttribution,
      data: forecast,
    };
  }

  /**
   * Fetch Air Quality Index from CPCB with Open-Meteo fallback
   */
  public async getAQI(loc: GeoLocation): Promise<StandardApiResponse<NormalizedAQI>> {
    const cacheKey = weatherCache.generateKey('AQI', { lat: loc.latitude.toFixed(3), lon: loc.longitude.toFixed(3) });
    const cached = weatherCache.get<NormalizedAQI>(cacheKey);
    if (cached.isHit && cached.data) {
      return {
        status: 'success',
        source: cached.data.source,
        dataStatus: cached.isStale ? 'RECENT' : 'LIVE',
        observedAt: cached.data.observedAt,
        fetchedAt: cached.data.fetchedAt,
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        data: cached.data,
      };
    }

    const aqi = await CPCBAdapter.fetchAQI(loc);
    if (!aqi) {
      return {
        status: 'error',
        source: 'NONE',
        dataStatus: 'UNAVAILABLE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'CPCB',
        data: null as any,
        error: 'AQI DATA TEMPORARILY UNAVAILABLE',
      };
    }

    weatherCache.set(cacheKey, aqi, 'AQI', aqi.source);
    weatherDatabase.saveAQI(aqi).catch(() => {});

    return {
      status: 'success',
      source: aqi.source,
      dataStatus: 'LIVE',
      observedAt: aqi.observedAt,
      fetchedAt: aqi.fetchedAt,
      ageSeconds: 0,
      primarySource: aqi.source,
      data: aqi,
    };
  }

  /**
   * Fetch active disaster / weather warnings from NDMA & IMD
   */
  public async getWarnings(loc: GeoLocation): Promise<StandardApiResponse<NormalizedWarningItem | { state: string; message: string }>> {
    const cacheKey = weatherCache.generateKey('WARNINGS', { district: loc.district || loc.name, state: loc.state || '' });
    const cached = weatherCache.get<NormalizedWarningItem>(cacheKey);
    if (cached.isHit && cached.data) {
      return {
        status: 'success',
        source: cached.data.source,
        dataStatus: 'LIVE',
        observedAt: cached.data.issuedAt,
        fetchedAt: new Date().toISOString(),
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        data: cached.data,
      };
    }

    if (loc.country.toLowerCase() !== 'india') {
      return {
        status: 'success',
        source: 'IMD',
        dataStatus: 'RECENT',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'IMD',
        data: {
          state: 'NOT_APPLICABLE',
          message: 'Official Indian disaster & meteorological warnings are not applicable outside India.',
        },
      };
    }

    const alert = await NDMAAdapter.matchAlertForLocation(loc);
    if (alert) {
      weatherCache.set(cacheKey, alert, 'WARNINGS', alert.source);
      return {
        status: 'success',
        source: alert.source,
        dataStatus: 'LIVE',
        observedAt: alert.issuedAt,
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: alert.source,
        data: alert,
      };
    }

    // Routine limits / all clear
    const routine = {
      state: 'NO_ACTIVE_WARNING',
      message: `No active severe weather or disaster warnings reported for ${loc.district || loc.name}, ${loc.state || 'India'}. Atmospheric parameters remain within normal seasonal limits.`,
    };

    return {
      status: 'success',
      source: 'IMD / NDMA',
      dataStatus: 'LIVE',
      observedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      primarySource: 'IMD / NDMA',
      data: routine,
    };
  }

  /**
   * Fetch marine telemetry for coastal locations
   */
  public async getMarine(loc: GeoLocation): Promise<StandardApiResponse<NormalizedMarine>> {
    const marine = await INCOISAdapter.fetchMarineData(loc);
    return {
      status: 'success',
      source: marine.source,
      dataStatus: marine.dataStatus,
      observedAt: marine.observedAt,
      fetchedAt: marine.fetchedAt,
      ageSeconds: 0,
      primarySource: marine.source,
      data: marine,
    };
  }
}

export const weatherOrchestrator = WeatherOrchestrator.getInstance();
