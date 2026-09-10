// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Doppler Radar Service (Radar Frames & Station Metadata)
// Strictly Verified RainViewer Metadata, Database Logging & Standard Response
// ====================================================================

import { RadarFrameInfo, StandardApiResponse, GeoLocation } from '../normalization/types';
import { RadarProvider } from '../providers/radar';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
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

    const nowStr = new Date().toISOString();
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
        data: cached.data,
        error: null,
      };
    }

    const start = Date.now();
    const frame = await RadarProvider.fetchLatestFrame();
    const latency = Date.now() - start;

    systemHealthService.recordRequest(frame !== null, 'RADAR', latency);

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

    const sourceLabel = 'Radar Source: RainViewer (Open Weather Maps API)';
    const result: UnifiedRadarResponse = {
      latestFrame: frame,
      nearestStation: stationData,
      status: frame ? 'OPERATIONAL' : 'DEGRADED',
      source: sourceLabel,
    };

    await cacheService.set(cacheKey, result, 'RADAR', sourceLabel);
    if (frame) {
      dbService.saveRadarFrame(frame).catch(() => {});
    }

    return {
      status: 'success',
      source: sourceLabel,
      provider: 'RADAR',
      dataStatus: frame?.status || 'UNAVAILABLE',
      observedAt: frame?.observedTime || nowStr,
      receivedAt: nowStr,
      fetchedAt: nowStr,
      cached: false,
      ageSeconds: 0,
      primarySource: sourceLabel,
      data: result,
      error: null,
    };
  }
}

export const radarService = RadarService.getInstance();
