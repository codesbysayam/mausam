#!/usr/bin/env python3
"""
MAUSAM - Atmospheric Intelligence Platform
Weather Data Ingestion & ETL Pipeline
"""

import sys
import os
import json
import urllib.request
from typing import Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from processing.atmospheric_calculations import AtmosphericCalculations
from validation.validator import ScientificValidator

def fetch_open_meteo_current(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,pressure_msl"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mausam-Python-ETL/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                return data.get("current")
    except Exception as e:
        print(f"[Python ETL] Ingestion error for coords ({lat}, {lon}): {e}", file=sys.stderr)
    return None

def process_and_normalize(lat: float, lon: float, raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    temp = raw.get("temperature_2m")
    rh = raw.get("relative_humidity_2m")
    precip = raw.get("precipitation", 0.0)
    wind = raw.get("wind_speed_10m", 0.0)
    pressure = raw.get("pressure_msl", 1013.2)

    if temp is None or rh is None:
        return None

    calc = AtmosphericCalculations()
    dew_point = calc.dew_point(temp, rh)
    wet_bulb = calc.wet_bulb_temperature(temp, rh)
    heat_index = calc.heat_index(temp, rh)
    beaufort = calc.beaufort_scale(wind)

    normalized = {
        "latitude": lat,
        "longitude": lon,
        "temperature": temp,
        "relative_humidity": rh,
        "dew_point": dew_point,
        "wet_bulb": wet_bulb,
        "heat_index": heat_index,
        "pressure": pressure,
        "wind_speed": wind,
        "precipitation": precip,
        "beaufort": beaufort,
        "source": "Open-Meteo Synoptic",
    }

    is_valid, errs = ScientificValidator.validate_surface_observation(normalized)
    if not is_valid:
        print(f"[Python ETL] Rejected malformed record: {errs}", file=sys.stderr)
        return None

    return normalized

def run_ingestion_pipeline(sample_coords=[(20.2961, 85.8245), (28.6139, 77.2090), (19.0760, 72.8777)]):
    results = []
    for lat, lon in sample_coords:
        raw = fetch_open_meteo_current(lat, lon)
        if raw:
            norm = process_and_normalize(lat, lon, raw)
            if norm:
                results.append(norm)
    return results

if __name__ == "__main__":
    records = run_ingestion_pipeline()
    print(json.dumps(records, indent=2))
