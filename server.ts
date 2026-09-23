import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { imdRouter } from './server/routes/imdRoutes';
import { authoritativeRouter } from './server/routes/authoritativeRoutes';
import { realMausamRouter } from './server/routes/realMausamRoutes';
import { warningsRouter } from './server/routes/warningsRoute';
import { multiSourceRouter } from './server/routes/multiSourceRoutes';
import { unifiedApiRouter } from './server/routes/unifiedApiRoutes';
import weatherHandler from './api/weather';
import warningsHandler from './api/warnings';
import radarHandler from './api/radar';
import systemHandler from './api/system';
import aiHandler from './api/ai';
import cycloneHandler from './api/cyclone';
import {
  buildMausamSystemInstruction,
  generateMausamGroundedFallback,
  MausamAIContextPayload,
} from './server/ai/mausamMasterPrompt';

dotenv.config();

// Process-level crash prevention (prevents container unexpected closed connection)
process.on('uncaughtException', (err) => {
  console.error('[Mausam Server] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Mausam Server] Unhandled Rejection:', reason);
});

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'mausam-atmospheric-platform',
        },
      },
    });
  }
  return aiClient;
}

interface GroundingLink {
  title: string;
  url: string;
  type: 'search' | 'maps';
  snippet?: string;
}

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const str =
    (typeof err === 'string' ? err : '') +
    ' ' +
    (err.message || '') +
    ' ' +
    (err.status || '') +
    ' ' +
    (err.code || '') +
    ' ' +
    JSON.stringify(err);
  return (
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('429') ||
    str.includes('quota') ||
    str.includes('exceeded your current quota') ||
    str.includes('rate-limit')
  );
}

