// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Disaster & Severe Weather Warning Service (SACHET / NDMA / IMD CAP)
// Integrated Database Persistence, ETag Cache & Normalized Response
// ====================================================================

import { NormalizedWarningItem, StandardApiResponse, GeoLocation } from '../normalization/types';
import { centralDataResolver } from './centralDataResolver';

export interface WarningsResponseData {
  hasActiveWarnings: boolean;
  count: number;
  warnings: NormalizedWarningItem[];
  message?: string;
}

export class WarningService {
  private static instance: WarningService;

  public static getInstance(): WarningService {
    if (!WarningService.instance) {
      WarningService.instance = new WarningService();
    }
    return WarningService.instance;
  }

  public async getWarnings(loc: GeoLocation): Promise<StandardApiResponse<WarningsResponseData>> {
    return centralDataResolver.resolveWarnings(loc);
  }
}

export const warningService = WarningService.getInstance();
