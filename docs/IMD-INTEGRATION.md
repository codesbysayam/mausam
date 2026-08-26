# MAUSAM — Official IMD Real-Time Data Integration Architecture

> **Data Attribution Statement**: MAUSAM consumes meteorological observations and forecasts directly from the **India Meteorological Department (IMD)**, Ministry of Earth Sciences, Government of India.

---

## 1. Architectural Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    MAUSAM React / Vite UI                   │
│ (Custom Data Hooks: useCurrentWeather, useWarnings, etc.)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ JSON / HTTP (/api/imd/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   MAUSAM API SERVER LAYER                   │
│   • Request Deduplication (In-flight Map)                   │
│   • Memory Caching (TTL: 60s - 300s)                        │
│   • Stale-While-Revalidate Engine                           │
│   • Exponential Backoff Retries                             │
│   • AbortController Timeout (10s)                           │
│   • IMD WMO Synoptic Normalizers                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS (Authenticated when configured)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          OFFICIAL IMD API (https://api.imd.gov.in/api/v1)   │
│  /current_wx, /cityforecast, /districtwarning, /aws_data... │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Integrated IMD Endpoints

| Feature | IMD Path | Description | Refresh/TTL |
|---|---|---|---|
| **Current Weather** | `/current_wx` | Real-time observation (temp, humidity, wind, pressure, 24h rain) | 60s |
| **City Forecast** | `/cityforecast` | 7-day medium range forecast with min/max temperatures | 300s |
| **City Location** | `/cityforecastloc` | Station coordinates and altitude | 3600s |
| **District Nowcast** | `/districtnowcast` | 3-hour severe thunderstorm and rain nowcasts | 60s |
| **District Warning** | `/districtwarning` | 5-day multi-hazard warning matrix | 60s |
| **Station Nowcast** | `/stationnowcast` | Micro-location station alerts | 60s |
| **State Rainfall** | `/staterainfall` | State-level cumulative rainfall departure | 300s |
| **District Rainfall** | `/districtrainfall` | District-level cumulative rainfall statistics | 300s |
| **AWS / ARG Surface** | `/aws_data` | Automatic Weather Station surface telemetry | 60s |
| **River Basin QPF** | `/basinqpf` | Quantitative Precipitation Forecast for flood management | 300s |
| **Port Warning** | `/portwarning` | Port warning signals and gale advisories | 300s |
| **Sea Bulletin** | `/seabulletin` | Arabian Sea & Bay of Bengal bulletins | 300s |
| **Coastal Bulletin** | `/coastalbulletin` | Coastal warnings for fishing craft | 300s |
| **Subdivision Warning**| `/subdivisionwarning` | 36 meteorological subdivision synoptic matrix | 60s |
| **Sun & Moon** | `/sunmoon` | Solar & lunar ephemeris (Sunrise, Sunset, Moonrise) in IST | 3600s |
| **Cyclone Track** | `/cyclone_track` | RSMC New Delhi observed and forecast storm track | 60s |
| **Cyclone Wind** | `/cyclone_wind` | Gale wind hazard radius (28kt, 34kt, 50kt, 64kt) | 60s |
| **Cyclone Cone** | `/cyclone_cou` | Cone of Uncertainty polygon coordinates | 60s |

---

## 3. Warning Color Codes & Severity
- **1 (Green / NORMAL)**: No warning. Normal atmospheric conditions prevailing.
- **2 (Yellow / WATCH)**: Be updated. Keep tracking atmospheric conditions.
- **3 (Orange / WARNING)**: Be prepared. Potential for disruption to transport and infrastructure.
- **4 (Red / SEVERE)**: Take action. Severe hazardous meteorological event imminent.

## 4. Rainfall Categorization
- **LE**: Large Excess (+60% or more)
- **E**: Excess (+20% to +59%)
- **N**: Normal (-19% to +19%)
- **D**: Deficient (-59% to -20%)
- **LD**: Large Deficient (-99% to -60%)
- **NR**: No Rain (-100%)
- **ND**: No Data

---

## 5. Security & Credentials
The frontend client never holds API credentials or tokens. All authentication is strictly maintained on the server-side via `IMD_API_KEY` and `IMD_API_TOKEN` environment variables.
