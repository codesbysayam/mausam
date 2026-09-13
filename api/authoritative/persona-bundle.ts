import { sendJson } from '../helpers';
import { AuthoritativeService } from '../../server/authoritative/authoritativeService';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const query = Object.fromEntries(urlObj.searchParams.entries());

    const lat = parseFloat(query.lat as string) || 20.2961;
    const lng = parseFloat(query.lng as string) || 85.8245;
    const city = (query.city as string) || 'Bhubaneswar';
    const state = (query.state as string) || 'Odisha';
    const stationName = (query.stationName as string) || `${city} Observatory`;

    const temp = query.temp ? parseFloat(query.temp as string) : undefined;
    const humidity = query.humidity ? parseFloat(query.humidity as string) : undefined;
    const windSpeed = query.windSpeed ? parseFloat(query.windSpeed as string) : undefined;
    const windDir = query.windDir as string | undefined;
    const uvIndex = query.uvIndex ? parseFloat(query.uvIndex as string) : undefined;
    const isRaining = query.isRaining === 'true';
    const visibilityKm = query.visibilityKm ? parseFloat(query.visibilityKm as string) : undefined;
    const sunrise = query.sunrise as string | undefined;
    const sunset = query.sunset as string | undefined;

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

    return sendJson(res, 200, {
      status: 'success',
      source: 'MAUSAM Authoritative Multi-Provider Intelligence Engine',
      fetchedAt: new Date().toISOString(),
      data,
    });
  } catch (err: any) {
    console.error('[Vercel authoritative] Error in /persona-bundle:', err);
    return sendJson(res, 500, {
      status: 'error',
      message: err.message || 'Failed to assemble authoritative persona bundle',
    });
  }
}
