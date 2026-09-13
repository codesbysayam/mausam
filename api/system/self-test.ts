import { sendJson } from '../helpers';
import { systemHealthService } from '../../backend/services/systemHealthService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const selfTest = await systemHealthService.getSelfTest();
    const httpStatus = selfTest.status === 'FAILED' ? 503 : 200;
    return sendJson(res, httpStatus, selfTest);
  } catch (err: any) {
    return sendJson(res, 500, {
      status: 'FAILED',
      timestamp: new Date().toISOString(),
      error: err.message,
    });
  }
}
