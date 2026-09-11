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
  locationService,
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
    res.status(500).json({
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      data: null,
      error: err.message,
    });
  }
});

// 3. Multi-Day Forecast: GET /api/weather/forecast?lat=...&lon=...
unifiedApiRouter.get('/weather/forecast', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getForecast(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      data: null,
      error: err.message,
    });
  }
});

// 4. Hourly Forecast: GET /api/weather/hourly?lat=...&lon=...
unifiedApiRouter.get('/weather/hourly', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getHourly(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      data: null,
      error: err.message,
    });
  }
});

// 5. Daily Forecast: GET /api/weather/daily?lat=...&lon=...
unifiedApiRouter.get('/weather/daily', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await weatherService.getDaily(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'Open-Meteo',
      provider: 'OPEN_METEO',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Open-Meteo',
      data: null,
      error: err.message,
    });
  }
});

// 6. Air Quality: GET /api/air-quality?lat=...&lon=...
unifiedApiRouter.get('/air-quality', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await aqiService.getAirQuality(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'CPCB',
      provider: 'CPCB',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'CPCB',
      data: null,
      error: err.message,
    });
  }
});

// 7. Warnings: GET /api/warnings?lat=...&lon=...
unifiedApiRouter.get('/warnings', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await warningService.getWarnings(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'NDMA / SACHET',
      provider: 'SACHET',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'NDMA / SACHET',
      data: { hasActiveWarnings: false, count: 0, warnings: [] },
      error: err.message,
    });
  }
});

// 8. Marine: GET /api/marine?lat=...&lon=...
unifiedApiRouter.get('/marine', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await marineService.getMarine(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'INCOIS',
      provider: 'INCOIS',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'INCOIS',
      data: null,
      error: err.message,
    });
  }
});

// 9. Radar: GET /api/radar?lat=...&lon=...
unifiedApiRouter.get('/radar', async (req: Request, res: Response) => {
  try {
    const loc = extractLocation(req);
    const result = await radarService.getRadar(loc);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      source: 'Radar Source: RainViewer (Open Weather Maps API)',
      provider: 'RADAR',
      dataStatus: 'UNAVAILABLE',
      observedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      cached: false,
      ageSeconds: 0,
      primarySource: 'Radar Source: RainViewer (Open Weather Maps API)',
      data: null,
      error: err.message,
    });
  }
});

// 10. Stations: GET /api/stations?lat=...&lon=...
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

// 11. Location Geocoding Search: GET /api/locations/search?q=...
unifiedApiRouter.get('/locations/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || (req.query.query as string) || '';
    const count = parseInt(req.query.count as string, 10) || 10;
    const results = await locationService.searchLocations(query, count);
    res.json({
      status: 'success',
      query,
      count: results.length,
      locations: results,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 12. Provider Configuration Endpoint: POST /api/system/config/provider
unifiedApiRouter.post('/system/config/provider', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, enabled, baseUrl } = req.body || {};
    if (!provider) {
      return res.status(400).json({ error: 'provider identifier is required' });
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
    res.json({
      status: 'success',
      message: `Configuration for ${provider} applied successfully`,
      health,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});
