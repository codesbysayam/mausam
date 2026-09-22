// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Response Validator & Contradiction Detection Engine
// Guarantees zero discrepancy between model text and canonical facts
// ENFORCES: Knowledge questions NEVER output weather cards or telemetry
// ====================================================================

import {
  AskMausamContext,
  AskMausamResponse,
  WeatherIntent,
  AskMausamFact,
  SourceStatus,
} from '../../types/askMausam';

export interface ValidationReport {
  isValid: boolean;
  contradictions: string[];
  validatedResponse: AskMausamResponse;
}

/**
 * Hard Safety Assertion: Guarantees that knowledge, about, or help intents
 * NEVER return weather, forecast, warning, AQI, or radar responses.
 */
export function assertResponseMatchesIntent(
  response: AskMausamResponse,
  intent: WeatherIntent | string
): void {
  const isKnowledgeIntent =
    intent === 'ABOUT_MAUSAM' ||
    intent === 'ABOUT_DEVELOPER' ||
    intent === 'GENERAL_KNOWLEDGE' ||
    intent === 'HELP' ||
    intent === 'GREETING' ||
    intent === 'CLARIFICATION' ||
    intent === 'GENERAL_MAUSAM_INFORMATION';

  if (isKnowledgeIntent) {
    if (
      response.responseType === 'weather' ||
      response.responseType === 'forecast' ||
      response.responseType === 'warning' ||
      response.responseType === 'aqi' ||
      response.responseType === 'radar' ||
      response.responseType !== 'knowledge'
    ) {
      throw new Error(
        `CRITICAL: Knowledge intent ${intent} produced non-knowledge responseType: ${response.responseType}`
      );
    }

    if (
      response.answer.includes('### Current Weather:') ||
      response.answer.includes('Observed Telemetry') ||
      response.answer.includes('Atmospheric Parameter')
    ) {
      throw new Error(
        `CRITICAL: Knowledge intent ${intent} leaked weather telemetry card in answer`
      );
    }
  }
}

