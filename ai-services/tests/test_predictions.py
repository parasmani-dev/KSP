import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_hotspots():
    response = client.get("/predictions/hotspots?days=14")
    assert response.status_code == 200
    assert "hotspots" in response.json()
    assert response.json()["source"] == "synthetic_scenarios"
    assert response.json()["forecast_available"] is False

def test_escalation():
    response = client.get("/predictions/escalation")
    assert response.status_code == 503
    assert response.json()["detail"] == "Prophet model not available."

def test_offender_risk():
    response = client.get("/predictions/offender/OFF001?prior_crimes=15&days_since=10&connections=8&escalation=1.5")
    assert response.status_code == 503
    assert response.json()["detail"] == "XGBoost model not available."

def test_emerging_threats():
    payload = {
        "area": "Whitefield",
        "hour": 3,
        "day": "Tue",
        "month": 6,
        "crime_type": "Vehicle Theft",
        "is_festival_period": 0,
        "is_night_crime": 1,
        "is_weekend": 0
    }
    response = client.post("/predictions/emerging_threats", json=payload)
    assert response.status_code == 200
    assert response.json()["analysis_mode"] == "synthetic_history"
    assert response.json()["is_anomaly"] is None

def test_public_demo_cannot_train_models():
    response = client.post("/predictions/run")
    assert response.status_code == 403
