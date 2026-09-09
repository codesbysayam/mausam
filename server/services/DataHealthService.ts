// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Data Health & Source Transparency Service
// ====================================================================

export type HealthStatus = 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface SourceHealthRecord {
  code: string;
  name: string;
  category: 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';
  status: HealthStatus;
  isConfigured: boolean;
  requiredKey: string | null;
  lastSuccess: string | null;
  lastFailure: string | null;
  lastLatencyMs: number | null;
  lastHttpStatus: number | null;
  recordsFetched: number;
  recordsRejected: number;
  consecutiveFailures: number;
  lastErrorMessage: string | null;
  attributionText: string;
}

export class DataHealthService {
  private static instance: DataHealthService;
  private sources: Map<string, SourceHealthRecord> = new Map();

  private constructor() {
    this.initializeSources();
  }

  public static getInstance(): DataHealthService {
    if (!DataHealthService.instance) {
      DataHealthService.instance = new DataHealthService();
    }
    return DataHealthService.instance;
  }

  private initializeSources(): void {
    const imdKey = process.env.IMD_API_KEY || process.env.IMD_API_TOKEN;
    const accuKey = process.env.ACCUWEATHER_API_KEY;
    const googleKey = process.env.GOOGLE_WEATHER_API_KEY;
    const cpcbKey = process.env.CPCB_API_KEY;
    const incoisKey = process.env.INCOIS_API_KEY;

    this.registerSource({
      code: 'IMD',
      name: 'India Meteorological Department',
      category: 'GOVERNMENT',
      requiredKey: 'IMD_API_KEY',
      isConfigured: !!imdKey,
      status: imdKey ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      attributionText: 'Official data courtesy of India Meteorological Department (IMD), Ministry of Earth Sciences.',
    });

    this.registerSource({
      code: 'OPEN_METEO',
      name: 'Open-Meteo Weather API',
      category: 'OPEN_DATA',
      requiredKey: null,
      isConfigured: true,
      status: 'OPERATIONAL', // Verified free baseline
      attributionText: 'Weather data by Open-Meteo.com under Attribution 4.0 International (CC BY 4.0).',
    });

    this.registerSource({
      code: 'NDMA_SACHET',
      name: 'NDMA / SACHET Disaster Alert Feed',
      category: 'GOVERNMENT',
      requiredKey: null,
      isConfigured: true,
      status: 'OPERATIONAL',
      attributionText: 'CAP alert feeds courtesy of National Disaster Management Authority (NDMA) & State SDMAs.',
    });

    this.registerSource({
      code: 'CPCB',
      name: 'Central Pollution Control Board',
      category: 'GOVERNMENT',
      requiredKey: 'CPCB_API_KEY',
      isConfigured: !!cpcbKey,
      status: cpcbKey ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      attributionText: 'CPCB National Air Quality Index (NAQI) Real-Time Telemetry.',
    });

    this.registerSource({
      code: 'INCOIS',
      name: 'Indian National Centre for Ocean Information Services',
      category: 'GOVERNMENT',
      requiredKey: 'INCOIS_API_KEY',
      isConfigured: !!incoisKey,
      status: incoisKey ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      attributionText: 'Ocean state forecast and high wave alerts courtesy of INCOIS, MoES.',
    });

    this.registerSource({
      code: 'ACCUWEATHER',
      name: 'AccuWeather Core Weather API',
      category: 'COMMERCIAL',
      requiredKey: 'ACCUWEATHER_API_KEY',
      isConfigured: !!accuKey,
      status: accuKey ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      attributionText: 'Weather data provided by AccuWeather, Inc. Subject to trial/subscription terms.',
    });

    this.registerSource({
      code: 'GOOGLE_WEATHER',
      name: 'Google Weather API',
      category: 'COMMERCIAL',
      requiredKey: 'GOOGLE_WEATHER_API_KEY',
      isConfigured: !!googleKey,
      status: googleKey ? 'OPERATIONAL' : 'NOT_CONFIGURED',
      attributionText: 'Weather data provided by Google Maps Platform Weather SKU.',
    });
  }

  private registerSource(def: Partial<SourceHealthRecord> & { code: string; name: string; category: any; attributionText: string }): void {
    this.sources.set(def.code, {
      code: def.code,
      name: def.name,
      category: def.category,
      status: def.status || (def.isConfigured ? 'OPERATIONAL' : 'NOT_CONFIGURED'),
      isConfigured: !!def.isConfigured,
      requiredKey: def.requiredKey || null,
      lastSuccess: null,
      lastFailure: null,
      lastLatencyMs: null,
      lastHttpStatus: null,
      recordsFetched: 0,
      recordsRejected: 0,
      consecutiveFailures: 0,
      lastErrorMessage: null,
      attributionText: def.attributionText,
    });
  }

  public recordSuccess(sourceCode: string, latencyMs: number, recordsCount: number = 1, httpStatus: number = 200): void {
    const s = this.sources.get(sourceCode);
    if (!s) return;

    s.isConfigured = true;
    s.status = 'OPERATIONAL';
    s.lastSuccess = new Date().toISOString();
    s.lastLatencyMs = latencyMs;
    s.lastHttpStatus = httpStatus;
    s.recordsFetched += recordsCount;
    s.consecutiveFailures = 0;
    s.lastErrorMessage = null;
  }

  public recordFailure(sourceCode: string, errorMessage: string, httpStatus: number = 500): void {
    const s = this.sources.get(sourceCode);
    if (!s) return;

    s.lastFailure = new Date().toISOString();
    s.lastHttpStatus = httpStatus;
    s.consecutiveFailures += 1;
    s.lastErrorMessage = errorMessage;

    // If never configured, remain NOT_CONFIGURED
    if (s.requiredKey && !s.isConfigured) {
      s.status = 'NOT_CONFIGURED';
    } else if (s.consecutiveFailures >= 3) {
      s.status = 'UNAVAILABLE';
    } else {
      s.status = 'DEGRADED';
    }
  }

  public recordRejection(sourceCode: string, count: number = 1): void {
    const s = this.sources.get(sourceCode);
    if (!s) return;
    s.recordsRejected += count;
  }

  public getSource(code: string): SourceHealthRecord | undefined {
    return this.sources.get(code);
  }

  public getAllSources(): SourceHealthRecord[] {
    return Array.from(this.sources.values());
  }

  public getSystemSummary() {
    const all = this.getAllSources();
    const operational = all.filter((s) => s.status === 'OPERATIONAL').length;
    const degraded = all.filter((s) => s.status === 'DEGRADED').length;
    const notConfigured = all.filter((s) => s.status === 'NOT_CONFIGURED').length;
    const unavailable = all.filter((s) => s.status === 'UNAVAILABLE').length;

    return {
      timestamp: new Date().toISOString(),
      totalSources: all.length,
      operational,
      degraded,
      notConfigured,
      unavailable,
      overallStatus: operational > 0 ? (degraded === 0 && unavailable === 0 ? 'HEALTHY' : 'DEGRADED') : 'CRITICAL',
    };
  }
}

export const dataHealthService = DataHealthService.getInstance();
