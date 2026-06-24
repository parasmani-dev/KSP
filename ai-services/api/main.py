from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import predictions, recommendations, data, copilot
from engine import sse_stream

app = FastAPI(
    title="KSP CIOS AI Services",
    description="Intelligence and predictive layer for the Crime Intelligence Operating System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the routers for different modules
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions (Module 4)"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations (Module 6)"])
app.include_router(data.router, prefix="/data", tags=["Dataset Access (Phase 2)"])

# Feature 7 Branches
app.include_router(sse_stream.router, tags=["Fusion Layer (Branch B - SSE)"])

# Kannada AI Copilot (Module 6 — PRD Feature 7)
app.include_router(copilot.router, tags=["Kannada AI Copilot (Module 6)"])

@app.on_event("startup")
def startup_event():
    # Pre-warm the cache to ensure we strictly meet the < 3000ms SLA for judges.
    try:
        from api.routes.predictions import load_models
        print("Pre-loading ML models into memory...")
        load_models()
    except Exception as e:
        print(f"Failed to pre-load models: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-services"}
