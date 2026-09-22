// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Deterministic Meteorological Intent Router
// Enforces selective provider invocation: NEVER fetch unrelated data
// Hierarchical Intent Classification:
// GREETING > ABOUT_DEVELOPER > ABOUT_MAUSAM > HELP > GENERAL_KNOWLEDGE >
// MULTI_LOCATION_COMPARISON > MULTI_INTENT > WARNING > FORECAST >
// AQI > RADAR > RAINFALL > MARINE > AGRICULTURE > CURRENT_WEATHER > CLARIFICATION
// ====================================================================

import { WeatherIntent, Timeframe, ConversationMemoryState } from '../../types/askMausam';
import { AskIntent, AskIntentResult } from './types';
import { normalizeQuestion } from './questionNormalizer';
import { findKnowledge } from './mausamKnowledge';

export type RequiredTool =
  | 'WEATHER'
  | 'FORECAST'
  | 'WARNINGS'
  | 'AQI'
  | 'AGRICULTURE'
  | 'MARINE'
  | 'RADAR';

export interface IntentRoutingResult {
  intent: WeatherIntent;
  timeframe: Timeframe;
  requiredTools: RequiredTool[];
  confidence: number;
  fastPathEligible: boolean;
  isGeneralKnowledge?: boolean;
  requiresLocation?: boolean;
  requiresProvider?: boolean;
  topic?: string;
}

export function detectTimeframe(query: string): Timeframe {
  const q = (query || '').toLowerCase();
  if (q.includes('tomorrow morning') || q.includes('कल सुबह')) return 'tomorrow_morning';
  if (
    q.includes('tomorrow evening') ||
    q.includes('tomorrow night') ||
    q.includes('कल शाम') ||
    q.includes('कल रात')
  )
    return 'tomorrow_evening';
  if (q.includes('tomorrow') || q.includes('कल')) return 'tomorrow';
  if (q.includes('tonight') || q.includes('आज रात')) return 'tonight';
  if (
    q.includes('weekend') ||
    q.includes('saturday') ||
    q.includes('sunday') ||
    q.includes('शनिवार') ||
    q.includes('रविवार')
  )
    return 'this_weekend';
  if (
    q.includes('next 3 days') ||
    q.includes('3 days') ||
    q.includes('three days') ||
    q.includes('अगले 3 दिन')
  )
    return 'next_3_days';
  if (
    q.includes('next 7 days') ||
    q.includes('7 day') ||
    q.includes('7-day') ||
    q.includes('week') ||
    q.includes('weekly') ||
    q.includes('अगले 7 दिन') ||
    q.includes('सप्ताह')
  )
    return 'next_7_days';
  if (q.includes('today') || q.includes('आज')) return 'today';
  return 'now';
}

/**
 * Section 2: Canonical Intent Classifier
 * Evaluates semantic patterns rather than naive keywords
 */
