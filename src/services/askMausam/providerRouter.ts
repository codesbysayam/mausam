// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Provider Router: Intent-Based Tool & API Selection Gate
// Zero weather/telemetry API calls for knowledge, about, greeting, help
// ====================================================================

import type { AskIntent, RequiredProvider } from './types';

export function selectProviders(intent: AskIntent): RequiredProvider[] {
  switch (intent) {
    case 'CURRENT_WEATHER':
      return ['weather'];

    case 'FORECAST':
      return ['forecast'];

    case 'WARNING':
      return ['warnings'];

    case 'AQI':
      return ['aqi'];

    case 'RAINFALL':
      return ['rainfall'];

    case 'RADAR':
      return ['radar'];

    case 'MARINE':
      return ['marine'];

    case 'AGRICULTURE':
      return ['weather', 'forecast'];

    case 'MULTI_INTENT':
      return ['weather', 'aqi'];

    case 'ABOUT_MAUSAM':
    case 'ABOUT_DEVELOPER':
    case 'GENERAL_KNOWLEDGE':
    case 'HELP':
    case 'GREETING':
    case 'CLARIFICATION':
    case 'LOCATION':
    default:
      return [];
  }
}
