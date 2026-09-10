#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
CPCB National Air Quality Index (NAQI) Real-Time Telemetry Ingestion
====================================================================
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import asdict
from datetime import datetime, timezone
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.weather_models import AQIObservation

# CPCB NAQI Breakpoints (Pollutant concentration ranges -> Index ranges)
# Structure: (Concentration_Low, Concentration_High, Index_Low, Index_High)
BREAKPOINTS_PM25 = [
    (0, 30, 0, 50),
    (31, 60, 51, 100),
    (61, 90, 101, 200),
    (91, 120, 201, 300),
    (121, 250, 301, 400),
    (250.1, 500, 401, 500),
]

BREAKPOINTS_PM10 = [
    (0, 50, 0, 50),
    (51, 100, 51, 100),
    (101, 250, 101, 200),
    (251, 350, 201, 300),
    (351, 430, 301, 400),
    (430.1, 600, 401, 500),
]

BREAKPOINTS_NO2 = [
    (0, 40, 0, 50),
    (41, 80, 51, 100),
    (81, 180, 101, 200),
    (181, 280, 201, 300),
    (281, 400, 301, 400),
    (400.1, 600, 401, 500),
]

BREAKPOINTS_SO2 = [
    (0, 40, 0, 50),
    (41, 80, 51, 100),
    (81, 380, 101, 200),
    (381, 800, 201, 300),
    (801, 1600, 301, 400),
    (1600.1, 2000, 401, 500),
]

BREAKPOINTS_CO = [
    (0, 1.0, 0, 50),
    (1.1, 2.0, 51, 100),
    (2.1, 10.0, 101, 200),
    (10.1, 17.0, 201, 300),
    (17.1, 34.0, 301, 400),
    (34.1, 50.0, 401, 500),
]

BREAKPOINTS_O3 = [
    (0, 50, 0, 50),
    (51, 100, 51, 100),
    (101, 168, 101, 200),
    (169, 208, 201, 300),
    (209, 748, 301, 400),
    (748.1, 1000, 401, 500),
]


def calculate_sub_index(conc: float, breakpoints: List[Tuple[float, float, int, int]]) -> Optional[int]:
    """Calculates linear interpolation sub-index based on CPCB equation."""
    if conc < 0:
        return None
    for c_low, c_high, i_low, i_high in breakpoints:
        if c_low <= conc <= c_high:
            sub = ((i_high - i_low) / (c_high - c_low)) * (conc - c_low) + i_low
            return int(round(sub))
    # Cap at 500 for extreme values
    return 500


def get_aqi_category(aqi: int) -> str:
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Satisfactory"
    if aqi <= 200: return "Moderate"
    if aqi <= 300: return "Poor"
    if aqi <= 400: return "Very Poor"
    return "Severe"


class CPCBAQIIngestion:
    @staticmethod
    def process_station_pollutants(
        station_id: str,
        station_name: str,
        city: str,
        state: str,
        lat: float,
        lon: float,
        pollutants: Dict[str, float]
    ) -> Optional[AQIObservation]:
        """Calculates CPCB NAQI and dominant pollutant."""
        sub_indices = {}

        if "pm25" in pollutants and pollutants["pm25"] is not None:
            sub = calculate_sub_index(pollutants["pm25"], BREAKPOINTS_PM25)
            if sub is not None: sub_indices["PM2.5"] = sub

        if "pm10" in pollutants and pollutants["pm10"] is not None:
            sub = calculate_sub_index(pollutants["pm10"], BREAKPOINTS_PM10)
            if sub is not None: sub_indices["PM10"] = sub

        if "no2" in pollutants and pollutants["no2"] is not None:
            sub = calculate_sub_index(pollutants["no2"], BREAKPOINTS_NO2)
            if sub is not None: sub_indices["NO2"] = sub

        if "so2" in pollutants and pollutants["so2"] is not None:
            sub = calculate_sub_index(pollutants["so2"], BREAKPOINTS_SO2)
            if sub is not None: sub_indices["SO2"] = sub

        if "co" in pollutants and pollutants["co"] is not None:
            sub = calculate_sub_index(pollutants["co"], BREAKPOINTS_CO)
            if sub is not None: sub_indices["CO"] = sub

        if "o3" in pollutants and pollutants["o3"] is not None:
            sub = calculate_sub_index(pollutants["o3"], BREAKPOINTS_O3)
            if sub is not None: sub_indices["Ozone"] = sub

        if not sub_indices:
            return None

        # CPCB rule: Overall AQI is the maximum of the sub-indices (at least PM2.5 or PM10 required)
        dominant_pollutant = max(sub_indices, key=sub_indices.get)
        overall_aqi = sub_indices[dominant_pollutant]

        now_iso = datetime.now(timezone.utc).isoformat()

        return AQIObservation(
            station_id=station_id,
            station_name=station_name,
            city=city,
            state=state,
            latitude=lat,
            longitude=lon,
            observed_at=now_iso,
            aqi_value=overall_aqi,
            aqi_category=get_aqi_category(overall_aqi),
            prominent_pollutant=dominant_pollutant,
            pm25=pollutants.get("pm25"),
            pm10=pollutants.get("pm10"),
            no2=pollutants.get("no2"),
            so2=pollutants.get("so2"),
            co=pollutants.get("co"),
            o3=pollutants.get("o3"),
            nh3=pollutants.get("nh3"),
            pb=pollutants.get("pb")
        )
