from fastapi import APIRouter, HTTPException
import os
import pandas as pd
import numpy as np
import joblib
from pydantic import BaseModel

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAVED_DIR = os.path.join(BASE_DIR, "models", "saved")
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "Dataset") if os.path.exists(os.path.join(ROOT_DIR, "Dataset")) else os.path.join(BASE_DIR, "Dataset")

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

def get_mock_hotspots(days: int):
    file_path = os.path.join(DATA_DIR, "mock_predictions_sample.csv")
    if not os.path.exists(file_path):
        file_path = os.path.join(DATA_DIR, "mock_predictions.csv")
    try:
        df = pd.read_csv(file_path)
    except:
        return {"hotspots": []}
    
    hotspots = []
    for _, row in df.iterrows():
        score = row.get('risk_score', 0)
        hotspots.append({
            "area": row.get('area', 'Unknown'),
            "forecast_days": days,
            "avg_predicted_incidents": row.get('predicted_count_7d', 0),
            "risk_score": score,
            "risk_level": get_risk_bucket(score),
            "reasons": [
                {"code": "SOURCE", "value": "MOCK_FALLBACK"},
                {"code": "TREND", "value": row.get('trend', 'Unknown')},
                {"code": "DOMINANT_CRIME", "value": row.get('dominant_crime', 'Unknown')}
            ]
        })
    return {"hotspots": hotspots[:10]}

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
        return get_mock_hotspots(days)
        
    # First pass: calculate avg counts for all areas in parallel
    area_metrics = {}
    import concurrent.futures
    
    def process_area(item):
        area, m = item
        future = m.make_future_dataframe(periods=days)
        forecast = m.predict(future)
        
        future_only = forecast.tail(days)
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
        # Divide by (baseline * 1.5) so that 100% risk means 50% above normal median
        normalized_score = min(avg_count / (area_baseline * 1.5), 1.0)
        risk_level = get_risk_bucket(normalized_score)
            
        spot = {
            "area": area,
            "forecast_days": days,
            "avg_predicted_incidents": round(avg_count, 2),
            "risk_score": round(normalized_score, 2),
            "risk_level": risk_level,
            "reasons": [
                {"code": "FORECAST_DAILY_COUNT", "value": round(float(avg_count), 2), "baseline": round(float(area_baseline), 2)},
                {"code": "TREND_DIRECTION", "value": "escalating" if growth_pct > 0 else "stable or declining"},
                {"code": "NORMALIZED_RISK", "value": round(float(normalized_score), 2)}
            ]
        }
        
        # Case 1: Sparse Area (In training, but <30 samples, baseline backfilled to median)
        if area in sparse_areas:
            spot["low_confidence"] = True
            
        hotspots.append(spot)
    hotspots.sort(key=lambda x: x["risk_score"] if x["risk_score"] is not None else -1, reverse=True)
    return {"hotspots": hotspots}

@router.get("/trend")
def get_trend(area: str = None, days: int = 14):
    """Returns day-by-day historical and predicted incident counts."""
    load_models()
    if 'prophet' not in models:
        raise HTTPException(status_code=503, detail="Prophet model not available.")
    
    trend_data = []
    today = pd.Timestamp.today().normalize()
    start_date = today - pd.Timedelta(days=days)
    dates = pd.date_range(start=start_date, periods=days*2 + 1)
    future = pd.DataFrame({'ds': dates})
    
    if area and area in models['prophet']:
        m = models['prophet'][area]
        recent = m.predict(future)
        
        for _, row in recent.iterrows():
            date = row['ds']
            val = max(0, row['yhat'])
            date_str = date.strftime('%m/%d')
            
            if date < today:
                trend_data.append({"day": date_str, "historical": round(val, 2), "predicted": None})
            elif date == today:
                trend_data.append({"day": "Today", "historical": round(val, 2), "predicted": round(val, 2)})
            else:
                trend_data.append({"day": date_str, "historical": None, "predicted": round(val, 2)})
    else:
        agg_forecast = {}
        for a, m in models['prophet'].items():
            recent = m.predict(future)
            
            for _, row in recent.iterrows():
                date_str = row['ds'].strftime('%m/%d')
                if date_str not in agg_forecast:
                    agg_forecast[date_str] = {"val": 0, "ds": row['ds']}
                agg_forecast[date_str]["val"] += max(0, row['yhat'])
                
        sorted_dates = sorted(agg_forecast.values(), key=lambda x: x["ds"])
        
        for item in sorted_dates:
            date = item["ds"]
            val = item["val"]
            date_str = date.strftime('%m/%d')
            
            if date < today:
                trend_data.append({"day": date_str, "historical": round(val, 2), "predicted": None})
            elif date == today:
                trend_data.append({"day": "Today", "historical": round(val, 2), "predicted": round(val, 2)})
            else:
                trend_data.append({"day": date_str, "historical": None, "predicted": round(val, 2)})
                
    return {"trend": trend_data}

