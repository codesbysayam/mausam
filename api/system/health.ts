import { sendJson } from '../helpers';
import { systemHealthService } from '../../backend/services/systemHealthService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const health = await systemHealthService.getHealth();
    return sendJson(res, 200, health);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'CRITICAL',
      environment: 'PRODUCTION',
      deployment: 'VERCEL',
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
}
