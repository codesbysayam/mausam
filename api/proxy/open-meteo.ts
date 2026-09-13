import { sendJson } from '../helpers';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const queryString = urlObj.searchParams.toString();
    const targetUrl = `https://api.open-meteo.com/v1/forecast?${queryString}`;
    
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' },
    });
    
    if (!response.ok) {
      return sendJson(res, response.status, { error: `Upstream error HTTP ${response.status}` });
    }
    
    const data = await response.json();
    return sendJson(res, 200, data);
  } catch (err: any) {
    return sendJson(res, 502, { error: err?.message || 'Proxy upstream fetch failed' });
  }
}
