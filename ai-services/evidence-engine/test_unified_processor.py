import asyncio
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_unified_processor():
    print("Testing POST /api/v1/processor/")
    
    fir_text = "On 14th Nov 2024 at 22:30 hours, Rajesh Gowda reported that Lakshmi Jewellers was broken into. Two masked suspects stole 2kg of gold. Escaped in white Toyota Innova KA-51-MD-9088 towards Silk Board."
    witness_text = "I am Suresh. At 10:45 PM on Nov 14, I saw three men running out of Lakshmi Jewellers with black bags. They jumped into a black Mahindra Scorpio and sped towards Hosur Road."
    
    payload = {
        "fir_text": fir_text,
        "witness_statements": [witness_text]
    }
    
    response = client.post("/api/v1/processor/", json=payload)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("\nSummary:")
        print(json.dumps(data.get("summary"), indent=2))
        print("\nEntities (Persons only for brevity):")
        print(json.dumps(data.get("entities", {}).get("persons", []), indent=2))
        print("\nTimeline (Events count):", len(data.get("timeline", {}).get("events", [])))
        print("\nContradictions (Count):", len(data.get("contradictions", [])))
        print("\nScoring (Overall Confidence):", data.get("scoring", {}).get("overall_confidence"))
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_unified_processor()
