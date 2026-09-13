import { sendJson } from '../../helpers';
import { systemHealthService } from '../../../backend/services/systemHealthService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const { provider, apiKey, enabled, baseUrl } = req.body || {};
    if (!provider) {
      return sendJson(res, 400, { error: 'provider identifier is required' });
    }

    const prov = String(provider).toLowerCase();
    if (prov === 'imd') {
      if (apiKey !== undefined) process.env.IMD_API_KEY = apiKey;
      if (enabled !== undefined) process.env.IMD_ENABLED = String(enabled);
      if (baseUrl) process.env.IMD_API_BASE_URL = baseUrl;
    } else if (prov === 'cpcb') {
      if (apiKey !== undefined) process.env.CPCB_API_KEY = apiKey;
      if (enabled !== undefined) process.env.CPCB_ENABLED = String(enabled);
    } else if (prov === 'accuweather') {
      if (apiKey !== undefined) process.env.ACCUWEATHER_API_KEY = apiKey;
      if (enabled !== undefined) process.env.ACCUWEATHER_ENABLED = String(enabled);
    } else if (prov === 'googleweather' || prov === 'google_weather') {
      if (apiKey !== undefined) process.env.GOOGLE_WEATHER_API_KEY = apiKey;
      if (enabled !== undefined) process.env.GOOGLE_WEATHER_ENABLED = String(enabled);
    } else if (prov === 'database' && apiKey) {
      process.env.DATABASE_URL = apiKey;
    }

    const health = await systemHealthService.getHealth();
    return sendJson(res, 200, {
      status: 'success',
      message: `Configuration for ${provider} applied successfully`,
      health,
    });
  } catch (err: any) {
    return sendJson(res, 500, { status: 'error', error: err.message });
  }
}
