/**
 * Server-side IMD Proxy Handler & Router
 * Proxies `/api/imd/*` calls securely to `https://api.imd.gov.in/api/v1/*`
 * Injects authorized credentials server-side; credentials never exposed to client.
 */

import { Router, Request, Response } from 'express';
import { imdClient } from './imd/imdClient';
import { imdConnector } from './imd/imdConnector';
import { imdCache } from './imd/imdCache';

export const imdProxyRouter = Router();

// Logging helper (Rule 24: log only specified tags, never credentials)
function logIMD(event: 'started' | 'success' | 'failed' | 'hit' | 'expired', detail?: string) {
  if (process.env.IMD_ENABLE_LOGGING === 'true') {
    const timestamp = new Date().toISOString();
    switch (event) {
      case 'started':
        console.log(`[IMD] Request started: ${detail || ''} (${timestamp})`);
        break;
      case 'success':
        console.log(`[IMD] Request successful: ${detail || ''} (${timestamp})`);
        break;
      case 'failed':
        console.log(`[IMD] Request failed: ${detail || ''} (${timestamp})`);
        break;
      case 'hit':
        console.log(`[IMD] Cache hit: ${detail || ''} (${timestamp})`);
        break;
      case 'expired':
        console.log(`[IMD] Cache expired: ${detail || ''} (${timestamp})`);
        break;
    }
  }
}

// 1. Direct pass-through proxy with caching & error classification
imdProxyRouter.get('/proxy/:endpoint', async (req: Request, res: Response) => {
  const endpoint = req.params.endpoint;
  const query = req.query as Record<string, string>;
  const cacheKey = `proxy:${endpoint}:${JSON.stringify(query)}`;

  logIMD('started', endpoint);

  const { entry, isStale } = imdCache.get(cacheKey);
  if (entry && !isStale) {
    logIMD('hit', endpoint);
    return res.json({
      ok: true,
      source: 'IMD',
      fetchedAt: entry.fetchedAt,
      stale: false,
      data: entry.data,
    });
  }

  if (entry && isStale) {
    logIMD('expired', endpoint);
  }

  try {
    const response = await imdClient.request(endpoint, query);
    if (response.ok && response.data) {
      logIMD('success', endpoint);
      imdCache.set(cacheKey, response.data, response.raw, 60000);
      return res.json(response);
    }

    logIMD('failed', endpoint);
    if (entry) {
      return res.json({
        ok: true,
        source: 'IMD',
        fetchedAt: entry.fetchedAt,
        stale: true,
        data: entry.data,
        error: response.error,
      });
    }

    return res.status(response.error?.statusCode || 502).json(response);
  } catch (err: any) {
    logIMD('failed', `${endpoint} (${err.message})`);
    if (entry) {
      return res.json({
        ok: true,
        source: 'IMD',
        fetchedAt: entry.fetchedAt,
        stale: true,
        data: entry.data,
      });
    }
    return res.status(500).json({
      ok: false,
      source: 'IMD',
      fetchedAt: new Date().toISOString(),
      stale: false,
      data: null,
      error: { code: 'IMD_REQUEST_FAILED', message: err.message },
    });
  }
});

// 2. High-level endpoints for UI components
imdProxyRouter.get('/current_wx', async (req: Request, res: Response) => {
  const stationId = req.query.id as string;
  const result = await imdConnector.getCurrentWeather(stationId);
  res.json(result);
});

imdProxyRouter.get('/cityforecast', async (req: Request, res: Response) => {
  const stationId = (req.query.id as string) || '42971';
  const result = await imdConnector.getCityForecast(stationId);
  res.json(result);
});

imdProxyRouter.get('/districtwarning', async (req: Request, res: Response) => {
  const districtId = req.query.id as string;
  const result = await imdConnector.getDistrictWarnings(districtId);
  res.json(result);
});

imdProxyRouter.get('/districtnowcast', async (req: Request, res: Response) => {
  const districtId = req.query.id as string;
  const result = await imdConnector.getDistrictNowcast(districtId);
  res.json(result);
});

imdProxyRouter.get('/stationnowcast', async (req: Request, res: Response) => {
  const station = req.query.id as string;
  const result = await imdConnector.getStationNowcast(station);
  res.json(result);
});

imdProxyRouter.get('/districtrainfall', async (req: Request, res: Response) => {
  const districtId = req.query.id as string;
  const result = await imdConnector.getDistrictRainfall(districtId);
  res.json(result);
});

imdProxyRouter.get('/staterainfall', async (req: Request, res: Response) => {
  const stateId = req.query.id as string;
  const result = await imdConnector.getStateRainfall(stateId);
  res.json(result);
});

imdProxyRouter.get('/sunmoon', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 20.2961;
  const lon = parseFloat(req.query.lon as string) || 85.8245;
  const result = await imdConnector.getSunMoon(lat, lon);
  res.json(result);
});

export default imdProxyRouter;
