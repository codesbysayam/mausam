import { extractLocationFromReq, sendJson } from './helpers';
import { radarService } from '../backend/services/radarService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const loc = extractLocationFromReq(req);
    const result = await radarService.getRadar(loc);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      source: 'Radar Network',
      provider: 'RADAR',
      dataStatus: 'UNAVAILABLE',
      data: null,
      error: err.message,
    });
  }
}
