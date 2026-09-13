// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Safe Fetch Utility
// Truthful status mapping, abort timeouts, transient exponential retry,
// and payload validation.
// ====================================================================

import { ProviderStatus } from '../providers/providerTypes';
import { createLogger } from './logger';

const logger = createLogger('SafeFetch');

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  providerName?: string;
}

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: ProviderStatus;
  httpStatus: number | null;
  data: T | null;
  latencyMs: number;
  url: string;
  errorMessage?: string;
  errorCode?: string;
}

export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const {
    timeoutMs = 6000,
    maxRetries = 2,
    initialDelayMs = 300,
    backoffFactor = 2,
    providerName = 'Generic',
    headers,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    attempt++;
    const start = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'User-Agent': 'MAUSAM-Atmospheric-Intelligence/2.0',
          'Accept': 'application/json, text/plain, */*',
          ...headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);

      // Handle HTTP status codes truthfully
      if (response.status === 401 || response.status === 403) {
        logger.warn(`Auth failure on ${providerName} (${response.status})`, providerName, { url, status: response.status });
        return {
          ok: false,
          status: 'AUTH_ERROR',
          httpStatus: response.status,
          data: null,
          latencyMs,
          url,
          errorCode: `HTTP_${response.status}`,
          errorMessage: `Authentication or key authorization failed (HTTP ${response.status})`,
        };
      }

      if (response.status === 429) {
        logger.warn(`Rate limit exceeded for ${providerName} (429)`, providerName, { url });
        return {
          ok: false,
          status: 'RATE_LIMITED',
          httpStatus: 429,
          data: null,
          latencyMs,
          url,
          errorCode: 'RATE_LIMITED',
          errorMessage: 'Provider quota or rate limit exceeded (HTTP 429)',
        };
      }

      if (response.status === 404) {
        return {
          ok: false,
          status: 'UNAVAILABLE',
          httpStatus: 404,
          data: null,
          latencyMs,
          url,
          errorCode: 'HTTP_404',
          errorMessage: 'Requested resource or station not found (HTTP 404)',
        };
      }

      if (response.status >= 500) {
        // Transient 5xx error, check retry
        if (attempt <= maxRetries) {
          logger.warn(`Transient server error ${response.status} from ${providerName}, retrying in ${delay}ms...`, providerName);
          await new Promise((res) => setTimeout(res, delay));
          delay *= backoffFactor;
          continue;
        }

        return {
          ok: false,
          status: 'UNAVAILABLE',
          httpStatus: response.status,
          data: null,
          latencyMs,
          url,
          errorCode: `HTTP_${response.status}`,
          errorMessage: `Upstream service returned server error HTTP ${response.status}`,
        };
      }

      if (!response.ok) {
        return {
          ok: false,
          status: 'ERROR',
          httpStatus: response.status,
          data: null,
          latencyMs,
          url,
          errorCode: `HTTP_${response.status}`,
          errorMessage: `Unexpected HTTP status ${response.status} ${response.statusText}`,
        };
      }

      // Parse body
      const contentType = response.headers.get('content-type') || '';
      let parsedData: any;

      if (contentType.includes('application/json')) {
        try {
          parsedData = await response.json();
        } catch (jsonErr: any) {
          return {
            ok: false,
            status: 'INVALID_RESPONSE',
            httpStatus: response.status,
            data: null,
            latencyMs,
            url,
            errorCode: 'INVALID_JSON',
            errorMessage: `Failed to parse JSON response: ${jsonErr.message}`,
          };
        }
      } else {
        parsedData = await response.text();
      }

      return {
        ok: true,
        status: 'OPERATIONAL',
        httpStatus: response.status,
        data: parsedData as T,
        latencyMs,
        url,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);

      const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
      if (isTimeout) {
        logger.warn(`Request timeout after ${timeoutMs}ms for ${providerName}`, providerName, { url });
        if (attempt <= maxRetries) {
          await new Promise((res) => setTimeout(res, delay));
          delay *= backoffFactor;
          continue;
        }
        return {
          ok: false,
          status: 'TIMEOUT',
          httpStatus: null,
          data: null,
          latencyMs,
          url,
          errorCode: 'TIMEOUT',
          errorMessage: `Connection timed out after ${timeoutMs}ms`,
        };
      }

      // Network drop / DNS failure / ECONNRESET
      const isNetworkDrop =
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ENOTFOUND' ||
        /network|fetch failed|socket/i.test(err.message || '');

      if (isNetworkDrop && attempt <= maxRetries) {
        logger.warn(`Network connection issue for ${providerName}, retrying in ${delay}ms...`, providerName, { error: err.message });
        await new Promise((res) => setTimeout(res, delay));
        delay *= backoffFactor;
        continue;
      }

      return {
        ok: false,
        status: 'UNAVAILABLE',
        httpStatus: null,
        data: null,
        latencyMs,
        url,
        errorCode: err.code || 'NETWORK_ERROR',
        errorMessage: err.message || 'Network request failed',
      };
    }
  }
}
