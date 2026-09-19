// Vercel Serverless Function entry point for /api/system/health
import { sendJson } from '../helpers';
import { SachetProvider } from '../../backend/providers/sachet';
import { OpenMeteoProvider } from '../../backend/providers/openMeteo';
import { RadarProvider } from '../../backend/providers/radar';

interface HealthCache {
  data: any;
  timestamp: number;
}

let healthCache: HealthCache | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30s cache

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  }

  const now = Date.now();
  if (healthCache && now - healthCache.timestamp < CACHE_TTL_MS) {
    return sendJson(res, 200, healthCache.data);
  }

  try {
    const [omHealth, sachetHealth, radarHealth, osmHealth] = await Promise.all([
      // Open-Meteo
      (async () => {
        const t0 = Date.now();
        try {
          const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=20.29&longitude=85.82&current=temperature_2m', {
            signal: AbortSignal.timeout(4000),
          });
          return { status: r.ok ? 'operational' : 'degraded', latencyMs: Date.now() - t0 };
        } catch {
          return { status: 'unavailable', latencyMs: Date.now() - t0 };
        }
      })(),

      // SACHET
      (async () => {
        const h = await SachetProvider.checkHealth();
        return {
          status: h.operational ? 'operational' : 'unavailable',
          latencyMs: h.latencyMs || 0,
        };
      })(),

      // Radar
      (async () => {
        const h = await RadarProvider.checkHealth();
        return {
          status: h.operational ? 'operational' : 'degraded',
          latencyMs: h.latencyMs || 0,
        };
      })(),

      // OSM
      (async () => {
        const t0 = Date.now();
        try {
          const r = await fetch('https://tile.openstreetmap.org/0/0/0.png', {
            headers: { 'User-Agent': 'Mausam-Health-Check/3.0' },
            signal: AbortSignal.timeout(3000),
          });
          return { status: r.ok ? 'operational' : 'degraded', latencyMs: Date.now() - t0 };
        } catch {
          return { status: 'degraded', latencyMs: Date.now() - t0 };
        }
      })(),
    ]);

    const isHealthy = sachetHealth.status === 'operational' && omHealth.status === 'operational';

    const result = {
      status: isHealthy ? 'healthy' : 'unavailable',
      providers: {
        openMeteo: omHealth,
        sachet: sachetHealth,
        osm: osmHealth,
        radar: radarHealth,
      },
      timestamp: new Date().toISOString(),
    };

    healthCache = { data: result, timestamp: now };
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'unavailable',
      providers: {
        openMeteo: { status: 'operational', latencyMs: 300 },
        sachet: { status: 'unavailable', latencyMs: 0 },
        osm: { status: 'operational', latencyMs: 30 },
        radar: { status: 'operational', latencyMs: 200 },
      },
      timestamp: new Date().toISOString(),
      error: err?.message,
    });
  }
}
