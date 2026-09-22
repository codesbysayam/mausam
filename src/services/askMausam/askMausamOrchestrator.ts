// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Single Canonical Ask MAUSAM Data Orchestrator
// Coordinates Location, Intent, Concurrent Providers, Normalization,
// Fast-Path Responses, Fact Validation, and Strict Latency Budgets
// ====================================================================

import {
  AskMausamContext,
  AskMausamResponse,
  LocationMetadata,
  DataSourceContext,
  LocationWeatherComparison,
  CurrentWeatherContext,
  DailyForecastContext,
} from '../../types/askMausam';
import { resolveLocation, locationToMetadata } from './locationResolver';
import { routeIntent } from './intentRouter';
import { validateAndEnforceGrounding, assertResponseMatchesIntent } from './responseValidator';
import { conversationMemory } from './conversationMemory';
import { OpenMeteoProvider } from '../providers/openMeteoProvider';
import { CpcbAirQualityProvider } from '../providers/cpcbAirQualityProvider';
import { IncoisMarineProvider, isRegionCoastal } from '../providers/incoisMarineProvider';
import { getActiveWarningsForLocation } from '../warnings/warningService';
import { withTimeout, TIMEOUT_CONFIG } from './providerTimeout';
import { requestCache, CACHE_TTLS } from './requestCache';
import { requestDeduper } from './requestDeduper';
import { ResponseGenerator } from './responseGenerator';
import {
  findKnowledge,
  MAUSAM_PLATFORM_OVERVIEW,
  MAUSAM_CAPABILITIES,
  DEVELOPER_KNOWLEDGE,
} from './mausamKnowledge';