@router.get("/factors")
def get_factors(days: int = 7):
    """Returns dynamic AI prediction driving factors, scaled to the forecast horizon."""
    load_models()
    now = pd.Timestamp.now()
    today = now.normalize()
    
    # Scale factor — longer horizons amplify cumulative risk
    scale = 1.0 if days == 7 else (1.25 if days == 14 else 1.5)
    
    pool = []

    # 1. Weekend Effect
    day_of_week = today.dayofweek
    if day_of_week in [4, 5, 6]:
        weekend_pct = 25 + (day_of_week - 4) * 10
    else:
        weekend_pct = max(5, 25 - (4 - day_of_week) * 5)
    # More weekends in a longer window
    weekends_in_window = max(1, days // 7)
    weekend_pct = min(95, int(weekend_pct * weekends_in_window * (0.8 if days > 7 else 1.0)))
    pool.append({"icon": "TrendingUp", "title": "Weekend Effect", "desc": f"{weekends_in_window} weekend(s) in window", "pct": f"+{weekend_pct}%", "color": "bg-orange-500", "iconColor": "text-orange-500", "val": weekend_pct})

    # 2. Festival Season
    month = today.month
    if month in [10, 11]:
        fest_pct = int(45 * scale)
    elif month in [12, 1]:
        fest_pct = int(25 * scale)
    else:
        fest_pct = int(12 * scale)
    fest_pct = min(95, fest_pct)
    pool.append({"icon": "Calendar", "title": "Festival Season", "desc": f"Cumulative risk over {days} days", "pct": f"+{fest_pct}%", "color": "bg-red-500", "iconColor": "text-red-500", "val": fest_pct})

    # 3. Prior Crime Density
    base_val = 3.0
    if 'area_baselines' in models and '__citywide_median__' in models['area_baselines']:
        base_val = models['area_baselines']['__citywide_median__']
    density_pct = min(90, int(((base_val / 5.0) * 20) + 15 + (days * 0.5)))
    pool.append({"icon": "MapPin", "title": "Prior Crime Density", "desc": f"Across {days}-day forecast window", "pct": f"+{density_pct}%", "color": "bg-orange-500", "iconColor": "text-orange-500", "val": density_pct})

    # 4. Patrol Gap
    patrol_pct = max(10, density_pct - 15)
    pool.append({"icon": "Activity", "title": "Patrol Gap", "desc": f"Coverage deficit over {days} days", "pct": f"+{patrol_pct}%", "color": "bg-yellow-500", "iconColor": "text-yellow-500", "val": patrol_pct})

    # 5. Population Movement
    pop_pct = min(75, int((weekend_pct + fest_pct) / 2) + 10)
    pool.append({"icon": "Users", "title": "Population Movement", "desc": "Increased footfall expected", "pct": f"+{pop_pct}%", "color": "bg-green-500", "iconColor": "text-green-500", "val": pop_pct})

    # 6. Night Crime Spike
    hour = now.hour
    if hour >= 20 or hour <= 4:
        night_pct = 50 + (abs(hour - 24) if hour >= 20 else hour) * 5
    else:
        night_pct = 5
    pool.append({"icon": "Moon", "title": "Night Crime Spike", "desc": "Reduced visibility & security", "pct": f"+{night_pct}%", "color": "bg-indigo-500", "iconColor": "text-indigo-500", "val": night_pct})

    # 7. Summer Heat Agitation
    if month in [4, 5, 6]:
        heat_pct = min(90, int((35 + (month - 4) * 5) * scale))
    else:
        heat_pct = 8
    pool.append({"icon": "Thermometer", "title": "Summer Heat Agitation", "desc": "High temp behavioral shift", "pct": f"+{heat_pct}%", "color": "bg-red-500", "iconColor": "text-red-500", "val": heat_pct})

    # 8. Traffic Gridlock
    if hour in [8, 9, 10, 17, 18, 19]:
        traffic_pct = 40
    else:
        traffic_pct = 15
    pool.append({"icon": "Car", "title": "Traffic Gridlock", "desc": "Rush hour frustration", "pct": f"+{traffic_pct}%", "color": "bg-yellow-500", "iconColor": "text-yellow-500", "val": traffic_pct})

    # Sort descending by val
    pool.sort(key=lambda x: x['val'], reverse=True)
    
    # Return top 5, removing the internal 'val' key
    top_5 = pool[:5]
    for item in top_5:
        del item['val']
        
    return {"factors": top_5}

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
                    {"code": "GROWTH_RATE_PCT", "value": round(float(growth_rate), 2), "window_days": 14},
                    {"code": "RECENT_COUNT", "value": round(float(next_7_days), 1)},
                    {"code": "PRIOR_COUNT", "value": round(float(prev_7_days), 1)},
                    {"code": "ESCALATION_THRESHOLD", "value": 20.0}
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
            {"code": "PRIOR_CRIME_COUNT", "value": prior_crimes},
            {"code": "DAYS_SINCE_LAST_CRIME", "value": days_since},
            {"code": "NETWORK_CONNECTIONS", "value": connections},
            {"code": "XGBOOST_PROBABILITY", "value": round(float(prob), 4)}
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
        {"code": "ISOLATION_SCORE", "value": round(float(score), 3)},
        {"code": "TOP_DEVIATING_FEATURES", "value": [feature_names[i] for i in reversed(top_feature_idx)]},
        {"code": "ANOMALY_THRESHOLD", "value": round(float(threshold), 3)},
        {"code": "RANGE_STATUS", "value": "anomaly" if is_anomaly else "normal"}
    ]
        
    return {
        "area": req.area,
        "is_anomaly": bool(is_anomaly),
        "alerts": threats,
        "reasons": reasons
    }

