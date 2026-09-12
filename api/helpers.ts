// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Vercel Serverless Function Helpers
// ====================================================================

import { GeoLocation } from '../backend/normalization/types';

export function extractLocationFromReq(req: any): GeoLocation {
  const query = req.query || {};
  const lat = query.lat || query.latitude;
  const lon = query.lon || query.lng || query.longitude;
  const city = query.city || query.q;
  const state = query.state;

  const latitude = typeof lat === 'string' ? parseFloat(lat) : typeof lat === 'number' ? lat : 20.2961;
  const longitude = typeof lon === 'string' ? parseFloat(lon) : typeof lon === 'number' ? lon : 85.8245;
  const cityName = typeof city === 'string' ? city : 'Bhubaneswar';

  return {
    name: cityName,
    city: cityName,
    state: typeof state === 'string' ? state : 'Odisha',
    country: 'India',
    district: typeof query.district === 'string' ? query.district : undefined,
    latitude: isNaN(latitude) ? 20.2961 : latitude,
    longitude: isNaN(longitude) ? 85.8245 : longitude,
  };
}

export function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function') {
    res.status(status);
  } else {
    res.statusCode = status;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}
