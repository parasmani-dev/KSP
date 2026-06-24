from fastapi import APIRouter
import pandas as pd
import os
import json

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, "Dataset") if os.path.exists(os.path.join(ROOT_DIR, "Dataset")) else os.path.join(BASE_DIR, "Dataset")

@router.get("/alerts/history")
def get_alert_history():
    """Returns past alert history from the unused dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "alert_history_sample.csv"))
        # Drop nan values
        df = df.fillna("")
        return {"history": df.to_dict(orient="records")}
    except Exception as e:
        return {"history": [], "error": str(e)}

@router.get("/patrols")
def get_patrol_logs():
    """Returns historical patrol logs from the unused dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "patrol_logs_sample.csv"))
        df = df.fillna("")
        return {"patrols": df.to_dict(orient="records")}
    except Exception as e:
        return {"patrols": [], "error": str(e)}

@router.get("/dashboard/kpis")
def get_dashboard_kpis():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "crime_records_sample.csv"))
        total = len(df)
        active = len(df[df['case_status'] == 'Under Investigation'])
        closed = len(df[df['case_status'] == 'Closed'])
        # Mock arrest / clearance logic if not explicitly in data
        arrests = int(total * 0.12)
        clearance = round((closed / total) * 100, 1) if total > 0 else 0
        return {
            "total_incidents": total,
            "active_cases": active,
            "solved_cases": closed,
            "arrests": arrests,
            "clearance_rate": clearance
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/dashboard/trends")
def get_crime_trends():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "crime_records_sample.csv"))
        # Get counts per month
        counts = df['month'].value_counts().sort_index()
        
        month_names = {
            1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
            7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
        }
        
        trend_data = []
        for month_num, count in counts.items():
            label = month_names.get(int(month_num), str(month_num))
            
            trend_data.append({
                "date": label,
                "current": int(count),
                "previous": int(count * 0.85) # mock previous period
            })
        return {"trends": trend_data}
    except Exception as e:
        return {"error": str(e)}

@router.get("/dashboard/categories")
def get_crime_categories():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "crime_records_sample.csv"))
        counts = df['crime_type'].value_counts()
        top = counts.head(4)
        other = counts.iloc[4:].sum() if len(counts) > 4 else 0
        
        categories = []
        colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']
        for i, (name, count) in enumerate(top.items()):
            categories.append({"name": str(name), "value": int(count), "color": colors[i % len(colors)]})
        if other > 0:
            categories.append({"name": "Other", "value": int(other), "color": '#1e1b4b'})
            
        # Calculate percentages
        total = sum(c['value'] for c in categories)
        if total > 0:
            for c in categories:
                c['percentage'] = round((c['value'] / total) * 100, 1)
                
        return {"categories": categories, "total": total}
    except Exception as e:
        return {"error": str(e)}

@router.get("/dashboard/patrols")
def get_patrol_status():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "patrol_logs_sample.csv"))
        # Base logic on historical patrol logs (avg officer counts)
        total_officers = df['officer_count'].sum()
        # Mock active/available splits based on real dataset size
        active = int(total_officers * 0.7)
        available = int(total_officers * 0.2)
        offline = int(total_officers) - active - available
        
        data = [
            {"name": "Active", "value": active, "color": "#14b8a6"},
            {"name": "Available", "value": available, "color": "#3b82f6"},
            {"name": "Busy/Offline", "value": offline, "color": "#f97316"}
        ]
        
        total = active + available + offline
        coverage = round((active / total) * 100) if total > 0 else 0
        
        return {"status": data, "coverage": coverage}
    except Exception as e:
        return {"error": str(e)}

@router.get("/map/crimes")
def get_map_crimes():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "crime_records_sample.csv"))
        # Return last 1500 to keep payload size reasonable but dense enough for heatmap
        records = df[['lat', 'long', 'risk_score']].dropna().tail(1500)
        return {"crimes": records.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}

@router.get("/map/cctv")
def get_map_cctv():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "cctv_cameras_sample.csv"))
        records = df[['latitude', 'longitude', 'status']].dropna()
        return {"cctv": records.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}

@router.get("/map/patrols")
def get_map_patrols():
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "patrol_logs_sample.csv"))
        records = df[['area', 'officer_count']].dropna().head(30)
        return {"patrols": records.to_dict(orient="records")}
    except Exception as e:
        return {"error": str(e)}
