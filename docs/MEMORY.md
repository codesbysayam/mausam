# MAUSAM — Architectural Memory & Persistent Project Context

> **Document Purpose**: Long-Term Project Context, Architectural Decision Records (ADRs), and Non-Negotiable Tenets for Engineers & AI Agents  
> **Classification**: Core Knowledge Base (No Secrets / Passwords / Private Keys)  
> **Last Updated**: September 2026  

---

## 1. Core Architectural Tenets (Non-Negotiable)

1. **Anti-Fabrication Policy**:
   - Under NO circumstances should simulated or synthetic weather values be generated to mask upstream downtime.
   - If an API or sensor fails, return `UNAVAILABLE` or switch transparently to a secondary verified open numerical model (Open-Meteo) with explicit attribution.
   - Never label a service as `LIVE` or `OPERATIONAL` if it is unconfigured.
2. **Strict Server-Side Key Isolation**:
   - Never expose API keys (`GEMINI_API_KEY`, `IMD_API_KEY`, `DATABASE_URL`, `UPSTASH_REDIS_REST_TOKEN`) in frontend code.
   - All external authenticated traffic must pass through local server proxies (`/api/*`).
3. **Coordinates-First Geospatial Anchoring**:
   - Weather observations and forecasts must always be anchored to numeric coordinates `(latitude, longitude)`.
   - City names and district labels are presentation attributes resolved from coordinates, never the underlying primary key for meteorological calculations.

---

## 2. Key Architecture Decision Records (ADRs)

### ADR-001: Hybrid Full-Stack Runtime (Express Container + Vercel Functions)
- **Context**: The project must run flawlessly in local Docker/Cloud Run containers (listening on port 3000) while also supporting frictionless deployment to Vercel edge infrastructure.
- **Decision**: Maintained dual-mode entrypoints:
  - `server.ts` boots Express with Vite middleware in development and serves pre-bundled static assets in production (`dist/server.cjs` via `esbuild`).
  - Consolidated handlers under `api/*.ts` (`weather.ts`, `warnings.ts`, `radar.ts`, `system.ts`, `ai.ts`) serve Vercel serverless functions using identical service logic.
- **Consequences**: Zero deployment lock-in; runs anywhere Node.js or serverless is supported.

### ADR-002: Free-First Data Ingestion Hierarchy
- **Context**: Access to the official IMD API requires governmental credentials or whitelisting that may not be available in local development or public mirrors.
- **Decision**: Implemented an automated fallback hierarchy:
  1. Primary: Official IMD API (if `IMD_API_KEY` is present and valid).
  2. Baseline Fallback: Open-Meteo Open-Access Numerical Weather Prediction API (ECMWF IFS, GFS, ICON).
  3. Caching: Upstash Redis + In-memory Map cache with stale-while-revalidate TTL.
- **Consequences**: The application is 100% operational out of the box without requiring paid commercial API credentials.

### ADR-003: Emergency Meteorological Alert Audio Standard
- **Context**: Generic musical tones or playful notification sounds diminish the urgency of life-critical weather warnings.
- **Decision**: Replaced all experimental audio with the official dual-frequency broadcast alert tone (`mausam-alert.mp3` and `mausam-alert.wav`) operating at 853Hz and 960Hz.
- **Consequences**: Aligns with international and national civil defense standards; requires explicit user opt-in to respect browser autoplay restrictions.

### ADR-004: Fluid Physics-Based Floating Action Button
- **Context**: A draggable floating button that jumps or snaps abruptly feels unpolished and disrupts user reading flow.
- **Decision**: Implemented viewport clamping with `requestAnimationFrame` and CSS easing curve `cubic-bezier(0.16, 1, 0.3, 1)` over 420ms. Added double-click to reset coordinates.
- **Consequences**: Natural, fluid dock experience across both desktop mouse dragging and mobile touch events.

---

## 3. Previous Problems & Verified Solutions

| Issue Encountered | Root Cause | Implemented Resolution |
|---|---|---|
| **Draggable button jumping on release** | Browser applied `transition: none` and new coordinates in the same batched React render frame. | Separated drag state from snapping state (`isSnapping`). Wrapped target coordinate update in `requestAnimationFrame` with transition curve `cubic-bezier(0.16, 1, 0.3, 1)`. |
| **Alert sound playing repeatedly** | Component re-renders triggered the audio player on every state change. | Introduced SHA-style fingerprint hashing (`source::id::state::hazard::issuedAt`) in `alertAudioService` singleton. Only unplayed hashes trigger the chime. |
| **Node ESM relative import crashes in production** | Node's strict runtime ESM loader fails on extensionless imports in production builds. | Configured `esbuild` in `npm run build` to bundle `server.ts` into a self-contained CommonJS artifact `dist/server.cjs` with `--packages=external`. |
| **Process termination on unexpected socket disconnects** | Unhandled upstream network rejections killed the Express server process. | Added process-level safety listeners (`uncaughtException` and `unhandledRejection`) in `server.ts` with diagnostic logging. |
| **Mobile horizontal layout stretching on narrow screens** | Fixed pixel widths (`w-[320px]`, `w-[800px]`) and wide data tables forced viewport overflow on screens <= 375px. | Replaced fixed pixel widths with fluid responsive classes (`w-full max-w-[...]`), refactored data tables in Reports and Air Quality pages to render high-contrast 'stacked' card layouts on mobile viewports (`md:hidden` / `sm:hidden`), wrapped remaining wide tables in `overflow-x-auto` scroll containers, and verified responsive compliance across 320px, 375px, 768px, 1024px, 1440px, and 1920px. |

---

## 4. Known Limitations & Operating Assumptions

1. **IMD Direct API Access**:
   - The official IMD API (`api.imd.gov.in`) enforces token-based authentication and IP whitelisting for certain endpoints.
   - When credentials are not provided, the platform functions seamlessly using the Open-Meteo numerical weather baseline, while transparently labeling the source.
2. **Doppler Radar Frame Latency**:
   - Upstream global radar composites (RainViewer) generally lag live radar volume scans by 10 to 15 minutes due to mosaic stitching times.
3. **Browser Audio Autoplay Policies**:
   - Modern browsers block unprompted audio playback until the user has interacted with the document. Audio alerts are therefore disabled by default until the user explicitly enables them in the UI.

---

## 5. Instructions for Future Developers & AI Agents

1. **Preserve the 20-Point Launch Readiness Audit**:
   - Never delete legal pages (`/terms`, `/privacy`), the cookie consent modal, the OpenAPI specification (`/api`), or the 404 boundary (`/not-found`).
2. **Preserve Design Integrity**:
   - Maintain the "Government Meteorological Operational Console" visual identity. Do not introduce light-mode neon gradients, floating drop shadows, or unstyled controls.
3. **Keep `docs/` Updated**:
   - Whenever a major architectural change or new service pipeline is introduced, update both `docs/ARCHITECTURE.md` and `docs/TASKS.md`.
