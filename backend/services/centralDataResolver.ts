// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Central Data Resolution Engine (resolveData)
// Single Source of Truth for Provider Prioritization, Safe Retries,
// Normalization, Transparent Fallback & Multi-Tier Caching
// ====================================================================

import {
  GeoLocation,
  DataStatus,
  StandardApiResponse,
  NormalizedWeather,
  NormalizedForecast,
  NormalizedAQI,
  NormalizedWarningItem,
  NormalizedMarine,
  RadarFrameInfo,
} from '../normalization/types';
import { IMDProvider } from '../providers/imd';
import { OpenMeteoProvider } from '../providers/openMeteo';
import { CPCBProvider } from '../providers/cpcb';
import { SachetProvider } from '../providers/sachet';
import { INCOISProvider } from '../providers/incois';
import { RadarProvider } from '../providers/radar';
import { cacheService, CacheCategory } from '../cache/cacheService';
import { dbService } from '../database/db';
import { systemHealthService } from './systemHealthService';
import { findNearestRadarStation } from '../../src/data/radarStations';
import { WarningsResponseData } from './warningService';
import { UnifiedRadarResponse } from './radarService';

export type ResolvableSourceType =
  | 'WEATHER'
  | 'FORECAST'
  | 'HOURLY'
  | 'DAILY'
  | 'AQI'
  | 'WARNINGS'
  | 'MARINE'
  | 'RADAR';

export interface ResolveOptions {
  forceRefresh?: boolean;
  stationId?: string;
  bypassCache?: boolean;
}

/**
 * Executes an asynchronous function with limited exponential-backoff retries
 * exclusively for transient failures (timeout, HTTP 429, HTTP 5xx, connection dropped).
 */
async function withTransientRetry<T>(
  action: () => Promise<T>,
  options: { maxRetries?: number; initialDelayMs?: number; backoffFactor?: number } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const initialDelayMs = options.initialDelayMs ?? 300;
  const backoffFactor = options.backoffFactor ?? 2;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await action();
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.name === 'AbortError' ||
        err?.name === 'TimeoutError' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ENOTFOUND' ||
        /429|500|502|503|504|timeout|network|socket/i.test(err?.message || '');

      if (!isTransient || attempt > maxRetries) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }
}

export class CentralDataResolver {
  private static instance: CentralDataResolver;

  public static getInstance(): CentralDataResolver {
    if (!CentralDataResolver.instance) {
      CentralDataResolver.instance = new CentralDataResolver();
    }
    return CentralDataResolver.instance;
  }

  /**
   * Universal Data Resolution Function (resolveData)
   * Enforces: Primary -> Fallback -> Cache -> Truthful Unavailable
   */
  public async resolveData<T = any>(
    sourceType: ResolvableSourceType,
    location: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<T>> {
    switch (sourceType) {
      case 'WEATHER':
        return (await this.resolveWeather(location, options)) as unknown as StandardApiResponse<T>;
      case 'FORECAST':
        return (await this.resolveForecast(location, options)) as unknown as StandardApiResponse<T>;
      case 'AQI':
        return (await this.resolveAQI(location, options)) as unknown as StandardApiResponse<T>;
      case 'WARNINGS':
        return (await this.resolveWarnings(location, options)) as unknown as StandardApiResponse<T>;
      case 'MARINE':
        return (await this.resolveMarine(location, options)) as unknown as StandardApiResponse<T>;
      case 'RADAR':
        return (await this.resolveRadar(location, options)) as unknown as StandardApiResponse<T>;
      default:
        throw new Error(`Unsupported source type for central resolution: ${sourceType}`);
    }
  }

  // ====================================================================
  // 1. WEATHER RESOLUTION
  // Rule: IMD (if configured) -> Open-Meteo (Free Fallback) -> Cache -> Unavailable
  // ====================================================================
  public async resolveWeather(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<NormalizedWeather>> {
    const cacheKey = cacheService.generateKey('CURRENT_WEATHER', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const nowStr = new Date().toISOString();

    // 1. Check Cache (if not bypassing)
    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<NormalizedWeather>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, cached.data.source === 'IMD' ? 'IMD' : 'OPEN_METEO');
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
          fallbackUsed: cached.data.isFallback,
          primaryProvider: 'IMD',
          primaryStatus: IMDProvider.isConfigured() ? 'OPERATIONAL' : 'NOT_CONFIGURED',
          attribution: cached.data.rawSourceAttribution,
          data: cached.data,
          error: null,
        };
      }
    }

