// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Unified Provider Resolver with Fallback and Truthful Status Tracking
// ====================================================================

import { ProviderResult, ProviderStatus } from '../providers/providerTypes';
import { cacheLayer } from './cache';
import { createLogger } from './logger';

const logger = createLogger('ProviderResolver');

export interface ResolverOptions {
  cacheKey: string;
  ttlSeconds?: number;
  allowStaleOnError?: boolean;
}

export async function resolveWithFallback<T>(
  primary: () => Promise<ProviderResult<T>>,
  fallbacks: Array<() => Promise<ProviderResult<T>>> = [],
  options: ResolverOptions
): Promise<ProviderResult<T>> {
  const { cacheKey, ttlSeconds = 300, allowStaleOnError = true } = options;

  // 1. Check cache first
  const cached = await cacheLayer.get<T>(cacheKey);
  if (cached.data !== null) {
    return {
      provider: 'CACHE',
      status: 'OPERATIONAL',
      data: cached.data,
      fetchedAt: cached.metadata.cachedAt,
      latencyMs: 0,
      cacheHit: true,
      isFallback: false,
    };
  }

  // 2. Try Primary provider
  let primaryResult: ProviderResult<T> | null = null;
  try {
    primaryResult = await primary();
    if (primaryResult.status === 'OPERATIONAL' && primaryResult.data !== null) {
      // Store in cache
      await cacheLayer.set(cacheKey, primaryResult.data, ttlSeconds);
      return {
        ...primaryResult,
        cacheHit: false,
        isFallback: false,
      };
    }
  } catch (err: any) {
    logger.warn(`Primary provider threw unexpected error: ${err.message}`);
    primaryResult = {
      provider: 'PRIMARY',
      status: 'ERROR',
      data: null,
      fetchedAt: null,
      latencyMs: null,
      errorCode: 'UNCAUGHT_ERROR',
      errorMessage: err.message,
      cacheHit: false,
      isFallback: false,
    };
  }

  // 3. If primary failed or returned no data, iterate through fallbacks
  logger.warn(`Primary returned ${primaryResult?.status}, attempting ${fallbacks.length} fallback(s)...`);

  for (let i = 0; i < fallbacks.length; i++) {
    try {
      const fallbackResult = await fallbacks[i]();
      if (fallbackResult.status === 'OPERATIONAL' && fallbackResult.data !== null) {
        logger.info(`Fallback provider ${fallbackResult.provider} succeeded`);
        // Store fallback in cache
        await cacheLayer.set(cacheKey, fallbackResult.data, ttlSeconds);
        return {
          ...fallbackResult,
          cacheHit: false,
          isFallback: true,
        };
      }
    } catch (fbErr: any) {
      logger.warn(`Fallback ${i} failed: ${fbErr.message}`);
    }
  }

  // 4. Return truthful failure or unavailable status
  return (
    primaryResult || {
      provider: 'NONE',
      status: 'UNAVAILABLE',
      data: null,
      fetchedAt: null,
      latencyMs: null,
      errorCode: 'ALL_PROVIDERS_FAILED',
      errorMessage: 'All primary and fallback providers failed or returned no data',
      cacheHit: false,
      isFallback: false,
    }
  );
}
