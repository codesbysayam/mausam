#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
NWP Multi-Model Comparison & Synoptic Spread Analytics
====================================================================
"""

import math
from typing import List, Dict, Any, Optional


class ModelComparisonAnalytics:
    """
    Compares operational Numerical Weather Prediction models:
    - ECMWF IFS (European Centre for Medium-Range Weather Forecasts)
    - NCEP GFS (Global Forecast System, NOAA)
    - NCMRWF NCUM (National Centre for Medium Range Weather Forecasting, MoES India)
    - IMD WRF (Regional high-resolution 3km mesoscale model)
    """

    @staticmethod
    def calculate_ensemble_spread(model_predictions: Dict[str, List[float]]) -> Dict[str, Any]:
        """
        Computes inter-model ensemble spread (standard deviation across models)
        for each forecast timestep to quantify forecast confidence.
        Low spread -> High confidence. High spread -> High atmospheric uncertainty.
        """
        if not model_predictions:
            return {"timesteps": 0, "spread": [], "ensemble_mean": []}

        model_names = list(model_predictions.keys())
        num_timesteps = min(len(v) for v in model_predictions.values())

        ensemble_means = []
        spreads = []
        confidence_levels = []

        for t in range(num_timesteps):
            vals = [model_predictions[m][t] for m in model_names]
            mean_val = sum(vals) / len(vals)
            var = sum((v - mean_val) ** 2 for v in vals) / (len(vals) - 1 if len(vals) > 1 else 1)
            std_dev = math.sqrt(var)

            ensemble_means.append(round(mean_val, 2))
            spreads.append(round(std_dev, 2))

            # Confidence classification based on ensemble divergence
            if std_dev < 1.0:
                confidence_levels.append("HIGH")
            elif std_dev < 2.5:
                confidence_levels.append("MODERATE")
            else:
                confidence_levels.append("LOW")

        return {
            "models_compared": model_names,
            "timesteps": num_timesteps,
            "ensemble_mean": ensemble_means,
            "ensemble_spread": spreads,
            "confidence_levels": confidence_levels,
            "mean_divergence": round(sum(spreads) / len(spreads), 2) if spreads else 0.0
        }

    @staticmethod
    def identify_model_biases(
        model_predictions: Dict[str, List[float]],
        observed_truth: List[float]
    ) -> Dict[str, Dict[str, float]]:
        """
        Evaluates historical systematic biases per model against ground truth.
        """
        n = min(len(observed_truth), min((len(v) for v in model_predictions.values()), default=0))
        results = {}

        for model, preds in model_predictions.items():
            errs = [preds[i] - observed_truth[i] for i in range(n)]
            mean_bias = sum(errs) / n if n > 0 else 0.0
            mae = sum(abs(e) for e in errs) / n if n > 0 else 0.0
            rmse = math.sqrt(sum(e**2 for e in errs) / n) if n > 0 else 0.0

            results[model] = {
                "mean_bias": round(mean_bias, 2),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "bias_tendency": "COLD_BIAS" if mean_bias < -0.5 else ("WARM_BIAS" if mean_bias > 0.5 else "UNBIASED")
            }

        return results
