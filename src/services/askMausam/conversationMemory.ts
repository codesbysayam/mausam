// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Conversational Memory Manager
// Enables natural follow-up queries ("What about tomorrow?", "And rainfall?")
// ====================================================================

import {
  ConversationMemoryState,
  LocationMetadata,
  WeatherIntent,
  Timeframe,
} from '../../types/askMausam';

class ConversationMemoryManager {
  private state: ConversationMemoryState = {};

  public getState(): ConversationMemoryState {
    return { ...this.state };
  }

  public update(update: {
    location?: LocationMetadata;
    intent?: WeatherIntent;
    timeframe?: Timeframe;
    entities?: Record<string, any>;
  }) {
    this.state = {
      previousLocation: update.location || this.state.previousLocation,
      previousIntent: update.intent || this.state.previousIntent,
      previousTimeframe: update.timeframe || this.state.previousTimeframe,
      previousEntities: {
        ...(this.state.previousEntities || {}),
        ...(update.entities || {}),
      },
      lastInteractionTimestamp: Date.now(),
    };
  }

  public clear() {
    this.state = {};
  }
}

export const conversationMemory = new ConversationMemoryManager();
