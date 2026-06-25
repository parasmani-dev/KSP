import urllib.request
import json
import urllib.error
import subprocess
import time
import sys

# Complex, realistic FIR and Witness Statement
fir_text = """On 14th Nov 2024 at around 22:30 hours, complainant Mr. Rajesh Gowda (Ph: 9945123456) reported that his jewelry shop 'Lakshmi Jewellers' in Electronic City Phase 1, Bengaluru, was broken into. Two suspects wearing masks entered by breaking the back shutter. They stole 2kg of gold ornaments worth Rs 1.5 Crores. Suspects escaped in a white Toyota Innova bearing registration KA-51-MD-9088 heading towards Silk Board."""

witness_text = """I am Suresh, owner of the adjacent shop. On the night of 14th Nov, I was closing my shop at 10:45 PM. I heard a loud noise from Lakshmi Jewellers. I saw three men running out carrying heavy black bags. They jumped into a black Mahindra Scorpio and sped towards Hosur Road."""

def make_request(endpoint, payload):
    url = f"http://127.0.0.1:8001/api/v1/{endpoint}/"
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(req, timeout=30)
        return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}: {e.read().decode('utf-8')}"}
    except Exception as e:
        return {"error": str(e)}

def run_demo():
    print("Starting local server on port 8001...")
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8001"])
    time.sleep(5)

    try:
        print("--- 1. SUMMARIZATION ---")
        summary = make_request("summarization", {"fir_text": fir_text})
        print(json.dumps(summary, indent=2))

        print("\n--- 2. ENTITY EXTRACTION ---")
        entities = make_request("extraction", {"document_id": "FIR-EC-001", "text_content": fir_text})
        print(json.dumps(entities, indent=2))

        print("\n--- 3. TIMELINE GENERATION ---")
        combined_text = fir_text + "\n\n" + witness_text
        timeline = make_request("timeline", {"document_id": "FIR-EC-001", "text_content": combined_text})
        print(json.dumps(timeline, indent=2))

        print("\n--- 4. CONTRADICTION DETECTION ---")
        contradictions = make_request("contradiction", [
            {"document_id": "FIR-Rajesh", "text_content": fir_text},
            {"document_id": "Statement-Suresh", "text_content": witness_text}
        ])
        print(json.dumps(contradictions, indent=2))

        print("\n--- 5. EVIDENCE SCORING ---")
        scoring = make_request("scoring", {"document_id": "Statement-Suresh", "text_content": witness_text})
        print(json.dumps(scoring, indent=2))

        # Write output to markdown file for presentation
        md_content = f"""# KSP IntelligenceOS - Evidence Engine Demonstration

This artifact demonstrates the capabilities of the 5 AI Endpoints we built natively with Google Gemini. 

## Case Context: Jewellery Shop Heist

**FIR (Complainant: Rajesh Gowda):**
> {fir_text}

**Witness Statement (Neighbor Suresh):**
> {witness_text}

---

## 1. Automated Summarization (`POST /api/v1/summarization/`)
- **Crime Type:** `{summary.get('crime_type')}`
- **Location:** `{summary.get('location')}`
- **Victim:** `{summary.get('victim')}`
- **Suspects:** `{summary.get('suspect')}`
- **Summary:** {summary.get('summary')}

## 2. Extracted Entities (`POST /api/v1/extraction/`)
*Ready to be inserted into the Knowledge Graph for Module 2.*

| Entity | Type | Confidence |
|--------|------|------------|
"""
        for category, items in entities.items():
            if isinstance(items, list) and items:
                for item in items:
                    md_content += f"| {item} | {category} | N/A |\n"

        md_content += f"""
## 3. Chronological Timeline (`POST /api/v1/timeline/`)

| 🕒 Time | 📝 Event Description |
|:---|:---|
"""
        for t in timeline.get('events', []):
            md_content += f"| **{t.get('timestamp')}** | {t.get('description')} |\n"

        md_content += f"""
## 4. Contradiction Detection (`POST /api/v1/contradiction/`)
*Cross-referencing the FIR against the Witness Statement.*

| ⚠️ Conflict Area | 📄 Statement 1 | 📄 Statement 2 |
|:---|:---|:---|
"""
        contradiction_list = contradictions if isinstance(contradictions, list) else contradictions.get('contradictions', contradictions)
        for c in contradiction_list:
            if isinstance(c, dict):
                md_content += f"| **{c.get('field')}** | {c.get('statement_1')} | {c.get('statement_2')} |\n"

        md_content += f"""
## 5. Evidence Scoring (`POST /api/v1/scoring/`)
"""
        overall = scoring.get('overall_confidence', 0)
        comps = scoring.get('components', {})
        
        def to_pct(val):
            try: return f"{float(val)*100:.0f}%"
            except: return "N/A"
            
        md_content += f"- 🎯 **Overall Confidence:** `{to_pct(overall)}`\n"
        md_content += f"- 👤 **Entity Confidence:** `{to_pct(comps.get('entity_confidence', 0))}`\n"
        md_content += f"- 🤝 **Corroboration Score:** `{to_pct(comps.get('corroboration', 0))}`\n"
        md_content += f"- 📉 **Contradictions Impact:** `{to_pct(comps.get('contradictions', 0))}`\n"

        import os
        os.makedirs("artifacts", exist_ok=True)
        with open("artifacts/evidence_demo.md", "w", encoding="utf-8") as f:
            f.write(md_content)
    
    finally:
        print("Shutting down local server...")
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run_demo()
