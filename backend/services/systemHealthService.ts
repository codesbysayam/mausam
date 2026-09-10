// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Central System Health & Telemetry Monitor
// ====================================================================

import { dbService, DatabaseStatus } from '../database/db';
import { cacheService, CacheStats } from '../cache/cacheService';
import { OpenMeteoProvider } from '../providers/openMeteo';
import { IMDProvider } from '../providers/imd';
import { CPCBProvider } from '../providers/cpcb';
import { SachetProvider } from '../providers/sachet';
import { INCOISProvider } from '../providers/incois';
import { RadarProvider } from '../providers/radar';
import { AccuWeatherProvider } from '../providers/accuweather';
import { GoogleWeatherProvider } from '../providers/googleWeather';

export interface ProviderHealthDetail {
  code: string;
  name: string;
  category: 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';
  status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  isConfigured: boolean;
  requiredKey: string | null;
  lastSuccess: string | null;
  lastFailure: string | null;
  lastLatencyMs: number | null;
  error?: string | null;
  attributionText: string;
  attributionUrl?: string;
}

export interface SystemHealthData {
  timestamp: string;
  database: DatabaseStatus;
  cache: CacheStats;
  summary: {
    totalSources: number;
    operational: number;
    degraded: number;
    notConfigured: number;
    unavailable: number;
    overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  };
  providers: {
    openMeteo: ProviderHealthDetail;
    imd: ProviderHealthDetail;
    cpcb: ProviderHealthDetail;
    sachet: ProviderHealthDetail;
    incois: ProviderHealthDetail;
    radar: ProviderHealthDetail;
    accuweather: ProviderHealthDetail;
    googleWeather: ProviderHealthDetail;
  };
  metrics: {
    totalRequests: number;
    failedRequests: number;
    lastSyncTime: string;
  };
}

export class SystemHealthService {
  private static instance: SystemHealthService;
  private totalRequests = 0;
  private failedRequests = 0;
  private lastHealthData: SystemHealthData | null = null;
  private lastCheckEpoch = 0;
  private CACHE_TTL_MS = 20 * 1000; // 20 seconds

  public static getInstance(): SystemHealthService {
    if (!SystemHealthService.instance) {
      SystemHealthService.instance = new SystemHealthService();
    }
    return SystemHealthService.instance;
  }

  public recordRequest(success: boolean): void {
    this.totalRequests++;
    if (!success) {
      this.failedRequests++;
    }
  }

