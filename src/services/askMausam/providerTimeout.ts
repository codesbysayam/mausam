// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Strict Provider Timeout Wrapper
// Prevents slow external APIs from freezing the UI or pipeline
// ====================================================================

export const TIMEOUT_CONFIG = {
  LOCATION: 1500,
  WEATHER: 2500,
  AQI: 2500,
  WARNINGS: 2500,
  RADAR: 2000,
  MARINE: 2500,
  LLM: 3500,
  TOTAL_HARD_LIMIT: 6000,
} as const;

/**
 * Wraps a promise with an enforced timeout.
 * Returns the fallback value if the timeout expires.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T | null = null,
  operationName = 'operation'
): Promise<T | null> {
  let timerId: any;
  const timeoutPromise = new Promise<T | null>((resolve) => {
    timerId = setTimeout(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[AskMAUSAM:Timeout] ${operationName} exceeded ${timeoutMs}ms limit`);
      }
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timerId);
    return result;
  } catch (err) {
    clearTimeout(timerId);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[AskMAUSAM:Error] ${operationName} failed:`, err);
    }
    return fallbackValue;
  }
}
