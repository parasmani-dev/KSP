from fastapi import FastAPI
from api.routes import summarization, extraction, timeline, contradiction, scoring, processor

app = FastAPI(title="Evidence Intelligence Engine", version="1.0.0")

app.include_router(summarization.router, prefix="/api/v1/summarization", tags=["Summarization"])
app.include_router(extraction.router, prefix="/api/v1/extraction", tags=["Entity Extraction"])
app.include_router(timeline.router, prefix="/api/v1/timeline", tags=["Timeline Generation"])
app.include_router(contradiction.router, prefix="/api/v1/contradiction", tags=["Contradiction Detection"])
app.include_router(scoring.router, prefix="/api/v1/scoring", tags=["Confidence Scoring"])
app.include_router(processor.router, prefix="/api/v1/processor", tags=["Unified Processor"])

from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles

import os
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("static/index.html")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
