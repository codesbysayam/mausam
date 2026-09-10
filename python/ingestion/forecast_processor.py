#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Multi-Model Forecast Processing & Temporal Aggregation
====================================================================
"""

from typing import Dict, Any, List, Optional
from dataclasses import asdict
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.weather_models import HourlyForecastPoint, DailyForecastPoint
from ingestion.weather_normalizer import WMO_WEATHER_CODES


class ForecastProcessor:
    @staticmethod
    def process_open_meteo_forecast(raw: Dict[str, Any]) -> Dict[str, Any]:
        """Parses and formats hourly and daily forecast timelines."""
        hourly_data = raw.get("hourly", {})
        daily_data = raw.get("daily", {})

        times = hourly_data.get("time", [])
        temps = hourly_data.get("temperature_2m", [])
        app_temps = hourly_data.get("apparent_temperature", [])
        rhs = hourly_data.get("relative_humidity_2m", [])
        pop = hourly_data.get("precipitation_probability", [])
        precips = hourly_data.get("precipitation", [])
        winds = hourly_data.get("wind_speed_10m", [])
        dirs = hourly_data.get("wind_direction_10m", [])
        pressures = hourly_data.get("pressure_msl", [])
        codes = hourly_data.get("weather_code", [])

        hourly_points: List[HourlyForecastPoint] = []
        for i in range(min(len(times), 168)):  # Up to 7 days (168 hours)
            code = codes[i] if i < len(codes) else 0
            cond, _ = WMO_WEATHER_CODES.get(code, ("Clear", True))

            hourly_points.append(HourlyForecastPoint(
                timestamp=times[i],
                temperature_c=temps[i] if i < len(temps) else 0.0,
                feels_like_c=app_temps[i] if i < len(app_temps) else (temps[i] if i < len(temps) else 0.0),
                relative_humidity=rhs[i] if i < len(rhs) else 50.0,
                precipitation_probability=pop[i] if i < len(pop) else 0.0,
                precipitation_mm=precips[i] if i < len(precips) else 0.0,
                wind_speed_kmh=winds[i] if i < len(winds) else 0.0,
                wind_direction_deg=dirs[i] if i < len(dirs) else 0.0,
                pressure_hpa=pressures[i] if i < len(pressures) else 1013.2,
                weather_code=code,
                condition_text=cond
            ))

        d_times = daily_data.get("time", [])
        d_maxs = daily_data.get("temperature_2m_max", [])
        d_mins = daily_data.get("temperature_2m_min", [])
        d_precips = daily_data.get("precipitation_sum", [])
        d_pop = daily_data.get("precipitation_probability_max", [])
        d_winds = daily_data.get("wind_speed_10m_max", [])
        d_sunrises = daily_data.get("sunrise", [])
        d_sunsets = daily_data.get("sunset", [])
        d_codes = daily_data.get("weather_code", [])

        daily_points: List[DailyForecastPoint] = []
        for i in range(len(d_times)):
            code = d_codes[i] if i < len(d_codes) else 0
            cond, _ = WMO_WEATHER_CODES.get(code, ("Fair", True))

            daily_points.append(DailyForecastPoint(
                date=d_times[i],
                temp_max_c=d_maxs[i] if i < len(d_maxs) else 30.0,
                temp_min_c=d_mins[i] if i < len(d_mins) else 20.0,
                precipitation_total_mm=d_precips[i] if i < len(d_precips) else 0.0,
                precipitation_probability=d_pop[i] if i < len(d_pop) else 0.0,
                max_wind_speed_kmh=d_winds[i] if i < len(d_winds) else 15.0,
                sunrise=d_sunrises[i] if i < len(d_sunrises) else "",
                sunset=d_sunsets[i] if i < len(d_sunsets) else "",
                weather_code=code,
                condition_text=cond
            ))

        return {
            "hourly_count": len(hourly_points),
            "daily_count": len(daily_points),
            "hourly": [asdict(p) for p in hourly_points],
            "daily": [asdict(p) for p in daily_points]
        }
