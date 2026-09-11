// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Doppler Radar Service (Radar Frames & Station Metadata)
// Strictly Verified RainViewer Metadata, Database Logging & Standard Response
// ====================================================================

import { RadarFrameInfo, StandardApiResponse, GeoLocation } from '../normalization/types';
import { centralDataResolver } from './centralDataResolver';

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
    return centralDataResolver.resolveRadar(loc);
  }
}

export const radarService = RadarService.getInstance();
