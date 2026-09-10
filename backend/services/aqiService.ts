// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Air Quality & Environmental Exposure Service
// Indian National AQI Breakpoints, Database Caching & Standard Response
// ====================================================================

import { NormalizedAQI, StandardApiResponse, GeoLocation } from '../normalization/types';
import { CPCBProvider } from '../providers/cpcb';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
import { systemHealthService } from './systemHealthService';

export class AqiService {
  private static instance: AqiService;

  public static getInstance(): AqiService {
    if (!AqiService.instance) {
      AqiService.instance = new AqiService();
    }
    return AqiService.instance;
  }

  public async getAirQuality(loc: GeoLocation): Promise<StandardApiResponse<NormalizedAQI>> {
    const cacheKey = cacheService.generateKey('AQI', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const nowStr = new Date().toISOString();
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
        data: cached.data,
        error: null,
      };
    }

    const start = Date.now();
    const aqi = await CPCBProvider.fetchAQI(loc);
    const latency = Date.now() - start;

    if (!aqi) {
      systemHealthService.recordRequest(false, 'CPCB', latency, 'Air quality unavailable');
      if (cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          provider: 'CPCB',
          dataStatus: 'STALE',
          observedAt: cached.data.observedAt,
          receivedAt: cached.data.fetchedAt || nowStr,
          fetchedAt: cached.data.fetchedAt || nowStr,
          cached: true,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          data: cached.data,
          error: null,
        };
      }
      throw new Error(`Air quality observations unavailable for ${loc.name}`);
    }

    systemHealthService.recordRequest(true, 'CPCB', latency);
    await cacheService.set(cacheKey, aqi, 'AQI', aqi.source);
    dbService.saveAQI(aqi).catch(() => {});

    return {
      status: 'success',
      source: aqi.source,
      provider: 'CPCB',
      dataStatus: aqi.dataStatus,
      observedAt: aqi.observedAt,
      receivedAt: aqi.fetchedAt || nowStr,
      fetchedAt: aqi.fetchedAt || nowStr,
      cached: false,
      ageSeconds: 0,
      primarySource: aqi.source,
      data: aqi,
      error: null,
    };
  }
}

export const aqiService = AqiService.getInstance();
