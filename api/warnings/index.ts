// Vercel Serverless Function entry point for /api/warnings
import { resolveLocationWarning } from '../../server/routes/warningsRoute';

export default async function handler(req: any, res: any) {
  try {
    const lat = req.query?.lat ? parseFloat(req.query.lat) : undefined;
    const lng = req.query?.lng ? parseFloat(req.query.lng) : undefined;
    const city = req.query?.city || '';
    const district = req.query?.district || '';
    const state = req.query?.state || '';
    const country = req.query?.country || '';

    const result = await resolveLocationWarning({ city, district, state, country, lat, lng });

    // Set standard cache control header (60 seconds)
    if (res.setHeader) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(200).json({
      state: 'DATA_UNAVAILABLE',
      severity: 'neutral',
      severityLabel: 'DATA UNAVAILABLE',
      hazardHeadline: 'WARNING DATA TEMPORARILY UNAVAILABLE',
      affectedAreasHeadline: 'Selected Area',
      affectedDistricts: [],
      description: 'Official warning service is temporarily unreachable or requires authorized credentials.',
      validUntil: 'N/A',
      issuedAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      source: 'IMD',
      updatedAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'UNAVAILABLE',
      isLocal: false,
    });
  }
}