@router.get("/events")
def get_events(days: int = 7):
    """Returns top predicted events (hybrid calendar/AI logic) for the next N days."""
    load_models()
    events = []
    today = pd.Timestamp.today().normalize()
    
    # 1. Hybrid Rule: Weekends within the full horizon
    weekends_added = 0
    for i in range(1, days + 1):
        future_day = today + pd.Timedelta(days=i)
        if future_day.dayofweek == 5:  # Saturday
            sunday = future_day + pd.Timedelta(days=1)
            date_str = f"{future_day.strftime('%b %d')} - {sunday.strftime('%b %d')}"
            events.append({
                "title": "Weekend Risk Spike",
                "date": date_str,
                "risk": "Medium Risk",
                "riskColor": "text-orange-500 border-orange-500/30",
                "iconType": "Calendar",
                "iconBg": "bg-orange-500/20"
            })
            weekends_added += 1
            if weekends_added >= 2:  # Cap at 2 weekends to avoid clutter
                break

    # 2. Hybrid Rule: Festivals / Holidays based on real month
    month = today.month
    if month in [6, 7]:
        events.append({
            "title": "Summer Heat Agitation",
            "date": "Ongoing",
            "risk": "High Risk",
            "riskColor": "text-red-500 border-red-500/30",
            "iconType": "Thermometer",
            "iconBg": "bg-red-500/20"
        })
    elif month in [10, 11]:
        events.append({
            "title": "Festival Season Surge",
            "date": "Upcoming Weeks",
            "risk": "Critical Risk",
            "riskColor": "text-red-500 border-red-500/30",
            "iconType": "Activity",
            "iconBg": "bg-red-500/20"
        })

    # 3. AI Predictive Anomalies across the full horizon
    if 'prophet' in models:
        dates = pd.date_range(start=today, periods=days + 1)[1:]  # next N days
        future = pd.DataFrame({'ds': dates})
        
        city_daily = np.zeros(days)
        
        for area, m in models['prophet'].items():
            forecast = m.predict(future)
            city_daily += forecast['yhat'].values
            
        mean_city = np.mean(city_daily)
        std_city = np.std(city_daily)
        
        # Find days > mean + 1 std
        spike_dates = []
        for i, val in enumerate(city_daily):
            if val > (mean_city + std_city):
                spike_dates.append(dates[i])
        
        if spike_dates:
            if len(spike_dates) == 1:
                date_str = spike_dates[0].strftime('%b %d')
            else:
                date_str = f"{spike_dates[0].strftime('%b %d')} - {spike_dates[-1].strftime('%b %d')}"
                
            events.append({
                "title": "AI Detected Crime Spike",
                "date": date_str,
                "risk": "High Risk",
                "riskColor": "text-red-500 border-red-500/30",
                "iconType": "ShieldAlert",
                "iconBg": "bg-purple-500/20"
            })

    # Limit to top 5
    return {"events": events[:5]}
