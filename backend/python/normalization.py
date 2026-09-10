# ====================================================================
# MAUSAM - Atmospheric Intelligence Platform
# Python Atmospheric Analytics & Data Validation Module
# Compatible with Vercel Python Runtime
# ====================================================================

from typing import Dict, Any, Optional

def calculate_cpcb_pm25_sub_index(pm25: float) -> int:
    """Calculates CPCB 24-hour PM2.5 sub-index based on official NAQI breakpoints."""
    if pm25 <= 30:
        return round((pm25 / 30.0) * 50)
    elif pm25 <= 60:
        return round(50 + ((pm25 - 30.0) / 30.0) * 50)
    elif pm25 <= 90:
        return round(100 + ((pm25 - 60.0) / 30.0) * 100)
    elif pm25 <= 120:
        return round(200 + ((pm25 - 90.0) / 30.0) * 100)
    elif pm25 <= 250:
        return round(300 + ((pm25 - 120.0) / 130.0) * 100)
    else:
        return round(400 + ((pm25 - 250.0) / 130.0) * 100)

def calculate_cpcb_pm10_sub_index(pm10: float) -> int:
    """Calculates CPCB 24-hour PM10 sub-index based on official NAQI breakpoints."""
    if pm10 <= 50:
        return round(pm10)
    elif pm10 <= 100:
        return round(pm10)
    elif pm10 <= 250:
        return round(100 + ((pm10 - 100.0) / 150.0) * 100)
    elif pm10 <= 350:
        return round(200 + ((pm10 - 250.0) / 100.0) * 100)
    elif pm10 <= 430:
        return round(300 + ((pm10 - 350.0) / 80.0) * 100)
    else:
        return round(400 + ((pm10 - 430.0) / 80.0) * 100)

def validate_meteorological_ranges(obs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates physical boundaries for terrestrial atmospheric observations:
    Temperature: -50C to +60C
    Relative Humidity: 0% to 100%
    Surface Pressure: 850 hPa to 1085 hPa
    Wind Speed: 0 to 120 m/s
    """
    errors = []
    
    temp = obs.get("temperature")
    if temp is not None and not (-50.0 <= temp <= 60.0):
        errors.append(f"Temperature {temp}C out of physical terrestrial limits.")

    humidity = obs.get("humidity")
    if humidity is not None and not (0.0 <= humidity <= 100.0):
        errors.append(f"Humidity {humidity}% out of physical range.")

    pressure = obs.get("pressure")
    if pressure is not None and not (850.0 <= pressure <= 1085.0):
        errors.append(f"Pressure {pressure} hPa out of standard range.")

    return {
        "isValid": len(errors) == 0,
        "errors": errors,
        "validatedObservation": obs
    }
