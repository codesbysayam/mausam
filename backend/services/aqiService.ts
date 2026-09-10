// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Air Quality & Environmental Exposure Service
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

    const cached = await cacheService.get<NormalizedAQI>(cacheKey);
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
        data: cached.data,
      };
    }

    const aqi = await CPCBProvider.fetchAQI(loc);
    if (!aqi) {
      systemHealthService.recordRequest(false);
      if (cached.data) {
        return {
          status: 'success',
          source: cached.data.source,
          dataStatus: 'STALE',
          observedAt: cached.data.observedAt,
          fetchedAt: cached.data.fetchedAt,
          ageSeconds: cached.ageSeconds,
          primarySource: cached.data.source,
          data: cached.data,
        };
      }
      throw new Error(`Air quality observations unavailable for ${loc.name}`);
    }

    systemHealthService.recordRequest(true);
    await cacheService.set(cacheKey, aqi, 'AQI', aqi.source);
    dbService.saveAQI(aqi).catch(() => {});

    return {
      status: 'success',
      source: aqi.source,
      dataStatus: aqi.dataStatus,
      observedAt: aqi.observedAt,
      fetchedAt: aqi.fetchedAt,
      ageSeconds: 0,
      primarySource: aqi.source,
      data: aqi,
    };
  }
}

export const aqiService = AqiService.getInstance();
