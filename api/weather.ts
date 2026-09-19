// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Weather Gateway (/api/weather)
// Multiplexed via mode query parameter:
// current | forecast | hourly | daily | air | marine | bundle | search | imd
// ====================================================================

import { weatherService } from '../src/server/services/weatherService';
import { sendJson, parseQuery } from '../src/server/apiUtils';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'current').toString().toLowerCase();
  const loc = weatherService.parseLocation(query);

  try {
    switch (mode) {
      case 'forecast': {
        const days = parseInt(query.days, 10) || 7;
        const result = await weatherService.getForecast(loc, days);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'hourly': {
        const result = await weatherService.getHourly(loc);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'daily': {
        const result = await weatherService.getDaily(loc);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'air':
      case 'aqi': {
        const result = await weatherService.getAirQuality(loc);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'marine': {
        const result = await weatherService.getMarine(loc);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600',
        });
      }

      case 'search':
      case 'locations': {
        const q = (query.q || query.query || '').toString();
        const results = await weatherService.searchLocations(q);
        return sendJson(res, 200, results, {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        });
      }

      case 'bundle':
      case 'persona-bundle': {
        const result = await weatherService.getPersonaBundle(query);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'imd': {
        const result = await weatherService.handleIMD(query);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }

      case 'current':
      default: {
        const result = await weatherService.getCurrent(loc);
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        });
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'error',
      source: 'Open-Meteo Gateway',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      data: null,
      error: err?.message || 'Weather telemetry query failed',
    });
  }
}
