// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Vercel Serverless Function: /api/satellite/latest
// Validates Content-Type, prevents masquerading HTML error pages,
// handles CORS, caching, and graceful UNAVAILABLE fallback
// ====================================================================

import { sendJson } from '../helpers';

interface SatelliteMetaCache {
  data: any;
  timestamp: number;
}

let satelliteCache: SatelliteMetaCache | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const INSAT_URLS: Record<string, string> = {
  ir1: 'https://mausam.imd.gov.in/Satellite/Converted/IR1.gif',
  vis: 'https://mausam.imd.gov.in/Satellite/Converted/VIS.gif',
  wv: 'https://mausam.imd.gov.in/Satellite/Converted/WV.gif',
  rgb: 'https://mausam.imd.gov.in/Satellite/Converted/RGB.gif',
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  }

  const channel = ((req.query?.channel || req.query?.type || 'ir1') as string).toLowerCase();
  const targetUrl = INSAT_URLS[channel] || INSAT_URLS.ir1;

  const now = Date.now();
  if (satelliteCache && now - satelliteCache.timestamp < CACHE_TTL_MS && satelliteCache.data?.channel === channel) {
    return sendJson(res, 200, satelliteCache.data);
  }

  try {
    const headRes = await fetch(targetUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    });

    const contentType = headRes.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');

    if (headRes.ok && isImage) {
      const result = {
        ok: true,
        channel,
        satellite: 'INSAT-3D / INSAT-3DR',
        source: 'India Meteorological Department (IMD)',
        imageUrl: targetUrl,
        contentType,
        status: 'LIVE',
        observedAt: new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
      };
      satelliteCache = { data: result, timestamp: now };
      return sendJson(res, 200, result);
    }

    // Upstream did not return an image
    return sendJson(res, 200, {
      ok: false,
      channel,
      satellite: 'INSAT-3D / INSAT-3DR',
      source: 'India Meteorological Department (IMD)',
      status: 'UNAVAILABLE',
      imageUrl: null,
      message: 'Official INSAT satellite feed is temporarily offline or inaccessible.',
      errorCode: 'SATELLITE_FEED_UNAVAILABLE',
      fetchedAt: null,
    });
  } catch (err: any) {
    return sendJson(res, 200, {
      ok: false,
      channel,
      satellite: 'INSAT-3D / INSAT-3DR',
      source: 'India Meteorological Department (IMD)',
      status: 'UNAVAILABLE',
      imageUrl: null,
      message: 'Satellite telemetry unreachable.',
      error: err.message,
      errorCode: 'NETWORK_TIMEOUT',
      fetchedAt: null,
    });
  }
}
