#!/usr/bin/env python3
"""
MAUSAM - Atmospheric Intelligence Platform
Atmospheric & Meteorological Scientific Calculations Module
"""

import math
from typing import Dict, Any, Optional

class AtmosphericCalculations:
    """
    Standard WMO & NOAA Meteorological Thermodynamic & Dynamic Formulations
    """

    @staticmethod
    def saturation_vapor_pressure(temp_c: float) -> float:
        """
        Calculate saturation vapor pressure e_s (hPa) using the Magnus-Tetens formula.
        Valid for -45°C <= T <= 60°C.
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
        if relative_humidity <= 0:
            return -80.0
        rh_frac = max(0.001, min(1.0, relative_humidity / 100.0))
        alpha = ((17.27 * temp_c) / (237.7 + temp_c)) + math.log(rh_frac)
        td = (237.7 * alpha) / (17.27 - alpha)
        return round(td, 2)

    @staticmethod
    def wet_bulb_temperature(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate wet-bulb temperature T_w (°C) using Stull's empirical psychrometric formula.
        Valid for standard sea-level pressures.
        """
        T = temp_c
        RH = max(1.0, min(99.0, relative_humidity))

        term1 = T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
        term2 = math.atan(T + RH)
        term3 = -math.atan(RH - 1.676331)
        term4 = 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
        term5 = -4.686035

        tw = term1 + term2 + term3 + term4 + term5
        return round(tw, 2)

    @staticmethod
    def heat_index(temp_c: float, relative_humidity: float) -> float:
        """
        Calculate NOAA Steadman Heat Index (°C) for warm conditions (T >= 26°C, RH >= 40%).
        """
        if temp_c < 26.0 or relative_humidity < 40.0:
            return temp_c

        # Convert to Fahrenheit for Steadman polynomial
        T = (temp_c * 9.0 / 5.0) + 32.0
        R = relative_humidity

        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -0.00683783
        c6 = -0.05481717
        c7 = 0.00122874
        c8 = 0.00085282
        c9 = -0.00000199

        hi_f = (
            c1
            + (c2 * T)
            + (c3 * R)
            + (c4 * T * R)
            + (c5 * (T ** 2))
            + (c6 * (R ** 2))
            + (c7 * (T ** 2) * R)
            + (c8 * T * (R ** 2))
            + (c9 * (T ** 2) * (R ** 2))
        )

        hi_c = (hi_f - 32.0) * 5.0 / 9.0
        return round(hi_c, 2)

    @staticmethod
    def humidex(temp_c: float, dew_point_c: float) -> float:
        """
        Calculate Canadian Humidex (°C).
        """
        e = 6.11 * math.exp(5417.7530 * ((1.0 / 273.16) - (1.0 / (273.15 + dew_point_c))))
        h = temp_c + (5.0 / 9.0) * (e - 10.0)
        return round(h, 2)

    @staticmethod
    def beaufort_scale(wind_speed_kmh: float) -> Dict[str, Any]:
        """
        Determine WMO Beaufort scale number and marine description from wind speed.
        """
        if wind_speed_kmh < 1.0:
            return {"number": 0, "description": "Calm", "sea_state": "Mirror-like"}
        elif wind_speed_kmh < 6.0:
            return {"number": 1, "description": "Light Air", "sea_state": "Ripples"}
        elif wind_speed_kmh < 12.0:
            return {"number": 2, "description": "Light Breeze", "sea_state": "Small wavelets"}
        elif wind_speed_kmh < 20.0:
            return {"number": 3, "description": "Gentle Breeze", "sea_state": "Large wavelets, scattered whitecaps"}
        elif wind_speed_kmh < 29.0:
            return {"number": 4, "description": "Moderate Breeze", "sea_state": "Small waves, frequent whitecaps"}
        elif wind_speed_kmh < 39.0:
            return {"number": 5, "description": "Fresh Breeze", "sea_state": "Moderate waves, many whitecaps"}
        elif wind_speed_kmh < 50.0:
            return {"number": 6, "description": "Strong Breeze", "sea_state": "Large waves, foam crests"}
        elif wind_speed_kmh < 62.0:
            return {"number": 7, "description": "Near Gale", "sea_state": "Sea heaps up, white foam blown in streaks"}
        elif wind_speed_kmh < 75.0:
            return {"number": 8, "description": "Gale", "sea_state": "Moderately high waves, spindrift"}
        elif wind_speed_kmh < 89.0:
            return {"number": 9, "description": "Strong Gale", "sea_state": "High waves, dense foam streaks"}
        elif wind_speed_kmh < 103.0:
            return {"number": 10, "description": "Storm", "sea_state": "Very high waves with overhanging crests"}
        elif wind_speed_kmh < 118.0:
            return {"number": 11, "description": "Violent Storm", "sea_state": "Exceptionally high waves"}
        else:
            return {"number": 12, "description": "Hurricane / Cyclone", "sea_state": "Air filled with foam, sea completely white"}


if __name__ == "__main__":
    calc = AtmosphericCalculations()
    t = 32.0
    rh = 75.0
    td = calc.dew_point(t, rh)
    tw = calc.wet_bulb_temperature(t, rh)
    hi = calc.heat_index(t, rh)
    hx = calc.humidex(t, td)
    print(f"Sample calculation at {t}°C, {rh}% RH:")
    print(f"  Dew Point: {td}°C")
    print(f"  Wet-Bulb: {tw}°C")
    print(f"  Heat Index: {hi}°C")
    print(f"  Humidex: {hx}°C")
    print(f"  Beaufort at 35 km/h: {calc.beaufort_scale(35)}")
