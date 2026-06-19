from fastapi import APIRouter, HTTPException
from api.routes.predictions import get_hotspots
import pandas as pd
import os
from math import radians, sin, cos, sqrt, atan2

router = APIRouter()

# Fix path to point to actual root where Dataset is located
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "Dataset") if os.path.exists(os.path.join(ROOT_DIR, "Dataset")) else os.path.join(BASE_DIR, "Dataset")

try:
    df_cctv = pd.read_csv(os.path.join(DATA_DIR, "cctv_cameras_sample.csv"))
except:
    df_cctv = pd.DataFrame()

# Currently using open_cases_sample.csv suspect_count
# TODO: Replace with HTTP call to Graph Service
# Expected: GET {graph_service_url}/graph/case/{id}
# which will return actual graph-derived connections
try:
    df_open_cases = pd.read_csv(os.path.join(DATA_DIR, "open_cases_sample.csv"))
    df_mock_graph = pd.read_csv(os.path.join(DATA_DIR, "mock_graph_sample.csv"))
except:
    df_open_cases = pd.DataFrame()
    df_mock_graph = pd.DataFrame()



def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlambda/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

@router.get("/patrol")
def get_patrol_recommendations():
    hotspots_response = get_hotspots(days=7)
    hotspots = hotspots_response.get("hotspots", [])
    try:
        df_offenders = pd.read_csv(os.path.join(DATA_DIR, "repeat_offenders_sample.csv"))
    except:
        df_offenders = pd.DataFrame()
        
    recommendations = []
    for spot in hotspots:
        if spot.get("risk_level") in ["Critical", "High", "Moderate"]:
            area_name = spot["area"]
            suspects_count = 0
            if not df_offenders.empty and 'area' in df_offenders.columns:
                suspects_count = len(df_offenders[(df_offenders['area'] == area_name) & (df_offenders['reoffended'] == 1)])
            priority = spot.get("risk_level")
            forecasted = spot.get('avg_predicted_incidents', 0)
            recommendations.append({
                "area": area_name,
                "action": "Increase visible night patrols",
                "priority": priority,
                "reasons": [
                    f"{suspects_count} known suspects reside in this area",
                    f"Forecasted {forecasted} daily incidents over 7-day window",
                    f"Risk level: {priority} based on Prophet forecast"
                ]
            })
    return {"recommendations": recommendations}

@router.get("/investigation")
def get_investigation_recommendations(case_id: str = None):
    if df_open_cases.empty or df_mock_graph.empty:
        return {"recommendations": [], "reasons": ["Data missing"]}

    df_join = pd.merge(df_open_cases, df_mock_graph, on="case_id", how="inner")
    recommendations = []
    for _, row in df_join.iterrows():
        # Use the integer count columns directly from open_cases_sample.csv
        suspect_count_val = int(row.get('suspect_count', 0)) if not pd.isna(row.get('suspect_count')) else 0
        missing_evidence_count = int(row.get('evidence_missing_count', 0)) if not pd.isna(row.get('evidence_missing_count')) else 0
            
        score = (suspect_count_val * 0.6) + (missing_evidence_count * 0.4)
        if score > 0.7: action = "INTERVIEW_SUSPECT"
        elif score > 0.4: action = "COLLECT_EVIDENCE"
        else: action = "MONITOR"
            
        confidence = row.get('confidence', 0.0)
        
        recommendations.append({
            "case_id": row['case_id'],
            "score": score,
            "action": action,
            "priority": "High" if score > 0.7 else "Medium" if score > 0.4 else "Low",
            "reasons": [
                f"Connected to {suspect_count_val} suspects (source: case records)",
                f"{missing_evidence_count} evidence items still unprocessed",
                f"Confidence score: {confidence}"
            ]
        })
        
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    if case_id:
        recommendations = [r for r in recommendations if r['case_id'] == case_id]
        
    return {"recommendations": recommendations[:3]}

@router.get("/cctv")
def get_cctv_recommendations(area: str, crime_type: str = ""):
    if df_cctv.empty or area not in df_cctv['area'].unique():
        raise HTTPException(status_code=404, detail="Area not in camera database")
        
    if df_cctv.empty:
        return {"recommended_cameras": [], "reasons": ["No active cameras in this area"]}
        
    df_filtered = df_cctv[(df_cctv['status'].astype(str).str.lower() == 'active') & (df_cctv['area'] == area)]
    if df_filtered.empty:
        return {"recommended_cameras": [], "reasons": ["No active cameras in this area"]}
        
    lat_col = 'latitude' if 'latitude' in df_filtered.columns else 'lat'
    lon_col = 'longitude' if 'longitude' in df_filtered.columns else 'lng'
    c_lat = df_filtered[lat_col].mean()
    c_lon = df_filtered[lon_col].mean()
    cameras = []
    for _, row in df_filtered.iterrows():
        lat = row.get('lat', row.get('latitude', 0.0))
        lon = row.get('lng', row.get('longitude', 0.0))
        dist = haversine(c_lat, c_lon, lat, lon)
        cameras.append({
            "camera_id": str(row['camera_id']),
            "latitude": lat,
            "longitude": lon,
            "distance_from_centroid_m": round(dist, 1),
            "coverage_radius_m": int(row.get('coverage_radius_m', 150)),
            "status": "active"
        })
        
    cameras.sort(key=lambda x: x['distance_from_centroid_m'])
    total_active = len(cameras)
    top_cams = cameras[:5]
    
    if not top_cams:
        return {"recommended_cameras": [], "reasons": ["No active cameras in this area"]}
        
    nearest_dist = top_cams[0]['distance_from_centroid_m']
    nearest_id = top_cams[0]['camera_id']
    
    return {
        "area": area,
        "crime_type": crime_type,
        "total_active_cameras": total_active,
        "recommended_cameras": top_cams,
        "reasons": [
            f"{total_active} active cameras found in {area}",
            "Sorted by proximity to area centroid",
            f"{nearest_id} is nearest at {nearest_dist}m from area center",
            f"Top {len(top_cams)} returned from {total_active} active cameras"
        ]
    }
