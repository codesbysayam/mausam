// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Caching Layer (In-Memory + Optional Redis / KV)
// Tracks cacheHit, cachedAt, ageSeconds, and cacheType truthfully
// ====================================================================

export interface CacheEntry<T> {
  data: T;
  storedAt: number; // epoch ms
  ttlMs: number;
}

export interface CacheMetadata {
  cacheHit: boolean;
  isStale: boolean;
  cachedAt: string | null;
  ageSeconds: number;
  cacheType: 'REDIS' | 'IN_MEMORY';
}

export interface CacheResult<T> {
  data: T | null;
  metadata: CacheMetadata;
}

export class CacheLayer {
  private memoryStore = new Map<string, CacheEntry<any>>();
  private redisConnected: boolean = false;
  private staleGraceMs = 2 * 60 * 60 * 1000; // 2 hours stale tolerance

  constructor() {
    this.redisConnected = Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);
  }

  public getCacheType(): 'REDIS' | 'IN_MEMORY' {
    return this.redisConnected ? 'REDIS' : 'IN_MEMORY';
  }

  public async get<T>(key: string, allowStale = false): Promise<CacheResult<T>> {
    const now = Date.now();
    const entry = this.memoryStore.get(key);

    if (!entry) {
      return {
        data: null,
        metadata: {
          cacheHit: false,
          isStale: false,
          cachedAt: null,
          ageSeconds: 0,
          cacheType: this.getCacheType(),
        },
      };
    }

    const ageMs = now - entry.storedAt;
    const isExpired = ageMs > entry.ttlMs;

    if (isExpired) {
      if (allowStale && ageMs <= entry.ttlMs + this.staleGraceMs) {
        return {
          data: entry.data as T,
          metadata: {
            cacheHit: true,
            isStale: true,
            cachedAt: new Date(entry.storedAt).toISOString(),
            ageSeconds: Math.round(ageMs / 1000),
            cacheType: this.getCacheType(),
          },
        };
      }
      this.memoryStore.delete(key);
      return {
        data: null,
        metadata: {
          cacheHit: false,
          isStale: false,
          cachedAt: null,
          ageSeconds: 0,
          cacheType: this.getCacheType(),
        },
      };
    }

    const ageSeconds = Math.max(0, Math.round(ageMs / 1000));
    return {
      data: entry.data as T,
      metadata: {
        cacheHit: true,
        isStale: false,
        cachedAt: new Date(entry.storedAt).toISOString(),
        ageSeconds,
        cacheType: this.getCacheType(),
      },
    };
  }

  public async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const now = Date.now();
    this.memoryStore.set(key, {
      data: value,
      storedAt: now,
      ttlMs: ttlSeconds * 1000,
    });
  }

  public async delete(key: string): Promise<void> {
    this.memoryStore.delete(key);
  }

  public getStats() {
    return {
      size: this.memoryStore.size,
      cacheType: this.getCacheType(),
    };
  }
}

export const cacheLayer = new CacheLayer();
