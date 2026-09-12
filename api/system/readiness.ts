import { sendJson } from '../helpers';
import { systemHealthService } from '../../backend/services/systemHealthService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const readiness = await systemHealthService.getReadiness();
    const httpStatus = readiness.status === 'NOT_READY' ? 503 : 200;
    return sendJson(res, httpStatus, readiness);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
}
