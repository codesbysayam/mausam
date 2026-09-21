// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Deterministic Meteorological Intent Router
// Enforces selective provider invocation: NEVER fetch unrelated data
// Hierarchical Intent Classification:
// GREETING > ABOUT_MAUSAM / GENERAL_KNOWLEDGE > HELP > LOCATION >
// WARNING > FORECAST > CURRENT_WEATHER > AQI > RAINFALL > RADAR >
// MARINE > AGRICULTURE > GENERAL
// ====================================================================

import { WeatherIntent, Timeframe, ConversationMemoryState } from '../../types/askMausam';
import { findKnowledge } from './mausamKnowledge';

export type RequiredTool = 'WEATHER' | 'FORECAST' | 'WARNINGS' | 'AQI' | 'AGRICULTURE' | 'MARINE' | 'RADAR';

export interface IntentRoutingResult {
  intent: WeatherIntent;
  timeframe: Timeframe;
  requiredTools: RequiredTool[];
  confidence: number;
  fastPathEligible: boolean;
  isGeneralKnowledge?: boolean;
}

export function detectTimeframe(query: string): Timeframe {
  const q = query.toLowerCase();
  if (q.includes('tomorrow morning') || q.includes('कल सुबह')) return 'tomorrow_morning';
  if (q.includes('tomorrow evening') || q.includes('tomorrow night') || q.includes('कल शाम') || q.includes('कल रात')) return 'tomorrow_evening';
  if (q.includes('tomorrow') || q.includes('कल')) return 'tomorrow';
  if (q.includes('tonight') || q.includes('आज रात')) return 'tonight';
  if (q.includes('weekend') || q.includes('saturday') || q.includes('sunday') || q.includes('शनिवार') || q.includes('रविवार')) return 'this_weekend';
  if (q.includes('next 3 days') || q.includes('3 days') || q.includes('three days') || q.includes('अगले 3 दिन')) return 'next_3_days';
  if (q.includes('next 7 days') || q.includes('7 day') || q.includes('7-day') || q.includes('week') || q.includes('weekly') || q.includes('अगले 7 दिन') || q.includes('सप्ताह')) return 'next_7_days';
  if (q.includes('today') || q.includes('आज')) return 'today';
  return 'now';
}

/**
 * Checks if a query is a general knowledge question about weather/platform concepts
 * that should NEVER trigger live external telemetry or weather APIs.
 */
function isConceptualOrGeneralQuery(q: string): boolean {
  const clean = q.trim().toLowerCase().replace(/[?!.,]/g, '');

  // Direct platform inquiries
  if (
    clean === 'what is mausam' ||
    clean === 'what does mausam do' ||
    clean === 'what can you do' ||
    clean === 'how does mausam work' ||
    clean === 'tell me about mausam' ||
    clean === 'explain mausam' ||
    clean === 'what is this platform' ||
    clean === 'what are the features of mausam' ||
    clean === 'what does mausam mean' ||
    clean === 'what information can you provide' ||
    clean === 'who are you' ||
    clean.includes('about mausam') ||
    clean.includes('what is mausam') ||
    clean.includes('explain mausam') ||
    clean.includes('what does mausam mean') ||
    clean.includes('what can you do')
  ) {
    return true;
  }

  // Check if findKnowledge matches directly
  if (findKnowledge(q) !== null) {
    return true;
  }

  // Conceptual definitions ("What is X", "Explain X", "How does X work", "Why is X")
  // Make sure there is NO specific location preposition like "in delhi", "in odisha", "for mumbai"
  const hasLocationSpecifier = /\b(in|for|at|near|of)\s+[a-z]{3,}\b/i.test(clean);

  if (!hasLocationSpecifier) {
    // AQI concepts
    if (
      clean === 'what is aqi' ||
      clean === 'what does aqi mean' ||
      clean === 'explain aqi' ||
      clean === 'what is air quality index' ||
      clean.startsWith('what is aqi') ||
      clean.startsWith('explain aqi')
    ) {
      return true;
    }

    // Radar concepts
    if (
      clean === 'what is radar' ||
      clean === 'what is weather radar' ||
      clean === 'how does radar work' ||
      clean === 'how does weather radar work' ||
      clean === 'explain radar' ||
      clean.startsWith('how does radar') ||
      clean.startsWith('how does weather radar') ||
      clean.startsWith('what is radar')
    ) {
      return true;
    }

    // Warning concepts
    if (
      clean === 'explain weather warnings' ||
      clean === 'what are weather warnings' ||
      clean === 'what do warning colors mean' ||
      clean === 'what is red alert' ||
      clean === 'what is orange alert' ||
      clean.startsWith('explain weather warning')
    ) {
      return true;
    }

    // Rainfall / Monsoon concepts
    if (
      clean === 'what is rainfall' ||
      clean === 'why does it rain' ||
      clean === 'why is it raining' ||
      clean === 'explain monsoon' ||
      clean.startsWith('what is rainfall') ||
      clean.startsWith('explain monsoon') ||
      clean.startsWith('why does it rain')
    ) {
      return true;
    }

    // Humidity concepts
    if (
      clean === 'what is humidity' ||
      clean === 'why is humidity important' ||
      clean.startsWith('what is humidity') ||
      clean.startsWith('why is humidity')
    ) {
      return true;
    }

    // Agriculture concepts
    if (
      clean === 'what is agromet' ||
      clean === 'what is agrometeorology' ||
      clean.startsWith('what is agromet')
    ) {
      return true;
    }
  }

  return false;
}

