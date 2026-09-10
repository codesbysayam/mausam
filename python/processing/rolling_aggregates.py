#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Rolling Time-Series Aggregation & Extreme Spike Clamping
====================================================================
"""

import math
from typing import List, Dict, Any, Tuple, Optional


class RollingAggregates:
    """
    Computes rolling averages, cumulative rainfall, and statistical anomalies
    over meteorological time series.
    """

    @staticmethod
    def rolling_mean(data: List[float], window_size: int) -> List[float]:
        """Sliding window simple moving average."""
        if not data or window_size <= 0:
            return []
        if window_size >= len(data):
            return [sum(data) / len(data)] * len(data)

        result = []
        cur_sum = sum(data[:window_size])
        result.append(cur_sum / window_size)

        for i in range(window_size, len(data)):
            cur_sum += data[i] - data[i - window_size]
            result.append(cur_sum / window_size)

        return result

    @staticmethod
    def cumulative_sum(data: List[float]) -> List[float]:
        """Calculates running cumulative rainfall totals."""
        running = 0.0
        out = []
        for val in data:
            running += max(0.0, val or 0.0)
            out.append(round(running, 2))
        return out

    @staticmethod
    def detect_extremes_and_outliers(
        data: List[float],
        z_threshold: float = 3.0
    ) -> Dict[str, Any]:
        """
        Calculates Welford mean, variance, and flags observations exceeding z-threshold.
        """
        if not data:
            return {"mean": 0.0, "std_dev": 0.0, "outlier_indices": []}

        n = len(data)
        mean = sum(data) / n
        var = sum((x - mean) ** 2 for x in data) / (n - 1 if n > 1 else 1)
        std_dev = math.sqrt(var)

        outliers = []
        if std_dev > 1e-4:
            for idx, x in enumerate(data):
                z = abs(x - mean) / std_dev
                if z >= z_threshold:
                    outliers.append({"index": idx, "value": x, "z_score": round(z, 2)})

        return {
            "mean": round(mean, 2),
            "std_dev": round(std_dev, 2),
            "min": min(data),
            "max": max(data),
            "outlier_count": len(outliers),
            "outliers": outliers
        }
