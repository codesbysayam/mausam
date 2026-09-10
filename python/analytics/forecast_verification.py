#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
NWP Forecast Verification Engine (WMO Standard Verification)
====================================================================
"""

import math
from typing import List, Dict, Any, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import c_bridge


class ForecastVerificationEngine:
    """
    Computes standard WMO verification scores for continuous parameters (Temperature, Wind)
    and dichotomous categorical thresholds (Rainfall, Fog, Thunderstorm).
    """

    @staticmethod
    def verify_continuous_parameter(
        forecast: List[float],
        observed: List[float]
    ) -> Dict[str, Any]:
        """Continuous error metrics (MAE, RMSE, Bias, Pearson R)."""
        return c_bridge.verify_forecast_arrays(forecast, observed)

    @staticmethod
    def verify_rain_contingency(
        forecast_rain: List[float],
        observed_rain: List[float],
        threshold_mm: float = 2.5
    ) -> Dict[str, Any]:
        """
        Contingency Table Analysis for rain event occurrence:
        - Hits (H): Forecast >= threshold and Observed >= threshold
        - False Alarms (FA): Forecast >= threshold and Observed < threshold
        - Misses (M): Forecast < threshold and Observed >= threshold
        - Correct Rejections (CR): Forecast < threshold and Observed < threshold
        """
        n = min(len(forecast_rain), len(observed_rain))
        h, fa, m, cr = 0, 0, 0, 0

        for i in range(n):
            f_event = forecast_rain[i] >= threshold_mm
            o_event = observed_rain[i] >= threshold_mm

            if f_event and o_event:
                h += 1
            elif f_event and not o_event:
                fa += 1
            elif not f_event and o_event:
                m += 1
            else:
                cr += 1

        pod = (h / (h + m)) if (h + m) > 0 else 0.0
        far = (fa / (h + fa)) if (h + fa) > 0 else 0.0
        csi = (h / (h + fa + m)) if (h + fa + m) > 0 else 0.0
        bias = ((h + fa) / (h + m)) if (h + m) > 0 else 1.0

        # Heidke Skill Score (HSS)
        expected = (((h + m) * (h + fa)) + ((cr + fa) * (cr + m))) / n if n > 0 else 0.0
        denom = n - expected
        hss = ((h + cr - expected) / denom) if denom > 1e-6 else 0.0

        return {
            "threshold_mm": threshold_mm,
            "sample_size": n,
            "hits": h,
            "false_alarms": fa,
            "misses": m,
            "correct_rejections": cr,
            "probability_of_detection_pod": round(pod, 3),
            "false_alarm_ratio_far": round(far, 3),
            "critical_success_index_csi": round(csi, 3),
            "frequency_bias": round(bias, 3),
            "heidke_skill_score_hss": round(hss, 3),
            "overall_accuracy_percent": round(((h + cr) / n) * 100.0, 1) if n > 0 else 0.0
        }
