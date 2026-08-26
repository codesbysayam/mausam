/**
 * Client-Side In-Memory Cache with request deduplication
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  raw: any;
  fetchedAt: string;
  expiresAt: number;
}

class IMDClientCache {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<any>>();
  private defaultTTL = 60000; // 60 seconds default

  get<T = any>(key: string): { data: T | null; isStale: boolean; fetchedAt?: string } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { data: null, isStale: false };
    }
    const isStale = Date.now() > entry.expiresAt;
    return { data: entry.data, isStale, fetchedAt: entry.fetchedAt };
  }

  set<T = any>(key: string, data: T, raw?: any, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    const now = Date.now();
    this.cache.set(key, {
      key,
      data,
      raw,
      fetchedAt: new Date(now).toISOString(),
      expiresAt: now + ttl,
    });
  }

  getInFlight(key: string): Promise<any> | undefined {
    return this.inFlight.get(key);
  }

  setInFlight(key: string, promise: Promise<any>): void {
    this.inFlight.set(key, promise);
    promise.finally(() => {
      this.inFlight.delete(key);
    });
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const imdClientCache = new IMDClientCache();
