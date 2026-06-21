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
        df = pd.read_csv(os.path.join(DATA_DIR, "alert_history.csv"))
        # Drop nan values
        df = df.fillna("")
        return {"history": df.to_dict(orient="records")}
    except Exception as e:
        return {"history": [], "error": str(e)}

@router.get("/patrols")
def get_patrol_logs():
    """Returns historical patrol logs from the unused dataset."""
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "patrol_logs.csv"))
        df = df.fillna("")
        return {"patrols": df.to_dict(orient="records")}
    except Exception as e:
        return {"patrols": [], "error": str(e)}
