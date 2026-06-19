from fastapi.testclient import TestClient
from api.main import app
import time
import json

# Pre-warm the models to avoid cold start penalty in SLA timings
client = TestClient(app)
client.get("/predictions/")

print("VERIFYING TASK 1: Patrol")
start = time.time()
res = client.get("/recommendations/patrol")
print(json.dumps(res.json(), indent=2))
print(f"Timing: {(time.time() - start) * 1000:.2f} ms\n")

print("VERIFYING TASK 2: CCTV")
start = time.time()
res = client.get("/recommendations/cctv?area=Whitefield&crime_type=Theft")
print(json.dumps(res.json(), indent=2))
print(f"Timing: {(time.time() - start) * 1000:.2f} ms\n")

print("VERIFYING TASK 3: Investigation")
start = time.time()
res = client.get("/recommendations/investigation")
print(json.dumps(res.json(), indent=2))
print(f"Timing: {(time.time() - start) * 1000:.2f} ms\n")