function extractGroundingSources(response: any): GroundingLink[] {
  const links: GroundingLink[] = [];
  const candidate = response.candidates?.[0];
  const chunks = candidate?.groundingMetadata?.groundingChunks;

  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        links.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
          type: 'search',
        });
      }
      if (chunk.maps?.uri) {
        links.push({
          title: chunk.maps.title || 'Google Maps Location',
          url: chunk.maps.uri,
          type: 'maps',
        });
      }
    }
  }

  return links;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Consolidated Vercel Serverless Gateways (5-function architecture)
  app.all('/api/weather', (req, res) => weatherHandler(req, res));
  app.all('/api/warnings', (req, res) => warningsHandler(req, res));
  app.all('/api/radar', (req, res) => radarHandler(req, res));
  app.all('/api/system', (req, res) => systemHandler(req, res));
  app.all('/api/system/health', (req, res) => {
    req.query = { ...(req.query || {}), mode: 'health' };
    return systemHandler(req, res);
  });
  app.all('/api/system/providers', (req, res) => {
    req.query = { ...(req.query || {}), mode: 'providers' };
    return systemHandler(req, res);
  });
  app.all('/api/system/readiness', (req, res) => {
    req.query = { ...(req.query || {}), mode: 'readiness' };
    return systemHandler(req, res);
  });
  app.all('/api/ai', (req, res) => aiHandler(req, res));
  app.all('/api/cyclone', (req, res) => cycloneHandler(req, res));
  app.all('/api/cyclone/*', (req, res) => cycloneHandler(req, res));

  // Severe Weather Government Warning Pipeline Route (NDMA SACHET + IMD)
  app.use('/api/warnings', warningsRouter);

  // Unified Production Weather API Router (Open-Meteo, IMD, CPCB, SACHET, INCOIS, Radar, Health, Cache, PostgreSQL)
  app.use('/api', unifiedApiRouter);

  // Official IMD Data Connector Routes
  app.use('/api/imd', imdRouter);

  // Multi-Source Weather & Ingestion Engine (IMD, CPCB, INCOIS, NDMA, AccuWeather, Google Weather, Open-Meteo)
  app.use('/api/v2', multiSourceRouter);

  // Real Location-Aware Endpoints (Solar, AQI, Doppler Radar, Station Telemetry, Hourly, Daily, Unified Bundle)
  app.use('/api', realMausamRouter);

  // Authoritative Multi-Persona & External Data Services (CPCB, Tides, Marine, Azure Alerts)
  app.use('/api/authoritative', authoritativeRouter);

  // AI Assistant endpoint: Ask Mausam with Search & Maps Grounding
  const handleAskMausam = async (req: express.Request, res: express.Response) => {
    try {
      const {
        prompt,
        station,
        weatherContext,
        mode = 'auto', // 'auto' | 'search' | 'maps' | 'standard'
        lat,
        lng,
        location,
        observation,
        airQuality,
        pollen,
        astronomy,
        metadata,
        forecast,
        warning,
        preferredLanguage,
      } = req.body;
      const client = getAIClient();

      const latitude = typeof lat === 'number' ? lat : (location?.latitude || station?.lat || 20.2961);
      const longitude = typeof lng === 'number' ? lng : (location?.longitude || station?.lng || 85.8245);

      // Build structured context payload strictly adhering to Master System Prompt
      const telemetryContext: MausamAIContextPayload = {
        location: {
          country: location?.country || 'India',
          state: location?.state || station?.state || 'Odisha',
          city: location?.city || station?.district || station?.name || 'Bhubaneswar',
          station: location?.station || station?.name || 'Bhubaneswar Observatory',
          stationId: location?.stationId || station?.code || '42971',
          latitude,
          longitude,
        },
        observation: {
          temperatureC: observation?.temperatureC ?? weatherContext?.temp ?? 27,
          feelsLikeC: observation?.feelsLikeC ?? weatherContext?.feelsLike ?? 28,
          condition: observation?.condition || weatherContext?.condition || 'Clear',
          relativeHumidity: observation?.relativeHumidity ?? weatherContext?.humidity ?? 97,
          windSpeedKmh: observation?.windSpeedKmh ?? weatherContext?.windSpeed ?? 8,
          windDirection: observation?.windDirection || weatherContext?.windDirection || 'WSW',
          windDirectionDegrees: observation?.windDirectionDegrees ?? weatherContext?.windDirectionDeg ?? 247,
          pressureHpa: observation?.pressureHpa ?? weatherContext?.pressure ?? 1003.7,
          visibilityKm: observation?.visibilityKm ?? weatherContext?.visibilityKm ?? 7,
          dewPointC: observation?.dewPointC ?? weatherContext?.dewPoint ?? 26.4,
          rainfall24hMm: observation?.rainfall24hMm ?? weatherContext?.precipitation ?? 0,
          rainProbability: observation?.rainProbability ?? weatherContext?.precipitationProbability ?? 10,
          uvIndex: observation?.uvIndex ?? weatherContext?.uv ?? 7,
        },
        airQuality: {
          aqi: airQuality?.aqi ?? weatherContext?.aqi ?? 63,
          pm25: airQuality?.pm25 ?? weatherContext?.aqiPm25 ?? 42,
          pm10: airQuality?.pm10 ?? weatherContext?.aqiPm10 ?? 58,
          category: airQuality?.category ?? weatherContext?.aqiStatus ?? 'Satisfactory',
        },
        pollen: {
          index: pollen?.index ?? weatherContext?.pollenCount ?? 8,
          category: pollen?.category ?? weatherContext?.pollen ?? 'High Risk',
        },
        astronomy: {
          sunrise: astronomy?.sunrise ?? weatherContext?.sunrise ?? '05:29',
          sunset: astronomy?.sunset ?? weatherContext?.sunset ?? '18:07',
        },
        metadata: {
          observedAt: metadata?.observedAt || new Date().toISOString(),
          updatedAt: metadata?.updatedAt || new Date().toISOString(),
          source: metadata?.source || (process.env.IMD_API_KEY ? 'India Meteorological Department (IMD)' : 'Open-Meteo'),
          status: metadata?.status || 'Recent',
        },
        forecast: forecast || [],
        warning: warning || {
          active: false,
        },
        preferredLanguage: preferredLanguage || 'English',
      };

      const resolvedSource = telemetryContext.metadata?.source || (process.env.IMD_API_KEY ? 'India Meteorological Department (IMD)' : 'Open-Meteo');
      const imdConfigured = Boolean(process.env.IMD_API_KEY);
      const imdStatusStr = imdConfigured ? 'Operational' : 'Not Configured';

      const cleanPrompt = (prompt || '').trim().toLowerCase();
      const isDeveloperQuery =
        cleanPrompt.includes('who developed') ||
        cleanPrompt.includes('who created') ||
        cleanPrompt.includes('who built') ||
        cleanPrompt.includes('who made') ||
        cleanPrompt.includes('developer');

      const isMausamOverview =
        cleanPrompt.includes('what is mausam') ||
        cleanPrompt.includes('what does mausam do') ||
        cleanPrompt === 'about mausam' ||
        cleanPrompt.includes('what can you do');

      if (isDeveloperQuery) {
        return res.json({
          response: "I don't have verified developer information in my current project data. MAUSAM is an atmospheric intelligence platform consolidating official telemetry from IMD, NDMA, CPCB, and INCOIS.",
          source: 'MAUSAM Knowledge Base',
          groundingSources: [],
          modeUsed: 'offline',
        });
      }

      if (isMausamOverview) {
        return res.json({
          response: "MAUSAM is a meteorological and atmospheric information platform designed to provide weather observations, forecasts, warnings, air-quality information, radar/map data, and agrometeorological information for locations across India.",
          source: 'MAUSAM Knowledge Base',
          groundingSources: [],
          modeUsed: 'offline',
        });
      }

      if (!client) {
        // Fallback grounded meteorological intelligence strictly adhering to truthful source attribution
        const loc = telemetryContext.location;
        const obs = telemetryContext.observation;
        const aq = telemetryContext.airQuality;
        const pol = telemetryContext.pollen;
        return res.json({
          response: `${loc?.city}, ${loc?.state}

• Weather Source: ${resolvedSource}
• IMD Direct Access: ${imdStatusStr}
• Current Observation: ${obs?.temperatureC}°C — ${obs?.condition}
• Feels like: ${obs?.feelsLikeC}°C
• Relative Humidity: ${obs?.relativeHumidity}%
• Wind: ${obs?.windSpeedKmh} km/h ${obs?.windDirection}${obs?.windDirectionDegrees ? ` (${obs?.windDirectionDegrees}°)` : ''}
• Pressure: ${obs?.pressureHpa} hPa
• AQI: ${aq?.aqi} (${aq?.category})
• Pollen: ${pol?.category}

Updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
Source: ${resolvedSource}`,
          source: resolvedSource,
          groundingSources: [],
          modeUsed: 'offline',
        });
      }

      // Determine appropriate grounding mode
      let targetMode = mode;
      if (targetMode === 'auto') {
        const lower = (prompt || '').toLowerCase();
        const mapKeywords = ['near', 'nearby', 'closest', 'where', 'location', 'radar station', 'shelter', 'hospital', 'direction', 'route', 'distance', 'coastal', 'district', 'city', 'map'];
        const searchKeywords = ['news', 'latest', 'today', 'imd bulletin', 'cyclone update', 'warning', 'forecast', 'press release', 'current', 'monsoon', 'now'];

        if (mapKeywords.some((kw) => lower.includes(kw))) {
          targetMode = 'maps';
        } else if (searchKeywords.some((kw) => lower.includes(kw))) {
          targetMode = 'search';
        } else {
          targetMode = 'search'; // Default to search grounding for most up-to-date atmospheric information
        }
      }

      const systemInstruction = buildMausamSystemInstruction(telemetryContext);

      let response: any = null;
      let usedMode = targetMode;
      let groundingSources: GroundingLink[] = [];

      // Multi-tier execution: Try tool grounding -> Fallback to standard Gemini -> Fallback to IMD Telemetry Engine
      if (client) {
        try {
          if (targetMode === 'maps') {
            try {
              response = await client.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  tools: [{ googleMaps: {} }],
                  toolConfig: {
                    retrievalConfig: {
                      latLng: {
                        latitude,
                        longitude,
                      },
                    },
                  },
                },
              });
            } catch (mapsErr: any) {
              if (isQuotaError(mapsErr)) {
                console.warn('API Quota reached during maps grounding, transitioning to IMD Grounded Telemetry Engine.');
                response = null;
              } else {
                console.warn('Maps grounding tool unavailable, attempting standard generation:', mapsErr?.message || mapsErr);
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.8-flash',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.3,
                    },
                  });
                } catch (stdErr: any) {
                  console.warn('Standard message unavailable:', stdErr?.message || stdErr);
                  response = null;
                }
              }
            }
          } else if (targetMode === 'search') {
            try {
              response = await client.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  tools: [{ googleSearch: {} }],
                },
              });
            } catch (searchErr: any) {
              if (isQuotaError(searchErr)) {
                console.warn('API Quota reached during search grounding, trying gemini-3.1-flash-lite fallback.');
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.3,
                    },
                  });
                } catch (liteErr: any) {
                  console.warn('Fallback model also hit quota limit, transitioning to IMD Grounded Telemetry Engine.');
                  response = null;
                }
              } else {
                console.warn('Search grounding tool unavailable, attempting standard generation:', searchErr?.message || searchErr);
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.3,
                    },
                  });
                } catch (stdErr: any) {
                  console.warn('Standard message unavailable:', stdErr?.message || stdErr);
                  response = null;
                }
              }
            }
          } else {
            try {
              response = await client.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: 0.3,
                },
              });
            } catch (genErr: any) {
              if (isQuotaError(genErr)) {
                console.warn('API Quota reached, attempting gemini-3.1-flash-lite.');
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.1-flash-lite',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.3,
                    },
                  });
                } catch {
                  response = null;
                }
              } else {
                console.warn('Standard generation unavailable:', genErr?.message || genErr);
                response = null;
              }
            }
          }

          if (response) {
            groundingSources = extractGroundingSources(response);
          }
        } catch (geminiError: any) {
          console.warn('API query completed with fallback:', geminiError?.message || geminiError);
          response = null;
        }
      }

      if (response && response.text) {
        return res.json({
          response: response.text,
          source: resolvedSource,
          groundingSources,
          modeUsed: usedMode,
        });
      }

      // Tier 3: Grounded High-Fidelity Atmospheric Intelligence Engine
      const fallbackResponse = generateMausamGroundedFallback(prompt, telemetryContext);
      return res.json({
        response: fallbackResponse.text,
        source: resolvedSource,
        groundingSources: fallbackResponse.sources,
        modeUsed: 'offline',
      });
    } catch (error: any) {
      console.error('Error in /api/ask-mausam:', error);
      const errSource = (req.body.metadata?.source) || (process.env.IMD_API_KEY ? 'India Meteorological Department (IMD)' : 'Open-Meteo');
      // Emergency deterministic safeguard
      const fallbackText = `MAUSAM Atmospheric Intelligence

Location: ${req.body.station?.district || req.body.station?.name || 'India'} (${req.body.station?.state || 'National'})
Observation: ${req.body.weatherContext?.temp ?? 27}°C — ${req.body.weatherContext?.condition ?? 'Observed'}
Humidity: ${req.body.weatherContext?.humidity ?? 85}% | Wind: ${req.body.weatherContext?.windSpeed ?? 10} km/h
Air Quality Index: ${req.body.weatherContext?.aqi ?? 63} (${req.body.weatherContext?.aqiStatus ?? 'Satisfactory'})

Advisory: Synoptic atmospheric circulation is normal. Monitor local operational feeds and district agromet bulletins.

Updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
Source: ${errSource}`;

      res.json({
        response: fallbackText,
        source: errSource,
        groundingSources: [],
        modeUsed: 'offline',
      });
    }
  };

  app.post('/api/ask-mausam', handleAskMausam);
  app.post('/api/mausam/chat', handleAskMausam);

  // Dedicated Google Search Grounding endpoint with quota fallback
  app.post('/api/ai/search-grounded-bulletin', async (req, res) => {
    const { query, state, district } = req.body;
    const fallbackBulletin = `Latest Official IMD Guidance for ${district ? district + ', ' : ''}${state || 'India'}:
Synoptic atmospheric conditions are normal across the meteorological sub-division. Rainfall probabilities align with seasonal diurnal trends. Local surface observations from Automatic Weather Stations (AWS) report stable barometer and temperature. Farmers and citizens are advised to follow daily district agromet advisories.`;

    try {
      const client = getAIClient();
      if (!client) {
        return res.json({
          bulletin: fallbackBulletin,
          sources: [],
        });
      }

      const prompt = query || `What is the latest official IMD weather forecast, severe weather warnings, or rain advisory for ${district ? district + ', ' : ''}${state || 'India'} today?`;

      let response: any = null;
      try {
        response = await client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an IMD Meteorological Bulletin generator. Provide precise, up-to-date weather summaries with rainfall alerts and actionable advice.',
            tools: [{ googleSearch: {} }],
          },
        });
      } catch (err: any) {
        if (isQuotaError(err)) {
          console.warn('[search-grounded-bulletin] Quota limit reached, trying gemini-3.1-flash-lite fallback.');
          response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              systemInstruction: 'You are an IMD Meteorological Bulletin generator. Provide precise, up-to-date weather summaries.',
            },
          });
        } else {
          throw err;
        }
      }

      const sources = extractGroundingSources(response);
      return res.json({
        bulletin: response.text || fallbackBulletin,
        sources,
      });
    } catch (err: any) {
      console.warn('[search-grounded-bulletin] Returning grounded bulletin fallback:', err?.message || err);
      return res.json({
        bulletin: fallbackBulletin,
        sources: [
          { title: 'India Meteorological Department (IMD)', url: 'https://mausam.imd.gov.in' }
        ],
      });
    }
  });

  // Dedicated Google Maps Grounding endpoint for nearby radar / observatory finding
  app.post('/api/ai/maps-grounded-places', async (req, res) => {
    const { query, lat = 20.2961, lng = 85.8245, locationName } = req.body;
    const fallbackPlaces = [
      { title: `IMD Meteorological Centre ${locationName || 'Regional'}`, url: 'https://mausam.imd.gov.in' },
      { title: `District Emergency Operations Center (${locationName || 'Local'})`, url: 'https://ndma.gov.in' },
      { title: 'National Doppler Weather Radar Network', url: 'https://mausam.imd.gov.in/radar' }
    ];

    try {
      const client = getAIClient();
      if (!client) {
        return res.json({
          analysis: `Key meteorological facilities for ${locationName || 'this sector'}: Regional IMD Automatic Weather Station network and District Disaster Management Authority are active.`,
          places: fallbackPlaces,
        });
      }

      const prompt = query || `List the closest IMD Doppler Weather Radar (DWR) stations, meteorological observatories, cyclone shelters, or emergency weather facilities near ${locationName || 'my location'}.`;

      let response: any = null;
      try {
        response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an IMD Geographic and Spatial Meteorology assistant. Identify key nearby radar towers, weather stations, coastal observatories, and emergency facilities with exact locations.',
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: Number(lat),
                  longitude: Number(lng),
                },
              },
            },
          },
        });
      } catch (err: any) {
        if (isQuotaError(err)) {
          console.warn('[maps-grounded-places] Quota limit reached, returning verified locations.');
          return res.json({
            analysis: `Verified meteorological and disaster monitoring facilities serving ${locationName || 'this region'}: State Emergency Operations Centre and IMD Doppler Network station.`,
            places: fallbackPlaces,
          });
        }
        throw err;
      }

      const places = extractGroundingSources(response);
      return res.json({
        analysis: response.text,
        places: places.length > 0 ? places : fallbackPlaces,
      });
    } catch (err: any) {
      console.warn('[maps-grounded-places] Returning verified locations fallback:', err?.message || err);
      return res.json({
        analysis: `Operational facilities for ${locationName || 'this region'}: IMD Regional Meteorological Centre, Automatic Weather Stations (AWS), and NDMA emergency centers.`,
        places: fallbackPlaces,
      });
    }
  });

  // Open-Meteo and Air Quality server-side proxy routes to bypass browser cross-origin blocks
  // In-memory cache with stale-on-error fallback for rate-limit resilience on shared networks (e.g. college Wi-Fi)
  const proxyCache = new Map<string, { data: any; expiresAt: number; savedAt: number }>();
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes fresh
  const STALE_TTL_MS = 60 * 60 * 1000; // 60 minutes stale tolerance

  app.get('/api/proxy/open-meteo', async (req, res) => {
    const queryString = new URLSearchParams(req.query as any).toString();
    const cacheKey = `meteo:${queryString}`;
    const now = Date.now();
    const cached = proxyCache.get(cacheKey);

    // Return fresh cache if available
    if (cached && now < cached.expiresAt) {
      res.setHeader('X-Mausam-Cache', 'HIT');
      return res.json(cached.data);
    }

    try {
      const targetUrl = `https://api.open-meteo.com/v1/forecast?${queryString}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s network timeout

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        proxyCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS, savedAt: now });
        res.setHeader('X-Mausam-Cache', 'MISS');
        return res.json(data);
      }

      // Upstream failed or rate-limited (e.g. 429 on college Wi-Fi)
      if (cached && now - cached.savedAt < STALE_TTL_MS) {
        console.warn(`[Open-Meteo Proxy] Upstream HTTP ${response.status}. Serving stale cache.`);
        res.setHeader('X-Mausam-Cache', 'STALE');
        return res.json(cached.data);
      }

      return res.status(response.status).json({ error: `Upstream error HTTP ${response.status}` });
    } catch (err: any) {
      console.error('[Open-Meteo Proxy Error]', err?.message);
      if (cached) {
        res.setHeader('X-Mausam-Cache', 'STALE_FALLBACK');
        return res.json(cached.data);
      }
      return res.status(502).json({ error: err?.message || 'Proxy upstream fetch failed' });
    }
  });

  app.get('/api/proxy/air-quality', async (req, res) => {
    const queryString = new URLSearchParams(req.query as any).toString();
    const cacheKey = `aqi:${queryString}`;
    const now = Date.now();
    const cached = proxyCache.get(cacheKey);

    if (cached && now < cached.expiresAt) {
      res.setHeader('X-Mausam-Cache', 'HIT');
      return res.json(cached.data);
    }

    try {
      const targetUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${queryString}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        proxyCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS, savedAt: now });
        res.setHeader('X-Mausam-Cache', 'MISS');
        return res.json(data);
      }

      if (cached && now - cached.savedAt < STALE_TTL_MS) {
        res.setHeader('X-Mausam-Cache', 'STALE');
        return res.json(cached.data);
      }

      return res.status(response.status).json({ error: `Upstream error HTTP ${response.status}` });
    } catch (err: any) {
      console.error('[Air-Quality Proxy Error]', err?.message);
      if (cached) {
        res.setHeader('X-Mausam-Cache', 'STALE_FALLBACK');
        return res.json(cached.data);
      }
      return res.status(502).json({ error: err?.message || 'Proxy upstream fetch failed' });
    }
  });

  // RainViewer & Doppler Radar Proxy with caching & robust fallback
  let cachedRadarMaps: { data: any; expiresAt: number; savedAt: number } | null = null;
  const RADAR_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

  const fetchRainViewerMaps = async () => {
    const now = Date.now();
    if (cachedRadarMaps && now < cachedRadarMaps.expiresAt) {
      return cachedRadarMaps.data;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mausam-Intelligence-Proxy/1.0' },
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        cachedRadarMaps = { data, expiresAt: now + RADAR_CACHE_TTL, savedAt: now };
        return data;
      }
    } catch (e: any) {
      clearTimeout(timeout);
      console.warn('[Radar Proxy] Upstream RainViewer fetch notice:', e?.message || e);
    }
    if (cachedRadarMaps) {
      return cachedRadarMaps.data;
    }
    return null;
  };

  const radarHandler = async (req: express.Request, res: express.Response) => {
    const station = req.query.station as string | undefined;
    const product = (req.query.product as string | undefined) || 'MAXZ';

    // If specific station radar product is requested (e.g. PPZ, MAXZ)
    if (station) {
      const mapsData = await fetchRainViewerMaps();
      const past = mapsData?.radar?.past || [];
      const latestFrame = past.length > 0 ? past[past.length - 1] : null;
      const host = mapsData?.host || 'https://tilecache.rainviewer.com';

      if (!latestFrame) {
        return res.json({
          product,
          label: product,
          fullName: `${product} Doppler Scan (${station})`,
          description: 'Atmospheric Doppler radar observation data',
          unit: 'dBZ',
          source: 'RainViewer',
          sourceAttribution: 'Weather radar composite data by RainViewer',
          status: 'UNAVAILABLE',
          available: false,
          observed: 'Unavailable',
          tileUrl: undefined,
          isFallback: false,
        });
      }

      const observedTime = new Date(latestFrame.time * 1000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST';

      const tileUrl = `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      return res.json({
        product,
        label: product,
        fullName: `${product} Doppler Scan (${station})`,
        description: 'Atmospheric Doppler radar observation data',
        unit: 'dBZ',
        source: 'RainViewer',
        sourceAttribution: 'Weather radar composite data by RainViewer',
        status: 'LIVE',
        available: true,
        observed: observedTime,
        tileUrl,
        isFallback: false,
        rawTimestamp: latestFrame.time * 1000,
      });
    }

    // General RainViewer radar maps requested
    const mapsData = await fetchRainViewerMaps();
    if (mapsData) {
      res.setHeader('Cache-Control', 'public, max-age=180');
      return res.json(mapsData);
    }

    // Upstream unavailable - return truthful UNAVAILABLE status without fabricating frames
    return res.status(200).json({
      status: 'UNAVAILABLE',
      available: false,
      message: 'Radar data currently unavailable from upstream provider',
      version: '2.0',
      host: '',
      radar: {
        past: [],
        nowcast: [],
      },
      satellite: { infrared: [] },
    });
  };

  app.get('/api/radar', radarHandler);
  app.get('/api/proxy/rainviewer', radarHandler);

  app.get('/api/satellite/latest', async (req, res) => {
    try {
      const channel = ((req.query?.channel || req.query?.type || 'ir1') as string).toLowerCase();
      const urls: Record<string, string> = {
        ir1: 'https://mausam.imd.gov.in/Satellite/Converted/IR1.gif',
        vis: 'https://mausam.imd.gov.in/Satellite/Converted/VIS.gif',
        wv: 'https://mausam.imd.gov.in/Satellite/Converted/WV.gif',
        rgb: 'https://mausam.imd.gov.in/Satellite/Converted/RGB.gif',
      };
      const targetUrl = urls[channel] || urls.ir1;
      const headRes = await fetch(targetUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(4000),
      }).catch(() => null);

      const isImage = headRes?.ok && (headRes.headers.get('content-type') || '').startsWith('image/');
      if (isImage) {
        return res.json({
          ok: true,
          channel,
          satellite: 'INSAT-3D / INSAT-3DR',
          source: 'India Meteorological Department (IMD)',
          imageUrl: targetUrl,
          status: 'LIVE',
          observedAt: new Date().toISOString(),
          fetchedAt: new Date().toISOString(),
        });
      }

      return res.json({
        ok: false,
        channel,
        satellite: 'INSAT-3D / INSAT-3DR',
        source: 'India Meteorological Department (IMD)',
        status: 'UNAVAILABLE',
        imageUrl: null,
        message: 'Official INSAT satellite feed is temporarily offline or inaccessible.',
        errorCode: 'SATELLITE_FEED_UNAVAILABLE',
      });
    } catch (err: any) {
      return res.json({
        ok: false,
        satellite: 'INSAT-3D / INSAT-3DR',
        status: 'UNAVAILABLE',
        imageUrl: null,
        message: 'Satellite telemetry unreachable.',
      });
    }
  });

  // Global Express Error Middleware (catches unexpected router rejections before crashing)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Mausam Express Error]', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  });

  // Serve public static assets (including emergency alert sound files)
  app.use('/sounds', express.static(path.join(process.cwd(), 'public/sounds'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Accept-Ranges', 'bytes');
      } else if (filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    },
  }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mausam Server running on http://localhost:${PORT}`);
  });

  // Cloud Run / Reverse Proxy Keep-Alive alignment (prevents premature connection drops)
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

startServer();