export interface OrchestratorParams {
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

export interface OrchestratorResult {
  context: AskMausamContext;
  response: AskMausamResponse;
  comparisonContextB?: AskMausamContext;
  timingMs?: {
    locationMs: number;
    providersMs: number;
    aiMs: number;
    totalMs: number;
  };
}

let currentRequestId = 0;

export class AskMausamOrchestrator {
  /**
   * Main entry point for all Ask MAUSAM queries
   */
  public static async execute(params: OrchestratorParams): Promise<OrchestratorResult> {
    const startTime = performance.now();
    const requestId = ++currentRequestId;
    const { query, selectedAppLocation, preferredLanguage = 'English', signal } = params;

    const memory = conversationMemory.getState();

    // 1. Resolve Location (< 2ms)
    const locStart = performance.now();
    const resolvedLoc = resolveLocation(query, selectedAppLocation, memory);
    const locTime = Math.round(performance.now() - locStart);

    // 2. Deterministic Intent Routing (< 1ms)
    const intentStart = performance.now();
    const routing = routeIntent(query, resolvedLoc.isComparison, memory);
    const intentTime = Math.round(performance.now() - intentStart);

    const primaryLoc = resolvedLoc.primaryLocation;
    const secLoc = resolvedLoc.secondaryLocation;
    const locKey = `${primaryLoc.latitude?.toFixed(2)}:${primaryLoc.longitude?.toFixed(2)}:${primaryLoc.name}`;

    // 3. Fast In-Memory Cache Check
    const cacheKey = `ans:${routing.intent}:${locKey}:${query.trim().toLowerCase()}`;
    const cachedResult = requestCache.get<OrchestratorResult>(cacheKey);
    if (cachedResult) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AskMAUSAM:CacheHit] ${query} -> 0ms`);
      }
      return cachedResult;
    }

    // Wrap in deduplication to prevent redundant concurrent fetches
    return requestDeduper.dedupe(cacheKey, async () => {
      // 4. HARD GENERAL-QUESTION GATE & LOCAL KNOWLEDGE (ZERO external network calls)
      const isGeneralOrKnowledge =
        routing.isGeneralKnowledge ||
        routing.intent === 'GENERAL_KNOWLEDGE' ||
        routing.intent === 'ABOUT_MAUSAM' ||
        routing.intent === 'ABOUT_DEVELOPER' ||
        routing.intent === 'HELP' ||
        routing.intent === 'GREETING' ||
        routing.intent === 'CLARIFICATION' ||
        routing.intent === 'GENERAL_MAUSAM_INFORMATION' ||
        routing.requiredTools.length === 0;

      if (isGeneralOrKnowledge && routing.requiredTools.length === 0) {
        const knowledgeEntry = findKnowledge(query);
        let title = 'About MAUSAM Platform';
        let summary =
          'MAUSAM is a meteorological and atmospheric information platform designed to provide weather observations, forecasts, warnings, air-quality information, radar/map data, and agrometeorological information for locations across India.';
        let bullets = [
          'Real-time atmospheric observations (temperature, humidity, wind, pressure, cloud cover)',
          '7-day numerical forecasts and precipitation probability',
          'Official color-coded early warnings (Red, Orange, Yellow)',
          'National AQI and particulate matter (PM2.5 / PM10) monitoring',
          'Doppler Weather Radar (DWR) composite reflectivity',
          'Agrometeorological advisories and coastal marine conditions',
        ];
        let markdown = '';
        let followUps = [
          'What weather data can you provide?',
          'Show current weather for Odisha',
          'Are there active warnings?',
          'Show the 7-day forecast',
        ];

        if (routing.intent === 'ABOUT_DEVELOPER') {
          title = DEVELOPER_KNOWLEDGE.title;
          summary = DEVELOPER_KNOWLEDGE.summary;
          bullets = DEVELOPER_KNOWLEDGE.bullets;
          markdown = DEVELOPER_KNOWLEDGE.markdown;
          followUps = DEVELOPER_KNOWLEDGE.suggestedFollowUps;
        } else if (routing.intent === 'ABOUT_MAUSAM') {
          const overview = MAUSAM_PLATFORM_OVERVIEW;
          title = overview.title;
          summary = overview.summary;
          bullets = overview.bullets;
          markdown = overview.markdown;
          followUps = overview.suggestedFollowUps;
        } else if (routing.intent === 'HELP') {
          const caps = MAUSAM_CAPABILITIES;
          title = caps.title;
          summary = caps.summary;
          bullets = caps.bullets;
          markdown = caps.markdown;
          followUps = caps.suggestedFollowUps;
        } else if (knowledgeEntry) {
          title = knowledgeEntry.title;
          summary = knowledgeEntry.summary;
          bullets = knowledgeEntry.bullets;
          markdown = knowledgeEntry.markdown;
          followUps = knowledgeEntry.suggestedFollowUps;
        } else if (routing.intent === 'GREETING') {
          title = 'Namaste & Welcome to Ask MAUSAM';
          summary =
            'I am your National Meteorological Assistant, providing verified atmospheric observations, warnings, and forecasts across India.';
          markdown = `### Welcome to Ask MAUSAM\n\nI am **Ask MAUSAM**, India's Atmospheric Intelligence Assistant. You can ask me about:\n- **Current Weather**: Temperature, humidity, wind, and sky condition for any Indian city.\n- **Forecasts**: 7-day predictions and rain probabilities.\n- **Official Warnings**: Color-coded disaster alerts (Red, Orange, Yellow).\n- **Air Quality (AQI)**: Live PM2.5 and PM10 pollution levels.\n- **Radar & Marine**: Doppler weather radar reflectivity and coastal sea state.\n\n*How can I help you today?*`;
          bullets = ['36 States & UTs Covered', 'Official IMD / NDMA Bulletins', 'Real-time Telemetry'];
          followUps = [
            'What is MAUSAM?',
            'Show current weather for Odisha',
            'Are there active warnings?',
            'What is the AQI in Bhubaneswar?',
          ];
        } else {
          const overview = MAUSAM_PLATFORM_OVERVIEW;
          title = overview.title;
          summary = overview.summary;
          bullets = overview.bullets;
          markdown = overview.markdown;
          followUps = overview.suggestedFollowUps;
        }

        const totalMs = Math.round(performance.now() - startTime);

