import { sendJson } from '../helpers';
import { locationService } from '../../backend/services/locationService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const q = (req.query?.q || req.query?.query || '') as string;
    const results = await locationService.searchLocations(q);
    return sendJson(res, 200, results);
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message, results: [] });
  }
}
