#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
WMO Standard Quality Control (QC) Flagging Engine
====================================================================
"""

from enum import IntEnum
from typing import Dict, Any, List, Optional


class WMOQualityFlag(IntEnum):
    GOOD = 0         # Passed all automated physical and consistency checks
    SUSPECT = 1      # Slight outlier, passed with warning, needs human inspection
    ERRONEOUS = 2    # Physically impossible, rejected from downstream assimilation
    MISSING = 3      # Sensor offline, null or unreadable packet


class WMOQualityControlEngine:
    """
    Assigns granular QC flags per meteorological parameter based on WMO-No. 8.
    """

    @classmethod
    def evaluate_station_packet(cls, packet: Dict[str, Any]) -> Dict[str, Any]:
        flags = {}
        issues = []

        # 1. Temperature QC
        t = packet.get("temperature")
        if t is None:
            flags["temperature"] = WMOQualityFlag.MISSING
        elif -50.0 <= t <= 55.0:
            flags["temperature"] = WMOQualityFlag.GOOD
        elif -65.0 <= t < -50.0 or 55.0 < t <= 62.0:
            flags["temperature"] = WMOQualityFlag.SUSPECT
            issues.append(f"Temperature {t}°C is in extreme climatological margin.")
        else:
            flags["temperature"] = WMOQualityFlag.ERRONEOUS
            issues.append(f"Temperature {t}°C is physically impossible on Earth.")

        # 2. Humidity QC
        rh = packet.get("humidity")
        if rh is None:
            flags["humidity"] = WMOQualityFlag.MISSING
        elif 0.0 <= rh <= 100.0:
            flags["humidity"] = WMOQualityFlag.GOOD
        elif 100.0 < rh <= 103.0:
            flags["humidity"] = WMOQualityFlag.SUSPECT  # Slight sensor drift near saturation
            issues.append(f"Humidity {rh}% slightly exceeds 100% due to sensor saturation drift.")
        else:
            flags["humidity"] = WMOQualityFlag.ERRONEOUS
            issues.append(f"Humidity {rh}% is unphysical.")

        # 3. Wind speed QC
        w = packet.get("wind_speed")
        if w is None:
            flags["wind_speed"] = WMOQualityFlag.MISSING
        elif 0.0 <= w <= 180.0:
            flags["wind_speed"] = WMOQualityFlag.GOOD
        elif 180.0 < w <= 320.0:
            flags["wind_speed"] = WMOQualityFlag.SUSPECT
            issues.append(f"Wind speed {w} km/h requires cyclone/gale confirmation.")
        else:
            flags["wind_speed"] = WMOQualityFlag.ERRONEOUS
            issues.append(f"Wind speed {w} km/h is impossible.")

        # 4. Thermodynamic consistency (T and Td)
        td = packet.get("dew_point")
        if t is not None and td is not None:
            if td > t + 0.5:
                flags["thermodynamic_consistency"] = WMOQualityFlag.ERRONEOUS
                issues.append(f"Supersaturation violation: Td ({td}°C) > T ({t}°C).")
            else:
                flags["thermodynamic_consistency"] = WMOQualityFlag.GOOD
        else:
            flags["thermodynamic_consistency"] = WMOQualityFlag.MISSING

        # Compute overall quality score
        numeric_flags = [f.value for f in flags.values() if f != WMOQualityFlag.MISSING]
        if not numeric_flags:
            overall_status = "NO_DATA"
        elif any(f == WMOQualityFlag.ERRONEOUS for f in numeric_flags):
            overall_status = "REJECTED"
        elif any(f == WMOQualityFlag.SUSPECT for f in numeric_flags):
            overall_status = "SUSPECT"
        else:
            overall_status = "VERIFIED_ACCURATE"

        return {
            "overall_status": overall_status,
            "parameter_flags": {k: v.name for k, v in flags.items()},
            "qc_notes": issues
        }
