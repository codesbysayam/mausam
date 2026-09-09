// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Source Weather & Scientific API Routes (v2)
// ====================================================================

import { Router, Request, Response } from 'express';
import { weatherOrchestrator } from '../services/WeatherOrchestrator';
import { dataHealthService } from '../services/DataHealthService';
import { weatherDatabase } from '../database/db';
import { weatherCache } from '../cache/weatherCache';
import { spawn } from 'child_process';
import path from 'path';

export const multiSourceRouter = Router();

// Helper to extract GeoLocation from query
function extractLocation(req: Request) {
  const lat = parseFloat((req.query.lat || req.query.latitude) as string);
  const lon = parseFloat((req.query.lon || req.query.lng || req.query.longitude) as string);
  const city = (req.query.city || req.query.location) as string | undefined;
  const district = req.query.district as string | undefined;
  const state = req.query.state as string | undefined;
  const country = (req.query.country as string) || 'India';
  const name = (req.query.name || city) as string | undefined;

  return weatherOrchestrator.resolveLocation({
    lat: isNaN(lat) ? undefined : lat,
    lon: isNaN(lon) ? undefined : lon,
    city,
    district,
    state,
    country,
    name,
  });
}

// 1. Current Weather (Deterministic Priority: IMD -> Google -> AccuWeather -> Open-Meteo)
multiSourceRouter.get('/weather/current', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const forceRefresh = req.query.refresh === 'true';
    const result = await weatherOrchestrator.getCurrentWeather(loc, forceRefresh);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'ERROR_HANDLER',
      dataStatus: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

// 2. Cross-Source Comparison Endpoint
multiSourceRouter.get('/weather/compare', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const comparison = await weatherOrchestrator.compareSources(loc);
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      ...comparison,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 3. Multi-Model Forecast Endpoint
multiSourceRouter.get('/weather/forecast', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const forceRefresh = req.query.refresh === 'true';
    const result = await weatherOrchestrator.getForecast(loc, forceRefresh);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'ERROR_HANDLER',
      dataStatus: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

// 4. Air Quality Index (CPCB NAQI)
multiSourceRouter.get('/weather/aqi', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherOrchestrator.getAQI(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'ERROR_HANDLER',
      dataStatus: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

// 5. Active Warnings (NDMA SACHET & IMD)
multiSourceRouter.get('/weather/warnings', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherOrchestrator.getWarnings(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'ERROR_HANDLER',
      dataStatus: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

// 6. Coastal & Marine Telemetry (INCOIS)
multiSourceRouter.get('/weather/marine', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherOrchestrator.getMarine(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'ERROR_HANDLER',
      dataStatus: 'UNAVAILABLE',
      error: err.message,
    });
  }
});

// 7. Internal Data Health Monitor & Source Transparency
multiSourceRouter.get('/health/sources', async (_req: Request, res: Response) => {
  try {
    const summary = dataHealthService.getSystemSummary();
    const sources = dataHealthService.getAllSources();
    const dbStatus = await weatherDatabase.getStatus();
    const cacheStats = weatherCache.getStats();

    res.json({
      status: 'success',
      summary,
      sources,
      database: dbStatus,
      cache: cacheStats,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 8. Database Health Status
multiSourceRouter.get('/database/status', async (_req: Request, res: Response) => {
  try {
    const status = await weatherDatabase.getStatus();
    res.json({ status: 'success', database: status });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 9. Python Atmospheric Calculations RPC
multiSourceRouter.post('/python/calculate', async (req: Request, res: Response) => {
  try {
    const payload = JSON.stringify(req.body || {});
    const scriptPath = path.join(process.cwd(), 'python', 'service.py');

    const py = spawn('python3', [scriptPath, 'calculate', payload]);
    let output = '';
    let errorOutput = '';

    py.stdout.on('data', (data) => {
      output += data.toString();
    });

    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          status: 'error',
          error: errorOutput || `Python exited with code ${code}`,
        });
      }
      try {
        const json = JSON.parse(output);
        res.json(json);
      } catch (parseErr: any) {
        res.status(500).json({ status: 'error', error: parseErr.message, raw: output });
      }
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});
