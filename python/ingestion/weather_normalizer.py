#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Weather Normalizer & Multi-Source Synthesizer
====================================================================
"""

import math
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import c_bridge
from models.weather_models import NormalizedWeather, GeoCoordinate


WMO_WEATHER_CODES = {
    0: ("Clear Sky", True),
    1: ("Mainly Clear", True),
    2: ("Partly Cloudy", False),
    3: ("Overcast", False),
    45: ("Fog", False),
    48: ("Depositing Rime Fog", False),
    51: ("Light Drizzle", False),
    53: ("Moderate Drizzle", False),
    55: ("Dense Drizzle", False),
    61: ("Slight Rain", False),
    63: ("Moderate Rain", False),
    65: ("Heavy Rain", False),
    71: ("Slight Snow Fall", False),
    73: ("Moderate Snow Fall", False),
    75: ("Heavy Snow Fall", False),
    80: ("Slight Rain Showers", False),
    81: ("Moderate Rain Showers", False),
    82: ("Violent Rain Showers", False),
    95: ("Thunderstorm", False),
    96: ("Thunderstorm with Slight Hail", False),
    99: ("Thunderstorm with Heavy Hail", False),
}


class WeatherNormalizer:
    @staticmethod
    def normalize_open_meteo(raw: Dict[str, Any], coord: GeoCoordinate) -> Optional[NormalizedWeather]:
        """Normalizes Open-Meteo current response into standard NormalizedWeather."""
        current = raw.get("current")
        if not current:
            return None

        temp = current.get("temperature_2m")
        rh = current.get("relative_humidity_2m")
        app_temp = current.get("apparent_temperature")
        pressure = current.get("pressure_msl")
        wind_spd = current.get("wind_speed_10m")
        wind_dir = current.get("wind_direction_10m")
        wind_gust = current.get("wind_gusts_10m")
        clouds = current.get("cloud_cover")
        precip = current.get("precipitation", 0.0)
        code = current.get("weather_code", 0)
        is_day = bool(current.get("is_day", 1))

        condition, _ = WMO_WEATHER_CODES.get(code, ("Unknown", True))

        # Scientific psychrometric calculations
        td = c_bridge.calculate_dew_point(temp, rh) if (temp is not None and rh is not None) else None
        feels_like = app_temp if app_temp is not None else (
            c_bridge.calculate_heat_index(temp, rh) if (temp is not None and rh is not None) else temp
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        return NormalizedWeather(
            location=coord,
            observed_at=now_iso,
            fetched_at=now_iso,
            data_status="LIVE",
            temperature_c=temp,
            feels_like_c=feels_like,
            relative_humidity=rh,
            dew_point_c=td,
            pressure_hpa=pressure,
            wind_speed_kmh=wind_spd,
            wind_direction_deg=wind_dir,
            wind_gust_kmh=wind_gust,
            visibility_km=10.0,
            cloud_cover_percent=clouds,
            precipitation_mm=precip,
            rainfall_24h_mm=precip,
            uv_index=raw.get("hourly", {}).get("uv_index", [0])[0] if "hourly" in raw else None,
            weather_code=code,
            condition_text=condition,
            is_day=is_day,
            source_name="Open-Meteo Synoptic",
            source_priority=4,
            is_fallback=True,
            raw_attribution="Weather data by Open-Meteo.com under CC BY 4.0"
        )

    @staticmethod
    def normalize_imd_aws(raw: Dict[str, Any], coord: GeoCoordinate) -> Optional[NormalizedWeather]:
        """Normalizes IMD Surface Automatic Weather Station (AWS) telemetry."""
        temp = raw.get("temperature") or raw.get("temp")
        rh = raw.get("humidity") or raw.get("rh")
        pressure = raw.get("pressure") or raw.get("slp")
        wind_spd = raw.get("wind_speed") or raw.get("spd")
        wind_dir = raw.get("wind_direction") or raw.get("dir")
        rain_24h = raw.get("rainfall_24h") or raw.get("rain")

        if temp is None:
            return None

        td = c_bridge.calculate_dew_point(temp, rh) if (temp is not None and rh is not None) else None
        hi = c_bridge.calculate_heat_index(temp, rh) if (temp is not None and rh is not None) else temp

        now_iso = datetime.now(timezone.utc).isoformat()

        return NormalizedWeather(
            location=coord,
            observed_at=raw.get("timestamp", now_iso),
            fetched_at=now_iso,
            data_status="LIVE",
            temperature_c=float(temp),
            feels_like_c=float(hi) if hi is not None else float(temp),
            relative_humidity=float(rh) if rh is not None else None,
            dew_point_c=float(td) if td is not None else None,
            pressure_hpa=float(pressure) if pressure is not None else None,
            wind_speed_kmh=float(wind_spd) if wind_spd is not None else None,
            wind_direction_deg=float(wind_dir) if wind_dir is not None else None,
            wind_gust_kmh=None,
            visibility_km=raw.get("visibility"),
            cloud_cover_percent=None,
            precipitation_mm=float(rain_24h) if rain_24h is not None else 0.0,
            rainfall_24h_mm=float(rain_24h) if rain_24h is not None else 0.0,
            uv_index=None,
            weather_code=raw.get("weather_code", 0),
            condition_text=raw.get("weather_desc", "Observatory Surface Observation"),
            is_day=True,
            source_name="India Meteorological Department (IMD)",
            source_priority=1,
            is_fallback=False,
            raw_attribution="Official data courtesy of India Meteorological Department (IMD), MoES"
        )
