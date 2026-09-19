// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Warnings Gateway (/api/warnings)
// Multiplexed via mode query parameter: current | national | region
// Truthful reporting: provider failures NEVER convert to all-clear / green
// ====================================================================

import { warningService } from '../src/server/services/warningService';
import { sendJson, parseQuery } from '../src/server/apiUtils';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'current').toString().toLowerCase();

  try {
    switch (mode) {
      case 'national': {
        const result = await warningService.getNational();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'region':
      case 'state': {
        const regionName = (query.region || query.state || query.name || '').toString().trim();
        const result = await warningService.getRegion(regionName);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'current':
      default: {
        const result = await warningService.getCurrent(query);
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
      hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
      affectedAreasHeadline: query.city || query.state || 'Selected Location',
      affectedDistricts: [],
      description: 'Official warning feed from NDMA / SACHET is temporarily unreachable.',
      validUntil: 'N/A',
      issuedAt: new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      isLocal: false,
      error: err?.message || 'Warning service query failed',
    });
  }
}
