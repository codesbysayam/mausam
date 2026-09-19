// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated System Diagnostics Gateway (/api/system)
// Multiplexed via mode query parameter: health | providers | readiness | config
// Truthful reporting: unconfigured keys report NOT_CONFIGURED, unreachable feeds report OFFLINE
// ====================================================================

import { providerService } from '../src/server/services/providerService';
import { sendJson, parseQuery, parseBody } from '../src/server/apiUtils';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'health').toString().toLowerCase();

  try {
    switch (mode) {
      case 'providers': {
        const result = await providerService.checkAllProviders();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        });
      }

      case 'readiness': {
        const result = await providerService.getReadiness();
        return sendJson(res, 200, result, {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
      }

      case 'config': {
        const body = await parseBody(req);
        const { provider, apiKey, enabled, baseUrl } = body || {};
        if (!provider) {
          return sendJson(res, 400, { error: 'provider identifier is required' });
        }
        const prov = String(provider).toLowerCase();
        if (prov === 'imd') {
          if (apiKey !== undefined) process.env.IMD_API_KEY = apiKey;
          if (enabled !== undefined) process.env.IMD_ENABLED = String(enabled);
          if (baseUrl) process.env.IMD_API_BASE_URL = baseUrl;
        } else if (prov === 'cpcb') {
          if (apiKey !== undefined) process.env.CPCB_API_KEY = apiKey;
          if (enabled !== undefined) process.env.CPCB_ENABLED = String(enabled);
        } else if (prov === 'gemini') {
          if (apiKey !== undefined) process.env.GEMINI_API_KEY = apiKey;
        }
        const health = await providerService.getHealth();
        return sendJson(res, 200, {
          status: 'success',
          message: `Configuration for ${provider} applied successfully`,
          health,
        });
      }

      case 'health':
      default: {
        const result = await providerService.getHealth();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        });
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      ok: false,
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      error: err?.message || 'System diagnostic probe failed',
    });
  }
}
