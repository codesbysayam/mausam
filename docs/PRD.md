# MAUSAM — Product Requirements Document (PRD)

> **Document Version**: 2.4.0  
> **Status**: APPROVED / ACTIVE  
> **Classification**: Public Meteorological Platform  
> **Last Updated**: September 2026  

---

## 1. Executive Summary & Purpose

**MAUSAM** (मौसम — Sanskrit/Hindi for *Atmosphere / Season / Weather*) is a high-precision, coordinates-first atmospheric intelligence platform purpose-built for the Indian subcontinent. It aggregates, normalizes, and delivers real-time surface meteorological observations, numerical weather predictions (NWP), Doppler Weather Radar (DWR) nowcasts, disaster alerts, National Air Quality Index (NAQI) telemetry, coastal ocean dynamics, and agrometeorological advisories.

### The Problem Statement
India spans 3.287 million square kilometers across diverse agro-climatic zones—from alpine Himalayan terrain and Gangetic plains to arid Thar deserts and tropical peninsular coastlines. Weather events directly influence the safety and livelihoods of over 1.4 billion people, with more than 50% of the workforce engaged in climate-sensitive agriculture. 

However, existing public interfaces face critical systemic deficiencies:
1. **Fragmented Data Ecosystems**: Official Indian atmospheric data is scattered across separate governmental portals (IMD, CPCB, NDMA/SACHET, INCOIS, state disaster portals) without a consolidated, high-performance API or modern responsive interface.
2. **Prevalence of Synthetic / Fabricated Weather**: Commercial weather apps frequently extrapolate, simulate, or fabricate values when upstream sensors fail, displaying fictitious temperatures or phantom rainfall rather than reporting sensor outages.
3. **Restrictive Commercial Paywalls**: High API licensing fees prevent citizens, developers, and researchers from accessing hyper-local Indian weather without subscription costs.
4. **Siloed Agrometeorological Guidance**: Farmers frequently lack actionable, hyper-local guidance translating weather forecasts into operational farming decisions (spray windows, soil moisture deficits, pest disease risks, livestock heat stress).

### The Solution: MAUSAM
MAUSAM bridges these gaps by delivering an authoritative, zero-fabrication, free-first platform that synthesizes verified national government data feeds with global open-access numerical weather prediction baselines, anchored by an accessible, responsive design system.

---

## 2. Target Personas & User Scenarios

| Persona | Demographics & Context | Primary Needs & Jobs to Be Done | Key MAUSAM Features Used |
|---|---|---|---|
| **Urban Citizen / Daily Commuter** | Working professionals and students in metropolitan and Tier 2/3 cities. | Real-time temperature, precipitation probability, hourly forecast for transit planning, NAQI air pollution levels. | Current Weather, Hourly Timeline, Air Quality (NAQI), Draggable "Ask MAUSAM" AI. |
| **Farmer / Agricultural Producer** | Smallholders and commercial farmers across rural India. | Monsoon progression, 7-day rainfall volume, soil moisture, spraying advisories, frost/heatwave risk. | AGROMET Portal, Crop Advisories, Rainfall Departure, District Warnings. |
| **Fisherman / Maritime Operator** | Coastal fisherfolk, port authorities, and merchant vessels in the Arabian Sea & Bay of Bengal. | Wave height, swell direction, sea surface temperature, gale warnings, cyclonic storm tracks, port warning signals. | Coastal & Marine Intelligence, Cyclone Track/Wind Radius, Port Warnings. |
| **Disaster Response & SDMA Officer** | State Disaster Management Authorities, civil defense, municipal relief teams. | Real-time severe weather bulletins, flash flood risks, CAP alert dissemination, radar reflectivity for convective cells. | NDMA SACHET CAP Warnings, DWR Doppler Radar, Audio Emergency Chime, Flood Guidance. |
| **Researcher / Software Developer** | Academic meteorologists, data scientists, civic tech developers. | Programmatic access to standardized synoptic observations, WMO standards compliance, OpenAPI schemas. | Open Data API (`/api/v2`), OpenAPI v3 Specification, Diagnostic Health Endpoints. |

---

## 3. Core Objectives & Guiding Principles

