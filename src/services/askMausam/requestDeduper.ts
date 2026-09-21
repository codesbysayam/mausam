// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// In-Flight Request Deduplication
// Reuses identical pending promises across components & concurrent triggers
// ====================================================================

class RequestDeduper {
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Executes or shares an in-flight promise for the same key.
   */
  public async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = fn()
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  public isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  public clear(): void {
    this.inFlight.clear();
  }
}

export const requestDeduper = new RequestDeduper();
