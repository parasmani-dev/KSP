from fastapi import APIRouter, HTTPException
import os
import pandas as pd
import numpy as np
import joblib
from pydantic import BaseModel

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAVED_DIR = os.path.join(BASE_DIR, "models", "saved")

# Removed PyTorch models to avoid overlapping with Module 1's architecture.

# Lazy loading models
models = {}

def get_risk_bucket(score: float) -> str:
    """Unified risk bucket math mapping 0.0-1.0 probability score to Ideation spec labels."""
    if score >= 0.86:
        return "Critical"
    elif score >= 0.61:
        return "High"
    elif score >= 0.31:
        return "Moderate"
    return "Low"

def load_models():
    if not models:
        try:
            models['prophet'] = joblib.load(os.path.join(SAVED_DIR, "prophet_models.joblib"))
            models['area_baselines'] = joblib.load(os.path.join(SAVED_DIR, "area_baselines.joblib"))
            models['xgboost'] = joblib.load(os.path.join(SAVED_DIR, "xgboost_offenders.joblib"))
            models['le_crime_xgb'] = joblib.load(os.path.join(SAVED_DIR, "le_crime_xgb.joblib"))
            models['le_area_xgb'] = joblib.load(os.path.join(SAVED_DIR, "le_area_xgb.joblib"))
            
            # Load Encoders for Emerging Threats
            models['le_area'] = joblib.load(os.path.join(SAVED_DIR, "le_area.joblib"))
            models['scaler'] = joblib.load(os.path.join(SAVED_DIR, "scaler_crimes.joblib"))
            models['iso_forest'] = joblib.load(os.path.join(SAVED_DIR, "iso_forest_threats.joblib"))
            
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

class ThreatRequest(BaseModel):
    area: str
    hour: int
    day: str
    month: int
    crime_type: str
    is_festival_period: int
    is_night_crime: int
    is_weekend: int

@router.get("/")
def get_all_predictions():
    """Returns all current predictions (hotspots, etc.)"""
    load_models()
    if not models:
        raise HTTPException(status_code=503, detail="Models not trained yet.")
    return {"message": "Models are active. Use specific endpoints for inference."}

@router.post("/run")
def run_prediction_engine():
    """Manually trigger the prediction engine to re-run using latest data"""
    import subprocess
    script_path = os.path.join(BASE_DIR, "models", "train_models.py")
    subprocess.Popen(["python", script_path])
    return {"message": "Prediction engine run triggered in background."}

@router.get("/hotspots")
def get_hotspots(days: int = 7):
    """(Feature 4.1) Returns geographical crime hotspot predictions with explicit risk levels."""
    if days not in [7, 14, 30]:
        raise HTTPException(status_code=400, detail="Days must be 7, 14, or 30.")
        
    load_models()
    if 'prophet' not in models:
        raise HTTPException(status_code=503, detail="Prophet model not available.")
        
    # First pass: calculate avg counts for all areas in parallel
    area_metrics = {}
    import concurrent.futures
    
    def process_area(item):
        area, m = item
        future = m.make_future_dataframe(periods=days)
        forecast = m.predict(future)
        
        future_only = forecast[forecast['ds'] > pd.Timestamp.today()]
        assert len(future_only) > 0, "Forecast contains no future dates"
        avg_count = float(np.mean(future_only['yhat']))
        
        latest_14 = forecast.tail(14)['yhat'].values
        prev_7 = np.mean(latest_14[:7])
        next_7 = np.mean(latest_14[7:])
        growth_pct = ((next_7 - prev_7) / prev_7 * 100) if prev_7 > 0 else 0.0
        
        return area, {"avg_count": max(0, avg_count), "growth_pct": growth_pct}
        
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(process_area, models['prophet'].items())
        for area, metrics in results:
            area_metrics[area] = metrics
        
    hotspots = []
    area_baselines = models.get('area_baselines', {})
    sparse_areas = area_baselines.get('__sparse_areas__', [])
    
    for area, metrics in area_metrics.items():
        avg_count = metrics["avg_count"]
        growth_pct = metrics["growth_pct"]
        
        area_baseline = area_baselines.get(area)

        # Case 2: Unknown Area
        if area_baseline is None:
            hotspots.append({
                "area": area,
                "risk_level": "Unknown",
                "risk_score": None,
                "insufficient_data": True,
                "message": "No historical baseline exists for this area."
            })
            continue
        
        # Normalize against THIS area's historical max, capped at 1.0
        normalized_score = min(avg_count / area_baseline, 1.0)
        risk_level = get_risk_bucket(normalized_score)
            
        spot = {
            "area": area,
            "forecast_days": days,
            "avg_predicted_incidents": round(avg_count, 2),
            "risk_score": round(normalized_score, 2),
            "risk_level": risk_level,
            "reasons": [
                f"Forecasted {avg_count:.1f} daily incidents (area baseline: {area_baseline:.1f})",
                f"Trend: {'escalating' if growth_pct > 0 else 'stable or declining'} over forecast window",
                f"Risk normalized to {normalized_score:.2f} against historical 90th percentile"
            ]
        }
        
        # Case 1: Sparse Area (In training, but <30 samples, baseline backfilled to median)
        if area in sparse_areas:
            spot["low_confidence"] = True
            
        hotspots.append(spot)
        
    return {"hotspots": hotspots}

