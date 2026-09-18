// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Request Deduplication Engine
// Collapses concurrent identical requests to a single Promise.
// ====================================================================

import { createLogger } from './logger';

const logger = createLogger('RequestDeduper');

export class RequestDeduper {
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Execute an async fetcher or join an existing in-flight promise for the same key
   */
  public async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      logger.debug(`[Dedupe HIT] Joining existing in-flight request for: ${key}`);
      return existing as Promise<T>;
    }

    logger.debug(`[Dedupe MISS] Starting new request for: ${key}`);
    const promise = (async () => {
      try {
        return await fetcher();
      } finally {
        // Remove from in-flight once completed or failed
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Check if a request is currently in-flight
   */
  public isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  /**
   * Get count of currently active in-flight requests
   */
  public get activeCount(): number {
    return this.inFlight.size;
  }
}

export const requestDeduper = new RequestDeduper();
