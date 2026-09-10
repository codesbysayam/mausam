#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
Air Quality Analytics & Health Advisory Synthesizer
====================================================================
"""

from typing import Dict, Any, List, Optional


class AQIAnalyticsProcessor:
    """
    Analyzes CPCB NAQI telemetry to evaluate health impacts and sensitive group risks.
    """

    HEALTH_STATEMENTS = {
        "Good": {
            "impact": "Minimal air quality impact.",
            "advisory": "Air quality is considered satisfactory, and air pollution poses little or no risk.",
            "color": "#4CAF50"
        },
        "Satisfactory": {
            "impact": "Minor breathing discomfort to sensitive people.",
            "advisory": "Sensitive individuals should consider reducing prolonged outdoor exertion.",
            "color": "#8BC34A"
        },
        "Moderate": {
            "impact": "Breathing discomfort to people with lung, asthma and heart diseases.",
            "advisory": "Children and older adults, and people with respiratory diseases should limit prolonged outdoor exertion.",
            "color": "#FFC107"
        },
        "Poor": {
            "impact": "Breathing discomfort to most people on prolonged exposure.",
            "advisory": "Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion.",
            "color": "#FF9800"
        },
        "Very Poor": {
            "impact": "Respiratory illness on prolonged exposure.",
            "advisory": "Active children and adults, and people with respiratory disease, should avoid all outdoor exertion; everyone else should limit prolonged outdoor exertion.",
            "color": "#F44336"
        },
        "Severe": {
            "impact": "Affects healthy people and seriously impacts those with existing diseases.",
            "advisory": "Everyone should avoid all outdoor exertion. Keep windows closed and operate HEPA purifiers.",
            "color": "#B71C1C"
        }
    }

    @classmethod
    def generate_health_advisory(cls, aqi_value: int, dominant_pollutant: str) -> Dict[str, Any]:
        """Maps an AQI value to official Indian CPCB medical advisories."""
        if aqi_value <= 50:
            category = "Good"
        elif aqi_value <= 100:
            category = "Satisfactory"
        elif aqi_value <= 200:
            category = "Moderate"
        elif aqi_value <= 300:
            category = "Poor"
        elif aqi_value <= 400:
            category = "Very Poor"
        else:
            category = "Severe"

        meta = cls.HEALTH_STATEMENTS[category]

        pollutant_note = ""
        if dominant_pollutant == "PM2.5":
            pollutant_note = "Fine particulate matter (PM2.5) penetrates deep into the alveolar tissue and cardiovascular bloodstream."
        elif dominant_pollutant == "PM10":
            pollutant_note = "Coarse dust and respirable particulate matter (PM10) causes upper airway irritation and coughing."
        elif dominant_pollutant == "Ozone":
            pollutant_note = "Ground-level photochemical ozone triggers airway inflammation and reduced lung volume."

        return {
            "aqi": aqi_value,
            "category": category,
            "prominent_pollutant": dominant_pollutant,
            "color_hex": meta["color"],
            "health_impact": meta["impact"],
            "public_advisory": meta["advisory"],
            "pollutant_pathology": pollutant_note
        }
