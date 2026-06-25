from pydantic import BaseModel, Field
from typing import Optional, List

class FIRInput(BaseModel):
    fir_text: str

class SummaryOutput(BaseModel):
    crime_type: Optional[str] = Field(default="Unknown", description="The primary type of crime")
    victim: Optional[str] = Field(default="Unknown", description="The victim's name or description")
    suspect: Optional[str] = Field(default="Unknown", description="The suspect's name or description")
    location: Optional[str] = Field(default="Unknown", description="The exact location of the incident")
    summary: Optional[str] = Field(default="", description="A concise summary of the event")
    key_facts: List[str] = Field(default_factory=list, description="A list of key facts critical to the investigation")
