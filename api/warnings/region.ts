// Vercel Serverless Function entry point for /api/warnings/region
import { sachetService } from '../../server/services/sachetService';
import { sendJson } from '../helpers';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  try {
    const regionName = (req.query?.region || req.query?.state || req.query?.name || '').toString().trim();
    if (!regionName) {
      const national = await sachetService.getNationalRegionWarnings();
      return sendJson(res, 200, {
        ok: true,
        data: national,
        source: 'SACHET/NDMA',
        status: 'LIVE',
        fetchedAt: new Date().toISOString(),
      });
    }

    const allWarnings = await sachetService.fetchAllActiveWarnings();
    const normalizedQuery = regionName.toLowerCase();

    const matchedWarnings = allWarnings.filter((w) => {
      const areasMatch = w.areas.some((area) => area.toLowerCase().includes(normalizedQuery));
      const headlineMatch = (w.headline || '').toLowerCase().includes(normalizedQuery);
      const descMatch = (w.description || '').toLowerCase().includes(normalizedQuery);
      return areasMatch || headlineMatch || descMatch;
    });

    return sendJson(res, 200, {
      ok: true,
      region: regionName,
      count: matchedWarnings.length,
      warnings: matchedWarnings,
      source: 'SACHET/NDMA',
      status: matchedWarnings.length > 0 ? 'LIVE' : 'LIVE',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API warnings/region error]', error);
    return sendJson(res, 200, {
      ok: false,
      region: req.query?.region || 'Unknown',
      warnings: [],
      source: 'SACHET/NDMA',
      status: 'UNAVAILABLE',
      errorCode: 'PROVIDER_UNAVAILABLE',
      error: error?.message || 'Regional warning lookup failed',
      fetchedAt: null,
    });
  }
}
