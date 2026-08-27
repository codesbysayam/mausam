/**
 * Central IMD Client for Frontend (JavaScript interface)
 * Proxies calls securely to server-side `/api/imd/*` endpoints
 * Never exposes credentials to client-side code
 */

import { IMD_ENDPOINTS } from './imdEndpoints.js';
import { imdClientCache } from './imdCache';
import { classifyIMDError } from './imdErrors';
import {
  IMDNormalizer,
} from './imdNormalizer';

export class FrontendIMDClient {
  constructor() {
    this.timeoutMs = 10000;
  }

  async fetchEndpoint(endpoint, params = {}) {
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, String(v));
      }
    });

    const queryString = query.toString();
    const cacheKey = `${cleanEndpoint}?${queryString}`;

    // 1. Check client cache first
    const cached = imdClientCache.get(cacheKey);
    if (cached.data && !cached.isStale) {
      return {
        status: 'cached',
        data: cached.data,
        source: 'India Meteorological Department (IMD)',
        lastUpdated: cached.fetchedAt || new Date().toISOString(),
      };
    }

    // 2. Check in-flight promise deduplication
    const inFlight = imdClientCache.getInFlight(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Make fetch request to server proxy
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const fetchPromise = (async () => {
      try {
        const url = `/api/imd/${cleanEndpoint}${queryString ? `?${queryString}` : ''}`;
        const res = await fetch(url, { signal: controller.signal });
        const json = await res.json();

        if (!res.ok || json.ok === false) {
          const error = json.error || classifyIMDError(res.status, undefined, cleanEndpoint);
          // If we have stale cache, serve it gracefully with warning
          if (cached.data) {
            return {
              status: 'cached',
              data: cached.data,
              error,
              source: 'India Meteorological Department (IMD) [Cached]',
              lastUpdated: cached.fetchedAt || new Date().toISOString(),
            };
          }

          return {
            status: 'error',
            data: null,
            error,
            source: 'India Meteorological Department (IMD)',
            lastUpdated: null,
          };
        }

        const payload = json.data !== undefined ? json.data : json;
        imdClientCache.set(cacheKey, payload, json.raw);

        return {
          status: json.stale ? 'cached' : 'live',
          data: payload,
          raw: json.raw || json,
          source: 'India Meteorological Department (IMD)',
          lastUpdated: json.fetchedAt || new Date().toISOString(),
          executionMs: json.executionMs,
        };
      } catch (err) {
        const classified = classifyIMDError(undefined, err, cleanEndpoint);
        if (cached.data) {
          return {
            status: 'cached',
            data: cached.data,
            error: classified,
            source: 'India Meteorological Department (IMD) [Cached]',
            lastUpdated: cached.fetchedAt || new Date().toISOString(),
          };
        }
        return {
          status: 'error',
          data: null,
          error: classified,
          source: 'India Meteorological Department (IMD)',
          lastUpdated: null,
        };
      } finally {
        clearTimeout(timeout);
      }
    })();

    imdClientCache.setInFlight(cacheKey, fetchPromise);
    return fetchPromise;
  }

  async getCurrentWeather(stationId = '42971') {
    const res = await this.fetchEndpoint(IMD_ENDPOINTS.currentWeather, { id: stationId });
    if (res.data) {
      const normalized = IMDNormalizer.normalizeCurrentWeather(res.data, stationId);
      return {
        ...res,
        data: normalized,
      };
    }
    return res;
  }

  async getCityForecast(stationId = '42971') {
    const res = await this.fetchEndpoint(IMD_ENDPOINTS.cityForecast, { id: stationId });
    if (res.data) {
      const normalized = IMDNormalizer.normalizeCityForecast(res.data, stationId);
      return {
        ...res,
        data: normalized,
      };
    }
    return res;
  }
}

export const imdClient = new FrontendIMDClient();
export default imdClient;