    let weatherData: NormalizedWeather | null = null;
    let fallbackUsed = false;
    let primaryStatus: DataStatus = IMDProvider.isConfigured() ? 'UNAVAILABLE' : 'NOT_CONFIGURED';
    let primaryReason = IMDProvider.isConfigured()
      ? 'IMD upstream gateway temporarily unreachable'
      : 'Official IMD credentials/access not configured';
    const startTime = Date.now();

    // 2. Try Primary Provider (IMD) if configured
    if (IMDProvider.isConfigured()) {
      try {
        weatherData = await withTransientRetry(() =>
          IMDProvider.fetchCurrentWeather(loc, options.stationId)
        );
        if (weatherData) {
          primaryStatus = 'OPERATIONAL';
          systemHealthService.recordRequest(true, 'IMD', Date.now() - startTime);
        }
      } catch (err: any) {
        systemHealthService.recordRequest(false, 'IMD', Date.now() - startTime, err.message);
      }
    }

    // 3. Fallback to Open-Meteo as Free Baseline Engine
    if (!weatherData) {
      try {
        const omStart = Date.now();
        weatherData = await withTransientRetry(() =>
          OpenMeteoProvider.fetchCurrentWeather(loc)
        );
        if (weatherData) {
          fallbackUsed = true;
          systemHealthService.recordRequest(true, 'OPEN_METEO', Date.now() - omStart);
        }
      } catch (err: any) {
        systemHealthService.recordRequest(false, 'OPEN_METEO', Date.now() - startTime, err.message);
      }
    }

