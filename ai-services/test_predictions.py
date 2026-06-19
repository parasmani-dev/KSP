from fastapi.testclient import TestClient
from api.main import app
import json
import time

client = TestClient(app)

# Warm up the models (trigger lazy load) before timing inference
client.get("/predictions/")

print("VERIFYING FEATURE 4.1: Hotspot Prediction (Prophet)")
start_time = time.time()
response = client.get("/predictions/hotspots?days=14")
elapsed = (time.time() - start_time) * 1000
# Print the first two valid hotspots AND any sparse area returned to verify low_confidence
hotspots = response.json().get("hotspots", [])
sparse_spots = [s for s in hotspots if s.get("insufficient_data")]
low_conf_spots = [s for s in hotspots if s.get("low_confidence")]
valid_spots = [s for s in hotspots if not s.get("insufficient_data") and not s.get("low_confidence")]
print(json.dumps({"hotspots": valid_spots + low_conf_spots + sparse_spots}, indent=2))
print(f"SLA Timing: {elapsed:.2f} ms")

print("-" * 50)

print("VERIFYING FEATURE 4.2: Escalation Prediction (Prophet Growth Rate)")
response = client.get("/predictions/escalation")
escalating = response.json().get("escalating_areas", [])
print(json.dumps({"escalating_areas": escalating[:2]}, indent=2))

print("-" * 50)

print("VERIFYING FEATURE 4.3: Repeat Offender Risk (XGBoost)")
response = client.get("/predictions/offender/OFF001?prior_crimes=15&days_since=10&connections=8&escalation=1.5")
print(json.dumps(response.json(), indent=2))

print("-" * 50)

print("VERIFYING FEATURE 4.4: Emerging Threat Detection (Isolation Forest)")
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
print(json.dumps(response.json(), indent=2))
print("\n")
