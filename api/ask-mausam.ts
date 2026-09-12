import { sendJson } from './helpers';
import { AIProvider } from '../lib/providers/ai';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const body = req.body || {};
    const result = await AIProvider.askMausam(body);
    return sendJson(res, 200, result);
  } catch (err: any) {
    return sendJson(res, 500, {
      response: 'Meteorological telemetry is currently operating under local automated observatory parameters.',
      source: 'Mausam Telemetry Pipeline',
      groundingSources: [],
      modeUsed: 'offline',
      error: err.message,
    });
  }
}