        const response: AskMausamResponse = {
          answer: markdown || summary,
          location: '',
          intent: routing.intent,
          responseType: 'knowledge',
          knowledge: {
            title,
            summary,
            bullets,
            category:
              knowledgeEntry?.category ||
              (routing.intent === 'ABOUT_DEVELOPER' ? 'ABOUT' : 'MAUSAM'),
          },
          facts: bullets.map((b) => ({ label: title, value: b })),
          sourceStatus: 'LIVE',
          suggestedFollowUps: followUps,
          debug: {
            query,
            intent: routing.intent,
            location: 'None (Knowledge Query)',
            locationIsContextOnly: true,
            providers: [],
            fastPath: 'LOCAL_KNOWLEDGE',
            latencyMs: totalMs,
          },
        };

        assertResponseMatchesIntent(response, routing.intent);

        const emptyContext: AskMausamContext = {
          location: {
            name: 'India',
            country: 'India',
            latitude: 20.5937,
            longitude: 78.9629,
            timezone: 'Asia/Kolkata',
          },
          sources: [
            {
              provider: 'MAUSAM Canonical Knowledge Base',
              status: 'LIVE',
              retrievedAt: new Date().toISOString(),
            },
          ],
          contextVersion: `v1.${Date.now()}`,
        };

        const res: OrchestratorResult = {
          context: emptyContext,
          response,
          timingMs: { locationMs: locTime, providersMs: 0, aiMs: 0, totalMs },
        };
        requestCache.set(cacheKey, res, CACHE_TTLS.ANSWER_RESULT);
        return res;
      }

      // 5. Multi-Location Comparison Execution
      if (resolvedLoc.isComparison && secLoc) {
        const providersStart = performance.now();
        const [weatherA, weatherB, aqiA, aqiB] = await Promise.all([
          withTimeout(OpenMeteoProvider.getWeather(primaryLoc.latitude, primaryLoc.longitude, false), TIMEOUT_CONFIG.WEATHER, { current: null, daily: [], status: 'UNAVAILABLE' }),
          withTimeout(OpenMeteoProvider.getWeather(secLoc.latitude, secLoc.longitude, false), TIMEOUT_CONFIG.WEATHER, { current: null, daily: [], status: 'UNAVAILABLE' }),
          withTimeout(CpcbAirQualityProvider.getAirQuality(primaryLoc.latitude, primaryLoc.longitude, primaryLoc.district || primaryLoc.name), TIMEOUT_CONFIG.AQI, null),
          withTimeout(CpcbAirQualityProvider.getAirQuality(secLoc.latitude, secLoc.longitude, secLoc.district || secLoc.name), TIMEOUT_CONFIG.AQI, null),
        ]);

        const tempA = weatherA?.current?.temperatureC ?? 0;
        const tempB = weatherB?.current?.temperatureC ?? 0;
        const rainA = weatherA?.current?.precipitationMm ?? 0;
        const rainB = weatherB?.current?.precipitationMm ?? 0;

        let summary = '';
        let winnerLabel = '';
        const qLower = query.toLowerCase();

        if (qLower.includes('cooler') || qLower.includes('cold') || qLower.includes('ठंडा')) {
          if (tempA < tempB) {
            winnerLabel = `${primaryLoc.name} is cooler (${tempA}°C vs ${tempB}°C)`;
            summary = `${primaryLoc.name} is currently cooler at ${tempA}°C (${weatherA?.current?.condition || 'Observed'}), compared to ${secLoc.name} at ${tempB}°C (${weatherB?.current?.condition || 'Observed'}).`;
          } else if (tempB < tempA) {
            winnerLabel = `${secLoc.name} is cooler (${tempB}°C vs ${tempA}°C)`;
            summary = `${secLoc.name} is currently cooler at ${tempB}°C (${weatherB?.current?.condition || 'Observed'}), compared to ${primaryLoc.name} at ${tempA}°C (${weatherA?.current?.condition || 'Observed'}).`;
          } else {
            winnerLabel = 'Equal Temperatures';
            summary = `Both ${primaryLoc.name} and ${secLoc.name} currently record an identical temperature of ${tempA}°C.`;
          }
        } else if (qLower.includes('hot') || qLower.includes('warmer') || qLower.includes('गर्म')) {
          if (tempA > tempB) {
            winnerLabel = `${primaryLoc.name} is warmer (${tempA}°C vs ${tempB}°C)`;
            summary = `${primaryLoc.name} is currently warmer at ${tempA}°C compared to ${secLoc.name} at ${tempB}°C.`;
          } else {
            winnerLabel = `${secLoc.name} is warmer (${tempB}°C vs ${tempA}°C)`;
            summary = `${secLoc.name} is currently warmer at ${tempB}°C compared to ${primaryLoc.name} at ${tempA}°C.`;
          }
        } else {
          summary = `Comparison between ${primaryLoc.name} and ${secLoc.name}: ${primaryLoc.name} is at ${tempA}°C (${weatherA?.current?.condition || 'Observed'}, AQI ${aqiA?.aqi ?? 'N/A'}), while ${secLoc.name} is at ${tempB}°C (${weatherB?.current?.condition || 'Observed'}, AQI ${aqiB?.aqi ?? 'N/A'}).`;
        }

        const comparison: LocationWeatherComparison = {
          locationA: {
            name: primaryLoc.name,
            state: primaryLoc.state,
            temperatureC: tempA,
            condition: weatherA?.current?.condition,
            rainMm: rainA,
            humidity: weatherA?.current?.relativeHumidity,
            aqi: aqiA?.aqi ?? undefined,
          },
          locationB: {
            name: secLoc.name,
            state: secLoc.state,
            temperatureC: tempB,
            condition: weatherB?.current?.condition,
            rainMm: rainB,
            humidity: weatherB?.current?.relativeHumidity,
            aqi: aqiB?.aqi ?? undefined,
          },
          summary,
          winnerLabel,
        };

        const nowIso = new Date().toISOString();
        const contextA: AskMausamContext = {
          location: primaryLoc,
          currentWeather: weatherA?.current ? {
            temperatureC: weatherA.current.temperatureC,
            feelsLikeC: weatherA.current.feelsLikeC,
            humidity: weatherA.current.relativeHumidity,
            windSpeedKmh: weatherA.current.windSpeedKmh,
            windDirection: weatherA.current.windDirection,
            precipitationMm: weatherA.current.precipitationMm,
            precipitationProbability: weatherA.current.precipitationProbability,
            weatherCode: weatherA.current.weatherCode,
            condition: weatherA.current.condition,
            pressureHpa: weatherA.current.pressureHpa,
            observedAt: weatherA.current.observedAt,
          } : undefined,
          aqi: aqiA?.aqi ? {
            index: aqiA.aqi,
            pm25: aqiA.pollutants.pm25,
            pm10: aqiA.pollutants.pm10,
            category: aqiA.category,
            source: aqiA.provider,
            status: 'AVAILABLE',
            observedAt: aqiA.observedAt,
          } : undefined,
          sources: [
            { provider: 'Open-Meteo', status: weatherA?.status || 'UNAVAILABLE', retrievedAt: nowIso },
            { provider: aqiA?.provider || 'CPCB', status: aqiA?.status || 'UNAVAILABLE', retrievedAt: nowIso },
          ],
          contextVersion: `comp.${Date.now()}`,
        };

        const compResponse: AskMausamResponse = {
          answer: summary,
          location: `${primaryLoc.name} vs ${secLoc.name}`,
          intent: 'MULTI_LOCATION_COMPARISON',
          facts: [
            { label: `${primaryLoc.name} Temp`, value: `${tempA}°C (${weatherA?.current?.condition || 'Observed'})` },
            { label: `${secLoc.name} Temp`, value: `${tempB}°C (${weatherB?.current?.condition || 'Observed'})` },
            { label: `${primaryLoc.name} AQI`, value: aqiA?.aqi ? `${aqiA.aqi} (${aqiA.category})` : 'N/A' },
            { label: `${secLoc.name} AQI`, value: aqiB?.aqi ? `${aqiB.aqi} (${aqiB.category})` : 'N/A' },
          ],
          sourceStatus: 'LIVE',
          observedAt: weatherA?.current?.observedAt,
          comparison,
          suggestedFollowUps: [
            `Show 7-day forecast for ${primaryLoc.name}`,
            `Show 7-day forecast for ${secLoc.name}`,
            `Check active warnings for ${primaryLoc.name}`,
          ],
        };

        const providersMs = Math.round(performance.now() - providersStart);
        const totalMs = Math.round(performance.now() - startTime);

        conversationMemory.update({
          location: primaryLoc,
          intent: 'MULTI_LOCATION_COMPARISON',
          timeframe: routing.timeframe,
        });

        const res: OrchestratorResult = {
          context: contextA,
          response: compResponse,
          timingMs: { locationMs: locTime, providersMs, aiMs: 0, totalMs },
        };

        requestCache.set(cacheKey, res, CACHE_TTLS.ANSWER_RESULT);
        return res;
      }

      // 6. STRICTLY PARALLEL FETCHING OF REQUIRED PROVIDERS ONLY
      const providersStart = performance.now();
      const tools = routing.requiredTools;
      const includeForecast = tools.includes('FORECAST') || routing.timeframe !== 'now';
      const isCoastal = isRegionCoastal(primaryLoc.state, primaryLoc.district, primaryLoc.name);

      // CRITICAL PERFORMANCE DIRECTIVE:
      // Only execute the exact promises requested by the intent!
      const weatherPromise = (tools.includes('WEATHER') || tools.includes('FORECAST') || tools.includes('AGRICULTURE'))
        ? withTimeout(OpenMeteoProvider.getWeather(primaryLoc.latitude, primaryLoc.longitude, includeForecast), TIMEOUT_CONFIG.WEATHER, { current: null, daily: [], status: 'UNAVAILABLE' }, 'Weather')
        : Promise.resolve({ current: null, daily: [], status: 'UNAVAILABLE' as const });

      const aqiPromise = tools.includes('AQI')
        ? withTimeout(CpcbAirQualityProvider.getAirQuality(primaryLoc.latitude, primaryLoc.longitude, primaryLoc.district || primaryLoc.name), TIMEOUT_CONFIG.AQI, null, 'AQI')
        : Promise.resolve(null);

      const warningsPromise = tools.includes('WARNINGS')
        ? withTimeout(Promise.resolve(getActiveWarningsForLocation(primaryLoc.state, primaryLoc.district, primaryLoc.name)), TIMEOUT_CONFIG.WARNINGS, { status: 'NO_ACTIVE_WARNINGS' as const, warnings: [], source: 'IMD', summaryText: 'No warnings active.' }, 'Warnings')
        : Promise.resolve({ status: 'NO_ACTIVE_WARNINGS' as const, warnings: [], source: 'IMD', summaryText: 'No warnings active.' });

      const marinePromise = (tools.includes('MARINE') && isCoastal)
        ? withTimeout(IncoisMarineProvider.getMarineData(primaryLoc.latitude, primaryLoc.longitude, primaryLoc.state, primaryLoc.district, primaryLoc.name), TIMEOUT_CONFIG.MARINE, null, 'Marine')
        : Promise.resolve(null);

      const [weatherRes, aqiRes, warningsRes, marineRes] = await Promise.all([
        weatherPromise,
        aqiPromise,
        warningsPromise,
        marinePromise,
      ]);

      const providersMs = Math.round(performance.now() - providersStart);

      // 7. Normalize into Canonical AskMausamContext
      const sources: DataSourceContext[] = [];
      const nowIso = new Date().toISOString();

      if (weatherRes?.current) {
        sources.push({
          provider: weatherRes.current.provider,
          status: weatherRes.status,
          retrievedAt: weatherRes.current.retrievedAt,
          observedAt: weatherRes.current.observedAt,
        });
      }

      if (aqiRes) {
        sources.push({
          provider: aqiRes.provider,
          status: aqiRes.status,
          retrievedAt: aqiRes.retrievedAt,
          observedAt: aqiRes.observedAt,
        });
      }

      if (tools.includes('WARNINGS') && warningsRes) {
        sources.push({
          provider: warningsRes.source || 'India Meteorological Department (IMD)',
          status: warningsRes.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'LIVE',
          retrievedAt: nowIso,
          isOfficialIMD: true,
          details: warningsRes.status === 'ACTIVE_WARNINGS' ? 'Active Severe Weather Advisory' : 'Normal / Routine Advisory',
        });
      }

      if (marineRes && marineRes.status !== 'NOT_APPLICABLE_INLAND') {
        sources.push({
          provider: marineRes.provider,
          status: marineRes.status as any,
          retrievedAt: marineRes.retrievedAt,
          observedAt: marineRes.observedAt,
        });
      }

      const curContext: CurrentWeatherContext | undefined = weatherRes?.current ? {
        temperatureC: weatherRes.current.temperatureC,
        feelsLikeC: weatherRes.current.feelsLikeC,
        humidity: weatherRes.current.relativeHumidity,
        windSpeedKmh: weatherRes.current.windSpeedKmh,
        windDirection: weatherRes.current.windDirection,
        precipitationMm: weatherRes.current.precipitationMm,
        precipitationProbability: weatherRes.current.precipitationProbability,
        weatherCode: weatherRes.current.weatherCode,
        condition: weatherRes.current.condition,
        isDay: weatherRes.current.isDay,
        pressureHpa: weatherRes.current.pressureHpa,
        visibilityKm: weatherRes.current.visibilityKm,
        uvIndex: weatherRes.current.uvIndex,
        observedAt: weatherRes.current.observedAt,
      } : undefined;

      const dailyContext: DailyForecastContext[] = (weatherRes?.daily || []).map((d) => ({
        date: d.date,
        dayName: d.dayName,
        maxTempC: d.tempMaxC,
        minTempC: d.tempMinC,
        precipitationMm: d.precipitationSumMm,
        precipitationProbability: d.precipitationProbability,
        condition: d.condition,
        weatherCode: d.weatherCode,
        windSpeedKmh: d.windSpeedMaxKmh,
        uvIndexMax: d.uvIndexMax,
      }));

      const canonicalContext: AskMausamContext = {
        location: primaryLoc,
        currentWeather: curContext,
        forecast: {
          daily: dailyContext,
          hourly: [],
        },
        warnings: warningsRes?.warnings || [],
        aqi: aqiRes && aqiRes.aqi !== null ? {
          index: aqiRes.aqi,
          pm25: aqiRes.pollutants.pm25,
          pm10: aqiRes.pollutants.pm10,
          category: aqiRes.category,
          dominantPollutant: (aqiRes.pollutants.pm25 ?? 0) > (aqiRes.pollutants.pm10 ?? 0) ? 'PM2.5' : 'PM10',
          observedAt: aqiRes.observedAt,
          source: aqiRes.provider,
          status: aqiRes.status === 'LIVE' ? 'AVAILABLE' : 'UNAVAILABLE',
        } : undefined,
        marine: marineRes && marineRes.isCoastal ? {
          waveHeightM: marineRes.waveHeightM,
          seaCondition: marineRes.seaCondition,
          coastalAdvisory: marineRes.coastalWarning,
        } : undefined,
        sources,
        contextVersion: `v3.${Date.now()}`,
      };

      // 8. FAST-PATH EXECUTION FOR PURE FACTUAL QUERIES (ZERO LLM LATENCY!)
      let fastResult: { markdown: string; summary: string; keyFacts: string[]; alertLevel: string } | null = null;
      let responseType: 'weather' | 'forecast' | 'warning' | 'aqi' | 'radar' | 'knowledge' = 'weather';
      let followUps: string[] = [
        `Show 7-day forecast for ${primaryLoc.name}`,
        `Check AQI observations for ${primaryLoc.name}`,
        `Check active warnings for ${primaryLoc.name}`,
      ];

      // Pure WARNING query: Instant generation from SACHET/IMD warning bulletins!
      if (routing.intent === 'WARNINGS') {
        const gen = ResponseGenerator.generateWarningResponse(canonicalContext);
        fastResult = gen;
        responseType = 'warning';
        followUps = [
          'Show warning details',
          `Show current weather for ${primaryLoc.name}`,
          `Show rainfall forecast for ${primaryLoc.name}`,
        ];
      } else if (
        routing.intent === 'CURRENT_WEATHER' ||
        routing.intent === 'TEMPERATURE' ||
        routing.intent === 'HUMIDITY' ||
        routing.intent === 'WIND' ||
        routing.intent === 'RAIN'
      ) {
        const gen = ResponseGenerator.generateWeatherResponse(canonicalContext);
        fastResult = gen;
        responseType = 'weather';
        followUps = [
          `Show the 7-day forecast for ${primaryLoc.name}`,
          `Any active warnings in ${primaryLoc.name}?`,
          `What is the AQI in ${primaryLoc.name}?`,
        ];
      } else if (routing.intent === 'FORECAST' || routing.intent === 'RAINFALL') {
        const gen = ResponseGenerator.generateForecastResponse(canonicalContext, routing.timeframe);
        fastResult = gen;
        responseType = 'forecast';
        followUps = [
          `Will it rain tomorrow in ${primaryLoc.name}?`,
          `Current weather in ${primaryLoc.name}`,
          `Any rainfall warnings in ${primaryLoc.name}?`,
        ];
      } else if (routing.intent === 'AQI' || routing.intent === 'AIR_QUALITY') {
        const gen = ResponseGenerator.generateAqiResponse(canonicalContext);
        fastResult = gen;
        responseType = 'aqi';
        followUps = [
          'What is AQI?',
          `Show current weather for ${primaryLoc.name}`,
          `Are there active warnings in ${primaryLoc.name}?`,
        ];
      } else if (routing.intent === 'RADAR') {
        const gen = ResponseGenerator.generateRadarResponse(canonicalContext);
        fastResult = gen;
        responseType = 'radar';
        followUps = [
          'What is radar?',
          `Show current weather for ${primaryLoc.name}`,
          `Are there active warnings in ${primaryLoc.name}?`,
        ];
      } else if (routing.intent === 'MULTI_INTENT') {
        const gen = ResponseGenerator.generateMultiIntentResponse(canonicalContext, query);
        fastResult = gen;
        responseType = 'weather';
        followUps = [
          `Show 7-day forecast for ${primaryLoc.name}`,
          `Are there active warnings in ${primaryLoc.name}?`,
        ];
      }

      if (fastResult) {
        const facts = fastResult.keyFacts.map((kf) => {
          const parts = kf.split(': ');
          return { label: parts[0] || 'Fact', value: parts[1] || parts[0] };
        });

        const totalMs = Math.round(performance.now() - startTime);

        const fastResponse: AskMausamResponse = {
          answer: fastResult.markdown,
          location: primaryLoc.name,
          intent: routing.intent,
          responseType,
          timeframe: routing.timeframe,
          facts,
          warnings: (canonicalContext.warnings || []).map((w) => `${w.severity.toUpperCase()}: ${w.headline || w.hazard}`),
          sourceStatus: 'LIVE',
          observedAt: curContext?.observedAt || nowIso,
          suggestedFollowUps: followUps,
          debug: {
            query,
            intent: routing.intent,
            location: resolvedLoc.resolutionType === 'EXPLICIT_QUERY' ? primaryLoc.name : `${primaryLoc.name} (context only)`,
            locationIsContextOnly: resolvedLoc.resolutionType !== 'EXPLICIT_QUERY',
            providers:
              routing.intent === 'WARNINGS'
                ? ['SACHET/NDMA']
                : routing.intent === 'AQI'
                ? ['CPCB']
                : routing.intent === 'RADAR'
                ? ['DWR']
                : ['Open-Meteo'],
            fastPath:
              routing.intent === 'WARNINGS'
                ? 'OFFICIAL_WARNING'
                : routing.intent === 'AQI'
                ? 'AQI_OBSERVATION'
                : routing.intent === 'RADAR'
                ? 'RADAR_IMAGERY'
                : routing.intent === 'FORECAST'
                ? 'FORECAST_PROJECTION'
                : 'WEATHER_FAST_PATH',
            latencyMs: totalMs,
          },
        };

        assertResponseMatchesIntent(fastResponse, routing.intent);

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AskMAUSAM:FastPath] ${query} -> Intent: ${routing.intent} | Providers: ${providersMs}ms | TOTAL: ${totalMs}ms`);
        }

        conversationMemory.update({
          location: primaryLoc,
          intent: routing.intent,
          timeframe: routing.timeframe,
        });

        const res: OrchestratorResult = {
          context: canonicalContext,
          response: fastResponse,
          timingMs: { locationMs: locTime, providersMs, aiMs: 0, totalMs },
        };

        requestCache.set(cacheKey, res, CACHE_TTLS.ANSWER_RESULT);
        return res;
      }

      // 9. CONVERSATIONAL / ANALYTICAL QUERY: Call Gemini with Minimal Payload
      const aiStart = performance.now();
      let aiCandidate: Partial<AskMausamResponse> | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_CONFIG.LLM);

        if (signal) {
          signal.addEventListener('abort', () => controller.abort());
        }

        const res = await fetch('/api/ai?mode=ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            prompt: query,
            intent: routing.intent,
            timeframe: routing.timeframe,
            preferredLanguage,
            canonicalContext,
            location: {
              city: primaryLoc.name,
              state: primaryLoc.state,
              district: primaryLoc.district,
              latitude: primaryLoc.latitude,
              longitude: primaryLoc.longitude,
            },
            observation: {
              temperatureC: curContext?.temperatureC,
              feelsLikeC: curContext?.feelsLikeC,
              condition: curContext?.condition,
              relativeHumidity: curContext?.humidity,
              windSpeedKmh: curContext?.windSpeedKmh,
              windDirection: curContext?.windDirection,
              precipitationProbability: curContext?.precipitationProbability,
            },
            airQuality: {
              aqi: canonicalContext.aqi?.index,
              category: canonicalContext.aqi?.category,
            },
            warnings: canonicalContext.warnings,
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.response) {
            aiCandidate = {
              answer: data.response,
              location: primaryLoc.name,
              intent: routing.intent,
              timeframe: routing.timeframe,
              facts: data.facts,
              warnings: data.warnings,
              groundingSources: data.groundingSources,
            };
          }
        }
      } catch {
        aiCandidate = null;
      }

      const aiMs = Math.round(performance.now() - aiStart);

      // 10. Validate Grounding & Contradictions
      const report = validateAndEnforceGrounding(aiCandidate, canonicalContext, routing.intent);
      assertResponseMatchesIntent(report.validatedResponse, routing.intent);

      // 11. Update Conversation Memory
      conversationMemory.update({
        location: primaryLoc,
        intent: routing.intent,
        timeframe: routing.timeframe,
      });

      const totalMs = Math.round(performance.now() - startTime);

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AskMAUSAM:LLM] ${query} -> Intent: ${routing.intent} | Providers: ${providersMs}ms | AI: ${aiMs}ms | TOTAL: ${totalMs}ms`);
      }

      const finalResult: OrchestratorResult = {
        context: canonicalContext,
        response: report.validatedResponse,
        timingMs: { locationMs: locTime, providersMs, aiMs, totalMs },
      };

      requestCache.set(cacheKey, finalResult, CACHE_TTLS.ANSWER_RESULT);
      return finalResult;
    });
  }

  /**
   * Clears the in-memory orchestrator cache
   */
  public static clearCache(): void {
    requestCache.clear();
    requestDeduper.clear();
  }
}

export const orchestrateAskMausam = AskMausamOrchestrator.execute;
export default AskMausamOrchestrator;
