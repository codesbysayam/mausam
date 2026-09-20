# MAUSAM — System Architecture & Technical Specifications

> **Document Version**: 2.4.0  
> **Source of Truth**: Active Production Codebase  
> **Platform**: Full-Stack Node.js (Express + Vite) / Vercel Serverless  
> **Last Updated**: September 2026  

---

## 1. Architectural Overview & System Topology

MAUSAM employs a **hybrid full-stack isomorphic architecture**. It runs natively as a unified Express + Vite application in local container environments (Google Cloud Run / Docker) while simultaneously exposing modular serverless functions compatible with edge deployments (Vercel):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT APPLICATION (SPA)                              │
│  React 19 • TypeScript 5.8 • Vite 6 • Tailwind CSS v4 • Leaflet • Recharts • Lucide    │
│  LocationContext (GPS / Nominatim) │ LanguageContext (7 Languages) │ useAlertAudio     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND ROUTING & GATEWAYS                               │
│                                                                                        │
│   [ Cloud Run / Local Container: Express 4.21 ]   │   [ Vercel Edge Serverless ]       │
│   • server.ts (Entrypoint on port 3000)          │   • /api/weather.ts                │
│   • /api/warnings (NDMA CAP & IMD)               │   • /api/warnings.ts               │
│   • /api/imd/* (Direct IMD Proxy)                │   • /api/radar.ts                  │
│   • /api/v2/* (Multi-source Open Data)           │   • /api/system.ts                 │
│   • /api/ask-mausam (Gemini AI + Grounding)      │   • /api/ai.ts                     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌────────────────────────────────────────┐
│       CACHING & RESILIENCE LAYER      │       │     EXTERNAL DATA INGESTION ENGINE     │
│  • In-Memory Map Cache (60s - 300s)   │       │  1. IMD API (api.imd.gov.in)           │
│  • In-Flight Request Deduplication    │       │  2. NDMA SACHET (sachet.ndma.gov.in)   │
│  • Upstash Redis REST (Configurable)  │◄─────►│  3. Open-Meteo (ECMWF, GFS, ICON)      │
│  • Stale-While-Revalidate Engine      │       │  4. CPCB National AQI Registry         │
│  • AbortController Timeouts (10s)     │       │  5. RainViewer Radar Mosaic Tile API   │
│  • PostgreSQL Pool (Historical Data)  │       │  6. Google Gemini 2.5 AI SDK           │
└───────────────────────────────────────┘       └────────────────────────────────────────┘
```

---

## 2. Directory & Component Structure

```
├── api/                             # Consolidated Vercel serverless function gateways
│   ├── ai.ts                        # Gemini AI chat endpoint with grounding
│   ├── radar.ts                     # Radar stations directory & RainViewer tile proxy
│   ├── system.ts                    # Health checks, readiness probes, provider audits
│   ├── warnings.ts                  # NDMA SACHET CAP warnings & IMD alert processor
│   └── weather.ts                   # Weather bundle aggregator (current, hourly, daily)
├── docs/                            # Canonical project documentation
│   ├── PRD.md                       # Product Requirements Document
│   ├── ARCHITECTURE.md              # System Architecture (this document)
│   ├── RULES.md                     # Development Rules & Anti-Fabrication Mandate
│   ├── DESIGN.md                    # Design System & Visual Specification
│   ├── TASKS.md                     # Roadmap, Tasks & Implementation Checklist
│   ├── MEMORY.md                    # Persistent Project Context & Decisions
│   └── IMD-INTEGRATION.md           # IMD Specific WMO Synoptic Architecture
├── public/                          # Static production assets
│   ├── audio/                       # Official meteorological alert audio assets
│   │   ├── mausam-alert.mp3         # Master emergency notification chime
│   │   └── mausam-alert.wav         # Uncompressed fallback audio asset
│   ├── css/                         # Static stylesheets for OpenAPI documentation
│   └── docs/                        # Static HTML documentation exports
├── server/                          # Server-side routing and business logic
│   ├── ai/                          # Master prompt templates and grounded AI logic
│   ├── database/                    # PostgreSQL client and schema definitions
│   └── routes/                      # Modular Express routers (IMD, warnings, unified)
├── src/                             # Client-side React 19 application
│   ├── components/                  # Reusable UI component library
│   │   ├── common/                  # Skeletons, audio toggles, draggable button
│   │   ├── layout/                  # GovernmentHeader, MainNavigation, Footer, MobileNav
│   │   ├── location/                # Location search modal, GPS button, privacy modal
│   │   ├── map/                     # Leaflet weather maps, radar overlays, state layers
│   │   └── weather/                 # Temperature cards, hourly scroller, 7-day grid
│   ├── context/                     # Global React contexts (LocationContext)
│   ├── data/                        # Static metadata, stations directory, publications
│   ├── hooks/                       # Custom React hooks (useAlertAudio, useNetworkStatus)
│   ├── i18n/                        # Multi-language translations and language context
│   ├── pages/                       # Route pages (Home, Weather, Radar, Alerts, Docs, etc.)
│   ├── services/                    # Client services (weatherService, alertAudioService)
│   ├── styles/                      # Tailwind CSS v4 styling rules (mausam.css)
│   └── types/                       # Core TypeScript interfaces, types, and enums
├── server.ts                        # Express server entry point & Vite middleware setup
├── vite.config.ts                   # Vite bundler configuration
└── package.json                     # Project manifest and scripts
```

---

## 3. Data Pipelines & Flow Sequences

### 3.1 Weather Observation & Forecast Pipeline
1. **Client Coordinate Dispatch**: Client sends coordinate pair `(latitude, longitude)` via `weatherService.getWeatherBundle()`.
2. **In-Flight Deduplication**: The API layer checks if an identical coordinate request is already pending; if so, it attaches to the existing promise to eliminate redundant upstream calls.
3. **Cache Evaluation**: Checks in-memory cache and Upstash Redis. If cached and valid (`< TTL`), returns immediately with an `age` header.
4. **Primary Provider Selection**:
   - If `IMD_API_KEY` is configured in environment: dispatches authenticated request to `api.imd.gov.in/api/v1/current_wx` and `/cityforecast`.
   - If IMD is unconfigured or returns HTTP >= 400: seamlessly falls back to Open-Meteo High-Resolution Numerical Models (ECMWF IFS, GFS, ICON).
5. **Synoptic Normalization**: Raw API response is parsed through `forecastNormalizer.ts`, mapping WMO weather codes to human-readable Indian weather conditions, calculating apparent temperature, and establishing valid bounds.
6. **Data Enrichment**: Astronomical ephemeris (SunCalc) is computed for local sunrise, sunset, and solar elevation.
7. **Cache Write & Client Response**: Normalization output is written to cache and dispatched to the client.

### 3.2 Warning & Disaster Alert Pipeline
1. **Upstream Ingestion**: Periodic polling fetches NDMA SACHET Common Alerting Protocol (CAP) XML/JSON feeds and IMD district warning tables.
2. **Alert Parsing & Geofencing**: `alertParser.ts` parses polygons and FIPS/district codes, matching the user's selected coordinates against active hazard areas.
3. **Severity Normalization**: Advisories are mapped to standard 4-color severity levels:
   - Green (1 / Normal)
   - Yellow (2 / Watch)
   - Orange (3 / Alert)
   - Red (4 / Warning)
4. **Audio Alert Fingerprinting**: The `alertAudioService` computes an SHA-style composite key for incoming alerts: `source::id::state::hazard::issuedAt`.
5. **Auditory Notification**: If an incoming alert is Orange or Red, the user has enabled audio alerts, and the fingerprint has not been played in the current session, the official emergency tone (`/audio/mausam-alert.mp3`) is triggered with smooth gain leveling.

### 3.3 Doppler Weather Radar (DWR) Pipeline
1. **Station Metadata Registry**: Maintains spatial index of 37 operational IMD Doppler Weather Radars with coordinates, band types (C-band, S-band, X-band), and operational statuses.
2. **Nearest Radar Resolver**: Given user coordinates, calculates great-circle haversine distance to locate the nearest IMD radar station.
3. **Composite Radar Tiles**: Interfaces with RainViewer global radar composite API to fetch timestamped PNG radar reflectivity tiles (10 dBZ to 65+ dBZ).
4. **Temporal Animation**: Leaflet raster layers are preloaded across 10-minute intervals, enabling smooth user-controlled animation scrubbers with play, pause, and speed controls.

### 3.4 Agrometeorology (AGROMET) Pipeline
1. **Agro-Climatic Mapping**: Resolves coordinates to one of 15 Indian agro-climatic sub-regions.
2. **Agronomic Calculations**: Evaluates temperature range, relative humidity, wind speed, and 7-day cumulative rainfall forecast to derive:
   - Reference Evapotranspiration ($ET_0$) via modified Penman-Monteith equation.
   - Soil Moisture Depletion Index.
   - Thermal Stress Index for Kharif / Rabi crops.
   - Spraying Feasibility Window (wind speed < 15 km/h, precipitation probability < 30%, humidity between 40% and 80%).
3. **Pest & Disease Advisory**: Emits targeted advisories (e.g., fungal blast risk in rice during high humidity, aphid infestation risk in wheat).

---

## 4. External Data Sources & Provenance Matrix

| Provider | Endpoint / Feed | Protocol | Auth Method | Role in System | Fallback Provider |
|---|---|---|---|---|---|
| **India Meteorological Department (IMD)** | `https://api.imd.gov.in/api/v1/` | HTTPS REST | Bearer Token / API Key (`IMD_API_KEY`) | Official Primary Source (Observations & Warnings) | Open-Meteo NWP |
| **NDMA SACHET** | `https://sachet.ndma.gov.in/` | HTTPS CAP / REST | Public / Bearer Token | Official Disaster Warnings (Floods, Cyclones, Heatwaves) | IMD District Warnings |
| **Open-Meteo** | `https://api.open-meteo.com/v1/forecast` | HTTPS REST | None (Free-first Open Access) | High-Resolution Numerical Forecast Baseline (ECMWF, GFS) | Local Cache |
| **Central Pollution Control Board (CPCB)** | `https://app.cpcbccr.com/caaqms/` | HTTPS REST | Public Open Data | Official Ground AQI Stations | Open-Meteo CAMS Air Quality |
| **RainViewer API** | `https://api.rainviewer.com/public/weather-maps.json` | HTTPS JSON / Tile | None (Public Open Access) | Live Radar Reflectivity Tiles | IMD DWR Static Imagery |
| **INCOIS** | `https://incois.gov.in/portal/` | HTTPS REST / Scraping | Public Data Feeds | Coastal Waves, Swell, SST, Tides | Marine Numerical Models |
| **OpenStreetMap Nominatim** | `https://nominatim.openstreetmap.org/` | HTTPS REST | User-Agent Header | Geographic Reverse & Forward Geocoding | Internal Indian District Index |
| **Google Gemini API** | Google Gen AI SDK (`@google/genai`) | HTTPS RPC | API Key (`GEMINI_API_KEY`) | "Ask MAUSAM" Natural Language Meteorological Assistant | Structured Grounded Telemetry Fallback |

---

## 5. Security & Secrets Management

1. **Zero Client-Side Secrets**:
   - Environment variables prefixed with `VITE_` are considered public and visible in browser bundles.
   - Sensitive credentials (`GEMINI_API_KEY`, `IMD_API_KEY`, `IMD_API_TOKEN`, `DATABASE_URL`, `UPSTASH_REDIS_REST_TOKEN`) are strictly confined to server-side code (`server.ts`, `api/*`, `server/*`).
2. **Reverse Proxy Architecture**: All browser requests communicate exclusively with local `/api/*` endpoints. Third-party URLs and tokens are never directly queried by the client.
3. **Timeout & Abuse Protection**: All outgoing fetch operations instantiate an `AbortController` with a strict 10-second timeout to prevent zombie connections.
4. **Input Sanitization**: User search terms and latitude/longitude parameters are validated with strict type clamping and regex sanitization prior to database or API queries.

---

## 6. Deployment Architecture

### 6.1 Container Deployment (Cloud Run / Docker)
- **Runtime**: Node.js 22 LTS on Linux.
- **Ingress Port**: Binds strictly to `0.0.0.0:3000`.
- **Build Step**:
  ```bash
  npm run build
  # Executes: vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
  ```
- **Start Command**: `npm start` -> `node dist/server.cjs`.
- **Self-Contained Bundle**: `esbuild` compiles the entire backend server into a single CommonJS artifact (`dist/server.cjs`), eliminating Node ESM runtime relative path resolution failures.

### 6.2 Serverless Deployment (Vercel)
- Configured via root `vercel.json` routing all `/api/*` traffic to modular TypeScript handlers inside `api/`:
  - `/api/weather` -> `api/weather.ts`
  - `/api/warnings` -> `api/warnings.ts`
  - `/api/radar` -> `api/radar.ts`
  - `/api/system` -> `api/system.ts`
  - `/api/ai` -> `api/ai.ts`
- Static frontend SPA served directly from root output directory with single-page application fallback rewriting.
