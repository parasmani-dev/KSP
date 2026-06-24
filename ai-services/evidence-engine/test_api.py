import urllib.request
import json
import urllib.error

def make_request():
    url = "http://127.0.0.1:8000/api/v1/summarization/"
    payload = {"fir_text": "On 14th Nov 2024 at around 22:30 hours, complainant Mr. Rajesh Gowda reported that his jewelry shop was broken into. Two suspects wearing masks entered by breaking the back shutter. They stole 2kg of gold ornaments worth Rs 1.5 Crores."}
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(req, timeout=30)
        print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(str(e))

if __name__ == "__main__":
    make_request()
