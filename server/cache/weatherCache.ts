// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Multi-Tier Server-Side Caching System
// ====================================================================

export type CacheCategory = 'CURRENT_WEATHER' | 'FORECAST' | 'WARNINGS' | 'AQI' | 'RADAR' | 'STATION_METADATA' | 'HISTORICAL' | 'LOCATION';

interface CacheEntry<T> {
  data: T;
  source: string;
  cachedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  category: CacheCategory;
}

export const CACHE_TTLS_MS: Record<CacheCategory, number> = {
  CURRENT_WEATHER: 5 * 60 * 1000,    // 5 minutes
  FORECAST: 30 * 60 * 1000,          // 30 minutes
  WARNINGS: 5 * 60 * 1000,           // 5 minutes
  AQI: 15 * 60 * 1000,               // 15 minutes
  RADAR: 5 * 60 * 1000,              // 5 minutes
  STATION_METADATA: 24 * 60 * 60 * 1000, // 24 hours
  HISTORICAL: 24 * 60 * 60 * 1000,   // 24 hours
  LOCATION: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class WeatherCacheManager {
  private static instance: WeatherCacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number = 2000;

  private hits = 0;
  private misses = 0;

  private constructor() {
    // Background garbage collection every 2 minutes
    setInterval(() => this.pruneExpired(), 2 * 60 * 1000);
  }

  public static getInstance(): WeatherCacheManager {
    if (!WeatherCacheManager.instance) {
      WeatherCacheManager.instance = new WeatherCacheManager();
    }
    return WeatherCacheManager.instance;
  }

  public generateKey(category: CacheCategory, params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}:${params[k]}`)
      .join('|');
    return `${category}::${sorted}`;
  }

  public get<T>(key: string): { data: T | null; isHit: boolean; isStale: boolean; ageSeconds: number } {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return { data: null, isHit: false, isStale: false, ageSeconds: 0 };
    }

    const now = Date.now();
    const ageSeconds = Math.round((now - entry.cachedAt) / 1000);
    const isStale = now > entry.expiresAt;

    this.hits++;
    return {
      data: entry.data as T,
      isHit: true,
      isStale,
      ageSeconds,
    };
  }

  public set<T>(key: string, data: T, category: CacheCategory, source: string, customTtlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      this.pruneOldest();
    }

    const now = Date.now();
    const ttl = customTtlMs ?? CACHE_TTLS_MS[category] ?? 5 * 60 * 1000;

    this.cache.set(key, {
      data,
      source,
      cachedAt: now,
      expiresAt: now + ttl,
      category,
    });
  }

  public invalidate(keyOrPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  public getStats() {
    return {
      totalEntries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : '0.000',
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      // Keep slightly expired data for serving stale-while-revalidate if needed, prune after 2x TTL
      const doubleTtl = (entry.expiresAt - entry.cachedAt) * 2;
      if (now > entry.cachedAt + doubleTtl) {
        this.cache.delete(key);
      }
    }
  }

  private pruneOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.cachedAt < oldestTime) {
        oldestTime = entry.cachedAt;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

export const weatherCache = WeatherCacheManager.getInstance();
