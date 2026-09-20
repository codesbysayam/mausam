# MAUSAM — Tasks, Implementation Checklist & Engineering Roadmap

> **Document Version**: 2.4.0  
> **Tracking Status**: Active Execution  
> **Last Verified**: September 2026  

---

## 1. Core Meteorological & Atmospheric Engine

- [x] **Coordinates-First Geocoding Engine**: Implemented reverse and forward geocoding with Indian districts catalog and OpenStreetMap Nominatim fallback.
- [x] **Open-Meteo Multi-Model Ingestion Baseline**: Full integration with ECMWF IFS, NCEP GFS, and DWD ICON numerical weather models for nationwide coverage.
- [x] **IMD Official REST API Proxy**: Express routes under `/api/imd/*` with in-flight deduplication, error handling, and API key forwarding.
- [x] **Synoptic Forecast Normalizer**: Maps WMO standard synoptic codes to human-readable weather descriptions and conditions.
- [x] **Astronomical Ephemeris Engine**: Accurate computation of IST sunrise, sunset, solar noon, daylight duration, and lunar phases using SunCalc.
- [x] **Multi-Tier Resilience Caching**: Local in-memory LRU/TTL cache with support for Upstash Redis REST and stale-while-revalidate policies.
- [ ] **Direct INSAT-3D/3DR Satellite Feeds**: Automated decoder for geostationary thermal infrared and water vapor cloud-top temperature raster maps.
- [ ] **Global Telecommunication System (GTS) WMO BUFR Parser**: Binary synoptic decoder for direct ingestion of international meteorological feeds.

---

## 2. Disaster Warnings & Emergency Audio System

- [x] **NDMA SACHET CAP Feed Parser**: XML and JSON ingestion of Common Alerting Protocol emergency bulletins for cyclone, flood, and severe weather warnings.
- [x] **IMD 4-Tier Color Coding Classification**: Standardized mapping to Green (Normal), Yellow (Watch), Orange (Alert), and Red (Warning).
- [x] **Emergency Meteorological Audio Chime**: Dual-tone broadcast alert audio (`/audio/mausam-alert.mp3` & `.wav`) conforming to official frequency guidelines (853Hz + 960Hz).
- [x] **Warning Fingerprint Deduplication**: Prevents alert fatigue by tracking composite hashes (`source::id::state::hazard::issuedAt`) in `alertAudioService`.
- [x] **Audio Alert Toggle & Volume Controller**: User preference controls integrated into header, alerts page, and persistent `localStorage`.
- [ ] **WebPush District Notifications**: Background service worker push notifications for severe (Orange/Red) weather events.
- [ ] **Automated Multi-lingual Voice Bulletins**: Text-to-speech audio rendering of official warning text in regional Indian languages.

---

## 3. Doppler Weather Radar & Geospatial Mapping

- [x] **IMD 37-Station Doppler Radar Directory**: Complete spatial registry of all operational Indian DWR stations with coordinates and radar bands.
- [x] **Nearest Radar Haversine Resolver**: Auto-detects and suggests the closest Doppler radar station based on user coordinates.
- [x] **RainViewer Global Composite Radar Integration**: Animated multi-frame radar reflectivity tiles (10 to 65+ dBZ) with timestamp scrubber.
- [x] **Interactive Leaflet Map Controls**: Pan, zoom, animated play/pause, time step scrubbing, and layer opacity controls.
- [ ] **Raw HDF5 Radar Volume Scan Rendering**: WebGL-accelerated client-side shader rendering for high-resolution radial radar beams.
- [ ] **Lightning Flash Density Layer**: Integration with IITM Pune / Damini lightning detection sensor networks.

---

## 4. Air Quality (NAQI) & Agrometeorology (AGROMET)

- [x] **CPCB National Air Quality Index (NAQI) Engine**: Mathematical formula calculating sub-indices for PM2.5, PM10, NO2, SO2, CO, and O3 across 6 health tiers.
- [x] **Air Quality Health Guidance Matrix**: Specific medical advisories for sensitive groups, elderly, and general public per NAQI category.
- [x] **Agrometeorological Advisory Engine**: Models for 15 Indian agro-climatic sub-regions computing evapotranspiration ($ET_0$) and soil moisture deficits.
- [x] **Agricultural Spraying & Fieldwork Windows**: Calculates hourly spray feasibility based on wind speed, precipitation risk, and relative humidity.
- [ ] **Crop Phenological Stage Tracking**: Personalized farm crop calendar tracking for Kharif, Rabi, and Zaid cultivation cycles.

---

## 5. UI/UX, Navigation & Mobile Ergonomics

- [x] **Government Meteorological Visual Language**: High-contrast, data-dense dark console design system in Tailwind CSS v4.
- [x] **Fluid Draggable "Ask MAUSAM" AI Button**:
  - Pointer event capture with viewport boundary clamping.
  - Fluid cubic-bezier edge snapping (`requestAnimationFrame` + `cubic-bezier(0.16, 1, 0.3, 1)`).
  - Double-click position reset to bottom-right.
  - Coordinates stored in `localStorage`.
- [x] **Multi-lingual i18n Localization**: Dynamic interface translation supporting English, Hindi, Bengali, Tamil, Telugu, Marathi, and Gujarati.
- [x] **Mobile Drawer Navigation**: High-contrast responsive slide-out navigation with 48px touch targets.
- [x] **High-Contrast Font Scaler**: Global accessibility font resizing controls (`A-`, `A+`) in the header.
- [x] **Skeleton Loading Screens**: Low-CLS shimmering placeholder skeletons for all data panels during initial network fetch.

---

## 6. Architecture, Security & Production Readiness

- [x] **Client-Side Secret Isolation**: 100% of sensitive keys (`GEMINI_API_KEY`, `IMD_API_KEY`, `DATABASE_URL`) maintained strictly on the server.
- [x] **Network AbortController Protection**: 10-second request timeout guards against upstream server hangs and unhandled rejections.
- [x] **Full-Stack Express + Vite Integration**: Production CommonJS compilation (`dist/server.cjs`) via `esbuild` for Cloud Run container hosting.
- [x] **Vercel Serverless Gateway Architecture**: Modular edge functions (`/api/weather`, `/api/warnings`, `/api/radar`, `/api/system`, `/api/ai`).
- [x] **MAUSAM 20-Point Launch Readiness Audit**: Passed all checkpoints (Privacy, Terms, Cookies, API docs, 404 handler, SEO).
- [x] **Repository Documentation Suite**: Complete canonical documentation in `docs/` (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY).
- [x] **Website Interactive Documentation Portal**: Built-in `/docs` interactive technical documentation viewer.
- [ ] **Automated E2E Playwright Suite**: Automated cross-browser testing for desktop and mobile touch gestures.
- [ ] **PostgreSQL Telemetry Archive**: Periodic archiving of synoptic hourly observations for climate research.
