// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Resilient Provider Timeout Wrapper
// Guarantees unresponsive external APIs never freeze user chat
// ====================================================================

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T | null = null,
  label = 'Provider'
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<T | null>((resolve) => {
      setTimeout(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[AskMAUSAM:Timeout] ${label} exceeded ${timeoutMs}ms limit.`);
        }
        resolve(fallback);
      }, timeoutMs);
    }),
  ]);
}
