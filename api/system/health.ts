// Vercel Serverless Function entry point for /api/system/health
import { sendJson } from '../helpers';
import { SachetProvider } from '../../backend/providers/sachet';
import { RadarProvider } from '../../backend/providers/radar';
import { IMDProvider } from '../../backend/providers/imd';
import { AIProvider } from '../../lib/providers/ai';

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
    const [omHealth, sachetHealth, radarHealth, osmHealth, imdHealth, geminiHealth] = await Promise.all([
      // Open-Meteo
      (async () => {
        const t0 = Date.now();
        try {
          const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=20.29&longitude=85.82&current=temperature_2m', {
            signal: AbortSignal.timeout(4000),
          });
          return {
            configured: true,
            operational: r.ok,
            status: r.ok ? 'OPERATIONAL' : 'DEGRADED',
            latencyMs: Date.now() - t0,
            error: r.ok ? undefined : `HTTP ${r.status}`,
          };
        } catch (e: any) {
          return {
            configured: true,
            operational: false,
            status: 'OFFLINE',
            latencyMs: Date.now() - t0,
            error: e.message,
          };
        }
      })(),

      // SACHET
      (async () => {
        const h = await SachetProvider.checkHealth();
        return {
          configured: true,
          operational: h.operational,
          status: h.operational ? 'OPERATIONAL' : 'OFFLINE',
          latencyMs: h.latencyMs || 0,
          error: h.error,
        };
      })(),

      // Radar (RainViewer)
      (async () => {
        const h = await RadarProvider.checkHealth();
        return {
          configured: true,
          operational: h.operational,
          status: h.operational ? 'OPERATIONAL' : 'DEGRADED',
          latencyMs: h.latencyMs || 0,
          error: h.error,
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
          return {
            configured: true,
            operational: r.ok,
            status: r.ok ? 'OPERATIONAL' : 'DEGRADED',
            latencyMs: Date.now() - t0,
            error: r.ok ? undefined : `HTTP ${r.status}`,
          };
        } catch (e: any) {
          return {
            configured: true,
            operational: false,
            status: 'DEGRADED',
            latencyMs: Date.now() - t0,
            error: e.message,
          };
        }
      })(),

      // IMD (Optional official gateway)
      (async () => {
        const h = await IMDProvider.checkHealth();
        return {
          configured: h.configured,
          operational: h.operational,
          status: !h.configured ? 'NOT_CONFIGURED' : h.operational ? 'OPERATIONAL' : 'OFFLINE',
          latencyMs: h.latencyMs,
          error: h.error,
        };
      })(),

      // Gemini AI (Optional)
      (async () => {
        const h = await AIProvider.checkHealth();
        return {
          configured: h.configured,
          operational: h.operational,
          status: !h.configured ? 'NOT_CONFIGURED' : h.operational ? 'OPERATIONAL' : 'OFFLINE',
          latencyMs: h.latencyMs,
          error: h.error,
        };
      })(),
    ]);

    const isHealthy = sachetHealth.operational || omHealth.operational;

    const result = {
      status: isHealthy ? 'OPERATIONAL' : 'DEGRADED',
      providers: {
        openMeteo: omHealth,
        sachet: sachetHealth,
        radar: radarHealth,
        osm: osmHealth,
        imd: imdHealth,
        gemini: geminiHealth,
      },
      timestamp: new Date().toISOString(),
    };

    healthCache = { data: result, timestamp: now };
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'OFFLINE',
      providers: {
        openMeteo: { configured: true, operational: false, status: 'OFFLINE', latencyMs: null, error: err.message },
        sachet: { configured: true, operational: false, status: 'OFFLINE', latencyMs: null, error: err.message },
        radar: { configured: true, operational: false, status: 'OFFLINE', latencyMs: null, error: err.message },
        osm: { configured: true, operational: false, status: 'OFFLINE', latencyMs: null, error: err.message },
        imd: { configured: false, operational: false, status: 'NOT_CONFIGURED', latencyMs: null },
        gemini: { configured: false, operational: false, status: 'NOT_CONFIGURED', latencyMs: null },
      },
      timestamp: new Date().toISOString(),
      error: err?.message,
    });
  }
}
