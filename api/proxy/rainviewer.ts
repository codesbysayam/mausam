// Vercel Serverless Function entry point for RainViewer Radar Proxy
import { sendJson } from '../helpers';

let cachedData: any = null;
let cachedTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  }

  const now = Date.now();
  if (cachedData && now - cachedTime < CACHE_TTL_MS) {
    return sendJson(res, 200, cachedData);
  }

  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      headers: { 'User-Agent': 'Mausam-Radar-Proxy/3.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      if (cachedData) {
        return sendJson(res, 200, cachedData);
      }
      return sendJson(res, response.status, { error: `RainViewer upstream error HTTP ${response.status}` });
    }

    const data = await response.json();
    cachedData = data;
    cachedTime = now;
    return sendJson(res, 200, data);
  } catch (err: any) {
    if (cachedData) {
      if (res.setHeader) res.setHeader('X-Mausam-Cache', 'STALE');
      return sendJson(res, 200, cachedData);
    }
    // Truthful unavailable response - do not synthesize fake frames
    return sendJson(res, 200, {
      status: 'UNAVAILABLE',
      available: false,
      message: 'Radar data currently unavailable from upstream provider',
      version: '2.0',
      host: '',
      radar: {
        past: [],
        nowcast: [],
      },
      satellite: { infrared: [] },
    });
  }
}
