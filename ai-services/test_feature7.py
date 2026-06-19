import time
import json
import threading
import requests
from fastapi.testclient import TestClient
from api.main import app
from engine.alert_manager import evaluate_event, get_incremental_hotspot_update

client = TestClient(app)

# Test 1 - Cooldown
print("Test 1 - alert_manager cooldown:")
event_1 = {"event_id": "u1", "crime_type": "Theft", "area": "Jayanagar", "severity": "High"}
res1 = evaluate_event(event_1, provided_risk_score=0.99)
res2 = evaluate_event(event_1, provided_risk_score=0.99)

if res1 is not None and res2 is None:
    print("Cooldown test: PASS")
else:
    print("Cooldown test: FAIL")

print()

# Test 2 - Incremental hotspot speed
print("Test 2 - incremental hotspot update speed:")
start = time.time()
hotspot_update = get_incremental_hotspot_update(event_1)
elapsed_ms = (time.time() - start) * 1000

print(f"Timing: {elapsed_ms:.2f} ms")
if elapsed_ms < 200:
    print("PASS")
else:
    print("FAIL")

print()

# Test 3 - Simulate FIR Endpoint (SSE branch)
print("Test 3 - simulate-fir endpoint:")
from engine.alert_manager import _last_alert_time
_last_alert_time.clear()

response = client.post("/fusion/simulate-fir", json={"crime_type": "Murder", "area": "Jayanagar", "severity": "High"})
print(json.dumps(response.json(), indent=2))

data = response.json()
if data.get("alert_generated") is not None:
    print("Alert generated correctly.")
else:
    print("WARNING: Alert not generated.")
print()

# Test 4 - SSE stream end-to-end
received_events = []

def listen_to_stream():
    try:
        with requests.get(
            "http://localhost:8000/stream/alerts",
            stream=True, timeout=10
        ) as r:
            for line in r.iter_lines():
                if line and line.startswith(b"data:"):
                    received_events.append(
                        json.loads(line[5:].strip())
                    )
                    return  # got first event, exit
    except Exception as e:
        print(f"Stream error: {e}")

print("Test 4 - SSE stream end-to-end:")
# Start listener in background thread
t = threading.Thread(target=listen_to_stream)
t.start()
time.sleep(0.5)  # let listener connect

# Fire a FIR event
try:
    requests.post(
        "http://localhost:8000/fusion/simulate-fir",
        json={"crime_type":"Murder","area":"Jayanagar","severity":"High"}
    )
except Exception as e:
    print("Failed to POST to server (make sure uvicorn is running on 8000):", e)
t.join(timeout=8)

if received_events:
    print("SSE stream PASS")
    print(json.dumps(received_events[0], indent=2))
else:
    print("SSE stream FAIL - no events received")