export function routeIntent(
  query: string,
  isComparison = false,
  memory?: ConversationMemoryState
): IntentRoutingResult {
  const q = (query || '').trim().toLowerCase();
  const timeframe = detectTimeframe(q);
  const cleanQ = q.replace(/[?!.,]/g, '').trim();

  // ====================================================================
  // 1. GREETING
  // ====================================================================
  if (
    /^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening|नमस्ते|नमस्कार)\b/i.test(cleanQ) ||
    cleanQ === 'hello' ||
    cleanQ === 'hi' ||
    cleanQ === 'hey' ||
    cleanQ === 'namaste'
  ) {
    return {
      intent: 'GREETING',
      timeframe: 'now',
      requiredTools: [],
      confidence: 1.0,
      fastPathEligible: true,
      isGeneralKnowledge: true,
    };
  }

  // ====================================================================
  // 2. HARD GENERAL QUESTION GATE: ABOUT_MAUSAM / GENERAL_KNOWLEDGE / HELP
  // NEVER triggers weather, AQI, warning, radar, or forecast APIs!
  // ====================================================================
  if (isConceptualOrGeneralQuery(q)) {
    const isAboutMausam =
      cleanQ.includes('mausam') ||
      cleanQ.includes('platform') ||
      cleanQ === 'what is mausam' ||
      cleanQ === 'what does mausam do' ||
      cleanQ.startsWith('what is mausam');

    const isHelp =
      cleanQ.includes('what can you do') ||
      cleanQ.includes('features of mausam') ||
      cleanQ.includes('what information can you provide') ||
      cleanQ === 'help' ||
      cleanQ === 'what can you do' ||
      cleanQ === 'who are you';

    const intent: WeatherIntent = isHelp
      ? 'HELP'
      : isAboutMausam
      ? 'ABOUT_MAUSAM'
      : 'GENERAL_KNOWLEDGE';

    return {
      intent,
      timeframe: 'now',
      requiredTools: [],
      confidence: 1.0,
      fastPathEligible: true,
      isGeneralKnowledge: true,
    };
  }

  // ====================================================================
  // 3. MULTI-LOCATION COMPARISON (e.g. "Bhubaneswar or Cuttack", "Delhi vs Mumbai")
  // ====================================================================
  if (
    isComparison ||
    q.includes('compare') ||
    q.includes('which is cooler') ||
    q.includes('which is warmer') ||
    q.includes('which is hotter') ||
    q.includes('difference between') ||
    q.includes('तुलना') ||
    q.includes('ज्यादा ठंडा')
  ) {
    return {
      intent: 'MULTI_LOCATION_COMPARISON',
      timeframe,
      requiredTools: ['WEATHER', 'AQI'],
      confidence: 0.98,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 4. MULTI-INTENT QUERIES (e.g. "Weather in Odisha and AQI")
  // ====================================================================
  const asksWeather = /\b(weather|temperature|temp|rain|raining|climate|मौसम|तापमान)\b/i.test(q);
  const asksAqi = /\b(aqi|air quality|pollution|pm2\.5|pm10|smog|हवा की गुणवत्ता|प्रदूषण)\b/i.test(q);
  const asksWarning = /\b(warning|alert|cyclone|flood|hazard|चेतावनी|अलर्ट)\b/i.test(q);

  if (asksWeather && asksAqi) {
    return {
      intent: 'MULTI_INTENT',
      timeframe,
      requiredTools: ['WEATHER', 'AQI'],
      confidence: 0.98,
      fastPathEligible: true,
    };
  }

  if (asksWeather && asksWarning) {
    return {
      intent: 'MULTI_INTENT',
      timeframe,
      requiredTools: ['WEATHER', 'WARNINGS'],
      confidence: 0.98,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 5. OFFICIAL WARNINGS & DISASTER ALERTS
  // ====================================================================
  if (
    asksWarning ||
    q.includes('red alert') ||
    q.includes('orange alert') ||
    q.includes('yellow alert') ||
    q.includes('heavy rain warning') ||
    q.includes('rainfall warning') ||
    q.includes('तूफान') ||
    q.includes('बाढ़')
  ) {
    return {
      intent: 'WARNINGS',
      timeframe,
      requiredTools: ['WARNINGS'], // STRICTLY WARNINGS ONLY
      confidence: 0.98,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 6. FORECAST QUERIES (Tomorrow, 7-day, next 3 days, weekend, weekly)
  // ====================================================================
  if (
    q.includes('forecast') ||
    q.includes('7 day') ||
    q.includes('7-day') ||
    q.includes('weekly') ||
    q.includes('next week') ||
    timeframe === 'tomorrow' ||
    timeframe === 'tomorrow_morning' ||
    timeframe === 'tomorrow_evening' ||
    timeframe === 'next_3_days' ||
    timeframe === 'next_7_days' ||
    timeframe === 'this_weekend' ||
    q.includes('पूर्वानुमान')
  ) {
    return {
      intent: 'FORECAST',
      timeframe,
      requiredTools: ['FORECAST'],
      confidence: 0.96,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 7. AIR QUALITY & AQI (Grounded to location)
  // ====================================================================
  if (asksAqi) {
    return {
      intent: 'AQI',
      timeframe,
      requiredTools: ['AQI'], // STRICTLY AQI ONLY
      confidence: 0.98,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 8. RADAR & DOPPLER IMAGERY (e.g. "Show radar for Odisha")
  // ====================================================================
  if (
    q.includes('radar') ||
    q.includes('doppler') ||
    q.includes('dwr') ||
    q.includes('satellite') ||
    q.includes('रडार')
  ) {
    return {
      intent: 'RADAR',
      timeframe,
      requiredTools: ['RADAR'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 9. RAINFALL & PRECIPITATION
  // ====================================================================
  if (
    q.includes('rainfall') ||
    q.includes('precipitation') ||
    q.includes('downpour') ||
    q.includes('shower') ||
    q.includes('बारिश') ||
    q.includes('वर्षा') ||
    q.includes('बरसात') ||
    q.includes('बूंदाबांदी')
  ) {
    return {
      intent: timeframe === 'now' ? 'RAIN' : 'RAINFALL',
      timeframe,
      requiredTools: timeframe === 'now' ? ['WEATHER'] : ['WEATHER', 'FORECAST'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 10. MARINE & COASTAL
  // ====================================================================
  if (
    q.includes('marine') ||
    q.includes('sea') ||
    q.includes('wave') ||
    q.includes('tide') ||
    q.includes('fishermen') ||
    q.includes('coastal') ||
    q.includes('beach') ||
    q.includes('समुद्र') ||
    q.includes('तट')
  ) {
    return {
      intent: q.includes('tide') ? 'TIDE' : 'MARINE',
      timeframe,
      requiredTools: ['MARINE'],
      confidence: 0.92,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 11. AGRICULTURE & FARMING
  // ====================================================================
  if (
    q.includes('crop') ||
    q.includes('spray') ||
    q.includes('farm') ||
    q.includes('soil') ||
    q.includes('irrigation') ||
    q.includes('harvest') ||
    q.includes('pesticide') ||
    q.includes('agromet') ||
    q.includes('farmer') ||
    q.includes('खेती') ||
    q.includes('फसल') ||
    q.includes('कीटनाशक')
  ) {
    return {
      intent: q.includes('soil') ? 'SOIL' : 'AGRICULTURE',
      timeframe,
      requiredTools: ['WEATHER', 'AGRICULTURE'],
      confidence: 0.92,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 12. SPECIFIC WEATHER PARAMETERS (Temperature, Wind, Humidity)
  // ====================================================================
  if (
    q.includes('temperature') ||
    q.includes('temp') ||
    q.includes('hot') ||
    q.includes('cold') ||
    q.includes('warm') ||
    q.includes('तापमान') ||
    q.includes('गर्मी') ||
    q.includes('ठंड')
  ) {
    return {
      intent: 'TEMPERATURE',
      timeframe,
      requiredTools: ['WEATHER'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  if (q.includes('wind') || q.includes('breeze') || q.includes('gust') || q.includes('हवा')) {
    return {
      intent: 'WIND',
      timeframe,
      requiredTools: ['WEATHER'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  if (q.includes('humidity') || q.includes('humid') || q.includes('moisture') || q.includes('नमी')) {
    return {
      intent: 'HUMIDITY',
      timeframe,
      requiredTools: ['WEATHER'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  if (q.includes('is it raining') || q.includes('raining')) {
    return {
      intent: 'RAIN',
      timeframe: 'now',
      requiredTools: ['WEATHER'],
      confidence: 0.95,
      fastPathEligible: true,
    };
  }

  // ====================================================================
  // 13. CONVERSATIONAL FOLLOW-UP EVALUATION
  // ====================================================================
  if (
    q.startsWith('what about') ||
    q.startsWith('how about') ||
    q.startsWith('and ') ||
    q.startsWith('what of')
  ) {
    if (timeframe === 'tomorrow' || timeframe === 'next_7_days' || timeframe === 'next_3_days') {
      return {
        intent: 'FORECAST',
        timeframe,
        requiredTools: ['FORECAST'],
        confidence: 0.95,
        fastPathEligible: true,
      };
    }
    if (asksWarning) {
      return {
        intent: 'WARNINGS',
        timeframe,
        requiredTools: ['WARNINGS'],
        confidence: 0.95,
        fastPathEligible: true,
      };
    }
    if (asksAqi) {
      return {
        intent: 'AQI',
        timeframe,
        requiredTools: ['AQI'],
        confidence: 0.95,
        fastPathEligible: true,
      };
    }
  }

  // ====================================================================
  // 14. DEFAULT INTENT: CURRENT_WEATHER
  // (Only if asking a weather-related query or unspecified atmospheric state)
  // ====================================================================
  return {
    intent: 'CURRENT_WEATHER',
    timeframe,
    requiredTools: ['WEATHER'],
    confidence: 0.90,
    fastPathEligible: true,
  };
}

/**
 * Returns dynamic, intent-specific progress text to display in the UI
 * GENERAL questions: "Preparing an answer…"
 * WEATHER questions: "Checking current weather…"
 * FORECAST: "Preparing the forecast…"
 * WARNING: "Checking official warnings…"
 * AQI: "Checking air-quality observations…"
 * RADAR: "Loading radar data…"
 */
export function getIntentLoadingMessage(intent: WeatherIntent): string {
  switch (intent) {
    case 'GENERAL_KNOWLEDGE':
    case 'ABOUT_MAUSAM':
    case 'HELP':
    case 'GREETING':
    case 'GENERAL_MAUSAM_INFORMATION':
      return 'Preparing an answer…';
    case 'WARNINGS':
      return 'Checking official warnings…';
    case 'AQI':
    case 'AIR_QUALITY':
      return 'Checking air-quality observations…';
    case 'RADAR':
      return 'Loading radar data…';
    case 'FORECAST':
      return 'Preparing the forecast…';
    case 'RAIN':
    case 'RAINFALL':
      return 'Checking precipitation data…';
    case 'CURRENT_WEATHER':
    case 'TEMPERATURE':
    case 'HUMIDITY':
    case 'WIND':
      return 'Checking current weather…';
    case 'MULTI_INTENT':
      return 'Checking atmospheric & environmental telemetry…';
    case 'MULTI_LOCATION_COMPARISON':
      return 'Comparing regional meteorological observations…';
    case 'MARINE':
    case 'TIDE':
      return 'Checking marine & coastal conditions…';
    case 'AGRICULTURE':
    case 'SOIL':
      return 'Checking agricultural advisories…';
    default:
      return 'Checking atmospheric observations…';
  }
}
