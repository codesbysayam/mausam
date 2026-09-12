import { extractLocationFromReq, sendJson } from '../helpers';
import { weatherService } from '../../backend/services/weatherService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const loc = extractLocationFromReq(req);
    const result = await weatherService.getHourly(loc);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      data: null,
      error: err.message,
    });
  }
}
