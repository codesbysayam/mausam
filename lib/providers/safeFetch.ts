// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Production Safe Provider Fetch Utility
// Resilient timeout, AbortController, and exact error classification
// ====================================================================

export type ProviderErrorCode =
  | 'TIMEOUT'
  | 'NOT_CONFIGURED'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'PROVIDER_DOWN'
  | 'NETWORK_ERROR'
  | 'PARSE_ERROR';

export interface SafeFetchConfig {
  timeoutMs?: number;
  requiredKey?: string;
  providerName?: string;
  retries?: number;
  headers?: Record<string, string>;
}

export interface SafeFetchResult<T = any> {
  success: boolean;
  data: T | null;
  status: number | null;
  error: string | null;
  errorCode: ProviderErrorCode | null;
  latencyMs: number;
}

/**
 * Robust fetch wrapper that guarantees no crashes, handles timeouts,
 * parses JSON safely, and classifies errors specifically.
 */
export async function safeProviderFetch<T = any>(
  url: string,
  options: RequestInit = {},
  config: SafeFetchConfig = {}
): Promise<SafeFetchResult<T>> {
  const {
    timeoutMs = 6000,
    requiredKey,
    providerName = 'Provider',
    retries = 0,
    headers = {},
  } = config;

  // 1. Check if required key is configured (Server-side check)
  if (requiredKey && typeof process !== 'undefined' && process.env) {
    const keyVal = process.env[requiredKey];
    if (!keyVal || keyVal.trim() === '') {
      return {
        success: false,
        data: null,
        status: null,
        error: `${providerName} is not configured: ${requiredKey} is missing`,
        errorCode: 'NOT_CONFIGURED',
        latencyMs: 0,
      };
    }
  }

  const startTime = Date.now();
  let attemptsLeft = Math.max(0, retries) + 1;
  let lastError: string | null = null;
  let lastErrorCode: ProviderErrorCode | null = null;
  let lastStatus: number | null = null;

  while (attemptsLeft > 0) {
    attemptsLeft--;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedHeaders = {
        'User-Agent': 'MAUSAM-Atmospheric-Platform/3.0 (Government of India Open Weather)',
        Accept: 'application/json, text/plain, */*',
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      };

      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      lastStatus = response.status;
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        if (response.status === 401) {
          lastErrorCode = 'UNAUTHORIZED';
          lastError = `Unauthorized: Invalid or expired credentials for ${providerName} (HTTP 401)`;
        } else if (response.status === 403) {
          lastErrorCode = 'INVALID_CREDENTIALS';
          lastError = `Forbidden: Access denied or restricted key for ${providerName} (HTTP 403)`;
        } else if (response.status === 429) {
          lastErrorCode = 'RATE_LIMITED';
          lastError = `Rate limit reached for ${providerName} (HTTP 429)`;
        } else if (response.status >= 500) {
          lastErrorCode = 'PROVIDER_DOWN';
          lastError = `Upstream service error from ${providerName} (HTTP ${response.status})`;
        } else {
          lastErrorCode = 'NETWORK_ERROR';
          lastError = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
        }

        // Only retry on 5xx or transient errors if retries configured
        if (response.status >= 500 && attemptsLeft > 0) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        return {
          success: false,
          data: null,
          status: lastStatus,
          error: lastError,
          errorCode: lastErrorCode,
          latencyMs,
        };
      }

      // Safe JSON parsing
      const text = await response.text();
      let parsedData: T;
      try {
        parsedData = JSON.parse(text);
      } catch (parseErr: any) {
        return {
          success: false,
          data: null,
          status: response.status,
          error: `JSON Parse error from ${providerName}: ${parseErr?.message || 'Invalid JSON'}`,
          errorCode: 'PARSE_ERROR',
          latencyMs,
        };
      }

      return {
        success: true,
        data: parsedData,
        status: response.status,
        error: null,
        errorCode: null,
        latencyMs,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      if (isAbort) {
        lastErrorCode = 'TIMEOUT';
        lastError = `Request to ${providerName} timed out after ${timeoutMs}ms`;
      } else {
        lastErrorCode = 'NETWORK_ERROR';
        lastError = err.message || `Network error connecting to ${providerName}`;
      }

      if (attemptsLeft > 0) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
    }
  }

  return {
    success: false,
    data: null,
    status: lastStatus,
    error: lastError || 'Unknown fetch error',
    errorCode: lastErrorCode || 'NETWORK_ERROR',
    latencyMs: Date.now() - startTime,
  };
}
