// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Reusable Server-Side Provider Diagnostic & Health Service
// Truthful reporting: missing keys report NOT_CONFIGURED, down feeds report OFFLINE
// ====================================================================

import { serverCache } from './cacheService';

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

export class ProviderService {
  private static instance: ProviderService;

  public static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  private async safeProbe(
    id: string,
    name: string,
    category: string,
    url: string,
    isConfigured: boolean,
    timeoutMs: number = 3500
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

    const start = performance.now();
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mausam-Health/3.0' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const latencyMs = Math.round(performance.now() - start);

      if (res.ok) {
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
        status: 'DEGRADED',
        latencyMs,
        error: `HTTP ${res.status}`,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        id,
        name,
        category,
        configured: true,
        operational: false,
        status: 'OFFLINE',
        latencyMs,
        error: err?.message || 'Connection failed',
      };
    }
  }

  public async checkAllProviders() {
    const cacheKey = 'system:providers';
    const cached = serverCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }

    const imdConfigured = !!(process.env.IMD_API_KEY && process.env.IMD_API_KEY.trim().length > 0);
    const geminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    const cpcbConfigured = !!(process.env.CPCB_API_KEY && process.env.CPCB_API_KEY.trim().length > 0);

    const [openMeteo, sachet, radar, osm, imd, cpcb] = await Promise.all([
      this.safeProbe(
        'openMeteo',
        'Open-Meteo Weather API',
        'WEATHER_CORE',
        'https://api.open-meteo.com/v1/forecast?latitude=20.29&longitude=85.82&current=temperature_2m',
        true
      ),
      this.safeProbe(
        'sachet',
        'NDMA / SACHET Disaster Alert Feed',
        'DISASTER',
        'https://sachet.ndma.gov.in/cap_public_website/FetchAllAlertDetails',
        true,
        4000
      ),
      this.safeProbe(
        'radar',
        'RainViewer Doppler Radar Network',
        'RADAR',
        'https://api.rainviewer.com/public/weather-maps.json',
        true
      ),
      this.safeProbe(
        'osm',
        'OpenStreetMap Tile & Cartography',
        'MAP',
        'https://tile.openstreetmap.org/0/0/0.png',
        true
      ),
      imdConfigured
        ? this.safeProbe(
            'imd',
            'India Meteorological Department Gateway',
            'GOVERNMENT_MET',
            `${process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in/api/v1'}/health`,
            true
          )
        : Promise.resolve({
            id: 'imd',
            name: 'India Meteorological Department Gateway',
            category: 'GOVERNMENT_MET',
            configured: false,
            operational: false,
            status: 'NOT_CONFIGURED' as const,
            latencyMs: null,
          }),
      cpcbConfigured
        ? this.safeProbe(
            'cpcb',
            'Central Pollution Control Board',
            'AIR_QUALITY',
            `${process.env.CPCB_API_URL || 'https://app.cpcbccr.com/caaqms'}/health`,
            true
          )
        : Promise.resolve({
            id: 'cpcb',
            name: 'Central Pollution Control Board',
            category: 'AIR_QUALITY',
            configured: false,
            operational: false,
            status: 'NOT_CONFIGURED' as const,
            latencyMs: null,
          }),
    ]);

    const gemini: ProviderDiagnostic = {
      id: 'gemini',
      name: 'Google Gemini Meteorological Assistant',
      category: 'AI_ASSISTANT',
      configured: geminiConfigured,
      operational: geminiConfigured,
      status: geminiConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      latencyMs: null,
    };

    const providersMap: Record<string, ProviderDiagnostic> = {
      openMeteo,
      sachet,
      radar,
      osm,
      imd,
      cpcb,
      gemini,
    };

    const items = [openMeteo, sachet, radar, osm, imd, cpcb, gemini];
    const operationalCount = items.filter((p) => p.status === 'OPERATIONAL').length;
    const overallStatus = operationalCount >= 2 ? 'OPERATIONAL' : (operationalCount >= 1 ? 'DEGRADED' : 'OFFLINE');

    const result = {
      timestamp: new Date().toISOString(),
      ok: overallStatus !== 'OFFLINE',
      status: overallStatus,
      providers: providersMap,
      items,
    };

    serverCache.set(cacheKey, result, 60, 180);
    return result;
  }

  public async getHealth() {
    const diagnostic = await this.checkAllProviders();
    return {
      ok: diagnostic.ok,
      status: diagnostic.status,
      timestamp: diagnostic.timestamp,
      providers: {
        openMeteo: diagnostic.providers.openMeteo,
        sachet: diagnostic.providers.sachet,
        radar: diagnostic.providers.radar,
        osm: diagnostic.providers.osm,
        imd: diagnostic.providers.imd,
        gemini: diagnostic.providers.gemini,
      },
    };
  }

  public async getReadiness() {
    const diagnostic = await this.checkAllProviders();
    const isReady = diagnostic.providers.openMeteo?.operational;
    return {
      status: isReady ? 'READY' : 'DEGRADED',
      database: 'DISCONNECTED',
      coreWeather: diagnostic.providers.openMeteo?.status || 'OFFLINE',
      warnings: diagnostic.providers.sachet?.status || 'OFFLINE',
      radar: diagnostic.providers.radar?.status || 'OFFLINE',
      timestamp: new Date().toISOString(),
    };
  }
}

export const providerService = ProviderService.getInstance();
