// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Master Ask MAUSAM Orchestrator Service Facade
// Proxies to single canonical AskMausamOrchestrator with full backward compatibility
// ====================================================================

import {
  AskMausamContext,
  AskMausamResponse,
} from '../../types/askMausam';
import { AskMausamOrchestrator } from './askMausamOrchestrator';

export interface ProcessAskMausamParams {
  query: string;
  selectedAppLocation?: {
    name?: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
    district?: string;
  };
  preferredLanguage?: string;
  stationCode?: string;
  signal?: AbortSignal;
}

export interface ProcessAskMausamResult {
  context: AskMausamContext;
  response: AskMausamResponse;
  comparisonContextB?: AskMausamContext;
}

export async function processAskMausamQuery(
  params: ProcessAskMausamParams
): Promise<ProcessAskMausamResult> {
  const result = await AskMausamOrchestrator.execute(params);
  return {
    context: result.context,
    response: result.response,
    comparisonContextB: result.comparisonContextB,
  };
}

export { AskMausamOrchestrator };
