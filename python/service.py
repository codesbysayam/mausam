#!/usr/bin/env python3
"""
MAUSAM - Atmospheric Intelligence Platform
Python Scientific Service Bridge
"""

import sys
import json
from processing.atmospheric_calculations import AtmosphericCalculations
from validation.validator import ScientificValidator

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: service.py [calculate|validate|ingest] [json_payload]"}))
        sys.exit(1)

    command = sys.argv[1]

    if command == "calculate":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        temp = float(payload.get("temperature", 25.0))
        rh = float(payload.get("humidity", 60.0))
        wind = float(payload.get("wind_speed", 10.0))

        calc = AtmosphericCalculations()
        td = calc.dew_point(temp, rh)
        tw = calc.wet_bulb_temperature(temp, rh)
        hi = calc.heat_index(temp, rh)
        hx = calc.humidex(temp, td)
        bft = calc.beaufort_scale(wind)

        print(json.dumps({
            "status": "success",
            "dew_point_c": td,
            "wet_bulb_c": tw,
            "heat_index_c": hi,
            "humidex_c": hx,
            "beaufort": bft
        }))

    elif command == "validate":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        is_ok, errs = ScientificValidator.validate_surface_observation(payload)
        print(json.dumps({"is_valid": is_ok, "errors": errs}))

    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
