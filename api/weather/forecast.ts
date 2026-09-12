import { extractLocationFromReq, sendJson } from '../helpers';
import { weatherService } from '../../backend/services/weatherService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const loc = extractLocationFromReq(req);
    const result = await weatherService.getForecast(loc);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      data: null,
      error: err.message,
    });
  }
}
