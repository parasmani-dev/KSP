import urllib.request
import json
import urllib.error
import subprocess
import time
import sys

def verify_module_1():
    print("Starting server for Module 1 Verification...")
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8002"])
    time.sleep(5)
    
    try:
        fir_text = """On 10th Dec 2024 at 14:00, Ramesh reported his bike stolen from MG Road. It was a black Splendor KA-01-AB-1234."""
        witness_text = """I saw a man in a red jacket take a black Splendor near MG Road around 2 PM."""
        
        url = "http://127.0.0.1:8002/api/v1/processor/"
        payload = {
            "fir_text": fir_text,
            "witness_statements": [witness_text]
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        response = urllib.request.urlopen(req, timeout=45)
        result = json.loads(response.read().decode('utf-8'))
        
        print("\n=== VERIFICATION RESULTS: MODULE 1 FEATURES ===")
        
        print("\n1. SUMMARIZATION")
        print(json.dumps(result.get("summary"), indent=2))
        
        print("\n2. ENTITY EXTRACTION")
        print(json.dumps(result.get("entities"), indent=2))
        
        print("\n3. TIMELINE GENERATION")
        print(json.dumps(result.get("timeline"), indent=2))
        
        print("\n4. CONTRADICTION DETECTION")
        print(json.dumps(result.get("contradictions"), indent=2))
        
        print("\n5. EVIDENCE SCORING")
        print(json.dumps(result.get("scoring"), indent=2))
        
        print("\nAll 5 features of Module 1 verified successfully!")
        
    except Exception as e:
        print(f"Verification Failed: {e}")
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    verify_module_1()
