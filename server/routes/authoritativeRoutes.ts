import { Router, Request, Response } from 'express';
import { AuthoritativeService } from '../authoritative/authoritativeService';

export const authoritativeRouter = Router();

// Full Persona Intelligence Bundle for the active station
authoritativeRouter.get('/persona-bundle', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lng = parseFloat(req.query.lng as string) || 85.8245;
    const city = (req.query.city as string) || 'Bhubaneswar';
    const state = (req.query.state as string) || 'Odisha';
    const stationName = (req.query.stationName as string) || `${city} Observatory`;

    const temp = req.query.temp ? parseFloat(req.query.temp as string) : undefined;
    const humidity = req.query.humidity ? parseFloat(req.query.humidity as string) : undefined;
    const windSpeed = req.query.windSpeed ? parseFloat(req.query.windSpeed as string) : undefined;
    const windDir = req.query.windDir as string | undefined;
    const uvIndex = req.query.uvIndex ? parseFloat(req.query.uvIndex as string) : undefined;
    const isRaining = req.query.isRaining === 'true';
    const visibilityKm = req.query.visibilityKm ? parseFloat(req.query.visibilityKm as string) : undefined;
    const sunrise = req.query.sunrise as string | undefined;
    const sunset = req.query.sunset as string | undefined;

    const data = await AuthoritativeService.getPersonaBundle(lat, lng, city, state, stationName, {
      temp,
      humidity,
      windSpeed,
      windDir,
      uvIndex,
      isRaining,
      visibilityKm,
      sunrise,
      sunset,
    });

    res.json({
      status: 'success',
      source: 'MAUSAM Authoritative Multi-Provider Intelligence Engine',
      fetchedAt: new Date().toISOString(),
      data,
    });
  } catch (err: any) {
    console.error('[authoritativeRouter] Error in /persona-bundle:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to assemble authoritative persona bundle',
    });
  }
});

// Standalone CPCB AQI Endpoint
authoritativeRouter.get('/cpcb-aqi', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lng = parseFloat(req.query.lng as string) || 85.8245;
    const city = (req.query.city as string) || 'Bhubaneswar';
    const stationName = (req.query.stationName as string) || city;

    const aqi = await AuthoritativeService.fetchCPCBOrOpenMeteoAQI(lat, lng, stationName, city);
    res.json({
      status: 'success',
      source: aqi.source,
      fetchedAt: new Date().toISOString(),
      data: aqi,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Standalone Marine Waves & SST Endpoint
authoritativeRouter.get('/marine', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.8135;
    const lng = parseFloat(req.query.lng as string) || 85.8312;
    const isCoastal = AuthoritativeService.isLocationCoastal(lat, lng);

    const marine = await AuthoritativeService.fetchMarineData(lat, lng, isCoastal);
    res.json({
      status: 'success',
      isCoastal,
      data: marine,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Standalone Tides Endpoint
authoritativeRouter.get('/tides', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.8135;
    const lng = parseFloat(req.query.lng as string) || 85.8312;
    const stationName = (req.query.stationName as string) || 'Coastal Station';
    const isCoastal = AuthoritativeService.isLocationCoastal(lat, lng);

    const tides = await AuthoritativeService.fetchTideData(lat, lng, stationName, isCoastal);
    res.json({
      status: 'success',
      isCoastal,
      data: tides,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Standalone Severe Alerts Endpoint
authoritativeRouter.get('/alerts', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 20.2961;
    const lng = parseFloat(req.query.lng as string) || 85.8245;
    const city = (req.query.city as string) || 'Bhubaneswar';
    const state = (req.query.state as string) || 'Odisha';

    const alerts = await AuthoritativeService.fetchSevereAlerts(lat, lng, city, state);
    res.json({
      status: 'success',
      data: alerts,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
