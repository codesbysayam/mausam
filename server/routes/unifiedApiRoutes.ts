// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Unified Production Weather API Router
// Coordinates-First, Zero-Fake Data, Real Cache & Database Integration
// ====================================================================

import { Router, Request, Response } from 'express';
import {
  weatherService,
  warningService,
  aqiService,
  marineService,
  radarService,
  stationService,
  systemHealthService,
  GeoLocation,
} from '../../backend';

export const unifiedApiRouter = Router();

function extractLocation(req: Request): GeoLocation {
  const latStr = (req.query.lat || req.query.latitude || '28.6139') as string;
  const lonStr = (req.query.lon || req.query.lng || req.query.longitude || '77.2090') as string;

  const latitude = parseFloat(latStr) || 28.6139;
  const longitude = parseFloat(lonStr) || 77.2090;

  const name = (req.query.name as string) || (req.query.city as string) || 'Location';
  const city = (req.query.city as string) || (req.query.name as string);
  const district = (req.query.district as string) || city;
  const state = (req.query.state as string) || undefined;

  return {
    name,
    city,
    district,
    state,
    country: 'India',
    latitude,
    longitude,
  };
}

// 1. System Health API: GET /api/system/health
unifiedApiRouter.get('/system/health', async (req: Request, res: Response) => {
  try {
    const health = await systemHealthService.getHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for existing frontend compatibility
unifiedApiRouter.get('/v2/health/sources', async (req: Request, res: Response) => {
  try {
    const health = await systemHealthService.getHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Current Weather: GET /api/weather/current?lat=...&lon=...
unifiedApiRouter.get('/weather/current', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getCurrentWeather(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 3. Hourly Forecast: GET /api/weather/hourly?lat=...&lon=...
unifiedApiRouter.get('/weather/hourly', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getHourly(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 4. Daily Forecast: GET /api/weather/daily?lat=...&lon=...
unifiedApiRouter.get('/weather/daily', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getDaily(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 5. Air Quality: GET /api/air-quality?lat=...&lon=...
unifiedApiRouter.get('/air-quality', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await aqiService.getAirQuality(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 6. Warnings: GET /api/warnings?lat=...&lon=...
unifiedApiRouter.get('/warnings', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await warningService.getWarnings(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 7. Marine: GET /api/marine?lat=...&lon=...
unifiedApiRouter.get('/marine', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await marineService.getMarine(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 8. Radar: GET /api/radar?lat=...&lon=...
unifiedApiRouter.get('/radar', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await radarService.getRadar(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 9. Stations: GET /api/stations?lat=...&lon=...
unifiedApiRouter.get('/stations', (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const nearest = stationService.findNearestStations(loc.latitude, loc.longitude, 10);
    res.json({
      status: 'success',
      location: loc,
      count: nearest.length,
      stations: nearest,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});
