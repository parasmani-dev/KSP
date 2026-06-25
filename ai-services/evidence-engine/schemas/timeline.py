from pydantic import BaseModel
from typing import List

class TimelineEvent(BaseModel):
    timestamp: str
    description: str

class TimelineOutput(BaseModel):
    events: List[TimelineEvent]
