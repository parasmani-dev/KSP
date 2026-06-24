from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.document import DocumentInput
from schemas.extraction import ExtractionOutput
from services.interfaces import IExtractionService
from api.dependencies import get_extraction_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ExtractionOutput)
async def extract_entities(
    document: DocumentInput,
    service: IExtractionService = Depends(get_extraction_service)
):
    try:
        return await service.extract_entities(document)
    except Exception as e:
        logger.error(f"Extraction route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
