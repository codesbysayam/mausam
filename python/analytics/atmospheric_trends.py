#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Non-Parametric Atmospheric Climatological Trend Analysis
====================================================================
"""

import math
from typing import List, Dict, Any, Tuple


class AtmosphericTrendAnalysis:
    """
    Implements the Mann-Kendall Test for monotonic trend detection and
    Sen's Slope Estimator for robust trend magnitude estimation (unaffected by outliers).
    Widely utilized by IMD National Climate Centre for monsoon trend studies.
    """

    @staticmethod
    def mann_kendall_test(series: List[float], alpha: float = 0.05) -> Dict[str, Any]:
        """
        Computes the non-parametric Mann-Kendall test statistic S, variance, and Z-score.
        """
        n = len(series)
        if n < 4:
            return {"trend": "INSUFFICIENT_DATA", "p_significant": False, "z_score": 0.0, "slope": 0.0}

        # 1. Calculate Mann-Kendall test statistic S
        s = 0
        for k in range(n - 1):
            for j in range(k + 1, n):
                diff = series[j] - series[k]
                if diff > 0:
                    s += 1
                elif diff < 0:
                    s -= 1

        # 2. Variance of S (assuming no tied groups for continuous temperature/rainfall)
        var_s = (n * (n - 1) * (2 * n + 5)) / 18.0

        # 3. Standard normal test statistic Z
        if s > 0:
            z = (s - 1) / math.sqrt(var_s)
        elif s < 0:
            z = (s + 1) / math.sqrt(var_s)
        else:
            z = 0.0

        # 4. Sen's Slope Estimator
        slopes = []
        for i in range(n - 1):
            for j in range(i + 1, n):
                slopes.append((series[j] - series[i]) / (j - i))

        slopes.sort()
        mid = len(slopes) // 2
        sen_slope = slopes[mid] if len(slopes) % 2 != 0 else (slopes[mid - 1] + slopes[mid]) / 2.0

        # Two-tailed significance test at alpha=0.05 (critical Z = 1.96)
        z_crit = 1.96
        is_significant = abs(z) >= z_crit

        trend = "NO_TREND"
        if is_significant:
            trend = "INCREASING_TREND" if z > 0 else "DECREASING_TREND"

        return {
            "trend": trend,
            "is_statistically_significant": is_significant,
            "mann_kendall_s": s,
            "z_score": round(z, 3),
            "sens_slope_per_timestep": round(sen_slope, 4),
            "sample_count": n
        }
