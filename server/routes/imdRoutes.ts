/**
 * Express Route handlers for IMD Data Connector API
 */

import { Router, Request, Response } from 'express';
import { imdConnector } from '../imd/imdConnector';
import { imdClient } from '../imd/imdClient';
import { imdCache } from '../imd/imdCache';
import { AQIProvider } from '../environment/aqiProvider';
import { PollenProvider } from '../environment/pollenProvider';
import cityStationMapData from '../imd/cityStationMap.json';

export const imdRouter = Router();

// Current Weather
imdRouter.get('/current-weather/:stationId?', async (req: Request, res: Response) => {
  try {
    const stationId = req.params.stationId || (req.query.id as string);
    const result = await imdConnector.getCurrentWeather(stationId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      source: 'IMD',
      status: 'error',
      fetchedAt: new Date().toISOString(),
      stale: false,
      data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  }
});

// City Forecast (7 Days)
imdRouter.get('/city-forecast/:cityId', async (req: Request, res: Response) => {
  try {
    const cityId = req.params.cityId;
    const result = await imdConnector.getCityForecast(cityId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      source: 'IMD',
      status: 'error',
      fetchedAt: new Date().toISOString(),
      stale: false,
      data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  }
});

// City Forecast Location
imdRouter.get('/city-location/:cityId', async (req: Request, res: Response) => {
  try {
    const cityId = req.params.cityId;
    const result = await imdClient.cityForecastLocation(cityId);
    res.json({
      source: 'IMD',
      status: result.ok ? 'success' : 'error',
      fetchedAt: result.fetchedAt,
      stale: false,
      data: result.data,
      error: result.error || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// District Nowcast
imdRouter.get('/district-nowcast', async (req: Request, res: Response) => {
  try {
    const districtId = req.query.id as string;
    const result = await imdConnector.getDistrictNowcast(districtId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// District Rainfall
imdRouter.get('/district-rainfall', async (req: Request, res: Response) => {
  try {
    const districtId = req.query.id as string;
    const result = await imdConnector.getDistrictRainfall(districtId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// District Warnings
imdRouter.get('/district-warning', async (req: Request, res: Response) => {
  try {
    const districtId = req.query.id as string;
    const result = await imdConnector.getDistrictWarnings(districtId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Station Nowcast
imdRouter.get('/station-nowcast', async (req: Request, res: Response) => {
  try {
    const station = req.query.id as string;
    const result = await imdConnector.getStationNowcast(station);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// State Rainfall
imdRouter.get('/state-rainfall', async (req: Request, res: Response) => {
  try {
    const stateId = req.query.id as string;
    const result = await imdConnector.getStateRainfall(stateId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AWS Data
imdRouter.get('/aws', async (req: Request, res: Response) => {
  try {
    const stationId = req.query.id as string;
    const stateId = req.query.sid as string;
    const result = await imdConnector.getAWSData(stationId, stateId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AWS Mapping
imdRouter.get('/aws-mapping', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.awsMapping();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Basin QPF
imdRouter.get('/basin-qpf', async (req: Request, res: Response) => {
  try {
    const basinId = req.query.id as string;
    const result = await imdClient.basinQPF(basinId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Port Warning
imdRouter.get('/port-warning', async (req: Request, res: Response) => {
  try {
    const portId = req.query.id as string;
    const result = await imdClient.portWarning(portId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Sea Bulletin
imdRouter.get('/sea-bulletin', async (req: Request, res: Response) => {
  try {
    const areaId = req.query.id as string;
    const result = await imdClient.seaBulletin(areaId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coastal Bulletin
imdRouter.get('/coastal-bulletin', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.coastalBulletin();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Subdivision Warning
imdRouter.get('/subdivision-warning', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.subdivisionWarning();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Sun / Moon Ephemeris
imdRouter.get('/sunmoon', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lon = parseFloat(req.query.lon as string) || 85.8245;
    const result = await imdConnector.getSunMoon(lat, lon);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Subdivision Rainfall Forecast
imdRouter.get('/subdivision-rainfall-forecast', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.subdivisionRainfallForecast();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// State District Rainfall Forecast
imdRouter.get('/state-district-rainfall-forecast', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.stateDistrictRainfallForecast();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cyclone Track, Wind & Cone
imdRouter.get('/cyclone-track', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.cycloneTrack();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

imdRouter.get('/cyclone-wind', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.cycloneWind();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

imdRouter.get('/cyclone-cou', async (_req: Request, res: Response) => {
  try {
    const result = await imdClient.cycloneCone();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

imdRouter.get('/cyclone-bundle', async (_req: Request, res: Response) => {
  try {
    const result = await imdConnector.getCycloneData();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

imdRouter.get('/marine-bundle', async (req: Request, res: Response) => {
  try {
    const portId = req.query.portId as string;
    const seaAreaId = req.query.seaAreaId as string;
    const result = await imdConnector.getMarineBulletins(portId, seaAreaId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// National Overview
imdRouter.get('/overview', async (_req: Request, res: Response) => {
  try {
    const result = await imdConnector.getNationalOverview();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// States and UTs
imdRouter.get('/states', (_req: Request, res: Response) => {
  res.json({
    source: 'IMD',
    status: 'success',
    fetchedAt: new Date().toISOString(),
    data: imdConnector.getStates(),
  });
});

// City Station Mapping Directory
imdRouter.get('/city-mapping', (_req: Request, res: Response) => {
  res.json({
    source: 'IMD',
    status: 'success',
    fetchedAt: new Date().toISOString(),
    data: cityStationMapData,
  });
});

// Air Quality Provider (Rule 30: No fake values)
imdRouter.get('/environment/aqi', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lng = parseFloat(req.query.lng as string) || 85.8245;
    const name = req.query.name as string;
    const data = await AQIProvider.getAQIForLocation(lat, lng, name);
    res.json({
      source: 'IMD / CPCB SAFAR Provider',
      status: data.status,
      fetchedAt: data.updatedAt,
      data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pollen Provider (Rule 30: No fake values)
imdRouter.get('/environment/pollen', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lng = parseFloat(req.query.lng as string) || 85.8245;
    const data = await PollenProvider.getPollenForLocation(lat, lng);
    res.json({
      source: 'IMD Botanical Telemetry',
      status: data.status,
      fetchedAt: data.updatedAt,
      data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cache & Deduplication Debug Statistics
imdRouter.get('/debug/stats', (_req: Request, res: Response) => {
  res.json({
    source: 'IMD Connector Cache Layer',
    status: 'operational',
    timestamp: new Date().toISOString(),
    stats: imdCache.getStats(),
  });
});
