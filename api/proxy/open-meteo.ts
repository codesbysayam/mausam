import { sendJson } from '../helpers';

const proxyCache = new Map<string, { data: any; expiresAt: number; savedAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes fresh
const STALE_TTL_MS = 60 * 60 * 1000; // 60 minutes stale tolerance

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const queryString = urlObj.searchParams.toString();
  const cacheKey = `meteo:${queryString}`;
  const now = Date.now();
  const cached = proxyCache.get(cacheKey);

  // Return fresh cache if available
  if (cached && now < cached.expiresAt) {
    if (res.setHeader) res.setHeader('X-Mausam-Cache', 'HIT');
    return sendJson(res, 200, cached.data);
  }

  try {
    const targetUrl = `https://api.open-meteo.com/v1/forecast?${queryString}`;
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      proxyCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS, savedAt: now });
      if (res.setHeader) res.setHeader('X-Mausam-Cache', 'MISS');
      return sendJson(res, 200, data);
    }

    if (cached && now - cached.savedAt < STALE_TTL_MS) {
      if (res.setHeader) res.setHeader('X-Mausam-Cache', 'STALE');
      return sendJson(res, 200, cached.data);
    }

    return sendJson(res, response.status, { error: `Upstream error HTTP ${response.status}` });
  } catch (err: any) {
    if (cached) {
      if (res.setHeader) res.setHeader('X-Mausam-Cache', 'STALE-FALLBACK');
      return sendJson(res, 200, cached.data);
    }
    return sendJson(res, 502, { error: err?.message || 'Proxy upstream fetch failed' });
  }
}
