from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.processor import ProcessorInput, ProcessorOutput
from services.interfaces import IProcessorService
from api.dependencies import get_processor_service
from core.config import settings
from services.demo_preview import build_demo_preview

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ProcessorOutput)
async def process_all_evidence(
    input_data: ProcessorInput,
    service: IProcessorService = Depends(get_processor_service)
):
    """
    Unified endpoint to process an FIR and witness statements through all Module 1 features simultaneously.
    - Summarization
    - Entity Extraction
    - Timeline Generation
    - Contradiction Detection
    - Evidence Scoring
    """
    if not settings.gemini_api_key:
        if not input_data.fir_text.strip():
            raise HTTPException(status_code=422, detail="FIR text is required for the demo preview.")
        return build_demo_preview(input_data)
    try:
        return await service.process_all(input_data)
    except Exception as e:
        logger.exception("Processor route error")
        raise HTTPException(status_code=503, detail="Evidence analysis is temporarily unavailable.") from e
