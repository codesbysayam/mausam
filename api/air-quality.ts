import { extractLocationFromReq, sendJson } from './helpers';
import { aqiService } from '../backend/services/aqiService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const loc = extractLocationFromReq(req);
    const result = await aqiService.getAirQuality(loc);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'error',
      source: 'CPCB',
      provider: 'CPCB',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'CPCB',
      data: null,
      error: err.message,
    });
  }
}
