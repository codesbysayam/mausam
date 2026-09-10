// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Disaster & Severe Weather Warning Service (SACHET / NDMA / IMD CAP)
// ====================================================================

import { NormalizedWarningItem, StandardApiResponse, GeoLocation } from '../normalization/types';
import { SachetProvider } from '../providers/sachet';
import { cacheService } from '../cache/cacheService';
import { systemHealthService } from './systemHealthService';

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
    const cacheKey = cacheService.generateKey('WARNINGS', {
      district: (loc.district || loc.name || '').toLowerCase(),
      state: (loc.state || '').toLowerCase(),
    });

    const cached = await cacheService.get<WarningsResponseData>(cacheKey);
    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true);
      return {
        status: 'success',
        source: 'NDMA / SACHET / IMD',
        dataStatus: 'LIVE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: cached.ageSeconds,
        primarySource: 'NDMA / SACHET',
        attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        data: cached.data,
      };
    }

    try {
      const activeWarnings = await SachetProvider.getActiveWarningsForLocation(loc);
      systemHealthService.recordRequest(true);

      const hasActive = activeWarnings.length > 0;
      const responseData: WarningsResponseData = {
        hasActiveWarnings: hasActive,
        count: activeWarnings.length,
        warnings: activeWarnings,
        message: hasActive
          ? undefined
          : `No active severe weather or disaster warnings reported for ${loc.district || loc.name}, ${loc.state || 'India'}. Atmospheric parameters remain within normal seasonal limits.`,
      };

      await cacheService.set(cacheKey, responseData, 'WARNINGS', 'NDMA / SACHET');

      return {
        status: 'success',
        source: 'NDMA / SACHET / IMD',
        dataStatus: 'LIVE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'NDMA / SACHET',
        attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        data: responseData,
      };
    } catch (err: any) {
      systemHealthService.recordRequest(false);
      return {
        status: 'error',
        source: 'NDMA / SACHET / IMD',
        dataStatus: 'UNAVAILABLE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        primarySource: 'NDMA / SACHET',
        error: err.message,
        data: {
          hasActiveWarnings: false,
          count: 0,
          warnings: [],
          message: 'Unable to retrieve government disaster alerts at this time.',
        },
      };
    }
  }
}

export const warningService = WarningService.getInstance();
