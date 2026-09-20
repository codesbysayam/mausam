# MAUSAM — Engineering Standards & Development Rules

> **Document Version**: 2.4.0  
> **Enforcement Level**: STRICT / NON-NEGOTIABLE  
> **Scope**: All Developers, Contributors, and AI Coding Agents  
> **Last Updated**: September 2026  

---

## 1. Absolute Directives: Zero-Fabrication & Truthful Provenance

### 1.1 The Anti-Fabrication Rule
**Never output synthetic, mocked, or simulated meteorological numbers under the guise of real data.**
- If an upstream data provider (IMD, CPCB, NDMA, Open-Meteo) fails, times out, or is unconfigured, the system **MUST** clearly label the state as `UNAVAILABLE`, `NOT CONFIGURED`, or `OFFLINE`.
- **FORBIDDEN**: Random number generators (`Math.random() * 30 + 10`), fake temperature strings, invented radar dBZ values, or dummy warning bulletins presented as active observations.
- When an upstream service is down, display a transparent fallback message or switch to an authorized secondary open numerical model with explicit attribution.

### 1.2 Truthful Operational Status Reporting
**Never falsely claim production functionality is `LIVE`, `OPERATIONAL`, or `VERIFIED` when the underlying service is unconfigured or failing.**
- If `IMD_API_KEY` is not present in the runtime environment:
  - System diagnostics must report IMD Status as `NOT CONFIGURED`.
  - Weather cards must display the active operational provider: `Open-Meteo (ECMWF/GFS Baseline)`.
  - Do NOT display "Connected to IMD Official API" unless verified by an active HTTP 200 ping.

### 1.3 Strict Source Attribution
Every data point displayed in MAUSAM must have an auditable provenance trail:
- Observations must state the collecting network (e.g., *IMD AWS Station*, *CPCB CAAQMS*, *Open-Meteo Global Model*).
- Warnings must state the issuing authority (e.g., *National Disaster Management Authority - SACHET*, *IMD Regional Meteorological Centre*).

---

## 2. Security & Credentials Architecture

### 2.1 Zero Secrets in Client Bundles
- **All private API keys and tokens must remain exclusively on the server.**
- Allowed on client: Only non-sensitive variables prefixed with `VITE_` (e.g., `VITE_APP_VERSION`, `VITE_MAP_TILES_URL`).
- **STRICTLY PROHIBITED ON CLIENT**:
  - `GEMINI_API_KEY`
  - `IMD_API_KEY` / `IMD_API_TOKEN`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `DATABASE_URL` / PostgreSQL passwords
- If the frontend needs to trigger an external API, it must invoke a local proxy endpoint under `/api/*`.

### 2.2 Defensive Network Fetching
Every server-side and client-side HTTP request must implement:
1. **AbortController Timeout**: Enforce a strict timeout (maximum 10,000ms).
2. **Safe Try-Catch Encapsulation**: Never allow an unhandled upstream network rejection to crash the server or freeze the client rendering loop.
3. **HTTP Error Status Inspection**: Explicitly check `response.ok` before attempting `.json()` deserialization.

---

## 3. TypeScript & Code Quality Conventions

### 3.1 Strict Typing Discipline
- **No Implicit `any`**: All variables, props, parameters, and return types must be explicitly typed.
- **Top-Level Imports**: Place all imports at the top of files.
- **Standard Enums**: Use standard TypeScript `enum` declarations. Do NOT use `const enum`.
- **Type Segregation**: Place shared domain models in `src/types/` or `src/types.ts`. Do not define duplicate ad-hoc interfaces across multiple component files.

### 3.2 Modularity & File Size Limits
- **Maximum File Length**: Strive to keep files under 400 lines. Split large views into cohesive sub-components inside `src/components/`.
- **Single Responsibility Principle**:
  - Components handle presentation and UI state.
  - Services (`src/services/`) handle data fetching, caching, and transformation.
  - Contexts (`src/context/`) manage cross-cutting application state (e.g., location, language).

