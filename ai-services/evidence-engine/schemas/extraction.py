from pydantic import BaseModel, Field
from typing import List

class ExtractionOutput(BaseModel):
    persons: List[str] = Field(default_factory=list, description="List of persons extracted")
    locations: List[str] = Field(default_factory=list, description="List of locations extracted")
    vehicles: List[str] = Field(default_factory=list, description="List of vehicles extracted")
    phone_numbers: List[str] = Field(default_factory=list, description="List of phone numbers extracted")
    bank_accounts: List[str] = Field(default_factory=list, description="List of bank accounts extracted")
    dates: List[str] = Field(default_factory=list, description="List of dates extracted")
    times: List[str] = Field(default_factory=list, description="List of times extracted")
    organizations: List[str] = Field(default_factory=list, description="List of organizations extracted")
