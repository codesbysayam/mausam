// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Radar Gateway (/api/radar)
// Multiplexed via mode query parameter: metadata | frames | stations | satellite
// Strictly truthful: no fake frames, no fabricated echoes, UNAVAILABLE if offline
// ====================================================================

import { radarService } from '../src/server/services/radarService';
import { sendJson, parseQuery } from '../src/server/apiUtils';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'metadata').toString().toLowerCase();

  try {
    switch (mode) {
      case 'frames': {
        const frames = await radarService.getFrames();
        return sendJson(res, 200, frames, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'stations': {
        const lat = query.lat ? parseFloat(query.lat) : undefined;
        const lon = query.lon ?? query.lng ? parseFloat(query.lon ?? query.lng) : undefined;
        const stations = radarService.getStations(lat, lon);
        return sendJson(res, 200, stations, {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200',
        });
      }

      case 'satellite': {
        const channel = (query.channel || query.type || 'ir1').toString();
        const satellite = await radarService.getSatellite(channel);
        return sendJson(res, 200, satellite, {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        });
      }

      case 'metadata':
      default: {
        const metadata = await radarService.getMetadata();
        return sendJson(res, 200, metadata, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'UNAVAILABLE',
      available: false,
      message: 'Radar telemetry is currently unavailable',
      host: '',
      radar: { past: [], nowcast: [] },
      satellite: { infrared: [] },
      error: err?.message,
    });
  }
}
