// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Persistent Cache Service (Upstash Redis / Vercel KV REST API & Degraded Memory Fallback)
// ====================================================================

export type CacheCategory =
  | 'CURRENT_WEATHER'
  | 'FORECAST'
  | 'HOURLY'
  | 'DAILY'
  | 'WARNINGS'
  | 'AQI'
  | 'MARINE'
  | 'RADAR'
  | 'STATION_METADATA'
  | 'SYSTEM_HEALTH';

export interface CacheStats {
  configured: boolean;
  connected: boolean;
  provider: 'UPSTASH_REDIS' | 'VERCEL_KV' | 'DEVELOPMENT_FALLBACK' | 'IN_MEMORY_DEGRADED';
  status: 'OPERATIONAL' | 'DEVELOPMENT_FALLBACK';
  totalEntries: number;
  hits: number;
  misses: number;
  hitRatio: string; // formatted percentage string e.g. "72.4%"
  hitRatioNumeric: number; // 0.0 to 1.0
  lastPurge: string;
  totalRequests: number;
}

interface InMemoryEntry<T> {
  data: T;
  source: string;
  cachedAt: number;
  expiresAt: number;
  category: CacheCategory;
}

export const CACHE_TTLS_MS: Record<CacheCategory, number> = {
  CURRENT_WEATHER: 5 * 60 * 1000,        // 5 minutes
  FORECAST: 30 * 60 * 1000,              // 30 minutes
  HOURLY: 15 * 60 * 1000,                // 15 minutes
  DAILY: 60 * 60 * 1000,                 // 60 minutes
  WARNINGS: 3 * 60 * 1000,               // 3 minutes (SACHET short TTL + ETag)
  AQI: 10 * 60 * 1000,                   // 10 minutes
  MARINE: 45 * 60 * 1000,                // 45 minutes
  RADAR: 3 * 60 * 1000,                  // 3 minutes
  STATION_METADATA: 12 * 60 * 60 * 1000, // 12 hours
  SYSTEM_HEALTH: 20 * 1000,              // 20 seconds
};

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, InMemoryEntry<any>> = new Map();
  private maxMemoryEntries = 2000;

  private hits = 0;
  private misses = 0;
  private lastPurgeTime: string = new Date().toISOString();

  private redisUrl: string | null = null;
  private redisToken: string | null = null;
  private isRedisConfigured = false;
  private isRedisConnected = false;
  private redisProviderName: 'UPSTASH_REDIS' | 'VERCEL_KV' = 'UPSTASH_REDIS';

  private constructor() {
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || null;
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || null;
    this.isRedisConfigured = !!(this.redisUrl && this.redisToken);
    if (process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
      this.redisProviderName = 'VERCEL_KV';
    }

    if (this.isRedisConfigured) {
      this.testRedisConnection();
    } else {
      console.log('[Mausam Cache] Upstash Redis / Vercel KV not configured. Using in-memory cache as degraded local fallback.');
    }

    // Run garbage collection every 2 minutes
    setInterval(() => this.pruneExpired(), 2 * 60 * 1000);
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async testRedisConnection(): Promise<void> {
    if (!this.redisUrl || !this.redisToken) return;
    try {
      const res = await fetch(`${this.redisUrl}/ping`, {
        headers: { Authorization: `Bearer ${this.redisToken}` },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        this.isRedisConnected = true;
        console.log(`[Mausam Cache] Connected to ${this.redisProviderName} successfully.`);
      } else {
        this.isRedisConnected = false;
      }
    } catch {
      this.isRedisConnected = false;
    }
  }

  public generateKey(category: CacheCategory, params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}:${params[k]}`)
      .join('|');
    return `MAUSAM::${category}::${sorted}`;
  }

  public async get<T>(key: string): Promise<{ data: T | null; isHit: boolean; isStale: boolean; ageSeconds: number }> {
    return this.getCached<T>(key);
  }

  public async getCached<T>(key: string): Promise<{ data: T | null; isHit: boolean; isStale: boolean; ageSeconds: number }> {
    // 1. Try Upstash Redis / Vercel KV if active
    if (this.isRedisConnected && this.redisUrl && this.redisToken) {
      try {
        const res = await fetch(`${this.redisUrl}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.redisToken}` },
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.result) {
            const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
            this.hits++;
            const ageSeconds = Math.max(0, Math.round((Date.now() - parsed.cachedAt) / 1000));
            return {
              data: parsed.data as T,
              isHit: true,
              isStale: Date.now() > parsed.expiresAt,
              ageSeconds,
            };
          }
        }
      } catch {
        // Fall back to memory cache
      }
    }

    // 2. In-Memory lookup
    const entry = this.memoryCache.get(key);
    if (!entry) {
      this.misses++;
      return { data: null, isHit: false, isStale: false, ageSeconds: 0 };
    }

    const now = Date.now();
    const isStale = now > entry.expiresAt;
    const ageSeconds = Math.max(0, Math.round((now - entry.cachedAt) / 1000));

    this.hits++;
    return {
      data: entry.data as T,
      isHit: true,
      isStale,
      ageSeconds,
    };
  }

  public async set<T>(key: string, data: T, category: CacheCategory, source: string, customTtlMs?: number): Promise<void> {
    return this.setCached<T>(key, data, category, source, customTtlMs);
  }

  public async setCached<T>(key: string, data: T, category: CacheCategory, source: string, customTtlMs?: number): Promise<void> {
    const now = Date.now();
    const ttlMs = customTtlMs ?? CACHE_TTLS_MS[category] ?? 5 * 60 * 1000;
    const expiresAt = now + ttlMs;

    const payload = {
      data,
      source,
      cachedAt: now,
      expiresAt,
      category,
    };

    // 1. Set in memory
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      this.pruneOldest();
    }
    this.memoryCache.set(key, payload);

    // 2. Set in Upstash Redis / Vercel KV if available
    if (this.isRedisConnected && this.redisUrl && this.redisToken) {
      try {
        const ttlSeconds = Math.ceil(ttlMs / 1000);
        await fetch(`${this.redisUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(payload))}?ex=${ttlSeconds}`, {
          headers: { Authorization: `Bearer ${this.redisToken}` },
          signal: AbortSignal.timeout(2000),
        });
      } catch {
        // Degraded mode handles it in memory
      }
    }
  }

  public async deleteCached(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.isRedisConnected && this.redisUrl && this.redisToken) {
      try {
        await fetch(`${this.redisUrl}/del/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${this.redisToken}` },
          signal: AbortSignal.timeout(2000),
        });
      } catch {
        // Degraded mode
      }
    }
  }

  public invalidate(keyPrefix: string): void {
    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(keyPrefix)) {
        this.memoryCache.delete(k);
      }
    }
    this.lastPurgeTime = new Date().toISOString();
  }

  public getStats(): CacheStats {
    return this.getCacheStats();
  }

  public getCacheStats(): CacheStats {
    const total = this.hits + this.misses;
    const ratioNum = total > 0 ? this.hits / total : 0;
    const ratioStr = (ratioNum * 100).toFixed(1) + '%';

    return {
      configured: this.isRedisConfigured,
      connected: this.isRedisConnected,
      provider: this.isRedisConnected ? this.redisProviderName : 'DEVELOPMENT_FALLBACK',
      status: this.isRedisConnected ? 'OPERATIONAL' : 'DEVELOPMENT_FALLBACK',
      totalEntries: this.memoryCache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: ratioStr,
      hitRatioNumeric: ratioNum,
      lastPurge: this.lastPurgeTime,
      totalRequests: total,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.lastPurgeTime = new Date().toISOString();
    }
  }

  private pruneOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [k, e] of this.memoryCache.entries()) {
      if (e.cachedAt < oldestTime) {
        oldestTime = e.cachedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }
}

export const cacheService = CacheService.getInstance();
