// Vercel Serverless Function entry point for /api/warnings/current
import { resolveLocationWarning } from '../../server/routes/warningsRoute';
import { sachetService } from '../../server/services/sachetService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  try {
    const lat = req.query?.lat ? parseFloat(req.query.lat) : undefined;
    const lng = req.query?.lng ? parseFloat(req.query.lng) : undefined;
    const city = req.query?.city || '';
    const district = req.query?.district || '';
    const state = req.query?.state || '';
    const country = req.query?.country || '';

    const result = await resolveLocationWarning({ city, district, state, country, lat, lng });
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API warnings/current error]', error);
    return res.status(200).json({
      state: 'DATA_UNAVAILABLE',
      severity: 'neutral',
      severityLabel: 'DATA UNAVAILABLE',
      hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
      affectedAreasHeadline: 'Selected Location',
      affectedDistricts: [],
      description: 'Official warning feed from NDMA / SACHET is temporarily unreachable.',
      validUntil: 'N/A',
      issuedAt: new Date().toISOString(),
      source: 'NDMA/SACHET',
      updatedAt: new Date().toISOString(),
      status: 'UNAVAILABLE',
      isLocal: false,
    });
  }
}
