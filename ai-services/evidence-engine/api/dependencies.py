from fastapi import Depends
from google import genai
from core.config import settings
from services.implementations import (
    SummarizationService, ExtractionService, TimelineService,
    ContradictionService, ScoringService
)
from services.interfaces import (
    ISummarizationService, IExtractionService, ITimelineService,
    IContradictionService, IScoringService
)

# Initialize Gemini Client
def get_gemini_client():
    client = genai.Client(api_key=settings.gemini_api_key)
    return client

def get_summarization_service(client = Depends(get_gemini_client)) -> ISummarizationService:
    return SummarizationService(gemini_client=client)

def get_extraction_service(client = Depends(get_gemini_client)) -> IExtractionService:
    return ExtractionService(gemini_client=client)

def get_timeline_service(client = Depends(get_gemini_client)) -> ITimelineService:
    return TimelineService(gemini_client=client)

def get_contradiction_service(client = Depends(get_gemini_client)) -> IContradictionService:
    return ContradictionService(gemini_client=client)

def get_scoring_service(client = Depends(get_gemini_client)) -> IScoringService:
    return ScoringService(gemini_client=client)

from services.interfaces import IProcessorService
from services.implementations import ProcessorService

def get_processor_service(
    summarization = Depends(get_summarization_service),
    extraction = Depends(get_extraction_service),
    timeline = Depends(get_timeline_service),
    contradiction = Depends(get_contradiction_service),
    scoring = Depends(get_scoring_service)
) -> IProcessorService:
    return ProcessorService(
        summarization_service=summarization,
        extraction_service=extraction,
        timeline_service=timeline,
        contradiction_service=contradiction,
        scoring_service=scoring
    )
