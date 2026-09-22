// ====================================================================
// MAUSAM - 17 Critical Query Regression Runner
// Deterministically checks all queries against intended semantic paths
// ====================================================================

import { routeIntent } from './intentRouter';
import { AskMausamOrchestrator } from './askMausamOrchestrator';

export interface TestResult {
  query: string;
  expectedIntent: string;
  actualIntent: string;
  isKnowledge: boolean;
  passed: boolean;
  notes?: string;
}

export const REGRESSION_QUERIES = [
  { query: 'What is MAUSAM?', expectedIntent: 'ABOUT_MAUSAM', isKnowledge: true },
  { query: 'Who developed this?', expectedIntent: 'ABOUT_DEVELOPER', isKnowledge: true },
  { query: 'What can you do?', expectedIntent: 'HELP', isKnowledge: true },
  { query: 'What is AQI?', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'What is the AQI in Bhubaneswar?', expectedIntent: 'AQI', isKnowledge: false },
  { query: 'What is radar?', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'Show radar for Odisha', expectedIntent: 'RADAR', isKnowledge: false },
  { query: 'What is rainfall?', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'Will it rain in Delhi tomorrow?', expectedIntent: 'FORECAST', isKnowledge: false },
  { query: 'What is humidity?', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'Current weather in Mumbai', expectedIntent: 'CURRENT_WEATHER', isKnowledge: false },
  { query: 'Explain weather warnings', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'Any warnings in Kerala?', expectedIntent: 'WARNINGS', isKnowledge: false },
  { query: 'What is agromet?', expectedIntent: 'GENERAL_KNOWLEDGE', isKnowledge: true },
  { query: 'Spraying advisory for Ganjam', expectedIntent: 'AGRICULTURE', isKnowledge: false },
  { query: 'Compare weather between Pune and Nagpur', expectedIntent: 'MULTI_LOCATION_COMPARISON', isKnowledge: false },
  { query: 'Hello', expectedIntent: 'GREETING', isKnowledge: true },
];

export function runRoutingRegressionCheck(): TestResult[] {
  return REGRESSION_QUERIES.map((tc) => {
    const routing = routeIntent(tc.query);
    const passed =
      routing.intent === tc.expectedIntent &&
      (!tc.isKnowledge || (routing.requiredTools.length === 0 && routing.isGeneralKnowledge === true));
    return {
      query: tc.query,
      expectedIntent: tc.expectedIntent,
      actualIntent: routing.intent,
      isKnowledge: tc.isKnowledge,
      passed,
      notes: passed ? 'OK' : `Expected ${tc.expectedIntent}, got ${routing.intent}`,
    };
  });
}

export async function runEndToEndRegressionCheck(): Promise<boolean> {
  const routingResults = runRoutingRegressionCheck();
  const allRoutingPassed = routingResults.every((r) => r.passed);

  if (!allRoutingPassed) {
    console.error('[RegressionFail] Routing mismatch:', routingResults.filter((r) => !r.passed));
    return false;
  }

  // Verify "Who developed this?" has zero weather
  const devResult = await AskMausamOrchestrator.execute({ query: 'Who developed this?' });
  const devPassed =
    devResult.response.responseType === 'knowledge' &&
    devResult.response.intent === 'ABOUT_DEVELOPER' &&
    devResult.response.answer.includes("I don't have verified developer information in my current project data.") &&
    devResult.context.currentWeather === undefined;

  // Verify "What is MAUSAM?" has zero weather
  const mausamResult = await AskMausamOrchestrator.execute({ query: 'What is MAUSAM?' });
  const mausamPassed =
    mausamResult.response.responseType === 'knowledge' &&
    mausamResult.response.intent === 'ABOUT_MAUSAM' &&
    mausamResult.context.currentWeather === undefined;

  return allRoutingPassed && devPassed && mausamPassed;
}
