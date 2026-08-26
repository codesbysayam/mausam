/**
 * In-memory Cache & Request Deduplication for IMD Connector
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  raw: any;
  fetchedAt: string;
  expiresAt: number;
  hitCount: number;
}

class IMDCache {
  private store = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<any>>();
  private defaultTTL = Number(process.env.IMD_CACHE_TTL_MS || 60000);
  private stats = {
    hits: 0,
    misses: 0,
    dedupes: 0,
    staleServes: 0,
  };

  get<T = any>(key: string): { entry: CacheEntry<T> | null; isStale: boolean } {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return { entry: null, isStale: false };
    }

    const now = Date.now();
    const isStale = now > entry.expiresAt;
    if (isStale) {
      this.stats.staleServes++;
    } else {
      this.stats.hits++;
    }
    entry.hitCount++;
    return { entry, isStale };
  }

  set<T = any>(key: string, data: T, raw: any, customTtlMs?: number): CacheEntry<T> {
    const ttl = customTtlMs ?? this.defaultTTL;
    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      data,
      raw,
      fetchedAt: new Date(now).toISOString(),
      expiresAt: now + ttl,
      hitCount: 0,
    };
    this.store.set(key, entry);
    return entry;
  }

  has(key: string): boolean {
    const { entry, isStale } = this.get(key);
    return entry !== null && !isStale;
  }

  getInFlight(key: string): Promise<any> | undefined {
    const promise = this.inFlight.get(key);
    if (promise) {
      this.stats.dedupes++;
    }
    return promise;
  }

  setInFlight(key: string, promise: Promise<any>): void {
    this.inFlight.set(key, promise);
    promise.finally(() => {
      this.inFlight.delete(key);
    });
  }

  clear(): void {
    this.store.clear();
    this.inFlight.clear();
  }

  getStats() {
    return {
      ...this.stats,
      size: this.store.size,
      inFlightCount: this.inFlight.size,
      entries: Array.from(this.store.values()).map((e) => ({
        key: e.key,
        fetchedAt: e.fetchedAt,
        expiresInSec: Math.max(0, Math.round((e.expiresAt - Date.now()) / 1000)),
        isExpired: Date.now() > e.expiresAt,
        hitCount: e.hitCount,
      })),
    };
  }
}

export const imdCache = new IMDCache();
