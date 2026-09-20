# MAUSAM — Design System & Visual Specification

> **Document Version**: 2.4.0  
> **Aesthetic Archetype**: Government Meteorological Operational Console  
> **Styling Framework**: Tailwind CSS v4 + `src/styles/mausam.css`  
> **Last Updated**: September 2026  

---

## 1. Design Philosophy: The Operational Console

MAUSAM's design language balances the authority of a national meteorological service with modern digital ergonomics. It intentionally rejects commercial "weather app fluff"—such as exaggerated animated clouds, cartoon icons, and arbitrary glowing gradients—in favor of a **calm, high-density, data-rich operational environment**.

### Core Visual Principles
1. **High Contrast & Immediate Legibility**: Emergency warnings and meteorological data must be readable under direct sunlight on mobile screens or in low-light command centers.
2. **Authority & Restraint**: Uses structured navy, slate, and steel tones. Color is reserved almost exclusively for semantic meteorological meaning (rain intensity, warning severity, temperature heatmaps).
3. **Data Density without Clutter**: High information bandwidth delivered through clear typographic hierarchy, subtle 1px panel dividers, and tabular alignment.
4. **Zero AI Slop**: No arbitrary purple-to-blue gradients, no heavy blurred drop-shadows, no ungrounded glowing cards, and no inconsistent border radii.

---

## 2. Color Palette & Semantic Design Tokens

### 2.1 Canvas & Surface Tokens
The interface is anchored on a deep oceanic dark palette that prevents eye strain during extended operational monitoring:

| Token Name | Hex Code | Purpose / Application |
|---|---|---|
| **Canvas Deep** | `#071A2D` | Primary window background canvas |
| **Surface Card** | `#0B263D` | Primary card panels (`.mausam-card`, `.mausam-panel`) |
| **Surface Elevated** | `#123652` | Dropdowns, hover states, floating drawers, active tabs |
| **Border Subtle** | `#1D5278` | 1px clean architectural boundaries between modules |
| **Border Active** | `#38BDF8` | Focus rings, active selection states, key indicators |

### 2.2 National Warning & Hazard Severity Tokens
Strictly mapped to the India Meteorological Department (IMD) and National Disaster Management Authority (NDMA) color matrices:

| Severity Level | Hex Code | Border / Pill | Semantic Meaning |
|---|---|---|---|
| **Green (Normal)** | `#00E676` | `border-[#00E676]/40` | Normal atmospheric conditions; no advisory required |
| **Yellow (Watch)** | `#F1C40F` | `border-[#F1C40F]/40` | Be updated; moderate weather event developing |
| **Orange (Alert)** | `#E67E22` | `border-[#E67E22]/40` | Be prepared; hazardous weather imminent; potential disruption |
| **Red (Warning)** | `#E74C3C` | `border-[#E74C3C]/40` | Take action; severe/life-threatening emergency |

### 2.3 CPCB National Air Quality Index (NAQI) Palette
| NAQI Range | Category | Color Hex | Health Advisory |
|---|---|---|---|
| **0 – 50** | Good | `#00E676` | Minimal impact |
| **51 – 100** | Satisfactory | `#76FF03` | Minor breathing discomfort to sensitive individuals |
| **101 – 200**| Moderate | `#F1C40F` | Breathing discomfort to people with asthma and heart disease |
| **201 – 300**| Poor | `#FF9800` | Breathing discomfort to most people on prolonged exposure |
| **301 – 400**| Very Poor | `#E74C3C` | Respiratory illness on prolonged exposure |
| **401 – 500**| Severe | `#880E4F` | Severe impacts on healthy people; serious risk to patients |

### 2.4 Doppler Radar Reflectivity Scale (dBZ)
- `10 - 20 dBZ`: Light drizzle / mist (Pale Blue `#38BDF8`)
- `25 - 35 dBZ`: Moderate rain (Emerald Green `#00E676`)
- `40 - 45 dBZ`: Heavy precipitation (Amber Yellow `#F1C40F`)
- `50 - 55 dBZ`: Intense thunderstorm / small hail (Orange `#E67E22`)
- `60+ dBZ`: Severe convective squall / damaging hail (Crimson / Magenta `#E74C3C` / `#D500F9`)

---

## 3. Typography & Hierarchy

The typography pairs a clean, readable sans-serif system font for UI elements with a calibrated monospace font for scientific telemetry:

