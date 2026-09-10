// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Doppler Radar Service (Radar Frames & Station Metadata)
// ====================================================================

import { RadarFrameInfo, StandardApiResponse, GeoLocation } from '../normalization/types';
import { RadarProvider } from '../providers/radar';
import { cacheService } from '../cache/cacheService';
import { systemHealthService } from './systemHealthService';
import { findNearestRadarStation } from '../../src/data/radarStations';

export interface UnifiedRadarResponse {
  latestFrame: RadarFrameInfo | null;
  nearestStation: {
    id: string;
    name: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    band: string;
    rangeKm: number;
    radarModel: string;
    isWithinCoverage: boolean;
  } | null;
  status: string;
  source: string;
}

export class RadarService {
  private static instance: RadarService;

  public static getInstance(): RadarService {
    if (!RadarService.instance) {
      RadarService.instance = new RadarService();
    }
    return RadarService.instance;
  }

  public async getRadar(loc: GeoLocation): Promise<StandardApiResponse<UnifiedRadarResponse>> {
    const cacheKey = cacheService.generateKey('RADAR', {
      lat: loc.latitude.toFixed(2),
      lon: loc.longitude.toFixed(2),
    });

    const cached = await cacheService.get<UnifiedRadarResponse>(cacheKey);
    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true);
      return {
        status: 'success',
        source: cached.data.source,
        dataStatus: cached.data.latestFrame?.status || 'LIVE',
        observedAt: cached.data.latestFrame?.observedTime || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: cached.ageSeconds,
        primarySource: cached.data.source,
        data: cached.data,
      };
    }

    const frame = await RadarProvider.fetchLatestFrame();
    systemHealthService.recordRequest(frame !== null);

    const nearest = findNearestRadarStation(loc.latitude, loc.longitude);
    const stationData = nearest ? {
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
      isWithinCoverage: nearest.isWithinCoverage,
    } : null;

    const result: UnifiedRadarResponse = {
      latestFrame: frame,
      nearestStation: stationData,
      status: frame ? 'OPERATIONAL' : 'DEGRADED',
      source: frame ? frame.source : 'IMD Doppler Weather Radar Network',
    };

    await cacheService.set(cacheKey, result, 'RADAR', result.source);

    return {
      status: 'success',
      source: result.source,
      dataStatus: frame?.status || 'UNAVAILABLE',
      observedAt: frame?.observedTime || new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      primarySource: result.source,
      data: result,
    };
  }
}

export const radarService = RadarService.getInstance();
