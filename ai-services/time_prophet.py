import time
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

print("Starting SLA timing test...")
with TestClient(app) as client:
    print("\nTiming /hotspots (Prophet)...")
    start_time = time.time()
    resp_hotspots = client.get("/predictions/hotspots?days=14")
    hotspot_time = (time.time() - start_time) * 1000
    print(f"Prophet Inference Time: {hotspot_time:.2f} ms")

    print("\nTiming /offender (XGBoost)...")
    start_time = time.time()
    resp_offender = client.get("/predictions/offender/OFF001")
    offender_time = (time.time() - start_time) * 1000
    print(f"XGBoost Inference Time: {offender_time:.2f} ms")
