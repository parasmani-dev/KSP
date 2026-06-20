import requests
import json
import time

def trigger_live_fir(crime_type="Theft", area="Whitefield", severity="High"):
    url = "http://localhost:8000/fusion/simulate-fir"
    payload = {
        "crime_type": crime_type,
        "area": area,
        "severity": severity
    }
    
    print(f"[*] Simulating Evidence Analyzer extracting new FIR...")
    print(f"[*] Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            print("\n[+] SUCCESS: FIR accepted by Fusion Layer.")
            print(f"[+] Response: {json.dumps(response.json(), indent=2)}")
            print("\n[!] The SSE Stream (/stream/alerts) should have just fired a live update!")
        else:
            print(f"\n[-] ERROR: Server returned {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n[-] ERROR: Could not connect to the API.")
        print("[-] Please ensure the AI Services backend is running:")
        print("    cd ai-services")
        print("    uvicorn api.main:app --port 8000 --reload")

if __name__ == "__main__":
    print("=== LIVE DEMO: TRIGGER FIR EVENT ===")
    print("This script simulates the Evidence Analyzer processing a new FIR")
    print("and pushing it to our live prediction engine.\n")
    
    # You can change these values during the demo to show different areas/crimes updating
    trigger_live_fir(crime_type="Assault", area="Koramangala", severity="High")
