#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Atmospheric & Meteorological Scientific Calculations Module
Accelerated via C-Engine with Pure-Python Fallbacks
====================================================================
"""

import math
import os
import sys
from typing import Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import c_bridge


class AtmosphericCalculations:
    """
    Standard WMO & NOAA Meteorological Thermodynamic & Dynamic Formulations
    Uses C numerical routines when compiled for optimal vector throughput.
    """

    @staticmethod
    def saturation_vapor_pressure(temp_c: float) -> float:
        """
        Calculate saturation vapor pressure e_s (hPa) using Magnus-Tetens formula.
        """
        return 6.112 * math.exp((17.67 * temp_c) / (temp_c + 243.5))

    @staticmethod
    def actual_vapor_pressure(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate actual vapor pressure e (hPa) from temperature and relative humidity.
        """
        es = AtmosphericCalculations.saturation_vapor_pressure(temp_c)
        rh_clamped = max(0.0, min(100.0, relative_humidity))
        return es * (rh_clamped / 100.0)

    @staticmethod
    def dew_point(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate dew point temperature T_d (°C) from temperature and RH.
        """
        td = c_bridge.calculate_dew_point(temp_c, relative_humidity)
        return round(td, 2)

    @staticmethod
    def wet_bulb_temperature(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate wet-bulb temperature T_w (°C) using Roland Stull psychrometric formulation.
        """
        tw = c_bridge.calculate_wet_bulb(temp_c, relative_humidity)
        return round(tw, 2)

    @staticmethod
    def heat_index(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate NOAA Steadman Heat Index (°C) for warm conditions (T >= 26°C, RH >= 40%).
        """
        hi = c_bridge.calculate_heat_index(temp_c, relative_humidity)
        return round(hi, 2)

    @staticmethod
    def humidex(temp_c: float, dew_point_c: float) -> float:
        """
        Calculate Canadian Humidex (°C).
        """
        hx = c_bridge.calculate_humidex(temp_c, dew_point_c)
        return round(hx, 2)

    @staticmethod
    def wind_chill(temp_c: float, wind_speed_kmh: float) -> float:
        """
        Calculate Wind Chill Index (°C) for cold conditions.
        """
        wc = c_bridge.calculate_wind_chill(temp_c, wind_speed_kmh)
        return round(wc, 2)

    @staticmethod
    def lifting_condensation_level(temp_c: float, dew_point_c: float) -> float:
        """
        Calculate Lifting Condensation Level (LCL) in meters AGL.
        """
        lcl = c_bridge.calculate_lcl(temp_c, dew_point_c)
        return round(lcl, 1)

    @staticmethod
    def beaufort_scale(wind_speed_kmh: float) -> Dict[str, Any]:
        """
        Determine WMO Beaufort scale number and marine description from wind speed.
        """
        num = c_bridge.calculate_beaufort(wind_speed_kmh)
        descriptions = [
            ("Calm", "Mirror-like"),
            ("Light Air", "Ripples"),
            ("Light Breeze", "Small wavelets"),
            ("Gentle Breeze", "Large wavelets, scattered whitecaps"),
            ("Moderate Breeze", "Small waves, frequent whitecaps"),
            ("Fresh Breeze", "Moderate waves, many whitecaps"),
            ("Strong Breeze", "Large waves, foam crests"),
            ("Near Gale", "Sea heaps up, white foam blown in streaks"),
            ("Gale", "Moderately high waves, spindrift"),
            ("Strong Gale", "High waves, dense foam streaks"),
            ("Storm", "Very high waves with overhanging crests"),
            ("Violent Storm", "Exceptionally high waves"),
            ("Hurricane / Cyclone", "Air filled with foam, sea completely white")
        ]
        desc, sea = descriptions[min(num, 12)]
        return {"number": num, "description": desc, "sea_state": sea}


if __name__ == "__main__":
    calc = AtmosphericCalculations()
    t, rh = 32.0, 75.0
    td = calc.dew_point(t, rh)
    tw = calc.wet_bulb_temperature(t, rh)
    hi = calc.heat_index(t, rh)
    hx = calc.humidex(t, td)
    lcl = calc.lifting_condensation_level(t, td)
    print(f"Accelerated Engine: {c_bridge.get_engine_status()}")
    print(f"Calculations at {t}°C, {rh}% RH:")
    print(f"  Dew Point: {td}°C | Wet-Bulb: {tw}°C | Heat Index: {hi}°C | LCL: {lcl}m")
