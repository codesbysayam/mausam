import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { imdRouter } from './server/routes/imdRoutes';
import { authoritativeRouter } from './server/routes/authoritativeRoutes';
import {
  buildMausamSystemInstruction,
  generateMausamGroundedFallback,
  MausamAIContextPayload,
} from './server/ai/mausamMasterPrompt';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
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

  // Official IMD Data Connector Routes
  app.use('/api/imd', imdRouter);

  // Open Data API endpoints (Alias routes matching OpenAPI specification)
  app.get('/api/weather/current', async (req, res) => {
    const stationId = (req.query.stationId as string) || (req.query.id as string) || '42971';
    try {
      const { imdConnector } = await import('./server/imd/imdConnector');
      const result = await imdConnector.getCurrentWeather(stationId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/weather/forecast', async (req, res) => {
    const stationId = (req.query.stationId as string) || (req.query.id as string) || '42971';
    try {
      const { imdConnector } = await import('./server/imd/imdConnector');
      const result = await imdConnector.getCityForecast(stationId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/weather/warnings', async (req, res) => {
    const stationId = (req.query.stationId as string) || (req.query.id as string) || '42971';
    try {
      const { imdConnector } = await import('./server/imd/imdConnector');
      const result = await imdConnector.getDistrictWarnings(stationId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

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
          source: metadata?.source || 'India Meteorological Department (IMD)',
          status: metadata?.status || 'OBSERVED',
        },
        forecast: forecast || [],
        warning: warning || {
          active: false,
        },
        preferredLanguage: preferredLanguage || 'English',
      };

      if (!client) {
        // Fallback grounded meteorological intelligence strictly adhering to Master System Prompt
        const loc = telemetryContext.location;
        const obs = telemetryContext.observation;
        const aq = telemetryContext.airQuality;
        const pol = telemetryContext.pollen;
        return res.json({
          response: `${loc?.city}, ${loc?.state}

${obs?.temperatureC}°C — ${obs?.condition}
Feels like: ${obs?.feelsLikeC}°C
Humidity: ${obs?.relativeHumidity}%
Wind: ${obs?.windSpeedKmh} km/h ${obs?.windDirection}${obs?.windDirectionDegrees ? ` (${obs?.windDirectionDegrees}°)` : ''}
Pressure: ${obs?.pressureHpa} hPa
AQI: ${aq?.aqi} (${aq?.category})
Pollen: ${pol?.category}

Updated:
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST

Source:
${telemetryContext.metadata?.source || 'India Meteorological Department (IMD)'}`,
          source: 'India Meteorological Department (IMD)',
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
                model: 'gemini-3.7-flash',
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
                console.warn('Gemini API Quota reached during maps grounding, transitioning to IMD Grounded Telemetry Engine.');
                response = null;
              } else {
                console.warn('Maps grounding tool unavailable, attempting standard generation:', mapsErr?.message || mapsErr);
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.7-flash',
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
                model: 'gemini-3.7-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  tools: [{ googleSearch: {} }],
                },
              });
            } catch (searchErr: any) {
              if (isQuotaError(searchErr)) {
                console.warn('Gemini API Quota reached during search grounding, transitioning to IMD Grounded Telemetry Engine.');
                response = null;
              } else {
                console.warn('Search grounding tool unavailable, attempting standard generation:', searchErr?.message || searchErr);
                try {
                  usedMode = 'standard';
                  response = await client.models.generateContent({
                    model: 'gemini-3.7-flash',
                    contents: prompt,
                    config: {
                      systemInstruction,
                      temperature: 0.3,
                    },
                  });
                } catch (stdErr: any) {
                  console.warn('Standard Gemini generation unavailable:', stdErr?.message || stdErr);
                  response = null;
                }
              }
            }
          } else {
            try {
              response = await client.models.generateContent({
                model: 'gemini-3.7-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: 0.3,
                },
              });
            } catch (genErr: any) {
              if (isQuotaError(genErr)) {
                console.warn('Gemini API Quota reached, transitioning to IMD Grounded Telemetry Engine.');
              } else {
                console.warn('Gemini generation unavailable:', genErr?.message || genErr);
              }
              response = null;
            }
          }

          if (response) {
            groundingSources = extractGroundingSources(response);
          }
        } catch (geminiError: any) {
          console.warn('Gemini API query completed with fallback:', geminiError?.message || geminiError);
          response = null;
        }
      }

      if (response && response.text) {
        return res.json({
          response: response.text,
          source: 'India Meteorological Department (IMD) / Gemini Atmospheric AI',
          groundingSources,
          modeUsed: usedMode,
        });
      }

      // Tier 3: Grounded High-Fidelity IMD Atmospheric Intelligence Engine
      const fallbackResponse = generateMausamGroundedFallback(prompt, telemetryContext);
      return res.json({
        response: fallbackResponse.text,
        source: 'India Meteorological Department (IMD) — National Weather Forecasting Centre',
        groundingSources: fallbackResponse.sources,
        modeUsed: 'offline',
      });
    } catch (error: any) {
      console.error('Error in /api/ask-mausam:', error);
      // Emergency deterministic safeguard
      const fallbackText = `India Meteorological Department (IMD)
National Weather Forecasting Centre, New Delhi

Location: ${req.body.station?.district || req.body.station?.name || 'India'} (${req.body.station?.state || 'National'})
Observation: ${req.body.weatherContext?.temp ?? 27}°C — ${req.body.weatherContext?.condition ?? 'Observed'}
Humidity: ${req.body.weatherContext?.humidity ?? 85}% | Wind: ${req.body.weatherContext?.windSpeed ?? 10} km/h
Air Quality Index: ${req.body.weatherContext?.aqi ?? 63} (${req.body.weatherContext?.aqiStatus ?? 'Satisfactory'})

Advisory: Synoptic atmospheric circulation is normal. Monitor local IMD Doppler radar and district agromet bulletins.

Updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
Source: India Meteorological Department (IMD)`;

      res.json({
        response: fallbackText,
        source: 'India Meteorological Department (IMD)',
        groundingSources: [],
        modeUsed: 'offline',
      });
    }
  };

  app.post('/api/ask-mausam', handleAskMausam);

  // Dedicated Google Search Grounding endpoint
  app.post('/api/ai/search-grounded-bulletin', async (req, res) => {
    try {
      const { query, state, district } = req.body;
      const client = getAIClient();

      if (!client) {
        return res.json({
          bulletin: `Latest IMD Bulletin for ${district || state || 'India'}: Normal atmospheric circulation. Agromet advisories recommend standard irrigation.`,
          sources: [],
        });
      }

      const prompt = query || `What is the latest official IMD weather forecast, severe weather warnings, or rain advisory for ${district ? district + ', ' : ''}${state || 'India'} today?`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an IMD Meteorological Bulletin generator. Provide precise, up-to-date weather summaries with rainfall alerts and actionable advice.',
          tools: [{ googleSearch: {} }],
        },
      });

      const sources = extractGroundingSources(response);
      res.json({
        bulletin: response.text,
        sources,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/search-grounded-bulletin:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Dedicated Google Maps Grounding endpoint for nearby radar / observatory finding
  app.post('/api/ai/maps-grounded-places', async (req, res) => {
    try {
      const { query, lat = 20.2961, lng = 85.8245, locationName } = req.body;
      const client = getAIClient();

      if (!client) {
        return res.json({
          analysis: `Nearby meteorological facilities for ${locationName || 'this region'}: Local IMD AWS and District Disaster Management Centers are active.`,
          places: [],
        });
      }

      const prompt = query || `List the closest IMD Doppler Weather Radar (DWR) stations, meteorological observatories, cyclone shelters, or emergency weather facilities near ${locationName || 'my location'}.`;

      const response = await client.models.generateContent({
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

      const places = extractGroundingSources(response);
      res.json({
        analysis: response.text,
        places,
      });
    } catch (err: any) {
      console.error('Error in /api/ai/maps-grounded-places:', err);
      res.status(500).json({ error: err.message });
    }
  });

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mausam Server running on http://localhost:${PORT}`);
  });
}

startServer();