### 3.3 Icons & Assets
- **Lucide Icons**: All application icons **MUST** be imported from `lucide-react`.
- **No Custom Inline SVGs**: Do not write ad-hoc inline SVGs for standard icons; use standard Lucide components for visual consistency.
- **Image Assets**: React `<img>` tags must include `referrerPolicy="no-referrer"` and descriptive `alt` text.

---

## 4. Design System & Styling Rules

### 4.1 Tailwind CSS Exclusivity
- All visual styling must use **Tailwind CSS v4** utility classes.
- Do NOT create separate component-level `.css` files (e.g., `Home.css`, `Weather.css`).
- Do NOT use inline `style={{ ... }}` attributes except for dynamic coordinate positioning (e.g., draggable coordinates, chart dimensions).

### 4.2 Color Palette & Semantic Tokens
Use defined theme tokens from `src/styles/mausam.css`:
- **Background Deep Canvas**: `#071A2D` (Primary Oceanic)
- **Panel Surface**: `#0B263D` (Surface Card)
- **Primary Accent**: `#0B72B9` (Deep Blue) / `#38BDF8` (Sky Highlight)
- **Text Contrast**: `#FFFFFF` (Primary Text), `#AFC4D8` (Secondary), `#8EA3B8` (Muted)
- **Disaster Severity Standards**:
  - Green (Normal / Clear): `#00E676` / `#00C853`
  - Yellow (Watch / Advisory): `#F1C40F` / `#F59E0B`
  - Orange (Alert / Severe): `#E67E22` / `#D97706`
  - Red (Warning / Extreme): `#E74C3C` / `#B91C1C`

### 4.3 Typography & Readability
- Use clean system sans-serif typography for headings and body content.
- Use monospace (`font-mono`) for numerical values, timestamps, GPS coordinates, pressure readings, and station IDs.
- Ensure minimum contrast ratio of **4.5:1** against the background for body text and **3:1** for large text / UI elements (WCAG AA).

---

## 5. User Experience & Usability Standards

### 5.1 Responsive Layout & Touch Targets
- Design mobile-first, desktop-optimized:
  - Mobile touch targets **MUST** be at least 44x44px.
  - Provide visible hover and active states for desktop mouse interactions.
- Avoid content stretching indefinitely on ultra-wide screens: constrain main views to `max-w-7xl mx-auto`.

### 5.2 Smooth Interactions & Motion
- All interactive elements must provide immediate visual feedback on tap/click.
- The floating Ask MAUSAM button must support fluid, physics-based edge snapping with `requestAnimationFrame` and CSS cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Animations must respect the user's `prefers-reduced-motion` settings.

### 5.3 Audio Safety Guidelines
- Automatic audio playback must **NEVER** occur unprompted on initial page load.
- Audio alerts require explicit user opt-in (`AudioAlertToggle`).
- Emergency tones must use standard meteorological broadcast frequencies (853Hz/960Hz) with smooth audio gain ramps (no harsh clipping or popping).
- The alert service must suppress duplicate chimes for identical warnings using cryptographic fingerprinting.

---

## 6. Testing, Build & Deployment Validation

### 6.1 Pre-Commit & Verification Checklist
Before submitting changes or marking tasks as complete, you **MUST** run:
1. `npm run lint` (`tsc --noEmit`): Must complete with **0 errors**.
2. `npm run build`: Must compile both frontend assets (`dist/`) and server bundle (`dist/server.cjs`) without warnings or failures.

### 6.2 The MAUSAM 20-Point Launch Readiness Audit
Any architectural revision or feature addition must maintain 100% compliance with the 20 launch checkpoints:
- Public Terms of Observation (`/terms`)
- Privacy Policy (`/privacy`)
- Cookie & Storage Consent Banner
- Open Data API Specification (`/api`)
- System Diagnostics & Health Probe (`/api/system/health`)
- Responsive Navigation across all viewports (320px to 4K)
- 404 Error Boundary (`/not-found`)
- SEO metadata and OpenGraph tags in `index.html` and `metadata.json`
