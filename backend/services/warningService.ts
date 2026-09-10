// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Disaster & Severe Weather Warning Service (SACHET / NDMA / IMD CAP)
// Integrated Database Persistence, ETag Cache & Normalized Response
// ====================================================================

import { NormalizedWarningItem, StandardApiResponse, GeoLocation } from '../normalization/types';
import { SachetProvider } from '../providers/sachet';
import { cacheService } from '../cache/cacheService';
import { dbService } from '../database/db';
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

    const nowStr = new Date().toISOString();
    const cached = await cacheService.get<WarningsResponseData>(cacheKey);

    if (cached.data && !cached.isStale) {
      systemHealthService.recordRequest(true, 'SACHET');
      return {
        status: 'success',
        source: 'NDMA / SACHET',
        provider: 'SACHET',
        dataStatus: 'LIVE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: true,
        ageSeconds: cached.ageSeconds,
        primarySource: 'NDMA / SACHET',
        attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        data: cached.data,
        error: null,
      };
    }

    const start = Date.now();
    try {
      const activeWarnings = await SachetProvider.getActiveWarningsForLocation(loc);
      const latency = Date.now() - start;
      systemHealthService.recordRequest(true, 'SACHET', latency);

      const hasActive = activeWarnings.length > 0;
      const responseData: WarningsResponseData = {
        hasActiveWarnings: hasActive,
        count: activeWarnings.length,
        warnings: activeWarnings,
        message: hasActive
          ? undefined
          : `ALL CLEAR: No active severe weather or disaster warnings reported for ${loc.district || loc.name}, ${loc.state || 'India'}. Atmospheric parameters remain within normal seasonal limits.`,
      };

      await cacheService.set(cacheKey, responseData, 'WARNINGS', 'NDMA / SACHET');

      // Persist active warnings in DB
      for (const w of activeWarnings) {
        dbService.saveWarning(w).catch(() => {});
      }

      return {
        status: 'success',
        source: 'NDMA / SACHET',
        provider: 'SACHET',
        dataStatus: 'LIVE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
        ageSeconds: 0,
        primarySource: 'NDMA / SACHET',
        attribution: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        data: responseData,
        error: null,
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      systemHealthService.recordRequest(false, 'SACHET', latency, err.message);

      return {
        status: 'error',
        source: 'NDMA / SACHET',
        provider: 'SACHET',
        dataStatus: 'UNAVAILABLE',
        observedAt: nowStr,
        receivedAt: nowStr,
        fetchedAt: nowStr,
        cached: false,
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
