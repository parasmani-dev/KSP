## Feature 6: Decision Support Engine

### What this PR adds
- GET /recommendations/patrol — real-time patrol 
  suggestions via Prophet hotspot + repeat_offenders.csv join
- GET /recommendations/cctv — camera recommendations 
  via haversine distance sorting against cctv_cameras.csv
- GET /recommendations/investigation — case scoring 
  via open_cases.csv ranked by suspect+evidence count

### Data note
All Dataset/*.csv files are 100% synthetic, 
generated via Faker + numpy. No real PII present.
See dataset_requirements.md for schema definitions.

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
