// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Strict Intent and Response Types
// ====================================================================

export type AskIntent =
  | 'GREETING'
  | 'HELP'
  | 'ABOUT_MAUSAM'
  | 'ABOUT_DEVELOPER'
  | 'GENERAL_KNOWLEDGE'
  | 'CURRENT_WEATHER'
  | 'FORECAST'
  | 'WARNING'
  | 'AQI'
  | 'RAINFALL'
  | 'RADAR'
  | 'MARINE'
  | 'AGRICULTURE'
  | 'LOCATION'
  | 'MULTI_INTENT'
  | 'CLARIFICATION';

export type ResponseType =
  | 'greeting'
  | 'knowledge'
  | 'weather'
  | 'forecast'
  | 'warning'
  | 'aqi'
  | 'rainfall'
  | 'radar'
  | 'marine'
  | 'agriculture'
  | 'clarification'
  | 'error';

export interface AskIntentResult {
  intent: AskIntent;
  confidence: number;
  requiresLocation: boolean;
  requiresProvider: boolean;
  entities: {
    location?: string;
    state?: string;
    unionTerritory?: string;
    topic?: string;
  };
}

export type RequiredProvider = 'weather' | 'forecast' | 'warnings' | 'aqi' | 'rainfall' | 'radar' | 'marine';
