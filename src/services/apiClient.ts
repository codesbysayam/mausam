// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Centralized Resilient API Client
// Handles fetch, timeout, AbortController, HTTP errors, JSON validation,
// 429 cooldowns, 50x handling, network offline status, and in-flight deduplication
// ====================================================================

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  skipCache?: boolean;
  ttlMs?: number;
}

export interface ApiError {
  isApiError: true;
  status: number;
  statusText: string;
  message: string;
  code: string;
  isRateLimited: boolean;
  isOffline: boolean;
  isTimeout: boolean;
}

// In-memory short client cache
const clientCache = new Map<string, { data: any; expiresAt: number; savedAt: number }>();
// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();
// 429 rate limit cooldown tracking
let rateLimitCooldownUntil = 0;

export function isApiError(err: any): err is ApiError {
  return Boolean(err && err.isApiError);
}

export function normalizeError(err: any, status = 0): ApiError {
  const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const isRateLimited = status === 429 || err?.message?.includes('429');

  let code = 'NETWORK_ERROR';
  if (isTimeout) code = 'TIMEOUT';
  else if (isRateLimited) code = 'RATE_LIMITED';
  else if (isOffline) code = 'OFFLINE';
  else if (status >= 500) code = `SERVER_${status}`;
  else if (status >= 400) code = `CLIENT_${status}`;

  return {
    isApiError: true,
    status,
    statusText: err?.statusText || (isTimeout ? 'Request Timeout' : 'Network Error'),
    message: err?.message || 'An unexpected error occurred during meteorological data retrieval.',
    code,
    isRateLimited,
    isOffline,
    isTimeout,
  };
}

export async function apiFetch<T = any>(
  input: RequestInfo | string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    timeoutMs = 8000,
    skipCache = false,
    ttlMs = 30000, // 30 seconds fresh cache by default
    ...fetchOptions
  } = options;

  const urlKey = typeof input === 'string' ? input : (input as Request).url;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Check 429 cooldown
  const now = Date.now();
  if (now < rateLimitCooldownUntil && isGet) {
    const cached = clientCache.get(urlKey);
    if (cached) {
      return cached.data as T;
    }
  }

  // Check client-side memory cache for GET requests
  if (isGet && !skipCache) {
    const cached = clientCache.get(urlKey);
    if (cached && now < cached.expiresAt) {
      return cached.data as T;
    }
  }

  // In-flight deduplication for identical concurrent GET requests
  if (isGet && inFlightRequests.has(urlKey)) {
    return inFlightRequests.get(urlKey)!;
  }

  const execute = async (): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(fetchOptions.headers || {}),
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          rateLimitCooldownUntil = Date.now() + 30000; // 30s cooldown
        }

        // Try to serve stale cache if server error or rate limited
        if (isGet) {
          const stale = clientCache.get(urlKey);
          if (stale) {
            console.warn(`[apiClient] HTTP ${response.status} on ${urlKey}. Returning stale cached data.`);
            return stale.data as T;
          }
        }

        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch {
          // ignore non-json error responses
        }

        const msg = errorBody?.error || errorBody?.message || `API_HTTP_${response.status}`;
        throw normalizeError(new Error(msg), response.status);
      }

      const data = await response.json();

      if (isGet) {
        clientCache.set(urlKey, {
          data,
          expiresAt: Date.now() + ttlMs,
          savedAt: Date.now(),
        });
      }

      return data as T;
    } catch (err: any) {
      // If network fails or timeout, attempt to return stale cache if available
      if (isGet) {
        const stale = clientCache.get(urlKey);
        if (stale) {
          console.warn(`[apiClient] Network failure on ${urlKey}. Returning stale cached data.`);
          return stale.data as T;
        }
      }

      if (isApiError(err)) {
        throw err;
      }
      throw normalizeError(err, 0);
    } finally {
      clearTimeout(timer);
      if (isGet) {
        inFlightRequests.delete(urlKey);
      }
    }
  };

  if (isGet) {
    const promise = execute();
    inFlightRequests.set(urlKey, promise);
    return promise;
  }

  return execute();
}
