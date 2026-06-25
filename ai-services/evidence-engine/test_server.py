import subprocess
import time
import urllib.request
import urllib.error
import json
import sys

def make_request(url, payload):
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(req)
        print(f"Success ({url}):")
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
        print("-" * 50)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error ({url}): {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error ({url}): {str(e)}")

print("Starting server...")
proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"])

# Wait for server to boot
time.sleep(4)

try:
    print("\n--- 1. Testing Summarization ---")
    make_request(
        "http://127.0.0.1:8000/api/v1/summarization/",
        {"fir_text": "On October 12, I, Ramesh Kumar, residing in Indiranagar, discovered my house broken into. The front door lock was smashed, and my Dell laptop and 50g of gold were stolen."}
    )

    print("\n--- 2. Testing Extraction ---")
    make_request(
        "http://127.0.0.1:8000/api/v1/extraction/",
        {
            "document_id": "FIR-2023-1192",
            "text_content": "Suspect Ravi K (Phone: 9876543210) was seen driving a white Maruti Swift (Reg: KA-01-AB-1234) near the Koramangala ATM at 10 PM."
        }
    )

    print("\n--- 3. Testing Timeline ---")
    make_request(
        "http://127.0.0.1:8000/api/v1/timeline/",
        {
            "document_id": "FIR-2023-1192",
            "text_content": "The victim left home at 8:00 AM. At 1:15 PM, she received a fraudulent call from someone claiming to be bank staff. The unauthorized transaction of Rs 50,000 occurred at 1:30 PM."
        }
    )

    print("\n--- 4. Testing Contradiction ---")
    make_request(
        "http://127.0.0.1:8000/api/v1/contradiction/",
        [
            {
                "document_id": "Witness-A",
                "text_content": "I saw the suspect flee the scene in a red Hyundai car at 9:00 PM."
            },
            {
                "document_id": "FIR-Narrative",
                "text_content": "According to the initial report, the suspect escaped on a black motorcycle around 9:30 PM."
            }
        ]
    )

    print("\n--- 5. Testing Scoring ---")
    make_request(
        "http://127.0.0.1:8000/api/v1/scoring/",
        {
            "document_id": "Evidence-Item-4",
            "text_content": "The suspect claims he was at home all night, but CCTV footage from the junction and three independent eyewitnesses place him at the crime scene at 11:45 PM."
        }
    )

finally:
    print("Shutting down server...")
    proc.terminate()
    proc.wait()
