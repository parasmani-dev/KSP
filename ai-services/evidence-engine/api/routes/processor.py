from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.processor import ProcessorInput, ProcessorOutput
from services.interfaces import IProcessorService
from api.dependencies import get_processor_service

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
    try:
        return await service.process_all(input_data)
    except Exception as e:
        logger.error(f"Processor route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
