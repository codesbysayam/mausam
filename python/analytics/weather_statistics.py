#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Weather Statistics & Climatological Hazard Categorization
====================================================================
"""

import math
from typing import List, Dict, Any, Optional


class WeatherStatistics:
    """
    Statistical formulations aligned with India Meteorological Department (IMD)
    standard definitions for monsoon rainfall, heatwaves, and cold waves.
    """

    @staticmethod
    def classify_imd_rainfall(rain_24h_mm: float) -> Dict[str, Any]:
        """
        Classifies 24-hour rainfall according to IMD's official category scale.
        """
        r = max(0.0, rain_24h_mm or 0.0)
        if r == 0.0:
            return {"code": "NO_RAIN", "label": "No Rain", "severity": "Green", "min_mm": 0, "max_mm": 0}
        elif r < 2.5:
            return {"code": "VERY_LIGHT", "label": "Very Light Rain", "severity": "Green", "min_mm": 0.1, "max_mm": 2.4}
        elif r <= 15.5:
            return {"code": "LIGHT", "label": "Light Rain", "severity": "Green", "min_mm": 2.5, "max_mm": 15.5}
        elif r <= 64.4:
            return {"code": "MODERATE", "label": "Moderate Rain", "severity": "Yellow", "min_mm": 15.6, "max_mm": 64.4}
        elif r <= 115.5:
            return {"code": "HEAVY", "label": "Heavy Rain", "severity": "Yellow", "min_mm": 64.5, "max_mm": 115.5}
        elif r <= 204.4:
            return {"code": "VERY_HEAVY", "label": "Very Heavy Rain", "severity": "Orange", "min_mm": 115.6, "max_mm": 204.4}
        else:
            return {"code": "EXTREMELY_HEAVY", "label": "Extremely Heavy Rain", "severity": "Red", "min_mm": 204.5, "max_mm": 9999}

    @staticmethod
    def evaluate_heatwave(max_temp: float, normal_max_temp: float, is_coastal: bool = False) -> Dict[str, Any]:
        """
        Evaluates heatwave conditions per IMD official criteria:
        Plains:
          - Heatwave: Departure from normal is 4.5°C to 6.4°C (or max temp >= 45°C)
          - Severe Heatwave: Departure from normal >= 6.5°C (or max temp >= 47°C)
        Coastal:
          - Max temp departure >= 4.5°C with max temp >= 37°C
        """
        departure = max_temp - normal_max_temp

        if is_coastal:
            if max_temp >= 37.0 and departure >= 4.5:
                return {"is_heatwave": True, "category": "Coastal Heat Wave", "severity": "Orange", "departure": round(departure, 1)}
            return {"is_heatwave": False, "category": "Normal Coastal Temperatures", "severity": "Green", "departure": round(departure, 1)}

        if max_temp >= 40.0 or normal_max_temp >= 40.0:
            if departure >= 6.5 or max_temp >= 47.0:
                return {"is_heatwave": True, "category": "Severe Heat Wave", "severity": "Red", "departure": round(departure, 1)}
            elif departure >= 4.5 or max_temp >= 45.0:
                return {"is_heatwave": True, "category": "Heat Wave", "severity": "Orange", "departure": round(departure, 1)}

        return {"is_heatwave": False, "category": "Normal Continental Temperatures", "severity": "Green", "departure": round(departure, 1)}

    @staticmethod
    def percentile_distribution(values: List[float], percentiles=[10, 25, 50, 75, 90, 95, 99]) -> Dict[str, float]:
        """Calculates exact percentile distribution of an observation array."""
        if not values:
            return {f"p{p}": 0.0 for p in percentiles}

        s = sorted(values)
        n = len(s)
        out = {}
        for p in percentiles:
            k = (len(s) - 1) * (p / 100.0)
            f = math.floor(k)
            c = math.ceil(k)
            if f == c:
                val = s[int(k)]
            else:
                d0 = s[int(f)] * (c - k)
                d1 = s[int(c)] * (k - f)
                val = d0 + d1
            out[f"p{p}"] = round(val, 2)
        return out
