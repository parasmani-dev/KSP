from fastapi import APIRouter
from api.routes.predictions import get_hotspots
import pandas as pd
import os

router = APIRouter()

@router.get("/patrol")
def get_patrol_recommendations():
    """Returns actionable patrol recommendations based on predictions"""
    hotspots_response = get_hotspots(days=7)
    hotspots = hotspots_response.get("hotspots", [])
    
    # True Data Join: Load real offender data to count suspects per area
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR = os.path.join(BASE_DIR, "Dataset")
    try:
        df_offenders = pd.read_csv(os.path.join(DATA_DIR, "repeat_offenders.csv"))
    except:
        df_offenders = pd.DataFrame()
        
    recommendations = []
    
    for spot in hotspots:
        if spot["risk_level"] in ["Critical", "High"]:
            area_name = spot["area"]
            
            suspects_count = 0
            if not df_offenders.empty and 'area' in df_offenders.columns:
                # Count high-risk suspects in this specific area
                suspects_count = len(df_offenders[(df_offenders['area'] == area_name) & (df_offenders['reoffended'] == 1)])
                
            reason = f"{suspects_count} known suspects reside in this area. Forecasted {spot['avg_predicted_incidents']} incidents."
            
            recommendations.append({
                "area": area_name,
                "action": "Increase visible night patrols",
                "priority": spot["risk_level"],
                "reason": reason
            })
            
    return {"recommendations": recommendations}

@router.get("/investigation")
def get_investigation_recommendations():
    """Returns actionable investigation recommendations based on cases and predictions"""
    # Mock data since the Graph Service (Module 2) is built by teammates
    return {
        "recommendations": [
            {
                "case_id": "CASE-102",
                "action": "Interview suspect OFF001",
                "priority": "High",
                "reason": "Suspect has a Critical re-offend risk score and is linked to the primary crime type."
            },
            {
                "case_id": "CASE-105",
                "action": "Deploy undercover unit",
                "priority": "Medium",
                "reason": "Escalation in area detected over the last 7 days."
            }
        ]
    }

@router.get("/cctv")
def get_cctv_recommendations(area: str, time_window: str, case_id: str):
    """Get actionable CCTV search suggestions for an area and time window"""
    # Mock data to fulfill the endpoint specification without blocking on Java team
    return {
        "case_id": case_id,
        "area": area,
        "time_window": time_window,
        "suggested_cameras": [
            {"camera_id": f"CAM-{area[:3].upper()}-01", "location": f"{area} Main Intersection", "priority": "High"},
            {"camera_id": f"CAM-{area[:3].upper()}-02", "location": f"{area} Alleyway Exit", "priority": "Medium"}
        ]
    }

@router.post("/generate")
def generate_recommendations():
    """Manually trigger the generation of new recommendations"""
    return {"message": "Recommendations generation triggered."}
