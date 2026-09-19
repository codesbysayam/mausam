// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Server-Side Memory Cache Service
// In-process TTL cache with LRU eviction and stale-while-revalidate support
// ====================================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  staleUntil: number;
}

export class CacheService {
  private static instance: CacheService;
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxEntries = 200;

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public get<T = any>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.store.get(key);
    if (!entry) {
      return { data: null, isStale: false };
    }

    const now = Date.now();
    if (now > entry.staleUntil) {
      this.store.delete(key);
      return { data: null, isStale: false };
    }

    const isStale = now > entry.expiresAt;
    return { data: entry.value, isStale };
  }

  public set<T>(key: string, value: T, ttlSeconds: number, staleSeconds: number = 300): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entries
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
      staleUntil: now + (ttlSeconds + staleSeconds) * 1000,
    });
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public getEntryCount(): number {
    return this.store.size;
  }
}

export const serverCache = CacheService.getInstance();
