// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Warnings Gateway (/api/warnings)
// Multiplexed via mode query parameter: current | national | debug | feed
// Single source of truth using official SACHET CAP / RSS pipeline.
// Truthful reporting: provider failures NEVER convert to all-clear / green.
// ====================================================================

import { sachetService } from '../server/services/sachetService.ts';
import { sendJson, parseQuery } from '../src/server/apiUtils.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || (query.debug === '1' ? 'debug' : 'current')).toString().toLowerCase();

  try {
    // Diagnostic / debug route (Requirement 13)
    if (mode === 'debug' || query.debug === '1') {
      const normalized = await sachetService.fetchNormalizedResult();
      return sendJson(res, 200, normalized.diagnostics, {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
    }

    switch (mode) {
      case 'national': {
        const result = await sachetService.getNationalRegionWarnings();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'feed':
      case 'alerts':
      case 'normalized': {
        const result = await sachetService.fetchNormalizedResult(query.force === '1');
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'region':
      case 'state': {
        const regionName = (query.region || query.state || query.name || '').toString().trim();
        const national = await sachetService.getNationalRegionWarnings();
        const matched = national.regions.find(
          (r) =>
            r.region.name.toLowerCase() === regionName.toLowerCase() ||
            r.region.code.toLowerCase() === regionName.toLowerCase() ||
            r.region.aliases.some((a) => a.toLowerCase() === regionName.toLowerCase())
        );

        if (matched) {
          return sendJson(res, 200, matched, {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          });
        }

        return sendJson(res, 200, {
          region: { name: regionName, code: '', type: 'STATE', capital: '', lat: 0, lng: 0, aliases: [] },
          status: 'ALL_CLEAR',
          severity: 'GREEN',
          activeCount: 0,
          warnings: [],
        });
      }

      case 'current':
      default: {
        const lat = query.lat ? parseFloat(query.lat) : undefined;
        const lng = query.lng || query.lon ? parseFloat(query.lng || query.lon) : undefined;
        const city = query.city ? String(query.city) : undefined;
        const district = query.district ? String(query.district) : undefined;
        const state = query.state ? String(query.state) : undefined;
        const country = query.country ? String(query.country) : undefined;

        const result = await sachetService.resolveStandardizedWarning({
          lat,
          lng,
          city,
          district,
          state,
          country,
        });

        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }
    }
  } catch (err: any) {
    // API failure MUST NOT become GREEN!
    return sendJson(res, 200, {
      state: 'DATA_UNAVAILABLE',
      severity: 'neutral',
      severityLabel: 'DATA UNAVAILABLE',
      hazardHeadline: 'OFFICIAL WARNING FEED UNAVAILABLE',
      hazardLabel: 'Feed Unreachable',
      affectedAreasHeadline: query.city || query.district || query.state || 'Selected Location',
      affectedDistricts: query.district ? [query.district] : [],
      description: 'Official warning feed from NDMA / SACHET is temporarily unreachable.',
      validUntil: 'Feed unreachable',
      issuedAt: new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      isLocal: false,
      diagnostics: {
        source: 'SACHET/NDMA',
        error: err?.message || 'Warning pipeline error',
      },
      metadata: {
        status: 'UNAVAILABLE',
      },
    });
  }
}
