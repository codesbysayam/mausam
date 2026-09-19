// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Reusable Server-Side AI Meteorological Assistant Service
// Graceful 429 rate-limit handling, no API key exposure, no crash
// ====================================================================

import { AIProvider, AskMausamParams, AskMausamResult } from '../../../lib/providers/ai';

export class AIService {
  private static instance: AIService;
  private lastRateLimitTime: number = 0;
  private cooldownDurationMs: number = 60 * 1000; // 60s cooldown if 429 occurs

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async ask(params: AskMausamParams): Promise<AskMausamResult> {
    const now = Date.now();
    if (now - this.lastRateLimitTime < this.cooldownDurationMs) {
      return {
        response: 'Mausam Meteorological AI query capacity is temporarily resting following rate limits. Surface telemetry and Doppler radar remain directly accessible in live tabs.',
        source: 'Mausam Automated Safe Mode',
        groundingSources: [],
        modeUsed: 'cooldown',
      };
    }

    try {
      const result = await AIProvider.askMausam(params);
      return result;
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        this.lastRateLimitTime = Date.now();
        return {
          response: 'AI meteorological service is temporarily rate-limited. Real-time observational readings and alert feeds remain active.',
          source: 'Mausam Automated Advisory',
          groundingSources: [],
          modeUsed: 'rate_limited',
        };
      }

      return {
        response: 'Meteorological AI consultation is currently offline. Real-time surface telemetry and satellite radar continue to stream live.',
        source: 'Mausam Fallback Telemetry',
        groundingSources: [],
        modeUsed: 'offline',
        error: errMsg,
      };
    }
  }
}

export const aiService = AIService.getInstance();
