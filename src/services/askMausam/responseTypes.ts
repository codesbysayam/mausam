// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Structured Response Types for Ask MAUSAM Pipeline
// ====================================================================

export interface KnowledgeResponse {
  type: 'knowledge';
  title: string;
  answer: string;
  bullets?: string[];
  category?: string;
  suggestedFollowUps?: string[];
}

export interface WeatherResponse {
  type: 'weather';
  location: string;
  data: unknown;
}

export interface WarningResponse {
  type: 'warning';
  location: string;
  warnings: unknown[];
}

export interface AQIResponse {
  type: 'aqi';
  location: string;
  data: unknown;
}

export interface ForecastResponse {
  type: 'forecast';
  location: string;
  data: unknown;
}

export interface RadarResponse {
  type: 'radar';
  location: string;
  data: unknown;
}

export interface ClarificationResponse {
  type: 'clarification';
  question: string;
}

export interface ErrorResponse {
  type: 'error';
  message: string;
}

export type AskResponse =
  | KnowledgeResponse
  | WeatherResponse
  | WarningResponse
  | AQIResponse
  | ForecastResponse
  | RadarResponse
  | ClarificationResponse
  | ErrorResponse;
