// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Truthful Provider Types & Status Definitions
// ====================================================================

export type ProviderStatus =
  | 'OPERATIONAL'
  | 'DEGRADED'
  | 'NOT_CONFIGURED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'AUTH_ERROR'
  | 'INVALID_RESPONSE'
  | 'ERROR';

export interface ProviderResult<T> {
  provider: string;
  status: ProviderStatus;
  data: T | null;
  fetchedAt: string | null;
  latencyMs: number | null;
  errorCode?: string;
  errorMessage?: string;
  sourceUrl?: string;
  cacheHit: boolean;
  isFallback: boolean;
}

export interface ProviderHealth {
  provider: string;
  status: ProviderStatus;
  latencyMs: number | null;
  lastChecked: string;
  lastSuccess: string | null;
  lastFailure: string | null;
  errorMessage?: string;
}
