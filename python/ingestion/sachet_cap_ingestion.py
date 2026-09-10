#!/usr/bin/env python3
"""
====================================================================
MAUSAM - Atmospheric Intelligence Platform
OASIS Common Alerting Protocol (CAP v1.2) Ingestion for NDMA & SACHET
====================================================================
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.weather_models import CAPAlert


class SachetCAPIngestion:
    @staticmethod
    def parse_alert_feed(raw_json: Dict[str, Any]) -> List[CAPAlert]:
        """Parses disaster alerts from NDMA / State SDMA CAP feeds."""
        alerts = []
        features = raw_json.get("features", []) or raw_json.get("alerts", [])

        for f in features:
            props = f.get("properties", f)
            alert_id = props.get("identifier", props.get("id", "NDMA-UNKNOWN"))
            sender = props.get("sender", "NDMA-National-EWS")
            sent = props.get("sent", datetime.utcnow().isoformat())
            status = props.get("status", "Actual")
            msg_type = props.get("msgType", "Alert")
            scope = props.get("scope", "Public")

            info = props.get("info", {})
            if isinstance(info, list) and len(info) > 0:
                info = info[0]

            event = info.get("event", "Severe Meteorological Hazard")
            urgency = info.get("urgency", "Expected")
            severity_raw = info.get("severity", "Moderate")

            # Map to IMD / NDMA 4-tier color code
            severity_map = {
                "Extreme": "Red",
                "Severe": "Orange",
                "Moderate": "Yellow",
                "Minor": "Green"
            }
            severity = severity_map.get(severity_raw, "Yellow")

            certainty = info.get("certainty", "Observed")
            headline = info.get("headline", event)
            description = info.get("description", "Active weather warning issued by state meteorological center.")
            instruction = info.get("instruction", "Follow local administrative advisories.")

            area_info = info.get("area", {})
            if isinstance(area_info, list) and len(area_info) > 0:
                area_info = area_info[0]
            area_desc = area_info.get("areaDesc", "Affected Region")

            geom = f.get("geometry", {})
            coords = geom.get("coordinates") if geom else None

            alerts.append(CAPAlert(
                identifier=alert_id,
                sender=sender,
                sent_at=sent,
                status=status,
                msg_type=msg_type,
                scope=scope,
                event=event,
                urgency=urgency,
                severity=severity,
                certainty=certainty,
                headline=headline,
                description=description,
                instruction=instruction,
                area_desc=area_desc,
                polygon=coords
            ))

        return alerts
