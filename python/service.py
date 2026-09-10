#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Python Scientific Service Bridge & CLI/RPC Dispatcher
====================================================================
"""

import sys
import os
import json

# Ensure python directory is in module path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import c_bridge
from processing.atmospheric_calculations import AtmosphericCalculations
from processing.thermodynamics import AtmosphericThermodynamics
from processing.agromet_indices import AgrometIndices
from validation.validator import ScientificValidator
from validation.data_validator import IndianClimatologicalValidator
from validation.wmo_qc_engine import WMOQualityControlEngine
from analytics.weather_statistics import WeatherStatistics
from analytics.model_comparison import ModelComparisonAnalytics
from analytics.forecast_verification import ForecastVerificationEngine
from analytics.aqi_processor import AQIAnalyticsProcessor
from analytics.atmospheric_trends import AtmosphericTrendAnalysis


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: service.py [calculate|thermo|validate|qc|verify|compare|aqi|agromet|trends|status] [json_payload]"
        }))
        sys.exit(1)

    command = sys.argv[1]
    payload = {}
    if len(sys.argv) > 2:
        try:
            payload = json.loads(sys.argv[2])
        except Exception:
            payload = {}

    if command == "status":
        print(json.dumps({
            "status": "success",
            "c_engine": c_bridge.get_engine_status(),
            "python_runtime": sys.version.split()[0],
            "modules_loaded": [
                "AtmosphericCalculations", "AtmosphericThermodynamics",
                "AgrometIndices", "IndianClimatologicalValidator",
                "WMOQualityControlEngine", "WeatherStatistics",
                "ModelComparisonAnalytics", "ForecastVerificationEngine",
                "AQIAnalyticsProcessor", "AtmosphericTrendAnalysis"
            ]
        }))

    elif command == "calculate":
        temp = float(payload.get("temperature", payload.get("temp_c", 25.0)))
        rh = float(payload.get("humidity", 60.0))
        wind = float(payload.get("wind_speed", payload.get("wind_speed_kmh", 10.0)))
        dew = payload.get("dew_point_c")

        calc = AtmosphericCalculations()
        td = dew if dew is not None else calc.dew_point(temp, rh)
        tw = calc.wet_bulb_temperature(temp, rh)
        hi = calc.heat_index(temp, rh)
        hx = calc.humidex(temp, td)
        lcl = calc.lifting_condensation_level(temp, td)
        bft = calc.beaufort_scale(wind)

        print(json.dumps({
            "status": "success",
            "accelerator": c_bridge.get_engine_status()["accelerator"],
            "dew_point_c": td,
            "wet_bulb_c": tw,
            "heat_index_c": hi,
            "humidex_c": hx,
            "lcl_height_m": lcl,
            "beaufort": bft
        }))

    elif command == "thermo":
        temp = float(payload.get("temp_c", 30.0))
        press = float(payload.get("pressure_hpa", 1008.0))
        rh = float(payload.get("humidity", 70.0))

        theta = AtmosphericThermodynamics.potential_temperature(temp, press)
        theta_e = AtmosphericThermodynamics.equivalent_potential_temperature(temp, press, rh)
        tv = AtmosphericThermodynamics.virtual_temperature(temp, press, rh)
        lapse = AtmosphericThermodynamics.moist_adiabatic_lapse_rate(temp, press)

        print(json.dumps({
            "status": "success",
            "potential_temperature_k": theta,
            "equivalent_potential_temperature_k": theta_e,
            "virtual_temperature_c": tv,
            "moist_adiabatic_lapse_rate_k_per_km": lapse
        }))

    elif command == "validate":
        is_ok, errs = ScientificValidator.validate_surface_observation(payload)
        reg_check = IndianClimatologicalValidator.validate_regional_observation(
            payload,
            latitude=payload.get("latitude", 20.0),
            longitude=payload.get("longitude", 85.0),
            elevation_m=payload.get("elevation_m", 45.0)
        )
        print(json.dumps({
            "is_valid": is_ok and reg_check["is_valid"],
            "errors": errs + reg_check["flags"],
            "regional_zone": reg_check["regional_zone"]
        }))

    elif command == "qc":
        qc_result = WMOQualityControlEngine.evaluate_station_packet(payload)
        print(json.dumps({"status": "success", "qc": qc_result}))

    elif command == "verify":
        fcst = payload.get("forecasts", [])
        obs = payload.get("observations", [])
        continuous = ForecastVerificationEngine.verify_continuous_parameter(fcst, obs)
        rain_threshold = payload.get("threshold_mm", 2.5)
        contingency = ForecastVerificationEngine.verify_rain_contingency(fcst, obs, rain_threshold)
        print(json.dumps({
            "status": "success",
            "continuous_metrics": continuous,
            "contingency_metrics": contingency
        }))

    elif command == "compare":
        models = payload.get("models", {})
        spread = ModelComparisonAnalytics.calculate_ensemble_spread(models)
        print(json.dumps({"status": "success", "ensemble_spread": spread}))

    elif command == "aqi":
        aqi_val = int(payload.get("aqi", 150))
        dominant = payload.get("pollutant", "PM2.5")
        advisory = AQIAnalyticsProcessor.generate_health_advisory(aqi_val, dominant)
        print(json.dumps({"status": "success", "advisory": advisory}))

    elif command == "agromet":
        tmax = float(payload.get("t_max", 34.0))
        tmin = float(payload.get("t_min", 24.0))
        crop = payload.get("crop", "rice")
        gdd = AgrometIndices.growing_degree_days(tmax, tmin, crop)
        spray = AgrometIndices.evaluate_spraying_conditions(
            wind_speed_kmh=float(payload.get("wind_speed_kmh", 8.0)),
            temperature_c=float(payload.get("temp_c", 28.0)),
            relative_humidity=float(payload.get("humidity", 65.0)),
            precipitation_mm=float(payload.get("precip_mm", 0.0))
        )
        print(json.dumps({
            "status": "success",
            "crop": crop,
            "growing_degree_days": gdd,
            "spraying_window": spray
        }))

    elif command == "trends":
        series = payload.get("series", [])
        res = AtmosphericTrendAnalysis.mann_kendall_test(series)
        print(json.dumps({"status": "success", "trend_analysis": res}))

    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