### 3.1 Font Families
- **Display & Interface**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Telemetry & Science**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`

### 3.2 Typographic Hierarchy
| Role | Size / Leading | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Station Headline** | 28px – 34px / 1.2 | Bold (700) | `-0.02em` | Main Observatory name on Weather page |
| **Hero Temperature** | 56px – 72px / 1.0 | ExtraBold (800) | `-0.03em` | Current dry-bulb reading (`31°C`) |
| **Section Title** | 18px – 20px / 1.3 | SemiBold (600) | `-0.01em` | Card headers, table headings |
| **Telemetry Metric** | 15px – 18px / 1.2 | Bold (700) font-mono | `0` | Wind speed, pressure (hPa), humidity (%) |
| **Body Copy** | 14px – 15px / 1.5 | Regular (400) | `0` | Weather descriptions, synoptic reports |
| **Caption / Meta** | 11px – 12px / 1.4 | Medium (500) font-mono | `+0.02em` | Observation timestamps, station coordinates |

---

## 4. Components & Layout Specifications

### 4.1 Structural Layout & Grids
- **Base Grid**: 8-pixel mathematical baseline (`gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6`).
- **Container Sizing**: Standard pages are centered within `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Card Padding Rule**: Container outer padding always equals or exceeds child spacing (`p-4` or `p-6`).

### 4.2 Cards & Panels (`.mausam-panel`, `.mausam-card`)
- **Background**: Solid `#0B263D` with subtle 1px border `#1D5278`.
- **Border Radius**: Calculated mathematically (`rounded-lg` 8px to `rounded-xl` 12px for outer cards; `rounded-md` 6px for internal nested chips).
- **Depth**: Flattened hierarchy using high-contrast borders rather than blurry drop shadows.

### 4.3 Navigation Architecture
- **Government Header (`GovernmentHeader.tsx`)**:
  - Official National Emblem / Brand mark.
  - Live Indian Standard Time (IST) clock with live seconds ticker.
  - Location Center trigger displaying current city, state, and GPS status.
  - Quick action toolbar: Font scaler (`A-`, `A+`), Language picker, and Audio Alert status.
- **Tabbed Main Navigation (`MainNavigation.tsx`)**:
  - 8 core primary modules: Home, Weather, Forecast, Warnings, Radar, AQI, Agromet, Reports.
  - Active tab indicated by bold white typography and active sky bottom accent line.
- **Mobile Navigation Drawer (`MobileNavDrawer.tsx`)**:
  - Slide-out high-contrast drawer with touch-friendly 48px height rows.

### 4.4 Floating Action Button: "Ask MAUSAM" (`DraggableAskMausamButton.tsx`)
- **Positioning**: Fixed overlay with coordinate boundary clamping to prevent off-screen loss.
- **Interaction**: Pointer events enable fluid dragging across desktop and mobile screens.
- **Snapping Dynamics**: On pointer release, calculates distance to all 4 screen edges and smoothly animates to the nearest border via `requestAnimationFrame` and CSS curve `cubic-bezier(0.16, 1, 0.3, 1)` over 420ms.
- **Reset**: Double-click or double-tap resets the button to the default bottom-right coordinate.

### 4.5 Liquid Glass Elements
Liquid Glass effects are applied **strictly and selectively** only where contextually appropriate:
- Sticky header bar during scroll: `backdrop-blur-md bg-[#071A2D]/90`.
- Ask MAUSAM modal overlay backdrop: `backdrop-blur-sm bg-black/60`.

---

## 5. Responsive Breakpoints & Viewport Adaptation

| Breakpoint | Viewport Width | Layout Adaptations |
|---|---|---|
| **Mobile (`< 640px`)** | 320px – 639px | Single column stacked layout. Main tabs convert to horizontally scrolling pill strip or mobile hamburger drawer. Draggable button collapses to compact badge. |
| **Tablet (`640px – 1023px`)** | 640px – 1023px | 2-column bento grids for telemetry (temperature + conditions alongside wind & pressure). |
| **Desktop (`>= 1024px`)** | 1024px – 1440px | Full 3-column / 4-column operational dashboard. Interactive Leaflet radar map side-by-side with 7-day synoptic forecast. |
| **Ultra-Wide (`>= 1440px`)** | > 1440px | Content strictly constrained to `max-w-7xl` with balanced margins to prevent horizontal eye fatigue. |
