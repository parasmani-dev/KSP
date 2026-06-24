from pydantic import BaseModel

class ScoringComponents(BaseModel):
    entity_confidence: float
    corroboration: float
    contradictions: float

class ScoringOutput(BaseModel):
    overall_confidence: float
    components: ScoringComponents
