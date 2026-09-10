// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Marine & Coastal Telemetry Service (INCOIS & Ocean State)
// ====================================================================

import { NormalizedMarine, StandardApiResponse, GeoLocation } from '../normalization/types';
import { INCOISProvider } from '../providers/incois';
import { cacheService } from '../cache/cacheService';
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

    if (!isCoastal) {
      return {
        status: 'success',
        source: 'INCOIS',
        dataStatus: 'UNAVAILABLE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'INCOIS',
        data: {
          location: loc,
          isCoastal: false,
          observedAt: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
          dataStatus: 'UNAVAILABLE',
          source: 'INCOIS',
          message: 'Marine telemetry not applicable for inland location.',
        },
      };
    }

    const cacheKey = cacheService.generateKey('MARINE', {
      lat: loc.latitude.toFixed(3),
      lon: loc.longitude.toFixed(3),
    });

    const cached = await cacheService.get<NormalizedMarine>(cacheKey);
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

    const marine = await INCOISProvider.fetchMarineData(loc);
    systemHealthService.recordRequest(true);
    await cacheService.set(cacheKey, marine, 'MARINE', marine.source);

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

export const marineService = MarineService.getInstance();
