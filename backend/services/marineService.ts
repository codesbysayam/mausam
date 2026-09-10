// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Marine & Coastal Telemetry Service (INCOIS & Ocean State)
// Coastal Boundary Filtering, Database Logging & Standard Response
// ====================================================================

import { NormalizedMarine, StandardApiResponse, GeoLocation } from '../normalization/types';
import { INCOISProvider } from '../providers/incois';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
import { systemHealthService } from './systemHealthService';

export class MarineService {
  private static instance: MarineService;

  public static getInstance(): MarineService {
    if (!MarineService.instance) {
      MarineService.instance = new MarineService();
    }
    return MarineService.instance;
  }

  public async getMarine(loc: GeoLocation): Promise<StandardApiResponse<NormalizedMarine>> {
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
        dataStatus: 'UNAVAILABLE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'INCOIS',
        data: {
          location: loc,
          isCoastal: false,
          observedAt: nowStr,
          fetchedAt: nowStr,
          dataStatus: 'UNAVAILABLE',
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
        data: cached.data,
        error: null,
      };
    }

    const start = Date.now();
    const marine = await INCOISProvider.fetchMarineData(loc);
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
      data: marine,
      error: null,
    };
  }
}

export const marineService = MarineService.getInstance();