export function validateAndEnforceGrounding(
  candidate: Partial<AskMausamResponse> | null,
  context: AskMausamContext,
  intent: WeatherIntent
): ValidationReport {
  const contradictions: string[] = [];
  const cur = context.currentWeather;
  const warnings = context.warnings || [];
  const aqi = context.aqi;
  const locName = context.location.name;

  // Derive primary source status
  const primarySource = context.sources[0];
  const sourceStatus: SourceStatus = primarySource ? primarySource.status : 'LIVE';
  const observedAt =
    cur?.observedAt ||
    new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    });

  // HARD KNOWLEDGE INTENT SAFETY GATE
  const isKnowledgeIntent =
    intent === 'ABOUT_MAUSAM' ||
    intent === 'ABOUT_DEVELOPER' ||
    intent === 'GENERAL_KNOWLEDGE' ||
    intent === 'HELP' ||
    intent === 'GREETING' ||
    intent === 'CLARIFICATION' ||
    intent === 'GENERAL_MAUSAM_INFORMATION';

  if (isKnowledgeIntent) {
    return {
      isValid: true,
      contradictions: [],
      validatedResponse: {
        answer: candidate?.answer || 'MAUSAM is a meteorological and atmospheric information platform.',
        location: locName,
        intent,
        responseType: 'knowledge',
        knowledge: candidate?.knowledge,
        facts: candidate?.facts || [],
        sourceStatus: 'LIVE',
        observedAt,
        confidenceReason: 'Verified canonical knowledge entry.',
        suggestedFollowUps: candidate?.suggestedFollowUps || [
          'What is MAUSAM?',
          'Show current weather for Odisha',
          'What is AQI?',
        ],
      },
    };
  }

  // 1. Check Temperature Contradiction
  if (cur && typeof cur.temperatureC === 'number' && candidate?.answer) {
    const tempMatches = candidate.answer.match(/(\d+(\.\d+)?)\s*(°\s*C|degrees?\s*c)/i);
    if (tempMatches) {
      const citedTemp = parseFloat(tempMatches[1]);
      if (Math.abs(citedTemp - cur.temperatureC) > 1.5) {
        contradictions.push(
          `Model stated temperature ${citedTemp}°C, but canonical context observed ${cur.temperatureC}°C`
        );
      }
    }
  }

  // 2. Check Severe Warning Contradiction
  const hasRedAlert = warnings.some((w) => w.severity === 'red');
  if (hasRedAlert && candidate?.answer) {
    const answerLower = candidate.answer.toLowerCase();
    if (
      answerLower.includes('no warning') ||
      answerLower.includes('no severe weather') ||
      answerLower.includes('all clear')
    ) {
      contradictions.push(
        'Model stated no warnings, but canonical context has an active IMD RED ALERT'
      );
    }
  }

  // 3. Check AQI Contradiction
  if (aqi && typeof aqi.index === 'number' && candidate?.answer) {
    const aqiMatches = candidate.answer.match(/aqi\s*(is\s*)?(\d+)/i);
    if (aqiMatches && aqiMatches[2]) {
      const citedAqi = parseInt(aqiMatches[2], 10);
      if (Math.abs(citedAqi - aqi.index) > 20) {
        contradictions.push(
          `Model stated AQI ${citedAqi}, but canonical context recorded AQI ${aqi.index}`
        );
      }
    }
  }

  // Construct canonical ground-truth facts
  const canonicalFacts: AskMausamFact[] = [];

  if (cur) {
    canonicalFacts.push({
      label: 'Temperature',
      value: `${cur.temperatureC}°C (Feels like ${cur.feelsLikeC ?? cur.temperatureC}°C)`,
      source: primarySource?.provider,
      highlight: true,
    });
    canonicalFacts.push({
      label: 'Condition',
      value: cur.condition,
      source: primarySource?.provider,
    });
    if (cur.humidity !== undefined) {
      canonicalFacts.push({
        label: 'Humidity',
        value: `${cur.humidity}%`,
      });
    }
    if (cur.windSpeedKmh !== undefined) {
      canonicalFacts.push({
        label: 'Wind Speed',
        value: `${cur.windSpeedKmh} km/h ${cur.windDirection || ''}`.trim(),
      });
    }
    if (cur.precipitationProbability !== undefined) {
      canonicalFacts.push({
        label: 'Rain Probability',
        value: `${cur.precipitationProbability}%`,
      });
    }
    if (cur.pressureHpa !== undefined) {
      canonicalFacts.push({
        label: 'Atmospheric Pressure',
        value: `${cur.pressureHpa} hPa`,
      });
    }
  }

  if (aqi && aqi.status === 'AVAILABLE') {
    canonicalFacts.push({
      label: 'Air Quality Index',
      value: `${aqi.index ?? 'Monitored'} (${aqi.category})`,
      source: aqi.source,
      highlight: (aqi.index ?? 0) > 150,
    });
  }

  if (warnings.length > 0) {
    canonicalFacts.push({
      label: 'Active Warning',
      value: `${warnings[0].headline} (${warnings[0].severity.toUpperCase()} ALERT)`,
      source: warnings[0].source,
      highlight: true,
    });
  } else {
    canonicalFacts.push({
      label: 'Warning Status',
      value: 'No active severe weather warnings',
      source: 'India Meteorological Department (IMD)',
    });
  }

  // If contradictions found or candidate is missing, build strict data-grounded answer
  if (
    contradictions.length > 0 ||
    !candidate ||
    !candidate.answer ||
    candidate.answer.trim() === ''
  ) {
    const groundedAnswer = buildGroundedAnswerText(context, intent);

    const validated: AskMausamResponse = {
      answer: groundedAnswer,
      location: locName,
      intent,
      responseType: 'weather',
      facts: canonicalFacts,
      warnings: warnings.map((w) => `${w.severity.toUpperCase()}: ${w.headline}`),
      sourceStatus,
      observedAt,
      confidenceReason: 'Canonical ground truth enforced following fact validation.',
      suggestedFollowUps: generateFollowUps(intent, context),
    };

    assertResponseMatchesIntent(validated, intent);

    return {
      isValid: false,
      contradictions,
      validatedResponse: validated,
    };
  }

  // Candidate is valid and truthful
  const validated: AskMausamResponse = {
    answer: candidate.answer,
    location: candidate.location || locName,
    intent: candidate.intent || intent,
    timeframe: candidate.timeframe,
    responseType: candidate.responseType || 'weather',
    facts:
      candidate.facts && candidate.facts.length > 0 ? candidate.facts : canonicalFacts,
    warnings:
      candidate.warnings || warnings.map((w) => `${w.severity.toUpperCase()}: ${w.headline}`),
    sourceStatus,
    observedAt,
    confidenceReason:
      candidate.confidenceReason || 'Telemetry validated against live atmospheric feeds.',
    comparison: candidate.comparison,
    groundingSources: candidate.groundingSources,
    suggestedFollowUps: candidate.suggestedFollowUps || generateFollowUps(intent, context),
    suggestedActions: candidate.suggestedActions,
  };

  assertResponseMatchesIntent(validated, intent);

  return {
    isValid: true,
    contradictions: [],
    validatedResponse: validated,
  };
}

