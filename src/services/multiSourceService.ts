// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Source Data Client Service
// ====================================================================

export interface SourceHealthItem {
  code: string;
  name: string;
  category: 'GOVERNMENT' | 'COMMERCIAL' | 'OPEN_DATA';
  status: 'OPERATIONAL' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  isConfigured: boolean;
  requiredKey: string | null;
  lastSuccess: string | null;
  lastFailure: string | null;
  lastLatencyMs: number | null;
  lastHttpStatus: number | null;
  recordsFetched: number;
  recordsRejected: number;
  attributionText: string;
}

export interface SystemHealthResponse {
  status: string;
  summary: {
    timestamp: string;
    totalSources: number;
    operational: number;
    degraded: number;
    notConfigured: number;
    unavailable: number;
    overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  };
  sources: SourceHealthItem[];
  database: {
    connected: boolean;
    provider: 'POSTGRESQL' | 'IN_MEMORY_STRUCTURED';
    poolSize?: number;
    lastChecked: string;
  };
  cache: {
    totalEntries: number;
    hits: number;
    misses: number;
    hitRatio: string;
  };
}

export interface CurrentWeatherResponse {
  status: 'success' | 'error';
  source: string;
  dataStatus: 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
  observedAt: string;
  fetchedAt: string;
  ageSeconds: number;
  primarySource: string;
  fallbackSource?: string;
  attribution?: string;
  data: {
    location: {
      id: string;
      name: string;
      city?: string;
      district?: string;
      state?: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    observedAt: string;
    temperature: number | null;
    feelsLike: number | null;
    humidity: number | null;
    dewPoint: number | null;
    pressure: number | null;
    windSpeed: number | null;
    windDirection: string | null;
    windDirectionDegrees: number | null;
    windGust: number | null;
    visibility: number | null;
    cloudCover: number | null;
    precipitation: number | null;
    rainfall24h?: number | null;
    uvIndex: number | null;
    weatherCode: number | null;
    condition: string;
    isDay: boolean;
    source: string;
    isFallback: boolean;
    rawSourceAttribution: string;
  };
}

export class MultiSourceService {
  public static async fetchSystemHealth(): Promise<SystemHealthResponse | null> {
    try {
      const res = await fetch('/api/v2/health/sources');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchCurrentWeather(params: {
    lat?: number;
    lon?: number;
    city?: string;
    district?: string;
    state?: string;
    refresh?: boolean;
  }): Promise<CurrentWeatherResponse | null> {
    try {
      const q = new URLSearchParams();
      if (params.lat !== undefined) q.set('lat', String(params.lat));
      if (params.lon !== undefined) q.set('lon', String(params.lon));
      if (params.city) q.set('city', params.city);
      if (params.district) q.set('district', params.district);
      if (params.state) q.set('state', params.state);
      if (params.refresh) q.set('refresh', 'true');

      const res = await fetch(`/api/v2/weather/current?${q.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchComparison(lat: number, lon: number): Promise<any> {
    try {
      const res = await fetch(`/api/v2/weather/compare?lat=${lat}&lon=${lon}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