  public async getHealth(): Promise<SystemHealthData> {
    const now = Date.now();
    if (this.lastHealthData && now - this.lastCheckEpoch < this.CACHE_TTL_MS) {
      return {
        ...this.lastHealthData,
        cache: cacheService.getStats(),
        metrics: {
          totalRequests: this.totalRequests,
          failedRequests: this.failedRequests,
          lastSyncTime: new Date(this.lastCheckEpoch).toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' IST',
        },
      };
    }

    const [dbStatus, omHealth, imdHealth, cpcbHealth, sachetHealth, incoisHealth, radarHealth, accuHealth, googleHealth] =
      await Promise.all([
        dbService.getStatus(),
        OpenMeteoProvider.checkHealth(),
        IMDProvider.checkHealth(),
        CPCBProvider.checkHealth(),
        SachetProvider.checkHealth(),
        INCOISProvider.checkHealth(),
        RadarProvider.checkHealth(),
        AccuWeatherProvider.checkHealth(),
        GoogleWeatherProvider.checkHealth(),
      ]);

    const providers: SystemHealthData['providers'] = {
      openMeteo: {
        code: 'OPEN_METEO',
        name: 'Open-Meteo Weather API',
        category: 'OPEN_DATA',
        status: omHealth.operational ? 'OPERATIONAL' : 'UNAVAILABLE',
        isConfigured: true,
        requiredKey: null,
        lastSuccess: omHealth.operational ? new Date().toISOString() : null,
        lastFailure: omHealth.operational ? null : new Date().toISOString(),
        lastLatencyMs: omHealth.latencyMs,
        error: omHealth.error || null,
        attributionText: 'Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)',
        attributionUrl: 'https://open-meteo.com',
      },
      imd: {
        code: 'IMD',
        name: 'India Meteorological Department (IMD)',
        category: 'GOVERNMENT',
        status: !imdHealth.configured
          ? 'NOT_CONFIGURED'
          : imdHealth.operational
          ? 'OPERATIONAL'
          : 'UNAVAILABLE',
        isConfigured: imdHealth.configured,
        requiredKey: 'IMD_API_KEY',
        lastSuccess: imdHealth.operational ? new Date().toISOString() : null,
        lastFailure: imdHealth.configured && !imdHealth.operational ? new Date().toISOString() : null,
        lastLatencyMs: imdHealth.latencyMs,
        error: imdHealth.error || null,
        attributionText: 'Official data source: India Meteorological Department, Ministry of Earth Sciences (MoES)',
        attributionUrl: 'https://mausam.imd.gov.in',
      },
      cpcb: {
        code: 'CPCB',
        name: 'Central Pollution Control Board (CPCB)',
        category: 'GOVERNMENT',
        status: !cpcbHealth.configured
          ? 'NOT_CONFIGURED'
          : cpcbHealth.operational
          ? 'OPERATIONAL'
          : 'UNAVAILABLE',
        isConfigured: cpcbHealth.configured,
        requiredKey: 'CPCB_API_KEY',
        lastSuccess: cpcbHealth.operational ? new Date().toISOString() : null,
        lastFailure: cpcbHealth.configured && !cpcbHealth.operational ? new Date().toISOString() : null,
        lastLatencyMs: cpcbHealth.latencyMs,
        error: cpcbHealth.error || null,
        attributionText: 'Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) & CAAQMS',
        attributionUrl: 'https://cpcb.nic.in',
      },
      sachet: {
        code: 'SACHET',
        name: 'NDMA / SACHET Disaster Management',
        category: 'GOVERNMENT',
        status: sachetHealth.operational ? 'OPERATIONAL' : 'DEGRADED',
        isConfigured: true,
        requiredKey: null,
        lastSuccess: sachetHealth.operational ? new Date().toISOString() : null,
        lastFailure: sachetHealth.operational ? null : new Date().toISOString(),
        lastLatencyMs: sachetHealth.latencyMs,
        error: sachetHealth.error || null,
        attributionText: 'National Disaster Management Authority (NDMA) & SACHET Common Alerting Protocol (CAP)',
        attributionUrl: 'https://sachet.ndma.gov.in',
      },
      incois: {
        code: 'INCOIS',
        name: 'INCOIS Coastal Oceanography',
        category: 'GOVERNMENT',
        status: incoisHealth.operational ? 'OPERATIONAL' : 'DEGRADED',
        isConfigured: true,
        requiredKey: null,
        lastSuccess: incoisHealth.operational ? new Date().toISOString() : null,
        lastFailure: incoisHealth.operational ? null : new Date().toISOString(),
        lastLatencyMs: incoisHealth.latencyMs,
        error: incoisHealth.error || null,
        attributionText: 'Indian National Centre for Ocean Information Services (INCOIS), MoES & Open Marine',
        attributionUrl: 'https://incois.gov.in',
      },
      radar: {
        code: 'RADAR',
        name: 'Doppler Radar & Weather Maps',
        category: 'OPEN_DATA',
        status: radarHealth.operational ? 'OPERATIONAL' : 'DEGRADED',
        isConfigured: true,
        requiredKey: null,
        lastSuccess: radarHealth.operational ? new Date().toISOString() : null,
        lastFailure: radarHealth.operational ? null : new Date().toISOString(),
        lastLatencyMs: radarHealth.latencyMs,
        error: radarHealth.error || null,
        attributionText: 'RainViewer Open Weather Maps API & IMD DWR Network',
        attributionUrl: 'https://www.rainviewer.com/api.html',
      },
      accuweather: {
        code: 'ACCUWEATHER',
        name: 'AccuWeather Commercial API',
        category: 'COMMERCIAL',
        status: !accuHealth.configured
          ? 'NOT_CONFIGURED'
          : accuHealth.operational
          ? 'OPERATIONAL'
          : 'UNAVAILABLE',
        isConfigured: accuHealth.configured,
        requiredKey: 'ACCUWEATHER_API_KEY',
        lastSuccess: accuHealth.operational ? new Date().toISOString() : null,
        lastFailure: accuHealth.configured && !accuHealth.operational ? new Date().toISOString() : null,
        lastLatencyMs: accuHealth.latencyMs,
        error: accuHealth.error || null,
        attributionText: 'AccuWeather Commercial Weather Service',
        attributionUrl: 'https://developer.accuweather.com',
      },
      googleWeather: {
        code: 'GOOGLE_WEATHER',
        name: 'Google Weather Commercial API',
        category: 'COMMERCIAL',
        status: !googleHealth.configured
          ? 'NOT_CONFIGURED'
          : googleHealth.operational
          ? 'OPERATIONAL'
          : 'UNAVAILABLE',
        isConfigured: googleHealth.configured,
        requiredKey: 'GOOGLE_WEATHER_API_KEY',
        lastSuccess: googleHealth.operational ? new Date().toISOString() : null,
        lastFailure: googleHealth.configured && !googleHealth.operational ? new Date().toISOString() : null,
        lastLatencyMs: googleHealth.latencyMs,
        error: googleHealth.error || null,
        attributionText: 'Google Maps Platform / Weather Commercial API',
        attributionUrl: 'https://developers.google.com',
      },
    };

    let operational = 0;
    let degraded = 0;
    let notConfigured = 0;
    let unavailable = 0;

    for (const p of Object.values(providers)) {
      if (p.status === 'OPERATIONAL') operational++;
      else if (p.status === 'DEGRADED') degraded++;
      else if (p.status === 'NOT_CONFIGURED') notConfigured++;
      else if (p.status === 'UNAVAILABLE') unavailable++;
    }

    const overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' =
      operational >= 3 ? 'HEALTHY' : operational >= 1 ? 'DEGRADED' : 'CRITICAL';

    const cacheStats = cacheService.getStats();

    this.lastCheckEpoch = now;
    this.lastHealthData = {
      timestamp: new Date().toISOString(),
      database: dbStatus,
      cache: cacheStats,
      summary: {
        totalSources: Object.keys(providers).length,
        operational,
        degraded,
        notConfigured,
        unavailable,
        overallStatus,
      },
      providers,
      metrics: {
        totalRequests: this.totalRequests,
        failedRequests: this.failedRequests,
        lastSyncTime: new Date(now).toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST',
      },
    };

    return this.lastHealthData;
  }
}

export const systemHealthService = SystemHealthService.getInstance();
