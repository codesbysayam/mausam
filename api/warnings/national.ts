// Vercel Serverless Function entry point for /api/warnings/national
import { sachetService } from '../../server/services/sachetService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }

  try {
    const national = await sachetService.getNationalRegionWarnings();
    return res.status(200).json(national);
  } catch (error: any) {
    console.error('[API warnings/national error]', error);
    return res.status(200).json({
      status: 'UNAVAILABLE',
      timestamp: new Date().toISOString(),
      regions: [],
      error: error?.message || 'National warning feed unreachable',
    });
  }
}
