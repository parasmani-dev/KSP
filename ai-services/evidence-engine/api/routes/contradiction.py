from fastapi import APIRouter, Depends, HTTPException
import logging
from typing import List
from schemas.document import DocumentInput
from schemas.contradiction import ContradictionOutput
from services.interfaces import IContradictionService
from api.dependencies import get_contradiction_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ContradictionOutput)
async def detect_contradictions(
    documents: List[DocumentInput],
    service: IContradictionService = Depends(get_contradiction_service)
):
    try:
        return await service.detect_contradictions(documents)
    except Exception as e:
        logger.error(f"Contradiction route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
