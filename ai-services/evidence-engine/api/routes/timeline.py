from fastapi import APIRouter, Depends, HTTPException
import logging
from schemas.document import DocumentInput
from schemas.timeline import TimelineOutput
from services.interfaces import ITimelineService
from api.dependencies import get_timeline_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=TimelineOutput)
async def generate_timeline(
    document: DocumentInput,
    service: ITimelineService = Depends(get_timeline_service)
):
    try:
        return await service.generate_timeline(document)
    except Exception as e:
        logger.error(f"Timeline route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
