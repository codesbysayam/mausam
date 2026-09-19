// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Reusable Server-Side Warning Service
// Handles current (location-specific), national overview, and regional warnings
// Strictly truthful: failures never convert to green / all-clear
// ====================================================================

import { resolveLocationWarning, StandardizedWarningResponse } from '../../../server/routes/warningsRoute';
import { sachetService } from '../../../server/services/sachetService';
import { serverCache } from './cacheService';

export class WarningService {
  private static instance: WarningService;

  public static getInstance(): WarningService {
    if (!WarningService.instance) {
      WarningService.instance = new WarningService();
    }
    return WarningService.instance;
  }

  public async getCurrent(query: Record<string, any>): Promise<StandardizedWarningResponse> {
    // Support debug diagnostics mode
    if (query.mode === 'debug' || query.debug === 'true') {
      const diag = sachetService.getDiagnostics();
      return {
        state: 'DATA_UNAVAILABLE',
        severity: 'neutral',
        severityLabel: 'DIAGNOSTICS',
        hazardHeadline: 'PROVIDER DIAGNOSTICS TELEMETRY',
        affectedAreasHeadline: 'Diagnostics',
        affectedDistricts: [],
        description: `Endpoint: ${diag.endpointStatus}, Fetch: ${diag.fetchStatus}, HTTP: ${diag.httpStatus}, Parser: ${diag.parserStatus}, Active: ${diag.activeAlerts}`,
        validUntil: 'N/A',
        issuedAt: diag.lastSuccessfulFetchAt || 'N/A',
        source: 'NDMA/SACHET',
        updatedAt: diag.lastSuccessfulParsedAt || 'Never successfully synced',
        lastAttemptAt: diag.lastAttemptAt,
        lastSuccessfulFetchAt: diag.lastSuccessfulFetchAt,
        lastSuccessfulParsedAt: diag.lastSuccessfulParsedAt,
        status: diag.fetchStatus === 'SUCCESS' ? 'LIVE' : 'UNAVAILABLE',
        isLocal: false,
        diagnostics: diag,
      };
    }

    const lat = query.lat ? parseFloat(query.lat) : undefined;
    const lng = query.lon ?? query.lng ? parseFloat(query.lon ?? query.lng) : undefined;
    const city = (query.city ?? query.q ?? '').toString();
    const district = (query.district ?? '').toString();
    const state = (query.state ?? '').toString();
    const country = (query.country ?? 'India').toString();
    const forceRefresh = query.refresh === 'true';

    const cacheKey = `warning:current:${city}:${district}:${state}:${lat ?? ''}:${lng ?? ''}`;
    if (!forceRefresh) {
      const cached = serverCache.get<StandardizedWarningResponse>(cacheKey);
      if (cached.data && !cached.isStale) {
        return cached.data;
      }
    }

    try {
      const result = await resolveLocationWarning({ city, district, state, country, lat, lng });
      if (result) {
        serverCache.set(cacheKey, result, 60, 300);
      }
      return result;
    } catch (error: any) {
      const diag = sachetService.getDiagnostics();
      const lastSync = diag.lastSuccessfulParsedAt || 'Never successfully synced';

      const cached = serverCache.get<StandardizedWarningResponse>(cacheKey);
      if (cached.data) {
        return {
          ...cached.data,
          status: 'STALE',
          severityLabel: 'STALE DATA',
          lastAttemptAt: diag.lastAttemptAt,
          diagnostics: diag,
        };
      }
      // Never fabricate green / all-clear on error!
      return {
        state: 'DATA_UNAVAILABLE',
        severity: 'neutral',
        severityLabel: 'DATA UNAVAILABLE',
        hazardHeadline: 'WARNING TELEMETRY CURRENTLY UNAVAILABLE',
        affectedAreasHeadline: city || district || state || 'Selected Location',
        affectedDistricts: [],
        description: 'Official warning feed from NDMA / SACHET is temporarily unreachable.',
        validUntil: 'N/A',
        issuedAt: 'Unavailable',
        source: 'NDMA/SACHET',
        updatedAt: lastSync,
        lastAttemptAt: diag.lastAttemptAt,
        lastSuccessfulFetchAt: diag.lastSuccessfulFetchAt,
        lastSuccessfulParsedAt: diag.lastSuccessfulParsedAt,
        status: 'UNAVAILABLE',
        isLocal: false,
        diagnostics: diag,
      };
    }
  }

  public async getNational() {
    const cacheKey = 'warning:national';
    const cached = serverCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const national = await sachetService.getNationalRegionWarnings();
      serverCache.set(cacheKey, national, 60, 300);
      return national;
    } catch (error: any) {
      if (cached.data) return cached.data;
      return {
        status: 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
        regions: [],
        error: error?.message || 'National warning feed unreachable',
      };
    }
  }

  public async getRegion(regionName: string) {
    const normalized = (regionName || '').trim();
    if (!normalized) {
      return this.getNational();
    }

    const cacheKey = `warning:region:${normalized.toLowerCase()}`;
    const cached = serverCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const allWarnings = await sachetService.fetchAllActiveWarnings();
      const queryLower = normalized.toLowerCase();

      const matchedWarnings = allWarnings.filter((w) => {
        const areasMatch = (w.areas || []).some((area) => area.toLowerCase().includes(queryLower));
        const headlineMatch = (w.headline || '').toLowerCase().includes(queryLower);
        const descMatch = (w.description || '').toLowerCase().includes(queryLower);
        return areasMatch || headlineMatch || descMatch;
      });

      const response = {
        ok: true,
        region: normalized,
        count: matchedWarnings.length,
        warnings: matchedWarnings,
        source: 'SACHET/NDMA',
        status: 'LIVE',
        fetchedAt: new Date().toISOString(),
      };

      serverCache.set(cacheKey, response, 60, 300);
      return response;
    } catch (error: any) {
      if (cached.data) return cached.data;
      return {
        ok: false,
        region: normalized,
        warnings: [],
        source: 'SACHET/NDMA',
        status: 'UNAVAILABLE',
        errorCode: 'PROVIDER_UNAVAILABLE',
        error: error?.message || 'Regional warning lookup failed',
        fetchedAt: null,
      };
    }
  }
}

export const warningService = WarningService.getInstance();
