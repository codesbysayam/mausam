#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Agrometeorological Indices & Crop Physiological Intelligence
====================================================================
"""

import math
from typing import Dict, Any, Optional


class AgrometIndices:
    """
    Standard Agricultural Meteorology Formulations (FAO-56, IMD Agromet Division).
    """

    # Base temperatures for key Indian crops (°C)
    CROP_BASE_TEMPS = {
        "rice": 10.0,
        "wheat": 5.0,
        "maize": 10.0,
        "cotton": 15.5,
        "sugarcane": 12.0,
        "mustard": 5.0,
        "chickpea": 7.0,
        "groundnut": 13.0
    }

    @classmethod
    def growing_degree_days(cls, t_max: float, t_min: float, crop_type: str = "rice") -> float:
        """
        Calculates Daily Growing Degree Days (GDD / Thermal Time in °C-days).
        GDD = max(0, ((T_max + T_min) / 2) - T_base)
        """
        t_base = cls.CROP_BASE_TEMPS.get(crop_type.lower(), 10.0)
        t_mean = (t_max + t_min) / 2.0
        gdd = max(0.0, t_mean - t_base)
        return round(gdd, 1)

    @classmethod
    def reference_evapotranspiration_hargreaves(
        cls,
        t_max: float,
        t_min: float,
        t_mean: float,
        latitude_deg: float,
        day_of_year: int
    ) -> float:
        """
        Calculates Daily Reference Evapotranspiration (ET0) in mm/day
        using Hargreaves-Samani method (recommended by FAO-56 when radiation data is missing).
        """
        # Extraterrestrial solar radiation (Ra) calculation
        phi = math.radians(latitude_deg)
        dr = 1.0 + 0.033 * math.cos(2.0 * math.pi * day_of_year / 365.0)
        delta = 0.409 * math.sin((2.0 * math.pi * day_of_year / 365.0) - 1.39)
        
        # Sunset hour angle omega_s
        tan_term = -math.tan(phi) * math.tan(delta)
        omega_s = math.acos(max(-1.0, min(1.0, tan_term)))
        
        # Ra in MJ/(m^2 * day)
        g_sc = 0.0820  # Solar constant MJ/(m^2*min)
        ra = (24.0 * 60.0 / math.pi) * g_sc * dr * (
            omega_s * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(omega_s)
        )
        
        # Convert Ra from MJ/(m^2*day) to equivalent depth of water (mm/day): multiply by 0.408
        ra_mm = 0.408 * ra
        
        delta_t = max(0.1, t_max - t_min)
        et0 = 0.0023 * (t_mean + 17.8) * math.sqrt(delta_t) * ra_mm
        return round(max(0.0, et0), 2)

    @classmethod
    def evaluate_spraying_conditions(
        cls,
        wind_speed_kmh: float,
        temperature_c: float,
        relative_humidity: float,
        precipitation_mm: float
    ) -> Dict[str, Any]:
        """
        Evaluates agrochemical spraying window suitability per ICAR/IMD advisory guidelines.
        Ideal window:
        - Wind speed: 3 to 15 km/h (avoid drift and stagnant droplet evaporation)
        - Temp: 15°C to 30°C
        - RH: 40% to 80%
        - Precip: 0 mm in next 6 hours
        """
        reasons = []
        is_suitable = True

        if precipitation_mm > 0.5:
            is_suitable = False
            reasons.append("Active or imminent precipitation will wash off chemical spray.")
        if wind_speed_kmh > 15.0:
            is_suitable = False
            reasons.append(f"Wind speed ({wind_speed_kmh} km/h) exceeds 15 km/h threshold; high risk of airborne droplet drift.")
        elif wind_speed_kmh < 3.0:
            reasons.append("Calm air (<3 km/h); moderate risk of droplet inversion or stagnant air pooling.")
        if temperature_c > 32.0:
            is_suitable = False
            reasons.append(f"High surface temperature ({temperature_c}°C) causes rapid droplet evaporation and crop phytotoxicity.")
        if relative_humidity < 40.0:
            reasons.append(f"Low relative humidity ({relative_humidity}%) increases droplet evaporation rate before foliar absorption.")

        score = 100
        if not is_suitable:
            score = 30
        elif len(reasons) > 0:
            score = 65

        return {
            "suitable": is_suitable,
            "suitability_score": score,
            "status": "EXCELLENT" if score >= 85 else ("MODERATE" if score >= 60 else "UNFAVORABLE"),
            "advisories": reasons if reasons else ["Ideal atmospheric conditions for foliar application and pest spraying."]
        }
