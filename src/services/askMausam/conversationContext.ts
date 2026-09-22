// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Conversation Context & Multi-turn Disambiguation
// Prevents background location from overriding conceptual user queries
// ====================================================================

import type { AskIntent } from './types';
import type { LocationMetadata } from '../../types/askMausam';

export interface ConversationContext {
  lastIntent?: AskIntent;
  lastLocation?: LocationMetadata;
  lastTopic?: string;
  lastEntities?: Record<string, string>;
}
