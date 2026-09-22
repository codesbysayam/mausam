// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Fast-Path Eligibility Controller
// Guarantees fast-path ONLY runs for verified factual queries or local knowledge
// UNKNOWN OR GENERAL QUESTIONS NEVER ROUTE TO WEATHER FAST-PATH
// ====================================================================

import type { AskIntent } from './types';

/**
 * Returns true ONLY if the intent is an explicit factual-data intent
 * that can be generated directly from verified provider telemetry.
 */
export function canUseFastPath(intent: AskIntent): boolean {
  return [
    'CURRENT_WEATHER',
    'AQI',
    'WARNING',
    'RAINFALL',
    'FORECAST',
    'RADAR',
    'MULTI_INTENT',
  ].includes(intent);
}

/**
 * Returns true if the query resolves directly to the local knowledge base
 * with ZERO provider telemetry required.
 */
export function isLocalKnowledgeIntent(intent: AskIntent): boolean {
  return [
    'ABOUT_MAUSAM',
    'ABOUT_DEVELOPER',
    'GENERAL_KNOWLEDGE',
    'HELP',
    'GREETING',
  ].includes(intent);
}
