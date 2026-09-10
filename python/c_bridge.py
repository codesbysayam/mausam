#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Python ↔ C Scientific Bridge & Graceful Pure-Python Fallback
====================================================================

This module loads the high-performance C numerical acceleration library
(libmausam_numerical.so). If the compiled C library is missing or cannot
be loaded on the host system, it seamlessly falls back to pure Python
implementations without raising exceptions or breaking callers.
"""

import ctypes
import os
import math
from typing import Tuple, List, Dict, Any, Optional

# Locate compiled C shared library
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_CURRENT_DIR)
_LIB_C_PATH = os.path.join(_PROJECT_ROOT, "c", "lib", "libmausam_numerical.so")

_c_lib = None
_IS_C_ACCELERATED = False

try:
    if os.path.exists(_LIB_C_PATH):
        _c_lib = ctypes.CDLL(_LIB_C_PATH)

        # Setup ctypes argument and return types
        _c_lib.mausam_get_version_string.restype = ctypes.c_char_p

        _c_lib.mausam_dew_point.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_dew_point.restype = ctypes.c_double

        _c_lib.mausam_wet_bulb.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_wet_bulb.restype = ctypes.c_double

        _c_lib.mausam_heat_index.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_heat_index.restype = ctypes.c_double

        _c_lib.mausam_humidex.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_humidex.restype = ctypes.c_double

        _c_lib.mausam_wind_chill.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_wind_chill.restype = ctypes.c_double

        _c_lib.mausam_lifting_condensation_level_m.argtypes = [ctypes.c_double, ctypes.c_double]
        _c_lib.mausam_lifting_condensation_level_m.restype = ctypes.c_double

        _c_lib.mausam_beaufort_number.argtypes = [ctypes.c_double]
        _c_lib.mausam_beaufort_number.restype = ctypes.c_int

        _IS_C_ACCELERATED = True
except Exception as e:
    _c_lib = None
    _IS_C_ACCELERATED = False


def is_c_acceleration_active() -> bool:
    """Returns True if the C compiled acceleration engine is active."""
    return _IS_C_ACCELERATED


def get_engine_status() -> Dict[str, Any]:
    """Returns operational diagnostics of the numerical core."""
    if _IS_C_ACCELERATED and _c_lib:
        version = _c_lib.mausam_get_version_string().decode("utf-8")
        return {
            "accelerator": "C_NUMERICAL_CORE",
            "version": version,
            "status": "OPERATIONAL",
            "lib_path": _LIB_C_PATH
        }
    return {
        "accelerator": "PYTHON_STANDARD_FALLBACK",
        "version": "MAUSAM Pure-Python 2.1.0",
        "status": "FALLBACK_ACTIVE",
        "lib_path": None
    }


# ====================================================================
# Pure Python Fallbacks (Exact Numerical Equivalence)
# ====================================================================

def _py_dew_point(temp_c: float, rh_percent: float) -> float:
    if rh_percent <= 0:
        return -50.0
    rh = min(100.0, max(0.01, rh_percent))
    a, b = 17.27, 237.3
    alpha = ((a * temp_c) / (b + temp_c)) + math.log(rh / 100.0)
    return (b * alpha) / (a - alpha)


def _py_wet_bulb(temp_c: float, rh_percent: float) -> float:
    rh = min(100.0, max(0.0, rh_percent))
    t1 = temp_c * math.atan(0.151977 * math.sqrt(rh + 8.313659))
    t2 = math.atan(temp_c + rh)
    t3 = math.atan(rh - 1.676331)
    t4 = 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
    return t1 + t2 - t3 + t4 - 4.686035


def _py_heat_index(temp_c: float, rh_percent: float) -> float:
    t_f = temp_c * 1.8 + 32.0
    if t_f < 80.0 or rh_percent < 40.0:
        return temp_c
    c1, c2, c3 = -42.379, 2.04901523, 10.14333127
    c4, c5, c6 = -0.22475541, -6.83783e-3, -5.481717e-2
    c7, c8, c9 = 1.22874e-3, 8.5282e-4, -1.99e-6
    t, r = t_f, rh_percent
    hi = (c1 + c2*t + c3*r + c4*t*r + c5*t*t + c6*r*r +
          c7*t*t*r + c8*t*r*r + c9*t*t*r*r)
    return (hi - 32.0) / 1.8


def _py_humidex(temp_c: float, dew_point_c: float) -> float:
    kelvin_td = dew_point_c + 273.15
    e = 6.11 * math.exp(5417.7530 * ((1.0 / 273.16) - (1.0 / kelvin_td)))
    return temp_c + (5.0 / 9.0) * (e - 10.0)


def _py_wind_chill(temp_c: float, wind_speed_kmh: float) -> float:
    if temp_c > 10.0 or wind_speed_kmh < 4.8:
        return temp_c
    v016 = wind_speed_kmh ** 0.16
    return 13.12 + (0.6215 * temp_c) - (11.37 * v016) + (0.3965 * temp_c * v016)


def _py_lcl(temp_c: float, dew_point_c: float) -> float:
    depression = max(0.0, temp_c - dew_point_c)
    return 125.0 * depression


def _py_beaufort(wind_speed_kmh: float) -> int:
    if wind_speed_kmh < 1.0: return 0
    if wind_speed_kmh < 6.0: return 1
    if wind_speed_kmh < 12.0: return 2
    if wind_speed_kmh < 20.0: return 3
    if wind_speed_kmh < 29.0: return 4
    if wind_speed_kmh < 39.0: return 5
    if wind_speed_kmh < 50.0: return 6
    if wind_speed_kmh < 62.0: return 7
    if wind_speed_kmh < 75.0: return 8
    if wind_speed_kmh < 89.0: return 9
    if wind_speed_kmh < 103.0: return 10
    if wind_speed_kmh < 118.0: return 11
    return 12


# ====================================================================
# Public Unified Interface (C if available, otherwise Python)
# ====================================================================

def calculate_dew_point(temp_c: float, rh_percent: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_dew_point(ctypes.c_double(temp_c), ctypes.c_double(rh_percent)))
    return _py_dew_point(temp_c, rh_percent)


def calculate_wet_bulb(temp_c: float, rh_percent: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_wet_bulb(ctypes.c_double(temp_c), ctypes.c_double(rh_percent)))
    return _py_wet_bulb(temp_c, rh_percent)


def calculate_heat_index(temp_c: float, rh_percent: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_heat_index(ctypes.c_double(temp_c), ctypes.c_double(rh_percent)))
    return _py_heat_index(temp_c, rh_percent)


def calculate_humidex(temp_c: float, dew_point_c: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_humidex(ctypes.c_double(temp_c), ctypes.c_double(dew_point_c)))
    return _py_humidex(temp_c, dew_point_c)


def calculate_wind_chill(temp_c: float, wind_speed_kmh: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_wind_chill(ctypes.c_double(temp_c), ctypes.c_double(wind_speed_kmh)))
    return _py_wind_chill(temp_c, wind_speed_kmh)


def calculate_lcl(temp_c: float, dew_point_c: float) -> float:
    if _IS_C_ACCELERATED and _c_lib:
        return float(_c_lib.mausam_lifting_condensation_level_m(ctypes.c_double(temp_c), ctypes.c_double(dew_point_c)))
    return _py_lcl(temp_c, dew_point_c)


def calculate_beaufort(wind_speed_kmh: float) -> int:
    if _IS_C_ACCELERATED and _c_lib:
        return int(_c_lib.mausam_beaufort_number(ctypes.c_double(wind_speed_kmh)))
    return _py_beaufort(wind_speed_kmh)


def verify_forecast_arrays(forecasts: List[float], observations: List[float]) -> Dict[str, float]:
    """Calculates continuous verification metrics (MAE, RMSE, Bias, Pearson R)."""
    if len(forecasts) != len(observations) or len(forecasts) == 0:
        return {"mae": 0.0, "rmse": 0.0, "bias": 0.0, "pearson_r": 0.0, "samples": 0}

    n = len(forecasts)
    sum_abs = sum(abs(f - o) for f, o in zip(forecasts, observations))
    sum_sq = sum((f - o) ** 2 for f, o in zip(forecasts, observations))
    sum_bias = sum(f - o for f, o in zip(forecasts, observations))

    mean_f = sum(forecasts) / n
    mean_o = sum(observations) / n

    num = sum((f - mean_f) * (o - mean_o) for f, o in zip(forecasts, observations))
    den_f = sum((f - mean_f) ** 2 for f in forecasts)
    den_o = sum((o - mean_o) ** 2 for o in observations)
    denom = math.sqrt(den_f * den_o)
    r = (num / denom) if denom > 1e-12 else 0.0

    return {
        "mae": round(sum_abs / n, 3),
        "rmse": round(math.sqrt(sum_sq / n), 3),
        "bias": round(sum_bias / n, 3),
        "pearson_r": round(r, 4),
        "samples": n
    }
