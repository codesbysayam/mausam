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
      return sendJson(res, 200, cachedData);
    }
    // Synthesize fallback frame object so client never fails
    const nowUnix = Math.floor(Date.now() / 1000);
    const fallbackTimes = [
      nowUnix - 3000,
      nowUnix - 2400,
      nowUnix - 1800,
      nowUnix - 1200,
      nowUnix - 600,
      nowUnix,
    ];
    return sendJson(res, 200, {
      version: '2.0',
      generated: nowUnix,
      host: 'https://tilecache.rainviewer.com',
      radar: {
        past: fallbackTimes.map((t) => ({ time: t, path: '' })),
        nowcast: [],
      },
      satellite: { infrared: [] },
    });
  }
}
