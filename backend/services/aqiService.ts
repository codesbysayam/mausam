// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Air Quality & Environmental Exposure Service
// Indian National AQI Breakpoints, Database Caching & Standard Response
// ====================================================================

import { NormalizedAQI, StandardApiResponse, GeoLocation } from '../normalization/types';
import { centralDataResolver } from './centralDataResolver';

export class AqiService {
  private static instance: AqiService;

  public static getInstance(): AqiService {
    if (!AqiService.instance) {
      AqiService.instance = new AqiService();
    }
    return AqiService.instance;
  }

  public async getAirQuality(loc: GeoLocation): Promise<StandardApiResponse<NormalizedAQI | null>> {
    return centralDataResolver.resolveAQI(loc);
  }
}

export const aqiService = AqiService.getInstance();