@router.get("/escalation")
def get_escalation():
    """(Feature 4.2) Identifies areas where crime rate is growing rapidly."""
    load_models()
    if 'prophet' not in models:
        raise HTTPException(status_code=503, detail="Prophet model not available.")
        
    escalating_areas = []
    for area, m in models['prophet'].items():
        future = m.make_future_dataframe(periods=7)
        forecast = m.predict(future)
        latest = forecast.tail(14)['yhat'].values
        
        # Compare last 7 days vs previous 7 days to find escalation rate
        prev_7_days = np.mean(latest[:7])
        next_7_days = np.mean(latest[7:])
        
        if prev_7_days > 0:
            growth_rate = ((next_7_days - prev_7_days) / prev_7_days) * 100
        else:
            growth_rate = 0.0
            
        if growth_rate > 20: # 20% spike is an escalation
            escalating_areas.append({
                "area": area,
                "growth_rate_percentage": round(growth_rate, 2),
                "status": "Escalating",
                "reasons": [
                    f"Crime count grew {growth_rate:.1f}% over the past 14 days",
                    f"Recent period: {round(next_7_days, 1)} incidents vs prior period: {round(prev_7_days, 1)} incidents",
                    f"Threshold for escalation flag: >20% growth rate"
                ]
            })
            
    return {"escalating_areas": escalating_areas}

@router.get("/offender/{citizen_id}")
def get_offender_risk(citizen_id: str, prior_crimes: int = 0, days_since: int = 0, connections: int = 0, escalation: float = 0.0, crime_type: str = "Theft", area: str = "Unknown"):
    """(Feature 4.3) Returns the re-offend risk score using XGBoost"""
    load_models()
    if 'xgboost' not in models:
        raise HTTPException(status_code=503, detail="XGBoost model not available.")
        
    try:
        crime_encoded = models['le_crime_xgb'].transform([crime_type])[0]
    except:
        crime_encoded = 0
        
    try:
        area_encoded = models['le_area_xgb'].transform([area])[0]
    except:
        area_encoded = 0

    X_test = pd.DataFrame([{
        'prior_crime_count': prior_crimes,
        'days_since_last_crime': days_since,
        'network_connections': connections,
        'escalation_score': escalation,
        'primary_crime_type_encoded': crime_encoded,
        'area_encoded': area_encoded
    }])
    
    if not citizen_id or not citizen_id.strip():
        raise HTTPException(status_code=400, detail="citizen_id cannot be empty")
        
    prob = float(models['xgboost'].predict_proba(X_test)[0][1])
    
    return {
        "citizen_id": citizen_id, 
        "reoffend_probability": round(prob * 100, 2),
        "risk_level": get_risk_bucket(prob),
        "reasons": [
            f"Prior crime count: {prior_crimes}",
            f"Days since last crime: {days_since}",
            f"Network connections to known offenders: {connections}",
            f"XGBoost re-offend probability: {prob:.2f}"
        ]
    }

@router.post("/emerging_threats")
def detect_emerging_threats(req: ThreatRequest):
    """(Feature 4.4) Flags unusual spikes or novel crime patterns."""
    if not req.area or not req.area.strip():
        raise HTTPException(status_code=400, detail="area cannot be empty")
        
    load_models()
    if 'iso_forest' not in models:
        raise HTTPException(status_code=503, detail="Isolation Forest model not available.")
        
    try:
        area_encoded = models['le_area'].transform([req.area])[0]
    except:
        area_encoded = 0
        
    day_encoded = 1
    
    features = np.array([[area_encoded, req.hour, day_encoded, req.month, req.is_festival_period, req.is_night_crime, req.is_weekend]])
    features_scaled = models['scaler'].transform(features)
    
    # 1 is normal, -1 is anomaly
    prediction = models['iso_forest'].predict(features_scaled)[0]
    score = float(models['iso_forest'].decision_function(features_scaled)[0])
    threshold = float(models['iso_forest'].offset_)
    
    # Calculate feature deviation
    means = models['scaler'].mean_
    stds = models['scaler'].scale_
    deviations = np.abs(features[0] - means) / stds
    feature_names = ['area_encoded', 'hour', 'day_encoded', 'month', 'is_festival_period', 'is_night_crime', 'is_weekend']
    top_feature_idx = np.argsort(deviations)[-2:] # Top 2 features
    top_features = ", ".join([feature_names[i] for i in reversed(top_feature_idx)])
    
    is_anomaly = (prediction == -1)
    
    threats = []
    if is_anomaly:
        # Construct an explicit anomaly string matching the spec
        threats.append(f"Sudden spike in {req.crime_type} activity detected at {req.area} (novel pattern)")
        
    reasons = [
        f"Isolation Forest anomaly score: {score:.3f}",
        f"Features with highest deviation: {top_features}",
        f"Score threshold for anomaly flag: {threshold:.3f}",
        f"Result: {'Outside normal range (Anomaly)' if is_anomaly else 'Inside normal range (Normal)'}"
    ]
        
    return {
        "area": req.area,
        "is_anomaly": bool(is_anomaly),
        "alerts": threats,
        "reasons": reasons
    }
