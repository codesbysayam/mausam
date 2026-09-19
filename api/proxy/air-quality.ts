import { sendJson } from '../helpers';

const airCache = new Map<string, { data: any; expiresAt: number; savedAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes fresh
const STALE_TTL_MS = 90 * 60 * 1000; // 90 minutes stale tolerance

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const queryString = urlObj.searchParams.toString();
  const cacheKey = `air:${queryString}`;
  const now = Date.now();
  const cached = airCache.get(cacheKey);

  // Return fresh cache if available
  if (cached && now < cached.expiresAt) {
    if (res.setHeader) res.setHeader('X-Mausam-Cache', 'HIT');
    return sendJson(res, 200, cached.data);
  }

  try {
    const targetUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${queryString}`;
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      airCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS, savedAt: now });
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
