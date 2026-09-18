// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Provider Diagnostic & Health Status Endpoint (/api/system/providers)
// Probes Open-Meteo, IMD, CPCB, Sachet, Incois, and Radar
// Uses a centralized safeFetch utility with timeout & failure isolation
// ====================================================================

import { sendJson } from '../helpers';

export interface ProviderStatus {
  id: string;
  provider: string;
  name: string;
  category: 'WEATHER_CORE' | 'GOVERNMENT_MET' | 'AIR_QUALITY' | 'DISASTER' | 'OCEAN_MARINE' | 'RADAR';
  active: boolean;
  configured: boolean;
  connected: boolean;
  connectionStatus: 'CONNECTED' | 'DEGRADED' | 'NOT_CONFIGURED' | 'DISCONNECTED' | 'RATE_LIMITED';
  status: 'OPERATIONAL' | 'DEGRADED' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
  latencyMs: number | null;
  endpoint: string;
  error: string | null;
  lastChecked: string;
}

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number | null;
  latencyMs: number;
  data: T | null;
  error: string | null;
}

/**
 * Centralized safe-fetch utility:
 * - Guarantees a hard timeout via AbortController
 * - Prevents unhandled exceptions from crashing the process
 * - Measures roundtrip latency accurately via performance.now()
 */
export async function safeFetch<T = any>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 4000
): Promise<SafeFetchResult<T>> {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mausam-Provider-HealthCheck/1.0',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        latencyMs,
        data: null,
        error: `HTTP ${res.status} ${res.statusText || 'Error'}`.trim(),
      };
    }

    const contentType = res.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      ok: true,
      status: res.status,
      latencyMs,
      data,
      error: null,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);
    const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
    return {
      ok: false,
      status: isTimeout ? 504 : null,
      latencyMs,
      data: null,
      error: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err?.message || 'Network fetch failed'),
    };
  }
}

/**
 * Individual provider probe runners using the centralized safeFetch utility
 */
async function checkOpenMeteo(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=20.2961&longitude=85.8245&current=temperature_2m';
  const result = await safeFetch(endpoint, {}, 3500);

  if (result.ok) {
    return {
      id: 'openMeteo',
      provider: 'OPEN_METEO',
      name: 'Open-Meteo Weather API',
      category: 'WEATHER_CORE',
      active: true,
      configured: true,
      connected: true,
      connectionStatus: 'CONNECTED',
      status: 'OPERATIONAL',
      latencyMs: result.latencyMs,
      endpoint,
      error: null,
      lastChecked: now,
    };
  }

  const isRateLimit = result.status === 429;
  return {
    id: 'openMeteo',
    provider: 'OPEN_METEO',
    name: 'Open-Meteo Weather API',
    category: 'WEATHER_CORE',
    active: true,
    configured: true,
    connected: false,
    connectionStatus: isRateLimit ? 'RATE_LIMITED' : 'DISCONNECTED',
    status: isRateLimit ? 'DEGRADED' : 'UNAVAILABLE',
    latencyMs: result.latencyMs,
    endpoint,
    error: result.error,
    lastChecked: now,
  };
}

async function checkIMD(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const isConfigured = !!(process.env.IMD_API_KEY && process.env.IMD_API_KEY.trim().length > 0);
  const baseUrl = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1';
  const endpoint = `${baseUrl}/health`;

  if (!isConfigured) {
    return {
      id: 'imd',
      provider: 'IMD',
      name: 'India Meteorological Department (Official)',
      category: 'GOVERNMENT_MET',
      active: false,
      configured: false,
      connected: false,
      connectionStatus: 'NOT_CONFIGURED',
      status: 'NOT_CONFIGURED',
      latencyMs: null,
      endpoint: baseUrl,
      error: 'IMD_API_KEY not configured. Running in open-data fallback mode.',
      lastChecked: now,
    };
  }

  const result = await safeFetch(endpoint, {
    headers: { 'X-Api-Key': process.env.IMD_API_KEY || '' },
  }, 3500);

  return {
    id: 'imd',
    provider: 'IMD',
    name: 'India Meteorological Department (Official)',
    category: 'GOVERNMENT_MET',
    active: result.ok,
    configured: true,
    connected: result.ok,
    connectionStatus: result.ok ? 'CONNECTED' : 'DISCONNECTED',
    status: result.ok ? 'OPERATIONAL' : 'UNAVAILABLE',
    latencyMs: result.latencyMs,
    endpoint,
    error: result.error,
    lastChecked: now,
  };
}

