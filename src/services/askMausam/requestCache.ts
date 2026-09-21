// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Tiered Request & Telemetry Cache
// Enforces granular TTLs for Weather, Warnings, AQI, and Geocoding
// ====================================================================

export const CACHE_TTLS = {
  CURRENT_WEATHER: 3 * 60 * 1000,    // 3 minutes
  FORECAST: 7 * 60 * 1000,           // 7 minutes
  AQI: 5 * 60 * 1000,                // 5 minutes
  OFFICIAL_WARNINGS: 90 * 1000,      // 90 seconds
  LOCATION_RESOLUTION: 12 * 60 * 60 * 1000, // 12 hours
  RADAR_METADATA: 2 * 60 * 1000,     // 2 minutes
  ANSWER_RESULT: 90 * 1000,          // 90 seconds
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCacheStore {
  private cache = new Map<string, CacheEntry<any>>();

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttl: number): void {
    // Limit memory footprint: purge oldest if size > 300
    if (this.cache.size > 300) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public clear(): void {
    this.cache.clear();
  }

  // Key builders
  public static buildWeatherKey(lat: number, lng: number, includeForecast = false): string {
    return `weather:${lat.toFixed(2)}:${lng.toFixed(2)}:${includeForecast ? 'f' : 'c'}`;
  }

  public static buildWarningKey(state?: string, district?: string): string {
    return `warnings:${(state || 'ALL').toUpperCase()}:${(district || 'ALL').toUpperCase()}`;
  }

  public static buildAqiKey(lat: number, lng: number, city?: string): string {
    return `aqi:${lat.toFixed(2)}:${lng.toFixed(2)}:${(city || '').toLowerCase()}`;
  }

  public static buildAnswerKey(query: string, locationKey: string, intent: string): string {
    return `ans:${intent}:${locationKey}:${query.trim().toLowerCase()}`;
  }
}

export const requestCache = new RequestCacheStore();
