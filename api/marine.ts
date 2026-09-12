import { extractLocationFromReq, sendJson } from './helpers';
import { marineService } from '../backend/services/marineService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const loc = extractLocationFromReq(req);
    const result = await marineService.getMarine(loc);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      source: 'INCOIS',
      provider: 'INCOIS',
      dataStatus: 'UNAVAILABLE',
      data: null,
      error: err.message,
    });
  }
}