async function checkCPCB(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const isConfigured = !!(process.env.CPCB_API_KEY && process.env.CPCB_API_KEY.trim().length > 0);
  const cpcbUrl = process.env.CPCB_API_URL || 'https://app.cpcbccr.com/caaqms';

  if (!isConfigured) {
    // Probe the active fallback: Open-Meteo CAMS Air Quality API
    const fallbackEndpoint = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=20.2961&longitude=85.8245&current=pm10,pm2_5,european_aqi';
    const fallbackResult = await safeFetch(fallbackEndpoint, {}, 3500);

    return {
      id: 'cpcb',
      provider: 'CPCB',
      name: 'Central Pollution Control Board / CAAQMS',
      category: 'AIR_QUALITY',
      active: fallbackResult.ok,
      configured: false,
      connected: fallbackResult.ok,
      connectionStatus: fallbackResult.ok ? 'DEGRADED' : 'DISCONNECTED',
      status: fallbackResult.ok ? 'DEGRADED' : 'NOT_CONFIGURED',
      latencyMs: fallbackResult.latencyMs,
      endpoint: fallbackEndpoint,
      error: fallbackResult.ok ? 'CPCB_API_KEY not set; using CAMS European/NAQI standard fallback' : fallbackResult.error,
      lastChecked: now,
    };
  }

  const result = await safeFetch(`${cpcbUrl}/health`, {
    headers: { 'Authorization': `Bearer ${process.env.CPCB_API_KEY}` },
  }, 3500);

  return {
    id: 'cpcb',
    provider: 'CPCB',
    name: 'Central Pollution Control Board / CAAQMS',
    category: 'AIR_QUALITY',
    active: result.ok,
    configured: true,
    connected: result.ok,
    connectionStatus: result.ok ? 'CONNECTED' : 'DISCONNECTED',
    status: result.ok ? 'OPERATIONAL' : 'UNAVAILABLE',
    latencyMs: result.latencyMs,
    endpoint: cpcbUrl,
    error: result.error,
    lastChecked: now,
  };
}

async function checkSachet(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const endpoint = 'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails';
  const result = await safeFetch(endpoint, { method: 'GET' }, 4000);

  return {
    id: 'sachet',
    provider: 'SACHET',
    name: 'NDMA / SACHET Disaster Management (CAP 1.2)',
    category: 'DISASTER',
    active: result.ok,
    configured: true,
    connected: result.ok,
    connectionStatus: result.ok ? 'CONNECTED' : 'DISCONNECTED',
    status: result.ok ? 'OPERATIONAL' : 'DEGRADED',
    latencyMs: result.latencyMs,
    endpoint,
    error: result.error ? `SACHET CAP feed unavailable: ${result.error}` : null,
    lastChecked: now,
  };
}

async function checkIncois(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const isConfigured = !!(process.env.INCOIS_API_KEY && process.env.INCOIS_API_KEY.trim().length > 0);
  const endpoint = isConfigured
    ? (process.env.INCOIS_API_URL || 'https://incois.gov.in/portal/osf/api')
    : 'https://marine-api.open-meteo.com/v1/marine?latitude=19.8135&longitude=85.8312&current=wave_height,wave_direction';

  const result = await safeFetch(endpoint, {}, 3500);

  return {
    id: 'incois',
    provider: 'INCOIS',
    name: 'INCOIS Marine & Ocean State Forecasting',
    category: 'OCEAN_MARINE',
    active: result.ok,
    configured: isConfigured,
    connected: result.ok,
    connectionStatus: result.ok ? (isConfigured ? 'CONNECTED' : 'DEGRADED') : 'DISCONNECTED',
    status: result.ok ? (isConfigured ? 'OPERATIONAL' : 'DEGRADED') : (isConfigured ? 'UNAVAILABLE' : 'NOT_CONFIGURED'),
    latencyMs: result.latencyMs,
    endpoint,
    error: isConfigured ? result.error : (result.ok ? 'INCOIS credentials not set; using Open-Meteo Marine fallback' : result.error),
    lastChecked: now,
  };
}

async function checkRadar(): Promise<ProviderStatus> {
  const now = new Date().toISOString();
  const endpoint = 'https://api.rainviewer.com/public/weather-maps.json';
  const result = await safeFetch(endpoint, {}, 3500);

  return {
    id: 'radar',
    provider: 'RADAR',
    name: 'Doppler Weather Radar (RainViewer Open Weather Maps)',
    category: 'RADAR',
    active: result.ok,
    configured: true,
    connected: result.ok,
    connectionStatus: result.ok ? 'CONNECTED' : 'DISCONNECTED',
    status: result.ok ? 'OPERATIONAL' : 'UNAVAILABLE',
    latencyMs: result.latencyMs,
    endpoint,
    error: result.error,
    lastChecked: now,
  };
}

