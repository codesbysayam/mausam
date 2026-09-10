#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Standard Data Models & Schemas for Python Meteorological Engine
====================================================================
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any
from datetime import datetime


@dataclass
class GeoCoordinate:
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"


@dataclass
class NormalizedWeather:
    location: GeoCoordinate
    observed_at: str
    fetched_at: str
    data_status: str  # 'LIVE', 'RECENT', 'STALE', 'UNAVAILABLE'
    temperature_c: Optional[float]
    feels_like_c: Optional[float]
    relative_humidity: Optional[float]
    dew_point_c: Optional[float]
    pressure_hpa: Optional[float]
    wind_speed_kmh: Optional[float]
    wind_direction_deg: Optional[float]
    wind_gust_kmh: Optional[float]
    visibility_km: Optional[float]
    cloud_cover_percent: Optional[float]
    precipitation_mm: Optional[float]
    rainfall_24h_mm: Optional[float]
    uv_index: Optional[float]
    weather_code: Optional[int]
    condition_text: str
    is_day: bool
    source_name: str
    source_priority: int
    is_fallback: bool
    raw_attribution: str

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["location"] = asdict(self.location)
        return d


@dataclass
class HourlyForecastPoint:
    timestamp: str
    temperature_c: float
    feels_like_c: float
    relative_humidity: float
    precipitation_probability: float
    precipitation_mm: float
    wind_speed_kmh: float
    wind_direction_deg: float
    pressure_hpa: float
    weather_code: int
    condition_text: str


@dataclass
class DailyForecastPoint:
    date: str
    temp_max_c: float
    temp_min_c: float
    precipitation_total_mm: float
    precipitation_probability: float
    max_wind_speed_kmh: float
    sunrise: str
    sunset: str
    weather_code: int
    condition_text: str


@dataclass
class ModelComparisonEntry:
    model_name: str  # 'ECMWF_IFS', 'NCEP_GFS', 'NCMRWF_NCUM', 'IMD_WRF'
    resolution_km: float
    run_cycle: str  # '00Z', '06Z', '12Z', '18Z'
    hourly: List[HourlyForecastPoint] = field(default_factory=list)


@dataclass
class AQIObservation:
    station_id: str
    station_name: str
    city: str
    state: str
    latitude: float
    longitude: float
    observed_at: str
    aqi_value: int
    aqi_category: str  # 'Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'
    prominent_pollutant: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    nh3: Optional[float] = None
    pb: Optional[float] = None


@dataclass
class CAPAlert:
    identifier: str
    sender: str
    sent_at: str
    status: str
    msg_type: str
    scope: str
    event: str
    urgency: str
    severity: str  # 'Red', 'Orange', 'Yellow', 'Green'
    certainty: str
    headline: str
    description: str
    instruction: str
    area_desc: str
    polygon: Optional[List[List[float]]] = None