    // 4. Handle Result or Cache Fallback
    if (weatherData) {
      weatherData.isFallback = fallbackUsed;
      await cacheService.set(cacheKey, weatherData, 'CURRENT_WEATHER', weatherData.source);
      dbService.saveWeatherObservation(weatherData).catch(() => {});

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
        fallbackUsed,
        primaryProvider: 'IMD',
        primaryStatus,
        fallbackProvider: fallbackUsed ? 'Open-Meteo' : undefined,
        reason: fallbackUsed ? primaryReason : undefined,
        nextAction:
          primaryStatus === 'NOT_CONFIGURED'
            ? 'Configure IMD credentials/access to enable official IMD data.'
            : undefined,
        attribution: weatherData.rawSourceAttribution,
        data: weatherData,
        error: null,
      };
    }

    // 5. If live providers failed, check if stale cache exists
    const staleCache = await cacheService.get<NormalizedWeather>(cacheKey);
    if (staleCache.data) {
      return {
        status: 'success',
        source: staleCache.data.source,
        provider: staleCache.data.source,
        dataStatus: 'STALE',
        observedAt: staleCache.data.observedAt,
        receivedAt: staleCache.data.fetchedAt || nowStr,
        fetchedAt: staleCache.data.fetchedAt || nowStr,
        cached: true,
        ageSeconds: staleCache.ageSeconds,
        primarySource: staleCache.data.source,
        fallbackUsed: true,
        primaryProvider: 'IMD',
        primaryStatus: 'UNAVAILABLE',
        reason: 'Real-time providers unavailable; serving valid cached telemetry',
        attribution: staleCache.data.rawSourceAttribution,
        data: staleCache.data,
        error: null,
      };
    }

    // 6. Complete Unavailability
    throw new Error(`Weather telemetry unavailable for ${loc.name} (${loc.latitude}, ${loc.longitude})`);
  }

  // ====================================================================
  // 2. FORECAST RESOLUTION
  // Rule: IMD (if configured) -> Open-Meteo (Free Fallback) -> Cache -> Unavailable
  // ====================================================================
  public async resolveForecast(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<NormalizedForecast>> {
    const cacheKey = cacheService.generateKey('FORECAST', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const nowStr = new Date().toISOString();

    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<NormalizedForecast>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, cached.data.source === 'IMD' ? 'IMD' : 'OPEN_METEO');
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
          fallbackUsed: cached.data.source !== 'IMD',
          primaryProvider: 'IMD',
          primaryStatus: IMDProvider.isConfigured() ? 'OPERATIONAL' : 'NOT_CONFIGURED',
          attribution: cached.data.sourceAttribution,
          data: cached.data,
          error: null,
        };
      }
    }

    let forecastData: NormalizedForecast | null = null;
    let fallbackUsed = false;
    let primaryStatus: DataStatus = IMDProvider.isConfigured() ? 'UNAVAILABLE' : 'NOT_CONFIGURED';
    let primaryReason = IMDProvider.isConfigured()
      ? 'IMD forecast gateway temporarily unreachable'
      : 'Official IMD credentials/access not configured';
    const startTime = Date.now();

    if (IMDProvider.isConfigured()) {
      try {
        forecastData = await withTransientRetry(() =>
          IMDProvider.fetchForecast(loc, options.stationId)
        );
        if (forecastData) {
          primaryStatus = 'OPERATIONAL';
          systemHealthService.recordRequest(true, 'IMD', Date.now() - startTime);
        }
      } catch (err: any) {
        systemHealthService.recordRequest(false, 'IMD', Date.now() - startTime, err.message);
      }
    }

    if (!forecastData) {
      try {
        const omStart = Date.now();
        forecastData = await withTransientRetry(() =>
          OpenMeteoProvider.fetchForecast(loc)
        );
        if (forecastData) {
          fallbackUsed = true;
          systemHealthService.recordRequest(true, 'OPEN_METEO', Date.now() - omStart);
        }
      } catch (err: any) {
        systemHealthService.recordRequest(false, 'OPEN_METEO', Date.now() - startTime, err.message);
      }
    }

    if (forecastData) {
      await cacheService.set(cacheKey, forecastData, 'FORECAST', forecastData.source);
      dbService.saveForecast(forecastData).catch(() => {});

      return {
        status: 'success',
        source: forecastData.source,
        provider: forecastData.source,
        dataStatus: 'LIVE',
        observedAt: forecastData.generatedAt,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: forecastData.source,
        fallbackUsed,
        primaryProvider: 'IMD',
        primaryStatus,
        fallbackProvider: fallbackUsed ? 'Open-Meteo' : undefined,
        reason: fallbackUsed ? primaryReason : undefined,
        nextAction:
          primaryStatus === 'NOT_CONFIGURED'
            ? 'Configure IMD credentials/access to enable official IMD data.'
            : undefined,
        attribution: forecastData.sourceAttribution,
        data: forecastData,
        error: null,
      };
    }

    const staleCache = await cacheService.get<NormalizedForecast>(cacheKey);
    if (staleCache.data) {
      return {
        status: 'success',
        source: staleCache.data.source,
        provider: staleCache.data.source,
        dataStatus: 'STALE',
        observedAt: staleCache.data.generatedAt,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: true,
        ageSeconds: staleCache.ageSeconds,
        primarySource: staleCache.data.source,
        fallbackUsed: true,
        primaryProvider: 'IMD',
        primaryStatus: 'UNAVAILABLE',
        reason: 'Real-time forecast providers unavailable; serving cached numerical model data',
        attribution: staleCache.data.sourceAttribution,
        data: staleCache.data,
        error: null,
      };
    }

    throw new Error(`Forecast unavailable for ${loc.name}`);
  }

  // ====================================================================
  // 3. AIR QUALITY RESOLUTION
  // Rule: CPCB -> Verified configured source (Open-Meteo CAMS) -> Cache -> NO VERIFIED AQI DATA
  // Zero fabricated AQI
  // ====================================================================
  public async resolveAQI(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<NormalizedAQI | null>> {
    const cacheKey = cacheService.generateKey('AQI', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const nowStr = new Date().toISOString();

    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<NormalizedAQI>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, 'CPCB');
        return {
          status: 'success',
          source: cached.data.source,
          provider: 'CPCB',
          dataStatus: cached.data.dataStatus,
          observedAt: cached.data.observedAt,
          receivedAt: cached.data.fetchedAt || nowStr,
          fetchedAt: cached.data.fetchedAt || nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          fallbackUsed: cached.data.source !== 'CPCB',
          primaryProvider: 'CPCB',
          primaryStatus: CPCBProvider.isConfigured() ? 'OPERATIONAL' : 'NOT_CONFIGURED',
          data: cached.data,
          error: null,
        };
      }
    }

    const start = Date.now();
    let aqiData: NormalizedAQI | null = null;
    let fallbackUsed = false;

    try {
      aqiData = await withTransientRetry(() => CPCBProvider.fetchAQI(loc));
      if (aqiData) {
        fallbackUsed = aqiData.source !== 'CPCB';
        systemHealthService.recordRequest(true, 'CPCB', Date.now() - start);
      }
    } catch (err: any) {
      systemHealthService.recordRequest(false, 'CPCB', Date.now() - start, err.message);
    }

    if (aqiData) {
      await cacheService.set(cacheKey, aqiData, 'AQI', aqiData.source);
      dbService.saveAQI(aqiData).catch(() => {});

      return {
        status: 'success',
        source: aqiData.source,
        provider: 'CPCB',
        dataStatus: aqiData.dataStatus,
        observedAt: aqiData.observedAt,
        receivedAt: aqiData.fetchedAt || nowStr,
        fetchedAt: aqiData.fetchedAt || nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: aqiData.source,
        fallbackUsed,
        primaryProvider: 'CPCB',
        primaryStatus: CPCBProvider.isConfigured() ? 'OPERATIONAL' : 'NOT_CONFIGURED',
        fallbackProvider: fallbackUsed ? aqiData.source : undefined,
        reason: fallbackUsed ? 'Direct CPCB CAAQMS not configured; using verified atmospheric chemistry fallback' : undefined,
        nextAction: !CPCBProvider.isConfigured() ? 'Configure CPCB_API_KEY to enable direct CAAQMS telemetry.' : undefined,
        data: aqiData,
        error: null,
      };
    }

    // Try stale cache
    const staleCache = await cacheService.get<NormalizedAQI>(cacheKey);
    if (staleCache.data) {
      return {
        status: 'success',
        source: staleCache.data.source,
        provider: 'CPCB',
        dataStatus: 'STALE',
        observedAt: staleCache.data.observedAt,
        receivedAt: staleCache.data.fetchedAt || nowStr,
        fetchedAt: staleCache.data.fetchedAt || nowStr,
        cached: true,
        ageSeconds: staleCache.ageSeconds,
        primarySource: staleCache.data.source,
        fallbackUsed: true,
        primaryProvider: 'CPCB',
        primaryStatus: 'UNAVAILABLE',
        reason: 'Air quality observation services unreachable; serving cached observations',
        data: staleCache.data,
        error: null,
      };
    }

    // Truthful unavailability: Zero fabricated values
    return {
      status: 'error',
      source: 'CPCB',
      provider: 'CPCB',
      dataStatus: 'UNAVAILABLE',
      observedAt: nowStr,
      receivedAt: nowStr,
      fetchedAt: nowStr,
      cached: false,
      ageSeconds: 0,
      primarySource: 'CPCB',
      fallbackUsed: false,
      primaryProvider: 'CPCB',
      primaryStatus: 'UNAVAILABLE',
      reason: 'Real air quality data could not be retrieved from verified monitors.',
      data: null,
      error: 'NO VERIFIED AQI DATA',
    };
  }

  // ====================================================================
  // 4. DISASTER WARNINGS RESOLUTION
  // Rule: SACHET / NDMA -> cached active alerts (expired removed) -> UNAVAILABLE
  // ====================================================================
  public async resolveWarnings(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<WarningsResponseData>> {
    const cacheKey = cacheService.generateKey('WARNINGS', {
      district: (loc.district || loc.name || '').toLowerCase(),
      state: (loc.state || '').toLowerCase(),
    });

    const nowStr = new Date().toISOString();

    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<WarningsResponseData>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, 'SACHET');
        return {
          status: 'success',
          source: 'NDMA / SACHET',
          provider: 'SACHET',
          dataStatus: 'LIVE',
          observedAt: nowStr,
          receivedAt: nowStr,
          fetchedAt: nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: 'NDMA / SACHET',
          fallbackUsed: false,
          primaryProvider: 'SACHET',
          primaryStatus: 'OPERATIONAL',
          attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
          data: cached.data,
          error: null,
        };
      }
    }

    const start = Date.now();
    try {
      const activeWarnings = await withTransientRetry(() =>
        SachetProvider.getActiveWarningsForLocation(loc)
      );
      const latency = Date.now() - start;
      systemHealthService.recordRequest(true, 'SACHET', latency);

      const hasActive = activeWarnings.length > 0;
      const responseData: WarningsResponseData = {
        hasActiveWarnings: hasActive,
        count: activeWarnings.length,
        warnings: activeWarnings,
        message: hasActive
          ? undefined
          : `ALL CLEAR: No active severe weather or disaster warnings reported for ${loc.district || loc.name}, ${loc.state || 'India'}. Atmospheric parameters remain within normal seasonal limits.`,
      };

      await cacheService.set(cacheKey, responseData, 'WARNINGS', 'NDMA / SACHET');

      for (const w of activeWarnings) {
        dbService.saveWarning(w).catch(() => {});
      }

      return {
        status: 'success',
        source: 'NDMA / SACHET',
        provider: 'SACHET',
        dataStatus: 'LIVE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'NDMA / SACHET',
        fallbackUsed: false,
        primaryProvider: 'SACHET',
        primaryStatus: 'OPERATIONAL',
        attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        data: responseData,
        error: null,
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      systemHealthService.recordRequest(false, 'SACHET', latency, err.message);

      // Check cache for valid active alerts, removing expired
      const stale = await cacheService.get<WarningsResponseData>(cacheKey);
      if (stale.data && Array.isArray(stale.data.warnings)) {
        const nowEpoch = Date.now();
        const unexpired = stale.data.warnings.filter((w) => {
          if (!w.validUntil) return true;
          return new Date(w.validUntil).getTime() > nowEpoch;
        });

        return {
          status: 'success',
          source: 'NDMA / SACHET',
          provider: 'SACHET',
          dataStatus: 'STALE',
          observedAt: nowStr,
          receivedAt: nowStr,
          fetchedAt: nowStr,
          cached: true,
          ageSeconds: stale.ageSeconds,
          primarySource: 'NDMA / SACHET',
          fallbackUsed: false,
          primaryProvider: 'SACHET',
          primaryStatus: 'DEGRADED',
          reason: 'SACHET feed temporarily unreachable; serving cached alert data (expired alerts purged)',
          attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
          data: {
            hasActiveWarnings: unexpired.length > 0,
            count: unexpired.length,
            warnings: unexpired,
            message: unexpired.length === 0 ? 'No active cached warnings.' : undefined,
          },
          error: null,
        };
      }

      return {
        status: 'error',
        source: 'NDMA / SACHET',
        provider: 'SACHET',
        dataStatus: 'UNAVAILABLE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'NDMA / SACHET',
        fallbackUsed: false,
        primaryProvider: 'SACHET',
        primaryStatus: 'UNAVAILABLE',
        reason: 'Unable to retrieve government disaster alerts; no cached alerts available.',
        error: err.message,
        data: {
          hasActiveWarnings: false,
          count: 0,
          warnings: [],
          message: 'Unable to retrieve government disaster alerts at this time.',
        },
      };
    }
  }

  // ====================================================================
  // 5. MARINE RESOLUTION
  // Rule: INCOIS -> cached INCOIS data -> NO VERIFIED MARINE DATA / NO_COVERAGE
  // Zero ocean value fabrication
  // ====================================================================
  public async resolveMarine(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<NormalizedMarine>> {
    const isCoastal = INCOISProvider.isCoastalLocation(
      loc.latitude,
      loc.longitude,
      `${loc.name} ${loc.city || ''} ${loc.district || ''}`
    );

    const nowStr = new Date().toISOString();

    if (!isCoastal) {
      return {
        status: 'success',
        source: 'INCOIS',
        provider: 'INCOIS',
        dataStatus: 'NO_COVERAGE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'INCOIS',
        fallbackUsed: false,
        primaryProvider: 'INCOIS',
        primaryStatus: 'OPERATIONAL',
        reason: 'Inland location — marine ocean state observations not applicable.',
        data: {
          location: loc,
          isCoastal: false,
          observedAt: nowStr,
          fetchedAt: nowStr,
          dataStatus: 'NO_COVERAGE',
          source: 'INCOIS',
          message: 'Marine telemetry not applicable for inland location.',
        },
        error: null,
      };
    }

    const cacheKey = cacheService.generateKey('MARINE', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<NormalizedMarine>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, 'INCOIS');
        return {
          status: 'success',
          source: cached.data.source,
          provider: 'INCOIS',
          dataStatus: cached.data.dataStatus,
          observedAt: cached.data.observedAt,
          receivedAt: cached.data.fetchedAt || nowStr,
          fetchedAt: cached.data.fetchedAt || nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          fallbackUsed: false,
          primaryProvider: 'INCOIS',
          primaryStatus: 'OPERATIONAL',
          data: cached.data,
          error: null,
        };
      }
    }

    const start = Date.now();
    try {
      const marine = await withTransientRetry(() => INCOISProvider.fetchMarineData(loc));
      const latency = Date.now() - start;
      systemHealthService.recordRequest(true, 'INCOIS', latency);

      await cacheService.set(cacheKey, marine, 'MARINE', marine.source);
      dbService.saveMarine(marine).catch(() => {});

      return {
        status: 'success',
        source: marine.source,
        provider: 'INCOIS',
        dataStatus: marine.dataStatus,
        observedAt: marine.observedAt,
        receivedAt: marine.fetchedAt || nowStr,
        fetchedAt: marine.fetchedAt || nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: marine.source,
        fallbackUsed: false,
        primaryProvider: 'INCOIS',
        primaryStatus: 'OPERATIONAL',
        data: marine,
        error: null,
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      systemHealthService.recordRequest(false, 'INCOIS', latency, err.message);

      const stale = await cacheService.get<NormalizedMarine>(cacheKey);
      if (stale.data) {
        return {
          status: 'success',
          source: stale.data.source,
          provider: 'INCOIS',
          dataStatus: 'STALE',
          observedAt: stale.data.observedAt,
          receivedAt: stale.data.fetchedAt || nowStr,
          fetchedAt: stale.data.fetchedAt || nowStr,
          cached: true,
          ageSeconds: stale.ageSeconds,
          primarySource: stale.data.source,
          fallbackUsed: false,
          primaryProvider: 'INCOIS',
          primaryStatus: 'DEGRADED',
          reason: 'Ocean state telemetry temporarily unreachable; serving cached observations',
          data: stale.data,
          error: null,
        };
      }

      return {
        status: 'error',
        source: 'INCOIS',
        provider: 'INCOIS',
        dataStatus: 'UNAVAILABLE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'INCOIS',
        fallbackUsed: false,
        primaryProvider: 'INCOIS',
        primaryStatus: 'UNAVAILABLE',
        reason: 'Real marine observations unavailable. No ocean values fabricated.',
        error: 'NO VERIFIED MARINE DATA',
        data: {
          location: loc,
          isCoastal: true,
          observedAt: nowStr,
          fetchedAt: nowStr,
          dataStatus: 'UNAVAILABLE',
          source: 'INCOIS',
          message: 'NO VERIFIED MARINE DATA',
        },
      };
    }
  }

  // ====================================================================
  // 6. DOPPLER RADAR RESOLUTION
  // Rule: RainViewer / DWR Network -> cached recent metadata -> RADAR UNAVAILABLE
  // Zero fabricated sweeps, echoes, or rings
  // ====================================================================
  public async resolveRadar(
    loc: GeoLocation,
    options: ResolveOptions = {}
  ): Promise<StandardApiResponse<UnifiedRadarResponse>> {
    const cacheKey = cacheService.generateKey('RADAR', {
      lat: loc.latitude.toFixed(2),
      lon: loc.longitude.toFixed(2),
    });

    const nowStr = new Date().toISOString();

    if (!options.bypassCache && !options.forceRefresh) {
      const cached = await cacheService.get<UnifiedRadarResponse>(cacheKey);
      if (cached.data && !cached.isStale) {
        systemHealthService.recordRequest(true, 'RADAR');
        return {
          status: 'success',
          source: cached.data.source,
          provider: 'RADAR',
          dataStatus: cached.data.latestFrame?.status || 'LIVE',
          observedAt: cached.data.latestFrame?.observedTime || nowStr,
          receivedAt: nowStr,
          fetchedAt: nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          fallbackUsed: false,
          primaryProvider: 'RADAR',
          primaryStatus: 'OPERATIONAL',
          data: cached.data,
          error: null,
        };
      }
    }

    const start = Date.now();
    let frame: RadarFrameInfo | null = null;
    try {
      frame = await withTransientRetry(() => RadarProvider.fetchLatestFrame());
      const latency = Date.now() - start;
      systemHealthService.recordRequest(frame !== null, 'RADAR', latency);
    } catch (err: any) {
      systemHealthService.recordRequest(false, 'RADAR', Date.now() - start, err.message);
    }

    const nearest = findNearestRadarStation(loc.latitude, loc.longitude);
    const stationData = nearest
      ? {
          id: nearest.station.id,
          name: `DWR ${nearest.station.city}`,
          city: nearest.station.city,
          state: nearest.station.state,
          latitude: nearest.station.lat,
          longitude: nearest.station.lng,
          distanceKm: nearest.distanceKm,
          band: nearest.station.band,
          rangeKm: nearest.station.rangeKm,
          radarModel: nearest.station.model,
          isWithinCoverage: nearest.distanceKm <= nearest.station.rangeKm,
        }
      : null;

    if (frame) {
      const responseData: UnifiedRadarResponse = {
        latestFrame: frame,
        nearestStation: stationData,
        status: frame.status,
        source: frame.source,
      };

      await cacheService.set(cacheKey, responseData, 'RADAR', frame.source);
      dbService.saveRadarFrame(frame).catch(() => {});

      return {
        status: 'success',
        source: frame.source,
        provider: 'RADAR',
        dataStatus: frame.status,
        observedAt: frame.observedTime,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: frame.source,
        fallbackUsed: false,
        primaryProvider: 'RADAR',
        primaryStatus: 'OPERATIONAL',
        data: responseData,
        error: null,
      };
    }

    const stale = await cacheService.get<UnifiedRadarResponse>(cacheKey);
    if (stale.data) {
      return {
        status: 'success',
        source: stale.data.source,
        provider: 'RADAR',
        dataStatus: 'STALE',
        observedAt: stale.data.latestFrame?.observedTime || nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: true,
        ageSeconds: stale.ageSeconds,
        primarySource: stale.data.source,
        fallbackUsed: false,
        primaryProvider: 'RADAR',
        primaryStatus: 'DEGRADED',
        reason: 'Live radar imagery temporarily unavailable; serving cached radar frame metadata',
        data: stale.data,
        error: null,
      };
    }

    return {
      status: 'error',
      source: 'RainViewer Radar Network',
      provider: 'RADAR',
      dataStatus: 'UNAVAILABLE',
      observedAt: nowStr,
      receivedAt: nowStr,
      fetchedAt: nowStr,
      cached: false,
      ageSeconds: 0,
      primarySource: 'RainViewer Radar Network',
      fallbackUsed: false,
      primaryProvider: 'RADAR',
      primaryStatus: 'UNAVAILABLE',
      reason: 'Live radar frames and DWR sweeps currently unavailable.',
      error: 'RADAR UNAVAILABLE',
      data: {
        latestFrame: null,
        nearestStation: stationData,
        status: 'UNAVAILABLE',
        source: 'RainViewer Radar Network',
      },
    };
  }
}

export const centralDataResolver = CentralDataResolver.getInstance();

export const resolveData = centralDataResolver.resolveData.bind(centralDataResolver);
