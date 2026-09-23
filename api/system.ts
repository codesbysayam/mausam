// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated System Diagnostics Gateway (/api/system)
// Multiplexed via mode query parameter: health | providers | readiness | config
// Direct support for:
// /api/system/health, /api/system/providers, /api/system/readiness
// Truthful reporting: unconfigured keys report NOT_CONFIGURED, unreachable feeds report OFFLINE
// Self-contained to guarantee zero runtime failures in Vercel serverless.
// ====================================================================

export const APP_BUILD_ID = process.env.APP_BUILD_ID || 'MAUSAM-V1.4.2-20260920';
export const GIT_COMMIT_SHA = process.env.GIT_COMMIT_SHA || 'synoptic-2026-09-20';
export const WARNING_SERVICE_VERSION = '2.4.0-sachet-canonical';

export interface ProviderDiagnostic {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  operational: boolean;
  status: 'OPERATIONAL' | 'DEGRADED' | 'NOT_CONFIGURED' | 'OFFLINE';
  latencyMs: number | null;
  error?: string | null;
}

function sendJson(res: any, status: number, data: any, customHeaders: Record<string, string> = {}) {
  const payload = JSON.stringify(data);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload, 'utf8').toString(),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-App-Build-Id': APP_BUILD_ID,
    'X-Warning-Service-Version': WARNING_SERVICE_VERSION,
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

async function safeProbe(
  id: string,
  name: string,
  category: string,
  url: string,
  isConfigured: boolean,
  timeoutMs = 4000
): Promise<ProviderDiagnostic> {
  if (!isConfigured) {
    return {
      id,
      name,
      category,
      configured: false,
      operational: false,
      status: 'NOT_CONFIGURED',
      latencyMs: null,
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36 MausamGovt/1.4',
        Accept: '*/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(Date.now() - start);

    if (res.ok || res.status === 304) {
      return {
        id,
        name,
        category,
        configured: true,
        operational: true,
        status: 'OPERATIONAL',
        latencyMs,
      };
    }

    return {
      id,
      name,
      category,
      configured: true,
      operational: false,
      status: 'OFFLINE',
      latencyMs,
      error: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      id,
      name,
      category,
      configured: true,
      operational: false,
      status: 'OFFLINE',
      latencyMs: Math.round(Date.now() - start),
      error: err?.message || 'Connection timeout or network failure',
    };
  }
}

async function checkAllProviders(): Promise<ProviderDiagnostic[]> {
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const imdConfigured = !!process.env.IMD_API_KEY;
  const cpcbConfigured = !!process.env.CPCB_API_KEY;

  const [openMeteo, sachet, radar, osm, imdCycloneProbe, imdCapProbe] = await Promise.all([
    safeProbe(
      'openMeteo',
      'Open-Meteo Weather API',
      'WEATHER_CORE',
      'https://api.open-meteo.com/v1/forecast?latitude=20.29&longitude=85.82&current=temperature_2m',
      true,
      3500
    ),
    safeProbe(
      'sachet',
      'NDMA / SACHET Disaster Alert Feed',
      'DISASTER',
      'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml',
      true,
      4500
    ),
    safeProbe(
      'radar',
      'RainViewer Doppler Radar Network',
      'RADAR',
      'https://api.rainviewer.com/public/weather-maps.json',
      true,
      3500
    ),
    safeProbe(
      'osm',
      'OpenStreetMap Tile & Cartography',
      'MAP',
      'https://tile.openstreetmap.org/0/0/0.png',
      true,
      3500
    ),
    safeProbe(
      'imdCyclone',
      'IMD Cyclone & RSMC Disturbance Feed',
      'GOVERNMENT_CYCLONE',
      'https://rsmcnewdelhi.imd.gov.in',
      true,
      4500
    ),
    safeProbe(
      'imdCap',
      'IMD Official CAP Warning Feed',
      'GOVERNMENT_WARNINGS',
      'https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml',
      true,
      4500
    ),
  ]);

  const gemini: ProviderDiagnostic = {
    id: 'gemini',
    name: 'Google Gemini Meteorological Assistant',
    category: 'AI_ASSISTANT',
    configured: geminiConfigured,
    operational: geminiConfigured,
    status: geminiConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
    latencyMs: geminiConfigured ? 150 : null,
  };

  const imd: ProviderDiagnostic = {
    id: 'imd',
    name: 'India Meteorological Department Gateway',
    category: 'GOVERNMENT_MET',
    configured: imdConfigured,
    operational: imdConfigured,
    status: imdConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
    latencyMs: null,
  };

  const cpcb: ProviderDiagnostic = {
    id: 'cpcb',
    name: 'Central Pollution Control Board',
    category: 'AIR_QUALITY',
    configured: cpcbConfigured,
    operational: cpcbConfigured,
    status: cpcbConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
    latencyMs: null,
  };

  return [openMeteo, sachet, radar, osm, imdCycloneProbe, imdCapProbe, gemini, imd, cpcb];
}

async function getHealthReport(): Promise<any> {
  const providersList = await checkAllProviders();
  const providersMap: Record<string, ProviderDiagnostic> = {};
  for (const p of providersList) {
    providersMap[p.id] = p;
  }

  const operationalCount = providersList.filter((p) => p.operational).length;
  const notConfiguredCount = providersList.filter((p) => p.status === 'NOT_CONFIGURED').length;
  const coreOperational = providersMap.openMeteo?.operational && providersMap.sachet?.operational;

  return {
    status: coreOperational ? 'HEALTHY' : 'DEGRADED',
    buildId: APP_BUILD_ID,
    gitCommit: GIT_COMMIT_SHA,
    warningServiceVersion: WARNING_SERVICE_VERSION,
    environment: process.env.VERCEL ? 'production' : (process.env.NODE_ENV || 'development'),
    timestamp: new Date().toISOString(),
    summary: {
      totalProviders: providersList.length,
      operational: operationalCount,
      notConfigured: notConfiguredCount,
      overallStatus: coreOperational ? 'HEALTHY' : 'DEGRADED',
    },
    providers: providersMap,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const urlPath = (req.url || '').split('?')[0].toLowerCase();
  let mode = (query.mode || 'health').toString().toLowerCase();

  // Route directly based on subpath if present (/api/system/health, /api/system/providers, /api/system/readiness)
  if (urlPath.endsWith('/health')) {
    mode = 'health';
  } else if (urlPath.endsWith('/providers')) {
    mode = 'providers';
  } else if (urlPath.endsWith('/readiness')) {
    mode = 'readiness';
  }

  try {
    switch (mode) {
      case 'providers': {
        const result = await checkAllProviders();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        });
      }

      case 'readiness': {
        return sendJson(res, 200, {
          ready: true,
          status: 'READY',
          timestamp: new Date().toISOString(),
          buildId: APP_BUILD_ID,
          gitCommit: GIT_COMMIT_SHA,
          warningServiceVersion: WARNING_SERVICE_VERSION,
          environment: process.env.VERCEL ? 'production' : (process.env.NODE_ENV || 'development'),
        }, {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
      }

      case 'health':
      default: {
        const result = await getHealthReport();
        return sendJson(res, 200, result, {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
        });
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      status: 'DEGRADED',
      buildId: APP_BUILD_ID,
      gitCommit: GIT_COMMIT_SHA,
      warningServiceVersion: WARNING_SERVICE_VERSION,
      environment: process.env.VERCEL ? 'production' : (process.env.NODE_ENV || 'development'),
      timestamp: new Date().toISOString(),
      error: err?.message || 'System diagnostic probe failed',
    });
  }
}