1. **Coordinates-First Architecture**: Every query is anchored to geographic coordinates (latitude and longitude), eliminating ambiguous city-center inaccuracies and ensuring precise hyper-local forecasting.
2. **Strict Zero-Fabrication Mandate**: Data provenance is strictly enforced. If an upstream sensor is offline or an API is unconfigured, the system explicitly reports `UNAVAILABLE` or `NOT CONFIGURED`. Synthetic values are strictly forbidden.
3. **Free-First Operational Baseline**: Full national coverage for forecasts, radar, air quality, and warnings is delivered without requiring commercial API keys, utilizing open numerical models (ECMWF, GFS, ICON) and open government feeds.
4. **National Protocol Alignment**: Full compliance with official Indian standards:
   - IMD color-coded warning system (Green, Yellow, Orange, Red).
   - Central Pollution Control Board (CPCB) NAQI 6-tier breakpoints.
   - NDMA SACHET Common Alerting Protocol (CAP ITU-T X.1303).
5. **Universal Accessibility (WCAG 2.1 AA)**: High-contrast palettes, accessible typography, screen-reader landmarks, bilingual translations, and smooth keyboard navigation.

---

## 4. Functional Scope & Module Specifications

### 4.1 Real-Time Surface Meteorological Observations
- **Parameters**: Dry-bulb temperature (°C), apparent "feels-like" temperature, relative humidity (%), barometric pressure (hPa/mb), wind speed (km/h) and direction (cardinal + degrees), wind gust (km/h), dew point (°C), visibility (km), UV index, and 24-hour cumulative rainfall (mm).
- **Ephemeris Data**: Precise sunrise, sunset, solar noon, daylight duration, moonrise, moonset, and lunar phase calculated via astronomical algorithms (SunCalc) synchronized to Indian Standard Time (IST, UTC+5:30).

### 4.2 Medium-Range Forecast & Synoptic Evolution
- **Hourly Timeline**: 24-to-48-hour continuous progression of temperature, precipitation probability (PoP %), convective rain accumulation, cloud cover (%), and wind vectors.
- **7-Day Daily Outlook**: Minimum and maximum temperatures, prevailing weather icons, weather descriptions, cumulative rainfall estimates, and dominant wind conditions.
- **Multi-Model Consensus**: Dynamic ensemble synthesis across leading global numerical models (ECMWF IFS, NCEP GFS, DWD ICON, MeteoFrance ARPEGE) alongside IMD regional model outputs.

### 4.3 Severe Weather & Disaster Warnings (SACHET / NDMA / IMD)
- **Warning Ingestion**: Ingests Common Alerting Protocol (CAP) feeds from NDMA SACHET and IMD district bulletins.
- **Severity Classification**:
  - `Green (Normal)`: No advisory; standard atmospheric conditions.
  - `Yellow (Watch / Be Updated)`: Moderate weather risk; tracking required.
  - `Orange (Alert / Be Prepared)`: Severe weather imminent; potential disruption.
  - `Red (Warning / Take Action)`: Extreme hazardous event; life-safety threat.
- **Audible Warning System**: Official dual-frequency emergency tone (853Hz + 960Hz) conforming to meteorological broadcast standards with user opt-in controls, volume adjustment, and duplicate suppression.

### 4.4 Doppler Weather Radar (DWR) Nowcasting
- **National DWR Network**: Interactive access to 37+ operational IMD Doppler Weather Radar installations (e.g., Delhi, Mumbai, Kolkata, Chennai, Bhubaneswar, Srinagar, Kochi, Patna, Agartala).
- **Radar Products**: Reflectivity (dBZ) for precipitation intensity, Max-Z convective storm tracking, Plan Position Indicator (PPI), and animated RainViewer radar mosaic integration.

### 4.5 National Air Quality Index (NAQI / CPCB)
- **Sub-Index Calculation**: Computes AQI according to Indian CPCB standards using PM2.5, PM10, NO2, SO2, CO, and O3 concentrations.
- **NAQI Categories**:
  - `0 - 50`: Good (Minimal impact)
  - `51 - 100`: Satisfactory (Minor breathing discomfort to sensitive people)
  - `101 - 200`: Moderate (Breathing discomfort to people with lungs, asthma)
  - `201 - 300`: Poor (Breathing discomfort to most people on prolonged exposure)
  - `301 - 400`: Very Poor (Respiratory illness on prolonged exposure)
  - `401 - 500`: Severe (Affects healthy people and seriously impacts those with existing diseases)

