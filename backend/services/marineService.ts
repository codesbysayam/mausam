// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Marine & Coastal Telemetry Service (INCOIS & Ocean State)
// Coastal Boundary Filtering, Database Logging & Standard Response
// ====================================================================

import { NormalizedMarine, StandardApiResponse, GeoLocation } from '../normalization/types';
import { centralDataResolver } from './centralDataResolver';

export class MarineService {
  private static instance: MarineService;

  public static getInstance(): MarineService {
    if (!MarineService.instance) {
      MarineService.instance = new MarineService();
    }
    return MarineService.instance;
  }

  public async getMarine(loc: GeoLocation): Promise<StandardApiResponse<NormalizedMarine>> {
    return centralDataResolver.resolveMarine(loc);
  }
}

export const marineService = MarineService.getInstance();
