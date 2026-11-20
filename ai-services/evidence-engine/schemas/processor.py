from pydantic import BaseModel, Field
from typing import List, Optional
from schemas.summarization import SummaryOutput
from schemas.extraction import ExtractionOutput
from schemas.timeline import TimelineOutput
from schemas.contradiction import ContradictionOutput
from schemas.scoring import ScoringOutput

class ProcessorInput(BaseModel):
    fir_text: str = Field(min_length=1, max_length=8000)
    witness_statements: List[str] = Field(default_factory=list)

class ProcessorOutput(BaseModel):
    analysis_mode: str = "gemini"
    notice: str = ""
    summary: SummaryOutput
    entities: ExtractionOutput
    timeline: TimelineOutput
    contradictions: ContradictionOutput
    scoring: ScoringOutput
