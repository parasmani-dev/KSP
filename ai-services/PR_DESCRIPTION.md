## Feature 6: Decision Support Engine

### What this PR adds
- GET /recommendations/patrol — real-time patrol 
  suggestions via Prophet hotspot + repeat_offenders.csv join
- GET /recommendations/cctv — camera recommendations 
  via haversine distance sorting against cctv_cameras.csv
- GET /recommendations/investigation — case scoring 
  via open_cases.csv ranked by suspect+evidence count

### Data note
All Dataset/*_sample.csv files are 100% synthetic, 
generated via Faker + numpy. No real PII present.
All datasets have been aggressively sanitized to replace phone numbers with 'REDACTED_PHONE'.
See Dataset/DATA_ORIGIN.md for dataset provenance.

### Dynamic Multi-City Support
This PR ensures that all datasets correctly encompass multiple major Indian cities (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Nagpur). The backend `ai-services` codebase (e.g., `recommendations.py`, `train_models.py`) has been upgraded to dynamically calculate `AREA_CENTROIDS` directly from the newly provided datasets, ensuring the ML algorithms and APIs can seamlessly handle any new cities introduced by the data team without requiring any further hardcoded mapping changes.

### Model artifacts note  
.joblib files committed intentionally for hackathon 
demo reproducibility. .gitignore updated to prevent 
future additions. Production deployment would use 
external artifact storage.

### Testing
Run: python test_recommendations.py
All 3 endpoints verified under 2000ms SLA.
Zero hardcoded mock strings in any response.

### API contract
See contracts/ai-api.yaml for full response schemas.
