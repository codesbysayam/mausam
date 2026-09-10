#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Comprehensive Data Quality Validator & Climatological Boundaries
====================================================================
"""

from typing import Dict, Any, List, Tuple, Optional


class IndianClimatologicalValidator:
    """
    Validation engine tailored to Indian agro-ecological zones and meteorological boundaries
    (per IMD Climatological Normals & WMO-No. 488).
    """

    # Historical physical records across Indian subcontinent
    RECORD_MAX_TEMP_INDIA = 51.0   # Phalodi, Rajasthan (May 2016)
    RECORD_MIN_TEMP_INDIA = -50.0  # Dras, Ladakh (January 1995)
    MAX_HOURLY_RAIN_RECORD = 190.0 # Mumbai / Cherrapunji hourly records (mm)
    MIN_PRESSURE_CYCLONE = 890.0   # 1999 Odisha Super Cyclone eye pressure

    @classmethod
    def validate_regional_observation(
        cls,
        obs: Dict[str, Any],
        latitude: float,
        longitude: float,
        elevation_m: float = 0.0
    ) -> Dict[str, Any]:
        """
        Validates observation against climatological range conditioned on geography and elevation.
        """
        flags = []
        is_clean = True

        temp = obs.get("temperature")
        if temp is not None:
            # Elevation adjustment: Standard atmosphere lapse rate 6.5°C/km
            expected_sea_level_max = 52.0
            max_allowed = expected_sea_level_max - (0.0065 * elevation_m)
            min_allowed = cls.RECORD_MIN_TEMP_INDIA if (latitude > 30.0 or elevation_m > 2000) else 0.0

            if temp > max_allowed:
                flags.append(f"Temperature {temp}°C exceeds elevation-adjusted max ({max_allowed:.1f}°C)")
                is_clean = False
            elif temp < min_allowed:
                flags.append(f"Temperature {temp}°C below regional threshold ({min_allowed:.1f}°C)")
                is_clean = False

        # Check dew point depression
        dew = obs.get("dew_point")
        if temp is not None and dew is not None:
            depression = temp - dew
            if depression < -0.5:
                flags.append(f"Thermodynamic supersaturation anomaly: Td ({dew}°C) > T ({temp}°C)")
                is_clean = False
            elif depression > 45.0:
                flags.append(f"Extreme dew point depression ({depression:.1f}°C) exceeds realistic dry limit")
                is_clean = False

        # Check rain rate
        rain = obs.get("precipitation")
        if rain is not None:
            if rain < 0:
                flags.append("Rainfall cannot be negative")
                is_clean = False
            elif rain > cls.MAX_HOURLY_RAIN_RECORD:
                flags.append(f"Rainfall rate {rain} mm/h exceeds national record (190 mm/h)")
                is_clean = False

        # Pressure check
        press = obs.get("pressure")
        if press is not None:
            if press < cls.MIN_PRESSURE_CYCLONE:
                flags.append(f"Barometric pressure {press} hPa below historical cyclone minimum (890 hPa)")
                is_clean = False
            elif press > 1060.0:
                flags.append(f"Barometric pressure {press} hPa exceeds high-pressure ridge limit")
                is_clean = False

        return {
            "is_valid": is_clean,
            "flag_count": len(flags),
            "flags": flags,
            "regional_zone": "Himalayan/Highland" if elevation_m > 1500 else ("Coastal" if (latitude < 22 and (longitude < 74 or longitude > 84)) else "Inland/Peninsular")
        }