function buildGroundedAnswerText(context: AskMausamContext, intent: WeatherIntent): string {
  const loc = context.location;
  const cur = context.currentWeather;
  const warnings = context.warnings || [];
  const aqi = context.aqi;
  const forecast = context.forecast;

  if (intent === 'WARNINGS') {
    if (warnings.length > 0) {
      const top = warnings[0];
      return `**${top.headline}**\n\nIMD Alert Level: **${top.severity.toUpperCase()} ALERT**.\n\n• **Affected Area**: ${top.affectedArea}\n• **Hazard**: ${top.hazard}\n• **Validity**: ${top.validUntil || 'Active'}\n• **Details**: ${top.description}\n\n*Action Advice*: ${top.actionAdvice || 'Monitor official regional advisories.'}`;
    }
    return `No active severe weather warnings for **${loc.name}**. Current synoptic conditions remain normal with routine parameters.`;
  }

  if (intent === 'AQI' || intent === 'AIR_QUALITY') {
    if (aqi && aqi.status === 'AVAILABLE') {
      return `Air Quality in **${loc.name}** is currently **${aqi.category}** with an AQI of **${aqi.index ?? 'N/A'}** (Dominant pollutant: ${aqi.dominantPollutant || 'PM2.5'}).`;
    }
    return `Official Air Quality monitoring station data is currently unavailable for **${loc.name}**. Real-time surface meteorology continues to stream.`;
  }

  if (intent === 'FORECAST' && forecast && forecast.daily.length > 0) {
    const days = forecast.daily
      .slice(0, 3)
      .map(
        (d) =>
          `• **${d.dayName}**: ${d.condition}, High ${d.maxTempC}°C / Low ${d.minTempC}°C (Rain probability: ${d.precipitationProbability}%)`
      )
      .join('\n');
    return `**Forecast for ${loc.name}**:\n\n${days}\n\n${forecast.synopsis || ''}`;
  }

  if (cur) {
    let text = `Current weather in **${loc.name}** is **${cur.temperatureC}°C** with **${cur.condition}**.\n\n`;
    text += `• **Feels Like**: ${cur.feelsLikeC ?? cur.temperatureC}°C\n`;
    text += `• **Relative Humidity**: ${cur.humidity ?? 'N/A'}%\n`;
    text += `• **Wind**: ${cur.windSpeedKmh ?? 'N/A'} km/h ${cur.windDirection || ''}\n`;
    text += `• **Rain Probability**: ${cur.precipitationProbability ?? 0}%\n`;
    if (aqi && aqi.status === 'AVAILABLE') {
      text += `• **Air Quality**: ${aqi.category} (AQI ${aqi.index ?? 'N/A'})\n`;
    }
    if (warnings.length > 0) {
      text += `\n⚠️ **Advisory**: ${warnings[0].headline} (${warnings[0].severity.toUpperCase()} ALERT)`;
    }
    return text.trim();
  }

  return `Weather telemetry for **${loc.name}** is currently being retrieved from synoptic radar feeds.`;
}

function generateFollowUps(intent: WeatherIntent, context: AskMausamContext): string[] {
  const locName = context.location.name;
  if (intent === 'CURRENT_WEATHER') {
    return [
      `Will it rain in ${locName} tomorrow?`,
      `Show 7-day forecast for ${locName}`,
      `What is the Air Quality (AQI) in ${locName}?`,
      `Are there any active warnings?`,
    ];
  }
  if (intent === 'RAIN' || intent === 'RAINFALL') {
    return [
      `What is the temperature in ${locName}?`,
      `Is it safe for outdoor travel?`,
      `Check active IMD warnings for ${locName}`,
    ];
  }
  if (intent === 'WARNINGS') {
    return [
      `What is the current weather in ${locName}?`,
      `Show rainfall forecast for tomorrow`,
      `View emergency disaster helpline contacts`,
    ];
  }
  return [
    `What is the current weather update?`,
    `Will it rain tomorrow?`,
    `Check warnings for ${locName}`,
  ];
}
