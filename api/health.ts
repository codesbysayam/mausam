// Vercel Serverless Function entry point for /api/health
import { sendJson } from './helpers';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  if (res.setHeader) {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  }

  return sendJson(res, 200, {
    ok: true,
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
}