### 4.6 Coastal & Marine Intelligence (INCOIS)
- **Ocean Dynamics**: Significant wave height (m), primary swell direction, swell period (s), sea surface temperature (SST °C), and tidal predictions for coastal districts.
- **Safety Advisories**: High wave alerts, rough sea warnings, and port warning danger signals (Signal I through Signal XI).

### 4.7 Agrometeorology (AGROMET) & Agronomic Engine
- **Agro-Climatic Zones**: Specialized models covering 15 major Indian agro-climatic regions.
- **Operational Indices**: Soil moisture index, evapotranspiration (ET0), crop heat stress, disease risk index, and optimal pesticide spraying windows based on humidity and wind thresholds.

### 4.8 "Ask MAUSAM" AI Atmospheric Assistant
- **Engine**: Powered by Google Gemini with strict anti-fabrication grounding.
- **Capabilities**: Translates raw meteorological metrics into natural language advisories in English, Hindi, Bengali, Tamil, Telugu, Marathi, and Gujarati.
- **Grounding**: Integrates Google Search and Maps grounding with fallback to structured, truthful telemetry when external AI quota is exhausted.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Latency
- **API Response Times**: Cached responses served in `< 50ms`. Uncached upstream aggregation completed in `< 1200ms`.
- **Core Web Vitals**: Target Largest Contentful Paint (LCP) `< 2.0s`, First Input Delay (FID) `< 50ms` (or INP `< 150ms`), and Cumulative Layout Shift (CLS) `< 0.05`.
- **Bundle Optimization**: Initial JavaScript bundle `< 200KB` gzipped via route-based code splitting and dynamic component lazy loading.

### 5.2 Reliability & Fault Tolerance
- **Service Availability**: 99.9% uptime target.
- **Graceful Degradation**: Multi-tier provider fallback (IMD -> Open-Meteo -> Localized Cache). The UI never displays blank screens; defensive error boundaries catch and display actionable guidance.
- **Request Deduplication**: In-flight HTTP request merging prevents stampeding herd problems during regional weather spikes.

### 5.3 Security & Data Privacy
- **Zero Client-Side Secrets**: Private API keys (`GEMINI_API_KEY`, `IMD_API_KEY`, `DATABASE_URL`) are strictly isolated on server-side endpoints.
- **Content Security Policy (CSP)**: Strict headers configured in `vercel.json` and Express middleware.
- **Privacy-First Geolocation**: User GPS coordinates are processed strictly client-side or ephemerally; location history is stored in browser `localStorage` with explicit opt-in and clearing controls.

### 5.4 Accessibility & Inclusivity
- **WCAG 2.1 AA Compliance**: Contrast ratios >= 4.5:1 for body text and >= 3.0:1 for graphical UI elements.
- **Keyboard Navigation**: Complete focus management, visible focus rings, and skip-to-content links.
- **Touch Targets**: Minimum 44x44px touch targets on mobile viewports.

---

## 6. Current Scope vs. Future Roadmap

| Capability | Current Scope (v2.4 Implemented) | Future Scope (v3.0 Planned) |
|---|---|---|
| **Weather Ingestion** | Open-Meteo multi-model + IMD API connector layer | Direct GTS / WMO synoptic binary (BUFR) decoder |
| **Radar** | 37 IMD stations directory + RainViewer live radar tiles | Real-time raw HDF5 volume scan rendering via WebGL |
| **Disaster Alerts** | NDMA SACHET CAP feeds + Color-coded IMD district alerts | WebPush push notifications & SMS broadcast integration |
| **Air Quality** | CPCB NAQI formula calculation + Copernicus CAMS data | IoT micro-sensor network crowdsourced calibration |
| **Audio Warning** | High-priority dual-frequency alert audio engine | Spoken multilingual synthesized voice bulletins |
| **Mobile Platforms** | Responsive Progressive Web App (PWA) with offline shell | Native Android / iOS applications via Capacitor |
