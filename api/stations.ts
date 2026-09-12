import { sendJson } from './helpers';
import { stationService } from '../backend/services/stationService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const query = req.query || {};
    const lat = parseFloat(query.lat || '20.2961');
    const lon = parseFloat(query.lon || query.lng || '85.8245');
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const stations = stationService.findNearestStations(lat, lon, limit);
    return sendJson(res, 200, stations);
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message, stations: [] });
  }
}
