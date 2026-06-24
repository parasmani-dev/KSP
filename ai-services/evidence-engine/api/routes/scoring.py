from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.document import DocumentInput
from schemas.scoring import ScoringOutput
from services.interfaces import IScoringService
from api.dependencies import get_scoring_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=ScoringOutput)
async def score_evidence(
    document: DocumentInput,
    service: IScoringService = Depends(get_scoring_service)
):
    try:
        return await service.score_evidence(document)
    except Exception as e:
        logger.error(f"Scoring route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