export function classifyIntent(query: string): AskIntentResult {
  const q = normalizeQuestion(query);
  const cleanQ = q.replace(/[?!.,]/g, '').trim();

  // 1. GREETING
  if (
    /^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening|नमस्ते|नमस्कार)[!. ]*$/i.test(
      cleanQ
    ) ||
    cleanQ === 'hello' ||
    cleanQ === 'hi' ||
    cleanQ === 'hey' ||
    cleanQ === 'namaste'
  ) {
    return {
      intent: 'GREETING',
      confidence: 1.0,
      requiresLocation: false,
      requiresProvider: false,
      entities: {},
    };
  }

  // 2. CHECK VERIFIED CANONICAL KNOWLEDGE BASE FIRST
  // Any query mapped to developer, platform, capabilities, or conceptual knowledge
  // MUST immediately return a non-weather intent with ZERO external network calls.
  const knowledge = findKnowledge(cleanQ);
  if (knowledge) {
    if (knowledge.id === 'about-developer') {
      return {
        intent: 'ABOUT_DEVELOPER',
        confidence: 1.0,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'developer' },
      };
    }
    if (knowledge.id === 'about-mausam') {
      return {
        intent: 'ABOUT_MAUSAM',
        confidence: 1.0,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'mausam' },
      };
    }
    if (knowledge.id === 'mausam-capabilities') {
      return {
        intent: 'HELP',
        confidence: 1.0,
        requiresLocation: false,
        requiresProvider: false,
        entities: {},
      };
    }
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 1.0,
      requiresLocation: false,
      requiresProvider: false,
      entities: { topic: knowledge.category.toLowerCase() },
    };
  }

  // 3. ABOUT_DEVELOPER (Semantic Pattern Fallback)
  if (
    /who\s+(developed|created|built|made|is\s+behind)\s+(this|mausam|the\s+platform|the\s+app)/i.test(
      cleanQ
    ) ||
    /who\s+(are\s+the\s+developers|is\s+the\s+developer|is\s+the\s+author)/i.test(cleanQ) ||
    /developers?\s+of\s+mausam/i.test(cleanQ) ||
    cleanQ === 'who developed this' ||
    cleanQ === 'who created this' ||
    cleanQ === 'who built this' ||
    cleanQ === 'who made this' ||
    cleanQ === 'who is the developer' ||
    cleanQ === 'who developed mausam' ||
    cleanQ === 'who created mausam' ||
    cleanQ === 'who built mausam' ||
    cleanQ === 'who made mausam' ||
    cleanQ === 'who is behind mausam'
  ) {
    return {
      intent: 'ABOUT_DEVELOPER',
      confidence: 1.0,
      requiresLocation: false,
      requiresProvider: false,
      entities: { topic: 'developer' },
    };
  }

  // 4. ABOUT_MAUSAM (Semantic Pattern Fallback)
  if (
    cleanQ === 'what is mausam' ||
    cleanQ === 'what does mausam do' ||
    cleanQ === 'tell me about mausam' ||
    cleanQ === 'what is this platform' ||
    cleanQ === 'what is this application' ||
    cleanQ === 'what can mausam do' ||
    cleanQ === 'how does mausam work' ||
    cleanQ === 'about mausam' ||
    cleanQ === 'what does mausam mean' ||
    /what\s+is\s+mausam/i.test(cleanQ) ||
    /what\s+does\s+mausam\s+do/i.test(cleanQ) ||
    /tell\s+me\s+about\s+mausam/i.test(cleanQ) ||
    /explain\s+mausam/i.test(cleanQ)
  ) {
    return {
      intent: 'ABOUT_MAUSAM',
      confidence: 1.0,
      requiresLocation: false,
      requiresProvider: false,
      entities: { topic: 'mausam' },
    };
  }

  // 5. HELP / CAPABILITIES (Semantic Pattern Fallback)
  if (
    cleanQ === 'what can you do' ||
    cleanQ === 'what can you ask' ||
    cleanQ === 'how can you help' ||
    cleanQ === 'help me' ||
    cleanQ === 'help' ||
    cleanQ === 'what are your features' ||
    cleanQ === 'what can i ask' ||
    cleanQ === 'who are you' ||
    /what\s+can\s+you\s+do/i.test(cleanQ) ||
    /what\s+are\s+the\s+features\s+of\s+mausam/i.test(cleanQ) ||
    /what\s+information\s+can\s+you\s+provide/i.test(cleanQ)
  ) {
    return {
      intent: 'HELP',
      confidence: 1.0,
      requiresLocation: false,
      requiresProvider: false,
      entities: {},
    };
  }

  // 6. BROAD CONCEPTUAL / EDUCATIONAL QUESTIONS (ZERO PROVIDERS)
  // If query starts with conceptual interrogatives and lacks a specific place name inquiry
  // ("in Delhi", "in Odisha"), it is GUARANTEED to be GENERAL_KNOWLEDGE.
  const hasPlaceName = /\b(in|at|for|near|around)\s+[a-z]{3,}\b/i.test(cleanQ);
  const isConceptualOpener =
    /^(what is|what are|what does|what do|what can|how is|how are|how does|how do|how can|why is|why are|why does|why do|explain|define|describe|meaning of|definition of)\b/i.test(
      cleanQ
    );

  if (isConceptualOpener && !hasPlaceName) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 0.95,
      requiresLocation: false,
      requiresProvider: false,
      entities: { topic: 'concept' },
    };
  }

  // Check Radar Concept
  if (/\b(radar|doppler|dwr)\b/i.test(cleanQ)) {
    if (
      /^(what is|how does|explain|define|how do)\b/i.test(cleanQ) &&
      !/\b(in|at|for|near|of)\s+[a-z]{3,}\b/i.test(cleanQ)
    ) {
      return {
        intent: 'GENERAL_KNOWLEDGE',
        confidence: 0.98,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'radar' },
      };
    }
  }

  // Check Warning Concept
  if (/\b(warning|warnings|alert|alerts|red alert|orange alert|yellow alert)\b/i.test(cleanQ)) {
    if (
      /^(what is|what are|explain|define|what do)\b/i.test(cleanQ) &&
      !/\b(in|at|for|near|of)\s+[a-z]{3,}\b/i.test(cleanQ)
    ) {
      return {
        intent: 'GENERAL_KNOWLEDGE',
        confidence: 0.98,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'warnings' },
      };
    }
  }

  // Check Rainfall / Rain Concept
  if (/\b(rainfall|rain|precipitation|monsoon)\b/i.test(cleanQ)) {
    if (
      /^(what is|why does|why is it|explain|define|how does rain)\b/i.test(cleanQ) &&
      !/\b(in|at|for|near|of)\s+[a-z]{3,}\b/i.test(cleanQ)
    ) {
      return {
        intent: 'GENERAL_KNOWLEDGE',
        confidence: 0.98,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: cleanQ.includes('monsoon') ? 'monsoon' : 'rainfall' },
      };
    }
  }

  // Check Humidity Concept
  if (/\b(humidity|humid|moisture)\b/i.test(cleanQ)) {
    if (
      /^(what is|why is|why does|explain|define)\b/i.test(cleanQ) &&
      !/\b(in|at|for|near|of)\s+[a-z]{3,}\b/i.test(cleanQ)
    ) {
      return {
        intent: 'GENERAL_KNOWLEDGE',
        confidence: 0.98,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'humidity' },
      };
    }
  }

  // Check Agromet Concept
  if (/\b(agromet|agrometeorology)\b/i.test(cleanQ)) {
    if (
      /^(what is|explain|define)\b/i.test(cleanQ) ||
      cleanQ === 'what is agromet' ||
      cleanQ === 'what is agrometeorology'
    ) {
      return {
        intent: 'GENERAL_KNOWLEDGE',
        confidence: 0.98,
        requiresLocation: false,
        requiresProvider: false,
        entities: { topic: 'agriculture' },
      };
    }
  }

  // General "What is / Explain / How does / Why is" without explicit location
  if (
    /^(what is|what are|who is|who are|how does|how do|why is|why does|why do|explain)\b/i.test(
      cleanQ
    ) &&
    !/\b(in|at|for|near|of)\s+[a-z]{3,}\b/i.test(cleanQ)
  ) {
    const matched = findKnowledge(cleanQ);
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: matched ? 0.95 : 0.85,
      requiresLocation: false,
      requiresProvider: false,
      entities: { topic: matched?.category?.toLowerCase() || 'general' },
    };
  }

  // 6. MULTI-LOCATION COMPARISON
  if (
    cleanQ.includes('compare') ||
    cleanQ.includes('which is cooler') ||
    cleanQ.includes('which is warmer') ||
    cleanQ.includes('which is hotter') ||
    cleanQ.includes('difference between') ||
    cleanQ.includes(' vs ') ||
    cleanQ.includes(' or ')
  ) {
    // Check if comparing locations (e.g. Pune and Nagpur)
    if (/\b(between|and|vs|or)\b/i.test(cleanQ)) {
      return {
        intent: 'MULTI_INTENT',
        confidence: 0.95,
        requiresLocation: true,
        requiresProvider: true,
        entities: {},
      };
    }
  }

  // 7. MULTI-INTENT (Weather + AQI or Weather + Warnings)
  const asksWeather = /\b(weather|temperature|temp|climate|मौसम|तापमान)\b/i.test(cleanQ);
  const asksAqi = /\b(aqi|air quality|pollution|pm2\.5|pm10|smog|हवा की गुणवत्ता|प्रदूषण)\b/i.test(
    cleanQ
  );
  const asksWarning = /\b(warnings?|alerts?|cyclones?|floods?|hazards?|चेतावनी|अलर्ट)\b/i.test(cleanQ);

  if ((asksWeather && asksAqi) || (asksWeather && asksWarning)) {
    return {
      intent: 'MULTI_INTENT',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 8. OFFICIAL WARNINGS & DISASTER ALERTS
  if (
    asksWarning ||
    cleanQ.includes('red alert') ||
    cleanQ.includes('orange alert') ||
    cleanQ.includes('yellow alert') ||
    cleanQ.includes('heavy rain warning') ||
    cleanQ.includes('rainfall warning') ||
    cleanQ.includes('तूफान') ||
    cleanQ.includes('बाढ़')
  ) {
    return {
      intent: 'WARNING',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 9. FORECAST (Tomorrow, 7-day, next 3 days, weekend, weekly)
  const timeframe = detectTimeframe(cleanQ);
  if (
    cleanQ.includes('forecast') ||
    cleanQ.includes('7 day') ||
    cleanQ.includes('7-day') ||
    cleanQ.includes('weekly') ||
    cleanQ.includes('next week') ||
    timeframe === 'tomorrow' ||
    timeframe === 'tomorrow_morning' ||
    timeframe === 'tomorrow_evening' ||
    timeframe === 'next_3_days' ||
    timeframe === 'next_7_days' ||
    timeframe === 'this_weekend' ||
    cleanQ.includes('पूर्वानुमान')
  ) {
    return {
      intent: 'FORECAST',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 10. AIR QUALITY & AQI
  if (asksAqi) {
    return {
      intent: 'AQI',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 11. RADAR & DOPPLER IMAGERY
  if (
    cleanQ.includes('radar') ||
    cleanQ.includes('doppler') ||
    cleanQ.includes('dwr') ||
    cleanQ.includes('satellite') ||
    cleanQ.includes('रडार')
  ) {
    return {
      intent: 'RADAR',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 12. RAINFALL & PRECIPITATION
  if (
    cleanQ.includes('rainfall') ||
    cleanQ.includes('precipitation') ||
    cleanQ.includes('downpour') ||
    cleanQ.includes('rain today') ||
    cleanQ.includes('is it raining') ||
    cleanQ.includes('will it rain') ||
    cleanQ.includes('raining') ||
    cleanQ.includes('बारिश') ||
    cleanQ.includes('वर्षा')
  ) {
    return {
      intent: 'RAINFALL',
      confidence: 0.95,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 13. AGRICULTURE & FARMING
  if (
    cleanQ.includes('crop') ||
    cleanQ.includes('spray') ||
    cleanQ.includes('farm') ||
    cleanQ.includes('soil') ||
    cleanQ.includes('irrigation') ||
    cleanQ.includes('harvest') ||
    cleanQ.includes('pesticide') ||
    cleanQ.includes('agromet') ||
    cleanQ.includes('farmer') ||
    cleanQ.includes('खेती') ||
    cleanQ.includes('फसल')
  ) {
    return {
      intent: 'AGRICULTURE',
      confidence: 0.92,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 14. MARINE & COASTAL
  if (
    cleanQ.includes('marine') ||
    cleanQ.includes('sea') ||
    cleanQ.includes('wave') ||
    cleanQ.includes('tide') ||
    cleanQ.includes('fishermen') ||
    cleanQ.includes('coastal') ||
    cleanQ.includes('beach') ||
    cleanQ.includes('समुद्र') ||
    cleanQ.includes('तट')
  ) {
    return {
      intent: 'MARINE',
      confidence: 0.92,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 15. SPECIFIC WEATHER PARAMETERS
  if (
    asksWeather ||
    cleanQ.includes('temperature') ||
    cleanQ.includes('temp') ||
    cleanQ.includes('wind') ||
    cleanQ.includes('humidity') ||
    cleanQ.includes('humid') ||
    cleanQ.includes('hot') ||
    cleanQ.includes('cold') ||
    cleanQ.includes('warm') ||
    cleanQ.includes('breeze') ||
    cleanQ.includes('climate') ||
    cleanQ.includes('how is the weather') ||
    cleanQ.includes('what is the weather') ||
    cleanQ.includes('current weather')
  ) {
    return {
      intent: 'CURRENT_WEATHER',
      confidence: 0.90,
      requiresLocation: true,
      requiresProvider: true,
      entities: {},
    };
  }

  // 16. LOCATION INQUIRY
  if (/^(where is|show|location of)\b/i.test(cleanQ)) {
    return {
      intent: 'LOCATION',
      confidence: 0.85,
      requiresLocation: true,
      requiresProvider: false,
      entities: {},
    };
  }

  // 17. FINAL FALLBACK: GENERAL_KNOWLEDGE or CLARIFICATION
  // NEVER DEFAULT UNKNOWN QUESTIONS TO CURRENT_WEATHER!
  return {
    intent: 'GENERAL_KNOWLEDGE',
    confidence: 0.60,
    requiresLocation: false,
    requiresProvider: false,
    entities: {},
  };
}

/**
 * Backwards-compatible routeIntent for AskMausamOrchestrator
 */
export function routeIntent(
  query: string,
  isComparison = false,
  memory?: ConversationMemoryState
): IntentRoutingResult {
  const q = normalizeQuestion(query);
  const timeframe = detectTimeframe(q);
  const cleanQ = q.replace(/[?!.,]/g, '').trim();

  // Multi-location comparison shortcut
  if (
    isComparison ||
    cleanQ.includes('which is cooler') ||
    cleanQ.includes('which is warmer') ||
    cleanQ.includes('which is hotter') ||
    cleanQ.includes('compare weather between') ||
    cleanQ.includes('compare weather') ||
    (cleanQ.includes('compare') && cleanQ.includes('and'))
  ) {
    return {
      intent: 'MULTI_LOCATION_COMPARISON',
      timeframe,
      requiredTools: ['WEATHER', 'AQI'],
      confidence: 0.98,
      fastPathEligible: true,
      requiresLocation: true,
      requiresProvider: true,
    };
  }

  // Run canonical intent classifier
  const classification = classifyIntent(query);

  // Map to WeatherIntent and RequiredTools
  switch (classification.intent) {
    case 'GREETING':
      return {
        intent: 'GREETING',
        timeframe: 'now',
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
      };

    case 'ABOUT_DEVELOPER':
      return {
        intent: 'ABOUT_DEVELOPER',
        timeframe: 'now',
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
        topic: 'developer',
      };

    case 'ABOUT_MAUSAM':
      return {
        intent: 'ABOUT_MAUSAM',
        timeframe: 'now',
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
        topic: 'mausam',
      };

    case 'HELP':
      return {
        intent: 'HELP',
        timeframe: 'now',
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
      };

    case 'GENERAL_KNOWLEDGE':
      return {
        intent: 'GENERAL_KNOWLEDGE',
        timeframe: 'now',
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
        topic: classification.entities.topic,
      };

    case 'WARNING':
      return {
        intent: 'WARNINGS',
        timeframe,
        requiredTools: ['WARNINGS'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'FORECAST':
      return {
        intent: 'FORECAST',
        timeframe,
        requiredTools: ['FORECAST'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'AQI':
      return {
        intent: 'AQI',
        timeframe,
        requiredTools: ['AQI'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'RADAR':
      return {
        intent: 'RADAR',
        timeframe,
        requiredTools: ['RADAR'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'RAINFALL':
      return {
        intent: timeframe === 'now' ? 'RAIN' : 'RAINFALL',
        timeframe,
        requiredTools: timeframe === 'now' ? ['WEATHER'] : ['WEATHER', 'FORECAST'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'AGRICULTURE':
      return {
        intent: cleanQ.includes('soil') ? 'SOIL' : 'AGRICULTURE',
        timeframe,
        requiredTools: ['WEATHER', 'AGRICULTURE'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'MARINE':
      return {
        intent: cleanQ.includes('tide') ? 'TIDE' : 'MARINE',
        timeframe,
        requiredTools: ['MARINE'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'MULTI_INTENT':
      return {
        intent: 'MULTI_INTENT',
        timeframe,
        requiredTools: cleanQ.includes('warning') || cleanQ.includes('alert')
          ? ['WEATHER', 'WARNINGS']
          : ['WEATHER', 'AQI'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    case 'LOCATION':
      return {
        intent: 'LOCATION',
        timeframe,
        requiredTools: [],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: false,
      };

    case 'CURRENT_WEATHER':
      if (cleanQ.includes('temperature') || cleanQ.includes('temp') || cleanQ.includes('तापमान')) {
        return {
          intent: 'TEMPERATURE',
          timeframe,
          requiredTools: ['WEATHER'],
          confidence: classification.confidence,
          fastPathEligible: true,
          requiresLocation: true,
          requiresProvider: true,
        };
      }
      if (cleanQ.includes('wind') || cleanQ.includes('हवा')) {
        return {
          intent: 'WIND',
          timeframe,
          requiredTools: ['WEATHER'],
          confidence: classification.confidence,
          fastPathEligible: true,
          requiresLocation: true,
          requiresProvider: true,
        };
      }
      if (cleanQ.includes('humidity') || cleanQ.includes('नमी')) {
        return {
          intent: 'HUMIDITY',
          timeframe,
          requiredTools: ['WEATHER'],
          confidence: classification.confidence,
          fastPathEligible: true,
          requiresLocation: true,
          requiresProvider: true,
        };
      }
      return {
        intent: 'CURRENT_WEATHER',
        timeframe,
        requiredTools: ['WEATHER'],
        confidence: classification.confidence,
        fastPathEligible: true,
        requiresLocation: true,
        requiresProvider: true,
      };

    default:
      return {
        intent: 'GENERAL_KNOWLEDGE',
        timeframe: 'now',
        requiredTools: [],
        confidence: 0.60,
        fastPathEligible: true,
        isGeneralKnowledge: true,
        requiresLocation: false,
        requiresProvider: false,
      };
  }
}

/**
 * Dynamic, intent-specific progress text to display in the UI
 */
export function getIntentLoadingMessage(intent: WeatherIntent): string {
  switch (intent) {
    case 'ABOUT_DEVELOPER':
      return 'Checking project metadata…';
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
      return 'Processing request…';
  }
}
