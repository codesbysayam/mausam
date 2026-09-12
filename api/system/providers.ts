import { sendJson } from '../helpers';
import { systemHealthService } from '../../backend/services/systemHealthService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const providers = await systemHealthService.getProviders();
    return sendJson(res, 200, providers);
  } catch (err: any) {
    return sendJson(res, 500, { error: err.message });
  }
}
