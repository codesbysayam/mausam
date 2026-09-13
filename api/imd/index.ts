import { sendJson } from '../helpers';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  return sendJson(res, 200, {
    service: 'IMD Data Connector Serverless Service',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
  });
}
