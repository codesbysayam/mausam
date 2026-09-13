import { sendJson } from '../helpers';
import { imdConnector } from '../../server/imd/imdConnector';
import { AQIProvider } from '../../server/environment/aqiProvider';
import { PollenProvider } from '../../server/environment/pollenProvider';
import cityStationMapData from '../../server/imd/cityStationMap.json';
import imdStationsData from '../../src/data/imdStations.json';
import indiaLocationsData from '../../src/data/indiaLocations.json';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname.replace(/^\/api\/imd\/?/, '');
  const query = Object.fromEntries(urlObj.searchParams.entries());
  const pathParts = pathname.split('/').filter(Boolean);
  const route = pathParts[0] || '';
  const subParam = pathParts[1] || query.id || '';

  try {
    switch (route) {
      case 'current-weather': {
        const stationId = subParam || query.id;
        const result = await imdConnector.getCurrentWeather(stationId);
        return sendJson(res, 200, result);
      }
      case 'city-forecast': {
        const result = await imdConnector.getCityForecast(subParam);
        return sendJson(res, 200, result);
      }
      case 'district-warning':
      case 'warnings': {
        const districtId = subParam || query.id || query.districtId;
        const result = await imdConnector.getDistrictWarnings(districtId);
        return sendJson(res, 200, result);
      }
      case 'district-nowcast': {
        const districtId = subParam || query.id || query.districtId;
        const result = await imdConnector.getDistrictNowcast(districtId);
        return sendJson(res, 200, result);
      }
      case 'state-rainfall': {
        const stateId = subParam || query.id;
        const result = await imdConnector.getStateRainfall(stateId);
        return sendJson(res, 200, result);
      }
      case 'aws': {
        const stationId = query.id;
        const stateId = query.sid;
        const result = await imdConnector.getAWSData(stationId, stateId);
        return sendJson(res, 200, result);
      }
      case 'sunmoon': {
        const lat = parseFloat(query.lat) || 20.2961;
        const lng = parseFloat(query.lng) || 85.8245;
        const result = await imdConnector.getSunMoon(lat, lng);
        return sendJson(res, 200, result);
      }
      case 'cyclone-bundle': {
        const result = await imdConnector.getCycloneData();
        return sendJson(res, 200, result);
      }
      case 'marine-bundle': {
        const portId = query.portId as string;
        const seaAreaId = query.seaAreaId as string;
        const result = await imdConnector.getMarineBulletins(portId, seaAreaId);
        return sendJson(res, 200, result);
      }
      case 'overview': {
        const result = await imdConnector.getNationalOverview();
        return sendJson(res, 200, result);
      }
      case 'stations': {
        return sendJson(res, 200, {
          source: 'IMD Station Master Registry',
          status: 'success',
          fetchedAt: new Date().toISOString(),
          count: imdStationsData.length,
          data: imdStationsData,
        });
      }
      case 'locations': {
        return sendJson(res, 200, {
          source: 'IMD / Survey of India Administrative Hierarchy',
          status: 'success',
          fetchedAt: new Date().toISOString(),
          data: indiaLocationsData,
        });
      }
      case 'city-mapping': {
        return sendJson(res, 200, {
          source: 'IMD',
          status: 'success',
          fetchedAt: new Date().toISOString(),
          data: cityStationMapData,
        });
      }
      case 'environment': {
        const sub = pathParts[1] || '';
        const lat = parseFloat(query.lat) || 20.2961;
        const lng = parseFloat(query.lng) || 85.8245;
        if (sub === 'aqi') {
          const name = query.name || 'Bhubaneswar';
          const data = await AQIProvider.getAQIForLocation(lat, lng, name);
          return sendJson(res, 200, {
            source: 'IMD / CPCB SAFAR Provider',
            status: data.status,
            fetchedAt: data.updatedAt,
            data,
          });
        }
        if (sub === 'pollen') {
          const data = await PollenProvider.getPollenForLocation(lat, lng);
          return sendJson(res, 200, {
            source: 'IMD Botanical Telemetry',
            status: data.status,
            fetchedAt: data.updatedAt,
            data,
          });
        }
        return sendJson(res, 404, { error: `Unknown environment route: ${sub}` });
      }
      default: {
        return sendJson(res, 404, { error: `Unknown IMD route: ${route}` });
      }
    }
  } catch (err: any) {
    return sendJson(res, 500, {
      source: 'IMD',
      status: 'error',
      fetchedAt: new Date().toISOString(),
      stale: false,
      data: null,
      error: { code: 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  }
}