/**
 * Main Serverless Function Handler
 */
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  try {
    // Run all probes concurrently and safely with Promise.allSettled
    const probeResults = await Promise.allSettled([
      checkOpenMeteo(),
      checkIMD(),
      checkCPCB(),
      checkSachet(),
      checkIncois(),
      checkRadar(),
    ]);

    const providersList: ProviderStatus[] = [];
    const providersMap: Record<string, ProviderStatus> = {};

    const defaultFallbacks: Record<string, ProviderStatus> = {
      openMeteo: {
        id: 'openMeteo',
        provider: 'OPEN_METEO',
        name: 'Open-Meteo Weather API',
        category: 'WEATHER_CORE',
        active: false,
        configured: true,
        connected: false,
        connectionStatus: 'DISCONNECTED',
        status: 'UNAVAILABLE',
        latencyMs: null,
        endpoint: 'https://api.open-meteo.com',
        error: 'Probe failed unexpectedly',
        lastChecked: new Date().toISOString(),
      },
      imd: {
        id: 'imd',
        provider: 'IMD',
        name: 'India Meteorological Department (Official)',
        category: 'GOVERNMENT_MET',
        active: false,
        configured: false,
        connected: false,
        connectionStatus: 'NOT_CONFIGURED',
        status: 'NOT_CONFIGURED',
        latencyMs: null,
        endpoint: 'https://api.imd.gov.in',
        error: 'IMD_API_KEY not configured',
        lastChecked: new Date().toISOString(),
      },
      cpcb: {
        id: 'cpcb',
        provider: 'CPCB',
        name: 'Central Pollution Control Board / CAAQMS',
        category: 'AIR_QUALITY',
        active: false,
        configured: false,
        connected: false,
        connectionStatus: 'NOT_CONFIGURED',
        status: 'NOT_CONFIGURED',
        latencyMs: null,
        endpoint: 'https://app.cpcbccr.com',
        error: 'CPCB_API_KEY not configured',
        lastChecked: new Date().toISOString(),
      },
      sachet: {
        id: 'sachet',
        provider: 'SACHET',
        name: 'NDMA / SACHET Disaster Management (CAP 1.2)',
        category: 'DISASTER',
        active: false,
        configured: true,
        connected: false,
        connectionStatus: 'DISCONNECTED',
        status: 'UNAVAILABLE',
        latencyMs: null,
        endpoint: 'https://sachet.ndma.gov.in',
        error: 'Probe failed',
        lastChecked: new Date().toISOString(),
      },
      incois: {
        id: 'incois',
        provider: 'INCOIS',
        name: 'INCOIS Marine & Ocean State Forecasting',
        category: 'OCEAN_MARINE',
        active: false,
        configured: false,
        connected: false,
        connectionStatus: 'NOT_CONFIGURED',
        status: 'NOT_CONFIGURED',
        latencyMs: null,
        endpoint: 'https://incois.gov.in',
        error: 'INCOIS_API_KEY not configured',
        lastChecked: new Date().toISOString(),
      },
      radar: {
        id: 'radar',
        provider: 'RADAR',
        name: 'Doppler Weather Radar (RainViewer Open Weather Maps)',
        category: 'RADAR',
        active: false,
        configured: true,
        connected: false,
        connectionStatus: 'DISCONNECTED',
        status: 'UNAVAILABLE',
        latencyMs: null,
        endpoint: 'https://api.rainviewer.com',
        error: 'Probe failed',
        lastChecked: new Date().toISOString(),
      },
    };

    const keys = ['openMeteo', 'imd', 'cpcb', 'sachet', 'incois', 'radar'];

    probeResults.forEach((settled, idx) => {
      const key = keys[idx];
      if (settled.status === 'fulfilled' && settled.value) {
        providersList.push(settled.value);
        providersMap[key] = settled.value;
      } else {
        const fallback = defaultFallbacks[key];
        providersList.push(fallback);
        providersMap[key] = fallback;
      }
    });

    let operationalCount = 0;
    let degradedCount = 0;
    let notConfiguredCount = 0;
    let unavailableCount = 0;
    let totalLatency = 0;
    let latencyCount = 0;

    for (const p of providersList) {
      if (p.status === 'OPERATIONAL') operationalCount++;
      else if (p.status === 'DEGRADED') degradedCount++;
      else if (p.status === 'NOT_CONFIGURED') notConfiguredCount++;
      else if (p.status === 'UNAVAILABLE') unavailableCount++;

      if (p.latencyMs !== null && p.latencyMs > 0) {
        totalLatency += p.latencyMs;
        latencyCount++;
      }
    }

    const avgLatency = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null;

    const responsePayload = {
      timestamp: new Date().toISOString(),
      status: operationalCount >= 2 ? 'OPERATIONAL' : (operationalCount >= 1 ? 'DEGRADED' : 'UNAVAILABLE'),
      summary: {
        total: providersList.length,
        active: operationalCount + degradedCount,
        operational: operationalCount,
        degraded: degradedCount,
        notConfigured: notConfiguredCount,
        unavailable: unavailableCount,
        averageLatencyMs: avgLatency,
      },
      providers: providersMap,
      items: providersList,
    };

    return sendJson(res, 200, responsePayload);
  } catch (err: any) {
    // Ultimate defensive catch to guarantee no unhandled crash
    return sendJson(res, 200, {
      timestamp: new Date().toISOString(),
      status: 'DEGRADED',
      summary: {
        total: 6,
        active: 0,
        operational: 0,
        degraded: 0,
        notConfigured: 0,
        unavailable: 6,
        averageLatencyMs: null,
      },
      providers: {},
      items: [],
      error: err?.message || 'Unexpected diagnostic error',
    });
  }
}
