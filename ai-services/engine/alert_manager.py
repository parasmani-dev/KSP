import os
import pandas as pd
from datetime import datetime
from uuid import uuid4
from api.routes.predictions import get_hotspots, get_risk_bucket

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "Dataset") if os.path.exists(os.path.join(ROOT_DIR, "Dataset")) else os.path.join(BASE_DIR, "Dataset")

try:
    df_thresholds = pd.read_csv(os.path.join(DATA_DIR, "alert_thresholds_config.csv"))
except:
    df_thresholds = pd.DataFrame()

_last_alert_time = {}
_last_known_avg = {}

def evaluate_event(event: dict, provided_risk_score: float = None) -> dict | None:
    crime_type = event.get("crime_type")
    area = event.get("area")
    
    risk_threshold = 0.75
    cooldown_minutes = 30
    
    if not df_thresholds.empty and 'crime_type' in df_thresholds.columns and 'area' in df_thresholds.columns:
        match = df_thresholds[(df_thresholds['crime_type'] == crime_type) & (df_thresholds['area'] == area)]
        if not match.empty:
            risk_threshold = float(match.iloc[0]['risk_threshold'])
            cooldown_minutes = float(match.iloc[0]['cooldown_minutes'])
            
    if provided_risk_score is not None:
        risk_score = provided_risk_score
    else:
        # get current risk score for area
        hotspots_data = get_hotspots(days=7)
        hotspots = hotspots_data.get("hotspots", [])
        
        risk_score = 0.0
        for spot in hotspots:
            if spot["area"] == area:
                risk_score = spot.get("risk_score", 0.0)
                break
            
    now = datetime.now()
    key = f"{area}_{crime_type}"
    if key in _last_alert_time:
        elapsed = (now - _last_alert_time[key]).total_seconds() / 60
        if elapsed < cooldown_minutes:
            return None
            
    if risk_score >= risk_threshold:
        _last_alert_time[key] = now
        return {
            "alert_id": str(uuid4()),
            "timestamp": now.isoformat(),
            "area": area,
            "crime_type": crime_type,
            "trigger_type": "EMERGENCY_SPIKE",
            "risk_score": risk_score,
            "risk_threshold": risk_threshold,
            "message": f"Risk spike in {area}: {crime_type} activity exceeds threshold {risk_threshold}",
            "severity": "CRITICAL" if risk_score >= 0.86 else "HIGH"
        }
        
    return None

def get_incremental_hotspot_update(event: dict) -> dict:
    area = event.get("area")
    
    if area not in _last_known_avg:
        _last_known_avg[area] = 15.0
            
    old_count = _last_known_avg[area]
    new_count = old_count * 0.95 + 1.5
    _last_known_avg[area] = new_count
    
    # Simple risk score baseline computation based on new count
    risk_score = min(1.0, new_count / 20.0)
    risk_level = get_risk_bucket(risk_score)
    
    return {
        "area": area,
        "avg_predicted_incidents": round(new_count, 2),
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level
    }
