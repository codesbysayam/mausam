#!/usr/bin/env python3
"""
MAUSAM - Atmospheric Intelligence Platform
Scientific Data Quality Control & Cross-Source Validation
"""

from typing import Dict, Any, List, Tuple

class ScientificValidator:
    """
    Validation engine implementing WMO Guide to Meteorological Instruments
    and Methods of Observation (WMO-No. 8) QC guidelines.
    """

    @staticmethod
    def validate_surface_observation(obs: Dict[str, Any]) -> Tuple[bool, List[str]]:
        errors = []

        temp = obs.get("temperature")
        dew_point = obs.get("dew_point")
        rh = obs.get("humidity")
        pressure = obs.get("pressure")
        wind_speed = obs.get("wind_speed")
        precip = obs.get("precipitation")

        # 1. Temperature limits (-80°C to 65°C)
        if temp is not None:
            if not isinstance(temp, (int, float)):
                errors.append(f"Temperature is not a numeric value: {temp}")
            elif temp < -80.0 or temp > 65.0:
                errors.append(f"Temperature {temp}°C violates terrestrial limits (-80 to 65°C)")

        # 2. Relative Humidity limits (0% to 100%)
        if rh is not None:
            if not isinstance(rh, (int, float)):
                errors.append(f"Humidity is not a numeric value: {rh}")
            elif rh < 0.0 or rh > 100.0:
                errors.append(f"Relative humidity {rh}% is out of bounds (0-100%)")

        # 3. Physical Consistency: Dew Point cannot exceed Dry-Bulb Temperature (Td <= T)
        if temp is not None and dew_point is not None:
            # Allow 0.5°C margin for sensor precision
            if dew_point > temp + 0.5:
                errors.append(f"Thermodynamic violation: Dew point ({dew_point}°C) exceeds ambient temperature ({temp}°C)")

        # 4. Atmospheric Pressure limits (800 hPa to 1100 hPa)
        if pressure is not None:
            if pressure < 800.0 or pressure > 1100.0:
                errors.append(f"Surface pressure {pressure} hPa is outside realistic bounds (800-1100 hPa)")

        # 5. Wind Speed limits (>= 0 and <= 450 km/h)
        if wind_speed is not None:
            if wind_speed < 0:
                errors.append(f"Wind speed cannot be negative: {wind_speed}")
            elif wind_speed > 450.0:
                errors.append(f"Wind speed {wind_speed} km/h exceeds maximum recorded gust limit")

        # 6. Precipitation limits (>= 0)
        if precip is not None and precip < 0:
            errors.append(f"Precipitation amount cannot be negative: {precip}")

        return len(errors) == 0, errors


if __name__ == "__main__":
    valid_obs = {
        "temperature": 30.5,
        "dew_point": 26.2,
        "humidity": 78,
        "pressure": 1004.2,
        "wind_speed": 14.5,
        "precipitation": 0.0
    }
    is_ok, errs = ScientificValidator.validate_surface_observation(valid_obs)
    print("Valid observation check:", is_ok, errs)

    invalid_obs = {
        "temperature": 25.0,
        "dew_point": 28.0, # Td > T (impossible)
        "humidity": 115,   # > 100%
        "wind_speed": -5.0 # negative
    }
    is_ok, errs = ScientificValidator.validate_surface_observation(invalid_obs)
    print("Invalid observation check:", is_ok, errs)
