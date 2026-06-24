from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.summarization import FIRInput, SummaryOutput
from services.interfaces import ISummarizationService
from api.dependencies import get_summarization_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=SummaryOutput)
async def summarize_document(
    document: FIRInput,
    service: ISummarizationService = Depends(get_summarization_service)
):
    try:
        return await service.summarize(document)
    except Exception as e:
        logger.error(f"Summarization route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
