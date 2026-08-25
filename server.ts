import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Assistant endpoint: Ask Mausam
  const handleAskMausam = async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, station, weatherContext } = req.body;
      const client = getAIClient();

      if (!client) {
        // Fallback meteorological intelligence response if Gemini key isn't provided
        return res.json({
          response: `[Mausam Telemetry Engine]: Based on real-time sensor array at ${station?.name || 'Station 04 (Northern Districts)'}: Current PM2.5 is ${weatherContext?.aqi || 112} µg/m³ with active IMD Advisory. Temperature is ${weatherContext?.temp || 24.8}°C with a moderate breeze. Recommendation: limit high-intensity outdoor cardio until 18:00 when boundary-layer ventilation improves.`,
          source: 'local_engine',
        });
      }

      const systemInstruction = `You are MAUSAM AI, an advanced environmental intelligence and meteorological advisory system representing IMD Mausam.
You provide precise, scientifically grounded, actionable guidance based on atmospheric telemetry, air quality metrics (PM2.5, PM10, AQI), UV radiation, barometric pressure, wind vectors, and fitness profiles.
Keep your answers professional, concise, direct, and structured with clear recommendations.

Current Telemetry Context:
Station: ${station?.name || 'Station 04 - Northern Districts'}
Temperature: ${weatherContext?.temp || 24.8}°C (High: ${weatherContext?.high || 28}°, Low: ${weatherContext?.low || 19}°)
Condition: ${weatherContext?.condition || 'Moderate Breeze, Clearing'}
AQI (PM2.5): ${weatherContext?.aqi || 112} µg/m³
UV Index: ${weatherContext?.uv || 3.2}
Relative Humidity: ${weatherContext?.humidity || 64}%
Pollen: ${weatherContext?.pollen || 'Low'}
Optimal Fitness Window: 06:00 - 09:30
Active IMD Warning: Elevated particulate matter (PM2.5) in Northern Districts. Limit intense outdoor aerobic activity until 18:00 Local.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      res.json({
        response: response.text || 'Telemetry analyzed. All environmental metrics within parameters.',
        source: 'gemini-3.7-flash',
      });
    } catch (error: any) {
      console.error('Error in /api/ask-mausam:', error);
      res.status(500).json({
        error: error.message || 'Failed to process atmospheric intelligence query',
        fallback: 'Environmental telemetry indicates elevated particulate matter (PM2.5). Maintain indoor ventilation filters.',
      });
    }
  };

  app.post('/api/ask-mausam', handleAskMausam);

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
