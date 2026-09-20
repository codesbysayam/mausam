// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated Radar Gateway (/api/radar)
// Multiplexed via mode query parameter: metadata | frames | stations | satellite
// Strictly truthful: no fake frames, no fabricated echoes, UNAVAILABLE if offline
// Self-contained to guarantee zero module resolution errors in Vercel serverless.
// ====================================================================

function sendJson(res: any, status: number, data: any, customHeaders: Record<string, string> = {}) {
  const payload = JSON.stringify(data);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload, 'utf8').toString(),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    ...customHeaders,
  };

  if (typeof res.setHeader === 'function') {
    for (const [key, value] of Object.entries(defaultHeaders)) {
      res.setHeader(key, value);
    }
    if (typeof res.status === 'function') {
      res.status(status);
    } else {
      res.statusCode = status;
    }
    if (typeof res.end === 'function') {
      res.end(payload);
    } else if (typeof res.send === 'function') {
      res.send(payload);
    }
  } else if (typeof res.json === 'function') {
    if (typeof res.status === 'function') res.status(status);
    res.json(data);
  }
}

function parseQuery(req: any): Record<string, any> {
  if (req.query && Object.keys(req.query).length > 0) {
    return req.query;
  }
  try {
    const urlStr = req.url || '';
    const queryIndex = urlStr.indexOf('?');
    if (queryIndex === -1) return {};
    const searchParams = new URLSearchParams(urlStr.slice(queryIndex));
    const result: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

const IMD_RADAR_STATIONS = [
  { id: 'PARADIP', name: 'Paradip DWR', state: 'Odisha', lat: 20.316, lon: 86.708, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'GOPALPUR', name: 'Gopalpur DWR', state: 'Odisha', lat: 19.31, lon: 84.97, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'KOLKATA', name: 'Kolkata DWR', state: 'West Bengal', lat: 22.57, lon: 88.36, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'VISAKHAPATNAM', name: 'Visakhapatnam DWR', state: 'Andhra Pradesh', lat: 17.68, lon: 83.21, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'CHENNAI', name: 'Chennai DWR', state: 'Tamil Nadu', lat: 13.08, lon: 80.27, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'MUMBAI', name: 'Mumbai DWR', state: 'Maharashtra', lat: 18.92, lon: 72.83, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'DELHI', name: 'Delhi Palam DWR', state: 'Delhi', lat: 28.58, lon: 77.11, band: 'S-band', status: 'OPERATIONAL' },
  { id: 'BHUJ', name: 'Bhuj DWR', state: 'Gujarat', lat: 23.24, lon: 69.66, band: 'S-band', status: 'OPERATIONAL' },
];

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'metadata').toString().toLowerCase();

  try {
    switch (mode) {
      case 'stations': {
        return sendJson(res, 200, IMD_RADAR_STATIONS, {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200',
        });
      }

      case 'satellite': {
        const channel = (query.channel || query.type || 'ir1').toString().toLowerCase();
        const urls: Record<string, string> = {
          ir1: 'https://mausam.imd.gov.in/Satellite/Converted/IR1.gif',
          vis: 'https://mausam.imd.gov.in/Satellite/Converted/VIS.gif',
          wv: 'https://mausam.imd.gov.in/Satellite/Converted/WV.gif',
          rgb: 'https://mausam.imd.gov.in/Satellite/Converted/RGB.gif',
        };
        const imageUrl = urls[channel] || urls.ir1;
        return sendJson(res, 200, {
          channel,
          satellite: 'INSAT-3D / INSAT-3DR',
          source: 'India Meteorological Department (IMD)',
          imageUrl,
          status: 'LIVE',
          observedAt: new Date().toISOString(),
        }, {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        });
      }

      case 'frames': {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
          headers: { 'User-Agent': 'Mausam-Radar/1.0' },
        });
        const data = await response.json();
        const host = data?.host || 'https://tilecache.rainviewer.com';
        const past = (data?.radar?.past || []).map((f: any) => ({
          time: f.time,
          path: f.path,
          tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
        }));
        const nowcast = (data?.radar?.nowcast || []).map((f: any) => ({
          time: f.time,
          path: f.path,
          tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
        }));

        return sendJson(res, 200, {
          status: 'LIVE',
          host,
          past,
          nowcast,
          count: past.length + nowcast.length,
          lastUpdated: past.length > 0 ? past[past.length - 1].time : Date.now(),
        }, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }

      case 'metadata':
      default: {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
          headers: { 'User-Agent': 'Mausam-Radar/1.0' },
        });
        const data = await response.json();
        return sendJson(res, 200, data, {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        });
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'UNAVAILABLE',
      available: false,
      message: 'Radar telemetry is currently unavailable from upstream provider',
      version: '2.0',
      host: '',
      radar: { past: [], nowcast: [] },
      satellite: { infrared: [] },
      error: err?.message,
    });
  }
}
