from pydantic import BaseModel
from typing import List, Optional
from schemas.summarization import SummaryOutput
from schemas.extraction import ExtractionOutput
from schemas.timeline import TimelineOutput
from schemas.contradiction import ContradictionOutput
from schemas.scoring import ScoringOutput

class ProcessorInput(BaseModel):
    fir_text: str
    witness_statements: List[str] = []

class ProcessorOutput(BaseModel):
    summary: SummaryOutput
    entities: ExtractionOutput
    timeline: TimelineOutput
    contradictions: ContradictionOutput
    scoring: ScoringOutput
