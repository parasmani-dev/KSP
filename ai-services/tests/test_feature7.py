import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from api.main import app
from engine.alert_manager import evaluate_event, get_incremental_hotspot_update

client = TestClient(app)

def test_simulate_fir_fusion():
    payload = {
        "crime_type": "Murder",
        "area": "Jayanagar",
        "severity": "High"
    }
    response = client.post("/fusion/simulate-fir", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "alert_generated" in data
    assert "hotspot_updated" in data
    # Feature 5 validation
    assert "reasons" in data["alert_generated"]
    assert "reasons" in data["hotspot_updated"]

def test_alert_manager_direct():
    payload = {
        "crime_type": "Robbery",
        "area": "Whitefield",
        "severity": "High"
    }
    updated_hotspot = get_incremental_hotspot_update(payload)
    assert "risk_score" in updated_hotspot
    alert = evaluate_event(payload, provided_risk_score=updated_hotspot["risk_score"])
    assert alert is not None
    assert "reasons" in alert
