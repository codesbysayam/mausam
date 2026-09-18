// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Circuit Breaker & Rate Limit Protector
// Protects upstream APIs from spamming when rate-limited or degraded.
// ====================================================================

import { createLogger } from './logger';

const logger = createLogger('CircuitBreaker');

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownMs?: number;
  providerName?: string;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private failureCount = 0;
  private state: CircuitState = 'CLOSED';
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly cooldownMs: number;
  private readonly providerName: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownMs = options.cooldownMs || 60000; // 60s cooldown
    this.providerName = options.providerName || 'Generic';
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.cooldownMs) {
        this.state = 'HALF_OPEN';
        logger.info(`[${this.providerName}] Circuit half-opened, testing connectivity.`);
      }
    }
    return this.state;
  }

  public isOpen(): boolean {
    return this.getState() === 'OPEN';
  }

  public recordSuccess(): void {
    if (this.state !== 'CLOSED') {
      logger.info(`[${this.providerName}] Circuit closed after recovery.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  public recordFailure(isRateLimit = false): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // 429 rate limit trips circuit immediately
    if (isRateLimit || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(
        `[${this.providerName}] Circuit OPENED. Cooldown: ${this.cooldownMs / 1000}s. Failure count: ${this.failureCount}`
      );
    }
  }

  public reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
}

// Global registry of circuit breakers by provider
const breakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(provider: string): CircuitBreaker {
  let breaker = breakers.get(provider);
  if (!breaker) {
    breaker = new CircuitBreaker({ providerName: provider, failureThreshold: 3, cooldownMs: 60000 });
    breakers.set(provider, breaker);
  }
  return breaker;
}
